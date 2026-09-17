/**
 * ============================================================================
 * ANALYTICS PAGE MODULE (MVME Architecture)
 * Layer: View & View Machine (Interactive Charts & Performance Analytics)
 * ============================================================================
 */

(function() {
  // --------------------------------------------------------------------------
  // VIEW MACHINE: Chart.js Lifecycle Management & State
  // --------------------------------------------------------------------------
  let activeCharts = [];

  const AnalyticsMachine = {
    getActiveCharts: function() {
      return activeCharts;
    },
    clearCharts: function() {
      activeCharts.forEach(c => {
        try { c.destroy(); } catch(e) {}
      });
      activeCharts = [];
    },
    attachCharts: function() {
      if (!window.AppState) return;
      if (window.AppState.currentView !== 'analytics' && window.AppState.currentView !== 'dashboard') return;
      if (!window.Chart) return;

      const ctx1 = document.getElementById('weeklyHoursChart');
      if (ctx1) {
        const chart1 = new Chart(ctx1, {
          type: 'bar',
          data: {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            datasets: [{
              label: 'Study Hours',
              data: [3, 4.5, 2, 5, 3.5, 6, 2],
              backgroundColor: '#0b192c',
              borderRadius: 4,
              barThickness: 28
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: false }
            },
            scales: {
              y: {
                beginAtZero: true,
                max: 6,
                ticks: { stepSize: 1 }
              },
              x: {
                grid: { display: false }
              }
            }
          }
        });
        activeCharts.push(chart1);
      }

      const ctx2 = document.getElementById('subjectMasteryChart');
      if (ctx2) {
        const chart2 = new Chart(ctx2, {
          type: 'radar',
          data: {
            labels: ['AI', 'Math', 'Physics', 'CS', 'Ethics', 'Data'],
            datasets: [
              {
                label: 'Mastery',
                data: [80, 50, 60, 75, 40, 70],
                borderColor: '#64748b',
                backgroundColor: 'rgba(100, 116, 139, 0.35)',
                borderWidth: 2,
                pointBackgroundColor: '#64748b',
                pointRadius: 3
              },
              {
                label: 'Interest',
                data: [95, 65, 40, 90, 70, 85],
                borderColor: '#0f766e',
                backgroundColor: 'rgba(15, 118, 110, 0.25)',
                borderWidth: 2,
                pointBackgroundColor: '#0f766e',
                pointRadius: 3
              }
            ]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'bottom',
                labels: { boxWidth: 14, font: { size: 12, weight: 'bold' } }
              }
            },
            scales: {
              r: {
                angleLines: { color: 'rgba(150, 150, 150, 0.2)' },
                grid: { color: 'rgba(150, 150, 150, 0.2)' },
                suggestedMin: 0,
                suggestedMax: 100,
                ticks: { display: false }
              }
            }
          }
        });
        activeCharts.push(chart2);
      }
    }
  };

  // Attach global functions to window
  window.clearCharts = AnalyticsMachine.clearCharts;
  window.attachCharts = AnalyticsMachine.attachCharts;

  // --------------------------------------------------------------------------
  // VIEW: Presentation Templates
  // --------------------------------------------------------------------------
  const AnalyticsView = {
    render: function() {
      return `
        <div class="page-header">
          <h1 class="page-title">${window.renderIcon('trending-up')} Performance & Quiz Interest Analytics</h1>
          <p class="page-subtitle">Track your study patterns and mastery levels across subjects.</p>
        </div>

        <!-- Top Row: Weekly Study Hours & Radar Chart (Matches 7.PNG) -->
        <div class="insights-charts-grid">
          <div class="insight-chart-card">
            <div class="insight-chart-header">
              <div class="insight-chart-title">Weekly Study Hours</div>
              ${window.renderIcon('bar-chart-2')}
            </div>
            <div class="insight-canvas-wrapper">
              <canvas id="weeklyHoursChart"></canvas>
            </div>
          </div>

          <div class="insight-chart-card">
            <div class="insight-chart-header">
              <div class="insight-chart-title">Subject Mastery & Interest Radar</div>
              ${window.renderIcon('target')}
            </div>
            <div class="insight-canvas-wrapper">
              <canvas id="subjectMasteryChart"></canvas>
            </div>
          </div>
        </div>

        <!-- Bottom Section: Conceptual Performance Evaluation (Matches 7.PNG) -->
        <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:20px; flex-wrap:wrap; gap:12px;">
          <h2 style="font-size:1.25rem; font-weight:800; color:var(--text-main); margin:0;">Conceptual Performance Evaluation</h2>
          <button class="btn-run-diagnostic" onclick="window.runDiagnosticEvaluation()">
            ${window.renderIcon('play')} Run Diagnostic Evaluation &gt;
          </button>
        </div>

        <div class="concept-eval-grid">
          <!-- Card 1: Artificial Intelligence -->
          <div class="concept-eval-card">
            <div class="concept-card-header">
              <div class="concept-sq-icon">
                ${window.renderIcon('cpu')}
              </div>
              <div class="concept-card-title">Artificial Intelligence</div>
            </div>
            <div class="mastery-label-row">
              <span>Mastery Level</span>
              <span style="color:var(--color-teal-action); font-weight:800;">85%</span>
            </div>
            <div class="mastery-track">
              <div class="mastery-fill teal" style="width: 85%;"></div>
            </div>
            <div class="ai-guide-box">
              ${window.renderIcon('lightbulb')} <strong>AI Guide:</strong> Solid understanding of neural networks. Focus review on backpropagation algorithms.
            </div>
          </div>

          <!-- Card 2: Computer Science -->
          <div class="concept-eval-card">
            <div class="concept-card-header">
              <div class="concept-sq-icon">
                ${window.renderIcon('code')}
              </div>
              <div class="concept-card-title">Computer Science</div>
            </div>
            <div class="mastery-label-row">
              <span>Mastery Level</span>
              <span style="color:#0f172a; font-weight:800;">72%</span>
            </div>
            <div class="mastery-track">
              <div class="mastery-fill navy" style="width: 72%;"></div>
            </div>
            <div class="ai-guide-box">
              ${window.renderIcon('lightbulb')} <strong>AI Guide:</strong> Good grasp of data structures. Needs more practice with dynamic programming concepts.
            </div>
          </div>

          <!-- Card 3: Advanced Mathematics -->
          <div class="concept-eval-card">
            <div class="concept-card-header">
              <div class="concept-sq-icon">
                ${window.renderIcon('calculator')}
              </div>
              <div class="concept-card-title">Advanced Mathematics</div>
            </div>
            <div class="mastery-label-row">
              <span>Mastery Level</span>
              <span style="color:#64748b; font-weight:800;">60%</span>
            </div>
            <div class="mastery-track">
              <div class="mastery-fill slate" style="width: 60%;"></div>
            </div>
            <div class="ai-guide-box">
              ${window.renderIcon('lightbulb')} <strong>AI Guide:</strong> Action required. Schedule dedicated study time for linear algebra applications.
            </div>
          </div>
        </div>
      `;
    }
  };

  // Export to window
  window.AnalyticsMachine = AnalyticsMachine;
  window.AnalyticsView = AnalyticsView;
  window.renderAnalytics = function() {
    return AnalyticsView.render();
  };
})();
