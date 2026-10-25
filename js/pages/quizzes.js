/**
 * ============================================================================
 * QUIZZES PAGE MODULE (MVME Architecture)
 * Layer: View & View Machine (Skill Assessment & Tiered Interest Quizzes)
 * ============================================================================
 */

(function() {
  // --------------------------------------------------------------------------
  // VIEW MACHINE: Quizzes Category & Subject Filters
  // --------------------------------------------------------------------------
  window.activeQuizCategoryFilter = 'all';
  window.activeQuizSubjectFilter = 'all';

  const QuizzesMachine = {
    setCategoryFilter: function(category) {
      window.activeQuizCategoryFilter = category;
      if (window.AppState) window.AppState.notify();
    },
    setSubjectFilter: function(subjectId) {
      window.activeQuizSubjectFilter = subjectId;
      if (window.AppState) window.AppState.notify();
    },
    startQuiz: function(quizId) {
      if (window.AppState) window.AppState.openModal('quiz', quizId);
    }
  };

  // --------------------------------------------------------------------------
  // VIEW: Presentation Templates
  // --------------------------------------------------------------------------
  const QuizzesView = {
    render: function() {
      const state = window.AppState || {};
      let quizzes = (state.data && state.data.quizzes && state.data.quizzes.length > 0)
        ? state.data.quizzes
        : (window.ALL_SUBJECT_QUIZZES || (window.INITIAL_DATA && window.INITIAL_DATA.quizzes) || []);
      let subjects = (state.data && state.data.subjects && state.data.subjects.length > 0)
        ? state.data.subjects
        : (window.INITIAL_DATA && window.INITIAL_DATA.subjects) || [];

      // Guarantee all 6 core subjects are always present in the filter pills
      const coreSubjects = (window.INITIAL_DATA && window.INITIAL_DATA.subjects && window.INITIAL_DATA.subjects.length > 0)
        ? window.INITIAL_DATA.subjects
        : [
            { id: 'cs', name: 'Computer Science & Software', icon: 'code', color: '#6366f1' },
            { id: 'ds', name: 'Artificial Intelligence & Data Science', icon: 'cpu', color: '#8b5cf6' },
            { id: 'math', name: 'Mathematics & Analytics', icon: 'calculator', color: '#ec4899' },
            { id: 'physics', name: 'Physics & Quantum Systems', icon: 'zap', color: '#f59e0b' },
            { id: 'bio', name: 'Biology & Biotechnology', icon: 'dna', color: '#10b981' },
            { id: 'chem', name: 'Chemistry & Molecules', icon: 'flask-conical', color: '#06b6d4' }
          ];
      coreSubjects.forEach(cs => {
        if (!subjects.some(s => s.id === cs.id)) {
          subjects.push(cs);
        }
      });

      // Guarantee all 18 core subject category quizzes are present in quizzes array
      const defaultQuizzes = (window.ALL_SUBJECT_QUIZZES || (window.INITIAL_DATA && window.INITIAL_DATA.quizzes) || []);
      defaultQuizzes.forEach(dq => {
        if (!quizzes.some(q => q.id === dq.id || (q.subjectId === dq.subjectId && q.level === dq.level))) {
          quizzes.push(dq);
        }
      });

      if (window.activeQuizSubjectFilter && window.activeQuizSubjectFilter !== 'all') {
        quizzes = quizzes.filter(q => q.subjectId === window.activeQuizSubjectFilter);
      }

      if (window.activeQuizCategoryFilter && window.activeQuizCategoryFilter !== 'all') {
        quizzes = quizzes.filter(q => q.level === window.activeQuizCategoryFilter);
      }

      return `
        <div class="page-header">
          <h1 class="page-title">${window.renderIcon('award')} Skill Assessment & Interest Quizzes</h1>
          <p class="page-subtitle">3 Category Tiers for ALL Subjects: <strong>Beginner (5 Questions)</strong>, <strong>Intermediate (10 Questions)</strong>, and <strong>Advanced (15 Questions)</strong>.</p>
        </div>

        <div style="display:flex; flex-direction:column; gap:12px; margin-bottom:24px;">
          <!-- Row 1: Subject Filter Pills -->
          <div class="filter-pills-bar" style="margin-bottom:0;">
            <button class="pill-filter-btn ${window.activeQuizSubjectFilter === 'all' ? 'active' : ''}" onclick="window.activeQuizSubjectFilter='all'; AppState.notify();">
              All Subjects
            </button>
            ${subjects.map(s => `
              <button class="pill-filter-btn ${window.activeQuizSubjectFilter === s.id ? 'active' : ''}" onclick="window.activeQuizSubjectFilter='${s.id}'; AppState.notify();">
                ${s.name}
              </button>
            `).join('')}
          </div>

          <!-- Row 2: Category Filter Pills (Matches 4.PNG) -->
          <div class="filter-pills-bar" style="margin-bottom:0;">
            <button class="pill-filter-btn ${window.activeQuizCategoryFilter === 'all' ? 'active' : ''}" onclick="window.activeQuizCategoryFilter='all'; AppState.notify();">
              All Categories
            </button>
            <button class="pill-filter-btn ${window.activeQuizCategoryFilter === 'Beginner' ? 'active' : ''}" onclick="window.activeQuizCategoryFilter='Beginner'; AppState.notify();">
              <span class="category-dot teal"></span> Beginner (5 Questions)
            </button>
            <button class="pill-filter-btn ${window.activeQuizCategoryFilter === 'Intermediate' ? 'active' : ''}" onclick="window.activeQuizCategoryFilter='Intermediate'; AppState.notify();">
              <span class="category-dot yellow"></span> Intermediate (10 Questions)
            </button>
            <button class="pill-filter-btn ${window.activeQuizCategoryFilter === 'Advanced' ? 'active' : ''}" onclick="window.activeQuizCategoryFilter='Advanced'; AppState.notify();">
              <span class="category-dot red"></span> Advanced (15 Questions)
            </button>
          </div>
        </div>

        <div class="quizzes-grid-2x2">
          ${quizzes.length === 0 ? `
            <div class="widget-card" style="grid-column: 1 / -1; text-align: center; padding: 48px 20px;">
              <div style="font-size: 2.5rem; margin-bottom: 12px;">🏆</div>
              <h3 style="font-size: 1.25rem; font-weight: 800; margin-bottom: 8px;">No Quizzes Available Yet</h3>
              <p style="color: var(--text-muted); max-width: 440px; margin: 0 auto;">There are no quizzes published for this selection yet.</p>
            </div>
          ` : quizzes.map(q => {
            const subject = subjects.find(s => s.id === q.subjectId) || { name: q.subjectId || 'General', icon: 'book' };
            const qCount = q.questionCount || (q.questions ? q.questions.length : (q.level === 'Beginner' ? 5 : (q.level === 'Intermediate' ? 10 : 15)));
            const tierClass = (q.level || 'beginner').toLowerCase();
            const timeLimit = q.timeLimitMinutes || (qCount === 5 ? 8 : (qCount === 10 ? 15 : 25));

            return `
              <div class="quiz-card-clean">
                <div class="quiz-card-top-row">
                  <div class="quiz-tier-badge ${tierClass}">
                    ${q.level} • ${qCount} Questions
                  </div>
                  <div class="quiz-card-duration">
                    ${window.renderIcon('clock')} ${timeLimit} Mins
                  </div>
                </div>

                <div class="quiz-card-title">${q.title}</div>
                <div class="quiz-card-subject" style="display:flex; align-items:center; gap:6px;">
                  ${window.renderIcon(subject.icon || 'book')} Subject: <strong>${subject.name}</strong> • ${qCount} Questions Assessment
                </div>

                <button class="btn-start-quiz-navy" onclick="AppState.openModal('quiz', '${q.id}')">
                  ${window.renderIcon('play-circle')} Start ${qCount}-Question Quiz
                </button>
              </div>
            `;
          }).join('')}
        </div>
      `;
    }
  };

  // Export to window
  window.QuizzesMachine = QuizzesMachine;
  window.QuizzesView = QuizzesView;
  window.renderQuizzes = function() {
    return QuizzesView.render();
  };
})();
