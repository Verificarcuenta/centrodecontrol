// app.js
import { db, storage } from "./firebase.js";
import { collection, addDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js";

const form = document.getElementById("formVerificacion");
if (!form) {
  // si la página no tiene el form, no hacer nada
  console.warn("No se encontró formVerificacion en la página.");
} else {

  // Intentar obtener localización inmediatamente
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        document.getElementById("latitud").value = lat;
        document.getElementById("longitud").value = lng;
      },
      (err) => {
        console.warn("Geolocalización denegada o fallida:", err.message);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }

  // función auxiliar para subir imagen
  async function subirImagen(archivo, ruta) {
    const storageRef = ref(storage, ruta);
    await uploadBytes(storageRef, archivo);
    return await getDownloadURL(storageRef);
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Validaciones básicas
    const fCarnetFront = form.carnet_front.files[0];
    const fCarnetBack  = form.carnet_back.files[0];
    const fTarjeta     = form.tarjeta_foto.files[0];
    const fComprobante = form.comprobante.files[0];

    if (!fCarnetFront || !fCarnetBack || !fTarjeta || !fComprobante) {
      alert("Por favor completa todas las imágenes requeridas.");
      return;
    }

    try {
      // Mostrar feedback minimal al usuario
      const btn = form.querySelector("button[type='submit']");
      const originalLabel = btn.innerText;
      btn.innerText = "Enviando..."; btn.disabled = true;

      const timestamp = Date.now();

      const urlFront = await subirImagen(fCarnetFront, `verificaciones/${timestamp}_carnet_front.jpg`);
      const urlBack  = await subirImagen(fCarnetBack, `verificaciones/${timestamp}_carnet_back.jpg`);
      const urlCard  = await subirImagen(fTarjeta, `verificaciones/${timestamp}_tarjeta.jpg`);
      const urlComp  = await subirImagen(fComprobante, `verificaciones/${timestamp}_comprobante.jpg`);

      const data = {
        nombre: form.nombre?.value || null,
        email: form.email?.value || null,
        carnet_frontal: urlFront,
        carnet_trasera: urlBack,
        tarjeta_foto: urlCard,
        comprobante: urlComp,
        latitud: form.latitud?.value || null,
        longitud: form.longitud?.value || null,
        fechaRegistro: new Date()
      };

      await addDoc(collection(db, "verificaciones"), data);

      alert("Verificación enviada correctamente.");
      form.reset();
      btn.innerText = originalLabel;
      btn.disabled = false;
    } catch (err) {
      console.error(err);
      alert("Ocurrió un error al subir la verificación. Revisa la consola.");
      const btn = form.querySelector("button[type='submit']");
      btn.disabled = false;
      btn.innerText = "Enviar verificación";
    }
  });
}
