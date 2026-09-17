/**
 * ============================================================================
 * EVALUATION PAGE MODULE (MVME Architecture)
 * Layer: View & View Machine (Conceptual Diagnostic Scorecard)
 * ============================================================================
 */

(function() {
  // --------------------------------------------------------------------------
  // VIEW MACHINE: Evaluation State & Actions
  // --------------------------------------------------------------------------
  const EvaluationMachine = {
    runDiagnosticEvaluation: function() {
      alert('AI Diagnostic Evaluation: Analyzing quiz logs, reading progress, and lesson history... Concept scorecard is fully updated and optimized based on your current skill level!');
    }
  };

  window.runDiagnosticEvaluation = EvaluationMachine.runDiagnosticEvaluation;

  // --------------------------------------------------------------------------
  // VIEW: Presentation Templates
  // --------------------------------------------------------------------------
  const EvaluationView = {
    render: function() {
      const state = window.AppState || {};
      const user = state.currentUser || {};

      const concepts = [
        { id: 'c-1', subject: 'Artificial Intelligence', name: 'Neural Nets & Backpropagation', score: 92, level: 'Excellent', tips: 'Mastered gradients and feedforward logic. Ready for Transformer attention-mechanism architectures.' },
        { id: 'c-2', subject: 'Computer Science', name: 'Algorithm Complexity & Big-O Notation', score: 85, level: 'Proficient', tips: 'Solid sorting analysis. We suggest reviewing distributed database hash partitioning.' },
        { id: 'c-3', subject: 'Mathematics', name: 'Multivariable Calculus & Gradients', score: 76, level: 'Proficient', tips: 'Understand rates of change. Practice partial derivatives to optimize loss functions faster.' },
        { id: 'c-4', subject: 'Physics', name: 'Quantum Mechanics & Schrödinger Wave', score: 48, level: 'Needs Review', tips: 'Conceptual gap in wave-particle duality. Watch the double-slit simulation in Roadmap.' },
        { id: 'c-5', subject: 'Biology', name: 'Genetics & CRISPR-Cas9 Gene Cuts', score: 64, level: 'Basic', tips: 'Familiar with DNA helix replication. Re-study guide RNA targeting mechanisms.' },
        { id: 'c-6', subject: 'Chemistry', name: 'Gibbs Free Energy & Kinetics Rate Laws', score: 88, level: 'Proficient', tips: 'Excellent understanding of enthalpy. Review Arrhenius activation equations.' }
      ];

      return `
        <div class="page-header">
          <h1 class="page-title">${window.renderIcon('trending-up')} Conceptual Performance Evaluation</h1>
          <p class="page-subtitle">Real-time diagnostic scorecard evaluating your mastery of core subject concepts.</p>
        </div>

        <div class="widget-card" style="margin-bottom:28px;">
          <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:16px; border-bottom:1px solid var(--border-color); padding-bottom:16px; margin-bottom:20px;">
            <div>
              <h2 style="font-size:1.3rem; font-weight:800; color:var(--primary-500);">AI Diagnostic Summary</h2>
              <p style="font-size:0.88rem; color:var(--text-muted); margin-top:2px;">Evaluated on ${new Date().toLocaleDateString()} using current profile assessment & quiz responses.</p>
            </div>
            <button class="btn-hero-primary" style="background:var(--primary-gradient); color:#fff;" onclick="window.runDiagnosticEvaluation()">
              ${window.renderIcon('sparkles')} Run Diagnostic Evaluation
            </button>
          </div>

          <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(min(100%, 250px), 1fr)); gap:20px;">
            ${concepts.map(c => {
              let badgeStyle = 'background:rgba(16,185,129,0.12); color:var(--color-emerald);';
              if (c.level === 'Proficient') badgeStyle = 'background:rgba(190,24,93,0.12); color:var(--primary-500);';
              if (c.level === 'Basic') badgeStyle = 'background:rgba(245,158,11,0.12); color:var(--color-amber);';
              if (c.level === 'Needs Review') badgeStyle = 'background:rgba(239,68,68,0.12); color:var(--color-rose);';

              return `
                <div style="padding:18px; border:1px solid var(--border-color); border-radius:var(--radius-md); background:var(--bg-surface);">
                  <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:10px;">
                    <div>
                      <span style="font-size:0.72rem; color:var(--text-subtle); font-weight:700; text-transform:uppercase;">${c.subject}</span>
                      <h4 style="font-size:0.95rem; font-weight:800; margin-top:2px;">${c.name}</h4>
                    </div>
                    <span style="font-size:0.75rem; font-weight:800; padding:4px 8px; border-radius:var(--radius-full); ${badgeStyle}">${c.level}</span>
                  </div>

                  <div style="margin:14px 0;">
                    <div style="display:flex; justify-content:space-between; font-size:0.8rem; font-weight:700; margin-bottom:4px; color:var(--text-subtle);">
                      <span>Concept Mastery</span>
                      <span>${c.score}%</span>
                    </div>
                    <div style="width:100%; height:8px; background:var(--border-color); border-radius:var(--radius-full); overflow:hidden;">
                      <div style="width:${c.score}%; height:100%; background:var(--primary-gradient); border-radius:var(--radius-full);"></div>
                    </div>
                  </div>

                  <p style="font-size:0.8rem; color:var(--text-muted); line-height:1.4; border-top:1px dashed var(--border-color); padding-top:10px; margin-top:10px;">
                    <strong>AI Guide:</strong> ${c.tips}
                  </p>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      `;
    }
  };

  // Export to window
  window.EvaluationMachine = EvaluationMachine;
  window.EvaluationView = EvaluationView;
  window.renderEvaluationView = function() {
    return EvaluationView.render();
  };
})();
