# Mosaic release status

## Included in this package

- Fixed the standalone HTML build. `build-standalone.mjs` inserted each script with a string replacement, so a `$'` inside `audio-tracks-metadata.js` spliced the rest of the page into that script: it failed to parse, and about 16 scripts ran twice. The build now uses function replacers and verifies the final HTML (21 inline scripts, each present exactly once and each parseable).
- Mosaic app version 2.5.31.
- Improved film player accessibility: auto-hiding controls stay visible while keyboard focus is inside the controls or center play button, and resume hiding after focus leaves. Open player menus also keep the controls visible.
- Applied one shared refinement across navigation, buttons, form controls, dialogs, playlists, and settings: theme-aware browser controls, clear focus and disabled states, touch feedback, safer mobile dialog bounds, and restrained surface depth. The current navigation destination is now announced to assistive technology.
- Preserved normal vertical page scrolling when the pointer is over a shelf. Shift+wheel browses a shelf with a mouse, while trackpad horizontal scrolling continues to work naturally.
- Made each shelf position indicator interactive: drag or tap to jump through a row, or focus it and use arrow, page, Home, and End keys. The control exposes its current position to assistive technology and retains a comfortable pointer target on touch screens.
- Improved media shelf scrolling with a live position indicator, subtle edge cues, responsive arrow controls, mouse-wheel-to-horizontal scrolling, keyboard navigation, and snap alignment across shelf items. Touch scrolling stays native and reduced-motion settings are respected.
- Refined the original loading screen with a center-out tile reveal, dimensional tile highlights, a live numeric progress readout, gently transitioning status copy, and a clear Enter arrow. The progress number mirrors the accessible progress value; reduced-motion preferences remain respected.
- Rebuilt the home feature as a poster-forward editorial spotlight, with visible generated artwork, clearer film details, accessible play/save actions, and escaped user-facing title and synopsis text.
- Refined the desktop navigation, section headers, browse rails, cards, and add-files panel around Mosaic’s plum, cream, and gold visual identity. Responsive layouts and reduced-motion behavior are included.
- Preserved Mosaic’s original centered plum-and-gold manual loading screen and five-by-five color tile mark. Fixed the empty tile container so the mark actually appears.
- Kept the loading screen on profile changes and startup timeouts; Enter remains available when the library is still opening.
- Restored Mosaic’s 2.5.19 main-app presentation: the welcome copy, supporting labels, richer gradients, rounded media cards, and elevated library surfaces.
- Added a reproducible standalone HTML build that inlines the app stylesheet and scripts without an artificial file-size cap. It omits service-worker registration, the external font request, manifest, and separate icons.
- Retained the 2.5.20 removal of procedural grain and invented studio imprints from generated demo artwork.
- Split the inline application code into 22 ordered, deferred scripts grouped by feature; the service worker precaches them for offline startup. Core startup, local storage/import, accessibility, onboarding, media metadata, the tour, Reels, polish, motion, and profile/library add-ons have separate boundaries.
- File imports reject overlapping work cleanly, revoke temporary media URLs, and surface unreadable files. IndexedDB startup skips malformed records, writes report transaction failure when files are removed, and browser storage persistence rejections are handled.
- Moved all 17 embedded style blocks and 7 runtime style injections into one ordered `mosaic.css` asset. The CSS is now cached with the offline app shell; the rule order is preserved to keep existing visual behavior stable.
- Startup progress and status follow local library readiness with an eight-second fallback, keyboard focus handling, reduced-motion support, and English or Hindi status text.
- Refined the desktop shell, navigation, search bar, home feature, media cards, and phone navigation while preserving the warm plum, cream, and gold theme.
- Hid scrollbar indicators while media is actively playing and restored them on pause/stop; scrolling and timeline seeking remain functional.
- Kept the mini player hidden throughout the Reels tab and prevented short clips from reopening as mini-player items; films and music retain their dock behavior.
- Completed the film player control pass: wired the previously inert back-to-mini action, made the fit state accurate, synchronized the save and full-screen states, and routed the center play/pause action through the shared playback toggle.
- Grouped fit and full-screen actions into the transport rail, added visible buffering feedback, and kept title artwork behind film video until the first frame is decoded to avoid black loading gaps.
- Hardened the ±10-second buttons for unknown durations and media that cannot seek yet, with clear feedback instead of an uncaught browser exception.
- Smoothed page changes by removing overlapping view-transition and entrance effects; the remaining page fade is brief and reduced-motion aware.
- Prevented black Reels loading gaps by keeping generated cover artwork behind each clip until the browser decodes its first video frame; made feed scrolling respond directly instead of animating between gestures.
- Refined the full responsive product surface: calmer spacing, stronger title hierarchy, theme-aware highlights, more deliberate card and button depth, progressive motion, improved empty states, and reduced-motion support.
- Rebuilt generated sample artwork by media type and added film genres, years, ratings, and descriptive metadata for the sample catalog.
- Added saved per-profile avatar symbols, richer profile presentation, and an Avatar control in profile management; avatar settings join optional profile sync.
- Expanded Help with direct navigation actions and searchable answers for Reels gestures, the mini player, film and music playback, profiles, samples, and theme settings.
- Reels taps now hide/reveal overlays instead of pausing video, double-tap likes, and a dedicated center button pauses/resumes while respecting the user's paused state. On mobile, the immersive state also hides the app bars.
- Fixed the Tools → Comments player menu route, which had been attached before the menu existed. Made film fit/crop visible by using a viewport-sized cinema frame and added idle auto-hide/reveal behavior for film controls.
- Restored seek and transport controls to the music and clip layouts after film mode moves them into its overlay; the music screen now retains its separate album-art-first controls.
- Routed mini-player, full-player, keyboard, and menu play/pause through the same guarded toggle; the mini player has no Stop control.
- Refined the interface with consistent typography, card surfaces, navigation, settings, dialogs, responsive spacing, and Mosaic’s original warm plum, cream, and gold colour direction.
- Refined the film player with a theme-aware VLC-style menu bar, cinema surface, responsive transport controls, and a compact toolbar that expands to the complete secondary control set.
- Added pointer and touch timeline scrubbing, immediate keyboard seek feedback, slider accessibility values, and a more spacious full-screen layout.
- Fixed asynchronous play/pause state so the mini and full player follow media events, report rejected playback requests, and stay synchronized. Removed Stop from the mini player; Stop remains in the full player’s Playback menu.
- Corrected the player menu's inherited vertical layout, restored a high-contrast icon play/pause control, moved Comments into the Tools menu, and removed the duplicate floating Full screen button. The synthetic player artwork now follows playback time, freezes while paused, and avoids repainting unchanged frames.
- Added a full-screen film mode with overlaid menu, title, transport and seek controls; added a separate album-art-first music screen and a Spotify-inspired music dock with cover art.
- Applied the linked UI guidance to the player: restrained monochrome surfaces, one theme accent, subtle top lighting, and clearer spacing between controls.
- Removed Surprise me, replaced the late-night greeting with a natural time-based salutation, and refined playlist browsing with collection details, item reordering, removal, and rename actions.
- Gave the film, music, and clip players distinct screen proportions and moved intro/settings actions into the menu bar to reduce loose controls around the viewing surface.
- Kept the app’s browser-decoder boundary explicit. The player exposes playback, audio, video, subtitle, playlist, diagnostics, and view tools where the browser supports them.
- Custom theme colours preview live at animation-frame pace and save once on commit. Cross-tab theme sync does not rewrite settings or rerender the library. Video playback skips drawing a hidden animated canvas, and fullscreen keeps the player controls in view.
- Local-first Films, Music, Reels, and Lab experiences, with imported media stored in browser IndexedDB.
- Reels comments and creator tools stored per profile, plus recommendations and next-clip preloading.
- Search filters, recent searches, and voice search when the browser supports speech recognition.
- Music playlists, a persistent queue, LRC lyrics, audio tools, file-based album art, and Lab recording/export tools.
- Player menus and controls, subtitles, bookmarks, history, playback settings, PiP, browser remote playback, and feature-detected AirPlay. The service-worker cache was advanced so existing installs fetch this player update.
- Profile backups with library metadata, TV remote navigation, and direct-media offline saving when CORS and storage allow it.
- Settings controls to add or remove bundled demo titles for the current profile without affecting personal files.
- A System check in Help that checks local storage, browser APIs, and (when available) the sync endpoint with a ping only. It does not read media filenames or send a report.
- Optional self-hosted sync for all profiles' settings and lists, Reels comments, followed creators, and language through a dependency-free Node.js service. Compare-and-swap versions prevent stale devices from silently overwriting newer data.
- A Settings language picker with expanded English/Hindi coverage across navigation, profiles, onboarding, search, Reels, music, player, Lab, settings, and help. Dynamic control labels and accessibility attributes update correctly when controls change state. Media titles and user-written content remain unchanged; some UI strings remain English.

## Requires additional platform or product work

- **VLC/LibVLC playback:** not included. A true VLC engine needs Android and Windows native projects, LibVLC binaries, lifecycle/media-URI bridges, and per-device builds. This static web package uses the browser decoder; see `NATIVE_VLC_WINDOWS_ANDROID.md`.
- **Shared community comments:** require a moderated backend service; the included backend handles private profile/list sync only.
- **Guaranteed gapless playback and overlapping crossfade:** require a dual-deck audio engine; the current browser transition fades do not guarantee gapless or overlapping playback.
- **Complete Hindi translation:** the language switch covers common interface areas, but remaining strings need extraction, full translation, and fluent-speaker review.
- **Casting, embedded track selection, and codec support:** depend on browser, operating system, and receiver APIs. AirPlay uses WebKit’s route picker when exposed.

## Verification in version 2.5.31

- Ran the multi-file app and the rebuilt standalone HTML in headless Chromium. Uploaded WAV, MP3, FLAC, M4A, WebM and MKV files, plus H.264 MOV, through Add files: the review dialog, duplicate check, save, library views, playback, and persistence after reload all worked, and non-media files were skipped. No page errors.
- Checked the import dialog at a 390 px phone width with a very long filename: no horizontal overflow.
- Confirmed the rebuilt standalone has 21 inline scripts with no syntax errors (the previous standalone had 36 with one syntax error).
- Ran the backend and sync test suites: 13 passed, 0 failed.
- The `/api/sync?ping=1` 404 seen on a plain static server is the optional sync check and is expected when no sync backend is running.
- Not tested: real phones and tablets, HEVC video, very large files, and the Netlify deployment.

## Verification in version 2.5.22

- Parsed the 22 deferred scripts together in HTML order and confirmed the service worker precaches them in the same order.
- Confirmed the service worker syntax, package and manifest JSON, balanced CSS blocks, and existence of every precached app-shell file.
- Ran the existing backend and sync test suites: 13 passed, 0 failed.
- Browser-render visual review was not available in this workspace; responsive styles were checked from source.

## Verification in version 2.5.13

- Confirmed the playback UI state drives the scrollbar visibility class and Stop clears it, while overflow and the seek slider remain enabled.
- Compiled all 11 inline JavaScript blocks and `sw.js` with Node.js; parsed `manifest.webmanifest` as JSON.
- Audited film controls for an action on Back, shared center play/pause, stateful fit/save/full-screen labels, responsive transport grouping, and the first-frame artwork fallback.
- Confirmed the Reels tab suppresses the dock in feed, search, and grid views, while closing a short clip leaves the dock hidden.
- Exercised the ±10-second action with forward, backward, boundary, and unknown-duration cases; all produced the expected position or user feedback.
- Audited the player menu action map and repaired the previously unattached Comments menu action. Confirmed Stop does not appear in the mini-player markup and the mini button has an explicit shared toggle binding.
- Confirmed the active Reels pause state is shared with the autoplay observer so explicit pause remains paused.
- Exercised the playback state in a focused Node smoke harness: synthetic pause/resume, video play-pending cancellation, video resume, and pause all passed. Confirmed all 44 menu actions map to handlers.
- Parsed the 22 ordered classic scripts and service worker, confirmed every script is referenced by the HTML and pre-cache manifest, and ran the existing backend/sync suite (13 checks passed).
- Static source and packaging checks only; live interaction and rendered visual QA were not confirmed in this pass because the local browser preview is blocked by the environment.

## Validation inherited from version 2.5.4

- Hardened player keyboard shortcuts: dialogs and editable controls retain key behavior, and Reels navigation no longer changes the hidden player volume.
- Exercised player shortcut gates and cast-route selection in focused simulations for WebKit AirPlay, browser remote playback, and unsupported browsers.
- Parsed all inline application scripts and the service worker with Node.js.
- Ran the backend's eight built-in Node.js unit checks, including stale-write version rules.
- Confirmed the English/Hindi selector, expanded dictionary, dynamic label tracking, and preserved original strings are present in the app source.
- Parsed `manifest.webmanifest` as JSON.
- Statically checked the demo-data controls and verified that their actions operate on bundled demo titles only.
- Confirmed the deployable `index.html` matches the app source and that the ZIP contains the deployment files.

The backend checks cover payload and version validation, not an end-to-end server deployment; local TCP sockets were blocked in that environment. This report does not claim device-by-device or end-to-end certification.
