// Importações do Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getDatabase, ref, push, get, set } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

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
const auth = getAuth(app);
const db = getDatabase(app);

// ===============================
// AUTENTICAÇÃO (Cadastro, Login, Logout)
// ===============================

// Cadastrar Usuário
function cadastrar(email, senha, nome) { 
    createUserWithEmailAndPassword(auth, email, senha)
        .then((userCredential) => {
            console.log("Usuário cadastrado:", userCredential.user);
            // Salvar o nome do usuário no Realtime Database
            const userRef = ref(db, 'users/' + userCredential.user.uid);
            set(userRef, {
                nome: nome,
                email: email 
            }).then(() => {
                alert("Cadastro realizado com sucesso!");
            }).catch((error) => {
                console.error("Erro ao salvar nome do usuário:", error.message);
                alert("Erro ao salvar nome: " + error.message);
            });
        })
        .catch((error) => {
            console.error("Erro no cadastro:", error.message);
            alert("Erro: " + error.message);
        });
}

// Login de Usuário
function login(email, senha) {
    signInWithEmailAndPassword(auth, email, senha)
        .then((userCredential) => {
            console.log("Usuário logado:", userCredential.user);
            // Buscar o nome do usuário no Realtime Database
            const userRef = ref(db, 'users/' + userCredential.user.uid);
            get(userRef).then((snapshot) => {
                if (snapshot.exists()) {
                    const userData = snapshot.val();
                    const nomeUsuario = userData.nome;
                    localStorage.setItem("nomeUsuario", nomeUsuario); // Salva no localStorage
                    alert("Login realizado com sucesso!");
                    window.location.href = 'index.html'; // Redireciona após login
                } else {
                    console.error("Nome de usuário não encontrado.");
                    alert("Erro: Nome de usuário não encontrado.");
                }
            }).catch((error) => {
                console.error("Erro ao buscar nome do usuário:", error.message);
                alert("Erro ao buscar nome: " + error.message);
            });
        })
        .catch((error) => {
            console.error("Erro no login:", error.message);
            alert("Usuário ou senha inválidos");
        });
}

// Logout de Usuário
function logout() {
    signOut(auth)
        .then(() => {
            console.log("Usuário deslogado");
            alert("Logout realizado com sucesso!");
        })
        .catch((error) => {
            console.error("Erro no logout:", error.message);
        });
}

// ===============================
// 📌 REALTIME DATABASE (Cadastro e Listagem de Produtos)
// ===============================

// Cadastrar Produto no Realtime Database
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
        document.getElementById("produtoForm").reset();
    } catch (error) {
        console.error("Erro ao cadastrar produto:", error);
        alert("Erro ao cadastrar produto: " + error.message);
    }
}

// Listar Produtos do Realtime Database
async function listarProdutos() {
    const produtosRef = ref(db, 'produtos');
    const snapshot = await get(produtosRef);
    if (snapshot.exists()) {
        console.log(snapshot.val());
    } else {
        console.log("Nenhum dado disponível");
    }
}



// ===============================
// 📌 EVENTOS DO DOM
// ===============================
document.addEventListener("DOMContentLoaded", () => {
// Formulário de Cadastro de Usuário
const formCadastro = document.getElementById("formCadastro");
if (formCadastro) {
    formCadastro.addEventListener("submit", (e) => {
        e.preventDefault();
        const email = document.getElementById("emailCadastro").value;
        const senha = document.getElementById("senhaCadastro").value;
        const nome = document.getElementById("nomeCadastro").value; 
        cadastrar(email, senha, nome); // Passe o nome para a função cadastrar
    });
}

    // Formulário de Login
    const formLogin = document.getElementById("formLogin");
    if (formLogin) {
        formLogin.addEventListener("submit", (e) => {
            e.preventDefault();
            const email = document.getElementById("emailLogin").value;
            const senha = document.getElementById("senhaLogin").value;
            login(email, senha);
        });
    }

    // Botão de Logout
    const btnLogout = document.getElementById("btnLogout");
    if (btnLogout) {
        btnLogout.addEventListener("click", () => {
            logout();
        });
    }

    // Formulário de Cadastro de Produto
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
    }
});