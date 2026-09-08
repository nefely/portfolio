"use server";

export type ApplicationFieldError = "required" | "invalid";

export type ApplicationState = {
	success: boolean;
	errors?: {
		name?: ApplicationFieldError;
		email?: ApplicationFieldError;
		message?: ApplicationFieldError;
	};
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function submitApplication(
	_prevState: ApplicationState,
	formData: FormData
): Promise<ApplicationState> {
	const name = String(formData.get("name") ?? "").trim();
	const email = String(formData.get("email") ?? "").trim();
	const position = String(formData.get("position") ?? "general");
	const message = String(formData.get("message") ?? "").trim();

	const errors: ApplicationState["errors"] = {};
	if (!name) errors.name = "required";
	if (!email) errors.email = "required";
	else if (!EMAIL_PATTERN.test(email)) errors.email = "invalid";
	if (!message) errors.message = "required";

	if (Object.keys(errors).length > 0) {
		return { success: false, errors };
	}

	// No email/CRM integration is wired up yet — this simply simulates a
	// submission so the form is fully functional end to end. Swap this for a
	// real integration (e.g. an email API or a webhook into your ATS) later.
	console.log("New application received", { name, email, position, message });

	return { success: true };
}
