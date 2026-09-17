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
      
      const rawRoadmap = roadmaps[activeSub] || {
        title: 'Artificial Intelligence & Deep Learning Pathway',
        nodes: [
          { id: 'node-1', title: '1. Python for AI & Data Wrangling', status: 'completed', desc: 'NumPy arrays, Pandas & Matrix operations', resourceId: 'res-1' },
          { id: 'node-2', title: '2. Artificial Intelligence Core', status: 'in-progress', desc: 'Perceptrons, Gradient Descent & Backpropagation', resourceId: 'res-5' },
          { id: 'node-3', title: '3. Deep Learning & CNNs', status: 'locked', desc: 'Convolutional neural nets & Computer Vision', resourceId: 'res-2' },
          { id: 'node-4', title: '4. Transformers & LLM Architectures', status: 'locked', desc: 'Attention mechanism, BERT, GPT & NLP Models', resourceId: 'res-3' }
        ]
      };

      const completedResourceIds = (state.currentUser && state.currentUser.completedResourceIds) || [];
      const nodes = RoadmapMachine.calculateNodes(rawRoadmap, completedResourceIds);

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
          <div class="roadmap-box-title">${rawRoadmap.title || 'Artificial Intelligence & Deep Learning Pathway'}</div>

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
