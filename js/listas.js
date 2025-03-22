import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getDatabase, ref, get, push, set } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

// Configuração do Firebase
/*const firebaseConfig = {
  apiKey: "AIzaSyA8cXYQ4m-uyEjbJJF_1_4Re8RJvqo1DWE",
  authDomain: "dlopes-lasalle-2025.firebaseapp.com",
  projectId: "dlopes-lasalle-2025",
  storageBucket: "dlopes-lasalle-2025.appspot.com",
  messagingSenderId: "91491434656",
  appId: "1:91491434656:web:8a083bf3df35b5e18949c5",
};*/
const firebaseConfig = {
    apiKey: "AIzaSyAlgaQN8Oq7tsS6UhymWriTzTga1qmg-ZI",
    authDomain: "rlb-lasalle-firebase.firebaseapp.com",
    databaseURL: "https://rlb-lasalle-firebase-default-rtdb.firebaseio.com",
    projectId: "rlb-lasalle-firebase",
    storageBucket: "rlb-lasalle-firebase.firebasestorage.app",
    messagingSenderId: "488497251520",
    appId: "1:488497251520:web:32e3bf3f71040ef1c69925",
    measurementId: "G-DMLGRWXSP9"
  };

// Inicializa Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);

// Função para carregar e exibir as listas do usuário
function carregarListas(user) {
    if (user) {
        const uid = user.uid;
        const listasRef = ref(db, `users/${uid}/listas`);
        get(listasRef).then((snapshot) => {
            const selectListas = document.getElementById("selectListas");
            selectListas.innerHTML = "<option value=''>Selecione uma lista</option>"; // Limpa e adiciona a opção padrão

            if (snapshot.exists()) {
                const listas = snapshot.val();
                for (const key in listas) {
                    const lista = listas[key];
                    const option = document.createElement("option");
                    option.value = key;
                    option.textContent = lista.nome;
                    selectListas.appendChild(option);
                }
                // Adiciona um ouvinte de eventos para quando uma lista é selecionada
                selectListas.addEventListener("change", (event) => {
                    exibirDetalhesLista(user, event.target.value);
                });

            } else {
                selectListas.innerHTML = "<option>Nenhuma lista encontrada</option>";
                document.getElementById("detalhesLista").innerHTML = "";
            }
        });
    } else {
        console.log("Nenhum usuário logado.");
    }
}

// Função para exibir os detalhes da lista selecionada
function exibirDetalhesLista(user, listaId) {
    if (user && listaId) {
        const uid = user.uid;
        const listaRef = ref(db, `users/${uid}/listas/${listaId}`);
        const produtosRef = ref(db, `users/${uid}/produtos`);

        get(listaRef).then((snapshot) => {
            const detalhesListaDiv = document.getElementById("detalhesLista");
            detalhesListaDiv.innerHTML = ""; // Limpa os detalhes existentes

            if (snapshot.exists()) {
                const lista = snapshot.val();
                let detalhesHTML = `<h2>${lista.nome}</h2>`;
                detalhesHTML += "<table><thead><tr><th>#</th><th>Produto</th><th>Quantidade</th><th>Concluído</th></tr></thead><tbody>";

                // Obtenha os produtos e use-os para mapear o produtoId para o nome do produto
                get(produtosRef).then((produtosSnapshot) => {
                    if (produtosSnapshot.exists()) {
                        const produtos = produtosSnapshot.val();

                        lista.itens.forEach((item, index) => {
                            const produto = produtos[item.produtoId];
                            if (produto) {
                                detalhesHTML += `
                                    <tr id="item-${index}">
                                        <td>${index + 1}</td>
                                        <td>${produto.nome}</td>
                                        <td>${item.quantidade}</td>
                                        <td><input type="checkbox" id="check-${index}" data-index="${index}"></td>
                                    </tr>`;
                            } else {
                                detalhesHTML += `
                                    <tr id="item-${index}">
                                        <td>${index + 1}</td>
                                        <td>Produto ID: ${item.produtoId} (Produto não encontrado)</td>
                                        <td>${item.quantidade}</td>
                                        <td><input type="checkbox" id="check-${index}" data-index="${index}"></td>
                                    </tr>`;
                            }
                        });

                        detalhesHTML += "</tbody></table>";
                        detalhesListaDiv.innerHTML = detalhesHTML;

                        // Adiciona listeners para os checkboxes após a tabela ser criada
                        lista.itens.forEach((_, index) => {
                            const checkbox = document.getElementById(`check-${index}`);
                            checkbox.addEventListener("change", () => {
                                const row = document.getElementById(`item-${index}`);
                                if (checkbox.checked) {
                                    row.style.textDecoration = "line-through";
                                } else {
                                    row.style.textDecoration = "none";
                                }
                                atualizarStatusItem(user, listaId, index, checkbox.checked);
                            });
                        });

                    } else {
                        detalhesHTML += "<tr><td colspan='4'>Nenhum produto cadastrado.</td></tr></tbody></table>";
                        detalhesListaDiv.innerHTML = detalhesHTML;
                    }
                });
            } else {
                detalhesListaDiv.innerHTML = "<p>Detalhes da lista não encontrados.</p>";
            }
        });
    }
}

// Função para atualizar o status do item no banco de dados
function atualizarStatusItem(user, listaId, itemIndex, concluido) {
    const uid = user.uid;
    const listaRef = ref(db, `users/${uid}/listas/${listaId}/itens/${itemIndex}/concluido`);
    update(listaRef, concluido);
}

// Ouvinte de estado de autenticação
onAuthStateChanged(auth, (user) => {
    carregarListas(user);
});