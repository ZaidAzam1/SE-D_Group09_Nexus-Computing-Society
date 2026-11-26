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
