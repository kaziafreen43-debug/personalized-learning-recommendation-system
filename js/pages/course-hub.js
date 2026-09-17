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
            ${(currentCatData.materials || []).map(mat => `
              <div class="course-hub-material-row">
                <div class="course-hub-material-info">
                  <span class="format-badge" style="background:var(--color-teal-light); color:var(--color-teal-action); flex-shrink:0;">${mat.format}</span>
                  <span style="font-weight:700; font-size:0.95rem; min-width:0; overflow-wrap:break-word;">${mat.title}</span>
                </div>
                <button class="btn-launch-resource" style="padding:8px 16px; font-size:0.82rem; min-height:42px; display:inline-flex; align-items:center; gap:6px;" onclick="AppState.openModal('resource-viewer', '${mat.id}')">
                  ${window.renderIcon('play')} Open Material
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
              ${window.renderIcon('award')} Take ${qCount}-Question Quiz
            </button>
          </div>
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
