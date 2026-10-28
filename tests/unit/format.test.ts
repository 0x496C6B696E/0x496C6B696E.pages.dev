import { describe, expect, it } from "vitest";
import { formatDate, formatMonth, formatNumber, yearsBetween } from "@/lib/format";
import { decodeHandle } from "@/components/about/HandleDecoder";

describe("format", () => {
  it("formats dates and months", () => {
    expect(formatDate("2026-10-23T10:00:00Z")).toBe("23 Oct 2026");
    expect(formatMonth("2023-05-25T23:01:32Z")).toBe("May 2023");
    expect(formatDate(null)).toBe("");
    expect(formatDate("not a date")).toBe("");
  });
  it("counts whole years", () => {
    expect(yearsBetween("2023-05-25", new Date("2026-10-28"))).toBe(3);
    expect(yearsBetween("2023-05-25", new Date("2026-05-24"))).toBe(2);
    expect(yearsBetween("garbage")).toBe(0);
  });
  it("formats numbers with separators", () => {
    expect(formatNumber(1234)).toBe("1,234");
  });
});

describe("decodeHandle", () => {
  it("decodes the handle to its ASCII letters", () => {
    const bytes = decodeHandle("0x496C6B696E");
    expect(bytes.map((b) => b.char).join("")).toBe("Ilkin");
    expect(bytes[0].hex).toBe("49");
  });
});
