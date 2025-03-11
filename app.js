import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyA8cXYQ4m-uyEjbJJF_1_4Re8RJvqo1DWE",
  authDomain: "dlopes-lasalle-2025.firebaseapp.com",
  databaseURL: "https://dlopes-lasalle-2025-default-rtdb.firebaseio.com",
  projectId: "dlopes-lasalle-2025",
  storageBucket: "dlopes-lasalle-2025.firebasestorage.app",
  messagingSenderId: "91491434656",
  appId: "1:91491434656:web:8a083bf3df35b5e18949c5",
  measurementId: "G-4P41CL22QK"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Função para cadastrar um novo usuário
function cadastrar(email, senha) {
  createUserWithEmailAndPassword(auth, email, senha)
    .then((userCredential) => {
      console.log("Usuário cadastrado:", userCredential.user);
      alert("Cadastro realizado com sucesso!");
    })
    .catch((error) => {
      console.error("Erro no cadastro:", error.message);
      alert("Erro: " + error.message);
    });
}

// Função para fazer login
function login(email, senha) {
  signInWithEmailAndPassword(auth, email, senha)
    .then((userCredential) => {
      console.log("Usuário logado:", userCredential.user);
      alert("Login realizado com sucesso!");
      // Redirecionar para a página inicial (index.html)
      window.location.href = 'index.html';
    })
    .catch((error) => {
      console.error("Erro no login:", error.message);
      alert("Erro: " + error.message);
    });
}

// Função para logout
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

document.addEventListener('DOMContentLoaded', () => {
    // Agora o DOM está completamente carregado e podemos acessar os elementos
    const formCadastro = document.getElementById("formCadastro");
    const formLogin = document.getElementById("formLogin");
    const btnLogout = document.getElementById("btnLogout");

    // Verificar se o formulário de cadastro existe no DOM
    if (formCadastro) {
        formCadastro.addEventListener("submit", (e) => {
            e.preventDefault(); // Evita recarregar a página
            const email = document.getElementById("emailCadastro").value;
            const senha = document.getElementById("senhaCadastro").value;
            cadastrar(email, senha);
        });
    } else {
        console.error("Formulário de cadastro não encontrado!");
    }

    // Verificar se o formulário de login existe no DOM
    if (formLogin) {
        formLogin.addEventListener("submit", (e) => {
            e.preventDefault(); // Evita recarregar a página
            const email = document.getElementById("emailLogin").value;
            const senha = document.getElementById("senhaLogin").value;
            login(email, senha);
        });
    } else {
        console.error("Formulário de login não encontrado!");
    }

    // Verificar se o botão de logout existe no DOM
    if (btnLogout) {
        btnLogout.addEventListener("click", () => {
            logout();
        });
    } else {
        console.error("Botão de logout não encontrado!");
    }
});