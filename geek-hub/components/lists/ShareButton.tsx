"use client";

import { Share2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface ShareButtonProps {
  title: string;
  isPublic: boolean;
  // Є лише у власника: приватним списком поділитися не можна — пропонуємо
  // зробити його публічним прямо з тосту.
  onMakePublic?: () => void;
}

export function ShareButton({ title, isPublic, onMakePublic }: ShareButtonProps) {
  const share = async () => {
    if (!isPublic) {
      toast("This list is private", {
        description: "Only you can open it. Make it public to share the link.",
        action: onMakePublic ? { label: "Make public", onClick: onMakePublic } : undefined,
      });
      return;
    }

    const url = window.location.href;
    // На мобільних — нативне меню "Поділитися", на десктопі — копіювання.
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
        return;
      } catch (error) {
        if ((error as Error).name === "AbortError") return;
      }
    }
    await navigator.clipboard.writeText(url);
    toast.success("Link copied to clipboard");
  };

  return (
    <Button variant="outline" onClick={share}>
      <Share2 /> Share
    </Button>
  );
}
