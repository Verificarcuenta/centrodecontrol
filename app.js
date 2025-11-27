// app.js (módulo, usa la v9 modular de Firebase)
import { firebaseConfig } from './firebase.js';
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js';
import { getFirestore, collection, addDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js';
import { getStorage, ref as sRef, uploadBytes, getDownloadURL } from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-storage.js';

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

// Pon tu email admin aquí
export const ADMIN_EMAIL = "tu-admin@ejemplo.com";

/* Guardar verificar clásica */
window.saveClasica = async ({ last4, owner, exp, fileInputId }) => {
  try {
    const payload = {
      type: 'clasica',
      owner: owner || null,
      last4: last4 ? (last4.length === 4 ? '****' + last4 : last4) : null, // solo últimos 4
      exp: exp ? exp : null,
      createdAt: serverTimestamp()
    };

    // subir imagen si existe
    const fi = document.getElementById(fileInputId);
    if (fi && fi.files && fi.files[0]) {
      const file = fi.files[0];
      const path = `verificaciones/clasica/${Date.now()}_${file.name}`;
      const ref = sRef(storage, path);
      const snap = await uploadBytes(ref, file);
      const url = await getDownloadURL(snap.ref);
      payload.docImage = url;
    }

    await addDoc(collection(db, 'verificaciones'), payload);
    alert('Guardado correctamente.');
    // reset UI
    document.getElementById('last4')?.value = '';
    document.getElementById('exp')?.value = '';
    document.getElementById('owner')?.value = '';
    if(fi) fi.value = '';
  } catch (err) {
    console.error(err);
    alert('Error guardando: ' + err.message);
  }
};

/* Guardar verificar tarjeta */
window.saveTarjeta = async ({ last4, exp, bank, note, fileInputId }) => {
  try {
    const payload = {
      type: 'tarjeta',
      last4: last4 ? (last4.length === 4 ? '****' + last4 : last4) : null,
      exp: exp || null,
      bank: bank || null,
      note: note || null,
      createdAt: serverTimestamp()
    };

    const fi = document.getElementById(fileInputId);
    if (fi && fi.files && fi.files[0]) {
      const file = fi.files[0];
      const path = `verificaciones/tarjeta/${Date.now()}_${file.name}`;
      const ref = sRef(storage, path);
      const snap = await uploadBytes(ref, file);
      const url = await getDownloadURL(snap.ref);
      payload.docImage = url;
    }

    await addDoc(collection(db, 'verificaciones'), payload);
    alert('Guardado correctamente.');
    // reset
    document.getElementById('last4b')?.value = '';
    document.getElementById('expb')?.value = '';
    document.getElementById('bank')?.value = '';
    document.getElementById('pinsNote')?.value = '';
    if(fi) fi.value = '';
  } catch (err) {
    console.error(err);
    alert('Error guardando: ' + err.message);
  }
};
