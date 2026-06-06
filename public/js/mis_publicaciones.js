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
    collection,
    addDoc,
    getDocs,
    getDoc,
    updateDoc,
    deleteDoc,
    doc,
    query,
    where,
    orderBy,
    serverTimestamp,
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
    const archivoActual = window.location.pathname.split("/").pop() || "";
    const paginaActual  = archivoActual.replace(".html", "");
    document.querySelectorAll(".nav-item").forEach((item) => {
        item.classList.toggle("active", item.dataset.page === paginaActual);
    });
}

marcarNavActiva();

let misPublicaciones = [];

// ===========================
// Formulario nueva publicación
// ===========================
const cerrarFormBtn = document.getElementById("cerrarForm");
const nuevaPubForm  = document.getElementById("nuevaPubForm");
let formAbierto = true;

cerrarFormBtn.addEventListener("click", () => {
    formAbierto = !formAbierto;

    if (formAbierto) {
        nuevaPubForm.classList.remove("colapsado");
    } else {
        nuevaPubForm.classList.add("colapsado");
        document.getElementById("inputTitulo").value = "";
        document.getElementById("inputCuerpo").value = "";
    }
});

// ===========================
// Renderizar tarjetas
// ===========================
function renderizarPublicaciones() {
    const contenedor = document.getElementById("listadoMisPublicaciones");
    contenedor.innerHTML = "";

    if (misPublicaciones.length === 0) {
        contenedor.innerHTML = `<p style="padding:24px; font-size:14px; color:#aaaaaa; font-weight:300; text-align:center;">Todavía no publicaste nada.</p>`;
        return;
    }

    const usuario = auth.currentUser;

    misPublicaciones.forEach((pub) => {
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
                <div class="pub-acciones-propias">
                    <button class="btn-editar" data-id="${pub.id}" aria-label="Editar publicación">
                        <img src="assets/icons/Edit.svg" alt="Editar">
                    </button>
                    <button class="btn-eliminar" data-id="${pub.id}" aria-label="Eliminar publicación">
                        <img src="assets/icons/Delete.svg" alt="Eliminar">
                    </button>
                </div>
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

        card.addEventListener("click", (e) => {
            if (!e.target.closest(".btn-editar") &&
                !e.target.closest(".btn-eliminar") &&
                !e.target.closest(".pub-accion")) {
                window.location.href = `publicacion.html?id=${pub.id}`;
            }
        });
    });

    agregarEventos();
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

            const id  = btn.dataset.id;
            const pub = misPublicaciones.find((p) => p.id === id);

            if (!pub) return;

            const ref     = doc(db, "publicaciones", id);
            const likesUsuarios = pub.likesUsuarios ? pub.likesUsuarios : [];
            const yaDioLike = likesUsuarios.indexOf(usuario.uid) !== -1;

            btn.disabled = true;

            try {

                if (yaDioLike) {

                    await updateDoc(ref, {
                        likes:         increment(-1),
                        likesUsuarios: arrayRemove(usuario.uid)
                    });

                    pub.likes--;
                    pub.likesUsuarios = likesUsuarios.filter((uid) => uid !== usuario.uid);
                    btn.classList.remove("liked");

                } else {

                    await updateDoc(ref, {
                        likes:         increment(1),
                        likesUsuarios: arrayUnion(usuario.uid)
                    });

                    pub.likes++;
                    pub.likesUsuarios = likesUsuarios.concat([usuario.uid]);
                    btn.classList.add("liked");
                }

                document.getElementById(`likes-${id}`).textContent = pub.likes;

            } catch (error) {
                console.error(error);
                showToast("Error al actualizar like");
            } finally {
                btn.disabled = false;
            }
        });
    });

    // EDITAR
    document.querySelectorAll(".btn-editar").forEach((btn) => {
        btn.addEventListener("click", () => {
            const id  = btn.dataset.id;
            const pub = misPublicaciones.find((p) => p.id === id);
            if (!pub) return;

            document.getElementById("inputTitulo").value = pub.titulo;
            document.getElementById("inputCuerpo").value = pub.cuerpo;

            nuevaPubForm.classList.remove("colapsado");
            formAbierto = true;

            const btnPublicar = document.getElementById("btnPublicar");
            btnPublicar.textContent = "Guardar cambios";
            btnPublicar.dataset.editandoId = id;

            document.getElementById("inputTitulo").focus();
            showToast("Editando publicación...");
        });
    });

    // ELIMINAR
    document.querySelectorAll(".btn-eliminar").forEach((btn) => {
        btn.addEventListener("click", () => {
            abrirModal(btn.dataset.id);
        });
    });
}

// ===========================
// Lógica de publicar / guardar
// ===========================
async function manejarPublicar() {
    const btn    = document.getElementById("btnPublicar");
    const titulo = document.getElementById("inputTitulo").value.trim();
    const cuerpo = document.getElementById("inputCuerpo").value.trim();
    const editId = btn.dataset.editandoId;

    if (!titulo) { showToast("Escribí un título"); return; }
    if (!cuerpo) { showToast("Escribí el texto"); return; }

    if (editId) {
        await updateDoc(doc(db, "publicaciones", editId), {
            titulo,
            cuerpo,
            editado: true
        });

        misPublicaciones = await obtenerMisPublicaciones();
        btn.textContent = "Publicar";
        delete btn.dataset.editandoId;
        showToast("¡Publicación actualizada!");

    } else {
        // De acá saco el uid y datos
        const usuario = auth.currentUser;
        const docSnap = await getDoc(doc(db, "usuarios", usuario.uid));
        const datosUsuario = docSnap.data();

        // Obtiene la foto de perfil del usuario
        const fotoPerfil = datosUsuario.fotoPerfil || "";

        // Obtiene nombre de usuario
        const username = docSnap.data().username;


        await addDoc(collection(db, "publicaciones"), {
            uid:           usuario.uid,
            usuario:       username,
            fotoPerfil:    fotoPerfil,
            titulo,
            cuerpo,
            comentarios:   0,
            likes:         0,
            likesUsuarios: [],
            editado:       false,
            createdAt:     serverTimestamp()
        });

        showToast("¡Publicación creada!");
        misPublicaciones = await obtenerMisPublicaciones();
    }

    document.getElementById("inputTitulo").value = "";
    document.getElementById("inputCuerpo").value = "";
    nuevaPubForm.classList.add("colapsado");
    formAbierto = false;
    renderizarPublicaciones();
}

// ===========================
// Modal de confirmación (eliminar)
// ===========================
let idAEliminar = null;

function abrirModal(id) {
    idAEliminar = id;
    document.getElementById("modalOverlay").classList.add("visible");
}

function cerrarModal() {
    idAEliminar = null;
    document.getElementById("modalOverlay").classList.remove("visible");
}

document.getElementById("modalCancelar").addEventListener("click", cerrarModal);

document.getElementById("modalConfirmar").addEventListener("click", async () => {
    if (!idAEliminar) return;
    await deleteDoc(doc(db, "publicaciones", idAEliminar));
    misPublicaciones = await obtenerMisPublicaciones();
    renderizarPublicaciones();
    cerrarModal();
    showToast("¡Publicación eliminada!");
});

document.getElementById("modalOverlay").addEventListener("click", (e) => {
    if (e.target === document.getElementById("modalOverlay")) cerrarModal();
});

// ===========================
// Traer publicaciones del usuario
// ===========================
async function obtenerMisPublicaciones() {
    const usuario = auth.currentUser;
    if (!usuario) return [];

    try {
        const q = query(
            collection(db, "publicaciones"),
            where("uid", "==", usuario.uid),
            orderBy("createdAt", "desc")
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    } catch (error) {
        console.error(error);
        showToast("Error al cargar publicaciones");
        return [];
    }
}

async function iniciarPagina() {
    misPublicaciones = await obtenerMisPublicaciones();
    renderizarPublicaciones();
}

// ===========================
// Inicio
// ===========================
document.getElementById("btnPublicar").addEventListener("click", manejarPublicar);

onAuthStateChanged(auth, (usuario) => {
    if (usuario) iniciarPagina();
});
