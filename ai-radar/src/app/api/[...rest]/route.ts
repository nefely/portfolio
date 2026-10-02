import { NextResponse } from "next/server";

// Unknown /api/* paths answer with JSON, not an HTML 404 page.
function notFound() {
  return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
}

export { notFound as GET, notFound as POST, notFound as PUT, notFound as PATCH, notFound as DELETE };
