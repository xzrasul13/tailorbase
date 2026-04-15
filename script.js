import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

  const firebaseConfig = {
    apiKey: "AIzaSyBQigoiucV2HtWdzG-HDsSVJ-mvMsDvC4g",
    authDomain: "tailorbase-bd0a6.firebaseapp.com",
    projectId: "tailorbase-bd0a6",
    storageBucket: "tailorbase-bd0a6.firebasestorage.app",
    messagingSenderId: "457834537708",
    appId: "1:457834537708:web:cd83333948f731a87c7bc9",
    measurementId: "G-VBSTY0NWN8"
  };

  const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();


onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log("Пользователь авторизован, переходим...");
    window.location.href = "profile/main.html";
  }
});

const googleBtn = document.getElementById('google-login');

googleBtn.addEventListener('click', (e) => {
  e.preventDefault();

  signInWithPopup(auth, provider)
    .then(async (result) => {
      const user = result.user;


      await setDoc(doc(db, "users", user.uid), {
        displayName: user.displayName,
        email: user.email,
        photoURL: user.photoURL,
        lastLogin: new Date()
      }, { merge: true });

      console.log("Данные сохранены!");
    })
    .catch((error) => {
      if (error.code === 'auth/popup-closed-by-user') {
        console.warn("Пользователь закрыл окно авторизации");
      } else {
        console.error("Ошибка:", error.code);
        alert("Ошибка входа: " + error.message);
      }
    });
});