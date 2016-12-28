// Sets a background image.
const _loadBackgroundImage = src => {
    const aboutBlankContainer = document.querySelector('.about-blank__background')
    aboutBlankContainer.style.backgroundImage = `url(${src})`
    aboutBlankContainer.classList.toggle('about-blank__background--loaded', !!src)
    return src
}

// Asynchronously downloads an image.
const _downloadImage = src => new Promise((resolve, reject) => {
    const downloadingImage = new Image()
    downloadingImage.addEventListener('load', _ => resolve(src))
    downloadingImage.addEventListener('error', er => reject(er))
    downloadingImage.src = src
})

// Retrieves a random image from unsplash.
const _randomUnsplashImage = _ => fetch('https://source.unsplash.com/category/buildings').then(res => res.url)

window.addEventListener('load', _ => {
    store = new AboutBlankStore()
    store.load()
        .then(_ => store.state.backgroundImage || _randomUnsplashImage())
        .then(_downloadImage)
        .then(_loadBackgroundImage)
        .then(src => store.setState({ backgroundImage: src }))
        .catch(console.error)
        .then(_randomUnsplashImage)
        .then(_downloadImage)
        .then(src => store.setState({ backgroundImage: src }))
        .catch(console.error)
})

// Simplistic store, allowing us to store minimal information offline via localStorage.
class AboutBlankStore {

    // Initial state.
    get initialState() {
        return {
            version: 1,
        }
    }

    // Constructor, takes an argument specifying which localStorage key to use.
    constructor(stateStorageKey = '__ABOUT:BLANK_PREVIOUS_STATE__') {
        this.stateStorageKey = stateStorageKey
        this.state = {}
    }

    // Hydrates the state based on localStorage.
    // Required if you care about preserving data.
    load() {
        return new Promise((resolve, reject) => {
            this._loadState()
                .then(state => this.setState(state))
                .then(resolve)
                .catch(reject)
        })
    }

    // Attempts to load state from LocalStorage, and applies current minimum state to it.
    _loadState() {
        return new Promise((resolve, reject) => {
            try {
                const state = JSON.parse(localStorage.getItem(this.stateStorageKey)) || {}
                resolve(Object.assign(this.initialState, state))
            } catch (e) {
                reject(e)
            }
        })
    }

    // Persist data in LocalStorage.
    async _saveState() {
        const serializedState = JSON.stringify(this.state)
        localStorage.setItem(this.stateStorageKey, serializedState)
    }

    // Mimics React API, allowing to replace the current state with a diff.
    setState(state) {
        this.state = Object.assign(this.state, state)
        this._saveState()
    }
}