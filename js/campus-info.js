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
  });
})();
