/**
 * ============================================================================
 * RESOURCE CATALOG PAGE MODULE (MVME Architecture)
 * Layer: View & View Machine (Study Material Catalog & AI Recommendations)
 * ============================================================================
 */

(function() {
  // --------------------------------------------------------------------------
  // VIEW MACHINE: Catalog Filters & Bookmark Actions
  // --------------------------------------------------------------------------
  const CatalogMachine = {
    setSubjectFilter: function(subId) {
      if (window.AppState) {
        window.AppState.activeSubjectFilter = subId;
        window.AppState.notify();
      }
    },
    setFormatFilter: function(format) {
      if (window.AppState) {
        window.AppState.activeFormatFilter = format;
        window.AppState.notify();
      }
    },
    resetFilters: function() {
      if (window.AppState) {
        window.AppState.activeSubjectFilter = 'all';
        window.AppState.activeFormatFilter = 'all';
        window.AppState.notify();
      }
    },
    toggleBookmark: function(resourceId) {
      if (window.AppState) {
        window.AppState.toggleBookmark(resourceId);
      }
    },
    openResource: function(resourceId) {
      if (window.AppState) {
        window.AppState.openModal('resource-viewer', resourceId);
      }
    }
  };

  // --------------------------------------------------------------------------
  // VIEW: Presentation Templates
  // --------------------------------------------------------------------------
  const CatalogView = {
    renderCard: function(res) {
      const state = window.AppState || {};
      const subjects = (state.data && state.data.subjects) ? state.data.subjects : [];
      const subject = subjects.find(s => s.id === res.subjectId) || { name: res.subjectId || 'Subject', color: '#6366f1' };

      return `
        <div class="resource-card">
          <div class="resource-top-bar">
            <div class="ai-match-badge">
              ${window.renderIcon('cpu')} ${res.matchScore || 95}% AI Match
            </div>
          </div>

          <h3 class="resource-title" style="margin-top: 8px;">${res.title}</h3>
          <p class="resource-desc">${res.description || res.summary}</p>

          <div style="font-size:0.75rem; color:var(--color-purple); font-weight:700; margin-bottom:12px; display:flex; align-items:center; gap:4px;">
            ${window.renderIcon('info')} ${res.reason || 'Adapted for your grade class & style'}
          </div>

          <div class="resource-meta" style="margin-bottom: 20px;">
            <div class="resource-meta-item">${window.renderIcon('clock')} ${res.duration}</div>
            <div class="resource-meta-item">${window.renderIcon('graduation-cap')} ${res.suitableClass || 'Grade 11-12'}</div>
            <div class="resource-meta-item">${window.renderIcon('bar-chart')} ${res.level}</div>
          </div>

          <div class="resource-actions">
            <button class="btn-launch-resource" onclick="AppState.openModal('resource-viewer', '${res.id}')">
              ${res.isCompleted ? window.renderIcon('check-circle-2') + ' Review' : window.renderIcon('play-circle') + ' Start Lesson'}
            </button>
            <button class="btn-bookmark ${res.isBookmarked ? 'active' : ''}" onclick="AppState.toggleBookmark('${res.id}')" title="Bookmark">
              ${window.renderIcon('bookmark')}
            </button>
          </div>
        </div>
      `;
    },

    render: function() {
      const state = window.AppState || {};
      const user = state.currentUser || {};
      const filterSub = state.activeSubjectFilter;
      const filterFmt = state.activeFormatFilter;
      const resources = (state.data && state.data.resources) ? state.data.resources : [];
      const subjects = (state.data && state.data.subjects) ? state.data.subjects : [];

      const userInterests = (state.currentUser && state.currentUser.interests) ? state.currentUser.interests : [];
      const filteredSubjects = userInterests.length > 0 ? subjects.filter(s => userInterests.includes(s.id)) : subjects;

      let items = window.AIEngine ? window.AIEngine.getRecommendations(resources, user, filterSub, 50) : resources;

      if (state.searchQuery && state.searchQuery.trim() !== '') {
        const q = state.searchQuery.toLowerCase();
        items = items.filter(i => i.title.toLowerCase().includes(q) || (i.description && i.description.toLowerCase().includes(q)));
      }
      if (filterFmt && filterFmt !== 'all') {
        items = items.filter(i => i.format === filterFmt);
      }

      return `
        <div class="page-header">
          <h1 class="page-title">${window.renderIcon('book-open')} Resource Catalog & Study Materials</h1>
          <p class="page-subtitle">Filter by subject, format, VARK style suitability, and skill level.</p>
        </div>

        <div style="display:flex; gap:16px; flex-wrap:wrap; margin-bottom:24px;">
          <div class="subject-tabs">
            <button class="tab-btn ${filterSub === 'all' ? 'active' : ''}" onclick="AppState.activeSubjectFilter='all'; AppState.notify();">All Subjects</button>
            ${filteredSubjects.map(s => `
              <button class="tab-btn ${filterSub === s.id ? 'active' : ''}" onclick="AppState.activeSubjectFilter='${s.id}'; AppState.notify();">${s.name}</button>
            `).join('')}
          </div>

          <div class="subject-tabs">
            <button class="tab-btn ${filterFmt === 'all' ? 'active' : ''}" onclick="AppState.activeFormatFilter='all'; AppState.notify();">All Formats</button>
            <button class="tab-btn ${filterFmt === 'video' ? 'active' : ''}" onclick="AppState.activeFormatFilter='video'; AppState.notify();">Videos</button>
            <button class="tab-btn ${filterFmt === 'article' ? 'active' : ''}" onclick="AppState.activeFormatFilter='article'; AppState.notify();">Articles</button>
            <button class="tab-btn ${filterFmt === 'exercise' ? 'active' : ''}" onclick="AppState.activeFormatFilter='exercise'; AppState.notify();">Labs & Exercises</button>
          </div>
        </div>

        <div class="resource-grid">
          ${items.length > 0 ? items.map(res => CatalogView.renderCard(res)).join('') : `
            <div style="grid-column: 1 / -1; padding:40px; text-align:center; color:var(--text-muted); background:var(--bg-card); border-radius:var(--radius-lg); border:1px solid var(--border-color);">
              <h3 style="font-size:1.1rem; font-weight:700; margin-bottom:8px;">No materials found for this exact filter combination</h3>
              <p style="font-size:0.88rem; margin-bottom:16px;">Click below to reset filters and view all available study materials.</p>
              <button class="btn-hero-primary" style="background:var(--primary-gradient); color:#fff; display:inline-flex;" onclick="AppState.activeSubjectFilter='all'; AppState.activeFormatFilter='all'; AppState.notify();">
                Reset Filters
              </button>
            </div>
          `}
        </div>
      `;
    }
  };

  // Export to window
  window.CatalogMachine = CatalogMachine;
  window.CatalogView = CatalogView;
  window.renderCatalog = function() {
    return CatalogView.render();
  };
  window.renderResourceCard = function(res) {
    return CatalogView.renderCard(res);
  };
})();
