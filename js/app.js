// Main Application Controller & UI Renderer

(function() {
  function renderIcon(iconName, extraClass = '') {
    return `<i data-lucide="${iconName}" class="${extraClass}"></i>`;
  }

  let activeCharts = [];
  function clearCharts() {
    activeCharts.forEach(c => {
      try { c.destroy(); } catch(e) {}
    });
    activeCharts = [];
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
        <!-- Sidebar Navigation -->
        <aside class="sidebar" id="sidebar">
          <div class="brand-logo">
            <div class="brand-icon">
              ${renderIcon('sparkles')}
            </div>
            <div>
              <div class="brand-title">LearnAI Pro</div>
              <div style="font-size:0.7rem; color:var(--text-subtle); font-weight:600;">RECOMMENDATION ENGINE</div>
            </div>
          </div>

          <div class="nav-section-label">Main Learning</div>
          <ul class="nav-menu">
            <li class="nav-item ${state.currentView === 'dashboard' ? 'active' : ''}">
              <button onclick="AppState.setView('dashboard')">
                ${renderIcon('layout-dashboard')} Student Dashboard
              </button>
            </li>
            <li class="nav-item ${state.currentView === 'courses' ? 'active' : ''}">
              <button onclick="AppState.setView('courses')">
                ${renderIcon('graduation-cap')} Enrolled Courses & Hub
              </button>
            </li>
            <li class="nav-item ${state.currentView === 'roadmap' ? 'active' : ''}">
              <button onclick="AppState.setView('roadmap')">
                ${renderIcon('git-branch')} Learning Roadmap
              </button>
            </li>
            <li class="nav-item ${state.currentView === 'catalog' ? 'active' : ''}">
              <button onclick="AppState.setView('catalog')">
                ${renderIcon('book-open')} Resource Catalog
              </button>
            </li>
            <li class="nav-item ${state.currentView === 'quizzes' ? 'active' : ''}">
              <button onclick="AppState.setView('quizzes')">
                ${renderIcon('award')} Skill Quizzes
              </button>
            </li>
            <li class="nav-item ${state.currentView === 'notes' ? 'active' : ''}">
              <button onclick="AppState.setView('notes')">
                ${renderIcon('file-text')} My Study Notes
              </button>
            </li>
          </ul>

          <div class="nav-section-label">Analytics & Rewards</div>
          <ul class="nav-menu">
            <li class="nav-item ${state.currentView === 'analytics' ? 'active' : ''}">
              <button onclick="AppState.setView('analytics')">
                ${renderIcon('bar-chart-3')} Performance & Interest
              </button>
            </li>
            <li class="nav-item ${state.currentView === 'evaluation' ? 'active' : ''}">
              <button onclick="AppState.setView('evaluation')">
                ${renderIcon('trending-up')} Conceptual Evaluation
              </button>
            </li>
            <li class="nav-item ${state.currentView === 'achievements' ? 'active' : ''}">
              <button onclick="AppState.setView('achievements')">
                ${renderIcon('shield-check')} Achievements & Certs
              </button>
            </li>
            ${user && user.role === 'admin' ? `
              <li class="nav-item ${state.currentView === 'admin' ? 'active' : ''}">
                <button onclick="AppState.setView('admin')">
                  ${renderIcon('settings')} Admin Control Panel
                </button>
              </li>
            ` : ''}
          </ul>

          <div class="sidebar-user-card" style="flex-direction:column; gap:8px;">
            <div style="display:flex; align-items:center; gap:10px; width:100%;">
              <img src="${(user && user.avatar) || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}" class="user-avatar" alt="User">
              <div class="user-info">
                <div class="user-name">${(user && user.name) || 'Student'}</div>
                <div class="user-role">${((user && user.role) || 'student').toUpperCase()} • ${((user && user.preferredStyle) || 'VISUAL').toUpperCase()}</div>
              </div>
            </div>
            <button onclick="AppState.openModal('questionnaire')" style="width:100%; font-size:0.75rem; background:var(--bg-card-hover); padding:6px; border-radius:var(--radius-sm); border:1px solid var(--border-color); color:var(--color-purple); font-weight:700; display:flex; align-items:center; justify-content:center; gap:4px;">
              ${renderIcon('sliders')} Retake Assessment
            </button>
          </div>
        </aside>

        <!-- Main Wrapper -->
        <div class="main-wrapper">
          <header class="navbar">
            <div style="display:flex; align-items:center; gap:16px;">
              <div class="nav-search">
                ${renderIcon('search')}
                <input type="text" placeholder="Search courses, videos, quizzes..." value="${state.searchQuery || ''}" oninput="AppState.searchQuery = this.value; if (AppState.currentView !== 'catalog') { AppState.setView('catalog'); } else { AppState.notify(); }">
              </div>
            </div>

            <div class="nav-actions">
              <button class="theme-toggle-btn" onclick="AppState.toggleTheme()" title="Toggle Light / Dark Mode">
                ${state.theme === 'light' ? renderIcon('moon') : renderIcon('sun')}
              </button>

              ${user && user.role === 'admin' ? `
                <button class="role-switcher-btn" onclick="AppState.setUser('u-1')">
                  ${renderIcon('user-check')} Switch to Student
                </button>
              ` : ''}

              <button onclick="AppState.logoutUser()" class="icon-btn" title="Log Out" style="color:var(--color-rose);">
                ${renderIcon('log-out')}
              </button>
            </div>
          </header>

          <main class="page-container">
            ${renderCurrentView()}
          </main>
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
  }

  // --------------------------------------------------------------------------
  // HOME / LANDING PAGE (UNAUTHENTICATED)
  // --------------------------------------------------------------------------
  function renderLandingPage() {
    const state = window.AppState;
    const features = (state.data && state.data.landingFeatures) ? state.data.landingFeatures : [];

    return `
      <div style="min-height:100vh; background:var(--bg-page); color:var(--text-main);">
        <!-- Top Navigation Header -->
        <header style="height:76px; display:flex; align-items:center; justify-content:space-between; padding:0 40px; border-bottom:1px solid var(--border-color); background:var(--bg-navbar); backdrop-filter:blur(12px); position:sticky; top:0; z-index:100;">
          <div style="display:flex; align-items:center; gap:12px;">
            <div class="brand-icon">
              ${renderIcon('sparkles')}
            </div>
            <div>
              <div class="brand-title" style="font-size:1.3rem;">LearnAI Pro</div>
              <div style="font-size:0.7rem; color:var(--text-subtle); font-weight:700;">AI LEARNING RECOMMENDATION SYSTEM</div>
            </div>
          </div>

          <div style="display:flex; align-items:center; gap:16px;">
            <button class="theme-toggle-btn" onclick="AppState.toggleTheme()" title="Toggle Light / Dark Mode">
              ${state.theme === 'light' ? renderIcon('moon') : renderIcon('sun')}
            </button>
            <button class="btn-hero-secondary" style="color:var(--text-main); font-size:0.9rem;" onclick="AppState.openModal('login')">
              Login
            </button>
            <button class="btn-hero-primary" style="background:var(--primary-gradient); color:#fff; font-size:0.9rem; padding:8px 20px;" onclick="AppState.openModal('register')">
              Register
            </button>
          </div>
        </header>

        <!-- Hero Section -->
        <section style="padding:80px 40px 60px 40px; max-width:1200px; margin:0 auto; text-align:center;">
          <div style="display:inline-flex; align-items:center; gap:8px; background:rgba(190,24,93,0.12); color:var(--color-indigo); padding:6px 16px; border-radius:var(--radius-full); font-size:0.85rem; font-weight:700; margin-bottom:24px;">
            ${renderIcon('cpu')} AI-POWERED PERSONALIZED LEARNING PLATFORM
          </div>

          <h1 style="font-size:3.2rem; font-weight:800; line-height:1.15; margin-bottom:20px; font-family:var(--font-heading); max-width:900px; margin-left:auto; margin-right:auto;">
            Tailored Study Material & Courses Based on Your <span style="background:var(--primary-gradient); -webkit-background-clip:text; -webkit-text-fill-color:transparent;">Learning Style & Goals</span>
          </h1>

          <p style="font-size:1.15rem; color:var(--text-muted); max-width:720px; margin:0 auto 36px auto; line-height:1.6;">
            Empower your education with adaptive AI recommendations. Complete a short questionnaire to get personalized courses, videos, articles, interactive labs, and post-quiz interest analytics.
          </p>

          <div style="display:flex; justify-content:center; gap:16px;">
            <button class="btn-hero-primary" style="background:var(--primary-gradient); color:#fff; font-size:1.1rem; padding:14px 36px; box-shadow:var(--shadow-colorful);" onclick="AppState.openModal('questionnaire', { name: 'Afreen Kazi', isNewRegistration: true })">
              ${renderIcon('sparkles')} Start Learning
            </button>
            <button class="btn-hero-secondary" style="color:var(--text-main); font-size:1.05rem; padding:14px 28px; border:1px solid var(--border-color);" onclick="AppState.loginUser('alex@student.ai')">
              ${renderIcon('user-check')} Quick Demo Student Login
            </button>
          </div>
        </section>

        <!-- Features Section Grid -->
        <section style="padding:60px 40px 100px 40px; max-width:1250px; margin:0 auto;">
          <div style="text-align:center; margin-bottom:48px;">
            <h2 style="font-size:2.2rem; font-weight:800; margin-bottom:10px;">Why Choose LearnAI Pro?</h2>
            <p style="color:var(--text-muted); font-size:1rem;">Designed to optimize your learning journey with adaptive artificial intelligence.</p>
          </div>

          <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(320px, 1fr)); gap:28px;">
            ${features.map(f => `
              <div class="stat-card" style="padding:28px; flex-direction:column; align-items:flex-start; text-align:left;">
                <div class="stat-icon-wrapper" style="background:var(--primary-gradient); width:56px; height:56px; margin-bottom:16px;">
                  ${renderIcon(f.icon)}
                </div>
                <h3 style="font-size:1.2rem; font-weight:800; margin-bottom:8px;">${f.title}</h3>
                <p style="font-size:0.9rem; color:var(--text-muted); line-height:1.5;">${f.desc}</p>
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
    const recommendations = window.AIEngine ? window.AIEngine.getRecommendations(resources, user, 'all', 6) : resources.slice(0, 6);
    const enrolledCourses = courses.filter(c => (user.enrolledCourseIds || []).includes(c.id));
    const recentActivity = user.recentActivity || [];

    return `
      <!-- Student Profile Card Header -->
      <div class="hero-card" style="margin-bottom:28px;">
        <div style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:20px;">
          <div class="hero-content" style="max-width:750px;">
            <div class="hero-tag">
              ${renderIcon('user')} STUDENT PROFILE • ${user.gradeClass || 'Undergraduate'}
            </div>
            <h1 class="hero-title">${user.name || 'Alex Rivera'} 🎓</h1>
            <p class="hero-subtitle" style="margin-bottom:12px;">
              Target Career Goal: <strong>${user.careerGoal || 'AI & Machine Learning Engineer'}</strong> • Skill Level: <strong>${user.skillLevel || 'Intermediate'}</strong>
            </p>
            <div style="display:flex; gap:10px; flex-wrap:wrap;">
              <span style="background:rgba(255,255,255,0.2); color:#fff; font-size:0.8rem; font-weight:700; padding:4px 12px; border-radius:var(--radius-full);">
                Primary Style: ${(user.preferredStyle || 'Visual').toUpperCase()}
              </span>
              <span style="background:rgba(255,255,255,0.2); color:#fff; font-size:0.8rem; font-weight:700; padding:4px 12px; border-radius:var(--radius-full);">
                Interests: ${(user.interests || ['ds', 'cs']).join(', ').toUpperCase()}
              </span>
            </div>
          </div>

          <button class="btn-hero-secondary" style="background:#fff; color:var(--primary-600); font-weight:700;" onclick="AppState.openModal('questionnaire')">
            ${renderIcon('edit-3')} Edit Questionnaire
          </button>
        </div>
      </div>

      <!-- Key Learning Metrics & Daily Goal Grid -->
      <div class="stats-grid">
        <div class="stat-card purple">
          <div class="stat-icon-wrapper">
            ${renderIcon('flame')}
          </div>
          <div>
            <div class="stat-value">${user.streakDays || 6} Days</div>
            <div class="stat-label">Active Learning Streak</div>
          </div>
        </div>

        <div class="stat-card blue">
          <div class="stat-icon-wrapper">
            ${renderIcon('clock')}
          </div>
          <div>
            <div class="stat-value">${user.todayStudiedMinutes || 25} / ${user.dailyGoalMinutes || 30} m</div>
            <div class="stat-label">Daily Study Target</div>
          </div>
        </div>

        <div class="stat-card emerald">
          <div class="stat-icon-wrapper">
            ${renderIcon('graduation-cap')}
          </div>
          <div>
            <div class="stat-value">${enrolledCourses.length} Courses</div>
            <div class="stat-label">Learning Progress</div>
          </div>
        </div>

        <div class="stat-card amber">
          <div class="stat-icon-wrapper">
            ${renderIcon('award')}
          </div>
          <div>
            <div class="stat-value">98%</div>
            <div class="stat-label">Quiz Interest Score</div>
          </div>
        </div>
      </div>

      <!-- Enrolled & Recommended Courses Grid -->
      <div style="margin-bottom:32px;">
        <div class="section-header">
          <h2 class="section-title">
            ${renderIcon('sparkles')} Recommended Courses & Study Material
          </h2>
          <button class="section-link" onclick="AppState.setView('catalog')">View Full Catalog ${renderIcon('arrow-right')}</button>
        </div>

        <div class="resource-grid">
          ${recommendations.map(res => renderResourceCard(res)).join('')}
        </div>
      </div>

      <!-- Section Split: Continue Learning, Recent Activity & Analytics Charts -->
      <div class="section-grid-2-1">
        <div>
          <!-- Continue Learning Section -->
          <div class="widget-card" style="margin-bottom:24px;">
            <h3 style="font-size:1.15rem; font-weight:800; margin-bottom:14px; display:flex; align-items:center; gap:8px;">
              ${renderIcon('play-circle')} Continue Learning
            </h3>

            ${enrolledCourses.length > 0 ? enrolledCourses.map(c => `
              <div style="display:flex; align-items:center; justify-content:space-between; padding:16px; background:var(--bg-surface); border:1px solid var(--border-color); border-radius:var(--radius-md); margin-bottom:12px; gap:16px;">
                <div style="flex:1; min-width:0; text-align:left;">
                  <h4 style="font-size:0.95rem; font-weight:700; color:var(--text-main); margin:0 0 4px 0; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;" title="${c.title}">${c.title}</h4>
                  <p style="font-size:0.82rem; color:var(--text-muted); margin:0; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${c.duration || '12 Hours'} • Instructor: ${c.instructor}</p>
                </div>
                <button class="btn-launch-resource" style="padding:8px 18px; font-size:0.85rem; flex-shrink:0; background:var(--primary-gradient); color:#fff; border-radius:var(--radius-full);" onclick="AppState.setView('course-hub', {courseId: '${c.id}'})">
                  ${renderIcon('play')} Resume Course
                </button>
              </div>
            `).join('') : '<p style="color:var(--text-muted);">No courses currently in progress.</p>'}
          </div>

          <!-- Performance Charts -->
          <div class="widget-card">
            <h3 style="font-size:1.15rem; font-weight:800; margin-bottom:16px;">Weekly Study Time Performance</h3>
            <div style="position:relative; height:240px;">
              <canvas id="weeklyHoursChart"></canvas>
            </div>
          </div>
        </div>

        <div>
          <!-- Daily Goal Progress Widget -->
          <div class="widget-card">
            <h3 style="font-size:1.1rem; font-weight:700; margin-bottom:8px; display:flex; align-items:center; gap:8px;">
              ${renderIcon('target')} Daily Goal Progress
            </h3>
            <p style="font-size:0.85rem; color:var(--text-muted);">
              You're only <strong>${Math.max(0, (user.dailyGoalMinutes || 30) - (user.todayStudiedMinutes || 25))} mins</strong> away from your goal bonus!
            </p>
            <div class="goal-progress-bar">
              <div class="goal-progress-fill" style="width: ${Math.min(100, Math.round(((user.todayStudiedMinutes || 25) / (user.dailyGoalMinutes || 30)) * 100))}%;"></div>
            </div>
            <div style="display:flex; justify-content:space-between; font-size:0.78rem; font-weight:700; color:var(--text-subtle);">
              <span>${user.todayStudiedMinutes || 25} mins completed</span>
              <span>${user.dailyGoalMinutes || 30} mins goal</span>
            </div>
          </div>

          <!-- Recent Activity Log -->
          <div class="widget-card">
            <h3 style="font-size:1.1rem; font-weight:700; margin-bottom:14px; display:flex; align-items:center; gap:8px;">
              ${renderIcon('activity')} Recent Activity
            </h3>
            <div style="display:flex; flex-direction:column; gap:12px;">
              ${recentActivity.slice(0, 5).map(act => `
                <div style="display:flex; align-items:flex-start; gap:10px; font-size:0.85rem;">
                  <span style="color:var(--color-purple); margin-top:2px;">${renderIcon(act.icon || 'check-circle')}</span>
                  <div>
                    <div style="font-weight:600;">${act.title}</div>
                    <div style="font-size:0.75rem; color:var(--text-subtle);">${act.time}</div>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
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

  function renderNotesView() {
    const state = window.AppState;
    const user = state.currentUser || {};
    if (!user.notes) user.notes = [];
    const courses = (state.data && state.data.courses) ? state.data.courses : [];

    return `
      <div class="page-header">
        <h1 class="page-title">${renderIcon('file-text')} My Study Notes & Notepad</h1>
        <p class="page-subtitle">Take notes, list key takeaways, and document conceptual details while watching lecture videos.</p>
      </div>

      <div class="section-grid-2-1">
        <!-- New Note Form -->
        <div class="widget-card">
          <h3 style="font-size:1.25rem; font-weight:800; margin-bottom:16px; color:var(--primary-500); display:flex; align-items:center; gap:8px;">
            ${renderIcon('edit-3')} Create / Edit Note
          </h3>
          <form onsubmit="event.preventDefault(); window.saveStudentNote(this);">
            <div style="display:flex; flex-direction:column; gap:16px;">
              <div>
                <label style="font-size:0.85rem; font-weight:700; display:block; margin-bottom:6px;">Select Course</label>
                <select name="courseId" required style="width:100%; padding:10px; border-radius:var(--radius-md); border:1px solid var(--border-color); background:var(--bg-card); color:var(--text-main);">
                  ${courses.map(c => `<option value="${c.id}">${c.title}</option>`).join('')}
                </select>
              </div>
              <div>
                <label style="font-size:0.85rem; font-weight:700; display:block; margin-bottom:6px;">Note Title</label>
                <input type="text" name="noteTitle" placeholder="e.g. Backpropagation gradients notes" required style="width:100%; padding:10px; border-radius:var(--radius-md); border:1px solid var(--border-color); background:var(--bg-card); color:var(--text-main);">
              </div>
              <div>
                <label style="font-size:0.85rem; font-weight:700; display:block; margin-bottom:6px;">Note Content</label>
                <textarea name="noteText" placeholder="Write down notes, formulas, code snippets..." required style="width:100%; height:220px; padding:12px; border-radius:var(--radius-md); border:1px solid var(--border-color); background:var(--bg-card); color:var(--text-main); font-family:var(--font-main); resize:vertical;"></textarea>
              </div>
              <button type="submit" class="btn-hero-primary" style="background:var(--primary-gradient); color:#fff; justify-content:center; padding:12px; font-size:0.95rem;">
                ${renderIcon('save')} Save Study Note
              </button>
            </div>
          </form>
        </div>

        <!-- Saved Notes List -->
        <div class="widget-card">
          <h3 style="font-size:1.25rem; font-weight:800; margin-bottom:16px; display:flex; align-items:center; gap:8px;">
            ${renderIcon('book-open')} Saved Notes (${user.notes.length})
          </h3>
          <div style="display:flex; flex-direction:column; gap:12px; max-height:480px; overflow-y:auto; padding-right:4px;">
            ${user.notes.length > 0 ? user.notes.map((note, idx) => {
              const course = courses.find(c => c.id === note.courseId) || { title: 'General Studies' };
              return `
                <div style="padding:16px; background:var(--bg-surface); border:1px solid var(--border-color); border-radius:var(--radius-md); position:relative;">
                  <button style="position:absolute; top:12px; right:12px; color:var(--color-rose);" onclick="window.deleteStudentNote(${idx})">
                    ${renderIcon('trash-2')}
                  </button>
                  <span class="tag-pill" style="font-size:0.7rem; margin-bottom:8px; display:inline-block;">${course.title}</span>
                  <h4 style="font-size:1rem; font-weight:700; margin-bottom:6px; padding-right:24px;">${note.title}</h4>
                  <p style="font-size:0.85rem; color:var(--text-muted); line-height:1.5; white-space:pre-wrap; margin-bottom:8px;">${note.text}</p>
                  <div style="font-size:0.75rem; color:var(--text-subtle);">${note.date}</div>
                </div>
              `;
            }).join('') : '<p style="color:var(--text-muted); text-align:center; padding:20px;">No notes created yet. Start typing on the left!</p>'}
          </div>
        </div>
      </div>
    `;
  }

  window.saveStudentNote = function(form) {
    const user = window.AppState.currentUser;
    if (!user) return;
    if (!user.notes) user.notes = [];

    const newNote = {
      courseId: form.courseId.value,
      title: form.noteTitle.value.trim(),
      text: form.noteText.value.trim(),
      date: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    user.notes.unshift(newNote);
    window.AppState.saveData();
    form.noteTitle.value = '';
    form.noteText.value = '';
  };

  window.deleteStudentNote = function(idx) {
    const user = window.AppState.currentUser;
    if (user && user.notes) {
      user.notes.splice(idx, 1);
      window.AppState.saveData();
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

        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(320px, 1fr)); gap:20px;">
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
    const courses = (state.data && state.data.courses) ? state.data.courses : [];

    return `
      <div class="page-header">
        <h1 class="page-title">${renderIcon('graduation-cap')} Course Enrollment & Study Pathways</h1>
        <p class="page-subtitle">Enroll in structured AI & Computer Science courses with step-by-step study materials and quizzes.</p>
      </div>

      <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(340px, 1fr)); gap:24px;">
        ${courses.map(c => renderCourseCard(c, (user.enrolledCourseIds || []).includes(c.id))).join('')}
      </div>
    `;
  }

  function renderCourseCard(c, isEnrolled) {
    return `
      <div class="resource-card" style="padding:0; overflow:hidden;">
        <div style="height:140px; background:url('${c.bannerImage || 'https://images.unsplash.com/photo-1677442136019-21780efad99a?w=800'}') center/cover; position:relative;">
          <div style="position:absolute; top:12px; right:12px;" class="ai-match-badge">
            ${renderIcon('cpu')} ${c.matchScore || 98}% AI Match
          </div>
        </div>
        
        <div style="padding:20px; display:flex; flex-direction:column; flex:1;">
          <h3 style="font-size:1.15rem; font-weight:800; margin-bottom:6px;">${c.title}</h3>
          <p style="font-size:0.85rem; color:var(--text-muted); margin-bottom:14px; line-height:1.4;">${c.description}</p>
          
          <div class="resource-meta" style="margin-bottom:16px;">
            <div class="resource-meta-item">${renderIcon('clock')} ${c.duration || '12 Hours'}</div>
            <div class="resource-meta-item">${renderIcon('users')} ${c.enrolledCount || 1200} Enrolled</div>
            <div class="resource-meta-item">${renderIcon('star')} ${c.rating || 4.9}</div>
          </div>

          <div style="margin-top:auto; display:flex; gap:10px;">
            ${isEnrolled ? `
              <button class="btn-launch-resource" style="flex:1; background:var(--gradient-emerald-teal);" onclick="AppState.setView('course-hub', {courseId: '${c.id}'})">
                ${renderIcon('book-open')} Go to Study Hub
              </button>
            ` : `
              <button class="btn-launch-resource" style="flex:1;" onclick="AppState.enrollInCourse('${c.id}')">
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

    if (!activeCourseCategory) activeCourseCategory = userSkill;

    const categories = course.categories || {
      Beginner: { title: 'Beginner Category (5 Questions Quiz)', materials: [], quizId: 'quiz-ds-beginner' },
      Intermediate: { title: 'Intermediate Category (10 Questions Quiz)', materials: [], quizId: 'quiz-ds-intermediate' },
      Advanced: { title: 'Advanced Category (15 Questions Quiz)', materials: [], quizId: 'quiz-ds-advanced' }
    };

    const currentCatData = categories[activeCourseCategory] || categories['Intermediate'];
    const qCount = activeCourseCategory === 'Beginner' ? 5 : (activeCourseCategory === 'Intermediate' ? 10 : 15);

    return `
      <div style="margin-bottom:24px;">
        <button onclick="AppState.setView('courses')" style="font-size:0.88rem; font-weight:700; color:var(--color-purple); display:flex; align-items:center; gap:6px; margin-bottom:12px;">
          ${renderIcon('arrow-left')} Back to All Courses
        </button>
        
        <div class="hero-card" style="padding:28px;">
          <div class="hero-tag">${renderIcon('check-circle')} ENROLLED COURSE STUDY HUB</div>
          <h1 style="font-size:1.8rem; font-weight:800; margin-bottom:8px;">${course.title}</h1>
          <p style="font-size:0.95rem; opacity:0.9; margin-bottom:16px;">Instructor: ${course.instructor || 'AI Lab Faculty'} • Prerequisites: ${course.prerequisites || 'Basic Math'}</p>
        </div>
      </div>

      <!-- 3 Category Tabs: Beginner (5 Qs), Intermediate (10 Qs), Advanced (15 Qs) -->
      <div class="section-header" style="margin-bottom:16px;">
        <h2 style="font-size:1.3rem; font-weight:800;">Select Category Tier</h2>
        <span style="font-size:0.85rem; color:var(--text-muted); font-weight:600;">Your Current Level: <strong>${userSkill}</strong></span>
      </div>

      <div class="subject-tabs" style="margin-bottom:24px;">
        <button class="tab-btn ${activeCourseCategory === 'Beginner' ? 'active' : ''}" onclick="window.activeCourseCategory='Beginner'; AppState.notify();">
          🟢 Beginner (5 Questions Quiz)
        </button>
        <button class="tab-btn ${activeCourseCategory === 'Intermediate' ? 'active' : ''}" onclick="window.activeCourseCategory='Intermediate'; AppState.notify();">
          🟡 Intermediate (10 Questions Quiz)
        </button>
        <button class="tab-btn ${activeCourseCategory === 'Advanced' ? 'active' : ''}" onclick="window.activeCourseCategory='Advanced'; AppState.notify();">
          🔴 Advanced (15 Questions Quiz)
        </button>
      </div>

      <div class="widget-card" style="margin-bottom:28px;">
        <h3 style="font-size:1.2rem; font-weight:800; margin-bottom:14px; color:var(--color-purple);">${currentCatData.title}</h3>

        <div style="display:flex; flex-direction:column; gap:12px; margin-bottom:20px;">
          ${(currentCatData.materials || []).map(mat => `
            <div style="display:flex; align-items:center; justify-content:space-between; padding:14px; background:var(--bg-surface); border:1px solid var(--border-color); border-radius:var(--radius-md);">
              <div style="display:flex; align-items:center; gap:12px;">
                <span class="format-badge" style="background:rgba(190,24,93,0.12); color:var(--color-indigo);">${mat.format}</span>
                <span style="font-weight:700; font-size:0.95rem;">${mat.title}</span>
              </div>
              <button class="btn-launch-resource" style="padding:6px 14px; font-size:0.8rem;" onclick="AppState.openModal('resource-viewer', '${mat.id}')">
                ${renderIcon('play')} Open Material
              </button>
            </div>
          `).join('')}
        </div>

        <div style="background:rgba(157, 23, 77, 0.08); border:1px dashed var(--color-purple); padding:18px; border-radius:var(--radius-md); display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:14px;">
          <div>
            <strong style="font-size:1rem; color:var(--color-purple);">${activeCourseCategory} Category Quiz (${qCount} Questions)</strong>
            <p style="font-size:0.85rem; color:var(--text-muted);">Solve this ${qCount}-question quiz to evaluate your category mastery and interest.</p>
          </div>
          <button class="btn-launch-resource" style="background:var(--gradient-purple-pink); padding:10px 20px; font-size:0.88rem;" onclick="AppState.openModal('quiz', '${currentCatData.quizId}')">
            ${renderIcon('award')} Take ${qCount}-Question Quiz
          </button>
        </div>
      </div>

      <!-- Assignments Section -->
      <div class="widget-card" style="margin-bottom:28px;">
        <h3 style="font-size:1.2rem; font-weight:800; margin-bottom:14px; color:var(--color-indigo); display:flex; align-items:center; gap:8px;">
          ${renderIcon('file-text')} Course Assignments & Projects
        </h3>
        
        ${courseAssignments.length === 0 ? `
          <p style="font-size:0.88rem; color:var(--text-muted); text-align:center; padding:12px;">No assignments created for this course yet.</p>
        ` : `
          <div style="display:flex; flex-direction:column; gap:16px;">
            ${courseAssignments.map(a => {
              const sub = submissions.find(s => s.assignmentId === a.id && s.userId === (state.currentUser ? state.currentUser.id : ''));
              return `
                <div style="display:flex; align-items:center; justify-content:space-between; padding:16px; background:var(--bg-surface); border:1px solid var(--border-color); border-radius:var(--radius-md); flex-wrap:wrap; gap:14px;">
                  <div style="flex:1; min-width:250px;">
                    <div style="display:flex; align-items:center; gap:8px; margin-bottom:6px; flex-wrap:wrap;">
                      <span style="font-weight:700; font-size:1.05rem;">${a.title}</span>
                      <span style="font-size:0.75rem; background:rgba(99, 102, 241, 0.12); color:var(--color-indigo); padding:2px 8px; border-radius:var(--radius-full); font-weight:700;">
                        ${a.points} Points
                      </span>
                      ${sub ? `
                        <span style="font-size:0.75rem; background:rgba(16, 185, 129, 0.12); color:var(--color-emerald); padding:2px 8px; border-radius:var(--radius-full); font-weight:700; display:inline-flex; align-items:center; gap:4px;">
                          ${renderIcon('check')} Submitted
                        </span>
                      ` : `
                        <span style="font-size:0.75rem; background:rgba(100, 116, 139, 0.12); color:var(--text-muted); padding:2px 8px; border-radius:var(--radius-full); font-weight:700;">
                          Pending
                        </span>
                      `}
                    </div>
                    <p style="font-size:0.85rem; color:var(--text-muted); margin-bottom:0; line-height:1.4;">
                      ${a.description}
                    </p>
                    ${sub ? `
                      <div style="margin-top:10px; font-size:0.8rem; background:var(--bg-card); padding:8px 12px; border-radius:var(--radius-sm); border:1px solid var(--border-color); color:var(--text-main);">
                        <strong>Your submission:</strong> ${sub.submissionText}
                        ${sub.submissionLink ? `<br><strong>Link:</strong> <a href="${sub.submissionLink}" target="_blank" style="color:var(--color-purple); text-decoration:underline;">${sub.submissionLink}</a>` : ''}
                      </div>
                    ` : ''}
                  </div>
                  
                  <button class="btn-launch-resource" style="padding:8px 20px; font-size:0.85rem; background:var(--primary-gradient); color:#fff; border-radius:var(--radius-full); display:flex; align-items:center; gap:6px;" onclick="AppState.openModal('submit-assignment', '${a.id}')">
                    ${sub ? renderIcon('edit') + ' Resubmit' : renderIcon('upload-cloud') + ' Submit Project'}
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
      title: `${targetSubject ? targetSubject.name : 'Subject'} Learning Pathway`,
      nodes: [
        { id: 'node-1', title: '1. Foundational Core & Theory', status: 'completed', desc: 'Core principles, fundamental definitions & concepts', icon: 'book-open', resourceId: 'res-1' },
        { id: 'node-2', title: '2. Applied Practice & Problem Solving', status: 'in-progress', desc: 'Hands-on practice exercises & interactive labs', icon: 'play', resourceId: 'res-5' },
        { id: 'node-3', title: '3. Advanced Mastery & Projects', status: 'locked', desc: 'Advanced techniques, capstone project & optimization', icon: 'award', resourceId: 'res-2' }
      ]
    };

    const completedResourceIds = (state.currentUser && state.currentUser.completedResourceIds) || [];
    
    // Calculate dynamic node statuses based on completedResourceIds
    let firstIncompleteFound = false;
    const calculatedNodes = (rawRoadmap.nodes || []).map((node) => {
      let status = 'unlocked';
      const isCompleted = completedResourceIds.includes(node.resourceId);
      if (isCompleted) {
        status = 'completed';
      } else {
        if (!firstIncompleteFound) {
          status = 'in-progress';
          firstIncompleteFound = true;
        } else {
          status = 'unlocked';
        }
      }
      return { ...node, status };
    });

    const roadmap = {
      ...rawRoadmap,
      nodes: calculatedNodes
    };

    return `
      <div class="page-header">
        <h1 class="page-title">${renderIcon('git-branch')} Subject Learning Roadmaps</h1>
        <p class="page-subtitle">Interactive step-by-step visual pathways with milestone completion tracking.</p>
      </div>

      <div class="subject-tabs" style="margin-bottom:24px;">
        ${subjects.map(s => `
          <button class="tab-btn ${activeSub === s.id ? 'active' : ''}" onclick="AppState.activeSubjectFilter='${s.id}'; AppState.notify();">
            ${s.name}
          </button>
        `).join('')}
      </div>

      <div class="roadmap-container">
        <h2 style="font-size:1.4rem; font-weight:800; margin-bottom:24px; color:var(--color-purple);">${roadmap.title}</h2>

        <div class="roadmap-tree">
          ${(roadmap.nodes || []).map(node => `
            <div class="roadmap-node ${node.status}">
              <div class="node-icon-status">
                ${node.status === 'completed' ? renderIcon('check') : (node.status === 'in-progress' ? renderIcon('play') : renderIcon('unlock'))}
              </div>
              <div class="node-card">
                <div>
                  <h3 style="font-size:1.1rem; font-weight:700; margin-bottom:4px;">${node.title}</h3>
                  <p style="font-size:0.88rem; color:var(--text-muted);">${node.desc}</p>
                </div>
                <div>
                  ${node.status === 'locked' ? `
                    <span style="font-size:0.8rem; font-weight:700; color:var(--text-subtle);">Prerequisites Locked</span>
                  ` : `
                    <button class="btn-launch-resource" onclick="AppState.openModal('resource-viewer', '${node.resourceId}')">
                      Launch Node Material
                    </button>
                  `}
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

    const userInterests = (state.currentUser && state.currentUser.interests) ? state.currentUser.interests : [];
    
    // Filter quizzes to match student interests only
    if (userInterests.length > 0) {
      quizzes = quizzes.filter(q => userInterests.includes(q.subjectId));
    }
    
    // Filter subject tabs to match student interests only
    const filteredSubjects = userInterests.length > 0 ? subjects.filter(s => userInterests.includes(s.id)) : subjects;

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
        <!-- Subject Filter Tabs -->
        <div class="subject-tabs">
          <button class="tab-btn ${activeQuizSubjectFilter === 'all' ? 'active' : ''}" onclick="window.activeQuizSubjectFilter='all'; AppState.notify();">All Subjects</button>
          ${filteredSubjects.map(s => `
            <button class="tab-btn ${activeQuizSubjectFilter === s.id ? 'active' : ''}" onclick="window.activeQuizSubjectFilter='${s.id}'; AppState.notify();">${s.name}</button>
          `).join('')}
        </div>

        <!-- Category Tier Filter Tabs -->
        <div class="subject-tabs">
          <button class="tab-btn ${activeQuizCategoryFilter === 'all' ? 'active' : ''}" onclick="window.activeQuizCategoryFilter='all'; AppState.notify();">All Categories</button>
          <button class="tab-btn ${activeQuizCategoryFilter === 'Beginner' ? 'active' : ''}" onclick="window.activeQuizCategoryFilter='Beginner'; AppState.notify();">🟢 Beginner (5 Questions)</button>
          <button class="tab-btn ${activeQuizCategoryFilter === 'Intermediate' ? 'active' : ''}" onclick="window.activeQuizCategoryFilter='Intermediate'; AppState.notify();">🟡 Intermediate (10 Questions)</button>
          <button class="tab-btn ${activeQuizCategoryFilter === 'Advanced' ? 'active' : ''}" onclick="window.activeQuizCategoryFilter='Advanced'; AppState.notify();">🔴 Advanced (15 Questions)</button>
        </div>
      </div>

      <div class="resource-grid">
        ${quizzes.map(q => {
          const subject = subjects.find(s => s.id === q.subjectId) || { name: q.subjectId };
          const qCount = q.questionCount || (q.questions ? q.questions.length : (q.level === 'Beginner' ? 5 : (q.level === 'Intermediate' ? 10 : 15)));
          
          let levelBadgeClass = 'color:var(--color-indigo); background:rgba(190,24,93,0.15);';
          if (q.level === 'Intermediate') levelBadgeClass = 'color:var(--color-purple); background:rgba(157,23,77,0.15);';
          if (q.level === 'Advanced') levelBadgeClass = 'color:var(--color-rose); background:rgba(239,68,68,0.15);';

          return `
            <div class="resource-card">
              <div class="resource-top-bar">
                <div class="format-badge" style="${levelBadgeClass}">
                  ${q.level} • ${qCount} Questions
                </div>
                <div style="font-size:0.8rem; font-weight:700; color:var(--text-subtle);">
                  ${renderIcon('clock')} ${q.timeLimitMinutes} Mins
                </div>
              </div>

              <h3 class="resource-title">${q.title}</h3>
              <p class="resource-desc">Subject: <strong>${subject.name}</strong> • ${qCount} Questions Assessment</p>

              <div class="resource-actions" style="margin-top:20px;">
                <button class="btn-launch-resource" onclick="AppState.openModal('quiz', '${q.id}')">
                  ${renderIcon('play')} Start ${qCount}-Question Quiz
                </button>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  function renderAnalytics() {
    return `
      <div class="page-header">
        <h1 class="page-title">${renderIcon('bar-chart-3')} Performance & Quiz Interest Analytics</h1>
        <p class="page-subtitle">Track weekly study hours, quiz solving accuracy, and interest score breakdown.</p>
      </div>

      <div class="section-grid-2-1">
        <div class="widget-card">
          <h3 style="font-size:1.1rem; font-weight:700; margin-bottom:16px;">Weekly Study Hours</h3>
          <div style="position:relative; height:260px;">
            <canvas id="weeklyHoursChart"></canvas>
          </div>
        </div>

        <div class="widget-card">
          <h3 style="font-size:1.1rem; font-weight:700; margin-bottom:16px;">Subject Mastery & Interest Radar</h3>
          <div style="position:relative; height:260px;">
            <canvas id="subjectMasteryChart"></canvas>
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
            label: 'Study Time (Minutes)',
            data: [45, 60, 30, 75, 50, 90, 40],
            backgroundColor: '#6366f1',
            borderRadius: 8
          }]
        },
        options: { responsive: true, maintainAspectRatio: false }
      });
      activeCharts.push(chart1);
    }
  }

  function renderAchievements() {
    const state = window.AppState;
    const user = state.currentUser || {};
    const badges = (state.data && state.data.badges) ? state.data.badges : [];
    const courses = (state.data && state.data.courses) ? state.data.courses : [];
    const enrolledCourses = courses.filter(c => (user.enrolledCourseIds || []).includes(c.id));

    return `
      <div class="page-header">
        <h1 class="page-title">${renderIcon('shield-check')} Achievements & Certificates</h1>
        <p class="page-subtitle">Earn badges by completing courses and generate official verified certificates.</p>
      </div>

      <div class="section-grid-2-1" style="margin-bottom:28px;">
        <!-- Left: Badges Grid -->
        <div class="widget-card">
          <h2 style="font-size:1.3rem; font-weight:800; margin-bottom:16px;">Unlocked Badges</h2>
          <div class="badges-grid" style="display:grid; grid-template-columns:repeat(auto-fill, minmax(180px, 1fr)); gap:16px;">
            ${badges.map(b => `
              <div class="badge-card ${b.unlocked ? '' : 'locked'}">
                <div class="badge-icon-box">
                  ${renderIcon(b.icon || 'award')}
                </div>
                <div class="badge-title" style="font-size:0.9rem;">${b.title}</div>
                <div class="badge-desc" style="font-size:0.75rem;">${b.desc}</div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Right: Certificates List -->
        <div class="widget-card">
          <h2 style="font-size:1.3rem; font-weight:800; margin-bottom:16px;">Course Certificates</h2>
          <p style="color:var(--text-muted); font-size:0.85rem; margin-bottom:16px;">Generate and download a professional Certificate of Completion for your active courses.</p>
          <div style="display:flex; flex-direction:column; gap:12px;">
            ${enrolledCourses.map(c => `
              <div style="padding:14px; background:var(--bg-surface); border:1px solid var(--border-color); border-radius:var(--radius-md); display:flex; align-items:center; justify-content:space-between; gap:12px;">
                <div style="min-width:0; flex:1;">
                  <h4 style="font-size:0.9rem; font-weight:700; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${c.title}</h4>
                  <span style="font-size:0.75rem; color:var(--primary-500); font-weight:700;">Verified Pathway</span>
                </div>
                <button class="btn-launch-resource" style="padding:6px 12px; font-size:0.8rem; flex-shrink:0; background:var(--primary-gradient); color:#fff;" onclick="AppState.openModal('certificate', { courseId: '${c.id}' })">
                  ${renderIcon('file-text')} Certificate
                </button>
              </div>
            `).join('')}
          </div>
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
    alert("Course successfully created and saved dynamically to Firebase!");
    form.reset();
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

  window.handleCreateAssignmentSubmit = function(e) {
    e.preventDefault();
    const form = e.target;
    const courseId = form.courseId.value;
    const title = form.title.value.trim();
    const description = form.description.value.trim();
    const points = form.points.value || 100;

    if (!courseId || !title || !description) {
      alert("Please fill in Course, Title, and Instructions.");
      return;
    }
    window.AppState.addAssignment(courseId, title, description, points);
    alert("Assignment successfully created and saved dynamically to Firebase!");
    form.reset();
  };

  function renderAdmin() {
    const state = window.AppState;
    const resources = (state.data && state.data.resources) ? state.data.resources : [];
    const courses = (state.data && state.data.courses) ? state.data.courses : [];
    const subjects = (state.data && state.data.subjects) ? state.data.subjects : [];
    const assignments = (state.data && state.data.assignments) ? state.data.assignments : [];

    let activeTabContent = '';

    if (window.activeAdminTab === 'courses') {
      activeTabContent = `
        <div style="display:grid; grid-template-columns:1fr 1.2fr; gap:28px; align-items:start;">
          <!-- Create Course Form -->
          <div class="widget-card">
            <h2 style="font-size:1.2rem; font-weight:800; margin-bottom:16px; display:flex; align-items:center; gap:8px;">
              ${renderIcon('plus-circle')} Create New Course
            </h2>
            <form onsubmit="window.handleCreateCourseSubmit(event)">
              <div style="display:flex; flex-direction:column; gap:12px;">
                <div>
                  <label style="font-size:0.8rem; font-weight:700; display:block; margin-bottom:4px;">Course Title</label>
                  <input type="text" name="title" required placeholder="e.g. Advanced Deep Learning" style="width:100%; padding:10px; border-radius:var(--radius-md); border:1px solid var(--border-color); background:var(--bg-card); color:var(--text-main);">
                </div>
                <div>
                  <label style="font-size:0.8rem; font-weight:700; display:block; margin-bottom:4px;">Subject</label>
                  <select name="subjectId" required style="width:100%; padding:10px; border-radius:var(--radius-md); border:1px solid var(--border-color); background:var(--bg-card); color:var(--text-main);" onchange="if(this.value === 'ADD_NEW_SUBJECT') { window.activeAdminTab = 'subjects'; AppState.notify(); }">
                    <option value="" disabled selected>Select Subject</option>
                    ${subjects.map(s => `<option value="${s.id}">${s.name}</option>`).join('')}
                    <option value="ADD_NEW_SUBJECT" style="color:var(--color-purple); font-weight:700;">+ Add New Subject...</option>
                  </select>
                </div>
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
                  <div>
                    <label style="font-size:0.8rem; font-weight:700; display:block; margin-bottom:4px;">Instructor</label>
                    <input type="text" name="instructor" placeholder="e.g. Dr. Alan Turing" style="width:100%; padding:10px; border-radius:var(--radius-md); border:1px solid var(--border-color); background:var(--bg-card); color:var(--text-main);">
                  </div>
                  <div>
                    <label style="font-size:0.8rem; font-weight:700; display:block; margin-bottom:4px;">Duration (Weeks)</label>
                    <input type="number" name="duration" min="1" required placeholder="e.g. 10" style="width:100%; padding:10px; border-radius:var(--radius-md); border:1px solid var(--border-color); background:var(--bg-card); color:var(--text-main);">
                  </div>
                </div>
                <div>
                  <label style="font-size:0.8rem; font-weight:700; display:block; margin-bottom:4px;">Banner Image URL (Optional)</label>
                  <input type="text" name="bannerImage" placeholder="https://images.unsplash..." style="width:100%; padding:10px; border-radius:var(--radius-md); border:1px solid var(--border-color); background:var(--bg-card); color:var(--text-main);">
                </div>
                <div>
                  <label style="font-size:0.8rem; font-weight:700; display:block; margin-bottom:4px;">Prerequisites</label>
                  <input type="text" name="prerequisites" placeholder="e.g. Python Programming" style="width:100%; padding:10px; border-radius:var(--radius-md); border:1px solid var(--border-color); background:var(--bg-card); color:var(--text-main);">
                </div>
                <div>
                  <label style="font-size:0.8rem; font-weight:700; display:block; margin-bottom:4px;">Description / Syllabus Summary</label>
                  <textarea name="description" required placeholder="Provide syllabus guidelines..." style="width:100%; height:90px; padding:10px; border-radius:var(--radius-md); border:1px solid var(--border-color); background:var(--bg-card); color:var(--text-main); font-family:inherit; resize:vertical;"></textarea>
                </div>
                <button type="submit" class="btn-hero-primary" style="background:var(--primary-gradient); color:#fff; width:100%; padding:11px; justify-content:center;">
                  Create Course
                </button>
              </div>
            </form>
          </div>
          <!-- Existing Courses -->
          <div class="widget-card">
            <h2 style="font-size:1.2rem; font-weight:800; margin-bottom:16px;">Course Directory</h2>
            <div style="overflow-x:auto;">
              <table class="admin-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Subject</th>
                    <th>Duration</th>
                    <th>Instructor</th>
                  </tr>
                </thead>
                <tbody>
                  ${courses.map(c => `
                    <tr>
                      <td><strong>${c.title}</strong></td>
                      <td>${(c.subjectId || '').toUpperCase()}</td>
                      <td>${c.duration}</td>
                      <td>${c.instructor || 'AI Faculty'}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      `;
    } else if (window.activeAdminTab === 'videos') {
      activeTabContent = `
        <div class="widget-card" style="max-width:650px; margin: 0 auto;">
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
      activeTabContent = `
        <div style="display:grid; grid-template-columns:1fr 1.2fr; gap:28px; align-items:start;">
          <!-- Create Assignment Form -->
          <div class="widget-card">
            <h2 style="font-size:1.2rem; font-weight:800; margin-bottom:16px; display:flex; align-items:center; gap:8px;">
              ${renderIcon('file-text')} Create Course Assignment
            </h2>
            <form onsubmit="window.handleCreateAssignmentSubmit(event)">
              <div style="display:flex; flex-direction:column; gap:12px;">
                <div>
                  <label style="font-size:0.8rem; font-weight:700; display:block; margin-bottom:4px;">Target Course</label>
                  <select name="courseId" style="width:100%; padding:10px; border-radius:var(--radius-md); border:1px solid var(--border-color); background:var(--bg-card); color:var(--text-main);">
                    ${courses.map(c => `<option value="${c.id}">${c.title}</option>`).join('')}
                  </select>
                </div>
                <div>
                  <label style="font-size:0.8rem; font-weight:700; display:block; margin-bottom:4px;">Assignment Title</label>
                  <input type="text" name="title" required placeholder="e.g. Calculus Basics Problem Set" style="width:100%; padding:10px; border-radius:var(--radius-md); border:1px solid var(--border-color); background:var(--bg-card); color:var(--text-main);">
                </div>
                <div>
                  <label style="font-size:0.8rem; font-weight:700; display:block; margin-bottom:4px;">Max Grade Points</label>
                  <input type="number" name="points" value="100" style="width:100%; padding:10px; border-radius:var(--radius-md); border:1px solid var(--border-color); background:var(--bg-card); color:var(--text-main);">
                </div>
                <div>
                  <label style="font-size:0.8rem; font-weight:700; display:block; margin-bottom:4px;">Instructions & Criteria</label>
                  <textarea name="description" required placeholder="Provide clear task instructions, required materials, and how to submit..." style="width:100%; height:130px; padding:10px; border-radius:var(--radius-md); border:1px solid var(--border-color); background:var(--bg-card); color:var(--text-main); font-family:inherit; resize:vertical;"></textarea>
                </div>
                <button type="submit" class="btn-hero-primary" style="background:var(--primary-gradient); color:#fff; width:100%; padding:11px; justify-content:center;">
                  Create Assignment
                </button>
              </div>
            </form>
          </div>
          <!-- Existing Assignments Table -->
          <div class="widget-card">
            <h2 style="font-size:1.2rem; font-weight:800; margin-bottom:16px;">Active Assignments</h2>
            <div style="overflow-x:auto;">
              <table class="admin-table">
                <thead>
                  <tr>
                    <th>Course Target</th>
                    <th>Assignment Title</th>
                    <th>Max Grade</th>
                  </tr>
                </thead>
                <tbody>
                  ${assignments.map(a => {
                    const c = courses.find(item => item.id === a.courseId) || { title: 'Unknown Course' };
                    return `
                      <tr>
                        <td>${c.title}</td>
                        <td><strong>${a.title}</strong></td>
                        <td>${a.points} pts</td>
                      </tr>
                    `;
                  }).join('')}
                  ${assignments.length === 0 ? `
                    <tr>
                      <td colspan="3" style="text-align:center; color:var(--text-muted);">No assignments created yet.</td>
                    </tr>
                  ` : ''}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      `;
    } else if (window.activeAdminTab === 'submissions') {
      const students = state.data.defaultUsers ? state.data.defaultUsers.filter(u => u.role !== 'admin') : [];
      const allSubmissions = state.data.submissions || [];
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
            <div style="overflow-x:auto;">
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
                  ${students.map(s => `
                    <tr>
                      <td>
                        <div style="display:flex; align-items:center; gap:8px;">
                          <img src="${s.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}" style="width:28px; height:28px; border-radius:50%; border:1px solid var(--border-color);">
                          <strong>${s.name}</strong>
                        </div>
                      </td>
                      <td>${s.email || 'N/A'}</td>
                      <td><span class="tag-pill" style="background:var(--bg-surface); border:1px solid var(--border-color);">${s.gradeClass || 'N/A'}</span></td>
                      <td><span class="tag-pill" style="background:rgba(99, 102, 241, 0.1); color:var(--color-indigo);">${(s.preferredStyle || 'visual').toUpperCase()}</span></td>
                      <td>${s.careerGoal || 'N/A'}</td>
                      <td>
                        <span style="font-weight:700; color:var(--color-purple);">${s.streakDays || 0} 🔥</span> • 
                        <span style="font-size:0.8rem; color:var(--text-muted);">${s.completedResourceIds ? s.completedResourceIds.length : 0} lessons done</span>
                      </td>
                    </tr>
                  `).join('')}
                  ${students.length === 0 ? `
                    <tr>
                      <td colspan="6" style="text-align:center; color:var(--text-muted);">No student accounts found in Firestore.</td>
                    </tr>
                  ` : ''}
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
            <div style="overflow-x:auto;">
              <table class="admin-table">
                <thead>
                  <tr>
                    <th>Student Name</th>
                    <th>Course Target</th>
                    <th>Assignment Name</th>
                    <th>Text Submission</th>
                    <th>Project Link</th>
                    <th>Submitted At</th>
                  </tr>
                </thead>
                <tbody>
                  ${allSubmissions.map(sub => {
                    const c = courses.find(item => item.id === sub.courseId) || { title: 'Unknown Course' };
                    const a = assignments.find(item => item.id === sub.assignmentId) || { title: 'Unknown Assignment' };
                    return `
                      <tr>
                        <td><strong>${sub.userName || 'Student'}</strong></td>
                        <td>${c.title}</td>
                        <td><strong>${a.title}</strong></td>
                        <td>
                          <div style="max-width:300px; max-height:80px; overflow-y:auto; font-size:0.85rem; line-height:1.4; white-space:pre-wrap; background:var(--bg-card); padding:6px; border-radius:4px; border:1px solid var(--border-color);">${sub.submissionText}</div>
                        </td>
                        <td>
                          ${sub.submissionLink ? `<a href="${sub.submissionLink}" target="_blank" style="color:var(--color-purple); text-decoration:underline; font-size:0.85rem; display:flex; align-items:center; gap:4px;">${renderIcon('external-link', 'small-icon')} View Link</a>` : '<span style="color:var(--text-subtle);">-</span>'}
                        </td>
                        <td>
                          <span style="font-size:0.8rem; color:var(--text-muted);">${new Date(sub.submittedAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</span>
                        </td>
                      </tr>
                    `;
                  }).join('')}
                  ${allSubmissions.length === 0 ? `
                    <tr>
                      <td colspan="6" style="text-align:center; color:var(--text-muted);">No assignment submissions found.</td>
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

          <div style="overflow-x:auto;">
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
        <div style="display:grid; grid-template-columns:1fr 1.2fr; gap:28px; align-items:start;">
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
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
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
            <div style="overflow-x:auto;">
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
        <div class="stat-card blue">
          <div class="stat-value">1,480</div>
          <div class="stat-label">Total Students</div>
        </div>
        <div class="stat-card purple">
          <div class="stat-value">${courses.length}</div>
          <div class="stat-label">Published Courses</div>
        </div>
        <div class="stat-card emerald">
          <div class="stat-value">${assignments.length}</div>
          <div class="stat-label">Created Assignments</div>
        </div>
      </div>

      <!-- Tab Buttons -->
      <div class="subject-tabs" style="margin-bottom:24px; border-bottom:1px solid var(--border-color); padding-bottom:12px; display:flex; gap:10px; flex-wrap:wrap;">
        <button class="tab-btn ${window.activeAdminTab === 'courses' ? 'active' : ''}" onclick="window.activeAdminTab='courses'; AppState.notify();">
          ${renderIcon('graduation-cap')} Manage Courses
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
          <p style="font-size:0.85rem; color:var(--text-muted); margin-bottom:10px;">Quick One-Click Demo Access:</p>
          <div style="display:flex; gap:10px; justify-content:center;">
            <button class="btn-hero-secondary" style="font-size:0.8rem; padding:6px 12px; color:var(--text-main); border:1px solid var(--border-color);" onclick="AppState.loginUser('alex@student.ai')">
              Demo Student
            </button>
            <button class="btn-hero-secondary" style="font-size:0.8rem; padding:6px 12px; color:var(--text-main); border:1px solid var(--border-color);" onclick="AppState.loginUser('admin@gmail.com', 'Pass@123')">
              Demo Admin
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
    const regName = form.regName ? form.regName.value.trim() : 'Afreen Kazi';
    window.AppState.openModal('questionnaire', { name: regName, isNewRegistration: true });
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
            <input type="email" placeholder="Email Address" required autocomplete="new-email" style="width:100%; padding:12px; border-radius:var(--radius-md); border:1px solid var(--border-color); background:var(--bg-card); color:var(--text-main);">
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
    let defaultName = 'Afreen Kazi';
    if (state.modalData && state.modalData.name) {
      defaultName = state.modalData.name;
    } else if (state.currentUser && state.currentUser.name) {
      defaultName = state.currentUser.name;
    }

    const isNewReg = state.modalData && state.modalData.isNewRegistration;
    const welcomeHtml = isNewReg ? `
      <div class="welcome-banner" style="background:rgba(190,24,93,0.08); border:1px solid rgba(190,24,93,0.25); padding:16px; border-radius:var(--radius-md); text-align:center; margin-bottom:20px; font-weight:700; color:var(--color-indigo); line-height:1.5; font-size:0.95rem;">
        Welcome, ${defaultName}! Please complete your assessment to receive personalized AI learning recommendations.
      </div>
    ` : '';

    return `
      <div>
        ${welcomeHtml}
        <div style="text-align:center; margin-bottom:20px;">
          <div style="display:inline-flex; align-items:center; gap:6px; background:rgba(190,24,93,0.12); color:var(--color-indigo); padding:4px 12px; border-radius:var(--radius-full); font-size:0.8rem; font-weight:700; margin-bottom:8px;">
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
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
              <div>
                <label style="font-size:0.82rem; font-weight:700; display:block; margin-bottom:4px;">Student Name</label>
                <input type="text" name="name" id="nameInput" value="${defaultName}" required style="width:100%; padding:10px; border-radius:var(--radius-md); border:1px solid var(--border-color); background:var(--bg-card); color:var(--text-main); transition: border-color 0.2s;">
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
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
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
              <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px;">
                ${(data.subjects || []).map(s => `
                  <label style="display:flex; align-items:center; gap:8px; font-size:0.85rem; padding:8px; border-radius:var(--radius-sm); border:1px solid var(--border-color); background:var(--bg-card); cursor:pointer;">
                    <input type="checkbox" name="interests" value="${s.id}" checked>
                    <span>${s.name}</span>
                  </label>
                `).join('')}
              </div>
              <div id="interestsError" style="color:var(--color-rose); font-size:0.78rem; font-weight:600; margin-top:4px; display:none;">Please select at least one subject of interest.</div>
            </div>

            <button type="submit" class="btn-hero-primary" style="background:var(--primary-gradient); color:#fff; justify-content:center; padding:12px; margin-top:8px;">
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

  function renderResourceViewerModalContent(resId) {
    const resources = (window.AppState.data && window.AppState.data.resources) ? window.AppState.data.resources : [];
    const res = resources.find(r => r.id === resId) || resources[0] || { title: 'Study Material', format: 'article', summary: 'Description' };

    return `
      <div>
        <div style="margin-bottom:16px;">
          <span class="ai-match-badge" style="display:inline-flex;">${(res.format || 'material').toUpperCase()}</span>
          <h2 style="font-size:1.5rem; font-weight:800; margin-top:8px;">${res.title}</h2>
        </div>

        ${res.contentUrl ? `
          <div style="position:relative; padding-bottom:56.25%; height:0; overflow:hidden; border-radius:var(--radius-md); margin-bottom:20px; background:#000;">
            <iframe src="${res.contentUrl}" style="position:absolute; top:0; left:0; width:100%; height:100%; border:0;" allowfullscreen></iframe>
          </div>
        ` : ''}

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
      <div>
        <div class="certificate-preview-card" style="background:#ffffff; color:#0f172a; border: 16px double #c5a880; border-radius:var(--radius-md); padding: 50px 40px; position:relative; box-shadow: var(--shadow-lg); overflow:hidden;">
          
          <!-- Background Ornamental Gold Lines (Subtle watermarks) -->
          <div style="position:absolute; top:-50px; left:-50px; width:150px; height:150px; border:2px solid rgba(197, 168, 128, 0.15); border-radius:50%;"></div>
          <div style="position:absolute; bottom:-50px; right:-50px; width:150px; height:150px; border:2px solid rgba(197, 168, 128, 0.15); border-radius:50%;"></div>

          <!-- Application Logo & Header at the Top -->
          <div style="text-align:center; margin-bottom:14px;">
            <div style="display:inline-flex; align-items:center; gap:8px; margin-bottom:6px;">
              <div style="width:36px; height:36px; background:#9d174d; border-radius:8px; display:flex; align-items:center; justify-content:center; color:#fff; font-size:1.25rem; font-weight:900; font-family:Georgia, serif; box-shadow:0 4px 10px rgba(157,23,77,0.25);">L</div>
              <span style="font-size:1.15rem; font-weight:900; letter-spacing:0.1em; color:#475569; font-family:var(--font-heading);">LearnAI Pro</span>
            </div>
            <!-- Subtle Gold Divider -->
            <div style="width:120px; height:1px; background:linear-gradient(90deg, transparent, #c5a880, transparent); margin:8px auto 0 auto;"></div>
          </div>

          <!-- Title -->
          <div class="cert-header" style="font-family:'Georgia', serif; font-size:2.4rem; font-weight:700; color:#1e293b; text-transform:uppercase; letter-spacing:0.04em; margin-bottom:16px;">
            Certificate of Completion
          </div>

          <!-- Description Block -->
          <p style="font-family:'Georgia', serif; font-size:1rem; color:#475569; margin: 20px auto 10px auto; max-width:600px; line-height:1.6;">
            This certificate is proudly presented by <strong>LearnAI Pro</strong> to
          </p>

          <!-- Student Name (Burgundy, Elegant Typography) -->
          <div class="cert-student-name" style="color:#9d174d; font-family:'Brush Script MT', 'Georgia', cursive; font-size:3.2rem; font-weight:700; margin:10px 0; border:none; display:block;">
            ${user.name}
          </div>

          <p style="font-family:'Georgia', serif; font-size:1rem; color:#475569; max-width:600px; margin:10px auto 30px auto; line-height:1.6;">
            for successfully completing the course <strong style="color:#1e293b; display:block; font-size:1.1rem; margin-top:6px;">'${courseName}'</strong> <span style="display:block; margin-top:6px;">and fulfilling all the requirements of the program.</span>
          </p>

          <!-- Divider gold line -->
          <div style="width:100%; height:1px; background:#cbd5e1; margin-bottom:28px; position:relative;">
            <div style="position:absolute; top:-3px; left:calc(50% - 20px); width:40px; height:8px; background:#c5a880; border-radius:4px;"></div>
          </div>

          <!-- Bottom Grid: Date, Official Gold Seal, Signature -->
          <div style="display:flex; justify-content:space-between; align-items:flex-end; padding:0 12px; margin-top:20px;">
            <!-- Date -->
            <div style="text-align:left; width:160px;">
              <span style="font-size:0.75rem; color:#64748b; font-weight:700; text-transform:uppercase; letter-spacing:0.05em;">Date of Issue</span> <br>
              <span style="font-size:0.9rem; font-weight:700; color:#1e293b;">${new Date().toLocaleDateString()}</span>
            </div>

            <!-- Official Gold Seal -->
            <div style="text-align:center; flex:1;">
              <svg width="76" height="76" viewBox="0 0 100 100" style="margin:0 auto; filter:drop-shadow(0 4px 6px rgba(0,0,0,0.15));">
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
              <div style="font-size:0.65rem; color:#8a6f27; font-weight:800; text-transform:uppercase; letter-spacing:0.1em; margin-top:4px;">Official Seal</div>
            </div>

            <!-- Signature -->
            <div style="text-align:right; width:160px; border-top:1px solid #cbd5e1; padding-top:6px;">
              <span style="font-size:0.75rem; color:#64748b; font-weight:700; text-transform:uppercase; letter-spacing:0.05em;">Authorized Signature</span>
            </div>
          </div>

          <!-- Verification ID -->
          <div style="margin-top:28px; font-size:0.65rem; color:#94a3b8; font-family:monospace; text-align:center; letter-spacing:0.05em;">
            CERTIFICATE ID: ${certId}
          </div>

        </div>

        <div style="margin-top:20px; display:flex; gap:12px;">
          <button class="btn-hero-primary" style="background:var(--primary-gradient); color:#fff; flex:1; justify-content:center;" onclick="window.print()">
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

    const existingSubmission = (state.data && state.data.submissions) ? state.data.submissions.find(s => s.assignmentId === assignmentId && s.userId === state.currentUser.id) : null;

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

  window.AppState.subscribe(() => {
    renderApp();
  });

  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    setTimeout(renderApp, 10);
  } else {
    document.addEventListener('DOMContentLoaded', () => {
      renderApp();
    });
  }
})();
