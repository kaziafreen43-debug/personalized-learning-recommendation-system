/**
 * ============================================================================
 * ADMIN PANEL PAGE MODULE (MVME Architecture)
 * Layer: View & View Machine (Curriculum, Video, Dynamic MCQ Assignment Builder, Submissions)
 * ============================================================================
 */

(function() {
  // --------------------------------------------------------------------------
  // VIEW MACHINE: Admin State & Handlers
  // --------------------------------------------------------------------------
  window.activeAdminTab = 'courses';

  window.handleCreateSubjectSubmit = function(e) {
    e.preventDefault();
    const form = e.target;
    const subId = form.subId.value.trim().toLowerCase();
    const name = form.name.value.trim();
    const icon = form.icon.value.trim() || 'book';
    const color = form.color.value.trim() || '#8b5cf6';
    const description = form.description.value.trim();

    if (!subId || !name || !description) {
      alert("Please fill in Subject ID, Name, and Description.");
      return;
    }

    const state = window.AppState;
    const existing = state.data.subjects ? state.data.subjects.find(s => s.id === subId) : null;
    if (existing) {
      alert(`Subject with ID "${subId}" already exists!`);
      return;
    }

    const newSubject = {
      id: subId,
      name: name,
      icon: icon,
      color: color,
      description: description
    };

    window.AppState.addSubject(newSubject);
    alert(`Subject "${name}" successfully created and saved dynamically!`);
    form.reset();
    AppState.notify();
  };

  window.handleCreateCourseSubmit = function(e) {
    e.preventDefault();
    const form = e.target;
    const courseObj = {
      title: form.title.value.trim(),
      subjectId: form.subjectId.value,
      instructor: form.instructor.value.trim() || 'AI Faculty',
      prerequisites: form.prerequisites.value.trim() || 'None',
      duration: form.duration.value ? `${form.duration.value} Weeks` : '8 Weeks',
      description: form.description.value.trim(),
      bannerImage: form.bannerImage.value.trim() || 'https://images.unsplash.com/photo-1677442136019-21780efad99a?w=800'
    };
    if (!courseObj.title || !courseObj.description) {
      alert("Please enter a course title and description.");
      return;
    }
    if (!courseObj.subjectId || courseObj.subjectId === 'ADD_NEW_SUBJECT') {
      alert("Please select a valid subject for the course.");
      return;
    }
    window.AppState.addCourse(courseObj);
    alert(`Course "${courseObj.title}" successfully created and saved dynamically to Firebase!`);
    form.reset();
    window.activeAdminTab = 'course-directory';
    window.AppState.notify();
  };

  window.handleDeleteCourse = function(courseId) {
    const courses = (window.AppState.data && window.AppState.data.courses) ? window.AppState.data.courses : [];
    const c = courses.find(item => item.id === courseId);
    const title = c ? c.title : 'this course';
    if (confirm(`Are you sure you want to permanently delete course "${title}"?`)) {
      window.AppState.deleteCourse(courseId);
      window.AppState.notify();
    }
  };

  window.handleRegisterVideoSubmit = function(e) {
    e.preventDefault();
    const form = e.target;
    const courseId = form.courseId.value;
    const tier = form.tier.value;
    const title = form.title.value.trim();
    const contentUrl = form.contentUrl.value.trim();
    const duration = form.duration.value.trim() || '15 mins';
    const description = form.description.value.trim();

    if (!courseId || !title || !contentUrl) {
      alert("Please fill in Course, Title, and Video URL.");
      return;
    }
    window.AppState.addVideoToCourse(courseId, tier, title, description, contentUrl, duration);
    alert("Video material successfully added to course and synced with Firebase!");
    form.reset();
  };

  // ==========================================================================
  // DYNAMIC QUIZ BUILDER & HANDLERS (Admin Side)
  // ==========================================================================
  window.quizSubView = 'list';
  window.quizBuilder = {
    title: '',
    subjectId: '',
    level: 'Beginner',
    timeLimitMinutes: 10,
    questions: [
      {
        id: 'q-1',
        question: '',
        options: ['', '', '', ''],
        correctIndex: 0,
        explanation: ''
      }
    ]
  };

  window.initQuizBuilderState = function() {
    window.quizBuilder = {
      title: '',
      subjectId: (window.AppState && window.AppState.data && window.AppState.data.subjects && window.AppState.data.subjects[0]) ? window.AppState.data.subjects[0].id : 'ds',
      level: 'Beginner',
      timeLimitMinutes: 10,
      questions: [
        {
          id: 'q-' + Date.now() + '-1',
          question: '',
          options: ['', '', '', ''],
          correctIndex: 0,
          explanation: ''
        }
      ]
    };
  };

  window.addQuizQuestionField = function() {
    if (!window.quizBuilder) window.initQuizBuilderState();
    window.quizBuilder.questions.push({
      id: 'q-' + Date.now() + '-' + (window.quizBuilder.questions.length + 1),
      question: '',
      options: ['', '', '', ''],
      correctIndex: 0,
      explanation: ''
    });
    AppState.notify();
  };

  window.removeQuizQuestionField = function(index) {
    if (!window.quizBuilder || window.quizBuilder.questions.length <= 1) {
      alert("A quiz must have at least one question.");
      return;
    }
    window.quizBuilder.questions.splice(index, 1);
    AppState.notify();
  };

  window.handleCreateQuizSubmit = function(e) {
    e.preventDefault();
    const form = e.target;
    const title = form.quizTitle.value.trim();
    const subjectId = form.quizSubjectId.value;
    const level = form.quizLevel.value;
    const timeLimit = parseInt(form.quizTimeLimit.value) || 10;

    if (!title || !subjectId) {
      alert("Please fill in Quiz Title and select a valid Subject.");
      return;
    }

    const questions = [];
    const qCards = form.querySelectorAll('.admin-quiz-q-card');
    qCards.forEach((card, idx) => {
      const qInput = card.querySelector(`input[name="q_text_${idx}"]`);
      const qText = qInput ? qInput.value.trim() : '';
      const opt0 = (card.querySelector(`input[name="q_opt_${idx}_0"]`)?.value || '').trim();
      const opt1 = (card.querySelector(`input[name="q_opt_${idx}_1"]`)?.value || '').trim();
      const opt2 = (card.querySelector(`input[name="q_opt_${idx}_2"]`)?.value || '').trim();
      const opt3 = (card.querySelector(`input[name="q_opt_${idx}_3"]`)?.value || '').trim();
      const corrSel = card.querySelector(`select[name="q_correct_${idx}"]`);
      const corrIdx = corrSel ? parseInt(corrSel.value) : 0;
      const expInput = card.querySelector(`input[name="q_exp_${idx}"]`);
      const explanation = expInput ? expInput.value.trim() : '';

      if (qText) {
        questions.push({
          id: `q_${Date.now()}_${idx}`,
          question: qText,
          options: [opt0 || 'Option 1', opt1 || 'Option 2', opt2 || 'Option 3', opt3 || 'Option 4'],
          correctIndex: corrIdx,
          explanation: explanation || 'Correct answer assessment.'
        });
      }
    });

    if (questions.length === 0) {
      alert("Please enter at least one question with text.");
      return;
    }

    const quizObj = {
      id: 'quiz-' + Date.now(),
      title: title,
      subjectId: subjectId,
      level: level,
      questionCount: questions.length,
      timeLimitMinutes: timeLimit,
      questions: questions,
      createdAt: new Date().toISOString()
    };

    AppState.addQuiz(quizObj);
    alert(`Quiz "${title}" created and synced dynamically to Firebase!`);
    window.initQuizBuilderState();
    window.quizSubView = 'list';
    AppState.notify();
  };

  window.handleDeleteQuiz = function(quizId) {
    const quizzes = (AppState.data && AppState.data.quizzes) ? AppState.data.quizzes : [];
    const q = quizzes.find(item => item.id === quizId);
    const title = q ? q.title : 'this quiz';
    if (confirm(`Are you sure you want to permanently delete quiz "${title}"?`)) {
      AppState.deleteQuiz(quizId);
      AppState.notify();
    }
  };

  // ==========================================================================
  // DYNAMIC MCQ ASSIGNMENT BUILDER (Admin Side)
  // ==========================================================================
  window.assignmentBuilder = {
    editingId: null,
    courseId: '',
    title: '',
    points: 100,
    description: '',
    questions: [
      {
        id: 'q-' + Date.now() + '-1',
        text: '',
        options: ['', '', '', ''],
        correctAnswer: 0
      }
    ]
  };

  window.draggedQuestionIndex = null;

  window.initAssignmentBuilderState = function(defaultCourseId) {
    if (!window.assignmentBuilder) {
      window.assignmentBuilder = {
        editingId: null,
        courseId: defaultCourseId || '',
        title: '',
        points: 100,
        description: '',
        questions: []
      };
    }
    if (!window.assignmentBuilder.courseId && defaultCourseId) {
      window.assignmentBuilder.courseId = defaultCourseId;
    }
    if (!window.assignmentBuilder.questions || window.assignmentBuilder.questions.length === 0) {
      window.assignmentBuilder.questions = [
        {
          id: 'q-' + Date.now() + '-1',
          text: '',
          options: ['', '', '', ''],
          correctAnswer: 0
        }
      ];
    }
  };

  window.updateBuilderField = function(field, val) {
    if (!window.assignmentBuilder) window.initAssignmentBuilderState();
    window.assignmentBuilder[field] = val;
  };

  window.updateQuestionText = function(qIdx, text) {
    if (window.assignmentBuilder && window.assignmentBuilder.questions && window.assignmentBuilder.questions[qIdx]) {
      window.assignmentBuilder.questions[qIdx].text = text;
    }
  };

  window.updateOptionText = function(qIdx, optIdx, text) {
    if (window.assignmentBuilder && window.assignmentBuilder.questions && window.assignmentBuilder.questions[qIdx]) {
      if (!window.assignmentBuilder.questions[qIdx].options) {
        window.assignmentBuilder.questions[qIdx].options = ['', '', '', ''];
      }
      window.assignmentBuilder.questions[qIdx].options[optIdx] = text;
    }
  };

  window.setCorrectOption = function(qIdx, optIdx) {
    if (!window.assignmentBuilder || !window.assignmentBuilder.questions || !window.assignmentBuilder.questions[qIdx]) return;
    window.assignmentBuilder.questions[qIdx].correctAnswer = optIdx;

    // Immediately update option rows inside this card
    const card = document.querySelector(`.mcq-builder-card[data-qindex="${qIdx}"]`);
    if (card) {
      const rows = card.querySelectorAll('.mcq-option-row');
      rows.forEach((row, idx) => {
        const isSelected = idx === optIdx;
        row.classList.toggle('is-correct', isSelected);
        const radioBtn = row.querySelector('.mcq-radio-btn');
        if (radioBtn) {
          radioBtn.innerHTML = isSelected ? window.renderIcon('check', 'small-icon') : '';
        }
        let tag = row.querySelector('.mcq-correct-tag');
        if (isSelected) {
          if (!tag) {
            tag = document.createElement('span');
            tag.className = 'mcq-correct-tag';
            tag.innerHTML = `${window.renderIcon('check', 'small-icon')} Correct Answer`;
            row.appendChild(tag);
          }
        } else {
          if (tag) tag.remove();
        }
      });
    }
  };

  window.addQuestionToBuilder = function(afterIndex) {
    if (!window.assignmentBuilder) window.initAssignmentBuilderState();
    const newQ = {
      id: 'q-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
      text: '',
      options: ['', '', '', ''],
      correctAnswer: 0
    };
    if (afterIndex !== undefined && afterIndex !== null && afterIndex >= 0) {
      window.assignmentBuilder.questions.splice(afterIndex + 1, 0, newQ);
    } else {
      window.assignmentBuilder.questions.push(newQ);
    }
    window.refreshAssignmentBuilderQuestions();

    setTimeout(() => {
      const targetIdx = (afterIndex !== undefined && afterIndex !== null && afterIndex >= 0) ? afterIndex + 1 : window.assignmentBuilder.questions.length - 1;
      const targetCard = document.querySelector(`.mcq-builder-card[data-qindex="${targetIdx}"]`);
      if (targetCard) {
        targetCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
        const input = targetCard.querySelector('input[type="text"]');
        if (input) input.focus();
      }
    }, 60);
  };

  window.deleteQuestionFromBuilder = function(qIdx) {
    if (!window.assignmentBuilder || !window.assignmentBuilder.questions) return;
    if (window.assignmentBuilder.questions.length <= 1) {
      alert("An assignment must have at least one question. You cannot delete the only question.");
      return;
    }
    window.assignmentBuilder.questions.splice(qIdx, 1);
    window.refreshAssignmentBuilderQuestions();
  };

  window.moveQuestionInBuilder = function(fromIdx, toIdx) {
    if (!window.assignmentBuilder || !window.assignmentBuilder.questions) return;
    const questions = window.assignmentBuilder.questions;
    if (toIdx < 0 || toIdx >= questions.length) return;
    const item = questions.splice(fromIdx, 1)[0];
    questions.splice(toIdx, 0, item);
    window.refreshAssignmentBuilderQuestions();
  };

  window.handleQuestionDragStart = function(e, index) {
    window.draggedQuestionIndex = index;
    e.dataTransfer.effectAllowed = 'move';
    try {
      e.dataTransfer.setData('text/plain', String(index));
    } catch (err) {}
    const card = e.currentTarget.closest('.mcq-builder-card');
    if (card) {
      setTimeout(() => card.classList.add('dragging'), 0);
    }
  };

  window.handleQuestionDragOver = function(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    const card = e.currentTarget.closest('.mcq-builder-card');
    if (card && !card.classList.contains('dragging')) {
      card.classList.add('drag-over');
    }
  };

  window.handleQuestionDragLeave = function(e) {
    const card = e.currentTarget.closest('.mcq-builder-card');
    if (card) {
      card.classList.remove('drag-over');
    }
  };

  window.handleQuestionDrop = function(e, targetIndex) {
    e.preventDefault();
    const card = e.currentTarget.closest('.mcq-builder-card');
    if (card) card.classList.remove('drag-over');
    if (window.draggedQuestionIndex !== null && window.draggedQuestionIndex !== targetIndex) {
      window.moveQuestionInBuilder(window.draggedQuestionIndex, targetIndex);
    }
    window.draggedQuestionIndex = null;
  };

  window.handleQuestionDragEnd = function(e) {
    const cards = document.querySelectorAll('.mcq-builder-card');
    cards.forEach(c => {
      c.classList.remove('dragging');
      c.classList.remove('drag-over');
    });
    window.draggedQuestionIndex = null;
  };

  window.renderAssignmentBuilderQuestionsHtml = function() {
    const questions = (window.assignmentBuilder && window.assignmentBuilder.questions) ? window.assignmentBuilder.questions : [];
    const letters = ['A', 'B', 'C', 'D'];
    return questions.map((q, qIdx) => {
      return `
        <div class="mcq-builder-card" data-qindex="${qIdx}" ondragover="window.handleQuestionDragOver(event)" ondragleave="window.handleQuestionDragLeave(event)" ondrop="window.handleQuestionDrop(event, ${qIdx})">
          <div class="mcq-card-header">
            <div class="mcq-card-title-wrap">
              <div class="mcq-drag-handle" draggable="true" ondragstart="window.handleQuestionDragStart(event, ${qIdx})" ondragend="window.handleQuestionDragEnd(event)" title="Drag up or down to reorder question">
                ⋮⋮
              </div>
              <span class="mcq-question-badge">
                Question ${qIdx + 1}
              </span>
              <div class="mcq-reorder-group">
                <button type="button" class="btn-reorder-arrow" title="Move Up" onclick="window.moveQuestionInBuilder(${qIdx}, ${qIdx - 1})" ${qIdx === 0 ? 'disabled' : ''}>
                  ▲
                </button>
                <button type="button" class="btn-reorder-arrow" title="Move Down" onclick="window.moveQuestionInBuilder(${qIdx}, ${qIdx + 1})" ${qIdx === questions.length - 1 ? 'disabled' : ''}>
                  ▼
                </button>
              </div>
            </div>
            <div class="mcq-card-actions">
              <button type="button" class="btn-delete-q" onclick="window.deleteQuestionFromBuilder(${qIdx})" title="Delete this question">
                ${window.renderIcon('trash-2', 'small-icon')} Delete Question
              </button>
            </div>
          </div>

          <div class="mcq-form-group">
            <label class="mcq-field-label">Question Text</label>
            <input type="text" id="q-text-${qIdx}" class="mcq-input-control" value="${window.escapeHtmlAttr(q.text || '')}" placeholder="e.g. What is AI?" oninput="window.updateQuestionText(${qIdx}, this.value)">
          </div>

          <div class="mcq-options-container">
            <div class="mcq-options-header">
              <span class="mcq-options-hint">Options & Correct Answer (Select radio button for correct answer):</span>
              <span class="mcq-options-limit">Only 1 option can be correct</span>
            </div>
            ${letters.map((letter, optIdx) => {
              const isCorrect = q.correctAnswer === optIdx;
              const optVal = (q.options && q.options[optIdx]) ? q.options[optIdx] : '';
              return `
                <div class="mcq-option-row ${isCorrect ? 'is-correct' : ''}" data-optindex="${optIdx}">
                  <button type="button" class="mcq-radio-btn" onclick="window.setCorrectOption(${qIdx}, ${optIdx})" title="Mark Option ${letter} as Correct">
                    ${isCorrect ? window.renderIcon('check', 'small-icon') : ''}
                  </button>
                  <div class="mcq-option-badge">${letter}</div>
                  <input type="text" id="q-opt-${qIdx}-${optIdx}" class="mcq-option-input" value="${window.escapeHtmlAttr(optVal)}" placeholder="Option ${letter} answer text..." oninput="window.updateOptionText(${qIdx}, ${optIdx}, this.value)">
                  ${isCorrect ? `<span class="mcq-correct-tag">${window.renderIcon('check', 'small-icon')} Correct Answer</span>` : ''}
                </div>
              `;
            }).join('')}
          </div>

          <button type="button" class="btn-add-next-q" onclick="window.addQuestionToBuilder(${qIdx})">
            ➕ Add Next Question
          </button>
        </div>
      `;
    }).join('');
  };

  window.refreshAssignmentBuilderQuestions = function() {
    const container = document.getElementById('mcqQuestionsBuilderList');
    if (container) {
      container.innerHTML = window.renderAssignmentBuilderQuestionsHtml();
    }
    const badge = document.getElementById('builderQuestionsCountBadge');
    if (badge) {
      const count = window.assignmentBuilder.questions ? window.assignmentBuilder.questions.length : 0;
      badge.textContent = `${count} Question${count === 1 ? '' : 's'}`;
    }
  };

  window.handleSaveAssignmentBuilder = function(e) {
    if (e) e.preventDefault();
    const b = window.assignmentBuilder;
    if (!b) return;

    // Sync top inputs if in DOM
    const form = document.getElementById('mcqAssignmentBuilderForm');
    if (form) {
      if (form.courseId) b.courseId = form.courseId.value;
      if (form.title) b.title = form.title.value.trim();
      if (form.points) b.points = Number(form.points.value) || 100;
      if (form.description) b.description = form.description.value.trim();
    }

    if (!b.courseId) {
      alert("Please select a Target Course.");
      return;
    }
    if (!b.title) {
      alert("Please enter an Assignment Title.");
      const el = document.getElementById('assignmentBuilderTitleInput');
      if (el) el.focus();
      return;
    }
    if (!b.description) {
      alert("Please provide Instructions & Criteria for the assignment.");
      const el = document.getElementById('assignmentBuilderDescInput');
      if (el) el.focus();
      return;
    }
    if (!b.questions || b.questions.length === 0) {
      alert("Please add at least one question to the assignment.");
      return;
    }

    for (let i = 0; i < b.questions.length; i++) {
      const q = b.questions[i];
      if (!q.text || !q.text.trim()) {
        alert(`Question ${i + 1} text cannot be empty.`);
        const input = document.getElementById(`q-text-${i}`);
        if (input) {
          input.focus();
          input.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        return;
      }
      for (let j = 0; j < 4; j++) {
        const optVal = q.options ? q.options[j] : '';
        if (!optVal || !optVal.trim()) {
          alert(`Question ${i + 1}, Option ${String.fromCharCode(65 + j)} cannot be empty.`);
          const optInput = document.getElementById(`q-opt-${i}-${j}`);
          if (optInput) {
            optInput.focus();
            optInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
          return;
        }
      }
    }

    if (b.editingId) {
      window.AppState.updateAssignment(b.editingId, {
        courseId: b.courseId,
        title: b.title,
        description: b.description,
        points: b.points,
        questions: b.questions
      });
      alert(`Assignment "${b.title}" updated successfully!`);
    } else {
      window.AppState.addAssignment(b.courseId, b.title, b.description, b.points, b.questions);
      alert(`Assignment "${b.title}" successfully created with ${b.questions.length} MCQ questions!`);
    }

    window.resetAssignmentBuilder();
    window.AppState.notify();
  };

  window.editAssignmentInBuilder = function(assignmentId) {
    const state = window.AppState;
    const a = (state.data && state.data.assignments) ? state.data.assignments.find(item => item.id === assignmentId) : null;
    if (!a) return;

    window.assignmentBuilder = {
      editingId: a.id,
      courseId: a.courseId,
      title: a.title,
      points: a.points || 100,
      description: a.description || '',
      questions: (a.questions && a.questions.length > 0) ? JSON.parse(JSON.stringify(a.questions)) : [
        {
          id: 'q-' + Date.now() + '-1',
          text: '',
          options: ['', '', '', ''],
          correctAnswer: 0
        }
      ]
    };

    window.activeAdminTab = 'assignments';
    window.AppState.notify();

    setTimeout(() => {
      const builderCard = document.getElementById('mcqAssignmentBuilderCard');
      if (builderCard) {
        builderCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 60);
  };

  window.resetAssignmentBuilder = function() {
    const state = window.AppState;
    const courses = (state.data && state.data.courses) ? state.data.courses : [];
    window.assignmentBuilder = {
      editingId: null,
      courseId: courses[0] ? courses[0].id : '',
      title: '',
      points: 100,
      description: '',
      questions: [
        {
          id: 'q-' + Date.now() + '-1',
          text: '',
          options: ['', '', '', ''],
          correctAnswer: 0
        }
      ]
    };
    window.AppState.notify();
  };

  window.deleteAssignmentConfirm = function(assignmentId) {
    const a = (window.AppState.data && window.AppState.data.assignments) ? window.AppState.data.assignments.find(item => item.id === assignmentId) : null;
    const title = a ? a.title : 'this assignment';
    if (confirm(`Are you sure you want to permanently delete "${title}"?`)) {
      window.AppState.deleteAssignment(assignmentId);
      if (window.assignmentBuilder && window.assignmentBuilder.editingId === assignmentId) {
        window.resetAssignmentBuilder();
      } else {
        window.AppState.notify();
      }
    }
  };

  window.viewMCQSubmissionBreakdown = function(assignmentId, userId) {
    const state = window.AppState;
    const a = (state.data && state.data.assignments) ? state.data.assignments.find(item => item.id === assignmentId) : null;
    const sub = (state.data && state.data.submissions) ? state.data.submissions.find(item => item.assignmentId === assignmentId && item.userId === userId) : null;
    if (!a || !sub) {
      alert("Submission details not found.");
      return;
    }
    window.activeMCQBreakdownData = { assignment: a, submission: sub };
    window.AppState.openModal('mcq-admin-breakdown', { assignmentId, userId });
  };

  window.deleteResourceConfirm = function(resourceId) {
    const state = window.AppState;
    const res = (state.data && state.data.resources) ? state.data.resources.find(r => r.id === resourceId) : null;
    const title = res ? res.title : 'this resource';
    if (confirm(`Are you sure you want to permanently delete "${title}" from the global resource catalog?`)) {
      state.deleteResource(resourceId);
    }
  };

  window.previewAdminResource = function(resourceId) {
    const state = window.AppState;
    const res = (state.data && state.data.resources) ? state.data.resources.find(r => r.id === resourceId) : null;
    if (!res) return;
    if (res.contentUrl && (res.contentUrl.includes('youtube.com') || res.contentUrl.includes('youtu.be') || res.format === 'video')) {
      state.openModal('resource-viewer', res.id);
    } else if (res.contentUrl) {
      window.open(res.contentUrl, '_blank');
    } else {
      state.openModal('resource-viewer', res.id);
    }
  };

  window.deleteSubjectConfirm = function(subjectId) {
    const state = window.AppState;
    const s = (state.data && state.data.subjects) ? state.data.subjects.find(item => item.id === subjectId) : null;
    const name = s ? s.name : subjectId;
    if (confirm(`Are you sure you want to permanently delete the subject "${name}" (${subjectId})?`)) {
      state.deleteSubject(subjectId);
    }
  };

  // --------------------------------------------------------------------------
  // VIEW: Presentation Templates
  // --------------------------------------------------------------------------
  const AdminView = {
    render: function() {
      const state = window.AppState || {};
      const resources = (state.data && state.data.resources) ? state.data.resources : [];
      const courses = (state.data && state.data.courses) ? state.data.courses : [];
      const subjects = (state.data && state.data.subjects) ? state.data.subjects : [];
      const assignments = (state.data && state.data.assignments) ? state.data.assignments : [];
      
      // Students list fetched dynamically from Firebase Firestore / state
      let rawStudents = (state.data && state.data.students && state.data.students.length > 0)
        ? state.data.students
        : ((state.data && state.data.defaultUsers) ? state.data.defaultUsers : []);

      if (!rawStudents || rawStudents.length <= 1) {
        try {
          const mockDB = JSON.parse(localStorage.getItem('plr_firestore_mock') || '{}');
          if (mockDB.users && Object.keys(mockDB.users).length > 0) {
            rawStudents = [...(rawStudents || []), ...Object.values(mockDB.users)];
          }
        } catch (_) {}
      }
      
      const legacyMockIds = ['u-1', 'u-2', 'u-3', 'u-4', 'u-5', 'u-6', 'u-7', 'u-8'];
      const students = rawStudents.filter(u => u && u.role !== 'admin' && u.id !== 'u-admin' && (u.email || '').toLowerCase() !== 'admin@gmail.com' && !legacyMockIds.includes(u.id));

      // Dynamic metrics calculation
      const totalRegisteredStudents = students.length;
      const totalActiveStudents = students.filter(s => (s.streakDays > 0) || (s.completedResourceIds && s.completedResourceIds.length > 0) || (s.enrolledCourseIds && s.enrolledCourseIds.length > 0)).length;
      const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
      const totalNewStudents = students.filter(s => {
        if (!s.createdAt) return true;
        const t = new Date(s.createdAt).getTime();
        return !isNaN(t) && t >= sevenDaysAgo;
      }).length;

      let activeTabContent = '';

      if (window.activeAdminTab === 'courses') {
        activeTabContent = `
          <div class="widget-card" style="max-width:680px; margin:0 auto; width:100%;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px; flex-wrap:wrap; gap:10px;">
              <div>
                <h2 style="font-size:1.25rem; font-weight:800; display:flex; align-items:center; gap:8px; margin:0;">
                  ${window.renderIcon('plus-circle')} Create New Course
                </h2>
                <p style="font-size:0.84rem; color:var(--text-muted); margin-top:4px; margin-bottom:0;">
                  Publish dynamic courses to the platform catalog and student curriculum.
                </p>
              </div>
              <button type="button" class="btn-table-action" style="padding:7px 14px; font-weight:700; border-radius:var(--radius-sm); border:1px solid var(--border-color); background:var(--bg-surface); color:var(--text-main); display:inline-flex; align-items:center; gap:6px;" onclick="window.activeAdminTab='course-directory'; AppState.notify();">
                ${window.renderIcon('graduation-cap', 'small-icon')} Course Directory (${courses.length})
              </button>
            </div>

            <form onsubmit="window.handleCreateCourseSubmit(event)">
              <div style="display:flex; flex-direction:column; gap:14px;">
                <div>
                  <label style="font-size:0.8rem; font-weight:700; display:block; margin-bottom:4px;">Course Title</label>
                  <input type="text" name="title" required placeholder="e.g. Advanced Deep Learning & AI" style="width:100%; padding:11px 12px; border-radius:var(--radius-md); border:1px solid var(--border-color); background:var(--bg-card); color:var(--text-main);">
                </div>
                <div>
                  <label style="font-size:0.8rem; font-weight:700; display:block; margin-bottom:4px;">Subject</label>
                  <select name="subjectId" required style="width:100%; padding:11px 12px; border-radius:var(--radius-md); border:1px solid var(--border-color); background:var(--bg-card); color:var(--text-main);" onchange="if(this.value === 'ADD_NEW_SUBJECT') { window.activeAdminTab = 'subjects'; AppState.notify(); }">
                    <option value="" disabled selected>Select Subject</option>
                    ${subjects.map(s => `<option value="${s.id}">${s.name}</option>`).join('')}
                    <option value="ADD_NEW_SUBJECT" style="color:var(--color-purple); font-weight:700;">+ Add New Subject...</option>
                  </select>
                </div>
                <div class="admin-form-grid-2">
                  <div>
                    <label style="font-size:0.8rem; font-weight:700; display:block; margin-bottom:4px;">Instructor</label>
                    <input type="text" name="instructor" placeholder="e.g. Dr. Alan Turing" style="width:100%; padding:11px 12px; border-radius:var(--radius-md); border:1px solid var(--border-color); background:var(--bg-card); color:var(--text-main);">
                  </div>
                  <div>
                    <label style="font-size:0.8rem; font-weight:700; display:block; margin-bottom:4px;">Duration (Weeks)</label>
                    <input type="number" name="duration" min="1" required placeholder="e.g. 10" style="width:100%; padding:11px 12px; border-radius:var(--radius-md); border:1px solid var(--border-color); background:var(--bg-card); color:var(--text-main);">
                  </div>
                </div>
                <div>
                  <label style="font-size:0.8rem; font-weight:700; display:block; margin-bottom:4px;">Banner Image URL (Optional)</label>
                  <input type="text" name="bannerImage" placeholder="https://images.unsplash.com/photo-..." style="width:100%; padding:11px 12px; border-radius:var(--radius-md); border:1px solid var(--border-color); background:var(--bg-card); color:var(--text-main);">
                </div>
                <div>
                  <label style="font-size:0.8rem; font-weight:700; display:block; margin-bottom:4px;">Prerequisites</label>
                  <input type="text" name="prerequisites" placeholder="e.g. Python Programming, Linear Algebra" style="width:100%; padding:11px 12px; border-radius:var(--radius-md); border:1px solid var(--border-color); background:var(--bg-card); color:var(--text-main);">
                </div>
                <div>
                  <label style="font-size:0.8rem; font-weight:700; display:block; margin-bottom:4px;">Description / Syllabus Summary</label>
                  <textarea name="description" required placeholder="Provide syllabus guidelines and overview..." style="width:100%; height:95px; padding:11px 12px; border-radius:var(--radius-md); border:1px solid var(--border-color); background:var(--bg-card); color:var(--text-main); font-family:inherit; resize:vertical;"></textarea>
                </div>
                <button type="submit" class="btn-hero-primary" style="background:var(--primary-gradient); color:#fff; width:100%; padding:12px; justify-content:center; font-size:0.95rem; font-weight:800; border-radius:var(--radius-md); margin-top:6px;">
                  ${window.renderIcon('plus-circle')} Create Course
                </button>
              </div>
            </form>
          </div>
        `;
      } else if (window.activeAdminTab === 'course-directory') {
        window.courseDirectorySearch = window.courseDirectorySearch || '';
        window.courseDirectorySubject = window.courseDirectorySubject || 'all';
        window.courseDirectoryViewMode = window.courseDirectoryViewMode || 'cards';

        let filteredCourses = courses.slice();
        if (window.courseDirectorySubject && window.courseDirectorySubject !== 'all') {
          filteredCourses = filteredCourses.filter(c => (c.subjectId || '').toLowerCase() === window.courseDirectorySubject.toLowerCase());
        }
        if (window.courseDirectorySearch && window.courseDirectorySearch.trim()) {
          const q = window.courseDirectorySearch.toLowerCase().trim();
          filteredCourses = filteredCourses.filter(c =>
            (c.title && c.title.toLowerCase().includes(q)) ||
            (c.instructor && c.instructor.toLowerCase().includes(q)) ||
            (c.description && c.description.toLowerCase().includes(q)) ||
            (c.subjectId && c.subjectId.toLowerCase().includes(q))
          );
        }

        activeTabContent = `
          <div class="widget-card">
            <!-- Directory Header -->
            <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:20px; flex-wrap:wrap; gap:14px;">
              <div>
                <div style="display:flex; align-items:center; gap:10px;">
                  <h2 style="font-size:1.3rem; font-weight:800; margin:0; display:flex; align-items:center; gap:8px;">
                    ${window.renderIcon('graduation-cap')} Course Directory
                  </h2>
                  <span class="tag-pill" style="background:rgba(15,118,110,0.12); color:var(--color-teal-action); font-weight:800; font-size:0.8rem;">
                    ${filteredCourses.length} ${filteredCourses.length === 1 ? 'Course' : 'Courses'}
                  </span>
                </div>
                <p style="font-size:0.84rem; color:var(--text-muted); margin-top:4px; margin-bottom:0;">
                  All published courses. On mobile, browse easily with clean cards with zero horizontal scrolling required.
                </p>
              </div>

              <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
                <!-- View Mode Toggle -->
                <div class="view-mode-toggle" style="display:flex; background:var(--bg-surface); border:1px solid var(--border-color); border-radius:var(--radius-sm); padding:2px;">
                  <button type="button" class="btn-view-toggle ${window.courseDirectoryViewMode === 'cards' ? 'active' : ''}" onclick="window.courseDirectoryViewMode='cards'; AppState.notify();" title="Card View">
                    ${window.renderIcon('layout-grid', 'small-icon')} Cards
                  </button>
                  <button type="button" class="btn-view-toggle ${window.courseDirectoryViewMode === 'table' ? 'active' : ''}" onclick="window.courseDirectoryViewMode='table'; AppState.notify();" title="Table View">
                    ${window.renderIcon('list', 'small-icon')} Table
                  </button>
                </div>

                <!-- Create Course Shortcut -->
                <button type="button" class="btn-hero-primary" style="background:var(--primary-gradient); color:#fff; padding:8px 16px; font-size:0.84rem; border-radius:var(--radius-sm);" onclick="window.activeAdminTab='courses'; AppState.notify();">
                  ${window.renderIcon('plus')} New Course
                </button>
              </div>
            </div>

            <!-- Filters Row: Search and Subject Pills -->
            <div style="display:flex; flex-direction:column; gap:12px; margin-bottom:20px; padding-bottom:16px; border-bottom:1px solid var(--border-color);">
              <div style="display:flex; align-items:center; gap:12px; flex-wrap:wrap;">
                <div class="nav-search" style="flex:1; min-width:0; width:100%; max-width:400px; padding:8px 14px;">
                  ${window.renderIcon('search')}
                  <input type="text" placeholder="Search courses by title, instructor..." value="${window.escapeHtmlAttr(window.courseDirectorySearch || '')}" oninput="window.courseDirectorySearch=this.value; AppState.notify();">
                  ${window.courseDirectorySearch ? `
                    <button type="button" onclick="window.courseDirectorySearch=''; AppState.notify();" style="color:var(--text-muted); font-size:0.85rem;" title="Clear search">
                      ${window.renderIcon('x', 'small-icon')}
                    </button>
                  ` : ''}
                </div>

                ${(window.courseDirectorySearch || window.courseDirectorySubject !== 'all') ? `
                  <button type="button" onclick="window.courseDirectorySearch=''; window.courseDirectorySubject='all'; AppState.notify();" style="font-size:0.8rem; color:var(--color-rose); font-weight:700; text-decoration:underline;">
                    Reset Filters
                  </button>
                ` : ''}
              </div>

              <!-- Subject Pills -->
              <div class="filter-pills-bar" style="margin-bottom:0;">
                <button class="pill-filter-btn ${window.courseDirectorySubject === 'all' ? 'active' : ''}" onclick="window.courseDirectorySubject='all'; AppState.notify();">
                  All Subjects (${courses.length})
                </button>
                ${subjects.map(s => {
                  const count = courses.filter(c => (c.subjectId || '').toLowerCase() === s.id.toLowerCase()).length;
                  return `
                    <button class="pill-filter-btn ${window.courseDirectorySubject.toLowerCase() === s.id.toLowerCase() ? 'active' : ''}" onclick="window.courseDirectorySubject='${s.id}'; AppState.notify();">
                      ${s.name} (${count})
                    </button>
                  `;
                }).join('')}
              </div>
            </div>

            <!-- Courses Display: Cards View vs Table View -->
            ${filteredCourses.length === 0 ? `
              <div style="text-align:center; padding:48px 16px; color:var(--text-muted);">
                <div style="font-size:2.4rem; margin-bottom:12px;">📚</div>
                <h3 style="font-size:1.1rem; font-weight:800; color:var(--text-main); margin-bottom:6px;">No courses found</h3>
                <p style="font-size:0.85rem; max-width:400px; margin:0 auto 16px auto;">
                  ${window.courseDirectorySearch || window.courseDirectorySubject !== 'all' ? 'Try adjusting your search query or subject filters.' : 'No courses have been created yet. Click below to add the first course.'}
                </p>
                <button type="button" class="btn-hero-primary" style="background:var(--primary-gradient); color:#fff; padding:8px 18px; font-size:0.84rem; border-radius:var(--radius-sm);" onclick="window.activeAdminTab='courses'; AppState.notify();">
                  ${window.renderIcon('plus-circle')} Create First Course
                </button>
              </div>
            ` : `
              <!-- Responsive Cards View -->
              <div class="admin-course-cards-container ${window.courseDirectoryViewMode === 'table' ? 'hide-on-desktop' : ''}">
                <div class="admin-courses-grid">
                  ${filteredCourses.map(c => {
                    const sub = subjects.find(s => s.id.toLowerCase() === (c.subjectId || '').toLowerCase());
                    const subColor = sub ? (sub.color || '#0f766e') : '#0f766e';
                    const subName = sub ? sub.name : (c.subjectId || 'GENERAL').toUpperCase();
                    return `
                      <div class="admin-course-card">
                        <div class="admin-course-card-top">
                          <span class="tag-pill" style="background:${subColor}18; color:${subColor}; font-weight:800; font-size:0.75rem; border:1px solid ${subColor}30; display:inline-block; margin-bottom:6px;">
                            ${subName}
                          </span>
                          <h3 class="admin-course-card-title">${c.title}</h3>
                        </div>

                        <div class="admin-course-card-meta">
                          <div class="admin-course-meta-chip">
                            ${window.renderIcon('user', 'small-icon')}
                            <span><strong>Instructor:</strong> ${c.instructor || 'AI Faculty'}</span>
                          </div>
                          <div class="admin-course-meta-chip">
                            ${window.renderIcon('clock', 'small-icon')}
                            <span><strong>Duration:</strong> ${c.duration || '8 Weeks'}</span>
                          </div>
                          ${c.prerequisites ? `
                            <div class="admin-course-meta-chip">
                              ${window.renderIcon('check-circle', 'small-icon')}
                              <span><strong>Prereq:</strong> ${c.prerequisites}</span>
                            </div>
                          ` : ''}
                        </div>

                        ${c.description ? `
                          <p class="admin-course-card-desc">${c.description}</p>
                        ` : ''}

                        <div class="admin-course-card-actions">
                          <button type="button" class="btn-table-action" style="flex:1; justify-content:center; padding:8px 12px; border-radius:var(--radius-sm); border:1px solid var(--border-color); background:var(--bg-surface); color:var(--text-main); font-size:0.82rem; font-weight:700; cursor:pointer; display:inline-flex; align-items:center; gap:6px;" onclick="AppState.setView('course-hub', {courseId: '${c.id}'})" title="Open Study Hub">
                            ${window.renderIcon('book-open', 'small-icon')} Study Hub
                          </button>
                          <button type="button" class="btn-table-action" style="padding:8px 12px; border-radius:var(--radius-sm); border:1px solid #fca5a5; background:#fee2e2; color:#ef4444; font-size:0.82rem; font-weight:700; cursor:pointer; display:inline-flex; align-items:center; gap:6px;" onclick="window.handleDeleteCourse('${c.id}')" title="Delete Course">
                            ${window.renderIcon('trash-2', 'small-icon')} Delete
                          </button>
                        </div>
                      </div>
                    `;
                  }).join('')}
                </div>
              </div>

              <!-- Responsive Table View -->
              <div class="admin-course-table-container ${window.courseDirectoryViewMode === 'cards' ? 'hide-on-mobile' : ''}">
                <div class="table-responsive-wrapper">
                  <table class="admin-table">
                    <thead>
                      <tr>
                        <th>Course Title & Overview</th>
                        <th>Subject</th>
                        <th>Duration</th>
                        <th>Instructor</th>
                        <th style="text-align:right;">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${filteredCourses.map(c => {
                        const sub = subjects.find(s => s.id.toLowerCase() === (c.subjectId || '').toLowerCase());
                        const subColor = sub ? (sub.color || '#0f766e') : '#0f766e';
                        const subName = sub ? sub.name : (c.subjectId || 'GENERAL').toUpperCase();
                        return `
                          <tr>
                            <td style="max-width:320px;">
                              <strong style="font-size:0.95rem; display:block; margin-bottom:3px; color:var(--text-main);">${c.title}</strong>
                              <p style="font-size:0.8rem; color:var(--text-muted); margin:0; line-height:1.4; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden;">
                                ${c.description || 'No description provided.'}
                              </p>
                            </td>
                            <td>
                              <span class="tag-pill" style="background:${subColor}18; color:${subColor}; font-weight:800; font-size:0.75rem; border:1px solid ${subColor}30;">
                                ${subName}
                              </span>
                            </td>
                            <td>
                              <span style="font-size:0.85rem; font-weight:600;">${c.duration}</span>
                            </td>
                            <td>
                              <div style="display:flex; align-items:center; gap:6px; font-size:0.85rem;">
                                ${window.renderIcon('user', 'small-icon')}
                                <span>${c.instructor || 'AI Faculty'}</span>
                              </div>
                            </td>
                            <td style="text-align:right;">
                              <div style="display:inline-flex; gap:6px;">
                                <button type="button" class="btn-table-action" style="padding:6px 12px; border-radius:var(--radius-xs); border:1px solid var(--border-color); background:var(--bg-surface); color:var(--text-main); font-size:0.82rem; font-weight:700; cursor:pointer; display:inline-flex; align-items:center; gap:5px;" onclick="AppState.setView('course-hub', {courseId: '${c.id}'})" title="View Course Hub">
                                  ${window.renderIcon('book-open', 'small-icon')} Study Hub
                                </button>
                                <button type="button" class="btn-table-action" style="padding:6px 10px; border-radius:var(--radius-xs); border:1px solid #fca5a5; background:#fee2e2; color:#ef4444; font-size:0.82rem; font-weight:700; cursor:pointer; display:inline-flex; align-items:center; gap:5px;" onclick="window.handleDeleteCourse('${c.id}')" title="Delete Course">
                                  ${window.renderIcon('trash-2', 'small-icon')}
                                </button>
                              </div>
                            </td>
                          </tr>
                        `;
                      }).join('')}
                    </tbody>
                  </table>
                </div>
              </div>
            `}
          </div>
        `;
      } else if (window.activeAdminTab === 'videos') {
        activeTabContent = `
          <div class="widget-card" style="max-width:650px; width:100%; margin: 0 auto;">
            <h2 style="font-size:1.2rem; font-weight:800; margin-bottom:16px; display:flex; align-items:center; gap:8px;">
              ${window.renderIcon('video')} Add Video Lessons & Links
            </h2>
            <p style="font-size:0.85rem; color:var(--text-muted); margin-bottom:20px;">
              Add embedded video resources to any course, cataloged by difficulty tier (Beginner, Intermediate, or Advanced).
            </p>
            <form onsubmit="window.handleRegisterVideoSubmit(event)">
              <div style="display:flex; flex-direction:column; gap:14px;">
                <div>
                  <label style="font-size:0.8rem; font-weight:700; display:block; margin-bottom:4px;">Select Course Target</label>
                  <select name="courseId" style="width:100%; padding:10px; border-radius:var(--radius-md); border:1px solid var(--border-color); background:var(--bg-card); color:var(--text-main);">
                    ${courses.map(c => `<option value="${c.id}">${c.title}</option>`).join('')}
                  </select>
                </div>
                <div>
                  <label style="font-size:0.8rem; font-weight:700; display:block; margin-bottom:4px;">Difficulty Category Tier</label>
                  <select name="tier" style="width:100%; padding:10px; border-radius:var(--radius-md); border:1px solid var(--border-color); background:var(--bg-card); color:var(--text-main);">
                    <option value="Beginner">Beginner (5 Questions Tier)</option>
                    <option value="Intermediate" selected>Intermediate (10 Questions Tier)</option>
                    <option value="Advanced">Advanced (15 Questions Tier)</option>
                  </select>
                </div>
                <div>
                  <label style="font-size:0.8rem; font-weight:700; display:block; margin-bottom:4px;">Video Lesson Title</label>
                  <input type="text" name="title" required placeholder="e.g. Backpropagation Math Explained" style="width:100%; padding:10px; border-radius:var(--radius-md); border:1px solid var(--border-color); background:var(--bg-card); color:var(--text-main);">
                </div>
                <div>
                  <label style="font-size:0.8rem; font-weight:700; display:block; margin-bottom:4px;">Video URL (YouTube Embed Link)</label>
                  <input type="url" name="contentUrl" required placeholder="e.g. https://www.youtube.com/embed/aircAruvnKk" style="width:100%; padding:10px; border-radius:var(--radius-md); border:1px solid var(--border-color); background:var(--bg-card); color:var(--text-main);">
                  <div style="font-size:0.75rem; color:var(--text-muted); margin-top:2px;">Must be an embeddable iframe URL format.</div>
                </div>
                <div>
                  <label style="font-size:0.8rem; font-weight:700; display:block; margin-bottom:4px;">Duration</label>
                  <input type="text" name="duration" placeholder="e.g. 25 mins" style="width:100%; padding:10px; border-radius:var(--radius-md); border:1px solid var(--border-color); background:var(--bg-card); color:var(--text-main);">
                </div>
                <div>
                  <label style="font-size:0.8rem; font-weight:700; display:block; margin-bottom:4px;">Video Description / Core Objective</label>
                  <textarea name="description" placeholder="A comprehensive overview of what this video lecture details..." style="width:100%; height:90px; padding:10px; border-radius:var(--radius-md); border:1px solid var(--border-color); background:var(--bg-card); color:var(--text-main); font-family:inherit; resize:vertical;"></textarea>
                </div>
                <button type="submit" class="btn-hero-primary" style="background:var(--primary-gradient); color:#fff; width:100%; padding:11px; justify-content:center;">
                  Add Video Material
                </button>
              </div>
            </form>
          </div>
        `;
      } else if (window.activeAdminTab === 'assignments') {
        window.initAssignmentBuilderState(courses[0] ? courses[0].id : '');
        const b = window.assignmentBuilder;
        activeTabContent = `
          <div class="admin-two-col-grid assignments-grid">
            <!-- Dynamic MCQ Assignment Builder Form -->
            <div class="widget-card" id="mcqAssignmentBuilderCard">
              <div class="mcq-builder-top-header">
                <h2 class="mcq-builder-title">
                  ${window.renderIcon('file-text')} ${b.editingId ? 'Edit Course Assignment' : 'Create Course Assignment'}
                </h2>
                ${b.editingId ? `
                  <div class="mcq-builder-mode-wrap">
                    <span class="tag-pill" style="background:rgba(245,158,11,0.15); color:var(--color-amber); font-weight:700;">
                      Editing Mode
                    </span>
                    <button type="button" onclick="window.resetAssignmentBuilder()" class="mcq-btn-cancel-new">
                      Cancel & New
                    </button>
                  </div>
                ` : ''}
              </div>
              <p class="mcq-builder-desc">
                Build dynamic multiple-choice assignments with custom questions, options A-D, and automatic evaluation.
              </p>

              <form id="mcqAssignmentBuilderForm" onsubmit="window.handleSaveAssignmentBuilder(event)">
                <div class="mcq-form-fields">
                  <div class="mcq-form-group">
                    <label class="mcq-field-label">Target Course</label>
                    <select name="courseId" id="assignmentBuilderCourseSelect" class="mcq-input-control" onchange="window.updateBuilderField('courseId', this.value)">
                      ${courses.map(c => `<option value="${c.id}" ${b.courseId === c.id ? 'selected' : ''}>${c.title}</option>`).join('')}
                    </select>
                  </div>
                  <div class="mcq-form-group">
                    <label class="mcq-field-label">Assignment Title</label>
                    <input type="text" name="title" id="assignmentBuilderTitleInput" required placeholder="e.g. AI & Neural Networks Problem Set" value="${window.escapeHtmlAttr(b.title || '')}" oninput="window.updateBuilderField('title', this.value)" class="mcq-input-control">
                  </div>
                  <div class="mcq-form-group">
                    <label class="mcq-field-label">Max Grade Points</label>
                    <input type="number" name="points" min="1" id="assignmentBuilderPointsInput" value="${b.points || 100}" oninput="window.updateBuilderField('points', this.value)" class="mcq-input-control">
                  </div>
                  <div class="mcq-form-group">
                    <label class="mcq-field-label">Instructions & Criteria</label>
                    <textarea name="description" id="assignmentBuilderDescInput" required placeholder="Provide clear task instructions, required materials, and how to submit..." oninput="window.updateBuilderField('description', this.value)" class="mcq-input-control mcq-textarea-control">${window.escapeHtmlAttr(b.description || '')}</textarea>
                  </div>

                  <!-- Questions Section -->
                  <div class="mcq-builder-section-header">
                    <div class="mcq-builder-section-info">
                      <h3 class="mcq-section-title">
                        ${window.renderIcon('help-circle')} Questions Section
                      </h3>
                      <span class="mcq-section-subtitle">Dynamic questions with options A-D and instant correct answer highlight</span>
                    </div>
                    <span class="tag-pill" id="builderQuestionsCountBadge" style="background:rgba(37,99,235,0.1); color:#2563eb; font-weight:700; flex-shrink:0;">
                      ${(b.questions || []).length} Questions
                    </span>
                  </div>

                  <!-- Questions List Container -->
                  <div id="mcqQuestionsBuilderList" class="mcq-questions-list">
                    ${window.renderAssignmentBuilderQuestionsHtml()}
                  </div>

                  <!-- Action Buttons -->
                  <div class="mcq-builder-actions">
                    <button type="button" class="btn-add-question-primary" onclick="window.addQuestionToBuilder()">
                      ➕ Add Question
                    </button>
                    
                    <div class="mcq-builder-actions-right">
                      ${b.editingId ? `
                        <button type="button" class="mcq-btn-cancel-edit" onclick="window.resetAssignmentBuilder()">
                          Cancel Edit
                        </button>
                      ` : ''}
                      <button type="submit" class="btn-save-assignment-dark">
                        💾 ${b.editingId ? 'Update Assignment' : 'Save Assignment'}
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            </div>

            <!-- Active Assignments Section -->
            <div class="widget-card" id="activeAssignmentsCard">
              <div class="active-assignments-card-header">
                <div>
                  <h2 class="active-assignments-heading">
                    ${window.renderIcon('file-text')} Active Assignments
                  </h2>
                  <p class="active-assignments-subheading">Dynamic and published course assignments.</p>
                </div>
                <div class="active-assignments-header-controls">
                  <span class="tag-pill" style="background:rgba(15,118,110,0.1); color:var(--color-teal-action); font-weight:700;">
                    ${assignments.length} Total
                  </span>
                  <div class="view-mode-toggle" style="display:flex; background:var(--bg-surface); border:1px solid var(--border-color); border-radius:var(--radius-sm); padding:2px;">
                    <button type="button" class="btn-view-toggle ${(window.assignmentsViewMode || 'cards') === 'cards' ? 'active' : ''}" onclick="window.assignmentsViewMode='cards'; AppState.notify();" title="Card View (Clean & No Horizontal Scroll)">
                      ${window.renderIcon('layout-grid', 'small-icon')} Cards
                    </button>
                    <button type="button" class="btn-view-toggle ${window.assignmentsViewMode === 'table' ? 'active' : ''}" onclick="window.assignmentsViewMode='table'; AppState.notify();" title="Table View">
                      ${window.renderIcon('list', 'small-icon')} Table
                    </button>
                  </div>
                </div>
              </div>

              ${assignments.length === 0 ? `
                <div style="text-align:center; padding:36px 16px; color:var(--text-muted);">
                  <div style="font-size:2.2rem; margin-bottom:8px;">📝</div>
                  <h3 style="font-size:1.05rem; font-weight:800; color:var(--text-main); margin-bottom:4px;">No assignments published yet</h3>
                  <p style="font-size:0.82rem; margin:0 auto; max-width:340px;">Use the builder to create and publish your first dynamic MCQ assignment.</p>
                </div>
              ` : (window.assignmentsViewMode === 'table' ? `
                <!-- Compact Responsive Table Mode -->
                <div class="table-responsive-wrapper">
                  <table class="admin-table assignment-compact-table">
                    <thead>
                      <tr>
                        <th>Assignment & Course</th>
                        <th style="text-align:center;">Questions</th>
                        <th style="text-align:center;">Max Grade</th>
                        <th style="text-align:right;">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${assignments.map(a => {
                        const c = courses.find(item => item.id === a.courseId) || { title: 'General Course' };
                        const qCount = (a.questions && a.questions.length) ? a.questions.length : 0;
                        return `
                          <tr>
                            <td>
                              <div style="display:flex; flex-direction:column; gap:3px;">
                                <strong style="font-size:0.92rem; color:var(--text-main); word-break:break-word;">${a.title}</strong>
                                <span style="font-size:0.76rem; color:var(--text-muted); display:inline-flex; align-items:center; gap:4px;">
                                  ${window.renderIcon('book-open', 'small-icon')} ${c.title}
                                </span>
                              </div>
                            </td>
                            <td style="text-align:center;">
                              <span class="tag-pill" style="background:rgba(37,99,235,0.1); color:#2563eb; font-weight:700;">
                                ${qCount} ${qCount === 1 ? 'MCQ' : 'MCQs'}
                              </span>
                            </td>
                            <td style="text-align:center;">
                              <span style="font-weight:700; color:var(--text-main); font-size:0.88rem;">${a.points} pts</span>
                            </td>
                            <td style="text-align:right;">
                              <div style="display:inline-flex; gap:6px; justify-content:flex-end;">
                                <button type="button" class="btn-table-action" style="padding:5px 10px; border-radius:4px; border:1px solid var(--border-color); background:var(--bg-surface); color:var(--text-main); font-size:0.8rem; font-weight:600; cursor:pointer;" onclick="window.editAssignmentInBuilder('${a.id}')" title="Edit in builder">
                                  ${window.renderIcon('edit', 'small-icon')} Edit
                                </button>
                                <button type="button" class="btn-table-action" style="padding:5px 10px; border-radius:4px; border:1px solid #fca5a5; background:#fee2e2; color:#ef4444; font-size:0.8rem; font-weight:600; cursor:pointer;" onclick="window.deleteAssignmentConfirm('${a.id}')" title="Delete Assignment">
                                  ${window.renderIcon('trash-2', 'small-icon')}
                                </button>
                              </div>
                            </td>
                          </tr>
                        `;
                      }).join('')}
                    </tbody>
                  </table>
                </div>
              ` : `
                <!-- Premium Scroll-Free Responsive Cards View (Default) -->
                <div class="active-assignments-list">
                  ${assignments.map(a => {
                    const c = courses.find(item => item.id === a.courseId) || { title: 'General Course' };
                    const qCount = (a.questions && a.questions.length) ? a.questions.length : 0;
                    const submissions = (state.data && state.data.submissions) ? state.data.submissions.filter(s => s.assignmentId === a.id) : [];
                    const subCount = submissions.length;
                    return `
                      <div class="active-assignment-card">
                        <div class="assignment-card-top">
                          <div class="assignment-card-top-left">
                            <div class="assignment-course-badge" title="Target Course: ${window.escapeHtmlAttr(c.title)}">
                              ${window.renderIcon('book-open', 'small-icon')}
                              <span>${c.title}</span>
                            </div>
                            <h3 class="assignment-card-title">${a.title}</h3>
                          </div>
                          <div class="assignment-card-actions">
                            <button type="button" class="btn-assignment-edit" onclick="window.editAssignmentInBuilder('${a.id}')" title="Edit Assignment in Builder">
                              ${window.renderIcon('edit', 'small-icon')} Edit
                            </button>
                            <button type="button" class="btn-assignment-delete" onclick="window.deleteAssignmentConfirm('${a.id}')" title="Delete Assignment">
                              ${window.renderIcon('trash-2', 'small-icon')}
                            </button>
                          </div>
                        </div>

                        ${a.description ? `
                          <p class="assignment-card-desc">${window.escapeHtmlAttr(a.description)}</p>
                        ` : ''}

                        <div class="assignment-card-meta">
                          <span class="assignment-meta-pill blue">
                            ${window.renderIcon('help-circle', 'small-icon')}
                            <span><strong>${qCount}</strong> ${qCount === 1 ? 'MCQ Question' : 'MCQ Questions'}</span>
                          </span>
                          <span class="assignment-meta-pill emerald">
                            ${window.renderIcon('award', 'small-icon')}
                            <span><strong>${a.points}</strong> Max Points</span>
                          </span>
                          ${subCount > 0 ? `
                            <span class="assignment-meta-pill purple" onclick="window.activeAdminTab='submissions'; AppState.notify();" style="cursor:pointer;" title="View Student Submissions">
                              ${window.renderIcon('users', 'small-icon')}
                              <span><strong>${subCount}</strong> ${subCount === 1 ? 'Submission' : 'Submissions'}</span>
                            </span>
                          ` : ''}
                        </div>
                      </div>
                    `;
                  }).join('')}
                </div>
              `)}
            </div>
          </div>
        `;
      } else if (window.activeAdminTab === 'submissions') {
        const allSubmissions = state.data.submissions || [];
        const enrolledStudents = students.filter(s => s.enrolledCourseIds && Array.isArray(s.enrolledCourseIds) && s.enrolledCourseIds.length > 0);
        const displayStudents = (students && students.length > 0) ? students : enrolledStudents;

        activeTabContent = `
          <div style="display:flex; flex-direction:column; gap:28px;">
            <!-- Registered Students Directory -->
            <div class="widget-card">
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px; flex-wrap:wrap; gap:12px;">
                <div>
                  <h2 style="font-size:1.2rem; font-weight:800; margin:0 0 4px 0; display:flex; align-items:center; gap:8px;">
                    ${window.renderIcon('users')} Registered Students Profile & Onboarding
                    <span class="tag-pill" style="background:rgba(139,92,246,0.12); color:var(--color-purple); font-size:0.75rem; font-weight:800;">
                      ${displayStudents.length} Students
                    </span>
                  </h2>
                  <p style="font-size:0.85rem; color:var(--text-muted); margin:0;">
                    Dynamic student onboarding profiles, learning styles, goals, and streak metrics.
                  </p>
                </div>
                <div class="view-mode-toggle" style="display:flex; background:var(--bg-surface); border:1px solid var(--border-color); border-radius:var(--radius-sm); padding:2px;">
                  <button type="button" class="btn-view-toggle ${(window.studentDirectoryViewMode || 'cards') === 'cards' ? 'active' : ''}" onclick="window.studentDirectoryViewMode='cards'; AppState.notify();" title="Card View (Clean & No Horizontal Scroll)">
                    ${window.renderIcon('layout-grid', 'small-icon')} Cards
                  </button>
                  <button type="button" class="btn-view-toggle ${window.studentDirectoryViewMode === 'table' ? 'active' : ''}" onclick="window.studentDirectoryViewMode='table'; AppState.notify();" title="Table View">
                    ${window.renderIcon('list', 'small-icon')} Table
                  </button>
                </div>
              </div>

              ${(state.isLoadingStudents && displayStudents.length === 0) ? `
                <div style="text-align:center; padding:32px; color:var(--text-muted);">
                  <div style="display:inline-flex; align-items:center; gap:10px; font-size:0.95rem; font-weight:600;">
                    <span class="loading-spinner" style="display:inline-block; width:18px; height:18px; border:2px solid var(--border-color); border-top-color:var(--color-purple); border-radius:50%; animation:spin 0.8s linear infinite;"></span>
                    Loading registered students...
                  </div>
                </div>
              ` : (displayStudents.length === 0 && state.studentLoadError ? `
                <div style="text-align:center; padding:28px; color:var(--color-rose); font-weight:600; font-size:0.95rem;">
                  Unable to load student data. Please try again.
                </div>
              ` : (displayStudents.length === 0 ? `
                <div style="text-align:center; color:var(--text-muted); padding:32px; font-size:0.95rem;">
                  No students registered yet.
                </div>
              ` : (window.studentDirectoryViewMode === 'table' ? `
                <!-- Compact Table Mode -->
                <div class="table-responsive-wrapper">
                  <table class="admin-table">
                    <thead>
                      <tr>
                        <th>Student Name</th>
                        <th>Email</th>
                        <th>Grade / Class</th>
                        <th>Preferred Style</th>
                        <th>Goal Career</th>
                        <th>Streak / Progress</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${displayStudents.map(s => {
                        const studentEnrolledCourses = courses.filter(c => (s.enrolledCourseIds || []).includes(c.id));
                        let totalLessons = 0;
                        studentEnrolledCourses.forEach(c => {
                          if (c.modules && Array.isArray(c.modules)) {
                            c.modules.forEach(m => {
                              totalLessons += (m.lessons ? m.lessons.length : (m.resources ? m.resources.length : 1));
                            });
                          } else if (c.resourceIds && Array.isArray(c.resourceIds)) {
                            totalLessons += c.resourceIds.length;
                          }
                        });
                        if (totalLessons === 0) {
                          totalLessons = Math.max(1, (s.enrolledCourseIds || []).length * 5);
                        }
                        const completedCount = (s.completedResourceIds && Array.isArray(s.completedResourceIds)) ? s.completedResourceIds.length : 0;
                        const progressPct = totalLessons > 0 ? Math.min(100, Math.round((completedCount / totalLessons) * 100)) : 0;
                        const streakDays = (s.streakDays !== undefined && s.streakDays !== null) ? s.streakDays : 1;
                        const studentName = s.name || s.displayName || 'Student';
                        const studentEmail = s.email || 'N/A';
                        const studentGrade = s.gradeClass || s.grade || 'N/A';
                        const preferredStyle = (s.preferredStyle || 'visual').toUpperCase();
                        const careerGoal = s.careerGoal || s.goalCareer || 'N/A';
                        const avatarUrl = s.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150';

                        return `
                          <tr>
                            <td>
                              <div style="display:flex; align-items:center; gap:8px;">
                                <img src="${avatarUrl}" alt="${studentName}" style="width:28px; height:28px; border-radius:50%; border:1px solid var(--border-color); object-fit:cover;">
                                <strong>${studentName}</strong>
                              </div>
                            </td>
                            <td>${studentEmail}</td>
                            <td><span class="tag-pill" style="background:var(--bg-surface); border:1px solid var(--border-color);">${studentGrade}</span></td>
                            <td><span class="tag-pill" style="background:rgba(99, 102, 241, 0.1); color:var(--color-indigo);">${preferredStyle}</span></td>
                            <td>${careerGoal}</td>
                            <td>
                              <span style="font-weight:700; color:var(--color-purple);">${streakDays} 🔥</span> • 
                              <span style="font-size:0.8rem; color:var(--text-muted);">${completedCount} lesson${completedCount === 1 ? '' : 's'} done (${progressPct}%)</span>
                            </td>
                          </tr>
                        `;
                      }).join('')}
                    </tbody>
                  </table>
                </div>
              ` : `
                <!-- Premium Scroll-Free Responsive Cards Mode (Default) -->
                <div class="student-cards-list">
                  ${displayStudents.map(s => {
                    const studentEnrolledCourses = courses.filter(c => (s.enrolledCourseIds || []).includes(c.id));
                    let totalLessons = 0;
                    studentEnrolledCourses.forEach(c => {
                      if (c.modules && Array.isArray(c.modules)) {
                        c.modules.forEach(m => {
                          totalLessons += (m.lessons ? m.lessons.length : (m.resources ? m.resources.length : 1));
                        });
                      } else if (c.resourceIds && Array.isArray(c.resourceIds)) {
                        totalLessons += c.resourceIds.length;
                      }
                    });
                    if (totalLessons === 0) {
                      totalLessons = Math.max(1, (s.enrolledCourseIds || []).length * 5);
                    }
                    const completedCount = (s.completedResourceIds && Array.isArray(s.completedResourceIds)) ? s.completedResourceIds.length : 0;
                    const progressPct = totalLessons > 0 ? Math.min(100, Math.round((completedCount / totalLessons) * 100)) : 0;
                    const streakDays = (s.streakDays !== undefined && s.streakDays !== null) ? s.streakDays : 1;
                    const studentName = s.name || s.displayName || 'Student';
                    const studentEmail = s.email || 'N/A';
                    const studentGrade = s.gradeClass || s.grade || 'Grade N/A';
                    const preferredStyle = (s.preferredStyle || 'visual').toUpperCase();
                    const careerGoal = s.careerGoal || s.goalCareer || 'General Exploration';
                    const avatarUrl = s.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150';

                    return `
                      <div class="student-profile-card">
                        <div class="student-card-top">
                          <div class="student-card-identity">
                            <img src="${avatarUrl}" alt="${studentName}" class="student-card-avatar" onerror="this.src='https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'">
                            <div class="student-card-info">
                              <h3 class="student-card-name">${studentName}</h3>
                              <span class="student-card-email">${studentEmail}</span>
                            </div>
                          </div>
                          <div class="student-card-badge-wrap">
                            <span class="tag-pill student-grade-pill">${studentGrade}</span>
                          </div>
                        </div>

                        <!-- 4-Metric Bento Box (Zero Horizontal Scrolling) -->
                        <div class="student-card-metrics">
                          <div class="student-metric-box">
                            <span class="student-metric-lbl">Preferred Style</span>
                            <span class="student-metric-val style-tag">${preferredStyle}</span>
                          </div>
                          <div class="student-metric-box">
                            <span class="student-metric-lbl">Goal Career</span>
                            <span class="student-metric-val career-tag" title="${window.escapeHtmlAttr(careerGoal)}">${careerGoal}</span>
                          </div>
                          <div class="student-metric-box">
                            <span class="student-metric-lbl">Learning Streak</span>
                            <span class="student-metric-val streak-tag">${streakDays} 🔥 Days</span>
                          </div>
                          <div class="student-metric-box">
                            <span class="student-metric-lbl">Progress</span>
                            <span class="student-metric-val progress-tag">${completedCount} / ${totalLessons} (${progressPct}%)</span>
                          </div>
                        </div>

                        <div class="student-card-progress-wrap">
                          <div class="student-card-progress-bar">
                            <div class="student-card-progress-fill" style="width:${progressPct}%"></div>
                          </div>
                        </div>
                      </div>
                    `;
                  }).join('')}
                </div>
              `)))}
            </div>

            <!-- Assignment Submissions Card & Table -->
            <div class="widget-card">
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px; flex-wrap:wrap; gap:12px;">
                <div>
                  <h2 style="font-size:1.2rem; font-weight:800; margin:0 0 4px 0; display:flex; align-items:center; gap:8px;">
                    ${window.renderIcon('file-text')} Student Assignment Submissions
                    <span class="tag-pill" style="background:rgba(37,99,235,0.1); color:#2563eb; font-size:0.75rem; font-weight:800;">
                      ${allSubmissions.length} ${allSubmissions.length === 1 ? 'Submission' : 'Submissions'}
                    </span>
                  </h2>
                  <p style="font-size:0.85rem; color:var(--text-muted); margin:0;">
                    All dynamic homework and project assessments submitted by students, synced via Firebase.
                  </p>
                </div>
                <div class="view-mode-toggle" style="display:flex; background:var(--bg-surface); border:1px solid var(--border-color); border-radius:var(--radius-sm); padding:2px;">
                  <button type="button" class="btn-view-toggle ${(window.submissionsViewMode || 'cards') === 'cards' ? 'active' : ''}" onclick="window.submissionsViewMode='cards'; AppState.notify();" title="Card View (Clean & No Horizontal Scroll)">
                    ${window.renderIcon('layout-grid', 'small-icon')} Cards
                  </button>
                  <button type="button" class="btn-view-toggle ${window.submissionsViewMode === 'table' ? 'active' : ''}" onclick="window.submissionsViewMode='table'; AppState.notify();" title="Table View">
                    ${window.renderIcon('list', 'small-icon')} Table
                  </button>
                </div>
              </div>

              ${allSubmissions.length === 0 ? `
                <div style="text-align:center; padding:36px 16px; color:var(--text-muted);">
                  <div style="font-size:2.2rem; margin-bottom:8px;">📋</div>
                  <h3 style="font-size:1.05rem; font-weight:800; color:var(--text-main); margin-bottom:4px;">No assignment submissions yet</h3>
                  <p style="font-size:0.82rem; margin:0 auto; max-width:340px;">Student quiz responses and project submissions will appear here dynamically.</p>
                </div>
              ` : (window.submissionsViewMode === 'table' ? `
                <!-- Compact Table Mode -->
                <div class="table-responsive-wrapper">
                  <table class="admin-table">
                    <thead>
                      <tr>
                        <th>Student Name</th>
                        <th>Course Target</th>
                        <th>Assignment Name</th>
                        <th>Evaluation / Score</th>
                        <th>Submission / Details</th>
                        <th>Submitted At</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${allSubmissions.map(sub => {
                        const c = courses.find(item => item.id === sub.courseId) || { title: 'Unknown Course' };
                        const a = assignments.find(item => item.id === sub.assignmentId) || { title: 'Unknown Assignment' };
                        const isMCQ = sub.status === 'graded' || sub.score !== undefined;
                        return `
                          <tr>
                            <td><strong>${sub.userName || 'Student'}</strong></td>
                            <td><span style="font-size:0.85rem; font-weight:600;">${c.title}</span></td>
                            <td><strong>${a.title}</strong></td>
                            <td>
                              ${isMCQ ? `
                                <div style="display:flex; flex-direction:column; gap:3px;">
                                  <div style="font-size:0.92rem; font-weight:800; color:var(--text-main);">
                                    ${sub.score} / ${a.points || 100} pts (${sub.percentage}%)
                                  </div>
                                  <div style="display:flex; align-items:center; gap:6px;">
                                    <span class="tag-pill" style="background:${sub.passed ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)'}; color:${sub.passed ? 'var(--color-emerald)' : 'var(--color-rose)'}; font-weight:800; font-size:0.75rem;">
                                      ${sub.passed ? 'PASSED' : 'NEEDS PRACTICE'}
                                    </span>
                                    <span style="font-size:0.75rem; color:var(--text-muted);">
                                      ✔ ${sub.correctCount || 0} • ✖ ${sub.wrongCount || 0}
                                    </span>
                                  </div>
                                </div>
                              ` : `
                                <span class="tag-pill" style="background:var(--bg-surface); border:1px solid var(--border-color); color:var(--text-muted);">
                                  Standard Review
                                </span>
                              `}
                            </td>
                            <td>
                              ${isMCQ ? `
                                <button type="button" class="btn-table-action" style="padding:6px 12px; border-radius:var(--radius-xs); border:1px solid var(--border-color); background:var(--bg-surface); color:var(--text-main); font-size:0.82rem; font-weight:700; cursor:pointer; display:inline-flex; align-items:center; gap:6px;" onclick="window.viewMCQSubmissionBreakdown('${sub.assignmentId}', '${sub.userId}')">
                                  ${window.renderIcon('file-text', 'small-icon')} View Answers
                                </button>
                              ` : `
                                <div>
                                  <div style="max-width:280px; max-height:60px; overflow-y:auto; font-size:0.82rem; line-height:1.4; white-space:pre-wrap; background:var(--bg-card); padding:5px 8px; border-radius:4px; border:1px solid var(--border-color); margin-bottom:4px;">${sub.submissionText || '-'}</div>
                                  ${sub.submissionLink ? `<a href="${sub.submissionLink}" target="_blank" style="color:var(--color-purple); text-decoration:underline; font-size:0.82rem; display:inline-flex; align-items:center; gap:4px;">${window.renderIcon('external-link', 'small-icon')} Project Link</a>` : ''}
                                </div>
                              `}
                            </td>
                            <td>
                              <span style="font-size:0.8rem; color:var(--text-muted);">${new Date(sub.submittedAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</span>
                            </td>
                          </tr>
                        `;
                      }).join('')}
                    </tbody>
                  </table>
                </div>
              ` : `
                <!-- Premium Scroll-Free Responsive Cards Mode (Default) -->
                <div class="submissions-card-list">
                  ${allSubmissions.map(sub => {
                    const c = courses.find(item => item.id === sub.courseId) || { title: 'General Course' };
                    const a = assignments.find(item => item.id === sub.assignmentId) || { title: 'Unknown Assignment' };
                    const isMCQ = sub.status === 'graded' || sub.score !== undefined;
                    return `
                      <div class="submission-item-card">
                        <div class="submission-card-top">
                          <div class="submission-card-info">
                            <div class="submission-course-badge">
                              ${window.renderIcon('book-open', 'small-icon')}
                              <span>${c.title}</span>
                            </div>
                            <h3 class="submission-card-title">${a.title}</h3>
                            <div class="submission-student-badge">
                              ${window.renderIcon('user', 'small-icon')}
                              <span>Student: <strong>${sub.userName || 'Student'}</strong></span>
                            </div>
                          </div>
                          <div class="submission-card-score">
                            ${isMCQ ? `
                              <div class="submission-score-num">${sub.score} / ${a.points || 100} pts</div>
                              <div style="display:flex; align-items:center; gap:6px; flex-wrap:wrap; justify-content:flex-end;">
                                <span class="tag-pill" style="background:${sub.passed ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)'}; color:${sub.passed ? 'var(--color-emerald)' : 'var(--color-rose)'}; font-weight:800; font-size:0.75rem;">
                                  ${sub.passed ? 'PASSED' : 'NEEDS PRACTICE'}
                                </span>
                                <span style="font-size:0.75rem; color:var(--text-muted); font-weight:700;">
                                  (${sub.percentage}%)
                                </span>
                              </div>
                            ` : `
                              <span class="tag-pill" style="background:var(--bg-surface); border:1px solid var(--border-color); color:var(--text-muted);">
                                Standard Review
                              </span>
                            `}
                          </div>
                        </div>

                        ${(!isMCQ && sub.submissionText) ? `
                          <div style="font-size:0.84rem; line-height:1.45; white-space:pre-wrap; background:var(--bg-card); padding:8px 12px; border-radius:var(--radius-sm); border:1px solid var(--border-color); color:var(--text-main); word-break:break-word;">
                            ${sub.submissionText}
                          </div>
                        ` : ''}

                        <div class="submission-card-bottom">
                          <div class="submission-meta-tags">
                            <span class="sub-meta-pill">
                              ${window.renderIcon('clock', 'small-icon')}
                              <span>${new Date(sub.submittedAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</span>
                            </span>
                            ${isMCQ ? `
                              <span class="sub-meta-pill">
                                ✔ ${sub.correctCount || 0} Correct • ✖ ${sub.wrongCount || 0} Wrong
                              </span>
                            ` : ''}
                          </div>
                          <div>
                            ${isMCQ ? `
                              <button type="button" class="btn-view-submission-details" onclick="window.viewMCQSubmissionBreakdown('${sub.assignmentId}', '${sub.userId}')">
                                ${window.renderIcon('file-text', 'small-icon')} View Answers Breakdown
                              </button>
                            ` : (sub.submissionLink ? `
                              <a href="${sub.submissionLink}" target="_blank" class="btn-view-submission-details" style="text-decoration:none;">
                                ${window.renderIcon('external-link', 'small-icon')} Open Project Link
                              </a>
                            ` : '')}
                          </div>
                        </div>
                      </div>
                    `;
                  }).join('')}
                </div>
              `)}
            </div>
          </div>
        `;
      } else if (window.activeAdminTab === 'resources') {
        window.resourceCatalogSearch = window.resourceCatalogSearch || '';
        window.resourceCatalogSubject = window.resourceCatalogSubject || 'all';
        window.resourceCatalogFormat = window.resourceCatalogFormat || 'all';
        window.resourceCatalogViewMode = window.resourceCatalogViewMode || 'cards';

        let filteredResources = resources.slice();
        if (window.resourceCatalogSubject && window.resourceCatalogSubject !== 'all') {
          filteredResources = filteredResources.filter(r => (r.subjectId || '').toLowerCase() === window.resourceCatalogSubject.toLowerCase());
        }
        if (window.resourceCatalogFormat && window.resourceCatalogFormat !== 'all') {
          filteredResources = filteredResources.filter(r => (r.format || '').toLowerCase() === window.resourceCatalogFormat.toLowerCase());
        }
        if (window.resourceCatalogSearch && window.resourceCatalogSearch.trim()) {
          const q = window.resourceCatalogSearch.toLowerCase().trim();
          filteredResources = filteredResources.filter(r =>
            (r.title && r.title.toLowerCase().includes(q)) ||
            (r.subjectId && r.subjectId.toLowerCase().includes(q)) ||
            (r.format && r.format.toLowerCase().includes(q)) ||
            (r.level && r.level.toLowerCase().includes(q)) ||
            (r.description && r.description.toLowerCase().includes(q)) ||
            (r.summary && r.summary.toLowerCase().includes(q)) ||
            (r.tags && Array.isArray(r.tags) && r.tags.some(t => t.toLowerCase().includes(q)))
          );
        }

        activeTabContent = `
          <div class="widget-card">
            <!-- Header with Title, Count, View Mode Toggle and Add Button -->
            <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:20px; flex-wrap:wrap; gap:14px;">
              <div>
                <div style="display:flex; align-items:center; gap:10px; flex-wrap:wrap;">
                  <h2 style="font-size:1.3rem; font-weight:800; margin:0; display:flex; align-items:center; gap:8px;">
                    ${window.renderIcon('book-open')} Resource Catalog Management
                  </h2>
                  <span class="tag-pill" style="background:rgba(37,99,235,0.12); color:#2563eb; font-weight:800; font-size:0.8rem;">
                    ${filteredResources.length} ${filteredResources.length === 1 ? 'Resource' : 'Resources'}
                  </span>
                </div>
                <p style="font-size:0.85rem; color:var(--text-muted); margin-top:4px; margin-bottom:0;">
                  Global study materials, video masterclasses, articles, and interactive labs with responsive card layout.
                </p>
              </div>

              <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
                <!-- View Mode Toggle -->
                <div class="view-mode-toggle" style="display:flex; background:var(--bg-surface); border:1px solid var(--border-color); border-radius:var(--radius-sm); padding:2px;">
                  <button type="button" class="btn-view-toggle ${window.resourceCatalogViewMode === 'cards' ? 'active' : ''}" onclick="window.resourceCatalogViewMode='cards'; AppState.notify();" title="Card View (Clean & No Horizontal Scroll)">
                    ${window.renderIcon('layout-grid', 'small-icon')} Cards
                  </button>
                  <button type="button" class="btn-view-toggle ${window.resourceCatalogViewMode === 'table' ? 'active' : ''}" onclick="window.resourceCatalogViewMode='table'; AppState.notify();" title="Table View">
                    ${window.renderIcon('list', 'small-icon')} Table
                  </button>
                </div>

                <!-- Add Resource Button -->
                <button type="button" class="btn-hero-primary" style="background:var(--primary-gradient); color:#fff; padding:8px 16px; font-size:0.85rem; border-radius:var(--radius-sm);" onclick="AppState.openModal('add-resource')">
                  ${window.renderIcon('plus')} Add New Resource
                </button>
              </div>
            </div>

            <!-- Search and Filter Pills Toolbar -->
            <div style="display:flex; flex-direction:column; gap:12px; margin-bottom:20px; padding-bottom:16px; border-bottom:1px solid var(--border-color);">
              <div style="display:flex; align-items:center; gap:12px; flex-wrap:wrap;">
                <div class="nav-search" style="flex:1; min-width:0; width:100%; max-width:400px; padding:8px 14px;">
                  ${window.renderIcon('search')}
                  <input type="text" placeholder="Search resources by title, format, subject..." value="${window.escapeHtmlAttr(window.resourceCatalogSearch || '')}" oninput="window.resourceCatalogSearch=this.value; AppState.notify();">
                  ${window.resourceCatalogSearch ? `
                    <button type="button" onclick="window.resourceCatalogSearch=''; AppState.notify();" style="color:var(--text-muted); font-size:0.85rem;" title="Clear search">
                      ${window.renderIcon('x', 'small-icon')}
                    </button>
                  ` : ''}
                </div>

                ${(window.resourceCatalogSearch || window.resourceCatalogSubject !== 'all' || window.resourceCatalogFormat !== 'all') ? `
                  <button type="button" onclick="window.resourceCatalogSearch=''; window.resourceCatalogSubject='all'; window.resourceCatalogFormat='all'; AppState.notify();" style="font-size:0.8rem; color:var(--color-rose); font-weight:700; text-decoration:underline;">
                    Reset Filters
                  </button>
                ` : ''}
              </div>

              <!-- Format and Subject Filter Pills -->
              <div style="display:flex; flex-direction:column; gap:8px;">
                <!-- Format Filter Pills -->
                <div class="filter-pills-bar" style="margin-bottom:0;">
                  <button class="pill-filter-btn ${window.resourceCatalogFormat === 'all' ? 'active' : ''}" onclick="window.resourceCatalogFormat='all'; AppState.notify();">
                    All Formats
                  </button>
                  <button class="pill-filter-btn ${window.resourceCatalogFormat === 'video' ? 'active' : ''}" onclick="window.resourceCatalogFormat='video'; AppState.notify();">
                    🎥 Videos
                  </button>
                  <button class="pill-filter-btn ${window.resourceCatalogFormat === 'article' ? 'active' : ''}" onclick="window.resourceCatalogFormat='article'; AppState.notify();">
                    📄 Articles
                  </button>
                  <button class="pill-filter-btn ${(window.resourceCatalogFormat === 'interactive' || window.resourceCatalogFormat === 'exercise') ? 'active' : ''}" onclick="window.resourceCatalogFormat='interactive'; AppState.notify();">
                    ⚡ Interactive
                  </button>
                </div>

                <!-- Subject Filter Pills -->
                <div class="filter-pills-bar" style="margin-bottom:0;">
                  <button class="pill-filter-btn ${window.resourceCatalogSubject === 'all' ? 'active' : ''}" onclick="window.resourceCatalogSubject='all'; AppState.notify();">
                    All Subjects (${resources.length})
                  </button>
                  ${subjects.map(s => {
                    const count = resources.filter(r => (r.subjectId || '').toLowerCase() === s.id.toLowerCase()).length;
                    return `
                      <button class="pill-filter-btn ${window.resourceCatalogSubject.toLowerCase() === s.id.toLowerCase() ? 'active' : ''}" onclick="window.resourceCatalogSubject='${s.id}'; AppState.notify();">
                        ${s.name} (${count})
                      </button>
                    `;
                  }).join('')}
                </div>
              </div>
            </div>

            <!-- Content: Cards View (Default) vs Table View -->
            ${filteredResources.length === 0 ? `
              <div style="text-align:center; padding:48px 16px; color:var(--text-muted);">
                <div style="font-size:2.4rem; margin-bottom:12px;">🔍</div>
                <h3 style="font-size:1.1rem; font-weight:800; color:var(--text-main); margin-bottom:6px;">No resources found</h3>
                <p style="font-size:0.85rem; max-width:400px; margin:0 auto 16px auto;">
                  ${window.resourceCatalogSearch || window.resourceCatalogSubject !== 'all' || window.resourceCatalogFormat !== 'all'
                    ? 'No materials match your filter criteria. Try resetting filters or searching with different keywords.'
                    : 'No global study materials published yet. Click below to add the first resource.'}
                </p>
                ${window.resourceCatalogSearch || window.resourceCatalogSubject !== 'all' || window.resourceCatalogFormat !== 'all' ? `
                  <button type="button" class="btn-table-action" style="padding:8px 18px; border-radius:var(--radius-sm); border:1px solid var(--border-color); background:var(--bg-surface); font-weight:700;" onclick="window.resourceCatalogSearch=''; window.resourceCatalogSubject='all'; window.resourceCatalogFormat='all'; AppState.notify();">
                    Clear Filters
                  </button>
                ` : `
                  <button type="button" class="btn-hero-primary" style="background:var(--primary-gradient); color:#fff; padding:8px 18px; font-size:0.85rem; border-radius:var(--radius-sm);" onclick="AppState.openModal('add-resource')">
                    ${window.renderIcon('plus')} Add First Resource
                  </button>
                `}
              </div>
            ` : (window.resourceCatalogViewMode === 'table' ? `
              <!-- Compact Table Mode -->
              <div class="table-responsive-wrapper">
                <table class="admin-table resource-compact-table">
                  <thead>
                    <tr>
                      <th>Title & Subject</th>
                      <th>Format & Level</th>
                      <th>Duration / Audience</th>
                      <th style="text-align:right;">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${filteredResources.map(res => {
                      const sub = subjects.find(s => s.id.toLowerCase() === (res.subjectId || '').toLowerCase());
                      const subName = sub ? sub.name : (res.subjectId || 'GENERAL').toUpperCase();
                      const subColor = sub ? (sub.color || '#0f766e') : '#0f766e';
                      const format = (res.format || 'material').toLowerCase();
                      const level = (res.level || 'Intermediate').toLowerCase();
                      return `
                        <tr>
                          <td>
                            <div style="display:flex; flex-direction:column; gap:4px;">
                              <strong style="font-size:0.92rem; color:var(--text-main); word-break:break-word;">${res.title}</strong>
                              <div style="display:flex; align-items:center; gap:6px; flex-wrap:wrap;">
                                <span class="tag-pill" style="background:${subColor}18; color:${subColor}; font-size:0.72rem; font-weight:800; border:1px solid ${subColor}30;">
                                  ${subName}
                                </span>
                                ${res.tags && Array.isArray(res.tags) && res.tags.length > 0 ? `
                                  <span style="font-size:0.75rem; color:var(--text-muted);">#${res.tags.slice(0, 2).join(' #')}</span>
                                ` : ''}
                              </div>
                            </div>
                          </td>
                          <td>
                            <div style="display:flex; flex-direction:column; gap:4px; align-items:flex-start;">
                              <span class="resource-format-badge ${format}">
                                ${format === 'video' ? window.renderIcon('video', 'small-icon') : (format === 'article' ? window.renderIcon('file-text', 'small-icon') : window.renderIcon('zap', 'small-icon'))}
                                ${format}
                              </span>
                              <span class="resource-level-badge ${level}">${res.level || 'Intermediate'}</span>
                            </div>
                          </td>
                          <td>
                            <div style="display:flex; flex-direction:column; gap:3px; font-size:0.8rem; color:var(--text-muted);">
                              ${res.duration ? `<span>⏱️ ${res.duration}</span>` : ''}
                              ${res.suitableClass ? `<span>🎓 ${res.suitableClass}</span>` : ''}
                              ${res.rating ? `<span>⭐ ${res.rating}</span>` : ''}
                            </div>
                          </td>
                          <td style="text-align:right;">
                            <div style="display:inline-flex; gap:6px; justify-content:flex-end;">
                              <button type="button" class="btn-table-action" style="padding:6px 12px; border-radius:var(--radius-xs); border:1px solid var(--border-color); background:var(--bg-surface); color:var(--text-main); font-size:0.8rem; font-weight:700; cursor:pointer;" onclick="window.previewAdminResource('${res.id}')" title="Preview / Open Resource">
                                ${window.renderIcon(format === 'video' ? 'play' : 'external-link', 'small-icon')}
                              </button>
                              <button type="button" class="btn-table-action" style="padding:6px 12px; border-radius:var(--radius-xs); border:1px solid #fca5a5; background:#fee2e2; color:#ef4444; font-size:0.8rem; font-weight:700; cursor:pointer;" onclick="window.deleteResourceConfirm('${res.id}')" title="Delete Resource">
                                ${window.renderIcon('trash-2', 'small-icon')}
                              </button>
                            </div>
                          </td>
                        </tr>
                      `;
                    }).join('')}
                  </tbody>
                </table>
              </div>
            ` : `
              <!-- Premium Scroll-Free Responsive Cards Mode (Default) -->
              <div class="resource-cards-grid">
                ${filteredResources.map(res => {
                  const sub = subjects.find(s => s.id.toLowerCase() === (res.subjectId || '').toLowerCase());
                  const subName = sub ? sub.name : (res.subjectId || 'GENERAL').toUpperCase();
                  const subColor = sub ? (sub.color || '#0f766e') : '#0f766e';
                  const format = (res.format || 'material').toLowerCase();
                  const level = (res.level || 'Intermediate').toLowerCase();
                  const desc = res.description || res.summary || '';
                  const varkList = (res.vark && Array.isArray(res.vark)) ? res.vark.map(v => v.toUpperCase()).join(', ') : '';

                  return `
                    <div class="admin-resource-card">
                      <!-- Card Top Badges & Delete Button -->
                      <div class="resource-card-top">
                        <div class="resource-card-badges">
                          <span class="resource-subject-badge" style="background:${subColor}18; color:${subColor}; border-color:${subColor}35;">
                            ${subName}
                          </span>
                          <span class="resource-format-badge ${format}">
                            ${format === 'video' ? window.renderIcon('video', 'small-icon') : (format === 'article' ? window.renderIcon('file-text', 'small-icon') : window.renderIcon('zap', 'small-icon'))}
                            ${format}
                          </span>
                          <span class="resource-level-badge ${level}">
                            ${res.level || 'Intermediate'}
                          </span>
                        </div>
                        <div class="resource-card-actions">
                          <button type="button" class="btn-resource-delete" onclick="window.deleteResourceConfirm('${res.id}')" title="Delete Resource">
                            ${window.renderIcon('trash-2', 'small-icon')}
                          </button>
                        </div>
                      </div>

                      <!-- Title -->
                      <h3 class="resource-card-title">${res.title}</h3>

                      <!-- Description / Summary -->
                      ${desc ? `
                        <p class="resource-card-desc" title="${window.escapeHtmlAttr(desc)}">${desc}</p>
                      ` : ''}

                      <!-- Metadata Pill Tags (Zero Horizontal Scroll) -->
                      <div class="resource-card-meta">
                        ${res.duration ? `
                          <span class="resource-meta-pill">
                            ${window.renderIcon('clock', 'small-icon')}
                            <span>${res.duration}</span>
                          </span>
                        ` : ''}
                        ${res.rating ? `
                          <span class="resource-meta-pill">
                            ${window.renderIcon('star', 'small-icon')}
                            <span>${res.rating}</span>
                          </span>
                        ` : ''}
                        ${res.suitableClass ? `
                          <span class="resource-meta-pill">
                            ${window.renderIcon('award', 'small-icon')}
                            <span>${res.suitableClass}</span>
                          </span>
                        ` : ''}
                      </div>

                      <!-- Card Bottom Action Row -->
                      <div class="resource-card-bottom">
                        <div class="resource-vark-tag">
                          ${varkList ? `
                            ${window.renderIcon('sparkles', 'small-icon')}
                            <span>VARK: ${varkList}</span>
                          ` : (res.tags && Array.isArray(res.tags) && res.tags.length > 0 ? `
                            <span>#${res.tags.slice(0, 2).join(' #')}</span>
                          ` : '')}
                        </div>
                        <button type="button" class="btn-resource-preview" onclick="window.previewAdminResource('${res.id}')">
                          ${window.renderIcon(format === 'video' ? 'play' : 'external-link', 'small-icon')}
                          <span>${format === 'video' ? 'Watch Video' : 'Open Material'}</span>
                        </button>
                      </div>
                    </div>
                  `;
                }).join('')}
              </div>
            `)}
          </div>
        `;
      } else if (window.activeAdminTab === 'subjects') {
        activeTabContent = `
          <div class="admin-two-col-grid">
            <!-- Create Subject Form -->
            <div class="widget-card">
              <h2 style="font-size:1.2rem; font-weight:800; margin-bottom:16px; display:flex; align-items:center; gap:8px;">
                ${window.renderIcon('plus-circle')} Add New Subject
              </h2>
              <form onsubmit="window.handleCreateSubjectSubmit(event)">
                <div style="display:flex; flex-direction:column; gap:12px;">
                  <div>
                    <label style="font-size:0.8rem; font-weight:700; display:block; margin-bottom:4px;">Subject ID / Code</label>
                    <input type="text" name="subId" required placeholder="e.g. history, chemistry, art" style="width:100%; padding:10px; border-radius:var(--radius-md); border:1px solid var(--border-color); background:var(--bg-card); color:var(--text-main);">
                    <span style="font-size:0.75rem; color:var(--text-subtle);">Unique short code in lowercase. Avoid spaces.</span>
                  </div>
                  <div>
                    <label style="font-size:0.8rem; font-weight:700; display:block; margin-bottom:4px;">Subject Name</label>
                    <input type="text" name="name" required placeholder="e.g. History & World Culture" style="width:100%; padding:10px; border-radius:var(--radius-md); border:1px solid var(--border-color); background:var(--bg-card); color:var(--text-main);">
                  </div>
                  <div class="admin-form-grid-2">
                    <div>
                      <label style="font-size:0.8rem; font-weight:700; display:block; margin-bottom:4px;">Lucide Icon Name</label>
                      <select name="icon" style="width:100%; padding:10px; border-radius:var(--radius-md); border:1px solid var(--border-color); background:var(--bg-card); color:var(--text-main);">
                        <option value="book" selected>Book</option>
                        <option value="cpu">CPU (Tech/AI)</option>
                        <option value="code">Code (Programming)</option>
                        <option value="calculator">Calculator (Math)</option>
                        <option value="zap">Zap (Physics)</option>
                        <option value="dna">DNA (Biology)</option>
                        <option value="flask-conical">Flask (Chemistry)</option>
                        <option value="globe">Globe (Geography/History)</option>
                        <option value="brain">Brain (Psychology)</option>
                        <option value="award">Award</option>
                      </select>
                    </div>
                    <div>
                      <label style="font-size:0.8rem; font-weight:700; display:block; margin-bottom:4px;">Theme Color Accent</label>
                      <div style="display:flex; gap:8px; align-items:center;">
                        <input type="color" name="color" value="#8b5cf6" style="padding:0; width:40px; height:40px; border:none; border-radius:4px; cursor:pointer; background:none;">
                        <span style="font-size:0.75rem; color:var(--text-subtle);">Color Accent</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <label style="font-size:0.8rem; font-weight:700; display:block; margin-bottom:4px;">Description</label>
                    <textarea name="description" required placeholder="Brief description of the subject..." style="width:100%; height:90px; padding:10px; border-radius:var(--radius-md); border:1px solid var(--border-color); background:var(--bg-card); color:var(--text-main); font-family:inherit; resize:vertical;"></textarea>
                  </div>
                  <button type="submit" class="btn-hero-primary" style="background:var(--primary-gradient); color:#fff; width:100%; padding:11px; justify-content:center;">
                    Create Subject
                  </button>
                </div>
              </form>
            </div>
            <!-- Existing Subjects List -->
            <div class="widget-card">
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px; flex-wrap:wrap; gap:10px;">
                <div>
                  <h2 style="font-size:1.2rem; font-weight:800; margin:0 0 4px 0; display:flex; align-items:center; gap:8px;">
                    ${window.renderIcon('book')} Registered Subjects
                    <span class="tag-pill" style="background:rgba(139,92,246,0.12); color:var(--color-purple); font-size:0.75rem; font-weight:800;">
                      ${subjects.length} ${subjects.length === 1 ? 'Subject' : 'Subjects'}
                    </span>
                  </h2>
                  <p style="font-size:0.82rem; color:var(--text-muted); margin:0;">
                    Subject domains, curriculum descriptions, and linked course metrics.
                  </p>
                </div>
                <div class="view-mode-toggle" style="display:flex; background:var(--bg-surface); border:1px solid var(--border-color); border-radius:var(--radius-sm); padding:2px;">
                  <button type="button" class="btn-view-toggle ${(window.subjectsViewMode || 'cards') === 'cards' ? 'active' : ''}" onclick="window.subjectsViewMode='cards'; AppState.notify();" title="Card View (Clean & No Horizontal Scroll)">
                    ${window.renderIcon('layout-grid', 'small-icon')} Cards
                  </button>
                  <button type="button" class="btn-view-toggle ${window.subjectsViewMode === 'table' ? 'active' : ''}" onclick="window.subjectsViewMode='table'; AppState.notify();" title="Table View">
                    ${window.renderIcon('list', 'small-icon')} Table
                  </button>
                </div>
              </div>

              ${subjects.length === 0 ? `
                <div style="text-align:center; padding:36px 16px; color:var(--text-muted);">
                  <div style="font-size:2.2rem; margin-bottom:8px;">📚</div>
                  <h3 style="font-size:1.05rem; font-weight:800; color:var(--text-main); margin-bottom:4px;">No subjects registered yet</h3>
                  <p style="font-size:0.82rem; margin:0 auto; max-width:340px;">Use the form to create and publish your first subject domain.</p>
                </div>
              ` : (window.subjectsViewMode === 'table' ? `
                <!-- Compact Table Mode -->
                <div class="table-responsive-wrapper">
                  <table class="admin-table subject-compact-table">
                    <thead>
                      <tr>
                        <th>Subject & Code</th>
                        <th>Color Theme</th>
                        <th>Description</th>
                        <th style="text-align:right;">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${subjects.map(s => {
                        const courseCount = courses.filter(c => (c.subjectId || '').toLowerCase() === s.id.toLowerCase()).length;
                        return `
                          <tr>
                            <td>
                              <div style="display:flex; align-items:center; gap:8px;">
                                <span style="color:${s.color || 'var(--primary-500)'}; display:flex; align-items:center; justify-content:center;">
                                  ${window.renderIcon(s.icon || 'book')}
                                </span>
                                <div style="display:flex; flex-direction:column; gap:2px;">
                                  <strong>${s.name}</strong>
                                  <span class="tag-pill" style="background:var(--bg-card); border:1px solid var(--border-color); font-size:0.72rem; width:fit-content;">${s.id}</span>
                                </div>
                              </div>
                            </td>
                            <td>
                              <div style="display:flex; align-items:center; gap:6px;">
                                <span style="display:inline-block; width:12px; height:12px; border-radius:50%; background:${s.color || '#ccc'};"></span>
                                <span style="font-family:monospace; font-size:0.8rem;">${s.color || '#ccc'}</span>
                              </div>
                            </td>
                            <td style="font-size:0.85rem; color:var(--text-muted); line-height:1.4;">${s.description || ''}</td>
                            <td style="text-align:right;">
                              <button type="button" class="btn-table-action" style="padding:6px 10px; border-radius:var(--radius-xs); border:1px solid #fca5a5; background:#fee2e2; color:#ef4444; font-size:0.8rem; font-weight:700; cursor:pointer;" onclick="window.deleteSubjectConfirm('${s.id}')" title="Delete Subject">
                                ${window.renderIcon('trash-2', 'small-icon')}
                              </button>
                            </td>
                          </tr>
                        `;
                      }).join('')}
                    </tbody>
                  </table>
                </div>
              ` : `
                <!-- Premium Scroll-Free Responsive Cards Mode (Default) -->
                <div class="subject-cards-list">
                  ${subjects.map(s => {
                    const courseCount = courses.filter(c => (c.subjectId || '').toLowerCase() === s.id.toLowerCase()).length;
                    const resCount = resources.filter(r => (r.subjectId || '').toLowerCase() === s.id.toLowerCase()).length;
                    const color = s.color || '#8b5cf6';
                    return `
                      <div class="admin-subject-card">
                        <!-- Top Row: Icon, Title, ID, Color Swatch & Delete -->
                        <div class="subject-card-top">
                          <div class="subject-card-identity">
                            <div class="subject-icon-box" style="background:${color}18; color:${color}; border:1.5px solid ${color}35;">
                              ${window.renderIcon(s.icon || 'book')}
                            </div>
                            <div class="subject-card-info">
                              <h3 class="subject-card-name">${s.name}</h3>
                              <div class="subject-card-badges">
                                <span class="tag-pill subject-id-badge" style="background:var(--bg-card); border:1px solid var(--border-color); color:var(--text-muted);">
                                  code: <strong>${s.id}</strong>
                                </span>
                                <span class="subject-color-pill">
                                  <span style="display:inline-block; width:9px; height:9px; border-radius:50%; background:${color};"></span>
                                  <span style="font-family:monospace; font-size:0.75rem;">${color}</span>
                                </span>
                              </div>
                            </div>
                          </div>

                          <div class="subject-card-actions">
                            <button type="button" class="btn-subject-delete" onclick="window.deleteSubjectConfirm('${s.id}')" title="Delete Subject">
                              ${window.renderIcon('trash-2', 'small-icon')}
                            </button>
                          </div>
                        </div>

                        <!-- Description: Fully readable with zero horizontal scrolling -->
                        <p class="subject-desc-text">${s.description || 'No description provided.'}</p>

                        <!-- Bottom Metrics & Exploration Shortcut -->
                        <div class="subject-card-bottom">
                          <div class="subject-metric-pills">
                            <button type="button" class="subject-link-pill" onclick="window.courseDirectorySubject='${s.id}'; window.activeAdminTab='course-directory'; AppState.notify();" title="View courses for ${window.escapeHtmlAttr(s.name)}">
                              ${window.renderIcon('graduation-cap', 'small-icon')}
                              <span>${courseCount} ${courseCount === 1 ? 'Course' : 'Courses'}</span>
                            </button>
                            <button type="button" class="subject-link-pill" onclick="window.resourceCatalogSubject='${s.id}'; window.activeAdminTab='resources'; AppState.notify();" title="View resources for ${window.escapeHtmlAttr(s.name)}">
                              ${window.renderIcon('book-open', 'small-icon')}
                              <span>${resCount} ${resCount === 1 ? 'Resource' : 'Resources'}</span>
                            </button>
                          </div>

                          <button type="button" class="btn-filter-by-subject" onclick="window.courseDirectorySubject='${s.id}'; window.activeAdminTab='course-directory'; AppState.notify();">
                            <span>Explore Domain</span>
                            ${window.renderIcon('arrow-right', 'small-icon')}
                          </button>
                        </div>
                      </div>
                    `;
                  }).join('')}
                </div>
              `)}
            </div>
          </div>
        `;
      } else if (window.activeAdminTab === 'quizzes') {
        const quizzes = (state.data && state.data.quizzes && state.data.quizzes.length > 0) ? state.data.quizzes : (window.ALL_SUBJECT_QUIZZES || []);
        window.quizSubView = window.quizSubView || 'list';
        if (!window.quizBuilder) window.initQuizBuilderState();

        if (window.quizSubView === 'create') {
          activeTabContent = `
            <div class="widget-card" style="max-width:800px; margin:0 auto; width:100%;">
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; flex-wrap:wrap; gap:10px;">
                <div>
                  <h2 style="font-size:1.3rem; font-weight:800; display:flex; align-items:center; gap:8px; margin:0;">
                    ${window.renderIcon('plus-circle')} Create Dynamic Quiz
                  </h2>
                  <p style="font-size:0.84rem; color:var(--text-muted); margin-top:4px; margin-bottom:0;">
                    Design subject-based assessments with multiple-choice questions for students.
                  </p>
                </div>
                <button type="button" class="btn-table-action" style="padding:7px 14px; font-weight:700; border-radius:var(--radius-sm); border:1px solid var(--border-color); background:var(--bg-surface); color:var(--text-main); display:inline-flex; align-items:center; gap:6px;" onclick="window.quizSubView='list'; AppState.notify();">
                  ${window.renderIcon('list', 'small-icon')} View Quizzes (${quizzes.length})
                </button>
              </div>

              <form onsubmit="window.handleCreateQuizSubmit(event)">
                <div style="display:flex; flex-direction:column; gap:16px;">
                  <div>
                    <label style="font-size:0.82rem; font-weight:700; display:block; margin-bottom:4px;">Quiz Title</label>
                    <input type="text" name="quizTitle" required placeholder="e.g. Artificial Intelligence Fundamentals Quiz" value="${window.escapeHtmlAttr(window.quizBuilder.title || '')}" oninput="window.quizBuilder.title=this.value" style="width:100%; padding:11px 12px; border-radius:var(--radius-md); border:1px solid var(--border-color); background:var(--bg-card); color:var(--text-main);">
                  </div>

                  <div class="admin-form-grid-3" style="display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:12px;">
                    <div>
                      <label style="font-size:0.82rem; font-weight:700; display:block; margin-bottom:4px;">Subject</label>
                      <select name="quizSubjectId" required style="width:100%; padding:11px 12px; border-radius:var(--radius-md); border:1px solid var(--border-color); background:var(--bg-card); color:var(--text-main);" onchange="window.quizBuilder.subjectId=this.value">
                        <option value="" disabled ${!window.quizBuilder.subjectId ? 'selected' : ''}>Select Subject</option>
                        ${subjects.map(s => `<option value="${s.id}" ${window.quizBuilder.subjectId === s.id ? 'selected' : ''}>${s.name}</option>`).join('')}
                      </select>
                    </div>
                    <div>
                      <label style="font-size:0.82rem; font-weight:700; display:block; margin-bottom:4px;">Tier / Category</label>
                      <select name="quizLevel" required style="width:100%; padding:11px 12px; border-radius:var(--radius-md); border:1px solid var(--border-color); background:var(--bg-card); color:var(--text-main);" onchange="window.quizBuilder.level=this.value">
                        <option value="Beginner" ${window.quizBuilder.level === 'Beginner' ? 'selected' : ''}>Beginner (5 Questions)</option>
                        <option value="Intermediate" ${window.quizBuilder.level === 'Intermediate' ? 'selected' : ''}>Intermediate (10 Questions)</option>
                        <option value="Advanced" ${window.quizBuilder.level === 'Advanced' ? 'selected' : ''}>Advanced (15 Questions)</option>
                      </select>
                    </div>
                    <div>
                      <label style="font-size:0.82rem; font-weight:700; display:block; margin-bottom:4px;">Time Limit (Minutes)</label>
                      <input type="number" name="quizTimeLimit" min="1" max="120" value="${window.quizBuilder.timeLimitMinutes || 10}" oninput="window.quizBuilder.timeLimitMinutes=parseInt(this.value)||10" required style="width:100%; padding:11px 12px; border-radius:var(--radius-md); border:1px solid var(--border-color); background:var(--bg-card); color:var(--text-main);">
                    </div>
                  </div>

                  <div style="margin-top:10px;">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
                      <h3 style="font-size:1.05rem; font-weight:800; margin:0;">Quiz Questions (${window.quizBuilder.questions.length})</h3>
                      <button type="button" class="btn-table-action" style="padding:6px 12px; font-weight:700; border-radius:var(--radius-sm); border:1px solid var(--border-color); background:var(--color-teal-light); color:var(--color-teal-action); display:inline-flex; align-items:center; gap:5px;" onclick="window.addQuizQuestionField()">
                        ${window.renderIcon('plus', 'small-icon')} Add Question
                      </button>
                    </div>

                    <div style="display:flex; flex-direction:column; gap:16px;">
                      ${window.quizBuilder.questions.map((q, qIdx) => `
                        <div class="admin-quiz-q-card" style="padding:16px; border:1px solid var(--border-color); border-radius:var(--radius-md); background:var(--bg-surface);">
                          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
                            <span style="font-weight:700; font-size:0.9rem; color:var(--primary-500);">Question #${qIdx + 1}</span>
                            ${window.quizBuilder.questions.length > 1 ? `
                              <button type="button" style="background:#fee2e2; border:1px solid #fca5a5; color:#ef4444; border-radius:var(--radius-xs); padding:4px 8px; font-size:0.75rem; font-weight:700; cursor:pointer;" onclick="window.removeQuizQuestionField(${qIdx})">
                                ${window.renderIcon('trash-2', 'small-icon')} Remove
                              </button>
                            ` : ''}
                          </div>

                          <div style="margin-bottom:10px;">
                            <input type="text" name="q_text_${qIdx}" placeholder="Enter question text here..." required value="${window.escapeHtmlAttr(q.question || '')}" oninput="window.quizBuilder.questions[${qIdx}].question=this.value" style="width:100%; padding:9px 12px; border-radius:var(--radius-sm); border:1px solid var(--border-color); background:var(--bg-card); color:var(--text-main); font-size:0.9rem;">
                          </div>

                          <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-bottom:10px;">
                            <div>
                              <label style="font-size:0.75rem; font-weight:600; color:var(--text-muted);">Option A</label>
                              <input type="text" name="q_opt_${qIdx}_0" required placeholder="Option A" value="${window.escapeHtmlAttr((q.options && q.options[0]) || '')}" oninput="window.quizBuilder.questions[${qIdx}].options[0]=this.value" style="width:100%; padding:8px 10px; border-radius:var(--radius-xs); border:1px solid var(--border-color); background:var(--bg-card); color:var(--text-main); font-size:0.85rem;">
                            </div>
                            <div>
                              <label style="font-size:0.75rem; font-weight:600; color:var(--text-muted);">Option B</label>
                              <input type="text" name="q_opt_${qIdx}_1" required placeholder="Option B" value="${window.escapeHtmlAttr((q.options && q.options[1]) || '')}" oninput="window.quizBuilder.questions[${qIdx}].options[1]=this.value" style="width:100%; padding:8px 10px; border-radius:var(--radius-xs); border:1px solid var(--border-color); background:var(--bg-card); color:var(--text-main); font-size:0.85rem;">
                            </div>
                            <div>
                              <label style="font-size:0.75rem; font-weight:600; color:var(--text-muted);">Option C</label>
                              <input type="text" name="q_opt_${qIdx}_2" required placeholder="Option C" value="${window.escapeHtmlAttr((q.options && q.options[2]) || '')}" oninput="window.quizBuilder.questions[${qIdx}].options[2]=this.value" style="width:100%; padding:8px 10px; border-radius:var(--radius-xs); border:1px solid var(--border-color); background:var(--bg-card); color:var(--text-main); font-size:0.85rem;">
                            </div>
                            <div>
                              <label style="font-size:0.75rem; font-weight:600; color:var(--text-muted);">Option D</label>
                              <input type="text" name="q_opt_${qIdx}_3" required placeholder="Option D" value="${window.escapeHtmlAttr((q.options && q.options[3]) || '')}" oninput="window.quizBuilder.questions[${qIdx}].options[3]=this.value" style="width:100%; padding:8px 10px; border-radius:var(--radius-xs); border:1px solid var(--border-color); background:var(--bg-card); color:var(--text-main); font-size:0.85rem;">
                            </div>
                          </div>

                          <div style="display:grid; grid-template-columns:140px 1fr; gap:10px; align-items:center;">
                            <div>
                              <label style="font-size:0.75rem; font-weight:700; color:var(--color-emerald); display:block; margin-bottom:2px;">Correct Answer</label>
                              <select name="q_correct_${qIdx}" style="width:100%; padding:8px 10px; border-radius:var(--radius-xs); border:1px solid var(--border-color); background:var(--bg-card); color:var(--text-main); font-size:0.85rem; font-weight:700;" onchange="window.quizBuilder.questions[${qIdx}].correctIndex=parseInt(this.value)">
                                <option value="0" ${q.correctIndex === 0 ? 'selected' : ''}>Option A</option>
                                <option value="1" ${q.correctIndex === 1 ? 'selected' : ''}>Option B</option>
                                <option value="2" ${q.correctIndex === 2 ? 'selected' : ''}>Option C</option>
                                <option value="3" ${q.correctIndex === 3 ? 'selected' : ''}>Option D</option>
                              </select>
                            </div>
                            <div>
                              <label style="font-size:0.75rem; font-weight:600; color:var(--text-muted); display:block; margin-bottom:2px;">Explanation (Optional)</label>
                              <input type="text" name="q_exp_${qIdx}" placeholder="Explanation for correct answer..." value="${window.escapeHtmlAttr(q.explanation || '')}" oninput="window.quizBuilder.questions[${qIdx}].explanation=this.value" style="width:100%; padding:8px 10px; border-radius:var(--radius-xs); border:1px solid var(--border-color); background:var(--bg-card); color:var(--text-main); font-size:0.85rem;">
                            </div>
                          </div>
                        </div>
                      `).join('')}
                    </div>
                  </div>

                  <div style="display:flex; gap:12px; margin-top:8px;">
                    <button type="submit" class="btn-hero-primary" style="background:var(--primary-gradient); color:#fff; flex:1; padding:12px; justify-content:center; font-size:0.95rem; font-weight:800; border-radius:var(--radius-md);">
                      ${window.renderIcon('check-circle')} Save & Publish Quiz to Firebase
                    </button>
                    <button type="button" class="btn-table-action" style="padding:12px 20px; font-weight:700; border-radius:var(--radius-md); border:1px solid var(--border-color); background:var(--bg-surface); color:var(--text-main);" onclick="window.quizSubView='list'; AppState.notify();">
                      Cancel
                    </button>
                  </div>
                </div>
              </form>
            </div>
          `;
        } else {
          activeTabContent = `
            <div class="widget-card" style="width:100%;">
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; flex-wrap:wrap; gap:12px;">
                <div>
                  <h2 style="font-size:1.3rem; font-weight:800; display:flex; align-items:center; gap:8px; margin:0;">
                    ${window.renderIcon('award')} Skill Quizzes Directory (${quizzes.length})
                  </h2>
                  <p style="font-size:0.84rem; color:var(--text-muted); margin-top:4px; margin-bottom:0;">
                    All dynamic quizzes created and synced with Firebase Firestore.
                  </p>
                </div>
                <button type="button" class="btn-hero-primary" style="background:var(--primary-gradient); color:#fff; padding:9px 18px; border-radius:var(--radius-md); font-weight:800; display:inline-flex; align-items:center; gap:6px;" onclick="window.quizSubView='create'; AppState.notify();">
                  ${window.renderIcon('plus-circle')} Create New Quiz
                </button>
              </div>

              ${quizzes.length === 0 ? `
                <div style="text-align:center; padding:48px 20px; background:var(--bg-surface); border-radius:var(--radius-md); border:1px dashed var(--border-color);">
                  <div style="font-size:2.5rem; margin-bottom:12px;">🏆</div>
                  <h3 style="font-size:1.15rem; font-weight:800; margin-bottom:6px;">No Quizzes Created Yet</h3>
                  <p style="color:var(--text-muted); font-size:0.88rem; max-width:380px; margin:0 auto 16px;">Create quizzes dynamically with custom questions and tier levels for your students.</p>
                  <button type="button" class="btn-hero-primary" style="background:var(--primary-gradient); color:#fff; padding:9px 18px; border-radius:var(--radius-md); font-weight:800; display:inline-flex; align-items:center; gap:6px;" onclick="window.quizSubView='create'; AppState.notify();">
                    ${window.renderIcon('plus-circle')} Create First Quiz
                  </button>
                </div>
              ` : `
                <div class="table-responsive-wrapper">
                  <table class="admin-table">
                    <thead>
                      <tr>
                        <th>Quiz Title</th>
                        <th>Subject</th>
                        <th>Tier / Category</th>
                        <th style="text-align:center;">Questions</th>
                        <th style="text-align:center;">Time Limit</th>
                        <th style="text-align:right;">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${quizzes.map(q => {
                        const sub = subjects.find(s => s.id === q.subjectId) || { name: q.subjectId || 'General' };
                        const qCount = q.questions ? q.questions.length : (q.questionCount || 0);
                        return `
                          <tr>
                            <td>
                              <div style="font-weight:700; color:var(--text-main); font-size:0.92rem;">${q.title}</div>
                              <div style="font-size:0.75rem; color:var(--text-muted); font-family:monospace;">ID: ${q.id}</div>
                            </td>
                            <td>
                              <span style="font-size:0.82rem; font-weight:600; color:var(--text-main);">${sub.name}</span>
                            </td>
                            <td>
                              <span class="quiz-tier-badge ${(q.level || 'beginner').toLowerCase()}" style="font-size:0.78rem;">
                                ${q.level || 'Beginner'}
                              </span>
                            </td>
                            <td style="text-align:center; font-weight:700;">
                              ${qCount}
                            </td>
                            <td style="text-align:center; font-size:0.85rem; color:var(--text-muted);">
                              ${q.timeLimitMinutes || 10} Mins
                            </td>
                            <td style="text-align:right;">
                              <button type="button" class="btn-table-action" style="padding:6px 12px; border-radius:var(--radius-xs); border:1px solid #fca5a5; background:#fee2e2; color:#ef4444; font-size:0.8rem; font-weight:700; cursor:pointer; display:inline-flex; align-items:center; gap:4px;" onclick="window.handleDeleteQuiz('${q.id}')" title="Delete Quiz">
                                ${window.renderIcon('trash-2', 'small-icon')} Delete
                              </button>
                            </td>
                          </tr>
                        `;
                      }).join('')}
                    </tbody>
                  </table>
                </div>
              `}
            </div>
          `;
        }
      } else {
        activeTabContent = '';
      }

      return `
        <div class="page-header">
          <h1 class="page-title">${window.renderIcon('settings')} Admin Control Panel</h1>
          <p class="page-subtitle">Manage courses, videos, assignments, and resource libraries dynamically with Firebase Firestore.</p>
        </div>

        <div class="stats-grid admin-stats-grid" style="margin-bottom:28px;">
          <div class="stat-card admin-stat-card blue clickable-stat-card" onclick="window.activeAdminTab='submissions'; AppState.notify();" title="View Registered Students">
            <div class="admin-stat-icon-wrapper blue">
              ${window.renderIcon('users')}
            </div>
            <div class="admin-stat-info">
              <div class="stat-value" data-count="${totalRegisteredStudents}">${totalRegisteredStudents.toLocaleString()}</div>
              <div class="stat-label">Total Registered Students</div>
            </div>
          </div>
          <div class="stat-card admin-stat-card emerald clickable-stat-card" onclick="window.activeAdminTab='submissions'; AppState.notify();" title="View Active Students">
            <div class="admin-stat-icon-wrapper emerald">
              ${window.renderIcon('user-check')}
            </div>
            <div class="admin-stat-info">
              <div class="stat-value" data-count="${totalActiveStudents}">${totalActiveStudents.toLocaleString()}</div>
              <div class="stat-label">Total Active Students</div>
            </div>
          </div>
          <div class="stat-card admin-stat-card amber clickable-stat-card" onclick="window.activeAdminTab='quizzes'; AppState.notify();" title="View Quizzes">
            <div class="admin-stat-icon-wrapper amber">
              ${window.renderIcon('award')}
            </div>
            <div class="admin-stat-info">
              <div class="stat-value" data-count="${(state.data && state.data.quizzes) ? state.data.quizzes.length : 0}">${((state.data && state.data.quizzes) ? state.data.quizzes.length : 0).toLocaleString()}</div>
              <div class="stat-label">Active Quizzes</div>
            </div>
          </div>
          <div class="stat-card admin-stat-card purple clickable-stat-card" onclick="window.activeAdminTab='course-directory'; AppState.notify();" title="View Course Directory">
            <div class="admin-stat-icon-wrapper purple">
              ${window.renderIcon('graduation-cap')}
            </div>
            <div class="admin-stat-info">
              <div class="stat-value" data-count="${courses.length}">${courses.length.toLocaleString()}</div>
              <div class="stat-label">Published Courses</div>
            </div>
          </div>
        </div>

        <!-- Tab Buttons -->
        <div class="admin-tab-bar">
          <button class="tab-btn ${window.activeAdminTab === 'courses' ? 'active' : ''}" onclick="window.activeAdminTab='courses'; AppState.notify();">
            ${window.renderIcon('plus-circle')} Create Course
          </button>
          <button class="tab-btn ${window.activeAdminTab === 'course-directory' ? 'active' : ''}" onclick="window.activeAdminTab='course-directory'; AppState.notify();">
            ${window.renderIcon('graduation-cap')} Course Directory <span class="tab-count-badge">${courses.length}</span>
          </button>
          <button class="tab-btn ${window.activeAdminTab === 'videos' ? 'active' : ''}" onclick="window.activeAdminTab='videos'; AppState.notify();">
            ${window.renderIcon('video')} Add Video Lessons
          </button>
          <button class="tab-btn ${window.activeAdminTab === 'quizzes' ? 'active' : ''}" onclick="window.activeAdminTab='quizzes'; AppState.notify();">
            ${window.renderIcon('award')} Skill Quizzes <span class="tab-count-badge">${(state.data && state.data.quizzes) ? state.data.quizzes.length : 0}</span>
          </button>
          <button class="tab-btn ${window.activeAdminTab === 'assignments' ? 'active' : ''}" onclick="window.activeAdminTab='assignments'; AppState.notify();">
            ${window.renderIcon('file-text')} Course Assignments
          </button>
          <button class="tab-btn tab-btn-wide ${window.activeAdminTab === 'submissions' ? 'active' : ''}" onclick="window.activeAdminTab='submissions'; AppState.notify();">
            ${window.renderIcon('users')} Student Activity & Submissions
          </button>
          <button class="tab-btn ${window.activeAdminTab === 'resources' ? 'active' : ''}" onclick="window.activeAdminTab='resources'; AppState.notify();">
            ${window.renderIcon('book-open')} Global Resources
          </button>
          <button class="tab-btn ${window.activeAdminTab === 'subjects' ? 'active' : ''}" onclick="window.activeAdminTab='subjects'; AppState.notify();">
            ${window.renderIcon('book')} Manage Subjects
          </button>
        </div>

        <div>
          ${activeTabContent}
        </div>
      `;
    }
  };

  // Export to window
  window.AdminView = AdminView;
  window.renderAdmin = function() {
    return AdminView.render();
  };
})();
