// users.js
// funcionalidades: carregar da API, listar, adicionar (com validação), remover, persistir em localStorage

const API_USERS = 'https://dummyjson.com/users';
const LS_USERS_KEY = 'df2_users_v1';

const userForm = document.getElementById('userForm');
const userListEl = document.getElementById('userList');
const refreshBtn = document.getElementById('refreshBtn');

let users = [];

async function fetchUsersFromAPI(){
  try{
    const res = await fetch(API_USERS);
    if(!res.ok) throw new Error('Falha ao carregar usuários da API');
    const data = await res.json();
    // API returns { users: [...] }
    return data.users || [];
  }catch(err){
    console.error(err);
    return [];
  }
}

function loadFromLocal(){
  const raw = localStorage.getItem(LS_USERS_KEY);
  if(raw){
    try{
      const parsed = JSON.parse(raw);
      if(Array.isArray(parsed)) return parsed;
    }catch(e){}
  }
  return null;
}

function persistLocal(){
  localStorage.setItem(LS_USERS_KEY, JSON.stringify(users));
}

function renderUsers(){
  userListEl.innerHTML = '';
  if(!users.length){
    userListEl.innerHTML = '<p class="small">Nenhum usuário disponível.</p>';
    return;
  }
  users.forEach((u, idx) => {
    const item = document.createElement('div');
    item.className = 'list-item';
    item.innerHTML = `
      <img src="${u.image || 'https://via.placeholder.com/80x80?text=User'}" alt="${u.firstName} ${u.lastName}" />
      <div class="item-info">
        <div><strong>${u.firstName} ${u.lastName}</strong></div>
        <div class="small">${u.email || 'sem email'} • ${u.age ? u.age + ' anos' : ''}</div>
      </div>
      <div class="item-actions">
        <button class="btn secondary" data-action="remove" data-idx="${idx}">Remover</button>
      </div>
    `;
    userListEl.appendChild(item);
  });
}

function addUserFromForm(e){
  e.preventDefault();
  const firstName = userForm.firstName.value.trim();
  const lastName = userForm.lastName.value.trim();
  const email = userForm.email.value.trim();
  const age = userForm.age.value.trim();
  const image = userForm.image.value.trim();

  // validações
  let ok = true;
  // clear previous errors
  [...userForm.querySelectorAll('.error')].forEach(n=>n.remove());

  if(!isValidText(firstName)){ showError(userForm.firstName, 'Nome: 3 a 50 caracteres'); ok=false } else clearError(userForm.firstName);
  if(!isValidText(lastName)){ showError(userForm.lastName, 'Sobrenome: 3 a 50 caracteres'); ok=false } else clearError(userForm.lastName);
  if(!isValidEmail(email)){ showError(userForm.email, 'Email inválido'); ok=false } else clearError(userForm.email);
  if(!isValidNumber(age)){ showError(userForm.age, 'Idade deve ser número >0 e <120'); ok=false } else clearError(userForm.age);
  if(image && !isValidURL(image)){ showError(userForm.image, 'URL inválida'); ok=false } else clearError(userForm.image);

  if(!ok) return;

  const newUser = {
    id: Date.now(),
    firstName, lastName, email, age: Number(age), image: image || ''
  };

  users.unshift(newUser); // adiciona no começo para aparecer primeiro
  persistLocal();
  renderUsers();
  userForm.reset();
}

function removeUser(idx){
  const removed = users.splice(idx,1);
  persistLocal();
  renderUsers();
}

async function init(){
  // tenta carregar do localStorage
  const local = loadFromLocal();
  if(local && local.length){
    users = local;
    renderUsers();
  } else {
    // carrega da API
    const apiUsers = await fetchUsersFromAPI();
    // mapeia para forma esperada
    users = (apiUsers || []).map(u => ({
      id: u.id || Date.now()+Math.random(),
      firstName: u.firstName || 'Nome',
      lastName: u.lastName || 'Sobrenome',
      email: u.email || '',
      age: u.age || '',
      image: u.image || u.avatar || ''
    }));
    persistLocal();
    renderUsers();
  }
}

userListEl.addEventListener('click', (ev) => {
  const btn = ev.target.closest('button[data-action="remove"]');
  if(!btn) return;
  const idx = Number(btn.dataset.idx);
  if(Number.isInteger(idx)) removeUser(idx);
});

userForm.addEventListener('submit', addUserFromForm);
refreshBtn.addEventListener('click', async () => {
  // busca direto da API e substitui (não sobrescreve local salvo se houver)
  const apiUsers = await fetchUsersFromAPI();
  const mapped = (apiUsers || []).map(u => ({
    id: u.id || Date.now()+Math.random(),
    firstName: u.firstName || 'Nome',
    lastName: u.lastName || 'Sobrenome',
    email: u.email || '',
    age: u.age || '',
    image: u.image || u.avatar || ''
  }));
  users = mapped;
  persistLocal();
  renderUsers();
});

init();
