/**
 * ============================================================================
 * MAIN APPLICATION CONTROLLER & UI SHELL (MVME Architecture)
 * Layer: Orchestrator, App Shell Layout, Router & Reactive Bootstrap
 * ============================================================================
 */

(function() {
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

  // Dynamic Counter Number Animation
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

  // Router: Dispatches to Dedicated MVME Page Views
  function renderCurrentView() {
    const state = window.AppState;
    switch (state.currentView) {
      case 'dashboard': return window.renderDashboard ? window.renderDashboard() : '';
      case 'courses': return window.renderCoursesCatalog ? window.renderCoursesCatalog() : '';
      case 'course-hub': return window.renderCourseHub ? window.renderCourseHub() : '';
      case 'roadmap': return window.renderRoadmap ? window.renderRoadmap() : '';
      case 'catalog': return window.renderCatalog ? window.renderCatalog() : '';
      case 'quizzes': return window.renderQuizzes ? window.renderQuizzes() : '';
      case 'notes': return window.renderNotesView ? window.renderNotesView() : '';
      case 'evaluation': return window.renderEvaluationView ? window.renderEvaluationView() : '';
      case 'analytics': return window.renderAnalytics ? window.renderAnalytics() : '';
      case 'achievements': return window.renderAchievements ? window.renderAchievements() : '';
      case 'admin': return window.renderAdmin ? window.renderAdmin() : '';
      default: return window.renderDashboard ? window.renderDashboard() : '';
    }
  }

  // Main Shell Renderer
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

    if (window.clearCharts) window.clearCharts();

    const state = window.AppState;
    const user = state.currentUser;

    // Check if user is authenticated
    if (!state.isAuthenticated) {
      root.innerHTML = window.renderLandingPage ? window.renderLandingPage() : '';
    } else {
      root.innerHTML = `
        <!-- Mobile Drawer Backdrop Overlay -->
        <div class="sidebar-backdrop" id="sidebarBackdrop" onclick="window.closeMobileSidebar()"></div>

        <!-- Sidebar Navigation (Matches 1.PNG - 7.PNG & Mobile Drawer) -->
        <aside class="sidebar" id="sidebar">
          <div class="sidebar-header-row">
            <div class="brand-logo">
              <div class="brand-icon">
                ${window.renderIcon('sparkles')}
              </div>
              <div class="brand-title">LearnAIPro</div>
            </div>
            <button class="sidebar-close-btn" onclick="window.closeMobileSidebar()" aria-label="Close Navigation Drawer" title="Close Drawer">
              ${window.renderIcon('x')}
            </button>
          </div>

          <!-- Student Profile Card at Top of Sidebar -->
          <div class="sidebar-profile-card">
            <div class="sidebar-avatar-circle">
              ${(user && user.name) ? user.name.split(' ').filter(Boolean).map(n=>n[0]).join('').substring(0,2).toUpperCase() : ((user && user.email) ? user.email.substring(0,2).toUpperCase() : 'ST')}
            </div>
            <div class="sidebar-profile-info">
              <div class="sidebar-profile-name">${(user && user.name) || ((user && user.email) ? user.email.split('@')[0] : 'Student')}</div>
              <div class="sidebar-profile-sub">${(user && (user.role === 'admin' || user.gradeClass === 'Administrator' || (user.email && user.email.toLowerCase() === 'admin@gmail.com') || (state.isAdmin && state.isAdmin(user)))) ? 'Administrator' : ((user && user.gradeClass) ? (user.gradeClass.includes('Student') ? user.gradeClass : `${user.gradeClass} Student`) : 'Student')}</div>
            </div>
          </div>

          <!-- Navigation Menu Items (Every Drawer Accessible) -->
          <ul class="nav-menu">
            <li class="nav-item ${state.currentView === 'dashboard' ? 'active' : ''}">
              <button onclick="AppState.setView('dashboard'); window.closeMobileSidebar();">
                ${window.renderIcon('layout-dashboard')} Dashboard
              </button>
            </li>
            <li class="nav-item ${state.currentView === 'courses' || state.currentView === 'course-hub' ? 'active' : ''}">
              <button onclick="AppState.setView('courses'); window.closeMobileSidebar();">
                ${window.renderIcon('graduation-cap')} Courses
              </button>
            </li>
            <li class="nav-item ${state.currentView === 'roadmap' ? 'active' : ''}">
              <button onclick="AppState.setView('roadmap'); window.closeMobileSidebar();">
                ${window.renderIcon('git-branch')} Roadmaps
              </button>
            </li>
            <li class="nav-item ${state.currentView === 'quizzes' ? 'active' : ''}">
              <button onclick="AppState.setView('quizzes'); window.closeMobileSidebar();">
                ${window.renderIcon('help-circle')} Assessments
              </button>
            </li>
            <li class="nav-item ${state.currentView === 'notes' ? 'active' : ''}">
              <button onclick="AppState.setView('notes'); window.closeMobileSidebar();">
                ${window.renderIcon('file-text')} Notes
              </button>
            </li>
            <li class="nav-item ${state.currentView === 'achievements' ? 'active' : ''}">
              <button onclick="AppState.setView('achievements'); window.closeMobileSidebar();">
                ${window.renderIcon('award')} Achievements
              </button>
            </li>
            <li class="nav-item ${state.currentView === 'analytics' || state.currentView === 'evaluation' ? 'active' : ''}">
              <button onclick="AppState.setView('analytics'); window.closeMobileSidebar();">
                ${window.renderIcon('trending-up')} Insights
              </button>
            </li>
            <li class="nav-item ${state.currentView === 'admin' ? 'active' : ''}">
              <button onclick="AppState.setView('admin'); window.closeMobileSidebar();">
                ${window.renderIcon('settings')} Admin Dashboard
              </button>
            </li>
          </ul>

          <!-- Sidebar Bottom Actions -->
          <div class="sidebar-footer">
            <button class="btn-sidebar-ai-tutor" onclick="if(window.AIChatbot) window.AIChatbot.toggle(); window.closeMobileSidebar();">
              ${window.renderIcon('bot')} Ask AI Tutor
            </button>
            <button class="sidebar-footer-link" onclick="AppState.openModal('questionnaire'); window.closeMobileSidebar();">
              ${window.renderIcon('settings')} Settings
            </button>
            <button class="sidebar-footer-link" onclick="AppState.openModal('help'); window.closeMobileSidebar();">
              ${window.renderIcon('help-circle')} Help Center
            </button>
          </div>
        </aside>

        <!-- Main Wrapper -->
        <div class="main-wrapper">
          <header class="navbar">
            <div style="display:flex; align-items:center; gap:12px; flex:1; min-width:0;">
              <button class="mobile-sidebar-toggle" id="mobileSidebarToggle" onclick="window.toggleMobileSidebar(true)" aria-label="Open Navigation Drawer" title="Open Menu">
                ${window.renderIcon('menu')}
              </button>
              <div class="nav-search">
                ${window.renderIcon('search')}
                <input type="text" placeholder="Search courses, videos, quizzes..." value="${state.searchQuery || ''}" oninput="AppState.searchQuery = this.value; if (AppState.currentView !== 'catalog' && AppState.currentView !== 'courses') { AppState.setView('courses'); } else { AppState.notify(); }">
              </div>
            </div>

            <div class="nav-actions">
              <button class="theme-toggle-btn" onclick="AppState.toggleTheme()" title="Toggle Light / Dark Mode">
                ${state.theme === 'light' ? window.renderIcon('moon') : window.renderIcon('sun')}
              </button>

              ${(state.isAdmin ? state.isAdmin(user) : (user && (user.role === 'admin' || user.gradeClass === 'Administrator'))) ? (() => {
                const firstStudent = (state.data && state.data.defaultUsers) ? state.data.defaultUsers.find(u => u && u.role !== 'admin' && !['u-1','u-2','u-3','u-4','u-5','u-6','u-7','u-8'].includes(u.id)) : null;
                return firstStudent ? `
                  <button class="role-switcher-btn" onclick="AppState.setUser('${firstStudent.id}')" title="Preview Student View">
                    ${window.renderIcon('user-check')} Switch to Student
                  </button>
                ` : '';
              })() : `
                <button class="role-switcher-btn" onclick="AppState.setView('admin')" title="Access Admin Control Panel">
                  ${window.renderIcon('settings')} Admin Dashboard
                </button>
              `}

              <button onclick="AppState.logoutUser()" class="icon-btn" title="Log Out" style="color:var(--text-muted);">
                ${window.renderIcon('log-out')}
              </button>
            </div>
          </header>

          <main class="page-container">
            ${renderCurrentView()}
          </main>

          <!-- Mobile Bottom Navigation Bar (Sticky Thumb Navigation for Mobile) -->
          <nav class="mobile-bottom-nav">
            <button class="mobile-nav-tab ${state.currentView === 'dashboard' ? 'active' : ''}" onclick="AppState.setView('dashboard'); window.closeMobileSidebar();">
              ${window.renderIcon('layout-dashboard')}
              <span>Home</span>
            </button>
            <button class="mobile-nav-tab ${state.currentView === 'courses' || state.currentView === 'course-hub' ? 'active' : ''}" onclick="AppState.setView('courses'); window.closeMobileSidebar();">
              ${window.renderIcon('graduation-cap')}
              <span>Courses</span>
            </button>
            <button class="mobile-nav-tab ${state.currentView === 'roadmap' ? 'active' : ''}" onclick="AppState.setView('roadmap'); window.closeMobileSidebar();">
              ${window.renderIcon('git-branch')}
              <span>Roadmaps</span>
            </button>
            <button class="mobile-nav-tab ${state.currentView === 'quizzes' ? 'active' : ''}" onclick="AppState.setView('quizzes'); window.closeMobileSidebar();">
              ${window.renderIcon('help-circle')}
              <span>Assess</span>
            </button>
            <button class="mobile-nav-tab ${['notes', 'achievements', 'analytics', 'evaluation'].includes(state.currentView) ? 'active' : ''}" onclick="window.toggleMobileSidebar(true);">
              ${window.renderIcon('menu')}
              <span>Drawers</span>
            </button>
          </nav>
        </div>
      `;
    }

    // Always render modals on top
    if (window.renderActiveModal) {
      root.innerHTML += window.renderActiveModal();
    }

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

    if (window.attachCharts) window.attachCharts();
    animateDynamicCounters();
  }

  // Export renderApp
  window.renderApp = renderApp;

  // Subscribe to central AppState mutations
  window.AppState.subscribe(() => {
    renderApp();
    if (window.AIChatbot && window.AIChatbot.render) {
      window.AIChatbot.render();
    }
  });

  // Bootstrap Application
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
