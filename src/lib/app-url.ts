/** Resolves the public app origin for links in emails and redirects. */
export function getAppBaseUrl(request?: Request): string {
  const configured = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (configured) {
    return configured.replace(/\/$/, "");
  }

  if (request) {
    const host =
      request.headers.get("x-forwarded-host") ?? request.headers.get("host");
    const protocol =
      request.headers.get("x-forwarded-proto") ??
      (host?.includes("localhost") ? "http" : "https");

    if (host) {
      return `${protocol}://${host}`;
    }
  }

  const vercelHost = process.env.VERCEL_URL?.trim();
  if (vercelHost) {
    return `https://${vercelHost.replace(/\/$/, "")}`;
  }

  return "http://localhost:3000";
}
