"use client";

import type { Employee } from "@/content/employees";
import { FadeInStagger, FadeInStaggerItem } from "@/components/fade-in";
import { EmployeeCard } from "@/components/team/employee-card";

export function TeamGrid({ employees }: { employees: Employee[] }) {
	return (
		<FadeInStagger className="mx-auto grid max-w-6xl gap-6 px-4 pb-24 sm:grid-cols-2 sm:px-6 lg:grid-cols-3 lg:px-8">
			{employees.map((employee) => (
				<FadeInStaggerItem key={employee.id}>
					<EmployeeCard employee={employee} />
				</FadeInStaggerItem>
			))}
		</FadeInStagger>
	);
}
