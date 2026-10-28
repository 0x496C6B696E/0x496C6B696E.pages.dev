/**
 * Tiny pub/sub between the 3D camp and the HTML hub.
 * The scene projects each waystone's world position to screen space every frame and
 * publishes it; the hub moves its (real, accessible) links to those points without
 * React re-renders. Hover/focus flows the other way so the stone's rune can glow.
 */
import type { DestinationSlug } from "@/config/site";

export interface Anchor {
  /** CSS pixels from the viewport's top-left. */
  x: number;
  y: number;
  /** 0.8 .. 1.15, closer stones render slightly larger. */
  scale: number;
  visible: boolean;
}

export type Anchors = Partial<Record<DestinationSlug, Anchor>>;

type AnchorListener = (anchors: Anchors) => void;
type HoverListener = (slug: DestinationSlug | null) => void;

const anchorListeners = new Set<AnchorListener>();
const hoverListeners = new Set<HoverListener>();
let hovered: DestinationSlug | null = null;

export const sceneAnchors = {
  publish(anchors: Anchors) {
    for (const listener of anchorListeners) listener(anchors);
  },
  subscribe(listener: AnchorListener) {
    anchorListeners.add(listener);
    return () => {
      anchorListeners.delete(listener);
    };
  },
  /** True while the 3D scene is publishing; the hub falls back to a CSS ring otherwise. */
  get active() {
    return anchorListeners.size > 0;
  },
  setHovered(slug: DestinationSlug | null) {
    hovered = slug;
    for (const listener of hoverListeners) listener(slug);
  },
  getHovered() {
    return hovered;
  },
  subscribeHover(listener: HoverListener) {
    hoverListeners.add(listener);
    return () => {
      hoverListeners.delete(listener);
    };
  },
};
