import Image from "next/image";
import type { AnimeCharacter } from "@/types/anime";
import { Skeleton } from "@/components/ui/skeleton";

export function CharacterGrid({ characters }: { characters: AnimeCharacter[] }) {
  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold">Characters & voice actors</h2>
      <ul className="grid gap-3 sm:grid-cols-2">
        {characters.map((character) => (
          <li
            key={character.id}
            className="flex items-center justify-between gap-3 overflow-hidden rounded-xl border bg-card"
          >
            <div className="flex min-w-0 items-center gap-3">
              <Portrait src={character.image} />
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{character.name}</p>
                <p className="text-xs text-muted-foreground">{character.role}</p>
              </div>
            </div>
            {character.voiceActor && (
              <div className="flex min-w-0 items-center gap-3 text-right">
                <div className="min-w-0">
                  <p className="truncate text-sm">{character.voiceActor.name}</p>
                  <p className="text-xs text-muted-foreground">Japanese</p>
                </div>
                <Portrait src={character.voiceActor.image} />
              </div>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}

function Portrait({ src }: { src: string | null }) {
  return (
    <div className="relative h-16 w-11 shrink-0 bg-muted">
      {/* Нижче згину й дрібні — lazy за замовчуванням у next/image. */}
      {src && <Image src={src} alt="" fill sizes="44px" className="object-cover" />}
    </div>
  );
}

export function CharacterGridSkeleton() {
  return (
    <section className="space-y-4" aria-busy>
      <Skeleton className="h-7 w-64" />
      <div className="grid gap-3 sm:grid-cols-2">
        {Array.from({ length: 6 }, (_, index) => (
          <Skeleton key={index} className="h-16 rounded-xl" />
        ))}
      </div>
    </section>
  );
}
