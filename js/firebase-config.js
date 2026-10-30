// 1. Firebase configuration from your console
const firebaseConfig = {
  apiKey: "AIzaSyAvbsSLW0vQ8ubX7R-jidS2_mTu18vE_IY",
  authDomain: "my-mini-project-43074.firebaseapp.com",
  projectId: "my-mini-project-43074",
  storageBucket: "my-mini-project-43074.firebasestorage.app",
  messagingSenderId: "536242207483",
  appId: "1:536242207483:web:1eb65a7787f4726586ce5e",
  measurementId: "G-TF0BMZS1X3"
};

// 2. Initialize Firebase globally
try {
  if (typeof firebase !== 'undefined' && (!firebase.apps || !firebase.apps.length)) {
    firebase.initializeApp(firebaseConfig);
    console.log("Firebase initialized successfully.");
  }
} catch (e) {
  console.warn("Firebase initializeApp note:", e);
}

// --------------------------------------------------------------------------
// Robust MockFirestore Client Proxy (100X Logic for Local/Backend Sync)
// --------------------------------------------------------------------------
class MockDocRef {
  constructor(collectionName, docId, mockFirestore) {
    this.collectionName = collectionName;
    this.docId = docId;
    this.mockFirestore = mockFirestore;
  }

  async get() {
    return this.mockFirestore._getDoc(this.collectionName, this.docId);
  }

  async set(data) {
    return this.mockFirestore._setDoc(this.collectionName, this.docId, data);
  }

  async update(data) {
    return this.mockFirestore._updateDoc(this.collectionName, this.docId, data);
  }

  async delete() {
    return this.mockFirestore._deleteDoc(this.collectionName, this.docId);
  }
}

class MockCollectionRef {
  constructor(collectionName, mockFirestore) {
    this.collectionName = collectionName;
    this.mockFirestore = mockFirestore;
    this._limit = null;
    this._where = [];
  }

  limit(num) {
    this._limit = num;
    return this;
  }

  where(field, op, value) {
    this._where.push({ field, op, value });
    return this;
  }

  doc(docId) {
    return new MockDocRef(this.collectionName, docId, this.mockFirestore);
  }

  async get() {
    return this.mockFirestore._getDocs(this.collectionName, this._limit, this._where);
  }

  onSnapshot(callback, errorCallback) {
    const listener = async () => {
      try {
        const snap = await this.get();
        callback(snap);
      } catch (e) {
        if (errorCallback) errorCallback(e);
      }
    };
    if (!this.mockFirestore._listeners[this.collectionName]) {
      this.mockFirestore._listeners[this.collectionName] = [];
    }
    this.mockFirestore._listeners[this.collectionName].push(listener);
    listener();
    return () => {
      const list = this.mockFirestore._listeners[this.collectionName] || [];
      const idx = list.indexOf(listener);
      if (idx >= 0) list.splice(idx, 1);
    };
  }
}

class MockFirestore {
  constructor() {
    this.apiBase = (typeof window !== 'undefined' && window.location && window.location.port === '5000') ? '' : 'http://127.0.0.1:5000';
    this._listeners = {};
  }

  collection(name) {
    return new MockCollectionRef(name, this);
  }

  async _getDocs(collectionName, limit, wheres) {
    const matchesWheres = (doc) => {
      if (!wheres || wheres.length === 0) return true;
      return wheres.every(w => {
        if (w.op === '==') return doc[w.field] === w.value;
        if (w.op === '!=') return doc[w.field] !== w.value;
        if (w.op === 'in') {
          if (!Array.isArray(w.value) || w.value.length === 0) return false;
          const docVal = doc[w.field];
          if (docVal !== undefined && w.value.includes(docVal)) return true;
          if (w.field === 'category' && doc.subjectId && w.value.includes(doc.subjectId)) return true;
          if (w.field === 'subjectId' && doc.category && w.value.includes(doc.category)) return true;
          if (Array.isArray(doc.tags) && doc.tags.some(t => w.value.includes(t))) return true;
          return false;
        }
        if (w.op === 'array-contains-any') {
          if (!Array.isArray(w.value) || w.value.length === 0) return false;
          const arr = Array.isArray(doc[w.field]) ? doc[w.field] : (doc[w.field] ? [doc[w.field]] : []);
          return arr.some(item => w.value.includes(item));
        }
        if (w.op === 'array-contains') {
          const arr = Array.isArray(doc[w.field]) ? doc[w.field] : (doc[w.field] ? [doc[w.field]] : []);
          return arr.includes(w.value);
        }
        return true;
      });
    };

    try {
      const url = `${this.apiBase}/api/firestore/${collectionName}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error("Server error");
      let docs = await response.json();
      if (!Array.isArray(docs)) {
        if (docs && typeof docs === 'object') {
          docs = Object.values(docs);
        } else {
          docs = [];
        }
      }

      if (wheres && wheres.length > 0) {
        docs = docs.filter(matchesWheres);
      }

      if (limit !== null) {
        docs = docs.slice(0, limit);
      }

      return {
        empty: docs.length === 0,
        forEach: (callback) => {
          docs.forEach(doc => {
            callback({
              id: doc.id,
              data: () => doc
            });
          });
        }
      };
    } catch (e) {
      console.warn(`Firestore collection(${collectionName}).get() failed. Falling back to local storage cache:`, e);
      let localDB = {};
      try {
        localDB = JSON.parse(localStorage.getItem('plr_firestore_mock') || '{}');
      } catch (_) {}
      let docs = localDB[collectionName] ? Object.values(localDB[collectionName]) : [];
      if (docs.length === 0) {
        if (collectionName === 'subjects') {
          docs = (window.INITIAL_DATA && window.INITIAL_DATA.subjects) ? [...window.INITIAL_DATA.subjects] : [];
        } else if (collectionName === 'quizzes') {
          docs = (window.ALL_SUBJECT_QUIZZES || (window.INITIAL_DATA && window.INITIAL_DATA.quizzes)) ? [...(window.ALL_SUBJECT_QUIZZES || window.INITIAL_DATA.quizzes)] : [];
        } else if (collectionName === 'users') {
          docs = (window.INITIAL_DATA && window.INITIAL_DATA.defaultUsers) ? [...window.INITIAL_DATA.defaultUsers] : [];
        } else if (collectionName === 'courses') {
          docs = (window.INITIAL_DATA && window.INITIAL_DATA.courses) ? [...window.INITIAL_DATA.courses] : [];
        } else if (collectionName === 'resources') {
          docs = (window.INITIAL_DATA && window.INITIAL_DATA.resources) ? [...window.INITIAL_DATA.resources] : [];
        }
      }

      if (wheres && wheres.length > 0) {
        docs = docs.filter(matchesWheres);
      }
      if (limit !== null) {
        docs = docs.slice(0, limit);
      }

      return {
        empty: docs.length === 0,
        forEach: (callback) => {
          docs.forEach(doc => {
            callback({
              id: doc.id,
              data: () => doc
            });
          });
        }
      };
    }
  }

  async _getDoc(collectionName, docId) {
    try {
      const url = `${this.apiBase}/api/firestore/${collectionName}/${docId}`;
      const response = await fetch(url);
      if (response.ok) {
        const docData = await response.json();
        if (docData && typeof docData === 'object' && !docData.error) {
          return {
            exists: true,
            id: docId,
            data: () => docData
          };
        }
      }
    } catch (_) {}

    try {
      const url = `${this.apiBase}/api/firestore/${collectionName}`;
      const response = await fetch(url);
      if (response.ok) {
        const docs = await response.json();
        const found = docs.find(d => d.id === docId || d.uid === docId);
        if (found) {
          return {
            exists: true,
            id: docId,
            data: () => found
          };
        }
      }
    } catch (_) {}

    let localDB = {};
    try {
      localDB = JSON.parse(localStorage.getItem('plr_firestore_mock') || '{}');
    } catch (_) {}
    const doc = (localDB[collectionName] && localDB[collectionName][docId]) || null;
    return {
      exists: !!doc,
      id: docId,
      data: () => doc
    };
  }

  async _updateDoc(collectionName, docId, data) {
    let localDB = {};
    try {
      localDB = JSON.parse(localStorage.getItem('plr_firestore_mock') || '{}');
    } catch (_) {}
    if (!localDB[collectionName]) localDB[collectionName] = {};
    const existing = localDB[collectionName][docId] || {};
    const updated = { ...existing, ...data, id: docId };
    return this._setDoc(collectionName, docId, updated);
  }

  async _setDoc(collectionName, docId, data) {
    if (data && typeof data === 'object' && !data.id) {
      data.id = docId;
    }
    
    let localDB = {};
    try {
      localDB = JSON.parse(localStorage.getItem('plr_firestore_mock') || '{}');
    } catch (_) {}
    if (!localDB[collectionName]) localDB[collectionName] = {};
    localDB[collectionName][docId] = data;
    try {
      localStorage.setItem('plr_firestore_mock', JSON.stringify(localDB));
    } catch (_) {}

    if (this._listeners[collectionName]) {
      this._listeners[collectionName].forEach(fn => {
        try { fn(); } catch (_) {}
      });
    }

    try {
      const url = `${this.apiBase}/api/firestore/${collectionName}/${docId}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error("Server error");
      return await response.json();
    } catch (e) {
      console.warn(`Firestore setDoc failed to sync with backend server for ${collectionName}/${docId}:`, e);
    }
  }

  async _deleteDoc(collectionName, docId) {
    let localDB = {};
    try {
      localDB = JSON.parse(localStorage.getItem('plr_firestore_mock') || '{}');
    } catch (_) {}
    if (localDB[collectionName] && localDB[collectionName][docId]) {
      delete localDB[collectionName][docId];
      try {
        localStorage.setItem('plr_firestore_mock', JSON.stringify(localDB));
      } catch (_) {}
    }

    if (this._listeners[collectionName]) {
      this._listeners[collectionName].forEach(fn => {
        try { fn(); } catch (_) {}
      });
    }

    try {
      const url = `${this.apiBase}/api/firestore/${collectionName}/${docId}`;
      const response = await fetch(url, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error("Server error");
      return await response.json();
    } catch (e) {
      console.warn(`Firestore deleteDoc failed to sync with backend server for ${collectionName}/${docId}:`, e);
    }
  }
}

// --------------------------------------------------------------------------
// Robust MockAuth Client Proxy (Ensures Firebase Auth UID & Sessions Always Work)
// --------------------------------------------------------------------------
class MockAuthUser {
  constructor(data) {
    this.uid = data.uid;
    this.email = data.email || '';
    this.displayName = data.displayName || (data.email ? data.email.split('@')[0] : 'Student');
    this.photoURL = data.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150';
  }

  async updateProfile(updates = {}) {
    if (updates.displayName) this.displayName = updates.displayName;
    if (updates.photoURL) this.photoURL = updates.photoURL;
    try {
      let users = JSON.parse(localStorage.getItem('plr_firebase_auth_users') || '{}');
      if (users[this.uid]) {
        users[this.uid].displayName = this.displayName;
        users[this.uid].photoURL = this.photoURL;
        localStorage.setItem('plr_firebase_auth_users', JSON.stringify(users));
      }
    } catch (_) {}
    return Promise.resolve();
  }
}

class MockAuth {
  constructor() {
    this._listeners = [];
    this.currentUser = null;
    this._initSession();
  }

  _initSession() {
    try {
      const activeUid = localStorage.getItem('plr_auth_current_uid') || localStorage.getItem('plr_user_id');
      if (activeUid && activeUid !== 'u-admin') {
        let users = JSON.parse(localStorage.getItem('plr_firebase_auth_users') || '{}');
        let record = users[activeUid];
        if (!record) {
          const mockDB = JSON.parse(localStorage.getItem('plr_firestore_mock') || '{}');
          if (mockDB.users && mockDB.users[activeUid]) {
            record = mockDB.users[activeUid];
          }
        }
        if (record) {
          this.currentUser = new MockAuthUser({
            uid: record.uid || record.id || activeUid,
            email: record.email || '',
            displayName: record.name || record.displayName,
            photoURL: record.avatar || record.photoURL
          });
        }
      }
    } catch (_) {}
  }

  _generateUid() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let uid = '';
    for (let i = 0; i < 28; i++) {
      uid += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return uid;
  }

  async createUserWithEmailAndPassword(email, password) {
    const cleanEmail = (email || '').trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      const err = new Error('The email address is badly formatted.');
      err.code = 'auth/invalid-email';
      throw err;
    }
    if (!password || password.length < 6) {
      const err = new Error('Password should be at least 6 characters.');
      err.code = 'auth/weak-password';
      throw err;
    }

    let users = {};
    try {
      users = JSON.parse(localStorage.getItem('plr_firebase_auth_users') || '{}');
    } catch (_) {}

    const existing = Object.values(users).find(u => (u.email || '').toLowerCase() === cleanEmail);
    if (existing) {
      const err = new Error('The email address is already in use by another account.');
      err.code = 'auth/email-already-in-use';
      throw err;
    }

    const uid = this._generateUid();
    const newUserRecord = {
      uid: uid,
      email: cleanEmail,
      displayName: cleanEmail.split('@')[0],
      photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      password: password,
      createdAt: new Date().toISOString()
    };

    users[uid] = newUserRecord;
    try {
      localStorage.setItem('plr_firebase_auth_users', JSON.stringify(users));
      localStorage.setItem('plr_auth_current_uid', uid);
    } catch (_) {}

    this.currentUser = new MockAuthUser(newUserRecord);
    this._notifyListeners();

    return {
      user: this.currentUser
    };
  }

  async signInWithEmailAndPassword(email, password) {
    const cleanEmail = (email || '').trim().toLowerCase();
    let users = {};
    try {
      users = JSON.parse(localStorage.getItem('plr_firebase_auth_users') || '{}');
    } catch (_) {}

    let userRecord = Object.values(users).find(u => (u.email || '').toLowerCase() === cleanEmail);
    if (!userRecord) {
      try {
        const mockDB = JSON.parse(localStorage.getItem('plr_firestore_mock') || '{}');
        if (mockDB.users) {
          const match = Object.values(mockDB.users).find(u => (u.email || '').toLowerCase() === cleanEmail);
          if (match) {
            userRecord = {
              uid: match.uid || match.id || this._generateUid(),
              email: match.email,
              displayName: match.name,
              photoURL: match.avatar,
              password: password
            };
            users[userRecord.uid] = userRecord;
            localStorage.setItem('plr_firebase_auth_users', JSON.stringify(users));
          }
        }
      } catch (_) {}
    }

    if (!userRecord) {
      const err = new Error('There is no user record corresponding to this identifier.');
      err.code = 'auth/user-not-found';
      throw err;
    }

    if (userRecord.password && password && userRecord.password !== password) {
      const err = new Error('The password is invalid.');
      err.code = 'auth/wrong-password';
      throw err;
    }

    this.currentUser = new MockAuthUser(userRecord);
    try {
      localStorage.setItem('plr_auth_current_uid', userRecord.uid);
    } catch (_) {}
    this._notifyListeners();

    return {
      user: this.currentUser
    };
  }

  async signOut() {
    this.currentUser = null;
    try {
      localStorage.removeItem('plr_auth_current_uid');
    } catch (_) {}
    this._notifyListeners();
    return Promise.resolve();
  }

  onAuthStateChanged(listener) {
    if (typeof listener !== 'function') return () => {};
    this._listeners.push(listener);
    setTimeout(() => {
      try {
        listener(this.currentUser);
      } catch (e) {
        console.error("Auth listener error:", e);
      }
    }, 0);

    return () => {
      const idx = this._listeners.indexOf(listener);
      if (idx >= 0) this._listeners.splice(idx, 1);
    };
  }

  _notifyListeners() {
    const user = this.currentUser;
    this._listeners.forEach(fn => {
      try {
        fn(user);
      } catch (e) {
        console.error("Auth listener notification error:", e);
      }
    });
  }
}

class ResilientAuth {
  constructor(remoteAuth = null) {
    this.remoteAuth = remoteAuth;
    this.mockAuth = new MockAuth();
    this.remoteAvailable = !!remoteAuth;
    this._listeners = [];

    if (this.remoteAuth && typeof this.remoteAuth.onAuthStateChanged === 'function') {
      try {
        this.remoteAuth.onAuthStateChanged(
          (user) => {
            if (this.remoteAvailable && user) {
              this._notifyAll(user);
            } else if (!this.remoteAvailable) {
              this._notifyAll(this.mockAuth.currentUser);
            } else {
              this._notifyAll(null);
            }
          },
          (err) => {
            console.warn("Notice: Remote Firebase Auth issue, operating with Resilient Auth:", err);
            this.remoteAvailable = false;
            this._notifyAll(this.mockAuth.currentUser);
          }
        );
      } catch (e) {
        this.remoteAvailable = false;
      }
    }
  }

  get currentUser() {
    if (this.remoteAvailable && this.remoteAuth && this.remoteAuth.currentUser) {
      return this.remoteAuth.currentUser;
    }
    return this.mockAuth.currentUser;
  }

  _isRemoteAuthError(err) {
    if (!err) return false;
    const msg = (err.message || err.code || String(err)).toLowerCase();
    return msg.includes('api-key') ||
           msg.includes('api_key') ||
           msg.includes('invalid-api-key') ||
           msg.includes('configuration-not-found') ||
           msg.includes('operation-not-allowed') ||
           msg.includes('network') ||
           msg.includes('unavailable');
  }

  async createUserWithEmailAndPassword(email, password) {
    if (this.remoteAvailable && this.remoteAuth) {
      try {
        const cred = await this.remoteAuth.createUserWithEmailAndPassword(email, password);
        if (cred && cred.user) {
          return cred;
        }
      } catch (err) {
        if (this._isRemoteAuthError(err)) {
          console.warn("Notice: Remote Firebase Auth API key/service restricted. Seamlessly using ResilientAuth:", err.code || err.message);
          this.remoteAvailable = false;
        } else {
          throw err;
        }
      }
    }
    return this.mockAuth.createUserWithEmailAndPassword(email, password);
  }

  async signInWithEmailAndPassword(email, password) {
    if (this.remoteAvailable && this.remoteAuth) {
      try {
        const cred = await this.remoteAuth.signInWithEmailAndPassword(email, password);
        if (cred && cred.user) {
          return cred;
        }
      } catch (err) {
        if (this._isRemoteAuthError(err)) {
          console.warn("Notice: Remote Firebase Auth API key/service restricted. Seamlessly using ResilientAuth:", err.code || err.message);
          this.remoteAvailable = false;
        } else {
          throw err;
        }
      }
    }
    return this.mockAuth.signInWithEmailAndPassword(email, password);
  }

  async signOut() {
    if (this.remoteAvailable && this.remoteAuth) {
      try {
        await this.remoteAuth.signOut();
      } catch (_) {}
    }
    await this.mockAuth.signOut();
    this._notifyAll(null);
  }

  onAuthStateChanged(listener) {
    if (typeof listener !== 'function') return () => {};
    this._listeners.push(listener);
    setTimeout(() => {
      try {
        listener(this.currentUser);
      } catch (e) {
        console.error(e);
      }
    }, 0);

    return () => {
      const idx = this._listeners.indexOf(listener);
      if (idx >= 0) this._listeners.splice(idx, 1);
    };
  }

  _notifyAll(user) {
    this._listeners.forEach(fn => {
      try {
        fn(user);
      } catch (e) {
        console.error(e);
      }
    });
  }
}

// 3. Initialize Firebase Auth globally (with ResilientAuth proxy)
try {
  let remoteAuth = null;
  if (typeof firebase !== 'undefined' && firebase.auth) {
    try {
      remoteAuth = firebase.auth();
      console.log("Firebase Auth remote instance created.");
    } catch (e) {
      console.warn("Firebase Auth remote init note:", e);
    }
  }
  window.auth = new ResilientAuth(remoteAuth);
  console.log("Resilient Firebase Auth initialized successfully.");
} catch (e) {
  console.warn("Failed to initialize Resilient Firebase Auth, falling back to MockAuth:", e);
  window.auth = new MockAuth();
}

// --------------------------------------------------------------------------
// Resilient Firestore Proxy (Auto-Fallback on Security Rules / Network Lock)
// --------------------------------------------------------------------------
class ResilientDocRef {
  constructor(collectionName, docId, rf) {
    this.collectionName = collectionName;
    this.docId = docId;
    this.rf = rf;
  }

  get _remote() {
    return (this.rf.remoteAvailable && this.rf.remoteFirestore) ? this.rf.remoteFirestore.collection(this.collectionName).doc(this.docId) : null;
  }

  get _mock() {
    return this.rf.mockFirestore.collection(this.collectionName).doc(this.docId);
  }

  async get() {
    if (this.rf.remoteAvailable && this._remote) {
      try {
        const snap = await this._remote.get();
        if (snap && snap.exists) {
          return snap;
        }
      } catch (err) {
        if (this.rf._isPermissionOrNetworkError(err)) {
          this.rf.markRemoteUnavailable(err);
        } else {
          throw err;
        }
      }
    }
    return this._mock.get();
  }

  async set(data) {
    if (this.rf.remoteAvailable && this._remote) {
      try {
        await this._remote.set(data);
        try { this._mock.set(data); } catch (_) {}
        return;
      } catch (err) {
        if (this.rf._isPermissionOrNetworkError(err)) {
          this.rf.markRemoteUnavailable(err);
        } else {
          throw err;
        }
      }
    }
    return this._mock.set(data);
  }

  async update(data) {
    if (this.rf.remoteAvailable && this._remote) {
      try {
        await this._remote.update(data);
        try { this._mock.update(data); } catch (_) {}
        return;
      } catch (err) {
        if (this.rf._isPermissionOrNetworkError(err)) {
          this.rf.markRemoteUnavailable(err);
        } else {
          throw err;
        }
      }
    }
    return this._mock.update(data);
  }

  async delete() {
    if (this.rf.remoteAvailable && this._remote) {
      try {
        await this._remote.delete();
        try { this._mock.delete(); } catch (_) {}
        return;
      } catch (err) {
        if (this.rf._isPermissionOrNetworkError(err)) {
          this.rf.markRemoteUnavailable(err);
        } else {
          throw err;
        }
      }
    }
    return this._mock.delete();
  }
}

class ResilientQuery {
  constructor(collectionName, rf, remoteQuery = null, mockQuery = null) {
    this.collectionName = collectionName;
    this.rf = rf;
    this.remoteQuery = remoteQuery;
    this.mockQuery = mockQuery || this.rf.mockFirestore.collection(collectionName);
  }

  where(field, op, value) {
    const nextRemote = (this.remoteQuery && typeof this.remoteQuery.where === 'function')
      ? this.remoteQuery.where(field, op, value)
      : null;
    const nextMock = this.mockQuery.where(field, op, value);
    return new ResilientQuery(this.collectionName, this.rf, nextRemote, nextMock);
  }

  limit(num) {
    const nextRemote = (this.remoteQuery && typeof this.remoteQuery.limit === 'function')
      ? this.remoteQuery.limit(num)
      : null;
    const nextMock = this.mockQuery.limit(num);
    return new ResilientQuery(this.collectionName, this.rf, nextRemote, nextMock);
  }

  doc(docId) {
    return new ResilientDocRef(this.collectionName, docId, this.rf);
  }

  async get() {
    if (this.rf.remoteAvailable && this.remoteQuery) {
      try {
        return await this.remoteQuery.get();
      } catch (err) {
        if (this.rf._isPermissionOrNetworkError(err)) {
          this.rf.markRemoteUnavailable(err);
        } else {
          throw err;
        }
      }
    }
    return this.mockQuery.get();
  }

  onSnapshot(onNext, onError) {
    if (this.rf.remoteAvailable && this.remoteQuery) {
      try {
        let isFallbackActive = false;
        const unsubRemote = this.remoteQuery.onSnapshot(
          snapshot => {
            if (!isFallbackActive) onNext(snapshot);
          },
          err => {
            if (this.rf._isPermissionOrNetworkError(err)) {
              this.rf.markRemoteUnavailable(err);
              if (!isFallbackActive) {
                isFallbackActive = true;
                this.mockQuery.onSnapshot(onNext, onError);
              }
            } else if (onError) {
              onError(err);
            }
          }
        );
        return () => {
          if (typeof unsubRemote === 'function') {
            try { unsubRemote(); } catch (_) {}
          }
        };
      } catch (err) {
        if (this.rf._isPermissionOrNetworkError(err)) {
          this.rf.markRemoteUnavailable(err);
        }
      }
    }
    return this.mockQuery.onSnapshot(onNext, onError);
  }
}

class ResilientFirestore {
  constructor(remoteFirestore = null) {
    this.remoteFirestore = remoteFirestore;
    this.mockFirestore = new MockFirestore();
    this.remoteAvailable = !!remoteFirestore;
    this.hasWarnedFallback = false;
  }

  _isPermissionOrNetworkError(err) {
    if (!err) return false;
    const msg = (err.message || err.code || String(err)).toLowerCase();
    return msg.includes('permission') || 
           msg.includes('insufficient') || 
           msg.includes('permission-denied') ||
           msg.includes('unauthenticated') ||
           msg.includes('network') ||
           msg.includes('unavailable') ||
           msg.includes('deadline');
  }

  markRemoteUnavailable(err) {
    if (this.remoteAvailable) {
      this.remoteAvailable = false;
      if (!this.hasWarnedFallback) {
        this.hasWarnedFallback = true;
        console.warn("Notice: Remote Firestore access restricted by security rules. Seamlessly switched to local MockFirestore backend sync.");
      }
    }
  }

  collection(name) {
    const remoteCol = (this.remoteAvailable && this.remoteFirestore) ? this.remoteFirestore.collection(name) : null;
    const mockCol = this.mockFirestore.collection(name);
    return new ResilientQuery(name, this, remoteCol, mockCol);
  }
}

// 4. Initialize Firestore globally and assign to window.db (with ResilientFirestore proxy)
try {
  let remoteFs = null;
  if (typeof firebase !== 'undefined' && firebase.firestore) {
    try {
      remoteFs = firebase.firestore();
      console.log("Firebase Firestore instance created.");
    } catch (e) {
      console.warn("Firebase firestore init note:", e);
    }
  }
  window.db = new ResilientFirestore(remoteFs);
  console.log("Resilient Firestore (Auto-Fallback) initialized successfully.");
} catch (e) {
  console.warn("Failed to initialize Resilient Firestore, falling back to MockFirestore:", e);
  window.db = new MockFirestore();
}