// Firebase Firestore Dynamic Sync Service for LearnAI Pro
// Optimized Local-First Architecture for Firebase Spark Free Limits (50k reads/20k writes per day)

window.FirebaseDB = {
  db: null,
  isInitialized: false,
  CACHE_TTL_MS: 15 * 60 * 1000, // 15-minute smart cache TTL (saves ~95% of reads)
  _isSyncing: false,

  getSyncMeta: function() {
    try {
      return JSON.parse(localStorage.getItem('plr_firebase_sync_meta') || '{}');
    } catch (_) {
      return {};
    }
  },

  setSyncMeta: function(collectionKey) {
    try {
      const meta = this.getSyncMeta();
      meta[collectionKey] = Date.now();
      meta.lastGlobalSync = Date.now();
      localStorage.setItem('plr_firebase_sync_meta', JSON.stringify(meta));
    } catch (_) {}
  },

  init: function() {
    if (window.db) {
      this.db = window.db;
      this.isInitialized = true;
      console.log("[FirebaseDB] Initialized successfully with Firestore.");
    } else {
      console.warn("[FirebaseDB] Firestore instance (window.db) not found. Fallback to LocalStorage active.");
    }
  },

  // Read User (Local-First: instant response, 0 Firestore reads when cached)
  getUser: async function(userId) {
    if (!userId) return null;

    // 1. Check local memory / storage cache first
    try {
      const appData = JSON.parse(localStorage.getItem('plr_app_data') || '{}');
      const allUsers = (appData.defaultUsers || []).concat(appData.students || []);
      const localFound = allUsers.find(u => u && (u.id === userId || u.uid === userId));
      if (localFound) {
        console.log(`[FirebaseDB Cache] Found student document for ${localFound.name || localFound.email || userId} in local store. 0 Firestore reads.`);
        return localFound;
      }
    } catch (_) {}

    try {
      const mockDB = JSON.parse(localStorage.getItem('plr_firestore_mock') || '{}');
      if (mockDB.users && (mockDB.users[userId] || Object.values(mockDB.users).find(u => u && (u.id === userId || u.uid === userId)))) {
        const found = mockDB.users[userId] || Object.values(mockDB.users).find(u => u && (u.id === userId || u.uid === userId));
        console.log(`[FirebaseDB Cache] Found user ${userId} in mock store. 0 Firestore reads.`);
        return found;
      }
    } catch (_) {}

    // 2. Fallback to Firestore remote if not present in local store
    if (!this.isInitialized) this.init();
    if (!this.db) return null;
    console.log(`[Firestore Read: users/${userId}] Fetching student document from remote...`);
    try {
      const docSnap = await this.db.collection('users').doc(userId).get();
      if (docSnap && docSnap.exists) {
        const data = typeof docSnap.data === 'function' ? docSnap.data() : docSnap;
        if (data) {
          data.id = data.id || userId;
          data.uid = data.uid || userId;
          try {
            let mockDB = JSON.parse(localStorage.getItem('plr_firestore_mock') || '{}');
            if (!mockDB.users) mockDB.users = {};
            mockDB.users[userId] = data;
            localStorage.setItem('plr_firestore_mock', JSON.stringify(mockDB));
          } catch (_) {}
          console.log(`[Firestore Read Success: users/${userId}] Successfully retrieved user document for ${data.name || data.email || userId}.`);
          return data;
        }
      }
    } catch (e) {
      console.warn(`[Firestore Read Note: users/${userId}]`, e.message || e);
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
        try {
          let mockDB = JSON.parse(localStorage.getItem('plr_firestore_mock') || '{}');
          if (!mockDB.users) mockDB.users = {};
          mockDB.users[found.id] = found;
          localStorage.setItem('plr_firestore_mock', JSON.stringify(mockDB));
        } catch (_) {}
        console.log(`[Firestore Read Success: users/${userId}] Found document via query by uid.`);
        return found;
      }
    } catch (err) {
      console.warn(`[Firestore Read Query Note: users/${userId}]`, err.message || err);
    }

    console.log(`[Firestore Read Note: users/${userId}] Document not found in Firestore.`);
    return null;
  },

  // Read User By Email (Local-First: instant response, 0 Firestore reads when cached)
  getUserByEmail: async function(email) {
    if (!email) return null;
    const cleanEmail = email.trim().toLowerCase();

    // 1. Check local storage first
    try {
      const appData = JSON.parse(localStorage.getItem('plr_app_data') || '{}');
      const allUsers = (appData.defaultUsers || []).concat(appData.students || []);
      const localFound = allUsers.find(u => u && (u.email || '').toLowerCase() === cleanEmail);
      if (localFound) {
        console.log(`[FirebaseDB Cache] Found user '${cleanEmail}' in local store. 0 Firestore reads.`);
        return localFound;
      }
    } catch (_) {}

    try {
      const mockDB = JSON.parse(localStorage.getItem('plr_firestore_mock') || '{}');
      if (mockDB.users) {
        const found = Object.values(mockDB.users).find(u => u && (u.email || '').toLowerCase() === cleanEmail);
        if (found) {
          console.log(`[FirebaseDB Cache] Found user '${cleanEmail}' in mock store. 0 Firestore reads.`);
          return found;
        }
      }
    } catch (_) {}

    // 2. Fallback to Firestore remote if not present in local store
    if (!this.isInitialized) this.init();
    if (!this.db) return null;
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
        try {
          let mockDB = JSON.parse(localStorage.getItem('plr_firestore_mock') || '{}');
          if (!mockDB.users) mockDB.users = {};
          mockDB.users[found.id] = found;
          localStorage.setItem('plr_firestore_mock', JSON.stringify(mockDB));
        } catch (_) {}
        console.log(`[Firestore Query Success: users] Found user document for '${cleanEmail}' with ID: ${found.id}`);
        return found;
      }
    } catch (e) {
      console.warn(`[Firestore Query Note: users] Error querying user by email '${cleanEmail}':`, e.message || e);
    }
    return null;
  },

  // Ensure student document exists
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

  // Seed Firestore only once (Optimized: 0 repeat reads/deletes)
  seedInitialDataIfEmpty: async function(initialData) {
    if (!this.isInitialized) return;
    if (localStorage.getItem('plr_db_seeded_v2')) {
      return; // Already verified & seeded; saves 5 reads and 8 deletes
    }

    try {
      // Purge legacy static mock students once
      if (!localStorage.getItem('plr_mock_purged')) {
        const legacyMockIds = ['u-1', 'u-2', 'u-3', 'u-4', 'u-5', 'u-6', 'u-7', 'u-8'];
        for (const mid of legacyMockIds) {
          try {
            await this.db.collection('users').doc(mid).delete();
          } catch (_) {}
        }
        localStorage.setItem('plr_mock_purged', 'true');
      }

      const usersSnapshot = await this.db.collection('users').limit(1).get();
      if (usersSnapshot.empty) {
        console.log("[FirebaseDB] Firestore users collection is empty. Ensuring default admin account...");
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
        console.log("[FirebaseDB] Default admin account verified in Firestore.");
      }

      // Seed Courses if empty
      try {
        const coursesSnap = await this.db.collection('courses').limit(1).get();
        if (coursesSnap.empty && initialData.courses && initialData.courses.length > 0) {
          console.log("[FirebaseDB] Seeding core courses to Firestore...");
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
          console.log("[FirebaseDB] Seeding core resources to Firestore...");
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
          console.log("[FirebaseDB] Seeding core assignments to Firestore...");
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
          console.log("[FirebaseDB] Seeding core roadmaps to Firestore...");
          for (const [subId, rm] of Object.entries(initialData.roadmaps)) {
            rm.id = rm.id || ('roadmap-' + subId);
            rm.subjectId = rm.subjectId || subId;
            if (window.autoCategorizeItem) window.autoCategorizeItem(rm, 'roadmap');
            await this.saveRoadmap(rm);
          }
        }
      } catch (_) {}

      localStorage.setItem('plr_db_seeded_v2', 'true');
    } catch (e) {
      console.warn("[FirebaseDB] Seeding note (using local fallback):", e.message || e);
    }
  },

  // Smart Cache-First AppState Sync: Reads from local store; syncs with Firestore within Free limits
  syncAppState: async function(appState, forceSync = false) {
    if (!this.isInitialized) {
      this.init();
    }
    if (!appState || !appState.data) return;

    // Check if we already have local data and if cache is fresh
    const syncMeta = this.getSyncMeta();
    const lastGlobalSync = syncMeta.lastGlobalSync || 0;
    const hasLocalCourses = Array.isArray(appState.data.courses) && appState.data.courses.length > 0;
    const isCacheFresh = !forceSync && hasLocalCourses && ((Date.now() - lastGlobalSync) < this.CACHE_TTL_MS);

    // Make sure registered students are populated from local users
    const legacyMockIds = ['u-1', 'u-2', 'u-3', 'u-4', 'u-5', 'u-6', 'u-7', 'u-8'];
    const localStudents = (appState.data.defaultUsers || []).filter(u => u && u.role !== 'admin' && u.id !== 'u-admin' && (u.email || '').toLowerCase() !== 'admin@gmail.com' && !legacyMockIds.includes(u.id));
    if (!appState.data.students || appState.data.students.length === 0) {
      appState.data.students = localStudents;
    }

    if (isCacheFresh) {
      console.log(`[FirebaseDB Cache] Using optimized local database cache (Synced ${Math.round((Date.now() - lastGlobalSync) / 60000)}m ago). 0 Firestore reads used.`);
      return;
    }

    if (this._isSyncing) return;
    this._isSyncing = true;
    console.log("[FirebaseDB Sync] Syncing with Firestore remote (Cache empty, expired, or force-sync requested)...");

    try {
      // 1. Seed if empty (independent block)
      if (window.INITIAL_DATA) {
        try {
          await this.seedInitialDataIfEmpty(window.INITIAL_DATA);
        } catch (e) {
          console.warn("Error seeding initial data:", e.message || e);
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
        const coreQuizzes = (window.ALL_SUBJECT_QUIZZES || (window.INITIAL_DATA && window.INITIAL_DATA.quizzes) || []);
        coreQuizzes.forEach(cq => {
          const idx = appState.data.quizzes.findIndex(q => q.id === cq.id || (q.subjectId === cq.subjectId && q.level === cq.level));
          if (idx === -1) {
            appState.data.quizzes.push(cq);
          } else if (!appState.data.quizzes[idx].questions || appState.data.quizzes[idx].questions.length === 0) {
            appState.data.quizzes[idx] = cq;
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

          // Check current authenticated student session
          const currentUserId = (appState.currentUser && appState.currentUser.id) || (localStorage.getItem('plr_is_auth') === 'true' ? localStorage.getItem('plr_user_id') : null);
          if (currentUserId && currentUserId !== 'u-admin' && (!appState.currentUser || appState.currentUser.role !== 'admin')) {
            let freshUser = await this.getUser(currentUserId);
            if (!freshUser) {
              freshUser = await this.ensureUserDocument(currentUserId, appState.currentUser || {});
            }
            if (freshUser) {
              appState.currentUser = freshUser;
              appState.isAuthenticated = true;
              try {
                localStorage.setItem('plr_is_auth', 'true');
                localStorage.setItem('plr_user_id', freshUser.id);
              } catch (_) {}

              if (appState.currentUser.interests && appState.data.courses) {
                const userInterests = appState.currentUser.interests;
                const validCourseIds = appState.data.courses
                  .filter(c => window.itemMatchesInterests && window.itemMatchesInterests(c, userInterests))
                  .map(c => c.id);
                
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
                  try {
                    localStorage.setItem('plr_app_data', JSON.stringify(appState.data));
                  } catch (_) {}
                }
              }
            }
          }
        }
      } catch (e) {
        console.warn("Notice: Fetching users from remote Firestore, checking local storage fallback:", e.message || e);
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

      // Automatically categorize all content
      if (window.autoCategorizeAllData) {
        window.autoCategorizeAllData(appState.data);
      }

      // Populate appState.data.students
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

      // 7. If logged in as student, perform personalization based on interests
      if (appState.currentUser && appState.currentUser.role !== 'admin' && appState.currentUser.id !== 'u-admin' && (appState.currentUser.email || '').toLowerCase() !== 'admin@gmail.com') {
        try {
          await this.syncPersonalizedContent(appState);
        } catch (e) {
          console.warn("Notice: Error in student dynamic personalization sync:", e);
        }
      }

      this.setSyncMeta('all');
      console.log("[FirebaseDB Sync Success] AppState synced with Firestore remote. Stored in local cache.", appState.data);
      try {
        localStorage.setItem('plr_app_data', JSON.stringify(appState.data));
      } catch (e) {}

      if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
        try { window.dispatchEvent(new CustomEvent('plr_students_updated')); } catch (_) {}
      }

      appState.notify();
    } catch (e) {
      console.error("Error syncing AppState with Firestore:", e);
    } finally {
      this._isSyncing = false;
    }
  },

  // Dynamic Firestore Query by Categories / Tags (Optimized: local fallback first)
  queryByInterests: async function(collectionName, interests) {
    if (!interests || !Array.isArray(interests) || interests.length === 0) {
      return [];
    }
    const cleanInterests = interests.filter(Boolean);
    if (cleanInterests.length === 0) return [];

    // Check local master state first (0 network reads)
    try {
      const state = window.AppState;
      if (state && state.data) {
        let masterList = [];
        if (collectionName === 'courses') masterList = state.data._masterCourses || state.data.courses || [];
        else if (collectionName === 'resources') masterList = state.data._masterResources || state.data.resources || [];
        else if (collectionName === 'assignments') masterList = state.data._masterAssignments || state.data.assignments || [];
        else if (collectionName === 'quizzes') masterList = state.data.quizzes || [];

        if (masterList.length > 0) {
          const filtered = masterList.filter(item => window.itemMatchesInterests ? window.itemMatchesInterests(item, cleanInterests) : (cleanInterests.includes(item.subjectId) || cleanInterests.includes(item.category)));
          if (filtered.length > 0) return filtered;
        }
      }
    } catch (_) {}

    // Fallback to Firestore remote if local is empty
    if (!this.isInitialized) this.init();
    if (!this.db) return [];

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

  // Dynamic Personalized Assignments Query (Optimized: in-memory first)
  queryPersonalizedAssignments: async function(interests, courseIds = []) {
    if (!interests || !Array.isArray(interests) || interests.length === 0) return [];
    const cleanInterests = interests.filter(Boolean);

    // In-memory check first (0 network reads)
    try {
      const state = window.AppState;
      const masterAssignments = (state && state.data && (state.data._masterAssignments || state.data.assignments)) || [];
      if (masterAssignments.length > 0) {
        return masterAssignments.filter(a => {
          if (a.courseId && courseIds.includes(a.courseId)) return true;
          return window.itemMatchesInterests ? window.itemMatchesInterests(a, cleanInterests) : (cleanInterests.includes(a.subjectId) || cleanInterests.includes(a.category));
        });
      }
    } catch (_) {}

    // Fallback to remote query
    return this.queryByInterests('assignments', cleanInterests);
  },

  // Sync Personalized Content: Runs completely in-memory using local data (0 extra Firestore reads)
  syncPersonalizedContent: async function(appState) {
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
      const masterCourses = (appState.data && Array.isArray(appState.data._masterCourses) && appState.data._masterCourses.length > 0)
        ? appState.data._masterCourses
        : ((appState.data && Array.isArray(appState.data.courses)) ? appState.data.courses : ((window.INITIAL_DATA && window.INITIAL_DATA.courses) || []));

      const matchedCourses = masterCourses.filter(c => window.itemMatchesInterests ? window.itemMatchesInterests(c, interests) : (interests.includes(c.subjectId) || interests.includes(c.category)));
      const matchedCourseIds = matchedCourses.map(c => c.id);

      const masterResources = (appState.data && Array.isArray(appState.data._masterResources) && appState.data._masterResources.length > 0)
        ? appState.data._masterResources
        : ((appState.data && Array.isArray(appState.data.resources)) ? appState.data.resources : ((window.INITIAL_DATA && window.INITIAL_DATA.resources) || []));

      const matchedResources = masterResources.filter(r => window.itemMatchesInterests ? window.itemMatchesInterests(r, interests) : (interests.includes(r.subjectId) || interests.includes(r.category)));

      const masterQuizzes = (appState.data && Array.isArray(appState.data.quizzes) && appState.data.quizzes.length > 0)
        ? appState.data.quizzes
        : (window.ALL_SUBJECT_QUIZZES || (window.INITIAL_DATA && window.INITIAL_DATA.quizzes) || []);

      const matchedQuizzes = masterQuizzes.filter(q => window.itemMatchesInterests ? window.itemMatchesInterests(q, interests) : (interests.includes(q.subjectId) || interests.includes(q.category)));

      const masterAssignments = (appState.data && Array.isArray(appState.data._masterAssignments) && appState.data._masterAssignments.length > 0)
        ? appState.data._masterAssignments
        : ((appState.data && Array.isArray(appState.data.assignments)) ? appState.data.assignments : ((window.INITIAL_DATA && window.INITIAL_DATA.assignments) || []));

      const matchedAssignments = masterAssignments.filter(a => {
        if (a.courseId && matchedCourseIds.includes(a.courseId)) return true;
        return window.itemMatchesInterests ? window.itemMatchesInterests(a, interests) : (interests.includes(a.subjectId) || interests.includes(a.category));
      });

      // Update student enrolled courses
      const currentEnrolled = user.enrolledCourseIds || [];
      const updatedEnrolled = currentEnrolled.filter(cid => matchedCourseIds.includes(cid));

      matchedCourses.forEach(c => {
        if (!updatedEnrolled.includes(c.id)) {
          updatedEnrolled.push(c.id);
        }
      });

      const enrolledChanged = (currentEnrolled.length !== updatedEnrolled.length) || (JSON.stringify(currentEnrolled) !== JSON.stringify(updatedEnrolled));
      user.enrolledCourseIds = updatedEnrolled;

      appState.data._masterCourses = masterCourses;
      appState.data._masterResources = masterResources;
      appState.data._masterAssignments = masterAssignments;

      appState.data.courses = masterCourses;
      appState.data.resources = masterResources;
      appState.data.quizzes = masterQuizzes;
      appState.data.assignments = masterAssignments;
      appState.data._matchedCourses = matchedCourses;
      appState.data._matchedResources = matchedResources;

      // Personalized roadmaps
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

      // Only save to Firestore if enrolled courses actually changed
      if (enrolledChanged) {
        this.saveUser(user);
      }

      try {
        localStorage.setItem('plr_app_data', JSON.stringify(appState.data));
      } catch (_) {}

      appState.notify();
    } catch (e) {
      console.error("Error in syncPersonalizedContent:", e);
    }
  },

  // Save/Update Course (Local-First + Background Remote)
  saveCourse: async function(course) {
    if (!course) return;
    course.category = course.category || course.subjectId;
    course.tags = course.tags || (course.subjectId ? [course.subjectId] : []);

    try {
      let mockDB = JSON.parse(localStorage.getItem('plr_firestore_mock') || '{}');
      if (!mockDB.courses) mockDB.courses = {};
      mockDB.courses[course.id] = course;
      localStorage.setItem('plr_firestore_mock', JSON.stringify(mockDB));
    } catch (_) {}
    this.setSyncMeta('courses');

    if (!this.isInitialized) this.init();
    if (this.isInitialized && this.db) {
      try {
        await this.db.collection('courses').doc(course.id).set(course);
        console.log(`Course ${course.id} saved to Firestore.`);
      } catch (e) {
        console.warn("Notice: Course saved locally, remote note:", e.message || e);
      }
    }
  },

  // Delete Course (Local-First + Background Remote)
  deleteCourse: async function(courseId) {
    if (!courseId) return;
    try {
      let mockDB = JSON.parse(localStorage.getItem('plr_firestore_mock') || '{}');
      if (mockDB.courses && mockDB.courses[courseId]) {
        delete mockDB.courses[courseId];
        localStorage.setItem('plr_firestore_mock', JSON.stringify(mockDB));
      }
    } catch (_) {}
    this.setSyncMeta('courses');

    if (!this.isInitialized) this.init();
    if (this.isInitialized && this.db) {
      try {
        await this.db.collection('courses').doc(courseId).delete();
        console.log(`Course ${courseId} deleted from Firestore.`);
      } catch (e) {
        console.warn("Notice: Course deleted locally, remote note:", e.message || e);
      }
    }
  },

  // Save/Update Resource (Local-First + Background Remote)
  saveResource: async function(resource) {
    if (!resource) return;
    resource.category = resource.category || resource.subjectId;
    resource.tags = resource.tags || (resource.subjectId ? [resource.subjectId] : []);

    try {
      let mockDB = JSON.parse(localStorage.getItem('plr_firestore_mock') || '{}');
      if (!mockDB.resources) mockDB.resources = {};
      mockDB.resources[resource.id] = resource;
      localStorage.setItem('plr_firestore_mock', JSON.stringify(mockDB));
    } catch (_) {}
    this.setSyncMeta('resources');

    if (!this.isInitialized) this.init();
    if (this.isInitialized && this.db) {
      try {
        await this.db.collection('resources').doc(resource.id).set(resource);
        console.log(`Resource ${resource.id} saved to Firestore.`);
      } catch (e) {
        console.warn("Notice: Resource saved locally, remote note:", e.message || e);
      }
    }
  },

  // Save/Update Assignment (Local-First + Background Remote)
  saveAssignment: async function(assignment) {
    if (!assignment) return;
    assignment.category = assignment.category || assignment.subjectId;
    assignment.tags = assignment.tags || (assignment.category ? [assignment.category] : []);

    try {
      let mockDB = JSON.parse(localStorage.getItem('plr_firestore_mock') || '{}');
      if (!mockDB.assignments) mockDB.assignments = {};
      mockDB.assignments[assignment.id] = assignment;
      localStorage.setItem('plr_firestore_mock', JSON.stringify(mockDB));
    } catch (_) {}
    this.setSyncMeta('assignments');

    if (!this.isInitialized) this.init();
    if (this.isInitialized && this.db) {
      try {
        await this.db.collection('assignments').doc(assignment.id).set(assignment);
        console.log(`Assignment ${assignment.id} saved to Firestore.`);
      } catch (e) {
        console.warn("Notice: Assignment saved locally, remote note:", e.message || e);
      }
    }
  },

  // Save Student Assignment Submission (Local-First + Background Remote)
  saveSubmission: async function(submission) {
    if (!submission) return;
    const docId = `${submission.userId}_${submission.assignmentId}`;

    try {
      let mockDB = JSON.parse(localStorage.getItem('plr_firestore_mock') || '{}');
      if (!mockDB.submissions) mockDB.submissions = {};
      mockDB.submissions[docId] = submission;
      localStorage.setItem('plr_firestore_mock', JSON.stringify(mockDB));
    } catch (_) {}
    this.setSyncMeta('submissions');

    if (!this.isInitialized) this.init();
    if (this.isInitialized && this.db) {
      try {
        await this.db.collection('submissions').doc(docId).set(submission);
        console.log(`Submission for ${docId} saved to Firestore.`);
      } catch (e) {
        console.warn("Notice: Submission saved locally, remote note:", e.message || e);
      }
    }
  },

  // Save User Profile State (Local-First + Background Remote)
  saveUser: async function(user) {
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

    console.log(`[FirebaseDB] Persisting user ${docId} to local store & Firestore...`);

    const cleanUser = JSON.parse(JSON.stringify(user));

    // 1. Immediately persist to local storage (0ms delay)
    try {
      let mockDB = JSON.parse(localStorage.getItem('plr_firestore_mock') || '{}');
      if (!mockDB.users) mockDB.users = {};
      mockDB.users[docId] = cleanUser;
      localStorage.setItem('plr_firestore_mock', JSON.stringify(mockDB));
    } catch (_) {}

    try {
      const appData = JSON.parse(localStorage.getItem('plr_app_data') || '{}');
      if (appData) {
        if (cleanUser.role !== 'admin') {
          if (!appData.students) appData.students = [];
          const sIdx = appData.students.findIndex(s => s.id === docId || s.uid === docId);
          if (sIdx >= 0) appData.students[sIdx] = cleanUser;
          else appData.students.push(cleanUser);
        }
        if (!appData.defaultUsers) appData.defaultUsers = [];
        const uIdx = appData.defaultUsers.findIndex(u => u.id === docId || u.uid === docId);
        if (uIdx >= 0) appData.defaultUsers[uIdx] = cleanUser;
        else appData.defaultUsers.push(cleanUser);
        localStorage.setItem('plr_app_data', JSON.stringify(appData));
      }
    } catch (_) {}

    this.setSyncMeta('users');

    // 2. Dispatch local event so same-tab admin panel updates smoothly without network reads
    if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
      try {
        window.dispatchEvent(new CustomEvent('plr_students_updated'));
      } catch (_) {}
    }

    // 3. Local API sync if Flask server is active
    try {
      const apiBase = (window.location && window.location.port === '5000') ? '' : 'http://127.0.0.1:5000';
      fetch(`${apiBase}/api/firestore/users/${docId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cleanUser)
      }).catch(() => {});
    } catch (_) {}

    // 4. Remote Firestore commit (1 write, 0 reads)
    if (!this.isInitialized) this.init();
    if (this.isInitialized && this.db) {
      try {
        await this.db.collection('users').doc(docId).set(cleanUser);
        console.log(`[Firestore Write Success: users/${docId}] User document successfully committed to Firestore.`);
      } catch (e) {
        console.warn(`[Firestore Write Note: users/${docId}] Saved locally, remote note:`, e.message || e);
      }
    }
    return user;
  },

  // Optimized Student Listener: Local-first with cross-tab and in-tab event reactivity (0 extra reads, 0 blinking)
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

    // Immediately deliver cached students so UI renders dynamic data instantly from local store
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

    // Same-tab custom event listener for instant local sync without network requests
    const handleLocalStudentsUpdated = () => {
      const updated = getLocalStudents();
      if (updated.length > 0) {
        try { callback(updated); } catch (_) {}
      }
    };
    if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
      window.addEventListener('plr_students_updated', handleLocalStudentsUpdated);
    }

    return () => {
      if (typeof window !== 'undefined' && typeof window.removeEventListener === 'function') {
        window.removeEventListener('storage', handleStorageChange);
        window.removeEventListener('plr_students_updated', handleLocalStudentsUpdated);
      }
    };
  },

  // Save/Update Subject (Local-First + Background Remote)
  saveSubject: async function(subject) {
    if (!subject) return;
    try {
      let mockDB = JSON.parse(localStorage.getItem('plr_firestore_mock') || '{}');
      if (!mockDB.subjects) mockDB.subjects = {};
      mockDB.subjects[subject.id] = subject;
      localStorage.setItem('plr_firestore_mock', JSON.stringify(mockDB));
    } catch (_) {}
    this.setSyncMeta('subjects');

    if (!this.isInitialized) this.init();
    if (this.isInitialized && this.db) {
      try {
        await this.db.collection('subjects').doc(subject.id).set(subject);
        console.log(`Subject ${subject.id} saved to Firestore.`);
      } catch (e) {
        console.warn("Notice: Subject saved locally, remote note:", e.message || e);
      }
    }
  },

  // Save/Update Quiz (Local-First + Background Remote)
  saveQuiz: async function(quiz) {
    if (!quiz) return;
    if (window.autoCategorizeItem) {
      window.autoCategorizeItem(quiz, 'quiz');
    } else {
      quiz.category = quiz.category || quiz.subjectId;
      quiz.tags = quiz.tags || (quiz.subjectId ? [quiz.subjectId] : []);
    }

    try {
      let mockDB = JSON.parse(localStorage.getItem('plr_firestore_mock') || '{}');
      if (!mockDB.quizzes) mockDB.quizzes = {};
      mockDB.quizzes[quiz.id] = quiz;
      localStorage.setItem('plr_firestore_mock', JSON.stringify(mockDB));
    } catch (_) {}
    this.setSyncMeta('quizzes');

    if (!this.isInitialized) this.init();
    if (this.isInitialized && this.db) {
      try {
        await this.db.collection('quizzes').doc(quiz.id).set(quiz);
        console.log(`Quiz ${quiz.id} saved to Firestore.`);
      } catch (e) {
        console.warn("Notice: Quiz saved locally, remote note:", e.message || e);
      }
    }
  },

  // Save/Update Roadmap (Local-First + Background Remote)
  saveRoadmap: async function(roadmap) {
    if (!roadmap) return;
    if (window.autoCategorizeItem) {
      window.autoCategorizeItem(roadmap, 'roadmap');
    }
    const docId = roadmap.id || ('roadmap-' + (roadmap.subjectId || 'general'));

    try {
      let mockDB = JSON.parse(localStorage.getItem('plr_firestore_mock') || '{}');
      if (!mockDB.roadmaps) mockDB.roadmaps = {};
      mockDB.roadmaps[docId] = roadmap;
      localStorage.setItem('plr_firestore_mock', JSON.stringify(mockDB));
    } catch (_) {}
    this.setSyncMeta('roadmaps');

    if (!this.isInitialized) this.init();
    if (this.isInitialized && this.db) {
      try {
        await this.db.collection('roadmaps').doc(docId).set(roadmap);
        console.log(`Roadmap ${docId} saved to Firestore.`);
      } catch (e) {
        console.warn("Notice: Roadmap saved locally, remote note:", e.message || e);
      }
    }
  },

  // Delete Quiz (Local-First + Background Remote)
  deleteQuiz: async function(quizId) {
    if (!quizId) return;
    try {
      let mockDB = JSON.parse(localStorage.getItem('plr_firestore_mock') || '{}');
      if (mockDB.quizzes && mockDB.quizzes[quizId]) {
        delete mockDB.quizzes[quizId];
        localStorage.setItem('plr_firestore_mock', JSON.stringify(mockDB));
      }
    } catch (_) {}
    this.setSyncMeta('quizzes');

    if (!this.isInitialized) this.init();
    if (this.isInitialized && this.db) {
      try {
        await this.db.collection('quizzes').doc(quizId).delete();
        console.log(`Quiz ${quizId} deleted from Firestore.`);
      } catch (e) {
        console.warn("Notice: Quiz deleted locally, remote note:", e.message || e);
      }
    }
  }
};
