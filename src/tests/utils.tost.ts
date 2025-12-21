import { describe, it, expect } from "vitest";
import { cn } from "@/lib/utils";

describe("cn utility", () => {
  it("merges and deduplicates classes using tailwind-merge", () => {
    const result = cn("px-2", "px-4", "text-center");
    expect(result).toContain("px-4");
    expect(result).toContain("text-center");
  });
});
