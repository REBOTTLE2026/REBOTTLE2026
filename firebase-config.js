const firebaseConfig = {
  apiKey: "AIzaSyCLFylrLsb4sHDcQoT2WvLOTf8DuqwlOB8",
  authDomain: "ruslan-87530.firebaseapp.com",
  projectId: "ruslan-87530",
  storageBucket: "ruslan-87530.firebasestorage.app",
  messagingSenderId: "94808688871",
  appId: "1:94808688871:web:d7cbe9cb64b158fabe3a42",
  measurementId: "G-JQV0F2R6EN"
};

// Ініціалізація Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();
