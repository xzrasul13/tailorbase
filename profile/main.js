import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import {
  getFirestore,
  collection,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  query,
  orderBy,
  onSnapshot,
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

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
const db = getFirestore(app);

const clientsContainer = document.getElementById("clients-container");
const detailsPopover = document.getElementById("client-details-popover");
const detailName = document.getElementById("detail-client-name");
const detailMeasurements = document.getElementById("detail-measurements");
const detailDescription = document.getElementById("detail-description");
const editClientButton = document.getElementById("edit-client-details");
const deleteClientButton = document.getElementById("delete-client-details");
const saveBtn = document.getElementById("save-client-btn");
const searchInput = document.getElementById("client-search");
const toggleMoreBtn = document.getElementById("toggle-more");
const extraSizesDiv = document.getElementById("extra-sizes-div");
const addMenu = document.getElementById("add-menu");
const addClientButton = document.querySelector(".add-client");

let clientsData = [];
let searchText = "";
let activeClientId = null;
let isEditingClient = false;

extraSizesDiv.style.display = "none";

toggleMoreBtn.addEventListener("click", () => {
  const isVisible = extraSizesDiv.style.display === "block";
  extraSizesDiv.style.display = isVisible ? "none" : "block";
  toggleMoreBtn.querySelector("span").textContent = isVisible ? "▽" : "△";
});

function resetAddForm() {
  document.getElementById("client-name").value = "";
  document
    .querySelectorAll(".measurement")
    .forEach((input) => (input.value = ""));
  document.getElementById("description").value = "";
  extraSizesDiv.style.display = "none";
  toggleMoreBtn.querySelector("span").textContent = "▽";
  saveBtn.textContent = "save";
  isEditingClient = false;
  activeClientId = null;
}

function lockBodyScroll() {
  document.body.style.overflow = "hidden";
}

function unlockBodyScroll() {
  document.body.style.overflow = "";
}

function openAddMenu(client = null) {
  if (client) {
    document.getElementById("client-name").value = client.name || "";
    document.getElementById("height").value = client.measurements?.height || "";
    document.getElementById("waist").value = client.measurements?.waist || "";
    document.getElementById("bust").value = client.measurements?.bust || "";
    document.getElementById("hips").value = client.measurements?.hips || "";
    document.getElementById("sh-width").value =
      client.measurements?.shoulderWidth || "";
    document.getElementById("sh-length").value =
      client.measurements?.shoulderLength || "";
    document.getElementById("back-width").value =
      client.measurements?.backWidth || "";
    document.getElementById("back-waist-length").value =
      client.measurements?.backWaistLength || "";
    document.getElementById("neck-girth").value =
      client.measurements?.neckGirth || "";
    document.getElementById("sleeve-length").value =
      client.measurements?.sleeveLength || "";
    document.getElementById("arm-girth").value =
      client.measurements?.armGirth || "";
    document.getElementById("wrist").value = client.measurements?.wrist || "";
    document.getElementById("inseam").value = client.measurements?.inseam || "";
    document.getElementById("outseam").value =
      client.measurements?.outseam || "";
    document.getElementById("thigh").value = client.measurements?.thigh || "";
    document.getElementById("crotch-depth").value =
      client.measurements?.crotchDepth || "";
    document.getElementById("full-length").value =
      client.measurements?.fullLength || "";
    document.getElementById("description").value = client.description || "";
    extraSizesDiv.style.display = "block";
    toggleMoreBtn.querySelector("span").textContent = "△";
    saveBtn.textContent = "save";
    isEditingClient = true;
    activeClientId = client.id;
  } else {
    resetAddForm();
  }

  if (addMenu && typeof addMenu.showPopover === "function") {
    addMenu.showPopover();
  } else {
    addMenu.style.display = "block";
  }
  lockBodyScroll();
}

function hideAddMenu() {
  if (addMenu && typeof addMenu.hidePopover === "function") {
    addMenu.hidePopover();
  } else {
    addMenu.style.display = "none";
  }
  unlockBodyScroll();
}

function hideDetailsPopover() {
  if (detailsPopover && typeof detailsPopover.hidePopover === "function") {
    detailsPopover.hidePopover();
  }
  if (detailsPopover) {
    detailsPopover.style.display = "none";
  }
  unlockBodyScroll();
}

document.addEventListener("mousedown", (event) => {
  const target = event.target;

  if (addMenu && addMenu.style.display !== "none") {
    const isAddButton = target.closest(".add-client");
    const isInsideAddMenu = addMenu.contains(target);
    if (!isAddButton && !isInsideAddMenu) {
      hideAddMenu();
    }
  }

  if (detailsPopover && detailsPopover.style.display !== "none") {
    const isClientCard = target.closest(".client-card");
    const isInsideDetails = detailsPopover.contains(target);
    if (!isInsideDetails && !isClientCard) {
      hideDetailsPopover();
    }
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    hideAddMenu();
    hideDetailsPopover();
  }
});

onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = "../auth.html";
    return;
  }

  const clientsRef = collection(db, "users", user.uid, "clients");
  const clientsQuery = query(clientsRef, orderBy("createdAt", "desc"));

  onSnapshot(clientsQuery, (snapshot) => {
    clientsData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    renderClients(clientsData, searchText);
  });
});

if (searchInput) {
  searchInput.addEventListener("input", (event) => {
    searchText = event.target.value.trim().toLowerCase();
    renderClients(clientsData, searchText);
  });
}

if (addClientButton) {
  addClientButton.addEventListener("click", (event) => {
    event.stopPropagation();
    openAddMenu(null);
  });
}

editClientButton.addEventListener("click", () => {
  const client = clientsData.find((item) => item.id === activeClientId);
  if (!client) return;
  if (detailsPopover && typeof detailsPopover.hidePopover === "function") {
    detailsPopover.hidePopover();
  } else {
    detailsPopover.style.display = "none";
  }
  openAddMenu(client);
});

deleteClientButton.addEventListener("click", async () => {
  const user = auth.currentUser;
  if (!user) {
    alert("Шумо бояд аввал вориди система шавед!");
    return;
  }

  if (!activeClientId) return;

  const confirmed = confirm("Оё шумо мехоҳед ин муштариро нест кунед?");
  if (!confirmed) return;

  try {
    const clientDocRef = doc(db, "users", user.uid, "clients", activeClientId);
    await deleteDoc(clientDocRef);
    activeClientId = null;
    if (detailsPopover && typeof detailsPopover.hidePopover === "function") {
      detailsPopover.hidePopover();
    } else {
      detailsPopover.style.display = "none";
    }
  } catch (error) {
    console.error("Ошибка при удалении клиента:", error);
    alert("Не удалось удалить клиента.");
  }
});

function renderClients(clients, filter = "") {
  if (!clientsContainer) return;

  const normalizedFilter = (filter || "").trim().toLowerCase();
  const filteredClients = normalizedFilter
    ? clients.filter((client) =>
        (client.name || "").toLowerCase().includes(normalizedFilter),
      )
    : clients;

  if (filteredClients.length === 0) {
    clientsContainer.innerHTML =
      '<div class="empty-clients">Муштарӣ ёфт нашуд</div>';
    return;
  }

  clientsContainer.innerHTML = filteredClients
    .map((client) => {
      return `
                <button type="button" class="client-card" data-id="${client.id}">
                  <img src="../image/dress-photo.png" alt="Client photo" class="client-card-avatar">
                  <div class="client-card-name">${client.name || "Без имени"}</div>
                </button>
              `;
    })
    .join("");

  const measurementOrder = [
    { key: "height", label: "Қад" },
    { key: "waist", label: "Камар" },
    { key: "bust", label: "Қафаси сина" },
    { key: "hips", label: "Бон (сурин)" },
    { key: "shoulderWidth", label: "Бари китф" },
    { key: "shoulderLength", label: "Дарозии китф" },
    { key: "backWidth", label: "Бари пушт" },
    { key: "backWaistLength", label: "Дарозии пушт то камар" },
    { key: "neckGirth", label: "Даври гардан" },
    { key: "sleeveLength", label: "Дарозии остин" },
    { key: "armGirth", label: "Даври бозу" },
    { key: "wrist", label: "Банди даст" },
    { key: "inseam", label: "Дарозии пой (дарун)" },
    { key: "outseam", label: "Дарозии пой (берун)" },
    { key: "thigh", label: "Даври рон" },
    { key: "crotchDepth", label: "Чуқурии нишаст" },
    { key: "fullLength", label: "Дарозии пурра" },
  ];

  clientsContainer.querySelectorAll(".client-card").forEach((card) => {
    card.addEventListener("click", () => {
      const clientId = card.dataset.id;
      const client = clientsData.find((item) => item.id === clientId);
      if (!client) return;

      activeClientId = client.id;

      detailName.textContent = client.name || "Без имени";
      detailMeasurements.innerHTML = measurementOrder
        .map(({ key, label }) => {
          const value = client.measurements?.[key];
          return `<div><strong>${label}</strong>: ${value || "-"}</div>`;
        })
        .join("");
      detailDescription.textContent = client.description || "Нет описания";

      if (detailsPopover) {
        detailsPopover.style.display = "block";
        detailsPopover.style.zIndex = "1000";
      }
      if (detailsPopover && typeof detailsPopover.showPopover === "function") {
        detailsPopover.showPopover(card);
      }
      lockBodyScroll();
    });
  });
}

saveBtn.addEventListener("click", async () => {
  const user = auth.currentUser;

  if (!user) {
    alert("Вы должны быть авторизованы!");
    return;
  }

  const clientData = {
    name: document.getElementById("client-name").value,
    measurements: {
      height: document.getElementById("height").value,
      waist: document.getElementById("waist").value,
      bust: document.getElementById("bust").value,
      hips: document.getElementById("hips").value,
      shoulderWidth: document.getElementById("sh-width").value,
      shoulderLength: document.getElementById("sh-length").value,
      backWidth: document.getElementById("back-width").value,
      backWaistLength: document.getElementById("back-waist-length").value,
      neckGirth: document.getElementById("neck-girth").value,
      sleeveLength: document.getElementById("sleeve-length").value,
      armGirth: document.getElementById("arm-girth").value,
      wrist: document.getElementById("wrist").value,
      inseam: document.getElementById("inseam").value,
      outseam: document.getElementById("outseam").value,
      thigh: document.getElementById("thigh").value,
      crotchDepth: document.getElementById("crotch-depth").value,
      fullLength: document.getElementById("full-length").value,
    },
    description: document.getElementById("description").value,
    updatedAt: serverTimestamp(),
  };

  try {
    if (isEditingClient && activeClientId) {
      const clientDocRef = doc(
        db,
        "users",
        user.uid,
        "clients",
        activeClientId,
      );
      await updateDoc(clientDocRef, clientData);
      alert("Муштарӣ бомуваффақият нав карда шуд!");
    } else {
      const clientsRef = collection(db, "users", user.uid, "clients");
      await addDoc(clientsRef, {
        ...clientData,
        createdAt: serverTimestamp(),
      });
      alert("Муштарӣ бомуваффақият захира шуд!");
    }

    hideAddMenu();
    resetAddForm();
  } catch (error) {
    console.error("Ошибка при сохранении:", error);
    alert("Не удалось сохранить данные.");
  }
});
