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
      const filterSub = state.activeSubjectFilter || 'all';
      const filterFmt = state.activeFormatFilter || 'all';
      const isStudent = user.role !== 'admin' && user.id !== 'u-admin';
      const userInterests = (user && Array.isArray(user.interests)) ? user.interests : [];

      const allResources = (state.data && Array.isArray(state.data._masterResources) && state.data._masterResources.length > 0)
        ? state.data._masterResources
        : ((state.data && Array.isArray(state.data.resources)) ? state.data.resources : ((window.INITIAL_DATA && window.INITIAL_DATA.resources) || []));

      const allSubjects = (state.data && Array.isArray(state.data.subjects) && state.data.subjects.length > 0)
        ? state.data.subjects
        : ((window.INITIAL_DATA && window.INITIAL_DATA.subjects) || []);

      let items = [...allResources];

      // 1. Filter by subject
      if (filterSub && filterSub !== 'all') {
        items = items.filter(r => {
          if (r.subjectId === filterSub) return true;
          if (window.normalizeCategoryKey && window.normalizeCategoryKey(r.subjectId) === filterSub) return true;
          if (window.normalizeCategoryKey && window.normalizeCategoryKey(r.category) === filterSub) return true;
          return false;
        });
      }

      // 2. Filter by format
      if (filterFmt && filterFmt !== 'all') {
        items = items.filter(i => i.format === filterFmt);
      }

      // 3. Filter by search query (supports all 6 subjects: Physics, Chemistry, Biology, Maths, AI-ML, Data Science)
      if (state.searchQuery && state.searchQuery.trim() !== '') {
        items = items.filter(i => window.resourceMatchesSearch ? window.resourceMatchesSearch(i, state.searchQuery) : true);
      }

      // 4. Calculate AI match scores and status
      items = items.map(res => {
        const matchScore = window.AIEngine ? window.AIEngine.calculateMatchScore(res, user) : 95;
        const isCompleted = user && user.completedResourceIds ? user.completedResourceIds.includes(res.id) : false;
        const isBookmarked = user && user.bookmarkedResourceIds ? user.bookmarkedResourceIds.includes(res.id) : false;

        let reason = `Recommended for ${user.gradeClass || 'your grade'}`;
        if (user.preferredStyle && res.vark && res.vark.includes(user.preferredStyle)) {
          reason = `Matches your ${user.preferredStyle.toUpperCase()} learning style`;
        } else if (userInterests.length > 0 && window.itemMatchesInterests && window.itemMatchesInterests(res, userInterests)) {
          reason = `Matches your subject interest`;
        }

        return {
          ...res,
          matchScore: isCompleted ? Math.round(matchScore * 0.75) : matchScore,
          isCompleted: isCompleted,
          isBookmarked: isBookmarked,
          reason: reason
        };
      });

      // 5. Sort: items matching user interests or higher match score first
      items.sort((a, b) => {
        if (!state.searchQuery && filterSub === 'all' && userInterests.length > 0 && window.itemMatchesInterests) {
          const aMatch = window.itemMatchesInterests(a, userInterests) ? 1 : 0;
          const bMatch = window.itemMatchesInterests(b, userInterests) ? 1 : 0;
          if (aMatch !== bMatch) return bMatch - aMatch;
        }
        return (b.matchScore || 0) - (a.matchScore || 0);
      });

      return `
        <div class="page-header">
          <h1 class="page-title">${window.renderIcon('book-open')} Resource Catalog & Study Materials</h1>
          <p class="page-subtitle">Filter by subject, format, VARK style suitability, and skill level.</p>
        </div>

        <div style="display:flex; gap:16px; flex-wrap:wrap; margin-bottom:24px;">
          <div class="subject-tabs">
            <button class="tab-btn ${filterSub === 'all' ? 'active' : ''}" onclick="AppState.activeSubjectFilter='all'; AppState.notify();">All Subjects</button>
            ${allSubjects.map(s => `
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
              <h3 style="font-size:1.1rem; font-weight:700; margin-bottom:8px;">No study materials match your search or filter criteria</h3>
              <p style="font-size:0.88rem; margin-bottom:16px;">Try adjusting your search terms, selecting another subject, or resetting all filters.</p>
              <div style="display:flex; justify-content:center; gap:12px; flex-wrap:wrap;">
                <button class="btn-hero-primary" style="background:var(--primary-gradient); color:#fff; display:inline-flex; align-items:center; gap:8px;" onclick="AppState.searchQuery=''; AppState.activeSubjectFilter='all'; AppState.activeFormatFilter='all'; AppState.notify();">
                  ${window.renderIcon('rotate-ccw')} Reset Filters & Show All
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
