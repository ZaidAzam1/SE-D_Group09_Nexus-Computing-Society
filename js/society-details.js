/* ==========================================================================
   Nexus Computing Society — Society Details Page JavaScript
   Features:
   1. URL ?id=<society-id> parsing + built-in FAST-NUCES dataset + custom localStorage merge
   2. Interactive "Join Society" / "Joined ✓" membership toggle synced via localStorage
   3. Live member counter update & accessible confirmation toast
   4. Interactive detail tabs (All Sections, About & Mission, Executive Cabinet,
      Upcoming Events linking to event-register.html?event=<id>, Past Highlights)
   ========================================================================== */

(function () {
  "use strict";

  var DEFAULT_SOCIETY_ID = "nexus-computing-society";
  var JOINED_SOCIETIES_KEY = "ncs_joined_societies";
  var JOINED_META_KEY = "ncs_joined_societies_meta";
  var CUSTOM_SOCIETY_KEYS = [
    "ncs_custom_societies",
    "customSocieties",
    "ncs_societies"
  ];

  var ICONS = {
    code: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>',
    brain: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4.5a2.5 2.5 0 0 0-4.96-.46 2.5 2.5 0 0 0-1.98 3 2.5 2.5 0 0 0-1.32 4.24 3 3 0 0 0 .34 5.58 2.5 2.5 0 0 0 2.96 3.08A2.5 2.5 0 0 0 12 19.5"></path><path d="M12 4.5a2.5 2.5 0 0 1 4.96-.46 2.5 2.5 0 0 1 1.98 3 2.5 2.5 0 0 1 1.32 4.24 3 3 0 0 1-.34 5.58 2.5 2.5 0 0 1-2.96 3.08A2.5 2.5 0 0 1 12 19.5"></path><path d="M12 4.5V19.5"></path></svg>',
    shield: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><path d="m9 12 2 2 4-4"></path></svg>',
    terminal: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 17 10 11 4 5"></polyline><line x1="12" y1="19" x2="20" y2="19"></line></svg>',
    gamepad: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="6" y1="12" x2="10" y2="12"></line><line x1="8" y1="10" x2="8" y2="14"></line><circle cx="15" cy="13" r="1"></circle><circle cx="18" cy="11" r="1"></circle><rect x="2" y="6" width="20" height="12" rx="4"></rect></svg>'
  };

  var ID_ALIASES = {
    "nexus": "nexus-computing-society",
    "ncs": "nexus-computing-society",
    "web-app-dev": "nexus-computing-society",
    "robotics-iot": "nexus-computing-society",
    "ai-ds": "ai-data-science-club",
    "ai-ml": "ai-data-science-club",
    "ai-data-science": "ai-data-science-club",
    "cybersec": "cybersec-society",
    "cyber-security": "cybersec-society",
    "acm": "acm-student-chapter",
    "competitive-programming": "acm-student-chapter",
    "game-dev": "game-dev-guild",
    "game-dev-graphics": "game-dev-guild"
  };

  var BUILTIN_SOCIETIES = [
    {
      id: "nexus-computing-society",
      name: "Nexus Computing Society",
      shortName: "Nexus Computing",
      icon: "code",
      category: "Computing & Innovation",
      tagline: "FAST-NUCES Islamabad's flagship builder community driving competitive programming, full-stack systems, AI research, and open-source culture.",
      memberCount: 420,
      facultyAdvisor: "Dr. Usman Tariq",
      meetingSchedule: "Wednesdays • 4:00 PM",
      venue: "CS Block • Room CS-112 & Main Auditorium",
      founded: "Est. 2019",
      overview: [
        "Nexus Computing Society serves as the central undergraduate engineering collective at FAST-NUCES Islamabad. Across six specialized technical wings, students collaborate beyond coursework to architect real-world campus software, train for international programming contests, and host industry-mentored hackathons.",
        "Every semester, our technical squads run weekly hands-on build labs, peer code reviews, and speaker sessions connecting BS(CS), BS(SE), BS(AI), and BS(CY) cohorts with alumni engineers and research faculty."
      ],
      vision: "To cultivate an inclusive, engineering-first student ecosystem at FAST-NUCES Islamabad where ideas rapidly turn into production software, published research, and impactful open-source tools.",
      focusAreas: [
        {
          title: "Competitive Programming",
          tag: "Algorithms",
          description: "Weekly rated mashups, dynamic programming clinics, and regional ICPC qualification bootcamps."
        },
        {
          title: "Web/App Dev",
          tag: "Full-Stack",
          description: "Production web portals, mobile cross-platform builds, REST APIs, and UI/UX engineering sprints."
        },
        {
          title: "AI Research",
          tag: "Applied ML",
          description: "Paper reading circles, RAG agent prototypes, computer vision labs, and dataset benchmarks."
        },
        {
          title: "Open Source",
          tag: "Community",
          description: "Maintainer workshops, Git workflows, Hacktoberfest sprints, and shared campus developer tooling."
        }
      ],
      cabinet: [
        {
          role: "President",
          name: "Hamza Siddiqui",
          batch: "Batch '23 • BS(CS)",
          bio: "Leads executive strategy, industry partnerships, and flagship Nexus CodeRush hackathon operations."
        },
        {
          role: "Vice President",
          name: "Ayesha Tariq",
          batch: "Batch '23 • BS(AI)",
          bio: "Coordinates cross-wing mentorship circles, freshman onboarding, and inter-university collaborations."
        },
        {
          role: "General Secretary",
          name: "Bilal Mahmood",
          batch: "Batch '24 • BS(SE)",
          bio: "Manages member records, lab bookings, event logistics, and semester governance documentation."
        },
        {
          role: "Technical Lead",
          name: "Zainab Qureshi",
          batch: "Batch '24 • BS(CS)",
          bio: "Oversees campus portal engineering, workshop curriculum standards, and open-source repositories."
        }
      ],
      events: [
        {
          id: "coderush-2026",
          type: "Hackathon",
          format: "Teams of 2-4",
          title: "Nexus CodeRush 2026 Hackathon",
          description: "36-hour flagship engineering sprint featuring AI Systems, FinTech, and Campus Sustainability tracks with alumni judges.",
          date: "Dec 12, 2026 • 09:00 AM",
          venue: "Main Auditorium, FAST Islamabad",
          seats: "40 Teams Max"
        },
        {
          id: "llm-rag-workshop",
          type: "Workshop",
          format: "Hands-On Lab",
          title: "Applied LLM Agents & RAG Pipelines",
          description: "Build production retrieval-augmented generation workflows with vector indexing, structured tool calls, and local evals.",
          date: "Dec 03, 2026 • 04:00 PM",
          venue: "CS Block • Lab 204",
          seats: "60 Seats"
        },
        {
          id: "opensource-sprint-dec",
          type: "Sprint",
          format: "Open Contribution",
          title: "Winter Open-Source Campus Build Day",
          description: "Ship pull requests to FAST student utilities, learn clean PR reviews, and pair with senior wing maintainers.",
          date: "Dec 19, 2026 • 02:00 PM",
          venue: "Software Studio 208",
          seats: "50 Seats"
        }
      ],
      highlights: [
        {
          metric: "480+ Builders",
          year: "Spring 2026",
          kicker: "Flagship Hackathon",
          title: "NaSCon Computing & CodeSprint",
          description: "Organized 36-hour multi-track software challenge with 110 student teams and 14 industry mentors from Islamabad tech firms."
        },
        {
          metric: "18 Repos Shipped",
          year: "Fall 2025",
          kicker: "Open Source Initiative",
          title: "FAST Open Campus Toolkit",
          description: "Released open-source timetable planners, lab submission checkers, and study archive search tools used across campus."
        },
        {
          metric: "1,200+ Attendees",
          year: "2025–2026",
          kicker: "Technical Bootcamps",
          title: "48+ Hands-On Engineering Clinics",
          description: "Delivered weekly sessions spanning React, Docker, PyTorch, and system design interview preparation."
        }
      ]
    },
    {
      id: "ai-data-science-club",
      name: "AI & Data Science Club",
      shortName: "AI & DS Club",
      icon: "brain",
      category: "AI & Machine Learning",
      tagline: "Advancing deep learning, applied NLP, and data engineering research among FAST-NUCES undergraduates.",
      memberCount: 245,
      facultyAdvisor: "Dr. Hina Khalid",
      meetingSchedule: "Thursdays • 4:30 PM",
      venue: "AI Research Lab 302, C-Block",
      founded: "Est. 2020",
      overview: [
        "The AI & Data Science Club brings together aspiring machine learning engineers, data scientists, and undergraduate researchers at FAST-NUCES Islamabad. Members work on reproducible experiments spanning computer vision, Urdu NLP, and multimodal foundation models.",
        "Through guided Kaggle cohorts and faculty-assisted research circles, students bridge mathematical theory with scalable PyTorch and cloud MLOps pipelines."
      ],
      vision: "To empower FAST-NUCES students to author impactful AI research and deploy ethical, high-reliability machine intelligence systems.",
      focusAreas: [
        {
          title: "AI Research",
          tag: "Papers & Labs",
          description: "Bi-weekly research paper reading circles and undergraduate co-authorship mentorship."
        },
        {
          title: "Applied LLMs & NLP",
          tag: "Generative AI",
          description: "Fine-tuning open-weights models, evaluation harnesses, and low-resource language datasets."
        },
        {
          title: "Computer Vision",
          tag: "Perception",
          description: "Real-time object detection, medical imaging pipelines, and edge inference optimization."
        },
        {
          title: "Open Source Datasets",
          tag: "Open Source",
          description: "Curating clean Pakistani civic and academic benchmarks published openly on Hugging Face."
        }
      ],
      cabinet: [
        {
          role: "President",
          name: "Mariam Raza",
          batch: "Batch '23 • BS(AI)",
          bio: "Leads research mentorship tracks and national AI datathon partnerships."
        },
        {
          role: "Vice President",
          name: "Saad Ahmed",
          batch: "Batch '23 • BS(DS)",
          bio: "Oversees Kaggle competition teams and weekly data engineering bootcamps."
        },
        {
          role: "General Secretary",
          name: "Fatima Noor",
          batch: "Batch '24 • BS(AI)",
          bio: "Coordinates GPU lab slots, seminar speakers, and cohort registrations."
        },
        {
          role: "Technical Lead",
          name: "Umer Farooq",
          batch: "Batch '24 • BS(CS)",
          bio: "Maintains club PyTorch starter templates, model registries, and MLOps tooling."
        }
      ],
      events: [
        {
          id: "kaggle-datathon-2026",
          type: "Datathon",
          format: "Teams of 2-3",
          title: "Islamabad Winter AI Datathon",
          description: "24-hour predictive modeling and feature engineering challenge focused on smart campus energy telemetry.",
          date: "Dec 09, 2026 • 10:00 AM",
          venue: "C-Block • Seminar Hall",
          seats: "45 Teams"
        },
        {
          id: "pytorch-cv-bootcamp",
          type: "Workshop",
          format: "Code-Along",
          title: "PyTorch Vision Transformers from Scratch",
          description: "Implement patch embeddings, multi-head self-attention, and fine-tuning recipes in pure PyTorch.",
          date: "Dec 04, 2026 • 04:30 PM",
          venue: "AI Research Lab 302",
          seats: "50 Seats"
        },
        {
          id: "research-symposium-ai",
          type: "Symposium",
          format: "Paper Showcase",
          title: "Undergraduate AI Research Poster Night",
          description: "Present semester capstone experiments and receive direct feedback from FAST AI faculty advisors.",
          date: "Dec 18, 2026 • 03:00 PM",
          venue: "CS Auditorium",
          seats: "120 Seats"
        }
      ],
      highlights: [
        {
          metric: "1st Place National",
          year: "Spring 2026",
          kicker: "National AI Challenge",
          title: "Urdu Document OCR Benchmark",
          description: "Club squad secured top podium finish at the Inter-University AI Olympiad with a custom transformer pipeline."
        },
        {
          metric: "40k+ Downloads",
          year: "Fall 2025",
          kicker: "Open Source Release",
          title: "PakRoad Traffic Vision Dataset",
          description: "Published an annotated regional traffic dataset now used by undergraduate FYP teams nationwide."
        },
        {
          metric: "160+ Certified",
          year: "2025–2026",
          kicker: "ML Foundations",
          title: "Zero-to-Transformer Cohort",
          description: "Graduated 160 freshmen and sophomores through a 6-week Python, linear algebra, and deep learning track."
        }
      ]
    },
    {
      id: "cybersec-society",
      name: "CyberSec Society",
      shortName: "CyberSec",
      icon: "shield",
      category: "Cyber Security",
      tagline: "Training ethical hackers, CTF competitors, and defensive security engineers in sandboxed campus labs.",
      memberCount: 195,
      facultyAdvisor: "Dr. Salman Javed",
      meetingSchedule: "Fridays • 3:00 PM",
      venue: "Security Sandbox 105, B-Block",
      founded: "Est. 2021",
      overview: [
        "CyberSec Society is FAST-NUCES Islamabad's dedicated offensive and defensive information security community. Inside isolated Docker and VMware sandboxes, members practice ethical penetration testing, binary exploitation, forensics, and blue-team incident response.",
        "Our competitive CTF roster represents FAST Islamabad across national and international Jeopardy and Attack-Defense competitions."
      ],
      vision: "To build security-conscious software engineers and top-tier ethical security researchers ready to defend modern infrastructure.",
      focusAreas: [
        {
          title: "Capture The Flag (CTF)",
          tag: "OffSec",
          description: "Weekly challenges in web exploitation, reverse engineering, pwn, and cryptography."
        },
        {
          title: "Web & App Security",
          tag: "AppSec",
          description: "OWASP Top 10 audits, secure API design reviews, and source-code vulnerability hunting."
        },
        {
          title: "Network Defense",
          tag: "Blue Team",
          description: "Packet forensics with Wireshark, SIEM log triage, and Linux hardening drills."
        },
        {
          title: "Open Source Tooling",
          tag: "Open Source",
          description: "Building lightweight CTF infra containers and automated reconnaissance scripts."
        }
      ],
      cabinet: [
        {
          role: "President",
          name: "Danial Haider",
          batch: "Batch '23 • BS(CY)",
          bio: "Captains the FAST Islamabad CTF varsity team and leads red-team lab architecture."
        },
        {
          role: "Vice President",
          name: "Eman Tariq",
          batch: "Batch '23 • BS(CY)",
          bio: "Directs blue-team forensics workshops and freshman security orientation bootcamps."
        },
        {
          role: "General Secretary",
          name: "Taha Mansoor",
          batch: "Batch '24 • BS(CS)",
          bio: "Manages competition travel, responsible disclosure guidelines, and sandbox lab access."
        },
        {
          role: "Technical Lead",
          name: "Rayan Malik",
          batch: "Batch '24 • BS(CY)",
          bio: "Authors custom pwn, crypto, and web exploitation challenges for campus CTFs."
        }
      ],
      events: [
        {
          id: "winter-ctf-2026",
          type: "Competition",
          format: "Teams of 2-3",
          title: "Winter CTF & Binary Exploitation Sprint",
          description: "6-hour Jeopardy-style CTF spanning web exploitation, reverse engineering, forensics, and modern cryptography.",
          date: "Dec 07, 2026 • 02:00 PM",
          venue: "Innovation Hub • Room 101",
          seats: "35 Teams"
        },
        {
          id: "owasp-appsec-lab",
          type: "Workshop",
          format: "Sandbox Lab",
          title: "Breaking & Securing Modern Web APIs",
          description: "Hands-on Burp Suite walkthrough covering JWT pitfalls, SSRF, and access-control hardening.",
          date: "Dec 05, 2026 • 03:30 PM",
          venue: "Security Sandbox 105",
          seats: "45 Seats"
        },
        {
          id: "ghidra-re-clinic",
          type: "Clinic",
          format: "Beginner Friendly",
          title: "Intro to Reverse Engineering with Ghidra",
          description: "Learn x86-64 disassembly basics, control-flow recovery, and binary patching on safe challenge binaries.",
          date: "Dec 16, 2026 • 04:00 PM",
          venue: "B-Block • Lab 108",
          seats: "40 Seats"
        }
      ],
      highlights: [
        {
          metric: "2nd Place Overall",
          year: "Spring 2026",
          kicker: "National Cyber Hackathon",
          title: "Ignite Digital Pakistan CTF",
          description: "FAST Islamabad team solved all web and binary challenges to secure runner-up honors nationwide."
        },
        {
          metric: "320+ Flags Solved",
          year: "Fall 2025",
          kicker: "Campus Flagship",
          title: "ZeroDay Campus CTF 2025",
          description: "Hosted 90 student teams across 24 original challenges built entirely by CyberSec Society leads."
        },
        {
          metric: "14 CVEs / Reports",
          year: "2025–2026",
          kicker: "Responsible Disclosure",
          title: "Student AppSec Audit Circle",
          description: "Trained members in ethical vulnerability reporting and secure coding practices across campus apps."
        }
      ]
    },
    {
      id: "acm-student-chapter",
      name: "ACM Student Chapter",
      shortName: "ACM Chapter",
      icon: "terminal",
      category: "Algorithms & Research",
      tagline: "Advancing algorithmic problem-solving, ICPC championship training, and systems computing culture at FAST-NUCES.",
      memberCount: 310,
      facultyAdvisor: "Dr. Kamran Aziz",
      meetingSchedule: "Tuesdays • 3:30 PM",
      venue: "CS Seminar Hall, A-Block",
      founded: "Est. 2016",
      overview: [
        "The ACM Student Chapter at FAST-NUCES Islamabad upholds a proud tradition of competitive programming excellence and theoretical computer science exploration. Our weekly editorial sessions break down graph theory, segment trees, combinatorics, and dynamic programming.",
        "Beyond contests, the chapter connects students with technical interview readiness circles, alumni engineering panels, and international ACM programming competitions."
      ],
      vision: "To sharpen foundational computer science rigor and send championship-caliber FAST-NUCES teams to ICPC World Finals.",
      focusAreas: [
        {
          title: "Competitive Programming",
          tag: "ICPC Track",
          description: "Timed 3-person ICPC mock regionals, C++20 STL mastery, and editorial walk-throughs."
        },
        {
          title: "Systems & Compilers",
          tag: "Core CS",
          description: "Deep dives into memory allocators, concurrency primitives, and distributed consensus."
        },
        {
          title: "Interview Readiness",
          tag: "Career Prep",
          description: "Mock whiteboard rounds, complexity analysis, and structured coding clinics for juniors."
        },
        {
          title: "Open Source",
          tag: "Judge Infra",
          description: "Maintaining custom campus problem sets, test-case validators, and local contest judges."
        }
      ],
      cabinet: [
        {
          role: "President",
          name: "Abdullah Imran",
          batch: "Batch '23 • BS(CS)",
          bio: "2x ICPC Asia West Regionalist leading varsity problem-solving cohorts and contest curation."
        },
        {
          role: "Vice President",
          name: "Noor-ul-Ain",
          batch: "Batch '23 • BS(SE)",
          bio: "Organizes bi-weekly mock interviews, Women in Computing panels, and freshman camps."
        },
        {
          role: "General Secretary",
          name: "Omer Hayat",
          batch: "Batch '24 • BS(CS)",
          bio: "Coordinates official ACM chapter memberships, lab reservations, and sponsor outreach."
        },
        {
          role: "Technical Lead",
          name: "Haris Javed",
          batch: "Batch '24 • BS(CS)",
          bio: "Authors Polygon problem statements, stress-tests solutions, and runs the DOMjudge server."
        }
      ],
      events: [
        {
          id: "icpc-warmups-dec",
          type: "Contest",
          format: "Teams of 3",
          title: "FAST Islamabad ICPC Regional Mock #4",
          description: "5-hour ICPC-format algorithmic battle with 10 original problems, live scoreboard, and post-contest editorial.",
          date: "Dec 06, 2026 • 10:00 AM",
          venue: "Rawal Lab 1 & 2",
          seats: "50 Teams"
        },
        {
          id: "dp-graphs-bootcamp",
          type: "Workshop",
          format: "Interactive",
          title: "Graph Flows & Bitmask DP Masterclass",
          description: "Master Dinic's algorithm, shortest-path reductions, and state compression patterns in C++20.",
          date: "Dec 10, 2026 • 03:30 PM",
          venue: "CS Seminar Hall",
          seats: "80 Seats"
        },
        {
          id: "faang-mock-clinic",
          type: "Clinic",
          format: "1-on-1 Mocks",
          title: "Senior Alumni Coding Interview Clinic",
          description: "Practice live problem solving and system thinking with FAST alumni engineers from top tech companies.",
          date: "Dec 20, 2026 • 11:00 AM",
          venue: "A-Block • Tutorial Rooms",
          seats: "45 Slots"
        }
      ],
      highlights: [
        {
          metric: "Top 5 Regional",
          year: "Spring 2026",
          kicker: "ICPC Asia Topi",
          title: "ICPC Regional Finals Qualification",
          description: "Three FAST Islamabad chapter squads placed in the top 10 nationally, earning Asia West Regional berths."
        },
        {
          metric: "260+ Competitors",
          year: "Fall 2025",
          kicker: "Annual Contest",
          title: "Speed Programming Cup 2025",
          description: "Hosted universities from Islamabad and Rawalpindi for a full-day algorithmic marathon."
        },
        {
          metric: "100+ Problems",
          year: "2025–2026",
          kicker: "Problem Archive",
          title: "FAST Campus Practice Ladder",
          description: "Curated a structured 100-problem DSA progression tailored for Semester 2–5 students."
        }
      ]
    },
    {
      id: "game-dev-guild",
      name: "Game Dev Guild",
      shortName: "Game Dev Guild",
      icon: "gamepad",
      category: "Game Dev & Graphics",
      tagline: "Crafting interactive 2D/3D worlds, real-time GLSL shaders, gameplay physics, and semester game jams.",
      memberCount: 135,
      facultyAdvisor: "Ms. Sana Waheed",
      meetingSchedule: "Mondays • 4:30 PM",
      venue: "Multimedia Lab 114, C-Block",
      founded: "Est. 2022",
      overview: [
        "Game Dev Guild is FAST-NUCES Islamabad's creative engineering studio for game programmers, technical artists, sound designers, and shader tinkerers. Members build playable prototypes in Unity, Unreal Engine 5, and Godot while exploring computer graphics math from the ground up.",
        "Every semester culminates in a 48-hour campus Game Jam where interdisciplinary teams ship original titles and showcase them in an open playtest expo."
      ],
      vision: "To spark an indie game engineering culture at FAST-NUCES blending real-time graphics programming, tight gameplay feel, and creative storytelling.",
      focusAreas: [
        {
          title: "Real-Time Engines",
          tag: "Unity & Godot",
          description: "Character controllers, entity-component architectures, state machines, and cross-platform builds."
        },
        {
          title: "Graphics & Shaders",
          tag: "GLSL / HLSL",
          description: "Custom post-processing effects, procedural terrain, lighting models, and GPU optimization."
        },
        {
          title: "Web & App Dev Games",
          tag: "WebGL / Canvas",
          description: "Browser-playable multiplayer prototypes using HTML5 Canvas, Three.js, and WebSockets."
        },
        {
          title: "Open Source Assets",
          tag: "Open Source",
          description: "Sharing reusable Godot/Unity starter kits, procedural tools, and shader libraries on GitHub."
        }
      ],
      cabinet: [
        {
          role: "President",
          name: "Raza Javed",
          batch: "Batch '23 • BS(CS)",
          bio: "Directs semester game jams, playtest expos, and technical graphics workshops."
        },
        {
          role: "Vice President",
          name: "Maham Iqbal",
          batch: "Batch '24 • BS(SE)",
          bio: "Leads game design critique circles, UI polish, and audio-visual team coordination."
        },
        {
          role: "General Secretary",
          name: "Zohaib Ali",
          batch: "Batch '24 • BS(CS)",
          bio: "Handles Multimedia Lab equipment, jam judging rubrics, and showcase publications."
        },
        {
          role: "Technical Lead",
          name: "Fawad Khan",
          batch: "Batch '23 • BS(CS)",
          bio: "Maintains guild shader toolkits, physics benchmarks, and multiplayer networking templates."
        }
      ],
      events: [
        {
          id: "winter-game-jam-2026",
          type: "Game Jam",
          format: "48-Hour Jam",
          title: "FAST Winter Indie Game Jam 2026",
          description: "Form a squad of programmers and artists to build a playable game from a secret theme revealed at kickoff.",
          date: "Dec 14, 2026 • 05:00 PM",
          venue: "Multimedia Lab 114",
          seats: "25 Teams"
        },
        {
          id: "glsl-shaders-lab",
          type: "Workshop",
          format: "Hands-On",
          title: "Stylized Water & Lighting Shaders in GLSL",
          description: "Write vertex displacement, Fresnel reflections, and cel-shading passes step by step.",
          date: "Dec 08, 2026 • 04:30 PM",
          venue: "Multimedia Lab 114",
          seats: "40 Seats"
        },
        {
          id: "godot-multiplayer-night",
          type: "Lab",
          format: "Code-Along",
          title: "Co-Op Netcode Basics in Godot 4",
          description: "Build a responsive 2-player arena prototype using state synchronization and client prediction.",
          date: "Dec 21, 2026 • 04:00 PM",
          venue: "C-Block • Lab 206",
          seats: "45 Seats"
        }
      ],
      highlights: [
        {
          metric: "24 Playable Games",
          year: "Spring 2026",
          kicker: "Campus Game Jam",
          title: "Spring Ludum Campus Expo",
          description: "Over 95 student developers shipped 24 playable indie prototypes judged by local game studio leads."
        },
        {
          metric: "Best Tech Award",
          year: "Fall 2025",
          kicker: "Regional Showcase",
          title: "Twin Cities Indie Dev Fest",
          description: "Guild team won Best Visual Engineering for a custom procedural voxel dungeon crawler."
        },
        {
          metric: "60fps WebGL Kit",
          year: "2025–2026",
          kicker: "Open Source",
          title: "Guild Starter Engine Templates",
          description: "Published MIT-licensed 2D platformer and top-down shooter kits for first-time jam participants."
        }
      ]
    }
  ];

  /* ------------------------------------------------------------------------
     Storage Helpers (Custom Societies + Joined Societies Sync)
     ------------------------------------------------------------------------ */
  function safeJsonParse(raw, fallback) {
    try {
      return raw ? JSON.parse(raw) : fallback;
    } catch (err) {
      return fallback;
    }
  }

  function normalizeCustomSociety(item) {
    if (!item || typeof item !== "object") return null;
    var rawId = item.id || item.slug || item.societyId;
    var name = item.name || item.title;
    if (!rawId && name) {
      rawId = String(name).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    }
    if (!rawId || !name) return null;

    var fallback = BUILTIN_SOCIETIES[0];
    return {
      id: String(rawId),
      name: String(name),
      shortName: item.shortName ? String(item.shortName) : String(name),
      icon: ICONS[item.icon] ? item.icon : "code",
      category: item.category ? String(item.category) : "Student Society",
      tagline: item.tagline || item.description || fallback.tagline,
      memberCount: Number(item.memberCount || item.members) || 50,
      facultyAdvisor: item.facultyAdvisor || item.advisor || "FAST-NUCES Faculty Advisor",
      meetingSchedule: item.meetingSchedule || item.schedule || "Weekly • Campus Lab",
      venue: item.venue || "FAST-NUCES Islamabad Campus",
      founded: item.founded || "Est. 2026",
      overview: Array.isArray(item.overview) && item.overview.length
        ? item.overview
        : [item.description || fallback.overview[0]],
      vision: item.vision || fallback.vision,
      focusAreas: Array.isArray(item.focusAreas) && item.focusAreas.length
        ? item.focusAreas
        : fallback.focusAreas,
      cabinet: Array.isArray(item.cabinet) && item.cabinet.length
        ? item.cabinet
        : fallback.cabinet,
      events: Array.isArray(item.events) && item.events.length
        ? item.events
        : fallback.events,
      highlights: Array.isArray(item.highlights) && item.highlights.length
        ? item.highlights
        : fallback.highlights
    };
  }

  function getAllSocieties() {
    var list = BUILTIN_SOCIETIES.slice();
    var seenIds = {};
    list.forEach(function (soc) {
      seenIds[soc.id] = true;
    });

    CUSTOM_SOCIETY_KEYS.forEach(function (key) {
      var parsed = null;
      try {
        parsed = safeJsonParse(window.localStorage.getItem(key), null);
      } catch (err) {
        parsed = null;
      }

      var items = Array.isArray(parsed)
        ? parsed
        : (parsed && typeof parsed === "object" ? Object.keys(parsed).map(function (k) { return parsed[k]; }) : []);

      items.forEach(function (rawItem) {
        var normalized = normalizeCustomSociety(rawItem);
        if (normalized && !seenIds[normalized.id]) {
          seenIds[normalized.id] = true;
          list.push(normalized);
        }
      });
    });

    return list;
  }

  function resolveSocietyFromUrl(societies) {
    var params = new URLSearchParams(window.location.search);
    var requestedId = (params.get("id") || "").trim().toLowerCase();

    if (requestedId) {
      var mappedId = ID_ALIASES[requestedId] || requestedId;
      for (var i = 0; i < societies.length; i += 1) {
        if (societies[i].id.toLowerCase() === mappedId) {
          return societies[i];
        }
      }
    }

    for (var j = 0; j < societies.length; j += 1) {
      if (societies[j].id === DEFAULT_SOCIETY_ID) {
        return societies[j];
      }
    }
    return societies[0];
  }

  function getJoinedIds() {
    try {
      var parsed = safeJsonParse(window.localStorage.getItem(JOINED_SOCIETIES_KEY), []);
      if (!Array.isArray(parsed)) return [];
      return parsed
        .map(function (entry) {
          if (typeof entry === "string") return entry;
          if (entry && typeof entry === "object" && entry.id) return String(entry.id);
          return null;
        })
        .filter(Boolean);
    } catch (err) {
      return [];
    }
  }

  function saveJoinedState(joinedIds, society, isJoined) {
    try {
      window.localStorage.setItem(JOINED_SOCIETIES_KEY, JSON.stringify(joinedIds));

      var meta = safeJsonParse(window.localStorage.getItem(JOINED_META_KEY), {});
      if (!meta || typeof meta !== "object" || Array.isArray(meta)) {
        meta = {};
      }
      if (isJoined) {
        meta[society.id] = {
          id: society.id,
          name: society.name,
          category: society.category,
          tagline: society.tagline,
          facultyAdvisor: society.facultyAdvisor,
          memberCount: society.memberCount + 1,
          joinedAt: new Date().toISOString()
        };
      } else {
        delete meta[society.id];
      }
      window.localStorage.setItem(JOINED_META_KEY, JSON.stringify(meta));
    } catch (err) {
      // Gracefully ignore storage errors when localStorage is restricted
    }
  }

  /* ------------------------------------------------------------------------
     DOM Helpers & Renderers
     ------------------------------------------------------------------------ */
  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (typeof text === "string") node.textContent = text;
    return node;
  }

  function getInitials(fullName) {
    var parts = String(fullName || "NC").trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  function renderSwitcher(societies, activeSocietyId) {
    var container = document.getElementById("sd-switcher-links");
    if (!container) return;

    container.innerHTML = "";
    societies.forEach(function (soc) {
      var link = el(
        "a",
        "sd-switcher-pill" + (soc.id === activeSocietyId ? " is-current" : ""),
        soc.shortName || soc.name
      );
      link.href = "society-details.html?id=" + encodeURIComponent(soc.id);
      if (soc.id === activeSocietyId) {
        link.setAttribute("aria-current", "page");
      }
      container.appendChild(link);
    });
  }

  function renderAboutSection(society) {
    var overviewContainer = document.getElementById("sd-overview-copy");
    var visionEl = document.getElementById("sd-vision-text");
    var focusContainer = document.getElementById("sd-focus-list");
    var venueNoteEl = document.getElementById("sd-venue-note");

    if (venueNoteEl) {
      venueNoteEl.textContent = "FAST-NUCES Islamabad • " + society.venue;
    }

    if (overviewContainer) {
      overviewContainer.innerHTML = "";
      society.overview.forEach(function (paragraph) {
        overviewContainer.appendChild(el("p", "", paragraph));
      });
    }

    if (visionEl) {
      visionEl.textContent = society.vision;
    }

    if (focusContainer) {
      focusContainer.innerHTML = "";
      society.focusAreas.forEach(function (area) {
        var item = el("article", "sd-focus-item");
        var head = el("div", "sd-focus-item-head");
        head.appendChild(el("h4", "sd-focus-title", area.title));
        head.appendChild(el("span", "sd-focus-tag", area.tag));
        item.appendChild(head);
        item.appendChild(el("p", "sd-focus-desc", area.description));
        focusContainer.appendChild(item);
      });
    }
  }

  function renderCabinetSection(society) {
    var grid = document.getElementById("sd-cabinet-grid");
    if (!grid) return;

    grid.innerHTML = "";
    society.cabinet.slice(0, 4).forEach(function (member) {
      var card = el("article", "sd-cabinet-card");

      var top = el("div", "sd-cabinet-top");
      top.appendChild(el("span", "sd-avatar", getInitials(member.name)));
      top.appendChild(el("span", "sd-role-tag", member.role));
      card.appendChild(top);

      var info = el("div");
      info.appendChild(el("h3", "sd-cabinet-name", member.name));
      info.appendChild(el("p", "sd-cabinet-batch", member.batch));
      info.appendChild(el("p", "sd-cabinet-bio", member.bio));
      card.appendChild(info);

      grid.appendChild(card);
    });
  }

  function renderEventsSection(society) {
    var grid = document.getElementById("sd-events-grid");
    if (!grid) return;

    grid.innerHTML = "";
    society.events.forEach(function (evt) {
      var card = el("article", "sd-event-card");

      var body = el("div");
      var head = el("div", "sd-event-head");
      head.appendChild(el("span", "tag-accent", evt.type));
      head.appendChild(el("span", "sd-event-format", evt.format));
      body.appendChild(head);

      body.appendChild(el("h3", "sd-event-title", evt.title));
      body.appendChild(el("p", "sd-event-desc", evt.description));
      card.appendChild(body);

      var footer = el("div");
      var detailsList = el("div", "sd-event-details-list");

      var dateRow = el("div", "sd-event-detail-row");
      dateRow.appendChild(el("strong", "", "Date:"));
      dateRow.appendChild(el("span", "", evt.date));
      detailsList.appendChild(dateRow);

      var venueRow = el("div", "sd-event-detail-row");
      venueRow.appendChild(el("strong", "", "Venue:"));
      venueRow.appendChild(el("span", "", evt.venue));
      detailsList.appendChild(venueRow);

      var seatsRow = el("div", "sd-event-detail-row");
      seatsRow.appendChild(el("strong", "", "Capacity:"));
      seatsRow.appendChild(el("span", "", evt.seats));
      detailsList.appendChild(seatsRow);

      footer.appendChild(detailsList);

      var registerLink = el("a", "btn btn-primary btn-block", "Register Now");
      registerLink.href = "event-register.html?event=" + encodeURIComponent(evt.id);
      registerLink.style.marginTop = "1rem";
      footer.appendChild(registerLink);

      card.appendChild(footer);
      grid.appendChild(card);
    });
  }

  function renderHighlightsSection(society) {
    var grid = document.getElementById("sd-highlights-grid");
    if (!grid) return;

    grid.innerHTML = "";
    society.highlights.forEach(function (item) {
      var card = el("article", "sd-highlight-card");

      var visual = el("div", "sd-highlight-visual");
      visual.appendChild(el("span", "sd-highlight-metric", item.metric));
      visual.appendChild(el("span", "sd-highlight-year", item.year));
      card.appendChild(visual);

      var body = el("div", "sd-highlight-body");
      body.appendChild(el("span", "sd-highlight-kicker", item.kicker));
      body.appendChild(el("h3", "sd-highlight-title", item.title));
      body.appendChild(el("p", "sd-highlight-desc", item.description));
      card.appendChild(body);

      grid.appendChild(card);
    });
  }

  /* ------------------------------------------------------------------------
     Toast Notification Controller
     ------------------------------------------------------------------------ */
  function createToastController() {
    var toastEl = document.getElementById("sd-toast");
    var msgEl = document.getElementById("sd-toast-message");
    var closeBtn = document.getElementById("sd-toast-close");
    var hideTimer = null;

    function hide() {
      if (!toastEl) return;
      toastEl.hidden = true;
      if (hideTimer) {
        window.clearTimeout(hideTimer);
        hideTimer = null;
      }
    }

    function show(message) {
      if (!toastEl || !msgEl) return;
      msgEl.textContent = message;
      toastEl.hidden = false;

      if (hideTimer) {
        window.clearTimeout(hideTimer);
      }
      hideTimer = window.setTimeout(hide, 3800);
    }

    if (closeBtn) {
      closeBtn.addEventListener("click", hide);
    }

    return { show: show, hide: hide };
  }

  /* ------------------------------------------------------------------------
     Interactive Tabs Controller
     ------------------------------------------------------------------------ */
  function initDetailTabs() {
    var tabButtons = Array.prototype.slice.call(document.querySelectorAll(".sd-tab-btn"));
    var sections = Array.prototype.slice.call(document.querySelectorAll(".sd-section"));

    if (!tabButtons.length || !sections.length) return;

    function activateTab(targetKey) {
      tabButtons.forEach(function (btn) {
        var isActive = btn.getAttribute("data-tab-target") === targetKey;
        btn.classList.toggle("is-active", isActive);
        btn.setAttribute("aria-selected", isActive ? "true" : "false");
      });

      sections.forEach(function (sec) {
        var sectionKey = sec.getAttribute("data-section");
        sec.hidden = targetKey !== "all" && sectionKey !== targetKey;
      });
    }

    tabButtons.forEach(function (btn, index) {
      btn.addEventListener("click", function () {
        activateTab(btn.getAttribute("data-tab-target"));
      });

      btn.addEventListener("keydown", function (event) {
        var nextIndex = null;
        if (event.key === "ArrowRight") {
          nextIndex = (index + 1) % tabButtons.length;
        } else if (event.key === "ArrowLeft") {
          nextIndex = (index - 1 + tabButtons.length) % tabButtons.length;
        }
        if (nextIndex !== null) {
          event.preventDefault();
          tabButtons[nextIndex].focus();
          activateTab(tabButtons[nextIndex].getAttribute("data-tab-target"));
        }
      });
    });
  }

  /* ------------------------------------------------------------------------
     Initialize Society Details Page
     ------------------------------------------------------------------------ */
  function initSocietyDetailsPage() {
    var societies = getAllSocieties();
    var society = resolveSocietyFromUrl(societies);
    var toast = createToastController();

    // Populate Page Title & Hero
    document.title = society.name + " | Nexus Computing Society";

    var breadcrumbEl = document.getElementById("sd-breadcrumb-current");
    var iconEl = document.getElementById("sd-society-icon");
    var categoryEl = document.getElementById("sd-category-pill");
    var titleEl = document.getElementById("sd-hero-title");
    var taglineEl = document.getElementById("sd-hero-tagline");
    var memberCountEl = document.getElementById("sd-member-count");
    var advisorEl = document.getElementById("sd-faculty-advisor");
    var scheduleEl = document.getElementById("sd-meeting-schedule");
    var foundedEl = document.getElementById("sd-founded-year");

    if (breadcrumbEl) breadcrumbEl.textContent = society.name;
    if (iconEl) iconEl.innerHTML = ICONS[society.icon] || ICONS.code;
    if (categoryEl) categoryEl.textContent = society.category;
    if (titleEl) titleEl.textContent = society.name;
    if (taglineEl) taglineEl.textContent = society.tagline;
    if (advisorEl) advisorEl.textContent = society.facultyAdvisor;
    if (scheduleEl) scheduleEl.textContent = society.meetingSchedule;
    if (foundedEl) foundedEl.textContent = society.founded;

    // Populate Sections & Switcher
    renderSwitcher(societies, society.id);
    renderAboutSection(society);
    renderCabinetSection(society);
    renderEventsSection(society);
    renderHighlightsSection(society);
    initDetailTabs();

    // Membership State & Toggle
    var joinBtn = document.getElementById("sd-join-btn");
    var leaveBtn = document.getElementById("sd-leave-btn");
    var statusBadge = document.getElementById("sd-membership-badge");
    var panelHeading = document.getElementById("sd-panel-heading");
    var panelCopy = document.getElementById("sd-panel-copy");

    function syncMembershipUi(isJoined) {
      var displayCount = society.memberCount + (isJoined ? 1 : 0);
      if (memberCountEl) {
        memberCountEl.textContent = String(displayCount);
      }

      if (joinBtn) {
        joinBtn.classList.toggle("is-joined", isJoined);
        joinBtn.setAttribute("aria-pressed", isJoined ? "true" : "false");
        joinBtn.textContent = isJoined ? "Joined \u2713" : "Join Society";
        joinBtn.setAttribute(
          "aria-label",
          isJoined
            ? "Joined " + society.name + ". Click to leave society."
            : "Join " + society.name
        );
      }

      if (leaveBtn) {
        leaveBtn.hidden = !isJoined;
      }

      if (statusBadge) {
        statusBadge.classList.toggle("is-joined", isJoined);
        statusBadge.textContent = isJoined ? "Active Member" : "Open for Fall 2026";
      }

      if (panelHeading) {
        panelHeading.textContent = isJoined ? "You're Enrolled!" : "Become a Member";
      }

      if (panelCopy) {
        panelCopy.textContent = isJoined
          ? "Your membership is synced with My Societies. You can leave anytime below."
          : "Join weekly technical labs, vote in society sprints, and sync this society directly to your student portal.";
      }
    }

    function toggleMembership(forceLeave) {
      var joinedIds = getJoinedIds();
      var currentlyJoined = joinedIds.indexOf(society.id) !== -1;
      var nextJoined = forceLeave ? false : !currentlyJoined;

      if (nextJoined && !currentlyJoined) {
        joinedIds.push(society.id);
        saveJoinedState(joinedIds, society, true);
        syncMembershipUi(true);
        toast.show("Joined " + society.name + "! Synced with My Societies.");
      } else if (!nextJoined && currentlyJoined) {
        joinedIds = joinedIds.filter(function (id) {
          return id !== society.id;
        });
        saveJoinedState(joinedIds, society, false);
        syncMembershipUi(false);
        toast.show("Left " + society.name + ". Updated My Societies.");
      }
    }

    var initialJoined = getJoinedIds().indexOf(society.id) !== -1;
    syncMembershipUi(initialJoined);

    if (joinBtn) {
      joinBtn.addEventListener("click", function () {
        toggleMembership(false);
      });
    }

    if (leaveBtn) {
      leaveBtn.addEventListener("click", function () {
        toggleMembership(true);
      });
    }
  }

  document.addEventListener("DOMContentLoaded", initSocietyDetailsPage);
})();
