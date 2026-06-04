// youtube url parsing, data api fetch, iframe api loader
import type { PlaylistVideo, Resource } from "@/types";

export function detectKind(url: string): Resource["kind"] {
  // a single video url with both v= and list= should still be treated as a video
  const hasVideo = /youtu\.be\/|[?&]v=|youtube\.com\/(?:embed|shorts|live)\//.test(url);
  if (hasVideo) return "video";
  if (/youtube\.com\/playlist|[?&]list=/.test(url)) return "playlist";
  if (/youtube\.com|youtu\.be/.test(url)) return "video";
  return "link";
}

export function extractPlaylistId(url: string): string | null {
  const m = url.match(/[?&]list=([a-zA-Z0-9_-]+)/);
  return m ? m[1] : null;
}

export function extractVideoId(url: string): string | null {
  // youtu.be/<id>
  let m = url.match(/youtu\.be\/([a-zA-Z0-9_-]{6,})/);
  if (m) return m[1];
  // youtube.com/watch?v=<id>
  m = url.match(/[?&]v=([a-zA-Z0-9_-]{6,})/);
  if (m) return m[1];
  // youtube.com/embed/<id> or /shorts/<id> or /live/<id>
  m = url.match(/youtube\.com\/(?:embed|shorts|live)\/([a-zA-Z0-9_-]{6,})/);
  if (m) return m[1];
  return null;
}

export async function fetchPlaylistVideos(
  playlistId: string,
  apiKey: string,
): Promise<PlaylistVideo[]> {
  const out: PlaylistVideo[] = [];
  let pageToken = "";
  for (let i = 0; i < 20; i++) {
    const url = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&maxResults=50&playlistId=${encodeURIComponent(playlistId)}&key=${encodeURIComponent(apiKey)}${pageToken ? `&pageToken=${pageToken}` : ""}`;
    const res = await fetch(url);
    if (!res.ok) {
      const txt = await res.text();
      throw new Error(`yt api ${res.status}: ${txt.slice(0, 200)}`);
    }
    const data = await res.json();
    for (const item of data.items || []) {
      const vid = item.contentDetails?.videoId;
      if (!vid) continue;
      out.push({
        videoId: vid,
        title: item.snippet?.title || vid,
        thumb:
          item.snippet?.thumbnails?.medium?.url ||
          item.snippet?.thumbnails?.default?.url ||
          "",
        done: false,
      });
    }
    if (!data.nextPageToken) break;
    pageToken = data.nextPageToken;
  }
  return out;
}

// singleton loader for the youtube iframe player api
let ytApiPromise: Promise<any> | null = null;
export function loadYouTubeAPI(): Promise<any> {
  if (typeof window === "undefined") return Promise.reject(new Error("no window"));
  const w = window as any;
  if (w.YT && w.YT.Player) return Promise.resolve(w.YT);
  if (ytApiPromise) return ytApiPromise;
  ytApiPromise = new Promise((resolve) => {
    const prev = w.onYouTubeIframeAPIReady;
    w.onYouTubeIframeAPIReady = () => {
      prev && prev();
      resolve(w.YT);
    };
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    document.head.appendChild(tag);
  });
  return ytApiPromise;
}
