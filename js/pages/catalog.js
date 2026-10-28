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
      const tags = window.getItemCategories ? window.getItemCategories(res) : (res.categories || (res.category ? [res.category] : []));
      const tagsHtml = (tags || []).map(t => `<span style="font-size:0.7rem; font-weight:700; padding:2px 8px; border-radius:12px; background:rgba(99, 102, 241, 0.1); color:var(--primary-600); border:1px solid rgba(99, 102, 241, 0.2);">${t}</span>`).join(' ');

      return `
        <div class="resource-card">
          <div class="resource-top-bar">
            <div class="ai-match-badge">
              ${window.renderIcon('cpu')} ${res.matchScore || 95}% AI Match
            </div>
          </div>

          <div style="display:flex; flex-wrap:wrap; gap:4px; margin-bottom:8px;">
            ${tagsHtml}
          </div>

          <h3 class="resource-title" title="${res.title}">${res.title}</h3>
          <p class="resource-desc" title="${res.description || res.summary || ''}">${res.description || res.summary || 'Adaptive multimedia course lesson designed for your skill pathway.'}</p>

          <div class="resource-style-tag" title="${res.reason || 'Adapted for your grade class & style'}">
            ${window.renderIcon('info')} <span>${res.reason || 'Adapted for your grade class & style'}</span>
          </div>

          <div class="resource-meta">
            <div class="resource-meta-item" title="Duration: ${res.duration || '45 mins'}">
              ${window.renderIcon('clock')} <span class="meta-text">${res.duration || '45 mins'}</span>
            </div>
            <div class="resource-meta-item" title="Grade Level: ${res.suitableClass || 'Grade 11-12'}">
              ${window.renderIcon('graduation-cap')} <span class="meta-text">${res.suitableClass || 'Grade 11-12'}</span>
            </div>
            <div class="resource-meta-item" title="Difficulty Level: ${res.level || 'Intermediate'}">
              ${window.renderIcon('bar-chart')} <span class="meta-text">${res.level || 'Intermediate'}</span>
            </div>
          </div>

          <div class="resource-actions">
            <button class="btn-launch-resource" onclick="AppState.openModal('resource-viewer', '${res.id}')" title="Start Lesson">
              ${res.isCompleted ? window.renderIcon('check-circle-2') + ' Review' : window.renderIcon('play-circle') + ' Start Lesson'}
            </button>
            <button class="btn-bookmark ${res.isBookmarked ? 'active' : ''}" onclick="AppState.toggleBookmark('${res.id}')" title="${res.isBookmarked ? 'Remove Bookmark' : 'Bookmark Lesson'}">
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
      const isStudent = user.role !== 'admin' && user.id !== 'u-admin';
      const userInterests = (user && Array.isArray(user.interests)) ? user.interests : [];

      let resources = (isStudent && state.getPersonalizedResources)
        ? state.getPersonalizedResources()
        : ((state.data && state.data.resources) ? state.data.resources : []);

      let subjects = (isStudent && state.getPersonalizedSubjects)
        ? state.getPersonalizedSubjects()
        : ((state.data && state.data.subjects) ? state.data.subjects : []);

      const filteredSubjects = (isStudent && userInterests.length > 0)
        ? subjects.filter(s => window.itemMatchesInterests ? window.itemMatchesInterests(s, userInterests) : userInterests.includes(s.id))
        : subjects;

      if (isStudent && userInterests.length > 0 && filterSub && filterSub !== 'all') {
        const matchesSub = window.itemMatchesInterests ? window.itemMatchesInterests({ subjectId: filterSub, id: filterSub }, userInterests) : userInterests.includes(filterSub);
        if (!matchesSub) {
          filterSub = 'all';
          state.activeSubjectFilter = 'all';
        }
      }

      let items = window.AIEngine ? window.AIEngine.getRecommendations(resources, user, filterSub, 50) : resources;
      if (isStudent && userInterests.length > 0) {
        items = items.filter(i => window.itemMatchesInterests ? window.itemMatchesInterests(i, userInterests) : (userInterests.includes(i.subjectId) || userInterests.includes(i.category)));
      }

      if (state.searchQuery && state.searchQuery.trim() !== '') {
        const q = state.searchQuery.toLowerCase().trim();
        items = items.filter(i => (i.title && i.title.toLowerCase().includes(q)) || (i.description && i.description.toLowerCase().includes(q)));
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
              <h3 style="font-size:1.1rem; font-weight:700; margin-bottom:8px;">No study materials available for your selected interests yet</h3>
              <p style="font-size:0.88rem; margin-bottom:16px;">Modify your interests or reset filters to discover available learning resources.</p>
              <div style="display:flex; justify-content:center; gap:12px; flex-wrap:wrap;">
                ${isStudent ? `
                  <button class="btn-hero-primary" style="background:var(--primary-gradient); color:#fff; display:inline-flex; align-items:center; gap:8px;" onclick="AppState.openModal('questionnaire')">
                    ${window.renderIcon('edit-3')} Edit Interests
                  </button>
                ` : ''}
                <button class="btn-secondary" style="display:inline-flex; align-items:center; gap:8px; padding:10px 18px; border-radius:var(--radius-md); border:1px solid var(--border-color); background:var(--bg-card); color:var(--text-main); font-weight:700; cursor:pointer;" onclick="AppState.activeSubjectFilter='all'; AppState.activeFormatFilter='all'; AppState.notify();">
                  Reset Filters
                </button>
              </div>
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
