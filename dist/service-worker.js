const CACHE_NAME = "final-game-cache-v1";
const urlsToCache = [
    "/",
    "index.html",
    "assets/index-1Ad0PHsT.js",
    "assets/index-BCJSWicI.js",
    "manifest-DyTKDE9T.json",
    "assets/icons/icon-192x192.png",
    "assets/icons/icon-512x512.png",
    "assets/localization/en.json",
    "assets/localization/ar.json",
    "assets/localization/ja.json",
    "assets/scenarios/defaultScenario.txt",
    "assets/bushgrowth.png",
    "assets/character.png",
    "assets/dirttile.png",
    "assets/flowergrowth.png",
    "assets/grassgrowth.png",
    "assets/grasstiles.png",
    "assets/grassymap.json",
    "assets/advancebutton.png",
    "assets/downbutton.png",
    "assets/grassbutton.png",
    "assets/flowerbutton.png",
    "assets/leftbutton.png",
    "assets/reapbutton.png",
    "assets/rightbutton.png",
    "assets/shrubbutton.png",
    "assets/sowbutton.png",
    "assets/upbutton.png",
]

self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                return cache.addAll(urlsToCache);
            })
            .catch((error) => {
                console.error("Failed to open cache:", error);
            })
    );
});

self.addEventListener("fetch", (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                if (response) {
                    return response;
                }
                return fetch(event.request);
            })
    );
});

self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        if (cacheName !== CACHE_NAME) {
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
    );
});