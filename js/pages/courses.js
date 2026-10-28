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

      let courses = (isStudent && state.getPersonalizedCourses)
        ? state.getPersonalizedCourses()
        : ((state.data && state.data.courses) ? state.data.courses : []);

      const subjects = (isStudent && state.getPersonalizedSubjects)
        ? state.getPersonalizedSubjects()
        : ((state.data && state.data.subjects) ? state.data.subjects : []);

      const activeSub = state.activeSubjectFilter || 'all';

      if (activeSub !== 'all') {
        courses = courses.filter(c => window.itemMatchesInterests ? window.itemMatchesInterests(c, [activeSub]) : (c.subjectId === activeSub || c.category === activeSub));
      }
      if (state.searchQuery && state.searchQuery.trim() !== '') {
        const q = state.searchQuery.toLowerCase().trim();
        courses = courses.filter(c => {
          const itemTags = window.getItemCategories ? window.getItemCategories(c).join(' ').toLowerCase() : '';
          return (c.title && c.title.toLowerCase().includes(q)) ||
                 (c.description && c.description.toLowerCase().includes(q)) ||
                 itemTags.includes(q);
        });
      }

      return `
        <div class="page-header">
          <h1 class="page-title">${window.renderIcon('graduation-cap')} Course Enrollment & Study Pathways</h1>
          <p class="page-subtitle">${isStudent ? 'Personalized courses matching your selected interests with step-by-step study materials and quizzes.' : 'Enroll in structured courses with step-by-step study materials and quizzes.'}</p>
        </div>

        ${state.showAllCourses ? `
          <div style="background:rgba(99,102,241,0.08); border:1px solid rgba(99,102,241,0.25); border-radius:var(--radius-md); padding:12px 18px; margin-bottom:20px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px;">
            <div style="display:flex; align-items:center; gap:10px; font-size:0.9rem; font-weight:600; color:var(--text-main);">
              ${window.renderIcon('info')} Showing all available courses across subjects.
            </div>
            <button class="btn-hero-primary" style="padding:6px 14px; font-size:0.85rem;" onclick="AppState.showAllCourses = false; AppState.notify();">
              ${window.renderIcon('sparkles')} Back to My Recommendations
            </button>
          </div>
        ` : ''}

        <!-- Filter Pills Bar (Matches 2.PNG) -->
        <div class="filter-pills-bar">
          <div class="nav-search catalog-search-input" style="width: 100%; max-width: 320px; margin-right: 8px;">
            ${window.renderIcon('search')}
            <input type="text" placeholder="Search courses, categories, tags..." value="${state.searchQuery || ''}" oninput="AppState.searchQuery = this.value; AppState.notify();">
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
          ${courses.length === 0 ? `
            <div class="widget-card" style="grid-column: 1 / -1; text-align: center; padding: 50px 20px;">
              <div style="font-size: 2.5rem; margin-bottom: 12px;">🎓</div>
              <h3 style="font-size: 1.25rem; font-weight: 800; margin-bottom: 8px;">No courses available for your selected interests yet</h3>
              <p style="color: var(--text-muted); max-width: 480px; margin: 0 auto 18px;">${isStudent ? `We currently have no courses matching your selected interests (${userInterests.map(i => (window.getSubjectCategoryName ? window.getSubjectCategoryName(i) : i.toUpperCase())).join(', ')}). You can modify your interests or browse all available courses.` : 'No courses match the current filter. Courses created in the Admin panel will appear dynamically here.'}</p>
              ${isStudent ? `
                <div style="display:flex; justify-content:center; gap:12px; flex-wrap:wrap;">
                  <button class="btn-hero-primary" style="background:var(--primary-gradient); color:#fff; display:inline-flex; align-items:center; gap:8px;" onclick="AppState.openModal('questionnaire')">
                    ${window.renderIcon('edit-3')} Edit Interests
                  </button>
                  <button class="btn-secondary" style="display:inline-flex; align-items:center; gap:8px; padding:10px 18px; border-radius:var(--radius-md); border:1px solid var(--border-color); background:var(--bg-card); color:var(--text-main); font-weight:700; cursor:pointer;" onclick="AppState.showAllCourses = true; AppState.activeSubjectFilter = 'all'; AppState.notify();">
                    ${window.renderIcon('globe')} Browse All Courses
                  </button>
                </div>
              ` : ''}
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
