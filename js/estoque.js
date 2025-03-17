import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

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

async function carregarProdutos() {
    const tabelaBody = document.querySelector(".estoque-table tbody");
    tabelaBody.innerHTML = "";

    const produtosRef = ref(db, 'produtos');
    const snapshot = await get(produtosRef);

    if (snapshot.exists()) {
        const produtos = snapshot.val();
        console.log("Dados recuperados:", produtos); // Adicionado para depuração

        for (const key in produtos) {
            const produto = produtos[key];
            console.log("Produto:", produto); // Adicionado para depuração

            const row = `
                <tr>
                    <td>${produto.nome}</td>
                    <td>${produto.estoque_inicial}</td>
                </tr>
            `;
            tabelaBody.innerHTML += row;
        }
    } else {
        console.log("Nenhum dado encontrado."); // Adicionado para depuração
        tabelaBody.innerHTML = "<tr><td colspan='2'>Nenhum produto cadastrado.</td></tr>";
    }
}

// Chama a função ao carregar a página
document.addEventListener("DOMContentLoaded", carregarProdutos);