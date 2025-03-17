import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, push, set } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

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

// Função para cadastrar um produto no Realtime Database
async function cadastrarProduto(nome, categoria, estoqueInicial, estoqueMinimo) {
    try {
        const produtosRef = ref(db, 'produtos');
        const novoProdutoRef = push(produtosRef);
        await set(novoProdutoRef, {
            nome: nome,
            categoria: categoria,
            estoque_inicial: estoqueInicial,
            estoque_minimo: estoqueMinimo,
            data_cadastro: new Date().toISOString()
        });

        console.log("Produto cadastrado com ID:", novoProdutoRef.key);
        alert("Produto cadastrado com sucesso!");
        document.getElementById("produtoForm").reset(); // Limpa o formulário
    } catch (error) {
        console.error("Erro ao cadastrar produto:", error);
        alert("Erro ao cadastrar produto: " + error.message);
    }
}

// Evento de envio do formulário
document.addEventListener("DOMContentLoaded", () => {
    const formProduto = document.getElementById("produtoForm");

    if (formProduto) {
        formProduto.addEventListener("submit", (e) => {
            e.preventDefault();

            const nome = document.getElementById("nome_produto").value;
            const categoria = document.getElementById("categoria").value;
            const estoqueInicial = parseInt(document.getElementById("estoque_inicial").value);
            const estoqueMinimo = parseInt(document.getElementById("estoque_minimo").value);

            cadastrarProduto(nome, categoria, estoqueInicial, estoqueMinimo);
        });
    } else {
        console.error("Formulário de produto não encontrado!");
    }
});