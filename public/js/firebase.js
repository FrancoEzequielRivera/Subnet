import { initializeApp }  from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";
import { getAuth }        from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";
import { getFirestore }   from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";
import { getStorage }     from "https://www.gstatic.com/firebasejs/10.13.2/firebase-storage.js";

// 🔴 Reemplazá con tu config real de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyCUea1BO4Rqkm6qwSfM_kgZGtPkxnzaZ0U",
    authDomain: "subnet-d40fa.firebaseapp.com",
    projectId: "subnet-d40fa",
    storageBucket: "subnet-d40fa.firebasestorage.app",
    messagingSenderId: "944401117841",
    appId: "1:944401117841:web:88ea469f06c3d031b30530"
};

const app = initializeApp(firebaseConfig);

export const auth    = getAuth(app);
export const db      = getFirestore(app);
export const storage = getStorage(app);
