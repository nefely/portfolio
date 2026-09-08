// Language-neutral job data. Translatable copy lives in
// `messages/{locale}.json` under `careers.jobs.<id>`.
export type Job = {
	id: string;
	order: number;
};

export const jobs: Job[] = [
	{ id: "frontend-engineer", order: 1 },
	{ id: "backend-engineer", order: 2 },
	{ id: "product-designer", order: 3 },
	{ id: "account-manager", order: 4 },
];

export function getJob(id: string) {
	return jobs.find((job) => job.id === id);
}
