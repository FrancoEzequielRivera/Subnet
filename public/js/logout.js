// ===========================
// js/logout.js
// ===========================

import { auth } from "./firebase.js";
import { signOut } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-auth.js";

function showToast(mensaje, duracion = 3000) {
    const toast = document.getElementById("toast");
    if (!toast) return;
    toast.textContent = mensaje;
    toast.classList.add("show");
    setTimeout(() => toast.classList.remove("show"), duracion);
}

const logoutBtn = document.getElementById("logoutBtn");

if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
        try {
            showToast("Cerrando sesión...");
            await signOut(auth);
            setTimeout(() => {
                window.location.href = "iniciar_sesion.html";
            }, 1500);
        } catch (error) {
            showToast("Error al cerrar sesión. Intentá de nuevo.");
            console.error("Error logout:", error);
        }
    });
}
