/* ==========================================================================
   Nexus Computing Society — Event Registration Interactivity
   Pure Vanilla JavaScript (ES6+)
   ========================================================================== */

(() => {
  'use strict';

  const SELECTED_EVENT_KEY = 'ncs_selected_event';
  const REGISTRATIONS_KEY = 'ncs_registrations';
  const DEFAULT_EVENT_ID = 'coderush-2026';
  const FALLBACK_LOGO_PATH = '../images/logo.jpg';

  /**
   * Shared Nexus Computing Society events catalog (synchronized with events.js).
   */
  const eventsCatalog = [
    {
      id: 'coderush-2026',
      title: 'Nexus CodeRush 2026 Hackathon',
      category: 'Hackathons',
      hostingWing: 'Nexus Computing Society • Software Engineering & AI Wing',
      date: 'Dec 05–06, 2026 • 09:00 AM',
      venue: 'Main Innovation Auditorium, Block C • FAST-NUCES H-12',
      fee: '$15 / Team',
      isFree: false,
      seatsTotal: 180,
      seatsTaken: 117,
      status: 'Open',
      summary:
        'A 36-hour flagship collegiate hackathon challenging student teams to architect full-stack AI, fintech, and civic-tech prototypes with live industry mentorship.'
    },
    {
      id: 'zero-day-ctf-2026',
      title: 'Zero-Day Cyber Security & CTF Bootcamp',
      category: 'Workshops',
      hostingWing: 'Nexus Computing Society • Cybersecurity & Systems Wing',
      date: 'Dec 12, 2026 • 10:00 AM',
      venue: 'Cyber Defense Lab 204, CS Building • FAST-NUCES H-12',
      fee: '$10 / Participant',
      isFree: false,
      seatsTotal: 60,
      seatsTaken: 54,
      status: 'Filling Fast',
      summary:
        'Hands-on offensive security workshop covering binary exploitation, web app pentesting, packet forensics, and a live Jeopardy-style Capture The Flag sprint.'
    },
    {
      id: 'genai-agents-summit-2026',
      title: 'Generative AI & Autonomous Agents Summit',
      category: 'Seminars',
      hostingWing: 'Nexus Computing Society • AI Research & Data Science Wing',
      date: 'Dec 19, 2026 • 02:00 PM',
      venue: 'Jinnah Lecture Hall, Engineering Wing • FAST-NUCES H-12',
      fee: 'Free (Student ID)',
      isFree: true,
      seatsTotal: 220,
      seatsTaken: 145,
      status: 'Open',
      summary:
        'Keynote talks and technical panels with ML researchers and alumni engineers exploring tool-using agents, RAG pipelines, evaluation harnesses, and AI safety.'
    },
    {
      id: 'cyberarena-esports-2026',
      title: 'Nexus CyberArena E-Sports Expo',
      category: 'Gaming & E-Sports',
      hostingWing: 'Nexus Computing Society • Interactive Media & Gaming Wing',
      date: 'Oct 18, 2026 • 11:00 AM',
      venue: 'University Sports & Arena Complex • FAST-NUCES H-12',
      fee: '$20 / Squad',
      isFree: false,
      seatsTotal: 120,
      seatsTaken: 120,
      status: 'Completed',
      summary:
        'Inter-departmental collegiate tournament featuring Valorant, Tekken 8, and Rocket League brackets, indie game dev booths, and hardware showcase zones.'
    }
  ];

  const state = {
    selectedEventId: DEFAULT_EVENT_ID,
    touchedFields: new Set(),
    hasAttemptedSubmit: false,
    lastDuplicatePass: null
  };

  /**
   * Fallback to logo.jpg if logo image fails to load.
   */
  function initLogoFallback() {
    document.querySelectorAll('.brand-logo').forEach((img) => {
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
   * Accessible mobile hamburger menu toggle matching events.js.
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
   * Safely read saved registrations array from localStorage.
   */
  function getSavedRegistrations() {
    try {
      const raw = localStorage.getItem(REGISTRATIONS_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      return [];
    }
  }

  /**
   * Safely persist registrations array to localStorage.
   */
  function saveRegistrations(list) {
    try {
      localStorage.setItem(REGISTRATIONS_KEY, JSON.stringify(list));
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Persist selected event ID under shared ncs_selected_event key.
   */
  function saveSelectedEventId(eventId) {
    try {
      localStorage.setItem(SELECTED_EVENT_KEY, String(eventId));
    } catch (error) {
      // Ignore storage errors in restricted environments
    }
  }

  /**
   * Read ?event=<id> query param, then ncs_selected_event, then default.
   */
  function resolveInitialEventId() {
    const params = new URLSearchParams(window.location.search);
    const urlEvent = params.get('event');
    let storedEvent = null;

    try {
      storedEvent = localStorage.getItem(SELECTED_EVENT_KEY);
    } catch (error) {
      storedEvent = null;
    }

    const candidate = urlEvent || storedEvent || DEFAULT_EVENT_ID;
    const normalized = candidate === 'ncs-coderush-2026' ? DEFAULT_EVENT_ID : candidate;
    const matched = eventsCatalog.find((item) => item.id === normalized);
    return matched ? matched.id : DEFAULT_EVENT_ID;
  }

  /**
   * Lookup event object by ID.
   */
  function getEventById(eventId) {
    return eventsCatalog.find((item) => item.id === eventId) || eventsCatalog[0];
  }

  /**
   * Compute dynamic seat metrics including locally saved registrations.
   */
  function getEventSeatStats(eventItem) {
    const registrations = getSavedRegistrations();
    const localCount = registrations.filter((reg) => reg.eventId === eventItem.id).length;
    const effectiveTaken = Math.min(eventItem.seatsTotal, eventItem.seatsTaken + localCount);
    const remaining =
      eventItem.status === 'Completed' ? 0 : Math.max(0, eventItem.seatsTotal - effectiveTaken);
    const fillPercent =
      eventItem.seatsTotal > 0
        ? Math.min(100, Math.max(0, Math.round((effectiveTaken / eventItem.seatsTotal) * 100)))
        : 0;

    return { effectiveTaken, remaining, fillPercent, totalSavedCount: registrations.length };
  }

  /**
   * Map event status to CSS badge modifier class.
   */
  function getStatusModifier(status) {
    if (status === 'Filling Fast') return 'status-badge--filling-fast';
    if (status === 'Completed') return 'status-badge--completed';
    return 'status-badge--open';
  }

  /**
   * Populate event selector dropdown with upcoming events (and selected completed event if linked directly).
   */
  function populateEventDropdown(activeEventId) {
    const select = document.getElementById('reg-event-select');
    if (!select) return;

    select.replaceChildren();

    eventsCatalog.forEach((eventItem) => {
      if (eventItem.status === 'Completed' && eventItem.id !== activeEventId) {
        return;
      }
      const option = document.createElement('option');
      option.value = eventItem.id;
      option.textContent =
        eventItem.status === 'Completed'
          ? `${eventItem.title} (Closed)`
          : `${eventItem.title} — ${eventItem.date.split('•')[0].trim()}`;
      select.appendChild(option);
    });

    select.value = activeEventId;
  }

  /**
   * Update the left/top Event Summary Card dynamically.
   */
  function renderEventSummary(eventItem) {
    const categoryEl = document.getElementById('summary-category');
    const statusEl = document.getElementById('summary-status');
    const feeBadgeEl = document.getElementById('summary-fee-badge');
    const titleEl = document.getElementById('summary-card-heading');
    const descEl = document.getElementById('summary-description');
    const dateEl = document.getElementById('summary-date');
    const venueEl = document.getElementById('summary-venue');
    const hostEl = document.getElementById('summary-host');
    const seatsEl = document.getElementById('summary-seats');
    const ratioEl = document.getElementById('summary-seats-ratio');
    const trackEl = document.getElementById('summary-progress-track');
    const fillEl = document.getElementById('summary-progress-fill');
    const savedCountEl = document.getElementById('saved-registrations-count');
    const submitBtn = document.getElementById('submit-registration-btn');

    const { effectiveTaken, remaining, fillPercent, totalSavedCount } = getEventSeatStats(eventItem);
    const isClosed = eventItem.status === 'Completed' || remaining === 0;

    if (categoryEl) categoryEl.textContent = eventItem.category;
    if (titleEl) titleEl.textContent = eventItem.title;
    if (descEl) descEl.textContent = eventItem.summary;
    if (dateEl) dateEl.textContent = eventItem.date;
    if (venueEl) venueEl.textContent = eventItem.venue;
    if (hostEl) hostEl.textContent = eventItem.hostingWing;

    if (statusEl) {
      statusEl.className = `status-badge ${getStatusModifier(eventItem.status)}`;
      const dot = document.createElement('span');
      dot.className = 'status-dot';
      dot.setAttribute('aria-hidden', 'true');
      statusEl.replaceChildren(dot, document.createTextNode(eventItem.status));
    }

    if (feeBadgeEl) {
      feeBadgeEl.textContent = eventItem.isFree ? 'FREE • Student ID' : eventItem.fee;
      feeBadgeEl.className = eventItem.isFree ? 'fee-badge fee-badge--free' : 'fee-badge';
    }

    if (seatsEl) {
      seatsEl.textContent = isClosed
        ? '0 seats left (Registration Closed)'
        : `${remaining} of ${eventItem.seatsTotal} seats available`;
    }

    if (ratioEl) {
      ratioEl.textContent = `${effectiveTaken} / ${eventItem.seatsTotal} (${fillPercent}%)`;
    }

    if (trackEl) {
      trackEl.setAttribute('aria-valuenow', String(fillPercent));
    }

    if (fillEl) {
      fillEl.style.width = `${fillPercent}%`;
      fillEl.style.background = isClosed ? 'var(--text-secondary)' : '';
    }

    if (savedCountEl) {
      savedCountEl.textContent =
        totalSavedCount === 1
          ? '1 saved pass on this device'
          : `${totalSavedCount} saved passes on this device`;
    }

    if (submitBtn) {
      submitBtn.disabled = isClosed;
      submitBtn.textContent = isClosed
        ? 'Registration Closed for This Event'
        : 'Confirm Registration & Generate Pass';
    }

    if (isClosed) {
      showFormAlert(
        'Registration Closed',
        `${eventItem.title} is no longer accepting new registrations. Choose an upcoming open event from the selector.`,
        null
      );
    } else if (state.lastDuplicatePass === null) {
      hideFormAlert();
    }
  }

  /**
   * Show or hide the inline form alert banner.
   */
  function showFormAlert(title, message, existingPass) {
    const alertBox = document.getElementById('form-alert');
    const titleEl = document.getElementById('form-alert-title');
    const msgEl = document.getElementById('form-alert-message');
    const viewExistingBtn = document.getElementById('view-existing-pass-btn');

    if (!alertBox || !titleEl || !msgEl) return;

    titleEl.textContent = title;
    msgEl.textContent = message;
    state.lastDuplicatePass = existingPass;

    if (viewExistingBtn) {
      viewExistingBtn.hidden = !existingPass;
    }

    alertBox.hidden = false;
  }

  function hideFormAlert() {
    const alertBox = document.getElementById('form-alert');
    const viewExistingBtn = document.getElementById('view-existing-pass-btn');
    state.lastDuplicatePass = null;
    if (alertBox) alertBox.hidden = true;
    if (viewExistingBtn) viewExistingBtn.hidden = true;
  }

  /**
   * Field validation rules.
   */
  function normalizeRollNumber(raw) {
    const cleaned = raw.trim().replace(/\s+/g, '');
    const match = cleaned.match(/^(\d{2})([a-zA-Z])-?(\d{4})$/);
    if (!match) return cleaned;
    return `${match[1]}${match[2].toLowerCase()}-${match[3]}`;
  }

  function validateFieldValue(fieldId) {
    const el = document.getElementById(fieldId);
    if (!el) return { valid: true, message: '' };

    const value = el.value.trim();

    switch (fieldId) {
      case 'full-name': {
        if (!value) {
          return { valid: false, message: 'Full name is required.' };
        }
        if (value.length < 3) {
          return { valid: false, message: 'Please enter at least 3 characters for your full name.' };
        }
        if (!/^[a-zA-Z\s.'-]+$/.test(value)) {
          return { valid: false, message: 'Name may only contain letters, spaces, dots, hyphens, or apostrophes.' };
        }
        return { valid: true, message: '' };
      }

      case 'roll-number': {
        if (!value) {
          return { valid: false, message: 'FAST roll number is required (e.g., 26i-3165).' };
        }
        if (!/^\d{2}[iklfpmIKLFPM]-\d{4}$/.test(value)) {
          return {
            valid: false,
            message: 'Use the FAST roll format YY[campus]-XXXX, such as 26i-3165 or 25i-0421.'
          };
        }
        return { valid: true, message: '' };
      }

      case 'university-email': {
        if (!value) {
          return { valid: false, message: 'University email is required.' };
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
        if (!emailRegex.test(value)) {
          return {
            valid: false,
            message: 'Enter a valid email address (e.g., i263165@isb.nu.edu.pk).'
          };
        }
        return { valid: true, message: '' };
      }

      case 'department': {
        if (!value) {
          return { valid: false, message: 'Please select your department.' };
        }
        return { valid: true, message: '' };
      }

      case 'semester': {
        if (!value) {
          return { valid: false, message: 'Please select your current semester (1st to 8th).' };
        }
        return { valid: true, message: '' };
      }

      case 'team-name': {
        const isTeam = getSelectedParticipationType() === 'Team';
        if (!isTeam || !value) {
          return { valid: true, message: '' };
        }
        if (value.length < 2) {
          return { valid: false, message: 'Team name must be at least 2 characters if provided.' };
        }
        return { valid: true, message: '' };
      }

      case 'phone-number': {
        if (!value) {
          return { valid: false, message: 'WhatsApp or phone number is required.' };
        }
        const digitsOnly = value.replace(/[\s()-]/g, '');
        if (!/^(?:\+92|92|0)?3\d{9}$/.test(digitsOnly)) {
          return {
            valid: false,
            message: 'Enter a valid Pakistani mobile number (e.g., 0300-1234567 or +923001234567).'
          };
        }
        return { valid: true, message: '' };
      }

      default:
        return { valid: true, message: '' };
    }
  }

  /**
   * Apply visual valid/invalid styling and inline error message to a field.
   */
  function applyFieldValidationUI(fieldId, forceShow) {
    const el = document.getElementById(fieldId);
    const errorEl = document.getElementById(`${fieldId}-error`);
    if (!el || !errorEl) return true;

    const shouldValidate = forceShow || state.hasAttemptedSubmit || state.touchedFields.has(fieldId);
    if (!shouldValidate) {
      el.classList.remove('is-valid', 'is-invalid');
      el.removeAttribute('aria-invalid');
      errorEl.textContent = '';
      return true;
    }

    const result = validateFieldValue(fieldId);
    const isOptionalEmpty = fieldId === 'team-name' && el.value.trim() === '';

    if (result.valid) {
      el.classList.remove('is-invalid');
      el.classList.toggle('is-valid', !isOptionalEmpty);
      el.setAttribute('aria-invalid', 'false');
      errorEl.textContent = '';
    } else {
      el.classList.remove('is-valid');
      el.classList.add('is-invalid');
      el.setAttribute('aria-invalid', 'true');
      errorEl.textContent = result.message;
    }

    return result.valid;
  }

  function getSelectedParticipationType() {
    const checked = document.querySelector('input[name="participationType"]:checked');
    return checked ? checked.value : 'Solo';
  }

  /**
   * Toggle Team Name input visibility based on Solo vs Team selection.
   */
  function syncTeamFieldVisibility() {
    const teamGroup = document.getElementById('team-name-group');
    const teamInput = document.getElementById('team-name');
    const teamError = document.getElementById('team-name-error');
    if (!teamGroup || !teamInput) return;

    const isTeam = getSelectedParticipationType() === 'Team';
    teamGroup.hidden = !isTeam;

    if (!isTeam) {
      teamInput.value = '';
      teamInput.classList.remove('is-valid', 'is-invalid');
      teamInput.removeAttribute('aria-invalid');
      if (teamError) teamError.textContent = '';
      state.touchedFields.delete('team-name');
    }
  }

  /**
   * Generate unique Registration ID such as NX-2026-8492.
   */
  function generateRegistrationId(existingRegistrations) {
    const existingIds = new Set(existingRegistrations.map((item) => item.registrationId));
    let candidate = '';
    let attempts = 0;

    do {
      const code = Math.floor(1000 + Math.random() * 9000);
      candidate = `NX-2026-${code}`;
      attempts += 1;
    } while (existingIds.has(candidate) && attempts < 25);

    return candidate;
  }

  /**
   * Display the Digital Event Pass card for a registration record.
   */
  function showDigitalPass(registration) {
    const formPanel = document.getElementById('registration-form-panel');
    const passPanel = document.getElementById('digital-pass-panel');
    const eventItem = getEventById(registration.eventId);

    if (!formPanel || !passPanel) return;

    const setText = (id, value) => {
      const el = document.getElementById(id);
      if (el) el.textContent = value;
    };

    setText('pass-reg-id', registration.registrationId);
    setText('pass-event-category', registration.eventCategory || eventItem.category);
    setText('pass-event-title', registration.eventTitle || eventItem.title);
    setText('pass-event-host', registration.hostingWing || eventItem.hostingWing);
    setText('pass-student-name', registration.fullName);
    setText('pass-roll-number', registration.rollNumber);
    setText('pass-dept-sem', `${registration.department} • ${registration.semester} Semester`);

    const participationLabel =
      registration.participationType === 'Team'
        ? registration.teamName
          ? `Team (${registration.teamName})`
          : 'Team Entry'
        : 'Solo Participant';
    setText('pass-participation', participationLabel);
    setText('pass-event-date', registration.eventDate || eventItem.date);
    setText('pass-event-venue', registration.eventVenue || eventItem.venue);
    setText('pass-event-fee', registration.eventFee || eventItem.fee);

    formPanel.hidden = true;
    passPanel.hidden = false;
    passPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  /**
   * Reset form UI back to fresh registration mode.
   */
  function resetToFormView() {
    const formPanel = document.getElementById('registration-form-panel');
    const passPanel = document.getElementById('digital-pass-panel');
    const form = document.getElementById('event-register-form');

    if (form) {
      form.reset();
    }

    state.touchedFields.clear();
    state.hasAttemptedSubmit = false;
    hideFormAlert();
    syncTeamFieldVisibility();

    ['full-name', 'roll-number', 'university-email', 'department', 'semester', 'team-name', 'phone-number'].forEach(
      (id) => {
        const el = document.getElementById(id);
        const err = document.getElementById(`${id}-error`);
        if (el) {
          el.classList.remove('is-valid', 'is-invalid');
          el.removeAttribute('aria-invalid');
        }
        if (err) err.textContent = '';
      }
    );

    if (passPanel) passPanel.hidden = true;
    if (formPanel) formPanel.hidden = false;

    const fullNameEl = document.getElementById('full-name');
    if (fullNameEl) fullNameEl.focus();
  }

  /**
   * Wire all interactive handlers for pages/event-register.html.
   */
  function initRegistrationPage() {
    const eventSelect = document.getElementById('reg-event-select');
    const detailsLink = document.getElementById('summary-details-link');
    const form = document.getElementById('event-register-form');
    const viewExistingBtn = document.getElementById('view-existing-pass-btn');
    const registerAnotherBtn = document.getElementById('register-another-btn');
    const copyPassIdBtn = document.getElementById('copy-pass-id-btn');

    if (!eventSelect || !form) return;

    state.selectedEventId = resolveInitialEventId();
    saveSelectedEventId(state.selectedEventId);
    populateEventDropdown(state.selectedEventId);
    renderEventSummary(getEventById(state.selectedEventId));
    syncTeamFieldVisibility();

    eventSelect.addEventListener('change', () => {
      state.selectedEventId = eventSelect.value;
      saveSelectedEventId(state.selectedEventId);
      hideFormAlert();
      renderEventSummary(getEventById(state.selectedEventId));

      const passPanel = document.getElementById('digital-pass-panel');
      if (passPanel && !passPanel.hidden) {
        resetToFormView();
      }
    });

    if (detailsLink) {
      detailsLink.addEventListener('click', () => {
        saveSelectedEventId(state.selectedEventId);
      });
    }

    // Real-time and blur validation
    const validatedFieldIds = [
      'full-name',
      'roll-number',
      'university-email',
      'department',
      'semester',
      'team-name',
      'phone-number'
    ];

    validatedFieldIds.forEach((fieldId) => {
      const el = document.getElementById(fieldId);
      if (!el) return;

      const eventType = el.tagName === 'SELECT' ? 'change' : 'input';

      el.addEventListener('blur', () => {
        if (fieldId === 'roll-number' && el.value.trim()) {
          el.value = normalizeRollNumber(el.value);
        }
        state.touchedFields.add(fieldId);
        applyFieldValidationUI(fieldId, false);
      });

      el.addEventListener(eventType, () => {
        if (fieldId === 'roll-number' || state.lastDuplicatePass) {
          hideFormAlert();
        }
        if (state.touchedFields.has(fieldId) || state.hasAttemptedSubmit) {
          applyFieldValidationUI(fieldId, false);
        }
      });
    });

    document.querySelectorAll('input[name="participationType"]').forEach((radio) => {
      radio.addEventListener('change', syncTeamFieldVisibility);
    });

    if (viewExistingBtn) {
      viewExistingBtn.addEventListener('click', () => {
        if (state.lastDuplicatePass) {
          showDigitalPass(state.lastDuplicatePass);
        }
      });
    }

    if (registerAnotherBtn) {
      registerAnotherBtn.addEventListener('click', () => {
        resetToFormView();
      });
    }

    if (copyPassIdBtn) {
      copyPassIdBtn.addEventListener('click', async () => {
        const regIdEl = document.getElementById('pass-reg-id');
        const regId = regIdEl ? regIdEl.textContent.trim() : '';
        if (!regId) return;

        try {
          if (navigator.clipboard && navigator.clipboard.writeText) {
            await navigator.clipboard.writeText(regId);
          }
          copyPassIdBtn.textContent = 'Copied!';
          setTimeout(() => {
            copyPassIdBtn.textContent = 'Copy Pass ID';
          }, 1800);
        } catch (error) {
          copyPassIdBtn.textContent = regId;
        }
      });
    }

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      state.hasAttemptedSubmit = true;
      hideFormAlert();

      const rollEl = document.getElementById('roll-number');
      if (rollEl && rollEl.value.trim()) {
        rollEl.value = normalizeRollNumber(rollEl.value);
      }

      const activeEvent = getEventById(state.selectedEventId);
      const seatStats = getEventSeatStats(activeEvent);
      if (activeEvent.status === 'Completed' || seatStats.remaining === 0) {
        showFormAlert(
          'Registration Closed',
          `${activeEvent.title} has reached capacity or concluded. Please select another event.`,
          null
        );
        return;
      }

      let firstInvalidEl = null;
      let allValid = true;

      validatedFieldIds.forEach((fieldId) => {
        if (fieldId === 'team-name' && getSelectedParticipationType() !== 'Team') {
          return;
        }
        const isValid = applyFieldValidationUI(fieldId, true);
        if (!isValid) {
          allValid = false;
          if (!firstInvalidEl) {
            firstInvalidEl = document.getElementById(fieldId);
          }
        }
      });

      if (!allValid) {
        if (firstInvalidEl) firstInvalidEl.focus();
        return;
      }

      const fullName = document.getElementById('full-name').value.trim();
      const rollNumber = normalizeRollNumber(document.getElementById('roll-number').value);
      const email = document.getElementById('university-email').value.trim().toLowerCase();
      const department = document.getElementById('department').value;
      const semester = document.getElementById('semester').value;
      const participationType = getSelectedParticipationType();
      const teamName =
        participationType === 'Team' ? document.getElementById('team-name').value.trim() : '';
      const phone = document.getElementById('phone-number').value.trim();

      const registrations = getSavedRegistrations();
      const duplicate = registrations.find(
        (item) =>
          item.eventId === activeEvent.id &&
          typeof item.rollNumber === 'string' &&
          item.rollNumber.toLowerCase() === rollNumber.toLowerCase()
      );

      if (duplicate) {
        showFormAlert(
          'Duplicate Registration Detected',
          `Roll number ${rollNumber} is already registered for ${activeEvent.title} (Pass ID: ${duplicate.registrationId}).`,
          duplicate
        );
        if (rollEl) rollEl.focus();
        return;
      }

      const newRegistration = {
        registrationId: generateRegistrationId(registrations),
        eventId: activeEvent.id,
        eventTitle: activeEvent.title,
        eventCategory: activeEvent.category,
        eventDate: activeEvent.date,
        eventVenue: activeEvent.venue,
        eventFee: activeEvent.isFree ? 'Free (Student ID)' : activeEvent.fee,
        hostingWing: activeEvent.hostingWing,
        fullName,
        rollNumber,
        email,
        department,
        semester,
        participationType,
        teamName,
        phone,
        registeredAt: new Date().toISOString()
      };

      registrations.push(newRegistration);
      saveRegistrations(registrations);
      saveSelectedEventId(activeEvent.id);
      renderEventSummary(activeEvent);
      showDigitalPass(newRegistration);
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    initLogoFallback();
    initMobileNav();
    initRegistrationPage();
  });
})();
