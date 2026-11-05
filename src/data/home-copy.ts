// Homepage copy. The page components and the markdown version at /index.md
// both render from this module, so edit text here, not in the templates.

export const homeCopy = {
  name: "Jonathan Gabor",
  hero: {
    location: "Malmö, Sweden",
    tagline: "Speaks code, ships product.",
    intro:
      "I bridge the gap between product vision and engineering execution. My opinion changes with new information.",
  },
  links: [
    { label: "GitHub", href: "https://github.com/jgabor", external: true },
    { label: "LinkedIn", href: "https://linkedin.com/in/jgabor", external: true },
    { label: "Download CV", href: "/CV-Jonathan_Gabor.pdf", external: false },
  ],
  code: {
    eyebrow: "Code",
    title: "Things I've built",
    subtitle: "Currently deep in agentic engineering.",
  },
  career: {
    eyebrow: "Career",
    title: "15+ years building products",
    subtitle:
      "I am relentless about creating intuitive and simple products in complex technical environments, with users' needs at the forefront.",
    strengths: [
      {
        title: "Systems thinking",
        description:
          "Connects immediate decisions to long-term outcomes. Sees several steps ahead without losing sight of today.",
      },
      {
        title: "Team enabler",
        description:
          "Leads by enabling others \u2014 aligning teams toward a shared north star without needing formal authority.",
      },
      {
        title: "Quick study",
        description:
          "Active listener with high-bandwidth information intake. New concepts stick quickly.",
      },
    ],
    skills: [
      "Product Strategy",
      "Product Vision",
      "Product Roadmap",
      "Platform Engineering",
      "Artificial Intelligence",
      "Developer Experience",
      "Software Development Lifecycle",
      "Infrastructure-as-Code",
      "Backlog Management",
      "User Research",
      "Agile Methodologies",
    ],
  },
  contact: {
    eyebrow: "Contact",
    title: "Get in touch",
    subtitle: "Have a product challenge, role, or collaboration in mind?",
    replyNote: "Usually replies within a few days",
  },
};

export type HomeCopy = typeof homeCopy;
