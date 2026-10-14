import type { Metadata } from "next";
import { PipelineSettings } from "@/components/settings/PipelineSettings";

export const metadata: Metadata = { title: "Pipeline" };

export default function PipelinePage() {
  return <PipelineSettings />;
}
