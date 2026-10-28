/**
 * ============================================================================
 * ACHIEVEMENTS PAGE MODULE (MVME Architecture)
 * Layer: View & View Machine (Unlocked Badges & Verified Course Certificates)
 * ============================================================================
 */

(function() {
  // --------------------------------------------------------------------------
  // VIEW MACHINE: Achievements State & Actions
  // --------------------------------------------------------------------------
  const AchievementsMachine = {
    viewCertificate: function(courseId) {
      if (window.AppState) {
        window.AppState.openModal('certificate', { courseId: courseId });
      }
    }
  };

  // --------------------------------------------------------------------------
  // VIEW: Presentation Templates
  // --------------------------------------------------------------------------
  const AchievementsView = {
    render: function() {
      const state = window.AppState || {};
      const user = state.currentUser || {};
      const courses = (state.data && state.data.courses) ? state.data.courses : [];
      const enrolledIds = user.enrolledCourseIds || [];
      const fallbackCourses = [
        { id: 'course-ai-101', title: 'Artificial Intelligence & Neural Networks Masterclass', subjectId: 'ds', level: 'Advanced' },
        { id: 'course-cs-101', title: 'Computer Science & Full-Stack Development', subjectId: 'cs', level: 'Intermediate' },
        { id: 'course-math-101', title: 'Mathematics & Advanced Analytics', subjectId: 'math', level: 'Intermediate' },
        { id: 'course-physics-101', title: 'Physics & Quantum Systems', subjectId: 'physics', level: 'Advanced' }
      ];
      const isStudent = user.role !== 'admin' && user.id !== 'u-admin';
      const userInterests = (user && Array.isArray(user.interests)) ? user.interests : [];
      let sourceCourses = (courses && courses.length > 0) ? courses : fallbackCourses;
      if (isStudent && userInterests.length > 0) {
        sourceCourses = sourceCourses.filter(item => userInterests.includes(item.subjectId) || userInterests.includes(item.category));
      }
      const certCourses = [...sourceCourses].sort((a, b) => {
        const aEnrolled = enrolledIds.includes(a.id) ? 1 : 0;
        const bEnrolled = enrolledIds.includes(b.id) ? 1 : 0;
        return bEnrolled - aEnrolled;
      });

      return `
        <div class="page-header">
          <h1 class="page-title">${window.renderIcon('award')} Achievements & Certificates</h1>
          <p class="page-subtitle">Earn badges by completing courses and generate official verified certificates.</p>
        </div>

        <!-- Section 1: Unlocked Badges (Matches 6.PNG) -->
        <div class="badges-section-header">
          <h2 style="font-size: 1.25rem; font-weight: 800; color: var(--text-main);">Unlocked Badges</h2>
          <span class="total-count-badge">Total: 4</span>
        </div>

        <div class="unlocked-badges-row-4">
          <div class="achievement-badge-box">
            <div class="badge-round-icon">
              ${window.renderIcon('rocket')}
            </div>
            <div class="achievement-box-title">Quick Starter</div>
            <div class="achievement-box-desc">Completed first course within 48 hours of enrollment.</div>
          </div>

          <div class="achievement-badge-box">
            <div class="badge-round-icon">
              ${window.renderIcon('bot')}
            </div>
            <div class="achievement-box-title">AI Enrollee</div>
            <div class="achievement-box-desc">Started the first module in the AI Fundamentals path.</div>
          </div>

          <div class="achievement-badge-box">
            <div class="badge-round-icon">
              ${window.renderIcon('flame')}
            </div>
            <div class="achievement-box-title">7 Day Streak</div>
            <div class="achievement-box-desc">Logged in and completed lessons for 7 consecutive days.</div>
          </div>

          <div class="achievement-badge-box">
            <div class="badge-round-icon">
              ${window.renderIcon('award')}
            </div>
            <div class="achievement-box-title">Top 10%</div>
            <div class="achievement-box-desc">Scored in the top 10% on the mid-term assessment.</div>
          </div>
        </div>

        <!-- Section 2: Course Certificates -->
        <div class="cert-widget-header" style="margin-top: 24px; margin-bottom: 16px;">
          <div>
            <h2 style="font-size: 1.25rem; font-weight: 800; color: var(--text-main); margin-bottom:4px;">Course Certificates</h2>
            <p style="color:var(--text-muted); font-size:0.85rem; margin-bottom:0;">Generate and download a professional Certificate of Completion for your active courses.</p>
          </div>
          <span class="cert-count-pill">${certCourses.length} ${certCourses.length === 1 ? 'Certificate' : 'Certificates'}</span>
        </div>

        <div class="course-certs-list cert-scroll-list">
          ${certCourses.map(c => `
            <div class="cert-card-item">
              <div class="cert-card-info">
                <h4 class="cert-card-title" title="${c.title || c.name || 'Certified Course Pathway'}">
                  ${c.title || c.name || 'Certified Course Pathway'}
                </h4>
                <div class="cert-card-meta">
                  <span class="cert-badge-verified">
                    ${window.renderIcon('check-circle-2', 'cert-verified-icon')} Verified Pathway
                  </span>
                  ${c.level ? `<span class="cert-meta-divider">&bull;</span><span class="cert-meta-level">${c.level}</span>` : ''}
                </div>
              </div>
              <button class="btn-cert-action" onclick="AppState.openModal('certificate', { courseId: '${c.id}' })" title="Generate and Download Certificate">
                ${window.renderIcon('file-text')} Certificate
              </button>
            </div>
          `).join('')}
        </div>
      `;
    }
  };

  // Export to window
  window.AchievementsMachine = AchievementsMachine;
  window.AchievementsView = AchievementsView;
  window.renderAchievements = function() {
    return AchievementsView.render();
  };
})();
