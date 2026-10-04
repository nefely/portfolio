"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { Profile } from "@/types/library";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/lib/supabase/client";
import { updateProfile } from "@/lib/library/profiles";
import { queryKeys } from "@/lib/query/keys";
import { profileOptions } from "@/lib/query/userData";
import { BIO_MAX, DISPLAY_NAME_MAX, hasErrors, validateProfile } from "@/lib/validation/forms";

export function ProfileForm({ userId, email }: { userId: string; email: string }) {
  const { data: profile, isPending } = useQuery(profileOptions(userId));
  if (isPending) return <Skeleton className="mt-8 h-80 rounded-2xl" />;
  if (!profile) return <p className="mt-8 text-destructive">Profile not found.</p>;
  // key: після збереження форма перемонтовується з новими значеннями.
  return <ProfileFields key={profile.username} profile={profile} email={email} />;
}

function ProfileFields({ profile, email }: { profile: Profile; email: string }) {
  const queryClient = useQueryClient();
  const [username, setUsername] = useState(profile.username);
  const [displayName, setDisplayName] = useState(profile.displayName ?? "");
  const [bio, setBio] = useState(profile.bio ?? "");
  const [errors, setErrors] = useState<ReturnType<typeof validateProfile>>({});

  const save = useMutation({
    mutationFn: () =>
      updateProfile(createClient(), profile.userId, {
        username,
        displayName: displayName.trim() || null,
        bio: bio.trim() || null,
      }),
    onSuccess: (saved) => {
      queryClient.setQueryData(queryKeys.profile(saved.userId), saved);
      toast.success("Profile saved");
    },
    onError: (error: { code?: string; message: string }) => {
      if (error.code === "23505") setErrors({ username: "This username is already taken." });
      else toast.error(error.message);
    },
  });

  const dirty =
    username !== profile.username ||
    displayName !== (profile.displayName ?? "") ||
    bio !== (profile.bio ?? "");

  return (
    <form
      className="mt-8 space-y-5 rounded-2xl border bg-card p-6"
      onSubmit={(event) => {
        event.preventDefault();
        const validation = validateProfile({ username, displayName, bio });
        setErrors(validation);
        if (!hasErrors(validation)) save.mutate();
      }}
    >
      <div className="space-y-1.5">
        <Label htmlFor="email">Email</Label>
        <Input id="email" value={email} disabled />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="username">Username</Label>
        <div className="relative">
          <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm text-muted-foreground">
            @
          </span>
          <Input
            id="username"
            value={username}
            onChange={(event) => setUsername(event.target.value.toLowerCase())}
            className="pl-7"
            aria-invalid={Boolean(errors.username)}
          />
        </div>
        {errors.username && <p className="text-xs text-destructive">{errors.username}</p>}
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="displayName">Display name</Label>
        <Input
          id="displayName"
          value={displayName}
          onChange={(event) => setDisplayName(event.target.value)}
          maxLength={DISPLAY_NAME_MAX}
          placeholder="Shown instead of your username"
        />
        {errors.displayName && <p className="text-xs text-destructive">{errors.displayName}</p>}
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="bio">Bio</Label>
        <Textarea
          id="bio"
          value={bio}
          onChange={(event) => setBio(event.target.value)}
          maxLength={BIO_MAX}
          rows={3}
          placeholder="Favorite genres, current obsession…"
        />
        {errors.bio && <p className="text-xs text-destructive">{errors.bio}</p>}
      </div>
      <Button type="submit" disabled={!dirty || save.isPending}>
        {save.isPending ? "Saving…" : "Save changes"}
      </Button>
    </form>
  );
}
