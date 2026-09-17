/**
 * ============================================================================
 * LANDING PAGE MODULE (MVME Architecture)
 * Layer: View & View Machine (Unauthenticated Home Experience)
 * ============================================================================
 */

(function() {
  // --------------------------------------------------------------------------
  // VIEW MACHINE: Landing State & Actions
  // --------------------------------------------------------------------------
  const LandingMachine = {
    openRegister: function() {
      if (window.AppState) window.AppState.openModal('register');
    },
    openLogin: function() {
      if (window.AppState) window.AppState.openModal('login');
    },
    toggleTheme: function() {
      if (window.AppState) window.AppState.toggleTheme();
    }
  };

  // --------------------------------------------------------------------------
  // VIEW: Presentation Templates
  // --------------------------------------------------------------------------
  const LandingView = {
    render: function() {
      const state = window.AppState || {};
      const features = (state.data && state.data.landingFeatures) ? state.data.landingFeatures : [];

      return `
        <div style="min-height:100vh; background:var(--bg-page); color:var(--text-main); width:100%; max-width:100%; overflow-x:hidden;">
          <!-- Top Navigation Header -->
          <header class="landing-header">
            <div style="display:flex; align-items:center; gap:10px; min-width:0;">
              <div class="brand-icon" style="flex-shrink:0;">
                ${window.renderIcon('sparkles')}
              </div>
              <div style="min-width:0;">
                <div class="brand-title" style="font-size:1.25rem;">LearnAI Pro</div>
                <div style="font-size:0.68rem; color:var(--text-subtle); font-weight:700; letter-spacing:0.04em;">AI LEARNING PLATFORM</div>
              </div>
            </div>

            <div class="landing-header-actions">
              <button class="theme-toggle-btn" onclick="AppState.toggleTheme()" title="Toggle Light / Dark Mode">
                ${state.theme === 'light' ? window.renderIcon('moon') : window.renderIcon('sun')}
              </button>
              <button class="btn-hero-secondary" style="color:var(--text-main); font-size:0.88rem; padding:8px 16px; min-height:40px;" onclick="AppState.openModal('login')">
                Login
              </button>
              <button class="btn-hero-primary" style="background:var(--primary-gradient); color:#fff; font-size:0.88rem; padding:8px 18px; min-height:40px;" onclick="AppState.openModal('register')">
                Register
              </button>
            </div>
          </header>

          <!-- Hero Section -->
          <section class="landing-hero">
            <div class="landing-hero-badge">
              ${window.renderIcon('cpu')} AI-POWERED PERSONALIZED LEARNING
            </div>

            <h1 class="landing-hero-title">
              Tailored Study Material & Courses Based on Your <span style="background:var(--primary-gradient); -webkit-background-clip:text; -webkit-text-fill-color:transparent;">Learning Style & Goals</span>
            </h1>

            <p class="landing-hero-subtitle">
              Empower your education with adaptive AI recommendations. Complete a short questionnaire to get personalized courses, videos, articles, interactive labs, and post-quiz interest analytics.
            </p>

            <div class="landing-hero-actions">
              <button class="btn-hero-primary" style="background:var(--primary-gradient); color:#fff; font-size:1.05rem; padding:12px 30px; min-height:48px; box-shadow:var(--shadow-colorful);" onclick="AppState.openModal('register')">
                ${window.renderIcon('sparkles')} Start Learning
              </button>
              <button class="btn-hero-secondary" style="color:var(--text-main); font-size:1rem; padding:12px 24px; min-height:48px; border:1px solid var(--border-color);" onclick="AppState.openModal('login')">
                ${window.renderIcon('log-in')} Student / Admin Login
              </button>
            </div>
          </section>

          <!-- Features Section Grid -->
          <section class="landing-features-section">
            <div style="text-align:center; margin-bottom:40px;">
              <h2 style="font-size:clamp(1.5rem, 3vw, 2.2rem); font-weight:800; margin-bottom:8px;">Why Choose LearnAI Pro?</h2>
              <p style="color:var(--text-muted); font-size:0.95rem;">Designed to optimize your learning journey with adaptive artificial intelligence.</p>
            </div>

            <div class="landing-features-grid">
              ${features.map(f => `
                <div class="stat-card" style="padding:24px 20px; flex-direction:column; align-items:flex-start; text-align:left;">
                  <div class="stat-icon-wrapper" style="background:var(--primary-gradient); width:52px; height:52px; margin-bottom:14px; flex-shrink:0;">
                    ${window.renderIcon(f.icon)}
                  </div>
                  <h3 style="font-size:1.15rem; font-weight:800; margin-bottom:8px;">${f.title}</h3>
                  <p style="font-size:0.88rem; color:var(--text-muted); line-height:1.5;">${f.desc}</p>
                </div>
              `).join('')}
            </div>
          </section>
        </div>
      `;
    }
  };

  // Export to window
  window.LandingMachine = LandingMachine;
  window.LandingView = LandingView;
  window.renderLandingPage = function() {
    return LandingView.render();
  };
})();
