/**
 * ============================================================================
 * COURSES CATALOG PAGE MODULE (MVME Architecture)
 * Layer: View & View Machine (Courses Discovery & Enrollment)
 * ============================================================================
 */

(function() {
  // --------------------------------------------------------------------------
  // VIEW MACHINE: Courses Actions & Filters
  // --------------------------------------------------------------------------
  const CoursesMachine = {
    setSubjectFilter: function(subjectId) {
      if (!window.AppState) return;
      window.AppState.activeSubjectFilter = subjectId;
      window.AppState.notify();
    },
    setSearchQuery: function(query) {
      if (!window.AppState) return;
      window.AppState.searchQuery = query;
      window.AppState.notify();
    },
    enroll: function(courseId) {
      if (!window.AppState) return;
      window.AppState.enrollInCourse(courseId);
    },
    goToStudyHub: function(courseId) {
      if (!window.AppState) return;
      window.AppState.setView('course-hub', { courseId: courseId });
    }
  };

  // --------------------------------------------------------------------------
  // VIEW: Presentation Templates
  // --------------------------------------------------------------------------
  const CoursesView = {
    renderCard: function(c, isEnrolled) {
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
              <div class="course-card-meta-item">${window.renderIcon('clock')} ${c.duration || '10 Weeks'}</div>
              <div class="course-card-meta-item">${window.renderIcon('users')} ${c.enrolledCount || '3.4k'}</div>
              <div class="course-card-meta-item">${window.renderIcon('star')} ${c.rating || '4.98'}</div>
            </div>

            <div style="margin-top:auto;">
              ${isEnrolled ? `
                <button class="btn-study-hub-clean" onclick="AppState.setView('course-hub', {courseId: '${c.id}'})">
                  ${window.renderIcon('book-open')} Go to Study Hub
                </button>
              ` : `
                <button class="btn-enroll-dark" onclick="AppState.enrollInCourse('${c.id}')">
                  ${window.renderIcon('plus-circle')} Enroll Now
                </button>
              `}
            </div>
          </div>
        </div>
      `;
    },

    render: function() {
      const state = window.AppState || {};
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
          <h1 class="page-title">${window.renderIcon('graduation-cap')} Course Enrollment & Study Pathways</h1>
          <p class="page-subtitle">Enroll in structured AI & Computer Science courses with step-by-step study materials and quizzes.</p>
        </div>

        <!-- Filter Pills Bar (Matches 2.PNG) -->
        <div class="filter-pills-bar">
          <div class="nav-search catalog-search-input" style="width: 100%; max-width: 320px; margin-right: 8px;">
            ${window.renderIcon('search')}
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
          ${courses.map(c => CoursesView.renderCard(c, (user.enrolledCourseIds || []).includes(c.id))).join('')}
        </div>
      `;
    }
  };

  // Export to window
  window.CoursesMachine = CoursesMachine;
  window.CoursesView = CoursesView;
  window.renderCoursesCatalog = function() {
    return CoursesView.render();
  };
  window.renderCourseCard = function(c, isEnrolled) {
    return CoursesView.renderCard(c, isEnrolled);
  };
})();
