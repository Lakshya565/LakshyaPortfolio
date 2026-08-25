import type {
  AboutIntro,
  AboutItem,
  AboutPanel,
  PersonalMotif,
  SkillGroup,
} from "@/types/content";

/**
 * **Nothing currently renders this.** The About page was rebuilt around
 * `aboutIntro` and `aboutPanels` below, and the boxed "Toolbox" sidebar that
 * used to show these went with it. Kept because the grouping is real and
 * deleting written content to suit a layout is not reversible.
 */
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

/**
 * **Nothing currently renders this either** — the "Perspective" card grid it fed
 * was removed for saying the same things the About rails now say. Kept for the
 * same reason as `skillGroups`.
 */
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

/**
 * The opening of the About page.
 *
 * Everything here is the kind of thing a visitor only learns by getting to this
 * page, which is the whole reason the page exists.
 *
 * Note `name` is the given name alone, not `siteProfile.name`. This is the one
 * place on the site where the name is *said* rather than displayed, and it is
 * why `validate-portfolio-content.ts` exempts this block from the third-person
 * narrator check — "My name is Lakshya" is first person, and the check cannot
 * tell the difference.
 */
export const aboutIntro = {
  name: "Lakshya",
  pronunciation: "Luck-shay",
  nickname: "Lucky",
  meaning: '"aim" in Hindi',
  body: "I've lived in the Bay Area all my life and went to Westmont High School. Initially, I wanted to study Electrical Engineering, but I found a passion for Computer Science in my junior year, so I combined the two! Now, I'm at UIUC studying Computer Engineering, and seeking out new opportunities wherever the world takes me next.",
} as const satisfies AboutIntro;

/**
 * The six panels of the About page, in two rails of three.
 *
 * **Three per rail is structural, not stylistic.** `globals.css` draws a
 * three-column elbow above each rail and
 * `components/about/about-rail-beams.tsx` measures three drops. Adding a fourth
 * panel to a rail breaks the connector geometry, not just the balance.
 *
 * `now` is who he is at the moment; `work` is how he works. The `work` rail is
 * the prose that used to live in `content/about.mdx`, with "Why I build" and
 * "Building for real conditions" combined into one panel.
 */
export const aboutPanels = [
  {
    rail: "now",
    title: "What I'm up to",
    body: "At UIUC studying Computer Engineering, with an expected May 2029 graduation (or May 2028, if I can get my degree done early!). Most recently I interned at Cisco as a Software Engineer on the Industrial IoT team. I'm always building, learning, and looking for new opportunities.",
    displayOrder: 10,
  },
  {
    rail: "now",
    title: "What I love",
    body: "Boba and matcha, climbing, Thai food, Hot Cheetos, anime, personal projects, and making the most of my short time on this planet. Teaching belongs on this list too: it has shaped how I engineer more than anything else outside a keyboard.",
    displayOrder: 30,
  },
  {
    rail: "now",
    title: "Currently obsessed with",
    body: "How AI can be used productively in the real world, and how different LLM and agentic concepts are applied to real workflows. Also, keeping up with the latest new tech and models, and making my own informed decisions about them instead of just following the hype.",
    displayOrder: 20,
  },
  {
    rail: "work",
    title: "Why I build",
    body: "The most interesting engineering problems do not stay inside one layer, so my work moves between agentic software, connected devices, and physical prototypes instead of treating them as separate interests. I care about what happens after a system works once: at Cisco that meant testing generated troubleshooting steps against simulated faults, and in embedded projects it has meant debugging sensor behavior and running user trials outside a controlled lab.",
    displayOrder: 40,
  },
  {
    rail: "work",
    title: "Teaching and leadership",
    body: "More than twelve years of Taekwondo led to a fourth-degree black belt and a Master Instructor role teaching three weekly classes to the smallest of students. Furthermore, being an Eagle Scout and a counselor at Camp Hi-Sierra taught me an important lesson: preparation and communication determine whether technical knowledge becomes useful to the person standing in front of you. These core experiences heavily shaped the way I engineer and lead.",
    displayOrder: 50,
  },
  {
    rail: "work",
    title: "What I am exploring",
    body: "I am especially interested in intelligent IoT, human-centered technology, and AI systems whose behavior can be inspected and evaluated. The common thread is building across boundaries while keeping the result understandable to the people who use and maintain it. Beyond that, I'm always looking for the next productive, but fun opportunity! If I'm not interested in the work I'm doing, regardless of how influential it may be, I'll end up looking for the next challenge that excites me.",
    displayOrder: 60,
  },
] as const satisfies readonly AboutPanel[];
