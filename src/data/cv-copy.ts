// CV copy. The /cv/ page, the PDF rendered from it, and the markdown version
// at /cv/index.md all render from this module, so edit text here.

export const cvCopy = {
  name: "Jonathan Gabor",
  title: "Speaks Code, Ships Product",
  location: "Malmö, Sweden",
  contacts: [
    { label: "jonathan@jgabor.se", href: "mailto:jonathan@jgabor.se" },
    { label: "linkedin.com/in/jgabor", href: "https://linkedin.com/in/jgabor" },
    { label: "jgabor.se", href: "https://jgabor.se" },
  ],
  download: { label: "Download PDF", href: "/CV-Jonathan_Gabor.pdf" },
  summary: [
    "I am relentless about creating intuitive and simple products in a complex and technological environment.",
    "With equal parts engineering and product, I use my experiences from both worlds to create solutions that are delightful for customers to use, with incremental improvements driven by their feedback. My goal is to make everyone and everything 1% better every day.",
    "A long-standing passion for open source has shaped how I think about platforms: transparency, community collaboration, and reducing friction for developer contributions.",
    "The last couple of years, I have been deep down the AI rabbit hole, exploring AI-assisted software development, agentic workflows, and the interfaces and touch points between humans and artificial intelligence.",
  ],
  // Rendered in bold as the last summary paragraph.
  summaryClosing: "My opinion changes with new information.",
  strengths: [
    {
      title: "Systems Thinking",
      description:
        "Connects immediate decisions to long-term outcomes. Sees several steps ahead without losing sight of today.",
    },
    {
      title: "Team Enabler",
      description:
        "Leads by enabling others---aligning teams toward a shared north star without needing formal authority.",
    },
    {
      title: "Quick Study",
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
    "OKRs",
    "Backlog Management",
    "User Research",
    "Cross-functional Leadership",
    "Agile Methodologies",
  ],
  languages: ["Swedish", "English"],
};

export type CvCopy = typeof cvCopy;
