// admin.js
import { auth, db } from "./firebase.js";
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { collection, getDocs, query, orderBy, limit } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const loginCard = document.getElementById("loginCard");
const panelCard = document.getElementById("panelCard");
const loginForm = document.getElementById("loginForm");
const btnLogout = document.getElementById("btnLogout");
const btnRefresh = document.getElementById("btnRefresh");
const listContainer = document.getElementById("listContainer");

// Observador de estado de autenticación
onAuthStateChanged(auth, (user) => {
  if (user) {
    // mostrar panel
    loginCard.classList.add("hidden");
    panelCard.classList.remove("hidden");
    cargarVerificaciones();
  } else {
    loginCard.classList.remove("hidden");
    panelCard.classList.add("hidden");
  }
});

// Login
if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("adminEmail").value;
    const pass  = document.getElementById("adminPass").value;

    try {
      await signInWithEmailAndPassword(auth, email, pass);
      // onAuthStateChanged manejará la UI
    } catch (err) {
      console.error(err);
      alert("Error de login: " + (err.code || err.message));
    }
  });
}

// Logout
if (btnLogout) {
  btnLogout.addEventListener("click", async () => {
    await signOut(auth);
  });
}

// Refrescar
if (btnRefresh) {
  btnRefresh.addEventListener("click", cargarVerificaciones);
}

// Función para cargar verificaciones
async function cargarVerificaciones() {
  listContainer.innerHTML = "<p class='muted'>Cargando...</p>";

  try {
    const q = query(collection(db, "verificaciones"), orderBy("fechaRegistro", "desc"), limit(100));
    const snap = await getDocs(q);
    if (snap.empty) {
      listContainer.innerHTML = "<p class='muted'>No hay verificaciones todavía.</p>";
      return;
    }

    listContainer.innerHTML = "";
    snap.forEach(doc => {
      const d = doc.data();
      const card = document.createElement("div");
      card.className = "card-result";

      const thumb = document.createElement("img");
      thumb.className = "card-thumb";
      // mostrar comprobante como miniatura (si existe), si no usar carnet frontal
      thumb.src = d.comprobante || d.tarjeta_foto || d.carnet_frontal || "";
      thumb.alt = "imagen";

      const body = document.createElement("div");
      body.className = "card-body";

      const meta = document.createElement("div");
      meta.className = "meta";
      const fecha = d.fechaRegistro && d.fechaRegistro.toDate ? d.fechaRegistro.toDate() : (d.fechaRegistro ? new Date(d.fechaRegistro) : null);
      meta.innerHTML = `<strong>${d.nombre || "—"}</strong> · ${fecha ? fecha.toLocaleString() : "fecha desconocida"}`;

      const links = document.createElement("div");
      links.className = "links";
      const aCarnetF = document.createElement("a");
      aCarnetF.href = d.carnet_frontal || "#";
      aCarnetF.target = "_blank";
      aCarnetF.className = "btn small";
      aCarnetF.innerText = "Carnet F.";

      const aCarnetB = document.createElement("a");
      aCarnetB.href = d.carnet_trasera || "#";
      aCarnetB.target = "_blank";
      aCarnetB.className = "btn small";
      aCarnetB.innerText = "Carnet T.";

      const aTarjeta = document.createElement("a");
      aTarjeta.href = d.tarjeta_foto || "#";
      aTarjeta.target = "_blank";
      aTarjeta.className = "btn small";
      aTarjeta.innerText = "Tarjeta";

      const aComp = document.createElement("a");
      aComp.href = d.comprobante || "#";
      aComp.target = "_blank";
      aComp.className = "btn small";
      aComp.innerText = "Comprobante";

      links.appendChild(aCarnetF);
      links.appendChild(aCarnetB);
      links.appendChild(aTarjeta);
      links.appendChild(aComp);

      // Link a Google Maps si hay lat/lng
      if (d.latitud && d.longitud) {
        const map = document.createElement("a");
        const lat = encodeURIComponent(d.latitud);
        const lng = encodeURIComponent(d.longitud);
        map.href = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
        map.target = "_blank";
        map.className = "btn small";
        map.innerText = "Ver ubicación";
        links.appendChild(map);
      }

      body.appendChild(meta);
      body.appendChild(links);

      card.appendChild(thumb);
      card.appendChild(body);

      listContainer.appendChild(card);
    });
  } catch (err) {
    console.error(err);
    listContainer.innerHTML = "<p class='muted'>Error cargando verificaciones. Revisa la consola.</p>";
  }
}
