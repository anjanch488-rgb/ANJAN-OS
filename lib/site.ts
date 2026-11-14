// Central, editable site configuration. Social links come from environment
// variables so they can be changed at deploy time without touching code.

export const site = {
  name: "CHINTHALA ANJAN",
  first: "CHINTHALA",
  last: "ANJAN",
  brand: "ANJAN.OS",
  tagline: ["DEVELOP", "CREATE", "INNOVATE"],
  quote: { before: "Powerful people make ", accent: "places", after: " powerful." },
  college: "VNR VJIET",
  collegeFull: "VNR Vignana Jyothi Institute of Engineering and Technology",
  gradYear: "2028",
  degree: "B.Tech Computer Science and Engineering (IoT)",
  degreeShort: "B.Tech CSE (IoT)",
  location: "Hyderabad, India",
  roles: [
    "Software Developer",
    "Cybersecurity Enthusiast",
    "AI/ML Explorer",
    "IoT Engineer",
    "Multimedia Specialist",
    "Creative Digital Content Creator",
  ],
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "",
  // Showreel: drop a file in /public/media and set the path here, e.g. "/media/showreel.mp4"
  showreel: { src: "/media/showreel.mp4", 
    poster: "/portrait.png" },
};

export type SocialKey = "github" | "linkedin" | "youtube" | "x" | "instagram";

// NOTE: process.env.NEXT_PUBLIC_* must be referenced literally for Next to inline them.
export const socials: { key: SocialKey; label: string; url: string }[] = [
  { key: "github", label: "GitHub", url: process.env.NEXT_PUBLIC_GITHUB_URL ?? "" },
  { key: "linkedin", label: "LinkedIn", url: process.env.NEXT_PUBLIC_LINKEDIN_URL ?? "" },
  { key: "youtube", label: "YouTube", url: process.env.NEXT_PUBLIC_YOUTUBE_URL ?? "" },
  { key: "x", label: "X", url: process.env.NEXT_PUBLIC_X_URL ?? "" },
  { key: "instagram", label: "Instagram", url: process.env.NEXT_PUBLIC_INSTAGRAM_URL ?? "" },
];

export const navItems = [
  { id: "home", label: "HOME", n: "01" },
  { id: "about", label: "ABOUT", n: "02" },
  { id: "projects", label: "PROJECTS", n: "03" },
  { id: "creative", label: "CREATIVE", n: "04" },
  { id: "skills", label: "SKILLS", n: "05" },
  { id: "contact", label: "CONTACT", n: "06" },
] as const;

export type NavId = (typeof navItems)[number]["id"];
