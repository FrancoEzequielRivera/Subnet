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
// Navegación activa
// ===========================
function marcarNavActiva() {
    const archivoActual = window.location.pathname.split("/").pop() || "feed.html";
    const paginaActual  = archivoActual.replace(".html", "");

    document.querySelectorAll(".nav-item").forEach((item) => {
        item.classList.toggle("active", item.dataset.page === paginaActual);
    });
}

marcarNavActiva();

// ===========================
// Datos de prueba
// ===========================
const publicaciones = [
    {
        id: "1",
        usuario: "User123",
        titulo: "Mi Publicación",
        cuerpo: "Este es un texto de prueba para probar la cantidad de texto que puedo colocar dentro de esta caja de pruebas en publicaciones de Subnet.",
        comentarios: 100,
        likes: 100,
        editado: true
    },
    {
        id: "2",
        usuario: "Fran1542",
        titulo: "Mi Publicación",
        cuerpo: "Este es un texto de prueba para probar la cantidad de texto que puedo colocar dentro de esta caja de pruebas en publicaciones de Subnet.",
        comentarios: 100,
        likes: 100,
        editado: false
    },
    {
        id: "3",
        usuario: "sbnet1245",
        titulo: "Mi Publicación",
        cuerpo: "Este es un texto de prueba para probar la cantidad de texto que puedo colocar dentro de esta caja de pruebas en publicaciones de Subnet.",
        comentarios: 100,
        likes: 100,
        editado: false
    },
    {
        id: "4",
        usuario: "Cibernauta",
        titulo: "Mi Publicación",
        cuerpo: "Este es un texto de prueba para probar la cantidad de texto que puedo colocar dentro de esta caja de pruebas en publicaciones de Subnet.",
        comentarios: 47,
        likes: 213,
        editado: false
    }
];

// ===========================
// Renderizado de tarjetas con array de publicaciones
// ===========================
function renderizarPublicaciones(lista) {
    const contenedor = document.getElementById("listadoPublicaciones");
    contenedor.innerHTML = ""; // limpia antes de renderizar

    lista.forEach((pub) => {
        const card = document.createElement("div");
        card.classList.add("pub-card");
        card.dataset.id = pub.id;

        card.innerHTML = `
            <div class="pub-header">
                <div class="pub-autor">
                    <img src="assets/icons/User_feed.svg" alt="Avatar de ${pub.usuario}">
                    <span class="pub-username">${pub.usuario}</span>
                </div>
                <span class="pub-editado ${pub.editado ? "visible" : ""}">Editado</span>
            </div>

            <p class="pub-titulo">${pub.titulo}</p>
            <p class="pub-cuerpo">${pub.cuerpo}</p>

            <div class="pub-footer">
                <button class="pub-accion" data-tipo="comentario" data-id="${pub.id}" aria-label="Comentarios">
                    <img src="assets/icons/Message.svg" alt="Comentarios">
                    <span id="comentarios-${pub.id}">${pub.comentarios}</span>
                </button>
                <button class="pub-accion" data-tipo="like" data-id="${pub.id}" aria-label="Me gusta">
                    <img src="assets/icons/Heart.svg" alt="Me gusta">
                    <span id="likes-${pub.id}">${pub.likes}</span>
                </button>
            </div>
        `;

        contenedor.appendChild(card);
    });

    // Eventos de like y comentario
    agregarEventos();
}

// ===========================
// Eventos de interacción
// ===========================
function agregarEventos() {

    // LIKE: toggle visual + contador
    document.querySelectorAll(".pub-accion[data-tipo='like']").forEach((btn) => {
        btn.addEventListener("click", () => {
            const id       = btn.dataset.id;
            const spanLike = document.getElementById(`likes-${id}`);
            const liked    = btn.classList.contains("liked");

            if (liked) {
                btn.classList.remove("liked");
                spanLike.textContent = parseInt(spanLike.textContent) - 1;
            } else {
                btn.classList.add("liked");
                spanLike.textContent = parseInt(spanLike.textContent) + 1;
            }
        });
    });

    // COMENTARIO
    document.querySelectorAll(".pub-accion[data-tipo='comentario']").forEach((btn) => {
        btn.addEventListener("click", () => {
            // TODO: navegar a la vista de comentarios de esa publicación
            showToast("Comentarios (próximamente)");
        });
    });
}

// ===========================
// Cerrar sesión
// ===========================
document.getElementById("logoutBtn").addEventListener("click", () => {
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

// ===========================
// Inicio: renderizar con datos de array
//const publicaciones = await obtenerPublicaciones()
renderizarPublicaciones(publicaciones);
