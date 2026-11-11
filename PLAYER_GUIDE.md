# Mosaic Player guide

## Open the player

Start a film or clip. Films open in a full-viewport cinema view, with the title and icon menus over the picture and the timeline and transport controls along its lower edge. The back arrow returns to the mini player. While playing, the controls fade after a short idle period; move the pointer or tap the picture to bring them back. **Fit / crop** changes the actual video framing. Title artwork stays visible until the first video frame is ready, and a buffering badge appears if playback stalls. Music opens a separate album-art-first listening view. Clips keep their source aspect ratio and do not appear in the mini player; the mini player is also hidden while browsing Reels. The player menus group actions under Media, Playback, Audio, Video, Subtitle, Tools, View, and Help. **More controls** reveals secondary playback controls. Intro markers, stop, and detailed player settings live inside the menus. The mini player has one synchronized play/pause button; tap the title or artwork to reopen the full player.

## Reels gestures

Swipe vertically to move between clips. Tap the picture to hide or reveal Reels overlays; on a phone this also hides the app bars for an immersive view. Double-tap the picture to like a clip. The center button pauses or resumes video without changing the overlay state. Explicitly paused clips stay paused until resumed or until you move to another clip.

## Included controls

- **Playback:** pointer/touch scrubbing with seek previews, keyboard timeline seeking, speed, skip-intro markers, chapters when exposed by the browser, repeat, shuffle, A–B repeat, bookmarks, sleep timer, queue, resume, and playback history. Play/pause follows the browser media events and reports rejected play requests.
- **Mini player:** persistent cover art, music artist/title, progress, one synchronized play/pause button, and an accessible control to reopen the full player.
- **Playlists:** open a collection, play all, rename it, reorder or remove individual items, and delete a collection after confirmation.
- **Media-specific surfaces:** films use an immersive cinema frame with overlaid controls; music uses an album-art-first Spotify-inspired layout and dock; clips adapt to the source aspect ratio.
- **Audio:** local equalizer presets and bands, bass boost, compressor/limiter, external audio tracks kept in sync, sync offset, output-device selection when supported, and up to one second of Web Audio delay.
- **Subtitles:** load SRT/VTT/LRC files; select browser-exposed embedded caption tracks; adjust external subtitle timing, size, color, and font.
- **Picture:** fit/crop/stretch, aspect ratio, brightness, contrast, saturation, hue, rotate, flip, picture-in-picture, full screen, and Cast/AirPlay when the browser exposes a route picker.
- **Tools:** media information, snapshots, approximate frame stepping, queue search/reorder/remove, M3U import/export, folder import, direct HTTP(S) URLs, and hover seek previews.
- **Capture:** user-selected screen or camera capture to WebM where the browser supports `getDisplayMedia` / `getUserMedia` and `MediaRecorder`. This records a selected screen or camera source; it does not extract or record the underlying network stream.

## Browser and VLC boundary

Mosaic owns the library, controls, and local history, while the browser/operating system decodes media. Container names are not enough: an MKV may contain codecs the browser cannot decode, and HEVC support varies by device. Mosaic accepts common formats for a browser compatibility check and shows a decoding error with next steps when the browser rejects them.

A web page cannot directly provide DVD/Blu-ray device playback, general RTSP/UDP/IPTV reception, broad codec support, or general-purpose transcoding. Those need a native integration such as LibVLC/VLC or a media server. The current browser player does not launch VLC as its decoding engine. Its track-transition fades do not guarantee gapless playback or overlapping crossfade between arbitrary local files.

Other APIs vary by browser: embedded audio track switching, subtitle tracks, chapter lists, remote playback, PiP, output-device selection, directory picking, and exact frame seeking. Mosaic uses the browser Remote Playback API where available and the WebKit AirPlay route picker on Apple browsers when exposed. A compatible receiver is still required. See [Apple’s AirPlay web media guidance](https://developer.apple.com/documentation/webkitjs/adding_an_airplay_button_to_your_safari_media_controls). Frame-step controls seek by about 1/30 second and are approximate because HTML media does not expose frame-accurate decoding.

External subtitle font/color/size/timing controls apply to subtitles loaded into Mosaic's own overlay. Embedded subtitle appearance is controlled by the browser. Snapshots of protected or cross-origin media may be blocked by browser canvas security.

## Playlist and storage notes

M3U exports include Mosaic item IDs for items already in the local library. Those IDs resolve only in the same Mosaic profile/library; local media bytes are not embedded in an M3U. HTTP(S) links work only when the target server allows browser playback. Folder imports use a browser directory picker and add files to the current device's IndexedDB library. Direct HTTP(S) media can be saved offline after an explicit click when the server permits CORS and local storage has room.

Playback history, settings, watch progress, queues, playlists, and media metadata stay in the browser profile. The imported audio/video bytes stay in IndexedDB on the device where they were added. Profile backups include library metadata; re-add the same files with matching names and sizes on the second device to reconnect saved IDs, titles, and progress.
