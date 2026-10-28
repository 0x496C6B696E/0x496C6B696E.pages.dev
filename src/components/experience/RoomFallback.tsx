/**
 * CSS-only backdrop: a modern wallpaper (two slow colour blobs over a faint grid). It is the
 * base layer under the WebGL room and the whole backdrop when WebGL is unavailable, reduced
 * motion is requested, or Explorer mode is on. Static markup, so server and client match.
 */
export function RoomFallback({ animated }: { animated: boolean }) {
  return (
    <div className="wallpaper" data-animated={animated ? "true" : "false"}>
      <div className="blob blob-a" />
      <div className="blob blob-b" />
      <div className="grid" />
    </div>
  );
}
