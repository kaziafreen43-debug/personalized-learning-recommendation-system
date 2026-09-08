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

  // Seed Firestore with default data if empty
  seedInitialDataIfEmpty: async function(initialData) {
    if (!this.isInitialized) return;
    try {
      const coursesSnapshot = await this.db.collection('courses').limit(1).get();
      if (coursesSnapshot.empty) {
        console.log("Firestore courses collection is empty. Seeding initial courses...");
        // Seed Courses
        if (initialData.courses && Array.isArray(initialData.courses)) {
          for (const course of initialData.courses) {
            await this.db.collection('courses').doc(course.id).set(course);
          }
        }
        // Seed Resources (videos, articles, labs, etc.)
        if (initialData.resources && Array.isArray(initialData.resources)) {
          for (const res of initialData.resources) {
            await this.db.collection('resources').doc(res.id).set(res);
          }
        }
        console.log("Firestore seeded successfully with default courses and resources.");
      }

      const usersSnapshot = await this.db.collection('users').limit(1).get();
      if (usersSnapshot.empty) {
        console.log("Firestore users collection is empty. Seeding admin account only...");
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
        console.log("Firestore seeded successfully with default admin.");
      }

      // Purge any legacy static mock students so table starts empty
      const legacyMockIds = ['u-1', 'u-2', 'u-3', 'u-4', 'u-5', 'u-6', 'u-7', 'u-8'];
      for (const mid of legacyMockIds) {
        try {
          await this.db.collection('users').doc(mid).delete();
        } catch (_) {}
      }

      const subjectsSnapshot = await this.db.collection('subjects').limit(1).get();
      if (subjectsSnapshot.empty) {
        console.log("Firestore subjects collection is empty. Seeding initial default subjects...");
        if (initialData.subjects && Array.isArray(initialData.subjects)) {
          for (const subject of initialData.subjects) {
            await this.db.collection('subjects').doc(subject.id).set(subject);
          }
        }
        console.log("Firestore seeded successfully with default subjects.");
      }
    } catch (e) {
      console.error("Error seeding initial data to Firestore:", e);
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
        if (!appState.data.courses) {
          appState.data.courses = [];
        }
        courses.forEach(c => {
          const idx = appState.data.courses.findIndex(dc => dc.id === c.id);
          if (idx >= 0) {
            appState.data.courses[idx] = c;
          } else {
            appState.data.courses.push(c);
          }
        });
      }
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
      if (resources.length > 0) {
        if (!appState.data.resources) {
          appState.data.resources = [];
        }
        resources.forEach(r => {
          const idx = appState.data.resources.findIndex(dr => dr.id === r.id);
          if (idx >= 0) {
            appState.data.resources[idx] = r;
          } else {
            appState.data.resources.push(r);
          }
        });
      }
    } catch (e) {
      console.error("Error fetching resources from Firestore:", e);
    }

    // 3.5 Fetch Subjects (independent block)
    try {
      const subjectsSnap = await this.db.collection('subjects').get();
      const subjects = [];
      subjectsSnap.forEach(doc => {
        subjects.push(doc.data());
      });
      if (subjects.length > 0) {
        if (!appState.data.subjects) {
          appState.data.subjects = [];
        }
        subjects.forEach(s => {
          const idx = appState.data.subjects.findIndex(ds => ds.id === s.id);
          if (idx >= 0) {
            appState.data.subjects[idx] = s;
          } else {
            appState.data.subjects.push(s);
          }
        });
      }
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
      if (assignments.length > 0) {
        if (!appState.data.assignments) {
          appState.data.assignments = [];
        }
        assignments.forEach(a => {
          const idx = appState.data.assignments.findIndex(da => da.id === a.id);
          if (idx >= 0) {
            appState.data.assignments[idx] = a;
          } else {
            appState.data.assignments.push(a);
          }
        });
      }
    } catch (e) {
      console.error("Error fetching assignments from Firestore:", e);
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
      console.error("Error fetching users from Firestore:", e);
    }

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
    if (!this.isInitialized) return;
    try {
      user.updatedAt = new Date().toISOString();
      await this.db.collection('users').doc(user.id).set(user);
      console.log(`User profile ${user.id} saved to Firestore.`);
    } catch (e) {
      console.error("Error saving user to Firestore:", e);
    }
  },

  // Real-time listener for enrolled/registered students (onSnapshot)
  listenToStudents: function(callback, errorCallback) {
    if (!this.isInitialized) {
      this.init();
    }
    if (!this.isInitialized || !this.db) {
      if (errorCallback) errorCallback(new Error("Database not initialized"));
      return null;
    }
    try {
      return this.db.collection('users').onSnapshot(snapshot => {
        const students = [];
        snapshot.forEach(doc => {
          const data = doc.data() || {};
          if (data.role !== 'admin') {
            data.id = data.id || doc.id;
            students.push(data);
          }
        });
        callback(students);
      }, error => {
        console.error("Firestore onSnapshot error:", error);
        if (errorCallback) errorCallback(error);
      });
    } catch (e) {
      console.error("Error attaching Firestore onSnapshot listener:", e);
      if (errorCallback) errorCallback(e);
      return null;
    }
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
  }
};
