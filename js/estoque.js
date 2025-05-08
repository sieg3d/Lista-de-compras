import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getDatabase, ref, get, remove } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

// Configuração do Firebase
const firebaseConfig = {
    apiKey: "AIzaSyA8cXYQ4m-uyEjbJJF_1_4Re8RJvqo1DWE",
    authDomain: "dlopes-lasalle-2025.firebaseapp.com",
    projectId: "dlopes-lasalle-2025",
    storageBucket: "dlopes-lasalle-2025.appspot.com",
    messagingSenderId: "91491434656",
    appId: "1:91491434656:web:8a083bf3df35b5e18949c5",
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);

// tenta remover o produto, só se ele não estiver em nenhuma lista
async function removerProduto(user, produtoId) {
  const uid = user.uid;
  const listasSnap = await get(ref(db, `users/${uid}/listas`));

  if (listasSnap.exists()) {
    const listas = listasSnap.val();
    for (const listaId in listas) {
      const lista = listas[listaId];
      if (lista.itens) {
        for (const itemKey in lista.itens) {
          if (lista.itens[itemKey].produtoId === produtoId) {
            return alert(
              `Não é possível remover. Produto presente na lista “${lista.nome}”.`
            );
          }
        }
      }
    }
  }

  try {
    await remove(ref(db, `users/${uid}/produtos/${produtoId}`));
    alert("Produto removido com sucesso!");
    carregarProdutos(user);
  } catch (error) {
    console.error("Erro ao remover produto:", error);
    alert("Erro ao remover produto.");
  }
}

function carregarProdutos(user) {
  const tabelaBody = document.querySelector(".estoque-table tbody");
  tabelaBody.innerHTML = "";

  if (!user) {
    tabelaBody.innerHTML =
      "<tr><td colspan='3'>Você precisa estar logado para ver o estoque.</td></tr>";
    return;
  }

  const uid = user.uid;
  const produtosRef = ref(db, `users/${uid}/produtos`);
  get(produtosRef)
    .then((snapshot) => {
      if (!snapshot.exists()) {
        tabelaBody.innerHTML =
          "<tr><td colspan='3'>Nenhum produto cadastrado.</td></tr>";
        return;
      }

      const produtos = snapshot.val();
      for (const key in produtos) {
        const { nome, estoque_inicial } = produtos[key];
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${nome}</td>
          <td>${estoque_inicial}</td>
          <td>
<button
  class="btn-remover"
  data-prodid="${key}"
  style="
    border: none !important;
    background: transparent !important;
    padding: 0;
    cursor: pointer;
  "
>
  <img src="Imagens/lixo.png" alt="Remover" style="width:20px;height:20px;">
</button>
          </td>
        `;
        tabelaBody.appendChild(row);
      }

      // adiciona listener para cada lixeira
      tabelaBody.querySelectorAll(".btn-remover").forEach((btn) => {
        btn.addEventListener("click", () => {
          const produtoId = btn.dataset.prodid;
          if (confirm("Deseja realmente remover este produto?")) {
            removerProduto(user, produtoId);
          }
        });
      });
    })
    .catch((error) => {
      console.error("Erro ao carregar produtos:", error);
      tabelaBody.innerHTML =
        "<tr><td colspan='3'>Erro ao carregar produtos.</td></tr>";
    });
}

document.addEventListener("DOMContentLoaded", () => {
  onAuthStateChanged(auth, (user) => {
    carregarProdutos(user);
  });
});
