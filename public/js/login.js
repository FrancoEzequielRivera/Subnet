// ===========================
// js/login.js — Inicio de sesión
// ===========================

import { auth } from "./firebase.js";
import {
    signInWithEmailAndPassword,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";

// Si ya hay sesión activa, mandamos directo al feed
onAuthStateChanged(auth, (usuario) => {
    if (usuario) window.location.href = "feed.html";
});

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
const passwordInput = document.getElementById("password");
const loginBtn      = document.getElementById("loginBtn");

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
passwordInput.addEventListener("blur", () => {
    if (passwordInput.value) setError(passwordInput, "password-error", passwordInput.value.length < 1);
});

[emailInput, passwordInput].forEach((input) => {
    input.addEventListener("input", () => input.classList.remove("error"));
});

// ===========================
// Login con Firebase
// ===========================
loginBtn.addEventListener("click", async () => {
    const email    = emailInput.value.trim();
    const password = passwordInput.value;

    let valido = true;
    if (!esEmailValido(email))  { setError(emailInput,    "email-error",    true); valido = false; }
    if (password.length < 1)    { setError(passwordInput, "password-error", true); valido = false; }
    if (!valido) return;

    loginBtn.textContent = "Iniciando...";
    loginBtn.disabled    = true;

    try {
        await signInWithEmailAndPassword(auth, email, password);
        // onAuthStateChanged detecta el cambio y redirige al feed automáticamente
    } catch (error) {
        const mensajes = {
            "auth/invalid-credential":     "Correo o contraseña incorrectos.",
            "auth/user-not-found":         "No existe una cuenta con ese correo.",
            "auth/wrong-password":         "Contraseña incorrecta.",
            "auth/too-many-requests":      "Demasiados intentos. Esperá unos minutos.",
            "auth/network-request-failed": "Sin conexión. Revisá tu internet."
        };
        showToast(mensajes[error.code] || "Ocurrió un error. Intentá de nuevo.");
        loginBtn.textContent = "Iniciar sesión";
        loginBtn.disabled    = false;
    }
});
