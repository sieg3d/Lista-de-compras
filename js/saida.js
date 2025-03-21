import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getDatabase, ref, get, update } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

// Configuração do Firebase (substitua com sua configuração real)
const firebaseConfig = {
    apiKey: "AIzaSyA8cXYQ4m-uyEjbJJF_1_4Re8RJvqo1DWE",
    authDomain: "dlopes-lasalle-2025.firebaseapp.com",
    projectId: "dlopes-lasalle-2025",
    storageBucket: "dlopes-lasalle-2025.appspot.com",
    messagingSenderId: "91491434656",
    appId: "1:91491434656:web:8a083bf3df35b5e18949c5",
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);

// Função para carregar os produtos do Firebase e popular o elemento select
function carregarProdutos(usuario) {
    const selectProduto = document.getElementById("produto");

    if (usuario) {
        const uid = usuario.uid;
        const produtosRef = ref(db, `users/${uid}/produtos`);

        get(produtosRef)
            .then((snapshot) => {
                if (snapshot.exists()) {
                    const produtos = snapshot.val();
                    for (const key in produtos) {
                        const option = document.createElement("option");
                        option.value = key;
                        option.textContent = produtos[key].nome;
                        selectProduto.appendChild(option);
                    }

                    // Adiciona o event listener para o select
                    selectProduto.addEventListener("change", () => {
                        const produtoId = selectProduto.value;
                        exibirQuantidadeDisponivel(usuario, produtoId);
                    });

                    // Exibe a quantidade do primeiro produto ao carregar
                    if (selectProduto.value) {
                        exibirQuantidadeDisponivel(usuario, selectProduto.value);
                    }

                } else {
                    console.log("Nenhum produto encontrado para este usuário.");
                    selectProduto.innerHTML = "<option value=''>Nenhum produto encontrado</option>";
                }
            })
            .catch((erro) => {
                console.error("Erro ao carregar produtos:", erro);
                selectProduto.innerHTML = "<option value=''>Erro ao carregar produtos</option>";
            });
    } else {
        console.log("Nenhum usuário logado.");
        window.location.href = "login.html";
    }
}

function exibirQuantidadeDisponivel(usuario, produtoId) {
    if (usuario && produtoId) {
        const uid = usuario.uid;
        const produtoRef = ref(db, `users/${uid}/produtos/${produtoId}`);
        const disponivelElement = document.getElementById("disponivel");

        get(produtoRef)
            .then((snapshot) => {
                if (snapshot.exists()) {
                    const produto = snapshot.val();
                    const estoqueAtual = produto.estoque_inicial || 0;
                    disponivelElement.textContent = `Disponível: ${estoqueAtual}`;
                } else {
                    disponivelElement.textContent = "Disponível: 0";
                }
            })
            .catch((erro) => {
                console.error("Erro ao buscar detalhes do produto:", erro);
                disponivelElement.textContent = "Disponível: Erro ao carregar";
            });
    } else {
        document.getElementById("disponivel").textContent = "Disponível: 0";
    }
}

// Função para lidar com o registro de saída
function registrarSaida(usuario, produtoId, quantidade) {
    if (usuario) {
        const uid = usuario.uid;
        const produtoRef = ref(db, `users/${uid}/produtos/${produtoId}`);

        // Obtém o estoque atual
        get(produtoRef)
            .then((snapshot) => {
                if (snapshot.exists()) {
                    const produto = snapshot.val();
                    const estoqueAtual = produto.estoque_inicial || 0; // Padrão para 0 se indefinido
                    const novoEstoque = estoqueAtual - quantidade;

                    if (novoEstoque >= 0) {
                        // Atualiza o estoque
                        update(produtoRef, {
                            estoque_inicial: novoEstoque,
                        })
                            .then(() => {
                                alert("Saída registrada com sucesso!");
                                document.getElementById("saidaForm").reset(); // Limpa o formulário
                                 // Atualiza a quantidade disponível exibida
                                 const produtoId = document.getElementById("produto").value;
                                 exibirQuantidadeDisponivel(usuario, produtoId);
                            })
                            .catch((erro) => {
                                console.error("Erro ao atualizar o estoque:", erro);
                                alert("Erro ao atualizar o estoque.");
                            });
                    } else {
                        alert("Quantidade insuficiente em estoque.");
                    }
                } else {
                    alert("Produto não encontrado.");
                }
            })
            .catch((erro) => {
                console.error("Erro ao buscar detalhes do produto:", erro);
                alert("Erro ao buscar detalhes do produto.");
            });
    } else {
        console.log("Nenhum usuário logado.");
        window.location.href = "login.html"; // Redireciona para o login se não houver usuário
    }
}

// Listeners de eventos
document.addEventListener("DOMContentLoaded", () => {
    onAuthStateChanged(auth, (usuario) => {
        if (usuario) {
            carregarProdutos(usuario); // Carrega os produtos ao carregar a página
        } else {
            window.location.href = "login.html"; // Redireciona para o login se não houver usuário
        }
    });

    const saidaForm = document.getElementById("saidaForm");
    saidaForm.addEventListener("submit", (e) => {
        e.preventDefault();

        const produtoId = document.getElementById("produto").value;
        const quantidade = parseInt(document.getElementById("quantidade").value);

        if (produtoId && quantidade > 0) {
            registrarSaida(auth.currentUser, produtoId, quantidade);
        } else {
            alert("Por favor, selecione um produto e insira uma quantidade válida.");
        }
    });
});