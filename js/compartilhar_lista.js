import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getDatabase, ref, get, set } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

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

    const carregarListas = async (userId) => {
        const listasRef = ref(db, `users/${userId}/listas`);
        const snapshot = await get(listasRef);

        if (snapshot.exists()) {
            selecionarListaSelect.innerHTML = "<option value=''>Selecione uma lista</option>";
            const listas = snapshot.val();

            for (const listaId in listas) {
                const lista = listas[listaId];
                const option = document.createElement("option");
                option.value = listaId;
                option.textContent = lista.nome;
                selecionarListaSelect.appendChild(option);
            }
        }
    };

    onAuthStateChanged(auth, (user) => {
        if (user) {
            carregarListas(user.uid);

            btnCompartilhar.addEventListener("click", async () => {
                const emailConvidado = emailConvidadoInput.value.trim().toLowerCase();
                const listaId = selecionarListaSelect.value;

                if (!emailConvidado || !listaId) {
                    alert("Preencha o e-mail e selecione uma lista.");
                    return;
                }

                try {
                    // Buscar todos usuários para achar o convidado pelo email
                    const usersRef = ref(db, 'users');
                    const snapshot = await get(usersRef);

                    if (!snapshot.exists()) {
                        throw new Error("Nenhum usuário encontrado no banco.");
                    }

                    let convidadoId = null;
                    snapshot.forEach((child) => {
                        const userData = child.val();
                        if (userData?.email?.toLowerCase() === emailConvidado) {
                            convidadoId = child.key;
                        }
                    });

                    if (!convidadoId) {
                        alert("Usuário com esse e-mail não foi encontrado.");
                        return;
                    }

                    const convidadoRef = ref(db, `users/${user.uid}/listas/${listaId}/convidados/${convidadoId}`);
                    await set(convidadoRef, true);

                    alert("Lista compartilhada com sucesso!");
                    emailConvidadoInput.value = "";
                    selecionarListaSelect.value = "";

                } catch (error) {
                    console.error("Erro completo:", error);
                    console.error("Mensagem do erro:", error?.message || error);
                    alert("Erro ao compartilhar lista: " + (error?.message || error));
                }
            });
        } else {
            alert("Você precisa estar logado.");
            window.location.href = "login.html";
        }
    });
});
