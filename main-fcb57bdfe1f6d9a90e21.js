/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.l = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };

/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};

/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};

/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports) {

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
const _randomUnsplashImage = _ => fetch('https://source.unsplash.com/category/buildings/1920x1200').then(res => res.url)

// Bound to an Element this adjusts innerText to reflect the current time.
function displayTime() {
    const currentTime = new Date()
    this.innerText = currentTime.toLocaleTimeString('en-US')
}

// Toggles the visibility of the settings container.
const hideShowSettingsContainer = e => {
    e.preventDefault()
    const settingsContainer = document.querySelector('.settings__container')
    settingsContainer.setAttribute('aria-hidden', settingsContainer.getAttribute('aria-hidden') === "false" ? "true" : "false")
}

window.addEventListener('load', _ => {

    const clockElement = document.querySelector('.ab-time__clock')
    const incrementClock = displayTime.bind(clockElement)
    const clock = setInterval(incrementClock, 1000)
    incrementClock()

    const settingsOpenButton = document.querySelector('.about-blank__settings-button')
    const settingsCloseButton = document.querySelector('.settings__close-button')
    settingsOpenButton.addEventListener('click', hideShowSettingsContainer)
    settingsCloseButton.addEventListener('click', hideShowSettingsContainer)

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

    const debugPad = document.querySelector('.settings__debug')
    store.addEventListener('update', e => {
        debugPad.innerText = JSON.stringify(store.state, null, 2)
    })
})

// Simplistic store, allowing us to store minimal information offline via localStorage.
class AboutBlankStore {

    // Initial state.
    get initialState() {
        return {
            version: 1,
            createdAt: Date.now()
        }
    }

    // Constructor, takes an argument specifying which localStorage key to use.
    constructor(stateStorageKey = '__ABOUT:BLANK_PREVIOUS_STATE__') {
        this.stateStorageKey = stateStorageKey
        this.state = {}
        this.listeners = {
            update: []
        }
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
        const newState = Object.assign(this.state, state)
        this._dispatchEvent('update', { state: this.state, newState })
        this.state = newState
        this._saveState()
    }

    // Dispatches events.
    async _dispatchEvent(type, event = {}) {
        this.listeners[type].forEach(f => f(event))
    }

    // Allows subscribing to a state change.
    addEventListener(type, listener) {
        if (this.listeners[type] instanceof Array
            && listener instanceof Function) {
            this.listeners[type].push(listener);
        }
    }

    // Unsubscribe from state changes.
    removeEventListener(type, listener) {
        for (let subscriber in this.listeners[type]) {
            if (subscriber === listener) {
                let index = this.listeners[type].indexOf(subscriber)
                this.listeners[type].splice(index, 1)
            }
        }
    }
}

/***/ })
/******/ ]);