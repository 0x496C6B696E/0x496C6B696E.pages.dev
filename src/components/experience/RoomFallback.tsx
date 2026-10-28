/**
 * CSS-only room: the base layer under the WebGL scene and the whole scene when WebGL is
 * unavailable, reduced motion is requested, or Explorer mode is on. One glowing CRT on a desk,
 * two racks of blinking lights. Static markup, so server and client render identically.
 */
export function RoomFallback({ animated }: { animated: boolean }) {
  return (
    <div className="room-scene" data-animated={animated ? "true" : "false"}>
      <div className="rack" style={{ left: "6%" }} />
      <div className="rack" style={{ left: "15%" }} />
      <div className="screen" />
      <div className="desk" />
    </div>
  );
}
