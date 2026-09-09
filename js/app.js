// Main Application Controller & UI Renderer

(function() {
  function renderIcon(iconName, extraClass = '') {
    return `<i data-lucide="${iconName}" class="${extraClass}"></i>`;
  }

  // Mobile Drawer Navigation Controllers
  window.toggleMobileSidebar = function(forceOpen) {
    const sidebar = document.getElementById('sidebar');
    const backdrop = document.getElementById('sidebarBackdrop');
    if (!sidebar) return;

    const isOpen = sidebar.classList.contains('open');
    const shouldOpen = (typeof forceOpen === 'boolean') ? forceOpen : !isOpen;

    if (shouldOpen) {
      sidebar.classList.add('open');
      if (backdrop) backdrop.classList.add('active');
      document.body.classList.add('sidebar-drawer-open');
    } else {
      sidebar.classList.remove('open');
      if (backdrop) backdrop.classList.remove('active');
      document.body.classList.remove('sidebar-drawer-open');
    }
  };

  window.closeMobileSidebar = function() {
    window.toggleMobileSidebar(false);
  };

  window.addEventListener('resize', function() {
    if (window.innerWidth > 900) {
      window.closeMobileSidebar();
    }
  });

  let activeCharts = [];
  function clearCharts() {
    activeCharts.forEach(c => {
      try { c.destroy(); } catch(e) {}
    });
    activeCharts = [];
  }

  function animateDynamicCounters() {
    const counterElements = document.querySelectorAll('.stat-value[data-count]');
    counterElements.forEach(el => {
      const target = parseInt(el.getAttribute('data-count'), 10);
      if (isNaN(target)) return;

      const currentText = (el.textContent || '').replace(/,/g, '').trim();
      const currentDisplayed = parseInt(currentText, 10);

      if (el.dataset.animatedTarget !== undefined && parseInt(el.dataset.animatedTarget, 10) === target && currentDisplayed === target) {
        return;
      }

      const startVal = (el.dataset.animatedTarget !== undefined && !isNaN(parseInt(el.dataset.animatedTarget, 10))) 
        ? parseInt(el.dataset.animatedTarget, 10) 
        : 0;

      el.dataset.animatedTarget = target;

      if (startVal === target) {
        el.textContent = target.toLocaleString();
        return;
      }

      const duration = 650;
      const startTime = performance.now();

      function step(now) {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const ease = 1 - Math.pow(1 - progress, 3);
        const currentVal = Math.round(startVal + (target - startVal) * ease);
        el.textContent = currentVal.toLocaleString();

        if (progress < 1) {
          requestAnimationFrame(step);
        } else {
          el.textContent = target.toLocaleString();
        }
      }

      requestAnimationFrame(step);
    });
  }

  function renderApp() {
    const root = document.getElementById('app');
    if (!root) return;

    if (!window.AppState || !window.AppState.data) {
      if (window.AppState) window.AppState.init();
    }

    // Save search input focus and cursor details
    const activeEl = document.activeElement;
    const isSearchFocused = activeEl && activeEl.tagName === 'INPUT' && activeEl.placeholder && activeEl.placeholder.includes('Search');
    let selectionStart = 0;
    let selectionEnd = 0;
    if (isSearchFocused) {
      selectionStart = activeEl.selectionStart;
      selectionEnd = activeEl.selectionEnd;
    }

    clearCharts();

    const state = window.AppState;
    const user = state.currentUser;

    // Check if user is authenticated
    if (!state.isAuthenticated) {
      root.innerHTML = renderLandingPage();
    } else {
      root.innerHTML = `
        <!-- Mobile Drawer Backdrop Overlay -->
        <div class="sidebar-backdrop" id="sidebarBackdrop" onclick="window.closeMobileSidebar()"></div>

        <!-- Sidebar Navigation (Matches 1.PNG - 7.PNG & Mobile Drawer) -->
        <aside class="sidebar" id="sidebar">
          <div class="sidebar-header-row">
            <div class="brand-logo">
              <div class="brand-icon">
                ${renderIcon('sparkles')}
              </div>
              <div class="brand-title">LearnAIPro</div>
            </div>
            <button class="sidebar-close-btn" onclick="window.closeMobileSidebar()" aria-label="Close Navigation Drawer" title="Close Drawer">
              ${renderIcon('x')}
            </button>
          </div>

          <!-- Student Profile Card at Top of Sidebar -->
          <div class="sidebar-profile-card">
            <div class="sidebar-avatar-circle">
              ${(user && user.name) ? user.name.split(' ').filter(Boolean).map(n=>n[0]).join('').substring(0,2).toUpperCase() : ((user && user.email) ? user.email.substring(0,2).toUpperCase() : 'ST')}
            </div>
            <div class="sidebar-profile-info">
              <div class="sidebar-profile-name">${(user && user.name) || ((user && user.email) ? user.email.split('@')[0] : 'Student')}</div>
              <div class="sidebar-profile-sub">${(user && user.gradeClass) ? (user.gradeClass.includes('Student') ? user.gradeClass : `${user.gradeClass} Student`) : ((user && user.role === 'admin') ? 'Administrator' : 'Student')}</div>
            </div>
          </div>

          <!-- Navigation Menu Items (Every Drawer Accessible) -->
          <ul class="nav-menu">
            <li class="nav-item ${state.currentView === 'dashboard' ? 'active' : ''}">
              <button onclick="AppState.setView('dashboard'); window.closeMobileSidebar();">
                ${renderIcon('layout-dashboard')} Dashboard
              </button>
            </li>
            <li class="nav-item ${state.currentView === 'courses' || state.currentView === 'course-hub' ? 'active' : ''}">
              <button onclick="AppState.setView('courses'); window.closeMobileSidebar();">
                ${renderIcon('graduation-cap')} Courses
              </button>
            </li>
            <li class="nav-item ${state.currentView === 'roadmap' ? 'active' : ''}">
              <button onclick="AppState.setView('roadmap'); window.closeMobileSidebar();">
                ${renderIcon('git-branch')} Roadmaps
              </button>
            </li>
            <li class="nav-item ${state.currentView === 'quizzes' ? 'active' : ''}">
              <button onclick="AppState.setView('quizzes'); window.closeMobileSidebar();">
                ${renderIcon('help-circle')} Assessments
              </button>
            </li>
            <li class="nav-item ${state.currentView === 'notes' ? 'active' : ''}">
              <button onclick="AppState.setView('notes'); window.closeMobileSidebar();">
                ${renderIcon('file-text')} Notes
              </button>
            </li>
            <li class="nav-item ${state.currentView === 'achievements' ? 'active' : ''}">
              <button onclick="AppState.setView('achievements'); window.closeMobileSidebar();">
                ${renderIcon('award')} Achievements
              </button>
            </li>
            <li class="nav-item ${state.currentView === 'analytics' || state.currentView === 'evaluation' ? 'active' : ''}">
              <button onclick="AppState.setView('analytics'); window.closeMobileSidebar();">
                ${renderIcon('trending-up')} Insights
              </button>
            </li>
            ${user && user.role === 'admin' ? `
              <li class="nav-item ${state.currentView === 'admin' ? 'active' : ''}">
                <button onclick="AppState.setView('admin'); window.closeMobileSidebar();">
                  ${renderIcon('settings')} Admin Dashboard
                </button>
              </li>
            ` : ''}
          </ul>

          <!-- Sidebar Bottom Actions -->
          <div class="sidebar-footer">
            <button class="btn-sidebar-ai-tutor" onclick="if(window.AIChatbot) window.AIChatbot.toggle(); window.closeMobileSidebar();">
              ${renderIcon('bot')} Ask AI Tutor
            </button>
            <button class="sidebar-footer-link" onclick="AppState.openModal('questionnaire'); window.closeMobileSidebar();">
              ${renderIcon('settings')} Settings
            </button>
            <button class="sidebar-footer-link" onclick="AppState.openModal('help'); window.closeMobileSidebar();">
              ${renderIcon('help-circle')} Help Center
            </button>
          </div>
        </aside>

        <!-- Main Wrapper -->
        <div class="main-wrapper">
          <header class="navbar">
            <div style="display:flex; align-items:center; gap:12px; flex:1; min-width:0;">
              <button class="mobile-sidebar-toggle" id="mobileSidebarToggle" onclick="window.toggleMobileSidebar(true)" aria-label="Open Navigation Drawer" title="Open Menu">
                ${renderIcon('menu')}
              </button>
              <div class="nav-search">
                ${renderIcon('search')}
                <input type="text" placeholder="Search courses, videos, quizzes..." value="${state.searchQuery || ''}" oninput="AppState.searchQuery = this.value; if (AppState.currentView !== 'catalog' && AppState.currentView !== 'courses') { AppState.setView('courses'); } else { AppState.notify(); }">
              </div>
            </div>

            <div class="nav-actions">
              <button class="theme-toggle-btn" onclick="AppState.toggleTheme()" title="Toggle Light / Dark Mode">
                ${state.theme === 'light' ? renderIcon('moon') : renderIcon('sun')}
              </button>

              ${user && user.role === 'admin' ? (() => {
                const firstStudent = (state.data && state.data.defaultUsers) ? state.data.defaultUsers.find(u => u && u.role !== 'admin' && !['u-1','u-2','u-3','u-4','u-5','u-6','u-7','u-8'].includes(u.id)) : null;
                return firstStudent ? `
                  <button class="role-switcher-btn" onclick="AppState.setUser('${firstStudent.id}')">
                    ${renderIcon('user-check')} Switch to Student
                  </button>
                ` : '';
              })() : ''}

              <button onclick="AppState.logoutUser()" class="icon-btn" title="Log Out" style="color:var(--text-muted);">
                ${renderIcon('log-out')}
              </button>
            </div>
          </header>

          <main class="page-container">
            ${renderCurrentView()}
          </main>

          <!-- Mobile Bottom Navigation Bar (Sticky Thumb Navigation for Mobile) -->
          <nav class="mobile-bottom-nav">
            <button class="mobile-nav-tab ${state.currentView === 'dashboard' ? 'active' : ''}" onclick="AppState.setView('dashboard'); window.closeMobileSidebar();">
              ${renderIcon('layout-dashboard')}
              <span>Home</span>
            </button>
            <button class="mobile-nav-tab ${state.currentView === 'courses' || state.currentView === 'course-hub' ? 'active' : ''}" onclick="AppState.setView('courses'); window.closeMobileSidebar();">
              ${renderIcon('graduation-cap')}
              <span>Courses</span>
            </button>
            <button class="mobile-nav-tab ${state.currentView === 'roadmap' ? 'active' : ''}" onclick="AppState.setView('roadmap'); window.closeMobileSidebar();">
              ${renderIcon('git-branch')}
              <span>Roadmaps</span>
            </button>
            <button class="mobile-nav-tab ${state.currentView === 'quizzes' ? 'active' : ''}" onclick="AppState.setView('quizzes'); window.closeMobileSidebar();">
              ${renderIcon('help-circle')}
              <span>Assess</span>
            </button>
            <button class="mobile-nav-tab ${['notes', 'achievements', 'analytics', 'evaluation'].includes(state.currentView) ? 'active' : ''}" onclick="window.toggleMobileSidebar(true);">
              ${renderIcon('menu')}
              <span>Drawers</span>
            </button>
          </nav>
        </div>
      `;
    }

    // Always render modals on top
    root.innerHTML += renderActiveModal();

    if (window.lucide) {
      try { window.lucide.createIcons(); } catch(e) {}
    }

    // Restore focus and selection
    if (isSearchFocused) {
      const searchInput = document.querySelector('.nav-search input');
      if (searchInput) {
        searchInput.focus();
        try {
          searchInput.setSelectionRange(selectionStart, selectionEnd);
        } catch (e) {}
      }
    }

    attachCharts();
    animateDynamicCounters();
  }

  // --------------------------------------------------------------------------
  // HOME / LANDING PAGE (UNAUTHENTICATED)
  // --------------------------------------------------------------------------
  function renderLandingPage() {
    const state = window.AppState;
    const features = (state.data && state.data.landingFeatures) ? state.data.landingFeatures : [];

    return `
      <div style="min-height:100vh; background:var(--bg-page); color:var(--text-main); width:100%; max-width:100%; overflow-x:hidden;">
        <!-- Top Navigation Header -->
        <header class="landing-header">
          <div style="display:flex; align-items:center; gap:10px; min-width:0;">
            <div class="brand-icon" style="flex-shrink:0;">
              ${renderIcon('sparkles')}
            </div>
            <div style="min-width:0;">
              <div class="brand-title" style="font-size:1.25rem;">LearnAI Pro</div>
              <div style="font-size:0.68rem; color:var(--text-subtle); font-weight:700; letter-spacing:0.04em;">AI LEARNING PLATFORM</div>
            </div>
          </div>

          <div class="landing-header-actions">
            <button class="theme-toggle-btn" onclick="AppState.toggleTheme()" title="Toggle Light / Dark Mode">
              ${state.theme === 'light' ? renderIcon('moon') : renderIcon('sun')}
            </button>
            <button class="btn-hero-secondary" style="color:var(--text-main); font-size:0.88rem; padding:8px 16px; min-height:40px;" onclick="AppState.openModal('login')">
              Login
            </button>
            <button class="btn-hero-primary" style="background:var(--primary-gradient); color:#fff; font-size:0.88rem; padding:8px 18px; min-height:40px;" onclick="AppState.openModal('register')">
              Register
            </button>
          </div>
        </header>

        <!-- Hero Section -->
        <section class="landing-hero">
          <div class="landing-hero-badge">
            ${renderIcon('cpu')} AI-POWERED PERSONALIZED LEARNING
          </div>

          <h1 class="landing-hero-title">
            Tailored Study Material & Courses Based on Your <span style="background:var(--primary-gradient); -webkit-background-clip:text; -webkit-text-fill-color:transparent;">Learning Style & Goals</span>
          </h1>

          <p class="landing-hero-subtitle">
            Empower your education with adaptive AI recommendations. Complete a short questionnaire to get personalized courses, videos, articles, interactive labs, and post-quiz interest analytics.
          </p>

          <div class="landing-hero-actions">
            <button class="btn-hero-primary" style="background:var(--primary-gradient); color:#fff; font-size:1.05rem; padding:12px 30px; min-height:48px; box-shadow:var(--shadow-colorful);" onclick="AppState.openModal('register')">
              ${renderIcon('sparkles')} Start Learning
            </button>
            <button class="btn-hero-secondary" style="color:var(--text-main); font-size:1rem; padding:12px 24px; min-height:48px; border:1px solid var(--border-color);" onclick="AppState.openModal('login')">
              ${renderIcon('log-in')} Student / Admin Login
            </button>
          </div>
        </section>

        <!-- Features Section Grid -->
        <section class="landing-features-section">
          <div style="text-align:center; margin-bottom:40px;">
            <h2 style="font-size:clamp(1.5rem, 3vw, 2.2rem); font-weight:800; margin-bottom:8px;">Why Choose LearnAI Pro?</h2>
            <p style="color:var(--text-muted); font-size:0.95rem;">Designed to optimize your learning journey with adaptive artificial intelligence.</p>
          </div>

          <div class="landing-features-grid">
            ${features.map(f => `
              <div class="stat-card" style="padding:24px 20px; flex-direction:column; align-items:flex-start; text-align:left;">
                <div class="stat-icon-wrapper" style="background:var(--primary-gradient); width:52px; height:52px; margin-bottom:14px; flex-shrink:0;">
                  ${renderIcon(f.icon)}
                </div>
                <h3 style="font-size:1.15rem; font-weight:800; margin-bottom:8px;">${f.title}</h3>
                <p style="font-size:0.88rem; color:var(--text-muted); line-height:1.5;">${f.desc}</p>
              </div>
            `).join('')}
          </div>
        </section>
      </div>
    `;
  }

  // --------------------------------------------------------------------------
  // AUTHENTICATED STUDENT DASHBOARD
  // --------------------------------------------------------------------------
    function renderDashboard() {
    const state = window.AppState;
    const user = state.currentUser || {};
    const resources = (state.data && state.data.resources) ? state.data.resources : [];
    const courses = (state.data && state.data.courses) ? state.data.courses : [];
    const enrolledCourses = courses.filter(c => (user.enrolledCourseIds || []).includes(c.id));
    const recommendedCourses = courses.filter(c => !(user.enrolledCourseIds || []).includes(c.id));
    recommendedCourses.sort((a, b) => {
      const aMatches = (user.interests || []).includes(a.subjectId) ? 1 : 0;
      const bMatches = (user.interests || []).includes(b.subjectId) ? 1 : 0;
      return bMatches - aMatches;
    });

    return `
      <!-- Student Profile Card Header (Matches 1.PNG) -->
      <div class="student-profile-banner">
        <div class="banner-top-tag">
          ${renderIcon('user')} STUDENT PROFILE • ${(user.gradeClass || 'Student').toUpperCase()}
        </div>
        <div class="banner-name-row">
          <div class="banner-student-name">${user.name || ((user.email) ? user.email.split('@')[0] : 'Student')}</div>
          ${renderIcon('graduation-cap')}
        </div>
        <div class="banner-career-goal">
          Target Career Goal: <strong>${user.careerGoal || 'AI & Machine Learning Engineer'}</strong> • Skill Level: <strong>${user.skillLevel || 'Intermediate'}</strong>
        </div>
        <div class="banner-pills-row">
          <span class="banner-badge-pill">Primary Style: ${(user.preferredStyle || 'Visual').toUpperCase()}</span>
          <span class="banner-badge-pill">Interests: ${(user.interests || ['DS', 'MATH']).map(i => i.toUpperCase()).join(', ')}</span>
        </div>
        <button class="btn-edit-questionnaire" onclick="AppState.openModal('questionnaire')">
          ${renderIcon('edit-3')} Edit Questionnaire
        </button>
      </div>

      <!-- Key Learning Metrics Grid (Matches 1.PNG) -->
      <div class="stats-grid-4">
        <div class="stat-metric-card">
          <div class="stat-circle-icon teal">
            ${renderIcon('flame')}
          </div>
          <div class="stat-info-col">
            <div class="stat-metric-value">${user.streakDays || 6} Days</div>
            <div class="stat-metric-label">Active Streak</div>
          </div>
        </div>

        <div class="stat-metric-card">
          <div class="stat-circle-icon slate">
            ${renderIcon('clock')}
          </div>
          <div class="stat-info-col">
            <div class="stat-metric-value">${user.todayStudiedMinutes || 25} / ${user.dailyGoalMinutes || 30} m</div>
            <div class="stat-metric-label">Daily Target</div>
          </div>
        </div>

        <div class="stat-metric-card">
          <div class="stat-circle-icon teal">
            ${renderIcon('book-open')}
          </div>
          <div class="stat-info-col">
            <div class="stat-metric-value">${enrolledCourses.length || 8} Courses</div>
            <div class="stat-metric-label">Learning Progress</div>
          </div>
        </div>

        <div class="stat-metric-card">
          <div class="stat-circle-icon slate">
            ${renderIcon('star')}
          </div>
          <div class="stat-info-col">
            <div class="stat-metric-value">98%</div>
            <div class="stat-metric-label">Interest Score</div>
          </div>
        </div>
      </div>

      <!-- Recommended Course Pathways Section (Matches 1.PNG) -->
      <div class="section-header-clean">
        <div class="section-title-clean">
          ${renderIcon('sparkles')} Recommended Course Pathways
        </div>
        <a href="#" onclick="event.preventDefault(); AppState.setView('courses');" class="section-link-clean">
          View All Courses &rarr;
        </a>
      </div>

      <div class="courses-grid-4 dashboard-courses-grid">
        ${(recommendedCourses.length > 0 ? recommendedCourses.slice(0, 2) : courses.slice(0, 2)).map(c => renderCourseCard(c, (user.enrolledCourseIds || []).includes(c.id))).join('')}
      </div>
    `;
  }

  // Helper Course & Resource Views
  function renderCurrentView() {
    const state = window.AppState;
    switch (state.currentView) {
      case 'dashboard': return renderDashboard();
      case 'courses': return renderCoursesCatalog();
      case 'course-hub': return renderCourseHub();
      case 'roadmap': return renderRoadmap();
      case 'catalog': return renderCatalog();
      case 'quizzes': return renderQuizzes();
      case 'notes': return renderNotesView();
      case 'evaluation': return renderEvaluationView();
      case 'analytics': return renderAnalytics();
      case 'achievements': return renderAchievements();
      case 'admin': return renderAdmin();
      default: return renderDashboard();
    }
  }

    window.selectedNoteIndex = 0;
  window.selectStudentNote = function(idx) {
    window.selectedNoteIndex = idx;
    window.AppState.notify();
  };
  window.clearNoteForm = function(form) {
    if (form) {
      form.noteTitle.value = '';
      form.noteText.value = '';
    }
  };
  window.filterSavedNotes = function(val) {
    const q = (val || '').toLowerCase();
    const listEl = document.getElementById('saved-notes-list-box');
    if (!listEl) return;
    const items = listEl.querySelectorAll('.saved-note-item');
    items.forEach(item => {
      const text = item.innerText.toLowerCase();
      item.style.display = text.includes(q) ? 'block' : 'none';
    });
  };

  function renderNotesView() {
    const state = window.AppState;
    const user = state.currentUser || {};
    if (!user.notes || user.notes.length === 0) {
      user.notes = [
        {
          courseId: 'course-math-101',
          title: 'Derivatives and Integration Fundamentals',
          text: `Fundamental Theorem of Calculus:

1. Connects differentiation and integration.
2. The integral of a function f over [a,b] can be calculated by finding an antiderivative F of f:
∫(a to b) f(x) dx = F(b) - F(a)

Key takeaways from today's lecture:
- Always check if the function is continuous on the interval before applying FTC.
- Review the power rule and chain rule for tomorrow's quiz.
- Need to ask tutor about the specific edge cases for piecewise functions.`,
          date: 'Today',
          badge: 'Advanced Calculus I'
        },
        {
          courseId: 'course-physics-101',
          title: 'Schrödinger Equation Basics',
          text: 'Notes on time-dependent and time-independent forms. Wave function collapse...',
          date: 'Yesterday',
          badge: 'Quantum Mechanics'
        },
        {
          courseId: 'course-history-101',
          title: 'Industrial Revolution Impacts',
          text: 'Socio-economic shifts in 19th century Europe. Urbanization rates and labor laws...',
          date: 'Oct 12',
          badge: 'World History'
        },
        {
          courseId: 'course-chem-101',
          title: 'Acid-Base Titrations',
          text: 'Formulas for calculating pH at equivalence point. Weak acid strong base examples...',
          date: 'Oct 10',
          badge: 'General Chemistry'
        }
      ];
    }
    const courses = (state.data && state.data.courses) ? state.data.courses : [];
    const activeNoteIndex = window.selectedNoteIndex !== undefined ? window.selectedNoteIndex : 0;
    const currentActiveNote = user.notes[activeNoteIndex] || user.notes[0] || {};

    return `
      <div class="page-header">
        <h1 class="page-title">${renderIcon('file-text')} My Study Notes & Notepad</h1>
        <p class="page-subtitle">Take notes, list key takeaways, and document conceptual details while watching lecture videos.</p>
      </div>

      <div class="notes-2col-layout">
        <!-- Create / Edit Note Card (Matches 5.PNG) -->
        <div class="note-editor-card">
          <form onsubmit="event.preventDefault(); window.saveStudentNote(this);">
            <div class="note-editor-header">
              <div class="note-editor-title">Create / Edit Note</div>
              <div class="note-editor-actions">
                <button type="button" class="btn-note-clear" onclick="window.clearNoteForm(this.form)">Clear</button>
                <button type="submit" class="btn-note-save">
                  ${renderIcon('save')} Save Note
                </button>
              </div>
            </div>

            <div class="note-form-group">
              <label class="note-form-label">Select Course</label>
              <select name="courseId" class="note-select-input" required>
                ${courses.map(c => `<option value="${c.id}" ${currentActiveNote.courseId === c.id ? 'selected' : ''}>${c.title}</option>`).join('')}
              </select>
            </div>

            <div class="note-form-group">
              <label class="note-form-label">Note Title</label>
              <input type="text" name="noteTitle" class="note-text-input" value="${currentActiveNote.title || ''}" placeholder="e.g. Derivatives and Integration Fundamentals" required>
            </div>

            <div class="note-form-group">
              <label class="note-form-label">Note Content</label>
              <div class="note-editor-toolbar">
                <button type="button" class="toolbar-btn">B</button>
                <button type="button" class="toolbar-btn">I</button>
                <button type="button" class="toolbar-btn">${renderIcon('list')}</button>
                <button type="button" class="toolbar-btn">${renderIcon('list-ordered')}</button>
              </div>
              <textarea name="noteText" class="note-textarea" placeholder="Write down notes, formulas, conceptual takeaways..." required>${currentActiveNote.text || ''}</textarea>
            </div>
          </form>
        </div>

        <!-- Saved Notes List Card (Matches 5.PNG) -->
        <div class="saved-notes-container">
          <div class="saved-notes-header">
            <div class="saved-notes-title">Saved Notes</div>
            <a href="#" onclick="event.preventDefault();" class="saved-notes-view-all">View All</a>
          </div>

          <div class="saved-notes-search">
            ${renderIcon('search')}
            <input type="text" placeholder="Search notes..." oninput="window.filterSavedNotes(this.value)">
          </div>

          <div class="saved-notes-list" id="saved-notes-list-box">
            ${user.notes.map((n, idx) => {
              const course = courses.find(c => c.id === n.courseId);
              const badgeName = n.badge || (course ? course.title : 'General Studies');
              return `
                <div class="saved-note-item ${idx === activeNoteIndex ? 'active' : ''}" onclick="window.selectStudentNote(${idx})">
                  <div class="saved-note-top-line">
                    <span class="saved-note-tag">${badgeName}</span>
                    <span class="saved-note-date">${n.date || 'Today'}</span>
                  </div>
                  <div class="saved-note-heading">${n.title}</div>
                  <div class="saved-note-snippet">${n.text}</div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      </div>
    `;
  }

  window.saveStudentNote = function(form) {
    const user = window.AppState.currentUser;
    if (!user) return;
    if (!user.notes) user.notes = [];

    const courses = (window.AppState.data && window.AppState.data.courses) ? window.AppState.data.courses : [];
    const c = courses.find(item => item.id === form.courseId.value);
    const badgeName = c ? c.title : 'General Studies';

    const newNote = {
      courseId: form.courseId.value,
      title: form.noteTitle.value.trim(),
      text: form.noteText.value.trim(),
      badge: badgeName,
      date: 'Today'
    };

    user.notes.unshift(newNote);
    window.selectedNoteIndex = 0;
    window.AppState.saveData();
    window.AppState.notify();
  };

  window.deleteStudentNote = function(idx) {
    const user = window.AppState.currentUser;
    if (user && user.notes) {
      user.notes.splice(idx, 1);
      window.AppState.saveData();
      window.AppState.notify();
    }
  };
function renderEvaluationView() {
    const state = window.AppState;
    const user = state.currentUser || {};

    const concepts = [
      { id: 'c-1', subject: 'Artificial Intelligence', name: 'Neural Nets & Backpropagation', score: 92, level: 'Excellent', tips: 'Mastered gradients and feedforward logic. Ready for Transformer attention-mechanism architectures.' },
      { id: 'c-2', subject: 'Computer Science', name: 'Algorithm Complexity & Big-O Notation', score: 85, level: 'Proficient', tips: 'Solid sorting analysis. We suggest reviewing distributed database hash partitioning.' },
      { id: 'c-3', subject: 'Mathematics', name: 'Multivariable Calculus & Gradients', score: 76, level: 'Proficient', tips: 'Understand rates of change. Practice partial derivatives to optimize loss functions faster.' },
      { id: 'c-4', subject: 'Physics', name: 'Quantum Mechanics & Schrödinger Wave', score: 48, level: 'Needs Review', tips: 'Conceptual gap in wave-particle duality. Watch the double-slit simulation in Roadmap.' },
      { id: 'c-5', subject: 'Biology', name: 'Genetics & CRISPR-Cas9 Gene Cuts', score: 64, level: 'Basic', tips: 'Familiar with DNA helix replication. Re-study guide RNA targeting mechanisms.' },
      { id: 'c-6', subject: 'Chemistry', name: 'Gibbs Free Energy & Kinetics Rate Laws', score: 88, level: 'Proficient', tips: 'Excellent understanding of enthalpy. Review Arrhenius activation equations.' }
    ];

    return `
      <div class="page-header">
        <h1 class="page-title">${renderIcon('trending-up')} Conceptual Performance Evaluation</h1>
        <p class="page-subtitle">Real-time diagnostic scorecard evaluating your mastery of core subject concepts.</p>
      </div>

      <div class="widget-card" style="margin-bottom:28px;">
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:16px; border-bottom:1px solid var(--border-color); padding-bottom:16px; margin-bottom:20px;">
          <div>
            <h2 style="font-size:1.3rem; font-weight:800; color:var(--primary-500);">AI Diagnostic Summary</h2>
            <p style="font-size:0.88rem; color:var(--text-muted); margin-top:2px;">Evaluated on ${new Date().toLocaleDateString()} using current profile assessment & quiz responses.</p>
          </div>
          <button class="btn-hero-primary" style="background:var(--primary-gradient); color:#fff;" onclick="window.runDiagnosticEvaluation()">
            ${renderIcon('sparkles')} Run Diagnostic Evaluation
          </button>
        </div>

        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(min(100%, 250px), 1fr)); gap:20px;">
          ${concepts.map(c => {
            let badgeStyle = 'background:rgba(16,185,129,0.12); color:var(--color-emerald);';
            if (c.level === 'Proficient') badgeStyle = 'background:rgba(190,24,93,0.12); color:var(--primary-500);';
            if (c.level === 'Basic') badgeStyle = 'background:rgba(245,158,11,0.12); color:var(--color-amber);';
            if (c.level === 'Needs Review') badgeStyle = 'background:rgba(239,68,68,0.12); color:var(--color-rose);';

            return `
              <div style="padding:18px; border:1px solid var(--border-color); border-radius:var(--radius-md); background:var(--bg-surface);">
                <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:10px;">
                  <div>
                    <span style="font-size:0.72rem; color:var(--text-subtle); font-weight:700; text-transform:uppercase;">${c.subject}</span>
                    <h4 style="font-size:0.95rem; font-weight:800; margin-top:2px;">${c.name}</h4>
                  </div>
                  <span style="font-size:0.75rem; font-weight:800; padding:4px 8px; border-radius:var(--radius-full); ${badgeStyle}">${c.level}</span>
                </div>

                <div style="margin:14px 0;">
                  <div style="display:flex; justify-content:space-between; font-size:0.8rem; font-weight:700; margin-bottom:4px; color:var(--text-subtle);">
                    <span>Concept Mastery</span>
                    <span>${c.score}%</span>
                  </div>
                  <div style="width:100%; height:8px; background:var(--border-color); border-radius:var(--radius-full); overflow:hidden;">
                    <div style="width:${c.score}%; height:100%; background:var(--primary-gradient); border-radius:var(--radius-full);"></div>
                  </div>
                </div>

                <p style="font-size:0.8rem; color:var(--text-muted); line-height:1.4; border-top:1px dashed var(--border-color); padding-top:10px; margin-top:10px;">
                  <strong>AI Guide:</strong> ${c.tips}
                </p>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }

  window.runDiagnosticEvaluation = function() {
    alert('AI Diagnostic Evaluation: Analyzing quiz logs, reading progress, and lesson history... Concept scorecard is fully updated and optimized based on your current skill level!');
  };

    function renderCoursesCatalog() {
    const state = window.AppState;
    const user = state.currentUser || {};
    let courses = (state.data && state.data.courses) ? state.data.courses : [];
    const subjects = (state.data && state.data.subjects) ? state.data.subjects : [];
    const activeSub = state.activeSubjectFilter || 'all';

    if (activeSub !== 'all') {
      courses = courses.filter(c => c.subjectId === activeSub);
    }
    if (state.searchQuery) {
      const q = state.searchQuery.toLowerCase();
      courses = courses.filter(c => c.title.toLowerCase().includes(q) || c.description.toLowerCase().includes(q));
    }

    return `
      <div class="page-header">
        <h1 class="page-title">${renderIcon('graduation-cap')} Course Enrollment & Study Pathways</h1>
        <p class="page-subtitle">Enroll in structured AI & Computer Science courses with step-by-step study materials and quizzes.</p>
      </div>

      <!-- Filter Pills Bar (Matches 2.PNG) -->
      <div class="filter-pills-bar">
        <div class="nav-search catalog-search-input" style="width: 100%; max-width: 320px; margin-right: 8px;">
          ${renderIcon('search')}
          <input type="text" placeholder="Search courses, videos, quizzes..." value="${state.searchQuery || ''}" oninput="AppState.searchQuery = this.value; AppState.notify();">
        </div>
        <button class="pill-filter-btn ${activeSub === 'all' ? 'active' : ''}" onclick="AppState.activeSubjectFilter='all'; AppState.notify();">
          All Subjects
        </button>
        ${subjects.map(s => `
          <button class="pill-filter-btn ${activeSub === s.id ? 'active' : ''}" onclick="AppState.activeSubjectFilter='${s.id}'; AppState.notify();">
            ${s.name}
          </button>
        `).join('')}
      </div>

      <div class="courses-grid-4">
        ${courses.map(c => renderCourseCard(c, (user.enrolledCourseIds || []).includes(c.id))).join('')}
      </div>
    `;
  }

  function renderCourseCard(c, isEnrolled) {
    return `
      <div class="course-clean-card">
        <div class="course-card-banner" style="background-image: url('${c.bannerImage || 'https://images.unsplash.com/photo-1677442136019-21780efad99a?w=800'}');">
          <div class="course-ai-match-badge">
            ${c.matchScore || 95}% AI Match
          </div>
        </div>
        
        <div class="course-card-content">
          <div class="course-card-title">${c.title}</div>
          <div class="course-card-desc">${c.description}</div>
          
          <div class="course-card-meta">
            <div class="course-card-meta-item">${renderIcon('clock')} ${c.duration || '10 Weeks'}</div>
            <div class="course-card-meta-item">${renderIcon('users')} ${c.enrolledCount || '3.4k'}</div>
            <div class="course-card-meta-item">${renderIcon('star')} ${c.rating || '4.98'}</div>
          </div>

          <div style="margin-top:auto;">
            ${isEnrolled ? `
              <button class="btn-study-hub-clean" onclick="AppState.setView('course-hub', {courseId: '${c.id}'})">
                ${renderIcon('book-open')} Go to Study Hub
              </button>
            ` : `
              <button class="btn-enroll-dark" onclick="AppState.enrollInCourse('${c.id}')">
                ${renderIcon('plus-circle')} Enroll Now
              </button>
            `}
          </div>
        </div>
      </div>
    `;
  }

  // 3. COURSE STUDY MATERIAL HUB VIEW (WITH 3 CATEGORIES: BEGINNER, INTERMEDIATE, ADVANCED)
  let activeCourseCategory = 'Intermediate'; // Default or student active skill level

  function renderCourseHub() {
    const state = window.AppState;
    const courses = (state.data && state.data.courses) ? state.data.courses : [];
    const courseId = state.selectedCourseId || 'course-ai-101';
    const course = courses.find(c => c.id === courseId) || courses[0] || { title: 'AI Masterclass' };
    const userSkill = (state.currentUser && state.currentUser.skillLevel) || 'Intermediate';

    const courseAssignments = (state.data && state.data.assignments) ? state.data.assignments.filter(a => a.courseId === course.id) : [];
    const submissions = (state.data && state.data.submissions) ? state.data.submissions : [];

    if (!window.activeCourseCategory) window.activeCourseCategory = userSkill;
    const currentCategory = window.activeCourseCategory;

    const categories = course.categories || {};
    const beginnerData = categories.Beginner || { title: 'Beginner Category (5 Questions Quiz)', materials: [], quizId: `quiz-${course.subjectId || 'ds'}-beginner` };
    const intermediateData = categories.Intermediate || { title: 'Intermediate Category (10 Questions Quiz)', materials: [], quizId: `quiz-${course.subjectId || 'ds'}-intermediate` };
    const advancedData = categories.Advanced || { title: 'Advanced Category (15 Questions Quiz)', materials: [], quizId: `quiz-${course.subjectId || 'ds'}-advanced` };

    const currentCatData = currentCategory === 'Beginner' ? beginnerData : (currentCategory === 'Advanced' ? advancedData : intermediateData);
    const qCount = currentCategory === 'Beginner' ? 5 : (currentCategory === 'Intermediate' ? 10 : 15);

    return `
      <div style="margin-bottom:24px;">
        <button onclick="AppState.setView('courses')" style="font-size:0.88rem; font-weight:700; color:var(--color-teal-action); display:flex; align-items:center; gap:6px; margin-bottom:12px;">
          ${renderIcon('arrow-left')} Back to All Courses
        </button>
        
        <div class="hero-card" style="padding:28px;">
          <div class="hero-tag">${renderIcon('check-circle')} ENROLLED COURSE STUDY HUB</div>
          <h1 class="hero-title" style="font-size:1.8rem; font-weight:800; margin-bottom:8px; color:#ffffff !important;">${course.title}</h1>
          <p class="hero-subtitle" style="font-size:0.95rem; opacity:0.9; margin-bottom:16px; color:rgba(255,255,255,0.9) !important;">Instructor: ${course.instructor || 'AI Lab Faculty'} • Prerequisites: ${course.prerequisites || 'Basic Math'}</p>
        </div>
      </div>

      <!-- 3 Category Tabs: Beginner (5 Qs), Intermediate (10 Qs), Advanced (15 Qs) -->
      <div class="section-header" style="margin-bottom:16px;">
        <h2 style="font-size:1.3rem; font-weight:800;">Select Category Tier</h2>
        <span style="font-size:0.85rem; color:var(--text-muted); font-weight:600;">Your Current Level: <strong>${userSkill}</strong></span>
      </div>

      <div class="subject-tabs" style="margin-bottom:24px;">
        <button class="tab-btn ${currentCategory === 'Beginner' ? 'active' : ''}" onclick="window.activeCourseCategory='Beginner'; AppState.notify();">
          🟢 Beginner (5 Questions Quiz)
        </button>
        <button class="tab-btn ${currentCategory === 'Intermediate' ? 'active' : ''}" onclick="window.activeCourseCategory='Intermediate'; AppState.notify();">
          🟡 Intermediate (10 Questions Quiz)
        </button>
        <button class="tab-btn ${currentCategory === 'Advanced' ? 'active' : ''}" onclick="window.activeCourseCategory='Advanced'; AppState.notify();">
          🔴 Advanced (15 Questions Quiz)
        </button>
      </div>

      <div class="widget-card" style="margin-bottom:28px;">
        <h3 style="font-size:1.2rem; font-weight:800; margin-bottom:14px; color:var(--color-teal-action);">${currentCatData.title}</h3>

        <div style="display:flex; flex-direction:column; gap:12px; margin-bottom:20px; width:100%;">
          ${(currentCatData.materials || []).map(mat => `
            <div class="course-hub-material-row">
              <div class="course-hub-material-info">
                <span class="format-badge" style="background:var(--color-teal-light); color:var(--color-teal-action); flex-shrink:0;">${mat.format}</span>
                <span style="font-weight:700; font-size:0.95rem; min-width:0; overflow-wrap:break-word;">${mat.title}</span>
              </div>
              <button class="btn-launch-resource" style="padding:8px 16px; font-size:0.82rem; min-height:42px; display:inline-flex; align-items:center; gap:6px;" onclick="AppState.openModal('resource-viewer', '${mat.id}')">
                ${renderIcon('play')} Open Material
              </button>
            </div>
          `).join('')}
        </div>

        <div style="background:var(--color-teal-light); border:1px dashed var(--color-teal-action); padding:18px; border-radius:var(--radius-md); display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:14px; width:100%;">
          <div style="flex:1; min-width:200px;">
            <strong style="font-size:1rem; color:var(--color-teal-action);">${currentCategory} Category Quiz (${qCount} Questions)</strong>
            <p style="font-size:0.85rem; color:var(--text-muted); margin-top:2px;">Solve this ${qCount}-question quiz to evaluate your category mastery and interest.</p>
          </div>
          <button class="btn-launch-resource" style="background:#0f172a; padding:10px 20px; font-size:0.88rem; min-height:44px; display:inline-flex; align-items:center; gap:6px;" onclick="AppState.openModal('quiz', '${currentCatData.quizId}')">
            ${renderIcon('award')} Take ${qCount}-Question Quiz
          </button>
        </div>
      </div>

      <!-- Assignments Section -->
      <div class="widget-card" style="margin-bottom:28px; width:100%;">
        <h3 style="font-size:1.2rem; font-weight:800; margin-bottom:14px; color:var(--color-indigo); display:flex; align-items:center; gap:8px;">
          ${renderIcon('file-text')} Course Assignments & Projects
        </h3>
        
        ${courseAssignments.length === 0 ? `
          <p style="font-size:0.88rem; color:var(--text-muted); text-align:center; padding:12px;">No assignments created for this course yet.</p>
        ` : `
          <div style="display:flex; flex-direction:column; gap:16px; width:100%;">
            ${courseAssignments.map(a => {
              const sub = submissions.find(s => s.assignmentId === a.id && s.userId === (state.currentUser ? state.currentUser.id : ''));
              const isMCQ = a.questions && a.questions.length > 0;
              return `
                <div style="display:flex; align-items:center; justify-content:space-between; padding:16px; background:var(--bg-surface); border:1px solid var(--border-color); border-radius:var(--radius-md); flex-wrap:wrap; gap:14px; width:100%;">
                  <div style="flex:1; min-width:0; width:100%;">
                    <div style="display:flex; align-items:center; gap:8px; margin-bottom:6px; flex-wrap:wrap;">
                      <span style="font-weight:700; font-size:1.05rem;">${a.title}</span>
                      <span style="font-size:0.75rem; background:rgba(99, 102, 241, 0.12); color:var(--color-indigo); padding:2px 8px; border-radius:var(--radius-full); font-weight:700;">
                        ${a.points} Points
                      </span>
                      ${isMCQ ? `
                        <span style="font-size:0.75rem; background:rgba(37, 99, 235, 0.1); color:#2563eb; padding:2px 8px; border-radius:var(--radius-full); font-weight:700; display:inline-flex; align-items:center; gap:4px;">
                          ${renderIcon('help-circle', 'small-icon')} ${a.questions.length} Questions (MCQ)
                        </span>
                      ` : ''}
                      ${sub ? (sub.status === 'graded' || sub.score !== undefined ? `
                        <span style="font-size:0.75rem; background:${sub.passed ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)'}; color:${sub.passed ? 'var(--color-emerald)' : 'var(--color-rose)'}; padding:2px 8px; border-radius:var(--radius-full); font-weight:700; display:inline-flex; align-items:center; gap:4px;">
                          ${renderIcon('check')} Score: ${sub.score}/${a.points} (${sub.percentage}%) • ${sub.passed ? 'Passed' : 'Needs Practice'}
                        </span>
                      ` : `
                        <span style="font-size:0.75rem; background:rgba(16, 185, 129, 0.12); color:var(--color-emerald); padding:2px 8px; border-radius:var(--radius-full); font-weight:700; display:inline-flex; align-items:center; gap:4px;">
                          ${renderIcon('check')} Submitted
                        </span>
                      `) : `
                        <span style="font-size:0.75rem; background:rgba(100, 116, 139, 0.12); color:var(--text-muted); padding:2px 8px; border-radius:var(--radius-full); font-weight:700;">
                          Pending
                        </span>
                      `}
                    </div>
                    <p style="font-size:0.85rem; color:var(--text-muted); margin-bottom:0; line-height:1.4;">
                      ${a.description}
                    </p>
                    ${sub && sub.submissionText ? `
                      <div style="margin-top:10px; font-size:0.8rem; background:var(--bg-card); padding:8px 12px; border-radius:var(--radius-sm); border:1px solid var(--border-color); color:var(--text-main); word-break:break-word;">
                        <strong>Your submission:</strong> ${sub.submissionText}
                        ${sub.submissionLink ? `<br><strong>Link:</strong> <a href="${sub.submissionLink}" target="_blank" style="color:var(--color-purple); text-decoration:underline; word-break:break-all;">${sub.submissionLink}</a>` : ''}
                      </div>
                    ` : ''}
                  </div>
                  
                  <button class="btn-launch-resource" style="padding:9px 20px; font-size:0.85rem; background:var(--primary-gradient); color:#fff; border-radius:var(--radius-full); display:inline-flex; align-items:center; justify-content:center; gap:6px; font-weight:700; min-height:44px;" onclick="AppState.openModal('submit-assignment', '${a.id}')">
                    ${sub ? (isMCQ ? renderIcon('rotate-ccw') + ' View Results / Retake' : renderIcon('edit') + ' Resubmit') : (isMCQ ? renderIcon('play') + ' Start Assignment' : renderIcon('upload-cloud') + ' Submit Project')}
                  </button>
                </div>
              `;
            }).join('')}
          </div>
        `}
      </div>
    `;
  }

    function renderRoadmap() {
    const state = window.AppState;
    const subjects = (state.data && state.data.subjects) ? state.data.subjects : [];
    const activeSub = (state.activeSubjectFilter && state.activeSubjectFilter !== 'all') ? state.activeSubjectFilter : 'ds';
    const roadmaps = (state.data && state.data.roadmaps) ? state.data.roadmaps : {};
    
    const targetSubject = subjects.find(s => s.id === activeSub);
    const rawRoadmap = roadmaps[activeSub] || {
      title: 'Artificial Intelligence & Deep Learning Pathway',
      nodes: [
        { id: 'node-1', title: '1. Python for AI & Data Wrangling', status: 'completed', desc: 'NumPy arrays, Pandas & Matrix operations', resourceId: 'res-1' },
        { id: 'node-2', title: '2. Artificial Intelligence Core', status: 'in-progress', desc: 'Perceptrons, Gradient Descent & Backpropagation', resourceId: 'res-5' },
        { id: 'node-3', title: '3. Deep Learning & CNNs', status: 'locked', desc: 'Convolutional neural nets & Computer Vision', resourceId: 'res-2' },
        { id: 'node-4', title: '4. Transformers & LLM Architectures', status: 'locked', desc: 'Attention mechanism, BERT, GPT & NLP Models', resourceId: 'res-3' }
      ]
    };

    const completedResourceIds = (state.currentUser && state.currentUser.completedResourceIds) || [];
    
    let firstIncompleteFound = false;
    const nodes = (rawRoadmap.nodes || []).map((node, idx) => {
      let status = node.status;
      if (completedResourceIds.includes(node.resourceId) || idx === 0) {
        status = 'completed';
      } else if (!firstIncompleteFound) {
        status = 'in-progress';
        firstIncompleteFound = true;
      } else {
        status = 'locked';
      }
      return { ...node, status };
    });

    return `
      <div class="page-header">
        <h1 class="page-title">${renderIcon('git-branch')} Subject Learning Roadmaps</h1>
        <p class="page-subtitle">Interactive step-by-step visual pathways with milestone completion tracking.</p>
      </div>

      <!-- Subject Selector Pills (Matches 3.PNG) -->
      <div class="filter-pills-bar">
        ${subjects.map(s => `
          <button class="pill-filter-btn ${activeSub === s.id ? 'active' : ''}" onclick="AppState.activeSubjectFilter='${s.id}'; AppState.notify();">
            ${s.name}
          </button>
        `).join('')}
      </div>

      <div class="roadmap-box-container">
        <div class="roadmap-box-title">${rawRoadmap.title || 'Artificial Intelligence & Deep Learning Pathway'}</div>

        <div class="roadmap-steps-vertical">
          ${nodes.map(node => `
            <div class="roadmap-step-row">
              <div class="step-node-circle ${node.status}">
                ${node.status === 'completed' ? renderIcon('check') : (node.status === 'in-progress' ? renderIcon('play') : renderIcon('lock'))}
              </div>
              <div class="step-card-box ${node.status === 'in-progress' ? 'in-progress-border' : ''}">
                <div>
                  <div class="step-card-title">${node.title}</div>
                  <div class="step-card-desc">${node.desc}</div>
                </div>
                <div>
                  ${node.status === 'completed' ? `
                    <button class="btn-node-action dark" onclick="AppState.openModal('resource-viewer', '${node.resourceId}')">
                      Review Node Material
                    </button>
                  ` : (node.status === 'in-progress' ? `
                    <button class="btn-node-action teal" onclick="AppState.openModal('resource-viewer', '${node.resourceId}')">
                      Continue Node Material
                    </button>
                  ` : `
                    <button class="btn-node-action locked" disabled>
                      Locked Node
                    </button>
                  `)}
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  function renderCatalog() {
    const state = window.AppState;
    const user = state.currentUser || {};
    const filterSub = state.activeSubjectFilter;
    const filterFmt = state.activeFormatFilter;
    const resources = (state.data && state.data.resources) ? state.data.resources : [];
    const subjects = (state.data && state.data.subjects) ? state.data.subjects : [];

    const userInterests = (state.currentUser && state.currentUser.interests) ? state.currentUser.interests : [];
    const filteredSubjects = userInterests.length > 0 ? subjects.filter(s => userInterests.includes(s.id)) : subjects;

    let items = window.AIEngine ? window.AIEngine.getRecommendations(resources, user, filterSub, 50) : resources;

    if (state.searchQuery && state.searchQuery.trim() !== '') {
      const q = state.searchQuery.toLowerCase();
      items = items.filter(i => i.title.toLowerCase().includes(q) || (i.description && i.description.toLowerCase().includes(q)));
    }
    if (filterFmt && filterFmt !== 'all') {
      items = items.filter(i => i.format === filterFmt);
    }

    return `
      <div class="page-header">
        <h1 class="page-title">${renderIcon('book-open')} Resource Catalog & Study Materials</h1>
        <p class="page-subtitle">Filter by subject, format, VARK style suitability, and skill level.</p>
      </div>

      <div style="display:flex; gap:16px; flex-wrap:wrap; margin-bottom:24px;">
        <div class="subject-tabs">
          <button class="tab-btn ${filterSub === 'all' ? 'active' : ''}" onclick="AppState.activeSubjectFilter='all'; AppState.notify();">All Subjects</button>
          ${filteredSubjects.map(s => `
            <button class="tab-btn ${filterSub === s.id ? 'active' : ''}" onclick="AppState.activeSubjectFilter='${s.id}'; AppState.notify();">${s.name}</button>
          `).join('')}
        </div>

        <div class="subject-tabs">
          <button class="tab-btn ${filterFmt === 'all' ? 'active' : ''}" onclick="AppState.activeFormatFilter='all'; AppState.notify();">All Formats</button>
          <button class="tab-btn ${filterFmt === 'video' ? 'active' : ''}" onclick="AppState.activeFormatFilter='video'; AppState.notify();">Videos</button>
          <button class="tab-btn ${filterFmt === 'article' ? 'active' : ''}" onclick="AppState.activeFormatFilter='article'; AppState.notify();">Articles</button>
          <button class="tab-btn ${filterFmt === 'exercise' ? 'active' : ''}" onclick="AppState.activeFormatFilter='exercise'; AppState.notify();">Labs & Exercises</button>
        </div>
      </div>

      <div class="resource-grid">
        ${items.length > 0 ? items.map(res => renderResourceCard(res)).join('') : `
          <div style="grid-column: 1 / -1; padding:40px; text-align:center; color:var(--text-muted); background:var(--bg-card); border-radius:var(--radius-lg); border:1px solid var(--border-color);">
            <h3 style="font-size:1.1rem; font-weight:700; margin-bottom:8px;">No materials found for this exact filter combination</h3>
            <p style="font-size:0.88rem; margin-bottom:16px;">Click below to reset filters and view all available study materials.</p>
            <button class="btn-hero-primary" style="background:var(--primary-gradient); color:#fff; display:inline-flex;" onclick="AppState.activeSubjectFilter='all'; AppState.activeFormatFilter='all'; AppState.notify();">
              Reset Filters
            </button>
          </div>
        `}
      </div>
    `;
  }

  function renderResourceCard(res) {
    const state = window.AppState;
    const subjects = (state.data && state.data.subjects) ? state.data.subjects : [];
    const subject = subjects.find(s => s.id === res.subjectId) || { name: res.subjectId || 'Subject', color: '#6366f1' };

    return `
      <div class="resource-card">
        <div class="resource-top-bar">
          <div class="ai-match-badge">
            ${renderIcon('cpu')} ${res.matchScore || 95}% AI Match
          </div>
        </div>

        <h3 class="resource-title" style="margin-top: 8px;">${res.title}</h3>
        <p class="resource-desc">${res.description || res.summary}</p>

        <div style="font-size:0.75rem; color:var(--color-purple); font-weight:700; margin-bottom:12px; display:flex; align-items:center; gap:4px;">
          ${renderIcon('info')} ${res.reason || 'Adapted for your grade class & style'}
        </div>

        <div class="resource-meta" style="margin-bottom: 20px;">
          <div class="resource-meta-item">${renderIcon('clock')} ${res.duration}</div>
          <div class="resource-meta-item">${renderIcon('graduation-cap')} ${res.suitableClass || 'Grade 11-12'}</div>
          <div class="resource-meta-item">${renderIcon('bar-chart')} ${res.level}</div>
        </div>

        <div class="resource-actions">
          <button class="btn-launch-resource" onclick="AppState.openModal('resource-viewer', '${res.id}')">
            ${res.isCompleted ? renderIcon('check-circle-2') + ' Review' : renderIcon('play-circle') + ' Start Lesson'}
          </button>
          <button class="btn-bookmark ${res.isBookmarked ? 'active' : ''}" onclick="AppState.toggleBookmark('${res.id}')" title="Bookmark">
            ${renderIcon('bookmark')}
          </button>
        </div>
      </div>
    `;
  }

  // 6. QUIZZES VIEW (FILTERABLE BY SUBJECT & 3 CATEGORIES: BEGINNER 5 Qs, INTERMEDIATE 10 Qs, ADVANCED 15 Qs)
  let activeQuizCategoryFilter = 'all';
  let activeQuizSubjectFilter = 'all';

    function renderQuizzes() {
    const state = window.AppState;
    let quizzes = (state.data && state.data.quizzes) ? state.data.quizzes : [];
    const subjects = (state.data && state.data.subjects) ? state.data.subjects : [];

    if (activeQuizSubjectFilter && activeQuizSubjectFilter !== 'all') {
      quizzes = quizzes.filter(q => q.subjectId === activeQuizSubjectFilter);
    }

    if (activeQuizCategoryFilter && activeQuizCategoryFilter !== 'all') {
      quizzes = quizzes.filter(q => q.level === activeQuizCategoryFilter);
    }

    return `
      <div class="page-header">
        <h1 class="page-title">${renderIcon('award')} Skill Assessment & Interest Quizzes</h1>
        <p class="page-subtitle">3 Category Tiers for ALL Subjects: <strong>Beginner (5 Questions)</strong>, <strong>Intermediate (10 Questions)</strong>, and <strong>Advanced (15 Questions)</strong>.</p>
      </div>

      <div style="display:flex; flex-direction:column; gap:12px; margin-bottom:24px;">
        <!-- Row 1: Subject Filter Pills -->
        <div class="filter-pills-bar" style="margin-bottom:0;">
          <button class="pill-filter-btn ${activeQuizSubjectFilter === 'all' ? 'active' : ''}" onclick="window.activeQuizSubjectFilter='all'; AppState.notify();">
            All Subjects
          </button>
          ${subjects.map(s => `
            <button class="pill-filter-btn ${activeQuizSubjectFilter === s.id ? 'active' : ''}" onclick="window.activeQuizSubjectFilter='${s.id}'; AppState.notify();">
              ${s.name}
            </button>
          `).join('')}
        </div>

        <!-- Row 2: Category Filter Pills (Matches 4.PNG) -->
        <div class="filter-pills-bar" style="margin-bottom:0;">
          <button class="pill-filter-btn ${activeQuizCategoryFilter === 'all' ? 'active' : ''}" onclick="window.activeQuizCategoryFilter='all'; AppState.notify();">
            All Categories
          </button>
          <button class="pill-filter-btn ${activeQuizCategoryFilter === 'Beginner' ? 'active' : ''}" onclick="window.activeQuizCategoryFilter='Beginner'; AppState.notify();">
            <span class="category-dot teal"></span> Beginner (5 Questions)
          </button>
          <button class="pill-filter-btn ${activeQuizCategoryFilter === 'Intermediate' ? 'active' : ''}" onclick="window.activeQuizCategoryFilter='Intermediate'; AppState.notify();">
            <span class="category-dot yellow"></span> Intermediate (10 Questions)
          </button>
          <button class="pill-filter-btn ${activeQuizCategoryFilter === 'Advanced' ? 'active' : ''}" onclick="window.activeQuizCategoryFilter='Advanced'; AppState.notify();">
            <span class="category-dot red"></span> Advanced (15 Questions)
          </button>
        </div>
      </div>

      <div class="quizzes-grid-2x2">
        ${quizzes.map(q => {
          const subject = subjects.find(s => s.id === q.subjectId) || { name: q.subjectId };
          const qCount = q.questionCount || (q.questions ? q.questions.length : (q.level === 'Beginner' ? 5 : (q.level === 'Intermediate' ? 10 : 15)));
          const tierClass = (q.level || 'beginner').toLowerCase();

          return `
            <div class="quiz-card-clean">
              <div class="quiz-card-top-row">
                <div class="quiz-tier-badge ${tierClass}">
                  ${q.level} • ${qCount} Questions
                </div>
                <div class="quiz-card-duration">
                  ${renderIcon('clock')} ${q.timeLimitMinutes || (qCount === 5 ? 8 : (qCount === 10 ? 15 : 25))} Mins
                </div>
              </div>

              <div class="quiz-card-title">${q.title}</div>
              <div class="quiz-card-subject">Subject: ${subject.name} • ${qCount} Questions Assessment</div>

              <button class="btn-start-quiz-navy" onclick="AppState.openModal('quiz', '${q.id}')">
                ${renderIcon('play-circle')} Start ${qCount}-Question Quiz
              </button>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

    function renderAnalytics() {
    return `
      <div class="page-header">
        <h1 class="page-title">${renderIcon('trending-up')} Performance & Quiz Interest Analytics</h1>
        <p class="page-subtitle">Track your study patterns and mastery levels across subjects.</p>
      </div>

      <!-- Top Row: Weekly Study Hours & Radar Chart (Matches 7.PNG) -->
      <div class="insights-charts-grid">
        <div class="insight-chart-card">
          <div class="insight-chart-header">
            <div class="insight-chart-title">Weekly Study Hours</div>
            ${renderIcon('bar-chart-2')}
          </div>
          <div class="insight-canvas-wrapper">
            <canvas id="weeklyHoursChart"></canvas>
          </div>
        </div>

        <div class="insight-chart-card">
          <div class="insight-chart-header">
            <div class="insight-chart-title">Subject Mastery & Interest Radar</div>
            ${renderIcon('target')}
          </div>
          <div class="insight-canvas-wrapper">
            <canvas id="subjectMasteryChart"></canvas>
          </div>
        </div>
      </div>

      <!-- Bottom Section: Conceptual Performance Evaluation (Matches 7.PNG) -->
      <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:20px; flex-wrap:wrap; gap:12px;">
        <h2 style="font-size:1.25rem; font-weight:800; color:var(--text-main); margin:0;">Conceptual Performance Evaluation</h2>
        <button class="btn-run-diagnostic" onclick="window.runDiagnosticEvaluation()">
          ${renderIcon('play')} Run Diagnostic Evaluation &gt;
        </button>
      </div>

      <div class="concept-eval-grid">
        <!-- Card 1: Artificial Intelligence -->
        <div class="concept-eval-card">
          <div class="concept-card-header">
            <div class="concept-sq-icon">
              ${renderIcon('cpu')}
            </div>
            <div class="concept-card-title">Artificial Intelligence</div>
          </div>
          <div class="mastery-label-row">
            <span>Mastery Level</span>
            <span style="color:var(--color-teal-action); font-weight:800;">85%</span>
          </div>
          <div class="mastery-track">
            <div class="mastery-fill teal" style="width: 85%;"></div>
          </div>
          <div class="ai-guide-box">
            ${renderIcon('lightbulb')} <strong>AI Guide:</strong> Solid understanding of neural networks. Focus review on backpropagation algorithms.
          </div>
        </div>

        <!-- Card 2: Computer Science -->
        <div class="concept-eval-card">
          <div class="concept-card-header">
            <div class="concept-sq-icon">
              ${renderIcon('code')}
            </div>
            <div class="concept-card-title">Computer Science</div>
          </div>
          <div class="mastery-label-row">
            <span>Mastery Level</span>
            <span style="color:#0f172a; font-weight:800;">72%</span>
          </div>
          <div class="mastery-track">
            <div class="mastery-fill navy" style="width: 72%;"></div>
          </div>
          <div class="ai-guide-box">
            ${renderIcon('lightbulb')} <strong>AI Guide:</strong> Good grasp of data structures. Needs more practice with dynamic programming concepts.
          </div>
        </div>

        <!-- Card 3: Advanced Mathematics -->
        <div class="concept-eval-card">
          <div class="concept-card-header">
            <div class="concept-sq-icon">
              ${renderIcon('calculator')}
            </div>
            <div class="concept-card-title">Advanced Mathematics</div>
          </div>
          <div class="mastery-label-row">
            <span>Mastery Level</span>
            <span style="color:#64748b; font-weight:800;">60%</span>
          </div>
          <div class="mastery-track">
            <div class="mastery-fill slate" style="width: 60%;"></div>
          </div>
          <div class="ai-guide-box">
            ${renderIcon('lightbulb')} <strong>AI Guide:</strong> Action required. Schedule dedicated study time for linear algebra applications.
          </div>
        </div>
      </div>
    `;
  }

  function attachCharts() {
    if (window.AppState.currentView !== 'analytics' && window.AppState.currentView !== 'dashboard') return;
    if (!window.Chart) return;

    const ctx1 = document.getElementById('weeklyHoursChart');
    if (ctx1) {
      const chart1 = new Chart(ctx1, {
        type: 'bar',
        data: {
          labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
          datasets: [{
            label: 'Study Hours',
            data: [3, 4.5, 2, 5, 3.5, 6, 2],
            backgroundColor: '#0b192c',
            borderRadius: 4,
            barThickness: 28
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false }
          },
          scales: {
            y: {
              beginAtZero: true,
              max: 6,
              ticks: { stepSize: 1 }
            },
            x: {
              grid: { display: false }
            }
          }
        }
      });
      activeCharts.push(chart1);
    }

    const ctx2 = document.getElementById('subjectMasteryChart');
    if (ctx2) {
      const chart2 = new Chart(ctx2, {
        type: 'radar',
        data: {
          labels: ['AI', 'Math', 'Physics', 'CS', 'Ethics', 'Data'],
          datasets: [
            {
              label: 'Mastery',
              data: [80, 50, 60, 75, 40, 70],
              borderColor: '#64748b',
              backgroundColor: 'rgba(100, 116, 139, 0.35)',
              borderWidth: 2,
              pointBackgroundColor: '#64748b',
              pointRadius: 3
            },
            {
              label: 'Interest',
              data: [95, 65, 40, 90, 70, 85],
              borderColor: '#0f766e',
              backgroundColor: 'rgba(15, 118, 110, 0.25)',
              borderWidth: 2,
              pointBackgroundColor: '#0f766e',
              pointRadius: 3
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: { boxWidth: 14, font: { size: 12, weight: 'bold' } }
            }
          },
          scales: {
            r: {
              angleLines: { color: 'rgba(150, 150, 150, 0.2)' },
              grid: { color: 'rgba(150, 150, 150, 0.2)' },
              suggestedMin: 0,
              suggestedMax: 100,
              ticks: { display: false }
            }
          }
        }
      });
      activeCharts.push(chart2);
    }
  }

    function renderAchievements() {
    const state = window.AppState;
    const user = state.currentUser || {};
    const courses = (state.data && state.data.courses) ? state.data.courses : [];

    return `
      <div class="page-header">
        <h1 class="page-title">${renderIcon('award')} Achievements & Certificates</h1>
        <p class="page-subtitle">Earn badges by completing courses and generate official verified certificates.</p>
      </div>

      <!-- Section 1: Unlocked Badges (Matches 6.PNG) -->
      <div class="badges-section-header">
        <h2 style="font-size: 1.25rem; font-weight: 800; color: var(--text-main);">Unlocked Badges</h2>
        <span class="total-count-badge">Total: 4</span>
      </div>

      <div class="unlocked-badges-row-4">
        <div class="achievement-badge-box">
          <div class="badge-round-icon">
            ${renderIcon('rocket')}
          </div>
          <div class="achievement-box-title">Quick Starter</div>
          <div class="achievement-box-desc">Completed first course within 48 hours of enrollment.</div>
        </div>

        <div class="achievement-badge-box">
          <div class="badge-round-icon">
            ${renderIcon('bot')}
          </div>
          <div class="achievement-box-title">AI Enrollee</div>
          <div class="achievement-box-desc">Started the first module in the AI Fundamentals path.</div>
        </div>

        <div class="achievement-badge-box">
          <div class="badge-round-icon">
            ${renderIcon('flame')}
          </div>
          <div class="achievement-box-title">7 Day Streak</div>
          <div class="achievement-box-desc">Logged in and completed lessons for 7 consecutive days.</div>
        </div>

        <div class="achievement-badge-box">
          <div class="badge-round-icon">
            ${renderIcon('award')}
          </div>
          <div class="achievement-box-title">Top 10%</div>
          <div class="achievement-box-desc">Scored in the top 10% on the mid-term assessment.</div>
        </div>
      </div>

      <!-- Section 2: Course Certificates (Matches 6.PNG) -->
      <div style="margin-bottom: 16px;">
        <h2 style="font-size: 1.25rem; font-weight: 800; color: var(--text-main);">Course Certificates</h2>
      </div>

      <div class="course-certs-list">
        <div class="course-cert-row">
          <div class="cert-left-box">
            <div class="cert-code-icon-sq">&lt;&gt;</div>
            <div>
              <div class="cert-row-title">Introduction to Python Programming</div>
              <div class="cert-row-meta">
                Completed on October 12, 2023 • Grade: 98%
                <span class="cert-verified-tag">Verified</span>
              </div>
            </div>
          </div>
          <button class="btn-cert-download" onclick="AppState.openModal('certificate', { courseId: 'course-cs-101' })">
            ${renderIcon('download')} Certificate
          </button>
        </div>

        <div class="course-cert-row">
          <div class="cert-left-box">
            <div class="cert-code-icon-sq">{}</div>
            <div>
              <div class="cert-row-title">Data Structures and Algorithms</div>
              <div class="cert-row-meta">
                Completed on November 05, 2023 • Grade: 92%
                <span class="cert-verified-tag">Verified</span>
              </div>
            </div>
          </div>
          <button class="btn-cert-download" onclick="AppState.openModal('certificate', { courseId: 'course-ai-101' })">
            ${renderIcon('download')} Certificate
          </button>
        </div>
      </div>
    `;
  }

  window.activeAdminTab = 'courses';

  window.handleCreateSubjectSubmit = function(e) {
    e.preventDefault();
    const form = e.target;
    const subId = form.subId.value.trim().toLowerCase();
    const name = form.name.value.trim();
    const icon = form.icon.value.trim() || 'book';
    const color = form.color.value.trim() || '#8b5cf6';
    const description = form.description.value.trim();

    if (!subId || !name || !description) {
      alert("Please fill in Subject ID, Name, and Description.");
      return;
    }

    const state = window.AppState;
    const existing = state.data.subjects ? state.data.subjects.find(s => s.id === subId) : null;
    if (existing) {
      alert(`Subject with ID "${subId}" already exists!`);
      return;
    }

    const newSubject = {
      id: subId,
      name: name,
      icon: icon,
      color: color,
      description: description
    };

    window.AppState.addSubject(newSubject);
    alert(`Subject "${name}" successfully created and saved dynamically!`);
    form.reset();
    AppState.notify();
  };

  window.handleCreateCourseSubmit = function(e) {
    e.preventDefault();
    const form = e.target;
    const courseObj = {
      title: form.title.value.trim(),
      subjectId: form.subjectId.value,
      instructor: form.instructor.value.trim() || 'AI Faculty',
      prerequisites: form.prerequisites.value.trim() || 'None',
      duration: form.duration.value ? `${form.duration.value} Weeks` : '8 Weeks',
      description: form.description.value.trim(),
      bannerImage: form.bannerImage.value.trim() || 'https://images.unsplash.com/photo-1677442136019-21780efad99a?w=800'
    };
    if (!courseObj.title || !courseObj.description) {
      alert("Please enter a course title and description.");
      return;
    }
    if (!courseObj.subjectId || courseObj.subjectId === 'ADD_NEW_SUBJECT') {
      alert("Please select a valid subject for the course.");
      return;
    }
    window.AppState.addCourse(courseObj);
    alert(`Course "${courseObj.title}" successfully created and saved dynamically to Firebase!`);
    form.reset();
    window.activeAdminTab = 'course-directory';
    window.AppState.notify();
  };

  window.handleDeleteCourse = function(courseId) {
    const courses = (window.AppState.data && window.AppState.data.courses) ? window.AppState.data.courses : [];
    const c = courses.find(item => item.id === courseId);
    const title = c ? c.title : 'this course';
    if (confirm(`Are you sure you want to permanently delete course "${title}"?`)) {
      window.AppState.deleteCourse(courseId);
      window.AppState.notify();
    }
  };

  window.handleRegisterVideoSubmit = function(e) {
    e.preventDefault();
    const form = e.target;
    const courseId = form.courseId.value;
    const tier = form.tier.value;
    const title = form.title.value.trim();
    const contentUrl = form.contentUrl.value.trim();
    const duration = form.duration.value.trim() || '15 mins';
    const description = form.description.value.trim();

    if (!courseId || !title || !contentUrl) {
      alert("Please fill in Course, Title, and Video URL.");
      return;
    }
    window.AppState.addVideoToCourse(courseId, tier, title, description, contentUrl, duration);
    alert("Video material successfully added to course and synced with Firebase!");
    form.reset();
  };

  // ==========================================================================
  // DYNAMIC MCQ ASSIGNMENT BUILDER (Admin Side)
  // ==========================================================================
  window.assignmentBuilder = {
    editingId: null,
    courseId: '',
    title: '',
    points: 100,
    description: '',
    questions: [
      {
        id: 'q-' + Date.now() + '-1',
        text: '',
        options: ['', '', '', ''],
        correctAnswer: 0
      }
    ]
  };

  window.draggedQuestionIndex = null;

  function escapeHtmlAttr(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  window.initAssignmentBuilderState = function(defaultCourseId) {
    if (!window.assignmentBuilder) {
      window.assignmentBuilder = {
        editingId: null,
        courseId: defaultCourseId || '',
        title: '',
        points: 100,
        description: '',
        questions: []
      };
    }
    if (!window.assignmentBuilder.courseId && defaultCourseId) {
      window.assignmentBuilder.courseId = defaultCourseId;
    }
    if (!window.assignmentBuilder.questions || window.assignmentBuilder.questions.length === 0) {
      window.assignmentBuilder.questions = [
        {
          id: 'q-' + Date.now() + '-1',
          text: '',
          options: ['', '', '', ''],
          correctAnswer: 0
        }
      ];
    }
  };

  window.updateBuilderField = function(field, val) {
    if (!window.assignmentBuilder) window.initAssignmentBuilderState();
    window.assignmentBuilder[field] = val;
  };

  window.updateQuestionText = function(qIdx, text) {
    if (window.assignmentBuilder && window.assignmentBuilder.questions && window.assignmentBuilder.questions[qIdx]) {
      window.assignmentBuilder.questions[qIdx].text = text;
    }
  };

  window.updateOptionText = function(qIdx, optIdx, text) {
    if (window.assignmentBuilder && window.assignmentBuilder.questions && window.assignmentBuilder.questions[qIdx]) {
      if (!window.assignmentBuilder.questions[qIdx].options) {
        window.assignmentBuilder.questions[qIdx].options = ['', '', '', ''];
      }
      window.assignmentBuilder.questions[qIdx].options[optIdx] = text;
    }
  };

  window.setCorrectOption = function(qIdx, optIdx) {
    if (!window.assignmentBuilder || !window.assignmentBuilder.questions || !window.assignmentBuilder.questions[qIdx]) return;
    window.assignmentBuilder.questions[qIdx].correctAnswer = optIdx;

    // Immediately update option rows inside this card
    const card = document.querySelector(`.mcq-builder-card[data-qindex="${qIdx}"]`);
    if (card) {
      const rows = card.querySelectorAll('.mcq-option-row');
      rows.forEach((row, idx) => {
        const isSelected = idx === optIdx;
        row.classList.toggle('is-correct', isSelected);
        const radioBtn = row.querySelector('.mcq-radio-btn');
        if (radioBtn) {
          radioBtn.innerHTML = isSelected ? renderIcon('check', 'small-icon') : '';
        }
        let tag = row.querySelector('.mcq-correct-tag');
        if (isSelected) {
          if (!tag) {
            tag = document.createElement('span');
            tag.className = 'mcq-correct-tag';
            tag.innerHTML = `${renderIcon('check', 'small-icon')} Correct Answer`;
            row.appendChild(tag);
          }
        } else {
          if (tag) tag.remove();
        }
      });
    }
  };

  window.addQuestionToBuilder = function(afterIndex) {
    if (!window.assignmentBuilder) window.initAssignmentBuilderState();
    const newQ = {
      id: 'q-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
      text: '',
      options: ['', '', '', ''],
      correctAnswer: 0
    };
    if (afterIndex !== undefined && afterIndex !== null && afterIndex >= 0) {
      window.assignmentBuilder.questions.splice(afterIndex + 1, 0, newQ);
    } else {
      window.assignmentBuilder.questions.push(newQ);
    }
    window.refreshAssignmentBuilderQuestions();

    setTimeout(() => {
      const targetIdx = (afterIndex !== undefined && afterIndex !== null && afterIndex >= 0) ? afterIndex + 1 : window.assignmentBuilder.questions.length - 1;
      const targetCard = document.querySelector(`.mcq-builder-card[data-qindex="${targetIdx}"]`);
      if (targetCard) {
        targetCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
        const input = targetCard.querySelector('input[type="text"]');
        if (input) input.focus();
      }
    }, 60);
  };

  window.deleteQuestionFromBuilder = function(qIdx) {
    if (!window.assignmentBuilder || !window.assignmentBuilder.questions) return;
    if (window.assignmentBuilder.questions.length <= 1) {
      alert("An assignment must have at least one question. You cannot delete the only question.");
      return;
    }
    window.assignmentBuilder.questions.splice(qIdx, 1);
    window.refreshAssignmentBuilderQuestions();
  };

  window.moveQuestionInBuilder = function(fromIdx, toIdx) {
    if (!window.assignmentBuilder || !window.assignmentBuilder.questions) return;
    const questions = window.assignmentBuilder.questions;
    if (toIdx < 0 || toIdx >= questions.length) return;
    const item = questions.splice(fromIdx, 1)[0];
    questions.splice(toIdx, 0, item);
    window.refreshAssignmentBuilderQuestions();
  };

  window.handleQuestionDragStart = function(e, index) {
    window.draggedQuestionIndex = index;
    e.dataTransfer.effectAllowed = 'move';
    try {
      e.dataTransfer.setData('text/plain', String(index));
    } catch (err) {}
    const card = e.currentTarget.closest('.mcq-builder-card');
    if (card) {
      setTimeout(() => card.classList.add('dragging'), 0);
    }
  };

  window.handleQuestionDragOver = function(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    const card = e.currentTarget.closest('.mcq-builder-card');
    if (card && !card.classList.contains('dragging')) {
      card.classList.add('drag-over');
    }
  };

  window.handleQuestionDragLeave = function(e) {
    const card = e.currentTarget.closest('.mcq-builder-card');
    if (card) {
      card.classList.remove('drag-over');
    }
  };

  window.handleQuestionDrop = function(e, targetIndex) {
    e.preventDefault();
    const card = e.currentTarget.closest('.mcq-builder-card');
    if (card) card.classList.remove('drag-over');
    if (window.draggedQuestionIndex !== null && window.draggedQuestionIndex !== targetIndex) {
      window.moveQuestionInBuilder(window.draggedQuestionIndex, targetIndex);
    }
    window.draggedQuestionIndex = null;
  };

  window.handleQuestionDragEnd = function(e) {
    const cards = document.querySelectorAll('.mcq-builder-card');
    cards.forEach(c => {
      c.classList.remove('dragging');
      c.classList.remove('drag-over');
    });
    window.draggedQuestionIndex = null;
  };

  window.renderAssignmentBuilderQuestionsHtml = function() {
    const questions = (window.assignmentBuilder && window.assignmentBuilder.questions) ? window.assignmentBuilder.questions : [];
    const letters = ['A', 'B', 'C', 'D'];
    return questions.map((q, qIdx) => {
      return `
        <div class="mcq-builder-card" data-qindex="${qIdx}" ondragover="window.handleQuestionDragOver(event)" ondragleave="window.handleQuestionDragLeave(event)" ondrop="window.handleQuestionDrop(event, ${qIdx})">
          <div class="mcq-card-header">
            <div class="mcq-card-title-wrap">
              <div class="mcq-drag-handle" draggable="true" ondragstart="window.handleQuestionDragStart(event, ${qIdx})" ondragend="window.handleQuestionDragEnd(event)" title="Drag up or down to reorder question">
                ⋮⋮
              </div>
              <span class="mcq-question-badge">
                Question ${qIdx + 1}
              </span>
              <div style="display:inline-flex; gap:4px; margin-left:4px;">
                <button type="button" class="btn-reorder-arrow" title="Move Up" onclick="window.moveQuestionInBuilder(${qIdx}, ${qIdx - 1})" ${qIdx === 0 ? 'disabled' : ''}>
                  ▲
                </button>
                <button type="button" class="btn-reorder-arrow" title="Move Down" onclick="window.moveQuestionInBuilder(${qIdx}, ${qIdx + 1})" ${qIdx === questions.length - 1 ? 'disabled' : ''}>
                  ▼
                </button>
              </div>
            </div>
            <div class="mcq-card-actions">
              <button type="button" class="btn-delete-q" onclick="window.deleteQuestionFromBuilder(${qIdx})" title="Delete this question">
                ${renderIcon('trash-2', 'small-icon')} Delete Question
              </button>
            </div>
          </div>

          <div>
            <label style="font-size:0.8rem; font-weight:700; display:block; margin-bottom:4px;">Question Text</label>
            <input type="text" id="q-text-${qIdx}" value="${escapeHtmlAttr(q.text || '')}" placeholder="e.g. What is AI?" oninput="window.updateQuestionText(${qIdx}, this.value)" style="width:100%; padding:10px; border-radius:var(--radius-sm); border:1px solid var(--border-color); background:var(--bg-card); color:var(--text-main); font-size:0.9rem; font-family:inherit;">
          </div>

          <div class="mcq-options-container">
            <div style="font-size:0.75rem; color:var(--text-muted); font-weight:600; margin-bottom:2px; display:flex; justify-content:space-between; align-items:center;">
              <span>Options & Correct Answer (Select the radio button for the correct answer):</span>
              <span style="font-size:0.72rem; color:var(--color-emerald); font-weight:700;">Only 1 option can be correct</span>
            </div>
            ${letters.map((letter, optIdx) => {
              const isCorrect = q.correctAnswer === optIdx;
              const optVal = (q.options && q.options[optIdx]) ? q.options[optIdx] : '';
              return `
                <div class="mcq-option-row ${isCorrect ? 'is-correct' : ''}" data-optindex="${optIdx}">
                  <button type="button" class="mcq-radio-btn" onclick="window.setCorrectOption(${qIdx}, ${optIdx})" title="Mark Option ${letter} as Correct">
                    ${isCorrect ? renderIcon('check', 'small-icon') : ''}
                  </button>
                  <div class="mcq-option-badge">${letter}</div>
                  <input type="text" id="q-opt-${qIdx}-${optIdx}" class="mcq-option-input" value="${escapeHtmlAttr(optVal)}" placeholder="Option ${letter} answer text..." oninput="window.updateOptionText(${qIdx}, ${optIdx}, this.value)">
                  ${isCorrect ? `<span class="mcq-correct-tag">${renderIcon('check', 'small-icon')} Correct Answer</span>` : ''}
                </div>
              `;
            }).join('')}
          </div>

          <button type="button" class="btn-add-next-q" onclick="window.addQuestionToBuilder(${qIdx})">
            ➕ Add Next Question
          </button>
        </div>
      `;
    }).join('');
  };

  window.refreshAssignmentBuilderQuestions = function() {
    const container = document.getElementById('mcqQuestionsBuilderList');
    if (container) {
      container.innerHTML = window.renderAssignmentBuilderQuestionsHtml();
    }
    const badge = document.getElementById('builderQuestionsCountBadge');
    if (badge) {
      const count = window.assignmentBuilder.questions ? window.assignmentBuilder.questions.length : 0;
      badge.textContent = `${count} Question${count === 1 ? '' : 's'}`;
    }
  };

  window.handleSaveAssignmentBuilder = function(e) {
    if (e) e.preventDefault();
    const b = window.assignmentBuilder;
    if (!b) return;

    // Sync top inputs if in DOM
    const form = document.getElementById('mcqAssignmentBuilderForm');
    if (form) {
      if (form.courseId) b.courseId = form.courseId.value;
      if (form.title) b.title = form.title.value.trim();
      if (form.points) b.points = Number(form.points.value) || 100;
      if (form.description) b.description = form.description.value.trim();
    }

    if (!b.courseId) {
      alert("Please select a Target Course.");
      return;
    }
    if (!b.title) {
      alert("Please enter an Assignment Title.");
      const el = document.getElementById('assignmentBuilderTitleInput');
      if (el) el.focus();
      return;
    }
    if (!b.description) {
      alert("Please provide Instructions & Criteria for the assignment.");
      const el = document.getElementById('assignmentBuilderDescInput');
      if (el) el.focus();
      return;
    }
    if (!b.questions || b.questions.length === 0) {
      alert("Please add at least one question to the assignment.");
      return;
    }

    for (let i = 0; i < b.questions.length; i++) {
      const q = b.questions[i];
      if (!q.text || !q.text.trim()) {
        alert(`Question ${i + 1} text cannot be empty.`);
        const input = document.getElementById(`q-text-${i}`);
        if (input) {
          input.focus();
          input.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        return;
      }
      for (let j = 0; j < 4; j++) {
        const optVal = q.options ? q.options[j] : '';
        if (!optVal || !optVal.trim()) {
          alert(`Question ${i + 1}, Option ${String.fromCharCode(65 + j)} cannot be empty.`);
          const optInput = document.getElementById(`q-opt-${i}-${j}`);
          if (optInput) {
            optInput.focus();
            optInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
          return;
        }
      }
    }

    if (b.editingId) {
      window.AppState.updateAssignment(b.editingId, {
        courseId: b.courseId,
        title: b.title,
        description: b.description,
        points: b.points,
        questions: b.questions
      });
      alert(`Assignment "${b.title}" updated successfully!`);
    } else {
      window.AppState.addAssignment(b.courseId, b.title, b.description, b.points, b.questions);
      alert(`Assignment "${b.title}" successfully created with ${b.questions.length} MCQ questions!`);
    }

    window.resetAssignmentBuilder();
    window.AppState.notify();
  };

  window.editAssignmentInBuilder = function(assignmentId) {
    const state = window.AppState;
    const a = (state.data && state.data.assignments) ? state.data.assignments.find(item => item.id === assignmentId) : null;
    if (!a) return;

    window.assignmentBuilder = {
      editingId: a.id,
      courseId: a.courseId,
      title: a.title,
      points: a.points || 100,
      description: a.description || '',
      questions: (a.questions && a.questions.length > 0) ? JSON.parse(JSON.stringify(a.questions)) : [
        {
          id: 'q-' + Date.now() + '-1',
          text: '',
          options: ['', '', '', ''],
          correctAnswer: 0
        }
      ]
    };

    window.activeAdminTab = 'assignments';
    window.AppState.notify();

    setTimeout(() => {
      const builderCard = document.getElementById('mcqAssignmentBuilderCard');
      if (builderCard) {
        builderCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 60);
  };

  window.resetAssignmentBuilder = function() {
    const state = window.AppState;
    const courses = (state.data && state.data.courses) ? state.data.courses : [];
    window.assignmentBuilder = {
      editingId: null,
      courseId: courses[0] ? courses[0].id : '',
      title: '',
      points: 100,
      description: '',
      questions: [
        {
          id: 'q-' + Date.now() + '-1',
          text: '',
          options: ['', '', '', ''],
          correctAnswer: 0
        }
      ]
    };
    window.AppState.notify();
  };

  window.deleteAssignmentConfirm = function(assignmentId) {
    const a = (window.AppState.data && window.AppState.data.assignments) ? window.AppState.data.assignments.find(item => item.id === assignmentId) : null;
    const title = a ? a.title : 'this assignment';
    if (confirm(`Are you sure you want to permanently delete "${title}"?`)) {
      window.AppState.deleteAssignment(assignmentId);
      if (window.assignmentBuilder && window.assignmentBuilder.editingId === assignmentId) {
        window.resetAssignmentBuilder();
      } else {
        window.AppState.notify();
      }
    }
  };

  window.viewMCQSubmissionBreakdown = function(assignmentId, userId) {
    const state = window.AppState;
    const a = (state.data && state.data.assignments) ? state.data.assignments.find(item => item.id === assignmentId) : null;
    const sub = (state.data && state.data.submissions) ? state.data.submissions.find(item => item.assignmentId === assignmentId && item.userId === userId) : null;
    if (!a || !sub) {
      alert("Submission details not found.");
      return;
    }
    window.activeMCQBreakdownData = { assignment: a, submission: sub };
    window.AppState.openModal('mcq-admin-breakdown', { assignmentId, userId });
  };

  function renderAdmin() {
    const state = window.AppState;
    const resources = (state.data && state.data.resources) ? state.data.resources : [];
    const courses = (state.data && state.data.courses) ? state.data.courses : [];
    const subjects = (state.data && state.data.subjects) ? state.data.subjects : [];
    const assignments = (state.data && state.data.assignments) ? state.data.assignments : [];
    
    // Students list fetched dynamically from Firebase Firestore / state
    const rawStudents = (state.data && state.data.students && state.data.students.length > 0)
      ? state.data.students
      : ((state.data && state.data.defaultUsers) ? state.data.defaultUsers : []);
    
    const legacyMockIds = ['u-1', 'u-2', 'u-3', 'u-4', 'u-5', 'u-6', 'u-7', 'u-8'];
    const students = rawStudents.filter(u => u && u.role !== 'admin' && !legacyMockIds.includes(u.id));

    // Dynamic metrics calculation
    const totalRegisteredStudents = students.length;
    const totalActiveStudents = students.filter(s => (s.streakDays > 0) || (s.completedResourceIds && s.completedResourceIds.length > 0) || (s.enrolledCourseIds && s.enrolledCourseIds.length > 0)).length;
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const totalNewStudents = students.filter(s => {
      if (!s.createdAt) return true;
      const t = new Date(s.createdAt).getTime();
      return !isNaN(t) && t >= sevenDaysAgo;
    }).length;

    let activeTabContent = '';

    if (window.activeAdminTab === 'courses') {
      activeTabContent = `
        <div class="widget-card" style="max-width:680px; margin:0 auto; width:100%;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px; flex-wrap:wrap; gap:10px;">
            <div>
              <h2 style="font-size:1.25rem; font-weight:800; display:flex; align-items:center; gap:8px; margin:0;">
                ${renderIcon('plus-circle')} Create New Course
              </h2>
              <p style="font-size:0.84rem; color:var(--text-muted); margin-top:4px; margin-bottom:0;">
                Publish dynamic courses to the platform catalog and student curriculum.
              </p>
            </div>
            <button type="button" class="btn-table-action" style="padding:7px 14px; font-weight:700; border-radius:var(--radius-sm); border:1px solid var(--border-color); background:var(--bg-surface); color:var(--text-main); display:inline-flex; align-items:center; gap:6px;" onclick="window.activeAdminTab='course-directory'; AppState.notify();">
              ${renderIcon('graduation-cap', 'small-icon')} Course Directory (${courses.length})
            </button>
          </div>

          <form onsubmit="window.handleCreateCourseSubmit(event)">
            <div style="display:flex; flex-direction:column; gap:14px;">
              <div>
                <label style="font-size:0.8rem; font-weight:700; display:block; margin-bottom:4px;">Course Title</label>
                <input type="text" name="title" required placeholder="e.g. Advanced Deep Learning & AI" style="width:100%; padding:11px 12px; border-radius:var(--radius-md); border:1px solid var(--border-color); background:var(--bg-card); color:var(--text-main);">
              </div>
              <div>
                <label style="font-size:0.8rem; font-weight:700; display:block; margin-bottom:4px;">Subject</label>
                <select name="subjectId" required style="width:100%; padding:11px 12px; border-radius:var(--radius-md); border:1px solid var(--border-color); background:var(--bg-card); color:var(--text-main);" onchange="if(this.value === 'ADD_NEW_SUBJECT') { window.activeAdminTab = 'subjects'; AppState.notify(); }">
                  <option value="" disabled selected>Select Subject</option>
                  ${subjects.map(s => `<option value="${s.id}">${s.name}</option>`).join('')}
                  <option value="ADD_NEW_SUBJECT" style="color:var(--color-purple); font-weight:700;">+ Add New Subject...</option>
                </select>
              </div>
              <div class="admin-form-grid-2">
                <div>
                  <label style="font-size:0.8rem; font-weight:700; display:block; margin-bottom:4px;">Instructor</label>
                  <input type="text" name="instructor" placeholder="e.g. Dr. Alan Turing" style="width:100%; padding:11px 12px; border-radius:var(--radius-md); border:1px solid var(--border-color); background:var(--bg-card); color:var(--text-main);">
                </div>
                <div>
                  <label style="font-size:0.8rem; font-weight:700; display:block; margin-bottom:4px;">Duration (Weeks)</label>
                  <input type="number" name="duration" min="1" required placeholder="e.g. 10" style="width:100%; padding:11px 12px; border-radius:var(--radius-md); border:1px solid var(--border-color); background:var(--bg-card); color:var(--text-main);">
                </div>
              </div>
              <div>
                <label style="font-size:0.8rem; font-weight:700; display:block; margin-bottom:4px;">Banner Image URL (Optional)</label>
                <input type="text" name="bannerImage" placeholder="https://images.unsplash.com/photo-..." style="width:100%; padding:11px 12px; border-radius:var(--radius-md); border:1px solid var(--border-color); background:var(--bg-card); color:var(--text-main);">
              </div>
              <div>
                <label style="font-size:0.8rem; font-weight:700; display:block; margin-bottom:4px;">Prerequisites</label>
                <input type="text" name="prerequisites" placeholder="e.g. Python Programming, Linear Algebra" style="width:100%; padding:11px 12px; border-radius:var(--radius-md); border:1px solid var(--border-color); background:var(--bg-card); color:var(--text-main);">
              </div>
              <div>
                <label style="font-size:0.8rem; font-weight:700; display:block; margin-bottom:4px;">Description / Syllabus Summary</label>
                <textarea name="description" required placeholder="Provide syllabus guidelines and overview..." style="width:100%; height:95px; padding:11px 12px; border-radius:var(--radius-md); border:1px solid var(--border-color); background:var(--bg-card); color:var(--text-main); font-family:inherit; resize:vertical;"></textarea>
              </div>
              <button type="submit" class="btn-hero-primary" style="background:var(--primary-gradient); color:#fff; width:100%; padding:12px; justify-content:center; font-size:0.95rem; font-weight:800; border-radius:var(--radius-md); margin-top:6px;">
                ${renderIcon('plus-circle')} Create Course
              </button>
            </div>
          </form>
        </div>
      `;
    } else if (window.activeAdminTab === 'course-directory') {
      window.courseDirectorySearch = window.courseDirectorySearch || '';
      window.courseDirectorySubject = window.courseDirectorySubject || 'all';
      window.courseDirectoryViewMode = window.courseDirectoryViewMode || 'cards';

      let filteredCourses = courses.slice();
      if (window.courseDirectorySubject && window.courseDirectorySubject !== 'all') {
        filteredCourses = filteredCourses.filter(c => (c.subjectId || '').toLowerCase() === window.courseDirectorySubject.toLowerCase());
      }
      if (window.courseDirectorySearch && window.courseDirectorySearch.trim()) {
        const q = window.courseDirectorySearch.toLowerCase().trim();
        filteredCourses = filteredCourses.filter(c =>
          (c.title && c.title.toLowerCase().includes(q)) ||
          (c.instructor && c.instructor.toLowerCase().includes(q)) ||
          (c.description && c.description.toLowerCase().includes(q)) ||
          (c.subjectId && c.subjectId.toLowerCase().includes(q))
        );
      }

      activeTabContent = `
        <div class="widget-card">
          <!-- Directory Header -->
          <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:20px; flex-wrap:wrap; gap:14px;">
            <div>
              <div style="display:flex; align-items:center; gap:10px;">
                <h2 style="font-size:1.3rem; font-weight:800; margin:0; display:flex; align-items:center; gap:8px;">
                  ${renderIcon('graduation-cap')} Course Directory
                </h2>
                <span class="tag-pill" style="background:rgba(15,118,110,0.12); color:var(--color-teal-action); font-weight:800; font-size:0.8rem;">
                  ${filteredCourses.length} ${filteredCourses.length === 1 ? 'Course' : 'Courses'}
                </span>
              </div>
              <p style="font-size:0.84rem; color:var(--text-muted); margin-top:4px; margin-bottom:0;">
                All published courses. On mobile, browse easily with clean cards with zero horizontal scrolling required.
              </p>
            </div>

            <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
              <!-- View Mode Toggle -->
              <div class="view-mode-toggle" style="display:flex; background:var(--bg-surface); border:1px solid var(--border-color); border-radius:var(--radius-sm); padding:2px;">
                <button type="button" class="btn-view-toggle ${window.courseDirectoryViewMode === 'cards' ? 'active' : ''}" onclick="window.courseDirectoryViewMode='cards'; AppState.notify();" title="Card View">
                  ${renderIcon('layout-grid', 'small-icon')} Cards
                </button>
                <button type="button" class="btn-view-toggle ${window.courseDirectoryViewMode === 'table' ? 'active' : ''}" onclick="window.courseDirectoryViewMode='table'; AppState.notify();" title="Table View">
                  ${renderIcon('list', 'small-icon')} Table
                </button>
              </div>

              <!-- Create Course Shortcut -->
              <button type="button" class="btn-hero-primary" style="background:var(--primary-gradient); color:#fff; padding:8px 16px; font-size:0.84rem; border-radius:var(--radius-sm);" onclick="window.activeAdminTab='courses'; AppState.notify();">
                ${renderIcon('plus')} New Course
              </button>
            </div>
          </div>

          <!-- Filters Row: Search and Subject Pills -->
          <div style="display:flex; flex-direction:column; gap:12px; margin-bottom:20px; padding-bottom:16px; border-bottom:1px solid var(--border-color);">
            <div style="display:flex; align-items:center; gap:12px; flex-wrap:wrap;">
              <div class="nav-search" style="flex:1; min-width:0; width:100%; max-width:400px; padding:8px 14px;">
                ${renderIcon('search')}
                <input type="text" placeholder="Search courses by title, instructor..." value="${escapeHtmlAttr(window.courseDirectorySearch || '')}" oninput="window.courseDirectorySearch=this.value; AppState.notify();">
                ${window.courseDirectorySearch ? `
                  <button type="button" onclick="window.courseDirectorySearch=''; AppState.notify();" style="color:var(--text-muted); font-size:0.85rem;" title="Clear search">
                    ${renderIcon('x', 'small-icon')}
                  </button>
                ` : ''}
              </div>

              ${(window.courseDirectorySearch || window.courseDirectorySubject !== 'all') ? `
                <button type="button" onclick="window.courseDirectorySearch=''; window.courseDirectorySubject='all'; AppState.notify();" style="font-size:0.8rem; color:var(--color-rose); font-weight:700; text-decoration:underline;">
                  Reset Filters
                </button>
              ` : ''}
            </div>

            <!-- Subject Pills -->
            <div class="filter-pills-bar" style="margin-bottom:0;">
              <button class="pill-filter-btn ${window.courseDirectorySubject === 'all' ? 'active' : ''}" onclick="window.courseDirectorySubject='all'; AppState.notify();">
                All Subjects (${courses.length})
              </button>
              ${subjects.map(s => {
                const count = courses.filter(c => (c.subjectId || '').toLowerCase() === s.id.toLowerCase()).length;
                return `
                  <button class="pill-filter-btn ${window.courseDirectorySubject.toLowerCase() === s.id.toLowerCase() ? 'active' : ''}" onclick="window.courseDirectorySubject='${s.id}'; AppState.notify();">
                    ${s.name} (${count})
                  </button>
                `;
              }).join('')}
            </div>
          </div>

          <!-- Courses Display: Cards View vs Table View -->
          ${filteredCourses.length === 0 ? `
            <div style="text-align:center; padding:48px 16px; color:var(--text-muted);">
              <div style="font-size:2.4rem; margin-bottom:12px;">📚</div>
              <h3 style="font-size:1.1rem; font-weight:800; color:var(--text-main); margin-bottom:6px;">No courses found</h3>
              <p style="font-size:0.85rem; max-width:400px; margin:0 auto 16px auto;">
                ${window.courseDirectorySearch || window.courseDirectorySubject !== 'all' ? 'Try adjusting your search query or subject filters.' : 'No courses have been created yet. Click below to add the first course.'}
              </p>
              <button type="button" class="btn-hero-primary" style="background:var(--primary-gradient); color:#fff; padding:8px 18px; font-size:0.84rem; border-radius:var(--radius-sm);" onclick="window.activeAdminTab='courses'; AppState.notify();">
                ${renderIcon('plus-circle')} Create First Course
              </button>
            </div>
          ` : `
            <!-- Responsive Cards View -->
            <div class="admin-course-cards-container ${window.courseDirectoryViewMode === 'table' ? 'hide-on-desktop' : ''}">
              <div class="admin-courses-grid">
                ${filteredCourses.map(c => {
                  const sub = subjects.find(s => s.id.toLowerCase() === (c.subjectId || '').toLowerCase());
                  const subColor = sub ? (sub.color || '#0f766e') : '#0f766e';
                  const subName = sub ? sub.name : (c.subjectId || 'GENERAL').toUpperCase();
                  return `
                    <div class="admin-course-card">
                      <div class="admin-course-card-top">
                        <span class="tag-pill" style="background:${subColor}18; color:${subColor}; font-weight:800; font-size:0.75rem; border:1px solid ${subColor}30; display:inline-block; margin-bottom:6px;">
                          ${subName}
                        </span>
                        <h3 class="admin-course-card-title">${c.title}</h3>
                      </div>

                      <div class="admin-course-card-meta">
                        <div class="admin-course-meta-chip">
                          ${renderIcon('user', 'small-icon')}
                          <span><strong>Instructor:</strong> ${c.instructor || 'AI Faculty'}</span>
                        </div>
                        <div class="admin-course-meta-chip">
                          ${renderIcon('clock', 'small-icon')}
                          <span><strong>Duration:</strong> ${c.duration || '8 Weeks'}</span>
                        </div>
                        ${c.prerequisites ? `
                          <div class="admin-course-meta-chip">
                            ${renderIcon('check-circle', 'small-icon')}
                            <span><strong>Prereq:</strong> ${c.prerequisites}</span>
                          </div>
                        ` : ''}
                      </div>

                      ${c.description ? `
                        <p class="admin-course-card-desc">${c.description}</p>
                      ` : ''}

                      <div class="admin-course-card-actions">
                        <button type="button" class="btn-table-action" style="flex:1; justify-content:center; padding:8px 12px; border-radius:var(--radius-sm); border:1px solid var(--border-color); background:var(--bg-surface); color:var(--text-main); font-size:0.82rem; font-weight:700; cursor:pointer; display:inline-flex; align-items:center; gap:6px;" onclick="AppState.setView('course-hub', {courseId: '${c.id}'})" title="Open Study Hub">
                          ${renderIcon('book-open', 'small-icon')} Study Hub
                        </button>
                        <button type="button" class="btn-table-action" style="padding:8px 12px; border-radius:var(--radius-sm); border:1px solid #fca5a5; background:#fee2e2; color:#ef4444; font-size:0.82rem; font-weight:700; cursor:pointer; display:inline-flex; align-items:center; gap:6px;" onclick="window.handleDeleteCourse('${c.id}')" title="Delete Course">
                          ${renderIcon('trash-2', 'small-icon')} Delete
                        </button>
                      </div>
                    </div>
                  `;
                }).join('')}
              </div>
            </div>

            <!-- Responsive Table View -->
            <div class="admin-course-table-container ${window.courseDirectoryViewMode === 'cards' ? 'hide-on-mobile' : ''}">
              <div class="table-responsive-wrapper">
                <table class="admin-table">
                  <thead>
                    <tr>
                      <th>Course Title & Overview</th>
                      <th>Subject</th>
                      <th>Duration</th>
                      <th>Instructor</th>
                      <th style="text-align:right;">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${filteredCourses.map(c => {
                      const sub = subjects.find(s => s.id.toLowerCase() === (c.subjectId || '').toLowerCase());
                      const subColor = sub ? (sub.color || '#0f766e') : '#0f766e';
                      const subName = sub ? sub.name : (c.subjectId || 'GENERAL').toUpperCase();
                      return `
                        <tr>
                          <td style="max-width:320px;">
                            <strong style="font-size:0.95rem; display:block; margin-bottom:3px; color:var(--text-main);">${c.title}</strong>
                            <p style="font-size:0.8rem; color:var(--text-muted); margin:0; line-height:1.4; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden;">
                              ${c.description || 'No description provided.'}
                            </p>
                          </td>
                          <td>
                            <span class="tag-pill" style="background:${subColor}18; color:${subColor}; font-weight:800; font-size:0.75rem; border:1px solid ${subColor}30;">
                              ${subName}
                            </span>
                          </td>
                          <td>
                            <span style="font-size:0.85rem; font-weight:600;">${c.duration}</span>
                          </td>
                          <td>
                            <div style="display:flex; align-items:center; gap:6px; font-size:0.85rem;">
                              ${renderIcon('user', 'small-icon')}
                              <span>${c.instructor || 'AI Faculty'}</span>
                            </div>
                          </td>
                          <td style="text-align:right;">
                            <div style="display:inline-flex; gap:6px;">
                              <button type="button" class="btn-table-action" style="padding:6px 12px; border-radius:var(--radius-xs); border:1px solid var(--border-color); background:var(--bg-surface); color:var(--text-main); font-size:0.82rem; font-weight:700; cursor:pointer; display:inline-flex; align-items:center; gap:5px;" onclick="AppState.setView('course-hub', {courseId: '${c.id}'})" title="View Course Hub">
                                ${renderIcon('book-open', 'small-icon')} Study Hub
                              </button>
                              <button type="button" class="btn-table-action" style="padding:6px 10px; border-radius:var(--radius-xs); border:1px solid #fca5a5; background:#fee2e2; color:#ef4444; font-size:0.82rem; font-weight:700; cursor:pointer; display:inline-flex; align-items:center; gap:5px;" onclick="window.handleDeleteCourse('${c.id}')" title="Delete Course">
                                ${renderIcon('trash-2', 'small-icon')}
                              </button>
                            </div>
                          </td>
                        </tr>
                      `;
                    }).join('')}
                  </tbody>
                </table>
              </div>
            </div>
          `}
        </div>
      `;
    } else if (window.activeAdminTab === 'videos') {
      activeTabContent = `
        <div class="widget-card" style="max-width:650px; width:100%; margin: 0 auto;">
          <h2 style="font-size:1.2rem; font-weight:800; margin-bottom:16px; display:flex; align-items:center; gap:8px;">
            ${renderIcon('video')} Add Video Lessons & Links
          </h2>
          <p style="font-size:0.85rem; color:var(--text-muted); margin-bottom:20px;">
            Add embedded video resources to any course, cataloged by difficulty tier (Beginner, Intermediate, or Advanced).
          </p>
          <form onsubmit="window.handleRegisterVideoSubmit(event)">
            <div style="display:flex; flex-direction:column; gap:14px;">
              <div>
                <label style="font-size:0.8rem; font-weight:700; display:block; margin-bottom:4px;">Select Course Target</label>
                <select name="courseId" style="width:100%; padding:10px; border-radius:var(--radius-md); border:1px solid var(--border-color); background:var(--bg-card); color:var(--text-main);">
                  ${courses.map(c => `<option value="${c.id}">${c.title}</option>`).join('')}
                </select>
              </div>
              <div>
                <label style="font-size:0.8rem; font-weight:700; display:block; margin-bottom:4px;">Difficulty Category Tier</label>
                <select name="tier" style="width:100%; padding:10px; border-radius:var(--radius-md); border:1px solid var(--border-color); background:var(--bg-card); color:var(--text-main);">
                  <option value="Beginner">Beginner (5 Questions Tier)</option>
                  <option value="Intermediate" selected>Intermediate (10 Questions Tier)</option>
                  <option value="Advanced">Advanced (15 Questions Tier)</option>
                </select>
              </div>
              <div>
                <label style="font-size:0.8rem; font-weight:700; display:block; margin-bottom:4px;">Video Lesson Title</label>
                <input type="text" name="title" required placeholder="e.g. Backpropagation Math Explained" style="width:100%; padding:10px; border-radius:var(--radius-md); border:1px solid var(--border-color); background:var(--bg-card); color:var(--text-main);">
              </div>
              <div>
                <label style="font-size:0.8rem; font-weight:700; display:block; margin-bottom:4px;">Video URL (YouTube Embed Link)</label>
                <input type="url" name="contentUrl" required placeholder="e.g. https://www.youtube.com/embed/aircAruvnKk" style="width:100%; padding:10px; border-radius:var(--radius-md); border:1px solid var(--border-color); background:var(--bg-card); color:var(--text-main);">
                <div style="font-size:0.75rem; color:var(--text-muted); margin-top:2px;">Must be an embeddable iframe URL format.</div>
              </div>
              <div>
                <label style="font-size:0.8rem; font-weight:700; display:block; margin-bottom:4px;">Duration</label>
                <input type="text" name="duration" placeholder="e.g. 25 mins" style="width:100%; padding:10px; border-radius:var(--radius-md); border:1px solid var(--border-color); background:var(--bg-card); color:var(--text-main);">
              </div>
              <div>
                <label style="font-size:0.8rem; font-weight:700; display:block; margin-bottom:4px;">Video Description / Core Objective</label>
                <textarea name="description" placeholder="A comprehensive overview of what this video lecture details..." style="width:100%; height:90px; padding:10px; border-radius:var(--radius-md); border:1px solid var(--border-color); background:var(--bg-card); color:var(--text-main); font-family:inherit; resize:vertical;"></textarea>
              </div>
              <button type="submit" class="btn-hero-primary" style="background:var(--primary-gradient); color:#fff; width:100%; padding:11px; justify-content:center;">
                Add Video Material
              </button>
            </div>
          </form>
        </div>
      `;
    } else if (window.activeAdminTab === 'assignments') {
      window.initAssignmentBuilderState(courses[0] ? courses[0].id : '');
      const b = window.assignmentBuilder;
      activeTabContent = `
        <div class="admin-two-col-grid assignments-grid">
          <!-- Dynamic MCQ Assignment Builder Form -->
          <div class="widget-card" id="mcqAssignmentBuilderCard">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px; flex-wrap:wrap; gap:8px;">
              <h2 style="font-size:1.25rem; font-weight:800; display:flex; align-items:center; gap:8px; margin:0;">
                ${renderIcon('file-text')} ${b.editingId ? 'Edit Course Assignment' : 'Create Course Assignment'}
              </h2>
              ${b.editingId ? `
                <div style="display:flex; align-items:center; gap:8px;">
                  <span class="tag-pill" style="background:rgba(245,158,11,0.15); color:var(--color-amber); font-weight:700;">
                    Editing Mode
                  </span>
                  <button type="button" onclick="window.resetAssignmentBuilder()" style="background:none; border:none; color:var(--color-rose); font-size:0.8rem; font-weight:700; cursor:pointer; text-decoration:underline;">
                    Cancel & New
                  </button>
                </div>
              ` : ''}
            </div>
            <p style="font-size:0.84rem; color:var(--text-muted); margin-bottom:16px;">
              Build dynamic multiple-choice assignments with custom questions, options A-D, and automatic evaluation.
            </p>

            <form id="mcqAssignmentBuilderForm" onsubmit="window.handleSaveAssignmentBuilder(event)">
              <div style="display:flex; flex-direction:column; gap:14px;">
                <div>
                  <label style="font-size:0.8rem; font-weight:700; display:block; margin-bottom:4px;">Target Course</label>
                  <select name="courseId" id="assignmentBuilderCourseSelect" style="width:100%; padding:10px; border-radius:var(--radius-md); border:1px solid var(--border-color); background:var(--bg-card); color:var(--text-main);" onchange="window.updateBuilderField('courseId', this.value)">
                    ${courses.map(c => `<option value="${c.id}" ${b.courseId === c.id ? 'selected' : ''}>${c.title}</option>`).join('')}
                  </select>
                </div>
                <div>
                  <label style="font-size:0.8rem; font-weight:700; display:block; margin-bottom:4px;">Assignment Title</label>
                  <input type="text" name="title" id="assignmentBuilderTitleInput" required placeholder="e.g. AI & Neural Networks Problem Set" value="${escapeHtmlAttr(b.title || '')}" oninput="window.updateBuilderField('title', this.value)" style="width:100%; padding:10px; border-radius:var(--radius-md); border:1px solid var(--border-color); background:var(--bg-card); color:var(--text-main);">
                </div>
                <div>
                  <label style="font-size:0.8rem; font-weight:700; display:block; margin-bottom:4px;">Max Grade Points</label>
                  <input type="number" name="points" min="1" id="assignmentBuilderPointsInput" value="${b.points || 100}" oninput="window.updateBuilderField('points', this.value)" style="width:100%; padding:10px; border-radius:var(--radius-md); border:1px solid var(--border-color); background:var(--bg-card); color:var(--text-main);">
                </div>
                <div>
                  <label style="font-size:0.8rem; font-weight:700; display:block; margin-bottom:4px;">Instructions & Criteria</label>
                  <textarea name="description" id="assignmentBuilderDescInput" required placeholder="Provide clear task instructions, required materials, and how to submit..." oninput="window.updateBuilderField('description', this.value)" style="width:100%; height:90px; padding:10px; border-radius:var(--radius-md); border:1px solid var(--border-color); background:var(--bg-card); color:var(--text-main); font-family:inherit; resize:vertical;">${escapeHtmlAttr(b.description || '')}</textarea>
                </div>

                <!-- Questions Section -->
                <div style="margin-top:10px; padding-top:14px; border-top:1px solid var(--border-color); display:flex; justify-content:space-between; align-items:center;">
                  <div>
                    <h3 style="font-size:1.05rem; font-weight:800; margin:0; display:flex; align-items:center; gap:8px;">
                      ${renderIcon('help-circle')} Questions Section
                    </h3>
                    <span style="font-size:0.78rem; color:var(--text-muted);">Dynamic questions with options A-D and instant correct answer highlight</span>
                  </div>
                  <span class="tag-pill" id="builderQuestionsCountBadge" style="background:rgba(37,99,235,0.1); color:#2563eb; font-weight:700;">
                    ${(b.questions || []).length} Questions
                  </span>
                </div>

                <!-- Questions List Container -->
                <div id="mcqQuestionsBuilderList" style="display:flex; flex-direction:column; gap:14px; margin-top:4px;">
                  ${window.renderAssignmentBuilderQuestionsHtml()}
                </div>

                <!-- Action Buttons -->
                <div style="display:flex; gap:12px; align-items:center; justify-content:space-between; margin-top:16px; flex-wrap:wrap; padding-top:14px; border-top:1px solid var(--border-color);">
                  <button type="button" class="btn-add-question-primary" onclick="window.addQuestionToBuilder()">
                    ➕ Add Question
                  </button>
                  
                  <div style="display:flex; gap:8px; align-items:center;">
                    ${b.editingId ? `
                      <button type="button" onclick="window.resetAssignmentBuilder()" style="padding:10px 16px; border:1px solid var(--border-color); background:var(--bg-card); color:var(--text-main); border-radius:var(--radius-sm); font-weight:600; cursor:pointer;">
                        Cancel Edit
                      </button>
                    ` : ''}
                    <button type="submit" class="btn-save-assignment-dark">
                      💾 ${b.editingId ? 'Update Assignment' : 'Save Assignment'}
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>

          <!-- Existing Assignments Table -->
          <div class="widget-card">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px; flex-wrap:wrap; gap:10px;">
              <div>
                <h2 style="font-size:1.2rem; font-weight:800; margin-bottom:4px;">Active Assignments</h2>
                <p style="font-size:0.8rem; color:var(--text-muted); margin:0;">Dynamic and published course assignments.</p>
              </div>
              <span class="tag-pill" style="background:rgba(15,118,110,0.1); color:var(--color-teal-action); font-weight:700;">
                ${assignments.length} Total
              </span>
            </div>
            <div class="table-responsive-wrapper">
              <table class="admin-table">
                <thead>
                  <tr>
                    <th>Course Target</th>
                    <th>Assignment Title</th>
                    <th>Questions</th>
                    <th>Max Grade</th>
                    <th style="text-align:right;">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  ${assignments.map(a => {
                    const c = courses.find(item => item.id === a.courseId) || { title: 'Unknown Course' };
                    const qCount = (a.questions && a.questions.length) ? a.questions.length : 0;
                    return `
                      <tr>
                        <td><span style="font-weight:600; font-size:0.85rem;">${c.title}</span></td>
                        <td><strong>${a.title}</strong></td>
                        <td>
                          ${qCount > 0 ? `
                            <span class="tag-pill" style="background:rgba(37,99,235,0.1); color:#2563eb; font-weight:700;">
                              ${qCount} MCQs
                            </span>
                          ` : `
                            <span class="tag-pill" style="background:var(--bg-surface); border:1px solid var(--border-color); color:var(--text-muted);">
                              Standard
                            </span>
                          `}
                        </td>
                        <td>${a.points} pts</td>
                        <td style="text-align:right;">
                          <div style="display:inline-flex; gap:6px;">
                            <button type="button" class="btn-table-action" style="padding:5px 10px; border-radius:4px; border:1px solid var(--border-color); background:var(--bg-surface); color:var(--text-main); font-size:0.8rem; font-weight:600; cursor:pointer;" onclick="window.editAssignmentInBuilder('${a.id}')" title="Edit in builder">
                              ${renderIcon('edit', 'small-icon')} Edit
                            </button>
                            <button type="button" class="btn-table-action" style="padding:5px 10px; border-radius:4px; border:1px solid #fca5a5; background:#fee2e2; color:#ef4444; font-size:0.8rem; font-weight:600; cursor:pointer;" onclick="window.deleteAssignmentConfirm('${a.id}')" title="Delete Assignment">
                              ${renderIcon('trash-2', 'small-icon')}
                            </button>
                          </div>
                        </td>
                      </tr>
                    `;
                  }).join('')}
                  ${assignments.length === 0 ? `
                    <tr>
                      <td colspan="5" style="text-align:center; color:var(--text-muted); padding:20px;">No assignments created yet.</td>
                    </tr>
                  ` : ''}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      `;
    } else if (window.activeAdminTab === 'submissions') {
      const allSubmissions = state.data.submissions || [];
      const enrolledStudents = students.filter(s => s.enrolledCourseIds && Array.isArray(s.enrolledCourseIds) && s.enrolledCourseIds.length > 0);

      activeTabContent = `
        <div style="display:flex; flex-direction:column; gap:28px;">
          <!-- Registered Students Directory -->
          <div class="widget-card">
            <h2 style="font-size:1.2rem; font-weight:800; margin-bottom:16px; display:flex; align-items:center; gap:8px;">
              ${renderIcon('users')} Registered Students Profile & Onboarding
            </h2>
            <p style="font-size:0.85rem; color:var(--text-muted); margin-bottom:16px;">
              This list details all students registered dynamically via the onboarding questionnaire.
            </p>
            <div class="table-responsive-wrapper">
              <table class="admin-table">
                <thead>
                  <tr>
                    <th>Student Name</th>
                    <th>Email</th>
                    <th>Grade / Class</th>
                    <th>Preferred Style</th>
                    <th>Goal Career</th>
                    <th>Streak / Progress</th>
                  </tr>
                </thead>
                <tbody>
                  ${state.isLoadingStudents ? `
                    <tr>
                      <td colspan="6" style="text-align:center; padding:32px; color:var(--text-muted);">
                        <div style="display:inline-flex; align-items:center; gap:10px; font-size:0.95rem; font-weight:600;">
                          <span class="loading-spinner" style="display:inline-block; width:18px; height:18px; border:2px solid var(--border-color); border-top-color:var(--color-purple); border-radius:50%; animation:spin 0.8s linear infinite;"></span>
                          Loading registered students...
                        </div>
                      </td>
                    </tr>
                  ` : (state.studentLoadError ? `
                    <tr>
                      <td colspan="6" style="text-align:center; padding:28px; color:var(--color-rose); font-weight:600; font-size:0.95rem;">
                        Unable to load student data. Please try again.
                      </td>
                    </tr>
                  ` : (enrolledStudents.length === 0 ? `
                    <tr>
                      <td colspan="6" style="text-align:center; color:var(--text-muted); padding:32px; font-size:0.95rem;">
                        No students enrolled yet.
                      </td>
                    </tr>
                  ` : enrolledStudents.map(s => {
                    const studentEnrolledCourses = courses.filter(c => (s.enrolledCourseIds || []).includes(c.id));
                    let totalLessons = 0;
                    studentEnrolledCourses.forEach(c => {
                      if (c.modules && Array.isArray(c.modules)) {
                        c.modules.forEach(m => {
                          totalLessons += (m.lessons ? m.lessons.length : (m.resources ? m.resources.length : 1));
                        });
                      } else if (c.resourceIds && Array.isArray(c.resourceIds)) {
                        totalLessons += c.resourceIds.length;
                      }
                    });
                    if (totalLessons === 0) {
                      totalLessons = Math.max(1, (s.enrolledCourseIds || []).length * 5);
                    }
                    const completedCount = (s.completedResourceIds && Array.isArray(s.completedResourceIds)) ? s.completedResourceIds.length : 0;
                    const progressPct = totalLessons > 0 ? Math.min(100, Math.round((completedCount / totalLessons) * 100)) : 0;
                    const streakDays = (s.streakDays !== undefined && s.streakDays !== null) ? s.streakDays : 1;
                    const studentName = s.name || s.displayName || 'Student';
                    const studentEmail = s.email || 'N/A';
                    const studentGrade = s.gradeClass || s.grade || 'N/A';
                    const preferredStyle = (s.preferredStyle || 'visual').toUpperCase();
                    const careerGoal = s.careerGoal || s.goalCareer || 'N/A';
                    const avatarUrl = s.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150';

                    return `
                      <tr>
                        <td>
                          <div style="display:flex; align-items:center; gap:8px;">
                            <img src="${avatarUrl}" alt="${studentName}" style="width:28px; height:28px; border-radius:50%; border:1px solid var(--border-color); object-fit:cover;">
                            <strong>${studentName}</strong>
                          </div>
                        </td>
                        <td>${studentEmail}</td>
                        <td><span class="tag-pill" style="background:var(--bg-surface); border:1px solid var(--border-color);">${studentGrade}</span></td>
                        <td><span class="tag-pill" style="background:rgba(99, 102, 241, 0.1); color:var(--color-indigo);">${preferredStyle}</span></td>
                        <td>${careerGoal}</td>
                        <td>
                          <span style="font-weight:700; color:var(--color-purple);">${streakDays} 🔥</span> • 
                          <span style="font-size:0.8rem; color:var(--text-muted);">${completedCount} lesson${completedCount === 1 ? '' : 's'} done (${progressPct}%)</span>
                        </td>
                      </tr>
                    `;
                  }).join('')))}
                </tbody>
              </table>
            </div>
          </div>

          <!-- Assignment Submissions Table -->
          <div class="widget-card">
            <h2 style="font-size:1.2rem; font-weight:800; margin-bottom:16px; display:flex; align-items:center; gap:8px;">
              ${renderIcon('file-text')} Student Assignment Submissions
            </h2>
            <p style="font-size:0.85rem; color:var(--text-muted); margin-bottom:16px;">
              All dynamic homework and project links submitted by students, synced via Firebase.
            </p>
            <div class="table-responsive-wrapper">
              <table class="admin-table">
                <thead>
                  <tr>
                    <th>Student Name</th>
                    <th>Course Target</th>
                    <th>Assignment Name</th>
                    <th>Evaluation / Score</th>
                    <th>Submission / Details</th>
                    <th>Submitted At</th>
                  </tr>
                </thead>
                <tbody>
                  ${allSubmissions.map(sub => {
                    const c = courses.find(item => item.id === sub.courseId) || { title: 'Unknown Course' };
                    const a = assignments.find(item => item.id === sub.assignmentId) || { title: 'Unknown Assignment' };
                    const isMCQ = sub.status === 'graded' || sub.score !== undefined;
                    return `
                      <tr>
                        <td><strong>${sub.userName || 'Student'}</strong></td>
                        <td><span style="font-size:0.85rem; font-weight:600;">${c.title}</span></td>
                        <td><strong>${a.title}</strong></td>
                        <td>
                          ${isMCQ ? `
                            <div style="display:flex; flex-direction:column; gap:3px;">
                              <div style="font-size:0.92rem; font-weight:800; color:var(--text-main);">
                                ${sub.score} / ${a.points || 100} pts (${sub.percentage}%)
                              </div>
                              <div style="display:flex; align-items:center; gap:6px;">
                                <span class="tag-pill" style="background:${sub.passed ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)'}; color:${sub.passed ? 'var(--color-emerald)' : 'var(--color-rose)'}; font-weight:800; font-size:0.75rem;">
                                  ${sub.passed ? 'PASSED' : 'NEEDS PRACTICE'}
                                </span>
                                <span style="font-size:0.75rem; color:var(--text-muted);">
                                  ✔ ${sub.correctCount || 0} • ✖ ${sub.wrongCount || 0}
                                </span>
                              </div>
                            </div>
                          ` : `
                            <span class="tag-pill" style="background:var(--bg-surface); border:1px solid var(--border-color); color:var(--text-muted);">
                              Standard Review
                            </span>
                          `}
                        </td>
                        <td>
                          ${isMCQ ? `
                            <button type="button" class="btn-table-action" style="padding:6px 12px; border-radius:var(--radius-xs); border:1px solid var(--border-color); background:var(--bg-surface); color:var(--text-main); font-size:0.82rem; font-weight:700; cursor:pointer; display:inline-flex; align-items:center; gap:6px;" onclick="window.viewMCQSubmissionBreakdown('${sub.assignmentId}', '${sub.userId}')">
                              ${renderIcon('file-text', 'small-icon')} View Answers
                            </button>
                          ` : `
                            <div>
                              <div style="max-width:280px; max-height:60px; overflow-y:auto; font-size:0.82rem; line-height:1.4; white-space:pre-wrap; background:var(--bg-card); padding:5px 8px; border-radius:4px; border:1px solid var(--border-color); margin-bottom:4px;">${sub.submissionText || '-'}</div>
                              ${sub.submissionLink ? `<a href="${sub.submissionLink}" target="_blank" style="color:var(--color-purple); text-decoration:underline; font-size:0.82rem; display:inline-flex; align-items:center; gap:4px;">${renderIcon('external-link', 'small-icon')} Project Link</a>` : ''}
                            </div>
                          `}
                        </td>
                        <td>
                          <span style="font-size:0.8rem; color:var(--text-muted);">${new Date(sub.submittedAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</span>
                        </td>
                      </tr>
                    `;
                  }).join('')}
                  ${allSubmissions.length === 0 ? `
                    <tr>
                      <td colspan="6" style="text-align:center; color:var(--text-muted); padding:20px;">No assignment submissions found.</td>
                    </tr>
                  ` : ''}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      `;
    } else if (window.activeAdminTab === 'resources') {
      // original resources tab
      activeTabContent = `
        <div class="widget-card">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
            <h2 style="font-size:1.2rem; font-weight:800;">Resource Catalog Management</h2>
            <button class="btn-hero-primary" style="background:var(--primary-gradient); color:#fff; padding:6px 16px; font-size:0.85rem;" onclick="AppState.openModal('add-resource')">
              ${renderIcon('plus')} Add New Resource
            </button>
          </div>

          <div class="table-responsive-wrapper">
            <table class="admin-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Subject</th>
                  <th>Format</th>
                  <th>Level</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                ${resources.map(res => `
                  <tr>
                    <td><strong>${res.title}</strong></td>
                    <td>${(res.subjectId || '').toUpperCase()}</td>
                    <td><span class="tag-pill">${res.format}</span></td>
                    <td>${res.level}</td>
                    <td>
                      <button style="color:var(--color-rose);" onclick="AppState.deleteResource('${res.id}')">
                        ${renderIcon('trash-2')}
                      </button>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `;
    } else if (window.activeAdminTab === 'subjects') {
      activeTabContent = `
        <div class="admin-two-col-grid">
          <!-- Create Subject Form -->
          <div class="widget-card">
            <h2 style="font-size:1.2rem; font-weight:800; margin-bottom:16px; display:flex; align-items:center; gap:8px;">
              ${renderIcon('plus-circle')} Add New Subject
            </h2>
            <form onsubmit="window.handleCreateSubjectSubmit(event)">
              <div style="display:flex; flex-direction:column; gap:12px;">
                <div>
                  <label style="font-size:0.8rem; font-weight:700; display:block; margin-bottom:4px;">Subject ID / Code</label>
                  <input type="text" name="subId" required placeholder="e.g. history, chemistry, art" style="width:100%; padding:10px; border-radius:var(--radius-md); border:1px solid var(--border-color); background:var(--bg-card); color:var(--text-main);">
                  <span style="font-size:0.75rem; color:var(--text-subtle);">Unique short code in lowercase. Avoid spaces.</span>
                </div>
                <div>
                  <label style="font-size:0.8rem; font-weight:700; display:block; margin-bottom:4px;">Subject Name</label>
                  <input type="text" name="name" required placeholder="e.g. History & World Culture" style="width:100%; padding:10px; border-radius:var(--radius-md); border:1px solid var(--border-color); background:var(--bg-card); color:var(--text-main);">
                </div>
                <div class="admin-form-grid-2">
                  <div>
                    <label style="font-size:0.8rem; font-weight:700; display:block; margin-bottom:4px;">Lucide Icon Name</label>
                    <select name="icon" style="width:100%; padding:10px; border-radius:var(--radius-md); border:1px solid var(--border-color); background:var(--bg-card); color:var(--text-main);">
                      <option value="book" selected>Book</option>
                      <option value="cpu">CPU (Tech/AI)</option>
                      <option value="code">Code (Programming)</option>
                      <option value="calculator">Calculator (Math)</option>
                      <option value="zap">Zap (Physics)</option>
                      <option value="dna">DNA (Biology)</option>
                      <option value="flask-conical">Flask (Chemistry)</option>
                      <option value="globe">Globe (Geography/History)</option>
                      <option value="brain">Brain (Psychology)</option>
                      <option value="award">Award</option>
                    </select>
                  </div>
                  <div>
                    <label style="font-size:0.8rem; font-weight:700; display:block; margin-bottom:4px;">Theme Color Accent</label>
                    <div style="display:flex; gap:8px; align-items:center;">
                      <input type="color" name="color" value="#8b5cf6" style="padding:0; width:40px; height:40px; border:none; border-radius:4px; cursor:pointer; background:none;">
                      <span style="font-size:0.75rem; color:var(--text-subtle);">Color Accent</span>
                    </div>
                  </div>
                </div>
                <div>
                  <label style="font-size:0.8rem; font-weight:700; display:block; margin-bottom:4px;">Description</label>
                  <textarea name="description" required placeholder="Brief description of the subject..." style="width:100%; height:90px; padding:10px; border-radius:var(--radius-md); border:1px solid var(--border-color); background:var(--bg-card); color:var(--text-main); font-family:inherit; resize:vertical;"></textarea>
                </div>
                <button type="submit" class="btn-hero-primary" style="background:var(--primary-gradient); color:#fff; width:100%; padding:11px; justify-content:center;">
                  Create Subject
                </button>
              </div>
            </form>
          </div>
          <!-- Existing Subjects List -->
          <div class="widget-card">
            <h2 style="font-size:1.2rem; font-weight:800; margin-bottom:16px;">Registered Subjects</h2>
            <div class="table-responsive-wrapper">
              <table class="admin-table">
                <thead>
                  <tr>
                    <th>Icon & Name</th>
                    <th>ID Code</th>
                    <th>Color Accent</th>
                    <th>Description</th>
                  </tr>
                </thead>
                <tbody>
                  ${subjects.map(s => `
                    <tr>
                      <td>
                        <div style="display:flex; align-items:center; gap:8px;">
                          <span style="color:${s.color || 'var(--primary-500)'}; display:flex; align-items:center; justify-content:center;">
                            ${renderIcon(s.icon || 'book')}
                          </span>
                          <strong>${s.name}</strong>
                        </div>
                      </td>
                      <td><span class="tag-pill" style="background:var(--bg-page); border:1px solid var(--border-color);">${s.id}</span></td>
                      <td>
                        <div style="display:flex; align-items:center; gap:6px;">
                          <span style="display:inline-block; width:12px; height:12px; border-radius:50%; background:${s.color || '#ccc'};"></span>
                          <span style="font-family:monospace; font-size:0.8rem;">${s.color || '#ccc'}</span>
                        </div>
                      </td>
                      <td style="font-size:0.85rem; color:var(--text-muted); line-height:1.4;">${s.description || ''}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      `;
    } else {
      activeTabContent = '';
    }

    return `
      <div class="page-header">
        <h1 class="page-title">${renderIcon('settings')} Admin Control Panel</h1>
        <p class="page-subtitle">Manage courses, videos, assignments, and resource libraries dynamically with Firebase Firestore.</p>
      </div>

      <div class="stats-grid" style="margin-bottom:28px;">
        <div class="stat-card blue clickable-stat-card" onclick="window.activeAdminTab='submissions'; AppState.notify();" title="View Registered Students" style="cursor:pointer;">
          <div class="stat-value" data-count="${totalRegisteredStudents}">${totalRegisteredStudents.toLocaleString()}</div>
          <div class="stat-label">Total Registered Students</div>
        </div>
        <div class="stat-card emerald clickable-stat-card" onclick="window.activeAdminTab='submissions'; AppState.notify();" title="View Active Students" style="cursor:pointer;">
          <div class="stat-value" data-count="${totalActiveStudents}">${totalActiveStudents.toLocaleString()}</div>
          <div class="stat-label">Total Active Students</div>
        </div>
        <div class="stat-card amber clickable-stat-card" onclick="window.activeAdminTab='submissions'; AppState.notify();" title="View New Students" style="cursor:pointer;">
          <div class="stat-value" data-count="${totalNewStudents}">${totalNewStudents.toLocaleString()}</div>
          <div class="stat-label">Total New Students</div>
        </div>
        <div class="stat-card purple clickable-stat-card" onclick="window.activeAdminTab='course-directory'; AppState.notify();" title="View Course Directory" style="cursor:pointer;">
          <div class="stat-value" data-count="${courses.length}">${courses.length.toLocaleString()}</div>
          <div class="stat-label">Published Courses</div>
        </div>
      </div>

      <!-- Tab Buttons -->
      <div class="subject-tabs admin-tab-bar" style="margin-bottom:24px; border-bottom:1px solid var(--border-color); padding-bottom:12px; display:flex; gap:10px; flex-wrap:wrap;">
        <button class="tab-btn ${window.activeAdminTab === 'courses' ? 'active' : ''}" onclick="window.activeAdminTab='courses'; AppState.notify();">
          ${renderIcon('plus-circle')} Create Course
        </button>
        <button class="tab-btn ${window.activeAdminTab === 'course-directory' ? 'active' : ''}" onclick="window.activeAdminTab='course-directory'; AppState.notify();">
          ${renderIcon('graduation-cap')} Course Directory <span class="tab-count-badge">${courses.length}</span>
        </button>
        <button class="tab-btn ${window.activeAdminTab === 'videos' ? 'active' : ''}" onclick="window.activeAdminTab='videos'; AppState.notify();">
          ${renderIcon('video')} Add Video Lessons
        </button>
        <button class="tab-btn ${window.activeAdminTab === 'assignments' ? 'active' : ''}" onclick="window.activeAdminTab='assignments'; AppState.notify();">
          ${renderIcon('file-text')} Course Assignments
        </button>
        <button class="tab-btn ${window.activeAdminTab === 'submissions' ? 'active' : ''}" onclick="window.activeAdminTab='submissions'; AppState.notify();">
          ${renderIcon('users')} Student Activity & Submissions
        </button>
        <button class="tab-btn ${window.activeAdminTab === 'resources' ? 'active' : ''}" onclick="window.activeAdminTab='resources'; AppState.notify();">
          ${renderIcon('book-open')} Global Resources
        </button>
        <button class="tab-btn ${window.activeAdminTab === 'subjects' ? 'active' : ''}" onclick="window.activeAdminTab='subjects'; AppState.notify();">
          ${renderIcon('book')} Manage Subjects
        </button>
      </div>

      <div>
        ${activeTabContent}
      </div>
    `;
  }

  // --------------------------------------------------------------------------
  // MODALS ROUTER & RENDERERS
  // --------------------------------------------------------------------------
  function renderActiveModal() {
    const state = window.AppState;
    if (!state.activeModal) return '';

    let content = '';
    if (state.activeModal === 'login') {
      content = renderLoginModalContent();
    } else if (state.activeModal === 'register') {
      content = renderRegisterModalContent();
    } else if (state.activeModal === 'questionnaire') {
      content = renderQuestionnaireModalContent();
    } else if (state.activeModal === 'quiz') {
      content = renderQuizModalContent(state.modalData);
    } else if (state.activeModal === 'quiz-result-interest') {
      content = renderQuizResultInterestModalContent(state.modalData);
    } else if (state.activeModal === 'resource-viewer') {
      content = renderResourceViewerModalContent(state.modalData);
    } else if (state.activeModal === 'certificate') {
      content = renderCertificateModalContent();
    } else if (state.activeModal === 'add-resource') {
      content = renderAddResourceModalContent();
    } else if (state.activeModal === 'submit-assignment') {
      content = renderSubmitAssignmentModalContent(state.modalData);
    } else if (state.activeModal === 'mcq-admin-breakdown') {
      content = renderMCQAdminBreakdownModalContent();
    } else if (state.activeModal === 'help') {
      content = renderHelpCenterModalContent();
    }

    return `
      <div class="modal-overlay">
        <div class="modal-content">
          <button class="btn-close-modal" onclick="AppState.closeModal()">
            ${renderIcon('x')}
          </button>
          ${content}
        </div>
      </div>
    `;
  }

  // Help Center Modal
  function renderHelpCenterModalContent() {
    return `
      <div>
        <div style="text-align:center; margin-bottom:20px;">
          <div style="width:48px; height:48px; border-radius:50%; background:rgba(15, 118, 110, 0.1); color:#0f766e; display:inline-flex; align-items:center; justify-content:center; margin-bottom:10px;">
            ${renderIcon('help-circle')}
          </div>
          <h2 style="font-size:1.5rem; font-weight:800; margin-bottom:6px; color:var(--text-main);">Help Center & FAQ</h2>
          <p style="color:var(--text-muted); font-size:0.88rem;">Everything you need to know about navigating and learning on LearnAI Pro.</p>
        </div>

        <div style="display:flex; flex-direction:column; gap:12px; margin-bottom:24px;">
          <div style="padding:14px; background:var(--bg-card); border:1px solid var(--border-color); border-radius:var(--radius-md);">
            <div style="font-weight:700; font-size:0.92rem; margin-bottom:4px; display:flex; align-items:center; gap:6px; color:var(--text-main);">
              ${renderIcon('sparkles')} How do AI recommendations work?
            </div>
            <div style="font-size:0.82rem; color:var(--text-muted); line-height:1.5;">
              Recommendations adapt dynamically to your student profile questionnaire, selected interests, skill level, and preferred learning modality.
            </div>
          </div>

          <div style="padding:14px; background:var(--bg-card); border:1px solid var(--border-color); border-radius:var(--radius-md);">
            <div style="font-weight:700; font-size:0.92rem; margin-bottom:4px; display:flex; align-items:center; gap:6px; color:var(--text-main);">
              ${renderIcon('git-branch')} How do I track roadmaps & assessments?
            </div>
            <div style="font-size:0.82rem; color:var(--text-muted); line-height:1.5;">
              Use the Roadmaps drawer to follow weekly subject milestones, and complete Assessments to earn verified mastery certificates and badges.
            </div>
          </div>

          <div style="padding:14px; background:var(--bg-card); border:1px solid var(--border-color); border-radius:var(--radius-md);">
            <div style="font-weight:700; font-size:0.92rem; margin-bottom:4px; display:flex; align-items:center; gap:6px; color:var(--text-main);">
              ${renderIcon('bot')} How can I ask the AI Tutor?
            </div>
            <div style="font-size:0.82rem; color:var(--text-muted); line-height:1.5;">
              Tap "Ask AI Tutor" in the navigation drawer or tap the floating robot icon at the bottom right. Voice speech-to-text and instant academic explanations are supported!
            </div>
          </div>
        </div>

        <div style="display:flex; gap:10px; justify-content:flex-end;">
          <button class="btn-hero-secondary" style="padding:10px 18px; font-size:0.85rem;" onclick="AppState.closeModal()">
            Close
          </button>
          <button class="btn-hero-primary" style="background:var(--primary-gradient); color:#fff; padding:10px 18px; font-size:0.85rem; display:flex; align-items:center; gap:6px;" onclick="AppState.closeModal(); if(window.AIChatbot) window.AIChatbot.toggle();">
            ${renderIcon('bot')} Launch AI Tutor
          </button>
        </div>
      </div>
    `;
  }

  // Login Modal
  function renderLoginModalContent() {
    return `
      <div>
        <h2 style="font-size:1.6rem; font-weight:800; margin-bottom:8px; text-align:center;">Welcome Back</h2>
        <p style="color:var(--text-muted); text-align:center; margin-bottom:24px;">Log in to access your personalized learning recommendations.</p>

        <form onsubmit="event.preventDefault(); AppState.loginUser(this.email.value, document.getElementById('loginPassword').value);" autocomplete="on">
          <div style="display:flex; flex-direction:column; gap:16px;">
            <div>
              <label style="font-size:0.85rem; font-weight:700; margin-bottom:4px; display:block;">Email Address</label>
              <input type="email" name="email" placeholder="Email Address" required autocomplete="email" style="width:100%; padding:12px; border-radius:var(--radius-md); border:1px solid var(--border-color); background:var(--bg-card); color:var(--text-main);">
            </div>
            <div>
              <label style="font-size:0.85rem; font-weight:700; margin-bottom:4px; display:block;">Password</label>
              <div style="position:relative; width:100%;">
                <input type="password" id="loginPassword" placeholder="Password" required autocomplete="current-password" style="width:100%; padding:12px 42px 12px 12px; border-radius:var(--radius-md); border:1px solid var(--border-color); background:var(--bg-card); color:var(--text-main);">
                <button type="button" onclick="window.toggleLoginPasswordVisibility()" style="position:absolute; right:12px; top:50%; transform:translateY(-50%); color:var(--text-muted); padding:4px; display:flex; align-items:center; justify-content:center;" id="loginPasswordToggleBtn">
                  ${renderIcon('eye')}
                </button>
              </div>
            </div>
            <button type="submit" class="btn-hero-primary" style="background:var(--primary-gradient); color:#fff; justify-content:center; padding:12px;">
              Log In to Student Dashboard
            </button>
          </div>
        </form>

        <div style="margin-top:20px; border-top:1px solid var(--border-color); padding-top:16px; text-align:center;">
          <p style="font-size:0.85rem; color:var(--text-muted); margin-bottom:10px;">Quick Demo Access:</p>
          <div style="display:flex; gap:10px; justify-content:center; flex-wrap:wrap;">
            <button class="btn-hero-secondary" style="font-size:0.8rem; padding:8px 16px; color:var(--text-main); border:1px solid var(--border-color); max-width:100%; word-break:break-word; text-align:center;" onclick="AppState.loginUser('admin@gmail.com', 'Pass@123')">
              Demo Admin (admin@gmail.com)
            </button>
          </div>
        </div>
      </div>
    `;
  }

  window.toggleLoginPasswordVisibility = function() {
    const input = document.getElementById('loginPassword');
    const btn = document.getElementById('loginPasswordToggleBtn');
    if (!input || !btn) return;
    if (input.type === 'password') {
      input.type = 'text';
      btn.innerHTML = renderIcon('eye-off');
    } else {
      input.type = 'password';
      btn.innerHTML = renderIcon('eye');
    }
    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons();
    }
  };

  window.handleRegisterSubmit = function(form) {
    const nameInput = form.querySelector('input[name="regName"]');
    const emailInput = form.querySelector('input[name="regEmail"]') || form.querySelector('input[type="email"]');
    const passInput = form.querySelector('input[name="regPassword"]') || form.querySelector('input[type="password"]');
    const regName = nameInput ? nameInput.value.trim() : '';
    const regEmail = emailInput ? emailInput.value.trim() : '';
    const regPassword = passInput ? passInput.value : '';
    window.AppState.openModal('questionnaire', { name: regName, email: regEmail, password: regPassword, isNewRegistration: true });
  };

  // Register Modal
  function renderRegisterModalContent() {
    return `
      <div>
        <h2 style="font-size:1.6rem; font-weight:800; margin-bottom:8px; text-align:center;">Create Student Account</h2>
        <p style="color:var(--text-muted); text-align:center; margin-bottom:24px;">Register to unlock AI-powered course recommendations.</p>

        <form onsubmit="event.preventDefault(); window.handleRegisterSubmit(this);" autocomplete="off">
          <!-- Hidden inputs to absorb browser autofill behavior -->
          <input type="text" name="prevent_autofill_username" style="display:none" autocomplete="off" />
          <input type="password" name="prevent_autofill_password" style="display:none" autocomplete="off" />

          <div style="display:flex; flex-direction:column; gap:14px;">
            <input type="text" name="regName" placeholder="Full Name" required autocomplete="new-name" style="width:100%; padding:12px; border-radius:var(--radius-md); border:1px solid var(--border-color); background:var(--bg-card); color:var(--text-main);">
            <input type="email" name="regEmail" placeholder="Email Address" required autocomplete="new-email" style="width:100%; padding:12px; border-radius:var(--radius-md); border:1px solid var(--border-color); background:var(--bg-card); color:var(--text-main);">
            <div style="position:relative; width:100%;">
              <input type="password" id="regPassword" name="regPassword" placeholder="Password" required autocomplete="new-password" style="width:100%; padding:12px 42px 12px 12px; border-radius:var(--radius-md); border:1px solid var(--border-color); background:var(--bg-card); color:var(--text-main);">
              <button type="button" onclick="window.toggleRegisterPasswordVisibility()" style="position:absolute; right:12px; top:50%; transform:translateY(-50%); color:var(--text-muted); padding:4px; display:flex; align-items:center; justify-content:center;" id="passwordToggleBtn">
                ${renderIcon('eye')}
              </button>
            </div>
            <button type="submit" class="btn-hero-primary" style="background:var(--primary-gradient); color:#fff; justify-content:center; padding:12px;">
              Continue to Student Questionnaire ${renderIcon('arrow-right')}
            </button>
          </div>
        </form>
      </div>
    `;
  }

  window.toggleRegisterPasswordVisibility = function() {
    const input = document.getElementById('regPassword');
    const btn = document.getElementById('passwordToggleBtn');
    if (!input || !btn) return;
    if (input.type === 'password') {
      input.type = 'text';
      btn.innerHTML = renderIcon('eye-off');
    } else {
      input.type = 'password';
      btn.innerHTML = renderIcon('eye');
    }
    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons();
    }
  };

  // Student Questionnaire Modal
  function renderQuestionnaireModalContent() {
    const state = window.AppState;
    const data = state.data || window.INITIAL_DATA || {};

    // Check if name is passed via modalData, or if we have currentUser
    let defaultName = '';
    if (state.modalData && state.modalData.name) {
      defaultName = state.modalData.name;
    } else if (state.currentUser && state.currentUser.name) {
      defaultName = state.currentUser.name;
    }

    const isNewReg = state.modalData && state.modalData.isNewRegistration;
    const welcomeHtml = isNewReg ? `
      <div class="welcome-banner" style="background:rgba(190,24,93,0.08); border:1px solid rgba(190,24,93,0.25); padding:16px; border-radius:var(--radius-md); text-align:center; margin-bottom:20px; font-weight:700; color:var(--color-indigo); line-height:1.5; font-size:0.95rem;">
        Welcome${defaultName ? `, ${defaultName}` : ''}! Please complete your assessment to receive personalized AI learning recommendations.
      </div>
    ` : '';

    return `
      <div>
        ${welcomeHtml}
        <div style="text-align:center; margin-bottom:20px;">
          <div style="display:inline-flex; align-items:center; gap:6px; background:var(--color-teal-light); color:var(--color-teal-action); padding:4px 12px; border-radius:var(--radius-full); font-size:0.8rem; font-weight:700; margin-bottom:8px;">
            ${renderIcon('cpu')} AI PROFILING QUESTIONNAIRE
          </div>
          <h2 style="font-size:1.6rem; font-weight:800;">Student Assessment Questionnaire</h2>
          <p style="color:var(--text-muted); font-size:0.9rem;">Fill out your learning preferences so our AI can generate personalized recommendations.</p>
        </div>

        <div id="questionnaire-error-banner" style="display:none; background:rgba(244,63,94,0.08); border:1px solid rgba(244,63,94,0.2); padding:12px; border-radius:var(--radius-md); color:var(--color-rose); font-weight:600; text-align:center; margin-bottom:16px; font-size:0.9rem;">
          Please fill all required fields before generating AI recommendations.
        </div>

        <form onsubmit="event.preventDefault(); window.submitQuestionnaireForm(this);">
          <div style="display:flex; flex-direction:column; gap:16px;">
            <!-- 1. Name & Class -->
            <div class="responsive-form-grid-2">
              <div>
                <label style="font-size:0.82rem; font-weight:700; display:block; margin-bottom:4px;">Student Name</label>
                <input type="text" name="name" id="nameInput" value="${defaultName}" placeholder="Your Full Name" required style="width:100%; padding:10px; border-radius:var(--radius-md); border:1px solid var(--border-color); background:var(--bg-card); color:var(--text-main); transition: border-color 0.2s;">
                <div id="nameError" style="color:var(--color-rose); font-size:0.78rem; font-weight:600; margin-top:4px; display:none;">Please enter your name.</div>
              </div>
              <div>
                <label style="font-size:0.82rem; font-weight:700; display:block; margin-bottom:4px;">Class / Grade Level</label>
                <select name="gradeClass" id="gradeClassSelect" style="width:100%; padding:10px; border-radius:var(--radius-md); border:1px solid var(--border-color); background:var(--bg-card); color:var(--text-main); transition: border-color 0.2s;">
                  <option value="" disabled selected>Select Grade</option>
                  ${(data.classesList || []).map(c => `<option value="${c}">${c}</option>`).join('')}
                </select>
                <div id="gradeClassError" style="color:var(--color-rose); font-size:0.78rem; font-weight:600; margin-top:4px; display:none;">Please select your grade.</div>
              </div>
            </div>

            <!-- 2. Skill Level & Learning Style -->
            <div class="responsive-form-grid-2">
              <div>
                <label style="font-size:0.82rem; font-weight:700; display:block; margin-bottom:4px;">Current Skill Level</label>
                <select name="skillLevel" id="skillLevelSelect" style="width:100%; padding:10px; border-radius:var(--radius-md); border:1px solid var(--border-color); background:var(--bg-card); color:var(--text-main); transition: border-color 0.2s;">
                  <option value="" disabled selected>Select Skill Level</option>
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
                <div id="skillLevelError" style="color:var(--color-rose); font-size:0.78rem; font-weight:600; margin-top:4px; display:none;">Please select your current skill level.</div>
              </div>
              <div>
                <label style="font-size:0.82rem; font-weight:700; display:block; margin-bottom:4px;">Preferred Learning Style (VARK)</label>
                <select name="preferredStyle" style="width:100%; padding:10px; border-radius:var(--radius-md); border:1px solid var(--border-color); background:var(--bg-card); color:var(--text-main);">
                  <option value="visual" selected>Visual (Diagrams & Videos)</option>
                  <option value="auditory">Auditory (Lectures & Audio)</option>
                  <option value="reading">Reading / Writing (Articles & Notes)</option>
                  <option value="kinesthetic">Kinesthetic (Hands-on Practice Labs)</option>
                </select>
              </div>
            </div>

            <!-- 3. Target Career Goal -->
            <div>
              <label style="font-size:0.82rem; font-weight:700; display:block; margin-bottom:4px;">Target Career Goal</label>
              <select name="careerGoal" style="width:100%; padding:10px; border-radius:var(--radius-md); border:1px solid var(--border-color); background:var(--bg-card); color:var(--text-main);">
                ${(data.careerGoals || []).map(cg => `<option value="${cg}">${cg}</option>`).join('')}
              </select>
            </div>

            <!-- 4. Subjects of Interest -->
            <div>
              <label style="font-size:0.82rem; font-weight:700; display:block; margin-bottom:6px;">Subjects of Interest (Select All That Apply)</label>
              <div class="responsive-form-grid-2" style="gap:8px;">
                ${(data.subjects || []).map(s => `
                  <label style="display:flex; align-items:center; gap:8px; font-size:0.85rem; padding:8px; border-radius:var(--radius-sm); border:1px solid var(--border-color); background:var(--bg-card); cursor:pointer;">
                    <input type="checkbox" name="interests" value="${s.id}" checked>
                    <span>${s.name}</span>
                  </label>
                `).join('')}
              </div>
              <div id="interestsError" style="color:var(--color-rose); font-size:0.78rem; font-weight:600; margin-top:4px; display:none;">Please select at least one subject of interest.</div>
            </div>

            <button type="submit" class="btn-hero-primary" style="background:var(--primary-gradient); color:#fff; justify-content:center; padding:12px; margin-top:8px; min-height:48px; width:100%;">
              ${renderIcon('sparkles')} Generate AI Recommendations
            </button>
          </div>
        </form>
      </div>
    `;
  }

  window.submitQuestionnaireForm = function(form) {
    const errorBanner = document.getElementById('questionnaire-error-banner');
    if (errorBanner) {
      errorBanner.style.display = 'none';
    }

    const fields = [
      { id: 'nameInput', errId: 'nameError', msg: 'Please enter your name.' },
      { id: 'gradeClassSelect', errId: 'gradeClassError', msg: 'Please select your grade.' },
      { id: 'skillLevelSelect', errId: 'skillLevelError', msg: 'Please select your current skill level.' }
    ];

    let hasErrors = false;

    fields.forEach(f => {
      const el = document.getElementById(f.id);
      const errEl = document.getElementById(f.errId);
      const val = el ? el.value.trim() : '';

      if (!val || val === '') {
        hasErrors = true;
        if (el) {
          el.style.border = '2px solid var(--color-rose)';
        }
        if (errEl) {
          errEl.style.display = 'block';
        }
      } else {
        if (el) {
          el.style.border = '1px solid var(--border-color)';
        }
        if (errEl) {
          errEl.style.display = 'none';
        }
      }
    });

    const checkedInterests = Array.from(form.querySelectorAll('input[name="interests"]:checked'));
    const interestsError = document.getElementById('interestsError');
    if (checkedInterests.length === 0) {
      hasErrors = true;
      if (interestsError) {
        interestsError.style.display = 'block';
      }
    } else {
      if (interestsError) {
        interestsError.style.display = 'none';
      }
    }

    if (hasErrors) {
      if (errorBanner) {
        errorBanner.innerText = 'Please fill all required fields before generating AI recommendations.';
        errorBanner.style.display = 'block';
        const modalContent = document.querySelector('.modal-content');
        if (modalContent) {
          modalContent.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }
      return;
    }

    const selectedInterests = checkedInterests.map(cb => cb.value);
    const formData = {
      name: document.getElementById('nameInput').value.trim(),
      gradeClass: document.getElementById('gradeClassSelect').value,
      skillLevel: document.getElementById('skillLevelSelect').value,
      preferredStyle: form.preferredStyle.value,
      careerGoal: form.careerGoal.value,
      interests: selectedInterests
    };
    window.AppState.submitQuestionnaire(formData);
  };

  let currentQuizStep = 0;
  let quizAnswers = {};
  function renderQuizModalContent(quizId) {
    const quizzes = (window.AppState.data && window.AppState.data.quizzes) ? window.AppState.data.quizzes : [];
    const quiz = quizzes.find(q => q.id === quizId) || quizzes[0] || { title: 'Quiz', questions: [] };
    const q = (quiz.questions && quiz.questions[currentQuizStep]) ? quiz.questions[currentQuizStep] : (quiz.questions ? quiz.questions[0] : { question: 'Question?', options: ['Option 1', 'Option 2'], correctIndex: 0 });

    return `
      <div class="quiz-container" style="border:none; padding:0;">
        <div class="quiz-header">
          <div>
            <h2 style="font-size:1.3rem; font-weight:800;">${quiz.title}</h2>
            <p style="font-size:0.85rem; color:var(--text-muted);">Question ${currentQuizStep + 1} of ${quiz.questions ? quiz.questions.length : 1}</p>
          </div>
          <div class="quiz-timer">
            ${renderIcon('clock')} 09:45
          </div>
        </div>

        <div class="question-box">
          <div class="question-text">${q.question}</div>
          <div class="options-list">
            ${(q.options || []).map((opt, idx) => `
              <button class="option-btn ${quizAnswers[q.id] === idx ? (idx === q.correctIndex ? 'correct' : 'wrong') : ''}" onclick="window.submitQuizAnswer('${quiz.id}', '${q.id}', ${idx}, ${q.correctIndex})">
                <span>${opt}</span>
              </button>
            `).join('')}
          </div>

          ${quizAnswers[q.id] !== undefined ? `
            <div class="explanation-banner">
              <strong>AI Explanation:</strong> ${q.explanation || 'Correct concept applied!'}
            </div>
          ` : ''}
        </div>

        <div style="display:flex; justify-content:space-between; margin-top:20px;">
          <button class="btn-hero-primary" style="background:var(--primary-gradient); color:#fff; flex:1; justify-content:center;" onclick="window.nextQuizStep('${quiz.id}', ${quiz.questions ? quiz.questions.length : 1})">
            Next Question ${renderIcon('arrow-right')}
          </button>
        </div>
      </div>
    `;
  }

  window.submitQuizAnswer = function(quizId, qId, selectedIdx, correctIdx) {
    quizAnswers[qId] = selectedIdx;
    window.AppState.notify();
  };

  window.nextQuizStep = function(quizId, total) {
    if (currentQuizStep < total - 1) {
      currentQuizStep++;
    } else {
      const quizzes = (window.AppState.data && window.AppState.data.quizzes) ? window.AppState.data.quizzes : [];
      const quiz = quizzes.find(q => q.id === quizId) || quizzes[0];
      let correct = 0;
      if (quiz && quiz.questions) {
        quiz.questions.forEach(q => {
          if (quizAnswers[q.id] === q.correctIndex) correct++;
        });
      }
      const scorePct = Math.round((correct / (quiz && quiz.questions ? quiz.questions.length : 1)) * 100);

      currentQuizStep = 0;
      quizAnswers = {};
      
      window.AppState.saveQuizResult(quizId, scorePct);
    }
    window.AppState.notify();
  };

  function renderQuizResultInterestModalContent(data) {
    return `
      <div style="text-align:center;">
        <div style="width:72px; height:72px; border-radius:50%; background:var(--gradient-emerald-teal); color:#fff; display:flex; align-items:center; justify-content:center; margin:0 auto 16px auto;">
          ${renderIcon('sparkles')}
        </div>
        <h2 style="font-size:1.6rem; font-weight:800; margin-bottom:8px;">Quiz Interest & Performance Analysis</h2>
        <p style="color:var(--text-muted); font-size:0.95rem; margin-bottom:20px;">${data.subjectName}</p>

        <div style="background:var(--bg-card); border:1px solid var(--border-color); padding:20px; border-radius:var(--radius-md); margin-bottom:24px;">
          <div style="font-size:2.2rem; font-weight:800; color:var(--color-emerald); font-family:var(--font-heading);">${data.score}% Score</div>
          <div style="font-size:1rem; font-weight:700; color:var(--color-purple); margin-top:6px;">
            ${data.interestText}
          </div>
          <p style="font-size:0.85rem; color:var(--text-muted); margin-top:10px;">
            The AI Engine has dynamically recalculated your subject mastery and unlocked advanced recommendation pathways!
          </p>
        </div>

        <button class="btn-hero-primary" style="background:var(--primary-gradient); color:#fff; width:100%; justify-content:center;" onclick="AppState.closeModal()">
          ${renderIcon('check-circle')} Continue Learning Pathway
        </button>
      </div>
    `;
  }

  function getVideoPlayerHtml(contentUrl) {
    if (!contentUrl) return '';
    const url = contentUrl.trim();
    
    // 1. YouTube detection and conversion
    const ytRegex = /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const ytMatch = url.match(ytRegex);
    if (ytMatch && ytMatch[1]) {
      const videoId = ytMatch[1];
      const embedUrl = `https://www.youtube.com/embed/${videoId}`;
      return `
        <div style="position:relative; padding-bottom:56.25%; height:0; overflow:hidden; border-radius:var(--radius-md); margin-bottom:20px; background:#000;">
          <iframe src="${embedUrl}" style="position:absolute; top:0; left:0; width:100%; height:100%; border:0;" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>
        </div>
      `;
    }
    
    // 2. Vimeo detection and conversion
    const vimeoRegex = /(?:vimeo\.com\/(?:video\/|channels\/|groups\/[^\/]+\/videos\/|album\/[0-9]+\/video\/|showcase\/[0-9]+\/video\/)?|player\.vimeo\.com\/video\/)([0-9]+)/;
    const vimeoMatch = url.match(vimeoRegex);
    if (vimeoMatch && vimeoMatch[1]) {
      const videoId = vimeoMatch[1];
      const embedUrl = `https://player.vimeo.com/video/${videoId}`;
      return `
        <div style="position:relative; padding-bottom:56.25%; height:0; overflow:hidden; border-radius:var(--radius-md); margin-bottom:20px; background:#000;">
          <iframe src="${embedUrl}" style="position:absolute; top:0; left:0; width:100%; height:100%; border:0;" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe>
        </div>
      `;
    }
    
    // 3. Direct video format detection
    const lowerUrl = url.toLowerCase();
    const isDirectVideo = lowerUrl.endsWith('.mp4') || lowerUrl.endsWith('.webm') || lowerUrl.endsWith('.ogg') ||
                          lowerUrl.endsWith('.mov') || lowerUrl.endsWith('.m4v') ||
                          lowerUrl.includes('.mp4?') || lowerUrl.includes('.webm?') || lowerUrl.includes('.ogg?') ||
                          lowerUrl.includes('.mov?') || lowerUrl.includes('.m4v?') ||
                          lowerUrl.startsWith('data:video/') ||
                          /\.(mp4|webm|ogg|mov|m4v|mkv|avi|3gp|flv)($|\?)/i.test(url);
                          
    if (isDirectVideo) {
      return `
        <div style="position:relative; padding-bottom:56.25%; height:0; overflow:hidden; border-radius:var(--radius-md); margin-bottom:20px; background:#000;">
          <video controls autoplay style="position:absolute; top:0; left:0; width:100%; height:100%; border:0; border-radius:var(--radius-md);" src="${url}"></video>
        </div>
      `;
    }
    
    // 4. Default fallback: iframe
    return `
      <div style="position:relative; padding-bottom:56.25%; height:0; overflow:hidden; border-radius:var(--radius-md); margin-bottom:20px; background:#000;">
        <iframe src="${url}" style="position:absolute; top:0; left:0; width:100%; height:100%; border:0;" allowfullscreen></iframe>
      </div>
    `;
  }

  function renderResourceViewerModalContent(resId) {
    const resources = (window.AppState.data && window.AppState.data.resources) ? window.AppState.data.resources : [];
    const courses = (window.AppState.data && window.AppState.data.courses) ? window.AppState.data.courses : [];
    let res = resources.find(r => r.id === resId);
    
    if (!res) {
      // Find in courses
      for (const course of courses) {
        if (course.categories) {
          for (const tier in course.categories) {
            const cat = course.categories[tier];
            if (cat && cat.materials) {
              const foundMat = cat.materials.find(m => m.id === resId);
              if (foundMat) {
                res = {
                  id: foundMat.id,
                  title: foundMat.title,
                  format: foundMat.format || 'video',
                  duration: foundMat.duration,
                  contentUrl: foundMat.contentUrl || 'https://www.youtube.com/embed/r-uOLxNrNk8',
                  description: foundMat.description || foundMat.title,
                  summary: foundMat.description || foundMat.title,
                  subjectId: course.subjectId
                };
                break;
              }
            }
          }
        }
        if (res) break;
      }
    }
    
    if (!res) {
      res = resources[0] || { title: 'Study Material', format: 'article', summary: 'Description' };
    }

    return `
      <div>
        <div style="margin-bottom:16px;">
          <span class="ai-match-badge" style="display:inline-flex;">${(res.format || 'material').toUpperCase()}</span>
          <h2 style="font-size:1.5rem; font-weight:800; margin-top:8px;">${res.title}</h2>
        </div>

        ${res.contentUrl ? getVideoPlayerHtml(res.contentUrl) : ''}

        <p style="font-size:0.95rem; color:var(--text-main); margin-bottom:20px; line-height:1.6;">
          ${res.summary || res.description}
        </p>

        <button class="btn-hero-primary" style="background:var(--primary-gradient); color:#fff; width:100%; justify-content:center;" onclick="AppState.toggleCompleteResource('${res.id}'); AppState.closeModal();">
          ${renderIcon('check-circle')} Mark Study Material Completed (+15 Mins Progress)
        </button>
      </div>
    `;
  }

  function renderCertificateModalContent() {
    const user = window.AppState.currentUser || { name: 'Student' };
    const courses = (window.AppState.data && window.AppState.data.courses) ? window.AppState.data.courses : [];
    
    let courseName = 'Artificial Intelligence & Neural Networks Masterclass';
    if (window.AppState.modalData && window.AppState.modalData.courseId) {
      const c = courses.find(item => item.id === window.AppState.modalData.courseId);
      if (c) courseName = c.title;
    } else if (user.enrolledCourseIds && user.enrolledCourseIds.length > 0) {
      const c = courses.find(item => item.id === user.enrolledCourseIds[0]);
      if (c) courseName = c.title;
    }

    const certId = `LAI-2026-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    return `
      <div style="width:100%; max-width:100%; overflow-x:hidden;">
        <div class="certificate-preview-card">
          
          <!-- Background Ornamental Gold Lines (Subtle watermarks) -->
          <div style="position:absolute; top:-50px; left:-50px; width:150px; height:150px; border:2px solid rgba(197, 168, 128, 0.15); border-radius:50%; pointer-events:none;"></div>
          <div style="position:absolute; bottom:-50px; right:-50px; width:150px; height:150px; border:2px solid rgba(197, 168, 128, 0.15); border-radius:50%; pointer-events:none;"></div>

          <!-- Application Logo & Header at the Top -->
          <div style="text-align:center; margin-bottom:14px;">
            <div style="display:inline-flex; align-items:center; gap:8px; margin-bottom:6px;">
              <div style="width:34px; height:34px; background:#0b192c; border-radius:8px; display:flex; align-items:center; justify-content:center; color:#72eed5; font-size:1.15rem; font-weight:900; font-family:Georgia, serif; box-shadow:0 4px 10px rgba(15,23,42,0.25);">L</div>
              <span style="font-size:1.1rem; font-weight:900; letter-spacing:0.1em; color:#475569; font-family:var(--font-heading);">LearnAI Pro</span>
            </div>
            <!-- Subtle Gold Divider -->
            <div style="width:120px; height:1px; background:linear-gradient(90deg, transparent, #c5a880, transparent); margin:8px auto 0 auto;"></div>
          </div>

          <!-- Title -->
          <div class="cert-header">
            Certificate of Completion
          </div>

          <!-- Description Block -->
          <p style="font-family:'Georgia', serif; font-size:clamp(0.85rem, 2vw, 1rem); color:#475569; margin: 16px auto 10px auto; max-width:600px; line-height:1.6;">
            This certificate is proudly presented by <strong>LearnAI Pro</strong> to
          </p>

          <!-- Student Name (Elegant Typography) -->
          <div class="cert-student-name">
            ${user.name}
          </div>

          <p style="font-family:'Georgia', serif; font-size:clamp(0.85rem, 2vw, 1rem); color:#475569; max-width:600px; margin:10px auto 24px auto; line-height:1.6;">
            for successfully completing the course <strong style="color:#1e293b; display:block; font-size:clamp(0.95rem, 2.5vw, 1.15rem); margin-top:6px; word-break:break-word;">'${courseName}'</strong> <span style="display:block; margin-top:6px;">and fulfilling all the requirements of the program.</span>
          </p>

          <!-- Divider gold line -->
          <div style="width:100%; height:1px; background:#cbd5e1; margin-bottom:24px; position:relative;">
            <div style="position:absolute; top:-3px; left:calc(50% - 20px); width:40px; height:8px; background:#c5a880; border-radius:4px;"></div>
          </div>

          <!-- Bottom Grid: Date, Official Gold Seal, Signature -->
          <div class="cert-footer-row">
            <!-- Date -->
            <div style="text-align:left; flex:1; min-width:120px;">
              <span style="font-size:0.72rem; color:#64748b; font-weight:700; text-transform:uppercase; letter-spacing:0.05em;">Date of Issue</span> <br>
              <span style="font-size:0.88rem; font-weight:700; color:#1e293b;">${new Date().toLocaleDateString()}</span>
            </div>

            <!-- Official Gold Seal -->
            <div style="text-align:center; flex-shrink:0;">
              <svg width="68" height="68" viewBox="0 0 100 100" style="margin:0 auto; filter:drop-shadow(0 4px 6px rgba(0,0,0,0.15));">
                <!-- Ribbon 1 -->
                <path d="M 35 70 L 35 95 L 50 85 L 65 95 L 65 70 Z" fill="#d4af37" opacity="0.85" />
                <!-- Ribbon 2 -->
                <path d="M 45 70 L 45 98 L 50 92 L 55 98 L 55 70 Z" fill="#aa7c11" />
                <!-- Seal Circle -->
                <circle cx="50" cy="50" r="32" fill="url(#goldGradient)" stroke="#aa7c11" stroke-width="1.5" />
                <circle cx="50" cy="50" r="28" fill="none" stroke="#d4af37" stroke-width="1" stroke-dasharray="3 2" />
                <!-- Star inside seal -->
                <polygon points="50,30 54,41 66,41 57,48 60,60 50,52 40,60 43,48 34,41 46,41" fill="#ffffff" />
                <defs>
                  <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="#fdf6e2" />
                    <stop offset="50%" stop-color="#d4af37" />
                    <stop offset="100%" stop-color="#8a6f27" />
                  </linearGradient>
                </defs>
              </svg>
              <div style="font-size:0.62rem; color:#8a6f27; font-weight:800; text-transform:uppercase; letter-spacing:0.1em; margin-top:3px;">Official Seal</div>
            </div>

            <!-- Signature -->
            <div style="text-align:right; flex:1; min-width:120px; border-top:1px solid #cbd5e1; padding-top:6px;">
              <span style="font-size:0.72rem; color:#64748b; font-weight:700; text-transform:uppercase; letter-spacing:0.05em;">Authorized Signature</span>
            </div>
          </div>

          <!-- Verification ID -->
          <div style="margin-top:24px; font-size:0.65rem; color:#94a3b8; font-family:monospace; text-align:center; letter-spacing:0.05em; word-break:break-all;">
            CERTIFICATE ID: ${certId}
          </div>

        </div>

        <div style="margin-top:20px; display:flex; gap:12px; width:100%;">
          <button class="btn-hero-primary" style="background:var(--primary-gradient); color:#fff; flex:1; justify-content:center; min-height:46px;" onclick="window.print()">
            ${renderIcon('printer')} Print / Save PDF
          </button>
        </div>
      </div>
    `;
  }

  function renderAddResourceModalContent() {
    const state = window.AppState;
    const subjects = (state.data && state.data.subjects) ? state.data.subjects : [];

    return `
      <div>
        <h2 style="font-size:1.4rem; font-weight:800; margin-bottom:16px;">Add New Learning Resource</h2>
        <form onsubmit="event.preventDefault(); window.submitNewResource(this);">
          <div style="display:flex; flex-direction:column; gap:12px;">
            <input type="text" name="title" placeholder="Course Title" required style="padding:10px; border-radius:var(--radius-md); border:1px solid var(--border-color); background:var(--bg-card); color:var(--text-main);">
            <select name="subjectId" required style="padding:10px; border-radius:var(--radius-md); border:1px solid var(--border-color); background:var(--bg-card); color:var(--text-main);" onchange="if(this.value === 'ADD_NEW_SUBJECT') { AppState.closeModal(); window.activeAdminTab = 'subjects'; AppState.notify(); }">
              <option value="" disabled selected>Select Subject</option>
              ${subjects.map(s => `<option value="${s.id}">${s.name}</option>`).join('')}
              <option value="ADD_NEW_SUBJECT" style="color:var(--color-purple); font-weight:700;">+ Add New Subject...</option>
            </select>
            <select name="format" style="padding:10px; border-radius:var(--radius-md); border:1px solid var(--border-color); background:var(--bg-card); color:var(--text-main);">
              <option value="video">Video</option>
              <option value="article">Article</option>
              <option value="exercise">Interactive Lab</option>
            </select>
            <textarea name="description" placeholder="Short Description" required style="padding:10px; border-radius:var(--radius-md); border:1px solid var(--border-color); background:var(--bg-card); color:var(--text-main);"></textarea>
            <button type="submit" class="btn-hero-primary" style="background:var(--primary-gradient); color:#fff; justify-content:center;">
              Publish Resource
            </button>
          </div>
        </form>
      </div>
    `;
  }
 
  window.submitNewResource = function(form) {
    const subjectId = form.subjectId.value;
    if (!subjectId || subjectId === 'ADD_NEW_SUBJECT') {
      alert("Please select a valid subject.");
      return;
    }

    const data = {
      title: form.title.value,
      subjectId: subjectId,
      format: form.format.value,
      level: 'Intermediate',
      duration: '30 mins',
      vark: ['visual', 'kinesthetic'],
      description: form.description.value
    };
    window.AppState.addResource(data);
    window.AppState.closeModal();
  };

  // ==========================================================================
  // STUDENT MCQ ASSIGNMENT TEST RUNNER & AUTO-GRADING
  // ==========================================================================
  window.studentAssignmentSession = null;

  window.selectStudentMCQOption = function(qId, optIdx) {
    if (!window.studentAssignmentSession) return;
    window.studentAssignmentSession.answers[qId] = optIdx;

    // Visual selection in the DOM without revealing whether it's right or wrong!
    const card = document.querySelector(`.mcq-student-card[data-qid="${qId}"]`);
    if (card) {
      const options = card.querySelectorAll('.mcq-student-option');
      options.forEach((opt, idx) => {
        const isSelected = idx === optIdx;
        opt.classList.toggle('selected', isSelected);
      });
    }

    // Mark question pill as answered
    const pill = document.querySelector(`.mcq-pill-btn[data-qid="${qId}"]`);
    if (pill) {
      pill.classList.add('answered');
    }

    // Update progress bar
    const total = window.studentAssignmentSession.totalQuestions || 1;
    const answeredCount = Object.keys(window.studentAssignmentSession.answers).length;
    const fillEl = document.getElementById('mcqProgressFill');
    if (fillEl) fillEl.style.width = `${Math.round((answeredCount / total) * 100)}%`;
    const labelEl = document.getElementById('mcqProgressLabel');
    if (labelEl) labelEl.textContent = `Answered ${answeredCount} of ${total}`;
  };

  window.setStudentAssignmentStep = function(step) {
    if (!window.studentAssignmentSession) return;
    window.studentAssignmentSession.currentStep = step;
    window.AppState.notify();
  };

  window.toggleStudentAssignmentViewMode = function(mode) {
    if (!window.studentAssignmentSession) return;
    window.studentAssignmentSession.viewMode = mode;
    window.AppState.notify();
  };

  window.submitStudentMCQ = function(assignmentId) {
    const state = window.AppState;
    const assignment = (state.data && state.data.assignments) ? state.data.assignments.find(a => a.id === assignmentId) : null;
    if (!assignment || !window.studentAssignmentSession) return;

    const questions = assignment.questions || [];
    const totalQuestions = questions.length;
    const answeredCount = Object.keys(window.studentAssignmentSession.answers).length;
    const unanswered = totalQuestions - answeredCount;

    if (unanswered > 0) {
      if (!confirm(`You have ${unanswered} unanswered question(s). Unanswered questions will receive 0 marks. Do you want to submit your assignment now?`)) {
        return;
      }
    }

    let correctCount = 0;
    let wrongCount = 0;
    questions.forEach(q => {
      const studentAns = window.studentAssignmentSession.answers[q.id];
      if (studentAns !== undefined && Number(studentAns) === Number(q.correctAnswer)) {
        correctCount++;
      } else {
        wrongCount++;
      }
    });

    const percentage = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
    const maxPoints = Number(assignment.points) || 100;
    const score = Math.round((correctCount / (totalQuestions || 1)) * maxPoints);
    const passed = percentage >= 50;

    const mcqData = {
      score: score,
      maxPoints: maxPoints,
      percentage: percentage,
      correctCount: correctCount,
      wrongCount: wrongCount,
      totalQuestions: totalQuestions,
      answers: { ...window.studentAssignmentSession.answers },
      passed: passed,
      status: 'graded'
    };

    const sub = window.AppState.submitAssignment(assignment.id, assignment.courseId, '', '', mcqData);
    window.studentAssignmentSession.isSubmitted = true;
    window.studentAssignmentSession.submission = sub;
    window.AppState.notify();
  };

  window.retakeStudentMCQAssignment = function(assignmentId) {
    window.studentAssignmentSession = {
      assignmentId: assignmentId,
      currentStep: 0,
      viewMode: 'single',
      answers: {},
      isSubmitted: false,
      submission: null
    };
    window.AppState.notify();
  };

  function renderMCQAdminBreakdownModalContent() {
    const data = window.activeMCQBreakdownData;
    if (!data || !data.assignment || !data.submission) {
      return `<div style="padding:20px; text-align:center;">No submission data available.</div>`;
    }
    const a = data.assignment;
    const sub = data.submission;
    const questions = a.questions || [];
    const letters = ['A', 'B', 'C', 'D'];

    return `
      <div>
        <h2 style="font-size:1.35rem; font-weight:800; margin-bottom:6px; display:flex; align-items:center; gap:8px;">
          ${renderIcon('file-text')} Student Submission Breakdown
        </h2>
        <p style="color:var(--text-muted); font-size:0.85rem; margin-bottom:18px;">
          Student: <strong>${sub.userName || 'Student'}</strong> • Assignment: <strong>${a.title}</strong>
        </p>

        <div class="mcq-scorecard-grid">
          <div class="mcq-scorecard-item">
            <div class="mcq-scorecard-val" style="color:var(--color-purple);">${sub.score} / ${a.points}</div>
            <div class="mcq-scorecard-lbl">Total Marks</div>
          </div>
          <div class="mcq-scorecard-item">
            <div class="mcq-scorecard-val" style="color:var(--color-emerald);">${sub.correctCount || 0}</div>
            <div class="mcq-scorecard-lbl">Correct Answers</div>
          </div>
          <div class="mcq-scorecard-item">
            <div class="mcq-scorecard-val" style="color:var(--color-rose);">${sub.wrongCount || 0}</div>
            <div class="mcq-scorecard-lbl">Wrong Answers</div>
          </div>
          <div class="mcq-scorecard-item">
            <div class="mcq-scorecard-val" style="color:${sub.passed ? 'var(--color-emerald)' : 'var(--color-rose)'};">${sub.percentage}%</div>
            <div class="mcq-scorecard-lbl">${sub.passed ? 'PASSED' : 'NEEDS PRACTICE'}</div>
          </div>
        </div>

        <h3 style="font-size:1.05rem; font-weight:700; margin:22px 0 12px 0;">Question-by-Question Review</h3>
        <div style="display:flex; flex-direction:column; gap:12px; max-height:420px; overflow-y:auto; padding-right:6px;">
          ${questions.map((q, idx) => {
            const studentChoice = (sub.answers && sub.answers[q.id] !== undefined) ? Number(sub.answers[q.id]) : null;
            const isCorrect = studentChoice !== null && studentChoice === q.correctAnswer;
            return `
              <div class="mcq-review-card ${isCorrect ? 'correct' : 'wrong'}">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                  <span style="font-weight:800; font-size:0.88rem;">Question ${idx + 1}</span>
                  <span class="tag-pill" style="background:${isCorrect ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)'}; color:${isCorrect ? 'var(--color-emerald)' : 'var(--color-rose)'}; font-weight:800; font-size:0.75rem;">
                    ${isCorrect ? '✔ Correct' : '✖ Wrong'}
                  </span>
                </div>
                <div style="font-size:0.92rem; font-weight:600; margin-bottom:10px; color:var(--text-main);">
                  ${q.text}
                </div>
                <div style="display:flex; flex-direction:column; gap:6px;">
                  ${letters.map((let, optIdx) => {
                    const optText = (q.options && q.options[optIdx]) ? q.options[optIdx] : '';
                    const wasChosen = studentChoice === optIdx;
                    const isRight = q.correctAnswer === optIdx;
                    let style = 'padding:8px 12px; border-radius:6px; font-size:0.85rem; display:flex; align-items:center; justify-content:space-between; border:1px solid var(--border-color); background:var(--bg-surface);';
                    if (wasChosen && isRight) {
                      style = 'padding:8px 12px; border-radius:6px; font-size:0.85rem; display:flex; align-items:center; justify-content:space-between; border:1.5px solid #10b981; background:rgba(16,185,129,0.1); color:#065f46; font-weight:700;';
                    } else if (wasChosen && !isRight) {
                      style = 'padding:8px 12px; border-radius:6px; font-size:0.85rem; display:flex; align-items:center; justify-content:space-between; border:1.5px solid #ef4444; background:rgba(239,68,68,0.08); color:#991b1b; font-weight:700;';
                    } else if (isRight) {
                      style = 'padding:8px 12px; border-radius:6px; font-size:0.85rem; display:flex; align-items:center; justify-content:space-between; border:1.5px solid #10b981; background:rgba(16,185,129,0.05); color:#065f46; font-weight:600;';
                    }
                    return `
                      <div style="${style}">
                        <span><strong>${let}.</strong> ${optText}</span>
                        <span>${wasChosen ? (isRight ? '✔ Student Choice' : '✖ Student Choice') : (isRight ? '✔ Correct Answer' : '')}</span>
                      </div>
                    `;
                  }).join('')}
                </div>
              </div>
            `;
          }).join('')}
        </div>
        <div style="display:flex; justify-content:flex-end; margin-top:20px;">
          <button class="btn-hero-primary" style="background:var(--primary-gradient); color:#fff;" onclick="AppState.closeModal()">
            Close Breakdown
          </button>
        </div>
      </div>
    `;
  }

  window.handleSubmitAssignmentForm = function(e) {
    e.preventDefault();
    const form = e.target;
    const assignmentId = form.assignmentId.value;
    const courseId = form.courseId.value;
    const text = form.submissionText.value.trim();
    const link = form.submissionLink.value.trim();

    window.AppState.submitAssignment(assignmentId, courseId, text, link);
    alert("Assignment successfully submitted and sync'd to Firebase!");
    window.AppState.closeModal();
  };

  function renderSubmitAssignmentModalContent(assignmentId) {
    const state = window.AppState;
    const assignment = (state.data && state.data.assignments) ? state.data.assignments.find(a => a.id === assignmentId) : null;
    if (!assignment) return `<div>Error: Assignment not found.</div>`;

    const courses = (state.data && state.data.courses) ? state.data.courses : [];
    const course = courses.find(c => c.id === assignment.courseId) || { title: 'Course' };
    const existingSubmission = (state.data && state.data.submissions) ? state.data.submissions.find(s => s.assignmentId === assignmentId && s.userId === state.currentUser.id) : null;
    const isMCQ = assignment.questions && assignment.questions.length > 0;

    // If legacy standard assignment without questions:
    if (!isMCQ) {
      return `
        <div>
          <h2 style="font-size:1.4rem; font-weight:800; margin-bottom:8px; display:flex; align-items:center; gap:8px; color:var(--color-purple);">
            ${renderIcon('file-text')} Submit Assignment
          </h2>
          <p style="color:var(--text-muted); font-size:0.85rem; margin-bottom:16px;">
            Course assignment: <strong>${assignment.title}</strong>
          </p>
          
          <div style="background:var(--bg-surface); border:1px solid var(--border-color); padding:12px; border-radius:var(--radius-md); font-size:0.85rem; margin-bottom:16px; max-height:120px; overflow-y:auto; line-height:1.5;">
            <strong>Instructions:</strong><br>
            ${assignment.description.replace(/\n/g, '<br>')}
          </div>

          <form onsubmit="window.handleSubmitAssignmentForm(event)">
            <input type="hidden" name="assignmentId" value="${assignment.id}">
            <input type="hidden" name="courseId" value="${assignment.courseId}">
            
            <div style="display:flex; flex-direction:column; gap:12px;">
              <div>
                <label style="font-size:0.8rem; font-weight:700; display:block; margin-bottom:4px;">Write Your Submission Answer / Description</label>
                <textarea name="submissionText" required placeholder="Write your answers, notes, or explanations here..." style="width:100%; height:110px; padding:10px; border-radius:var(--radius-md); border:1px solid var(--border-color); background:var(--bg-card); color:var(--text-main); font-family:inherit; resize:vertical;">${existingSubmission ? existingSubmission.submissionText : ''}</textarea>
              </div>
              
              <div>
                <label style="font-size:0.8rem; font-weight:700; display:block; margin-bottom:4px;">Project Repository / Demo Link (Optional)</label>
                <input type="url" name="submissionLink" value="${existingSubmission ? existingSubmission.submissionLink : ''}" placeholder="e.g. https://github.com/my-project" style="width:100%; padding:10px; border-radius:var(--radius-md); border:1px solid var(--border-color); background:var(--bg-card); color:var(--text-main);">
              </div>

              <button type="submit" class="btn-hero-primary" style="background:var(--primary-gradient); color:#fff; width:100%; padding:11px; justify-content:center;">
                ${renderIcon('send')} ${existingSubmission ? 'Resubmit Assignment' : 'Submit Assignment'}
              </button>
            </div>
          </form>
        </div>
      `;
    }

    // MCQ Assignment Handling:
    if (!window.studentAssignmentSession || window.studentAssignmentSession.assignmentId !== assignment.id) {
      window.studentAssignmentSession = {
        assignmentId: assignment.id,
        currentStep: 0,
        viewMode: 'single',
        answers: (existingSubmission && existingSubmission.answers) ? { ...existingSubmission.answers } : {},
        isSubmitted: !!(existingSubmission && (existingSubmission.status === 'graded' || existingSubmission.score !== undefined)),
        submission: existingSubmission
      };
    }

    const session = window.studentAssignmentSession;
    session.totalQuestions = assignment.questions.length;
    const questions = assignment.questions;
    const letters = ['A', 'B', 'C', 'D'];

    // CASE 1: SUBMITTED -> Show Graded Results & Performance Scorecard + Detailed Review
    if (session.isSubmitted && session.submission) {
      const sub = session.submission;
      return `
        <div class="mcq-student-container">
          <div style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:10px;">
            <div>
              <span class="tag-pill" style="background:rgba(99,102,241,0.1); color:var(--color-indigo); font-weight:700; margin-bottom:6px; display:inline-block;">
                ${course.title}
              </span>
              <h2 style="font-size:1.4rem; font-weight:800; margin:0; color:var(--text-main);">
                ${assignment.title} - Performance Report
              </h2>
            </div>
            <span class="tag-pill" style="background:${sub.passed ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)'}; color:${sub.passed ? 'var(--color-emerald)' : 'var(--color-rose)'}; font-weight:800; font-size:0.85rem; padding:6px 14px;">
              ${sub.passed ? '🎉 PASSED' : '⚠️ NEEDS PRACTICE'}
            </span>
          </div>

          <!-- Summary Hero Banner -->
          <div style="padding:18px 20px; border-radius:var(--radius-md); background:${sub.passed ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)'}; border:1.5px solid ${sub.passed ? '#10b981' : '#f87171'}; display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:14px;">
            <div>
              <div style="font-size:1.15rem; font-weight:800; color:var(--text-main); margin-bottom:4px;">
                ${sub.passed ? 'Excellent work! You achieved a passing score.' : 'Assignment Completed. Review your answers below.'}
              </div>
              <p style="font-size:0.85rem; color:var(--text-muted); margin:0;">
                Auto-calculated evaluation comparing your choices against stored answer keys.
              </p>
            </div>
            <button type="button" class="btn-hero-primary" style="background:var(--primary-gradient); color:#fff; padding:8px 18px; font-size:0.85rem;" onclick="window.retakeStudentMCQAssignment('${assignment.id}')">
              ${renderIcon('rotate-ccw', 'small-icon')} Retake Assignment
            </button>
          </div>

          <!-- 4-Metric Scorecard Grid -->
          <div class="mcq-scorecard-grid">
            <div class="mcq-scorecard-item">
              <div class="mcq-scorecard-val" style="color:var(--color-purple);">${sub.score} / ${sub.maxPoints || assignment.points}</div>
              <div class="mcq-scorecard-lbl">Total Marks</div>
            </div>
            <div class="mcq-scorecard-item">
              <div class="mcq-scorecard-val" style="color:var(--color-emerald);">${sub.correctCount || 0} / ${questions.length}</div>
              <div class="mcq-scorecard-lbl">Correct Answers</div>
            </div>
            <div class="mcq-scorecard-item">
              <div class="mcq-scorecard-val" style="color:var(--color-rose);">${sub.wrongCount || 0} / ${questions.length}</div>
              <div class="mcq-scorecard-lbl">Wrong Answers</div>
            </div>
            <div class="mcq-scorecard-item">
              <div class="mcq-scorecard-val" style="color:${sub.passed ? 'var(--color-emerald)' : 'var(--color-rose)'};">${sub.percentage}%</div>
              <div class="mcq-scorecard-lbl">Percentage Score</div>
            </div>
          </div>

          <!-- Detailed Answer Review Section -->
          <div>
            <h3 style="font-size:1.1rem; font-weight:800; margin-bottom:12px; display:flex; align-items:center; gap:8px;">
              ${renderIcon('check-circle')} Detailed Question Review
            </h3>
            <div style="display:flex; flex-direction:column; gap:14px; max-height:400px; overflow-y:auto; padding-right:4px;">
              ${questions.map((q, idx) => {
                const studentAns = (sub.answers && sub.answers[q.id] !== undefined) ? Number(sub.answers[q.id]) : null;
                const isCorrect = studentAns !== null && studentAns === q.correctAnswer;
                return `
                  <div class="mcq-review-card ${isCorrect ? 'correct' : 'wrong'}">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
                      <span style="font-weight:800; font-size:0.9rem;">Question ${idx + 1}</span>
                      <span class="tag-pill" style="background:${isCorrect ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)'}; color:${isCorrect ? 'var(--color-emerald)' : 'var(--color-rose)'}; font-weight:800; font-size:0.75rem;">
                        ${isCorrect ? '✔ Correct (+pts)' : '✖ Incorrect (0 pts)'}
                      </span>
                    </div>
                    <div style="font-size:0.95rem; font-weight:600; margin-bottom:12px; color:var(--text-main);">
                      ${q.text}
                    </div>
                    <div style="display:flex; flex-direction:column; gap:8px;">
                      ${letters.map((let, optIdx) => {
                        const optText = (q.options && q.options[optIdx]) ? q.options[optIdx] : '';
                        const wasChosen = studentAns === optIdx;
                        const isRight = q.correctAnswer === optIdx;
                        let rowStyle = 'padding:10px 14px; border-radius:var(--radius-sm); font-size:0.88rem; display:flex; align-items:center; justify-content:space-between; border:1px solid var(--border-color); background:var(--bg-surface);';
                        if (wasChosen && isRight) {
                          rowStyle = 'padding:10px 14px; border-radius:var(--radius-sm); font-size:0.88rem; display:flex; align-items:center; justify-content:space-between; border:2px solid #10b981; background:rgba(16,185,129,0.1); color:#065f46; font-weight:700;';
                        } else if (wasChosen && !isRight) {
                          rowStyle = 'padding:10px 14px; border-radius:var(--radius-sm); font-size:0.88rem; display:flex; align-items:center; justify-content:space-between; border:2px solid #ef4444; background:rgba(239,68,68,0.08); color:#991b1b; font-weight:700;';
                        } else if (isRight) {
                          rowStyle = 'padding:10px 14px; border-radius:var(--radius-sm); font-size:0.88rem; display:flex; align-items:center; justify-content:space-between; border:2px solid #10b981; background:rgba(16,185,129,0.06); color:#065f46; font-weight:700;';
                        }
                        return `
                          <div style="${rowStyle}">
                            <div style="display:flex; align-items:center; gap:8px;">
                              <span style="font-weight:800; opacity:0.8;">${let}.</span>
                              <span>${optText}</span>
                            </div>
                            <div>
                              ${wasChosen ? (isRight ? '<span style="font-size:0.75rem; color:#10b981; font-weight:800; display:inline-flex; align-items:center; gap:4px;">✔ Your Choice (Correct)</span>' : '<span style="font-size:0.75rem; color:#ef4444; font-weight:800; display:inline-flex; align-items:center; gap:4px;">✖ Your Choice</span>') : (isRight ? '<span style="font-size:0.75rem; color:#10b981; font-weight:800; display:inline-flex; align-items:center; gap:4px;">✔ Correct Answer</span>' : '')}
                            </div>
                          </div>
                        `;
                      }).join('')}
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>

          <div style="display:flex; justify-content:flex-end; gap:10px; margin-top:10px;">
            <button type="button" class="btn-hero-primary" style="background:var(--primary-gradient); color:#fff;" onclick="AppState.closeModal()">
              Close
            </button>
          </div>
        </div>
      `;
    }

    // CASE 2: NOT SUBMITTED -> Interactive Test Runner
    const answeredCount = Object.keys(session.answers).length;
    const progressPct = Math.round((answeredCount / questions.length) * 100);

    return `
      <div class="mcq-student-container">
        <!-- Header -->
        <div style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:10px; border-bottom:1px solid var(--border-color); padding-bottom:14px;">
          <div>
            <div style="font-size:0.8rem; font-weight:700; color:var(--color-indigo); text-transform:uppercase; letter-spacing:0.5px; margin-bottom:4px;">
              ${course.title}
            </div>
            <h2 style="font-size:1.35rem; font-weight:800; margin:0; color:var(--text-main);">
              ${assignment.title}
            </h2>
            <div style="display:flex; align-items:center; gap:10px; margin-top:6px; font-size:0.82rem; color:var(--text-muted);">
              <span>${renderIcon('award', 'small-icon')} ${assignment.points} Points</span> • 
              <span>${renderIcon('help-circle', 'small-icon')} ${questions.length} Questions</span>
            </div>
          </div>

          <!-- View Mode Switcher -->
          <div style="display:inline-flex; background:var(--bg-surface); padding:3px; border-radius:var(--radius-sm); border:1px solid var(--border-color);">
            <button type="button" style="padding:6px 12px; border:none; border-radius:4px; font-size:0.8rem; font-weight:700; cursor:pointer; background:${session.viewMode === 'single' ? '#0b192c' : 'transparent'}; color:${session.viewMode === 'single' ? '#ffffff' : 'var(--text-muted)'};" onclick="window.toggleStudentAssignmentViewMode('single')">
              Step-by-Step
            </button>
            <button type="button" style="padding:6px 12px; border:none; border-radius:4px; font-size:0.8rem; font-weight:700; cursor:pointer; background:${session.viewMode === 'all' ? '#0b192c' : 'transparent'}; color:${session.viewMode === 'all' ? '#ffffff' : 'var(--text-muted)'};" onclick="window.toggleStudentAssignmentViewMode('all')">
              All Questions
            </button>
          </div>
        </div>

        <!-- Instructions Banner -->
        <div style="background:var(--bg-surface); border:1px solid var(--border-color); padding:10px 14px; border-radius:var(--radius-sm); font-size:0.85rem; color:var(--text-main);">
          <strong>Instructions:</strong> ${assignment.description}
        </div>

        <!-- Progress Bar & Question Tracker -->
        <div>
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px; font-size:0.82rem; font-weight:700; color:var(--text-main);">
            <span>Question ${session.currentStep + 1} of ${questions.length}</span>
            <span id="mcqProgressLabel" style="color:var(--color-indigo);">Answered ${answeredCount} of ${questions.length}</span>
          </div>
          <div class="mcq-student-progress-bar">
            <div id="mcqProgressFill" class="mcq-student-progress-fill" style="width:${progressPct}%;"></div>
          </div>
        </div>

        <!-- Question Pills Navigator -->
        <div class="mcq-student-pill-nav">
          ${questions.map((q, idx) => {
            const isAnswered = session.answers[q.id] !== undefined;
            const isActive = session.currentStep === idx;
            return `
              <button type="button" class="mcq-pill-btn ${isActive ? 'active' : ''} ${isAnswered ? 'answered' : ''}" data-qid="${q.id}" onclick="window.setStudentAssignmentStep(${idx})" title="Jump to Question ${idx + 1}">
                ${idx + 1}
              </button>
            `;
          }).join('')}
        </div>

        <!-- Questions View -->
        ${session.viewMode === 'single' ? (() => {
          const q = questions[session.currentStep] || questions[0];
          const selectedOpt = session.answers[q.id];
          return `
            <div class="mcq-student-card" data-qid="${q.id}">
              <div style="font-size:0.85rem; font-weight:700; color:var(--color-indigo); margin-bottom:6px;">
                Question ${session.currentStep + 1}
              </div>
              <div style="font-size:1.1rem; font-weight:700; color:var(--text-main); margin-bottom:20px; line-height:1.4;">
                ${q.text}
              </div>

              <div>
                ${letters.map((let, optIdx) => {
                  const optText = (q.options && q.options[optIdx]) ? q.options[optIdx] : '';
                  const isSelected = selectedOpt === optIdx;
                  return `
                    <div class="mcq-student-option ${isSelected ? 'selected' : ''}" onclick="window.selectStudentMCQOption('${q.id}', ${optIdx})">
                      <div class="mcq-student-radio">
                        <div class="mcq-student-radio-dot"></div>
                      </div>
                      <div class="mcq-option-badge">${let}</div>
                      <div style="font-size:0.92rem; font-weight:500; color:var(--text-main); flex:1;">
                        ${optText}
                      </div>
                    </div>
                  `;
                }).join('')}
              </div>

              <!-- Navigation bar in single view -->
              <div style="display:flex; justify-content:space-between; align-items:center; margin-top:24px; padding-top:16px; border-top:1px solid var(--border-color); flex-wrap:wrap; gap:10px;">
                <button type="button" class="btn-hero-secondary" style="padding:9px 18px; border:1px solid var(--border-color); background:var(--bg-surface); color:var(--text-main); border-radius:var(--radius-sm); font-weight:700; cursor:pointer;" onclick="window.setStudentAssignmentStep(${session.currentStep - 1})" ${session.currentStep === 0 ? 'disabled style="opacity:0.4; cursor:not-allowed;"' : ''}>
                  ${renderIcon('arrow-left', 'small-icon')} Previous
                </button>

                <div style="display:flex; gap:10px;">
                  ${session.currentStep < questions.length - 1 ? `
                    <button type="button" class="btn-hero-primary" style="background:#0b192c; color:#fff; padding:9px 20px;" onclick="window.setStudentAssignmentStep(${session.currentStep + 1})">
                      Next Question ${renderIcon('arrow-right', 'small-icon')}
                    </button>
                  ` : `
                    <button type="button" class="btn-hero-primary" style="background:var(--gradient-emerald-teal); color:#fff; padding:10px 24px; font-weight:800;" onclick="window.submitStudentMCQ('${assignment.id}')">
                      ${renderIcon('send', 'small-icon')} Submit Assignment
                    </button>
                  `}
                </div>
              </div>
            </div>
          `;
        })() : `
          <!-- All Questions View -->
          <div style="display:flex; flex-direction:column; gap:18px; max-height:480px; overflow-y:auto; padding-right:4px;">
            ${questions.map((q, idx) => {
              const selectedOpt = session.answers[q.id];
              return `
                <div class="mcq-student-card" data-qid="${q.id}">
                  <div style="font-size:0.85rem; font-weight:700; color:var(--color-indigo); margin-bottom:6px;">
                    Question ${idx + 1}
                  </div>
                  <div style="font-size:1.05rem; font-weight:700; color:var(--text-main); margin-bottom:16px; line-height:1.4;">
                    ${q.text}
                  </div>
                  <div>
                    ${letters.map((let, optIdx) => {
                      const optText = (q.options && q.options[optIdx]) ? q.options[optIdx] : '';
                      const isSelected = selectedOpt === optIdx;
                      return `
                        <div class="mcq-student-option ${isSelected ? 'selected' : ''}" onclick="window.selectStudentMCQOption('${q.id}', ${optIdx})">
                          <div class="mcq-student-radio">
                            <div class="mcq-student-radio-dot"></div>
                          </div>
                          <div class="mcq-option-badge">${let}</div>
                          <div style="font-size:0.92rem; font-weight:500; color:var(--text-main); flex:1;">
                            ${optText}
                          </div>
                        </div>
                      `;
                    }).join('')}
                  </div>
                </div>
              `;
            }).join('')}
          </div>

          <div style="display:flex; justify-content:flex-end; margin-top:20px;">
            <button type="button" class="btn-hero-primary" style="background:var(--gradient-emerald-teal); color:#fff; padding:11px 28px; font-weight:800;" onclick="window.submitStudentMCQ('${assignment.id}')">
              ${renderIcon('send', 'small-icon')} Submit Assignment
            </button>
          </div>
        `}
      </div>
    `;
  }

  window.AppState.subscribe(() => {
    renderApp();
    if (window.AIChatbot && window.AIChatbot.render) {
      window.AIChatbot.render();
    }
  });

  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    setTimeout(() => {
      renderApp();
      if (window.AIChatbot && window.AIChatbot.render) {
        window.AIChatbot.render();
      }
    }, 10);
  } else {
    document.addEventListener('DOMContentLoaded', () => {
      renderApp();
      if (window.AIChatbot && window.AIChatbot.render) {
        window.AIChatbot.render();
      }
    });
  }
})();

