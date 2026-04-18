import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyBQigoiucV2HtWdzG-HDsSVJ-mvMsDvC4g",
  authDomain: "tailorbase-bd0a6.firebaseapp.com",
  projectId: "tailorbase-bd0a6",
  storageBucket: "tailorbase-bd0a6.firebasestorage.app",
  messagingSenderId: "457834537708",
  appId: "1:457834537708:web:cd83333948f731a87c7bc9",
  measurementId: "G-VBSTY0NWN8",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const userNameElement = document.getElementById("user-name");
const logoutButton = document.querySelector(".logout");

if (logoutButton) {
  logoutButton.addEventListener("click", async () => {
    try {
      await signOut(auth);
      window.location.href = "../auth.html";
    } catch (error) {
      console.error("Ошибка выхода:", error);
      alert("Не удалось выйти. Попробуйте ещё раз.");
    }
  });
}

onAuthStateChanged(auth, (user) => {
  if (user) {
    userNameElement.innerText = user.displayName;
    console.log("Пользователь в системе:", user.uid);
  } else {
    window.location.href = "../auth.html";
  }
});
