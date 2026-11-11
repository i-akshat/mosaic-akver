# Mosaic local-first data model

## What runs locally today

- Imported media bytes live in IndexedDB (`mosaic`, object store `f`) in the browser profile and origin where the user added them.
- Profile settings, saved titles, playlists, watch progress, Reels comments, followed creators, language choice, and other small preferences live in profile-scoped `localStorage` keys.
- The service worker caches the static app shell after an HTTPS visit. It does not copy media into its cache.
- `MosaicData` exposes the current storage schema and boundaries to the app. The JSON profile backup includes profile-scoped settings, collections, watch progress, and media metadata; it deliberately excludes media bytes and sync credentials.

## Moving to another device

Deploy the same static build at the same HTTPS origin on each device. Install/open it once, restore the JSON profile backup in Settings, and add the media files on that device. Mosaic reconnects saved metadata when the re-added file has the same name and byte size. Browser storage is isolated by origin and device, so a JSON backup cannot transport a movie file. Use a separate file transfer or later add a media server if users need one shared library.

Direct HTTP(S) media can be saved for offline playback from the player when the server permits browser CORS access and the device has enough browser storage. This does not download HLS/DASH playlists or bypass source-server restrictions.

## Backend migration seam

Keep the local IndexedDB and localStorage implementation as the default provider. When a backend is introduced, add a provider behind the app's media and profile-data operations, preserve the existing local schema as an offline cache, and sync metadata separately from large media assets. Stable media IDs and schema-versioned migrations are required before enabling cross-device sync. Uploading media should be an explicit, separate feature with storage limits and clear user choice.

The current app can run without a backend. Optional private sync copies profile metadata and Reels comments between devices, never media bytes. Public shared comments and remote catalog services need separate services and do not make local playback depend on a server.

## Player boundary

Mosaic Player supplies the in-app controls and display preferences while the browser decodes the selected file. Browser/OS codec support varies. Replacing that decoder with LibVLC later requires native player views and a platform build for each target; the controls and library model can remain Mosaic-owned.
