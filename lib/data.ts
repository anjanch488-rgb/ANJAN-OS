// All editable content lives here. Anything marked `todo: true` or wrapped in
// "[EDIT]" is a placeholder the owner must replace — nothing here is invented
// as a metric, award, employment, certification or live demo.

export type Project = {
  id: string;
  title: string;
  tagline: string;
  description: string;
  problem: string;
  solution: string;
  stack: string[];
  stackIsPlaceholder: boolean;
  architecture: string[]; // ordered nodes for the generated diagram
  github: string; // "" = not set
  demo: string; // "" = not set
  status: string;
  statusIsPlaceholder: boolean;
  screenshots: string[]; // paths in /public/media; empty = placeholder frames
  icon: "shield" | "mesh" | "cloud" | "caption";
};

export const projects: Project[] = [
  {
    id: "cybershield-x",
    title: "CyberShield-X",
    tagline: "Cybersecurity & network traffic analysis platform",
    description:
      "A cybersecurity platform focused on analysing network traffic so suspicious behaviour can be spotted and understood.",
    problem:
      "Raw network traffic is noisy and hard to read, which makes it difficult to notice suspicious patterns early.",
    solution:
      "Capture and analyse traffic, then surface patterns in a form a defender can act on. ",
    stack: ["Python", "Nmap", "Wireshark", "Traffic analysis"],
    stackIsPlaceholder: true,
    architecture: ["Network traffic", "Capture", "Analysis engine", "Findings view"],
    github: "",
    demo: "",
    status: "Set status",
    statusIsPlaceholder: true,
    screenshots: [],
    icon: "shield",
  },
  {
    id: "meshguard",
    title: "MeshGuard",
    tagline: "Self-healing multinode IoT network for disaster & emergency monitoring",
    description:
      "A self-healing multinode IoT network designed for disaster and emergency monitoring, where nodes keep communicating even when parts of the network fail.",
    problem:
      "During disasters, infrastructure fails and centralised monitoring stops working exactly when it is needed most.",
    solution:
      "A mesh of sensor nodes that reroute around failures so data still reaches its destination.",
    stack: ["ESP32", "ESP-NOW", "Sensor networks", "Embedded C/C++"],
    stackIsPlaceholder: true,
    architecture: ["Sensor nodes", "ESP-NOW mesh", "Self-healing routing", "Gateway", "Monitoring"],
    github: "",
    demo: "",
    status: " Set status",
    statusIsPlaceholder: true,
    screenshots: [],
    icon: "mesh",
  },
  {
    id: "rainwatch",
    title: "RainWatch",
    tagline: "Big Data pipeline for rainfall & flood pattern analysis",
    description:
      "A Big Data pipeline for analysing rainfall data to understand rainfall and flood patterns.",
    problem:
      "Rainfall records are large and scattered, so finding flood-relevant patterns by hand is impractical.",
    solution:
      "A data pipeline that ingests, stores and processes rainfall data at scale.",
    stack: ["Python", "Pandas", "Hadoop", "HDFS", "MongoDB"],
    stackIsPlaceholder: true,
    architecture: ["Rainfall data", "Ingestion", "HDFS storage", "Processing", "Pattern analysis"],
    github: "",
    demo: "",
    status: " Set status",
    statusIsPlaceholder: true,
    screenshots: [],
    icon: "cloud",
  },
  {
    id: "captionforge",
    title: "CaptionForge",
    tagline: "AI-assisted video caption generation & editing platform",
    description:
      "An AI-assisted platform for generating and editing video captions, bringing multimedia and AI together.",
    problem:
      "Captioning video by hand is slow, and automatic captions still need quick human correction.",
    solution:
      "Generate captions with AI help, then let the creator edit them in one place. ",
    stack: ["AI / ML", "Video processing", "Web app"],
    stackIsPlaceholder: true,
    architecture: ["Video upload", "AI captioning", "Caption editor", "Export"],
    github: "",
    demo: "",
    status: "Set status",
    statusIsPlaceholder: true,
    screenshots: [],
    icon: "caption",
  },
];

export type TechGroup = {
  id: string;
  code: string;
  title: string;
  blurb: string;
  viz: "stack" | "radar" | "neural" | "mesh" | "pipeline";
  items: { name: string; note: string }[];
};

export const techGroups: TechGroup[] = [
  {
    id: "software",
    code: "A",
    title: "Software Development",
    blurb: "Building software end to end — front end, back end and the tooling around it.",
    viz: "stack",
    items: [
      { name: "Programming languages", note: "Python, JavaScript / TypeScript, C , Java,No-SQL" },
      { name: "Web development", note: "React, Next.js, Tailwind CSS" },
      { name: "Backend development", note: "APIs and server logic " },
      { name: "Development tools", note: "Git, GitHub, VS Code" },
    ],
  },
  {
    id: "security",
    code: "B",
    title: "Cybersecurity",
    blurb: "Understanding networks well enough to defend them.",
    viz: "radar",
    items: [
      { name: "Network analysis", note: "Reading how hosts and services talk" },
      { name: "Nmap", note: "Discovery and service enumeration" },
      { name: "Wireshark", note: "Packet capture and inspection" },
      { name: "Python security tools", note: "Scripting small analysis utilities" },
      { name: "Defensive security", note: "Detecting and hardening, not attacking" },
      { name: "Traffic analysis", note: "Spotting suspicious patterns" },
    ],
  },
  {
    id: "ai",
    code: "C",
    title: "AI / ML",
    blurb: "Exploring what models can do and building small agentic tools around them.",
    viz: "neural",
    items: [
      { name: "AI tools", note: "Using modern AI tools in real workflows" },
      { name: "Machine learning exploration", note: "Learning core ML concepts" },
      { name: "Agentic AI projects", note: "Tools that plan and act" },
      { name: "AI-assisted development", note: "Pairing with AI to build faster" },
    ],
  },
  {
    id: "iot",
    code: "D",
    title: "IoT & Embedded Systems",
    blurb: "Hardware that senses, talks and keeps working when things break.",
    viz: "mesh",
    items: [
      { name: "ESP32", note: "Wi-Fi/BLE microcontroller projects" },
      { name: "Raspberry Pi", note: "Linux edge computing" },
      { name: "Sensor networks", note: "Many small nodes, one picture" },
      { name: "ESP-NOW", note: "Low-latency peer-to-peer ESP messaging" },
      { name: "Embedded development", note: "Firmware close to the hardware" },
    ],
  },
  {
    id: "data",
    code: "E",
    title: "Data Engineering",
    blurb: "Moving data through pipelines so it becomes something you can analyse.",
    viz: "pipeline",
    items: [
      { name: "Python", note: "Glue for data work" },
      { name: "Pandas", note: "Cleaning and analysing tabular data" },
      { name: "Hadoop", note: "Distributed processing" },
      { name: "HDFS", note: "Distributed storage" },
      { name: "MongoDB", note: "Document database" },
      { name: "Data pipelines", note: "Ingest → store → process → analyse" },
    ],
  },
];

export const creativeGroups = [
  {
    id: "video",
    code: "A",
    title: "Video Editing",
    items: ["Cinematic edits", "Short-form videos", "Reels", "Video transitions", "Color grading"],
  },
  {
    id: "graphic",
    code: "B",
    title: "Graphic Design",
    items: ["Posters", "Thumbnails", "Branding", "Social media creatives"],
  },
  {
    id: "motion",
    code: "C",
    title: "Motion Graphics",
    items: ["Animated typography", "Visual effects", "Transitions", "3D motion experiments"],
  },
  {
    id: "ai",
    code: "D",
    title: "AI Content Creation",
    items: ["AI-generated visuals", "AI-generated videos", "Digital storytelling", "Creative experiments"],
  },
] as const;

export type SkillCategory = {
  id: string;
  name: string;
  skills: {
    name: string;
    description: string;
    tools: string[];
    projects: string[]; // project ids
    status: "Using" | "Learning" | "Exploring";
  }[];
};

// "status" is editable. It describes where you are with it, not a proficiency score.
export const skillCategories: SkillCategory[] = [
  {
    id: "programming",
    name: "Programming",
    skills: [
      { name: "Python", description: "General-purpose scripting for security tools, data work and AI.", tools: ["Pandas", "Scripting"], projects: ["cybershield-x", "rainwatch"], status: "Using" },
      { name: "C / C++", description: "Firmware-level code for microcontrollers.", tools: ["Arduino framework", "ESP-IDF"], projects: ["meshguard"], status: "Using" },
      { name: "JavaScript / TypeScript", description: "Language of the web front end and Node back ends.", tools: ["Node.js", "React"], projects: ["captionforge"], status: "Using" },
    ],
  },
  {
    id: "web",
    name: "Web Development",
    skills: [
      { name: "React & Next.js", description: "Component-driven interfaces and full-stack web apps.", tools: ["Next.js", "TypeScript"], projects: ["captionforge"], status: "Using" },
      { name: "Tailwind CSS", description: "Utility-first styling for fast, consistent UI.", tools: ["Tailwind CSS"], projects: [], status: "Using" },
      { name: "Framer Motion", description: "Motion design for interfaces.", tools: ["Framer Motion", "CSS"], projects: [], status: "Learning" },
    ],
  },
  {
    id: "security",
    name: "Cybersecurity",
    skills: [
      { name: "Network analysis", description: "Understanding network behaviour from captured traffic.", tools: ["Wireshark", "Nmap"], projects: ["cybershield-x"], status: "Learning" },
      { name: "Defensive security", description: "Detecting and hardening against threats.", tools: ["Python"], projects: ["cybershield-x"], status: "Learning" },
    ],
  },
  {
    id: "ai",
    name: "AI / ML",
    skills: [
      { name: "Machine learning", description: "Core ML concepts and experiments.", tools: ["Python"], projects: ["captionforge"], status: "Exploring" },
      { name: "Agentic AI", description: "Systems where models plan and use tools.", tools: ["LLM APIs"], projects: [], status: "Exploring" },
    ],
  },
  {
    id: "iot",
    name: "IoT",
    skills: [
      { name: "ESP32 & ESP-NOW", description: "Wireless microcontroller networking.", tools: ["ESP32", "ESP-NOW"], projects: ["meshguard"], status: "Using" },
      { name: "Raspberry Pi", description: "Edge computing and gateways.", tools: ["Linux", "Python"], projects: ["meshguard"], status: "Using" },
      { name: "Sensor networks", description: "Collecting data from many distributed nodes.", tools: ["Sensors"], projects: ["meshguard"], status: "Using" },
    ],
  },
  {
    id: "data",
    name: "Data Engineering",
    skills: [
      { name: "Hadoop & HDFS", description: "Distributed storage and processing of large datasets.", tools: ["Hadoop", "HDFS"], projects: ["rainwatch"], status: "Using" },
      { name: "Pandas", description: "Tabular data analysis in Python.", tools: ["Pandas", "Python"], projects: ["rainwatch"], status: "Using" },
      { name: "MongoDB", description: "Document database for flexible data.", tools: ["MongoDB"], projects: ["rainwatch"], status: "Using" },
    ],
  },
  {
    id: "multimedia",
    name: "Multimedia",
    skills: [
      { name: "Video editing", description: "Cinematic and short-form edits.", tools: ["Capcut"], projects: ["captionforge"], status: "Using" },
      { name: "Graphic design", description: "Posters, thumbnails and branding.", tools: ["Canva"], projects: [], status: "Using" },
      { name: "Motion graphics", description: "Animated type, transitions and VFX.", tools: ["after effects"], projects: [], status: "Using" },
      { name: "AI content creation", description: "AI visuals and video for storytelling.", tools: ["Gemini"], projects: [], status: "Exploring" },
    ],
  },
];

export const timeline = [
  { when: "Now", title: "B.Tech CSE (IoT)", body: "VNR Vignana Jyothi Institute of Engineering and Technology, Hyderabad.", todo: false },
  { when: "1st 6-Months", title: "MultiMedia Director", body: "a senior leader who oversees the technology, production, broadcast, engineering, and operational infrastructure powering an organization's digital and live media experiences", todo: true },
  { when: "2nd 6-Months", title: "C.E.O of own company", body: "Cloth branding", todo: true },
  { when: "End of-2028", title: "Expected graduation", body: "B.Tech Computer Science and Engineering (IoT).", todo: false },
] as const;

export const aboutPanels = [
  {
    id: "intro",
    title: "Introduction",
    body: "I'm Chinthala Anjan — a B.Tech CSE (IoT) student in Hyderabad who builds software, explores cybersecurity, AI/ML and IoT, and tells stories through video, design and motion.",
  },
  {
    id: "tech",
    title: "Technical interests",
    body: "Cybersecurity and network analysis, IoT & embedded systems, data engineering pipelines, and AI/ML including agentic AI.",
  },
  {
    id: "creative",
    title: "Creative interests",
    body: "Video editing & motion graphics, graphic design, AI content creation and digital storytelling.",
  },
  {
    id: "goals",
    title: "What I belive",
    body: "Dont go with flow, only dead fishes go with flow",
  },
  {
    id: "philosophy",
    title: "Philosophy",
    body: "“Powerful people make places powerful.” Develop. Create. Innovate.",
  },
] as const;
