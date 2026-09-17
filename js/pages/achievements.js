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

        <!-- Section 2: Course Certificates (Matches 6.PNG) -->
        <div style="margin-bottom: 16px;">
          <h2 style="font-size: 1.25rem; font-weight: 800; color: var(--text-main);">Course Certificates</h2>
        </div>

        <div class="course-certs-list">
          <div class="course-cert-row">
            <div class="cert-left-box">
              <div class="cert-code-icon-sq">&lt;&gt;</div>
              <div>
                <div class="cert-row-title">Introduction to Python Programming</div>
                <div class="cert-row-meta">
                  Completed on October 12, 2023 • Grade: 98%
                  <span class="cert-verified-tag">Verified</span>
                </div>
              </div>
            </div>
            <button class="btn-cert-download" onclick="AppState.openModal('certificate', { courseId: 'course-cs-101' })">
              ${window.renderIcon('download')} Certificate
            </button>
          </div>

          <div class="course-cert-row">
            <div class="cert-left-box">
              <div class="cert-code-icon-sq">{}</div>
              <div>
                <div class="cert-row-title">Data Structures and Algorithms</div>
                <div class="cert-row-meta">
                  Completed on November 05, 2023 • Grade: 92%
                  <span class="cert-verified-tag">Verified</span>
                </div>
              </div>
            </div>
            <button class="btn-cert-download" onclick="AppState.openModal('certificate', { courseId: 'course-ai-101' })">
              ${window.renderIcon('download')} Certificate
            </button>
          </div>
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
