import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyA8cXYQ4m-uyEjbJJF_1_4Re8RJvqo1DWE",
  authDomain: "dlopes-lasalle-2025.firebaseapp.com",
  projectId: "dlopes-lasalle-2025",
  storageBucket: "dlopes-lasalle-2025.appspot.com",
  messagingSenderId: "91491434656",
  appId: "1:91491434656:web:8a083bf3df35b5e18949c5",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

// Elementos da UI
const selectListas = document.getElementById("selectListasConvidado");
const detalhesDiv = document.getElementById("detalhesLista");
const btnAdd = document.getElementById("adicionarProdutoBtn");
const btnSave = document.getElementById("salvarAlteracoesBtn");
const nomeNav = document.getElementById("nome-usuario-nav");

// Carrega as listas compartilhadas para este usuário
async function carregarListasConvidadas(uid) {
  selectListas.innerHTML = `<option value="">Selecione uma lista</option>`;
  const sharedSnap = await get(ref(db, `sharedListsForUser/${uid}`));
  if (sharedSnap.exists()) {
    sharedSnap.forEach(donoSnap => {
      const donoId = donoSnap.key;
      const listasObj = donoSnap.val();
      for (const listaId in listasObj) {
        // Busca nome da lista
        get(ref(db, `users/${donoId}/listas/${listaId}/nome`))
          .then(nameSnap => {
            const nomeLista = nameSnap.exists() ? nameSnap.val() : listaId;
            const opt = document.createElement("option");
            opt.value = `${donoId}/${listaId}`;
            opt.textContent = nomeLista;
            selectListas.appendChild(opt);
          })
          .catch(err => console.warn(`Erro ao buscar nome da lista ${listaId}:`, err));
      }
    });
  } else {
    const opt = document.createElement("option");
    opt.textContent = "Nenhuma lista compartilhada";
    opt.disabled = true;
    selectListas.appendChild(opt);
  }
}

// Exibe detalhes da lista (somente visualização para convidados)
async function exibirDetalhes(donoId, listaId, isOwner) {
  detalhesDiv.innerHTML = "";

  // Nome da lista
  const metaSnap = await get(ref(db, `users/${donoId}/listas/${listaId}/nome`));
  const nomeLista = metaSnap.exists() ? metaSnap.val() : "Lista sem nome";

  // Início da tabela
  let html = `
    <h2>${nomeLista}</h2>
    <table>
      <thead>
        <tr><th>Produto</th><th>Quantidade</th><th>Concluído</th></tr>
      </thead>
      <tbody>`;

  // Carrega itens da lista
  const itensSnap = await get(ref(db, `users/${donoId}/listas/${listaId}/itens`));
  if (itensSnap.exists()) {
    const itens = itensSnap.val();
    for (const key in itens) {
      const item = itens[key];

      // Valor padrão para nome do produto
      let nomeProduto = item.produtoId;
      try {
        const prodNomeSnap = await get(ref(db, `users/${donoId}/produtos/${item.produtoId}/nome`));
        if (prodNomeSnap.exists()) {
          nomeProduto = prodNomeSnap.val();
        }
      } catch (err) {
        console.warn(`Não foi possível ler produto ${item.produtoId}:`, err);
      }

      html += `
        <tr>
          <td>${nomeProduto}</td>
          <td>${item.quantidade}</td>
          <td>${item.concluido ? '✔️' : '—'}</td>
        </tr>`;
    }
  } else {
    html += `<tr><td colspan="3">Nenhum item na lista.</td></tr>`;
  }

  html += `
      </tbody>
    </table>`;

  detalhesDiv.innerHTML = html;
  btnAdd.style.display = isOwner ? 'inline-block' : 'none';
  btnSave.style.display = isOwner ? 'inline-block' : 'none';
}

// Inicializa comportamento após login
onAuthStateChanged(auth, async user => {
  if (!user) {
    alert("Você precisa estar logado.");
    window.location.href = "login.html";
    return;
  }

  // Exibe nome no nav
  const nomeSnap = await get(ref(db, `users/${user.uid}/nome`));
  nomeNav.textContent = nomeSnap.exists() ? nomeSnap.val() : "Usuário";

  // Carrega listas e adiciona listener
  await carregarListasConvidadas(user.uid);
  selectListas.addEventListener('change', async () => {
    const selected = selectListas.value;
    if (!selected) {
      detalhesDiv.innerHTML = '';
      btnAdd.style.display = 'none';
      btnSave.style.display = 'none';
      return;
    }
    const [donoId, listaId] = selected.split('/');
    const isOwner = donoId === user.uid;
    await exibirDetalhes(donoId, listaId, isOwner);
  });
});

// Função de toggle para menu mobile
function menu() {
  const x = document.getElementById("myLinks");
  x.style.display = x.style.display === "block" ? "none" : "block";
}
