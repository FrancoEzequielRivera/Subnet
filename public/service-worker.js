const CACHE_NAME = "subnet-cache-v1";

const urlsToCache = [
    "./",
    "./index.html",
    "./css/styles.css",
    "./js/app.js",
    "./manifest.json",
    "./assets/icons/icon-192.png",
    "./assets/icons/icon-512.png",
    "./offline.html",
    "https://fonts.googleapis.com/css2?family=Hammersmith+One&family=Inter:ital,wght@0,300;0,400;0,500;0,600;1,300&display=swap",
    "./iniciar_sesion.html",
    "./js/login.js",
    "./perfil.html",
    "./css/perfil.css",
    "./js/perfil.js",
];

// INSTALL: guarda los archivos iniciales en caché
self.addEventListener("install", (event) => {
    console.log("Service Worker: Instalando...");

    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log("Cacheando archivos...");
            return cache.addAll(urlsToCache);
        })
    );
});

// ACTIVATE: limpia cachés viejos
self.addEventListener("activate", (event) => {
    console.log("Service Worker: Activado");

    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cache) => {
                    if (cache !== CACHE_NAME) {
                        console.log("Borrando caché viejo:", cache);
                        return caches.delete(cache);
                    }
                })
            );
        })
    );
});

// FETCH: estrategia Network First
// Intenta traer la respuesta de la red; si falla, busca en caché.
// Si tampoco está en caché, muestra offline.html
self.addEventListener("fetch", (event) => {
    event.respondWith(
        fetch(event.request)
            .then((response) => {
                // Guarda en caché la respuesta nueva
                return caches.open(CACHE_NAME).then((cache) => {
                    cache.put(event.request, response.clone());
                    return response;
                });
            })
            .catch(() => {
                // Sin red: busca en caché o muestra offline.html
                return caches.match(event.request).then((response) => {
                    return response || caches.match("./offline.html");
                });
            })
    );
});
