export function normalizeLinkGupy(urlObj: URL): string | null {
  if (!urlObj.hostname.toLowerCase().endsWith(".gupy.io")) {
    return null;
  }

  const segments = urlObj.pathname.replace(/^\/|\/$/g, "").split("/");
  if (segments.length !== 2 || segments[0] !== "job") {
    return null;
  }

  const token = segments[1];

  try {
    const base64Str = token.replace(/-/g, "+").replace(/_/g, "/");
    const padding = "=".repeat((4 - (base64Str.length % 4)) % 4);
    const decoded = Buffer.from(base64Str + padding, "base64").toString("utf8");
    const data = JSON.parse(decoded);

    const jobId = data.jobId;
    if (!jobId) return null;

    const canonicalPayload = JSON.stringify({
      jobId,
      source: "gupy_portal",
    });

    const canonicalToken = Buffer.from(canonicalPayload)
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

    return `${urlObj.protocol}//${urlObj.hostname}/job/${canonicalToken}`;
  } catch {
    return null;
  }
}

const trackingParams = new Set([
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
  "jobboardsource",
  "source",
  "origem",
  "p",
  "pos",
  "rgn",
  "cid",
  "ckey",
  "jobage",
  "relb",
  "brelb",
  "scr",
  "bscr",
  "aq",
  "elckey",
]);

export function normalizeLinkSolides(urlObj: URL): string | null {
  if (urlObj.hostname.toLowerCase().endsWith(".solides.jobs")) {
    const subdomain = urlObj.hostname.split(".")[0];
    const segments = urlObj.pathname.replace(/^\/|\/$/g, "").split("/");
    if (segments[0] === "vacancies" && segments[1]) {
      return `https://${subdomain}.vagas.solides.com.br/vaga/${segments[1]}`;
    }
  }
  return null;
}

export function normalizeLink(link: string | null): string | null {
  if (!link) return null;

  try {
    const urlObj = new URL(link.trim());
    
    const solidesLink = normalizeLinkSolides(urlObj);
    if (solidesLink) return solidesLink;

    const gupyLink = normalizeLinkGupy(urlObj);
    if (gupyLink) return gupyLink;

    const filteredParams = new URLSearchParams();
    urlObj.searchParams.forEach((value, key) => {
      if (!trackingParams.has(key.toLowerCase())) {
        filteredParams.append(key, value);
      }
    });

    urlObj.search = filteredParams.toString();
    if (urlObj.pathname.endsWith("/") && urlObj.pathname.length > 1) {
      urlObj.pathname = urlObj.pathname.slice(0, -1);
    }

    return urlObj.toString();
  } catch {
    return link;
  }
}
