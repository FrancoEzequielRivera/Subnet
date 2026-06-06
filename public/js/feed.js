// ===========================
// Seguridad
// ===========================
import "./auth-guard.js";
import "./logout.js";

// Firebase
import { auth } from "./firebase.js";
import { db } from "./firebase.js";

import {
    collection,
    getDocs,
    query,
    orderBy,
    onSnapshot,
    doc,
    updateDoc,
    increment,
    arrayUnion,
    arrayRemove
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
// Navegación activa
// ===========================
function marcarNavActiva() {
    const archivoActual = window.location.pathname.split("/").pop() || "index.html";
    const paginaActual  = archivoActual.replace(".html", "");
    const navItems      = document.querySelectorAll(".nav-item");

    navItems.forEach((item) => {
        if (item.dataset.page === paginaActual) {
            item.classList.add("active");
        } else {
            item.classList.remove("active");
        }
    });
}

marcarNavActiva();

// ===========================
// Traer publicaciones de todos los usuarios
// ===========================
async function obtenerPublicaciones() {
    try {
        const publis = query(
            collection(db, "publicaciones"),
            orderBy("createdAt", "desc")
        );
        const snapshot = await getDocs(publis);
        return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    } catch (error) {
        console.error(error);
        showToast("Error al cargar publicaciones");
        return [];
    }
}

// ===========================
// Renderizar tarjetas
// ===========================
function renderizarPublicaciones(lista) {
    const contenedor = document.getElementById("listadoPublicaciones");
    contenedor.innerHTML = "";

    const usuario = auth.currentUser;

    lista.forEach((pub) => {
        const card = document.createElement("div");
        card.classList.add("pub-card");
        card.dataset.id = pub.id;

        // Verifica si el usuario ya dio like
        const likesUsuarios = pub.likesUsuarios ? pub.likesUsuarios : [];
        const yaLiked = usuario && likesUsuarios.indexOf(usuario.uid) !== -1;

        card.innerHTML = `
            <div class="pub-header">
                <div class="pub-autor">
                    <img src="${pub.fotoPerfil || 'assets/icons/User.svg'}" 
                    alt="Avatar de ${pub.usuario}">
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
                <button class="pub-accion ${yaLiked ? "liked" : ""}" data-tipo="like" data-id="${pub.id}" aria-label="Me gusta">
                    <svg width="28" height="28" viewBox="0 0 28 28" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                    <path d="M23.6428 5.23C23.0634 4.65028 22.3754 4.19041 21.6182 3.87665C20.8609 3.56289 20.0493 3.4014 19.2297 3.4014C18.41 3.4014 17.5984 3.56289 16.8411 3.87665C16.0839 4.19041 15.3959 4.65028 14.8165 5.23L13.6139 6.43257L12.4114 5.23C11.2409 4.05956 9.65343 3.402 7.99817 3.402C6.34291 3.402 4.75544 4.05956 3.58499 5.23C2.41454 6.40045 1.75699 7.98792 1.75699 9.64318C1.75699 11.2984 2.41454 12.8859 3.58499 14.0564L13.6139 24.0853L23.6428 14.0564C24.2226 13.4769 24.6824 12.7889 24.9962 12.0317C25.31 11.2745 25.4714 10.4628 25.4714 9.64318C25.4714 8.82353 25.31 8.0119 24.9962 7.25467C24.6824 6.49744 24.2226 5.80945 23.6428 5.23Z" stroke="#1E1E1E" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    <span id="likes-${pub.id}">${pub.likes}</span>
                </button>
            </div>
        `;

        contenedor.appendChild(card);

        // Escucha cambios en tiempo real del contador de likes
        detectarLike(pub.id);

        card.addEventListener("click", (e) => {
            if (!e.target.closest(".pub-accion")) {
                window.location.href = `publicacion.html?id=${pub.id}`;
            }
        });
    });

    agregarEventos();
}

// ===========================
// Escucha en tiempo real el contador de likes de una publicación.
// Si otro usuario da like, el número se actualiza solo sin recargar.
// ===========================
function detectarLike(id) {
    const ref = doc(db, "publicaciones", id);

    onSnapshot(ref, (docSnap) => {
        if (!docSnap.exists()) return;

        const data      = docSnap.data();
        const spanLikes = document.getElementById(`likes-${id}`);

        if (spanLikes) {
            spanLikes.textContent = data.likes || 0;
        }
    });
}

// ===========================
// Eventos de interacción
// ===========================
function agregarEventos() {

    // LIKE
    document.querySelectorAll(".pub-accion[data-tipo='like']").forEach((btn) => {

        btn.addEventListener("click", async () => {

            const usuario = auth.currentUser;
            if (!usuario) return;

            const id    = btn.dataset.id;
            const ref   = doc(db, "publicaciones", id);
            const liked = btn.classList.contains("liked");

            btn.disabled = true;

            try {

                if (liked) {

                    btn.classList.remove("liked");

                    await updateDoc(ref, {
                        likes:         increment(-1),
                        likesUsuarios: arrayRemove(usuario.uid)
                    });

                } else {

                    btn.classList.add("liked");

                    await updateDoc(ref, {
                        likes:         increment(1),
                        likesUsuarios: arrayUnion(usuario.uid)
                    });
                }

            } catch (error) {
                console.error(error);
                showToast("Error al dar like");
                // Revierte el cambio visual si falla
                btn.classList.toggle("liked");
            } finally {
                btn.disabled = false;
            }
        });
    });

    // COMENTARIO
    document.querySelectorAll(".pub-accion[data-tipo='comentario']").forEach((btn) => {
        btn.addEventListener("click", () => {
            window.location.href = `publicacion.html?id=${btn.dataset.id}`;
        });
    });
}

// ===========================
// Inicio
// ===========================
async function iniciarFeed() {
    const publicaciones = await obtenerPublicaciones();
    renderizarPublicaciones(publicaciones);
}

iniciarFeed();
