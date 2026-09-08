"use client";

import { useTranslations } from "next-intl";
import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { motion } from "motion/react";
import type { Job } from "@/content/jobs";
import { submitApplication, type ApplicationState } from "@/app/[locale]/careers/actions";

const initialState: ApplicationState = { success: false };

function SubmitButton() {
	const t = useTranslations("careers.form");
	const { pending } = useFormStatus();

	return (
		<button
			type="submit"
			disabled={pending}
			className="bg-primary text-primary-foreground hover:bg-primary-hover w-full rounded-md px-6 py-3 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
		>
			{pending ? t("submitting") : t("submit")}
		</button>
	);
}

export function ContactForm({
	jobs,
	selectedPosition,
	onPositionChange,
}: {
	jobs: Job[];
	selectedPosition: string;
	onPositionChange: (value: string) => void;
}) {
	const [resetKey, setResetKey] = useState(0);

	return (
		<ContactFormBody
			key={resetKey}
			jobs={jobs}
			selectedPosition={selectedPosition}
			onPositionChange={onPositionChange}
			onReset={() => setResetKey((value) => value + 1)}
		/>
	);
}

function ContactFormBody({
	jobs,
	selectedPosition,
	onPositionChange,
	onReset,
}: {
	jobs: Job[];
	selectedPosition: string;
	onPositionChange: (value: string) => void;
	onReset: () => void;
}) {
	const t = useTranslations("careers.form");
	const tJobs = useTranslations("careers.jobs");
	const [state, formAction] = useActionState(submitApplication, initialState);

	if (state.success) {
		return (
			<motion.div
				initial={{ opacity: 0, y: 10 }}
				animate={{ opacity: 1, y: 0 }}
				className="border-border bg-surface rounded-lg border p-8 text-center"
			>
				<h3 className="text-foreground text-xl font-semibold">{t("successTitle")}</h3>
				<p className="text-muted mt-2">{t("successBody")}</p>
				<button
					type="button"
					onClick={onReset}
					className="border-border text-foreground hover:bg-surface-hover mt-6 rounded-md border px-5 py-2.5 text-sm font-semibold transition-colors"
				>
					{t("sendAnother")}
				</button>
			</motion.div>
		);
	}

	return (
		<form
			action={formAction}
			className="border-border bg-surface space-y-5 rounded-lg border p-6 sm:p-8"
		>
			<div className="grid gap-5 sm:grid-cols-2">
				<div>
					<label htmlFor="name" className="text-foreground block text-sm font-medium">
						{t("name")}
					</label>
					<input
						id="name"
						name="name"
						type="text"
						autoComplete="name"
						className="border-border bg-background text-foreground focus:border-primary mt-1.5 w-full rounded-lg border px-3.5 py-2.5 text-sm outline-none"
					/>
					{state.errors?.name && (
						<p className="mt-1.5 text-sm text-red-500">{t("errorRequired")}</p>
					)}
				</div>
				<div>
					<label htmlFor="email" className="text-foreground block text-sm font-medium">
						{t("email")}
					</label>
					<input
						id="email"
						name="email"
						type="email"
						autoComplete="email"
						className="border-border bg-background text-foreground focus:border-primary mt-1.5 w-full rounded-lg border px-3.5 py-2.5 text-sm outline-none"
					/>
					{state.errors?.email && (
						<p className="mt-1.5 text-sm text-red-500">
							{state.errors.email === "invalid" ? t("errorEmail") : t("errorRequired")}
						</p>
					)}
				</div>
			</div>

			<div>
				<label htmlFor="position" className="text-foreground block text-sm font-medium">
					{t("position")}
				</label>
				<select
					id="position"
					name="position"
					value={selectedPosition}
					onChange={(event) => onPositionChange(event.target.value)}
					className="border-border bg-background text-foreground focus:border-primary mt-1.5 w-full rounded-lg border px-3.5 py-2.5 text-sm outline-none"
				>
					<option value="general">{t("positionGeneral")}</option>
					{jobs.map((job) => (
						<option key={job.id} value={job.id}>
							{tJobs(`${job.id}.title`)}
						</option>
					))}
				</select>
			</div>

			<div>
				<label htmlFor="message" className="text-foreground block text-sm font-medium">
					{t("message")}
				</label>
				<textarea
					id="message"
					name="message"
					rows={5}
					placeholder={t("messagePlaceholder")}
					className="border-border bg-background text-foreground focus:border-primary mt-1.5 w-full resize-none rounded-lg border px-3.5 py-2.5 text-sm outline-none"
				/>
				{state.errors?.message && (
					<p className="mt-1.5 text-sm text-red-500">{t("errorRequired")}</p>
				)}
			</div>

			<SubmitButton />
		</form>
	);
}
