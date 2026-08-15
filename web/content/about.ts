import type { AboutItem, PersonalMotif, SkillGroup } from "@/types/content";

export const skillGroups = [
  {
    name: "Languages",
    displayOrder: 10,
    skills: ["TypeScript", "Python", "C", "C++", "SQL"],
  },
  {
    name: "Software and AI Systems",
    displayOrder: 20,
    skills: [
      "Next.js",
      "React",
      "FastAPI",
      "Flask",
      "REST APIs",
      "Agentic Workflows",
      "GitHub API",
    ],
  },
  {
    name: "Hardware and Embedded",
    displayOrder: 30,
    skills: [
      "Arduino",
      "ESP32",
      "Raspberry Pi",
      "PCB Design",
      "Sensors",
      "Digital Logic",
      "MQTT",
    ],
  },
] as const satisfies readonly SkillGroup[];

export const aboutItems = [
  {
    category: "education",
    title: "Computer Engineering at UIUC",
    body: "I am pursuing a Computer Engineering degree at the University of Illinois Urbana-Champaign, with an expected May 2029 graduation, and I gravitate toward work that crosses software and hardware boundaries.",
    displayOrder: 10,
  },
  {
    category: "leadership",
    title: "Taekwondo master instructor",
    body: "After more than twelve years of training, I earned a fourth-degree black belt and became a Master Instructor, leading three weekly classes of more than twenty students ages four through sixteen.",
    displayOrder: 20,
  },
  {
    category: "community",
    title: "Eagle Scout and Camp Hi-Sierra",
    body: "Through Eagle Scout service and several years at Camp Hi-Sierra, I supervised and taught more than four hundred Scouts and learned how much preparation matters when a group depends on you.",
    displayOrder: 30,
  },
  {
    category: "interests",
    title: "Building across boundaries",
    body: "Outside engineering, I spend time climbing, lifting, watching anime, and tracking down good food with people I care about. Those interests keep me curious, social, and willing to be bad at something before getting better.",
    displayOrder: 40,
  },
] as const satisfies readonly AboutItem[];

export const personalMotifs = [
  {
    key: "maker-origin",
    label: "Maker origin",
    detail: "I started my electronics journey off with Arduino, documenting more than fifty Arduino builds and lessons on Youtube and a personal website.",
    group: "engineering",
    displayOrder: 10,
  },
  {
    key: "quackta",
    label: "A debugging duck",
    detail: "QuackTA turned rubber-duck debugging into a physical ECE teaching assistant during the IEEE hardware hackathon at UIUC. We 3D-printed the duck in green filament with a hollow belly and an opening in its side, which let us seat the board and wiring inside the body.",
    group: "engineering",
    displayOrder: 20,
  },
  {
    key: "taekwondo",
    label: "Four belt stripes",
    detail: "Twelve years of Taekwondo led to a fourth-degree black belt and a Master Instructor role.",
    group: "life",
    displayOrder: 30,
  },
  {
    key: "scouting",
    label: "A compass",
    detail: "Earning Eagle Scout gave me invaluable life skills and a title for life, and my first job as a counselor at Camp Hi-Sierra gave me the chance to teach more than four hundred Scouts archery!",
    group: "life",
    displayOrder: 40,
  },
  {
    key: "shared-food",
    label: "Two drinks",
    detail: "I love getting drinks with friends and a special someone, and boba & matcha are some of my top choices right now.",
    group: "life",
    displayOrder: 50,
  },
  {
    key: "food-favorites",
    label: "Always looking for good food",
    detail: "I love food! Right now, sushi, Thai and Indian food, ramen, froyo, and any variation of Hot Cheetos are some of my favorites, among other things.",
    group: "life",
    displayOrder: 60,
  },
  {
    key: "climbing",
    label: "Climbing reset",
    detail: "Bouldering has taken up a lot of my time lately, and I love the mental and physical challenge of it. Currently, I am a V5 climber!",
    group: "life",
    displayOrder: 70,
  },
  {
    key: "gym",
    label: "Time under the bar",
    detail: "I enjoy lifting weights and tracking my progress, and I like getting stronger and more physically fit in my peak years.",
    group: "life",
    displayOrder: 80,
  },
  {
    key: "anime",
    label: "Anime nights",
    detail: "Current favorites include Attack on Titan, Code Geass, Jujustu Kaisen, and Blue Lock. I love strategic decisions, mind-bending plots, and aurafarming moments equally as much. ",
    group: "life",
    displayOrder: 90,
  },
  {
    key: "kirby",
    label: "A cute puffball",
    detail: "Kirby is a cute puffball I got attached to in high school, and now my desk is covered in different Kirbys - my mousepad, numerous plushies & figurines, and video games featuring him! I love that cheerful attitude and the ability to adapt to any situation by eating it.",
    group: "life",
    displayOrder: 100,
  },
  {
    key: "triforce",
    label: "The Legend of Zelda",
    detail: "Breath of the Wild is my favorite game of all time, and I love the Legend of Zelda series in general. I fell in love with the music, the story, the exploration of Hyrule throughout different games, and the sense of adventure & discovery that comes with it.",
    group: "life",
    displayOrder: 110,
  },
  {
    key: "music",
    label: "Always something playing",
    detail: "There is almost always something in my ears while I study, work out, and/or drive, and Don Toliver gets more of those hours than anyone else. I primarily listen to rap and R&B, but I love listening to new music and exploring different genres.",
    group: "life",
    displayOrder: 120,
  },
] as const satisfies readonly PersonalMotif[];
