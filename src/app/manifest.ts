import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Impara l'italiano — Italian vocabulary trainer",
    short_name: "Italiano",
    description:
      "Learn Italian vocabulary with spaced repetition, typing practice and verb drills.",
    start_url: "/",
    display: "standalone",
    background_color: "#0f1115",
    theme_color: "#0f1115",
    icons: [
      { src: "/icon", sizes: "512x512", type: "image/png", purpose: "any" },
      {
        src: "/icon",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
