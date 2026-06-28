"use client";

import { useEffect, useState, useMemo } from "react";
import { getProject, ISheet } from "@theatre/core";

// We create a minimal programmatic state for the scroll animation
// rather than requiring the studio editor.
const heroAnimationState = {
  "sheetsById": {
    "Hero Scene": {
      "staticOverrides": {
        "byObject": {}
      },
      "sequence": {
        "type": "PositionalSequence",
        "length": 10,
        "tracksByObject": {}
      }
    }
  }
};

export function useScrollTheatre() {
  const [sheet, setSheet] = useState<ISheet | null>(null);

  // Initialize Theatre.js project
  useEffect(() => {
    // Only initialize once on client
    const project = getProject("Kareixo Hero", { state: heroAnimationState });
    const newSheet = project.sheet("Hero Scene");
    setSheet(newSheet);
  }, []);

  // Bind scroll to sequence position
  useEffect(() => {
    if (!sheet) return;

    const onScroll = () => {
      // Calculate scroll percentage (0 to 1) based on a specific height or full page
      // Here we assume the hero scene takes up the first window.innerHeight
      // and we want the animation to complete when we scroll past it.
      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      
      // We want the sequence to go from 0 to its full length (10 seconds)
      // Map scrollY from 0 -> windowHeight to 0 -> 10
      let progress = scrollY / windowHeight;
      progress = Math.max(0, Math.min(progress, 1));
      
      sheet.sequence.position = progress * 10;
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    
    // Initial call
    onScroll();

    return () => window.removeEventListener("scroll", onScroll);
  }, [sheet]);

  return sheet;
}
