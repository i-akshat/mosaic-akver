# Native VLC for Windows and Android

## Current package boundary

This deployment is a browser app/PWA. It does not contain an Android Studio project, a Windows app project, LibVLC binaries, or an embedded VLC view. The in-app player controls media through the browser's `<video>` and `<audio>` elements. Installing this PWA on Windows or Android does not add VLC codecs.

The existing HTML can remain Mosaic's library and interface, but a real LibVLC engine requires native host projects, platform media views, native file access, and a bridge between the web UI and each host. The builds must be produced and signed separately for Windows and Android. This ZIP does not claim that native VLC playback is implemented.

## Suggested integration shape

Keep the library UI and browsing features in Mosaic's web layer. Add a narrow player-engine interface so the web app can choose either the current browser player or a native engine. A practical .NET split is a .NET MAUI Android host using `LibVLCSharp.MAUI` with `VideoLAN.LibVLC.Android`, plus a WPF Windows host using `LibVLCSharp.WPF` with `VideoLAN.LibVLC.Windows`. Share the C# player service and message contract, while each host owns its native video view and WebView bridge. LibVLCSharp's MAUI `MediaPlayerElement` targets mobile views; Windows can use the dedicated WPF integration. A simpler Windows-only fallback is to hand unsupported files to separately installed VLC, but that is not playback inside Mosaic.

The compatible stable package families listed by VideoLAN are LibVLCSharp 3.x and LibVLC 3.x. The versions checked for this integration note are `LibVLCSharp` / `LibVLCSharp.WPF` 3.10.2, `VideoLAN.LibVLC.Windows` 3.0.24, and the stable Android native package `VideoLAN.LibVLC.Android` 3.6.5. Pin and re-check compatible versions during the actual build; package releases and platform requirements change. The Android native package is large, so expect a separate, substantially larger APK than the web ZIP.

Use one documented bridge contract across both hosts:

- Commands: open a granted media URI, play, pause, seek, set volume/speed, select audio/subtitle track, set subtitle URI, and stop.
- Events: ready, position/duration, playing/paused, track lists and selected track, ended, and recoverable playback error.
- The library should store a URI/permission reference and metadata, not copy or upload the media file. Android removable/cloud providers can revoke access, so surface a relink action when a saved URI no longer works.
- Keep Mosaic's queue, history, resume position, and accessible controls in the web layer; let LibVLC own decoding, track selection, and native rendering.

## Platform work still required

1. Create and check in Android and Windows native host projects with reproducible dependency versions and build instructions.
2. Pin compatible LibVLC builds for each architecture and package their native libraries with the apps.
3. Implement lifecycle-safe video views, URI/file-picker permissions, audio focus, background behavior, track selection, subtitles, seeking, and error reporting.
4. Connect Mosaic's existing player actions to the bridge and keep the browser engine as a fallback when the native host is absent.
5. Build and run on real Windows and Android devices. Verify supported containers/codecs against the exact packaged LibVLC builds; do not promise a format from its extension alone.
6. Sign installers/APKs and publish the platform-specific artifacts alongside the static web ZIP.
7. Review notices, redistribution obligations, and packaging for the selected LibVLC/LibVLCSharp builds before distributing the native apps.

Until those steps are complete, use this package's player for browser-compatible media or open unsupported files with desktop VLC. The web package's VLC-inspired menus are an interface organization; they do not make the browser decoder LibVLC.

## VideoLAN references

- [LibVLCSharp official repository and platform/package guide](https://github.com/videolan/libvlcsharp)
- [LibVLCSharp.MAUI package](https://www.nuget.org/packages/LibVLCSharp.MAUI/3.10.2)
- [VideoLAN.LibVLC.Android package](https://www.nuget.org/packages/VideoLAN.LibVLC.Android/3.6.5)
- [VideoLAN.LibVLC.Windows package](https://www.nuget.org/packages/VideoLAN.LibVLC.Windows/3.0.24)
