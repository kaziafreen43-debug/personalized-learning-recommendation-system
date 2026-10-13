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

  async set(data) {
    return this.mockFirestore._setDoc(this.collectionName, this.docId, data);
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
    this.apiBase = window.location.port === '5000' ? '' : 'http://127.0.0.1:5000';
    this._listeners = {};
  }

  collection(name) {
    return new MockCollectionRef(name, this);
  }

  async _getDocs(collectionName, limit, wheres) {
    try {
      const url = `${this.apiBase}/api/firestore/${collectionName}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error("Server error");
      let docs = await response.json();

      if (wheres && wheres.length > 0) {
        docs = docs.filter(doc => {
          return wheres.every(w => {
            if (w.op === '==') return doc[w.field] === w.value;
            if (w.op === '!=') return doc[w.field] !== w.value;
            return true;
          });
        });
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

      if (wheres && wheres.length > 0) {
        docs = docs.filter(doc => {
          return wheres.every(w => {
            if (w.op === '==') return doc[w.field] === w.value;
            if (w.op === '!=') return doc[w.field] !== w.value;
            return true;
          });
        });
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

// 3. Initialize Firebase Auth globally
try {
  if (typeof firebase !== 'undefined' && firebase.auth) {
    window.auth = firebase.auth();
    console.log("Firebase Auth initialized successfully.");
  }
} catch (e) {
  console.warn("Failed to initialize Firebase Auth:", e);
}

// 4. Initialize Firestore globally and assign to window.db (with MockFirestore fallback)
try {
  if (typeof firebase !== 'undefined' && firebase.firestore) {
    window.db = firebase.firestore();
    console.log("Firebase Firestore initialized successfully.");
  } else {
    window.db = new MockFirestore();
  }
} catch (e) {
  console.warn("Failed to initialize Firebase Firestore, falling back to MockFirestore:", e);
  window.db = new MockFirestore();
}