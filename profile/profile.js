
  import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
  import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

  // Ваша конфигурация Firebase (та же, что и в auth.html)
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

  // Ссылка на элементы в HTML
  const userNameElement = document.getElementById('user-name');
  const logoutButton = document.querySelector('.logout');

  // Обработчик кнопки выхода
  if (logoutButton) {
    logoutButton.addEventListener('click', async () => {
      try {
        await signOut(auth);
        window.location.href = "../auth.html";
      } catch (error) {
        console.error('Ошибка выхода:', error);
        alert('Не удалось выйти. Попробуйте ещё раз.');
      }
    });
  }

  // Проверка состояния входа
  onAuthStateChanged(auth, (user) => {
    if (user) {
      // 1. Выводим имя пользователя
      userNameElement.innerText = user.displayName;
      console.log("Пользователь в системе:", user.uid);
    } else {
      // Если пользователь не вошел, перенаправляем обратно на страницу логина
      window.location.href = "../auth.html";
    }
  });