import { db, auth } from './firebase-init.js';
import { ref, get, push, set } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js';

let currentListaId = '';

// Carrega todas as listas do usuário no select
async function carregarListas(user) {
  const snap = await get(ref(db, `users/${user.uid}/listas`));
  const select = document.getElementById('selectListas');
  select.innerHTML = '<option value="">-- Escolha uma lista --</option>';
  if (snap.exists()) {
    Object.entries(snap.val()).forEach(([id, data]) => {
      const opt = document.createElement('option');
      opt.value = id;
      opt.textContent = data.nome;
      select.appendChild(opt);
    });
  }
}

// Realiza a cópia da lista, só se for em outro dia
async function copiarLista(user) {
  if (!currentListaId) return;
  const listaSnap = await get(ref(db, `users/${user.uid}/listas/${currentListaId}`));
  if (!listaSnap.exists()) {
    alert('Lista não encontrada.');
    return;
  }
  const lista = listaSnap.val();
  const dataOrigem = new Date(lista.data_criacao);
  const hoje = new Date();

  if (hoje.toDateString() === dataOrigem.toDateString()) {
    alert('Não é possível copiar a lista no mesmo dia de criação.');
    return;
  }

  // Cria novo nome com data atual
  const baseName = lista.nome.split(' - ')[0];
  const novaData = hoje.toLocaleDateString('pt-BR');
  const novoNome = `${baseName} - ${novaData}`;

  // Insere cópia no banco
  const newRef = push(ref(db, `users/${user.uid}/listas`));
  await set(newRef, {
    nome: novoNome,
    itens: lista.itens,
    data_criacao: hoje.toISOString()
  });

  alert('Lista copiada com sucesso!');
  await carregarListas(user);
}

// Inicialização após autenticação
onAuthStateChanged(auth, async (user) => {
  if (!user) return;
  await carregarListas(user);

  const select = document.getElementById('selectListas');
  const btn = document.getElementById('copiarListaBtn');

  select.addEventListener('change', () => {
    currentListaId = select.value;
    btn.style.display = currentListaId ? 'block' : 'none';
  });

  btn.addEventListener('click', () => copiarLista(user));
});