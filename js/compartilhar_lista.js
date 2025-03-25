import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getDatabase, ref, get, set } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

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

document.addEventListener("DOMContentLoaded", () => {
    const emailConvidadoInput = document.getElementById("email_convidado");
    const selecionarListaSelect = document.getElementById("selecionar_lista");
    const btnCompartilhar = document.getElementById("btn_compartilhar");

    // Função para carregar as listas do usuário
    const carregarListas = async (userId) => {
        const listasRef = ref(db, `users/${userId}/listas`);
        const snapshot = await get(listasRef);

        if (snapshot.exists()) {
            selecionarListaSelect.innerHTML = "<option value=''>Selecione uma lista</option>"; // Limpa as opções existentes

            const listas = snapshot.val(); // Obtém o valor do snapshot como um objeto

            if (listas) {
                for (const listaId in listas) {
                    if (listas.hasOwnProperty(listaId)) {
                        const lista = listas[listaId];
                        const listaNome = lista.nome; // Assume que o nome da lista é 'nome'
                        const option = document.createElement("option");
                        option.value = listaId;
                        option.textContent = listaNome;
                        selecionarListaSelect.appendChild(option);
                    }
                }
            }
        } else {
            console.log("Nenhuma lista encontrada para o usuário.");
        }
    };

    // Autenticação e carregamento das listas
    onAuthStateChanged(auth, (user) => {
        if (user) {
            carregarListas(user.uid);

            // Evento de clique do botão "Compartilhar"
            btnCompartilhar.addEventListener("click", () => {
                const emailConvidado = emailConvidadoInput.value;
                const listaId = selecionarListaSelect.value;

                if (emailConvidado && listaId) {
                    compartilharLista(listaId, emailConvidado, user.uid);
                } else {
                    alert("Por favor, preencha o email do convidado e selecione uma lista.");
                }
            });
        } else {
            console.log("Usuário não está logado.");
            alert("Você precisa estar logado para compartilhar listas.");
            window.location.href = "login.html"; // Redireciona para a página de login
        }
    });

    // Função para compartilhar a lista
    const compartilharLista = async (listaId, emailConvidado, donoId) => {
        try {
            // 1. Encontrar o userId do convidado pelo email
            const usuariosRef = ref(db, 'users');
            const snapshot = await get(usuariosRef);
            let convidadoId = null;
            snapshot.forEach((childSnapshot) => {
                if (childSnapshot.val().email === emailConvidado) {
                    convidadoId = childSnapshot.key;
                }
            });

            if (!convidadoId) {
                alert("Usuário com este email não encontrado.");
                return;
            }

            // 2. Adicionar a lista em listas_compartilhadas
            const listaCompartilhadaRef = ref(db, `listas_compartilhadas/${listaId}/convidados/${convidadoId}`);
            await set(listaCompartilhadaRef, true); // Ou você pode armazenar mais detalhes aqui

            // Adicionar o dono também, caso não exista
            const listaCompartilhadaDonoRef = ref(db, `listas_compartilhadas/${listaId}/dono_id`);
            await set(listaCompartilhadaDonoRef, donoId);

            // 3. Adicionar a lista em convidados
            const convidadoListaRef = ref(db, `convidados/${convidadoId}/listas_compartilhadas/${listaId}`);
            await set(convidadoListaRef, true);

            alert("Lista compartilhada com sucesso!");
            emailConvidadoInput.value = "";
            selecionarListaSelect.value = "";

        } catch (error) {
            console.error("Erro ao compartilhar lista:", error);
            alert("Erro ao compartilhar lista: " + error.message);
        }
    };
});