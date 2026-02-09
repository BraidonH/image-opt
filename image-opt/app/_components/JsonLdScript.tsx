"use client";

import { useEffect } from "react";

export default function JsonLdScript({ content }: { content: string }) {
  useEffect(() => {
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.textContent = content;
    document.head.appendChild(script);
    return () => {
      document.head.removeChild(script);
    };
  }, [content]);
  return null;
}
