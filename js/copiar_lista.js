import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import {
  getDatabase, ref, get, push, set
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

// Configuração do Firebase (seu config aqui)
const firebaseConfig = { /* … */ };
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);

let produtosUsuario = {};

// Modal de feedback
function showModal(msg, ok = true) {
  const m = document.getElementById("modalMessage");
  m.style.background = ok ? "#4CAF50" : "#f44336";
  document.getElementById("modalText").innerText = msg;
  m.style.display = "block";
  setTimeout(() => m.style.display = "none", 2500);
}

// Popula o select de produtos
function popularSelectProdutos() {
  const sel = document.createElement("select");
  sel.classList.add("select-produto");
  sel.appendChild(new Option("Selecione Produto", ""));
  Object.entries(produtosUsuario).forEach(([id, p]) => {
    sel.appendChild(new Option(p.nome, id));
  });
  return sel;
}

// Adiciona linha na tabela
function adicionarItemTabela() {
  const tbody = document.querySelector(".lista-table tbody");
  const last = tbody.lastElementChild;
  if (last) {
    const sel = last.querySelector(".select-produto");
    if (!sel.value) {
      showModal("Escolha o produto anterior antes de adicionar outro.", false);
      return;
    }
  }
  const tr = document.createElement("tr");
  const td1 = document.createElement("td"); td1.appendChild(popularSelectProdutos());
  const td2 = document.createElement("td");
  const inp = document.createElement("input"); inp.type = "number"; inp.min = 1; inp.value = 1;
  td2.appendChild(inp);
  const td3 = document.createElement("td");
  const btn = document.createElement("button"); btn.classList.add("btn-remover"); btn.textContent = "🗑️";
  btn.onclick = () => tr.remove();
  td3.appendChild(btn);
  tr.append(td1, td2, td3);
  tbody.appendChild(tr);
}

// Salva lista com status inicial = "andamento"
async function salvarLista(user) {
  const nome = document.getElementById("nome_lista").value.trim();
  if (!nome) { showModal("Nome obrigatório.", false); return; }
  const rows = document.querySelectorAll(".lista-table tbody tr");
  if (!rows.length) { showModal("Adicione ao menos 1 item.", false); return; }

  const itens = [];
  for (const r of rows) {
    const pid = r.querySelector(".select-produto").value;
    const q = parseInt(r.querySelector("input").value);
    if (!pid) { showModal("Produto pendente.", false); return; }
    itens.push({ produtoId: pid, quantidade: q, concluido: false });
  }

  const now = new Date();
  const nomeData = `${nome} - ${now.toLocaleDateString("pt-BR")}`;
  const listRef = ref(db, `users/${user.uid}/listas`);
  const newRef = push(listRef);

  await set(newRef, {
    nome: nomeData,
    itens,
    data_criacao: now.toISOString(),
    status: "andamento"    // ← aqui
  });

  showModal("Lista criada!", true);
  setTimeout(() => location.href = "listas.html", 800);
}

// Carrega produtos ao autenticar
onAuthStateChanged(auth, async user => {
  if (!user) return;
  const snap = await get(ref(db, `users/${user.uid}/produtos`));
  produtosUsuario = snap.val() || {};
});

// Event listeners
document.getElementById("adicionar-item").onclick = adicionarItemTabela;
document.getElementById("salvar-lista").onclick = () => {
  const u = auth.currentUser;
  u ? salvarLista(u) : showModal("Faça login para criar lista.", false);
};
