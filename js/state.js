// App State Management & Persistence

// --------------------------------------------------------------------------
// Multi-Category & Recommendation Taxonomy Engine
// --------------------------------------------------------------------------
window.CATEGORY_TAXONOMY = {
  ds: {
    id: 'ds',
    name: 'Artificial Intelligence & Data Science',
    category: 'AI Machine Learning',
    tags: ['AI Machine Learning', 'Computer science', 'Artificial Intelligence', 'Data Science', 'Machine Learning'],
    aliases: ['ds', 'ai', 'aiml', 'ai machine learning', 'ai & machine learning', 'artificial intelligence', 'artificial intelligence & data science', 'data science', 'machine learning', 'deep learning']
  },
  cs: {
    id: 'cs',
    name: 'Computer Science & Software',
    category: 'Computer science',
    tags: ['Computer science', 'Software Engineering', 'Algorithms', 'Web Development'],
    aliases: ['cs', 'computer science', 'computer science & software', 'software', 'programming', 'software engineering', 'web dev', 'python']
  },
  math: {
    id: 'math',
    name: 'Mathematics & Analytics',
    category: 'Mathematics',
    tags: ['Mathematics', 'Analytics', 'Calculus', 'Algebra', 'Statistics'],
    aliases: ['math', 'mathematics', 'mathematics & analytics', 'algebra', 'calculus', 'analytics', 'statistics', 'discrete math']
  },
  physics: {
    id: 'physics',
    name: 'Physics & Quantum Systems',
    category: 'Physics',
    tags: ['Physics', 'Quantum Systems', 'Mechanics', 'Electromagnetism'],
    aliases: ['physics', 'physics & quantum systems', 'quantum systems', 'quantum', 'mechanics', 'electromagnetism']
  },
  bio: {
    id: 'bio',
    name: 'Biology & Biotechnology',
    category: 'Biology',
    tags: ['Biology', 'Biotechnology', 'Genetics', 'Cell Biology'],
    aliases: ['bio', 'biology', 'biology & biotechnology', 'biotechnology', 'genetics', 'cell biology', 'bioinformatics']
  },
  chem: {
    id: 'chem',
    name: 'Chemistry & Molecules',
    category: 'Chemistry',
    tags: ['Chemistry', 'Molecular Science', 'Organic Synthesis', 'Chemical Reactions'],
    aliases: ['chem', 'chemistry', 'chemistry & molecules', 'molecules', 'chemical', 'organic chemistry', 'chemical reactions']
  }
};

window.normalizeCategoryKey = function(cat) {
  if (!cat || typeof cat !== 'string') return '';
  const clean = cat.trim().toLowerCase();
  if (window.CATEGORY_TAXONOMY) {
    for (const [key, meta] of Object.entries(window.CATEGORY_TAXONOMY)) {
      if (key === clean) return key;
      if (meta.aliases && meta.aliases.some(a => a === clean || clean.includes(a) || a.includes(clean))) {
        return key;
      }
    }
  }
  return clean;
};

window.getSubjectCategoryName = function(subId) {
  if (!subId) return 'General';
  const norm = window.normalizeCategoryKey(subId);
  if (window.CATEGORY_TAXONOMY && window.CATEGORY_TAXONOMY[norm]) {
    return window.CATEGORY_TAXONOMY[norm].category;
  }
  return subId;
};

window.getItemCategories = function(item) {
  const cats = new Set();
  if (!item || typeof item !== 'object') return [];
  if (item.category) {
    if (Array.isArray(item.category)) item.category.forEach(c => cats.add(c));
    else if (typeof item.category === 'string') cats.add(item.category);
  }
  if (Array.isArray(item.categories)) {
    item.categories.forEach(c => {
      if (typeof c === 'string') cats.add(c);
    });
  }
  if (Array.isArray(item.tags)) {
    item.tags.forEach(t => {
      if (typeof t === 'string') cats.add(t);
    });
  }
  if (item.subjectId) {
    cats.add(item.subjectId);
  }
  if (item.courseId && window.AppState && window.AppState.data && window.AppState.data.courses) {
    const parent = window.AppState.data.courses.find(c => c.id === item.courseId);
    if (parent) {
      window.getItemCategories(parent).forEach(c => cats.add(c));
    }
  }
  return Array.from(cats);
};

window.itemMatchesInterests = function(item, userInterests) {
  if (!item) return false;
  if (!userInterests || !Array.isArray(userInterests) || userInterests.length === 0) {
    return false;
  }
  const itemCats = window.getItemCategories(item);
  if (itemCats.length === 0) return false;

  const normalizedUserInterests = userInterests.map(i => window.normalizeCategoryKey(i));

  for (const rawCat of itemCats) {
    const norm = window.normalizeCategoryKey(rawCat);
    if (normalizedUserInterests.includes(norm)) {
      return true;
    }
    for (const rawInterest of userInterests) {
      if (typeof rawInterest === 'string' && typeof rawCat === 'string') {
        const a = rawInterest.trim().toLowerCase();
        const b = rawCat.trim().toLowerCase();
        if (a === b || a.includes(b) || b.includes(a)) {
          return true;
        }
      }
    }
  }
  return false;
};

window.autoCategorizeItem = function(item, type = 'item') {
  if (!item || typeof item !== 'object') return item;
  
  const subId = item.subjectId || (item.courseId && window.AppState && window.AppState.data && window.AppState.data.courses && (window.AppState.data.courses.find(c => c.id === item.courseId) || {}).subjectId) || '';
  const tax = (window.CATEGORY_TAXONOMY && subId && window.CATEGORY_TAXONOMY[subId]) || null;
  
  let cats = Array.isArray(item.categories) ? [...item.categories] : [];
  if (item.category && typeof item.category === 'string' && !cats.includes(item.category)) {
    cats.push(item.category);
  }
  let tags = Array.isArray(item.tags) ? [...item.tags] : [];

  if (tax) {
    if (!item.category) item.category = tax.category;
    if (cats.length === 0) cats.push(tax.category);
    if (tax.tags) {
      tax.tags.forEach(t => {
        if (!tags.includes(t)) tags.push(t);
      });
    }
    if (!tags.includes(tax.category)) tags.push(tax.category);
    if (!tags.includes(tax.name)) tags.push(tax.name);
    if (!tags.includes(tax.id)) tags.push(tax.id);
  }

  const text = ((item.title || '') + ' ' + (item.description || '')).toLowerCase();
  if (window.CATEGORY_TAXONOMY) {
    Object.values(window.CATEGORY_TAXONOMY).forEach(t => {
      if (t.aliases.some(a => text.includes(a))) {
        if (!cats.includes(t.category)) cats.push(t.category);
        if (!tags.includes(t.category)) tags.push(t.category);
      }
    });
  }

  if (cats.length === 0) cats.push(subId || 'General');
  if (tags.length === 0) tags.push(subId || 'General');

  item.categories = cats;
  item.tags = Array.from(new Set(tags));
  if (!item.category) item.category = cats[0];

  return item;
};

window.autoCategorizeAllData = function(data) {
  if (!data) return;
  if (Array.isArray(data.courses)) {
    data.courses.forEach(c => window.autoCategorizeItem(c, 'course'));
  }
  if (Array.isArray(data.resources)) {
    data.resources.forEach(r => window.autoCategorizeItem(r, 'resource'));
  }
  if (data.roadmaps && typeof data.roadmaps === 'object') {
    Object.entries(data.roadmaps).forEach(([k, rm]) => {
      rm.subjectId = rm.subjectId || k;
      window.autoCategorizeItem(rm, 'roadmap');
    });
  }
  if (Array.isArray(data.quizzes)) {
    data.quizzes.forEach(q => window.autoCategorizeItem(q, 'quiz'));
  }
  if (Array.isArray(data.assignments)) {
    data.assignments.forEach(a => window.autoCategorizeItem(a, 'assignment'));
  }
};

window.AppState = {
  data: null,
  currentUser: null,
  isAuthenticated: false,
  showAllCourses: false,
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
  _userProfileUnsubscribe: null,
  
  listeners: [],

  init: function() {
    this.showAllCourses = false;
    const savedData = localStorage.getItem('plr_app_data');
    if (savedData) {
      try {
        this.data = JSON.parse(savedData);
      } catch (e) {
        this.data = null;
      }
    }
    if (!this.data) {
      this.data = {
        courses: (window.INITIAL_DATA && window.INITIAL_DATA.courses) ? [...window.INITIAL_DATA.courses] : [],
        resources: (window.INITIAL_DATA && window.INITIAL_DATA.resources) ? [...window.INITIAL_DATA.resources] : [],
        quizzes: (window.INITIAL_DATA && window.INITIAL_DATA.quizzes) ? [...window.INITIAL_DATA.quizzes] : [],
        assignments: (window.INITIAL_DATA && window.INITIAL_DATA.assignments) ? [...window.INITIAL_DATA.assignments] : [],
        submissions: [],
        subjects: (window.INITIAL_DATA && window.INITIAL_DATA.subjects) || [],
        defaultUsers: (window.INITIAL_DATA && window.INITIAL_DATA.defaultUsers) || [],
        roadmaps: (window.INITIAL_DATA && window.INITIAL_DATA.roadmaps) || {}
      };
      this.saveData();
    }

    if (!Array.isArray(this.data.courses)) this.data.courses = [];
    if (!Array.isArray(this.data.resources)) this.data.resources = [];
    if (!Array.isArray(this.data.quizzes)) this.data.quizzes = [];
    if (!Array.isArray(this.data.assignments)) this.data.assignments = [];
    if (!Array.isArray(this.data.submissions)) this.data.submissions = [];
    if (!Array.isArray(this.data.subjects)) this.data.subjects = (window.INITIAL_DATA && window.INITIAL_DATA.subjects) || [];
    if (!this.data.roadmaps) this.data.roadmaps = (window.INITIAL_DATA && window.INITIAL_DATA.roadmaps) || {};

    // Guarantee full content from INITIAL_DATA if local storage cache is empty
    if (this.data.courses.length === 0 && window.INITIAL_DATA && Array.isArray(window.INITIAL_DATA.courses)) {
      this.data.courses = [...window.INITIAL_DATA.courses];
    }
    if (this.data.resources.length === 0 && window.INITIAL_DATA && Array.isArray(window.INITIAL_DATA.resources)) {
      this.data.resources = [...window.INITIAL_DATA.resources];
    }
    if (Object.keys(this.data.roadmaps).length === 0 && window.INITIAL_DATA && window.INITIAL_DATA.roadmaps) {
      this.data.roadmaps = { ...window.INITIAL_DATA.roadmaps };
    }
    if (this.data.assignments.length === 0 && window.INITIAL_DATA && Array.isArray(window.INITIAL_DATA.assignments)) {
      this.data.assignments = [...window.INITIAL_DATA.assignments];
    }

    // Always maintain master repository for instant category switching
    this.data._masterCourses = [...this.data.courses];
    this.data._masterResources = [...this.data.resources];
    this.data._masterAssignments = [...this.data.assignments];

    // Automatically assign multiple categories & tags to any content missing them
    if (window.autoCategorizeAllData) {
      window.autoCategorizeAllData(this.data);
    }

    // Ensure all 6 core subjects are always present
    const coreSubjects = (window.INITIAL_DATA && window.INITIAL_DATA.subjects) || [];
    coreSubjects.forEach(s => {
      if (!this.data.subjects.some(existing => existing.id === s.id)) {
        this.data.subjects.push(s);
      }
    });

    // Ensure all 18 core subject category quizzes (Beginner, Intermediate, Advanced) are always present
    const defaultQuizzes = (window.ALL_SUBJECT_QUIZZES || (window.INITIAL_DATA && window.INITIAL_DATA.quizzes) || []);
    defaultQuizzes.forEach(dq => {
      const idx = this.data.quizzes.findIndex(q => q.id === dq.id || (q.subjectId === dq.subjectId && q.level === dq.level));
      if (idx === -1) {
        this.data.quizzes.push(dq);
      } else if (!this.data.quizzes[idx].questions || this.data.quizzes[idx].questions.length === 0) {
        this.data.quizzes[idx] = dq;
      }
    });

    // Ensure admin user always exists with role: 'admin' and never gets purged
    if (!this.data.defaultUsers) this.data.defaultUsers = [];
    let existingAdmin = this.data.defaultUsers.find(u => u.id === 'u-admin' || (u.email && u.email.toLowerCase() === 'admin@gmail.com') || u.role === 'admin');
    if (!existingAdmin) {
      existingAdmin = {
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
      this.data.defaultUsers.unshift(existingAdmin);
    }
    existingAdmin.role = 'admin';
    existingAdmin.gradeClass = 'Administrator';

    // Purge any legacy static mock students (u-1 to u-8) from cached localStorage data
    const legacyMockIds = ['u-1', 'u-2', 'u-3', 'u-4', 'u-5', 'u-6', 'u-7', 'u-8'];
    const mockEmails = ['alex@student.ai', 'ethan.b@student.ai', 'sophia.c@student.ai', 'marcus.t@student.ai', 'priya.s@student.ai', 'lucas.s@student.ai', 'elena.r@student.ai', 'noah.k@student.ai'];
    if (this.data && this.data.defaultUsers) {
      this.data.defaultUsers = this.data.defaultUsers.filter(u => {
        if (u.id === 'u-admin' || (u.email && u.email.toLowerCase() === 'admin@gmail.com') || u.role === 'admin') return true;
        if (legacyMockIds.includes(u.id) || (u.email && mockEmails.includes(u.email.toLowerCase()))) return false;
        return true;
      });
    }

    // Ensure state.data.students is initialized with registered students
    if (!this.data.students || this.data.students.length === 0) {
      this.data.students = (this.data.defaultUsers || []).filter(u => u && u.role !== 'admin' && u.id !== 'u-admin' && (u.email || '').toLowerCase() !== 'admin@gmail.com');
    }
    this.studentLoadError = null;

    const savedTheme = localStorage.getItem('plr_theme');
    this.theme = savedTheme || 'light';
    document.documentElement.setAttribute('data-theme', this.theme);

    const savedAuth = localStorage.getItem('plr_is_auth');
    const savedUserId = localStorage.getItem('plr_user_id');

    if (savedAuth === 'true' && savedUserId) {
      const user = (this.data.defaultUsers || []).find(u => u.id === savedUserId || (savedUserId === 'u-admin' && (u.email && u.email.toLowerCase() === 'admin@gmail.com')));
      if (user) {
        if (savedUserId === 'u-admin' || (user.email && user.email.toLowerCase() === 'admin@gmail.com')) {
          user.role = 'admin';
          user.gradeClass = 'Administrator';
        }
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
      if (!this.currentUser.interests || this.currentUser.interests.length === 0) {
        this.currentUser.interests = ['ds', 'math'];
      }
      const enrolledIds = [];
      const dbCourses = (this.data && this.data.courses) ? this.data.courses : [];
      dbCourses.forEach(c => {
        if (window.itemMatchesInterests(c, this.currentUser.interests)) {
          if (!enrolledIds.includes(c.id)) enrolledIds.push(c.id);
        }
      });
      this.currentUser.enrolledCourseIds = enrolledIds;
      if (!this.currentUser.completedResourceIds) this.currentUser.completedResourceIds = [];
      if (!this.currentUser.bookmarkedResourceIds) this.currentUser.bookmarkedResourceIds = [];
      if (!this.currentUser.careerGoal) this.currentUser.careerGoal = 'AI & Machine Learning Engineer';
      if (!this.currentUser.learningStyle) this.currentUser.learningStyle = this.currentUser.preferredStyle || 'visual';
      if (!this.currentUser.preferredStyle) this.currentUser.preferredStyle = this.currentUser.learningStyle || 'visual';
      if (!this.currentUser.skillLevel) this.currentUser.skillLevel = 'Intermediate';
    }

    // Initialize Firestore dynamic sync
    if (window.FirebaseDB) {
      window.FirebaseDB.init();
      window.FirebaseDB.syncAppState(this);
    }

    this.setupStudentListener();
    if (this.currentUser && this.currentUser.id) {
      this.setupRealtimeProfileListener(this.currentUser.id);
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
          let admin = this.data.defaultUsers.find(u => u.id === 'u-admin' || (u.email && u.email.toLowerCase() === 'admin@gmail.com') || u.role === 'admin') || (window.INITIAL_DATA && window.INITIAL_DATA.defaultUsers ? window.INITIAL_DATA.defaultUsers.find(u => u.role === 'admin') : null);
          if (admin) {
            admin.role = 'admin';
            admin.gradeClass = 'Administrator';
          }

          // Rebuild defaultUsers with admin + dynamic Firestore students (excluding any admin duplicates)
          const validStudents = (students || []).filter(s => s && s.role !== 'admin' && s.id !== 'u-admin' && (s.email || '').toLowerCase() !== 'admin@gmail.com');
          this.data.defaultUsers = admin ? [admin, ...validStudents] : validStudents;
          this.data.students = validStudents;

          if (this.currentUser && this.currentUser.role !== 'admin') {
            const updatedProfile = validStudents.find(s => s.id === this.currentUser.id || (s.email && s.email.toLowerCase() === (this.currentUser.email || '').toLowerCase()));
            if (updatedProfile) {
              const prevInterests = JSON.stringify(this.currentUser.interests || []);
              const newInterests = JSON.stringify(updatedProfile.interests || []);
              Object.assign(this.currentUser, updatedProfile);
              if (prevInterests !== newInterests) {
                if (window.FirebaseDB && typeof window.FirebaseDB.syncPersonalizedContent === 'function') {
                  window.FirebaseDB.syncPersonalizedContent(this);
                }
              }
            }
          }

          try {
            localStorage.setItem('plr_app_data', JSON.stringify(this.data));
          } catch (_) {}

          this.notify();
        },
        (error) => {
          console.warn("Notice: Real-time student listener fallback active:", error);
          this.isLoadingStudents = false;

          // Check if we already have valid registered students in memory or storage
          const existingStudents = (this.data && this.data.students && this.data.students.length > 0)
            ? this.data.students
            : ((this.data && this.data.defaultUsers) ? this.data.defaultUsers.filter(u => u && u.role !== 'admin' && u.id !== 'u-admin' && (u.email || '').toLowerCase() !== 'admin@gmail.com') : []);

          if (existingStudents.length > 0) {
            this.studentLoadError = null;
            this.data.students = existingStudents;
          } else {
            // Check localStorage plr_app_data and plr_firestore_mock
            let recovered = [];
            try {
              const rawData = localStorage.getItem('plr_app_data');
              if (rawData) {
                const parsed = JSON.parse(rawData);
                const candidates = parsed.students || parsed.defaultUsers || [];
                recovered = candidates.filter(u => u && u.role !== 'admin' && u.id !== 'u-admin' && (u.email || '').toLowerCase() !== 'admin@gmail.com');
              }
              if (recovered.length === 0) {
                const mockDB = JSON.parse(localStorage.getItem('plr_firestore_mock') || '{}');
                if (mockDB.users) {
                  recovered = Object.values(mockDB.users).filter(u => u && u.role !== 'admin' && u.id !== 'u-admin' && (u.email || '').toLowerCase() !== 'admin@gmail.com');
                }
              }
            } catch (_) {}

            if (recovered.length > 0) {
              this.studentLoadError = null;
              this.data.students = recovered;
              const admin = (this.data.defaultUsers || []).find(u => u.role === 'admin' || u.id === 'u-admin');
              this.data.defaultUsers = admin ? [admin, ...recovered] : recovered;
            } else {
              this.studentLoadError = "Unable to load student data. Please try again.";
            }
          }
          this.notify();
        }
      );
    } else {
      this.isLoadingStudents = false;
    }
  },

  setupRealtimeProfileListener: function(userId) {
    if (this._userProfileUnsubscribe) {
      try { this._userProfileUnsubscribe(); } catch (_) {}
      this._userProfileUnsubscribe = null;
    }
    if (!window.db || !userId) return;
    try {
      const userRef = window.db.collection('users').doc(userId);
      if (typeof userRef.onSnapshot === 'function') {
        this._userProfileUnsubscribe = userRef.onSnapshot(doc => {
          if (!doc) return;
          const data = typeof doc.data === 'function' ? doc.data() : doc;
          if (!data || !this.currentUser || (this.currentUser.id !== userId && this.currentUser.email !== data.email)) return;
          
          const prevInterests = JSON.stringify(this.currentUser.interests || []);
          const newInterests = JSON.stringify(data.interests || []);
          const prevGoal = this.currentUser.careerGoal;
          const prevSkill = this.currentUser.skillLevel;
          const prevStyle = this.currentUser.learningStyle || this.currentUser.preferredStyle;

          Object.assign(this.currentUser, data);
          if (data.preferredStyle && !this.currentUser.learningStyle) this.currentUser.learningStyle = data.preferredStyle;
          if (data.learningStyle && !this.currentUser.preferredStyle) this.currentUser.preferredStyle = data.learningStyle;

          if (prevInterests !== newInterests || prevGoal !== data.careerGoal || prevSkill !== data.skillLevel || prevStyle !== (data.learningStyle || data.preferredStyle)) {
            console.log("Real-time profile change detected via Firestore listener. Refreshing recommendations in-place...");
            if (window.FirebaseDB && typeof window.FirebaseDB.syncPersonalizedContent === 'function') {
              window.FirebaseDB.syncPersonalizedContent(this);
            }
            this.notify();
          }
        }, err => {
          console.warn("Real-time user profile listener error:", err);
        });
      }
    } catch (e) {
      console.warn("Could not attach real-time profile listener:", e);
    }
  },

  loginUser: async function(email, password = '') {
    const cleanEmail = (email || '').trim().toLowerCase();
    if (cleanEmail === 'admin@gmail.com') {
      if (password && password !== 'Pass@123' && password !== 'admin' && password !== 'demo123') {
        alert('Invalid admin credentials. Please use Pass@123.');
        return false;
      }
      let user = (this.data.defaultUsers || []).find(u => (u.email && u.email.toLowerCase() === 'admin@gmail.com') || u.id === 'u-admin');
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
        this.data.defaultUsers.unshift(user);
      }
      user.role = 'admin';
      user.gradeClass = 'Administrator';
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

    // Keep state.data.students updated with this student
    if (user.role !== 'admin' && user.id !== 'u-admin') {
      if (!this.data.students) this.data.students = [];
      const sIdx = this.data.students.findIndex(s => s.id === user.id || (s.email && s.email.toLowerCase() === (user.email || '').toLowerCase()));
      if (sIdx >= 0) {
        this.data.students[sIdx] = user;
      } else {
        this.data.students.push(user);
      }
      this.studentLoadError = null;
      this.saveData();
    }

    this.closeModal();
    if (window.FirebaseDB) {
      await window.FirebaseDB.syncAppState(this);
      await window.FirebaseDB.syncPersonalizedContent(this);
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

  isAdmin: function(user) {
    const u = user || this.currentUser;
    if (!u) return false;
    if (u.role === 'admin') return true;
    if (u.id === 'u-admin') return true;
    if (u.email && u.email.toLowerCase() === 'admin@gmail.com') return true;
    if (u.gradeClass === 'Administrator') return true;
    if (u.name === 'Admin Instructor') return true;
    return false;
  },

  setUser: function(userId) {
    let user = (this.data.defaultUsers || []).find(u => u.id === userId);
    if (!user && userId === 'u-admin') {
      user = (this.data.defaultUsers || []).find(u => (u.email && u.email.toLowerCase() === 'admin@gmail.com') || u.role === 'admin');
    }
    if (user) {
      if (userId === 'u-admin' || (user.email && user.email.toLowerCase() === 'admin@gmail.com')) {
        user.role = 'admin';
        user.gradeClass = 'Administrator';
      }
      this.currentUser = user;
      this.isAuthenticated = true;
      try {
        localStorage.setItem('plr_is_auth', 'true');
        localStorage.setItem('plr_user_id', user.id);
      } catch(e) {}
      if (window.FirebaseDB) {
        window.FirebaseDB.syncAppState(this);
        if (!this.isAdmin(user)) {
          window.FirebaseDB.syncPersonalizedContent(this);
        }
      }
      if (this.isAdmin(user)) {
        this.setView('admin');
      } else {
        this.setView('dashboard');
      }
    }
  },

  setView: function(viewName, params = {}) {
    this.currentView = viewName;
    if (viewName === 'admin') {
      if (!this.currentUser || !this.isAdmin(this.currentUser)) {
        let admin = (this.data.defaultUsers || []).find(u => u.id === 'u-admin' || (u.email && u.email.toLowerCase() === 'admin@gmail.com') || u.role === 'admin');
        if (!admin) {
          admin = {
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
          this.data.defaultUsers.unshift(admin);
        }
        admin.role = 'admin';
        admin.gradeClass = 'Administrator';
        this.currentUser = admin;
        this.isAuthenticated = true;
      }
    }
    if (params.subject) this.activeSubjectFilter = params.subject;
    if (params.courseId) this.selectedCourseId = params.courseId;
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (window.closeMobileSidebar) window.closeMobileSidebar();
    this.notify();
  },

  openModal: function(modalName, data = null) {
    if (modalName === 'quiz') {
      if (typeof window.resetQuizState === 'function') {
        window.resetQuizState();
      }
    }
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

    const selectedInterests = Array.isArray(formData.interests) ? formData.interests : [];
    const masterCourses = (this.data && Array.isArray(this.data._masterCourses) && this.data._masterCourses.length > 0)
      ? this.data._masterCourses
      : ((this.data && Array.isArray(this.data.courses)) ? this.data.courses : ((window.INITIAL_DATA && window.INITIAL_DATA.courses) || []));
    
    // Auto-enroll ONLY in courses matching newly selected interests
    let enrolledIds = [];
    masterCourses.forEach(c => {
      if (window.itemMatchesInterests(c, selectedInterests)) {
        if (!enrolledIds.includes(c.id)) enrolledIds.push(c.id);
      }
    });

    const isActuallyAdmin = registeredEmail.toLowerCase() === 'admin@gmail.com' || userId === 'u-admin' || this.isAdmin(this.currentUser);
    const userRole = isActuallyAdmin ? 'admin' : 'student';

    const userProfile = {
      id: userId,
      uid: userId,
      name: studentName,
      email: registeredEmail,
      role: userRole,
      avatar: (this.currentUser && this.currentUser.avatar) ? this.currentUser.avatar : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      gradeClass: isActuallyAdmin ? 'Administrator' : (formData.gradeClass || 'Grade 11'),
      skillLevel: formData.skillLevel || 'Intermediate',
      learningStyle: formData.learningStyle || formData.preferredStyle || 'visual',
      preferredStyle: formData.preferredStyle || formData.learningStyle || 'visual',
      careerGoal: formData.careerGoal || 'AI & Machine Learning Engineer',
      interests: selectedInterests,
      enrolledCourseIds: enrolledIds,
      completedResourceIds: (this.currentUser && !isNewRegistration && this.currentUser.completedResourceIds) ? this.currentUser.completedResourceIds : [],
      bookmarkedResourceIds: (this.currentUser && !isNewRegistration && this.currentUser.bookmarkedResourceIds) ? this.currentUser.bookmarkedResourceIds : [],
      dailyGoalMinutes: (this.currentUser && this.currentUser.dailyGoalMinutes) ? this.currentUser.dailyGoalMinutes : 30,
      todayStudiedMinutes: (this.currentUser && this.currentUser.todayStudiedMinutes) ? this.currentUser.todayStudiedMinutes : 0,
      streakDays: (this.currentUser && this.currentUser.streakDays) ? this.currentUser.streakDays : 1,
      createdAt: (this.currentUser && !isNewRegistration && this.currentUser.createdAt) ? this.currentUser.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      recentActivity: (this.currentUser && this.currentUser.recentActivity && !isNewRegistration)
        ? [{ title: 'Updated Questionnaire & Learning Preferences', time: 'Just now', icon: 'edit-3' }, ...this.currentUser.recentActivity]
        : [{ title: 'Registered & Completed Onboarding Questionnaire', time: 'Just now', icon: 'check-circle' }]
    };

    this.currentUser = userProfile;
    if (!this.data.defaultUsers) this.data.defaultUsers = [];
    const existingIdx = this.data.defaultUsers.findIndex(u => u.id === userId || (registeredEmail && u.email && u.email.toLowerCase() === registeredEmail.toLowerCase()));
    if (existingIdx >= 0) {
      this.data.defaultUsers[existingIdx] = userProfile;
    } else {
      this.data.defaultUsers.push(userProfile);
    }

    if (userRole !== 'admin') {
      if (!this.data.students) this.data.students = [];
      const stuIdx = this.data.students.findIndex(u => u.id === userId || (registeredEmail && u.email && u.email.toLowerCase() === registeredEmail.toLowerCase()));
      if (stuIdx >= 0) {
        this.data.students[stuIdx] = userProfile;
      } else {
        this.data.students.push(userProfile);
      }
      this.studentLoadError = null;
    }

    this.isAuthenticated = true;
    try {
      localStorage.setItem('plr_is_auth', 'true');
      localStorage.setItem('plr_user_id', userProfile.id);
    } catch(e) {}

    this.saveData();

    if (window.FirebaseDB) {
      await window.FirebaseDB.saveUser(userProfile);
      // Read latest profile fields directly from Firestore
      try {
        const latestDoc = await window.FirebaseDB.getUser(userId);
        if (latestDoc) {
          Object.assign(userProfile, latestDoc);
          this.currentUser = userProfile;
        }
      } catch (_) {}
      // Immediately run dynamic Firestore queries to refresh all recommendations in-place
      await window.FirebaseDB.syncPersonalizedContent(this);
    }

    this.setupRealtimeProfileListener(userId);
    this.showAllCourses = false;
    this.activeSubjectFilter = 'all';

    this.closeModal();

    if (isNewRegistration) {
      this.setView('dashboard');
    } else {
      // Live in-place update without requiring logout, re-registration or page reload
      this.notify();
    }
  },

  // Helper getters for dynamic personalization across all pages
  getPersonalizedCourses: function() {
    const master = (this.data && Array.isArray(this.data._masterCourses) && this.data._masterCourses.length > 0)
      ? this.data._masterCourses
      : ((this.data && Array.isArray(this.data.courses)) ? this.data.courses : ((window.INITIAL_DATA && window.INITIAL_DATA.courses) || []));
    if (!this.currentUser || this.isAdmin(this.currentUser)) {
      return master;
    }
    if (this.showAllCourses) {
      return master;
    }
    const interests = this.currentUser.interests || [];
    if (interests.length === 0) return [];
    return master.filter(c => window.itemMatchesInterests(c, interests));
  },

  getPersonalizedResources: function(format = 'all') {
    const master = (this.data && Array.isArray(this.data._masterResources) && this.data._masterResources.length > 0)
      ? this.data._masterResources
      : ((this.data && Array.isArray(this.data.resources)) ? this.data.resources : ((window.INITIAL_DATA && window.INITIAL_DATA.resources) || []));
    let resources = master;
    if (this.currentUser && !this.isAdmin(this.currentUser)) {
      const interests = this.currentUser.interests || [];
      if (interests.length === 0) return [];
      resources = master.filter(r => window.itemMatchesInterests(r, interests));
    }
    if (format !== 'all') {
      resources = resources.filter(r => r.format === format);
    }
    return resources;
  },

  getPersonalizedQuizzes: function() {
    let quizzes = (this.data && Array.isArray(this.data.quizzes) && this.data.quizzes.length > 0)
      ? this.data.quizzes
      : (window.ALL_SUBJECT_QUIZZES || (window.INITIAL_DATA && window.INITIAL_DATA.quizzes) || []);
    if (!this.currentUser || this.isAdmin(this.currentUser)) {
      const allQuizzes = (window.ALL_SUBJECT_QUIZZES || (window.INITIAL_DATA && window.INITIAL_DATA.quizzes) || []);
      if (allQuizzes.length > 0 && quizzes.length < allQuizzes.length) {
        return allQuizzes;
      }
      return quizzes;
    }
    const interests = this.currentUser.interests || [];
    if (interests.length === 0) return [];
    return quizzes.filter(q => window.itemMatchesInterests(q, interests));
  },

  getPersonalizedSubjects: function() {
    const subjects = (this.data && Array.isArray(this.data.subjects)) ? this.data.subjects : ((window.INITIAL_DATA && window.INITIAL_DATA.subjects) || []);
    if (!this.currentUser || this.isAdmin(this.currentUser)) {
      return subjects;
    }
    if (this.showAllCourses) {
      return subjects;
    }
    const interests = this.currentUser.interests || [];
    if (interests.length === 0) return [];
    return subjects.filter(s => {
      return interests.some(i => window.normalizeCategoryKey(i) === s.id || s.name.toLowerCase().includes(i.toLowerCase()) || window.normalizeCategoryKey(s.name) === window.normalizeCategoryKey(i));
    });
  },

  getPersonalizedRoadmaps: function() {
    const roadmaps = (this.data && this.data.roadmaps) ? this.data.roadmaps : ((window.INITIAL_DATA && window.INITIAL_DATA.roadmaps) || {});
    if (!this.currentUser || this.isAdmin(this.currentUser)) {
      return roadmaps;
    }
    const interests = this.currentUser.interests || [];
    if (interests.length === 0) return {};
    const filtered = {};
    Object.entries(roadmaps).forEach(([key, rm]) => {
      if (window.itemMatchesInterests({ ...rm, subjectId: rm.subjectId || key }, interests)) {
        filtered[key] = rm;
      }
    });
    return filtered;
  },

  getPersonalizedAssignments: function() {
    const master = (this.data && Array.isArray(this.data._masterAssignments) && this.data._masterAssignments.length > 0)
      ? this.data._masterAssignments
      : ((this.data && Array.isArray(this.data.assignments)) ? this.data.assignments : ((window.INITIAL_DATA && window.INITIAL_DATA.assignments) || []));
    if (!this.currentUser || this.isAdmin(this.currentUser)) {
      return master;
    }
    const interests = this.currentUser.interests || [];
    if (interests.length === 0) return [];
    const matchedCourses = this.getPersonalizedCourses();
    const matchedCourseIds = matchedCourses.map(c => c.id);
    return master.filter(a => {
      if (a.courseId && matchedCourseIds.includes(a.courseId)) return true;
      return window.itemMatchesInterests(a, interests);
    });
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

    if (!this.currentUser.quizScores) this.currentUser.quizScores = [];
    this.currentUser.quizScores.push({
      quizId: quizId,
      subjectId: quiz.subjectId,
      score: scorePercentage,
      date: new Date().toISOString()
    });

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

  deleteSubject: function(subjectId) {
    if (!this.data.subjects) return;
    this.data.subjects = this.data.subjects.filter(s => s.id !== subjectId);
    this.saveData();
    if (window.FirebaseDB && window.FirebaseDB.isInitialized) {
      window.FirebaseDB.db.collection('subjects').doc(subjectId).delete()
        .then(() => console.log("Subject deleted from Firestore"))
        .catch(e => console.error("Error deleting subject from Firestore:", e));
    }
  },

  addCourse: function(courseObj) {
    courseObj.id = courseObj.id || ('course-' + Date.now());
    courseObj.rating = 5.0;
    courseObj.enrolledCount = 0;
    courseObj.matchScore = 95;
    
    // Ensure tiers object exists for study hub
    if (!courseObj.categories || Array.isArray(courseObj.categories)) {
      const catList = Array.isArray(courseObj.categories) ? courseObj.categories : [courseObj.category || window.getSubjectCategoryName(courseObj.subjectId)];
      courseObj.categoryList = catList;
      courseObj.categories = {
        Beginner: { title: 'Beginner Category (5 Questions Quiz)', materials: [], quizId: `quiz-${courseObj.subjectId || 'ds'}-beginner` },
        Intermediate: { title: 'Intermediate Category (10 Questions Quiz)', materials: [], quizId: `quiz-${courseObj.subjectId || 'ds'}-intermediate` },
        Advanced: { title: 'Advanced Category (15 Questions Quiz)', materials: [], quizId: `quiz-${courseObj.subjectId || 'ds'}-advanced` }
      };
    }
    
    if (window.autoCategorizeItem) {
      window.autoCategorizeItem(courseObj, 'course');
    }

    if (!this.data.courses) this.data.courses = [];
    this.data.courses.unshift(courseObj);
    if (!this.data._masterCourses) this.data._masterCourses = [];
    this.data._masterCourses.unshift(courseObj);
    this.saveData();
    if (window.FirebaseDB) {
      window.FirebaseDB.saveCourse(courseObj);
    }
  },

  deleteCourse: function(courseId) {
    if (!this.data.courses) return;
    this.data.courses = this.data.courses.filter(c => c.id !== courseId);
    if (this.data._masterCourses) {
      this.data._masterCourses = this.data._masterCourses.filter(c => c.id !== courseId);
    }
    this.saveData();
    if (window.FirebaseDB && window.FirebaseDB.deleteCourse) {
      window.FirebaseDB.deleteCourse(courseId);
    } else if (window.FirebaseDB && window.FirebaseDB.db) {
      try {
        window.FirebaseDB.db.collection('courses').doc(courseId).delete()
          .then(() => console.log("Course deleted from Firestore"))
          .catch(e => console.error("Error deleting course from Firestore:", e));
      } catch (e) {
        console.error("Firestore course delete error:", e);
      }
    }
  },

  addVideoToCourse: function(courseId, tier, title, description, contentUrl, duration, extraCategories = [], extraTags = []) {
    const course = (this.data.courses || []).find(c => c.id === courseId);
    if (!course) return;
    const resId = 'res-vid-' + Date.now();
    const courseCats = window.getItemCategories ? window.getItemCategories(course) : [course.category || course.subjectId];
    const combinedCats = Array.from(new Set([...courseCats, ...(Array.isArray(extraCategories) ? extraCategories : [extraCategories])]));
    const combinedTags = Array.from(new Set([...(course.tags || []), ...combinedCats, ...(Array.isArray(extraTags) ? extraTags : [extraTags])]));

    const resource = {
      id: resId,
      title: title,
      format: 'video',
      duration: duration || '15 mins',
      contentUrl: contentUrl,
      summary: description,
      description: description,
      subjectId: course.subjectId,
      category: course.category || combinedCats[0] || window.getSubjectCategoryName(course.subjectId),
      categories: combinedCats,
      tags: combinedTags,
      level: tier,
      vark: ['visual', 'auditory'],
      rating: 5.0,
      reviewsCount: 1,
      suitableClass: course.suitableClass || 'Grade 11-12'
    };

    if (window.autoCategorizeItem) {
      window.autoCategorizeItem(resource, 'resource');
    }

    if (!this.data.resources) this.data.resources = [];
    this.data.resources.unshift(resource);
    if (!this.data._masterResources) this.data._masterResources = [];
    this.data._masterResources.unshift(resource);

    if (!course.categories || Array.isArray(course.categories)) {
      course.categories = {
        Beginner: { title: 'Beginner Category (5 Questions Quiz)', materials: [], quizId: `quiz-${course.subjectId || 'ds'}-beginner` },
        Intermediate: { title: 'Intermediate Category (10 Questions Quiz)', materials: [], quizId: `quiz-${course.subjectId || 'ds'}-intermediate` },
        Advanced: { title: 'Advanced Category (15 Questions Quiz)', materials: [], quizId: `quiz-${course.subjectId || 'ds'}-advanced` }
      };
    }
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

  addAssignment: function(courseId, title, description, points, questions, extraCategories = [], extraTags = []) {
    const course = (this.data.courses || []).find(c => c.id === courseId) || {};
    const courseCats = window.getItemCategories ? window.getItemCategories(course) : (course.category ? [course.category] : []);
    const combinedCats = Array.from(new Set([...courseCats, ...(Array.isArray(extraCategories) ? extraCategories : [extraCategories])]));
    const combinedTags = Array.from(new Set([...(course.tags || []), ...combinedCats, ...(Array.isArray(extraTags) ? extraTags : [extraTags])]));

    const assignment = {
      id: 'assign-' + Date.now(),
      courseId: courseId,
      subjectId: course.subjectId || 'ds',
      category: course.category || combinedCats[0] || window.getSubjectCategoryName(course.subjectId),
      categories: combinedCats.length > 0 ? combinedCats : [course.category || 'General'],
      tags: combinedTags.length > 0 ? combinedTags : [course.category || 'General'],
      title: title,
      description: description,
      points: Number(points) || 100,
      questions: Array.isArray(questions) ? questions : [],
      createdAt: new Date().toISOString()
    };
    if (window.autoCategorizeItem) {
      window.autoCategorizeItem(assignment, 'assignment');
    }
    if (!this.data.assignments) this.data.assignments = [];
    this.data.assignments.unshift(assignment);
    if (!this.data._masterAssignments) this.data._masterAssignments = [];
    this.data._masterAssignments.unshift(assignment);
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

  addQuiz: function(quizObj) {
    if (!quizObj.id) quizObj.id = 'quiz-' + Date.now();
    if (!this.data.quizzes) this.data.quizzes = [];
    this.data.quizzes.unshift(quizObj);
    this.saveData();
    if (window.FirebaseDB && window.FirebaseDB.saveQuiz) {
      window.FirebaseDB.saveQuiz(quizObj);
    }
    return quizObj;
  },

  updateQuiz: function(quizId, updatedData) {
    if (!this.data.quizzes) return null;
    const idx = this.data.quizzes.findIndex(q => q.id === quizId);
    if (idx >= 0) {
      this.data.quizzes[idx] = {
        ...this.data.quizzes[idx],
        ...updatedData,
        updatedAt: new Date().toISOString()
      };
      this.saveData();
      if (window.FirebaseDB && window.FirebaseDB.saveQuiz) {
        window.FirebaseDB.saveQuiz(this.data.quizzes[idx]);
      }
      return this.data.quizzes[idx];
    }
    return null;
  },

  deleteQuiz: function(quizId) {
    if (!this.data.quizzes) return;
    this.data.quizzes = this.data.quizzes.filter(q => q.id !== quizId);
    this.saveData();
    if (window.FirebaseDB && window.FirebaseDB.deleteQuiz) {
      window.FirebaseDB.deleteQuiz(quizId);
    } else if (window.FirebaseDB && window.FirebaseDB.db) {
      try {
        window.FirebaseDB.db.collection('quizzes').doc(quizId).delete()
          .then(() => console.log("Quiz deleted from Firestore"))
          .catch(e => console.error("Error deleting quiz from Firestore:", e));
      } catch (e) {
        console.error("Firestore quiz delete error:", e);
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
