import type { APIContext } from "astro";
import { env } from "cloudflare:workers";

export const prerender = false;

const FASTMAIL_USERNAME = "jonathan@jgabor.se";
const JMAP_HOSTNAME = "api.fastmail.com";
const RATE_LIMIT_WINDOW_SECONDS = 60;
const RATE_LIMIT_MAX_REQUESTS = 3;

interface ContactRequest {
  from: string;
  message: string;
}

interface JmapSession {
  apiUrl: string;
  primaryAccounts: Record<string, string>;
}

async function getJmapSession(token: string): Promise<JmapSession> {
  const response = await fetch(`https://${JMAP_HOSTNAME}/.well-known/jmap`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  return response.json();
}

async function getDraftsMailboxId(
  apiUrl: string,
  accountId: string,
  token: string,
): Promise<string> {
  const response = await fetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      using: ["urn:ietf:params:jmap:core", "urn:ietf:params:jmap:mail"],
      methodCalls: [["Mailbox/query", { accountId, filter: { name: "Drafts" } }, "a"]],
    }),
  });
  const data = (await response.json()) as {
    methodResponses: [[string, { ids: string[] }, string]];
  };
  const ids = data.methodResponses?.[0]?.[1]?.ids;
  if (!ids?.[0]) throw new Error("Drafts folder not found");
  return ids[0];
}

async function getIdentityId(apiUrl: string, accountId: string, token: string): Promise<string> {
  const response = await fetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      using: [
        "urn:ietf:params:jmap:core",
        "urn:ietf:params:jmap:mail",
        "urn:ietf:params:jmap:submission",
      ],
      methodCalls: [["Identity/get", { accountId, ids: null }, "a"]],
    }),
  });
  const data = (await response.json()) as {
    methodResponses: [[string, { list: Array<{ id: string; email: string }> }, string]];
  };
  const list = data.methodResponses?.[0]?.[1]?.list;
  if (!list) throw new Error("Identity list not found");
  const identity = list.find((i) => i.email === FASTMAIL_USERNAME);
  if (!identity) throw new Error("Identity not found");
  return identity.id;
}

async function sendEmail(
  apiUrl: string,
  accountId: string,
  draftsId: string,
  identityId: string,
  token: string,
  senderEmail: string,
  messageBody: string,
): Promise<void> {
  const draftObject = {
    from: [{ email: FASTMAIL_USERNAME }],
    to: [{ email: FASTMAIL_USERNAME }],
    replyTo: [{ email: senderEmail }],
    subject: `Contact form: ${senderEmail}`,
    keywords: { $draft: true },
    mailboxIds: { [draftsId]: true },
    bodyValues: {
      body: {
        value: `From: ${senderEmail}\n\n${messageBody}`,
        charset: "utf-8",
      },
    },
    textBody: [{ partId: "body", type: "text/plain" }],
  };

  const response = await fetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      using: [
        "urn:ietf:params:jmap:core",
        "urn:ietf:params:jmap:mail",
        "urn:ietf:params:jmap:submission",
      ],
      methodCalls: [
        ["Email/set", { accountId, create: { draft: draftObject } }, "a"],
        [
          "EmailSubmission/set",
          {
            accountId,
            onSuccessDestroyEmail: ["#sendIt"],
            create: { sendIt: { emailId: "#draft", identityId } },
          },
          "b",
        ],
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`JMAP error: ${response.status}`);
  }
}

export async function POST(context: APIContext): Promise<Response> {
  const clientIp = context.request.headers.get("CF-Connecting-IP") ?? "unknown";
  const rateLimitKey = `rate:${clientIp}`;
  const currentCount = await env.SITE.get(rateLimitKey);
  const count = currentCount ? parseInt(currentCount, 10) : 0;

  if (count >= RATE_LIMIT_MAX_REQUESTS) {
    return new Response("Too many requests", { status: 429 });
  }

  await env.SITE.put(rateLimitKey, String(count + 1), {
    expirationTtl: RATE_LIMIT_WINDOW_SECONDS,
  });

  let body: ContactRequest;
  try {
    body = (await context.request.json()) as ContactRequest;
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }
  const { from, message } = body;

  if (!from || !message) {
    return new Response("Missing required fields", { status: 400 });
  }

  if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(from)) {
    return new Response("Invalid email address", { status: 400 });
  }

  try {
    const session = await getJmapSession(env.FASTMAIL_TOKEN);
    const apiUrl = session.apiUrl;
    const accountId = session.primaryAccounts["urn:ietf:params:jmap:mail"];

    const [draftsId, identityId] = await Promise.all([
      getDraftsMailboxId(apiUrl, accountId, env.FASTMAIL_TOKEN),
      getIdentityId(apiUrl, accountId, env.FASTMAIL_TOKEN),
    ]);

    await sendEmail(apiUrl, accountId, draftsId, identityId, env.FASTMAIL_TOKEN, from, message);

    return new Response("OK", { status: 200 });
  } catch (error) {
    console.error("Email error:", error);
    return new Response("Failed to send email", { status: 500 });
  }
}
