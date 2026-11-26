/* ==========================================================================
   Nexus Computing Society — Page 4: Events Listing Interactivity
   Pure Vanilla JavaScript (ES6+)
   ========================================================================== */

(() => {
  'use strict';

  const STORAGE_KEY = 'ncs_selected_event';
  const FALLBACK_LOGO_PATH = '../images/logo.jpg';

  /**
   * Realistic university tech events dataset for Nexus Computing Society.
   */
  const eventsData = [
    {
      id: 'ncs-coderush-2026',
      title: 'Nexus CodeRush 2026 Hackathon',
      category: 'Hackathons',
      date: 'Dec 05–06, 2026 • 09:00 AM',
      venue: 'Main Innovation Auditorium, Block C',
      fee: '$15 / Team',
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
      date: 'Dec 12, 2026 • 10:00 AM',
      venue: 'Cyber Defense Lab 204, CS Building',
      fee: '$10 / Participant',
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
      date: 'Dec 19, 2026 • 02:00 PM',
      venue: 'Jinnah Lecture Hall, Engineering Wing',
      fee: 'Free (Student ID)',
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
      date: 'Oct 18, 2026 • 11:00 AM',
      venue: 'University Sports & Arena Complex',
      fee: '$20 / Squad',
      seatsTotal: 120,
      seatsTaken: 120,
      status: 'Completed',
      summary:
        'Inter-departmental collegiate tournament featuring Valorant, Tekken 8, and Rocket League brackets, indie game dev booths, and hardware showcase zones.'
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

  document.addEventListener('DOMContentLoaded', () => {
    initLogoFallback();
    initMobileNav();
    renderHeroStats();
    initFilters();
    renderEvents();
  });
})();
