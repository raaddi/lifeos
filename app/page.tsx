import type { Metadata } from "next";
import { headers } from "next/headers";
import LifeOS from "./LifeOS";

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "localhost:3000";
  const protocol = host.includes("localhost") || host.startsWith("127.0.0.1") ? "http" : "https";
  const origin = `${protocol}://${host}`;

  return {
    title: "LifeOS — centrum dowodzenia",
    description: "Uniwersalne centrum dowodzenia życiem, celami, energią i rozwojem.",
    metadataBase: new URL(origin),
    openGraph: {
      title: "LifeOS — centrum dowodzenia",
      description: "Twoja postać, dziedziny życia, plan i postęp w jednym intuicyjnym systemie.",
      type: "website",
      url: origin,
      locale: "pl_PL",
      images: [{ url: `${origin}/og-lobby-v2.png`, width: 1672, height: 941, alt: "LifeOS — w centrum jesteś Ty" }],
    },
    twitter: {
      card: "summary_large_image",
      title: "LifeOS — centrum dowodzenia",
      description: "Twoja postać, dziedziny życia, plan i postęp w jednym intuicyjnym systemie.",
      images: [`${origin}/og-lobby-v2.png`],
    },
  };
}

export default function Home() {
  return <LifeOS />;
}
