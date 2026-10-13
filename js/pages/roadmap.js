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
      const subjects = (state.data && state.data.subjects) ? state.data.subjects : [];
      const activeSub = (state.activeSubjectFilter && state.activeSubjectFilter !== 'all') ? state.activeSubjectFilter : 'ds';
      const roadmaps = (state.data && state.data.roadmaps) ? state.data.roadmaps : {};
      
      const subCourses = ((state.data && state.data.courses) || []).filter(c => c.subjectId === activeSub);
      const subObj = subjects.find(s => s.id === activeSub) || { name: 'Subject' };
      
      let rawRoadmap = roadmaps[activeSub];
      if (!rawRoadmap && subCourses.length > 0) {
        rawRoadmap = {
          title: `${subObj.name} Mastery Pathway`,
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

      return `
        <div class="page-header">
          <h1 class="page-title">${window.renderIcon('git-branch')} Subject Learning Roadmaps</h1>
          <p class="page-subtitle">Interactive step-by-step visual pathways with milestone completion tracking.</p>
        </div>

        <!-- Subject Selector Pills (Matches 3.PNG) -->
        <div class="filter-pills-bar">
          ${subjects.map(s => `
            <button class="pill-filter-btn ${activeSub === s.id ? 'active' : ''}" onclick="AppState.activeSubjectFilter='${s.id}'; AppState.notify();">
              ${s.name}
            </button>
          `).join('')}
        </div>

        <div class="roadmap-box-container">
          <div class="roadmap-box-title">${(rawRoadmap && rawRoadmap.title) || (subObj.name + ' Learning Pathway')}</div>

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
