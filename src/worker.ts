import { pages as devPages } from "./dev-content";
import { getContentEncoding, type Encoding } from "./lib/compress";

interface Env {
  SITE: KVNamespace;
  FASTMAIL_TOKEN: string;
}

interface ContactRequest {
  from: string;
  message: string;
}

const FASTMAIL_USERNAME = "jonathan@jgabor.se";
const JMAP_HOSTNAME = "api.fastmail.com";

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
  token: string
): Promise<string> {
  const response = await fetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      using: ["urn:ietf:params:jmap:core", "urn:ietf:params:jmap:mail"],
      methodCalls: [
        ["Mailbox/query", { accountId, filter: { name: "Drafts" } }, "a"],
      ],
    }),
  });
  const data = (await response.json()) as {
    methodResponses: [[string, { ids: string[] }, string]];
  };
  const ids = data.methodResponses?.[0]?.[1]?.ids;
  if (!ids?.[0]) throw new Error("Drafts folder not found");
  return ids[0];
}

async function getIdentityId(
  apiUrl: string,
  accountId: string,
  token: string
): Promise<string> {
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
  const identity = list.find(
    (i) => i.email === FASTMAIL_USERNAME
  );
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
  messageBody: string
): Promise<void> {
  const draftObject = {
    from: [{ email: FASTMAIL_USERNAME }],
    to: [{ email: FASTMAIL_USERNAME }],
    replyTo: [{ email: senderEmail }],
    subject: `Contact form: ${senderEmail}`,
    keywords: { $draft: true },
    mailboxIds: { [draftsId]: true },
    bodyValues: {
      body: { value: `From: ${senderEmail}\n\n${messageBody}`, charset: "utf-8" },
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

async function handleContact(request: Request, env: Env): Promise<Response> {
  if (request.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  let body: ContactRequest;
  try {
    body = (await request.json()) as ContactRequest;
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }
  const { from, message } = body;

  if (!from || !message) {
    return new Response("Missing required fields", { status: 400 });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(from)) {
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

    await sendEmail(
      apiUrl,
      accountId,
      draftsId,
      identityId,
      env.FASTMAIL_TOKEN,
      from,
      message
    );

    return new Response("OK", { status: 200 });
  } catch (error) {
    console.error("Email error:", error);
    return new Response("Failed to send email", { status: 500 });
  }
}

function parseAcceptEncoding(header: string | null): Encoding {
  if (!header) return "raw";

  if (header.includes("zstd")) return "zstd";
  if (header.includes("br")) return "br";
  if (header.includes("gzip")) return "gzip";

  return "raw";
}

function parsePath(url: URL): string | null {
  const path = url.pathname.replace(/\/+$/, "") || "/";

  if (path === "/") return "index";

  const segment = path.slice(1);
  if (/^[a-z0-9-]+$/i.test(segment)) return segment;

  return null;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/contact") {
      return handleContact(request, env);
    }

    if (url.pathname.startsWith("/__hash/")) {
      const pagePath = url.pathname.slice(8);
      const hashPageName = parsePath(new URL(pagePath, url.origin));
      const hashContent = hashPageName ? devPages[hashPageName] : null;
      if (hashContent) {
        const hash = Array.from(new TextEncoder().encode(hashContent))
          .reduce((h, b) => ((h << 5) - h + b) | 0, 0)
          .toString(36);
        return new Response(hash, { headers: { "Cache-Control": "no-cache" } });
      }
      return new Response("", { status: 404 });
    }

    const pageName = parsePath(url);

    if (!pageName) {
      return new Response("Not found", { status: 404 });
    }

    const acceptEncoding = request.headers.get("Accept-Encoding");
    const encoding = parseAcceptEncoding(acceptEncoding);
    const kvKey = `${pageName}:${encoding}`;

    const data = await env.SITE.get(kvKey, "arrayBuffer");

    if (data) {
      const contentEncoding = getContentEncoding(encoding);
      const headers = new Headers({
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "public, max-age=31536000, immutable",
      });

      if (contentEncoding) {
        headers.set("Content-Encoding", contentEncoding);
      }

      return new Response(data, {
        headers,
        encodeBody: "manual",
      } as ResponseInit);
    }

    const content = devPages[pageName];
    if (content) {
      const hash = Array.from(new TextEncoder().encode(content))
        .reduce((h, b) => ((h << 5) - h + b) | 0, 0)
        .toString(36);
      const liveReloadScript = `<script>(()=>{const h=${JSON.stringify(hash)};setInterval(async()=>{const r=await fetch("/__hash/"+location.pathname);if(r.ok&&await r.text()!==h)location.reload()},1000)})()</script>`;
      const withLiveReload = content.replace("</body>", liveReloadScript + "</body>");
      return new Response(withLiveReload, {
        headers: {
          "Content-Type": "text/html; charset=utf-8",
          "Cache-Control": "no-cache",
        },
      });
    }

    return new Response("Not found", { status: 404 });
  },
};
