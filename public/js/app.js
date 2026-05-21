// ===========================
// Toast de notificación
// ===========================
function showToast(mensaje, duracion = 3000) {
    const toast = document.getElementById("toast");
    toast.textContent = mensaje;
    toast.classList.add("show");
    setTimeout(() => toast.classList.remove("show"), duracion);
}

// ===========================
// Banner de instalación PWA
// ===========================
let deferredPrompt = null;
const installBanner = document.getElementById("installBanner");
const installBtn = document.getElementById("installBtn");
const dismissBanner = document.getElementById("dismissBanner");

// El navegador dispara este evento cuando la app es instalable
window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault(); // evita que el navegador muestre su propio prompt
    deferredPrompt = e;
    installBanner.classList.add("visible"); // mostramos nuestro banner
});

// Al hacer clic en "Instalar"
installBtn.addEventListener("click", async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt(); // muestra el diálogo nativo del navegador
    const { outcome } = await deferredPrompt.userChoice;

    deferredPrompt = null;
    installBanner.classList.remove("visible");

    if (outcome === "accepted") {
        showToast("¡Subnet instalada!");
    }
});

// Al hacer clic en "×"
dismissBanner.addEventListener("click", () => {
    installBanner.classList.remove("visible");
});

// Se dispara cuando la app ya fue instalada
window.addEventListener("appinstalled", () => {
    installBanner.classList.remove("visible");
    showToast("¡Subnet instalada correctamente!");
});

// ===========================
// Validación del formulario
// ===========================
const emailInput    = document.getElementById("email");
const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");
const registerBtn   = document.getElementById("registerBtn");

// Valida formato de email con expresión regular
function esEmailValido(valor) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor.trim());
}

// Muestra u oculta el error de un campo
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

// Validación al perder el foco (blur) — solo si el campo tiene algo escrito
emailInput.addEventListener("blur", () => {
    if (emailInput.value) {
        setError(emailInput, "email-error", !esEmailValido(emailInput.value));
    }
});

usernameInput.addEventListener("blur", () => {
    if (usernameInput.value) {
        setError(usernameInput, "username-error", usernameInput.value.trim().length < 1);
    }
});

passwordInput.addEventListener("blur", () => {
    if (passwordInput.value) {
        setError(passwordInput, "password-error", passwordInput.value.length < 8);
    }
});

// Limpia el borde rojo mientras el usuario escribe
[emailInput, usernameInput, passwordInput].forEach((input) => {
    input.addEventListener("input", () => input.classList.remove("error"));
});

// ===========================
// Envío del formulario
// ===========================
registerBtn.addEventListener("click", () => {
    let formularioValido = true;

    // Valida email
    if (!esEmailValido(emailInput.value)) {
        setError(emailInput, "email-error", true);
        formularioValido = false;
    } else {
        setError(emailInput, "email-error", false);
    }

    // Valida nombre de usuario
    if (usernameInput.value.trim().length < 1) {
        setError(usernameInput, "username-error", true);
        formularioValido = false;
    } else {
        setError(usernameInput, "username-error", false);
    }

    // Valida contraseña
    if (passwordInput.value.length < 8) {
        setError(passwordInput, "password-error", true);
        formularioValido = false;
    } else {
        setError(passwordInput, "password-error", false);
    }

    // Si todo está bien, simula el envío
    if (formularioValido) {
        registerBtn.textContent = "Registrando...";
        registerBtn.disabled = true;

        // TODO: reemplazar este setTimeout con la llamada real a tu backend
        setTimeout(() => {
            showToast("¡Cuenta creada con éxito!");
            registerBtn.textContent = "Registrarse";
            registerBtn.disabled = false;
        }, 1500);
    }
});
