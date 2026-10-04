import type { AnimeCard } from "./anime";

export const ENTRY_STATUSES = ["watching", "completed", "planned", "on_hold", "dropped"] as const;
export type EntryStatus = (typeof ENTRY_STATUSES)[number];

export interface Entry {
  id: string;
  animeId: number;
  status: EntryStatus;
  progress: number;
  score: number | null;
  isFavorite: boolean;
  notes: string | null;
  anime: AnimeCard;
  updatedAt: string;
}

export interface EntryInput {
  animeId: number;
  status: EntryStatus;
  progress: number;
  score: number | null;
  isFavorite: boolean;
  notes: string | null;
  anime: AnimeCard;
}

export interface ListItem {
  animeId: number;
  anime: AnimeCard;
  addedAt: string;
}

export interface Author {
  userId: string;
  username: string;
  displayName: string | null;
}

export interface AnimeList {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  items: ListItem[];
}

export interface AnimeListWithAuthor extends AnimeList {
  author: Author | null;
}

export interface ListInput {
  title: string;
  description: string | null;
  isPublic: boolean;
}

export interface Review {
  id: string;
  animeId: number;
  score: number;
  body: string;
  hasSpoilers: boolean;
  createdAt: string;
  updatedAt: string;
  author: Author | null;
}

export interface ReviewInput {
  animeId: number;
  score: number;
  body: string;
  hasSpoilers: boolean;
}

export interface Profile {
  userId: string;
  username: string;
  displayName: string | null;
  bio: string | null;
}
