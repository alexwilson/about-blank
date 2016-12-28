chrome.tabs.getCurrent(tab => {
    chrome.tabs.update(tab.id, {
        "url": "https://ax.gy/about-blank"
    })
})