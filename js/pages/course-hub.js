/**
 * ============================================================================
 * COURSE STUDY MATERIAL HUB PAGE MODULE (MVME Architecture)
 * Layer: View & View Machine (Tiered Course Study Materials & Assignments)
 * ============================================================================
 */

(function() {
  // --------------------------------------------------------------------------
  // VIEW MACHINE: Course Hub Category Tiers & State
  // --------------------------------------------------------------------------
  window.activeCourseCategory = 'Intermediate'; // Default or student active skill level

  const CourseHubMachine = {
    setCategory: function(category) {
      window.activeCourseCategory = category;
      if (window.AppState) window.AppState.notify();
    },
    openMaterial: function(materialId) {
      if (window.AppState) window.AppState.openModal('resource-viewer', materialId);
    },
    takeTierQuiz: function(quizId) {
      if (window.AppState) window.AppState.openModal('quiz', quizId);
    },
    openAssignment: function(assignmentId) {
      if (window.AppState) window.AppState.openModal('submit-assignment', assignmentId);
    }
  };

  // --------------------------------------------------------------------------
  // VIEW: Presentation Templates
  // --------------------------------------------------------------------------
  const CourseHubView = {
    render: function() {
      const state = window.AppState || {};
      const user = state.currentUser || {};
      const isStudent = user.role !== 'admin' && user.id !== 'u-admin';
      const allCourses = (state.data && Array.isArray(state.data._masterCourses) && state.data._masterCourses.length > 0)
        ? state.data._masterCourses
        : ((state.data && Array.isArray(state.data.courses)) ? state.data.courses : ((window.INITIAL_DATA && window.INITIAL_DATA.courses) || []));
      const allResources = (state.data && Array.isArray(state.data._masterResources) && state.data._masterResources.length > 0)
        ? state.data._masterResources
        : ((state.data && Array.isArray(state.data.resources)) ? state.data.resources : ((window.INITIAL_DATA && window.INITIAL_DATA.resources) || []));

      const courses = (isStudent && state.getPersonalizedCourses)
        ? state.getPersonalizedCourses()
        : allCourses;
      if (!courses.length && !allCourses.length) {
        return `
          <div style="margin-bottom:24px;">
            <button onclick="AppState.setView('courses')" style="font-size:0.88rem; font-weight:700; color:var(--color-teal-action); display:flex; align-items:center; gap:6px; margin-bottom:12px;">
              ${window.renderIcon('arrow-left')} Back to All Courses
            </button>
            <div class="widget-card" style="text-align:center; padding:60px 20px;">
              <div style="font-size:2.8rem; margin-bottom:12px;">📚</div>
              <h2 style="font-size:1.35rem; font-weight:800; margin-bottom:8px;">No Courses Available in Study Hub</h2>
              <p style="color:var(--text-muted); max-width:440px; margin:0 auto 20px;">There are currently no courses published. Create a course in the Admin panel or check back later.</p>
              <button class="btn-hero-primary" style="background:var(--primary-gradient); color:#fff; display:inline-flex;" onclick="AppState.setView('courses')">
                Browse Courses
              </button>
            </div>
          </div>
        `;
      }

      const courseId = state.selectedCourseId || (courses[0] && courses[0].id) || (allCourses[0] && allCourses[0].id);
      const course = allCourses.find(c => c.id === courseId) || courses.find(c => c.id === courseId) || allCourses[0];
      const userSkill = (state.currentUser && state.currentUser.skillLevel) || 'Intermediate';

      const courseAssignments = (isStudent && state.getPersonalizedAssignments)
        ? state.getPersonalizedAssignments().filter(a => a.courseId === course.id)
        : ((state.data && state.data.assignments) ? state.data.assignments.filter(a => a.courseId === course.id) : []);
      const submissions = (state.data && state.data.submissions) ? state.data.submissions : [];

      if (!window.activeCourseCategory) window.activeCourseCategory = userSkill;
      const currentCategory = window.activeCourseCategory;

      const tierObj = (!Array.isArray(course.categories) && typeof course.categories === 'object' && course.categories) ? course.categories : (course.tiers || {});

      function getTierMaterials(tierName) {
        if (tierObj[tierName] && Array.isArray(tierObj[tierName].materials) && tierObj[tierName].materials.length > 0) {
          return tierObj[tierName].materials;
        }
        const matched = allResources.filter(r => r.subjectId === course.subjectId && r.level === tierName && (r.format === 'video' || r.contentUrl));
        if (matched.length > 0) {
          return matched.map(m => ({
            id: m.id,
            title: m.title,
            format: m.format || 'video',
            duration: m.duration || '25 mins',
            contentUrl: m.contentUrl
          }));
        }
        return allResources.filter(r => r.subjectId === course.subjectId && (r.format === 'video' || r.contentUrl)).map(m => ({
          id: m.id,
          title: m.title,
          format: m.format || 'video',
          duration: m.duration || '25 mins',
          contentUrl: m.contentUrl
        }));
      }

      const beginnerData = {
        title: (tierObj.Beginner && tierObj.Beginner.title) || 'Beginner Category (5 Questions Quiz)',
        quizId: (tierObj.Beginner && tierObj.Beginner.quizId) || `quiz-${course.subjectId || 'ds'}-beginner`,
        materials: getTierMaterials('Beginner')
      };
      const intermediateData = {
        title: (tierObj.Intermediate && tierObj.Intermediate.title) || 'Intermediate Category (10 Questions Quiz)',
        quizId: (tierObj.Intermediate && tierObj.Intermediate.quizId) || `quiz-${course.subjectId || 'ds'}-intermediate`,
        materials: getTierMaterials('Intermediate')
      };
      const advancedData = {
        title: (tierObj.Advanced && tierObj.Advanced.title) || 'Advanced Category (15 Questions Quiz)',
        quizId: (tierObj.Advanced && tierObj.Advanced.quizId) || `quiz-${course.subjectId || 'ds'}-advanced`,
        materials: getTierMaterials('Advanced')
      };

      const currentCatData = currentCategory === 'Beginner' ? beginnerData : (currentCategory === 'Advanced' ? advancedData : intermediateData);
      const qCount = currentCategory === 'Beginner' ? 5 : (currentCategory === 'Intermediate' ? 10 : 15);

      return `
        <div style="margin-bottom:24px;">
          <button onclick="AppState.setView('courses')" style="font-size:0.88rem; font-weight:700; color:var(--color-teal-action); display:flex; align-items:center; gap:6px; margin-bottom:12px;">
            ${window.renderIcon('arrow-left')} Back to All Courses
          </button>
          
          <div class="hero-card" style="padding:28px;">
            <div class="hero-tag">${window.renderIcon('check-circle')} ENROLLED COURSE STUDY HUB</div>
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
            ${(currentCatData.materials || []).length === 0 ? `
              <div style="padding:24px; text-align:center; color:var(--text-muted); background:var(--bg-surface); border-radius:var(--radius-md); border:1px dashed var(--border-color);">
                <p style="margin:0; font-size:0.9rem;">No video lectures or study materials added to this category tier yet.</p>
              </div>
            ` : (currentCatData.materials || []).map(mat => {
              const matProg = (state.getVideoProgress) ? (state.getVideoProgress(mat.id) || (state.getVideoProgress(course.id) && state.getVideoProgress(course.id).resourceId === mat.id ? state.getVideoProgress(course.id) : null)) : null;
              const matDur = matProg ? Math.max(1, Math.floor(matProg.duration || (window.parseDurationToSeconds ? window.parseDurationToSeconds(mat.duration) : 900))) : 900;
              const matCur = matProg ? Math.max(0, Math.floor(matProg.currentTime || 0)) : 0;
              const calculatedMatPercent = (matProg && matDur > 0) ? Math.min(100, Math.max(0, Math.round((matCur / matDur) * 100))) : (matProg ? matProg.percentage || 0 : 0);
              const hasProg = matProg && calculatedMatPercent > 0;
              return `
                <div class="course-hub-material-row">
                  <div class="course-hub-material-info">
                    <span class="format-badge" style="background:var(--color-teal-light); color:var(--color-teal-action); flex-shrink:0;">${mat.format}</span>
                    <div style="display:flex; flex-direction:column; min-width:0;">
                      <span style="font-weight:700; font-size:0.95rem; overflow-wrap:break-word;">${mat.title}</span>
                      ${hasProg ? `
                        <span style="font-size:0.78rem; color:${calculatedMatPercent >= 100 ? 'var(--color-emerald)' : 'var(--color-amber)'}; font-weight:800; margin-top:2px; display:inline-flex; align-items:center; gap:4px;">
                          ${window.renderIcon(calculatedMatPercent >= 100 ? 'check-circle' : 'clock', 'small-icon')} ${calculatedMatPercent}% Watched (${matProg.formattedTime || ''})
                        </span>
                      ` : ''}
                    </div>
                  </div>
                  <button class="btn-launch-resource" style="padding:8px 16px; font-size:0.82rem; min-height:42px; display:inline-flex; align-items:center; gap:6px;" onclick="AppState.openModal('resource-viewer', { resId: '${mat.id}', courseId: '${course.id}' })">
                    ${window.renderIcon('play')} ${hasProg && calculatedMatPercent < 100 ? `Resume (${calculatedMatPercent}%)` : 'Open Material'}
                  </button>
                </div>
              `;
            }).join('')}
          </div>

          ${(() => {
            const allQuizzes = (state.data && state.data.quizzes && state.data.quizzes.length > 0) ? state.data.quizzes : (window.ALL_SUBJECT_QUIZZES || []);
            const matchedQuiz = allQuizzes.find(q => q.id === currentCatData.quizId || (q.subjectId === course.subjectId && q.level === currentCategory)) || allQuizzes[0];
            if (!matchedQuiz) {
              return `
                <div style="background:var(--bg-surface); border:1px dashed var(--border-color); padding:16px; border-radius:var(--radius-md); width:100%; text-align:center; color:var(--text-muted);">
                  <span style="font-size:0.9rem;">No quiz published for this category yet. Instructors can add one from the Admin Panel.</span>
                </div>
              `;
            }
            const qCountActual = matchedQuiz.questions ? matchedQuiz.questions.length : (matchedQuiz.questionCount || qCount);
            return `
              <div style="background:var(--color-teal-light); border:1px dashed var(--color-teal-action); padding:18px; border-radius:var(--radius-md); display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:14px; width:100%;">
                <div style="flex:1; min-width:200px;">
                  <strong style="font-size:1rem; color:var(--color-teal-action);">${currentCategory} Category Quiz (${qCountActual} Questions)</strong>
                  <p style="font-size:0.85rem; color:var(--text-muted); margin-top:2px;">${matchedQuiz.title}</p>
                </div>
                <button class="btn-launch-resource" style="background:#0f172a; padding:10px 20px; font-size:0.88rem; min-height:44px; display:inline-flex; align-items:center; gap:6px;" onclick="AppState.openModal('quiz', '${matchedQuiz.id}')">
                  ${window.renderIcon('award')} Take ${qCountActual}-Question Quiz
                </button>
              </div>
            `;
          })()}
        </div>

        <!-- Assignments Section -->
        <div class="widget-card" style="margin-bottom:28px; width:100%;">
          <h3 style="font-size:1.2rem; font-weight:800; margin-bottom:14px; color:var(--color-indigo); display:flex; align-items:center; gap:8px;">
            ${window.renderIcon('file-text')} Course Assignments & Projects
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
                            ${window.renderIcon('help-circle', 'small-icon')} ${a.questions.length} Questions (MCQ)
                          </span>
                        ` : ''}
                        ${sub ? (sub.status === 'graded' || sub.score !== undefined ? `
                          <span style="font-size:0.75rem; background:${sub.passed ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)'}; color:${sub.passed ? 'var(--color-emerald)' : 'var(--color-rose)'}; padding:2px 8px; border-radius:var(--radius-full); font-weight:700; display:inline-flex; align-items:center; gap:4px;">
                            ${window.renderIcon('check')} Score: ${sub.score}/${a.points} (${sub.percentage}%) • ${sub.passed ? 'Passed' : 'Needs Practice'}
                          </span>
                        ` : `
                          <span style="font-size:0.75rem; background:rgba(16, 185, 129, 0.12); color:var(--color-emerald); padding:2px 8px; border-radius:var(--radius-full); font-weight:700; display:inline-flex; align-items:center; gap:4px;">
                            ${window.renderIcon('check')} Submitted
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
                      ${sub ? (isMCQ ? window.renderIcon('rotate-ccw') + ' View Results / Retake' : window.renderIcon('edit') + ' Resubmit') : (isMCQ ? window.renderIcon('play') + ' Start Assignment' : window.renderIcon('upload-cloud') + ' Submit Project')}
                    </button>
                  </div>
                `;
              }).join('')}
            </div>
          `}
        </div>
      `;
    }
  };

  // Export to window
  window.CourseHubMachine = CourseHubMachine;
  window.CourseHubView = CourseHubView;
  window.renderCourseHub = function() {
    return CourseHubView.render();
  };
})();
