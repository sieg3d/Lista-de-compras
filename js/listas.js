// js/listas.js

import { db, auth } from "./firebase-init.js";
import {
  ref,
  get,
  push,
  update
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";
import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

let produtosUsuario = {};
let currentListaId = "";

function showModal(message, success = true) {
  const m = document.getElementById("modalMessage");
  document.getElementById("modalText").innerText = message;
  m.style.backgroundColor = success ? "#4CAF50" : "#f44336";
  m.style.display = "block";
  setTimeout(() => m.style.display = "none", 3000);
}

async function carregarProdutos(user) {
  const snap = await get(ref(db, `users/${user.uid}/produtos`));
  produtosUsuario = snap.exists() ? snap.val() : {};
}

async function carregarListas(user) {
  const snap = await get(ref(db, `users/${user.uid}/listas`));
  const sel = document.getElementById("selectListas");
  sel.innerHTML = `<option value="">Selecione uma lista</option>`;
  if (snap.exists()) {
    Object.entries(snap.val()).forEach(([listaId, listaObj]) => {
      const opt = document.createElement("option");
      opt.value = listaId;
      opt.textContent = listaObj.nome;
      sel.appendChild(opt);
    });
  }
}

async function exibirDetalhesLista(user, listaId) {
  const container = document.getElementById("detalhesLista");
  container.innerHTML = "";

  const snap = await get(ref(db, `users/${user.uid}/listas/${listaId}`));
  if (!snap.exists()) {
    container.innerHTML = "<p>Lista não encontrada.</p>";
    return;
  }

  const lista = snap.val();
  let html = `
    <table class="lista-table">
      <thead>
        <tr><th>Produto</th><th>Quantidade</th><th>Concluído</th></tr>
      </thead>
      <tbody>
  `;

  Object.entries(lista.itens || {}).forEach(([itemKey, item]) => {
    const nomeProd = produtosUsuario[item.produtoId]?.nome || "Produto não encontrado";
    html += `
      <tr>
        <td>${nomeProd}</td>
        <td>${item.quantidade}</td>
        <td>
          <input
            type="checkbox"
            class="concluido-checkbox"
            data-item-key="${itemKey}"
            ${item.concluido ? "checked" : ""}>
        </td>
      </tr>
    `;
  });

  html += `
      </tbody>
    </table>
  `;

  container.innerHTML = html;

  container.querySelectorAll(".concluido-checkbox").forEach(cb => {
    cb.addEventListener("change", async e => {
      const marcado = e.target.checked;
      const itemKey = e.target.dataset.itemKey;
      try {
        await update(
          ref(db, `users/${user.uid}/listas/${listaId}/itens/${itemKey}`),
          { concluido: marcado }
        );
        showModal("Item atualizado!");
      } catch {
        e.target.checked = !marcado;
        showModal("Erro ao atualizar item.", false);
      }
    });
  });
}

function mostrarFormAdicionar() {
  const form = document.getElementById("novoProdutoForm");
  const sel = document.getElementById("produtoSelect");
  sel.innerHTML = `<option value="">Selecione um produto</option>`;
  Object.entries(produtosUsuario).forEach(([pid, prod]) => {
    const o = document.createElement("option");
    o.value = pid;
    o.textContent = prod.nome;
    sel.appendChild(o);
  });
  form.style.display = "block";
}

function esconderForm() {
  document.getElementById("novoProdutoForm").style.display = "none";
}

function adicionarItem(user) {
  const pid = document.getElementById("produtoSelect").value;
  const qtd = parseInt(document.getElementById("quantidadeInput").value, 10);
  if (!pid || isNaN(qtd) || qtd < 1) {
    showModal("Preencha corretamente os campos.", false);
    return;
  }
  push(
    ref(db, `users/${user.uid}/listas/${currentListaId}/itens`),
    { produtoId: pid, quantidade: qtd, concluido: false }
  )
    .then(() => {
      showModal("Item adicionado!");
      exibirDetalhesLista(user, currentListaId);
      esconderForm();
    })
    .catch(() => showModal("Erro ao adicionar item.", false));
}

onAuthStateChanged(auth, async user => {
  if (!user) return;

  await carregarProdutos(user);
  await carregarListas(user);

  const select = document.getElementById("selectListas");
  const btnAdd = document.getElementById("adicionarProdutoBtn");
  const btnFinish = document.getElementById("finalizarCompraBtn");

  select.addEventListener("change", e => {
    const listaId = e.target.value;
    if (listaId) {
      currentListaId = listaId;
      exibirDetalhesLista(user, listaId);
      btnAdd.style.display = btnFinish.style.display = "inline-block";
    } else {
      document.getElementById("detalhesLista").innerHTML = "";
      btnAdd.style.display = btnFinish.style.display = "none";
      esconderForm();
    }
  });

  btnAdd.addEventListener("click", mostrarFormAdicionar);
  document.getElementById("adicionarItemBtn")
    .addEventListener("click", () => adicionarItem(user));
  document.getElementById("cancelarAdicaoBtn")
    .addEventListener("click", esconderForm);

  btnFinish.addEventListener("click", async () => {
    if (!confirm("Deseja finalizar a compra?")) return;

    const itensSnap = await get(
      ref(db, `users/${user.uid}/listas/${currentListaId}/itens`)
    );
    if (!itensSnap.exists()) {
      showModal("Lista vazia.", false);
      return;
    }

    // Agrupa quantidades por produto
    const somaPorProduto = {};
    itensSnap.forEach(itemSnap => {
      const it = itemSnap.val();
      if (it.concluido) {
        somaPorProduto[it.produtoId] = (somaPorProduto[it.produtoId] || 0) + it.quantidade;
      }
    });

    if (Object.keys(somaPorProduto).length === 0) {
      showModal("Marque ao menos um item para finalizar.", false);
      return;
    }

    // Prepara updates: soma ao estoque atual
    const updates = {};
    Object.entries(somaPorProduto).forEach(([pid, somaQtd]) => {
      const atual = produtosUsuario[pid]?.estoque_inicial || 0;
      updates[`users/${user.uid}/produtos/${pid}/estoque_inicial`] = atual + somaQtd;
    });
    updates[`users/${user.uid}/listas/${currentListaId}/finalizada`] = true;

    try {
      await update(ref(db), updates);
      showModal("Compra finalizada e estoque atualizado!");
      document.getElementById("detalhesLista").innerHTML = "<p>Compra finalizada.</p>";
      btnAdd.style.display = btnFinish.style.display = "none";
      esconderForm();
    } catch {
      showModal("Erro ao finalizar compra.", false);
    }
  });
});

// Toggle do menu mobile
window.menu = () => {
  const nav = document.getElementById("myLinks");
  nav.style.display = nav.style.display === "block" ? "none" : "block";
};
