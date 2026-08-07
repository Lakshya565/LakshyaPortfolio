import type { AboutItem, Experience, SkillGroup } from "@/types/content";

export const skillGroups = [
  {
    name: "Languages",
    displayOrder: 10,
    skills: ["TypeScript", "Python", "C", "C++", "SQL"],
  },
  {
    name: "Software and AI Systems",
    displayOrder: 20,
    skills: ["Next.js", "React", "FastAPI", "Agentic Workflows", "GitHub API"],
  },
  {
    name: "Hardware and Embedded",
    displayOrder: 30,
    skills: ["Arduino", "Raspberry Pi", "PCB Design", "Sensors", "Digital Logic"],
  },
] as const satisfies readonly SkillGroup[];

export const aboutItems = [
  {
    category: "education",
    title: "Computer Engineering at UIUC",
    body: "Lakshya studies Computer Engineering at the University of Illinois Urbana-Champaign and gravitates toward work that crosses traditional software and hardware boundaries.",
    displayOrder: 10,
  },
  {
    category: "leadership",
    title: "Taekwondo teaching",
    body: "Teaching Taekwondo shaped a patient, practical approach to leadership: demonstrate clearly, observe carefully, and adapt feedback to the person learning.",
    displayOrder: 20,
  },
  {
    category: "community",
    title: "Eagle Scout and Camp Hi Sierra",
    body: "Scouting, counseling, and mentoring experiences developed the responsibility and calm coordination required when a group depends on the quality of an individual's preparation.",
    displayOrder: 30,
  },
  {
    category: "interests",
    title: "Building across boundaries",
    body: "The most interesting projects are the ones where an interface, model, sensor, and physical constraint all have to cooperate as one system.",
    displayOrder: 40,
  },
] as const satisfies readonly AboutItem[];

// Cisco employment context is intentionally contained in its project case study.
export const experiences = [] as const satisfies readonly Experience[];

