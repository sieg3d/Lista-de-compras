// js/copiar_lista.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import {
  getDatabase,
  ref,
  get,
  push,
  set
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyA8cXYQ4m-uyEjbJJF_1_4Re8RJvqo1DWE",
  authDomain: "dlopes-lasalle-2025.firebaseapp.com",
  projectId: "dlopes-lasalle-2025",
  storageBucket: "dlopes-lasalle-2025.appspot.com",
  messagingSenderId: "91491434656",
  appId: "1:91491434656:web:8a083bf3df35b5e18949c5",
};

// Inicializa Firebase, Auth e Database
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

let listasUsuario = {}; // guardará as listas carregadas

// Exibe mensagem de feedback
function showModal(msg, ok = true) {
  const m = document.getElementById("modalMessage");
  m.style.background = ok ? "#4CAF50" : "#f44336";
  document.getElementById("modalText").innerText = msg;
  m.style.display = "block";
  setTimeout(() => (m.style.display = "none"), 2000);
}

// Formata Date para "DD/MM/YYYY"
function formatDate(date) {
  const d = String(date.getDate()).padStart(2, "0");
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const y = date.getFullYear();
  return `${d}/${m}/${y}`;
}

// Carrega as listas do usuário e popula o <select>
async function carregarListas(user) {
  const snap = await get(ref(db, `users/${user.uid}/listas`));
  const select = document.getElementById("selectListas");
  select.innerHTML = `<option value="">-- Escolha uma lista --</option>`;

  if (snap.exists()) {
    listasUsuario = snap.val();
    Object.entries(listasUsuario).forEach(([id, lista]) => {
      const opt = document.createElement("option");
      opt.value = id;
      opt.textContent = lista.nome;
      select.appendChild(opt);
    });
  } else {
    listasUsuario = {};
  }
}

// Duplica a lista selecionada, ajustando o nome com a data de hoje
async function copiarLista(user) {
  const sel = document.getElementById("selectListas");
  const listaId = sel.value;
  if (!listaId) {
    showModal("Selecione uma lista para copiar.", false);
    return;
  }

  const lista = listasUsuario[listaId];
  if (!lista) {
    showModal("Lista não encontrada.", false);
    return;
  }

  // Extrai baseName e data original (última parte após " - ")
  const partes = lista.nome.split(" - ");
  const originalDate = partes.length > 1 ? partes[partes.length - 1] : null;
  const baseName =
    partes.length > 1 ? partes.slice(0, -1).join(" - ") : lista.nome;

  const hoje = new Date();
  const hojeStr = formatDate(hoje);

  // Impede cópia se já criada hoje
  if (originalDate === hojeStr) {
    showModal("Não é possível copiar a mesma lista no mesmo dia.", false);
    return;
  }

  // Novo nome com data de hoje
  const newName = `${baseName} - ${hojeStr}`;

  // Cria a nova lista no banco
  const newRef = push(ref(db, `users/${user.uid}/listas`));
  await set(newRef, {
    nome: newName,
    itens: lista.itens || {},
    data_criacao: hoje.toISOString(),
    status: "andamento",
  });

  showModal("Lista copiada com sucesso!");
}

document.addEventListener("DOMContentLoaded", () => {
  onAuthStateChanged(auth, async (user) => {
    if (!user) return;

    // Popula dropdown e gerencia botão
    await carregarListas(user);
    const sel = document.getElementById("selectListas");
    const btn = document.getElementById("copiarListaBtn");
    btn.style.display = "none";

    sel.addEventListener("change", () => {
      btn.style.display = sel.value ? "inline-block" : "none";
    });

    btn.addEventListener("click", () => copiarLista(user));
  });
});
