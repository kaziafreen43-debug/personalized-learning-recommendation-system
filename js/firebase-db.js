// Firebase Firestore Dynamic Sync Service for LearnAI Pro

window.FirebaseDB = {
  db: null,
  isInitialized: false,

  init: function() {
    if (window.db) {
      this.db = window.db;
      this.isInitialized = true;
      console.log("FirebaseDB initialized successfully with Firestore.");
    } else {
      console.warn("Firestore instance (window.db) not found. Fallback to LocalStorage will be active.");
    }
  },

  getUser: async function(userId) {
    if (!this.isInitialized) this.init();
    if (!this.db || !userId) return null;
    console.log(`[Firestore Read: users/${userId}] Fetching student document...`);
    try {
      const docSnap = await this.db.collection('users').doc(userId).get();
      if (docSnap && docSnap.exists) {
        const data = typeof docSnap.data === 'function' ? docSnap.data() : docSnap;
        if (data) {
          data.id = data.id || userId;
          data.uid = data.uid || userId;
          console.log(`[Firestore Read Success: users/${userId}] Successfully retrieved user document for ${data.name || data.email || userId}.`);
          return data;
        }
      }
    } catch (e) {
      console.error(`[Firestore Read Error: users/${userId}] Failed to fetch document:`, e);
    }

    // Secondary query by uid if doc ID differs
    try {
      const snap = await this.db.collection('users').where('uid', '==', userId).limit(1).get();
      let found = null;
      if (snap && typeof snap.forEach === 'function') {
        snap.forEach(doc => {
          const data = typeof doc.data === 'function' ? doc.data() : doc;
          if (data && !found) {
            found = { ...data, id: (data.id || doc.id || userId), uid: (data.uid || doc.id || userId) };
          }
        });
      }
      if (found) {
        console.log(`[Firestore Read Success: users/${userId}] Found document via query by uid.`);
        return found;
      }
    } catch (err) {
      console.error(`[Firestore Read Query Error: users/${userId}]`, err);
    }

    console.log(`[Firestore Read Note: users/${userId}] Document not found in Firestore.`);
    return null;
  },

  getUserByEmail: async function(email) {
    if (!this.isInitialized) this.init();
    if (!this.db || !email) return null;
    const cleanEmail = email.trim().toLowerCase();
    console.log(`[Firestore Query: users] Looking up user by email '${cleanEmail}'...`);
    try {
      const snap = await this.db.collection('users').where('email', '==', cleanEmail).limit(1).get();
      let found = null;
      if (snap && typeof snap.forEach === 'function') {
        snap.forEach(doc => {
          const data = typeof doc.data === 'function' ? doc.data() : doc;
          if (data && !found) {
            found = { ...data, id: (data.id || doc.id), uid: (data.uid || doc.id) };
          }
        });
      }
      if (found) {
        console.log(`[Firestore Query Success: users] Found user document for '${cleanEmail}' with ID: ${found.id}`);
        return found;
      }
    } catch (e) {
      console.error(`[Firestore Query Error: users] Error querying user by email '${cleanEmail}':`, e);
    }
    return null;
  },

  ensureUserDocument: async function(userId, profileDefaults = {}) {
    if (!this.isInitialized) this.init();
    if (!userId) return null;

    let existing = await this.getUser(userId);
    if (existing) {
      return existing;
    }

    console.log(`[Firestore Auto-Create: users/${userId}] User document does not exist. Initializing with required default fields...`);
    const email = (profileDefaults.email || '').trim().toLowerCase();
    const name = profileDefaults.name || (email ? email.split('@')[0] : 'Student');
    const isActuallyAdmin = email === 'admin@gmail.com' || userId === 'u-admin' || profileDefaults.role === 'admin';
    const role = isActuallyAdmin ? 'admin' : 'student';
    const defaultInterests = Array.isArray(profileDefaults.interests) && profileDefaults.interests.length > 0
      ? profileDefaults.interests
      : ['cs', 'ds'];

    const newDoc = {
      id: userId,
      uid: userId,
      name: name,
      email: email,
      role: role,
      avatar: profileDefaults.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      gradeClass: isActuallyAdmin ? 'Administrator' : (profileDefaults.gradeClass || 'Grade 11'),
      skillLevel: profileDefaults.skillLevel || 'Intermediate',
      learningStyle: profileDefaults.learningStyle || profileDefaults.preferredStyle || 'visual',
      preferredStyle: profileDefaults.preferredStyle || profileDefaults.learningStyle || 'visual',
      careerGoal: profileDefaults.careerGoal || 'AI & Machine Learning Engineer',
      interests: defaultInterests,
      enrolledCourseIds: Array.isArray(profileDefaults.enrolledCourseIds) ? profileDefaults.enrolledCourseIds : [],
      completedResourceIds: Array.isArray(profileDefaults.completedResourceIds) ? profileDefaults.completedResourceIds : [],
      bookmarkedResourceIds: Array.isArray(profileDefaults.bookmarkedResourceIds) ? profileDefaults.bookmarkedResourceIds : [],
      videoProgress: (profileDefaults.videoProgress && typeof profileDefaults.videoProgress === 'object') ? profileDefaults.videoProgress : {},
      certificates: Array.isArray(profileDefaults.certificates) ? profileDefaults.certificates : [],
      quizScores: Array.isArray(profileDefaults.quizScores) ? profileDefaults.quizScores : [],
      dailyGoalMinutes: profileDefaults.dailyGoalMinutes || 30,
      todayStudiedMinutes: profileDefaults.todayStudiedMinutes || 0,
      streakDays: profileDefaults.streakDays || 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      recentActivity: [
        { title: 'Student Profile Initialized', time: 'Just now', icon: 'check-circle' }
      ]
    };

    await this.saveUser(newDoc);
    console.log(`[Firestore Auto-Create Success: users/${userId}] User document successfully created and persisted.`);
    return newDoc;
  },

  // Seed Firestore with core collections if empty and ensure all items are categorized
  seedInitialDataIfEmpty: async function(initialData) {
    if (!this.isInitialized) return;
    try {
      const usersSnapshot = await this.db.collection('users').limit(1).get();
      if (usersSnapshot.empty) {
        console.log("Firestore users collection is empty. Ensuring default admin account...");
        const adminUser = (initialData.defaultUsers || []).find(u => u.role === 'admin') || {
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
        await this.db.collection('users').doc(adminUser.id).set(adminUser);
        console.log("Default admin account verified in Firestore.");
      }

      // Purge any legacy static mock students so table starts empty
      const legacyMockIds = ['u-1', 'u-2', 'u-3', 'u-4', 'u-5', 'u-6', 'u-7', 'u-8'];
      for (const mid of legacyMockIds) {
        try {
          await this.db.collection('users').doc(mid).delete();
        } catch (_) {}
      }

      // Seed Courses if empty
      try {
        const coursesSnap = await this.db.collection('courses').limit(1).get();
        if (coursesSnap.empty && initialData.courses && initialData.courses.length > 0) {
          console.log("Seeding core courses to Firestore...");
          for (const c of initialData.courses) {
            if (window.autoCategorizeItem) window.autoCategorizeItem(c, 'course');
            await this.saveCourse(c);
          }
        }
      } catch (_) {}

      // Seed Resources if empty
      try {
        const resSnap = await this.db.collection('resources').limit(1).get();
        if (resSnap.empty && initialData.resources && initialData.resources.length > 0) {
          console.log("Seeding core resources to Firestore...");
          for (const r of initialData.resources) {
            if (window.autoCategorizeItem) window.autoCategorizeItem(r, 'resource');
            await this.saveResource(r);
          }
        }
      } catch (_) {}

      // Seed Assignments if empty
      try {
        const assignSnap = await this.db.collection('assignments').limit(1).get();
        if (assignSnap.empty && initialData.assignments && initialData.assignments.length > 0) {
          console.log("Seeding core assignments to Firestore...");
          for (const a of initialData.assignments) {
            if (window.autoCategorizeItem) window.autoCategorizeItem(a, 'assignment');
            await this.saveAssignment(a);
          }
        }
      } catch (_) {}

      // Seed Roadmaps if empty
      try {
        const roadSnap = await this.db.collection('roadmaps').limit(1).get();
        if (roadSnap.empty && initialData.roadmaps) {
          console.log("Seeding core roadmaps to Firestore...");
          for (const [subId, rm] of Object.entries(initialData.roadmaps)) {
            rm.id = rm.id || ('roadmap-' + subId);
            rm.subjectId = rm.subjectId || subId;
            if (window.autoCategorizeItem) window.autoCategorizeItem(rm, 'roadmap');
            await this.saveRoadmap(rm);
          }
        }
      } catch (_) {}
    } catch (e) {
      console.warn("Notice: Admin check note (using local fallback):", e.message || e);
    }
  },

  // Load all data from Firestore and sync with AppState
  syncAppState: async function(appState) {
    if (!this.isInitialized) {
      this.init();
    }
    if (!this.isInitialized) {
      // Setup empty assignments/submissions arrays if offline
      if (appState.data) {
        if (!appState.data.assignments) appState.data.assignments = [];
        if (!appState.data.submissions) appState.data.submissions = [];
      }
      return;
    }

    try {
      // 1. Seed if empty (independent block)
      if (window.INITIAL_DATA) {
        try {
          await this.seedInitialDataIfEmpty(window.INITIAL_DATA);
        } catch (e) {
          console.error("Error seeding initial data:", e);
        }
      }

    // 2. Fetch Courses (independent block)
    try {
      const coursesSnap = await this.db.collection('courses').get();
      const courses = [];
      coursesSnap.forEach(doc => {
        courses.push(doc.data());
      });
      if (courses.length > 0) {
        appState.data.courses = courses;
        // Ensure courses don't retain outdated/broken video embed URLs from prior sessions
        if (window.INITIAL_DATA && Array.isArray(window.INITIAL_DATA.courses)) {
          const KNOWN_BROKEN = ['P3RXtoYCF4U', '8hly31xKLI0', '5vcj8kSwBCY', 'Qe453-yYjbg', 'SqsC34ghxCM', 'ndSpJq7q4G8'];
          appState.data.courses.forEach(c => {
            const initC = window.INITIAL_DATA.courses.find(item => item.id === c.id);
            if (initC && initC.tiers && c.tiers) {
              for (const t in c.tiers) {
                if (c.tiers[t] && c.tiers[t].materials && initC.tiers[t] && initC.tiers[t].materials) {
                  c.tiers[t].materials.forEach(m => {
                    const initM = initC.tiers[t].materials.find(x => x.id === m.id);
                    if (initM && (KNOWN_BROKEN.some(b => String(m.contentUrl).includes(b)) || !m.contentUrl || m.contentUrl !== initM.contentUrl)) {
                      m.contentUrl = initM.contentUrl;
                      m.fallbackUrls = initM.fallbackUrls;
                      m.title = initM.title;
                    }
                  });
                }
              }
            }
          });
        }
      } else if (window.INITIAL_DATA && Array.isArray(window.INITIAL_DATA.courses) && window.INITIAL_DATA.courses.length > 0) {
        appState.data.courses = [...window.INITIAL_DATA.courses];
        window.INITIAL_DATA.courses.forEach(c => {
          try { this.saveCourse(c); } catch (_) {}
        });
      }
      appState.data._masterCourses = [...appState.data.courses];
    } catch (e) {
      console.warn("Notice: Courses sync note (using local fallback):", e.message || e);
      if (!appState.data.courses || appState.data.courses.length === 0) {
        appState.data.courses = (window.INITIAL_DATA && window.INITIAL_DATA.courses) || [];
      }
      appState.data._masterCourses = [...appState.data.courses];
    }

    // 3. Fetch Resources (independent block)
    try {
      const resourcesSnap = await this.db.collection('resources').get();
      const resources = [];
      resourcesSnap.forEach(doc => {
        resources.push(doc.data());
      });
      if (resources.length > 0) {
        appState.data.resources = resources;
        // Ensure resources don't retain outdated/broken video embed URLs from prior sessions
        if (window.INITIAL_DATA && Array.isArray(window.INITIAL_DATA.resources)) {
          const KNOWN_BROKEN = ['P3RXtoYCF4U', '8hly31xKLI0', '5vcj8kSwBCY', 'Qe453-yYjbg', 'SqsC34ghxCM', 'ndSpJq7q4G8'];
          appState.data.resources.forEach(r => {
            const initR = window.INITIAL_DATA.resources.find(item => item.id === r.id);
            if (initR && (KNOWN_BROKEN.some(b => String(r.contentUrl).includes(b)) || !r.contentUrl || r.contentUrl !== initR.contentUrl)) {
              r.contentUrl = initR.contentUrl;
              r.fallbackUrls = initR.fallbackUrls;
              r.title = initR.title;
              r.description = initR.description;
              r.summary = initR.summary;
            }
          });
        }
      } else if (window.INITIAL_DATA && Array.isArray(window.INITIAL_DATA.resources) && window.INITIAL_DATA.resources.length > 0) {
        appState.data.resources = [...window.INITIAL_DATA.resources];
        window.INITIAL_DATA.resources.forEach(r => {
          try { this.saveResource(r); } catch (_) {}
        });
      }
      appState.data._masterResources = [...appState.data.resources];
    } catch (e) {
      console.warn("Notice: Resources sync note (using local fallback):", e.message || e);
      if (!appState.data.resources || appState.data.resources.length === 0) {
        appState.data.resources = (window.INITIAL_DATA && window.INITIAL_DATA.resources) || [];
      }
      appState.data._masterResources = [...appState.data.resources];
    }

    // 3.5 Fetch Subjects (independent block)
    try {
      const subjectsSnap = await this.db.collection('subjects').get();
      const dbSubjects = [];
      subjectsSnap.forEach(doc => {
        dbSubjects.push(doc.data());
      });
      if (!Array.isArray(appState.data.subjects)) appState.data.subjects = [];
      if (dbSubjects.length > 0) {
        dbSubjects.forEach(s => {
          const idx = appState.data.subjects.findIndex(sub => sub.id === s.id);
          if (idx >= 0) {
            appState.data.subjects[idx] = s;
          } else {
            appState.data.subjects.push(s);
          }
        });
      }
      // Ensure all 6 core subjects are always present
      const coreSubs = (window.INITIAL_DATA && window.INITIAL_DATA.subjects) || [];
      coreSubs.forEach(cs => {
        if (!appState.data.subjects.some(s => s.id === cs.id)) {
          appState.data.subjects.push(cs);
          try { this.saveSubject(cs); } catch(_) {}
        }
      });
    } catch (e) {
      console.warn("Notice: Subjects sync note (using local fallback):", e.message || e);
    }

    // 3.8 Fetch Roadmaps (independent block)
    try {
      const roadmapsSnap = await this.db.collection('roadmaps').get();
      const dbRoadmaps = {};
      roadmapsSnap.forEach(doc => {
        const d = doc.data();
        const key = d.subjectId || doc.id.replace('roadmap-', '');
        dbRoadmaps[key] = d;
      });
      if (Object.keys(dbRoadmaps).length > 0) {
        appState.data.roadmaps = dbRoadmaps;
      } else if (window.INITIAL_DATA && window.INITIAL_DATA.roadmaps) {
        appState.data.roadmaps = { ...window.INITIAL_DATA.roadmaps };
        Object.entries(window.INITIAL_DATA.roadmaps).forEach(([k, rm]) => {
          try { this.saveRoadmap(rm); } catch (_) {}
        });
      }
    } catch (e) {
      console.warn("Notice: Roadmaps sync note (using local fallback):", e.message || e);
    }

    // 4. Fetch Assignments (independent block)
    try {
      const assignmentsSnap = await this.db.collection('assignments').get();
      const assignments = [];
      assignmentsSnap.forEach(doc => {
        assignments.push(doc.data());
      });
      if (assignments.length > 0) {
        appState.data.assignments = assignments;
      } else if (window.INITIAL_DATA && Array.isArray(window.INITIAL_DATA.assignments) && window.INITIAL_DATA.assignments.length > 0) {
        appState.data.assignments = [...window.INITIAL_DATA.assignments];
        window.INITIAL_DATA.assignments.forEach(a => {
          try { this.saveAssignment(a); } catch (_) {}
        });
      }
      appState.data._masterAssignments = [...appState.data.assignments];
    } catch (e) {
      console.warn("Notice: Assignments sync note (using local fallback):", e.message || e);
      if (!appState.data.assignments || appState.data.assignments.length === 0) {
        appState.data.assignments = (window.INITIAL_DATA && window.INITIAL_DATA.assignments) || [];
      }
      appState.data._masterAssignments = [...appState.data.assignments];
    }

    // 4.5 Fetch Quizzes (independent block)
    try {
      const quizzesSnap = await this.db.collection('quizzes').get();
      const dbQuizzes = [];
      quizzesSnap.forEach(doc => {
        dbQuizzes.push(doc.data());
      });
      if (!Array.isArray(appState.data.quizzes)) appState.data.quizzes = [];
      if (dbQuizzes.length > 0) {
        dbQuizzes.forEach(q => {
          const idx = appState.data.quizzes.findIndex(quiz => quiz.id === q.id);
          if (idx >= 0) {
            appState.data.quizzes[idx] = q;
          } else {
            appState.data.quizzes.push(q);
          }
        });
      }
      // Ensure all 18 core subject category quizzes (Beginner, Intermediate, Advanced) are always present
      const coreQuizzes = (window.ALL_SUBJECT_QUIZZES || (window.INITIAL_DATA && window.INITIAL_DATA.quizzes) || []);
      coreQuizzes.forEach(cq => {
        const idx = appState.data.quizzes.findIndex(q => q.id === cq.id || (q.subjectId === cq.subjectId && q.level === cq.level));
        if (idx === -1) {
          appState.data.quizzes.push(cq);
          try { this.saveQuiz(cq); } catch(_) {}
        } else if (!appState.data.quizzes[idx].questions || appState.data.quizzes[idx].questions.length === 0) {
          appState.data.quizzes[idx] = cq;
          try { this.saveQuiz(cq); } catch(_) {}
        }
      });
    } catch (e) {
      console.warn("Notice: Quizzes sync note (using local fallback):", e.message || e);
    }

    // 5. Fetch all Users to sync dynamic register logins (independent block)
    try {
      const usersSnap = await this.db.collection('users').get();
      const dbUsers = [];
      usersSnap.forEach(doc => {
        dbUsers.push(doc.data());
      });
      if (dbUsers.length > 0) {
        const legacyMockIds = ['u-1', 'u-2', 'u-3', 'u-4', 'u-5', 'u-6', 'u-7', 'u-8'];
        dbUsers.forEach(u => {
          if (legacyMockIds.includes(u.id) && u.role !== 'admin') return;
          const idx = appState.data.defaultUsers.findIndex(du => du.id === u.id);
          if (idx >= 0) {
            appState.data.defaultUsers[idx] = u;
          } else {
            appState.data.defaultUsers.push(u);
          }
        });
        // Check current authenticated student session and load authoritatively from Firestore
        const currentUserId = (appState.currentUser && appState.currentUser.id) || (localStorage.getItem('plr_is_auth') === 'true' ? localStorage.getItem('plr_user_id') : null);
        if (currentUserId) {
          if (currentUserId === 'u-admin' || (appState.currentUser && appState.currentUser.role === 'admin')) {
            // Admin user
          } else {
            let freshUser = await this.getUser(currentUserId);
            if (!freshUser) {
              console.log("Creating missing Firestore document in syncAppState for UID:", currentUserId);
              freshUser = await this.ensureUserDocument(currentUserId, appState.currentUser || {});
            }
            if (freshUser) {
              appState.currentUser = freshUser;
              appState.isAuthenticated = true;
              try {
                localStorage.setItem('plr_is_auth', 'true');
                localStorage.setItem('plr_user_id', freshUser.id);
              } catch (_) {}

              // Align current user enrolled courses strictly with their interests
              if (appState.currentUser.interests && appState.data.courses && appState.currentUser.role !== 'admin') {
                const userInterests = appState.currentUser.interests;
                const validCourseIds = appState.data.courses
                  .filter(c => window.itemMatchesInterests && window.itemMatchesInterests(c, userInterests))
                  .map(c => c.id);
                
                // Only keep courses matching user interests
                const currentEnrolled = (appState.currentUser.enrolledCourseIds || []).filter(id => validCourseIds.includes(id));
                let updated = (currentEnrolled.length !== (appState.currentUser.enrolledCourseIds || []).length);
                
                validCourseIds.forEach(id => {
                  if (!currentEnrolled.includes(id)) {
                    currentEnrolled.push(id);
                    updated = true;
                  }
                });
                if (updated) {
                  appState.currentUser.enrolledCourseIds = currentEnrolled;
                  appState.saveData();
                }
              }
            }
          }
        }
      }
    } catch (e) {
      console.warn("Notice: Fetching users from remote Firestore, checking local storage fallback:", e);
      try {
        const mockDB = JSON.parse(localStorage.getItem('plr_firestore_mock') || '{}');
        const localUsers = mockDB.users ? Object.values(mockDB.users) : [];
        if (localUsers.length > 0) {
          const legacyMockIds = ['u-1', 'u-2', 'u-3', 'u-4', 'u-5', 'u-6', 'u-7', 'u-8'];
          localUsers.forEach(u => {
            if (legacyMockIds.includes(u.id) && u.role !== 'admin') return;
            const idx = appState.data.defaultUsers.findIndex(du => du.id === u.id);
            if (idx >= 0) {
              appState.data.defaultUsers[idx] = u;
            } else {
              appState.data.defaultUsers.push(u);
            }
          });
        }
      } catch (_) {}
    }

    // Ensure all content is automatically categorized if missing
    if (window.autoCategorizeAllData) {
      window.autoCategorizeAllData(appState.data);
    }

    // Ensure appState.data.students is always populated with non-admin registered students
    const legacyMockIds = ['u-1', 'u-2', 'u-3', 'u-4', 'u-5', 'u-6', 'u-7', 'u-8'];
    const validStudents = (appState.data.defaultUsers || []).filter(u => u && u.role !== 'admin' && u.id !== 'u-admin' && (u.email || '').toLowerCase() !== 'admin@gmail.com' && !legacyMockIds.includes(u.id));
    appState.data.students = validStudents;

    // 6. Fetch Submissions (admin gets all, students get user-specific) (independent block)
    try {
      if (appState.currentUser) {
        let submissionsSnap;
        if (appState.currentUser.role === 'admin') {
          submissionsSnap = await this.db.collection('submissions').get();
        } else {
          submissionsSnap = await this.db.collection('submissions')
            .where('userId', '==', appState.currentUser.id)
            .get();
        }
        const submissions = [];
        submissionsSnap.forEach(doc => {
          submissions.push(doc.data());
        });
        appState.data.submissions = submissions;
      }
    } catch (e) {
      console.warn("Notice: Submissions sync note (using local fallback):", e.message || e);
    }

    // 7. If logged in as student, perform dynamic Firestore query personalization based on interests
    if (appState.currentUser && appState.currentUser.role !== 'admin' && appState.currentUser.id !== 'u-admin' && (appState.currentUser.email || '').toLowerCase() !== 'admin@gmail.com') {
      try {
        await this.syncPersonalizedContent(appState);
      } catch (e) {
        console.warn("Notice: Error in student dynamic personalization sync:", e);
      }
      if (appState.currentUser && appState.currentUser.id && appState.setupRealtimeProfileListener) {
        appState.setupRealtimeProfileListener(appState.currentUser.id);
      }
    }

    console.log("AppState dynamically synced with Firebase Firestore.", appState.data);
    try {
      localStorage.setItem('plr_app_data', JSON.stringify(appState.data));
    } catch (e) {}
    appState.notify();
    } catch (e) {
      console.error("Error syncing AppState with Firestore:", e);
    }
  },

  // Dynamic Firestore Query by Categories / Tags (Supports multiple selected interests)
  queryByInterests: async function(collectionName, interests) {
    if (!this.isInitialized) this.init();
    if (!this.db || !interests || !Array.isArray(interests) || interests.length === 0) {
      return [];
    }
    const cleanInterests = interests.filter(Boolean);
    if (cleanInterests.length === 0) return [];

    const searchTerms = new Set();
    cleanInterests.forEach(item => {
      searchTerms.add(item);
      const norm = window.normalizeCategoryKey ? window.normalizeCategoryKey(item) : item;
      searchTerms.add(norm);
      if (window.CATEGORY_TAXONOMY && window.CATEGORY_TAXONOMY[norm]) {
        const meta = window.CATEGORY_TAXONOMY[norm];
        searchTerms.add(meta.name);
        searchTerms.add(meta.category);
        if (meta.tags) meta.tags.forEach(t => searchTerms.add(t));
        if (meta.aliases) meta.aliases.forEach(a => searchTerms.add(a));
      }
    });
    const termsArr = Array.from(searchTerms);
    const resultsMap = new Map();

    for (let i = 0; i < termsArr.length; i += 30) {
      const batch = termsArr.slice(i, i + 30);

      try {
        const snap = await this.db.collection(collectionName).where('category', 'in', batch).get();
        if (snap && typeof snap.forEach === 'function') {
          snap.forEach(doc => {
            const data = typeof doc.data === 'function' ? doc.data() : doc;
            const id = (data && data.id) || doc.id;
            if (data && id) resultsMap.set(id, { ...data, id });
          });
        }
      } catch (_) {}

      try {
        const snap = await this.db.collection(collectionName).where('subjectId', 'in', batch).get();
        if (snap && typeof snap.forEach === 'function') {
          snap.forEach(doc => {
            const data = typeof doc.data === 'function' ? doc.data() : doc;
            const id = (data && data.id) || doc.id;
            if (data && id) resultsMap.set(id, { ...data, id });
          });
        }
      } catch (_) {}

      try {
        const snap = await this.db.collection(collectionName).where('tags', 'array-contains-any', batch).get();
        if (snap && typeof snap.forEach === 'function') {
          snap.forEach(doc => {
            const data = typeof doc.data === 'function' ? doc.data() : doc;
            const id = (data && data.id) || doc.id;
            if (data && id) resultsMap.set(id, { ...data, id });
          });
        }
      } catch (_) {}
    }

    const results = Array.from(resultsMap.values());
    if (window.itemMatchesInterests) {
      return results.filter(item => window.itemMatchesInterests(item, cleanInterests));
    }
    return results;
  },

  // Dynamic Firestore Query for Personalized Assignments (by category/subjectId or courseId)
  queryPersonalizedAssignments: async function(interests, courseIds = []) {
    if (!this.isInitialized) this.init();
    if (!this.db || !interests || !Array.isArray(interests) || interests.length === 0) return [];
    const cleanInterests = interests.filter(Boolean);
    const resultsMap = new Map();

    // Query assignments by category/subjectId
    const byCategory = await this.queryByInterests('assignments', cleanInterests);
    byCategory.forEach(a => {
      if (a && a.id) resultsMap.set(a.id, a);
    });

    // Query assignments by courseId if courseIds provided
    if (courseIds && courseIds.length > 0) {
      for (let i = 0; i < courseIds.length; i += 30) {
        const batch = courseIds.slice(i, i + 30);
        try {
          const snap = await this.db.collection('assignments').where('courseId', 'in', batch).get();
          if (snap && typeof snap.forEach === 'function') {
            snap.forEach(doc => {
              const data = typeof doc.data === 'function' ? doc.data() : doc;
              const id = (data && data.id) || doc.id;
              if (data && id) resultsMap.set(id, { ...data, id });
            });
          }
        } catch (_) {}
      }
    }

    return Array.from(resultsMap.values());
  },

  // Sync Personalized Content based on user's selected interests via Firestore queries
  syncPersonalizedContent: async function(appState) {
    if (!this.isInitialized) this.init();
    if (!appState || !appState.currentUser) return;
    const user = appState.currentUser;

    if (user.role === 'admin' || user.id === 'u-admin' || (user.email && user.email.toLowerCase() === 'admin@gmail.com')) {
      return; // Admins maintain full visibility
    }

    const interests = user.interests || [];
    if (!Array.isArray(interests) || interests.length === 0) {
      if (!appState.data._masterCourses) appState.data._masterCourses = (window.INITIAL_DATA && window.INITIAL_DATA.courses) || [];
      if (!appState.data._masterResources) appState.data._masterResources = (window.INITIAL_DATA && window.INITIAL_DATA.resources) || [];
      if (!appState.data._masterAssignments) appState.data._masterAssignments = (window.INITIAL_DATA && window.INITIAL_DATA.assignments) || [];
      appState.data.courses = [...appState.data._masterCourses];
      appState.data.resources = [...appState.data._masterResources];
      appState.data.quizzes = (window.INITIAL_DATA && window.INITIAL_DATA.quizzes) || [];
      appState.data.assignments = [...appState.data._masterAssignments];
      try {
        localStorage.setItem('plr_app_data', JSON.stringify(appState.data));
      } catch (_) {}
      appState.notify();
      return;
    }

    try {
      // 1. Query Courses from Firestore matching interests
      let matchedCourses = await this.queryByInterests('courses', interests);
      
      const masterCourses = (appState.data && Array.isArray(appState.data._masterCourses) && appState.data._masterCourses.length > 0)
        ? appState.data._masterCourses
        : ((appState.data && Array.isArray(appState.data.courses)) ? appState.data.courses : ((window.INITIAL_DATA && window.INITIAL_DATA.courses) || []));

      // If Firestore query returned 0, filter master courses using itemMatchesInterests
      if (matchedCourses.length === 0) {
        matchedCourses = masterCourses.filter(c => window.itemMatchesInterests ? window.itemMatchesInterests(c, interests) : (interests.includes(c.subjectId) || interests.includes(c.category)));
      }

      const matchedCourseIds = matchedCourses.map(c => c.id);

      // 2. Query Resources (videos, articles, labs) from Firestore matching interests
      let matchedResources = await this.queryByInterests('resources', interests);
      const masterResources = (appState.data && Array.isArray(appState.data._masterResources) && appState.data._masterResources.length > 0)
        ? appState.data._masterResources
        : ((appState.data && Array.isArray(appState.data.resources)) ? appState.data.resources : ((window.INITIAL_DATA && window.INITIAL_DATA.resources) || []));
      
      if (matchedResources.length === 0) {
        matchedResources = masterResources.filter(r => window.itemMatchesInterests ? window.itemMatchesInterests(r, interests) : (interests.includes(r.subjectId) || interests.includes(r.category)));
      }

      // 3. Query Quizzes from Firestore matching interests
      let matchedQuizzes = await this.queryByInterests('quizzes', interests);
      const masterQuizzes = (appState.data && Array.isArray(appState.data.quizzes) && appState.data.quizzes.length > 0)
        ? appState.data.quizzes
        : (window.ALL_SUBJECT_QUIZZES || (window.INITIAL_DATA && window.INITIAL_DATA.quizzes) || []);
      
      const coreMatchedQuizzes = masterQuizzes.filter(q => window.itemMatchesInterests ? window.itemMatchesInterests(q, interests) : (interests.includes(q.subjectId) || interests.includes(q.category)));
      coreMatchedQuizzes.forEach(cq => {
        if (!matchedQuizzes.some(q => q.id === cq.id || (q.subjectId === cq.subjectId && q.level === cq.level))) {
          matchedQuizzes.push(cq);
        }
      });

      // 4. Query Assignments from Firestore matching interests or matched courses
      let matchedAssignments = await this.queryPersonalizedAssignments(interests, matchedCourseIds);
      const masterAssignments = (appState.data && Array.isArray(appState.data._masterAssignments) && appState.data._masterAssignments.length > 0)
        ? appState.data._masterAssignments
        : ((appState.data && Array.isArray(appState.data.assignments)) ? appState.data.assignments : ((window.INITIAL_DATA && window.INITIAL_DATA.assignments) || []));
      
      if (matchedAssignments.length === 0) {
        matchedAssignments = masterAssignments.filter(a => {
          if (a.courseId && matchedCourseIds.includes(a.courseId)) return true;
          return window.itemMatchesInterests ? window.itemMatchesInterests(a, interests) : (interests.includes(a.subjectId) || interests.includes(a.category));
        });
      }

      // 5. Update user enrolledCourseIds: remove any course that no longer matches current interests!
      const currentEnrolled = user.enrolledCourseIds || [];
      const updatedEnrolled = currentEnrolled.filter(cid => matchedCourseIds.includes(cid));

      // Auto-enroll in matched courses
      matchedCourses.forEach(c => {
        if (!updatedEnrolled.includes(c.id)) {
          updatedEnrolled.push(c.id);
        }
      });
      user.enrolledCourseIds = updatedEnrolled;

      // 6. Keep master collections intact while personalizing
      if (window.INITIAL_DATA && Array.isArray(window.INITIAL_DATA.courses)) {
        window.INITIAL_DATA.courses.forEach(c => {
          if (!masterCourses.some(item => item.id === c.id)) masterCourses.push(c);
        });
      }
      if (window.INITIAL_DATA && Array.isArray(window.INITIAL_DATA.resources)) {
        window.INITIAL_DATA.resources.forEach(r => {
          if (!masterResources.some(item => item.id === r.id)) masterResources.push(r);
        });
      }
      if (window.INITIAL_DATA && Array.isArray(window.INITIAL_DATA.assignments)) {
        window.INITIAL_DATA.assignments.forEach(a => {
          if (!masterAssignments.some(item => item.id === a.id)) masterAssignments.push(a);
        });
      }

      appState.data._masterCourses = masterCourses;
      appState.data._masterResources = masterResources;
      appState.data._masterAssignments = masterAssignments;

      // Keep full collections available across the app so all subjects, search, and video playback work reliably
      appState.data.courses = masterCourses;
      appState.data.resources = masterResources;
      appState.data.quizzes = masterQuizzes;
      appState.data.assignments = masterAssignments;
      appState.data._matchedCourses = matchedCourses;
      appState.data._matchedResources = matchedResources;

      // 7. Re-align user roadmaps so only matched roadmaps exist
      if (appState.data.roadmaps) {
        const filteredRoadmaps = {};
        interests.forEach(intId => {
          const norm = window.normalizeCategoryKey ? window.normalizeCategoryKey(intId) : intId;
          if (appState.data.roadmaps[norm]) {
            filteredRoadmaps[norm] = appState.data.roadmaps[norm];
          } else if (appState.data.roadmaps[intId]) {
            filteredRoadmaps[intId] = appState.data.roadmaps[intId];
          }
        });
        if (Object.keys(filteredRoadmaps).length > 0) {
          appState.data.personalizedRoadmaps = filteredRoadmaps;
        }
      }

      // Save user & state
      this.saveUser(user);
      try {
        localStorage.setItem('plr_app_data', JSON.stringify(appState.data));
      } catch (_) {}

      // Notify UI
      appState.notify();
    } catch (e) {
      console.error("Error in syncPersonalizedContent:", e);
    }
  },

  // Save/Update Course
  saveCourse: async function(course) {
    if (!this.isInitialized) {
      this.init();
    }
    if (!this.isInitialized || !course) return;
    course.category = course.category || course.subjectId;
    course.tags = course.tags || (course.subjectId ? [course.subjectId] : []);
    try {
      await this.db.collection('courses').doc(course.id).set(course);
      console.log(`Course ${course.id} saved to Firestore.`);
    } catch (e) {
      console.error("Error saving course to Firestore:", e);
    }
  },

  // Delete Course
  deleteCourse: async function(courseId) {
    if (!this.isInitialized) {
      this.init();
    }
    if (!this.isInitialized) return;
    try {
      await this.db.collection('courses').doc(courseId).delete();
      console.log(`Course ${courseId} deleted from Firestore.`);
    } catch (e) {
      console.error("Error deleting course from Firestore:", e);
    }
  },

  // Save/Update Resource
  saveResource: async function(resource) {
    if (!this.isInitialized) {
      this.init();
    }
    if (!this.isInitialized || !resource) return;
    resource.category = resource.category || resource.subjectId;
    resource.tags = resource.tags || (resource.subjectId ? [resource.subjectId] : []);
    try {
      await this.db.collection('resources').doc(resource.id).set(resource);
      console.log(`Resource ${resource.id} saved to Firestore.`);
    } catch (e) {
      console.error("Error saving resource to Firestore:", e);
    }
  },

  // Save/Update Assignment
  saveAssignment: async function(assignment) {
    if (!this.isInitialized) {
      this.init();
    }
    if (!this.isInitialized || !assignment) return;
    assignment.category = assignment.category || assignment.subjectId;
    assignment.tags = assignment.tags || (assignment.category ? [assignment.category] : []);
    try {
      await this.db.collection('assignments').doc(assignment.id).set(assignment);
      console.log(`Assignment ${assignment.id} saved to Firestore.`);
    } catch (e) {
      console.error("Error saving assignment to Firestore:", e);
    }
  },

  // Save Student Assignment Submission
  saveSubmission: async function(submission) {
    if (!this.isInitialized) {
      this.init();
    }
    if (!this.isInitialized) return;
    try {
      const docId = `${submission.userId}_${submission.assignmentId}`;
      await this.db.collection('submissions').doc(docId).set(submission);
      console.log(`Submission for ${docId} saved to Firestore.`);
    } catch (e) {
      console.error("Error saving submission to Firestore:", e);
    }
  },

  // Save User Profile State
  saveUser: async function(user) {
    if (!this.isInitialized) {
      this.init();
    }
    if (!user) return null;
    const docId = user.id || user.uid;
    if (!docId) return null;
    user.id = docId;
    user.uid = docId;
    user.updatedAt = new Date().toISOString();
    if (!user.learningStyle && user.preferredStyle) user.learningStyle = user.preferredStyle;
    if (!user.preferredStyle && user.learningStyle) user.preferredStyle = user.learningStyle;
    if (!Array.isArray(user.certificates)) user.certificates = [];
    if (!user.videoProgress) user.videoProgress = {};

    console.log(`[Firestore Write: users/${docId}] Saving user document to collection 'users'...`);

    // Clean JSON to strip any undefined values that could crash Firestore SDK
    const cleanUser = JSON.parse(JSON.stringify(user));

    // Always persist to local mock storage as a dependable safety net
    try {
      let mockDB = JSON.parse(localStorage.getItem('plr_firestore_mock') || '{}');
      if (!mockDB.users) mockDB.users = {};
      mockDB.users[docId] = cleanUser;
      localStorage.setItem('plr_firestore_mock', JSON.stringify(mockDB));
    } catch (_) {}

    // If backend Flask server is running, also backup to local firestore API
    try {
      const apiBase = (window.location && window.location.port === '5000') ? '' : 'http://127.0.0.1:5000';
      fetch(`${apiBase}/api/firestore/users/${docId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cleanUser)
      }).catch(() => {});
    } catch (_) {}

    if (this.isInitialized && this.db) {
      try {
        await this.db.collection('users').doc(docId).set(cleanUser);
        console.log(`[Firestore Write Success: users/${docId}] User document successfully committed to Firestore.`);
      } catch (e) {
        console.error(`[Firestore Write Error: users/${docId}] Failed to write to Firestore:`, e);
      }
    }
    return user;
  },

  // Real-time listener for enrolled/registered students (onSnapshot with resilient local fallback)
  listenToStudents: function(callback, errorCallback) {
    if (!this.isInitialized) {
      this.init();
    }

    const getLocalStudents = () => {
      const legacyMockIds = ['u-1', 'u-2', 'u-3', 'u-4', 'u-5', 'u-6', 'u-7', 'u-8'];
      let list = [];
      try {
        const appData = JSON.parse(localStorage.getItem('plr_app_data') || '{}');
        const raw = (appData.students && appData.students.length > 0)
          ? appData.students
          : (appData.defaultUsers || []);
        list = raw.filter(u => u && u.role !== 'admin' && u.id !== 'u-admin' && (u.email || '').toLowerCase() !== 'admin@gmail.com' && !legacyMockIds.includes(u.id));
      } catch (_) {}

      if (list.length === 0) {
        try {
          const mockDB = JSON.parse(localStorage.getItem('plr_firestore_mock') || '{}');
          if (mockDB.users) {
            list = Object.values(mockDB.users).filter(u => u && u.role !== 'admin' && u.id !== 'u-admin' && (u.email || '').toLowerCase() !== 'admin@gmail.com' && !legacyMockIds.includes(u.id));
          }
        } catch (_) {}
      }
      return list;
    };

    // Immediately deliver cached students if available so UI renders dynamic data instantly
    const initialList = getLocalStudents();
    if (initialList.length > 0) {
      try { callback(initialList); } catch (_) {}
    }

    // Cross-tab real-time storage event listener so logins/registrations in another tab sync live
    const handleStorageChange = (e) => {
      if (e.key === 'plr_app_data' || e.key === 'plr_firestore_mock') {
        const updated = getLocalStudents();
        if (updated.length > 0) {
          try { callback(updated); } catch (_) {}
        }
      }
    };
    if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
      window.addEventListener('storage', handleStorageChange);
    }

    let unsubFirestore = null;
    if (this.isInitialized && this.db) {
      try {
        unsubFirestore = this.db.collection('users').onSnapshot(snapshot => {
          const students = [];
          snapshot.forEach(doc => {
            const data = doc.data() || {};
            if (data.role !== 'admin' && data.id !== 'u-admin' && (data.email || '').toLowerCase() !== 'admin@gmail.com') {
              data.id = data.id || doc.id;
              students.push(data);
            }
          });
          if (students.length > 0) {
            callback(students);
          } else {
            const fallback = getLocalStudents();
            callback(fallback.length > 0 ? fallback : students);
          }
        }, error => {
          console.warn("Firestore real-time student listener note (using local cache fallback):", error);
          const fallback = getLocalStudents();
          if (fallback.length > 0) {
            callback(fallback);
          } else if (errorCallback) {
            errorCallback(error);
          }
        });
      } catch (e) {
        console.warn("Error attaching Firestore onSnapshot listener, falling back:", e);
        const fallback = getLocalStudents();
        if (fallback.length > 0) {
          callback(fallback);
        } else if (errorCallback) {
          errorCallback(e);
        }
      }
    } else {
      const fallback = getLocalStudents();
      if (fallback.length > 0) {
        callback(fallback);
      }
    }

    return () => {
      if (typeof window !== 'undefined' && typeof window.removeEventListener === 'function') {
        window.removeEventListener('storage', handleStorageChange);
      }
      if (typeof unsubFirestore === 'function') {
        try { unsubFirestore(); } catch (_) {}
      }
    };
  },

  // Save/Update Subject
  saveSubject: async function(subject) {
    if (!this.isInitialized) {
      this.init();
    }
    if (!this.isInitialized) return;
    try {
      await this.db.collection('subjects').doc(subject.id).set(subject);
      console.log(`Subject ${subject.id} saved to Firestore.`);
    } catch (e) {
      console.error("Error saving subject to Firestore:", e);
    }
  },

  // Save/Update Quiz
  saveQuiz: async function(quiz) {
    if (!this.isInitialized) {
      this.init();
    }
    if (!this.isInitialized || !quiz) return;
    if (window.autoCategorizeItem) {
      window.autoCategorizeItem(quiz, 'quiz');
    } else {
      quiz.category = quiz.category || quiz.subjectId;
      quiz.tags = quiz.tags || (quiz.subjectId ? [quiz.subjectId] : []);
    }
    try {
      await this.db.collection('quizzes').doc(quiz.id).set(quiz);
      console.log(`Quiz ${quiz.id} saved to Firestore.`);
    } catch (e) {
      console.error("Error saving quiz to Firestore:", e);
    }
  },

  // Save/Update Roadmap
  saveRoadmap: async function(roadmap) {
    if (!this.isInitialized) {
      this.init();
    }
    if (!this.isInitialized || !roadmap) return;
    if (window.autoCategorizeItem) {
      window.autoCategorizeItem(roadmap, 'roadmap');
    }
    const docId = roadmap.id || ('roadmap-' + (roadmap.subjectId || 'general'));
    try {
      await this.db.collection('roadmaps').doc(docId).set(roadmap);
      console.log(`Roadmap ${docId} saved to Firestore.`);
    } catch (e) {
      console.error("Error saving roadmap to Firestore:", e);
    }
  },

  // Delete Quiz
  deleteQuiz: async function(quizId) {
    if (!this.isInitialized) {
      this.init();
    }
    if (!this.isInitialized) return;
    try {
      await this.db.collection('quizzes').doc(quizId).delete();
      console.log(`Quiz ${quizId} deleted from Firestore.`);
    } catch (e) {
      console.error("Error deleting quiz from Firestore:", e);
    }
  }
};
