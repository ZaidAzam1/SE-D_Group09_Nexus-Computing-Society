/* ==========================================================================
   Nexus Computing Society — Student Login & Registration Interactivity
   Pure Vanilla JavaScript (ES6+)
   ========================================================================== */

(function () {
  "use strict";

  const STORAGE_KEY_CURRENT = "ncs_current_student";
  const STORAGE_KEY_USERS = "ncs_registered_students";
  const ROLL_NUMBER_REGEX = /^[0-9]{2}[iI]-[0-9]{4}$/;
  const NU_EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@(?:isb\.)?nu\.edu\.pk$/i;
  const FULL_NAME_REGEX = /^[a-zA-Z][a-zA-Z\s.'-]{1,59}$/;

  document.addEventListener("DOMContentLoaded", () => {
    initLogoFallback();
    initMobileMenu();
    initTabs();
    initPasswordToggles();
    initLoginForm();
    initRegisterForm();
    initDemoLogin();
    checkExistingSession();
    setFooterYear();
  });

  /* --------------------------------------------------------------------------
     Logo Image Fallback (supports ../images/logo.png with ../images/logo.jpg)
     -------------------------------------------------------------------------- */
  function initLogoFallback() {
    const logos = document.querySelectorAll(".brand-logo");
    logos.forEach((img) => {
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

  /* --------------------------------------------------------------------------
     Responsive Mobile Hamburger Menu
     -------------------------------------------------------------------------- */
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

  /* --------------------------------------------------------------------------
     Interactive Login / Create Account Tabs
     -------------------------------------------------------------------------- */
  function initTabs() {
    const tabButtons = Array.from(document.querySelectorAll(".auth-tab"));
    const panels = {
      login: document.getElementById("panel-login"),
      register: document.getElementById("panel-register"),
    };

    if (!tabButtons.length) return;

    function activateTab(targetName) {
      tabButtons.forEach((btn) => {
        const isTarget = btn.dataset.tab === targetName;
        btn.classList.toggle("is-active", isTarget);
        btn.setAttribute("aria-selected", String(isTarget));
        btn.tabIndex = isTarget ? 0 : -1;
      });

      Object.entries(panels).forEach(([key, panel]) => {
        if (!panel) return;
        const isTarget = key === targetName;
        panel.hidden = !isTarget;
        panel.classList.toggle("is-active", isTarget);
      });

      hideAuthStatus();
    }

    tabButtons.forEach((btn, index) => {
      btn.addEventListener("click", () => {
        activateTab(btn.dataset.tab);
      });

      btn.addEventListener("keydown", (event) => {
        if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
          event.preventDefault();
          const nextIndex =
            event.key === "ArrowRight"
              ? (index + 1) % tabButtons.length
              : (index - 1 + tabButtons.length) % tabButtons.length;
          tabButtons[nextIndex].focus();
          activateTab(tabButtons[nextIndex].dataset.tab);
        }
      });
    });
  }

  /* --------------------------------------------------------------------------
     Show / Hide Password Toggle
     -------------------------------------------------------------------------- */
  function initPasswordToggles() {
    const toggleButtons = document.querySelectorAll(".password-toggle");

    toggleButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const inputId = button.dataset.target;
        const input = document.getElementById(inputId);
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

  /* --------------------------------------------------------------------------
     Validation Helpers
     -------------------------------------------------------------------------- */
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

  function showAuthStatus(message, type) {
    const statusEl = document.getElementById("auth-status");
    if (!statusEl) return;
    statusEl.textContent = message;
    statusEl.className = "auth-status " + (type === "error" ? "is-error" : "is-success");
    statusEl.hidden = false;
  }

  function hideAuthStatus() {
    const statusEl = document.getElementById("auth-status");
    if (!statusEl) return;
    statusEl.textContent = "";
    statusEl.hidden = true;
  }

  function normalizeRollNo(value) {
    return value.trim().toUpperCase();
  }

  /* --------------------------------------------------------------------------
     Student Login Form Validation & Submission
     -------------------------------------------------------------------------- */
  function initLoginForm() {
    const form = document.getElementById("login-form");
    const identifierInput = document.getElementById("login-identifier");
    const identifierError = document.getElementById("login-identifier-error");
    const passwordInput = document.getElementById("login-password");
    const passwordError = document.getElementById("login-password-error");

    if (!form || !identifierInput || !passwordInput) return;

    function validateIdentifier() {
      const value = identifierInput.value.trim();
      if (!value) {
        return setFieldError(
          identifierInput,
          identifierError,
          "Please enter your Roll Number (e.g. 23I-0542) or NU Email."
        );
      }

      const isRollNo = ROLL_NUMBER_REGEX.test(value);
      const isNuEmail = NU_EMAIL_REGEX.test(value);

      if (!isRollNo && !isNuEmail) {
        return setFieldError(
          identifierInput,
          identifierError,
          "Enter a valid Roll Number (XXi-XXXX) or @nu.edu.pk / @isb.nu.edu.pk email."
        );
      }

      return clearFieldError(identifierInput, identifierError, true);
    }

    function validateLoginPassword() {
      const value = passwordInput.value;
      if (!value || value.trim().length === 0) {
        return setFieldError(passwordInput, passwordError, "Please enter your password.");
      }
      return clearFieldError(passwordInput, passwordError, true);
    }

    identifierInput.addEventListener("blur", validateIdentifier);
    identifierInput.addEventListener("input", () => {
      if (identifierInput.classList.contains("is-invalid") || identifierInput.value.trim().length > 0) {
        validateIdentifier();
      }
    });

    passwordInput.addEventListener("blur", validateLoginPassword);
    passwordInput.addEventListener("input", () => {
      if (passwordInput.classList.contains("is-invalid") || passwordInput.value.length > 0) {
        validateLoginPassword();
      }
    });

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      hideAuthStatus();

      const isIdentifierValid = validateIdentifier();
      const isPasswordValid = validateLoginPassword();

      if (!isIdentifierValid || !isPasswordValid) {
        const firstInvalid = form.querySelector(".is-invalid");
        if (firstInvalid) firstInvalid.focus();
        return;
      }

      const identifier = identifierInput.value.trim();
      const studentObj = resolveStudentFromIdentifier(identifier);
      persistAndRedirect(studentObj, `Welcome back, ${studentObj.name}! Redirecting to your dashboard...`);
    });
  }

  function resolveStudentFromIdentifier(identifier) {
    const registered = getRegisteredStudents();
    const isRoll = ROLL_NUMBER_REGEX.test(identifier);
    const normalizedId = isRoll ? normalizeRollNo(identifier) : identifier.toLowerCase();

    const matched = registered.find((student) => {
      if (isRoll) {
        return normalizeRollNo(student.rollNo) === normalizedId;
      }
      return student.email.toLowerCase() === normalizedId;
    });

    if (matched) {
      return {
        name: matched.name,
        rollNo: normalizeRollNo(matched.rollNo),
        email: matched.email.toLowerCase(),
        department: matched.department,
        isLoggedIn: true,
      };
    }

    if (isRoll) {
      const digits = normalizedId.replace(/[^0-9]/g, "");
      const derivedEmail = `i${digits}@isb.nu.edu.pk`;
      return {
        name: `Student ${normalizedId}`,
        rollNo: normalizedId,
        email: derivedEmail,
        department: "BS Computer Science",
        isLoggedIn: true,
      };
    }

    const emailLower = identifier.toLowerCase();
    const localPart = emailLower.split("@")[0];
    const rollMatch = localPart.match(/^[a-z]?([0-9]{2})([0-9]{4})$/i);
    const derivedRoll = rollMatch ? `${rollMatch[1]}I-${rollMatch[2]}` : "23I-0000";
    const formattedName = localPart
      .replace(/[._-]+/g, " ")
      .replace(/\b\w/g, (ch) => ch.toUpperCase());

    return {
      name: formattedName || "NCS Student",
      rollNo: derivedRoll,
      email: emailLower,
      department: "BS Computer Science",
      isLoggedIn: true,
    };
  }

  /* --------------------------------------------------------------------------
     Create Account Form Validation & Live Password Strength Meter
     -------------------------------------------------------------------------- */
  function initRegisterForm() {
    const form = document.getElementById("register-form");
    const nameInput = document.getElementById("reg-name");
    const nameError = document.getElementById("reg-name-error");
    const rollInput = document.getElementById("reg-roll");
    const rollError = document.getElementById("reg-roll-error");
    const deptSelect = document.getElementById("reg-department");
    const deptError = document.getElementById("reg-department-error");
    const emailInput = document.getElementById("reg-email");
    const emailError = document.getElementById("reg-email-error");
    const passwordInput = document.getElementById("reg-password");
    const passwordError = document.getElementById("reg-password-error");

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

    function validateRoll() {
      const value = rollInput.value.trim();
      if (!value) {
        return setFieldError(rollInput, rollError, "Roll number is required.");
      }
      if (!ROLL_NUMBER_REGEX.test(value)) {
        return setFieldError(
          rollInput,
          rollError,
          "Use format XXi-XXXX (e.g. 23I-0542)."
        );
      }
      return clearFieldError(rollInput, rollError, true);
    }

    function validateDepartment() {
      if (!deptSelect.value) {
        return setFieldError(deptSelect, deptError, "Please select your degree department.");
      }
      return clearFieldError(deptSelect, deptError, true);
    }

    function validateEmail() {
      const value = emailInput.value.trim();
      if (!value) {
        return setFieldError(emailInput, emailError, "NU email address is required.");
      }
      if (!NU_EMAIL_REGEX.test(value)) {
        return setFieldError(
          emailInput,
          emailError,
          "Email must end with @nu.edu.pk or @isb.nu.edu.pk."
        );
      }
      return clearFieldError(emailInput, emailError, true);
    }

    function validateRegPassword() {
      const value = passwordInput.value;
      const strength = evaluatePasswordStrength(value);

      if (!value) {
        return setFieldError(passwordInput, passwordError, "Please create a password.");
      }
      if (value.length < 6) {
        return setFieldError(
          passwordInput,
          passwordError,
          "Password must be at least 6 characters long."
        );
      }
      if (strength.level === "weak") {
        return setFieldError(
          passwordInput,
          passwordError,
          "Password is too weak. Aim for Medium or Strong (8+ chars, uppercase, number, symbol)."
        );
      }
      return clearFieldError(passwordInput, passwordError, true);
    }

    nameInput.addEventListener("blur", validateName);
    nameInput.addEventListener("input", () => {
      if (nameInput.classList.contains("is-invalid") || nameInput.value.trim().length > 0) {
        validateName();
      }
    });

    rollInput.addEventListener("blur", validateRoll);
    rollInput.addEventListener("input", () => {
      if (rollInput.classList.contains("is-invalid") || rollInput.value.trim().length > 0) {
        validateRoll();
      }
    });

    deptSelect.addEventListener("change", validateDepartment);

    emailInput.addEventListener("blur", validateEmail);
    emailInput.addEventListener("input", () => {
      if (emailInput.classList.contains("is-invalid") || emailInput.value.trim().length > 0) {
        validateEmail();
      }
    });

    passwordInput.addEventListener("input", () => {
      updateStrengthMeterUI(passwordInput.value);
      if (passwordInput.classList.contains("is-invalid")) {
        validateRegPassword();
      }
    });
    passwordInput.addEventListener("blur", validateRegPassword);

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      hideAuthStatus();

      const checks = [
        validateName(),
        validateRoll(),
        validateDepartment(),
        validateEmail(),
        validateRegPassword(),
      ];

      if (checks.includes(false)) {
        const firstInvalid = form.querySelector(".is-invalid");
        if (firstInvalid) firstInvalid.focus();
        return;
      }

      const newStudent = {
        name: nameInput.value.trim(),
        rollNo: normalizeRollNo(rollInput.value),
        email: emailInput.value.trim().toLowerCase(),
        department: deptSelect.value,
        isLoggedIn: true,
      };

      saveRegisteredStudent(newStudent);
      persistAndRedirect(
        newStudent,
        `Account created for ${newStudent.name} (${newStudent.rollNo})! Redirecting to your dashboard...`
      );
    });
  }

  /* --------------------------------------------------------------------------
     Password Strength Calculation & UI
     -------------------------------------------------------------------------- */
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
    const meter = document.getElementById("strength-meter");
    const label = document.getElementById("strength-label");
    const reqLength = document.getElementById("req-length");
    const reqUpper = document.getElementById("req-upper");
    const reqNumber = document.getElementById("req-number");
    const reqSymbol = document.getElementById("req-symbol");

    if (!meter || !label) return;

    const { checks, level, text } = evaluatePasswordStrength(password);
    meter.dataset.strength = level;
    label.textContent = text;

    if (reqLength) reqLength.classList.toggle("is-met", checks.length);
    if (reqUpper) reqUpper.classList.toggle("is-met", checks.upper);
    if (reqNumber) reqNumber.classList.toggle("is-met", checks.number);
    if (reqSymbol) reqSymbol.classList.toggle("is-met", checks.symbol);
  }

  /* --------------------------------------------------------------------------
     One-Click Demo Student Login & Persistent Session Storage
     -------------------------------------------------------------------------- */
  function initDemoLogin() {
    const demoBtn = document.getElementById("demo-login-btn");
    if (!demoBtn) return;

    demoBtn.addEventListener("click", () => {
      hideAuthStatus();

      const demoStudent = {
        name: "Ayesha Khan",
        rollNo: "23I-0542",
        email: "i230542@isb.nu.edu.pk",
        department: "BS Computer Science",
        isLoggedIn: true,
      };

      const identifierInput = document.getElementById("login-identifier");
      if (identifierInput) {
        identifierInput.value = demoStudent.rollNo;
        identifierInput.classList.remove("is-invalid");
        identifierInput.classList.add("is-valid");
      }

      persistAndRedirect(
        demoStudent,
        `Demo login successful for ${demoStudent.name} (${demoStudent.rollNo}). Redirecting to dashboard...`
      );
    });
  }

  function getRegisteredStudents() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_USERS);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  function saveRegisteredStudent(student) {
    try {
      const students = getRegisteredStudents();
      const filtered = students.filter(
        (item) =>
          normalizeRollNo(item.rollNo) !== normalizeRollNo(student.rollNo) &&
          item.email.toLowerCase() !== student.email.toLowerCase()
      );
      filtered.push({
        name: student.name,
        rollNo: student.rollNo,
        email: student.email,
        department: student.department,
      });
      localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(filtered));
    } catch {
      // Ignore storage quota errors in restricted environments
    }
  }

  function persistAndRedirect(studentObj, confirmationText) {
    try {
      localStorage.setItem(STORAGE_KEY_CURRENT, JSON.stringify(studentObj));
    } catch {
      showAuthStatus(
        "Unable to access browser storage. Please enable localStorage and try again.",
        "error"
      );
      return;
    }

    showAuthStatus(confirmationText, "success");

    window.setTimeout(() => {
      window.location.href = "dashboard.html";
    }, 900);
  }

  function checkExistingSession() {
    const banner = document.getElementById("session-banner");
    const nameEl = document.getElementById("session-student-name");
    const metaEl = document.getElementById("session-student-meta");

    if (!banner || !nameEl || !metaEl) return;

    try {
      const raw = localStorage.getItem(STORAGE_KEY_CURRENT);
      if (!raw) return;

      const student = JSON.parse(raw);
      if (student && student.isLoggedIn) {
        nameEl.textContent = `Signed in as ${student.name || "Student"}`;
        metaEl.textContent = `${student.rollNo || ""} · ${student.department || "NCS Member"}`;
        banner.hidden = false;
      }
    } catch {
      // Ignore malformed stored session data
    }
  }

  function setFooterYear() {
    const yearEl = document.getElementById("footer-year");
    if (yearEl) {
      yearEl.textContent = String(new Date().getFullYear());
    }
  }
})();
