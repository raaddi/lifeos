import type { Metadata } from "next";
import { headers } from "next/headers";
import LifeOS from "./LifeOS";

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "localhost:3000";
  const protocol = host.includes("localhost") || host.startsWith("127.0.0.1") ? "http" : "https";
  const origin = `${protocol}://${host}`;

  return {
    title: "LifeOS — całe życie w jednym miejscu",
    description: "Plan dnia i tygodnia, notatki, rutyny oraz obszary życia w jednym uporządkowanym systemie.",
    metadataBase: new URL(origin),
    openGraph: {
      title: "LifeOS — całe życie w jednym miejscu",
      description: "Plan, notatki, rutyny i pełny obraz życia bez trzymania wszystkiego w głowie.",
      type: "website",
      url: origin,
      locale: "pl_PL",
      images: [{ url: `${origin}/og-life-dashboard-v4.png`, width: 1672, height: 941, alt: "LifeOS — wszystko, co ważne, w jednym miejscu" }],
    },
    twitter: {
      card: "summary_large_image",
      title: "LifeOS — całe życie w jednym miejscu",
      description: "Plan, notatki, rutyny i pełny obraz życia bez trzymania wszystkiego w głowie.",
      images: [`${origin}/og-life-dashboard-v4.png`],
    },
  };
}

export default function Home() {
  return <LifeOS />;
}
