/* ==========================================================================
   Nexus Computing Society — Student Profile Interactivity
   Pure Vanilla JavaScript (ES6+)
   ========================================================================== */

(function () {
  "use strict";

  const STORAGE_KEY_CURRENT = "ncs_current_student";
  const STORAGE_KEY_USERS = "ncs_registered_students";
  const STORAGE_KEY_EVENTS = "ncs_registered_events";
  const STORAGE_KEY_TASKS = "ncs_student_tasks";
  const STORAGE_KEY_PROFILE = "ncs_student_profile";
  const STORAGE_KEY_PREFS = "ncs_notification_prefs";
  const STORAGE_KEY_SECURITY = "ncs_student_security";
  const STORAGE_KEY_SOCIETIES = "ncs_joined_societies";
  const STORAGE_KEY_BADGES = "ncs_earned_badges";

  const FULL_NAME_REGEX = /^[a-zA-Z][a-zA-Z\s.'-]{1,59}$/;
  const PHONE_ALLOWED_REGEX = /^[+\d\s()-]{7,20}$/;

  const DEFAULT_PROFILE = {
    fullName: "Hamza Tariq",
    rollNo: "26I-3174",
    email: "i263174@isb.nu.edu.pk",
    degreeSection: "BS Software Engineering — SE-1D",
    campus: "FAST-NUCES Islamabad",
    bio: "Software Engineering undergraduate at FAST-NUCES Islamabad passionate about systems programming, web architecture, and open-source collaboration.",
    phone: "+92 300 5550194",
    githubUrl: "https://github.com/hamzatariq-dev",
    linkedinUrl: "https://www.linkedin.com/in/hamza-tariq-se",
    skills: ["C++", "Python", "HTML/CSS", "JavaScript", "Linux"],
  };

  const DEFAULT_PREFS = {
    eventReminders: true,
    societyRecruitment: true,
    weeklyDigest: false,
  };

  let activeSkills = [];
  let prefsBadgeTimeoutId = null;

  document.addEventListener("DOMContentLoaded", () => {
    const profileRoot = document.getElementById("profile-page");
    if (!profileRoot) return;

    initLogoFallback();
    initMobileMenu();
    setFooterYear();
    initSignOutButton();
    initPasswordToggles();

    const state = loadMergedProfile();
    activeSkills = [...state.skills];

    syncNavbarAuthState(state.sessionStudent);
    renderProfileBanner(state);
    renderActivityStats(state.sessionStudent);
    populateEditForm(state);
    renderSkillTags();

    initEditProfileForm();
    initSkillTagManager();
    initNotificationPreferences();
    initPasswordSecurityForm();

    window.addEventListener("storage", () => {
      const updated = loadMergedProfile();
      syncNavbarAuthState(updated.sessionStudent);
      renderActivityStats(updated.sessionStudent);
    });
  });

  /* --------------------------------------------------------------------------
     Shared Shell Helpers (Logo Fallback, Mobile Menu, Footer Year, Sign Out)
     -------------------------------------------------------------------------- */
  function initLogoFallback() {
    document.querySelectorAll(".brand-logo").forEach((img) => {
      const applyFallback = () => {
        if (!img.dataset.fallbackTried) {
          img.dataset.fallbackTried = "true";
          img.src = "../images/logo.jpg";
        }
      };
      if (img.complete && img.naturalWidth === 0) {
        applyFallback();
      } else {
        img.addEventListener("error", applyFallback);
      }
    });
  }

  function initMobileMenu() {
    const navToggle = document.getElementById("nav-toggle");
    const primaryNav = document.getElementById("primary-nav");
    if (!navToggle || !primaryNav) return;

    function setMenuState(isOpen) {
      navToggle.setAttribute("aria-expanded", String(isOpen));
      primaryNav.classList.toggle("is-open", isOpen);
    }

    navToggle.addEventListener("click", () => {
      const currentlyOpen = navToggle.getAttribute("aria-expanded") === "true";
      setMenuState(!currentlyOpen);
    });

    primaryNav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => setMenuState(false));
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && primaryNav.classList.contains("is-open")) {
        setMenuState(false);
        navToggle.focus();
      }
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth > 960 && primaryNav.classList.contains("is-open")) {
        setMenuState(false);
      }
    });
  }

  function setFooterYear() {
    const yearEl = document.getElementById("footer-year");
    if (yearEl) {
      yearEl.textContent = String(new Date().getFullYear());
    }
  }

  function syncNavbarAuthState(sessionStudent) {
    const navLoginItem = document.getElementById("nav-login-item");
    const navSignoutItem = document.getElementById("nav-signout-item");
    const sessionPill = document.getElementById("profile-session-pill");
    const isLoggedIn = Boolean(sessionStudent && sessionStudent.isLoggedIn);

    if (navLoginItem) navLoginItem.hidden = isLoggedIn;
    if (navSignoutItem) navSignoutItem.hidden = !isLoggedIn;
    if (sessionPill) sessionPill.hidden = !isLoggedIn;
  }

  function initSignOutButton() {
    const signOutBtn = document.getElementById("sign-out-btn");
    if (!signOutBtn) return;

    signOutBtn.addEventListener("click", () => {
      const { exists, value } = readStoredJson(STORAGE_KEY_CURRENT);
      if (exists && value && typeof value === "object") {
        value.isLoggedIn = false;
        writeStoredJson(STORAGE_KEY_CURRENT, value);
      } else {
        try {
          localStorage.removeItem(STORAGE_KEY_CURRENT);
        } catch {
          // Ignore storage errors in restricted environments
        }
      }
      window.location.href = "login.html";
    });
  }

  /* --------------------------------------------------------------------------
     localStorage Helpers & Data Merging
     -------------------------------------------------------------------------- */
  function readStoredJson(key) {
    try {
      const raw = localStorage.getItem(key);
      if (raw === null) return { exists: false, value: null };
      return { exists: true, value: JSON.parse(raw) };
    } catch {
      return { exists: false, value: null };
    }
  }

  function writeStoredJson(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  }

  function loadMergedProfile() {
    const currentResult = readStoredJson(STORAGE_KEY_CURRENT);
    const sessionStudent =
      currentResult.exists && currentResult.value && typeof currentResult.value === "object"
        ? currentResult.value
        : null;

    const savedProfileResult = readStoredJson(STORAGE_KEY_PROFILE);
    const savedProfile =
      savedProfileResult.exists &&
      savedProfileResult.value &&
      typeof savedProfileResult.value === "object"
        ? savedProfileResult.value
        : {};

    const hasActiveSession = Boolean(sessionStudent && sessionStudent.isLoggedIn);
    const sessionMatchesSaved =
      hasActiveSession &&
      savedProfile.rollNo &&
      sessionStudent.rollNo &&
      savedProfile.rollNo.toUpperCase() === sessionStudent.rollNo.toUpperCase();

    const fullName =
      (sessionMatchesSaved && savedProfile.fullName) ||
      (hasActiveSession && sessionStudent.name) ||
      savedProfile.fullName ||
      DEFAULT_PROFILE.fullName;

    const rollNo =
      (hasActiveSession && sessionStudent.rollNo) ||
      savedProfile.rollNo ||
      DEFAULT_PROFILE.rollNo;

    const email =
      (hasActiveSession && sessionStudent.email) ||
      savedProfile.email ||
      DEFAULT_PROFILE.email;

    let degreeSection = DEFAULT_PROFILE.degreeSection;
    if (hasActiveSession && sessionStudent.department) {
      const section = savedProfile.section || "SE-1D";
      degreeSection = sessionStudent.department.includes("—")
        ? sessionStudent.department
        : `${sessionStudent.department} — ${section}`;
    } else if (savedProfile.degreeSection) {
      degreeSection = savedProfile.degreeSection;
    }

    const skills = Array.isArray(savedProfile.skills)
      ? savedProfile.skills.filter((item) => typeof item === "string" && item.trim().length > 0)
      : [...DEFAULT_PROFILE.skills];

    return {
      sessionStudent,
      fullName,
      rollNo,
      email,
      degreeSection,
      campus: savedProfile.campus || DEFAULT_PROFILE.campus,
      bio: typeof savedProfile.bio === "string" ? savedProfile.bio : DEFAULT_PROFILE.bio,
      phone: typeof savedProfile.phone === "string" ? savedProfile.phone : DEFAULT_PROFILE.phone,
      githubUrl:
        typeof savedProfile.githubUrl === "string"
          ? savedProfile.githubUrl
          : DEFAULT_PROFILE.githubUrl,
      linkedinUrl:
        typeof savedProfile.linkedinUrl === "string"
          ? savedProfile.linkedinUrl
          : DEFAULT_PROFILE.linkedinUrl,
      skills,
    };
  }

  /* --------------------------------------------------------------------------
     1. Profile Overview Banner & Live Activity Stats
     -------------------------------------------------------------------------- */
  function computeInitials(fullName) {
    const words = String(fullName || "")
      .trim()
      .split(/\s+/)
      .filter(Boolean);
    if (words.length === 0) return "NC";
    if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
    return (words[0][0] + words[words.length - 1][0]).toUpperCase();
  }

  function renderProfileBanner(profile) {
    const avatarEl = document.getElementById("profile-avatar");
    const nameEl = document.getElementById("profile-name-heading");
    const bioEl = document.getElementById("profile-bio-preview");
    const rollEl = document.getElementById("profile-roll");
    const degreeEl = document.getElementById("profile-degree-section");
    const campusEl = document.getElementById("profile-campus");
    const emailChip = document.getElementById("profile-email-chip");
    const emailEl = document.getElementById("profile-email");

    const quickLinksEl = document.getElementById("profile-quick-links");
    const githubLink = document.getElementById("profile-github-link");
    const linkedinLink = document.getElementById("profile-linkedin-link");

    if (avatarEl) avatarEl.textContent = computeInitials(profile.fullName);
    if (nameEl) nameEl.textContent = profile.fullName || DEFAULT_PROFILE.fullName;
    if (bioEl) {
      bioEl.textContent = profile.bio.trim()
        ? profile.bio.trim()
        : "No bio added yet. Share your computing interests in the editor below.";
    }
    if (rollEl) rollEl.textContent = profile.rollNo || DEFAULT_PROFILE.rollNo;
    if (degreeEl) degreeEl.textContent = profile.degreeSection || DEFAULT_PROFILE.degreeSection;
    if (campusEl) campusEl.textContent = profile.campus || DEFAULT_PROFILE.campus;

    if (emailChip && emailEl) {
      if (profile.email) {
        emailEl.textContent = profile.email;
        emailChip.hidden = false;
      } else {
        emailChip.hidden = true;
      }
    }

    const hasGithub = Boolean(profile.githubUrl && isValidHttpUrl(profile.githubUrl));
    const hasLinkedin = Boolean(profile.linkedinUrl && isValidHttpUrl(profile.linkedinUrl));

    if (githubLink) {
      githubLink.hidden = !hasGithub;
      if (hasGithub) githubLink.href = profile.githubUrl;
    }
    if (linkedinLink) {
      linkedinLink.hidden = !hasLinkedin;
      if (hasLinkedin) linkedinLink.href = profile.linkedinUrl;
    }
    if (quickLinksEl) {
      quickLinksEl.hidden = !hasGithub && !hasLinkedin;
    }
  }

  function renderActivityStats(sessionStudent) {
    const societiesEl = document.getElementById("stat-societies");
    const eventsEl = document.getElementById("stat-events");
    const badgesEl = document.getElementById("stat-badges");

    // Joined Societies count
    let societiesCount = 3;
    const storedSocieties = readStoredJson(STORAGE_KEY_SOCIETIES);
    if (storedSocieties.exists && Array.isArray(storedSocieties.value)) {
      societiesCount = storedSocieties.value.length;
    } else if (sessionStudent && Array.isArray(sessionStudent.wings)) {
      societiesCount = sessionStudent.wings.length;
    } else if (sessionStudent && Number.isFinite(Number(sessionStudent.joinedWings))) {
      societiesCount = Number(sessionStudent.joinedWings);
    }

    // Registered Events count (synced with dashboard's ncs_registered_events)
    let eventsCount = 2;
    const storedEvents = readStoredJson(STORAGE_KEY_EVENTS);
    if (storedEvents.exists && Array.isArray(storedEvents.value)) {
      eventsCount = storedEvents.value.length;
    }

    // Earned Badges count
    let badgesCount = 4;
    const storedBadges = readStoredJson(STORAGE_KEY_BADGES);
    if (storedBadges.exists) {
      if (Array.isArray(storedBadges.value)) {
        badgesCount = storedBadges.value.length;
      } else if (Number.isFinite(Number(storedBadges.value))) {
        badgesCount = Number(storedBadges.value);
      }
    } else {
      const storedTasks = readStoredJson(STORAGE_KEY_TASKS);
      if (storedTasks.exists && Array.isArray(storedTasks.value)) {
        const completedCount = storedTasks.value.filter((t) => t && t.completed).length;
        badgesCount = 3 + completedCount;
      }
    }

    if (societiesEl) societiesEl.textContent = String(societiesCount);
    if (eventsEl) eventsEl.textContent = String(eventsCount);
    if (badgesEl) badgesEl.textContent = String(badgesCount);
  }

  /* --------------------------------------------------------------------------
     2. Interactive Edit Profile Form & Validation
     -------------------------------------------------------------------------- */
  function populateEditForm(profile) {
    const nameInput = document.getElementById("profile-input-name");
    const bioInput = document.getElementById("profile-input-bio");
    const phoneInput = document.getElementById("profile-input-phone");
    const githubInput = document.getElementById("profile-input-github");
    const linkedinInput = document.getElementById("profile-input-linkedin");

    if (nameInput) nameInput.value = profile.fullName || "";
    if (bioInput) bioInput.value = profile.bio || "";
    if (phoneInput) phoneInput.value = profile.phone || "";
    if (githubInput) githubInput.value = profile.githubUrl || "";
    if (linkedinInput) linkedinInput.value = profile.linkedinUrl || "";

    updateBioCharCount();
  }

  function updateBioCharCount() {
    const bioInput = document.getElementById("profile-input-bio");
    const counterEl = document.getElementById("bio-char-count");
    if (!bioInput || !counterEl) return;
    counterEl.textContent = `${bioInput.value.length} / 240`;
  }

  function setFieldError(input, errorEl, message) {
    if (!input || !errorEl) return false;
    input.classList.add("is-invalid");
    input.classList.remove("is-valid");
    input.setAttribute("aria-invalid", "true");
    errorEl.textContent = message;
    errorEl.hidden = false;
    return false;
  }

  function clearFieldError(input, errorEl, markValid) {
    if (!input || !errorEl) return true;
    input.classList.remove("is-invalid");
    input.removeAttribute("aria-invalid");
    if (markValid) {
      input.classList.add("is-valid");
    } else {
      input.classList.remove("is-valid");
    }
    errorEl.textContent = "";
    errorEl.hidden = true;
    return true;
  }

  function showStatusBanner(elementId, message, type) {
    const el = document.getElementById(elementId);
    if (!el) return;
    el.textContent = message;
    el.className = "profile-status-banner " + (type === "error" ? "is-error" : "is-success");
    el.hidden = false;
  }

  function hideStatusBanner(elementId) {
    const el = document.getElementById(elementId);
    if (!el) return;
    el.textContent = "";
    el.hidden = true;
  }

  function isValidHttpUrl(value) {
    try {
      const parsed = new URL(value);
      return parsed.protocol === "http:" || parsed.protocol === "https:";
    } catch {
      return false;
    }
  }

  function initEditProfileForm() {
    const form = document.getElementById("profile-edit-form");
    const nameInput = document.getElementById("profile-input-name");
    const nameError = document.getElementById("profile-input-name-error");
    const bioInput = document.getElementById("profile-input-bio");
    const bioError = document.getElementById("profile-input-bio-error");
    const phoneInput = document.getElementById("profile-input-phone");
    const phoneError = document.getElementById("profile-input-phone-error");
    const githubInput = document.getElementById("profile-input-github");
    const githubError = document.getElementById("profile-input-github-error");
    const linkedinInput = document.getElementById("profile-input-linkedin");
    const linkedinError = document.getElementById("profile-input-linkedin-error");

    if (!form) return;

    function validateName() {
      const value = nameInput.value.trim();
      if (!value) {
        return setFieldError(nameInput, nameError, "Full name is required.");
      }
      if (!FULL_NAME_REGEX.test(value)) {
        return setFieldError(
          nameInput,
          nameError,
          "Enter a valid full name (at least 2 alphabetic characters)."
        );
      }
      return clearFieldError(nameInput, nameError, true);
    }

    function validateBio() {
      const value = bioInput.value.trim();
      if (value.length > 240) {
        return setFieldError(bioInput, bioError, "Display bio must be 240 characters or fewer.");
      }
      return clearFieldError(bioInput, bioError, value.length > 0);
    }

    function validatePhone() {
      const value = phoneInput.value.trim();
      if (!value) {
        return clearFieldError(phoneInput, phoneError, false);
      }
      const digitsOnly = value.replace(/\D/g, "");
      if (!PHONE_ALLOWED_REGEX.test(value) || digitsOnly.length < 10 || digitsOnly.length > 15) {
        return setFieldError(
          phoneInput,
          phoneError,
          "Enter a valid phone number with 10 to 15 digits (e.g. +92 300 5550194)."
        );
      }
      return clearFieldError(phoneInput, phoneError, true);
    }

    function validateSocialUrl(input, errorEl, expectedHost, label) {
      const value = input.value.trim();
      if (!value) {
        return clearFieldError(input, errorEl, false);
      }
      if (!isValidHttpUrl(value)) {
        return setFieldError(
          input,
          errorEl,
          `Enter a valid ${label} URL starting with https://`
        );
      }
      const hostname = new URL(value).hostname.toLowerCase();
      if (expectedHost && !hostname.includes(expectedHost)) {
        return setFieldError(
          input,
          errorEl,
          `URL must be a valid ${label} profile link (${expectedHost}).`
        );
      }
      return clearFieldError(input, errorEl, true);
    }

    nameInput.addEventListener("blur", validateName);
    nameInput.addEventListener("input", () => {
      if (nameInput.classList.contains("is-invalid") || nameInput.value.trim().length > 0) {
        validateName();
      }
    });

    bioInput.addEventListener("input", () => {
      updateBioCharCount();
      if (bioInput.classList.contains("is-invalid")) {
        validateBio();
      }
    });
    bioInput.addEventListener("blur", validateBio);

    phoneInput.addEventListener("blur", validatePhone);
    phoneInput.addEventListener("input", () => {
      if (phoneInput.classList.contains("is-invalid")) {
        validatePhone();
      }
    });

    githubInput.addEventListener("blur", () =>
      validateSocialUrl(githubInput, githubError, "github.com", "GitHub")
    );
    githubInput.addEventListener("input", () => {
      if (githubInput.classList.contains("is-invalid")) {
        validateSocialUrl(githubInput, githubError, "github.com", "GitHub");
      }
    });

    linkedinInput.addEventListener("blur", () =>
      validateSocialUrl(linkedinInput, linkedinError, "linkedin.com", "LinkedIn")
    );
    linkedinInput.addEventListener("input", () => {
      if (linkedinInput.classList.contains("is-invalid")) {
        validateSocialUrl(linkedinInput, linkedinError, "linkedin.com", "LinkedIn");
      }
    });

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      hideStatusBanner("profile-save-status");

      const checks = [
        validateName(),
        validateBio(),
        validatePhone(),
        validateSocialUrl(githubInput, githubError, "github.com", "GitHub"),
        validateSocialUrl(linkedinInput, linkedinError, "linkedin.com", "LinkedIn"),
      ];

      if (checks.includes(false)) {
        showStatusBanner(
          "profile-save-status",
          "Please resolve the highlighted fields before saving your profile.",
          "error"
        );
        const firstInvalid = form.querySelector(".is-invalid");
        if (firstInvalid) firstInvalid.focus();
        return;
      }

      const currentState = loadMergedProfile();
      const updatedProfile = {
        fullName: nameInput.value.trim(),
        rollNo: currentState.rollNo,
        email: currentState.email,
        degreeSection: currentState.degreeSection,
        campus: currentState.campus,
        bio: bioInput.value.trim(),
        phone: phoneInput.value.trim(),
        githubUrl: githubInput.value.trim(),
        linkedinUrl: linkedinInput.value.trim(),
        skills: [...activeSkills],
        updatedAt: new Date().toISOString(),
      };

      const savedOk = writeStoredJson(STORAGE_KEY_PROFILE, updatedProfile);
      if (!savedOk) {
        showStatusBanner(
          "profile-save-status",
          "Unable to access browser storage. Please enable localStorage and try again.",
          "error"
        );
        return;
      }

      syncUpdatedNameToSessionAndDirectory(updatedProfile);
      renderProfileBanner({ ...currentState, ...updatedProfile });

      showStatusBanner(
        "profile-save-status",
        `Profile changes saved for ${updatedProfile.fullName} (${updatedProfile.rollNo}).`,
        "success"
      );
    });
  }

  function syncUpdatedNameToSessionAndDirectory(updatedProfile) {
    const currentResult = readStoredJson(STORAGE_KEY_CURRENT);
    if (currentResult.exists && currentResult.value && typeof currentResult.value === "object") {
      currentResult.value.name = updatedProfile.fullName;
      writeStoredJson(STORAGE_KEY_CURRENT, currentResult.value);
    }

    const usersResult = readStoredJson(STORAGE_KEY_USERS);
    if (usersResult.exists && Array.isArray(usersResult.value)) {
      let modified = false;
      const updatedUsers = usersResult.value.map((student) => {
        if (
          student &&
          typeof student === "object" &&
          student.rollNo &&
          student.rollNo.toUpperCase() === updatedProfile.rollNo.toUpperCase()
        ) {
          modified = true;
          return { ...student, name: updatedProfile.fullName };
        }
        return student;
      });
      if (modified) {
        writeStoredJson(STORAGE_KEY_USERS, updatedUsers);
      }
    }
  }

  /* --------------------------------------------------------------------------
     Interactive Technical Skills Tag Manager
     -------------------------------------------------------------------------- */
  function initSkillTagManager() {
    const skillInput = document.getElementById("new-skill-input");
    const addBtn = document.getElementById("add-skill-btn");
    const errorEl = document.getElementById("skill-input-error");

    if (!skillInput || !addBtn) return;

    function handleAddSkill() {
      const rawValue = skillInput.value.trim().replace(/\s+/g, " ");
      if (!rawValue) {
        setFieldError(skillInput, errorEl, "Enter a technical skill name before adding.");
        skillInput.focus();
        return;
      }
      if (rawValue.length > 30) {
        setFieldError(skillInput, errorEl, "Skill name must be 30 characters or fewer.");
        skillInput.focus();
        return;
      }
      const duplicate = activeSkills.some(
        (existing) => existing.toLowerCase() === rawValue.toLowerCase()
      );
      if (duplicate) {
        setFieldError(skillInput, errorEl, `"${rawValue}" is already in your skills list.`);
        skillInput.focus();
        return;
      }

      clearFieldError(skillInput, errorEl, false);
      activeSkills.push(rawValue);
      skillInput.value = "";
      renderSkillTags();
      skillInput.focus();
    }

    addBtn.addEventListener("click", handleAddSkill);

    skillInput.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        handleAddSkill();
      }
    });

    skillInput.addEventListener("input", () => {
      if (skillInput.classList.contains("is-invalid") && skillInput.value.trim().length > 0) {
        clearFieldError(skillInput, errorEl, false);
      }
    });
  }

  function renderSkillTags() {
    const listEl = document.getElementById("skills-tag-list");
    const emptyEl = document.getElementById("skills-empty-state");
    if (!listEl) return;

    listEl.innerHTML = "";

    if (activeSkills.length === 0) {
      if (emptyEl) emptyEl.hidden = false;
      return;
    }

    if (emptyEl) emptyEl.hidden = true;

    activeSkills.forEach((skill, index) => {
      const li = document.createElement("li");
      li.className = "skill-pill";

      const labelSpan = document.createElement("span");
      labelSpan.className = "skill-pill-text";
      labelSpan.textContent = skill;

      const removeBtn = document.createElement("button");
      removeBtn.type = "button";
      removeBtn.className = "skill-remove-btn";
      removeBtn.setAttribute("aria-label", `Remove skill ${skill}`);
      removeBtn.textContent = "×";

      removeBtn.addEventListener("click", () => {
        activeSkills.splice(index, 1);
        renderSkillTags();
      });

      li.appendChild(labelSpan);
      li.appendChild(removeBtn);
      listEl.appendChild(li);
    });
  }

  /* --------------------------------------------------------------------------
     3. Notification Preferences (Auto-Saved to localStorage)
     -------------------------------------------------------------------------- */
  function initNotificationPreferences() {
    const eventAlertsToggle = document.getElementById("pref-event-reminders");
    const recruitmentToggle = document.getElementById("pref-recruitment");
    const weeklyDigestToggle = document.getElementById("pref-weekly-digest");

    if (!eventAlertsToggle || !recruitmentToggle || !weeklyDigestToggle) return;

    const stored = readStoredJson(STORAGE_KEY_PREFS);
    const prefs =
      stored.exists && stored.value && typeof stored.value === "object"
        ? { ...DEFAULT_PREFS, ...stored.value }
        : { ...DEFAULT_PREFS };

    eventAlertsToggle.checked = Boolean(prefs.eventReminders);
    recruitmentToggle.checked = Boolean(prefs.societyRecruitment);
    weeklyDigestToggle.checked = Boolean(prefs.weeklyDigest);

    function savePreferences() {
      const nextPrefs = {
        eventReminders: eventAlertsToggle.checked,
        societyRecruitment: recruitmentToggle.checked,
        weeklyDigest: weeklyDigestToggle.checked,
        updatedAt: new Date().toISOString(),
      };
      writeStoredJson(STORAGE_KEY_PREFS, nextPrefs);
      flashPrefsSavedBadge();
    }

    eventAlertsToggle.addEventListener("change", savePreferences);
    recruitmentToggle.addEventListener("change", savePreferences);
    weeklyDigestToggle.addEventListener("change", savePreferences);
  }

  function flashPrefsSavedBadge() {
    const badge = document.getElementById("prefs-saved-badge");
    if (!badge) return;

    badge.hidden = false;
    if (prefsBadgeTimeoutId) {
      window.clearTimeout(prefsBadgeTimeoutId);
    }
    prefsBadgeTimeoutId = window.setTimeout(() => {
      badge.hidden = true;
    }, 2000);
  }

  /* --------------------------------------------------------------------------
     Password Security Form & Live Strength Meter
     -------------------------------------------------------------------------- */
  function initPasswordToggles() {
    document.querySelectorAll(".password-toggle").forEach((button) => {
      button.addEventListener("click", () => {
        const input = document.getElementById(button.dataset.target);
        if (!input) return;

        const isPassword = input.type === "password";
        input.type = isPassword ? "text" : "password";
        button.setAttribute("aria-pressed", String(isPassword));
        button.setAttribute("aria-label", isPassword ? "Hide password" : "Show password");

        const eyeIcon = button.querySelector(".icon-eye");
        const eyeOffIcon = button.querySelector(".icon-eye-off");
        if (eyeIcon && eyeOffIcon) {
          eyeIcon.hidden = isPassword;
          eyeOffIcon.hidden = !isPassword;
        }
      });
    });
  }

  function evaluatePasswordStrength(password) {
    const checks = {
      length: password.length >= 8,
      upper: /[A-Z]/.test(password),
      number: /[0-9]/.test(password),
      symbol: /[^A-Za-z0-9]/.test(password),
    };

    const score = Object.values(checks).filter(Boolean).length;
    let level = "empty";
    let text = "Not set";

    if (password.length > 0) {
      if (score <= 1 || password.length < 6) {
        level = "weak";
        text = "Weak";
      } else if (score <= 3) {
        level = "medium";
        text = "Medium";
      } else {
        level = "strong";
        text = "Strong";
      }
    }

    return { checks, score, level, text };
  }

  function updateStrengthMeterUI(password) {
    const meter = document.getElementById("profile-strength-meter");
    const label = document.getElementById("profile-strength-label");
    const reqLength = document.getElementById("prof-req-length");
    const reqUpper = document.getElementById("prof-req-upper");
    const reqNumber = document.getElementById("prof-req-number");
    const reqSymbol = document.getElementById("prof-req-symbol");

    if (!meter || !label) return;

    const { checks, level, text } = evaluatePasswordStrength(password);
    meter.dataset.strength = level;
    label.textContent = text;

    if (reqLength) reqLength.classList.toggle("is-met", checks.length);
    if (reqUpper) reqUpper.classList.toggle("is-met", checks.upper);
    if (reqNumber) reqNumber.classList.toggle("is-met", checks.number);
    if (reqSymbol) reqSymbol.classList.toggle("is-met", checks.symbol);
  }

  function hashPasswordPreview(password) {
    let hash = 2166136261;
    for (let i = 0; i < password.length; i += 1) {
      hash ^= password.charCodeAt(i);
      hash = Math.imul(hash, 16777619);
    }
    return "fnv1a_" + (hash >>> 0).toString(16);
  }

  function initPasswordSecurityForm() {
    const form = document.getElementById("password-update-form");
    const currentInput = document.getElementById("current-password");
    const currentError = document.getElementById("current-password-error");
    const newInput = document.getElementById("new-password");
    const newError = document.getElementById("new-password-error");
    const confirmInput = document.getElementById("confirm-password");
    const confirmError = document.getElementById("confirm-password-error");

    if (!form || !currentInput || !newInput || !confirmInput) return;

    function validateCurrentPassword() {
      const value = currentInput.value;
      if (!value || value.trim().length === 0) {
        return setFieldError(currentInput, currentError, "Please enter your current password.");
      }

      const storedSecurity = readStoredJson(STORAGE_KEY_SECURITY);
      if (
        storedSecurity.exists &&
        storedSecurity.value &&
        storedSecurity.value.passwordHash &&
        storedSecurity.value.passwordHash !== hashPasswordPreview(value)
      ) {
        return setFieldError(
          currentInput,
          currentError,
          "Current password does not match your saved password."
        );
      }

      return clearFieldError(currentInput, currentError, true);
    }

    function validateNewPassword() {
      const value = newInput.value;
      const strength = evaluatePasswordStrength(value);

      if (!value) {
        return setFieldError(newInput, newError, "Please enter a new password.");
      }
      if (value.length < 8) {
        return setFieldError(
          newInput,
          newError,
          "New password must be at least 8 characters long."
        );
      }
      if (strength.level === "weak") {
        return setFieldError(
          newInput,
          newError,
          "Password is too weak. Include uppercase letters, numbers, or symbols."
        );
      }
      if (currentInput.value && value === currentInput.value) {
        return setFieldError(
          newInput,
          newError,
          "New password must be different from your current password."
        );
      }
      return clearFieldError(newInput, newError, true);
    }

    function validateConfirmPassword() {
      const value = confirmInput.value;
      if (!value) {
        return setFieldError(confirmInput, confirmError, "Please confirm your new password.");
      }
      if (value !== newInput.value) {
        return setFieldError(confirmInput, confirmError, "Passwords do not match.");
      }
      return clearFieldError(confirmInput, confirmError, true);
    }

    currentInput.addEventListener("blur", validateCurrentPassword);
    currentInput.addEventListener("input", () => {
      if (currentInput.classList.contains("is-invalid") && currentInput.value.length > 0) {
        validateCurrentPassword();
      }
    });

    newInput.addEventListener("input", () => {
      updateStrengthMeterUI(newInput.value);
      if (newInput.classList.contains("is-invalid")) {
        validateNewPassword();
      }
      if (confirmInput.value.length > 0) {
        validateConfirmPassword();
      }
    });
    newInput.addEventListener("blur", validateNewPassword);

    confirmInput.addEventListener("input", () => {
      if (confirmInput.classList.contains("is-invalid") || confirmInput.value.length > 0) {
        validateConfirmPassword();
      }
    });
    confirmInput.addEventListener("blur", validateConfirmPassword);

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      hideStatusBanner("password-status");

      const checks = [
        validateCurrentPassword(),
        validateNewPassword(),
        validateConfirmPassword(),
      ];

      if (checks.includes(false)) {
        const firstInvalid = form.querySelector(".is-invalid");
        if (firstInvalid) firstInvalid.focus();
        return;
      }

      const savedOk = writeStoredJson(STORAGE_KEY_SECURITY, {
        passwordHash: hashPasswordPreview(newInput.value),
        updatedAt: new Date().toISOString(),
      });

      if (!savedOk) {
        showStatusBanner(
          "password-status",
          "Unable to save password update. Please ensure localStorage is enabled.",
          "error"
        );
        return;
      }

      form.reset();
      updateStrengthMeterUI("");
      clearFieldError(currentInput, currentError, false);
      clearFieldError(newInput, newError, false);
      clearFieldError(confirmInput, confirmError, false);

      showStatusBanner(
        "password-status",
        "Your portal password has been updated securely.",
        "success"
      );
    });
  }
})();
