import { auth }      from "./firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";

onAuthStateChanged(auth, (usuario) => {
    if (!usuario) {
        window.location.href = "iniciar_sesion.html";
    }
});
