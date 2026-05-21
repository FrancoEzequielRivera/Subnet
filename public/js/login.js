// ===========================
// Toast de notificación
// (igual que en app.js)
// ===========================
function showToast(mensaje, duracion = 3000) {
    const toast = document.getElementById("toast");
    toast.textContent = mensaje;
    toast.classList.add("show");
    setTimeout(() => toast.classList.remove("show"), duracion);
}

// ===========================
// Validación del formulario
// ===========================
const emailInput  = document.getElementById("email");
const passwordInput = document.getElementById("password");
const loginBtn    = document.getElementById("loginBtn");

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

// Validación al perder el foco
emailInput.addEventListener("blur", () => {
    if (emailInput.value) {
        setError(emailInput, "email-error", !esEmailValido(emailInput.value));
    }
});

passwordInput.addEventListener("blur", () => {
    if (passwordInput.value) {
        setError(passwordInput, "password-error", passwordInput.value.length < 1);
    }
});

// Limpia el borde rojo mientras el usuario escribe
[emailInput, passwordInput].forEach((input) => {
    input.addEventListener("input", () => input.classList.remove("error"));
});

// ===========================
// Envío del formulario
// ===========================
loginBtn.addEventListener("click", () => {
    let formularioValido = true;

    if (!esEmailValido(emailInput.value)) {
        setError(emailInput, "email-error", true);
        formularioValido = false;
    } else {
        setError(emailInput, "email-error", false);
    }

    if (passwordInput.value.length < 1) {
        setError(passwordInput, "password-error", true);
        formularioValido = false;
    } else {
        setError(passwordInput, "password-error", false);
    }

    if (formularioValido) {
        loginBtn.textContent = "Iniciando...";
        loginBtn.disabled = true;

        // TODO: reemplazar con la llamada real a tu backend
        setTimeout(() => {
            showToast("¡Bienvenido/a!");
            loginBtn.textContent = "Iniciar sesión";
            loginBtn.disabled = false;
        }, 1500);
    }
});
