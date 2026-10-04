import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarClock, ExternalLink, Heart, Star, TrendingUp, Trophy } from "lucide-react";
import type { AnimeCard, AnimeDetails } from "@/types/anime";
import { Badge } from "@/components/ui/badge";
import { AnimeShelf } from "@/components/anime/AnimeShelf";
import { CharacterGrid } from "@/components/anime/CharacterGrid";
import { LiteYouTube } from "@/components/anime/LiteYouTube";
import { SpoilerTags } from "@/components/anime/SpoilerTags";
import { EntryEditor } from "@/components/library/EntryEditor";
import { AddToListButton } from "@/components/lists/AddToListButton";
import { ReviewsSection } from "@/components/reviews/ReviewsSection";
import { getAnimeById } from "@/lib/anilist/queries";
import { formatCompact, formatEpisodes } from "@/lib/anime/labels";

// ISR: сторінка тайтлу генерується при першому зверненні й живе 6 годин.
// Користувацькі частини (статус, відгуки) — клієнтські острівці, тож сторінка
// лишається статичною для всіх.
export const revalidate = 21600;

// Порожній масив = жодного тайтлу на білді, але кожен відкритий тайтл
// кешується як статична сторінка (без цього ISR для динамічних шляхів не працює).
export async function generateStaticParams() {
  return [];
}

function parseId(raw: string) {
  const id = Number(raw);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export async function generateMetadata({ params }: PageProps<"/anime/[id]">): Promise<Metadata> {
  const id = parseId((await params).id);
  // Той самий виклик, що й у сторінці, — cache() + Data Cache віддадуть
  // результат без другого запиту до AniList.
  const anime = id ? await getAnimeById(id).catch(() => null) : null;
  if (!anime) return { title: "Anime not found" };

  const description = anime.synopsis?.slice(0, 160) ?? `${anime.title} on GeekHub`;
  return {
    title: anime.title,
    description,
    openGraph: {
      title: anime.title,
      description,
      images: anime.imageLarge ? [anime.imageLarge] : [],
    },
  };
}

export default async function AnimePage({ params }: PageProps<"/anime/[id]">) {
  const id = parseId((await params).id);
  if (!id) notFound();

  // Один GraphQL-запит приносить усе: деталі, персонажів і рекомендації.
  const anime = await getAnimeById(id);
  if (!anime) notFound();

  // Знімок для бібліотеки/списків — лише поля AnimeCard, без опису тощо.
  const card: AnimeCard = {
    id: anime.id,
    title: anime.title,
    image: anime.image,
    color: anime.color,
    score: anime.score,
    type: anime.type,
    episodes: anime.episodes,
    year: anime.year,
    status: anime.status,
  };

  return (
    <article>
      <Hero anime={anime} card={card} />

      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_18rem]">
        <div className="min-w-0 space-y-12">
          {anime.synopsis && (
            <section className="space-y-3">
              <h2 className="text-xl font-semibold">Synopsis</h2>
              <p className="leading-relaxed whitespace-pre-line text-muted-foreground">
                {anime.synopsis}
              </p>
            </section>
          )}

          {anime.trailerYoutubeId && (
            <section className="space-y-3">
              <h2 className="text-xl font-semibold">Trailer</h2>
              <LiteYouTube videoId={anime.trailerYoutubeId} title={`${anime.title} trailer`} />
            </section>
          )}

          {anime.characters.length > 0 && <CharacterGrid characters={anime.characters} />}

          <ReviewsSection animeId={anime.id} />

          {anime.recommendations.length > 0 && (
            <AnimeShelf title="You might also like" items={anime.recommendations} />
          )}
        </div>

        <InfoSidebar anime={anime} />
      </div>
    </article>
  );
}

function Hero({ anime, card }: { anime: AnimeDetails; card: AnimeCard }) {
  const stats = [
    { icon: Star, label: "Score", value: anime.score?.toFixed(1) ?? "—" },
    { icon: Trophy, label: "Ranked", value: anime.rankRated ? `#${anime.rankRated}` : "—" },
    {
      icon: TrendingUp,
      label: "Popularity",
      value: anime.rankPopular ? `#${anime.rankPopular}` : formatCompact(anime.popularity),
    },
    { icon: Heart, label: "Favorites", value: formatCompact(anime.favorites) },
  ];

  return (
    <section className="relative overflow-hidden border-b border-border/60">
      {anime.banner ? (
        <Image
          src={anime.banner}
          alt=""
          fill
          sizes="100vw"
          quality={60}
          className="object-cover opacity-35"
        />
      ) : (
        anime.image && (
          // Без банера — розмитий постер: мала версія + blur коштують кілька КБ.
          <Image
            src={anime.image}
            alt=""
            fill
            sizes="64px"
            quality={30}
            className="scale-110 object-cover opacity-30 blur-3xl"
          />
        )
      )}
      <div className="absolute inset-0 bg-linear-to-b from-background/30 via-background/80 to-background" />

      <div className="relative mx-auto flex max-w-7xl flex-col gap-8 px-4 py-10 sm:flex-row sm:px-6">
        <div
          className="relative mx-auto aspect-2/3 w-48 shrink-0 overflow-hidden rounded-2xl shadow-2xl ring-1 ring-border sm:mx-0 sm:w-56"
          style={{ backgroundColor: anime.color ?? undefined }}
        >
          {anime.imageLarge ? (
            <Image
              src={anime.imageLarge}
              alt={`${anime.title} poster`}
              fill
              priority
              sizes="224px"
              className="object-cover"
            />
          ) : (
            <div className="grid h-full place-items-center bg-muted text-sm text-muted-foreground">
              No image
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1 space-y-5">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">
              {[
                anime.type,
                anime.season && anime.year ? `${anime.season} ${anime.year}` : anime.year,
                anime.status,
              ]
                .filter(Boolean)
                .join(" · ")}
            </p>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{anime.title}</h1>
            {anime.titleRomaji !== anime.title && (
              <p className="text-muted-foreground">{anime.titleRomaji}</p>
            )}
          </div>

          {anime.nextEpisode && <NextEpisode {...anime.nextEpisode} />}

          <div className="flex flex-wrap gap-1.5">
            {anime.genres.map((genre) => (
              <Badge
                key={genre}
                variant="secondary"
                render={<Link href={`/anime?genres=${encodeURIComponent(genre)}`} />}
              >
                {genre}
              </Badge>
            ))}
          </div>

          <dl className="grid grid-cols-2 gap-3 sm:flex sm:flex-wrap sm:gap-8">
            {stats.map(({ icon: Icon, label, value }) => (
              <div key={label}>
                <dt className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Icon className="size-3.5" /> {label}
                </dt>
                <dd className="text-lg font-semibold">{value}</dd>
              </div>
            ))}
          </dl>

          <div className="flex flex-wrap items-center gap-2">
            <EntryEditor anime={card} />
            <AddToListButton anime={card} />
          </div>
        </div>
      </div>
    </section>
  );
}

// UTC, а не локальний час: сторінка статична (ISR), локальну зону сервера
// відвідувач не побачив би правильно.
const airingFormat = new Intl.DateTimeFormat("en", {
  weekday: "short",
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "UTC",
  timeZoneName: "short",
});

function NextEpisode({ episode, airingAt }: { episode: number; airingAt: number }) {
  const date = new Date(airingAt * 1000);
  return (
    <p className="inline-flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/10 px-3 py-1.5 text-sm">
      <CalendarClock className="size-4 text-primary" />
      Episode {episode} airs
      <time dateTime={date.toISOString()} className="font-medium">
        {airingFormat.format(date)}
      </time>
    </p>
  );
}

function InfoSidebar({ anime }: { anime: AnimeDetails }) {
  const rows: [string, string | null][] = [
    ["Format", anime.type],
    ["Episodes", anime.episodes !== null ? formatEpisodes(anime.episodes) : null],
    ["Duration", anime.duration ? `${anime.duration} min per episode` : null],
    ["Status", anime.status],
    ["Aired", anime.aired],
    ["Season", anime.season && anime.year ? `${anime.season} ${anime.year}` : null],
    ["Studios", anime.studios.join(", ") || null],
    ["Source", anime.source],
  ];

  return (
    <aside className="space-y-8">
      <dl className="space-y-3 rounded-2xl border bg-card p-5 text-sm">
        {rows
          .filter(([, value]) => value)
          .map(([label, value]) => (
            <div key={label}>
              <dt className="text-xs text-muted-foreground">{label}</dt>
              <dd className="font-medium">{value}</dd>
            </div>
          ))}
        <div className="flex flex-col gap-1 pt-1">
          <ExternalAnchor href={anime.siteUrl}>View on AniList</ExternalAnchor>
          {anime.malId && (
            <ExternalAnchor href={`https://myanimelist.net/anime/${anime.malId}`}>
              View on MyAnimeList
            </ExternalAnchor>
          )}
        </div>
      </dl>

      {anime.tags.length > 0 && <SpoilerTags tags={anime.tags} />}

      {anime.relations.length > 0 && (
        <section className="space-y-3">
          <h2 className="font-semibold">Related</h2>
          <ul className="space-y-2.5 text-sm">
            {anime.relations.map((relation) => (
              <li key={`${relation.relation}-${relation.id}`}>
                <p className="text-xs text-muted-foreground">
                  {relation.relation}
                  {relation.format && ` · ${relation.format}`}
                </p>
                {relation.isAnime ? (
                  <Link href={`/anime/${relation.id}`} className="hover:text-primary">
                    {relation.title}
                  </Link>
                ) : (
                  <span className="text-muted-foreground">{relation.title}</span>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      {anime.streaming.length > 0 && (
        <section className="space-y-3">
          <h2 className="font-semibold">Where to watch</h2>
          <div className="flex flex-wrap gap-1.5">
            {anime.streaming.map((service) => (
              <a key={service.url} href={service.url} target="_blank" rel="noreferrer">
                <Badge variant="outline">{service.name}</Badge>
              </a>
            ))}
          </div>
        </section>
      )}
    </aside>
  );
}

function ExternalAnchor({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
    >
      {children} <ExternalLink className="size-3" />
    </a>
  );
}
