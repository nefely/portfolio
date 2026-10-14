import { keepPreviousData, queryOptions } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { fetchActivitiesFor, fetchActivityList, fetchDueToday } from "@/lib/data/activities";
import {
  fetchCompany,
  fetchCompanyList,
  fetchCompanyOptions,
  fetchIndustries,
} from "@/lib/data/companies";
import {
  fetchContact,
  fetchContactList,
  fetchContactOptions,
  fetchContactsByCompany,
} from "@/lib/data/contacts";
import {
  fetchBoardDeals,
  fetchDeal,
  fetchDealList,
  fetchDealsByCompany,
  fetchDealsByContact,
} from "@/lib/data/deals";
import { fetchAudit, fetchDashboard } from "@/lib/data/insights";
import { fetchStages } from "@/lib/data/stages";
import { fetchTeam } from "@/lib/data/team";
import {
  type ActivityListParams,
  type CompanyListParams,
  type ContactListParams,
  type DealListParams,
  queryKeys,
} from "./keys";

// Свіжість даних тримає realtime (hooks/useRealtimeSync) та інвалідація після
// мутацій, тож staleTime щедрі: повторний перехід на сторінку бере кеш без
// мережі. Довідники (команда, етапи) змінюються рідко — 10 хвилин.

const db = () => createClient();
const MINUTE = 60 * 1000;

export const teamOptions = () =>
  queryOptions({
    queryKey: queryKeys.team,
    queryFn: () => fetchTeam(db()),
    staleTime: 10 * MINUTE,
  });

export const stagesOptions = () =>
  queryOptions({
    queryKey: queryKeys.stages,
    queryFn: () => fetchStages(db()),
    staleTime: 10 * MINUTE,
  });

export const boardOptions = () =>
  queryOptions({
    queryKey: queryKeys.board,
    queryFn: () => fetchBoardDeals(db()),
    staleTime: 5 * MINUTE,
  });

// keepPreviousData: при зміні сторінки/фільтра таблиця не блимає скелетоном,
// а показує попередні рядки, доки не прийдуть нові.
export const dealListOptions = (params: DealListParams) =>
  queryOptions({
    queryKey: queryKeys.dealList(params),
    queryFn: () => fetchDealList(db(), params),
    placeholderData: keepPreviousData,
    staleTime: 2 * MINUTE,
  });

export const dealOptions = (id: string) =>
  queryOptions({
    queryKey: queryKeys.deal(id),
    queryFn: () => fetchDeal(db(), id),
    staleTime: 5 * MINUTE,
  });

export const dealsByCompanyOptions = (companyId: string) =>
  queryOptions({
    queryKey: queryKeys.dealsByCompany(companyId),
    queryFn: () => fetchDealsByCompany(db(), companyId),
    staleTime: 5 * MINUTE,
  });

export const dealsByContactOptions = (contactId: string) =>
  queryOptions({
    queryKey: queryKeys.dealsByContact(contactId),
    queryFn: () => fetchDealsByContact(db(), contactId),
    staleTime: 5 * MINUTE,
  });

export const companyListOptions = (params: CompanyListParams) =>
  queryOptions({
    queryKey: queryKeys.companyList(params),
    queryFn: () => fetchCompanyList(db(), params),
    placeholderData: keepPreviousData,
    staleTime: 2 * MINUTE,
  });

export const companyOptions = (id: string) =>
  queryOptions({
    queryKey: queryKeys.company(id),
    queryFn: () => fetchCompany(db(), id),
    staleTime: 5 * MINUTE,
  });

export const companyOptionsList = () =>
  queryOptions({
    queryKey: queryKeys.companyOptions,
    queryFn: () => fetchCompanyOptions(db()),
    staleTime: 10 * MINUTE,
  });

export const industriesOptions = () =>
  queryOptions({
    queryKey: queryKeys.industries,
    queryFn: () => fetchIndustries(db()),
    staleTime: 10 * MINUTE,
  });

export const contactListOptions = (params: ContactListParams) =>
  queryOptions({
    queryKey: queryKeys.contactList(params),
    queryFn: () => fetchContactList(db(), params),
    placeholderData: keepPreviousData,
    staleTime: 2 * MINUTE,
  });

export const contactOptions = (id: string) =>
  queryOptions({
    queryKey: queryKeys.contact(id),
    queryFn: () => fetchContact(db(), id),
    staleTime: 5 * MINUTE,
  });

export const contactsByCompanyOptions = (companyId: string) =>
  queryOptions({
    queryKey: queryKeys.contactsByCompany(companyId),
    queryFn: () => fetchContactsByCompany(db(), companyId),
    staleTime: 5 * MINUTE,
  });

export const contactOptionsList = () =>
  queryOptions({
    queryKey: queryKeys.contactOptions,
    queryFn: () => fetchContactOptions(db()),
    staleTime: 10 * MINUTE,
  });

export const activityListOptions = (params: ActivityListParams) =>
  queryOptions({
    queryKey: queryKeys.activityList(params),
    queryFn: () => fetchActivityList(db(), params),
    staleTime: 2 * MINUTE,
  });

export const activitiesForOptions = (kind: "deal" | "company" | "contact", id: string) =>
  queryOptions({
    queryKey: queryKeys.activitiesFor(kind, id),
    queryFn: () => fetchActivitiesFor(db(), kind, id),
    staleTime: 5 * MINUTE,
  });

export const dueTodayOptions = (ownerId: string) =>
  queryOptions({
    queryKey: queryKeys.dueToday(ownerId),
    queryFn: () => fetchDueToday(db(), ownerId),
    staleTime: 2 * MINUTE,
  });

export const dashboardOptions = (ownerId: string | null) =>
  queryOptions({
    queryKey: queryKeys.dashboard(ownerId),
    queryFn: () => fetchDashboard(db(), ownerId),
    placeholderData: keepPreviousData,
    staleTime: 2 * MINUTE,
  });

export const auditOptions = (page: number, table: string) =>
  queryOptions({
    queryKey: queryKeys.audit(page, table),
    queryFn: () => fetchAudit(db(), page, table),
    placeholderData: keepPreviousData,
    staleTime: MINUTE,
  });
