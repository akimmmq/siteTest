const _targetWebsiteAddress = 'ahmadshah.net'

export default {
    targetWebsiteAddress: _targetWebsiteAddress,
    isDebug: !document.location.href.includes(_targetWebsiteAddress),
    vueUrl: 'https://unpkg.com/vue@3/dist/vue.esm-browser.js',
    dateStringOptions: {
        weekday: 'short',
        year: 'numeric',
        month: 'numeric',
        day: 'numeric'
    }
}