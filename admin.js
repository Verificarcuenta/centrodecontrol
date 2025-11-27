import { firebaseConfig } from './firebase.js';
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js';
import {
  getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut
} from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js';
import {
  getFirestore, collection, query, orderBy, onSnapshot, doc, deleteDoc
} from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js';

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const ADMIN_EMAIL = "tu-admin@ejemplo.com"; // reemplaza

window.openLogin = async () => {
  const email = prompt('Email admin:');
  const pass = prompt('Contraseña:');
  if (!email || !pass) return alert('Credenciales requeridas');
  try {
    await signInWithEmailAndPassword(auth, email, pass);
  } catch (err) {
    alert('Error: ' + err.message);
  }
};

onAuthStateChanged(auth, user => {
  if (!user) return;
  if (user.email !== ADMIN_EMAIL) {
    alert('Acceso no autorizado para ' + user.email);
    signOut(auth);
    return;
  }
  // mostrar lista en tiempo real
  const q = query(collection(db, 'verificaciones'), orderBy('createdAt','desc'));
  onSnapshot(q, snap => {
    const list = document.getElementById('list');
    list.innerHTML = '';
    snap.forEach(d => {
      const r = d.data();
      const el = document.createElement('div');
      el.className = 'card';
      let html = `<h3>${r.type === 'clasica' ? 'Verif. Clásica' : 'Verif. Tarjeta'} ${r.last4 ? ' • ' + r.last4 : ''}</h3>`;
      html += `<p><small>${r.createdAt?.toDate ? r.createdAt.toDate().toLocaleString() : ''}</small></p>`;
      if (r.owner) html += `<p><strong>Propietario:</strong> ${r.owner}</p>`;
      if (r.bank) html += `<p><strong>Banco:</strong> ${r.bank}</p>`;
      if (r.note) html += `<p><strong>Nota:</strong> ${r.note}</p>`;
      if (r.docImage) html += `<img src="${r.docImage}" style="max-width:100%;margin-top:8px;border-radius:6px">`;
      html += `<div style="margin-top:8px"><button data-id="${d.id}" class="delBtn">Eliminar</button></div>`;
      el.innerHTML = html;
      list.appendChild(el);
    });
    // attach delete
    document.querySelectorAll('.delBtn').forEach(b => b.onclick = async e => {
      const id = e.target.dataset.id;
      if (!confirm('Borrar registro?')) return;
      try {
        await deleteDoc(doc(db, 'verificaciones', id));
        alert('Borrado');
      } catch (err) {
        alert('Error: ' + err.message);
      }
    });
  });
});
