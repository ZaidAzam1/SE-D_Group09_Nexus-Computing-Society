/* ==========================================================================
   Nexus Computing Society — Page 4: Events Listing Interactivity
   Pure Vanilla JavaScript (ES6+)
   ========================================================================== */

(() => {
  'use strict';

  const STORAGE_KEY = 'ncs_selected_event';
  const DEFAULT_EVENT_ID = 'coderush-2026';
  const FALLBACK_LOGO_PATH = '../images/logo.jpg';

  /**
   * Realistic university tech events dataset for Nexus Computing Society.
   */
  const eventsData = [
    {
      id: 'coderush-2026',
      title: 'Nexus CodeRush 2026 Hackathon',
      category: 'Hackathons',
      hostingWing: 'Software Engineering & AI Wing',
      date: 'Dec 05–06, 2026 • 09:00 AM',
      venue: 'Main Innovation Auditorium, Block C',
      prizePool: '$2,500 + Cloud Credits',
      fee: '$15 / Team',
      seatsTotal: 180,
      seatsTaken: 117,
      status: 'Open',
      summary:
        'A 36-hour flagship collegiate hackathon challenging student teams to architect full-stack AI, fintech, and civic-tech prototypes with live industry mentorship.',
      timeline: [
        {
          time: 'Day 1 • 09:00 AM',
          title: 'Registration Check-In & Opening Keynote',
          description: 'Team badge pickup, Wi-Fi onboarding, problem track reveal, and sponsor API briefings.'
        },
        {
          time: 'Day 1 • 11:00 AM',
          title: 'Hacking Sprint Begins & Mentor Rounds',
          description: 'Teams lock repo URLs and meet architecture, UI/UX, and cloud engineering mentors.'
        },
        {
          time: 'Day 2 • 08:00 AM',
          title: 'Code Freeze & Repo Verification',
          description: 'Final Git push deadline, README submission, and 3-minute recorded backup pitch upload.'
        },
        {
          time: 'Day 2 • 01:30 PM',
          title: 'Live Demo Expo & Prize Ceremony',
          description: 'Top 8 finalist teams present live prototypes to faculty and industry judges.'
        }
      ],
      rules: [
        'Teams must consist of 2 to 4 currently enrolled university students with valid campus IDs.',
        'All core application code and design assets must be created during the official 36-hour build window.',
        'Open-source libraries, public SDKs, and documented AI APIs are permitted when disclosed in your README.',
        'Each team may submit to only one primary track (Civic Tech, FinTech, or Campus AI Tools).',
        'Projects must include a reproducible local run script or live deployment link for judge verification.',
        'All participants must uphold the Nexus Computing Society Code of Conduct throughout the event.'
      ],
      speakers: [
        {
          role: 'Lead Judge',
          name: 'Dr. Ayesha Tariq',
          org: 'Associate Professor, Distributed Systems',
          topic: 'Evaluating System Reliability & Real-World Impact'
        },
        {
          role: 'Industry Mentor',
          name: 'Hamza Siddiqui',
          org: 'Staff Platform Engineer, CloudCore',
          topic: 'Zero-to-Production Architecture Under Tight Deadlines'
        },
        {
          role: 'Alumni Judge',
          name: 'Sara Mahmood',
          org: 'Product Lead, FinBridge Labs',
          topic: 'Designing Usable MVPs That Win Users'
        }
      ],
      faqs: [
        {
          question: 'Do we need a pre-formed team before registering?',
          answer:
            'You can register as a complete 2–4 member team or sign up individually and join our pre-hackathon team-matching mixer on Day 1 at 9:30 AM.'
        },
        {
          question: 'Are meals, power strips, and overnight workspace provided?',
          answer:
            'Yes. Innovation Auditorium Block C stays open overnight with dedicated power hubs, high-speed campus Wi-Fi, dinner, midnight coffee, and breakfast.'
        },
        {
          question: 'Can we use starter templates or boilerplate kits?',
          answer:
            'Standard framework CLIs and UI primitives are allowed, provided all domain logic, integrations, and features are built fresh during the hackathon.'
        }
      ]
    },
    {
      id: 'zero-day-ctf-2026',
      title: 'Zero-Day Cyber Security & CTF Bootcamp',
      category: 'Workshops',
      hostingWing: 'Cybersecurity & Systems Wing',
      date: 'Dec 12, 2026 • 10:00 AM',
      venue: 'Cyber Defense Lab 204, CS Building',
      prizePool: '$1,200 + CTF Trophies & Vouchers',
      fee: '$10 / Participant',
      seatsTotal: 60,
      seatsTaken: 54,
      status: 'Filling Fast',
      summary:
        'Hands-on offensive security workshop covering binary exploitation, web app pentesting, packet forensics, and a live Jeopardy-style Capture The Flag sprint.',
      timeline: [
        {
          time: '10:00 AM',
          title: 'Lab Environment Setup & Threat Briefing',
          description: 'Dockerized vulnerable targets, VPN onboarding, and ethical disclosure rules.'
        },
        {
          time: '11:15 AM',
          title: 'Module 1: Web Exploitation & Auth Bypass',
          description: 'Guided walkthrough of SSRF, JWT misconfigurations, and SQL injection remediation.'
        },
        {
          time: '01:30 PM',
          title: 'Module 2: Reverse Engineering & Forensics',
          description: 'Inspecting ELF binaries, memory dumps, and PCAP captures for hidden flags.'
        },
        {
          time: '03:00 PM',
          title: 'Live 2-Hour Jeopardy CTF & Awards',
          description: 'Dynamic scoreboard challenge across 18 tiered security puzzles.'
        }
      ],
      rules: [
        'Participation is individual or in pairs (maximum 2 members per workstation/team).',
        'Attacking university infrastructure or targets outside the designated CTF subnet is strictly prohibited.',
        'Flag sharing, brute-forcing the scoring platform, or denial-of-service attacks result in immediate disqualification.',
        'Participants must bring a laptop capable of running an SSH client and modern web browser.',
        'Top 3 scorers must submit brief write-ups within 45 minutes of the CTF freeze.'
      ],
      speakers: [
        {
          role: 'Bootcamp Lead',
          name: 'Bilal Raza',
          org: 'Senior Security Researcher, RedShield',
          topic: 'Modern Web Attack Surfaces & Defensive Hardening'
        },
        {
          role: 'CTF Architect',
          name: 'Zainab Khalid',
          org: 'NCS Security Wing Lead',
          topic: 'Binary Triage & Packet Forensics Fundamentals'
        },
        {
          role: 'Guest Judge',
          name: 'Engr. Omar Farooq',
          org: 'SOC Operations Manager, NetVault',
          topic: 'From Campus CTFs to Incident Response Careers'
        }
      ],
      faqs: [
        {
          question: 'Do I need Kali Linux pre-installed on my laptop?',
          answer:
            'No. Browser-based lab VMs are provisioned for every registered participant, though having a local Linux terminal or SSH client is helpful.'
        },
        {
          question: 'Is this bootcamp beginner-friendly?',
          answer:
            'Yes. The morning modules cover foundational Linux, HTTP, and debugging workflows before the afternoon CTF challenges ramp up in difficulty.'
        },
        {
          question: 'Will certificates count toward department co-curricular credits?',
          answer:
            'All verified attendees who complete at least two workshop labs receive an official NCS Cybersecurity Wing completion certificate.'
        }
      ]
    },
    {
      id: 'genai-agents-summit-2026',
      title: 'Generative AI & Autonomous Agents Summit',
      category: 'Seminars',
      hostingWing: 'AI Research & Data Science Wing',
      date: 'Dec 19, 2026 • 02:00 PM',
      venue: 'Jinnah Lecture Hall, Engineering Wing',
      prizePool: 'Research Fellowships & API Grants',
      fee: 'Free (Student ID)',
      seatsTotal: 220,
      seatsTaken: 145,
      status: 'Open',
      summary:
        'Keynote talks and technical panels with ML researchers and alumni engineers exploring tool-using agents, RAG pipelines, evaluation harnesses, and AI safety.',
      timeline: [
        {
          time: '02:00 PM',
          title: 'Doors Open & Poster Showcase',
          description: 'Student research posters on multimodal models and campus AI tooling.'
        },
        {
          time: '02:30 PM',
          title: 'Keynote: Reliable Tool-Using Agents',
          description: 'Architecting deterministic guardrails, memory layers, and verification loops.'
        },
        {
          time: '03:45 PM',
          title: 'Technical Panel: Evaluation & AI Safety',
          description: 'Benchmarking RAG accuracy, latency trade-offs, and red-teaming workflows.'
        },
        {
          time: '05:00 PM',
          title: 'Live Q&A & Fellowship Announcements',
          description: 'Open mic with speakers and Spring 2027 undergraduate AI lab applications.'
        }
      ],
      rules: [
        'Free admission for all university students, faculty, and registered alumni upon presenting a valid ID.',
        'Seats in the main lecture hall are held until 15 minutes prior to keynote start.',
        'Student poster presenters must submit their PDF abstract at least 48 hours before the summit.',
        'Recording or redistributing unpublished slide decks without speaker consent is not permitted.'
      ],
      speakers: [
        {
          role: 'Keynote Speaker',
          name: 'Dr. Kamran Qureshi',
          org: 'Director, Campus Applied ML Lab',
          topic: 'Beyond Prompts: Structured Agentic Workflows'
        },
        {
          role: 'Panelist',
          name: 'Nadia Hassan',
          org: 'ML Systems Engineer, VectorGrid',
          topic: 'Production RAG Evaluation & Latency Optimization'
        },
        {
          role: 'Panelist',
          name: 'Tariq Javed',
          org: 'AI Safety Fellow & NCS Alumnus',
          topic: 'Guardrails, Sandboxing & Verifiable Outputs'
        }
      ],
      faqs: [
        {
          question: 'Is there any registration fee for non-CS majors?',
          answer:
            'No. Admission is completely free for students from all university departments with a valid university student card.'
        },
        {
          question: 'Will slides and reference repositories be shared afterward?',
          answer:
            'Yes. Approved speaker slides, reading lists, and open-source demo repositories will be emailed to all checked-in attendees.'
        },
        {
          question: 'How do I apply for the Spring 2027 AI research fellowship?',
          answer:
            'Application QR links and faculty mentor office hours will be announced during the closing session at 5:00 PM.'
        }
      ]
    },
    {
      id: 'cyberarena-esports-2026',
      title: 'Nexus CyberArena E-Sports Expo',
      category: 'Gaming & E-Sports',
      hostingWing: 'Interactive Media & Gaming Wing',
      date: 'Oct 18, 2026 • 11:00 AM',
      venue: 'University Sports & Arena Complex',
      prizePool: '$1,800 + Gaming Peripherals',
      fee: '$20 / Squad',
      seatsTotal: 120,
      seatsTaken: 120,
      status: 'Completed',
      summary:
        'Inter-departmental collegiate tournament featuring Valorant, Tekken 8, and Rocket League brackets, indie game dev booths, and hardware showcase zones.',
      timeline: [
        {
          time: '11:00 AM',
          title: 'Squad Check-In & Peripheral Calibration',
          description: 'Gear inspection, tournament client login, and bracket seed confirmation.'
        },
        {
          time: '12:00 PM',
          title: 'Group Stage & Double-Elimination Pools',
          description: 'Simultaneous matches across Valorant, Tekken 8, and Rocket League stations.'
        },
        {
          time: '04:00 PM',
          title: 'Indie Game Showcase & Semifinals',
          description: 'Student game-dev demos on the expo floor alongside main-stage semifinals.'
        },
        {
          time: '06:30 PM',
          title: 'Grand Finals & Championship Trophy Presentation',
          description: 'Best-of-three stage finals followed by MVP awards and sponsor giveaways.'
        }
      ],
      rules: [
        'All squad members must belong to recognized university departments and present student IDs at check-in.',
        'Custom mice, keyboards, and headsets are allowed; third-party macros or overlay scripts are banned.',
        'Teams arriving more than 10 minutes past their scheduled stage call forfeit the map.',
        'Tournament admin rulings on technical pauses and bracket disputes are final.'
      ],
      speakers: [
        {
          role: 'Tournament Director',
          name: 'Saad Malik',
          org: 'NCS Gaming Wing Coordinator',
          topic: 'Bracket Operations & Fair Play Compliance'
        },
        {
          role: 'Showcase Host',
          name: 'Hina Waqar',
          org: 'Lead Technical Artist, PixelForge Club',
          topic: 'Student Indie Game Showcase & Shader Demos'
        },
        {
          role: 'Guest Caster',
          name: 'Daniyal Akram',
          org: 'Collegiate Esports Broadcaster',
          topic: 'Main-Stage Play-by-Play Commentary'
        }
      ],
      faqs: [
        {
          question: 'Why is registration disabled for this event?',
          answer:
            'Nexus CyberArena E-Sports Expo concluded on Oct 18, 2026 at full capacity (120/120 seats). You can still review its schedule, rules, and speakers here.'
        },
        {
          question: 'Where can I view tournament winners and match VODs?',
          answer:
            'Bracket recaps and indie game showcase highlights are archived in the Nexus Computing Society campus portal.'
        },
        {
          question: 'When will the next CyberArena edition open?',
          answer:
            'Spring CyberArena qualifiers are planned for March 2027. Check the Events Listing page for upcoming announcements.'
        }
      ]
    }
  ];

  const state = {
    searchQuery: '',
    activeCategory: 'All'
  };

  /**
   * Fallback to logo.jpg if logo.png is unavailable.
   */
  function initLogoFallback() {
    const logoImages = document.querySelectorAll('.brand-logo');
    logoImages.forEach((img) => {
      const applyFallback = () => {
        if (img.dataset.fallbackApplied === 'true') return;
        img.dataset.fallbackApplied = 'true';
        img.src = FALLBACK_LOGO_PATH;
      };

      img.addEventListener('error', applyFallback);

      if (img.complete && img.naturalWidth === 0) {
        applyFallback();
      }
    });
  }

  /**
   * Accessible mobile hamburger menu toggle.
   */
  function initMobileNav() {
    const navToggle = document.getElementById('nav-toggle');
    const primaryNav = document.getElementById('primary-nav');

    if (!navToggle || !primaryNav) return;

    const setMenuState = (isOpen) => {
      navToggle.setAttribute('aria-expanded', String(isOpen));
      primaryNav.classList.toggle('is-open', isOpen);
    };

    navToggle.addEventListener('click', () => {
      const currentlyOpen = navToggle.getAttribute('aria-expanded') === 'true';
      setMenuState(!currentlyOpen);
    });

    primaryNav.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => setMenuState(false));
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && primaryNav.classList.contains('is-open')) {
        setMenuState(false);
        navToggle.focus();
      }
    });

    document.addEventListener('click', (event) => {
      if (!primaryNav.classList.contains('is-open')) return;
      const target = event.target;
      if (target instanceof Node && !primaryNav.contains(target) && !navToggle.contains(target)) {
        setMenuState(false);
      }
    });

    window.addEventListener('resize', () => {
      if (window.innerWidth > 860 && primaryNav.classList.contains('is-open')) {
        setMenuState(false);
      }
    });
  }

  /**
   * Compute dynamic hero summary stats from eventsData.
   */
  function renderHeroStats() {
    const statTotal = document.getElementById('stat-total');
    const statOpen = document.getElementById('stat-open');
    const statSeats = document.getElementById('stat-seats');

    const totalCount = eventsData.length;
    const activeCount = eventsData.filter((item) => item.status !== 'Completed').length;
    const availableSeats = eventsData.reduce((sum, item) => {
      if (item.status === 'Completed') return sum;
      return sum + Math.max(0, item.seatsTotal - item.seatsTaken);
    }, 0);

    if (statTotal) statTotal.textContent = String(totalCount);
    if (statOpen) statOpen.textContent = String(activeCount);
    if (statSeats) statSeats.textContent = String(availableSeats);
  }

  /**
   * Create small inline SVG icon for metadata rows.
   */
  function createMetaIcon(type) {
    const ns = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('class', 'meta-icon');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('fill', 'none');
    svg.setAttribute('stroke', 'currentColor');
    svg.setAttribute('stroke-width', '2');
    svg.setAttribute('stroke-linecap', 'round');
    svg.setAttribute('stroke-linejoin', 'round');
    svg.setAttribute('aria-hidden', 'true');

    if (type === 'date') {
      const rect = document.createElementNS(ns, 'rect');
      rect.setAttribute('x', '3');
      rect.setAttribute('y', '4');
      rect.setAttribute('width', '18');
      rect.setAttribute('height', '18');
      rect.setAttribute('rx', '2');
      rect.setAttribute('ry', '2');
      const l1 = document.createElementNS(ns, 'line');
      l1.setAttribute('x1', '16');
      l1.setAttribute('y1', '2');
      l1.setAttribute('x2', '16');
      l1.setAttribute('y2', '6');
      const l2 = document.createElementNS(ns, 'line');
      l2.setAttribute('x1', '8');
      l2.setAttribute('y1', '2');
      l2.setAttribute('x2', '8');
      l2.setAttribute('y2', '6');
      const l3 = document.createElementNS(ns, 'line');
      l3.setAttribute('x1', '3');
      l3.setAttribute('y1', '10');
      l3.setAttribute('x2', '21');
      l3.setAttribute('y2', '10');
      svg.append(rect, l1, l2, l3);
    } else if (type === 'fee') {
      const tag = document.createElementNS(ns, 'path');
      tag.setAttribute('d', 'M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z');
      const dot = document.createElementNS(ns, 'line');
      dot.setAttribute('x1', '7');
      dot.setAttribute('y1', '7');
      dot.setAttribute('x2', '7.01');
      dot.setAttribute('y2', '7');
      svg.append(tag, dot);
    } else {
      const pin = document.createElementNS(ns, 'path');
      pin.setAttribute('d', 'M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z');
      const circle = document.createElementNS(ns, 'circle');
      circle.setAttribute('cx', '12');
      circle.setAttribute('cy', '10');
      circle.setAttribute('r', '3');
      svg.append(pin, circle);
    }

    return svg;
  }

  /**
   * Build a metadata block item.
   */
  function createMetaItem(iconType, labelText, valueText, isFullWidth = false) {
    const wrapper = document.createElement('div');
    wrapper.className = isFullWidth ? 'meta-item meta-item--full' : 'meta-item';

    const icon = createMetaIcon(iconType);
    const content = document.createElement('div');
    content.className = 'meta-content';

    const label = document.createElement('dt');
    label.className = 'meta-label';
    label.textContent = labelText;

    const value = document.createElement('dd');
    value.className = 'meta-value';
    value.textContent = valueText;

    content.append(label, value);
    wrapper.append(icon, content);
    return wrapper;
  }

  /**
   * Persist selected event ID in localStorage and navigate to target sibling page.
   */
  function selectEventAndNavigate(eventId, targetPage) {
    try {
      localStorage.setItem(STORAGE_KEY, String(eventId));
    } catch (error) {
      // Proceed with navigation even if storage is restricted
    }
    window.location.href = targetPage;
  }

  /**
   * Map event status to CSS modifier class.
   */
  function getStatusModifier(status) {
    if (status === 'Filling Fast') return 'status-badge--filling-fast';
    if (status === 'Completed') return 'status-badge--completed';
    return 'status-badge--open';
  }

  /**
   * Build an <article> element for a single event.
   */
  function createEventCard(eventItem) {
    const isCompleted = eventItem.status === 'Completed';
    const rawPercent = eventItem.seatsTotal > 0 ? (eventItem.seatsTaken / eventItem.seatsTotal) * 100 : 0;
    const fillPercent = Math.min(100, Math.max(0, Math.round(rawPercent)));
    const seatsRemaining = Math.max(0, eventItem.seatsTotal - eventItem.seatsTaken);

    const card = document.createElement('article');
    card.className = isCompleted ? 'event-card is-completed' : 'event-card';
    card.dataset.eventId = eventItem.id;

    // Top row: category + status badges
    const cardTop = document.createElement('div');
    cardTop.className = 'card-top';

    const categoryBadge = document.createElement('span');
    categoryBadge.className = 'category-badge';
    categoryBadge.textContent = eventItem.category;

    const statusBadge = document.createElement('span');
    statusBadge.className = `status-badge ${getStatusModifier(eventItem.status)}`;

    const statusDot = document.createElement('span');
    statusDot.className = 'status-dot';
    statusDot.setAttribute('aria-hidden', 'true');

    statusBadge.append(statusDot, document.createTextNode(eventItem.status));
    cardTop.append(categoryBadge, statusBadge);

    // Body: title + summary
    const cardBody = document.createElement('div');
    cardBody.className = 'card-body';

    const title = document.createElement('h2');
    title.className = 'event-title';
    title.textContent = eventItem.title;

    const summary = document.createElement('p');
    summary.className = 'event-summary';
    summary.textContent = eventItem.summary;

    cardBody.append(title, summary);

    // Metadata list
    const metaList = document.createElement('dl');
    metaList.className = 'event-meta';
    metaList.append(
      createMetaItem('date', 'Date & Time', eventItem.date),
      createMetaItem('fee', 'Entry Fee', eventItem.fee),
      createMetaItem('venue', 'Venue', eventItem.venue, true)
    );

    // Seat availability progress bar
    const progressBlock = document.createElement('div');
    progressBlock.className = 'seat-progress-block';

    const progressHeader = document.createElement('div');
    progressHeader.className = 'seat-progress-header';

    const seatLabel = document.createElement('span');
    seatLabel.className = 'seat-label';
    seatLabel.textContent = isCompleted
      ? 'Capacity Reached'
      : `${seatsRemaining} ${seatsRemaining === 1 ? 'seat' : 'seats'} remaining`;

    const seatNumbers = document.createElement('span');
    seatNumbers.className = 'seat-numbers';
    seatNumbers.textContent = `${eventItem.seatsTaken} / ${eventItem.seatsTotal} (${fillPercent}%)`;

    progressHeader.append(seatLabel, seatNumbers);

    const progressTrack = document.createElement('div');
    progressTrack.className = 'progress-track';
    progressTrack.setAttribute('role', 'progressbar');
    progressTrack.setAttribute('aria-label', `${eventItem.title} seat availability`);
    progressTrack.setAttribute('aria-valuemin', '0');
    progressTrack.setAttribute('aria-valuemax', '100');
    progressTrack.setAttribute('aria-valuenow', String(fillPercent));

    const progressFill = document.createElement('div');
    progressFill.className = 'progress-fill';
    progressFill.style.width = `${fillPercent}%`;

    progressTrack.append(progressFill);
    progressBlock.append(progressHeader, progressTrack);

    // Actions row
    const actions = document.createElement('div');
    actions.className = 'card-actions';

    const detailsBtn = document.createElement('button');
    detailsBtn.type = 'button';
    detailsBtn.className = 'btn btn-secondary';
    detailsBtn.textContent = 'Event Details';
    detailsBtn.addEventListener('click', () => {
      selectEventAndNavigate(eventItem.id, 'event-details.html');
    });

    const registerBtn = document.createElement('button');
    registerBtn.type = 'button';
    registerBtn.className = 'btn btn-primary';
    registerBtn.textContent = 'Register Now';

    if (isCompleted) {
      registerBtn.disabled = true;
      registerBtn.setAttribute('aria-disabled', 'true');
      registerBtn.setAttribute('title', 'Registration closed — this event is completed');
      registerBtn.setAttribute(
        'aria-label',
        `Register Now disabled for ${eventItem.title} because the event is completed`
      );
    } else {
      registerBtn.addEventListener('click', () => {
        selectEventAndNavigate(eventItem.id, 'event-register.html');
      });
    }

    actions.append(detailsBtn, registerBtn);

    card.append(cardTop, cardBody, metaList, progressBlock, actions);
    return card;
  }

  /**
   * Filter events by active category and live search query.
   */
  function getFilteredEvents() {
    const query = state.searchQuery.trim().toLowerCase();

    return eventsData.filter((eventItem) => {
      const matchesCategory =
        state.activeCategory === 'All' || eventItem.category === state.activeCategory;

      if (!matchesCategory) return false;
      if (!query) return true;

      const searchableText = [
        eventItem.title,
        eventItem.category,
        eventItem.venue,
        eventItem.date,
        eventItem.status,
        eventItem.summary
      ]
        .join(' ')
        .toLowerCase();

      return searchableText.includes(query);
    });
  }

  /**
   * Render filtered event cards or empty state.
   */
  function renderEvents() {
    const eventsGrid = document.getElementById('events-grid');
    const emptyState = document.getElementById('empty-state');
    const emptyMessage = document.getElementById('empty-message');
    const resultsCount = document.getElementById('results-count');

    if (!eventsGrid || !emptyState || !resultsCount) return;

    const filtered = getFilteredEvents();
    const total = eventsData.length;

    eventsGrid.replaceChildren();

    resultsCount.textContent =
      filtered.length === total
        ? `Showing ${total} of ${total} events`
        : `Showing ${filtered.length} of ${total} ${total === 1 ? 'event' : 'events'}`;

    if (filtered.length === 0) {
      eventsGrid.hidden = true;
      emptyState.hidden = false;

      if (emptyMessage) {
        const trimmed = state.searchQuery.trim();
        if (trimmed && state.activeCategory !== 'All') {
          emptyMessage.textContent = `No events matched "${trimmed}" in ${state.activeCategory}. Clear your search or reset all filters.`;
        } else if (trimmed) {
          emptyMessage.textContent = `No events matched "${trimmed}". Try a different keyword or reset all filters.`;
        } else {
          emptyMessage.textContent = `No events are currently listed under ${state.activeCategory}. Reset filters to view all society events.`;
        }
      }
      return;
    }

    emptyState.hidden = true;
    eventsGrid.hidden = false;

    const fragment = document.createDocumentFragment();
    filtered.forEach((eventItem) => {
      fragment.appendChild(createEventCard(eventItem));
    });
    eventsGrid.appendChild(fragment);
  }

  /**
   * Wire search input, clear button, category filter buttons, and reset filters action.
   */
  function initFilters() {
    const searchInput = document.getElementById('event-search');
    const clearSearchBtn = document.getElementById('clear-search');
    const filterButtons = document.querySelectorAll('.filter-btn');
    const resetFiltersBtn = document.getElementById('reset-filters-btn');

    const syncClearButton = () => {
      if (!clearSearchBtn || !searchInput) return;
      clearSearchBtn.hidden = searchInput.value.trim().length === 0;
    };

    const syncCategoryButtons = () => {
      filterButtons.forEach((btn) => {
        const isSelected = btn.dataset.category === state.activeCategory;
        btn.classList.toggle('is-active', isSelected);
        btn.setAttribute('aria-pressed', String(isSelected));
      });
    };

    if (searchInput) {
      searchInput.addEventListener('input', () => {
        state.searchQuery = searchInput.value;
        syncClearButton();
        renderEvents();
      });
    }

    if (clearSearchBtn && searchInput) {
      clearSearchBtn.addEventListener('click', () => {
        searchInput.value = '';
        state.searchQuery = '';
        syncClearButton();
        renderEvents();
        searchInput.focus();
      });
    }

    filterButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const category = btn.dataset.category || 'All';
        state.activeCategory = category;
        syncCategoryButtons();
        renderEvents();
      });
    });

    if (resetFiltersBtn) {
      resetFiltersBtn.addEventListener('click', () => {
        state.searchQuery = '';
        state.activeCategory = 'All';
        if (searchInput) {
          searchInput.value = '';
        }
        syncClearButton();
        syncCategoryButtons();
        renderEvents();
        if (searchInput) {
          searchInput.focus();
        }
      });
    }

    syncClearButton();
    syncCategoryButtons();
  }

  /* ========================================================================
     Page 5: Event Details Loader, Tabs, Switcher & Accordion
     ======================================================================== */

  /**
   * Resolve stored event ID (handling legacy alias and safe default).
   */
  function resolveEventById(rawId) {
    const normalized = rawId === 'ncs-coderush-2026' ? DEFAULT_EVENT_ID : rawId;
    return (
      eventsData.find((item) => item.id === normalized) ||
      eventsData.find((item) => item.id === DEFAULT_EVENT_ID) ||
      eventsData[0]
    );
  }

  /**
   * Read saved event ID from localStorage, defaulting to coderush-2026.
   */
  function getStoredEventId() {
    try {
      return localStorage.getItem(STORAGE_KEY) || DEFAULT_EVENT_ID;
    } catch (error) {
      return DEFAULT_EVENT_ID;
    }
  }

  /**
   * Save active event ID to localStorage safely.
   */
  function saveSelectedEventId(eventId) {
    try {
      localStorage.setItem(STORAGE_KEY, String(eventId));
    } catch (error) {
      // Ignore storage errors in restricted environments
    }
  }

  /**
   * Populate the Event Timeline, Rules & Eligibility, and Speakers & Judges tabs.
   */
  function renderDetailsTabsContent(eventItem) {
    const timelineList = document.getElementById('timeline-list');
    const rulesList = document.getElementById('rules-list');
    const speakersGrid = document.getElementById('speakers-grid');

    if (timelineList) {
      timelineList.replaceChildren();
      eventItem.timeline.forEach((slot) => {
        const li = document.createElement('li');
        li.className = 'timeline-item';

        const timeEl = document.createElement('span');
        timeEl.className = 'timeline-time';
        timeEl.textContent = slot.time;

        const content = document.createElement('div');
        content.className = 'timeline-content';

        const heading = document.createElement('h3');
        heading.textContent = slot.title;

        const desc = document.createElement('p');
        desc.textContent = slot.description;

        content.append(heading, desc);
        li.append(timeEl, content);
        timelineList.appendChild(li);
      });
    }

    if (rulesList) {
      rulesList.replaceChildren();
      eventItem.rules.forEach((ruleText, index) => {
        const li = document.createElement('li');
        li.className = 'rule-item';

        const badge = document.createElement('span');
        badge.className = 'rule-number';
        badge.textContent = String(index + 1);

        const copy = document.createElement('span');
        copy.textContent = ruleText;

        li.append(badge, copy);
        rulesList.appendChild(li);
      });
    }

    if (speakersGrid) {
      speakersGrid.replaceChildren();
      eventItem.speakers.forEach((speaker) => {
        const card = document.createElement('article');
        card.className = 'speaker-card';

        const role = document.createElement('span');
        role.className = 'speaker-role';
        role.textContent = speaker.role;

        const name = document.createElement('h3');
        name.className = 'speaker-name';
        name.textContent = speaker.name;

        const org = document.createElement('p');
        org.className = 'speaker-org';
        org.textContent = speaker.org;

        const topic = document.createElement('p');
        topic.className = 'speaker-topic';
        topic.textContent = speaker.topic;

        card.append(role, name, org, topic);
        speakersGrid.appendChild(card);
      });
    }
  }

  /**
   * Build chevron SVG for FAQ accordion buttons.
   */
  function createAccordionChevron() {
    const ns = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('class', 'accordion-icon');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('fill', 'none');
    svg.setAttribute('stroke', 'currentColor');
    svg.setAttribute('stroke-width', '2');
    svg.setAttribute('stroke-linecap', 'round');
    svg.setAttribute('stroke-linejoin', 'round');
    svg.setAttribute('aria-hidden', 'true');

    const polyline = document.createElementNS(ns, 'polyline');
    polyline.setAttribute('points', '6 9 12 15 18 9');
    svg.appendChild(polyline);
    return svg;
  }

  /**
   * Render collapsible FAQ / Guidelines accordion for the selected event.
   */
  function renderFaqAccordion(eventItem) {
    const accordionContainer = document.getElementById('faq-accordion');
    if (!accordionContainer) return;

    accordionContainer.replaceChildren();

    eventItem.faqs.forEach((faq, index) => {
      const item = document.createElement('article');
      item.className = index === 0 ? 'accordion-item is-open' : 'accordion-item';

      const triggerId = `faq-trigger-${index}`;
      const panelId = `faq-panel-${index}`;

      const trigger = document.createElement('button');
      trigger.type = 'button';
      trigger.id = triggerId;
      trigger.className = 'accordion-trigger';
      trigger.setAttribute('aria-expanded', index === 0 ? 'true' : 'false');
      trigger.setAttribute('aria-controls', panelId);

      const questionSpan = document.createElement('span');
      questionSpan.textContent = faq.question;

      trigger.append(questionSpan, createAccordionChevron());

      const panel = document.createElement('div');
      panel.id = panelId;
      panel.className = 'accordion-panel';
      panel.setAttribute('role', 'region');
      panel.setAttribute('aria-labelledby', triggerId);
      panel.hidden = index !== 0;

      const answer = document.createElement('p');
      answer.textContent = faq.answer;
      panel.appendChild(answer);

      trigger.addEventListener('click', () => {
        const isExpanded = trigger.getAttribute('aria-expanded') === 'true';
        const nextExpanded = !isExpanded;
        trigger.setAttribute('aria-expanded', String(nextExpanded));
        panel.hidden = !nextExpanded;
        item.classList.toggle('is-open', nextExpanded);
      });

      item.append(trigger, panel);
      accordionContainer.appendChild(item);
    });
  }

  /**
   * Render full event details onto pages/event-details.html.
   */
  function renderEventDetails(eventItem) {
    const titleEl = document.getElementById('detail-title');
    if (!titleEl) return;

    const categoryEl = document.getElementById('detail-category');
    const statusEl = document.getElementById('detail-status');
    const summaryEl = document.getElementById('detail-summary');
    const wingEl = document.getElementById('detail-wing');
    const dateEl = document.getElementById('detail-date');
    const venueEl = document.getElementById('detail-venue');
    const prizeEl = document.getElementById('detail-prize');
    const feeEl = document.getElementById('detail-fee');
    const remainingEl = document.getElementById('detail-seats-remaining');
    const seatsSummaryEl = document.getElementById('detail-seats-summary');
    const progressTrackEl = document.getElementById('detail-progress-track');
    const progressFillEl = document.getElementById('detail-progress-fill');
    const panelNoteEl = document.getElementById('detail-panel-note');
    const proceedBtn = document.getElementById('proceed-register-btn');

    const isCompleted = eventItem.status === 'Completed';
    const remainingSeats = Math.max(0, eventItem.seatsTotal - eventItem.seatsTaken);
    const rawPercent = eventItem.seatsTotal > 0 ? (eventItem.seatsTaken / eventItem.seatsTotal) * 100 : 0;
    const fillPercent = Math.min(100, Math.max(0, Math.round(rawPercent)));

    document.title = `${eventItem.title} | Nexus Computing Society`;

    titleEl.textContent = eventItem.title;
    if (categoryEl) categoryEl.textContent = eventItem.category;
    if (summaryEl) summaryEl.textContent = eventItem.summary;
    if (wingEl) wingEl.textContent = eventItem.hostingWing;
    if (dateEl) dateEl.textContent = eventItem.date;
    if (venueEl) venueEl.textContent = eventItem.venue;
    if (prizeEl) prizeEl.textContent = eventItem.prizePool;
    if (feeEl) feeEl.textContent = eventItem.fee;

    if (remainingEl) {
      remainingEl.textContent = isCompleted
        ? `0 of ${eventItem.seatsTotal} (Full)`
        : `${remainingSeats} of ${eventItem.seatsTotal} seats`;
    }

    if (statusEl) {
      statusEl.className = `status-badge ${getStatusModifier(eventItem.status)}`;
      const dot = document.createElement('span');
      dot.className = 'status-dot';
      dot.setAttribute('aria-hidden', 'true');
      statusEl.replaceChildren(dot, document.createTextNode(eventItem.status));
    }

    if (seatsSummaryEl) {
      seatsSummaryEl.textContent = `${eventItem.seatsTaken} / ${eventItem.seatsTotal} (${fillPercent}%)`;
    }

    if (progressTrackEl) {
      progressTrackEl.setAttribute('aria-valuenow', String(fillPercent));
    }

    if (progressFillEl) {
      progressFillEl.style.width = `${fillPercent}%`;
      progressFillEl.style.background = isCompleted ? 'var(--text-secondary)' : '';
    }

    if (panelNoteEl) {
      panelNoteEl.textContent = isCompleted
        ? 'This event has already concluded and registration is now closed.'
        : eventItem.status === 'Filling Fast'
          ? `Only ${remainingSeats} seats left — secure your registration before capacity closes.`
          : 'Seats are allocated on a first-come, verified student ID basis.';
    }

    if (proceedBtn) {
      proceedBtn.dataset.eventId = eventItem.id;
      if (isCompleted) {
        proceedBtn.disabled = true;
        proceedBtn.setAttribute('aria-disabled', 'true');
        proceedBtn.textContent = 'Registration Closed (Completed)';
      } else {
        proceedBtn.disabled = false;
        proceedBtn.removeAttribute('aria-disabled');
        proceedBtn.textContent = 'Proceed to Registration';
      }
    }

    renderDetailsTabsContent(eventItem);
    renderFaqAccordion(eventItem);
  }

  /**
   * Wire accessible tabs for Event Timeline, Rules & Eligibility, and Speakers & Judges.
   */
  function initDetailsTabs() {
    const tabList = document.querySelector('.tab-list');
    const tabButtons = Array.from(document.querySelectorAll('.tab-btn'));
    const tabPanels = Array.from(document.querySelectorAll('.tab-panel'));

    if (!tabList || tabButtons.length === 0 || tabPanels.length === 0) return;

    const activateTab = (targetBtn, focusTab = false) => {
      const targetControls = targetBtn.getAttribute('aria-controls');

      tabButtons.forEach((btn) => {
        const isSelected = btn === targetBtn;
        btn.classList.toggle('is-active', isSelected);
        btn.setAttribute('aria-selected', String(isSelected));
        btn.setAttribute('tabindex', isSelected ? '0' : '-1');
      });

      tabPanels.forEach((panel) => {
        const matches = panel.id === targetControls;
        panel.hidden = !matches;
        panel.classList.toggle('is-active', matches);
      });

      if (focusTab) {
        targetBtn.focus();
      }
    };

    tabButtons.forEach((btn, index) => {
      btn.addEventListener('click', () => activateTab(btn));

      btn.addEventListener('keydown', (event) => {
        if (event.key === 'ArrowRight') {
          event.preventDefault();
          const next = tabButtons[(index + 1) % tabButtons.length];
          activateTab(next, true);
        } else if (event.key === 'ArrowLeft') {
          event.preventDefault();
          const prev = tabButtons[(index - 1 + tabButtons.length) % tabButtons.length];
          activateTab(prev, true);
        } else if (event.key === 'Home') {
          event.preventDefault();
          activateTab(tabButtons[0], true);
        } else if (event.key === 'End') {
          event.preventDefault();
          activateTab(tabButtons[tabButtons.length - 1], true);
        }
      });
    });
  }

  /**
   * Initialize Page 5 (event-details.html) controls and localStorage state.
   */
  function initEventDetailsPage() {
    const switcher = document.getElementById('event-switcher');
    const proceedBtn = document.getElementById('proceed-register-btn');
    const detailTitle = document.getElementById('detail-title');

    if (!detailTitle) return;

    let currentEvent = resolveEventById(getStoredEventId());
    saveSelectedEventId(currentEvent.id);

    if (switcher) {
      switcher.replaceChildren();
      eventsData.forEach((eventItem) => {
        const option = document.createElement('option');
        option.value = eventItem.id;
        option.textContent = `${eventItem.title} (${eventItem.status})`;
        switcher.appendChild(option);
      });
      switcher.value = currentEvent.id;

      switcher.addEventListener('change', () => {
        currentEvent = resolveEventById(switcher.value);
        saveSelectedEventId(currentEvent.id);
        renderEventDetails(currentEvent);
      });
    }

    if (proceedBtn) {
      proceedBtn.addEventListener('click', () => {
        if (currentEvent.status === 'Completed') return;
        selectEventAndNavigate(currentEvent.id, 'event-register.html');
      });
    }

    initDetailsTabs();
    renderEventDetails(currentEvent);
  }

  document.addEventListener('DOMContentLoaded', () => {
    initLogoFallback();
    initMobileNav();
    renderHeroStats();
    initFilters();
    renderEvents();
    initEventDetailsPage();
  });
})();
