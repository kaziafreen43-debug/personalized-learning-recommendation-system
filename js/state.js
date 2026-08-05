// App State Management & Persistence

window.AppState = {
  data: null,
  currentUser: null,
  isAuthenticated: false,
  theme: 'light',
  currentView: 'dashboard',
  activeSubjectFilter: 'all',
  activeFormatFilter: 'all',
  activeQuizCategoryFilter: 'all',
  activeQuizSubjectFilter: 'all',
  searchQuery: '',
  selectedCourseId: null,
  
  activeModal: null,
  modalData: null,
  
  listeners: [],

  init: function() {
    const savedData = localStorage.getItem('plr_app_data');
    if (savedData) {
      try {
        this.data = JSON.parse(savedData);
        if (window.INITIAL_DATA) {
          for (let key in window.INITIAL_DATA) {
            if (!this.data[key]) {
              this.data[key] = window.INITIAL_DATA[key];
            }
          }
        }
      } catch (e) {
        this.data = window.INITIAL_DATA || {};
      }
    } else {
      this.data = window.INITIAL_DATA || {};
      this.saveData();
    }

    // Force sync complete courses, resources, roadmaps & quizzes for ALL subjects
    if (window.INITIAL_DATA) {
      if (window.INITIAL_DATA.courses) this.data.courses = window.INITIAL_DATA.courses;
      if (window.INITIAL_DATA.resources) this.data.resources = window.INITIAL_DATA.resources;
      if (window.INITIAL_DATA.roadmaps) this.data.roadmaps = window.INITIAL_DATA.roadmaps;
      if (window.INITIAL_DATA.quizzes) this.data.quizzes = window.INITIAL_DATA.quizzes;
    }

    if (!this.data || !this.data.courses) {
      this.data = window.INITIAL_DATA || {};
    }

    const savedTheme = localStorage.getItem('plr_theme');
    this.theme = savedTheme || 'light';
    document.documentElement.setAttribute('data-theme', this.theme);

    const savedAuth = localStorage.getItem('plr_is_auth');
    this.isAuthenticated = savedAuth === 'true';

    const savedUserId = localStorage.getItem('plr_user_id');
    if (savedUserId && this.data.defaultUsers) {
      const user = this.data.defaultUsers.find(u => u.id === savedUserId);
      this.currentUser = user || this.data.defaultUsers[0];
    } else {
      this.currentUser = (this.data.defaultUsers && this.data.defaultUsers[0]) ? this.data.defaultUsers[0] : null;
    }

    if (this.currentUser) {
      if (this.currentUser.name === 'Alex Rivera') {
        this.currentUser.name = 'Afreen Kazi';
      }
      if (!this.currentUser.interests) {
        this.currentUser.interests = ['ds', 'math'];
      }
      const interestToCourseMap = {
        'ds': 'course-ai-101',
        'cs': 'course-cs-101',
        'math': 'course-math-101',
        'physics': 'course-physics-101',
        'bio': 'course-bio-101',
        'chem': 'course-chem-101'
      };
      this.currentUser.enrolledCourseIds = (this.currentUser.interests || []).map(id => interestToCourseMap[id]).filter(Boolean);
      if (!this.currentUser.completedResourceIds) this.currentUser.completedResourceIds = [];
      if (!this.currentUser.bookmarkedResourceIds) this.currentUser.bookmarkedResourceIds = [];
      if (!this.currentUser.careerGoal) this.currentUser.careerGoal = 'AI & Machine Learning Engineer';
    }
    if (this.data && this.data.defaultUsers) {
      this.data.defaultUsers.forEach(u => {
        if (u.name === 'Alex Rivera') {
          u.name = 'Afreen Kazi';
        }
      });
    }
  },

  saveData: function() {
    try {
      localStorage.setItem('plr_app_data', JSON.stringify(this.data));
    } catch(e) {}
    this.notify();
  },

  subscribe: function(listener) {
    this.listeners.push(listener);
  },

  notify: function() {
    this.listeners.forEach(fn => {
      try { fn(this); } catch(e) { console.error(e); }
    });
  },

  setTheme: function(themeName) {
    this.theme = themeName;
    try { localStorage.setItem('plr_theme', themeName); } catch(e) {}
    document.documentElement.setAttribute('data-theme', themeName);
    this.notify();
  },

  toggleTheme: function() {
    const nextTheme = this.theme === 'light' ? 'dark' : 'light';
    this.setTheme(nextTheme);
  },

  loginUser: function(email) {
    let user = this.data.defaultUsers.find(u => u.email === email);
    if (!user) {
      user = this.data.defaultUsers[0];
    }
    this.currentUser = user;
    this.isAuthenticated = true;
    try {
      localStorage.setItem('plr_is_auth', 'true');
      localStorage.setItem('plr_user_id', user.id);
    } catch(e) {}
    this.closeModal();
    this.setView('dashboard');
  },

  logoutUser: function() {
    this.isAuthenticated = false;
    try {
      localStorage.setItem('plr_is_auth', 'false');
    } catch(e) {}
    this.notify();
  },

  setUser: function(userId) {
    const user = this.data.defaultUsers.find(u => u.id === userId);
    if (user) {
      this.currentUser = user;
      this.isAuthenticated = true;
      try {
        localStorage.setItem('plr_is_auth', 'true');
        localStorage.setItem('plr_user_id', userId);
      } catch(e) {}
      this.notify();
    }
  },

  setView: function(viewName, params = {}) {
    this.currentView = viewName;
    if (params.subject) this.activeSubjectFilter = params.subject;
    if (params.courseId) this.selectedCourseId = params.courseId;
    window.scrollTo({ top: 0, behavior: 'smooth' });
    this.notify();
  },

  openModal: function(modalName, data = null) {
    this.activeModal = modalName;
    this.modalData = data;
    this.notify();
  },

  closeModal: function() {
    this.activeModal = null;
    this.modalData = null;
    this.notify();
  },

  submitQuestionnaire: function(formData) {
    if (!this.currentUser) {
      this.currentUser = {
        id: 'u-' + Date.now(),
        role: 'student',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        dailyGoalMinutes: 30,
        todayStudiedMinutes: 0,
        streakDays: 1,
        enrolledCourseIds: [],
        completedResourceIds: [],
        recentActivity: [{ title: 'Completed Profile Onboarding Questionnaire', time: 'Just now', icon: 'check-circle' }]
      };
      this.data.defaultUsers.push(this.currentUser);
    }

    this.currentUser.name = formData.name || 'Alex Rivera';
    this.currentUser.gradeClass = formData.gradeClass || 'Grade 11';
    this.currentUser.skillLevel = formData.skillLevel || 'Intermediate';
    this.currentUser.preferredStyle = formData.preferredStyle || 'visual';
    this.currentUser.careerGoal = formData.careerGoal || 'AI & Machine Learning Engineer';
    this.currentUser.interests = formData.interests || ['ds', 'math'];

    // Dynamically map selected interests directly to enrolled course IDs
    const interestToCourseMap = {
      'ds': 'course-ai-101',
      'cs': 'course-cs-101',
      'math': 'course-math-101',
      'physics': 'course-physics-101',
      'bio': 'course-bio-101',
      'chem': 'course-chem-101'
    };
    const selectedInterests = this.currentUser.interests;
    this.currentUser.enrolledCourseIds = selectedInterests.map(id => interestToCourseMap[id]).filter(Boolean);

    this.isAuthenticated = true;
    try {
      localStorage.setItem('plr_is_auth', 'true');
      localStorage.setItem('plr_user_id', this.currentUser.id);
    } catch(e) {}

    this.saveData();
    this.closeModal();
    this.setView('dashboard');
  },

  enrollInCourse: function(courseId) {
    if (!this.currentUser) return;
    if (!this.currentUser.enrolledCourseIds) {
      this.currentUser.enrolledCourseIds = [];
    }
    if (!this.currentUser.enrolledCourseIds.includes(courseId)) {
      this.currentUser.enrolledCourseIds.push(courseId);
      if (!this.currentUser.recentActivity) this.currentUser.recentActivity = [];
      const course = (this.data.courses || []).find(c => c.id === courseId);
      this.currentUser.recentActivity.unshift({
        title: `Enrolled in Course: ${course ? course.title : 'Course'}`,
        time: 'Just now',
        icon: 'graduation-cap'
      });
      this.saveData();
    }
    this.setView('course-hub', { courseId: courseId });
  },

  toggleBookmark: function(resourceId) {
    if (!this.currentUser) return;
    if (!this.currentUser.bookmarkedResourceIds) {
      this.currentUser.bookmarkedResourceIds = [];
    }
    const idx = this.currentUser.bookmarkedResourceIds.indexOf(resourceId);
    if (idx >= 0) {
      this.currentUser.bookmarkedResourceIds.splice(idx, 1);
    } else {
      this.currentUser.bookmarkedResourceIds.push(resourceId);
    }
    this.saveData();
  },

  toggleCompleteResource: function(resourceId) {
    if (!this.currentUser) return;
    if (!this.currentUser.completedResourceIds) {
      this.currentUser.completedResourceIds = [];
    }
    const idx = this.currentUser.completedResourceIds.indexOf(resourceId);
    if (idx < 0) {
      this.currentUser.completedResourceIds.push(resourceId);
      this.currentUser.todayStudiedMinutes = (this.currentUser.todayStudiedMinutes || 0) + 15;
      
      const res = (this.data.resources || []).find(r => r.id === resourceId);
      if (!this.currentUser.recentActivity) this.currentUser.recentActivity = [];
      this.currentUser.recentActivity.unshift({
        title: `Completed Study Material: ${res ? res.title : 'Lesson'}`,
        time: 'Just now',
        icon: 'check-circle'
      });
    }
    this.saveData();
  },

  saveQuizResult: function(quizId, scorePercentage) {
    if (!this.currentUser) return;
    const quiz = (this.data.quizzes || []).find(q => q.id === quizId) || { subjectId: 'ds', title: 'Quiz' };
    
    if (window.AIEngine) {
      this.currentUser = window.AIEngine.recalibrateSkill(this.currentUser, quiz, scorePercentage);
    }

    let interestText = 'High Interest & Great Comprehension (95%)';
    if (scorePercentage < 60) {
      interestText = 'Needs Fundamental Practice (60% Interest)';
    } else if (scorePercentage < 85) {
      interestText = 'Solid Progress & Growing Interest (80%)';
    }

    this.openModal('quiz-result-interest', {
      quizId: quizId,
      score: scorePercentage,
      interestText: interestText,
      subjectName: quiz.title
    });

    this.saveData();
  },

  updateUserProfile: function(profileData) {
    if (!this.currentUser) return;
    Object.assign(this.currentUser, profileData);
    this.saveData();
  },

  addResource: function(resourceObj) {
    resourceObj.id = 'res-' + Date.now();
    resourceObj.rating = 5.0;
    resourceObj.reviewsCount = 1;
    if (!this.data.resources) this.data.resources = [];
    this.data.resources.unshift(resourceObj);
    this.saveData();
  },

  deleteResource: function(resourceId) {
    if (!this.data.resources) return;
    this.data.resources = this.data.resources.filter(r => r.id !== resourceId);
    this.saveData();
  }
};
