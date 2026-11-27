/**
 * Nexus Computing Society — Campus Info & Announcements Interactivity
 * Pure Vanilla JavaScript (no external dependencies)
 */

(function () {
  "use strict";

  const STORAGE_KEY = "ncs_read_announcements";
  const FALLBACK_LOGO_PATH = "../images/logo.jpg";

  /**
   * 5 realistic society announcements covering Urgent, Hackathons, Recruitment, and General.
   */
  const ANNOUNCEMENTS = [
    {
      id: "ncs-2026-01",
      title: "Lab Server Maintenance & Git Mirror Downtime This Friday",
      category: "Urgent",
      date: "2026-11-26",
      author: "Zainab Tariq · VP Infrastructure",
      pinned: true,
      body: "The Computing Innovation Lab (Block C-304) compute cluster and local Git mirror will undergo mandatory UPS firmware upgrades on Friday from 18:00 to 22:00. Please push active branch commits and back up temporary container volumes before 17:30."
    },
    {
      id: "ncs-2026-02",
      title: "NexusHack '26 Team Registration & Problem Tracks Released",
      category: "Hackathons",
      date: "2026-11-25",
      author: "Hamza Siddiqui · Hackathon Lead",
      pinned: true,
      body: "Registration is now open for our flagship 36-hour campus hackathon on December 12–13. Teams of 2 to 4 students can compete across FinTech, Civic AI, and Sustainable Campus tracks. Early-bird team slots close on December 4 at 23:59."
    },
    {
      id: "ncs-2026-03",
      title: "Spring Semester Executive & Technical Wing Recruitment",
      category: "Recruitment",
      date: "2026-11-22",
      author: "Ayesha Khan · President, NCS",
      pinned: false,
      body: "Applications are open for Web Engineering, Systems & Cloud, UI/UX Design, and Event Operations leads for the Spring 2027 term. Shortlisted candidates will be invited for a 15-minute portfolio walkthrough next week."
    },
    {
      id: "ncs-2026-04",
      title: "Inter-University Competitive Programming Qualifier Practice",
      category: "Hackathons",
      date: "2026-11-19",
      author: "Bilal Ahmed · Algorithms SIG Chair",
      pinned: false,
      body: "Join our weekly problem-solving clinic in Seminar Hall B this Wednesday at 15:30. We will walk through dynamic programming on trees, graph shortest-path optimizations, and timed mock sets ahead of the regional qualifiers."
    },
    {
      id: "ncs-2026-05",
      title: "Updated Open-Source Study Lounge Hours & Peer Mentoring",
      category: "General",
      date: "2026-11-15",
      author: "Mariam Raza · General Secretary",
      pinned: false,
      body: "The NCS peer mentoring desk in Room 304 now operates Monday through Thursday from 11:00 to 16:30. Drop in for help with data structures, Git workflows, Linux setup, or semester project code reviews."
    }
  ];

  const state = {
    searchQuery: "",
    activeCategory: "All",
    readIds: loadReadIds()
  };

  /**
   * Loads persisted read announcement IDs from localStorage.
   * @returns {string[]}
   */
  function loadReadIds() {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        return [];
      }
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) {
        return [];
      }
      const validIds = new Set(ANNOUNCEMENTS.map((item) => item.id));
      return parsed.filter((id) => typeof id === "string" && validIds.has(id));
    } catch (error) {
      return [];
    }
  }

  /**
   * Saves the array of read announcement IDs to localStorage.
   * @param {string[]} readIds
   */
  function saveReadIds(readIds) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(readIds));
    } catch (error) {
      // Ignore storage quota or privacy-mode errors gracefully
    }
  }

  /**
   * Ensures brand logos fall back cleanly to ../images/logo.jpg if logo.png is unavailable.
   */
  function initLogoFallback() {
    const logos = document.querySelectorAll(".brand-logo");
    logos.forEach((img) => {
      const applyFallback = () => {
        if (img.dataset.fallbackApplied === "true") {
          return;
        }
        img.dataset.fallbackApplied = "true";
        img.src = FALLBACK_LOGO_PATH;
      };

      img.addEventListener("error", applyFallback);
      if (img.complete && img.naturalWidth === 0) {
        applyFallback();
      }
    });
  }

  /**
   * Initializes the accessible mobile hamburger navigation toggle.
   */
  function initMobileNav() {
    const toggleBtn = document.getElementById("nav-toggle");
    const nav = document.getElementById("primary-navigation");
    if (!toggleBtn || !nav) {
      return;
    }

    const setMenuOpen = (isOpen) => {
      toggleBtn.setAttribute("aria-expanded", String(isOpen));
      nav.classList.toggle("is-open", isOpen);
    };

    toggleBtn.addEventListener("click", () => {
      const currentlyOpen = toggleBtn.getAttribute("aria-expanded") === "true";
      setMenuOpen(!currentlyOpen);
    });

    nav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        if (window.innerWidth < 1024) {
          setMenuOpen(false);
        }
      });
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && toggleBtn.getAttribute("aria-expanded") === "true") {
        setMenuOpen(false);
        toggleBtn.focus();
      }
    });

    document.addEventListener("click", (event) => {
      if (
        window.innerWidth < 1024 &&
        nav.classList.contains("is-open") &&
        !nav.contains(event.target) &&
        !toggleBtn.contains(event.target)
      ) {
        setMenuOpen(false);
      }
    });
  }

  /**
   * Formats ISO date strings (YYYY-MM-DD) into readable campus dates.
   * @param {string} isoDate
   * @returns {string}
   */
  function formatDate(isoDate) {
    const parsed = new Date(isoDate + "T00:00:00");
    if (Number.isNaN(parsed.getTime())) {
      return isoDate;
    }
    return parsed.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  }

  /**
   * Filters announcements by category and search query, keeping pinned notices first.
   * @returns {Array}
   */
  function getVisibleAnnouncements() {
    const query = state.searchQuery.trim().toLowerCase();

    return ANNOUNCEMENTS
      .filter((item) => {
        const matchesCategory =
          state.activeCategory === "All" || item.category === state.activeCategory;
        if (!matchesCategory) {
          return false;
        }
        if (!query) {
          return true;
        }
        const searchable = [item.title, item.body, item.author, item.category]
          .join(" ")
          .toLowerCase();
        return searchable.includes(query);
      })
      .sort((a, b) => {
        if (a.pinned !== b.pinned) {
          return a.pinned ? -1 : 1;
        }
        return b.date.localeCompare(a.date);
      });
  }

  /**
   * Creates a DOM <article> element for a single announcement.
   * @param {Object} item
   * @param {boolean} isRead
   * @returns {HTMLElement}
   */
  function createAnnouncementCard(item, isRead) {
    const article = document.createElement("article");
    article.className = [
      "announcement-card",
      isRead ? "is-read" : "is-unread",
      item.pinned ? "is-pinned" : ""
    ]
      .filter(Boolean)
      .join(" ");
    article.dataset.id = item.id;

    // Header row: badges + read indicator
    const cardHeader = document.createElement("div");
    cardHeader.className = "card-header";

    const badgesWrap = document.createElement("div");
    badgesWrap.className = "card-badges";

    if (item.pinned) {
      const pinnedBadge = document.createElement("span");
      pinnedBadge.className = "pinned-badge";
      pinnedBadge.textContent = "PINNED";
      badgesWrap.appendChild(pinnedBadge);
    }

    const categoryBadge = document.createElement("span");
    categoryBadge.className = "category-badge";
    categoryBadge.dataset.category = item.category;
    categoryBadge.textContent = item.category;
    badgesWrap.appendChild(categoryBadge);

    const statusPill = document.createElement("span");
    statusPill.className = "read-status-pill";
    const statusDot = document.createElement("span");
    statusDot.className = "read-status-dot";
    statusDot.setAttribute("aria-hidden", "true");
    const statusText = document.createElement("span");
    statusText.textContent = isRead ? "Read" : "Unread";
    statusPill.append(statusDot, statusText);

    cardHeader.append(badgesWrap, statusPill);

    // Title & Body
    const titleEl = document.createElement("h3");
    titleEl.className = "card-title";
    titleEl.textContent = item.title;

    const bodyEl = document.createElement("p");
    bodyEl.className = "card-body";
    bodyEl.textContent = item.body;

    // Footer row: date/author + read toggle button
    const cardFooter = document.createElement("div");
    cardFooter.className = "card-footer";

    const metaWrap = document.createElement("div");
    metaWrap.className = "card-meta";

    const dateItem = document.createElement("span");
    dateItem.className = "card-meta-item";
    const dateLabel = document.createElement("strong");
    dateLabel.textContent = "Posted:";
    const timeEl = document.createElement("time");
    timeEl.dateTime = item.date;
    timeEl.textContent = formatDate(item.date);
    dateItem.append(dateLabel, document.createTextNode(" "), timeEl);

    const authorItem = document.createElement("span");
    authorItem.className = "card-meta-item";
    const authorLabel = document.createElement("strong");
    authorLabel.textContent = "By:";
    authorItem.append(authorLabel, document.createTextNode(" " + item.author));

    metaWrap.append(dateItem, authorItem);

    const toggleBtn = document.createElement("button");
    toggleBtn.type = "button";
    toggleBtn.className = "toggle-read-btn";
    toggleBtn.dataset.action = "toggle-read";
    toggleBtn.dataset.id = item.id;
    toggleBtn.textContent = isRead ? "Mark as Unread" : "Mark as Read";
    toggleBtn.setAttribute(
      "aria-label",
      (isRead ? "Mark as unread: " : "Mark as read: ") + item.title
    );

    cardFooter.append(metaWrap, toggleBtn);
    article.append(cardHeader, titleEl, bodyEl, cardFooter);

    return article;
  }

  /**
   * Initializes the Announcements feed, filters, unread badge, and localStorage persistence.
   */
  function initAnnouncementsPage() {
    const feedEl = document.getElementById("announcements-feed");
    const emptyStateEl = document.getElementById("empty-state");
    const searchInput = document.getElementById("announcement-search");
    const searchClearBtn = document.getElementById("search-clear-btn");
    const filterButtons = document.querySelectorAll(".filter-btn");
    const resetFiltersBtn = document.getElementById("reset-filters-btn");
    const markAllReadBtn = document.getElementById("mark-all-read-btn");
    const unreadBadgeEl = document.getElementById("unread-counter-badge");
    const unreadNumberEl = document.getElementById("unread-count-number");
    const unreadLabelEl = document.getElementById("unread-count-label");
    const metaStatusEl = document.getElementById("feed-meta-status");

    if (!feedEl) {
      return;
    }

    const updateUnreadSummary = () => {
      const readSet = new Set(state.readIds);
      const unreadCount = ANNOUNCEMENTS.filter((item) => !readSet.has(item.id)).length;

      if (unreadNumberEl) {
        unreadNumberEl.textContent = String(unreadCount);
      }
      if (unreadLabelEl) {
        unreadLabelEl.textContent =
          unreadCount === 1 ? "Unread Notice" : "Unread Notices";
      }
      if (unreadBadgeEl) {
        unreadBadgeEl.classList.toggle("has-unread", unreadCount > 0);
      }
      if (markAllReadBtn) {
        markAllReadBtn.disabled = unreadCount === 0;
        markAllReadBtn.textContent =
          unreadCount === 0 ? "All Notices Read" : "Mark All as Read";
      }
    };

    const renderFeed = () => {
      const visible = getVisibleAnnouncements();
      const readSet = new Set(state.readIds);

      feedEl.replaceChildren();
      visible.forEach((item) => {
        feedEl.appendChild(createAnnouncementCard(item, readSet.has(item.id)));
      });

      const hasResults = visible.length > 0;
      if (emptyStateEl) {
        emptyStateEl.hidden = hasResults;
      }

      if (metaStatusEl) {
        const categoryText =
          state.activeCategory === "All"
            ? "all categories"
            : state.activeCategory + " category";
        const searchText = state.searchQuery.trim()
          ? ' matching "' + state.searchQuery.trim() + '"'
          : "";
        metaStatusEl.textContent =
          "Showing " +
          visible.length +
          " of " +
          ANNOUNCEMENTS.length +
          " notices in " +
          categoryText +
          searchText;
      }

      if (searchClearBtn) {
        searchClearBtn.hidden = state.searchQuery.length === 0;
      }

      updateUnreadSummary();
    };

    const toggleReadState = (id) => {
      const idx = state.readIds.indexOf(id);
      if (idx === -1) {
        state.readIds.push(id);
      } else {
        state.readIds.splice(idx, 1);
      }
      saveReadIds(state.readIds);
      renderFeed();
    };

    const markAllAsRead = () => {
      state.readIds = ANNOUNCEMENTS.map((item) => item.id);
      saveReadIds(state.readIds);
      renderFeed();
    };

    const resetFilters = () => {
      state.searchQuery = "";
      state.activeCategory = "All";
      if (searchInput) {
        searchInput.value = "";
      }
      filterButtons.forEach((btn) => {
        const isAll = btn.dataset.category === "All";
        btn.classList.toggle("is-active", isAll);
        btn.setAttribute("aria-pressed", String(isAll));
      });
      renderFeed();
      if (searchInput) {
        searchInput.focus();
      }
    };

    // Event Delegation for card "Mark as Read / Unread" buttons
    feedEl.addEventListener("click", (event) => {
      const btn = event.target.closest('button[data-action="toggle-read"]');
      if (!btn || !btn.dataset.id) {
        return;
      }
      toggleReadState(btn.dataset.id);
    });

    if (searchInput) {
      searchInput.addEventListener("input", (event) => {
        state.searchQuery = event.target.value;
        renderFeed();
      });
    }

    if (searchClearBtn) {
      searchClearBtn.addEventListener("click", () => {
        state.searchQuery = "";
        if (searchInput) {
          searchInput.value = "";
          searchInput.focus();
        }
        renderFeed();
      });
    }

    filterButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        state.activeCategory = btn.dataset.category || "All";
        filterButtons.forEach((otherBtn) => {
          const isSelected = otherBtn === btn;
          otherBtn.classList.toggle("is-active", isSelected);
          otherBtn.setAttribute("aria-pressed", String(isSelected));
        });
        renderFeed();
      });
    });

    if (markAllReadBtn) {
      markAllReadBtn.addEventListener("click", markAllAsRead);
    }

    if (resetFiltersBtn) {
      resetFiltersBtn.addEventListener("click", resetFilters);
    }

    renderFeed();
  }

  document.addEventListener("DOMContentLoaded", () => {
    initLogoFallback();
    initMobileNav();
    initAnnouncementsPage();
    initGalleryPage();
  });

  /* ==========================================================================
     Page 14: Event Gallery, Category Filtering, Lightbox & Liked Persistence
     ========================================================================== */
  const GALLERY_STORAGE_KEY = "ncs_liked_gallery";

  const GALLERY_EVENTS = [
    {
      id: "gal-01",
      title: "CodeRush 24-Hour Hackathon",
      category: "Hackathons",
      date: "2026-10-18",
      attendeeBadge: "240+ Hackers",
      caption:
        "Forty-eight student teams shipped full-stack prototypes across FinTech, Civic AI, and Campus Sustainability during our flagship overnight sprint in Block C.",
      illustration: "coderush"
    },
    {
      id: "gal-02",
      title: "Generative AI & Neural Vision Bootcamp",
      category: "Workshops",
      date: "2026-10-29",
      attendeeBadge: "120 Builders",
      caption:
        "Hands-on lab covering transformer attention, LoRA fine-tuning, and real-time computer vision pipelines deployed on the department GPU cluster.",
      illustration: "neural-vision"
    },
    {
      id: "gal-03",
      title: "Nexus Orientation & Freshmen Welcome",
      category: "Team & Campus",
      date: "2026-09-14",
      attendeeBadge: "350+ Freshmen",
      caption:
        "Incoming computing students explored special interest groups, met executive mentors, and joined live Git & Linux onboarding booths at the Main Auditorium.",
      illustration: "orientation"
    },
    {
      id: "gal-04",
      title: "National ICPC Regional Qualifiers",
      category: "Hackathons",
      date: "2026-11-06",
      attendeeBadge: "45 Teams",
      caption:
        "Three Nexus competitive programming squads placed in the top ten during the five-hour algorithmic contest tackling dynamic programming and graph problems.",
      illustration: "icpc"
    },
    {
      id: "gal-05",
      title: "RedTeam CTF Live Arena",
      category: "Workshops",
      date: "2026-11-14",
      attendeeBadge: "95 Participants",
      caption:
        "Interactive cybersecurity clinic featuring binary exploitation, web privilege escalation, and network forensics challenges in an isolated sandbox.",
      illustration: "redteam-ctf"
    },
    {
      id: "gal-06",
      title: "Autonomous Rover & Drone Showcase",
      category: "Team & Campus",
      date: "2026-11-21",
      attendeeBadge: "180+ Visitors",
      caption:
        "Embedded systems and robotics members demonstrated ROS2 SLAM navigation rovers and autonomous waypoint drones across the Central Quadrangle.",
      illustration: "robotics"
    }
  ];

  /**
   * Returns a clean inline SVG tech illustration for a gallery event highlight.
   * Uses solid fills and strokes without duplicate gradient IDs so card and modal render cleanly together.
   * @param {string} key
   * @param {string} title
   * @returns {string}
   */
  function buildGallerySvg(key, title) {
    const svgStart =
      '<svg viewBox="0 0 640 400" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="' +
      escapeHtmlAttr(title) +
      '">';

    const gridBg =
      '<rect width="640" height="400" fill="#090A0F"/>' +
      '<g stroke="#1E293B" stroke-width="1">' +
      '<line x1="0" y1="80" x2="640" y2="80"/>' +
      '<line x1="0" y1="160" x2="640" y2="160"/>' +
      '<line x1="0" y1="240" x2="640" y2="240"/>' +
      '<line x1="0" y1="320" x2="640" y2="320"/>' +
      '<line x1="128" y1="0" x2="128" y2="400"/>' +
      '<line x1="256" y1="0" x2="256" y2="400"/>' +
      '<line x1="384" y1="0" x2="384" y2="400"/>' +
      '<line x1="512" y1="0" x2="512" y2="400"/>' +
      "</g>";

    if (key === "coderush") {
      return (
        svgStart +
        gridBg +
        '<circle cx="530" cy="84" r="92" fill="#84CC16" opacity="0.12"/>' +
        '<rect x="52" y="54" width="380" height="270" rx="14" fill="#111827" stroke="#334155" stroke-width="2"/>' +
        '<rect x="52" y="54" width="380" height="36" rx="14" fill="#1E293B"/>' +
        '<circle cx="76" cy="72" r="5" fill="#F87171"/>' +
        '<circle cx="94" cy="72" r="5" fill="#FBBF24"/>' +
        '<circle cx="112" cy="72" r="5" fill="#84CC16"/>' +
        '<text x="136" y="77" fill="#94A3B8" font-family="monospace" font-size="12">coderush-sprint.ts</text>' +
        '<rect x="78" y="114" width="120" height="10" rx="5" fill="#84CC16"/>' +
        '<rect x="208" y="114" width="84" height="10" rx="5" fill="#38BDF8"/>' +
        '<rect x="98" y="140" width="170" height="10" rx="5" fill="#475569"/>' +
        '<rect x="98" y="166" width="240" height="10" rx="5" fill="#64748B"/>' +
        '<rect x="98" y="192" width="144" height="10" rx="5" fill="#A3E635"/>' +
        '<rect x="118" y="218" width="198" height="10" rx="5" fill="#334155"/>' +
        '<rect x="78" y="244" width="110" height="10" rx="5" fill="#84CC16"/>' +
        '<rect x="78" y="276" width="150" height="26" rx="6" fill="#1F2937" stroke="#84CC16" stroke-width="1.5"/>' +
        '<text x="93" y="294" fill="#A3E635" font-family="monospace" font-size="12" font-weight="700">BUILD PASS 24:00</text>' +
        '<rect x="456" y="90" width="136" height="110" rx="14" fill="#111827" stroke="#84CC16" stroke-width="2"/>' +
        '<text x="524" y="138" text-anchor="middle" fill="#A3E635" font-family="monospace" font-size="30" font-weight="800">24H</text>' +
        '<text x="524" y="166" text-anchor="middle" fill="#E2E8F0" font-family="sans-serif" font-size="12" font-weight="700">SPRINT MODE</text>' +
        '<path d="M474 236 L524 236 L524 282 L574 282" fill="none" stroke="#84CC16" stroke-width="3" stroke-linecap="round"/>' +
        '<circle cx="474" cy="236" r="8" fill="#84CC16"/>' +
        '<circle cx="524" cy="259" r="7" fill="#38BDF8"/>' +
        '<circle cx="574" cy="282" r="8" fill="#A3E635"/>' +
        '<text x="52" y="362" fill="#94A3B8" font-family="monospace" font-size="13">NEXUS COMPUTING SOCIETY // HACKATHON ARCHIVE</text>' +
        "</svg>"
      );
    }

    if (key === "neural-vision") {
      return (
        svgStart +
        gridBg +
        '<circle cx="195" cy="200" r="128" fill="#84CC16" opacity="0.08"/>' +
        '<g stroke="#334155" stroke-width="2">' +
        '<line x1="110" y1="110" x2="250" y2="95"/><line x1="110" y1="110" x2="250" y2="165"/><line x1="110" y1="110" x2="250" y2="235"/>' +
        '<line x1="110" y1="200" x2="250" y2="95"/><line x1="110" y1="200" x2="250" y2="165"/><line x1="110" y1="200" x2="250" y2="235"/><line x1="110" y1="200" x2="250" y2="305"/>' +
        '<line x1="110" y1="290" x2="250" y2="165"/><line x1="110" y1="290" x2="250" y2="235"/><line x1="110" y1="290" x2="250" y2="305"/>' +
        '<line x1="250" y1="95" x2="385" y2="150"/><line x1="250" y1="165" x2="385" y2="150"/><line x1="250" y1="235" x2="385" y2="250"/><line x1="250" y1="305" x2="385" y2="250"/>' +
        "</g>" +
        '<g stroke="#84CC16" stroke-width="2.5">' +
        '<line x1="110" y1="200" x2="250" y2="165"/>' +
        '<line x1="250" y1="165" x2="385" y2="150"/>' +
        '<line x1="250" y1="235" x2="385" y2="150"/>' +
        '<line x1="385" y1="150" x2="455" y2="200"/>' +
        "</g>" +
        '<circle cx="110" cy="110" r="14" fill="#1E293B" stroke="#38BDF8" stroke-width="3"/>' +
        '<circle cx="110" cy="200" r="14" fill="#84CC16"/>' +
        '<circle cx="110" cy="290" r="14" fill="#1E293B" stroke="#38BDF8" stroke-width="3"/>' +
        '<circle cx="250" cy="95" r="13" fill="#1E293B" stroke="#64748B" stroke-width="3"/>' +
        '<circle cx="250" cy="165" r="15" fill="#A3E635"/>' +
        '<circle cx="250" cy="235" r="13" fill="#1E293B" stroke="#84CC16" stroke-width="3"/>' +
        '<circle cx="250" cy="305" r="13" fill="#1E293B" stroke="#64748B" stroke-width="3"/>' +
        '<circle cx="385" cy="150" r="15" fill="#84CC16"/>' +
        '<circle cx="385" cy="250" r="14" fill="#1E293B" stroke="#38BDF8" stroke-width="3"/>' +
        '<rect x="445" y="96" width="148" height="208" rx="12" fill="#111827" stroke="#84CC16" stroke-width="2"/>' +
        '<rect x="466" y="122" width="106" height="90" rx="8" fill="#0F172A" stroke="#38BDF8" stroke-width="1.5" stroke-dasharray="5 4"/>' +
        '<circle cx="519" cy="167" r="24" fill="none" stroke="#A3E635" stroke-width="3"/>' +
        '<circle cx="519" cy="167" r="8" fill="#A3E635"/>' +
        '<rect x="466" y="228" width="106" height="12" rx="6" fill="#84CC16"/>' +
        '<rect x="466" y="252" width="76" height="10" rx="5" fill="#475569"/>' +
        '<text x="466" y="286" fill="#A3E635" font-family="monospace" font-size="12">CONF: 98.4%</text>' +
        '<text x="52" y="362" fill="#94A3B8" font-family="monospace" font-size="13">VISION TRANSFORMER &amp; LORA LAB // GPU CLUSTER</text>' +
        "</svg>"
      );
    }

    if (key === "orientation") {
      return (
        svgStart +
        gridBg +
        '<rect x="90" y="54" width="460" height="162" rx="14" fill="#111827" stroke="#84CC16" stroke-width="2"/>' +
        '<polygon points="150,98 182,116 182,152 150,170 118,152 118,116" fill="#84CC16"/>' +
        '<polygon points="150,114 168,124 168,144 150,154 132,144 132,124" fill="#090A0F"/>' +
        '<text x="206" y="128" fill="#FFFFFF" font-family="sans-serif" font-size="22" font-weight="800">NEXUS ORIENTATION</text>' +
        '<text x="206" y="154" fill="#A3E635" font-family="monospace" font-size="14" font-weight="700">WELCOME CLASS OF 2026 // 350+ FRESHMEN</text>' +
        '<rect x="206" y="172" width="110" height="22" rx="11" fill="#1E293B" stroke="#334155"/>' +
        '<text x="261" y="187" text-anchor="middle" fill="#E2E8F0" font-family="sans-serif" font-size="11" font-weight="700">AI &amp; ML SIG</text>' +
        '<rect x="328" y="172" width="116" height="22" rx="11" fill="#1E293B" stroke="#334155"/>' +
        '<text x="386" y="187" text-anchor="middle" fill="#E2E8F0" font-family="sans-serif" font-size="11" font-weight="700">SYSTEMS SIG</text>' +
        '<g fill="#1E293B" stroke="#84CC16" stroke-width="2">' +
        '<circle cx="150" cy="285" r="20"/><circle cx="235" cy="272" r="20"/><circle cx="320" cy="285" r="20"/>' +
        '<circle cx="405" cy="272" r="20"/><circle cx="490" cy="285" r="20"/>' +
        "</g>" +
        '<g fill="#A3E635">' +
        '<circle cx="150" cy="280" r="6"/><circle cx="235" cy="267" r="6"/><circle cx="320" cy="280" r="6"/>' +
        '<circle cx="405" cy="267" r="6"/><circle cx="490" cy="280" r="6"/>' +
        "</g>" +
        '<path d="M100 330 Q320 296 540 330" fill="none" stroke="#334155" stroke-width="3"/>' +
        '<text x="52" y="366" fill="#94A3B8" font-family="monospace" font-size="13">MAIN AUDITORIUM // CAMPUS ONBOARDING</text>' +
        "</svg>"
      );
    }

    if (key === "icpc") {
      return (
        svgStart +
        gridBg +
        '<rect x="52" y="56" width="276" height="266" rx="14" fill="#111827" stroke="#334155" stroke-width="2"/>' +
        '<text x="74" y="88" fill="#E2E8F0" font-family="monospace" font-size="14" font-weight="700">ICPC STANDINGS</text>' +
        '<rect x="74" y="106" width="232" height="38" rx="8" fill="#1E293B" stroke="#84CC16" stroke-width="1.5"/>' +
        '<text x="88" y="130" fill="#A3E635" font-family="monospace" font-size="13" font-weight="700">#01 NCS_VERTEX   8/8 AC</text>' +
        '<rect x="74" y="156" width="232" height="38" rx="8" fill="#1E293B"/>' +
        '<text x="88" y="180" fill="#E2E8F0" font-family="monospace" font-size="13">#04 NCS_LAMBDA   7/8 AC</text>' +
        '<rect x="74" y="206" width="232" height="38" rx="8" fill="#1E293B"/>' +
        '<text x="88" y="230" fill="#E2E8F0" font-family="monospace" font-size="13">#08 NCS_DIJKSTRA 6/8 AC</text>' +
        '<rect x="74" y="262" width="144" height="34" rx="8" fill="#84CC16"/>' +
        '<text x="146" y="284" text-anchor="middle" fill="#090A0F" font-family="monospace" font-size="13" font-weight="800">O(N log N)</text>' +
        '<rect x="352" y="56" width="236" height="266" rx="14" fill="#111827" stroke="#334155" stroke-width="2"/>' +
        '<line x1="395" y1="125" x2="470" y2="100" stroke="#84CC16" stroke-width="4"/>' +
        '<line x1="470" y1="100" x2="545" y2="175" stroke="#84CC16" stroke-width="4"/>' +
        '<line x1="395" y1="125" x2="415" y2="245" stroke="#334155" stroke-width="3"/>' +
        '<line x1="415" y1="245" x2="545" y2="175" stroke="#334155" stroke-width="3"/>' +
        '<line x1="470" y1="100" x2="495" y2="265" stroke="#334155" stroke-width="3"/>' +
        '<line x1="495" y1="265" x2="545" y2="175" stroke="#84CC16" stroke-width="4"/>' +
        '<circle cx="395" cy="125" r="16" fill="#84CC16"/>' +
        '<circle cx="470" cy="100" r="16" fill="#A3E635"/>' +
        '<circle cx="545" cy="175" r="16" fill="#84CC16"/>' +
        '<circle cx="415" cy="245" r="14" fill="#1E293B" stroke="#38BDF8" stroke-width="3"/>' +
        '<circle cx="495" cy="265" r="14" fill="#1E293B" stroke="#64748B" stroke-width="3"/>' +
        '<text x="52" y="362" fill="#94A3B8" font-family="monospace" font-size="13">REGIONAL QUALIFIERS // 45 UNIVERSITY SQUADS</text>' +
        "</svg>"
      );
    }

    if (key === "redteam-ctf") {
      return (
        svgStart +
        gridBg +
        '<circle cx="320" cy="190" r="126" fill="none" stroke="#1E293B" stroke-width="2"/>' +
        '<circle cx="320" cy="190" r="88" fill="none" stroke="#84CC16" stroke-width="2" stroke-dasharray="8 6"/>' +
        '<path d="M320 82 L404 116 L404 188 C404 244 366 286 320 306 C274 286 236 244 236 188 L236 116 Z" fill="#111827" stroke="#84CC16" stroke-width="3"/>' +
        '<rect x="302" y="142" width="6" height="96" rx="3" fill="#E2E8F0"/>' +
        '<polygon points="308,144 370,164 308,186" fill="#84CC16"/>' +
        '<rect x="52" y="78" width="152" height="92" rx="10" fill="#111827" stroke="#334155" stroke-width="2"/>' +
        '<text x="68" y="106" fill="#A3E635" font-family="monospace" font-size="11">$ nmap -sV lab</text>' +
        '<text x="68" y="128" fill="#94A3B8" font-family="monospace" font-size="11">PORT 443 OPEN</text>' +
        '<text x="68" y="150" fill="#38BDF8" font-family="monospace" font-size="11">TLS 1.3 VERIFIED</text>' +
        '<rect x="436" y="216" width="152" height="84" rx="10" fill="#111827" stroke="#84CC16" stroke-width="2"/>' +
        '<text x="452" y="248" fill="#94A3B8" font-family="monospace" font-size="11">CAPTURE VERIFIED</text>' +
        '<text x="452" y="274" fill="#A3E635" font-family="monospace" font-size="13" font-weight="700">FLAG{NCS_26}</text>' +
        '<text x="52" y="362" fill="#94A3B8" font-family="monospace" font-size="13">REDTEAM SANDBOX // OFFENSIVE SECURITY CLINIC</text>' +
        "</svg>"
      );
    }

    // Default: robotics ("Autonomous Rover & Drone Showcase")
    return (
      svgStart +
      gridBg +
      '<path d="M90 274 L210 218 L210 274" fill="#84CC16" opacity="0.18"/>' +
      '<path d="M210 274 L330 218" fill="none" stroke="#A3E635" stroke-width="2" stroke-dasharray="5 5"/>' +
      '<rect x="128" y="236" width="164" height="50" rx="10" fill="#111827" stroke="#84CC16" stroke-width="2.5"/>' +
      '<rect x="158" y="206" width="64" height="30" rx="6" fill="#1E293B" stroke="#38BDF8" stroke-width="2"/>' +
      '<circle cx="190" cy="221" r="7" fill="#A3E635"/>' +
      '<circle cx="154" cy="294" r="18" fill="#090A0F" stroke="#E2E8F0" stroke-width="4"/>' +
      '<circle cx="210" cy="294" r="18" fill="#090A0F" stroke="#E2E8F0" stroke-width="4"/>' +
      '<circle cx="266" cy="294" r="18" fill="#090A0F" stroke="#E2E8F0" stroke-width="4"/>' +
      '<line x1="396" y1="122" x2="544" y2="122" stroke="#94A3B8" stroke-width="4" stroke-linecap="round"/>' +
      '<rect x="372" y="108" width="48" height="8" rx="4" fill="#84CC16"/>' +
      '<rect x="520" y="108" width="48" height="8" rx="4" fill="#84CC16"/>' +
      '<rect x="444" y="114" width="52" height="28" rx="8" fill="#111827" stroke="#A3E635" stroke-width="2"/>' +
      '<circle cx="470" cy="128" r="6" fill="#38BDF8"/>' +
      '<rect x="392" y="208" width="188" height="104" rx="12" fill="#111827" stroke="#334155" stroke-width="2"/>' +
      '<text x="410" y="236" fill="#A3E635" font-family="monospace" font-size="12" font-weight="700">ROS2 SLAM TELEMETRY</text>' +
      '<polyline points="412,286 442,268 472,276 502,250 532,262 560,244" fill="none" stroke="#84CC16" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>' +
      '<text x="52" y="362" fill="#94A3B8" font-family="monospace" font-size="13">CENTRAL QUADRANGLE // ROBOTICS &amp; UAV SHOWCASE</text>' +
      "</svg>"
    );
  }

  /**
   * Escapes attribute strings used inside SVG markup.
   * @param {string} value
   * @returns {string}
   */
  function escapeHtmlAttr(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/"/g, "&quot;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  /**
   * Loads persisted liked gallery item IDs from localStorage under ncs_liked_gallery.
   * @returns {string[]}
   */
  function loadLikedGalleryIds() {
    try {
      const raw = window.localStorage.getItem(GALLERY_STORAGE_KEY);
      if (!raw) {
        return [];
      }
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) {
        return [];
      }
      const validIds = new Set(GALLERY_EVENTS.map((item) => item.id));
      return parsed.filter((id) => typeof id === "string" && validIds.has(id));
    } catch (error) {
      return [];
    }
  }

  /**
   * Persists liked gallery item IDs to localStorage under ncs_liked_gallery.
   * @param {string[]} likedIds
   */
  function saveLikedGalleryIds(likedIds) {
    try {
      window.localStorage.setItem(GALLERY_STORAGE_KEY, JSON.stringify(likedIds));
    } catch (error) {
      // Ignore storage quota or privacy-mode errors gracefully
    }
  }

  /**
   * Initializes Page 14 (Event Gallery): filtering, localStorage likes, and full-screen Lightbox Modal.
   */
  function initGalleryPage() {
    const galleryGrid = document.getElementById("gallery-grid");
    if (!galleryGrid) {
      return;
    }

    const filterButtons = document.querySelectorAll(".gallery-filter-btn");
    const countStatusEl = document.getElementById("gallery-count-status");
    const favoritesBadgeEl = document.getElementById("favorites-counter-badge");
    const favoritesNumberEl = document.getElementById("favorites-count-number");
    const favoritesLabelEl = document.getElementById("favorites-count-label");

    // Lightbox elements
    const lightboxEl = document.getElementById("gallery-lightbox");
    const lightboxCloseBtn = document.getElementById("lightbox-close-btn");
    const lightboxPrevBtn = document.getElementById("lightbox-prev-btn");
    const lightboxNextBtn = document.getElementById("lightbox-next-btn");
    const lightboxArtworkEl = document.getElementById("lightbox-artwork");
    const lightboxCategoryEl = document.getElementById("lightbox-category");
    const lightboxAttendeesEl = document.getElementById("lightbox-attendees");
    const lightboxPositionEl = document.getElementById("lightbox-position");
    const lightboxTitleEl = document.getElementById("lightbox-title");
    const lightboxDateEl = document.getElementById("lightbox-date");
    const lightboxCaptionEl = document.getElementById("lightbox-caption");
    const lightboxLikeBtn = document.getElementById("lightbox-like-btn");

    const galleryState = {
      activeCategory: "All",
      likedIds: loadLikedGalleryIds(),
      activeModalIndex: -1,
      lastTriggerId: null
    };

    const getVisibleEvents = () => {
      if (galleryState.activeCategory === "All") {
        return GALLERY_EVENTS;
      }
      return GALLERY_EVENTS.filter((item) => item.category === galleryState.activeCategory);
    };

    const updateCategoryCounts = () => {
      document.querySelectorAll(".filter-count-pill").forEach((pill) => {
        const cat = pill.dataset.countFor;
        const count =
          cat === "All"
            ? GALLERY_EVENTS.length
            : GALLERY_EVENTS.filter((item) => item.category === cat).length;
        pill.textContent = String(count);
      });
    };

    const updateFavoritesBadge = () => {
      const count = galleryState.likedIds.length;
      if (favoritesNumberEl) {
        favoritesNumberEl.textContent = String(count);
      }
      if (favoritesLabelEl) {
        favoritesLabelEl.textContent = count === 1 ? "Saved Highlight" : "Saved Highlights";
      }
      if (favoritesBadgeEl) {
        favoritesBadgeEl.classList.toggle("has-unread", count > 0);
      }
    };

    const syncLikeButton = (button, item, isLiked) => {
      button.classList.toggle("is-liked", isLiked);
      button.setAttribute("aria-pressed", String(isLiked));
      button.setAttribute(
        "aria-label",
        (isLiked ? "Remove bookmark for " : "Bookmark ") + item.title
      );
      const labelSpan = button.querySelector(".like-btn-label");
      if (labelSpan) {
        labelSpan.textContent = isLiked ? "Saved" : "Bookmark";
      }
    };

    const createBookmarkIcon = () => {
      const svgNS = "http://www.w3.org/2000/svg";
      const svg = document.createElementNS(svgNS, "svg");
      svg.setAttribute("width", "16");
      svg.setAttribute("height", "16");
      svg.setAttribute("viewBox", "0 0 24 24");
      svg.setAttribute("fill", "none");
      svg.setAttribute("stroke", "currentColor");
      svg.setAttribute("stroke-width", "2");
      svg.setAttribute("aria-hidden", "true");

      const path = document.createElementNS(svgNS, "path");
      path.setAttribute("d", "M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z");
      svg.appendChild(path);
      return svg;
    };

    const createGalleryCard = (item, index) => {
      const isLiked = galleryState.likedIds.includes(item.id);
      const article = document.createElement("article");
      article.className = "gallery-card" + (isLiked ? " is-liked" : "");
      article.dataset.id = item.id;
      article.dataset.index = String(index);

      const mediaBtn = document.createElement("button");
      mediaBtn.type = "button";
      mediaBtn.className = "gallery-media-btn";
      mediaBtn.dataset.action = "open-lightbox";
      mediaBtn.dataset.index = String(index);
      mediaBtn.setAttribute("aria-label", "Open " + item.title + " in full-screen lightbox");
      mediaBtn.innerHTML = buildGallerySvg(item.illustration, item.title);
      const cardSvg = mediaBtn.querySelector("svg");
      if (cardSvg) {
        cardSvg.setAttribute("aria-hidden", "true");
        cardSvg.removeAttribute("role");
        cardSvg.removeAttribute("aria-label");
      }

      const expandChip = document.createElement("span");
      expandChip.className = "gallery-expand-chip";
      expandChip.setAttribute("aria-hidden", "true");
      expandChip.textContent = "Inspect View";
      mediaBtn.appendChild(expandChip);

      const body = document.createElement("div");
      body.className = "gallery-card-body";

      const metaTop = document.createElement("div");
      metaTop.className = "gallery-card-meta-top";

      const catBadge = document.createElement("span");
      catBadge.className = "gallery-category-badge";
      catBadge.dataset.category = item.category;
      catBadge.textContent = item.category;

      const attendeeBadge = document.createElement("span");
      attendeeBadge.className = "gallery-attendee-badge";
      attendeeBadge.textContent = item.attendeeBadge;

      metaTop.append(catBadge, attendeeBadge);

      const titleEl = document.createElement("h3");
      titleEl.className = "gallery-card-title";
      titleEl.textContent = item.title;

      const captionEl = document.createElement("p");
      captionEl.className = "gallery-card-caption";
      captionEl.textContent = item.caption;

      const footer = document.createElement("div");
      footer.className = "gallery-card-footer";

      const dateEl = document.createElement("time");
      dateEl.className = "gallery-card-date";
      dateEl.dateTime = item.date;
      dateEl.textContent = formatDate(item.date);

      const likeBtn = document.createElement("button");
      likeBtn.type = "button";
      likeBtn.className = "gallery-like-btn";
      likeBtn.dataset.action = "toggle-like";
      likeBtn.dataset.id = item.id;

      const likeLabel = document.createElement("span");
      likeLabel.className = "like-btn-label";
      likeBtn.append(createBookmarkIcon(), likeLabel);
      syncLikeButton(likeBtn, item, isLiked);

      footer.append(dateEl, likeBtn);
      body.append(metaTop, titleEl, captionEl, footer);
      article.append(mediaBtn, body);

      return article;
    };

    const renderGallery = () => {
      const visible = getVisibleEvents();
      galleryGrid.replaceChildren();
      visible.forEach((item, index) => {
        galleryGrid.appendChild(createGalleryCard(item, index));
      });

      if (countStatusEl) {
        const categoryLabel =
          galleryState.activeCategory === "All"
            ? "all categories"
            : galleryState.activeCategory;
        countStatusEl.textContent =
          "Showing " + visible.length + " of " + GALLERY_EVENTS.length + " highlights (" + categoryLabel + ")";
      }

      updateFavoritesBadge();
    };

    const renderLightboxItem = () => {
      const visible = getVisibleEvents();
      if (!lightboxEl || galleryState.activeModalIndex < 0 || galleryState.activeModalIndex >= visible.length) {
        return;
      }

      const item = visible[galleryState.activeModalIndex];
      const isLiked = galleryState.likedIds.includes(item.id);

      if (lightboxArtworkEl) {
        lightboxArtworkEl.innerHTML = buildGallerySvg(item.illustration, item.title);
      }
      if (lightboxCategoryEl) {
        lightboxCategoryEl.dataset.category = item.category;
        lightboxCategoryEl.textContent = item.category;
      }
      if (lightboxAttendeesEl) {
        lightboxAttendeesEl.textContent = item.attendeeBadge;
      }
      if (lightboxPositionEl) {
        lightboxPositionEl.textContent =
          String(galleryState.activeModalIndex + 1) + " / " + String(visible.length);
      }
      if (lightboxTitleEl) {
        lightboxTitleEl.textContent = item.title;
      }
      if (lightboxDateEl) {
        lightboxDateEl.dateTime = item.date;
        lightboxDateEl.textContent = formatDate(item.date);
      }
      if (lightboxCaptionEl) {
        lightboxCaptionEl.textContent = item.caption;
      }
      if (lightboxLikeBtn) {
        lightboxLikeBtn.dataset.id = item.id;
        syncLikeButton(lightboxLikeBtn, item, isLiked);
      }

      const hasMultiple = visible.length > 1;
      if (lightboxPrevBtn) {
        lightboxPrevBtn.disabled = !hasMultiple;
      }
      if (lightboxNextBtn) {
        lightboxNextBtn.disabled = !hasMultiple;
      }
    };

    const openLightbox = (index, triggerId) => {
      const visible = getVisibleEvents();
      if (!lightboxEl || index < 0 || index >= visible.length) {
        return;
      }
      galleryState.activeModalIndex = index;
      galleryState.lastTriggerId = triggerId || visible[index].id;
      renderLightboxItem();
      lightboxEl.hidden = false;
      document.body.classList.add("is-modal-open");
      if (lightboxCloseBtn) {
        lightboxCloseBtn.focus();
      }
    };

    const closeLightbox = () => {
      if (!lightboxEl || lightboxEl.hidden) {
        return;
      }
      lightboxEl.hidden = true;
      document.body.classList.remove("is-modal-open");
      galleryState.activeModalIndex = -1;
      if (galleryState.lastTriggerId) {
        const triggerCard = galleryGrid.querySelector(
          '.gallery-card[data-id="' + galleryState.lastTriggerId + '"] .gallery-media-btn'
        );
        if (triggerCard && typeof triggerCard.focus === "function") {
          triggerCard.focus();
        }
      }
      galleryState.lastTriggerId = null;
    };

    const stepLightbox = (delta) => {
      const visible = getVisibleEvents();
      if (visible.length === 0 || galleryState.activeModalIndex < 0) {
        return;
      }
      galleryState.activeModalIndex =
        (galleryState.activeModalIndex + delta + visible.length) % visible.length;
      renderLightboxItem();
    };

    const toggleLikedId = (id) => {
      const idx = galleryState.likedIds.indexOf(id);
      if (idx === -1) {
        galleryState.likedIds.push(id);
      } else {
        galleryState.likedIds.splice(idx, 1);
      }
      saveLikedGalleryIds(galleryState.likedIds);
      renderGallery();
      if (lightboxEl && !lightboxEl.hidden) {
        renderLightboxItem();
      }
    };

    filterButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        galleryState.activeCategory = btn.dataset.category || "All";
        filterButtons.forEach((otherBtn) => {
          const isSelected = otherBtn === btn;
          otherBtn.classList.toggle("is-active", isSelected);
          otherBtn.setAttribute("aria-pressed", String(isSelected));
        });
        renderGallery();
      });
    });

    galleryGrid.addEventListener("click", (event) => {
      const likeBtn = event.target.closest('button[data-action="toggle-like"]');
      if (likeBtn && likeBtn.dataset.id) {
        event.stopPropagation();
        toggleLikedId(likeBtn.dataset.id);
        return;
      }

      const cardEl = event.target.closest(".gallery-card");
      if (!cardEl) {
        return;
      }
      const index = Number(cardEl.dataset.index);
      openLightbox(index, cardEl.dataset.id);
    });

    if (lightboxCloseBtn) {
      lightboxCloseBtn.addEventListener("click", closeLightbox);
    }

    if (lightboxPrevBtn) {
      lightboxPrevBtn.addEventListener("click", () => stepLightbox(-1));
    }

    if (lightboxNextBtn) {
      lightboxNextBtn.addEventListener("click", () => stepLightbox(1));
    }

    if (lightboxLikeBtn) {
      lightboxLikeBtn.addEventListener("click", () => {
        if (lightboxLikeBtn.dataset.id) {
          toggleLikedId(lightboxLikeBtn.dataset.id);
        }
      });
    }

    if (lightboxEl) {
      lightboxEl.addEventListener("click", (event) => {
        if (event.target === lightboxEl) {
          closeLightbox();
        }
      });
    }

    document.addEventListener("keydown", (event) => {
      if (!lightboxEl || lightboxEl.hidden) {
        return;
      }
      if (event.key === "Escape") {
        event.preventDefault();
        closeLightbox();
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        stepLightbox(-1);
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        stepLightbox(1);
      }
    });

    updateCategoryCounts();
    renderGallery();
  }
})();
