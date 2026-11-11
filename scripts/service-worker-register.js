/* Mosaic 2.5.31 — ordered app script 11 of 22. */
if('serviceWorker' in navigator&&/^https:$/.test(location.protocol)&&!(window.Capacitor&&Capacitor.isNativePlatform&&Capacitor.isNativePlatform()))addEventListener('load',()=>navigator.serviceWorker.register('sw.js').catch(()=>{}))
