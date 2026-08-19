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
firebase.initializeApp(firebaseConfig);

// 3. Initialize Firestore globally and assign to window.db (so any file can access it)
window.db = firebase.firestore();