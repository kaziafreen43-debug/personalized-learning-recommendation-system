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

  // Seed Firestore with admin user only if users collection is empty
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
    } catch (e) {
      console.error("Error checking admin user in Firestore:", e);
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
      appState.data.courses = courses;
    } catch (e) {
      console.error("Error fetching courses from Firestore:", e);
    }

    // 3. Fetch Resources (independent block)
    try {
      const resourcesSnap = await this.db.collection('resources').get();
      const resources = [];
      resourcesSnap.forEach(doc => {
        resources.push(doc.data());
      });
      appState.data.resources = resources;
    } catch (e) {
      console.error("Error fetching resources from Firestore:", e);
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
      console.error("Error fetching subjects from Firestore:", e);
    }

    // 4. Fetch Assignments (independent block)
    try {
      const assignmentsSnap = await this.db.collection('assignments').get();
      const assignments = [];
      assignmentsSnap.forEach(doc => {
        assignments.push(doc.data());
      });
      appState.data.assignments = assignments;
    } catch (e) {
      console.error("Error fetching assignments from Firestore:", e);
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
      console.error("Error fetching quizzes from Firestore:", e);
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
        if (appState.currentUser) {
          const matchedUser = dbUsers.find(u => u.id === appState.currentUser.id);
          if (matchedUser) {
            Object.assign(appState.currentUser, matchedUser);
          }

          // Auto-enroll the current user in any newly loaded courses matching their interests
          if (appState.currentUser.interests && appState.data.courses) {
            const currentEnrolled = appState.currentUser.enrolledCourseIds || [];
            let updated = false;
            appState.data.courses.forEach(c => {
              if (appState.currentUser.interests.includes(c.subjectId) && !currentEnrolled.includes(c.id)) {
                currentEnrolled.push(c.id);
                updated = true;
              }
            });
            if (updated) {
              appState.currentUser.enrolledCourseIds = currentEnrolled;
              // Save updated user enrollment to Firestore & local storage
              appState.saveData();
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
      console.error("Error fetching submissions from Firestore:", e);
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

  // Save/Update Course
  saveCourse: async function(course) {
    if (!this.isInitialized) {
      this.init();
    }
    if (!this.isInitialized) return;
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
    if (!this.isInitialized) return;
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
    if (!this.isInitialized) return;
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
    if (user && user.id) {
      user.updatedAt = new Date().toISOString();
      // Always persist to local mock storage as a dependable safety net
      try {
        let mockDB = JSON.parse(localStorage.getItem('plr_firestore_mock') || '{}');
        if (!mockDB.users) mockDB.users = {};
        mockDB.users[user.id] = user;
        localStorage.setItem('plr_firestore_mock', JSON.stringify(mockDB));
      } catch (_) {}

      // If backend Flask server is running, also backup to local firestore API
      try {
        const apiBase = (window.location && window.location.port === '5000') ? '' : 'http://127.0.0.1:5000';
        fetch(`${apiBase}/api/firestore/users/${user.id}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(user)
        }).catch(() => {});
      } catch (_) {}
    }

    if (!this.isInitialized || !this.db) return;
    try {
      await this.db.collection('users').doc(user.id).set(user);
      console.log(`User profile ${user.id} saved to Firestore.`);
    } catch (e) {
      console.warn("Could not sync user to remote Firestore (using local fallback):", e);
    }
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
    window.addEventListener('storage', handleStorageChange);

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
      window.removeEventListener('storage', handleStorageChange);
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
    if (!this.isInitialized) return;
    try {
      await this.db.collection('quizzes').doc(quiz.id).set(quiz);
      console.log(`Quiz ${quiz.id} saved to Firestore.`);
    } catch (e) {
      console.error("Error saving quiz to Firestore:", e);
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
