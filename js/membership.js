/* ==========================================================================
   Nexus Computing Society — Membership Page Interactivity
   Pure Vanilla JavaScript (No external libraries)
   ========================================================================== */

(function () {
  "use strict";

  const STORAGE_KEY = "ncs_applications";
  const ROLL_REGEX = /^[0-9]{2}[iI]-[0-9]{4}$/;
  const NU_EMAIL_REGEX = /^[^\s@]+@(isb\.)?nu\.edu\.pk$/i;
  const GITHUB_REGEX = /^https?:\/\/(www\.)?github\.com\/[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9])){0,38}\/?$/i;

  const ROLE_FEES = {
    "General Member": 500,
    "Technical Team": 300,
    "Event Management": 400,
    "Media & Design": 400
  };

  const ROLE_PERKS = {
    "General Member": [
      "Full access to weekly technical workshops & seminars",
      "Discounted entry to Nexus Annual Hackathon & Coding Cup",
      "Official Nexus Computing Society Discord & GitHub org invite"
    ],
    "Technical Team": [
      "Hands-on mentorship & lead roles on open-source society projects",
      "Priority lab & GPU compute resources for wing initiatives",
      "Official technical contributor certificate & portfolio spotlight"
    ],
    "Event Management": [
      "Behind-the-scenes leadership at flagship FAST-NUCES tech events",
      "Direct networking with industry speakers & alumni sponsors",
      "Event Operations & Management certification from NCS"
    ],
    "Media & Design": [
      "Creative ownership over NCS branding, reels, and event coverage",
      "Access to society design assets, templates, and media passes",
      "Featured design credit across all Nexus social channels"
    ]
  };

  const SECOND_WING_FEE = 200;
  const EARLY_BIRD_RATE = 0.2;

  // DOM Elements
  const navToggle = document.getElementById("navToggle");
  const primaryNav = document.getElementById("primaryNav");

  const form = document.getElementById("membershipForm");
  const fullNameInput = document.getElementById("fullName");
  const rollNumberInput = document.getElementById("rollNumber");
  const nuEmailInput = document.getElementById("nuEmail");
  const githubUrlInput = document.getElementById("githubUrl");
  const primaryWingSelect = document.getElementById("primaryWing");
  const secondaryWingSelect = document.getElementById("secondaryWing");
  const roleRadios = document.querySelectorAll('input[name="rolePreference"]');
  const motivationInput = document.getElementById("motivation");
  const motivationCount = document.getElementById("motivationCount");
  const resetBtn = document.getElementById("resetBtn");

  // Calculator Elements
  const earlyBirdToggle = document.getElementById("earlyBirdToggle");
  const calcRoleLabel = document.getElementById("calcRoleLabel");
  const calcBaseFee = document.getElementById("calcBaseFee");
  const calcWingLabel = document.getElementById("calcWingLabel");
  const calcWingFee = document.getElementById("calcWingFee");
  const calcDiscountRow = document.getElementById("calcDiscountRow");
  const calcDiscountAmount = document.getElementById("calcDiscountAmount");
  const calcTotalFee = document.getElementById("calcTotalFee");
  const perksList = document.getElementById("perksList");

  // Confirmation & Recent Submissions Elements
  const confirmationBox = document.getElementById("confirmationBox");
  const generatedTrackingId = document.getElementById("generatedTrackingId");
  const submitAnotherBtn = document.getElementById("submitAnotherBtn");
  const recentSubmissionsList = document.getElementById("recentSubmissionsList");

  /* ------------------------------------------------------------------------
     1. Mobile Hamburger Navigation
     ------------------------------------------------------------------------ */
  function initNavigation() {
    if (!navToggle || !primaryNav) return;

    navToggle.addEventListener("click", function () {
      const isExpanded = navToggle.getAttribute("aria-expanded") === "true";
      navToggle.setAttribute("aria-expanded", String(!isExpanded));
      primaryNav.classList.toggle("open", !isExpanded);
    });

    // Close menu when a link is clicked on mobile
    primaryNav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        navToggle.setAttribute("aria-expanded", "false");
        primaryNav.classList.remove("open");
      });
    });

    // Close menu on Escape key
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && primaryNav.classList.contains("open")) {
        navToggle.setAttribute("aria-expanded", "false");
        primaryNav.classList.remove("open");
        navToggle.focus();
      }
    });
  }

  /* ------------------------------------------------------------------------
     2. Live Semester Fee & Perks Calculator
     ------------------------------------------------------------------------ */
  function getSelectedRole() {
    const checked = document.querySelector('input[name="rolePreference"]:checked');
    return checked ? checked.value : "General Member";
  }

  function calculateFees() {
    const role = getSelectedRole();
    const baseFee = ROLE_FEES[role] !== undefined ? ROLE_FEES[role] : 500;
    const primaryWing = primaryWingSelect.value;
    const secondaryWing = secondaryWingSelect.value;

    const hasValidSecondWing = Boolean(secondaryWing && secondaryWing !== primaryWing);
    const wingFee = hasValidSecondWing ? SECOND_WING_FEE : 0;
    const subtotal = baseFee + wingFee;
    const discountActive = earlyBirdToggle.checked;
    const discountAmount = discountActive ? Math.round(subtotal * EARLY_BIRD_RATE) : 0;
    const totalFee = subtotal - discountAmount;

    return {
      role: role,
      baseFee: baseFee,
      hasValidSecondWing: hasValidSecondWing,
      secondaryWing: secondaryWing,
      wingFee: wingFee,
      discountActive: discountActive,
      discountAmount: discountAmount,
      totalFee: totalFee
    };
  }

  function renderPerks(role, hasSecondWing, primaryWing, secondaryWing) {
    if (!perksList) return;
    const perks = (ROLE_PERKS[role] || ROLE_PERKS["General Member"]).slice();

    if (primaryWing) {
      perks.push("Primary track access: " + primaryWing + " wing sessions");
    }
    if (hasSecondWing) {
      perks.push("Dual-wing cross-access: " + secondaryWing + " wing labs & projects");
    }

    perksList.innerHTML = "";
    perks.forEach(function (perkText) {
      const li = document.createElement("li");
      li.className = "perk-item";
      li.innerHTML =
        '<svg class="perk-check" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
        '<polyline points="20 6 9 17 4 12"></polyline>' +
        "</svg>";
      const span = document.createElement("span");
      span.textContent = perkText;
      li.appendChild(span);
      perksList.appendChild(li);
    });
  }

  function updateCalculator() {
    const fees = calculateFees();

    calcRoleLabel.textContent = fees.role;
    calcBaseFee.textContent = "Rs " + fees.baseFee;
    calcWingLabel.textContent = fees.hasValidSecondWing ? fees.secondaryWing : "None";
    calcWingFee.textContent = fees.hasValidSecondWing ? "+Rs " + fees.wingFee : "Rs 0";

    if (fees.discountActive) {
      calcDiscountRow.hidden = false;
      calcDiscountAmount.textContent = "-Rs " + fees.discountAmount;
    } else {
      calcDiscountRow.hidden = true;
      calcDiscountAmount.textContent = "-Rs 0";
    }

    calcTotalFee.textContent = "Rs " + fees.totalFee;
    renderPerks(fees.role, fees.hasValidSecondWing, primaryWingSelect.value, fees.secondaryWing);
  }

  /* ------------------------------------------------------------------------
     3. Form Validation Helpers
     ------------------------------------------------------------------------ */
  function setFieldError(inputEl, errorId, message) {
    const errorEl = document.getElementById(errorId);
    const group = inputEl.closest(".form-group");
    if (message) {
      if (group) group.classList.add("has-error");
      inputEl.setAttribute("aria-invalid", "true");
      if (errorEl) errorEl.textContent = message;
      return false;
    } else {
      if (group) group.classList.remove("has-error");
      inputEl.removeAttribute("aria-invalid");
      if (errorEl) errorEl.textContent = "";
      return true;
    }
  }

  function validateFullName() {
    const value = fullNameInput.value.trim();
    if (!value) {
      return setFieldError(fullNameInput, "fullNameError", "Please enter your full name.");
    }
    if (value.length < 3) {
      return setFieldError(fullNameInput, "fullNameError", "Full name must be at least 3 characters.");
    }
    return setFieldError(fullNameInput, "fullNameError", "");
  }

  function validateRollNumber() {
    const value = rollNumberInput.value.trim();
    if (!value) {
      return setFieldError(rollNumberInput, "rollNumberError", "Please enter your NU roll number.");
    }
    if (!ROLL_REGEX.test(value)) {
      return setFieldError(
        rollNumberInput,
        "rollNumberError",
        "Roll number must match format XXI-XXXX (e.g. 24I-0123 or 23i-1045)."
      );
    }
    return setFieldError(rollNumberInput, "rollNumberError", "");
  }

  function validateEmail() {
    const value = nuEmailInput.value.trim();
    if (!value) {
      return setFieldError(nuEmailInput, "nuEmailError", "Please enter your NU email address.");
    }
    if (!NU_EMAIL_REGEX.test(value)) {
      return setFieldError(
        nuEmailInput,
        "nuEmailError",
        "Email must be a valid @nu.edu.pk or @isb.nu.edu.pk address."
      );
    }
    return setFieldError(nuEmailInput, "nuEmailError", "");
  }

  function validateGithubUrl() {
    const value = githubUrlInput.value.trim();
    if (!value) {
      return setFieldError(githubUrlInput, "githubUrlError", "Please enter your GitHub profile URL.");
    }
    if (!GITHUB_REGEX.test(value)) {
      return setFieldError(
        githubUrlInput,
        "githubUrlError",
        "Enter a valid GitHub profile URL (e.g. https://github.com/username)."
      );
    }
    return setFieldError(githubUrlInput, "githubUrlError", "");
  }

  function validatePrimaryWing() {
    if (!primaryWingSelect.value) {
      return setFieldError(primaryWingSelect, "primaryWingError", "Please select your 1st preferred technical wing.");
    }
    return setFieldError(primaryWingSelect, "primaryWingError", "");
  }

  function validateSecondaryWing() {
    const first = primaryWingSelect.value;
    const second = secondaryWingSelect.value;
    if (second && first && second === first) {
      return setFieldError(
        secondaryWingSelect,
        "secondaryWingError",
        "2nd preferred wing cannot be the same as your 1st preferred wing."
      );
    }
    return setFieldError(secondaryWingSelect, "secondaryWingError", "");
  }

  function validateRolePreference() {
    const checked = document.querySelector('input[name="rolePreference"]:checked');
    const errorEl = document.getElementById("rolePreferenceError");
    if (!checked) {
      if (errorEl) errorEl.textContent = "Please choose a role preference.";
      return false;
    }
    if (errorEl) errorEl.textContent = "";
    return true;
  }

  function updateMotivationCounter() {
    const len = motivationInput.value.trim().length;
    motivationCount.textContent = len + " / 20 min chars";
    motivationCount.classList.toggle("met", len >= 20);
  }

  function validateMotivation() {
    const len = motivationInput.value.trim().length;
    if (len === 0) {
      return setFieldError(motivationInput, "motivationError", "Please tell us your motivation for joining.");
    }
    if (len < 20) {
      return setFieldError(
        motivationInput,
        "motivationError",
        "Motivation must be at least 20 characters (" + (20 - len) + " more needed)."
      );
    }
    return setFieldError(motivationInput, "motivationError", "");
  }

  function validateAllFields() {
    const results = [
      validateFullName(),
      validateRollNumber(),
      validateEmail(),
      validateGithubUrl(),
      validatePrimaryWing(),
      validateSecondaryWing(),
      validateRolePreference(),
      validateMotivation()
    ];
    return results.every(Boolean);
  }

  /* ------------------------------------------------------------------------
     4. LocalStorage Persistence & Recent Submissions Rendering
     ------------------------------------------------------------------------ */
  function loadApplications() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (err) {
      return [];
    }
  }

  function saveApplications(apps) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(apps));
  }

  function generateTrackingId(existingApps) {
    const existingIds = new Set(existingApps.map(function (a) { return a.trackingId; }));
    let candidate = "";
    let attempts = 0;
    do {
      const num = Math.floor(100 + Math.random() * 900); // 100-999
      candidate = "APP-2026-" + num;
      attempts += 1;
    } while (existingIds.has(candidate) && attempts < 1000);
    return candidate;
  }

  function formatDate(isoString) {
    try {
      const date = new Date(isoString);
      return date.toLocaleString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });
    } catch (err) {
      return isoString;
    }
  }

  function renderRecentSubmissions() {
    if (!recentSubmissionsList) return;
    const apps = loadApplications();
    recentSubmissionsList.innerHTML = "";

    if (apps.length === 0) {
      const empty = document.createElement("div");
      empty.className = "submission-empty";
      empty.textContent = "No applications submitted yet in this browser. Fill out the form above to apply!";
      recentSubmissionsList.appendChild(empty);
      return;
    }

    // Show newest first
    const ordered = apps.slice().reverse();
    ordered.forEach(function (app) {
      const card = document.createElement("article");
      card.className = "submission-card";

      const top = document.createElement("div");
      top.className = "submission-top";

      const idBadge = document.createElement("span");
      idBadge.className = "submission-id";
      idBadge.textContent = app.trackingId;

      const feeBadge = document.createElement("span");
      feeBadge.className = "submission-fee";
      feeBadge.textContent = "Rs " + app.totalFee;

      top.appendChild(idBadge);
      top.appendChild(feeBadge);

      const nameEl = document.createElement("h3");
      nameEl.className = "submission-name";
      nameEl.textContent = app.fullName;

      const metaEl = document.createElement("p");
      metaEl.className = "submission-meta";
      metaEl.textContent = app.rollNumber + " • " + app.email;

      const tagsEl = document.createElement("div");
      tagsEl.className = "submission-tags";

      const roleTag = document.createElement("span");
      roleTag.className = "submission-tag";
      roleTag.textContent = app.role;
      tagsEl.appendChild(roleTag);

      const wing1Tag = document.createElement("span");
      wing1Tag.className = "submission-tag";
      wing1Tag.textContent = app.primaryWing;
      tagsEl.appendChild(wing1Tag);

      if (app.secondaryWing) {
        const wing2Tag = document.createElement("span");
        wing2Tag.className = "submission-tag";
        wing2Tag.textContent = "+ " + app.secondaryWing;
        tagsEl.appendChild(wing2Tag);
      }

      const dateEl = document.createElement("p");
      dateEl.className = "submission-date";
      dateEl.textContent = "Submitted: " + formatDate(app.submittedAt);

      card.appendChild(top);
      card.appendChild(nameEl);
      card.appendChild(metaEl);
      card.appendChild(tagsEl);
      card.appendChild(dateEl);

      recentSubmissionsList.appendChild(card);
    });
  }

  /* ------------------------------------------------------------------------
     5. Event Listeners & Initialization
     ------------------------------------------------------------------------ */
  function attachFormListeners() {
    fullNameInput.addEventListener("blur", validateFullName);
    fullNameInput.addEventListener("input", function () {
      if (fullNameInput.closest(".form-group").classList.contains("has-error")) {
        validateFullName();
      }
    });

    rollNumberInput.addEventListener("blur", validateRollNumber);
    rollNumberInput.addEventListener("input", function () {
      if (rollNumberInput.closest(".form-group").classList.contains("has-error")) {
        validateRollNumber();
      }
    });

    nuEmailInput.addEventListener("blur", validateEmail);
    nuEmailInput.addEventListener("input", function () {
      if (nuEmailInput.closest(".form-group").classList.contains("has-error")) {
        validateEmail();
      }
    });

    githubUrlInput.addEventListener("blur", validateGithubUrl);
    githubUrlInput.addEventListener("input", function () {
      if (githubUrlInput.closest(".form-group").classList.contains("has-error")) {
        validateGithubUrl();
      }
    });

    primaryWingSelect.addEventListener("change", function () {
      validatePrimaryWing();
      validateSecondaryWing();
      updateCalculator();
    });

    secondaryWingSelect.addEventListener("change", function () {
      validateSecondaryWing();
      updateCalculator();
    });

    roleRadios.forEach(function (radio) {
      radio.addEventListener("change", function () {
        validateRolePreference();
        updateCalculator();
      });
    });

    earlyBirdToggle.addEventListener("change", updateCalculator);

    motivationInput.addEventListener("input", function () {
      updateMotivationCounter();
      if (motivationInput.closest(".form-group").classList.contains("has-error")) {
        validateMotivation();
      }
    });
    motivationInput.addEventListener("blur", validateMotivation);

    resetBtn.addEventListener("click", function () {
      setTimeout(function () {
        form.querySelectorAll(".form-group").forEach(function (g) {
          g.classList.remove("has-error");
        });
        form.querySelectorAll(".error-message").forEach(function (e) {
          e.textContent = "";
        });
        form.querySelectorAll("[aria-invalid]").forEach(function (el) {
          el.removeAttribute("aria-invalid");
        });
        earlyBirdToggle.checked = false;
        updateMotivationCounter();
        updateCalculator();
      }, 0);
    });

    if (submitAnotherBtn) {
      submitAnotherBtn.addEventListener("click", function () {
        confirmationBox.hidden = true;
        form.hidden = false;
        form.reset();
        earlyBirdToggle.checked = false;
        updateMotivationCounter();
        updateCalculator();
        fullNameInput.focus();
      });
    }

    form.addEventListener("submit", function (event) {
      event.preventDefault();

      if (!validateAllFields()) {
        const firstInvalid = form.querySelector('[aria-invalid="true"]');
        if (firstInvalid) {
          firstInvalid.focus();
        }
        return;
      }

      const fees = calculateFees();
      const apps = loadApplications();
      const trackingId = generateTrackingId(apps);

      const newApplication = {
        trackingId: trackingId,
        fullName: fullNameInput.value.trim(),
        rollNumber: rollNumberInput.value.trim().toUpperCase(),
        email: nuEmailInput.value.trim().toLowerCase(),
        githubUrl: githubUrlInput.value.trim(),
        primaryWing: primaryWingSelect.value,
        secondaryWing: fees.hasValidSecondWing ? fees.secondaryWing : "",
        role: fees.role,
        earlyBirdDiscount: fees.discountActive,
        totalFee: fees.totalFee,
        motivation: motivationInput.value.trim(),
        status: "Pending Review",
        submittedAt: new Date().toISOString()
      };

      apps.push(newApplication);
      saveApplications(apps);

      generatedTrackingId.textContent = trackingId;
      confirmationBox.hidden = false;
      form.hidden = true;
      confirmationBox.scrollIntoView({ behavior: "smooth", block: "nearest" });

      renderRecentSubmissions();
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initNavigation();
    attachFormListeners();
    updateMotivationCounter();
    updateCalculator();
    renderRecentSubmissions();
  });
})();
