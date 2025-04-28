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

// Atualizar status concluído de um item
function atualizarStatusItemConvidado(donoId, listaId, itemKey, concluido) {
    if (donoId && listaId && itemKey !== undefined) {
        const itemRef = ref(db, `users/${donoId}/listas/${listaId}/itens/${itemKey}/concluido`);
        update(itemRef, { '.value': concluido });
    }
}

// Exibir detalhes da lista compartilhada
async function exibirDetalhesListaConvidado(donoId, listaId, convidadoId) {
    const detalhesListaDiv = document.getElementById("detalhesLista");
    detalhesListaDiv.innerHTML = "";

    try {
        const listaUserRef = ref(db, `users/${donoId}/listas/${listaId}`);
        const listaUserSnapshot = await get(listaUserRef);

        if (listaUserSnapshot.exists()) {
            const listaDetalhes = listaUserSnapshot.val();
            let detalhesHTML = `<h2>${listaDetalhes.nome}</h2>`;
            detalhesHTML += "<table><thead><tr><th>Produto</th><th>Quantidade</th><th>Concluído</th></tr></thead><tbody>";

            if (listaDetalhes.itens) {
                for (const itemKey in listaDetalhes.itens) {
                    const item = listaDetalhes.itens[itemKey];
                    let produtoNome = `Produto ID: ${item.produtoId}`;

                    try {
                        const produtoRef = ref(db, `users/${donoId}/produtos/${item.produtoId}`);
                        const produtoSnapshot = await get(produtoRef);
                        if (produtoSnapshot.exists()) {
                            const produto = produtoSnapshot.val();
                            produtoNome = produto.nome;
                        }
                    } catch (error) {
                        console.error("Erro ao buscar produto:", error);
                    }

                    detalhesHTML += `
                        <tr id="item-${itemKey}">
                            <td>${produtoNome}</td>
                            <td><input type="number" id="quantidade-${itemKey}" value="${item.quantidade}" data-item-key="${itemKey}" disabled></td>
                            <td><input type="checkbox" id="check-${itemKey}" data-item-key="${itemKey}" ${item.concluido ? 'checked' : ''}></td>
                        </tr>`;
                }
            } else {
                detalhesHTML += "<tr><td colspan='3'>Nenhum item na lista.</td></tr>";
            }

            detalhesHTML += "</tbody></table>";
            detalhesListaDiv.innerHTML = detalhesHTML;

            // Listeners dos checkboxes
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
                            atualizarStatusItemConvidado(donoId, listaId, itemKey, checkbox.checked);
                        });
                    }
                }
            }
        } else {
            detalhesListaDiv.innerHTML = "<p>Lista não encontrada.</p>";
        }
    } catch (error) {
        console.error("Erro ao exibir detalhes da lista:", error);
        detalhesListaDiv.innerHTML = "<p>Erro ao carregar detalhes da lista.</p>";
    }
}

// Lidar com a seleção da lista
const selectListasConvidado = document.getElementById("selectListasConvidado");
selectListasConvidado.addEventListener("change", (event) => {
    const convidadoId = auth.currentUser.uid;
    const value = event.target.value;

    if (value) {
        const [donoId, listaId] = value.split('/');
        exibirDetalhesListaConvidado(donoId, listaId, convidadoId);
    } else {
        document.getElementById("detalhesLista").innerHTML = "";
    }
});

// Carregar listas compartilhadas
onAuthStateChanged(auth, async (user) => {
    if (user) {
        const convidadoId = user.uid;
        const usuariosRef = ref(db, 'users');
        const snapshot = await get(usuariosRef);

        selectListasConvidado.innerHTML = "<option value=''>Selecione uma lista</option>";

        if (snapshot.exists()) {
            snapshot.forEach((userSnapshot) => {
                const donoId = userSnapshot.key;
                const listas = userSnapshot.val().listas;

                if (listas) {
                    for (const listaId in listas) {
                        const lista = listas[listaId];
                        const convidados = lista.convidados || {};

                        if (convidados.hasOwnProperty(convidadoId)) {
                            const option = document.createElement("option");
                            option.value = `${donoId}/${listaId}`;
                            option.textContent = lista.nome;
                            selectListasConvidado.appendChild(option);
                        }
                    }
                }
            });
        } else {
            selectListasConvidado.innerHTML = "<option>Nenhuma lista compartilhada</option>";
            document.getElementById("detalhesLista").innerHTML = "";
        }
    } else {
        alert("Você precisa estar logado.");
        window.location.href = "login.html";
    }
});
