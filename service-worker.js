const CACHE_NAME = "final-game-cache-v1";
const urlsToCache = [
    "/",
    "/index.html",
    "/assets/icons/icon-192x192.png",
    "/assets/icons/icon-512x512.png",
    "/assets/localization/en.json",
    "/assets/localization/ar.json",
    "/assets/localization/ja.json",
    "/assets/scenarios/defaultScenario.txt",
    "/assets/bushgrowth.png",
    "/assets/character.png",
    "/assets/dirttile.png",
    "/assets/flowergrowth.png",
    "/assets/grassgrowth.png",
    "/assets/grasstiles.png",
    "/assets/grassymap.json",
    "/dist/main.js",
    "/dist/main.js.map",
    "/dist/prefabs/Cell.js",
    "/dist/prefabs/Cell.js.map",
    "/dist/prefabs/Player.js",
    "/dist/prefabs/Player.js.map",
    "/dist/scenes/PlayScene.js",
    "/dist/scenes/PlayScene.js.map",
    "/dist/scenes/PreloadScene.js",
    "/dist/scenes/PreloadScene.js.map",
    "/dist/utils/PlantDefinitions.js",
    "/dist/utils/PlantDefinitions.js.map",
    "/dist/utils/ScenarioParser.js",
    "/dist/utils/ScenarioParser.js.map",
    "/dist/utils/types.js",
    "/dist/utils/types.js.map",
    "/lib/StateMachine.js",
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