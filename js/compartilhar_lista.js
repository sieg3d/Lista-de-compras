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

const app  = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db   = getDatabase(app);

document.addEventListener("DOMContentLoaded", () => {
  const emailInput    = document.getElementById("email_convidado");
  const listaSelect   = document.getElementById("selecionar_lista");
  const btnCompart    = document.getElementById("btn_compartilhar");
  const nomeUsuarioEl = document.getElementById("nome-usuario-nav");

  // Carrega as listas do usuário logado
  async function carregarListas(uid) {
    const snap = await get(ref(db, `users/${uid}/listas`));
    listaSelect.innerHTML = "<option value=''>Selecione uma lista</option>";
    if (snap.exists()) {
      Object.entries(snap.val()).forEach(([id, lista]) => {
        const opt = document.createElement("option");
        opt.value       = id;
        opt.textContent = lista.nome;
        listaSelect.appendChild(opt);
      });
    }
  }

  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      alert("Você precisa estar logado.");
      return window.location.href = "login.html";
    }

    // 1) Atualiza índice emailToUid
    const emailKey = user.email.trim().toLowerCase().replace(/\./g, ",");
    await set(ref(db, `emailToUid/${emailKey}`), user.uid);

    // 2) Exibe nome no nav
    const nomeSnap = await get(ref(db, `users/${user.uid}/nome`));
    nomeUsuarioEl.textContent = nomeSnap.exists() ? nomeSnap.val() : "Usuário";

    // 3) Carrega listas e configura botão de compartilhar
    await carregarListas(user.uid);

    btnCompart.addEventListener("click", async () => {
      const rawEmail = emailInput.value.trim().toLowerCase();
      const listaId  = listaSelect.value;

      if (!rawEmail || !listaId) {
        alert("Preencha o e-mail e selecione uma lista.");
        return;
      }

      try {
        // busca UID do convidado no índice
        const guestKey = rawEmail.replace(/\./g, ",");
        const guestSnap = await get(ref(db, `emailToUid/${guestKey}`));
        if (!guestSnap.exists()) {
          alert("Usuário com esse e-mail não foi encontrado.");
          return;
        }
        const convidadoId = guestSnap.val();

        // 4) Grava convite no nó do dono
        await set(
          ref(db, `users/${user.uid}/listas/${listaId}/convidados/${convidadoId}`),
          true
        );
        // 5) Atualiza índice de compartilhamentos para o convidado
        await set(
          ref(db, `sharedListsForUser/${convidadoId}/${user.uid}/${listaId}`),
          true
        );

        alert("Lista compartilhada com sucesso!");
        emailInput.value  = "";
        listaSelect.value = "";

      } catch (err) {
        console.error("Erro ao compartilhar lista:", err);
        alert("Erro ao compartilhar lista: " + err.message);
      }
    });
  });
});

// Função para togglar menu mobile
function menu() {
  const x = document.getElementById("myLinks");
  x.style.display = x.style.display === "block" ? "none" : "block";
}
