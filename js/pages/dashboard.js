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
    activeTab: 'recommended', // 'recommended' | 'resume'
    setTab: function(tabName) {
      this.activeTab = tabName;
      if (window.AppState) window.AppState.notify();
    },
    editQuestionnaire: function() {
      if (window.AppState) window.AppState.openModal('questionnaire');
    },
    viewAllCourses: function() {
      if (window.AppState) window.AppState.setView('courses');
    },
    resumeCourse: function(courseId) {
      const state = window.AppState;
      if (!state) return;
      const progress = state.getVideoProgress ? state.getVideoProgress(courseId) : null;
      let targetResId = progress ? progress.resourceId : null;
      let startTime = progress ? progress.currentTime : 0;
      
      const allCourses = (state.data && Array.isArray(state.data._masterCourses) && state.data._masterCourses.length > 0)
        ? state.data._masterCourses
        : ((state.data && Array.isArray(state.data.courses)) ? state.data.courses : ((window.INITIAL_DATA && window.INITIAL_DATA.courses) || []));
      const allResources = (state.data && Array.isArray(state.data._masterResources) && state.data._masterResources.length > 0)
        ? state.data._masterResources
        : ((state.data && Array.isArray(state.data.resources)) ? state.data.resources : ((window.INITIAL_DATA && window.INITIAL_DATA.resources) || []));

      const course = allCourses.find(c => c.id === courseId);

      // Verify that progress's targetResId actually belongs to this course's subject!
      if (targetResId && course) {
        const res = allResources.find(r => r.id === targetResId);
        if (res && res.subjectId && res.subjectId !== course.subjectId) {
          targetResId = null;
          startTime = 0;
        }
      }
      
      if (!targetResId && course) {
        const tierObj = (!Array.isArray(course.categories) && typeof course.categories === 'object' && course.categories) ? course.categories : (course.tiers || {});
        for (const tier of ['Beginner', 'Intermediate', 'Advanced']) {
          if (tierObj[tier] && tierObj[tier].materials && tierObj[tier].materials.length > 0) {
            targetResId = tierObj[tier].materials[0].id;
            break;
          }
        }
        if (!targetResId) {
          const matched = allResources.find(r => r.subjectId === course.subjectId && (r.format === 'video' || r.contentUrl));
          if (matched) targetResId = matched.id;
        }
      }

      if (targetResId) {
        state.openModal('resource-viewer', {
          resId: targetResId,
          courseId: courseId,
          startTime: startTime
        });
      } else {
        state.setView('course-hub', { courseId: courseId });
      }
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

      const activeTab = DashboardMachine.activeTab || 'recommended';
      const resumeCourses = (state.getResumeCourses) ? state.getResumeCourses() : [];
      const inProgressCount = resumeCourses.filter(c => c.percentage > 0 && c.percentage < 100).length;

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

          <div class="stat-metric-card clickable-stat-card" onclick="DashboardMachine.setTab('resume')" title="Click to view Resume Course tab" style="cursor:pointer;">
            <div class="stat-circle-icon teal">
              ${window.renderIcon('book-open')}
            </div>
            <div class="stat-info-col">
              <div class="stat-metric-value">${enrolledCourses.length} Courses</div>
              <div class="stat-metric-label">Learning Progress ${inProgressCount > 0 ? `(${inProgressCount} active)` : ''}</div>
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

        <!-- Dashboard Navigation Tabs: Recommended Pathways vs Resume Course -->
        <div class="dashboard-tabs-row" style="margin:28px 0 20px 0; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:14px; border-bottom:2px solid var(--border-color); padding-bottom:14px;">
          <div class="subject-tabs dashboard-tabs" style="margin-bottom:0; display:flex; gap:10px; flex-wrap:wrap;">
            <button class="tab-btn ${activeTab === 'recommended' ? 'active' : ''}" onclick="DashboardMachine.setTab('recommended')" style="display:inline-flex; align-items:center; gap:8px; padding:10px 22px; font-weight:800; border-radius:var(--radius-md); font-size:0.92rem; cursor:pointer;">
              ${window.renderIcon('sparkles')} Recommended Pathways
            </button>
            <button class="tab-btn ${activeTab === 'resume' ? 'active' : ''}" onclick="DashboardMachine.setTab('resume')" style="display:inline-flex; align-items:center; gap:8px; padding:10px 22px; font-weight:800; border-radius:var(--radius-md); font-size:0.92rem; cursor:pointer;" id="resume-course-tab-btn">
              ${window.renderIcon('play-circle')} Resume Course
              ${inProgressCount > 0 ? `<span class="tab-count-badge" style="background:var(--color-teal-action); color:#fff; font-size:0.75rem; font-weight:800; padding:2px 8px; border-radius:12px; margin-left:4px;">${inProgressCount} In Progress</span>` : (resumeCourses.length > 0 ? `<span class="tab-count-badge" style="background:rgba(100,116,139,0.2); color:var(--text-main); font-size:0.75rem; font-weight:800; padding:2px 8px; border-radius:12px; margin-left:4px;">${resumeCourses.length}</span>` : '')}
            </button>
          </div>

          ${activeTab === 'recommended' ? `
            <a href="#" onclick="event.preventDefault(); AppState.setView('courses');" class="section-link-clean" style="font-weight:700; color:var(--color-teal-action); display:inline-flex; align-items:center; gap:6px;">
              View All Courses &rarr;
            </a>
          ` : `
            <span style="font-size:0.85rem; color:var(--text-muted); font-weight:700;">
              ${resumeCourses.length} Enrolled & In-Progress Courses
            </span>
          `}
        </div>

        ${activeTab === 'resume' ? `
          <!-- Resume Course Tab View -->
          <div class="resume-courses-container">
            ${resumeCourses.length === 0 ? `
              <div class="widget-card" style="text-align: center; padding: 48px 20px;">
                <div style="font-size: 2.6rem; margin-bottom: 12px;">🎬</div>
                <h3 style="font-weight: 800; margin-bottom: 8px;">No Courses in Progress Yet</h3>
                <p style="color: var(--text-muted); font-size: 0.9rem; max-width: 500px; margin: 0 auto 20px auto; line-height:1.5;">
                  When you watch video lectures from any enrolled course, your watch progress is automatically saved here in percentage format so you can resume exactly where you left off.
                </p>
                <div style="display:flex; justify-content:center; gap:12px; flex-wrap:wrap;">
                  <button class="btn-hero-primary" style="background:var(--primary-gradient); color:#fff; display:inline-flex; align-items:center; gap:8px;" onclick="DashboardMachine.setTab('recommended')">
                    ${window.renderIcon('sparkles')} Browse Recommended Pathways
                  </button>
                </div>
              </div>
            ` : `
              <div class="resume-courses-grid" style="display:grid; grid-template-columns:repeat(auto-fill, minmax(340px, 1fr)); gap:22px; margin-bottom:28px;">
                ${resumeCourses.map(item => `
                  <div class="resume-course-card" style="background:var(--bg-card); border:1px solid var(--border-color); border-radius:var(--radius-lg); overflow:hidden; display:flex; flex-direction:column; box-shadow:var(--shadow-xs); transition:transform 0.2s ease, box-shadow 0.2s ease;">
                    <!-- Card Banner -->
                    <div style="position:relative; height:150px; background-image:url('${item.bannerImage || 'https://images.unsplash.com/photo-1677442136019-21780efad99a?w=800'}'); background-size:cover; background-position:center;">
                      <div style="position:absolute; inset:0; background:linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.75) 100%);"></div>
                      
                      <!-- Subject Tag Pill -->
                      <div style="position:absolute; top:12px; left:12px; background:rgba(15,23,42,0.8); backdrop-filter:blur(6px); color:#fff; padding:4px 10px; border-radius:var(--radius-full); font-size:0.75rem; font-weight:700; text-transform:uppercase; letter-spacing:0.04em;">
                        ${item.category || item.subjectId || 'Course'}
                      </div>

                      <!-- Watched Percentage Badge -->
                      <div style="position:absolute; top:12px; right:12px; background:${item.percentage >= 100 ? 'var(--color-emerald)' : (item.percentage > 0 ? 'var(--color-amber)' : 'rgba(100,116,139,0.85)')}; color:#fff; padding:4px 12px; border-radius:var(--radius-full); font-size:0.8rem; font-weight:800; display:flex; align-items:center; gap:5px; box-shadow:0 2px 6px rgba(0,0,0,0.25);">
                        ${item.percentage >= 100 ? window.renderIcon('check-circle', 'small-icon') : window.renderIcon('clock', 'small-icon')}
                        ${item.percentage}% Watched
                      </div>

                      <!-- Active Video Title Overlay -->
                      <div style="position:absolute; bottom:12px; left:12px; right:12px; color:#fff;">
                        <div style="font-size:0.72rem; text-transform:uppercase; letter-spacing:0.06em; opacity:0.85; font-weight:700;">Active Video Lecture</div>
                        <div style="font-size:0.95rem; font-weight:800; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;" title="${item.videoTitle || item.title}">${item.videoTitle || item.title}</div>
                      </div>
                    </div>

                    <!-- Card Body -->
                    <div style="padding:18px 20px; display:flex; flex-direction:column; flex:1;">
                      <h4 style="font-size:1.05rem; font-weight:800; color:var(--text-main); margin:0 0 6px 0; line-height:1.3;" title="${item.title}">${item.title}</h4>
                      <p style="font-size:0.82rem; color:var(--text-muted); margin:0 0 16px 0; line-height:1.4;">${item.instructor ? 'Instructor: ' + item.instructor : ''} • ${item.duration || 'Video Curriculum'}</p>

                      <!-- Progress Bar & Watch Details -->
                      <div style="margin-bottom:18px; background:var(--bg-surface); padding:12px 14px; border-radius:var(--radius-md); border:1px solid var(--border-color);">
                        <div style="display:flex; justify-content:space-between; align-items:center; font-size:0.82rem; margin-bottom:8px; font-weight:700;">
                          <span style="color:var(--text-main); display:flex; align-items:center; gap:5px;">
                            ${window.renderIcon('play', 'small-icon')} Video Progress:
                          </span>
                          <span style="color:${item.percentage > 0 ? 'var(--color-teal-action)' : 'var(--text-muted)'}; font-weight:800;">
                            ${item.percentage}% (${item.formattedTime || '00:00 / 15:00'})
                          </span>
                        </div>
                        <!-- Visual Percentage Fill Bar -->
                        <div style="width:100%; height:8px; background:rgba(0,0,0,0.08); border-radius:4px; overflow:hidden;">
                          <div style="width:${item.percentage}%; height:100%; background:linear-gradient(90deg, #0ea5e9, #10b981); border-radius:4px; transition:width 0.4s ease;"></div>
                        </div>
                        <div style="display:flex; justify-content:space-between; font-size:0.75rem; color:var(--text-muted); margin-top:6px; font-weight:600;">
                          <span>Watched: ${item.formattedCurrentTime || '0m'}</span>
                          <span>${item.remainingTime ? item.remainingTime : 'Remaining: ' + (100 - item.percentage) + '%'}</span>
                        </div>
                      </div>

                      <!-- Action Button: Resume Course at Remaining Position -->
                      <div style="margin-top:auto; display:flex; gap:10px;">
                        <button class="btn-launch-resource" style="flex:1; padding:11px 16px; font-size:0.88rem; font-weight:800; background:var(--primary-gradient); color:#fff; border-radius:var(--radius-md); display:inline-flex; align-items:center; justify-content:center; gap:8px; box-shadow:0 3px 10px rgba(14,165,233,0.25); border:none; cursor:pointer;" onclick="DashboardMachine.resumeCourse('${item.id}')">
                          ${window.renderIcon('play')} ${item.percentage > 0 && item.percentage < 100 ? `Resume Video (${item.percentage}%)` : (item.percentage >= 100 ? 'Replay Video' : 'Start Video')}
                        </button>
                        <button class="btn-secondary" style="padding:11px 14px; font-size:0.82rem; font-weight:700; border-radius:var(--radius-md); border:1px solid var(--border-color); background:var(--bg-surface); color:var(--text-main); cursor:pointer; display:inline-flex; align-items:center; gap:6px;" onclick="AppState.setView('course-hub', {courseId: '${item.id}'})" title="Go to Course Study Hub">
                          ${window.renderIcon('book-open')}
                        </button>
                      </div>
                    </div>
                  </div>
                `).join('')}
              </div>
            `}
          </div>
        ` : `
          <!-- Recommended Pathways Tab View -->
          ${inProgressCount > 0 ? `
            <div class="resume-quick-banner" style="background:linear-gradient(135deg, rgba(14,165,233,0.08) 0%, rgba(16,185,129,0.08) 100%); border:1px solid rgba(14,165,233,0.25); border-radius:var(--radius-lg); padding:16px 20px; margin-bottom:24px; display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:14px;">
              <div style="display:flex; align-items:center; gap:14px; min-width:240px; flex:1;">
                <div style="width:44px; height:44px; border-radius:50%; background:var(--primary-gradient); display:flex; align-items:center; justify-content:center; color:#fff; flex-shrink:0; box-shadow:0 4px 10px rgba(14,165,233,0.3);">
                  ${window.renderIcon('play')}
                </div>
                <div>
                  <div style="font-size:0.75rem; text-transform:uppercase; letter-spacing:0.06em; color:var(--color-teal-action); font-weight:800;">Continue Where You Left Off</div>
                  <div style="font-size:0.98rem; font-weight:800; color:var(--text-main);">${resumeCourses[0].title}: ${resumeCourses[0].videoTitle || 'Lecture'}</div>
                  <div style="font-size:0.82rem; color:var(--text-muted); font-weight:600;">${resumeCourses[0].percentage}% Watched (${resumeCourses[0].formattedTime || ''})</div>
                </div>
              </div>
              <div style="display:flex; gap:10px; flex-wrap:wrap;">
                <button class="btn-launch-resource" style="padding:9px 20px; font-size:0.85rem; font-weight:800; background:var(--primary-gradient); color:#fff; border-radius:var(--radius-full); display:inline-flex; align-items:center; gap:6px; cursor:pointer; border:none; box-shadow:0 3px 10px rgba(14,165,233,0.25);" onclick="DashboardMachine.resumeCourse('${resumeCourses[0].id}')">
                  ${window.renderIcon('play')} Resume Course (${resumeCourses[0].percentage}%)
                </button>
                <button class="btn-secondary" style="padding:9px 16px; font-size:0.85rem; font-weight:700; border-radius:var(--radius-full); border:1px solid var(--border-color); background:var(--bg-card); color:var(--text-main); cursor:pointer;" onclick="DashboardMachine.setTab('resume')">
                  Resume Tab (${resumeCourses.length}) &rarr;
                </button>
              </div>
            </div>
          ` : ''}

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
        `}
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
