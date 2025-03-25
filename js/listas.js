import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getDatabase, ref, get, push, set, update } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

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

// Função para carregar e exibir as listas do usuário
function carregarListas(user) {
    if (user) {
        const uid = user.uid;
        const listasRef = ref(db, `users/${uid}/listas`);
        get(listasRef).then((snapshot) => {
            const selectListas = document.getElementById("selectListas");
            selectListas.innerHTML = "<option value=''>Selecione uma lista</option>";

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
        const detalhesListaDiv = document.getElementById("detalhesLista");
        const novoProdutoForm = document.getElementById("novoProdutoForm");
        const adicionarProdutoBtn = document.getElementById("adicionarProdutoBtn");
        const salvarAlteracoesBtn = document.getElementById("salvarAlteracoesBtn");

        detalhesListaDiv.innerHTML = "";
        novoProdutoForm.style.display = "none";
        adicionarProdutoBtn.style.display = "block";
        salvarAlteracoesBtn.style.display = "block";

        get(listaRef).then((snapshot) => {
            if (snapshot.exists()) {
                const lista = snapshot.val();
                let detalhesHTML = `<h2>${lista.nome}</h2>`;
                detalhesHTML += "<table><thead><tr><th>#</th><th>Produto</th><th>Quantidade</th><th>Concluído</th><th>Ações</th></tr></thead><tbody>";

                // Obtenha os produtos e use-os para mapear o produtoId para o nome do produto
                get(produtosRef).then((produtosSnapshot) => {
                    if (produtosSnapshot.exists()) {
                        const produtos = produtosSnapshot.val();

                        if (lista.itens) {
                            for (const itemKey in lista.itens) {
                                const item = lista.itens[itemKey];
                                const produto = produtos[item.produtoId];
                                if (produto) {
                                    detalhesHTML += `
                                        <tr id="item-${itemKey}">
                                            <td></td>
                                            <td>${produto.nome}</td>
                                            <td><input type="number" id="quantidade-${itemKey}" value="${item.quantidade}" data-item-key="${itemKey}"></td>
                                            <td><input type="checkbox" id="check-${itemKey}" data-item-key="${itemKey}" ${item.concluido ? 'checked' : ''}></td>
                                            <td>
                                                <button class="editar-btn" data-item-key="${itemKey}">Editar</button>
                                                <button class="remover-btn" data-item-key="${itemKey}">Remover</button>
                                            </td>
                                        </tr>`;
                                } else {
                                    detalhesHTML += `
                                        <tr id="item-${itemKey}">
                                            <td></td>
                                            <td>Produto ID: ${item.produtoId} (Produto não encontrado)</td>
                                            <td><input type="number" id="quantidade-${itemKey}" value="${item.quantidade}" data-item-key="${itemKey}"></td>
                                            <td><input type="checkbox" id="check-${itemKey}" data-item-key="${itemKey}" ${item.concluido ? 'checked' : ''}></td>
                                            <td>
                                                <button class="editar-btn" data-item-key="${itemKey}">Editar</button>
                                                <button class="remover-btn" data-item-key="${itemKey}">Remover</button>
                                            </td>
                                        </tr>`;
                                }
                            }
                        } else {
                            detalhesHTML += "<tr><td colspan='5'>Nenhum item na lista.</td></tr>";
                        }

                        detalhesHTML += "</tbody></table>";
                        detalhesListaDiv.innerHTML = detalhesHTML;

                        // Adiciona listeners para os checkboxes após a tabela ser criada
                        if (lista.itens) {
                            for (const itemKey in lista.itens) {
                                const checkbox = document.getElementById(`check-${itemKey}`);
                                if (checkbox) {
                                    checkbox.addEventListener("change", () => {
                                        const row = document.getElementById(`item-${itemKey}`);
                                        if (checkbox.checked) {
                                            row.style.textDecoration = "line-through";
                                        } else {
                                            row.style.textDecoration = "none";
                                        }
                                        atualizarStatusItem(user, listaId, itemKey, checkbox.checked);
                                    });
                                }
                            }
                        }
                    } else {
                        detalhesHTML += "<tr><td colspan='5'>Nenhum produto cadastrado.</td></tr></tbody></table>";
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
function atualizarStatusItem(user, listaId, itemKey, concluido) {
    if (user && listaId && itemKey !== undefined) {
        const uid = user.uid;
        const listaRef = ref(db, `users/${uid}/listas/${listaId}/itens/${itemKey}/concluido`);
        update(listaRef, concluido);
    }
}

// Função para adicionar um novo produto à lista
function adicionarNovoProduto(user, listaId, produtoId, quantidade) {
    if (user && listaId && produtoId && quantidade) {
        const uid = user.uid;
        const listaItensRef = ref(db, `users/${uid}/listas/${listaId}/itens`);
        push(listaItensRef, {
            produtoId: produtoId,
            quantidade: quantidade,
            concluido: false
        }).then(() => {
            alert("Produto adicionado à lista.");
            exibirDetalhesLista(user, listaId);
        }).catch((error) => {
            console.error("Erro ao adicionar produto:", error);
            alert("Erro ao adicionar produto.");
        });
    }
}

// Função para editar a quantidade de um item na lista
function editarQuantidadeItem(user, listaId, itemKey, quantidade) {
    if (user && listaId && itemKey !== undefined && quantidade) {
        const uid = user.uid;
        const quantidadeRef = ref(db, `users/${uid}/listas/${listaId}/itens/${itemKey}/quantidade`);
        update(quantidadeRef, quantidade);
    }
}

// Função para remover um item da lista
function removerItem(user, listaId, itemKey) {
    if (user && listaId && itemKey !== undefined) {
        const uid = user.uid;
        const itemRef = ref(db, `users/${uid}/listas/${listaId}/itens/${itemKey}`);
        set(itemRef, null).then(() => {
            alert("Item removido da lista.");
            exibirDetalhesLista(user, listaId);
        }).catch((error) => {
            console.error("Erro ao remover item:", error);
            alert("Erro ao remover item.");
        });
    }
}

// Ouvinte de estado de autenticação
onAuthStateChanged(auth, (user) => {
    if (user) {
        carregarListas(user);

        // Manipulador de evento para o botão "Adicionar Produto"
        document.getElementById("adicionarProdutoBtn").addEventListener("click", () => {
            const novoProdutoForm = document.getElementById("novoProdutoForm");
            novoProdutoForm.style.display = "block";
            document.getElementById("adicionarProdutoBtn").style.display = "none";
            document.getElementById("salvarAlteracoesBtn").style.display = "none";

            // Preenche o select com os produtos cadastrados
            const produtoSelect = document.getElementById("produtoSelect");
            const uid = user.uid;
            const produtosRef = ref(db, `users/${uid}/produtos`);
            get(produtosRef).then((snapshot) => {
                produtoSelect.innerHTML = "<option value=''>Selecione um produto</option>";
                if (snapshot.exists()) {
                    const produtos = snapshot.val();
                    for (const key in produtos) {
                        const produto = produtos[key];
                        const option = document.createElement("option");
                        option.value = key;
                        option.textContent = produto.nome;
                        produtoSelect.appendChild(option);
                    }
                }
            });
        });

        // Manipulador de evento para o botão "Salvar Alterações"
        document.getElementById("salvarAlteracoesBtn").addEventListener("click", () => {
            const quantidadeInputs = document.querySelectorAll('input[id^="quantidade-"]');
            quantidadeInputs.forEach((input) => {
                const itemKey = input.dataset.itemKey;
                const quantidade = input.value;
                editarQuantidadeItem(user, document.getElementById("selectListas").value, itemKey, quantidade);
            });
            exibirDetalhesLista(user, document.getElementById("selectListas").value);
        });

        // Manipulador de evento para o botão "Adicionar Item"
        document.getElementById("adicionarItemBtn").addEventListener("click", () => {
            const produtoSelect = document.getElementById("produtoSelect");
            const quantidadeInput = document.getElementById("quantidadeInput");
            if (produtoSelect.value && quantidadeInput.value) {
                adicionarNovoProduto(user, document.getElementById("selectListas").value, produtoSelect.value, quantidadeInput.value);
                document.getElementById("novoProdutoForm").style.display = "none";
                document.getElementById("adicionarProdutoBtn").style.display = "block";
                document.getElementById("salvarAlteracoesBtn").style.display = "block";
            } else {
                alert("Por favor, selecione um produto e insira a quantidade.");
            }
        });

        // Manipulador de evento para o botão "Cancelar Adição"
        document.getElementById("cancelarAdicaoBtn").addEventListener("click", () => {
            document.getElementById("novoProdutoForm").style.display = "none";
            document.getElementById("adicionarProdutoBtn").style.display = "block";
            document.getElementById("salvarAlteracoesBtn").style.display = "block";
        });

        // Manipulador de evento para botões de "Editar" e "Remover"
        document.addEventListener("click", (event) => {
            if (event.target.classList.contains("editar-btn")) {
                // Lógica para editar o item (pode abrir um formulário de edição, por exemplo)
                const itemKey = event.target.dataset.itemKey;
                console.log("Editar item:", itemKey);
            }

            if (event.target.classList.contains("remover-btn")) {
                const itemKey = event.target.dataset.itemKey;
                removerItem(user, document.getElementById("selectListas").value, itemKey);
            }
        });
    }
});