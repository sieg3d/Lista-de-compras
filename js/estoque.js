import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

// Configuração do Firebase
/*const firebaseConfig = {
  apiKey: "AIzaSyA8cXYQ4m-uyEjbJJF_1_4Re8RJvqo1DWE",
  authDomain: "dlopes-lasalle-2025.firebaseapp.com",
  projectId: "dlopes-lasalle-2025",
  storageBucket: "dlopes-lasalle-2025.appspot.com",
  messagingSenderId: "91491434656",
  appId: "1:91491434656:web:8a083bf3df35b5e18949c5",
};*/
const firebaseConfig = {
    apiKey: "AIzaSyAlgaQN8Oq7tsS6UhymWriTzTga1qmg-ZI",
    authDomain: "rlb-lasalle-firebase.firebaseapp.com",
    databaseURL: "https://rlb-lasalle-firebase-default-rtdb.firebaseio.com",
    projectId: "rlb-lasalle-firebase",
    storageBucket: "rlb-lasalle-firebase.firebasestorage.app",
    messagingSenderId: "488497251520",
    appId: "1:488497251520:web:32e3bf3f71040ef1c69925",
    measurementId: "G-DMLGRWXSP9"
  };

// Inicializa Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);

function carregarProdutos(user) {
    const tabelaBody = document.querySelector(".estoque-table tbody");
    tabelaBody.innerHTML = "";

    if (user) {
        const uid = user.uid;
        const produtosRef = ref(db, `users/${uid}/produtos`);
        get(produtosRef)
            .then((snapshot) => {
                if (snapshot.exists()) {
                    const produtos = snapshot.val();
                    console.log("Dados recuperados:", produtos);

                    for (const key in produtos) {
                        const produto = produtos[key];
                        console.log("Produto:", produto);

                        const row = `
                            <tr>
                                <td>${produto.nome}</td>
                                <td>${produto.estoque_inicial}</td>
                            </tr>
                        `;
                        tabelaBody.innerHTML += row;
                    }
                } else {
                    console.log("Nenhum dado encontrado para este usuário.");
                    tabelaBody.innerHTML = "<tr><td colspan='2'>Nenhum produto cadastrado.</td></tr>";
                }
            })
            .catch((error) => {
                console.error("Erro ao carregar produtos:", error);
                tabelaBody.innerHTML = "<tr><td colspan='2'>Erro ao carregar produtos.</td></tr>";
            });
    } else {
        console.log("Nenhum usuário logado.");
        tabelaBody.innerHTML = "<tr><td colspan='2'>Você precisa estar logado para ver o estoque.</td></tr>";
    }
}

document.getElementById("btn_estoque").addEventListener("click",() => {
    onAuthStateChanged(auth, (user) => {
        carregarProdutos(user);
    });
});