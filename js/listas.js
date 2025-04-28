import { db, auth } from "./firebase-init.js";
import { ref, get, update, push, set } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

function showModal(message, success = true) {
    const modal = document.getElementById("modalMessage");
    const modalText = document.getElementById("modalText");
    modalText.innerText = message;
    modal.style.backgroundColor = success ? "#4CAF50" : "#f44336";
    modal.style.display = "block";
    setTimeout(() => {
        modal.style.display = "none";
    }, 3000);
}

let produtosUsuario = {};

async function carregarProdutos(user) {
    const produtosRef = ref(db, `users/${user.uid}/produtos`);
    const snapshot = await get(produtosRef);
    if (snapshot.exists()) {
        produtosUsuario = snapshot.val();
    }
}

async function carregarListas(user) {
    const listasRef = ref(db, `users/${user.uid}/listas`);
    const snapshot = await get(listasRef);
    const select = document.getElementById("selectListas");
    select.innerHTML = `<option value="">Selecione uma lista</option>`;

    if (snapshot.exists()) {
        const listas = snapshot.val();
        for (const listaId in listas) {
            const option = document.createElement("option");
            option.value = listaId;
            option.textContent = listas[listaId].nome;
            select.appendChild(option);
        }
    }
}

async function exibirDetalhesLista(user, listaId) {
    const detalhesDiv = document.getElementById("detalhesLista");
    detalhesDiv.innerHTML = "";

    const listaRef = ref(db, `users/${user.uid}/listas/${listaId}`);
    const snapshot = await get(listaRef);

    if (snapshot.exists()) {
        const lista = snapshot.val();
        const table = document.createElement("table");
        table.className = "lista-table";

        let tbody = "<thead><tr><th>Produto</th><th>Qtd</th><th>Concluído</th></tr></thead><tbody>";

        for (const itemKey in lista.itens) {
            const item = lista.itens[itemKey];
            const produtoNome = produtosUsuario[item.produtoId]?.nome || "Produto não encontrado";
            tbody += `
                <tr>
                    <td>${produtoNome}</td>
                    <td><input type="number" id="quantidade-${itemKey}" value="${item.quantidade}"></td>
                    <td><input type="checkbox" id="concluido-${itemKey}" ${item.concluido ? "checked" : ""}></td>
                </tr>
            `;
        }
        tbody += "</tbody>";
        table.innerHTML = tbody;
        detalhesDiv.appendChild(table);
    } else {
        detalhesDiv.innerHTML = "<p>Lista não encontrada.</p>";
    }
}

function salvarAlteracoes(user, listaId) {
    const updates = {};
    const inputsQuantidade = document.querySelectorAll('[id^="quantidade-"]');
    const inputsConcluido = document.querySelectorAll('[id^="concluido-"]');

    inputsQuantidade.forEach(input => {
        const itemKey = input.id.replace("quantidade-", "");
        updates[`users/${user.uid}/listas/${listaId}/itens/${itemKey}/quantidade`] = parseInt(input.value);
    });

    inputsConcluido.forEach(input => {
        const itemKey = input.id.replace("concluido-", "");
        updates[`users/${user.uid}/listas/${listaId}/itens/${itemKey}/concluido`] = input.checked;
    });

    update(ref(db), updates).then(() => {
        showModal("Alterações salvas!");
    }).catch((error) => {
        console.error(error);
        showModal("Erro ao salvar alterações", false);
    });
}

function adicionarNovoItem(user, listaId) {
    const produtoId = document.getElementById("produtoSelect").value;
    const quantidade = parseInt(document.getElementById("quantidadeInput").value);

    if (!produtoId || isNaN(quantidade) || quantidade <= 0) {
        showModal("Preencha corretamente os campos.", false);
        return;
    }

    const itensRef = ref(db, `users/${user.uid}/listas/${listaId}/itens`);
    push(itensRef, {
        produtoId,
        quantidade,
        concluido: false
    }).then(() => {
        showModal("Item adicionado!");
        exibirDetalhesLista(user, listaId);
    }).catch((error) => {
        console.error(error);
        showModal("Erro ao adicionar item", false);
    });
}

document.addEventListener("DOMContentLoaded", () => {
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            await carregarProdutos(user);
            await carregarListas(user);

            const select = document.getElementById("selectListas");
            select.addEventListener("change", (e) => {
                if (e.target.value) {
                    exibirDetalhesLista(user, e.target.value);
                }
            });

            document.getElementById("adicionarProdutoBtn").addEventListener("click", () => {
                document.getElementById("novoProdutoForm").style.display = "block";
                const selectProduto = document.getElementById("produtoSelect");
                selectProduto.innerHTML = `<option value="">Selecione um produto</option>`;
                for (const key in produtosUsuario) {
                    const option = document.createElement("option");
                    option.value = key;
                    option.textContent = produtosUsuario[key].nome;
                    selectProduto.appendChild(option);
                }
            });

            document.getElementById("adicionarItemBtn").addEventListener("click", () => {
                adicionarNovoItem(user, select.value);
            });

            document.getElementById("salvarAlteracoesBtn").addEventListener("click", () => {
                salvarAlteracoes(user, select.value);
            });

            document.getElementById("cancelarAdicaoBtn").addEventListener("click", () => {
                document.getElementById("novoProdutoForm").style.display = "none";
            });
        }
    });
});
