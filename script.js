import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
// Добавляем импорт функций базы данных
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
const db = getFirestore(app); // Инициализация базы данных
const provider = new GoogleAuthProvider();

onAuthStateChanged(auth, (user) => {
  if (user) {
    window.location.href = "profile/main.html";
  }
});

const googleBtn = document.getElementById('google-login');

  googleBtn.addEventListener('click', (e) => {
    e.preventDefault();

    signInWithPopup(auth, provider)
      .then(async (result) => {
        const user = result.user;

        // СОЗДАНИЕ ЛИЧНОГО КАБИНЕТА В БАЗЕ
        // Мы сохраняем данные пользователя по его уникальному UID
        await setDoc(doc(db, "users", user.uid), {
          displayName: user.displayName,
          email: user.email,
          photoURL: user.photoURL,
          lastLogin: new Date()
        }, { merge: true }); // merge: true не перезаписывает данные, если они уже есть

        console.log("Данные пользователя сохранены!");
        
        // ПЕРЕХОД НА ГЛАВНУЮ СТРАНИЦУ ПРИЛОЖЕНИЯ
        window.location.href = "/profile/main.html"; 
      })
      .catch((error) => {
        console.error("Ошибка:", error.code);
        alert("Ошибка входа: " + error.message);
      });
  });