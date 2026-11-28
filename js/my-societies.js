/* ==========================================================================
   Nexus Computing Society — My Societies Dashboard Interactivity
   Pure Vanilla JavaScript (Synced with localStorage)
   ========================================================================== */

(function () {
  "use strict";

  const ACTIVE_SOCIETIES_KEY = "ncs_active_societies";

  const DEFAULT_SOCIETIES = [
    {
      id: "nexus-computing-society",
      name: "Nexus Computing Society",
      category: "Computing & Tech",
      role: "Core Technical Lead",
      roleTier: "Lead/Executive",
      joinedDate: "2026-09-12",
      nextEventTitle: "Distributed Systems & Cloud Lab",
      nextEventDate: "Dec 04, 2026 • 2:30 PM",
      room: "Lab 4, CS Block",
      upcomingEventsCount: 1
    },
    {
      id: "ai-data-science-club",
      name: "AI & Data Science Club",
      category: "AI & Research",
      role: "Member",
      roleTier: "Core Member",
      joinedDate: "2026-09-20",
      nextEventTitle: "Applied LLMs & RAG Workshop",
      nextEventDate: "Dec 06, 2026 • 1:00 PM",
      room: "AI Research Lab, CS Block",
      upcomingEventsCount: 1
    },
    {
      id: "fast-cybersec-society",
      name: "FAST CyberSec Society",
      category: "Cyber Security",
      role: "Event Coordinator",
      roleTier: "Lead/Executive",
      joinedDate: "2026-10-03",
      nextEventTitle: "Campus CTF Qualifier Briefing",
      nextEventDate: "Dec 09, 2026 • 3:30 PM",
      room: "Seminar Hall B, Main Block",
      upcomingEventsCount: 1
    },
    {
      id: "fast-competitive-programming",
      name: "FAST Competitive Programming Guild",
      category: "Algorithms & ICPC",
      role: "Core Member",
      roleTier: "Core Member",
      joinedDate: "2026-10-18",
      nextEventTitle: "ICPC Speed Coding Mock Round",
      nextEventDate: "Dec 12, 2026 • 11:30 AM",
      room: "Lab 2, CS Block",
      upcomingEventsCount: 1
    }
  ];

  const SOCIETY_ANNOUNCEMENTS = [
    {
      societyId: "nexus-computing-society",
      societyName: "Nexus Computing Society",
      timestamp: "2 hours ago",
      title: "Winter Hackathon Team Registration Open",
      body: "Core leads should finalize problem tracks and mentor rosters in Lab 4 before Friday."
    },
    {
      societyId: "fast-cybersec-society",
      societyName: "FAST CyberSec Society",
      timestamp: "Yesterday",
      title: "CTF Infrastructure Stress Test Scheduled",
      body: "Event coordinators please verify challenge containers and scoring tokens for Dec 09."
    },
    {
      societyId: "ai-data-science-club",
      societyName: "AI & Data Science Club",
      timestamp: "2 days ago",
      title: "GPU Cluster Allocation for Fall Projects",
      body: "Active members can now reserve 4-hour training slots via the CS Research Lab portal."
    },
    {
      societyId: "fast-competitive-programming",
      societyName: "FAST Competitive Programming Guild",
      timestamp: "Nov 24, 2026",
      title: "Division-1 Practice Editorial Posted",
      body: "Solutions for Dynamic Programming & Graph Theory round 4 are live in the Discord archive."
    }
  ];

  // DOM Elements
  const navToggle = document.getElementById("navToggle");
  const primaryNav = document.getElementById("primaryNav");

  const statTotalSocieties = document.getElementById("statTotalSocieties");
  const statLeadershipRoles = document.getElementById("statLeadershipRoles");
  const statUpcomingEvents = document.getElementById("statUpcomingEvents");

  const filterButtons = document.querySelectorAll(".filter-btn");
  const searchInput = document.getElementById("societySearchInput");
  const resultsCountLabel = document.getElementById("resultsCountLabel");
  const societiesGrid = document.getElementById("joinedSocietiesGrid");
  const announcementsFeed = document.getElementById("announcementsFeed");
  const announcementsCount = document.getElementById("announcementsCount");

  // Modal Elements
  const leaveModal = document.getElementById("leaveConfirmModal");
  const leaveModalSocietyName = document.getElementById("leaveModalSocietyName");
  const closeLeaveModalBtn = document.getElementById("closeLeaveModalBtn");
  const cancelLeaveBtn = document.getElementById("cancelLeaveBtn");
  const confirmLeaveBtn = document.getElementById("confirmLeaveBtn");
  const toastContainer = document.getElementById("toastContainer");

  let activeFilter = "All";
  let searchQuery = "";
  let pendingLeaveId = null;
  let lastFocusedTrigger = null;

  /* ------------------------------------------------------------------------
     1. Shared Mobile Navigation
     ------------------------------------------------------------------------ */
  function initNavigation() {
    if (!navToggle || !primaryNav) return;

    navToggle.addEventListener("click", function () {
      const isExpanded = navToggle.getAttribute("aria-expanded") === "true";
      navToggle.setAttribute("aria-expanded", String(!isExpanded));
      primaryNav.classList.toggle("open", !isExpanded);
    });

    primaryNav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        navToggle.setAttribute("aria-expanded", "false");
        primaryNav.classList.remove("open");
      });
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && primaryNav.classList.contains("open")) {
        navToggle.setAttribute("aria-expanded", "false");
        primaryNav.classList.remove("open");
        navToggle.focus();
      }
    });
  }

  /* ------------------------------------------------------------------------
     2. LocalStorage Sync & Record Normalization
     ------------------------------------------------------------------------ */
  function slugify(text) {
    return String(text || "society")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  function isLeadRole(role, roleTier) {
    if (roleTier === "Lead/Executive") return true;
    if (roleTier === "Core Member") return false;
    return /(lead|coordinator|president|head|director|executive|vp|chair)/i.test(String(role || ""));
  }

  function normalizeSocietyRecord(item, index) {
    // Supports both full society objects and wing records synced from membership-status.html
    if (item && item.name && item.id) {
      return {
        id: item.id,
        name: item.name,
        category: item.category || "Student Society",
        role: item.role || "Core Member",
        roleTier: item.roleTier || (isLeadRole(item.role) ? "Lead/Executive" : "Core Member"),
        joinedDate: item.joinedDate || item.joinedAt || "2026-10-15",
        nextEventTitle: item.nextEventTitle || "General Body & Wing Sync",
        nextEventDate: item.nextEventDate || "Dec 10, 2026 • 2:00 PM",
        room: item.room || "Lab 4, CS Block",
        upcomingEventsCount: typeof item.upcomingEventsCount === "number" ? item.upcomingEventsCount : 1
      };
    }

    const wingName = item && item.wing ? item.wing : "Computing Wing " + (index + 1);
    const derivedName = "Nexus Computing Society — " + wingName;
    const roleName = item && item.role ? item.role : "Member";
    return {
      id: item && item.trackingId ? slugify(wingName + "-" + item.trackingId) : slugify(wingName),
      name: derivedName,
      category: wingName,
      role: roleName,
      roleTier: isLeadRole(roleName) ? "Lead/Executive" : "Core Member",
      joinedDate: (item && item.joinedAt) || new Date().toISOString(),
      nextEventTitle: wingName + " Weekly Hands-On Lab",
      nextEventDate: "Dec 08, 2026 • 2:30 PM",
      room: "Lab 4, CS Block",
      upcomingEventsCount: 1,
      wing: item && item.wing,
      trackingId: item && item.trackingId
    };
  }

  function loadJoinedSocieties() {
    try {
      const raw = localStorage.getItem(ACTIVE_SOCIETIES_KEY);
      if (raw === null) {
        const defaults = DEFAULT_SOCIETIES.map(function (s) {
          return Object.assign({}, s);
        });
        localStorage.setItem(ACTIVE_SOCIETIES_KEY, JSON.stringify(defaults));
        return defaults;
      }
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) {
        return [];
      }
      return parsed.map(normalizeSocietyRecord);
    } catch (err) {
      return DEFAULT_SOCIETIES.map(function (s) {
        return Object.assign({}, s);
      });
    }
  }

  function saveJoinedSocieties(list) {
    localStorage.setItem(ACTIVE_SOCIETIES_KEY, JSON.stringify(list));
  }

  function formatJoinedDate(dateStr) {
    try {
      const parsed = new Date(dateStr);
      if (isNaN(parsed.getTime())) return String(dateStr);
      return parsed.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric"
      });
    } catch (err) {
      return String(dateStr);
    }
  }

  /* ------------------------------------------------------------------------
     3. Stats, Cards, Empty States & Announcements Rendering
     ------------------------------------------------------------------------ */
  function updateStats(societies) {
    const totalCount = societies.length;
    const leadCount = societies.filter(function (s) {
      return isLeadRole(s.role, s.roleTier);
    }).length;
    const eventsCount = societies.reduce(function (sum, s) {
      return sum + (typeof s.upcomingEventsCount === "number" ? s.upcomingEventsCount : 1);
    }, 0);

    statTotalSocieties.textContent = String(totalCount);
    statLeadershipRoles.textContent = String(leadCount);
    statUpcomingEvents.textContent = String(eventsCount);
  }

  function createMetaRow(iconPath, label, value, subvalue) {
    const row = document.createElement("div");
    row.className = "society-meta-row";

    row.innerHTML =
      '<svg class="meta-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      iconPath +
      "</svg>";

    const content = document.createElement("div");
    content.className = "meta-content";

    const labelEl = document.createElement("span");
    labelEl.className = "meta-label";
    labelEl.textContent = label;

    const valueEl = document.createElement("span");
    valueEl.className = "meta-value";
    valueEl.textContent = value;

    content.appendChild(labelEl);
    content.appendChild(valueEl);

    if (subvalue) {
      const subEl = document.createElement("span");
      subEl.className = "meta-subvalue";
      subEl.textContent = subvalue;
      content.appendChild(subEl);
    }

    row.appendChild(content);
    return row;
  }

  function renderEmptyJoinedState() {
    const emptyCard = document.createElement("div");
    emptyCard.className = "empty-state-card";

    emptyCard.innerHTML =
      '<div class="empty-state-icon" aria-hidden="true">' +
        '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
          '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>' +
          '<circle cx="9" cy="7" r="4"></circle>' +
          '<path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>' +
          '<path d="M16 3.13a4 4 0 0 1 0 7.75"></path>' +
        "</svg>" +
      "</div>" +
      '<h3 class="empty-state-title">You haven\'t joined any societies yet</h3>' +
      '<p class="empty-state-desc">Discover FAST-NUCES Islamabad\'s technical clubs, research chapters, and student-led guilds to get started.</p>' +
      '<a href="societies.html" class="btn btn-primary btn-lg">Explore Societies</a>';

    societiesGrid.appendChild(emptyCard);
  }

  function renderFilteredEmptyState() {
    const emptyCard = document.createElement("div");
    emptyCard.className = "empty-state-card";

    emptyCard.innerHTML =
      '<h3 class="empty-state-title">No matching societies found</h3>' +
      '<p class="empty-state-desc">Try adjusting your search query or switching back to the All roles filter.</p>' +
      '<button type="button" id="resetFiltersBtn" class="btn btn-outline">Reset Search &amp; Filter</button>';

    societiesGrid.appendChild(emptyCard);

    document.getElementById("resetFiltersBtn").addEventListener("click", function () {
      activeFilter = "All";
      searchQuery = "";
      searchInput.value = "";
      filterButtons.forEach(function (btn) {
        btn.classList.toggle("active", btn.dataset.filter === "All");
      });
      renderDashboard();
    });
  }

  function renderSocietiesGrid(societies) {
    societiesGrid.innerHTML = "";

    if (societies.length === 0) {
      resultsCountLabel.textContent = "0 societies joined";
      renderEmptyJoinedState();
      return;
    }

    const query = searchQuery.trim().toLowerCase();
    const filtered = societies.filter(function (society) {
      const lead = isLeadRole(society.role, society.roleTier);
      const matchesFilter =
        activeFilter === "All" ||
        (activeFilter === "Lead/Executive" && lead) ||
        (activeFilter === "Core Member" && !lead);

      const matchesSearch =
        !query ||
        society.name.toLowerCase().indexOf(query) !== -1 ||
        society.category.toLowerCase().indexOf(query) !== -1 ||
        society.role.toLowerCase().indexOf(query) !== -1 ||
        society.room.toLowerCase().indexOf(query) !== -1;

      return matchesFilter && matchesSearch;
    });

    resultsCountLabel.textContent =
      "Showing " + filtered.length + " of " + societies.length + " societies";

    if (filtered.length === 0) {
      renderFilteredEmptyState();
      return;
    }

    filtered.forEach(function (society) {
      const card = document.createElement("article");
      card.className = "society-card";

      // Top badges row
      const topRow = document.createElement("div");
      topRow.className = "society-card-top";

      const categoryBadge = document.createElement("span");
      categoryBadge.className = "category-badge";
      categoryBadge.textContent = society.category;

      const lead = isLeadRole(society.role, society.roleTier);
      const rolePill = document.createElement("span");
      rolePill.className = "role-pill " + (lead ? "is-lead" : "is-member");
      rolePill.textContent = society.role;

      topRow.appendChild(categoryBadge);
      topRow.appendChild(rolePill);

      // Society Title
      const titleEl = document.createElement("h3");
      titleEl.className = "society-title";
      titleEl.textContent = society.name;

      // Meta details
      const metaList = document.createElement("div");
      metaList.className = "society-meta-list";

      metaList.appendChild(
        createMetaRow(
          '<rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line>',
          "Joined Date",
          formatJoinedDate(society.joinedDate)
        )
      );

      metaList.appendChild(
        createMetaRow(
          '<circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline>',
          "Next Meeting / Event",
          society.nextEventTitle,
          society.nextEventDate + " • " + society.room
        )
      );

      // Quick Actions
      const actionsRow = document.createElement("div");
      actionsRow.className = "society-card-actions";

      const detailsLink = document.createElement("a");
      detailsLink.href = "society-details.html?id=" + encodeURIComponent(society.id);
      detailsLink.className = "btn btn-outline";
      detailsLink.textContent = "View Details";

      const leaveBtn = document.createElement("button");
      leaveBtn.type = "button";
      leaveBtn.className = "btn btn-danger-outline";
      leaveBtn.textContent = "Leave Society";
      leaveBtn.setAttribute("aria-label", "Leave " + society.name);
      leaveBtn.addEventListener("click", function () {
        openLeaveModal(society, leaveBtn);
      });

      actionsRow.appendChild(detailsLink);
      actionsRow.appendChild(leaveBtn);

      card.appendChild(topRow);
      card.appendChild(titleEl);
      card.appendChild(metaList);
      card.appendChild(actionsRow);

      societiesGrid.appendChild(card);
    });
  }

  function renderAnnouncements(societies) {
    if (!announcementsFeed || !announcementsCount) return;
    announcementsFeed.innerHTML = "";

    const joinedIds = new Set(
      societies.map(function (s) {
        return s.id;
      })
    );
    const joinedNames = new Set(
      societies.map(function (s) {
        return s.name.toLowerCase();
      })
    );

    const relevant = SOCIETY_ANNOUNCEMENTS.filter(function (item) {
      return (
        joinedIds.has(item.societyId) ||
        joinedNames.has(item.societyName.toLowerCase())
      );
    });

    // If user has custom joined societies (e.g. from membership-status.html), show matching or general updates
    const itemsToShow =
      societies.length === 0
        ? []
        : relevant.length > 0
          ? relevant
          : SOCIETY_ANNOUNCEMENTS.slice(0, 3);

    announcementsCount.textContent = String(itemsToShow.length);

    if (itemsToShow.length === 0) {
      const empty = document.createElement("div");
      empty.className = "announcements-empty";
      empty.textContent =
        "Join a society to see live wing briefings, lab room changes, and event updates here.";
      announcementsFeed.appendChild(empty);
      return;
    }

    itemsToShow.forEach(function (item) {
      const article = document.createElement("article");
      article.className = "announcement-item";

      const top = document.createElement("div");
      top.className = "announcement-top";

      const societySpan = document.createElement("span");
      societySpan.className = "announcement-society";
      societySpan.textContent = item.societyName;

      const timeSpan = document.createElement("span");
      timeSpan.className = "announcement-time";
      timeSpan.textContent = item.timestamp;

      top.appendChild(societySpan);
      top.appendChild(timeSpan);

      const title = document.createElement("h4");
      title.className = "announcement-title";
      title.textContent = item.title;

      const body = document.createElement("p");
      body.className = "announcement-body";
      body.textContent = item.body;

      article.appendChild(top);
      article.appendChild(title);
      article.appendChild(body);
      announcementsFeed.appendChild(article);
    });
  }

  function renderDashboard() {
    const societies = loadJoinedSocieties();
    updateStats(societies);
    renderSocietiesGrid(societies);
    renderAnnouncements(societies);
  }

  /* ------------------------------------------------------------------------
     4. Leave Confirmation Modal & Toast Notifications
     ------------------------------------------------------------------------ */
  function showToast(message) {
    if (!toastContainer) return;

    const toast = document.createElement("div");
    toast.className = "toast";
    toast.setAttribute("role", "status");

    toast.innerHTML =
      '<svg class="toast-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
        '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>' +
        '<polyline points="22 4 12 14.01 9 11.01"></polyline>' +
      "</svg>";

    const text = document.createElement("span");
    text.className = "toast-text";
    text.textContent = message;

    const closeBtn = document.createElement("button");
    closeBtn.type = "button";
    closeBtn.className = "toast-close";
    closeBtn.setAttribute("aria-label", "Dismiss notification");
    closeBtn.textContent = "×";

    function removeToast() {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }

    closeBtn.addEventListener("click", removeToast);
    toast.appendChild(text);
    toast.appendChild(closeBtn);
    toastContainer.appendChild(toast);

    setTimeout(removeToast, 4000);
  }

  function openLeaveModal(society, triggerEl) {
    pendingLeaveId = society.id;
    lastFocusedTrigger = triggerEl || null;
    leaveModalSocietyName.textContent = society.name;
    leaveModal.hidden = false;
    cancelLeaveBtn.focus();
  }

  function closeLeaveModal() {
    leaveModal.hidden = true;
    pendingLeaveId = null;
    if (lastFocusedTrigger && document.body.contains(lastFocusedTrigger)) {
      lastFocusedTrigger.focus();
    }
    lastFocusedTrigger = null;
  }

  function confirmLeaveSociety() {
    if (!pendingLeaveId) return;

    const societies = loadJoinedSocieties();
    const target = societies.find(function (s) {
      return s.id === pendingLeaveId;
    });
    const updated = societies.filter(function (s) {
      return s.id !== pendingLeaveId;
    });

    saveJoinedSocieties(updated);
    leaveModal.hidden = true;
    pendingLeaveId = null;
    lastFocusedTrigger = null;

    renderDashboard();

    if (target) {
      showToast("You have left " + target.name + ".");
    }
  }

  /* ------------------------------------------------------------------------
     5. Event Listeners & Initialization
     ------------------------------------------------------------------------ */
  document.addEventListener("DOMContentLoaded", function () {
    initNavigation();

    filterButtons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        activeFilter = btn.dataset.filter || "All";
        filterButtons.forEach(function (other) {
          other.classList.toggle("active", other === btn);
        });
        renderDashboard();
      });
    });

    if (searchInput) {
      searchInput.addEventListener("input", function () {
        searchQuery = searchInput.value;
        renderDashboard();
      });
    }

    if (closeLeaveModalBtn) {
      closeLeaveModalBtn.addEventListener("click", closeLeaveModal);
    }
    if (cancelLeaveBtn) {
      cancelLeaveBtn.addEventListener("click", closeLeaveModal);
    }
    if (confirmLeaveBtn) {
      confirmLeaveBtn.addEventListener("click", confirmLeaveSociety);
    }
    if (leaveModal) {
      leaveModal.addEventListener("click", function (event) {
        if (event.target === leaveModal) {
          closeLeaveModal();
        }
      });
    }

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && leaveModal && !leaveModal.hidden) {
        closeLeaveModal();
      }
    });

    renderDashboard();
  });
})();
