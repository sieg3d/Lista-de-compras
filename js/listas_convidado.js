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

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

// Função para atualizar o status do item no banco de dados
function atualizarStatusItemConvidado(convidadoId, listaId, itemKey, concluido) {
    if (convidadoId && listaId && itemKey !== undefined) {
        const listaRef = ref(db, `convidados/${convidadoId}/listas_compartilhadas/${listaId}/itens/${itemKey}/concluido`);
        update(listaRef, concluido);
    }
}

// Função para exibir os detalhes da lista selecionada
async function exibirDetalhesListaConvidado(convidadoId, listaId) {
    const detalhesListaDiv = document.getElementById("detalhesLista");
    detalhesListaDiv.innerHTML = "";

    try {
        const listasCompartilhadasRef = ref(db, `convidados/${convidadoId}/listas_compartilhadas`);
        const snapshot = await get(listasCompartilhadasRef);

        if (snapshot.exists() && snapshot.val() && snapshot.val().hasOwnProperty(listaId)) {
            const listaRef = ref(db, `listas_compartilhadas/${listaId}`);
            const listaSnapshot = await get(listaRef);

            if (listaSnapshot.exists()) {
                const listaCompartilhadaDetalhes = listaSnapshot.val();
                const donoId = listaCompartilhadaDetalhes.dono_id;
                const listaUserRef = ref(db, `users/${donoId}/listas/${listaId}`);
                const listaUserSnapshot = await get(listaUserRef);

                if (listaUserSnapshot.exists()) {
                    const listaDetalhes = listaUserSnapshot.val();
                    let detalhesHTML = `<h2>${listaDetalhes.nome}</h2>`;
                    detalhesHTML += "<table><thead><tr><th></th><th>Produto</th><th>Quantidade</th><th>Concluído</th><th>Ações</th></tr></thead><tbody>";

                    if (listaDetalhes.itens) {
                        for (const itemKey in listaDetalhes.itens) {
                            const item = listaDetalhes.itens[itemKey];
                            try {
                                let produtoRef;
                                produtoRef = ref(db, `users/${donoId}/produtos/${item.produtoId}`);
                                const produtoSnapshot = await get(produtoRef);

                                if (produtoSnapshot.exists()) {
                                    const produto = produtoSnapshot.val();
                                    if (produto && produto.nome) {
                                        detalhesHTML += `
                                            <tr id="item-${itemKey}">
                                                <td></td>
                                                <td>${produto.nome}</td>
                                                <td><input type="number" id="quantidade-${itemKey}" value="${item.quantidade}" data-item-key="${itemKey}"></td>
                                                <td><input type="checkbox" id="check-${itemKey}" data-item-key="${itemKey}" ${item.concluido ? 'checked' : ''}></td>
                                                <td>
                                                    
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
                                                    
                                                </td>
                                            </tr>`;
                                    }
                                }
                            } catch (error) {
                                console.error("Erro ao buscar produto:", error);
                                detalhesHTML += `
                                    <tr id="item-${itemKey}">
                                        <td></td>
                                        <td>Erro ao buscar produto</td>
                                        <td><input type="number" id="quantidade-${itemKey}" value="${item.quantidade}" data-item-key="${itemKey}"></td>
                                        <td><input type="checkbox" id="check-${itemKey}" data-item-key="${itemKey}" ${item.concluido ? 'checked' : ''}></td>
                                        <td>
                                            
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
                    if (listaDetalhes.itens) {
                        for (const itemKey in listaDetalhes.itens) {
                            const checkbox = document.getElementById(`check-${itemKey}`);
                            if (checkbox) {
                                checkbox.addEventListener("change", () => {
                                    const row = document.getElementById(`item-${itemKey}`);
                                    if (checkbox.checked) {
                                        row.style.textDecoration = "line-through";
                                    } else {
                                        row.style.textDecoration = "none";
                                    }
                                    atualizarStatusItemConvidado(convidadoId, listaId, itemKey, checkbox.checked);
                                });
                            }
                        }
                    }
                }
            }
        } else {
            detalhesListaDiv.innerHTML = "<p>Nenhuma lista compartilhada com você.</p>";
        }
    } catch (error) {
        console.error("Erro ao exibir detalhes da lista:", error);
        detalhesListaDiv.innerHTML = "<p>Erro ao carregar detalhes da lista.</p>";
    }
}

// Função para adicionar um novo produto à lista
function adicionarNovoProdutoConvidado(convidadoId, listaId, produtoId, quantidade) {
    if (convidadoId && listaId && produtoId && quantidade) {
        const listaItensRef = ref(db, `convidados/${convidadoId}/listas_compartilhadas/${listaId}/itens`);
        push(listaItensRef, {
            produtoId: produtoId,
            quantidade: quantidade,
            concluido: false
        }).then(() => {
            alert("Produto adicionado à lista.");
            exibirDetalhesListaConvidado(convidadoId, listaId);
        }).catch((error) => {
            console.error("Erro ao adicionar produto:", error);
            alert("Erro ao adicionar produto.");
        });
    }
}

// Função para editar a quantidade de um item na lista
function editarQuantidadeItemConvidado(convidadoId, listaId, itemKey, quantidade) {
    if (convidadoId && listaId && itemKey !== undefined && quantidade) {
        const quantidadeRef = ref(db, `convidados/${convidadoId}/listas_compartilhadas/${listaId}/itens/${itemKey}/quantidade`);
        update(quantidadeRef, quantidade);
    }
}

// Manipular a seleção da lista
const selectListasConvidado = document.getElementById("selectListasConvidado");
selectListasConvidado.addEventListener("change", (event) => {
    const convidadoId = auth.currentUser.uid;
    const listaId = event.target.value;
    if (listaId) {
        exibirDetalhesListaConvidado(convidadoId, listaId);
    } else {
        document.getElementById("detalhesLista").innerHTML = "";
    }
});

// Carregar as opções de lista compartilhada no select
onAuthStateChanged(auth, async (user) => {
    if (user) {
        const convidadoId = user.uid;
        const listasCompartilhadasRef = ref(db, `convidados/${convidadoId}/listas_compartilhadas`);
        const snapshot = await get(listasCompartilhadasRef);
        const selectListasConvidado = document.getElementById("selectListasConvidado");
        const novoProdutoForm = document.getElementById("novoProdutoForm");

        selectListasConvidado.innerHTML = "<option value=''>Selecione uma lista</option>";

        if (snapshot.exists()) {
            const listasCompartilhadas = snapshot.val();
            for (const listaId in listasCompartilhadas) {
                if (listasCompartilhadas.hasOwnProperty(listaId)) {
                    const listaRef = ref(db, `listas_compartilhadas/${listaId}`);
                    const listaSnapshot = await get(listaRef);

                    if (listaSnapshot.exists()) {
                        const listaCompartilhadaDetalhes = listaSnapshot.val();
                        const donoId = listaCompartilhadaDetalhes.dono_id;
                        const listaUserRef = ref(db, `users/${donoId}/listas/${listaId}`);
                        const listaUserSnapshot = await get(listaUserRef);

                        if (listaUserSnapshot.exists()) {
                            const listaDetalhes = listaUserSnapshot.val();
                            const option = document.createElement("option");
                            option.value = listaId;
                            option.textContent = listaDetalhes.nome;
                            selectListasConvidado.appendChild(option);
                        }
                    }
                }
            }
        } else {
            selectListasConvidado.innerHTML = "<option>Nenhuma lista compartilhada</option>";
            document.getElementById("detalhesLista").innerHTML = "";
        }

        // Manipulador de evento para o botão "Adicionar Produto"
        document.getElementById("adicionarProdutoBtn").addEventListener("click", () => {
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
                editarQuantidadeItemConvidado(convidadoId, selectListasConvidado.value, itemKey, quantidade);
            });
            exibirDetalhesListaConvidado(convidadoId, selectListasConvidado.value);
        });

        // Manipulador de evento para o botão "Adicionar Item"
        document.getElementById("adicionarItemBtn").addEventListener("click", () => {
            const produtoSelect = document.getElementById("produtoSelect");
            const quantidadeInput = document.getElementById("quantidadeInput");
            if (produtoSelect.value && quantidadeInput.value) {
                adicionarNovoProdutoConvidado(convidadoId, selectListasConvidado.value, produtoSelect.value, quantidadeInput.value);
                novoProdutoForm.style.display = "none";
                document.getElementById("adicionarProdutoBtn").style.display = "block";
                document.getElementById("salvarAlteracoesBtn").style.display = "block";
            } else {
                alert("Por favor, selecione um produto e insira a quantidade.");
            }
        });

        // Manipulador de evento para o botão "Cancelar Adição"
        document.getElementById("cancelarAdicaoBtn").addEventListener("click", () => {
            novoProdutoForm.style.display = "none";
            document.getElementById("adicionarProdutoBtn").style.display = "block";
            document.getElementById("salvarAlteracoesBtn").style.display = "block";
        });

        // Event delegation para botões de editar e remover
        document.getElementById("detalhesLista").addEventListener("click", (event) => {
            const target = event.target;
            if (target.classList.contains("editar-btn")) {
                //Implementar lógica de edição (exibir campos de edição na linha, etc.)
                console.log("Editar item:", itemKey);
            }
        });
    }
});