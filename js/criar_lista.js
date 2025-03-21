import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getDatabase, ref, get, push, set } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

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

let produtosUsuario = {}; // Objeto para armazenar os produtos do usuário

// Função para carregar os produtos do usuário
function carregarProdutosUsuario(user) {
    if (user) {
        const uid = user.uid;
        const produtosRef = ref(db, `users/${uid}/produtos`);
        get(produtosRef)
            .then((snapshot) => {
                if (snapshot.exists()) {
                    produtosUsuario = snapshot.val();
                    popularSelectProdutos();
                } else {
                    console.log("Nenhum produto cadastrado para este usuário.");
                }
            })
            .catch((error) => {
                console.error("Erro ao carregar produtos do usuário:", error);
            });
    } else {
        console.log("Nenhum usuário logado.");
    }
}

// Função para popular o select com os produtos do usuário
function popularSelectProdutos() {
    const selectProduto = document.createElement("select");
    selectProduto.classList.add("select-produto");

    const optionDefault = document.createElement("option");
    optionDefault.value = "";
    optionDefault.textContent = "Selecionar Produto";
    selectProduto.appendChild(optionDefault);

    for (const key in produtosUsuario) {
        const produto = produtosUsuario[key];
        const option = document.createElement("option");
        option.value = key;
        option.textContent = produto.nome;
        selectProduto.appendChild(option);
    }
    return selectProduto;
}

// Função para adicionar um novo item à tabela com validações
function adicionarItemTabela() {
    const tabelaBody = document.querySelector(".lista-table tbody");
    const lastRow = tabelaBody.lastElementChild;

    if (lastRow) {
        const lastSelect = lastRow.querySelector(".select-produto");
        if (!lastSelect || !lastSelect.value) {
            alert("Por favor, selecione um produto para o item anterior antes de adicionar outro.");
            return;
        }
    }

    const newRow = document.createElement("tr");

    const tdProduto = document.createElement("td");
    tdProduto.classList.add("item-column");
    const selectProduto = popularSelectProdutos();
    tdProduto.appendChild(selectProduto);

    const tdQuantidade = document.createElement("td");
    tdQuantidade.classList.add("quantidade-column");
    const inputQuantidade = document.createElement("input");
    inputQuantidade.type = "number";
    inputQuantidade.value = 1;
    inputQuantidade.min = 1;
    tdQuantidade.appendChild(inputQuantidade);

    const tdAcoes = document.createElement("td");
    const btnRemover = document.createElement("button");
    btnRemover.classList.add("btn-remover");

    const imgRemover = document.createElement("img");
    imgRemover.src = "Imagens/lixo.png";
    imgRemover.alt = "Remover";
    imgRemover.style.width = "20px";
    imgRemover.style.height = "20px";

    btnRemover.appendChild(imgRemover);

    btnRemover.addEventListener("click", () => {
        newRow.remove();
    });
    tdAcoes.appendChild(btnRemover);

    newRow.appendChild(tdProduto);
    newRow.appendChild(tdQuantidade);
    newRow.appendChild(tdAcoes);
    tabelaBody.appendChild(newRow);
}

// Função para salvar a lista no Firebase com a data concatenada ao nome
function salvarLista(user) {
    const nomeLista = document.getElementById("nome_lista").value.trim();

    if (!nomeLista) {
        alert("Por favor, insira um nome para a lista.");
        return;
    }

    const tabelaRows = document.querySelectorAll(".lista-table tbody tr");

    if (tabelaRows.length === 0) {
        alert("A lista não pode estar vazia.");
        return;
    }

    const itensLista = [];
    let algumItemEmBranco = false;

    tabelaRows.forEach(row => {
        const selectProduto = row.querySelector(".select-produto");
        const inputQuantidade = row.querySelector("input[type='number']");
        if (selectProduto && inputQuantidade) {
            const produtoId = selectProduto.value;
            const quantidade = parseInt(inputQuantidade.value);
            if (!produtoId) {
                alert("Por favor, selecione um produto para todos os itens da lista.");
                algumItemEmBranco = true;
                return;
            }
            itensLista.push({
                produtoId: produtoId,
                quantidade: quantidade
            });
        }
    });

    if (algumItemEmBranco) {
        return;
    }

    if (user) {
        const uid = user.uid;
        const listasRef = ref(db, `users/${uid}/listas`);
        
        const dataAtual = new Date();
        const dataFormatada = dataAtual.toLocaleDateString("pt-BR");
        const nomeListaComData = `${nomeLista} - ${dataFormatada}`;

        const novaListaRef = push(listasRef);
        set(novaListaRef, {
            nome: nomeListaComData,
            itens: itensLista,
            data_criacao: dataAtual.toISOString()
        })
        .then(() => {
            alert("Lista salva com sucesso!");
            window.location.href = "index.html";
        })
        .catch((error) => {
            console.error("Erro ao salvar lista:", error);
            alert("Erro ao salvar lista: " + error.message);
        });
    } else {
        console.log("Nenhum usuário logado.");
        alert("Você precisa estar logado para salvar a lista.");
    }
}

// Event listeners
document.addEventListener("DOMContentLoaded", () => {
    onAuthStateChanged(auth, (user) => {
        carregarProdutosUsuario(user);
    });

    document.getElementById("adicionar-item").addEventListener("click", adicionarItemTabela);
    document.getElementById("salvar-lista").addEventListener("click", () => {
        salvarLista(auth.currentUser);
    });
});
