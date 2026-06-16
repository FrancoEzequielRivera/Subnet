// ===========================
// Seguridad
// ===========================
import "./auth-guard.js";
import "./logout.js";

// Firebase
import { auth, db } from "./firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";
import {
    doc,
    getDoc,
    updateDoc,
    collection,
    query,
    where,
    getDocs
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

// ===========================
// Cloudinary
// ===========================
const CLOUDINARY_CLOUD_NAME    = "dsjq0nx9g";
const CLOUDINARY_UPLOAD_PRESET = "Subnet_PF";

async function subirImagenACloudinary(archivo) {
    const formData = new FormData();
    formData.append("file", archivo);
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

    const respuesta = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
        { method: "POST", body: formData }
    );

    const datos = await respuesta.json();

    if (!respuesta.ok) {
        throw new Error(datos.error?.message || "Error al subir la imagen");
    }

    return datos.secure_url;
}

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
    document.querySelectorAll(".nav-item").forEach((item) => {
        if (item.dataset.page === paginaActual) {
            item.classList.add("active");
        } else {
            item.classList.remove("active");
        }
    });
}

marcarNavActiva();

// ===========================
// Cargar datos del usuario
// ===========================
const displayUsername = document.getElementById("displayUsername");
const displayEmail    = document.getElementById("displayEmail");
const avatarImg       = document.getElementById("avatarImg");

onAuthStateChanged(auth, async (usuario) => {
    if (!usuario) return;

    displayEmail.textContent    = usuario.email;
    displayUsername.textContent = usuario.displayName || usuario.email.split("@")[0];

    try {
        const docSnap = await getDoc(doc(db, "usuarios", usuario.uid));
        if (docSnap.exists() && docSnap.data().fotoPerfil) {
            mostrarFoto(docSnap.data().fotoPerfil);
        }
    } catch (error) {
        console.error("Error cargando foto:", error);
    }
});

function mostrarFoto(url) {
    avatarImg.src                = url;
    avatarImg.style.objectFit    = "cover";
    avatarImg.style.width        = "100%";
    avatarImg.style.height       = "100%";
    avatarImg.style.borderRadius = "50%";
}

// ===========================
// Editar foto de perfil
// ===========================
const btnEditarFoto = document.getElementById("btnEditarFoto");
const inputFoto     = document.getElementById("inputFoto");

btnEditarFoto.addEventListener("click", () => {
    inputFoto.click();
});

inputFoto.addEventListener("change", async () => {
    const archivo  = inputFoto.files[0];
    const usuario  = auth.currentUser;

    if (!archivo || !usuario) return;

    if (!archivo.type.startsWith("image/")) {
        showToast("Seleccioná una imagen válida");
        return;
    }

    if (archivo.size > 5 * 1024 * 1024) {
        showToast("La imagen no puede pesar más de 5MB");
        return;
    }

    showToast("Subiendo foto...");
    btnEditarFoto.disabled = true;

    try {
        // 1. Sube a Cloudinary
        const url = await subirImagenACloudinary(archivo);

        // 2. Guarda la URL en usuarios/{uid}
        await updateDoc(doc(db, "usuarios", usuario.uid), {
            fotoPerfil: url
        });

        // 3. Actualiza la URL en todas las publicaciones del usuario
        const q        = query(collection(db, "publicaciones"), where("uid", "==", usuario.uid));
        const snapshot = await getDocs(q);

        for (const documento of snapshot.docs) {
            await updateDoc(doc(db, "publicaciones", documento.id), {
                fotoPerfil: url
            });
        }

        // 4. Muestra la foto nueva en el avatar
        mostrarFoto(url);

        showToast("¡Foto actualizada!");

    } catch (error) {
        console.error(error);
        showToast("Error al subir la foto. Intentá de nuevo.");
    } finally {
        btnEditarFoto.disabled = false;
        inputFoto.value = "";
    }
});
