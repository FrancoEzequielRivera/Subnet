// ===========================
// Seguridad
// ===========================
import "./auth-guard.js";
import "./logout.js";

// Firebase
import { auth } from "./firebase.js";
import { db } from "./firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";

import {
    doc,
    getDoc,
    addDoc,
    getDocs,
    updateDoc,
    collection,
    orderBy,
    query,
    increment,
    arrayUnion,
    arrayRemove,
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
// Navegación activa
// ===========================
function marcarNavActiva() {
    const archivoActual = window.location.pathname.split("/").pop() || "";
    const paginaActual  = archivoActual.replace(".html", "");
    document.querySelectorAll(".nav-item").forEach((item) => {
        item.classList.toggle("active", item.dataset.page === paginaActual);
    });
}

marcarNavActiva();

// ===========================
// Leer el ID de la URL
// El feed navega con: publicacion.html?id=abc123
// ===========================
const params        = new URLSearchParams(window.location.search);
const idPublicacion = params.get("id");

// ===========================
// Traer la publicación de Firestore
// ===========================
async function obtenerPublicacion() {
    try {
        const docSnap = await getDoc(doc(db, "publicaciones", idPublicacion));

        if (!docSnap.exists()) return null;

        return { id: docSnap.id, ...docSnap.data() };

    } catch (error) {
        console.error(error);
        showToast("Error al cargar la publicación");
        return null;
    }
}

// ===========================
// Traer comentarios de la subcolección
// Ruta: publicaciones/{id}/comentarios
// ===========================
async function obtenerComentarios() {
    try {
        const q = query(
            collection(db, "publicaciones", idPublicacion, "comentarios"),
            orderBy("createdAt", "asc")
        );

        const snapshot = await getDocs(q);

        return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    } catch (error) {
        console.error(error);
        showToast("Error al cargar comentarios");
        return [];
    }
}

// ===========================
// Renderizar publicación
// ===========================
function renderizarPublicacion(pub, usuario) {
    const contenedor = document.getElementById("pubDetalle");

    const likesUsuarios = pub.likesUsuarios ? pub.likesUsuarios : [];
    const yaLiked = usuario && likesUsuarios.indexOf(usuario.uid) !== -1;

    contenedor.innerHTML = `
        <div class="pub-autor">
            <img src="${pub.fotoPerfil || 'assets/icons/User.svg'}" 
            alt="Avatar de ${pub.usuario}">
            <span class="pub-username">${pub.usuario}</span>
        </div>
        <p class="pub-titulo">${pub.titulo}</p>
        <p class="pub-cuerpo">${pub.cuerpo}</p>
        <div class="pub-footer">
            <button class="pub-accion" id="btnComentario" aria-label="Comentarios">
                <img src="assets/icons/Message.svg" alt="Comentarios">
                <span id="contComentarios">${pub.comentarios || 0}</span>
            </button>
            <button class="pub-accion ${yaLiked ? "liked" : ""}" id="btnLike" aria-label="Me gusta">
                <svg width="28" height="28" viewBox="0 0 28 28" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                    <path d="M23.6428 5.23C23.0634 4.65028 22.3754 4.19041 21.6182 3.87665C20.8609 3.56289 20.0493 3.4014 19.2297 3.4014C18.41 3.4014 17.5984 3.56289 16.8411 3.87665C16.0839 4.19041 15.3959 4.65028 14.8165 5.23L13.6139 6.43257L12.4114 5.23C11.2409 4.05956 9.65343 3.402 7.99817 3.402C6.34291 3.402 4.75544 4.05956 3.58499 5.23C2.41454 6.40045 1.75699 7.98792 1.75699 9.64318C1.75699 11.2984 2.41454 12.8859 3.58499 14.0564L13.6139 24.0853L23.6428 14.0564C24.2226 13.4769 24.6824 12.7889 24.9962 12.0317C25.31 11.2745 25.4714 10.4628 25.4714 9.64318C25.4714 8.82353 25.31 8.0119 24.9962 7.25467C24.6824 6.49744 24.2226 5.80945 23.6428 5.23Z" stroke="#1E1E1E" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                <span id="contLikes">${pub.likes || 0}</span>
            </button>
        </div>
    `;

    // Evento like — igual que en feed.js y mis_publicaciones.js
    document.getElementById("btnLike").addEventListener("click", async () => {
        const btn   = document.getElementById("btnLike");
        const cont  = document.getElementById("contLikes");
        const liked = btn.classList.contains("liked");
        const ref   = doc(db, "publicaciones", pub.id);

        btn.disabled = true;

        try {
            if (liked) {
                btn.classList.remove("liked");
                cont.textContent = parseInt(cont.textContent) - 1;
                await updateDoc(ref, {
                    likes:         increment(-1),
                    likesUsuarios: arrayRemove(usuario.uid)
                });
            } else {
                btn.classList.add("liked");
                cont.textContent = parseInt(cont.textContent) + 1;
                await updateDoc(ref, {
                    likes:         increment(1),
                    likesUsuarios: arrayUnion(usuario.uid)
                });
            }
        } catch (error) {
            console.error(error);
            showToast("Error al actualizar like");
            btn.classList.toggle("liked");
        } finally {
            btn.disabled = false;
        }
    });

    // Evento comentario: hace foco en el input
    document.getElementById("btnComentario").addEventListener("click", () => {
        document.getElementById("nuevoComentario").focus();
    });
}

// ===========================
// Renderizar comentarios
// ===========================
function renderizarComentarios(lista) {
    const contenedor = document.getElementById("listadoComentarios");
    contenedor.innerHTML = "";

    if (lista.length === 0) {
        contenedor.innerHTML = `<p style="padding: 16px 24px; font-size:14px; color:#aaaaaa; font-weight:300;">Todavía no hay comentarios. ¡Sé el primero!</p>`;
        return;
    }

    lista.forEach((comentario) => {
        const card = document.createElement("div");
        card.classList.add("comentario-card");
        card.innerHTML = `
            <div class="comentario-autor">
                <img src="${comentario.fotoPerfil || 'assets/icons/User.svg'}" alt="Avatar de ${comentario.usuario}">
                <span class="comentario-username">${comentario.usuario}</span>
            </div>
            <p class="comentario-texto">${comentario.texto}</p>
        `;
        contenedor.appendChild(card);
    });
}

// ===========================
// Enviar nuevo comentario
// ===========================
async function enviarComentario() {
    const input   = document.getElementById("nuevoComentario");
    const texto   = input.value.trim();

    const usuarioAuth = auth.currentUser;

    const docSnap = await getDoc(doc(db, "usuarios", usuarioAuth.uid));
    const datosUsuario = docSnap.data();

    const usuario = datosUsuario.username
    const fotoPerfil   = datosUsuario.fotoPerfil || "";

    if (!texto) return;
    if (!usuarioAuth) return;

    input.value = "";

    try {
        // Guarda el comentario en la subcolección
        await addDoc(collection(db, "publicaciones", idPublicacion, "comentarios"), {
            uid:       usuarioAuth.uid,
            usuario:   usuario,
            fotoPerfil,
            texto,
            createdAt: serverTimestamp()
        });

        // Suma 1 al contador de comentarios de la publicación
        await updateDoc(doc(db, "publicaciones", idPublicacion), {
            comentarios: increment(1)
        });

        // Actualiza el contador visualmente
        const cont = document.getElementById("contComentarios");
        if (cont) cont.textContent = parseInt(cont.textContent) + 1;

        // Agrega el comentario al listado visualmente sin recargar
        const contenedor      = document.getElementById("listadoComentarios");
        const sinComentarios  = contenedor.querySelector("p");
        if (sinComentarios) sinComentarios.remove();

        const card = document.createElement("div");
        card.classList.add("comentario-card");
        card.innerHTML = `
            <div class="comentario-autor">
                <img src="${fotoPerfil || 'assets/icons/User.svg'}" alt="Tu avatar">
                <span class="comentario-username">${usuario}</span>
            </div>
            <p class="comentario-texto">${texto}</p>
        `;
        contenedor.appendChild(card);

    } catch (error) {
        console.error(error);
        showToast("Error al enviar el comentario");
    }
}

document.getElementById("enviarComentario").addEventListener("click", enviarComentario);
document.getElementById("nuevoComentario").addEventListener("keydown", (e) => {
    if (e.key === "Enter") enviarComentario();
});

// ===========================
// Inicio
// ===========================
if (!idPublicacion) {
    window.location.href = "feed.html";
} else {
    onAuthStateChanged(auth, async (usuario) => {
        if (!usuario) return;

        const pub = await obtenerPublicacion();

        if (!pub) {
            showToast("Publicación no encontrada");
            setTimeout(() => { window.location.href = "feed.html"; }, 1500);
            return;
        }

        const comentarios = await obtenerComentarios();

        renderizarPublicacion(pub, usuario);
        renderizarComentarios(comentarios);
    });
}
