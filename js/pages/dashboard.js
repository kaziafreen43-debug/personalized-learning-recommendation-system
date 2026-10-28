/**
 * ============================================================================
 * DASHBOARD PAGE MODULE (MVME Architecture)
 * Layer: View & View Machine (Authenticated Student Home)
 * ============================================================================
 */

(function() {
  // --------------------------------------------------------------------------
  // VIEW MACHINE: Dashboard Actions & Transitions
  // --------------------------------------------------------------------------
  const DashboardMachine = {
    editQuestionnaire: function() {
      if (window.AppState) window.AppState.openModal('questionnaire');
    },
    viewAllCourses: function() {
      if (window.AppState) window.AppState.setView('courses');
    }
  };

  // --------------------------------------------------------------------------
  // VIEW: Presentation Templates
  // --------------------------------------------------------------------------
  const DashboardView = {
    render: function() {
      const state = window.AppState || {};
      const user = state.currentUser || {};
      const rawCourses = (state.data && state.data.courses) ? state.data.courses : [];
      const courses = (state.getPersonalizedCourses && user.role !== 'admin')
        ? state.getPersonalizedCourses()
        : rawCourses;

      const userInterests = (user && Array.isArray(user.interests)) ? user.interests : [];
      const enrolledCourses = courses.filter(c => (user.enrolledCourseIds || []).includes(c.id));
      const recommendedCourses = courses.filter(c => !(user.enrolledCourseIds || []).includes(c.id));
      
      recommendedCourses.sort((a, b) => {
        const aMatches = window.itemMatchesInterests ? (window.itemMatchesInterests(a, userInterests) ? 1 : 0) : (userInterests.includes(a.subjectId) || userInterests.includes(a.category) ? 1 : 0);
        const bMatches = window.itemMatchesInterests ? (window.itemMatchesInterests(b, userInterests) ? 1 : 0) : (userInterests.includes(b.subjectId) || userInterests.includes(b.category) ? 1 : 0);
        return bMatches - aMatches;
      });

      const courseCardRenderer = window.renderCourseCard || (window.CoursesView && window.CoursesView.renderCard);

      return `
        <!-- Student Profile Card Header (Matches 1.PNG) -->
        <div class="student-profile-banner">
          <div class="banner-top-tag">
            ${window.renderIcon('user')} STUDENT PROFILE • ${(user.gradeClass || 'Student').toUpperCase()}
          </div>
          <div class="banner-name-row">
            <div class="banner-student-name">${user.name || ((user.email) ? user.email.split('@')[0] : 'Student')}</div>
            ${window.renderIcon('graduation-cap')}
          </div>
          <div class="banner-career-goal">
            Target Career Goal: <strong>${user.careerGoal || 'AI & Machine Learning Engineer'}</strong> • Skill Level: <strong>${user.skillLevel || 'Intermediate'}</strong>
          </div>
          <div class="banner-pills-row">
            <span class="banner-badge-pill">Primary Style: ${(user.learningStyle || user.preferredStyle || 'Visual').toUpperCase()}</span>
            <span class="banner-badge-pill">Interests: ${(userInterests.length > 0 ? userInterests : ['ds', 'math']).map(i => (window.getSubjectCategoryName ? window.getSubjectCategoryName(i) : i.toUpperCase())).join(', ')}</span>
          </div>
          <button class="btn-edit-questionnaire" onclick="AppState.openModal('questionnaire')">
            ${window.renderIcon('edit-3')} Edit Questionnaire
          </button>
        </div>

        <!-- Key Learning Metrics Grid (Matches 1.PNG) -->
        <div class="stats-grid-4">
          <div class="stat-metric-card">
            <div class="stat-circle-icon teal">
              ${window.renderIcon('flame')}
            </div>
            <div class="stat-info-col">
              <div class="stat-metric-value">${user.streakDays || 0} Days</div>
              <div class="stat-metric-label">Active Streak</div>
            </div>
          </div>

          <div class="stat-metric-card">
            <div class="stat-circle-icon slate">
              ${window.renderIcon('clock')}
            </div>
            <div class="stat-info-col">
              <div class="stat-metric-value">${user.todayStudiedMinutes || 0} / ${user.dailyGoalMinutes || 60} m</div>
              <div class="stat-metric-label">Daily Target</div>
            </div>
          </div>

          <div class="stat-metric-card">
            <div class="stat-circle-icon teal">
              ${window.renderIcon('book-open')}
            </div>
            <div class="stat-info-col">
              <div class="stat-metric-value">${enrolledCourses.length} Courses</div>
              <div class="stat-metric-label">Learning Progress</div>
            </div>
          </div>

          <div class="stat-metric-card">
            <div class="stat-circle-icon slate">
              ${window.renderIcon('star')}
            </div>
            <div class="stat-info-col">
              <div class="stat-metric-value">${user.interestScore !== undefined ? user.interestScore + '%' : (enrolledCourses.length > 0 ? '95%' : '0%')}</div>
              <div class="stat-metric-label">Interest Score</div>
            </div>
          </div>
        </div>

        <!-- Recommended Course Pathways Section (Matches 1.PNG) -->
        <div class="section-header-clean">
          <div class="section-title-clean">
            ${window.renderIcon('sparkles')} Recommended Course Pathways
          </div>
          <a href="#" onclick="event.preventDefault(); AppState.setView('courses');" class="section-link-clean">
            View All Courses &rarr;
          </a>
        </div>

        <div class="courses-grid-4 dashboard-courses-grid">
          ${courses.length === 0 ? `
            <div class="widget-card" style="grid-column: 1 / -1; text-align: center; padding: 36px 20px;">
              <div style="font-size: 2.2rem; margin-bottom: 8px;">📚</div>
              <h4 style="font-weight: 800; margin-bottom: 6px;">No courses available for your selected interests yet</h4>
              <p style="color: var(--text-muted); font-size: 0.88rem; margin: 0 0 16px 0;">We currently have no courses matching ${userInterests.length > 0 ? userInterests.map(i => (window.getSubjectCategoryName ? window.getSubjectCategoryName(i) : i.toUpperCase())).join(', ') : 'your profile'}. Update your interests or browse all courses.</p>
              <div style="display:flex; justify-content:center; gap:12px; flex-wrap:wrap;">
                <button class="btn-hero-primary" style="background:var(--primary-gradient); color:#fff; display:inline-flex; align-items:center; gap:8px;" onclick="AppState.openModal('questionnaire')">
                  ${window.renderIcon('edit-3')} Edit Interests
                </button>
                <button class="btn-secondary" style="display:inline-flex; align-items:center; gap:8px; padding:8px 16px; border-radius:var(--radius-md); border:1px solid var(--border-color); background:var(--bg-card); color:var(--text-main); font-weight:700; cursor:pointer;" onclick="AppState.showAllCourses = true; AppState.activeSubjectFilter = 'all'; AppState.setView('courses');">
                  ${window.renderIcon('globe')} Browse All Courses
                </button>
              </div>
            </div>
          ` : (recommendedCourses.length > 0 ? recommendedCourses.slice(0, 2) : courses.slice(0, 2)).map(c => {
            if (courseCardRenderer) {
              return courseCardRenderer(c, (user.enrolledCourseIds || []).includes(c.id));
            }
            return '';
          }).join('')}
        </div>
      `;
    }
  };

  // Export to window
  window.DashboardMachine = DashboardMachine;
  window.DashboardView = DashboardView;
  window.renderDashboard = function() {
    return DashboardView.render();
  };
})();
