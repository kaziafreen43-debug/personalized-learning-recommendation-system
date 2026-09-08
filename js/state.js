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

  isLoadingStudents: true,
  studentLoadError: null,
  realtimeUnsubscribe: null,
  
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
      if (window.INITIAL_DATA.defaultUsers) {
        if (!this.data.defaultUsers) {
          this.data.defaultUsers = window.INITIAL_DATA.defaultUsers;
        } else {
          window.INITIAL_DATA.defaultUsers.forEach(u => {
            if (!this.data.defaultUsers.some(du => du.id === u.id)) {
              this.data.defaultUsers.push(u);
            }
          });
        }
      }
    }

    // Purge any legacy static mock students (u-1 to u-8) from cached localStorage data
    const legacyMockIds = ['u-1', 'u-2', 'u-3', 'u-4', 'u-5', 'u-6', 'u-7', 'u-8'];
    const mockEmails = ['alex@student.ai', 'ethan.b@student.ai', 'sophia.c@student.ai', 'marcus.t@student.ai', 'priya.s@student.ai', 'lucas.s@student.ai', 'elena.r@student.ai', 'noah.k@student.ai'];
    if (this.data && this.data.defaultUsers) {
      this.data.defaultUsers = this.data.defaultUsers.filter(u => {
        if (u.role === 'admin') return true;
        if (legacyMockIds.includes(u.id) || (u.email && mockEmails.includes(u.email.toLowerCase()))) return false;
        return true;
      });
    }

    if (!this.data.assignments || this.data.assignments.length === 0) {
      this.data.assignments = [
        {
          id: 'assign-ai-mcq-1',
          courseId: 'course-ai-101',
          title: 'AI & Machine Learning Foundations Assignment',
          description: 'Assess your foundational understanding of Artificial Intelligence concepts, neural network mechanics, and supervised learning.',
          points: 100,
          questions: [
            {
              id: 'q-ai-1',
              text: 'What is AI?',
              options: [
                'Artificial Ice',
                'Artificial Intelligence',
                'Artificial Internet',
                'Automatic Input'
              ],
              correctAnswer: 1
            },
            {
              id: 'q-ai-2',
              text: 'Which type of learning uses labeled input and output training pairs?',
              options: [
                'Supervised Learning',
                'Unsupervised Learning',
                'Clustering Algorithms',
                'Random Initialization'
              ],
              correctAnswer: 0
            },
            {
              id: 'q-ai-3',
              text: 'What is the role of backpropagation in deep neural networks?',
              options: [
                'To delete unused dataset features',
                'To compute gradients and update connection weights',
                'To format training data into text files',
                'To increase screen resolution'
              ],
              correctAnswer: 1
            }
          ],
          createdAt: new Date().toISOString()
        }
      ];
    }

    if (!this.data || !this.data.courses) {
      this.data = window.INITIAL_DATA || {};
    }

    const savedTheme = localStorage.getItem('plr_theme');
    this.theme = savedTheme || 'light';
    document.documentElement.setAttribute('data-theme', this.theme);

    const savedAuth = localStorage.getItem('plr_is_auth');
    const savedUserId = localStorage.getItem('plr_user_id');

    if (savedAuth === 'true' && savedUserId) {
      const user = (this.data.defaultUsers || []).find(u => u.id === savedUserId);
      if (user) {
        this.currentUser = user;
        this.isAuthenticated = true;
      } else {
        this.currentUser = null;
        this.isAuthenticated = false;
        try {
          localStorage.removeItem('plr_is_auth');
          localStorage.removeItem('plr_user_id');
        } catch(_) {}
      }
    } else {
      this.currentUser = null;
      this.isAuthenticated = false;
    }

    if (this.currentUser && this.currentUser.role !== 'admin') {
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
    }

    // Initialize Firestore dynamic sync
    if (window.FirebaseDB) {
      window.FirebaseDB.init();
      window.FirebaseDB.syncAppState(this);
    }

    this.setupStudentListener();
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

  setupStudentListener: function() {
    if (this.realtimeUnsubscribe) {
      try { this.realtimeUnsubscribe(); } catch (_) {}
      this.realtimeUnsubscribe = null;
    }

    if (window.FirebaseDB) {
      this.isLoadingStudents = true;
      this.studentLoadError = null;

      this.realtimeUnsubscribe = window.FirebaseDB.listenToStudents(
        (students) => {
          this.isLoadingStudents = false;
          this.studentLoadError = null;

          if (!this.data) this.data = {};
          if (!this.data.defaultUsers) this.data.defaultUsers = [];

          // Retain admin account
          const admin = this.data.defaultUsers.find(u => u.role === 'admin') || (window.INITIAL_DATA && window.INITIAL_DATA.defaultUsers ? window.INITIAL_DATA.defaultUsers.find(u => u.role === 'admin') : null);

          // Rebuild defaultUsers with admin + dynamic Firestore students
          const validStudents = (students || []).filter(s => s && s.role !== 'admin');
          this.data.defaultUsers = admin ? [admin, ...validStudents] : validStudents;
          this.data.students = validStudents;

          if (this.currentUser && this.currentUser.role !== 'admin') {
            const updatedProfile = validStudents.find(s => s.id === this.currentUser.id || (s.email && s.email.toLowerCase() === (this.currentUser.email || '').toLowerCase()));
            if (updatedProfile) {
              Object.assign(this.currentUser, updatedProfile);
            }
          }

          try {
            localStorage.setItem('plr_app_data', JSON.stringify(this.data));
          } catch (_) {}

          this.notify();
        },
        (error) => {
          console.error("Error in real-time student listener:", error);
          this.isLoadingStudents = false;
          this.studentLoadError = "Unable to load student data. Please try again.";
          this.notify();
        }
      );
    } else {
      this.isLoadingStudents = false;
    }
  },

  loginUser: async function(email, password = '') {
    if (email === 'admin@gmail.com') {
      if (password !== 'Pass@123') {
        alert('Invalid admin credentials. Please try again.');
        return false;
      }
      let user = (this.data.defaultUsers || []).find(u => u.email === email);
      if (!user) {
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
        if (!this.data.defaultUsers) this.data.defaultUsers = [];
        this.data.defaultUsers.push(user);
      }
      this.currentUser = user;
      this.isAuthenticated = true;
      try {
        localStorage.setItem('plr_is_auth', 'true');
        localStorage.setItem('plr_user_id', user.id);
      } catch(e) {}
      this.closeModal();
      this.setView('admin');
      return true;
    }

    // Student Login
    let user = (this.data.defaultUsers || []).find(u => u.email && u.email.toLowerCase() === email.toLowerCase());

    // Try Firebase Authentication
    if (window.auth && password) {
      try {
        const cred = await window.auth.signInWithEmailAndPassword(email, password);
        if (cred && cred.user) {
          const authUid = cred.user.uid;
          if (!user) {
            user = (this.data.defaultUsers || []).find(u => u.id === authUid || u.uid === authUid);
          }
          if (!user && window.FirebaseDB && window.FirebaseDB.db) {
            const docSnap = await window.FirebaseDB.db.collection('users').doc(authUid).get();
            if (docSnap && (typeof docSnap.data === 'function' ? docSnap.data() : docSnap.exists)) {
              user = typeof docSnap.data === 'function' ? docSnap.data() : null;
            }
          }
        }
      } catch (authErr) {
        console.warn("Firebase Auth sign-in warning:", authErr.code || authErr.message);
      }
    }

    if (!user) {
      alert("No registered student account found for " + email + ". Please register to continue.");
      return false;
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
    this.setView('dashboard');
    return true;
  },

  logoutUser: function() {
    if (window.auth) {
      try { window.auth.signOut(); } catch (_) {}
    }
    this.isAuthenticated = false;
    this.currentUser = null;
    try {
      localStorage.setItem('plr_is_auth', 'false');
      localStorage.removeItem('plr_user_id');
    } catch(e) {}
    this.setView('dashboard');
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

  submitQuestionnaire: async function(formData) {
    const isNewRegistration = this.modalData && this.modalData.isNewRegistration;
    let registeredEmail = (this.modalData && this.modalData.email) 
      ? this.modalData.email.trim() 
      : ((this.currentUser && this.currentUser.email) ? this.currentUser.email : '');
    let studentName = (formData.name && formData.name.trim()) 
      ? formData.name.trim() 
      : ((this.modalData && this.modalData.name) ? this.modalData.name.trim() : (this.currentUser ? this.currentUser.name : 'Student'));
    let userId = (this.currentUser && !isNewRegistration) ? this.currentUser.id : ('u-' + Date.now());

    // Connect with Firebase Authentication if email and password are provided
    if (window.auth && this.modalData && this.modalData.email && this.modalData.password) {
      try {
        const userCredential = await window.auth.createUserWithEmailAndPassword(this.modalData.email, this.modalData.password);
        if (userCredential && userCredential.user) {
          userId = userCredential.user.uid;
          registeredEmail = userCredential.user.email;
          try {
            await userCredential.user.updateProfile({ displayName: studentName });
          } catch (_) {}
        }
      } catch (authErr) {
        console.warn("Firebase Auth registration note:", authErr.code || authErr.message);
        if (authErr.code === 'auth/email-already-in-use') {
          try {
            const signCred = await window.auth.signInWithEmailAndPassword(this.modalData.email, this.modalData.password);
            if (signCred && signCred.user) {
              userId = signCred.user.uid;
              registeredEmail = signCred.user.email;
            }
          } catch (_) {}
        }
      }
    }

    const interestToCourseMap = {
      'ds': 'course-ai-101',
      'cs': 'course-cs-101',
      'math': 'course-math-101',
      'physics': 'course-physics-101',
      'bio': 'course-bio-101',
      'chem': 'course-chem-101'
    };
    const selectedInterests = formData.interests || [];
    const enrolledIds = selectedInterests.map(id => interestToCourseMap[id]).filter(Boolean);
    const dbCourses = (this.data && this.data.courses) ? this.data.courses : [];
    dbCourses.forEach(c => {
      if (selectedInterests.includes(c.subjectId) && !enrolledIds.includes(c.id)) {
        enrolledIds.push(c.id);
      }
    });

    const userProfile = {
      id: userId,
      uid: userId,
      name: studentName,
      email: registeredEmail,
      role: 'student',
      avatar: (this.currentUser && this.currentUser.avatar) ? this.currentUser.avatar : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      gradeClass: formData.gradeClass || 'Grade 11',
      skillLevel: formData.skillLevel || 'Intermediate',
      preferredStyle: formData.preferredStyle || 'visual',
      careerGoal: formData.careerGoal || 'AI & Machine Learning Engineer',
      interests: selectedInterests,
      enrolledCourseIds: enrolledIds,
      completedResourceIds: (this.currentUser && !isNewRegistration && this.currentUser.completedResourceIds) ? this.currentUser.completedResourceIds : [],
      bookmarkedResourceIds: (this.currentUser && !isNewRegistration && this.currentUser.bookmarkedResourceIds) ? this.currentUser.bookmarkedResourceIds : [],
      dailyGoalMinutes: 30,
      todayStudiedMinutes: 0,
      streakDays: 1,
      createdAt: (this.currentUser && !isNewRegistration && this.currentUser.createdAt) ? this.currentUser.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      recentActivity: [{ title: 'Registered & Completed Onboarding Questionnaire', time: 'Just now', icon: 'check-circle' }]
    };

    this.currentUser = userProfile;
    if (!this.data.defaultUsers) this.data.defaultUsers = [];
    const existingIdx = this.data.defaultUsers.findIndex(u => u.id === userId || (u.email && u.email.toLowerCase() === registeredEmail.toLowerCase()));
    if (existingIdx >= 0) {
      this.data.defaultUsers[existingIdx] = userProfile;
    } else {
      this.data.defaultUsers.push(userProfile);
    }

    this.isAuthenticated = true;
    try {
      localStorage.setItem('plr_is_auth', 'true');
      localStorage.setItem('plr_user_id', userProfile.id);
    } catch(e) {}

    this.saveData();
    if (window.FirebaseDB) {
      await window.FirebaseDB.saveUser(userProfile);
    }
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

  addAssignment: function(courseId, title, description, points, questions) {
    const assignment = {
      id: 'assign-' + Date.now(),
      courseId: courseId,
      title: title,
      description: description,
      points: Number(points) || 100,
      questions: Array.isArray(questions) ? questions : [],
      createdAt: new Date().toISOString()
    };
    if (!this.data.assignments) this.data.assignments = [];
    this.data.assignments.unshift(assignment);
    this.saveData();
    if (window.FirebaseDB) {
      window.FirebaseDB.saveAssignment(assignment);
    }
    return assignment;
  },

  updateAssignment: function(assignmentId, updatedData) {
    if (!this.data.assignments) return null;
    const idx = this.data.assignments.findIndex(a => a.id === assignmentId);
    if (idx >= 0) {
      this.data.assignments[idx] = {
        ...this.data.assignments[idx],
        ...updatedData,
        updatedAt: new Date().toISOString()
      };
      this.saveData();
      if (window.FirebaseDB) {
        window.FirebaseDB.saveAssignment(this.data.assignments[idx]);
      }
      return this.data.assignments[idx];
    }
    return null;
  },

  deleteAssignment: function(assignmentId) {
    if (!this.data.assignments) return;
    this.data.assignments = this.data.assignments.filter(a => a.id !== assignmentId);
    this.saveData();
    if (window.FirebaseDB && window.FirebaseDB.db) {
      try {
        window.FirebaseDB.db.collection('assignments').doc(assignmentId).delete()
          .then(() => console.log("Assignment deleted from Firestore"))
          .catch(e => console.error("Error deleting assignment from Firestore:", e));
      } catch (e) {
        console.error("Firestore delete error:", e);
      }
    }
  },

  submitAssignment: function(assignmentId, courseId, submissionText, submissionLink, mcqData) {
    if (!this.currentUser) return;
    const submission = {
      userId: this.currentUser.id,
      userName: this.currentUser.name,
      assignmentId: assignmentId,
      courseId: courseId,
      submissionText: submissionText || '',
      submissionLink: submissionLink || '',
      submittedAt: new Date().toISOString(),
      status: mcqData ? 'graded' : 'submitted',
      ...(mcqData || {})
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
      title: mcqData ? `Completed MCQ: ${assign ? assign.title : 'Assignment'} (${mcqData.percentage}%)` : `Submitted Assignment: ${assign ? assign.title : 'Course Work'}`,
      time: 'Just now',
      icon: 'file-text'
    });

    this.saveData();
    if (window.FirebaseDB) {
      window.FirebaseDB.saveSubmission(submission);
      window.FirebaseDB.saveUser(this.currentUser);
    }
    return submission;
  }
};
