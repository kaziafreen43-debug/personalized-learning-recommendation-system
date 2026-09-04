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

    // Sync complete courses, resources, roadmaps & quizzes for ALL subjects without wiping dynamic additions
    if (window.INITIAL_DATA) {
      if (!this.data.courses) {
        this.data.courses = window.INITIAL_DATA.courses;
      } else {
        window.INITIAL_DATA.courses.forEach(c => {
          if (!this.data.courses.some(dc => dc.id === c.id)) {
            this.data.courses.push(c);
          }
        });
      }
      if (!this.data.resources) {
        this.data.resources = window.INITIAL_DATA.resources;
      } else {
        window.INITIAL_DATA.resources.forEach(r => {
          if (!this.data.resources.some(dr => dr.id === r.id)) {
            this.data.resources.push(r);
          }
        });
      }
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
    this.isAuthenticated = savedAuth !== 'false';

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
      const enrolledIds = (this.currentUser.interests || []).map(id => interestToCourseMap[id]).filter(Boolean);
      const dbCourses = (this.data && this.data.courses) ? this.data.courses : [];
      dbCourses.forEach(c => {
        if ((this.currentUser.interests || []).includes(c.subjectId) && !enrolledIds.includes(c.id)) {
          enrolledIds.push(c.id);
        }
      });
      this.currentUser.enrolledCourseIds = enrolledIds;
      if (!this.currentUser.completedResourceIds) this.currentUser.completedResourceIds = [];
      if (!this.currentUser.bookmarkedResourceIds) this.currentUser.bookmarkedResourceIds = [];
      if (!this.currentUser.careerGoal) this.currentUser.careerGoal = 'AI & Machine Learning Engineer';

      // Sync completed resources from the roadmap node initial statuses
      if (this.data && this.data.roadmaps) {
        Object.values(this.data.roadmaps).forEach(rm => {
          if (rm && rm.nodes) {
            rm.nodes.forEach(node => {
              if (node.status === 'completed' && node.resourceId) {
                if (!this.currentUser.completedResourceIds.includes(node.resourceId)) {
                  this.currentUser.completedResourceIds.push(node.resourceId);
                }
              }
            });
          }
        });
      }
    }
    if (this.data && this.data.defaultUsers) {
      this.data.defaultUsers.forEach(u => {
        if (u.name === 'Alex Rivera') {
          u.name = 'Afreen Kazi';
        }
      });
    }
    // Initialize Firestore dynamic sync
    if (window.FirebaseDB) {
      window.FirebaseDB.init();
      window.FirebaseDB.syncAppState(this);
    }
  },

  saveData: function() {
    try {
      localStorage.setItem('plr_app_data', JSON.stringify(this.data));
    } catch(e) {}
    if (window.FirebaseDB && this.currentUser) {
      window.FirebaseDB.saveUser(this.currentUser);
    }
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

  loginUser: function(email, password = '') {
    if (email === 'admin@gmail.com') {
      if (password !== 'Pass@123') {
        alert('Invalid admin credentials. Please try again.');
        return false;
      }
    }
    let user = this.data.defaultUsers.find(u => u.email === email);
    if (!user) {
      if (email === 'admin@gmail.com') {
        user = {
          id: 'u-admin',
          name: 'Admin Instructor',
          email: 'admin@gmail.com',
          role: 'admin',
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=250&q=80',
          gradeClass: 'Administrator',
          preferredStyle: 'reading',
          interests: ['ds', 'cs', 'math'],
          enrolledCourseIds: [],
          completedResourceIds: [],
          bookmarkedResourceIds: [],
          dailyGoalMinutes: 60,
          todayStudiedMinutes: 0,
          streakDays: 1,
          recentActivity: []
        };
        this.data.defaultUsers.push(user);
      } else {
        user = this.data.defaultUsers[0];
      }
    }
    this.currentUser = user;
    this.isAuthenticated = true;
    try {
      localStorage.setItem('plr_is_auth', 'true');
      localStorage.setItem('plr_user_id', user.id);
    } catch(e) {}
    this.closeModal();
    if (window.FirebaseDB) {
      window.FirebaseDB.syncAppState(this);
    }
    if (user.role === 'admin') {
      this.setView('admin');
    } else {
      this.setView('dashboard');
    }
    return true;
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
      if (window.FirebaseDB) {
        window.FirebaseDB.syncAppState(this);
      }
      if (user.role === 'admin') {
        this.setView('admin');
      } else {
        this.setView('dashboard');
      }
    }
  },

  setView: function(viewName, params = {}) {
    this.currentView = viewName;
    if (params.subject) this.activeSubjectFilter = params.subject;
    if (params.courseId) this.selectedCourseId = params.courseId;
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (window.closeMobileSidebar) window.closeMobileSidebar();
    this.notify();
  },

  openModal: function(modalName, data = null) {
    this.activeModal = modalName;
    this.modalData = data;
    if (window.closeMobileSidebar) window.closeMobileSidebar();
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
    const selectedInterests = this.currentUser.interests || [];
    const enrolledIds = selectedInterests.map(id => interestToCourseMap[id]).filter(Boolean);
    const dbCourses = (this.data && this.data.courses) ? this.data.courses : [];
    dbCourses.forEach(c => {
      if (selectedInterests.includes(c.subjectId) && !enrolledIds.includes(c.id)) {
        enrolledIds.push(c.id);
      }
    });
    this.currentUser.enrolledCourseIds = enrolledIds;

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
    resourceObj.id = resourceObj.id || 'res-' + Date.now();
    resourceObj.rating = 5.0;
    resourceObj.reviewsCount = 1;
    if (!this.data.resources) this.data.resources = [];
    this.data.resources.unshift(resourceObj);
    this.saveData();
    if (window.FirebaseDB) {
      window.FirebaseDB.saveResource(resourceObj);
    }
  },

  deleteResource: function(resourceId) {
    if (!this.data.resources) return;
    this.data.resources = this.data.resources.filter(r => r.id !== resourceId);
    this.saveData();
    if (window.FirebaseDB && window.FirebaseDB.isInitialized) {
      window.FirebaseDB.db.collection('resources').doc(resourceId).delete()
        .then(() => console.log("Resource deleted from Firestore"))
        .catch(e => console.error("Error deleting resource from Firestore:", e));
    }
  },

  addSubject: function(subjectObj) {
    if (!this.data.subjects) this.data.subjects = [];
    this.data.subjects.push(subjectObj);
    this.saveData();
    if (window.FirebaseDB) {
      window.FirebaseDB.saveSubject(subjectObj);
    }
  },

  addCourse: function(courseObj) {
    courseObj.id = 'course-' + Date.now();
    courseObj.rating = 5.0;
    courseObj.enrolledCount = 0;
    courseObj.matchScore = 95;
    if (!courseObj.categories) {
      courseObj.categories = {
        Beginner: { title: 'Beginner Category (5 Questions Quiz)', materials: [], quizId: `quiz-${courseObj.subjectId}-beginner` },
        Intermediate: { title: 'Intermediate Category (10 Questions Quiz)', materials: [], quizId: `quiz-${courseObj.subjectId}-intermediate` },
        Advanced: { title: 'Advanced Category (15 Questions Quiz)', materials: [], quizId: `quiz-${courseObj.subjectId}-advanced` }
      };
    }
    if (!this.data.courses) this.data.courses = [];
    this.data.courses.unshift(courseObj);
    this.saveData();
    if (window.FirebaseDB) {
      window.FirebaseDB.saveCourse(courseObj);
    }
  },

  addVideoToCourse: function(courseId, tier, title, description, contentUrl, duration) {
    const course = this.data.courses.find(c => c.id === courseId);
    if (!course) return;
    const resId = 'res-vid-' + Date.now();
    const resource = {
      id: resId,
      title: title,
      format: 'video',
      duration: duration || '15 mins',
      contentUrl: contentUrl,
      summary: description,
      description: description,
      subjectId: course.subjectId,
      level: tier,
      vark: ['visual', 'auditory'],
      rating: 5.0,
      reviewsCount: 1,
      suitableClass: course.suitableClass || 'Grade 11-12'
    };

    if (!this.data.resources) this.data.resources = [];
    this.data.resources.unshift(resource);

    if (!course.categories) course.categories = {};
    if (!course.categories[tier]) {
      course.categories[tier] = {
        title: `${tier} Category`,
        materials: [],
        quizId: `quiz-${course.subjectId}-${tier.toLowerCase()}`
      };
    }
    if (!course.categories[tier].materials) {
      course.categories[tier].materials = [];
    }
    course.categories[tier].materials.push({
      id: resId,
      title: '🎥 ' + title,
      format: 'video',
      duration: duration || '15 mins'
    });

    this.saveData();
    if (window.FirebaseDB) {
      window.FirebaseDB.saveResource(resource);
      window.FirebaseDB.saveCourse(course);
    }
  },

  addAssignment: function(courseId, title, description, points) {
    const assignment = {
      id: 'assign-' + Date.now(),
      courseId: courseId,
      title: title,
      description: description,
      points: Number(points) || 100,
      createdAt: new Date().toISOString()
    };
    if (!this.data.assignments) this.data.assignments = [];
    this.data.assignments.unshift(assignment);
    this.saveData();
    if (window.FirebaseDB) {
      window.FirebaseDB.saveAssignment(assignment);
    }
  },

  submitAssignment: function(assignmentId, courseId, submissionText, submissionLink) {
    if (!this.currentUser) return;
    const submission = {
      userId: this.currentUser.id,
      userName: this.currentUser.name,
      assignmentId: assignmentId,
      courseId: courseId,
      submissionText: submissionText || '',
      submissionLink: submissionLink || '',
      submittedAt: new Date().toISOString(),
      status: 'submitted'
    };
    if (!this.data.submissions) this.data.submissions = [];
    
    const existingIndex = this.data.submissions.findIndex(s => s.assignmentId === assignmentId && s.userId === this.currentUser.id);
    if (existingIndex >= 0) {
      this.data.submissions[existingIndex] = submission;
    } else {
      this.data.submissions.push(submission);
    }

    if (!this.currentUser.recentActivity) this.currentUser.recentActivity = [];
    const assign = (this.data.assignments || []).find(a => a.id === assignmentId);
    this.currentUser.recentActivity.unshift({
      title: `Submitted Assignment: ${assign ? assign.title : 'Course Work'}`,
      time: 'Just now',
      icon: 'file-text'
    });

    this.saveData();
    if (window.FirebaseDB) {
      window.FirebaseDB.saveSubmission(submission);
      window.FirebaseDB.saveUser(this.currentUser);
    }
  }
};
