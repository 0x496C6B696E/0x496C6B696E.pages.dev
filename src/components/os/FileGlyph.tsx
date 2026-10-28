import { siFirefoxbrowser } from "simple-icons";
import { Trash2 } from "lucide-react";
import { cn } from "@/lib/cn";

/** "profile.md" -> "md"; folders ("projects/") have no extension. */
export function fileExt(file: string): string {
  if (file.endsWith("/")) return "";
  const dot = file.lastIndexOf(".");
  return dot === -1 ? "" : file.slice(dot + 1).toLowerCase();
}

/** A blue folder, drawn with CSS. */
export function FolderGlyph({ className }: { className?: string }) {
  return <span className={cn("glyph-folder", className)} aria-hidden="true" />;
}

/** A sheet of paper with a folded corner and the extension printed on it. */
export function FileGlyph({ ext, className }: { ext: string; className?: string }) {
  return (
    <span className={cn("glyph-file", className)} data-ext={ext} aria-hidden="true">
      <span>{ext}</span>
    </span>
  );
}

/** Folder or file glyph for a path such as "projects/" or "skills.json". */
export function EntryGlyph({ file, className }: { file: string; className?: string }) {
  return file.endsWith("/") ? <FolderGlyph className={className} /> : <FileGlyph ext={fileExt(file)} className={className} />;
}

export function BrowserGlyph({ className }: { className?: string }) {
  return (
    <span className={cn("glyph-round", className)} aria-hidden="true" style={{ color: `#${siFirefoxbrowser.hex}` }}>
      <svg viewBox="0 0 24 24" fill="currentColor" focusable="false">
        <path d={siFirefoxbrowser.path} />
      </svg>
    </span>
  );
}

export function TrashGlyph({ className }: { className?: string }) {
  return (
    <span className={cn("glyph-round glyph-trash", className)} aria-hidden="true">
      <Trash2 />
    </span>
  );
}
