const CACHE = 'about:blank-v1'

self.addEventListener('install', event => {})

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.open(CACHE)
            .then(cache => cache.match(event.request)
                .then(response => upstreamFetch(event.request)
                    .catch(_ => response)
                )
            )
    )
})

const upstreamFetch = request => caches.open(CACHE)
    .then(cache => fetch(request)
        .then(response => cache.put(request, response.clone())
            .then(_ => response)
        )
    )