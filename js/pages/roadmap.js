/**
 * ============================================================================
 * ROADMAP PAGE MODULE (MVME Architecture)
 * Layer: View & View Machine (Interactive Visual Subject Pathways)
 * ============================================================================
 */

(function() {
  // --------------------------------------------------------------------------
  // VIEW MACHINE: Roadmap State & Node Status Calculator
  // --------------------------------------------------------------------------
  const RoadmapMachine = {
    calculateNodes: function(rawRoadmap, completedResourceIds) {
      let firstIncompleteFound = false;
      return (rawRoadmap.nodes || []).map((node, idx) => {
        let status = node.status;
        if (completedResourceIds.includes(node.resourceId) || idx === 0) {
          status = 'completed';
        } else if (!firstIncompleteFound) {
          status = 'in-progress';
          firstIncompleteFound = true;
        } else {
          status = 'locked';
        }
        return { ...node, status };
      });
    },
    selectSubject: function(subjectId) {
      if (window.AppState) {
        window.AppState.activeSubjectFilter = subjectId;
        window.AppState.notify();
      }
    }
  };

  // --------------------------------------------------------------------------
  // VIEW: Presentation Templates
  // --------------------------------------------------------------------------
  const RoadmapView = {
    render: function() {
      const state = window.AppState || {};
      const user = state.currentUser || {};
      const isStudent = user.role !== 'admin' && user.id !== 'u-admin';
      const userInterests = (user && Array.isArray(user.interests)) ? user.interests : [];

      const subjects = (isStudent && state.getPersonalizedSubjects)
        ? state.getPersonalizedSubjects()
        : ((state.data && state.data.subjects) ? state.data.subjects : []);

      let activeSub = state.activeSubjectFilter;
      if (isStudent && userInterests.length > 0) {
        const matchesActive = subjects.some(s => s.id === activeSub);
        if (!activeSub || activeSub === 'all' || !matchesActive) {
          activeSub = subjects[0] ? subjects[0].id : userInterests[0];
        }
      } else if (!activeSub || activeSub === 'all') {
        activeSub = subjects[0] ? subjects[0].id : 'ds';
      }

      const roadmaps = (state.data && state.data.roadmaps) ? state.data.roadmaps : {};
      
      const subCourses = ((state.data && state.data.courses) || []).filter(c => window.itemMatchesInterests ? window.itemMatchesInterests(c, [activeSub]) : (c.subjectId === activeSub || c.category === activeSub));
      const subObj = subjects.find(s => s.id === activeSub) || { name: (window.getSubjectCategoryName ? window.getSubjectCategoryName(activeSub) : 'Subject') };
      
      let rawRoadmap = roadmaps[activeSub];
      if (!rawRoadmap) {
        const rmList = Object.values(roadmaps);
        rawRoadmap = rmList.find(rm => window.itemMatchesInterests ? window.itemMatchesInterests(rm, [activeSub]) : (rm.subjectId === activeSub || rm.category === activeSub));
      }
      if (!rawRoadmap && subCourses.length > 0) {
        rawRoadmap = {
          title: `${subObj.name} Mastery Pathway`,
          subjectId: activeSub,
          category: subObj.name,
          categories: [subObj.name],
          tags: [subObj.name],
          nodes: subCourses.map((c, idx) => ({
            id: `node-${c.id}`,
            title: `${idx + 1}. ${c.title}`,
            status: idx === 0 ? 'in-progress' : 'locked',
            desc: c.description || 'Course milestone curriculum & quizzes',
            resourceId: c.id
          }))
        };
      }

      const completedResourceIds = (state.currentUser && state.currentUser.completedResourceIds) || [];
      const nodes = rawRoadmap ? RoadmapMachine.calculateNodes(rawRoadmap, completedResourceIds) : [];
      const rmTags = rawRoadmap ? (window.getItemCategories ? window.getItemCategories(rawRoadmap) : (rawRoadmap.categories || [rawRoadmap.category || subObj.name])) : [];

      return `
        <div class="page-header">
          <h1 class="page-title">${window.renderIcon('git-branch')} Subject Learning Roadmaps</h1>
          <p class="page-subtitle">${isStudent ? 'Visual learning pathways tailored to your active subject interests.' : 'Interactive step-by-step visual pathways with milestone completion tracking.'}</p>
        </div>

        ${subjects.length === 0 ? `
          <div class="widget-card" style="text-align: center; padding: 50px 20px;">
            <div style="font-size: 2.5rem; margin-bottom: 12px;">🗺️</div>
            <h3 style="font-size: 1.25rem; font-weight: 800; margin-bottom: 8px;">No roadmaps available for your selected interests yet</h3>
            <p style="color: var(--text-muted); max-width: 480px; margin: 0 auto 18px;">We currently have no learning pathways matching your selected interests. Modify your preferences to discover pathways.</p>
            <div style="display:flex; justify-content:center; gap:12px; flex-wrap:wrap;">
              <button class="btn-hero-primary" style="background:var(--primary-gradient); color:#fff; display:inline-flex; align-items:center; gap:8px;" onclick="AppState.openModal('questionnaire')">
                ${window.renderIcon('edit-3')} Edit Interests
              </button>
            </div>
          </div>
        ` : `
          <!-- Subject Selector Pills (Matches 3.PNG) -->
          <div class="filter-pills-bar">
            ${subjects.map(s => `
              <button class="pill-filter-btn ${activeSub === s.id ? 'active' : ''}" onclick="AppState.activeSubjectFilter='${s.id}'; AppState.notify();">
                ${s.name}
              </button>
            `).join('')}
          </div>

          <div class="roadmap-box-container">
            <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px; margin-bottom:12px;">
              <div class="roadmap-box-title" style="margin-bottom:0;">${(rawRoadmap && rawRoadmap.title) || (subObj.name + ' Learning Pathway')}</div>
              <div style="display:flex; gap:6px; flex-wrap:wrap;">
                ${rmTags.map(t => `<span style="font-size:0.72rem; font-weight:700; padding:3px 10px; border-radius:12px; background:rgba(99, 102, 241, 0.12); color:var(--primary-600); border:1px solid rgba(99, 102, 241, 0.2);">${t}</span>`).join('')}
              </div>
            </div>

          ${nodes.length === 0 ? `
            <div style="text-align:center; padding:48px 20px; color:var(--text-muted);">
              <div style="font-size:2.2rem; margin-bottom:8px;">🗺️</div>
              <h3 style="font-size:1.15rem; font-weight:800; margin-bottom:6px;">No Roadmap Milestones Yet</h3>
              <p style="font-size:0.88rem; max-width:400px; margin:0 auto;">Publish courses under this subject in the Admin panel to automatically generate this learning pathway.</p>
            </div>
          ` : `
            <div class="roadmap-steps-vertical">
              ${nodes.map(node => `
                <div class="roadmap-step-row">
                  <div class="step-node-circle ${node.status}">
                  ${node.status === 'completed' ? window.renderIcon('check') : (node.status === 'in-progress' ? window.renderIcon('play') : window.renderIcon('lock'))}
                </div>
                <div class="step-card-box ${node.status === 'in-progress' ? 'in-progress-border' : ''}">
                  <div>
                    <div class="step-card-title">${node.title}</div>
                    <div class="step-card-desc">${node.desc}</div>
                  </div>
                  <div>
                    ${node.status === 'completed' ? `
                      <button class="btn-node-action dark" onclick="AppState.openModal('resource-viewer', '${node.resourceId}')">
                        Review Node Material
                      </button>
                    ` : (node.status === 'in-progress' ? `
                      <button class="btn-node-action teal" onclick="AppState.openModal('resource-viewer', '${node.resourceId}')">
                        Continue Node Material
                      </button>
                    ` : `
                      <button class="btn-node-action locked" disabled>
                        Locked Node
                      </button>
                    `)}
                  </div>
                </div>
              </div>
            `).join('')}
            </div>
          `}
        </div>
        `}
      `;
    }
  };

  // Export to window
  window.RoadmapMachine = RoadmapMachine;
  window.RoadmapView = RoadmapView;
  window.renderRoadmap = function() {
    return RoadmapView.render();
  };
})();
