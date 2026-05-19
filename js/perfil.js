// ===========================
// Toast (igual que en los otros archivos)
// ===========================
function showToast(mensaje, duracion = 3000) {
    const toast = document.getElementById("toast");
    toast.textContent = mensaje;
    toast.classList.add("show");
    setTimeout(() => toast.classList.remove("show"), duracion);
}

// ===========================
// Navegación activa
// Lee el nombre del archivo actual y marca el ítem correspondiente
// ===========================
function marcarNavActiva() {
    // Obtiene solo el nombre del archivo, ej: "perfil.html"
    const archivoActual = window.location.pathname.split("/").pop() || "index.html";

    // Saca la parte sin extensión, ej: "perfil"
    const paginaActual = archivoActual.replace(".html", "");

    // Busca todos los ítems del nav y marca el que coincide
    const navItems = document.querySelectorAll(".nav-item");

    navItems.forEach((item) => {
        if (item.dataset.page === paginaActual) {
            item.classList.add("active");
        } else {
            item.classList.remove("active");
        }
    });
}

// Ejecuta al cargar la página
marcarNavActiva();

// ===========================
// Mostrar / ocultar contraseña
// ===========================
const toggleBtn    = document.getElementById("togglePassword");
const displayPass  = document.getElementById("displayPassword");
const eyeIcon      = document.getElementById("eyeIcon");

// La contraseña real (en un proyecto real vendría del backend/sesión)
const passwordReal = "MiContraseña123";
let passwordVisible = false;

toggleBtn.addEventListener("click", () => {
    passwordVisible = !passwordVisible;

    if (passwordVisible) {
        displayPass.textContent = passwordReal;
        // Cuando está visible usamos el mismo ícono con opacidad reducida para indicar estado
        eyeIcon.style.opacity = "0.4";
        toggleBtn.setAttribute("aria-label", "Ocultar contraseña");
    } else {
        displayPass.textContent = "••••••••••••";
        eyeIcon.style.opacity = "1";
        toggleBtn.setAttribute("aria-label", "Mostrar contraseña");
    }
});

// ===========================
// Cerrar sesión
// ===========================
document.getElementById("logoutBtn").addEventListener("click", () => {
    // TODO: agregar lógica real de cierre de sesión (limpiar tokens, etc.)
    showToast("Cerrando sesión...");
    setTimeout(() => {
        window.location.href = "iniciar_sesion.html";
    }, 1500);
});

// ===========================
// Botón flotante "+"
// ===========================
document.querySelector(".fab").addEventListener("click", () => {
    // TODO: navegar a la pantalla de nueva publicación
    showToast("Nueva publicación (próximamente)");
});
