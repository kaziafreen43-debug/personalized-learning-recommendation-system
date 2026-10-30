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
            <div class="course-card-title" title="${c.title}">${c.title}</div>
            <div class="course-card-desc" title="${c.description}">${c.description}</div>
            
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
      const isStudent = user.role !== 'admin' && user.id !== 'u-admin';
      const userInterests = (user && Array.isArray(user.interests)) ? user.interests : [];

      const allCourses = (state.data && Array.isArray(state.data._masterCourses) && state.data._masterCourses.length > 0)
        ? state.data._masterCourses
        : ((state.data && Array.isArray(state.data.courses)) ? state.data.courses : ((window.INITIAL_DATA && window.INITIAL_DATA.courses) || []));

      const allSubjects = (state.data && Array.isArray(state.data.subjects) && state.data.subjects.length > 0)
        ? state.data.subjects
        : ((window.INITIAL_DATA && window.INITIAL_DATA.subjects) || []);

      const activeSub = state.activeSubjectFilter || 'all';

      let courses = isStudent
        ? ((state.getPersonalizedCourses) ? state.getPersonalizedCourses() : allCourses.filter(c => window.itemMatchesInterests && window.itemMatchesInterests(c, userInterests)))
        : [...allCourses];

      if (!isStudent) {
        if (activeSub !== 'all') {
          courses = courses.filter(c => c.subjectId === activeSub || (window.normalizeCategoryKey && window.normalizeCategoryKey(c.subjectId) === activeSub));
        }
        if (state.searchQuery && state.searchQuery.trim() !== '') {
          courses = courses.filter(c => window.courseMatchesSearch ? window.courseMatchesSearch(c, state.searchQuery) : true);
        }
      }

      return `
        <div class="page-header">
          <h1 class="page-title">${window.renderIcon('graduation-cap')} Course Enrollment & Study Pathways</h1>
          <p class="page-subtitle">${isStudent ? 'Personalized courses matching your selected interests with step-by-step study materials and quizzes.' : 'Enroll in structured courses with step-by-step study materials and quizzes.'}</p>
        </div>

        <!-- Filter Pills Bar (Matches 2.PNG) -->
        <div class="filter-pills-bar">
          <div class="nav-search catalog-search-input" style="width: 100%; max-width: 320px; margin-right: 8px;">
            ${window.renderIcon('search')}
            <input type="text" placeholder="Search courses, categories, tags..." value="${state.searchQuery || ''}" oninput="AppState.searchQuery = this.value; AppState.notify();">
          </div>
          <button class="pill-filter-btn ${activeSub === 'all' ? 'active' : ''}" onclick="AppState.activeSubjectFilter='all'; AppState.notify();">
            All Subjects
          </button>
          ${allSubjects.map(s => `
            <button class="pill-filter-btn ${activeSub === s.id ? 'active' : ''}" onclick="AppState.activeSubjectFilter='${s.id}'; AppState.notify();">
              ${s.name}
            </button>
          `).join('')}
        </div>

        <div class="courses-grid-4">
          ${courses.length === 0 ? `
            <div class="widget-card" style="grid-column: 1 / -1; text-align: center; padding: 50px 20px;">
              <div style="font-size: 2.5rem; margin-bottom: 12px;">🎓</div>
              <h3 style="font-size: 1.25rem; font-weight: 800; margin-bottom: 8px;">No courses available for your selected interests yet</h3>
              <p style="color: var(--text-muted); max-width: 480px; margin: 0 auto 18px;">${isStudent ? `We currently have no courses matching your selected interests (${userInterests.map(i => (window.getSubjectCategoryName ? window.getSubjectCategoryName(i) : i.toUpperCase())).join(', ')}). You can modify your interests in your profile questionnaire to discover courses.` : 'No courses match the current filter.'}</p>
              ${isStudent ? `
                <div style="display:flex; justify-content:center; gap:12px; flex-wrap:wrap;">
                  <button class="btn-hero-primary" style="background:var(--primary-gradient); color:#fff; display:inline-flex; align-items:center; gap:8px;" onclick="AppState.openModal('questionnaire')">
                    ${window.renderIcon('edit-3')} Edit Interests
                  </button>
                </div>
              ` : `
                <div style="display:flex; justify-content:center; gap:12px; flex-wrap:wrap;">
                  <button class="btn-hero-primary" style="background:var(--primary-gradient); color:#fff; display:inline-flex; align-items:center; gap:8px;" onclick="AppState.searchQuery=''; AppState.activeSubjectFilter='all'; AppState.notify();">
                    ${window.renderIcon('rotate-ccw')} Show All Courses
                  </button>
                </div>
              `}
            </div>
          ` : courses.map(c => CoursesView.renderCard(c, (user.enrolledCourseIds || []).includes(c.id))).join('')}
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
