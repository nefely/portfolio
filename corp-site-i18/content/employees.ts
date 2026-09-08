// Language-neutral employee data. Translatable copy (name is kept as-is across
// locales, everything else) lives in `messages/{locale}.json` under `team.members.<id>`.
export type Employee = {
	id: string;
	name: string;
	photo: string;
	order: number;
};

export const employees: Employee[] = [
	{ id: "olena-kravchenko", name: "Olena Kravchenko", photo: "/OK.webp", order: 1 },
	{ id: "james-carter", name: "James Carter", photo: "/JK.webp", order: 2 },
	{ id: "sophie-bauer", name: "Sophie Bauer", photo: "/SB.webp", order: 3 },
	{ id: "marco-rossi", name: "Marco Rossi", photo: "/MR.webp", order: 4 },
	{ id: "claire-dubois", name: "Claire Dubois", photo: "/CD.webp", order: 5 },
	{ id: "daniel-garcia", name: "Daniel García", photo: "/DG.webp", order: 6 },
];

export function getEmployee(id: string) {
	return employees.find((employee) => employee.id === id);
}
