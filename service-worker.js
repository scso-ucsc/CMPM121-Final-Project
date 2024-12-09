const CACHE_NAME = "final-game-cache-v1";
const urlsToCache = [
    "/",
    "index.html",
    "/dist/index.html",
    "/dist/assets/index-1Ad0PHsT.js",
    "/dist/assets/index-BCJSWicI.js",
    "/dist/assets/manifest-Cwxa1QtS.js",
    "dist/assets/icons/icon-192x192.png",
    "dist/assets/icons/icon-512x512.png",
    "dist/assets/localization/en.json",
    "dist/assets/localization/ar.json",
    "dist/assets/localization/ja.json",
    "dist/assets/scenarios/defaultScenario.txt",
    "dist/assets/bushgrowth.png",
    "dist/assets/character.png",
    "dist/assets/dirttile.png",
    "dist/assets/flowergrowth.png",
    "dist/assets/grassgrowth.png",
    "dist/assets/grasstiles.png",
    "dist/assets/grassymap.json",
    "dist/assets/advancebutton.png",
    "dist/assets/downbutton.png",
    "dist/assets/grassbutton.png",
    "dist/assets/flowerbutton.png",
    "dist/assets/leftbutton.png",
    "dist/assets/reapbutton.png",
    "dist/assets/rightbutton.png",
    "dist/assets/shrubbutton.png",
    "dist/assets/sowbutton.png",
    "dist/assets/upbutton.png",
    "dist/src/main.js",
    "dist/src/prefabs/Cell.js",
    "dist/src/prefabs/Player.js",
    "dist/src/scenes/PlayScene.js",
    "dist/src/scenes/PreloadScene.js",
    "dist/src/utils/PlantDefinitions.js",
    "dist/src/utils/ScenarioParser.js",
    "dist/src/utils/types.js",
    "dist/lib/StateMachine.js",
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