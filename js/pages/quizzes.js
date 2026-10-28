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
      const user = state.currentUser || {};
      const isStudent = user.role !== 'admin' && user.id !== 'u-admin';
      const userInterests = (user && Array.isArray(user.interests)) ? user.interests : [];

      let quizzes = (state.data && state.data.quizzes && state.data.quizzes.length > 0)
        ? state.data.quizzes
        : (window.ALL_SUBJECT_QUIZZES || (window.INITIAL_DATA && window.INITIAL_DATA.quizzes) || []);
      let subjects = (state.data && state.data.subjects && state.data.subjects.length > 0)
        ? state.data.subjects
        : (window.INITIAL_DATA && window.INITIAL_DATA.subjects) || [];

      // Guarantee all 6 core subjects are always present in the pool
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

      // Guarantee all 18 core subject category quizzes are present in quizzes pool
      const defaultQuizzes = (window.ALL_SUBJECT_QUIZZES || (window.INITIAL_DATA && window.INITIAL_DATA.quizzes) || []);
      defaultQuizzes.forEach(dq => {
        if (!quizzes.some(q => q.id === dq.id || (q.subjectId === dq.subjectId && q.level === dq.level))) {
          quizzes.push(dq);
        }
      });

      // For students: dynamically personalize by user's current selected interests (queried from Firestore)
      if (isStudent && userInterests.length > 0) {
        quizzes = quizzes.filter(q => window.itemMatchesInterests ? window.itemMatchesInterests(q, userInterests) : (userInterests.includes(q.subjectId) || userInterests.includes(q.category)));
        subjects = subjects.filter(s => window.itemMatchesInterests ? window.itemMatchesInterests(s, userInterests) : userInterests.includes(s.id));

        if (window.activeQuizSubjectFilter && window.activeQuizSubjectFilter !== 'all') {
          const matchesFilter = window.itemMatchesInterests ? window.itemMatchesInterests({ subjectId: window.activeQuizSubjectFilter, id: window.activeQuizSubjectFilter }, userInterests) : userInterests.includes(window.activeQuizSubjectFilter);
          if (!matchesFilter) {
            window.activeQuizSubjectFilter = 'all';
          }
        }
      }

      if (window.activeQuizSubjectFilter && window.activeQuizSubjectFilter !== 'all') {
        quizzes = quizzes.filter(q => window.itemMatchesInterests ? window.itemMatchesInterests(q, [window.activeQuizSubjectFilter]) : (q.subjectId === window.activeQuizSubjectFilter || q.category === window.activeQuizSubjectFilter));
      }

      if (window.activeQuizCategoryFilter && window.activeQuizCategoryFilter !== 'all') {
        quizzes = quizzes.filter(q => q.level === window.activeQuizCategoryFilter);
      }

      if (state.searchQuery && state.searchQuery.trim() !== '') {
        const q = state.searchQuery.toLowerCase().trim();
        quizzes = quizzes.filter(quiz => (quiz.title && quiz.title.toLowerCase().includes(q)) || (quiz.level && quiz.level.toLowerCase().includes(q)));
      }

      return `
        <div class="page-header">
          <h1 class="page-title">${window.renderIcon('award')} Skill Assessment & Interest Quizzes</h1>
          <p class="page-subtitle">${isStudent ? 'Skill assessment quizzes personalized to your selected subject interests.' : '3 Category Tiers for ALL Subjects: <strong>Beginner (5 Questions)</strong>, <strong>Intermediate (10 Questions)</strong>, and <strong>Advanced (15 Questions)</strong>.'}</p>
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
              <h3 style="font-size: 1.25rem; font-weight: 800; margin-bottom: 8px;">No quizzes available for your selected interests yet</h3>
              <p style="color: var(--text-muted); max-width: 480px; margin: 0 auto 18px;">${isStudent ? `No quizzes match your current selected interests (${userInterests.map(i => (window.getSubjectCategoryName ? window.getSubjectCategoryName(i) : i.toUpperCase())).join(', ')}). Update your preferences below to discover quizzes.` : 'There are no quizzes published for this selection yet.'}</p>
              ${isStudent ? `
                <div style="display:flex; justify-content:center; gap:12px; flex-wrap:wrap;">
                  <button class="btn-hero-primary" style="background:var(--primary-gradient); color:#fff; display:inline-flex; align-items:center; gap:8px;" onclick="AppState.openModal('questionnaire')">
                    ${window.renderIcon('edit-3')} Edit Interests
                  </button>
                  <button class="btn-secondary" style="display:inline-flex; align-items:center; gap:8px; padding:10px 18px; border-radius:var(--radius-md); border:1px solid var(--border-color); background:var(--bg-card); color:var(--text-main); font-weight:700; cursor:pointer;" onclick="window.activeQuizSubjectFilter='all'; window.activeQuizCategoryFilter='all'; AppState.notify();">
                    Browse All Quizzes
                  </button>
                </div>
              ` : ''}
            </div>
          ` : quizzes.map(q => {
            const subject = subjects.find(s => s.id === q.subjectId) || { name: q.subjectId || 'General', icon: 'book' };
            const qCount = q.questionCount || (q.questions ? q.questions.length : (q.level === 'Beginner' ? 5 : (q.level === 'Intermediate' ? 10 : 15)));
            const tierClass = (q.level || 'beginner').toLowerCase();
            const timeLimit = q.timeLimitMinutes || (qCount === 5 ? 8 : (qCount === 10 ? 15 : 25));
            const qTags = window.getItemCategories ? window.getItemCategories(q) : (q.categories || (q.category ? [q.category] : []));
            const qTagsHtml = (qTags || []).map(t => `<span style="font-size:0.68rem; font-weight:700; padding:2px 7px; border-radius:10px; background:rgba(99, 102, 241, 0.1); color:var(--primary-600); border:1px solid rgba(99, 102, 241, 0.2);">${t}</span>`).join(' ');

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

                <div style="display:flex; flex-wrap:wrap; gap:4px; margin-bottom:8px;">
                  ${qTagsHtml}
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
