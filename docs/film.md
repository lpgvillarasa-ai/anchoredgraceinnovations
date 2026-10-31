# The homepage film

## What it is

The dark section under the hero plays a short film as visitors scroll: **Anchored, Built, Staffed.** It is about 10 seconds of footage made with Higgsfield.

The film is stored as still pictures, not a video file. A video cannot follow the scroll exactly, both forwards and backwards; a stack of pictures drawn on a canvas can. The player is `js/film.js`, and the pictures are served by `worker/film.mjs`.

## Where the pictures live

They are in Cloudflare R2, bucket `agi-website-media`, folder `film/`. They are not in this repo, because they are too large for the site's single Worker script.

| Path | What |
|---|---|
| `film/manifest.json` | The list the player reads. If it says `"sets": null`, or is missing, the film stays hidden. |
| `film/v2/hd/0001.webp` to `0121.webp` | Large or high-resolution screens: 2560x1440, about 14 MB in all |
| `film/v2/wide/0001.webp` to `0121.webp` | Other tablets and computers, and anyone with data saver on: 1920x1080, about 9.4 MB |
| `film/v2/tall/0001.webp` to `0061.webp` | Phones: 1080x1920, about 5 MB. The crop pans right with the subject. |
| `film/v1/...` | The first, softer version (1600x900). Kept, unused. |

Picture folders are versioned and cached for a year. **To change the film, upload a new folder (`film/v2/...`), then point `manifest.json` at it.** Never overwrite the pictures inside an existing folder: visitors' browsers would keep the old ones.

To hide the film again without deleting anything, set `manifest.json` to:

```json
{"ready": false, "sets": null}
```

## How it was made (31 Oct 2026)

v1 used about 168 Higgsfield credits. Lee found it soft and blocky on big screens. v2 is the same footage, sharpened to 4K with Bytedance Video Upscale (standard, AI-content preset, 4 credits per clip). Its frames were taken at 2560 and 1920 pixels wide and compressed more gently (WebP quality 84, or 80 on phones), so dark areas no longer band.

### v1

1. **Three stills** with GPT Image 2.5: 16:9, 2k, quality high. Stills B and C used still A as a style reference.
   - **A, Anchored:** a monumental brushed champagne-gold anchor standing in still black water at blue hour. A small four-pointed star of gold light glows above its ring. Low mist. The left third is dark, empty space for the words.
   - **B, Built:** the same water and mist. Gold lines of light assemble into floating glass website and app panels showing abstract layout only, with no readable text.
   - **C, Staffed:** a night workspace seen from behind, face not visible. A professional with a headset sits at a desk with a gold lamp and a laptop, in front of a window over a city of golden lights.
2. **Two clips** with Seedance 2.5 (omni reference, 5 s, 1080p, no audio): A to B, then B to C. Each is one continuous slow camera move with no cuts. In the first clip the anchor dissolves into gold particles that form the panels; in the second the camera glides through the panels into the workspace.
3. **Frames.** The two clips were joined (the second clip's first frame dropped, as it repeats the first clip's last), giving 241 frames. Sampled evenly to 120 wide frames (WebP quality 62) and 60 phone frames, a 9:16 crop whose centre moves from 62% to 76% of the width (WebP quality 58).

Size budget: under 6 MB on computers and 3 MB on phones. The player loads only after the rest of the page has finished loading, and only when the visitor is near the film.

## Marketing video samples

The "Marketing videos" section under the work gallery shows four reels Lee made for Seikomods Premium, shown with their brand at Lee's OK (31 Oct 2026). The list is `AGI_VIDEOS` in `js/projects.js`.

- **Where they live:** R2 folder `reels/v1/`, served by `worker/film.mjs`. It supports the partial requests iPhones need for video.
- **The files:** 720x1280 H.264 with a cover still each, 2 to 3 MB apiece.
- **How they play:** each plays silently on a loop while it is mostly on screen, and pauses when it leaves. "Tap for sound" turns sound on for one video at a time.
- **Motion turned off:** nothing plays by itself; the normal controls show instead.
