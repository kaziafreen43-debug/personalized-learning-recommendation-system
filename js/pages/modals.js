/**
 * ============================================================================
 * MODALS CONTROLLER & VIEWS MODULE (MVME Architecture)
 * Layer: View & View Machine (Overlays, Auth, Questionnaire, Quiz & MCQ Test Runner)
 * ============================================================================
 */

(function() {
  // --------------------------------------------------------------------------
  // VIEW MACHINE: Modals State & Handlers
  // --------------------------------------------------------------------------
  let currentQuizStep = 0;
  let quizAnswers = {};

  window.toggleLoginPasswordVisibility = function() {
    const input = document.getElementById('loginPassword');
    const btn = document.getElementById('loginPasswordToggleBtn');
    if (!input || !btn) return;
    if (input.type === 'password') {
      input.type = 'text';
      btn.innerHTML = window.renderIcon('eye-off');
    } else {
      input.type = 'password';
      btn.innerHTML = window.renderIcon('eye');
    }
    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons();
    }
  };

  window.toggleRegisterPasswordVisibility = function() {
    const input = document.getElementById('regPassword');
    const btn = document.getElementById('passwordToggleBtn');
    if (!input || !btn) return;
    if (input.type === 'password') {
      input.type = 'text';
      btn.innerHTML = window.renderIcon('eye-off');
    } else {
      input.type = 'password';
      btn.innerHTML = window.renderIcon('eye');
    }
    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons();
    }
  };

  window.handleRegisterSubmit = function(form) {
    const nameInput = form.querySelector('input[name="regName"]');
    const emailInput = form.querySelector('input[name="regEmail"]') || form.querySelector('input[type="email"]');
    const passInput = form.querySelector('input[name="regPassword"]') || form.querySelector('input[type="password"]');
    const regName = nameInput ? nameInput.value.trim() : '';
    const regEmail = emailInput ? emailInput.value.trim() : '';
    const regPassword = passInput ? passInput.value : '';
    window.AppState.openModal('questionnaire', { name: regName, email: regEmail, password: regPassword, isNewRegistration: true });
  };

  window.submitQuestionnaireForm = function(form) {
    const errorBanner = document.getElementById('questionnaire-error-banner');
    if (errorBanner) {
      errorBanner.style.display = 'none';
    }

    const fields = [
      { id: 'nameInput', errId: 'nameError', msg: 'Please enter your name.' },
      { id: 'gradeClassSelect', errId: 'gradeClassError', msg: 'Please select your grade.' },
      { id: 'skillLevelSelect', errId: 'skillLevelError', msg: 'Please select your current skill level.' }
    ];

    let hasErrors = false;

    fields.forEach(f => {
      const el = document.getElementById(f.id);
      const errEl = document.getElementById(f.errId);
      const val = el ? el.value.trim() : '';

      if (!val || val === '') {
        hasErrors = true;
        if (el) {
          el.style.border = '2px solid var(--color-rose)';
        }
        if (errEl) {
          errEl.style.display = 'block';
        }
      } else {
        if (el) {
          el.style.border = '1px solid var(--border-color)';
        }
        if (errEl) {
          errEl.style.display = 'none';
        }
      }
    });

    const checkedInterests = Array.from(form.querySelectorAll('input[name="interests"]:checked'));
    const interestsError = document.getElementById('interestsError');
    if (checkedInterests.length === 0) {
      hasErrors = true;
      if (interestsError) {
        interestsError.style.display = 'block';
      }
    } else {
      if (interestsError) {
        interestsError.style.display = 'none';
      }
    }

    if (hasErrors) {
      if (errorBanner) {
        errorBanner.innerText = 'Please fill all required fields before generating AI recommendations.';
        errorBanner.style.display = 'block';
        const modalContent = document.querySelector('.modal-content');
        if (modalContent) {
          modalContent.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }
      return;
    }

    const selectedInterests = checkedInterests.map(cb => cb.value);
    const formData = {
      name: document.getElementById('nameInput').value.trim(),
      gradeClass: document.getElementById('gradeClassSelect').value,
      skillLevel: document.getElementById('skillLevelSelect').value,
      preferredStyle: form.preferredStyle.value,
      careerGoal: form.careerGoal.value,
      interests: selectedInterests
    };
    window.AppState.submitQuestionnaire(formData);
  };

  window.submitQuizAnswer = function(quizId, qId, selectedIdx, correctIdx) {
    quizAnswers[qId] = selectedIdx;
    window.AppState.notify();
  };

  window.nextQuizStep = function(quizId, total) {
    if (currentQuizStep < total - 1) {
      currentQuizStep++;
    } else {
      const quizzes = (window.AppState.data && window.AppState.data.quizzes) ? window.AppState.data.quizzes : [];
      const quiz = quizzes.find(q => q.id === quizId) || quizzes[0];
      let correct = 0;
      if (quiz && quiz.questions) {
        quiz.questions.forEach(q => {
          if (quizAnswers[q.id] === q.correctIndex) correct++;
        });
      }
      const scorePct = Math.round((correct / (quiz && quiz.questions ? quiz.questions.length : 1)) * 100);

      currentQuizStep = 0;
      quizAnswers = {};
      
      window.AppState.saveQuizResult(quizId, scorePct);
    }
    window.AppState.notify();
  };

  window.submitNewResource = function(form) {
    const subjectId = form.subjectId.value;
    if (!subjectId || subjectId === 'ADD_NEW_SUBJECT') {
      alert("Please select a valid subject.");
      return;
    }

    const data = {
      title: form.title.value,
      subjectId: subjectId,
      format: form.format.value,
      level: 'Intermediate',
      duration: '30 mins',
      vark: ['visual', 'kinesthetic'],
      description: form.description.value
    };
    window.AppState.addResource(data);
    window.AppState.closeModal();
  };

  window.handleSubmitAssignmentForm = function(e) {
    e.preventDefault();
    const form = e.target;
    const assignmentId = form.assignmentId.value;
    const courseId = form.courseId.value;
    const text = form.submissionText.value.trim();
    const link = form.submissionLink.value.trim();

    window.AppState.submitAssignment(assignmentId, courseId, text, link);
    alert("Assignment successfully submitted and sync'd to Firebase!");
    window.AppState.closeModal();
  };

  // ==========================================================================
  // STUDENT MCQ ASSIGNMENT TEST RUNNER & AUTO-GRADING MACHINE
  // ==========================================================================
  window.studentAssignmentSession = null;

  window.selectStudentMCQOption = function(qId, optIdx) {
    if (!window.studentAssignmentSession) return;
    window.studentAssignmentSession.answers[qId] = optIdx;

    const card = document.querySelector(`.mcq-student-card[data-qid="${qId}"]`);
    if (card) {
      const options = card.querySelectorAll('.mcq-student-option');
      options.forEach((opt, idx) => {
        const isSelected = idx === optIdx;
        opt.classList.toggle('selected', isSelected);
      });
    }

    const pill = document.querySelector(`.mcq-pill-btn[data-qid="${qId}"]`);
    if (pill) {
      pill.classList.add('answered');
    }

    const total = window.studentAssignmentSession.totalQuestions || 1;
    const answeredCount = Object.keys(window.studentAssignmentSession.answers).length;
    const fillEl = document.getElementById('mcqProgressFill');
    if (fillEl) fillEl.style.width = `${Math.round((answeredCount / total) * 100)}%`;
    const labelEl = document.getElementById('mcqProgressLabel');
    if (labelEl) labelEl.textContent = `Answered ${answeredCount} of ${total}`;
  };

  window.setStudentAssignmentStep = function(step) {
    if (!window.studentAssignmentSession) return;
    window.studentAssignmentSession.currentStep = step;
    window.AppState.notify();
  };

  window.toggleStudentAssignmentViewMode = function(mode) {
    if (!window.studentAssignmentSession) return;
    window.studentAssignmentSession.viewMode = mode;
    window.AppState.notify();
  };

  window.submitStudentMCQ = function(assignmentId) {
    const state = window.AppState;
    const assignment = (state.data && state.data.assignments) ? state.data.assignments.find(a => a.id === assignmentId) : null;
    if (!assignment || !window.studentAssignmentSession) return;

    const questions = assignment.questions || [];
    const totalQuestions = questions.length;
    const answeredCount = Object.keys(window.studentAssignmentSession.answers).length;
    const unanswered = totalQuestions - answeredCount;

    if (unanswered > 0) {
      if (!confirm(`You have ${unanswered} unanswered question(s). Unanswered questions will receive 0 marks. Do you want to submit your assignment now?`)) {
        return;
      }
    }

    let correctCount = 0;
    let wrongCount = 0;
    questions.forEach(q => {
      const studentAns = window.studentAssignmentSession.answers[q.id];
      if (studentAns !== undefined && Number(studentAns) === Number(q.correctAnswer)) {
        correctCount++;
      } else {
        wrongCount++;
      }
    });

    const percentage = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
    const maxPoints = Number(assignment.points) || 100;
    const score = Math.round((correctCount / (totalQuestions || 1)) * maxPoints);
    const passed = percentage >= 50;

    const mcqData = {
      score: score,
      maxPoints: maxPoints,
      percentage: percentage,
      correctCount: correctCount,
      wrongCount: wrongCount,
      totalQuestions: totalQuestions,
      answers: { ...window.studentAssignmentSession.answers },
      passed: passed,
      status: 'graded'
    };

    const sub = window.AppState.submitAssignment(assignment.id, assignment.courseId, '', '', mcqData);
    window.studentAssignmentSession.isSubmitted = true;
    window.studentAssignmentSession.submission = sub;
    window.AppState.notify();
  };

  window.retakeStudentMCQAssignment = function(assignmentId) {
    window.studentAssignmentSession = {
      assignmentId: assignmentId,
      currentStep: 0,
      viewMode: 'single',
      answers: {},
      isSubmitted: false,
      submission: null
    };
    window.AppState.notify();
  };

  // --------------------------------------------------------------------------
  // VIEW: Presentation Templates
  // --------------------------------------------------------------------------
  const ModalsView = {
    renderHelpCenterModalContent: function() {
      return `
        <div>
          <div style="text-align:center; margin-bottom:20px;">
            <div style="width:48px; height:48px; border-radius:50%; background:rgba(15, 118, 110, 0.1); color:#0f766e; display:inline-flex; align-items:center; justify-content:center; margin-bottom:10px;">
              ${window.renderIcon('help-circle')}
            </div>
            <h2 style="font-size:1.5rem; font-weight:800; margin-bottom:6px; color:var(--text-main);">Help Center & FAQ</h2>
            <p style="color:var(--text-muted); font-size:0.88rem;">Everything you need to know about navigating and learning on LearnAI Pro.</p>
          </div>

          <div style="display:flex; flex-direction:column; gap:12px; margin-bottom:24px;">
            <div style="padding:14px; background:var(--bg-card); border:1px solid var(--border-color); border-radius:var(--radius-md);">
              <div style="font-weight:700; font-size:0.92rem; margin-bottom:4px; display:flex; align-items:center; gap:6px; color:var(--text-main);">
                ${window.renderIcon('sparkles')} How do AI recommendations work?
              </div>
              <div style="font-size:0.82rem; color:var(--text-muted); line-height:1.5;">
                Recommendations adapt dynamically to your student profile questionnaire, selected interests, skill level, and preferred learning modality.
              </div>
            </div>

            <div style="padding:14px; background:var(--bg-card); border:1px solid var(--border-color); border-radius:var(--radius-md);">
              <div style="font-weight:700; font-size:0.92rem; margin-bottom:4px; display:flex; align-items:center; gap:6px; color:var(--text-main);">
                ${window.renderIcon('git-branch')} How do I track roadmaps & assessments?
              </div>
              <div style="font-size:0.82rem; color:var(--text-muted); line-height:1.5;">
                Use the Roadmaps drawer to follow weekly subject milestones, and complete Assessments to earn verified mastery certificates and badges.
              </div>
            </div>

            <div style="padding:14px; background:var(--bg-card); border:1px solid var(--border-color); border-radius:var(--radius-md);">
              <div style="font-weight:700; font-size:0.92rem; margin-bottom:4px; display:flex; align-items:center; gap:6px; color:var(--text-main);">
                ${window.renderIcon('bot')} How can I ask the AI Tutor?
              </div>
              <div style="font-size:0.82rem; color:var(--text-muted); line-height:1.5;">
                Tap "Ask AI Tutor" in the navigation drawer or tap the floating robot icon at the bottom right. Voice speech-to-text and instant academic explanations are supported!
              </div>
            </div>
          </div>

          <div style="display:flex; gap:10px; justify-content:flex-end;">
            <button class="btn-hero-secondary" style="padding:10px 18px; font-size:0.85rem;" onclick="AppState.closeModal()">
              Close
            </button>
            <button class="btn-hero-primary" style="background:var(--primary-gradient); color:#fff; padding:10px 18px; font-size:0.85rem; display:flex; align-items:center; gap:6px;" onclick="AppState.closeModal(); if(window.AIChatbot) window.AIChatbot.toggle();">
              ${window.renderIcon('bot')} Launch AI Tutor
            </button>
          </div>
        </div>
      `;
    },

    renderLoginModalContent: function() {
      return `
        <div>
          <h2 style="font-size:1.6rem; font-weight:800; margin-bottom:8px; text-align:center;">Welcome Back</h2>
          <p style="color:var(--text-muted); text-align:center; margin-bottom:24px;">Log in to access your personalized learning recommendations.</p>

          <form onsubmit="event.preventDefault(); AppState.loginUser(this.email.value, document.getElementById('loginPassword').value);" autocomplete="on">
            <div style="display:flex; flex-direction:column; gap:16px;">
              <div>
                <label style="font-size:0.85rem; font-weight:700; margin-bottom:4px; display:block;">Email Address</label>
                <input type="email" name="email" placeholder="Email Address" required autocomplete="email" style="width:100%; padding:12px; border-radius:var(--radius-md); border:1px solid var(--border-color); background:var(--bg-card); color:var(--text-main);">
              </div>
              <div>
                <label style="font-size:0.85rem; font-weight:700; margin-bottom:4px; display:block;">Password</label>
                <div style="position:relative; width:100%;">
                  <input type="password" id="loginPassword" placeholder="Password" required autocomplete="current-password" style="width:100%; padding:12px 42px 12px 12px; border-radius:var(--radius-md); border:1px solid var(--border-color); background:var(--bg-card); color:var(--text-main);">
                  <button type="button" onclick="window.toggleLoginPasswordVisibility()" style="position:absolute; right:12px; top:50%; transform:translateY(-50%); color:var(--text-muted); padding:4px; display:flex; align-items:center; justify-content:center;" id="loginPasswordToggleBtn">
                    ${window.renderIcon('eye')}
                  </button>
                </div>
              </div>
              <button type="submit" class="btn-hero-primary" style="background:var(--primary-gradient); color:#fff; justify-content:center; padding:12px;">
                Log In to Student Dashboard
              </button>
            </div>
          </form>

          <div style="margin-top:20px; border-top:1px solid var(--border-color); padding-top:16px; text-align:center;">
            <p style="font-size:0.85rem; color:var(--text-muted); margin-bottom:10px;">Quick Demo Access:</p>
            <div style="display:flex; gap:10px; justify-content:center; flex-wrap:wrap;">
              <button class="btn-hero-secondary" style="font-size:0.8rem; padding:8px 16px; color:var(--text-main); border:1px solid var(--border-color); max-width:100%; word-break:break-word; text-align:center;" onclick="AppState.loginUser('admin@gmail.com', 'Pass@123')">
                Demo Admin (admin@gmail.com)
              </button>
            </div>
          </div>
        </div>
      `;
    },

    renderRegisterModalContent: function() {
      return `
        <div>
          <h2 style="font-size:1.6rem; font-weight:800; margin-bottom:8px; text-align:center;">Create Student Account</h2>
          <p style="color:var(--text-muted); text-align:center; margin-bottom:24px;">Register to unlock AI-powered course recommendations.</p>

          <form onsubmit="event.preventDefault(); window.handleRegisterSubmit(this);" autocomplete="off">
            <input type="text" name="prevent_autofill_username" style="display:none" autocomplete="off" />
            <input type="password" name="prevent_autofill_password" style="display:none" autocomplete="off" />

            <div style="display:flex; flex-direction:column; gap:14px;">
              <input type="text" name="regName" placeholder="Full Name" required autocomplete="new-name" style="width:100%; padding:12px; border-radius:var(--radius-md); border:1px solid var(--border-color); background:var(--bg-card); color:var(--text-main);">
              <input type="email" name="regEmail" placeholder="Email Address" required autocomplete="new-email" style="width:100%; padding:12px; border-radius:var(--radius-md); border:1px solid var(--border-color); background:var(--bg-card); color:var(--text-main);">
              <div style="position:relative; width:100%;">
                <input type="password" id="regPassword" name="regPassword" placeholder="Password" required autocomplete="new-password" style="width:100%; padding:12px 42px 12px 12px; border-radius:var(--radius-md); border:1px solid var(--border-color); background:var(--bg-card); color:var(--text-main);">
                <button type="button" onclick="window.toggleRegisterPasswordVisibility()" style="position:absolute; right:12px; top:50%; transform:translateY(-50%); color:var(--text-muted); padding:4px; display:flex; align-items:center; justify-content:center;" id="passwordToggleBtn">
                  ${window.renderIcon('eye')}
                </button>
              </div>
              <button type="submit" class="btn-hero-primary" style="background:var(--primary-gradient); color:#fff; justify-content:center; padding:12px;">
                Continue to Student Questionnaire ${window.renderIcon('arrow-right')}
              </button>
            </div>
          </form>
        </div>
      `;
    },

    renderQuestionnaireModalContent: function() {
      const state = window.AppState || {};
      const data = state.data || window.INITIAL_DATA || {};

      let defaultName = '';
      if (state.modalData && state.modalData.name) {
        defaultName = state.modalData.name;
      } else if (state.currentUser && state.currentUser.name) {
        defaultName = state.currentUser.name;
      }

      const isNewReg = state.modalData && state.modalData.isNewRegistration;
      const welcomeHtml = isNewReg ? `
        <div class="welcome-banner" style="background:rgba(190,24,93,0.08); border:1px solid rgba(190,24,93,0.25); padding:16px; border-radius:var(--radius-md); text-align:center; margin-bottom:20px; font-weight:700; color:var(--color-indigo); line-height:1.5; font-size:0.95rem;">
          Welcome${defaultName ? `, ${defaultName}` : ''}! Please complete your assessment to receive personalized AI learning recommendations.
        </div>
      ` : '';

      return `
        <div>
          ${welcomeHtml}
          <div style="text-align:center; margin-bottom:20px;">
            <div style="display:inline-flex; align-items:center; gap:6px; background:var(--color-teal-light); color:var(--color-teal-action); padding:4px 12px; border-radius:var(--radius-full); font-size:0.8rem; font-weight:700; margin-bottom:8px;">
              ${window.renderIcon('cpu')} AI PROFILING QUESTIONNAIRE
            </div>
            <h2 style="font-size:1.6rem; font-weight:800;">Student Assessment Questionnaire</h2>
            <p style="color:var(--text-muted); font-size:0.9rem;">Fill out your learning preferences so our AI can generate personalized recommendations.</p>
          </div>

          <div id="questionnaire-error-banner" style="display:none; background:rgba(244,63,94,0.08); border:1px solid rgba(244,63,94,0.2); padding:12px; border-radius:var(--radius-md); color:var(--color-rose); font-weight:600; text-align:center; margin-bottom:16px; font-size:0.9rem;">
            Please fill all required fields before generating AI recommendations.
          </div>

          <form onsubmit="event.preventDefault(); window.submitQuestionnaireForm(this);">
            <div style="display:flex; flex-direction:column; gap:16px;">
              <div class="responsive-form-grid-2">
                <div>
                  <label style="font-size:0.82rem; font-weight:700; display:block; margin-bottom:4px;">Student Name</label>
                  <input type="text" name="name" id="nameInput" value="${defaultName}" placeholder="Your Full Name" required style="width:100%; padding:10px; border-radius:var(--radius-md); border:1px solid var(--border-color); background:var(--bg-card); color:var(--text-main); transition: border-color 0.2s;">
                  <div id="nameError" style="color:var(--color-rose); font-size:0.78rem; font-weight:600; margin-top:4px; display:none;">Please enter your name.</div>
                </div>
                <div>
                  <label style="font-size:0.82rem; font-weight:700; display:block; margin-bottom:4px;">Class / Grade Level</label>
                  <select name="gradeClass" id="gradeClassSelect" style="width:100%; padding:10px; border-radius:var(--radius-md); border:1px solid var(--border-color); background:var(--bg-card); color:var(--text-main); transition: border-color 0.2s;">
                    <option value="" disabled selected>Select Grade</option>
                    ${(data.classesList || []).map(c => `<option value="${c}">${c}</option>`).join('')}
                  </select>
                  <div id="gradeClassError" style="color:var(--color-rose); font-size:0.78rem; font-weight:600; margin-top:4px; display:none;">Please select your grade.</div>
                </div>
              </div>

              <div class="responsive-form-grid-2">
                <div>
                  <label style="font-size:0.82rem; font-weight:700; display:block; margin-bottom:4px;">Current Skill Level</label>
                  <select name="skillLevel" id="skillLevelSelect" style="width:100%; padding:10px; border-radius:var(--radius-md); border:1px solid var(--border-color); background:var(--bg-card); color:var(--text-main); transition: border-color 0.2s;">
                    <option value="" disabled selected>Select Skill Level</option>
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                  <div id="skillLevelError" style="color:var(--color-rose); font-size:0.78rem; font-weight:600; margin-top:4px; display:none;">Please select your current skill level.</div>
                </div>
                <div>
                  <label style="font-size:0.82rem; font-weight:700; display:block; margin-bottom:4px;">Preferred Learning Style (VARK)</label>
                  <select name="preferredStyle" style="width:100%; padding:10px; border-radius:var(--radius-md); border:1px solid var(--border-color); background:var(--bg-card); color:var(--text-main);">
                    <option value="visual" selected>Visual (Diagrams & Videos)</option>
                    <option value="auditory">Auditory (Lectures & Audio)</option>
                    <option value="reading">Reading / Writing (Articles & Notes)</option>
                    <option value="kinesthetic">Kinesthetic (Hands-on Practice Labs)</option>
                  </select>
                </div>
              </div>

              <div>
                <label style="font-size:0.82rem; font-weight:700; display:block; margin-bottom:4px;">Target Career Goal</label>
                <select name="careerGoal" style="width:100%; padding:10px; border-radius:var(--radius-md); border:1px solid var(--border-color); background:var(--bg-card); color:var(--text-main);">
                  ${(data.careerGoals || []).map(cg => `<option value="${cg}">${cg}</option>`).join('')}
                </select>
              </div>

              <div>
                <label style="font-size:0.82rem; font-weight:700; display:block; margin-bottom:6px;">Subjects of Interest (Select All That Apply)</label>
                <div class="responsive-form-grid-2" style="gap:8px;">
                  ${(data.subjects || []).map(s => `
                    <label style="display:flex; align-items:center; gap:8px; font-size:0.85rem; padding:8px; border-radius:var(--radius-sm); border:1px solid var(--border-color); background:var(--bg-card); cursor:pointer;">
                      <input type="checkbox" name="interests" value="${s.id}" checked>
                      <span>${s.name}</span>
                    </label>
                  `).join('')}
                </div>
                <div id="interestsError" style="color:var(--color-rose); font-size:0.78rem; font-weight:600; margin-top:4px; display:none;">Please select at least one subject of interest.</div>
              </div>

              <button type="submit" class="btn-hero-primary" style="background:var(--primary-gradient); color:#fff; justify-content:center; padding:12px; margin-top:8px; min-height:48px; width:100%;">
                ${window.renderIcon('sparkles')} Generate AI Recommendations
              </button>
            </div>
          </form>
        </div>
      `;
    },

    renderQuizModalContent: function(quizId) {
      const quizzes = (window.AppState.data && window.AppState.data.quizzes) ? window.AppState.data.quizzes : [];
      const quiz = quizzes.find(q => q.id === quizId) || quizzes[0] || { title: 'Quiz', questions: [] };
      const q = (quiz.questions && quiz.questions[currentQuizStep]) ? quiz.questions[currentQuizStep] : (quiz.questions ? quiz.questions[0] : { question: 'Question?', options: ['Option 1', 'Option 2'], correctIndex: 0 });

      return `
        <div class="quiz-container" style="border:none; padding:0;">
          <div class="quiz-header">
            <div>
              <h2 style="font-size:1.3rem; font-weight:800;">${quiz.title}</h2>
              <p style="font-size:0.85rem; color:var(--text-muted);">Question ${currentQuizStep + 1} of ${quiz.questions ? quiz.questions.length : 1}</p>
            </div>
            <div class="quiz-timer">
              ${window.renderIcon('clock')} 09:45
            </div>
          </div>

          <div class="question-box">
            <div class="question-text">${q.question}</div>
            <div class="options-list">
              ${(q.options || []).map((opt, idx) => `
                <button class="option-btn ${quizAnswers[q.id] === idx ? (idx === q.correctIndex ? 'correct' : 'wrong') : ''}" onclick="window.submitQuizAnswer('${quiz.id}', '${q.id}', ${idx}, ${q.correctIndex})">
                  <span>${opt}</span>
                </button>
              `).join('')}
            </div>

            ${quizAnswers[q.id] !== undefined ? `
              <div class="explanation-banner">
                <strong>AI Explanation:</strong> ${q.explanation || 'Correct concept applied!'}
              </div>
            ` : ''}
          </div>

          <div style="display:flex; justify-content:space-between; margin-top:20px;">
            <button class="btn-hero-primary" style="background:var(--primary-gradient); color:#fff; flex:1; justify-content:center;" onclick="window.nextQuizStep('${quiz.id}', ${quiz.questions ? quiz.questions.length : 1})">
              Next Question ${window.renderIcon('arrow-right')}
            </button>
          </div>
        </div>
      `;
    },

    renderQuizResultInterestModalContent: function(data) {
      return `
        <div style="text-align:center;">
          <div style="width:72px; height:72px; border-radius:50%; background:var(--gradient-emerald-teal); color:#fff; display:flex; align-items:center; justify-content:center; margin:0 auto 16px auto;">
            ${window.renderIcon('sparkles')}
          </div>
          <h2 style="font-size:1.6rem; font-weight:800; margin-bottom:8px;">Quiz Interest & Performance Analysis</h2>
          <p style="color:var(--text-muted); font-size:0.95rem; margin-bottom:20px;">${data.subjectName}</p>

          <div style="background:var(--bg-card); border:1px solid var(--border-color); padding:20px; border-radius:var(--radius-md); margin-bottom:24px;">
            <div style="font-size:2.2rem; font-weight:800; color:var(--color-emerald); font-family:var(--font-heading);">${data.score}% Score</div>
            <div style="font-size:1rem; font-weight:700; color:var(--color-purple); margin-top:6px;">
              ${data.interestText}
            </div>
            <p style="font-size:0.85rem; color:var(--text-muted); margin-top:10px;">
              The AI Engine has dynamically recalculated your subject mastery and unlocked advanced recommendation pathways!
            </p>
          </div>

          <button class="btn-hero-primary" style="background:var(--primary-gradient); color:#fff; width:100%; justify-content:center;" onclick="AppState.closeModal()">
            ${window.renderIcon('check-circle')} Continue Learning Pathway
          </button>
        </div>
      `;
    },

    renderResourceViewerModalContent: function(resId) {
      const resources = (window.AppState.data && window.AppState.data.resources) ? window.AppState.data.resources : [];
      const courses = (window.AppState.data && window.AppState.data.courses) ? window.AppState.data.courses : [];
      let res = resources.find(r => r.id === resId);
      
      if (!res) {
        for (const course of courses) {
          if (course.categories) {
            for (const tier in course.categories) {
              const cat = course.categories[tier];
              if (cat && cat.materials) {
                const foundMat = cat.materials.find(m => m.id === resId);
                if (foundMat) {
                  res = {
                    id: foundMat.id,
                    title: foundMat.title,
                    format: foundMat.format || 'video',
                    duration: foundMat.duration,
                    contentUrl: foundMat.contentUrl || 'https://www.youtube.com/embed/r-uOLxNrNk8',
                    description: foundMat.description || foundMat.title,
                    summary: foundMat.description || foundMat.title,
                    subjectId: course.subjectId
                  };
                  break;
                }
              }
            }
          }
          if (res) break;
        }
      }
      
      if (!res) {
        res = resources[0] || { title: 'Study Material', format: 'article', summary: 'Description' };
      }

      return `
        <div>
          <div style="margin-bottom:16px;">
            <span class="ai-match-badge" style="display:inline-flex;">${(res.format || 'material').toUpperCase()}</span>
            <h2 style="font-size:1.5rem; font-weight:800; margin-top:8px;">${res.title}</h2>
          </div>

          ${res.contentUrl ? window.getVideoPlayerHtml(res.contentUrl) : ''}

          <p style="font-size:0.95rem; color:var(--text-main); margin-bottom:20px; line-height:1.6;">
            ${res.summary || res.description}
          </p>

          <button class="btn-hero-primary" style="background:var(--primary-gradient); color:#fff; width:100%; justify-content:center;" onclick="AppState.toggleCompleteResource('${res.id}'); AppState.closeModal();">
            ${window.renderIcon('check-circle')} Mark Study Material Completed (+15 Mins Progress)
          </button>
        </div>
      `;
    },

    renderCertificateModalContent: function() {
      const user = window.AppState.currentUser || { name: 'Student' };
      const courses = (window.AppState.data && window.AppState.data.courses) ? window.AppState.data.courses : [];
      
      let courseName = 'Artificial Intelligence & Neural Networks Masterclass';
      if (window.AppState.modalData && window.AppState.modalData.courseId) {
        const c = courses.find(item => item.id === window.AppState.modalData.courseId);
        if (c) courseName = c.title;
      } else if (user.enrolledCourseIds && user.enrolledCourseIds.length > 0) {
        const c = courses.find(item => item.id === user.enrolledCourseIds[0]);
        if (c) courseName = c.title;
      }

      const certId = `LAI-2026-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

      return `
        <div style="width:100%; max-width:100%; overflow-x:hidden;">
          <div class="certificate-preview-card">
            <div style="position:absolute; top:-50px; left:-50px; width:150px; height:150px; border:2px solid rgba(197, 168, 128, 0.15); border-radius:50%; pointer-events:none;"></div>
            <div style="position:absolute; bottom:-50px; right:-50px; width:150px; height:150px; border:2px solid rgba(197, 168, 128, 0.15); border-radius:50%; pointer-events:none;"></div>

            <div style="text-align:center; margin-bottom:14px;">
              <div style="display:inline-flex; align-items:center; gap:8px; margin-bottom:6px;">
                <div style="width:34px; height:34px; background:#0b192c; border-radius:8px; display:flex; align-items:center; justify-content:center; color:#72eed5; font-size:1.15rem; font-weight:900; font-family:Georgia, serif; box-shadow:0 4px 10px rgba(15,23,42,0.25);">L</div>
                <span style="font-size:1.1rem; font-weight:900; letter-spacing:0.1em; color:#475569; font-family:var(--font-heading);">LearnAI Pro</span>
              </div>
              <div style="width:120px; height:1px; background:linear-gradient(90deg, transparent, #c5a880, transparent); margin:8px auto 0 auto;"></div>
            </div>

            <div class="cert-header">
              Certificate of Completion
            </div>

            <p style="font-family:'Georgia', serif; font-size:clamp(0.85rem, 2vw, 1rem); color:#475569; margin: 16px auto 10px auto; max-width:600px; line-height:1.6;">
              This certificate is proudly presented by <strong>LearnAI Pro</strong> to
            </p>

            <div class="cert-student-name">
              ${user.name}
            </div>

            <p style="font-family:'Georgia', serif; font-size:clamp(0.85rem, 2vw, 1rem); color:#475569; max-width:600px; margin:10px auto 24px auto; line-height:1.6;">
              for successfully completing the course <strong style="color:#1e293b; display:block; font-size:clamp(0.95rem, 2.5vw, 1.15rem); margin-top:6px; word-break:break-word;">'${courseName}'</strong> <span style="display:block; margin-top:6px;">and fulfilling all the requirements of the program.</span>
            </p>

            <div style="width:100%; height:1px; background:#cbd5e1; margin-bottom:24px; position:relative;">
              <div style="position:absolute; top:-3px; left:calc(50% - 20px); width:40px; height:8px; background:#c5a880; border-radius:4px;"></div>
            </div>

            <div class="cert-footer-row">
              <div style="text-align:left; flex:1; min-width:120px;">
                <span style="font-size:0.72rem; color:#64748b; font-weight:700; text-transform:uppercase; letter-spacing:0.05em;">Date of Issue</span> <br>
                <span style="font-size:0.88rem; font-weight:700; color:#1e293b;">${new Date().toLocaleDateString()}</span>
              </div>

              <div style="text-align:center; flex-shrink:0;">
                <svg width="68" height="68" viewBox="0 0 100 100" style="margin:0 auto; filter:drop-shadow(0 4px 6px rgba(0,0,0,0.15));">
                  <path d="M 35 70 L 35 95 L 50 85 L 65 95 L 65 70 Z" fill="#d4af37" opacity="0.85" />
                  <path d="M 45 70 L 45 98 L 50 92 L 55 98 L 55 70 Z" fill="#aa7c11" />
                  <circle cx="50" cy="50" r="32" fill="url(#goldGradient)" stroke="#aa7c11" stroke-width="1.5" />
                  <circle cx="50" cy="50" r="28" fill="none" stroke="#d4af37" stroke-width="1" stroke-dasharray="3 2" />
                  <polygon points="50,30 54,41 66,41 57,48 60,60 50,52 40,60 43,48 34,41 46,41" fill="#ffffff" />
                  <defs>
                    <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stop-color="#fdf6e2" />
                      <stop offset="50%" stop-color="#d4af37" />
                      <stop offset="100%" stop-color="#8a6f27" />
                    </linearGradient>
                  </defs>
                </svg>
                <div style="font-size:0.62rem; color:#8a6f27; font-weight:800; text-transform:uppercase; letter-spacing:0.1em; margin-top:3px;">Official Seal</div>
              </div>

              <div style="text-align:right; flex:1; min-width:120px; border-top:1px solid #cbd5e1; padding-top:6px;">
                <span style="font-size:0.72rem; color:#64748b; font-weight:700; text-transform:uppercase; letter-spacing:0.05em;">Authorized Signature</span>
              </div>
            </div>

            <div style="margin-top:24px; font-size:0.65rem; color:#94a3b8; font-family:monospace; text-align:center; letter-spacing:0.05em; word-break:break-all;">
              CERTIFICATE ID: ${certId}
            </div>
          </div>

          <div style="margin-top:20px; display:flex; gap:12px; width:100%;">
            <button class="btn-hero-primary" style="background:var(--primary-gradient); color:#fff; flex:1; justify-content:center; min-height:46px;" onclick="window.print()">
              ${window.renderIcon('printer')} Print / Save PDF
            </button>
          </div>
        </div>
      `;
    },

    renderAddResourceModalContent: function() {
      const state = window.AppState || {};
      const subjects = (state.data && state.data.subjects) ? state.data.subjects : [];

      return `
        <div>
          <h2 style="font-size:1.4rem; font-weight:800; margin-bottom:16px;">Add New Learning Resource</h2>
          <form onsubmit="event.preventDefault(); window.submitNewResource(this);">
            <div style="display:flex; flex-direction:column; gap:12px;">
              <input type="text" name="title" placeholder="Course Title" required style="padding:10px; border-radius:var(--radius-md); border:1px solid var(--border-color); background:var(--bg-card); color:var(--text-main);">
              <select name="subjectId" required style="padding:10px; border-radius:var(--radius-md); border:1px solid var(--border-color); background:var(--bg-card); color:var(--text-main);" onchange="if(this.value === 'ADD_NEW_SUBJECT') { AppState.closeModal(); window.activeAdminTab = 'subjects'; AppState.notify(); }">
                <option value="" disabled selected>Select Subject</option>
                ${subjects.map(s => `<option value="${s.id}">${s.name}</option>`).join('')}
                <option value="ADD_NEW_SUBJECT" style="color:var(--color-purple); font-weight:700;">+ Add New Subject...</option>
              </select>
              <select name="format" style="padding:10px; border-radius:var(--radius-md); border:1px solid var(--border-color); background:var(--bg-card); color:var(--text-main);">
                <option value="video">Video</option>
                <option value="article">Article</option>
                <option value="exercise">Interactive Lab</option>
              </select>
              <textarea name="description" placeholder="Short Description" required style="padding:10px; border-radius:var(--radius-md); border:1px solid var(--border-color); background:var(--bg-card); color:var(--text-main);"></textarea>
              <button type="submit" class="btn-hero-primary" style="background:var(--primary-gradient); color:#fff; justify-content:center;">
                Publish Resource
              </button>
            </div>
          </form>
        </div>
      `;
    },

    renderMCQAdminBreakdownModalContent: function() {
      const data = window.activeMCQBreakdownData;
      if (!data || !data.assignment || !data.submission) {
        return `<div style="padding:20px; text-align:center;">No submission data available.</div>`;
      }
      const a = data.assignment;
      const sub = data.submission;
      const questions = a.questions || [];
      const letters = ['A', 'B', 'C', 'D'];

      return `
        <div>
          <h2 style="font-size:1.35rem; font-weight:800; margin-bottom:6px; display:flex; align-items:center; gap:8px;">
            ${window.renderIcon('file-text')} Student Submission Breakdown
          </h2>
          <p style="color:var(--text-muted); font-size:0.85rem; margin-bottom:18px;">
            Student: <strong>${sub.userName || 'Student'}</strong> • Assignment: <strong>${a.title}</strong>
          </p>

          <div class="mcq-scorecard-grid">
            <div class="mcq-scorecard-item">
              <div class="mcq-scorecard-val" style="color:var(--color-purple);">${sub.score} / ${a.points}</div>
              <div class="mcq-scorecard-lbl">Total Marks</div>
            </div>
            <div class="mcq-scorecard-item">
              <div class="mcq-scorecard-val" style="color:var(--color-emerald);">${sub.correctCount || 0}</div>
              <div class="mcq-scorecard-lbl">Correct Answers</div>
            </div>
            <div class="mcq-scorecard-item">
              <div class="mcq-scorecard-val" style="color:var(--color-rose);">${sub.wrongCount || 0}</div>
              <div class="mcq-scorecard-lbl">Wrong Answers</div>
            </div>
            <div class="mcq-scorecard-item">
              <div class="mcq-scorecard-val" style="color:${sub.passed ? 'var(--color-emerald)' : 'var(--color-rose)'};">${sub.percentage}%</div>
              <div class="mcq-scorecard-lbl">${sub.passed ? 'PASSED' : 'NEEDS PRACTICE'}</div>
            </div>
          </div>

          <h3 style="font-size:1.05rem; font-weight:700; margin:22px 0 12px 0;">Question-by-Question Review</h3>
          <div style="display:flex; flex-direction:column; gap:12px; max-height:420px; overflow-y:auto; padding-right:6px;">
            ${questions.map((q, idx) => {
              const studentChoice = (sub.answers && sub.answers[q.id] !== undefined) ? Number(sub.answers[q.id]) : null;
              const isCorrect = studentChoice !== null && studentChoice === q.correctAnswer;
              return `
                <div class="mcq-review-card ${isCorrect ? 'correct' : 'wrong'}">
                  <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                    <span style="font-weight:800; font-size:0.88rem;">Question ${idx + 1}</span>
                    <span class="tag-pill" style="background:${isCorrect ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)'}; color:${isCorrect ? 'var(--color-emerald)' : 'var(--color-rose)'}; font-weight:800; font-size:0.75rem;">
                      ${isCorrect ? '✔ Correct' : '✖ Wrong'}
                    </span>
                  </div>
                  <div style="font-size:0.92rem; font-weight:600; margin-bottom:10px; color:var(--text-main);">
                    ${q.text}
                  </div>
                  <div style="display:flex; flex-direction:column; gap:6px;">
                    ${letters.map((let, optIdx) => {
                      const optText = (q.options && q.options[optIdx]) ? q.options[optIdx] : '';
                      const wasChosen = studentChoice === optIdx;
                      const isRight = q.correctAnswer === optIdx;
                      let style = 'padding:8px 12px; border-radius:6px; font-size:0.85rem; display:flex; align-items:center; justify-content:space-between; border:1px solid var(--border-color); background:var(--bg-surface);';
                      if (wasChosen && isRight) {
                        style = 'padding:8px 12px; border-radius:6px; font-size:0.85rem; display:flex; align-items:center; justify-content:space-between; border:1.5px solid #10b981; background:rgba(16,185,129,0.1); color:#065f46; font-weight:700;';
                      } else if (wasChosen && !isRight) {
                        style = 'padding:8px 12px; border-radius:6px; font-size:0.85rem; display:flex; align-items:center; justify-content:space-between; border:1.5px solid #ef4444; background:rgba(239,68,68,0.08); color:#991b1b; font-weight:700;';
                      } else if (isRight) {
                        style = 'padding:8px 12px; border-radius:6px; font-size:0.85rem; display:flex; align-items:center; justify-content:space-between; border:1.5px solid #10b981; background:rgba(16,185,129,0.05); color:#065f46; font-weight:600;';
                      }
                      return `
                        <div style="${style}">
                          <span><strong>${let}.</strong> ${optText}</span>
                          <span>${wasChosen ? (isRight ? '✔ Student Choice' : '✖ Student Choice') : (isRight ? '✔ Correct Answer' : '')}</span>
                        </div>
                      `;
                    }).join('')}
                  </div>
                </div>
              `;
            }).join('')}
          </div>
          <div style="display:flex; justify-content:flex-end; margin-top:20px;">
            <button class="btn-hero-primary" style="background:var(--primary-gradient); color:#fff;" onclick="AppState.closeModal()">
              Close Breakdown
            </button>
          </div>
        </div>
      `;
    },

    renderSubmitAssignmentModalContent: function(assignmentId) {
      const state = window.AppState || {};
      const assignment = (state.data && state.data.assignments) ? state.data.assignments.find(a => a.id === assignmentId) : null;
      if (!assignment) return `<div>Error: Assignment not found.</div>`;

      const courses = (state.data && state.data.courses) ? state.data.courses : [];
      const course = courses.find(c => c.id === assignment.courseId) || { title: 'Course' };
      const existingSubmission = (state.data && state.data.submissions) ? state.data.submissions.find(s => s.assignmentId === assignmentId && s.userId === state.currentUser.id) : null;
      const isMCQ = assignment.questions && assignment.questions.length > 0;

      // If legacy standard assignment without questions:
      if (!isMCQ) {
        return `
          <div>
            <h2 style="font-size:1.4rem; font-weight:800; margin-bottom:8px; display:flex; align-items:center; gap:8px; color:var(--color-purple);">
              ${window.renderIcon('file-text')} Submit Assignment
            </h2>
            <p style="color:var(--text-muted); font-size:0.85rem; margin-bottom:16px;">
              Course assignment: <strong>${assignment.title}</strong>
            </p>
            
            <div style="background:var(--bg-surface); border:1px solid var(--border-color); padding:12px; border-radius:var(--radius-md); font-size:0.85rem; margin-bottom:16px; max-height:120px; overflow-y:auto; line-height:1.5;">
              <strong>Instructions:</strong><br>
              ${assignment.description.replace(/\n/g, '<br>')}
            </div>

            <form onsubmit="window.handleSubmitAssignmentForm(event)">
              <input type="hidden" name="assignmentId" value="${assignment.id}">
              <input type="hidden" name="courseId" value="${assignment.courseId}">
              
              <div style="display:flex; flex-direction:column; gap:12px;">
                <div>
                  <label style="font-size:0.8rem; font-weight:700; display:block; margin-bottom:4px;">Write Your Submission Answer / Description</label>
                  <textarea name="submissionText" required placeholder="Write your answers, notes, or explanations here..." style="width:100%; height:110px; padding:10px; border-radius:var(--radius-md); border:1px solid var(--border-color); background:var(--bg-card); color:var(--text-main); font-family:inherit; resize:vertical;">${existingSubmission ? existingSubmission.submissionText : ''}</textarea>
                </div>
                
                <div>
                  <label style="font-size:0.8rem; font-weight:700; display:block; margin-bottom:4px;">Project Repository / Demo Link (Optional)</label>
                  <input type="url" name="submissionLink" value="${existingSubmission ? existingSubmission.submissionLink : ''}" placeholder="e.g. https://github.com/my-project" style="width:100%; padding:10px; border-radius:var(--radius-md); border:1px solid var(--border-color); background:var(--bg-card); color:var(--text-main);">
                </div>

                <button type="submit" class="btn-hero-primary" style="background:var(--primary-gradient); color:#fff; width:100%; padding:11px; justify-content:center;">
                  ${window.renderIcon('send')} ${existingSubmission ? 'Resubmit Assignment' : 'Submit Assignment'}
                </button>
              </div>
            </form>
          </div>
        `;
      }

      // MCQ Assignment Handling:
      if (!window.studentAssignmentSession || window.studentAssignmentSession.assignmentId !== assignment.id) {
        window.studentAssignmentSession = {
          assignmentId: assignment.id,
          currentStep: 0,
          viewMode: 'single',
          answers: (existingSubmission && existingSubmission.answers) ? { ...existingSubmission.answers } : {},
          isSubmitted: !!(existingSubmission && (existingSubmission.status === 'graded' || existingSubmission.score !== undefined)),
          submission: existingSubmission
        };
      }

      const session = window.studentAssignmentSession;
      session.totalQuestions = assignment.questions.length;
      const questions = assignment.questions;
      const letters = ['A', 'B', 'C', 'D'];

      // CASE 1: SUBMITTED -> Show Graded Results & Performance Scorecard + Detailed Review
      if (session.isSubmitted && session.submission) {
        const sub = session.submission;
        return `
          <div class="mcq-student-container">
            <div style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:10px;">
              <div>
                <span class="tag-pill" style="background:rgba(99,102,241,0.1); color:var(--color-indigo); font-weight:700; margin-bottom:6px; display:inline-block;">
                  ${course.title}
                </span>
                <h2 style="font-size:1.4rem; font-weight:800; margin:0; color:var(--text-main);">
                  ${assignment.title} - Performance Report
                </h2>
              </div>
              <span class="tag-pill" style="background:${sub.passed ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)'}; color:${sub.passed ? 'var(--color-emerald)' : 'var(--color-rose)'}; font-weight:800; font-size:0.85rem; padding:6px 14px;">
                ${sub.passed ? '🎉 PASSED' : '⚠️ NEEDS PRACTICE'}
              </span>
            </div>

            <!-- Summary Hero Banner -->
            <div style="padding:18px 20px; border-radius:var(--radius-md); background:${sub.passed ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)'}; border:1.5px solid ${sub.passed ? '#10b981' : '#f87171'}; display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:14px;">
              <div>
                <div style="font-size:1.15rem; font-weight:800; color:var(--text-main); margin-bottom:4px;">
                  ${sub.passed ? 'Excellent work! You achieved a passing score.' : 'Assignment Completed. Review your answers below.'}
                </div>
                <p style="font-size:0.85rem; color:var(--text-muted); margin:0;">
                  Auto-calculated evaluation comparing your choices against stored answer keys.
                </p>
              </div>
              <button type="button" class="btn-hero-primary" style="background:var(--primary-gradient); color:#fff; padding:8px 18px; font-size:0.85rem;" onclick="window.retakeStudentMCQAssignment('${assignment.id}')">
                ${window.renderIcon('rotate-ccw', 'small-icon')} Retake Assignment
              </button>
            </div>

            <!-- 4-Metric Scorecard Grid -->
            <div class="mcq-scorecard-grid">
              <div class="mcq-scorecard-item">
                <div class="mcq-scorecard-val" style="color:var(--color-purple);">${sub.score} / ${sub.maxPoints || assignment.points}</div>
                <div class="mcq-scorecard-lbl">Total Marks</div>
              </div>
              <div class="mcq-scorecard-item">
                <div class="mcq-scorecard-val" style="color:var(--color-emerald);">${sub.correctCount || 0} / ${questions.length}</div>
                <div class="mcq-scorecard-lbl">Correct Answers</div>
              </div>
              <div class="mcq-scorecard-item">
                <div class="mcq-scorecard-val" style="color:var(--color-rose);">${sub.wrongCount || 0} / ${questions.length}</div>
                <div class="mcq-scorecard-lbl">Wrong Answers</div>
              </div>
              <div class="mcq-scorecard-item">
                <div class="mcq-scorecard-val" style="color:${sub.passed ? 'var(--color-emerald)' : 'var(--color-rose)'};">${sub.percentage}%</div>
                <div class="mcq-scorecard-lbl">Percentage Score</div>
              </div>
            </div>

            <!-- Detailed Answer Review Section -->
            <div>
              <h3 style="font-size:1.1rem; font-weight:800; margin-bottom:12px; display:flex; align-items:center; gap:8px;">
                ${window.renderIcon('check-circle')} Detailed Question Review
              </h3>
              <div style="display:flex; flex-direction:column; gap:14px; max-height:400px; overflow-y:auto; padding-right:4px;">
                ${questions.map((q, idx) => {
                  const studentAns = (sub.answers && sub.answers[q.id] !== undefined) ? Number(sub.answers[q.id]) : null;
                  const isCorrect = studentAns !== null && studentAns === q.correctAnswer;
                  return `
                    <div class="mcq-review-card ${isCorrect ? 'correct' : 'wrong'}">
                      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
                        <span style="font-weight:800; font-size:0.9rem;">Question ${idx + 1}</span>
                        <span class="tag-pill" style="background:${isCorrect ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)'}; color:${isCorrect ? 'var(--color-emerald)' : 'var(--color-rose)'}; font-weight:800; font-size:0.75rem;">
                          ${isCorrect ? '✔ Correct (+pts)' : '✖ Incorrect (0 pts)'}
                        </span>
                      </div>
                      <div style="font-size:0.95rem; font-weight:600; margin-bottom:12px; color:var(--text-main);">
                        ${q.text}
                      </div>
                      <div style="display:flex; flex-direction:column; gap:8px;">
                        ${letters.map((let, optIdx) => {
                          const optText = (q.options && q.options[optIdx]) ? q.options[optIdx] : '';
                          const wasChosen = studentAns === optIdx;
                          const isRight = q.correctAnswer === optIdx;
                          let rowStyle = 'padding:10px 14px; border-radius:var(--radius-sm); font-size:0.88rem; display:flex; align-items:center; justify-content:space-between; border:1px solid var(--border-color); background:var(--bg-surface);';
                          if (wasChosen && isRight) {
                            rowStyle = 'padding:10px 14px; border-radius:var(--radius-sm); font-size:0.88rem; display:flex; align-items:center; justify-content:space-between; border:2px solid #10b981; background:rgba(16,185,129,0.1); color:#065f46; font-weight:700;';
                          } else if (wasChosen && !isRight) {
                            rowStyle = 'padding:10px 14px; border-radius:var(--radius-sm); font-size:0.88rem; display:flex; align-items:center; justify-content:space-between; border:2px solid #ef4444; background:rgba(239,68,68,0.08); color:#991b1b; font-weight:700;';
                          } else if (isRight) {
                            rowStyle = 'padding:10px 14px; border-radius:var(--radius-sm); font-size:0.88rem; display:flex; align-items:center; justify-content:space-between; border:2px solid #10b981; background:rgba(16,185,129,0.06); color:#065f46; font-weight:700;';
                          }
                          return `
                            <div style="${rowStyle}">
                              <div style="display:flex; align-items:center; gap:8px;">
                                <span style="font-weight:800; opacity:0.8;">${let}.</span>
                                <span>${optText}</span>
                              </div>
                              <div>
                                ${wasChosen ? (isRight ? '<span style="font-size:0.75rem; color:#10b981; font-weight:800; display:inline-flex; align-items:center; gap:4px;">✔ Your Choice (Correct)</span>' : '<span style="font-size:0.75rem; color:#ef4444; font-weight:800; display:inline-flex; align-items:center; gap:4px;">✖ Your Choice</span>') : (isRight ? '<span style="font-size:0.75rem; color:#10b981; font-weight:800; display:inline-flex; align-items:center; gap:4px;">✔ Correct Answer</span>' : '')}
                              </div>
                            </div>
                          `;
                        }).join('')}
                      </div>
                    </div>
                  `;
                }).join('')}
              </div>
            </div>

            <div style="display:flex; justify-content:flex-end; gap:10px; margin-top:10px;">
              <button type="button" class="btn-hero-primary" style="background:var(--primary-gradient); color:#fff;" onclick="AppState.closeModal()">
                Close
              </button>
            </div>
          </div>
        `;
      }

      // CASE 2: NOT SUBMITTED -> Interactive Test Runner
      const answeredCount = Object.keys(session.answers).length;
      const progressPct = Math.round((answeredCount / questions.length) * 100);

      return `
        <div class="mcq-student-container">
          <!-- Header -->
          <div style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:10px; border-bottom:1px solid var(--border-color); padding-bottom:14px;">
            <div>
              <div style="font-size:0.8rem; font-weight:700; color:var(--color-indigo); text-transform:uppercase; letter-spacing:0.5px; margin-bottom:4px;">
                ${course.title}
              </div>
              <h2 style="font-size:1.35rem; font-weight:800; margin:0; color:var(--text-main);">
                ${assignment.title}
              </h2>
              <div style="display:flex; align-items:center; gap:10px; margin-top:6px; font-size:0.82rem; color:var(--text-muted);">
                <span>${window.renderIcon('award', 'small-icon')} ${assignment.points} Points</span> • 
                <span>${window.renderIcon('help-circle', 'small-icon')} ${questions.length} Questions</span>
              </div>
            </div>

            <!-- View Mode Switcher -->
            <div style="display:inline-flex; background:var(--bg-surface); padding:3px; border-radius:var(--radius-sm); border:1px solid var(--border-color);">
              <button type="button" style="padding:6px 12px; border:none; border-radius:4px; font-size:0.8rem; font-weight:700; cursor:pointer; background:${session.viewMode === 'single' ? '#0b192c' : 'transparent'}; color:${session.viewMode === 'single' ? '#ffffff' : 'var(--text-muted)'};" onclick="window.toggleStudentAssignmentViewMode('single')">
                Step-by-Step
              </button>
              <button type="button" style="padding:6px 12px; border:none; border-radius:4px; font-size:0.8rem; font-weight:700; cursor:pointer; background:${session.viewMode === 'all' ? '#0b192c' : 'transparent'}; color:${session.viewMode === 'all' ? '#ffffff' : 'var(--text-muted)'};" onclick="window.toggleStudentAssignmentViewMode('all')">
                All Questions
              </button>
            </div>
          </div>

          <!-- Instructions Banner -->
          <div style="background:var(--bg-surface); border:1px solid var(--border-color); padding:10px 14px; border-radius:var(--radius-sm); font-size:0.85rem; color:var(--text-main);">
            <strong>Instructions:</strong> ${assignment.description}
          </div>

          <!-- Progress Bar & Question Tracker -->
          <div>
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px; font-size:0.82rem; font-weight:700; color:var(--text-main);">
              <span>Question ${session.currentStep + 1} of ${questions.length}</span>
              <span id="mcqProgressLabel" style="color:var(--color-indigo);">Answered ${answeredCount} of ${questions.length}</span>
            </div>
            <div class="mcq-student-progress-bar">
              <div id="mcqProgressFill" class="mcq-student-progress-fill" style="width:${progressPct}%;"></div>
            </div>
          </div>

          <!-- Question Pills Navigator -->
          <div class="mcq-student-pill-nav">
            ${questions.map((q, idx) => {
              const isAnswered = session.answers[q.id] !== undefined;
              const isActive = session.currentStep === idx;
              return `
                <button type="button" class="mcq-pill-btn ${isActive ? 'active' : ''} ${isAnswered ? 'answered' : ''}" data-qid="${q.id}" onclick="window.setStudentAssignmentStep(${idx})" title="Jump to Question ${idx + 1}">
                  ${idx + 1}
                </button>
              `;
            }).join('')}
          </div>

          <!-- Questions View -->
          ${session.viewMode === 'single' ? (() => {
            const q = questions[session.currentStep] || questions[0];
            const selectedOpt = session.answers[q.id];
            return `
              <div class="mcq-student-card" data-qid="${q.id}">
                <div style="font-size:0.85rem; font-weight:700; color:var(--color-indigo); margin-bottom:6px;">
                  Question ${session.currentStep + 1}
                </div>
                <div style="font-size:1.1rem; font-weight:700; color:var(--text-main); margin-bottom:20px; line-height:1.4;">
                  ${q.text}
                </div>

                <div>
                  ${letters.map((let, optIdx) => {
                    const optText = (q.options && q.options[optIdx]) ? q.options[optIdx] : '';
                    const isSelected = selectedOpt === optIdx;
                    return `
                      <div class="mcq-student-option ${isSelected ? 'selected' : ''}" onclick="window.selectStudentMCQOption('${q.id}', ${optIdx})">
                        <div class="mcq-student-radio">
                          <div class="mcq-student-radio-dot"></div>
                        </div>
                        <div class="mcq-option-badge">${let}</div>
                        <div style="font-size:0.92rem; font-weight:500; color:var(--text-main); flex:1;">
                          ${optText}
                        </div>
                      </div>
                    `;
                  }).join('')}
                </div>

                <!-- Navigation bar in single view -->
                <div style="display:flex; justify-content:space-between; align-items:center; margin-top:24px; padding-top:16px; border-top:1px solid var(--border-color); flex-wrap:wrap; gap:10px;">
                  <button type="button" class="btn-hero-secondary" style="padding:9px 18px; border:1px solid var(--border-color); background:var(--bg-surface); color:var(--text-main); border-radius:var(--radius-sm); font-weight:700; cursor:pointer;" onclick="window.setStudentAssignmentStep(${session.currentStep - 1})" ${session.currentStep === 0 ? 'disabled style="opacity:0.4; cursor:not-allowed;"' : ''}>
                    ${window.renderIcon('arrow-left', 'small-icon')} Previous
                  </button>

                  <div style="display:flex; gap:10px;">
                    ${session.currentStep < questions.length - 1 ? `
                      <button type="button" class="btn-hero-primary" style="background:#0b192c; color:#fff; padding:9px 20px;" onclick="window.setStudentAssignmentStep(${session.currentStep + 1})">
                        Next Question ${window.renderIcon('arrow-right', 'small-icon')}
                      </button>
                    ` : `
                      <button type="button" class="btn-hero-primary" style="background:var(--gradient-emerald-teal); color:#fff; padding:10px 24px; font-weight:800;" onclick="window.submitStudentMCQ('${assignment.id}')">
                        ${window.renderIcon('send', 'small-icon')} Submit Assignment
                      </button>
                    `}
                  </div>
                </div>
              </div>
            `;
          })() : `
            <!-- All Questions View -->
            <div style="display:flex; flex-direction:column; gap:18px; max-height:480px; overflow-y:auto; padding-right:4px;">
              ${questions.map((q, idx) => {
                const selectedOpt = session.answers[q.id];
                return `
                  <div class="mcq-student-card" data-qid="${q.id}">
                    <div style="font-size:0.85rem; font-weight:700; color:var(--color-indigo); margin-bottom:6px;">
                      Question ${idx + 1}
                    </div>
                    <div style="font-size:1.05rem; font-weight:700; color:var(--text-main); margin-bottom:16px; line-height:1.4;">
                      ${q.text}
                    </div>
                    <div>
                      ${letters.map((let, optIdx) => {
                        const optText = (q.options && q.options[optIdx]) ? q.options[optIdx] : '';
                        const isSelected = selectedOpt === optIdx;
                        return `
                          <div class="mcq-student-option ${isSelected ? 'selected' : ''}" onclick="window.selectStudentMCQOption('${q.id}', ${optIdx})">
                            <div class="mcq-student-radio">
                              <div class="mcq-student-radio-dot"></div>
                            </div>
                            <div class="mcq-option-badge">${let}</div>
                            <div style="font-size:0.92rem; font-weight:500; color:var(--text-main); flex:1;">
                              ${optText}
                            </div>
                          </div>
                        `;
                      }).join('')}
                    </div>
                  </div>
                `;
              }).join('')}
            </div>

            <div style="display:flex; justify-content:flex-end; margin-top:20px;">
              <button type="button" class="btn-hero-primary" style="background:var(--gradient-emerald-teal); color:#fff; padding:11px 28px; font-weight:800;" onclick="window.submitStudentMCQ('${assignment.id}')">
                ${window.renderIcon('send', 'small-icon')} Submit Assignment
              </button>
            </div>
          `}
        </div>
      `;
    },

    render: function() {
      const state = window.AppState || {};
      if (!state.activeModal) return '';

      let content = '';
      if (state.activeModal === 'login') {
        content = ModalsView.renderLoginModalContent();
      } else if (state.activeModal === 'register') {
        content = ModalsView.renderRegisterModalContent();
      } else if (state.activeModal === 'questionnaire') {
        content = ModalsView.renderQuestionnaireModalContent();
      } else if (state.activeModal === 'quiz') {
        content = ModalsView.renderQuizModalContent(state.modalData);
      } else if (state.activeModal === 'quiz-result-interest') {
        content = ModalsView.renderQuizResultInterestModalContent(state.modalData);
      } else if (state.activeModal === 'resource-viewer') {
        content = ModalsView.renderResourceViewerModalContent(state.modalData);
      } else if (state.activeModal === 'certificate') {
        content = ModalsView.renderCertificateModalContent();
      } else if (state.activeModal === 'add-resource') {
        content = ModalsView.renderAddResourceModalContent();
      } else if (state.activeModal === 'submit-assignment') {
        content = ModalsView.renderSubmitAssignmentModalContent(state.modalData);
      } else if (state.activeModal === 'mcq-admin-breakdown') {
        content = ModalsView.renderMCQAdminBreakdownModalContent();
      } else if (state.activeModal === 'help') {
        content = ModalsView.renderHelpCenterModalContent();
      }

      return `
        <div class="modal-overlay">
          <div class="modal-content">
            <button class="btn-close-modal" onclick="AppState.closeModal()">
              ${window.renderIcon('x')}
            </button>
            ${content}
          </div>
        </div>
      `;
    }
  };

  // Export to window
  window.ModalsView = ModalsView;
  window.renderActiveModal = function() {
    return ModalsView.render();
  };
})();
