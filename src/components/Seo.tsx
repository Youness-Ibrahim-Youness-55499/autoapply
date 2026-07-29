import { useEffect } from "react";

type SeoProps = {
  description: string;
  noIndex?: boolean;
  path?: string;
  title: string;
};

function upsertMeta(selector: string, attribute: "name" | "property", key: string) {
  const existing = document.head.querySelector<HTMLMetaElement>(selector);

  if (existing) {
    return existing;
  }

  const meta = document.createElement("meta");
  meta.setAttribute(attribute, key);
  document.head.append(meta);
  return meta;
}

export function Seo({
  description,
  noIndex = false,
  path = "",
  title,
}: SeoProps) {
  useEffect(() => {
    const baseUrl = new URL(import.meta.env.BASE_URL, window.location.origin);
    const canonicalUrl = new URL(path.replace(/^\//, ""), baseUrl);
    const socialImageUrl = new URL("social-preview.svg", baseUrl);
    const fullTitle = `${title} | Autoapply`;

    document.title = fullTitle;

    upsertMeta('meta[name="description"]', "name", "description").content =
      description;
    upsertMeta('meta[property="og:title"]', "property", "og:title").content =
      fullTitle;
    upsertMeta(
      'meta[property="og:description"]',
      "property",
      "og:description",
    ).content = description;
    upsertMeta('meta[property="og:url"]', "property", "og:url").content =
      canonicalUrl.href;
    upsertMeta('meta[property="og:image"]', "property", "og:image").content =
      socialImageUrl.href;
    upsertMeta('meta[name="twitter:title"]', "name", "twitter:title").content =
      fullTitle;
    upsertMeta(
      'meta[name="twitter:description"]',
      "name",
      "twitter:description",
    ).content = description;
    upsertMeta('meta[name="twitter:image"]', "name", "twitter:image").content =
      socialImageUrl.href;
    upsertMeta('meta[name="robots"]', "name", "robots").content = noIndex
      ? "noindex, nofollow"
      : "index, follow";

    let canonical = document.head.querySelector<HTMLLinkElement>(
      'link[rel="canonical"]',
    );

    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.append(canonical);
    }

    canonical.href = canonicalUrl.href;
  }, [description, noIndex, path, title]);

  return null;
}

