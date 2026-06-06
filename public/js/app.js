// ===========================
// js/app.js — Registro
// ===========================

import { auth, db } from "./firebase.js";
import {
    createUserWithEmailAndPassword,
    updateProfile
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";
import {
    doc,
    setDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

// ===========================
// Toast
// ===========================
function showToast(mensaje, duracion = 3000) {
    const toast = document.getElementById("toast");
    toast.textContent = mensaje;
    toast.classList.add("show");
    setTimeout(() => toast.classList.remove("show"), duracion);
}

// ===========================
// Validaciones
// ===========================
const emailInput    = document.getElementById("email");
const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");
const registerBtn   = document.getElementById("registerBtn");

function esEmailValido(valor) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor.trim());
}

function setError(input, idError, mostrar) {
    const errorEl = document.getElementById(idError);
    if (mostrar) {
        input.classList.add("error");
        errorEl.classList.add("show");
    } else {
        input.classList.remove("error");
        errorEl.classList.remove("show");
    }
}

emailInput.addEventListener("blur", () => {
    if (emailInput.value) setError(emailInput, "email-error", !esEmailValido(emailInput.value));
});
usernameInput.addEventListener("blur", () => {
    if (usernameInput.value) setError(usernameInput, "username-error", usernameInput.value.trim().length < 1);
});
passwordInput.addEventListener("blur", () => {
    if (passwordInput.value) setError(passwordInput, "password-error", passwordInput.value.length < 8);
});

[emailInput, usernameInput, passwordInput].forEach((input) => {
    input.addEventListener("input", () => input.classList.remove("error"));
});

// ===========================
// Registro con Firebase
// ===========================
registerBtn.addEventListener("click", async () => {
    const email    = emailInput.value.trim();
    const username = usernameInput.value.trim();
    const password = passwordInput.value;

    // Validación local antes de tocar Firebase
    let valido = true;
    if (!esEmailValido(email))    { setError(emailInput,    "email-error",    true); valido = false; }
    if (username.length < 1)      { setError(usernameInput, "username-error", true); valido = false; }
    if (password.length < 8)      { setError(passwordInput, "password-error", true); valido = false; }
    if (!valido) return;

    registerBtn.textContent = "Registrando...";
    registerBtn.disabled    = true;

    try {
        //  Crea el usuario en Firebase Authentication
        const credencial = await createUserWithEmailAndPassword(auth, email, password);
        const usuario    = credencial.user;

        //  Guarda el nombre de usuario en el perfil de Auth
        await updateProfile(usuario, { displayName: username });

        //  Crea el documento del usuario en Firestore
        //    Ruta: usuarios/{uid}
        await setDoc(doc(db, "usuarios", usuario.uid), {
            username,
            email,
            creadoEn: serverTimestamp()
        });

        // 4. Redirige al feed
        window.location.href = "feed.html";

    } catch (error) {
        // Errores comunes de Firebase Auth
        const mensajes = {
            "auth/email-already-in-use": "Ese correo ya está registrado.",
            "auth/invalid-email":        "El correo no es válido.",
            "auth/weak-password":        "La contraseña es muy débil (mínimo 8 caracteres).",
            "auth/network-request-failed": "Sin conexión. Revisá tu internet."
        };
        showToast(mensajes[error.code] || "Ocurrió un error. Intentá de nuevo.");
        registerBtn.textContent = "Registrarse";
        registerBtn.disabled    = false;
    }
});
