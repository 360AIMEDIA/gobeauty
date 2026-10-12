import type { Metadata } from "next";
import AiVisibilityForm from "@/components/AiVisibilityForm";

export const metadata: Metadata = {
  title: "AI Visibility Check",
  description:
    "Enter a beauty business website and a work email. See a 0–100 public-page score and a score for ChatGPT, Perplexity, Gemini, and Google AI.",
  alternates: { canonical: "/ai-visibility" },
  openGraph: {
    title: "AI Visibility Check | goBeauty.ai",
    description: "A public-page score for a salon, spa, or beauty brand website.",
    url: "https://www.gobeauty.ai/ai-visibility",
  },
};

export default function AiVisibilityPage() {
  return <AiVisibilityForm />;
}
