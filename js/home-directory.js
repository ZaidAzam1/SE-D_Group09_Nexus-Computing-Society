/* ==========================================================================
   Nexus Computing Society — Home & Directory Vanilla JavaScript
   Features:
   1. Accessible Mobile Hamburger Menu & Dropdown Navigation
   2. Real-time Hackathon Countdown Timer (Dec 12, 2026)
   3. Dynamic Rendering of Featured Technical Wings from JS Array
   ========================================================================== */

(function () {
  "use strict";

  /* ------------------------------------------------------------------------
     1. Sticky Header Scroll Shadow, Mobile Hamburger Toggle & Dropdowns
     ------------------------------------------------------------------------ */
  function initNavigation() {
    var header = document.getElementById("site-header");
    var navToggle = document.getElementById("nav-toggle");
    var primaryNav = document.getElementById("primary-navigation");
    var dropdownItems = document.querySelectorAll(".has-dropdown");

    function closeAllDropdowns(exceptItem) {
      dropdownItems.forEach(function (item) {
        if (item !== exceptItem) {
          item.classList.remove("is-open");
          var trigger = item.querySelector(".dropdown-trigger");
          if (trigger) {
            trigger.setAttribute("aria-expanded", "false");
          }
        }
      });
    }

    function setMobileMenuState(isOpen) {
      if (!navToggle || !primaryNav) return;
      navToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
      primaryNav.classList.toggle("is-open", isOpen);
    }

    if (navToggle && primaryNav) {
      navToggle.addEventListener("click", function () {
        var currentlyExpanded = navToggle.getAttribute("aria-expanded") === "true";
        setMobileMenuState(!currentlyExpanded);
      });
    }

    dropdownItems.forEach(function (item) {
      var trigger = item.querySelector(".dropdown-trigger");
      if (!trigger) return;

      trigger.addEventListener("click", function (event) {
        event.stopPropagation();
        var isOpen = item.classList.contains("is-open");
        closeAllDropdowns(item);
        item.classList.toggle("is-open", !isOpen);
        trigger.setAttribute("aria-expanded", !isOpen ? "true" : "false");
      });
    });

    // Close menus when clicking outside
    document.addEventListener("click", function (event) {
      if (!event.target.closest(".has-dropdown")) {
        closeAllDropdowns(null);
      }
      if (
        primaryNav &&
        primaryNav.classList.contains("is-open") &&
        !event.target.closest("#site-header")
      ) {
        setMobileMenuState(false);
      }
    });

    // Close mobile menu when a navigation link is clicked
    if (primaryNav) {
      primaryNav.querySelectorAll("a").forEach(function (link) {
        link.addEventListener("click", function () {
          closeAllDropdowns(null);
          setMobileMenuState(false);
        });
      });
    }

    // Keyboard Escape closes open dropdowns and mobile drawer
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        closeAllDropdowns(null);
        setMobileMenuState(false);
      }
    });

    // Reset mobile drawer state when resizing to desktop width
    window.addEventListener("resize", function () {
      if (window.innerWidth > 900) {
        setMobileMenuState(false);
      }
    });

    // Subtle shadow on sticky header when scrolled
    if (header) {
      window.addEventListener(
        "scroll",
        function () {
          header.classList.toggle("is-scrolled", window.scrollY > 8);
        },
        { passive: true }
      );
    }
  }

  /* ------------------------------------------------------------------------
     2. Real-Time Hackathon Countdown Timer (Nexus CodeRush 2026 - Dec 12, 2026)
     ------------------------------------------------------------------------ */
  function initHackathonCountdown() {
    var daysEl = document.getElementById("cd-days");
    var hoursEl = document.getElementById("cd-hours");
    var minutesEl = document.getElementById("cd-minutes");
    var secondsEl = document.getElementById("cd-seconds");
    var statusEl = document.getElementById("countdown-status");

    if (!daysEl || !hoursEl || !minutesEl || !secondsEl) {
      return;
    }

    // Target: December 12, 2026 at 09:00:00 local time
    var targetTime = new Date(2026, 11, 12, 9, 0, 0).getTime();

    function padTwo(num) {
      return num < 10 ? "0" + num : String(num);
    }

    function updateTimer() {
      var now = Date.now();
      var diffMs = targetTime - now;

      if (diffMs <= 0) {
        daysEl.textContent = "00";
        hoursEl.textContent = "00";
        minutesEl.textContent = "00";
        secondsEl.textContent = "00";
        if (statusEl) {
          statusEl.textContent = "Nexus CodeRush 2026 Hackathon is underway!";
        }
        return false;
      }

      var totalSeconds = Math.floor(diffMs / 1000);
      var days = Math.floor(totalSeconds / 86400);
      var hours = Math.floor((totalSeconds % 86400) / 3600);
      var minutes = Math.floor((totalSeconds % 3600) / 60);
      var seconds = totalSeconds % 60;

      daysEl.textContent = padTwo(days);
      hoursEl.textContent = padTwo(hours);
      minutesEl.textContent = padTwo(minutes);
      secondsEl.textContent = padTwo(seconds);

      return true;
    }

    // Initial render immediately, then tick every second
    var stillCounting = updateTimer();
    if (stillCounting) {
      var timerId = window.setInterval(function () {
        if (!updateTimer()) {
          window.clearInterval(timerId);
        }
      }, 1000);
    }
  }

  /* ------------------------------------------------------------------------
     3. Featured Technical Wings (Rendered Dynamically from JS Array)
     ------------------------------------------------------------------------ */
  var FEATURED_WINGS = [
    {
      id: "ai-ml",
      category: "Machine Intelligence",
      name: "AI & ML Wing",
      members: "210 Members",
      description:
        "Researching neural architectures, computer vision, and applied LLM systems through weekly paper reading circles and open-source model builds.",
      topics: ["PyTorch", "RAG & Agents", "Computer Vision"],
      schedule: "Wednesdays • 4:30 PM • AI Lab 302",
      detailsUrl: "pages/society-details.html",
      joinUrl: "pages/join-society.html"
    },
    {
      id: "competitive-programming",
      category: "Algorithms & ICPC",
      name: "Competitive Programming Club",
      members: "185 Members",
      description:
        "Sharpening algorithmic problem-solving, graph theory, and dynamic programming for regional ICPC qualifiers and technical coding interviews.",
      topics: ["C++ / Python", "ICPC Prep", "Weekly Contests"],
      schedule: "Fridays • 3:00 PM • CS Seminar Hall",
      detailsUrl: "pages/society-details.html",
      joinUrl: "pages/join-society.html"
    },
    {
      id: "cyber-security",
      category: "InfoSec & Defense",
      name: "Cyber Security Wing",
      members: "160 Members",
      description:
        "Practicing ethical hacking, network defense, cryptography, and binary analysis in sandboxed Capture The Flag (CTF) lab environments.",
      topics: ["CTF Labs", "AppSec", "Network Defense"],
      schedule: "Thursdays • 5:00 PM • Security Sandbox 105",
      detailsUrl: "pages/society-details.html",
      joinUrl: "pages/join-society.html"
    }
  ];

  function createElement(tag, className, textContent) {
    var el = document.createElement(tag);
    if (className) el.className = className;
    if (typeof textContent === "string") el.textContent = textContent;
    return el;
  }

  function renderFeaturedWings() {
    var container = document.getElementById("featured-wings-grid");
    if (!container) return;

    container.innerHTML = "";
    var fragment = document.createDocumentFragment();

    FEATURED_WINGS.forEach(function (wing) {
      var card = createElement("article", "wing-card");
      card.setAttribute("data-wing-id", wing.id);

      // Upper content block
      var body = createElement("div", "wing-card-body");

      var topRow = createElement("div", "wing-card-top");
      topRow.appendChild(createElement("span", "wing-badge", wing.category));
      topRow.appendChild(createElement("span", "wing-members", wing.members));

      body.appendChild(topRow);
      body.appendChild(createElement("h3", "wing-title", wing.name));
      body.appendChild(createElement("p", "wing-desc", wing.description));

      var tagList = createElement("div", "wing-tags");
      wing.topics.forEach(function (topic) {
        tagList.appendChild(createElement("span", "wing-tag", topic));
      });
      body.appendChild(tagList);

      // Lower footer block
      var footer = createElement("div", "wing-card-footer");
      footer.appendChild(createElement("p", "wing-schedule", "Meets: " + wing.schedule));

      var actions = createElement("div", "wing-actions");

      var detailsBtn = createElement("a", "btn btn-secondary btn-sm", "Wing Details");
      detailsBtn.setAttribute("href", wing.detailsUrl);

      var joinBtn = createElement("a", "btn btn-primary btn-sm", "Join Wing");
      joinBtn.setAttribute("href", wing.joinUrl);

      actions.appendChild(detailsBtn);
      actions.appendChild(joinBtn);
      footer.appendChild(actions);

      card.appendChild(body);
      card.appendChild(footer);
      fragment.appendChild(card);
    });

    container.appendChild(fragment);
  }

  /* ------------------------------------------------------------------------
     Initialize on DOMContentLoaded
     ------------------------------------------------------------------------ */
  document.addEventListener("DOMContentLoaded", function () {
    initNavigation();
    initHackathonCountdown();
    renderFeaturedWings();
  });
})();


/* ==========================================================================
   Page 2: Society Directory Vanilla JavaScript
   Features:
   4. Dynamic Technical Wings Array (All 6 Wings)
   5. Live Search, Domain Category Filter Pills & Live Member Counter
   6. Wing Selection Persistence (localStorage: ncs_selected_wing)
   ========================================================================== */
(function () {
  "use strict";

  var SELECTED_WING_STORAGE_KEY = "ncs_selected_wing";

  var TECHNICAL_WINGS = [
    {
      id: "ai-ml",
      name: "AI & Machine Learning Wing",
      tagline: "Deep learning, applied LLM systems, and computer vision research.",
      category: "AI & Data Science",
      memberCount: 210,
      wingLead: "Ayesha Tariq (BSAI '27)",
      schedule: "Wednesdays • 4:30 PM • AI Lab 302",
      description:
        "Researching neural architectures, computer vision, and applied LLM systems through weekly paper reading circles, dataset clinics, and open-source model builds.",
      techStack: ["PyTorch", "Python", "LangChain", "OpenCV", "Hugging Face"]
    },
    {
      id: "competitive-programming",
      name: "Competitive Programming Club",
      tagline: "Algorithmic mastery, ICPC team training, and timed coding sprints.",
      category: "Algorithms & ICPC",
      memberCount: 185,
      wingLead: "Hamza Siddiqui (BSCS '26)",
      schedule: "Fridays • 3:00 PM • CS Seminar Hall",
      description:
        "Sharpening algorithmic problem-solving, graph theory, and dynamic programming for regional ICPC qualifiers, Codeforces rounds, and technical coding interviews.",
      techStack: ["C++20", "Python", "Data Structures", "Graph Theory", "ICPC"]
    },
    {
      id: "cyber-security",
      name: "Cyber Security & Ethical Hacking Wing",
      tagline: "Offensive security, CTF challenges, and defensive network engineering.",
      category: "Cyber Security",
      memberCount: 160,
      wingLead: "Zainab Qureshi (BSCY '27)",
      schedule: "Thursdays • 5:00 PM • Security Sandbox 105",
      description:
        "Practicing ethical hacking, penetration testing, cryptography, and binary exploitation in isolated Capture The Flag (CTF) lab environments.",
      techStack: ["Kali Linux", "Burp Suite", "Wireshark", "Ghidra", "Docker"]
    },
    {
      id: "web-app-dev",
      name: "Web & App Dev Studio",
      tagline: "Full-stack web platforms, mobile apps, and scalable cloud APIs.",
      category: "Web & Mobile Dev",
      memberCount: 140,
      wingLead: "Bilal Mahmood (BSSE '26)",
      schedule: "Tuesdays • 4:00 PM • Software Studio 208",
      description:
        "Designing and shipping production-grade campus web applications, cross-platform mobile tools, and RESTful backend services in agile student squads.",
      techStack: ["HTML5 / CSS3", "JavaScript", "React", "Node.js", "PostgreSQL"]
    },
    {
      id: "game-dev-graphics",
      name: "Game Dev & Graphics Guild",
      tagline: "Real-time rendering, gameplay physics, and interactive 3D worlds.",
      category: "Game Dev & Graphics",
      memberCount: 75,
      wingLead: "Raza Javed (BSCS '27)",
      schedule: "Mondays • 4:30 PM • Multimedia Lab 114",
      description:
        "Building indie 2D/3D games, custom GLSL shaders, procedural level generators, and semester game jam prototypes from concept art to playable builds.",
      techStack: ["Unity", "C#", "Unreal Engine", "Godot", "GLSL"]
    },
    {
      id: "robotics-iot",
      name: "Robotics & Embedded IoT Wing",
      tagline: "Autonomous rovers, edge microcontrollers, and smart sensor networks.",
      category: "Robotics & IoT",
      memberCount: 65,
      wingLead: "Saad Farhan (BSEE '26)",
      schedule: "Saturdays • 11:00 AM • Robotics Makerspace B2",
      description:
        "Prototyping autonomous line-following bots, ROS2 navigation stacks, and low-power campus telemetry devices using custom PCBs and real-time firmware.",
      techStack: ["C / C++", "ROS2", "ESP32", "Arduino", "MQTT"]
    }
  ];

  function createDirectoryElement(tag, className, textContent) {
    var el = document.createElement(tag);
    if (className) el.className = className;
    if (typeof textContent === "string") el.textContent = textContent;
    return el;
  }

  function saveSelectedWing(wingId) {
    try {
      window.localStorage.setItem(SELECTED_WING_STORAGE_KEY, wingId);
    } catch (err) {
      // Ignore storage errors if localStorage is disabled
    }
  }

  function getUniqueCategories(wings) {
    var categories = ["All"];
    wings.forEach(function (wing) {
      if (categories.indexOf(wing.category) === -1) {
        categories.push(wing.category);
      }
    });
    return categories;
  }

  function initSocietyDirectory() {
    var gridEl = document.getElementById("directory-wings-grid");
    var searchInput = document.getElementById("wing-search-input");
    var pillsContainer = document.getElementById("category-filter-pills");
    var wingsCountEl = document.getElementById("matching-wings-count");
    var membersCountEl = document.getElementById("matching-members-count");
    var emptyStateEl = document.getElementById("directory-empty-state");
    var emptyDescEl = document.getElementById("empty-state-desc");
    var resetBtn = document.getElementById("reset-filters-btn");

    if (!gridEl || !searchInput || !pillsContainer) {
      return;
    }

    var state = {
      searchQuery: "",
      activeCategory: "All"
    };

    function renderCategoryPills() {
      var categories = getUniqueCategories(TECHNICAL_WINGS);
      pillsContainer.innerHTML = "";

      categories.forEach(function (category) {
        var isActive = state.activeCategory === category;
        var label = category === "All" ? "All Wings" : category;
        var btn = createDirectoryElement(
          "button",
          "category-pill" + (isActive ? " is-active" : ""),
          label
        );
        btn.type = "button";
        btn.setAttribute("data-category", category);
        btn.setAttribute("aria-pressed", isActive ? "true" : "false");

        btn.addEventListener("click", function () {
          state.activeCategory = category;
          renderCategoryPills();
          renderDirectory();
        });

        pillsContainer.appendChild(btn);
      });
    }

    function filterWings() {
      var query = state.searchQuery.trim().toLowerCase();

      return TECHNICAL_WINGS.filter(function (wing) {
        var matchesCategory =
          state.activeCategory === "All" || wing.category === state.activeCategory;

        if (!matchesCategory) {
          return false;
        }

        if (!query) {
          return true;
        }

        var inName = wing.name.toLowerCase().indexOf(query) !== -1;
        var inTagline = wing.tagline.toLowerCase().indexOf(query) !== -1;
        var inTechStack = wing.techStack.some(function (tech) {
          return tech.toLowerCase().indexOf(query) !== -1;
        });

        return inName || inTagline || inTechStack;
      });
    }

    function updateSummary(filteredWings) {
      var totalMembers = filteredWings.reduce(function (sum, wing) {
        return sum + wing.memberCount;
      }, 0);

      if (wingsCountEl) {
        wingsCountEl.textContent = String(filteredWings.length);
      }
      if (membersCountEl) {
        membersCountEl.textContent = String(totalMembers);
      }
    }

    function buildWingCard(wing) {
      var card = createDirectoryElement("article", "directory-wing-card");
      card.setAttribute("data-wing-id", wing.id);

      var body = createDirectoryElement("div", "wing-card-body");

      var topRow = createDirectoryElement("div", "wing-card-top");
      topRow.appendChild(createDirectoryElement("span", "wing-badge", wing.category));
      topRow.appendChild(createDirectoryElement("span", "wing-members", wing.memberCount + " Members"));
      body.appendChild(topRow);

      body.appendChild(createDirectoryElement("h3", "wing-title", wing.name));
      body.appendChild(createDirectoryElement("p", "wing-tagline", wing.tagline));
      body.appendChild(createDirectoryElement("p", "wing-desc", wing.description));

      var tagsWrap = createDirectoryElement("div", "wing-tags");
      wing.techStack.forEach(function (tech) {
        tagsWrap.appendChild(createDirectoryElement("span", "wing-tag", tech));
      });
      body.appendChild(tagsWrap);

      var footer = createDirectoryElement("div", "wing-card-footer");

      var metaList = createDirectoryElement("div", "wing-meta-list");

      var leadItem = createDirectoryElement("div", "wing-meta-item");
      leadItem.appendChild(createDirectoryElement("span", "wing-meta-label", "Wing Lead:"));
      leadItem.appendChild(document.createTextNode(" " + wing.wingLead));
      metaList.appendChild(leadItem);

      var scheduleItem = createDirectoryElement("div", "wing-meta-item");
      scheduleItem.appendChild(createDirectoryElement("span", "wing-meta-label", "Weekly Lab:"));
      scheduleItem.appendChild(document.createTextNode(" " + wing.schedule));
      metaList.appendChild(scheduleItem);

      footer.appendChild(metaList);

      var actions = createDirectoryElement("div", "wing-actions");

      var detailsLink = createDirectoryElement("a", "btn btn-primary btn-sm", "View Wing Details");
      detailsLink.setAttribute("href", "society-details.html");
      detailsLink.addEventListener("click", function () {
        saveSelectedWing(wing.id);
      });

      var joinLink = createDirectoryElement("a", "btn btn-secondary btn-sm", "Join Wing");
      joinLink.setAttribute("href", "join-society.html");

      actions.appendChild(detailsLink);
      actions.appendChild(joinLink);
      footer.appendChild(actions);

      card.appendChild(body);
      card.appendChild(footer);
      return card;
    }

    function renderDirectory() {
      var filteredWings = filterWings();
      updateSummary(filteredWings);
      gridEl.innerHTML = "";

      if (filteredWings.length === 0) {
        if (emptyStateEl) {
          emptyStateEl.hidden = false;
        }
        if (emptyDescEl) {
          var trimmed = state.searchQuery.trim();
          if (trimmed && state.activeCategory !== "All") {
            emptyDescEl.textContent =
              'No wings matched "' + trimmed + '" inside the ' + state.activeCategory + " category.";
          } else if (trimmed) {
            emptyDescEl.textContent =
              'No wings matched "' + trimmed + '" across wing names, taglines, or tech stacks.';
          } else {
            emptyDescEl.textContent =
              "No wings matched the selected domain filter. Reset filters to view all 6 wings.";
          }
        }
        return;
      }

      if (emptyStateEl) {
        emptyStateEl.hidden = true;
      }

      var fragment = document.createDocumentFragment();
      filteredWings.forEach(function (wing) {
        fragment.appendChild(buildWingCard(wing));
      });
      gridEl.appendChild(fragment);
    }

    function resetFilters() {
      state.searchQuery = "";
      state.activeCategory = "All";
      searchInput.value = "";
      renderCategoryPills();
      renderDirectory();
      searchInput.focus();
    }

    searchInput.addEventListener("input", function (event) {
      state.searchQuery = event.target.value;
      renderDirectory();
    });

    if (resetBtn) {
      resetBtn.addEventListener("click", resetFilters);
    }

    renderCategoryPills();
    renderDirectory();
  }

  document.addEventListener("DOMContentLoaded", initSocietyDirectory);
})();