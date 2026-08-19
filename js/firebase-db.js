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
        console.log("Firestore users collection is empty. Seeding initial default users...");
        if (initialData.defaultUsers && Array.isArray(initialData.defaultUsers)) {
          for (const user of initialData.defaultUsers) {
            await this.db.collection('users').doc(user.id).set(user);
          }
        }
        console.log("Firestore seeded successfully with default users.");
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
      // Setup empty assignments/submissions arrays if offline
      if (appState.data) {
        if (!appState.data.assignments) appState.data.assignments = [];
        if (!appState.data.submissions) appState.data.submissions = [];
      }
      return;
    }

    try {
      // 1. Seed if empty
      if (window.INITIAL_DATA) {
        await this.seedInitialDataIfEmpty(window.INITIAL_DATA);
      }

      // 2. Fetch Courses
      const coursesSnap = await this.db.collection('courses').get();
      const courses = [];
      coursesSnap.forEach(doc => {
        courses.push(doc.data());
      });
      if (courses.length > 0) {
        appState.data.courses = courses;
      }

      // 3. Fetch Resources
      const resourcesSnap = await this.db.collection('resources').get();
      const resources = [];
      resourcesSnap.forEach(doc => {
        resources.push(doc.data());
      });
      if (resources.length > 0) {
        appState.data.resources = resources;
      }

      // 3.5 Fetch Subjects
      const subjectsSnap = await this.db.collection('subjects').get();
      const subjects = [];
      subjectsSnap.forEach(doc => {
        subjects.push(doc.data());
      });
      if (subjects.length > 0) {
        appState.data.subjects = subjects;
      }

      // 4. Fetch Assignments
      const assignmentsSnap = await this.db.collection('assignments').get();
      const assignments = [];
      assignmentsSnap.forEach(doc => {
        assignments.push(doc.data());
      });
      appState.data.assignments = assignments;

      // 5. Fetch all Users to sync dynamic register logins
      const usersSnap = await this.db.collection('users').get();
      const dbUsers = [];
      usersSnap.forEach(doc => {
        dbUsers.push(doc.data());
      });
      if (dbUsers.length > 0) {
        dbUsers.forEach(u => {
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
        }
      }

      // 6. Fetch Submissions (admin gets all, students get user-specific)
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

      console.log("AppState dynamically synced with Firebase Firestore.", appState.data);
      appState.notify();
    } catch (e) {
      console.error("Error syncing AppState with Firestore:", e);
    }
  },

  // Save/Update Course
  saveCourse: async function(course) {
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
    if (!this.isInitialized) return;
    try {
      await this.db.collection('users').doc(user.id).set(user);
      console.log(`User profile ${user.id} saved to Firestore.`);
    } catch (e) {
      console.error("Error saving user to Firestore:", e);
    }
  },

  // Save/Update Subject
  saveSubject: async function(subject) {
    if (!this.isInitialized) return;
    try {
      await this.db.collection('subjects').doc(subject.id).set(subject);
      console.log(`Subject ${subject.id} saved to Firestore.`);
    } catch (e) {
      console.error("Error saving subject to Firestore:", e);
    }
  }
};
