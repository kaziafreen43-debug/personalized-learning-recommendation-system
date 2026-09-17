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
      const resources = (state.data && state.data.resources) ? state.data.resources : [];
      const courses = (state.data && state.data.courses) ? state.data.courses : [];
      const enrolledCourses = courses.filter(c => (user.enrolledCourseIds || []).includes(c.id));
      const recommendedCourses = courses.filter(c => !(user.enrolledCourseIds || []).includes(c.id));
      
      recommendedCourses.sort((a, b) => {
        const aMatches = (user.interests || []).includes(a.subjectId) ? 1 : 0;
        const bMatches = (user.interests || []).includes(b.subjectId) ? 1 : 0;
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
            <span class="banner-badge-pill">Primary Style: ${(user.preferredStyle || 'Visual').toUpperCase()}</span>
            <span class="banner-badge-pill">Interests: ${(user.interests || ['DS', 'MATH']).map(i => i.toUpperCase()).join(', ')}</span>
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
              <div class="stat-metric-value">${user.streakDays || 6} Days</div>
              <div class="stat-metric-label">Active Streak</div>
            </div>
          </div>

          <div class="stat-metric-card">
            <div class="stat-circle-icon slate">
              ${window.renderIcon('clock')}
            </div>
            <div class="stat-info-col">
              <div class="stat-metric-value">${user.todayStudiedMinutes || 25} / ${user.dailyGoalMinutes || 30} m</div>
              <div class="stat-metric-label">Daily Target</div>
            </div>
          </div>

          <div class="stat-metric-card">
            <div class="stat-circle-icon teal">
              ${window.renderIcon('book-open')}
            </div>
            <div class="stat-info-col">
              <div class="stat-metric-value">${enrolledCourses.length || 8} Courses</div>
              <div class="stat-metric-label">Learning Progress</div>
            </div>
          </div>

          <div class="stat-metric-card">
            <div class="stat-circle-icon slate">
              ${window.renderIcon('star')}
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
            ${window.renderIcon('sparkles')} Recommended Course Pathways
          </div>
          <a href="#" onclick="event.preventDefault(); AppState.setView('courses');" class="section-link-clean">
            View All Courses &rarr;
          </a>
        </div>

        <div class="courses-grid-4 dashboard-courses-grid">
          ${(recommendedCourses.length > 0 ? recommendedCourses.slice(0, 2) : courses.slice(0, 2)).map(c => {
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
