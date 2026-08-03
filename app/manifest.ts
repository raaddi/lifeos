import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "LifeOS — centrum dowodzenia",
    short_name: "LifeOS",
    description: "Osobisty system zarządzania życiem, nauką i rozwojem DxComp.",
    start_url: "/",
    display: "standalone",
    background_color: "#f4f3ee",
    theme_color: "#171b18",
    lang: "pl",
    icons: [{ src: "/favicon.svg", sizes: "any", type: "image/svg+xml" }],
  };
}
