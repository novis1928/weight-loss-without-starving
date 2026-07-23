const SITE_URL = "https://novis1928.github.io/weight-loss-without-starving";
const SITEMAP_URL = `${SITE_URL}/sitemap-index.xml`;
const INDEXNOW_ENDPOINT = "https://api.indexnow.org/indexnow";
const INDEXNOW_KEY = "8bff014738321d77dd6fe490906a03fe";
const KEY_LOCATION = "https://novis1928.github.io/weight-loss-without-starving/8bff014738321d77dd6fe490906a03fe.txt";

function decodeXml(value) {
  return value
    .replaceAll("&amp;", "&")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&quot;", '"')
    .replaceAll("&apos;", "'");
}

function extractLocations(xml) {
  return [...xml.matchAll(/<loc>\s*(.*?)\s*<\/loc>/gsi)]
    .map((match) => decodeXml(match[1].trim()))
    .filter(Boolean);
}

async function fetchText(url) {
  const response = await fetch(url, {
    headers: {
      Accept: "application/xml,text/xml,text/plain,*/*",
      "User-Agent": "Weight-Loss-Without-Starving-IndexNow/1.0",
    },
  });

  if (!response.ok) {
    throw new Error(`Could not fetch ${url}. HTTP ${response.status}.`);
  }

  return response.text();
}

async function collectUrlsFromSitemap(url, visited = new Set()) {
  if (visited.has(url)) {
    return [];
  }

  visited.add(url);

  const xml = await fetchText(url);
  const locations = extractLocations(xml);

  if (xml.includes("<sitemapindex")) {
    const nestedResults = await Promise.all(
      locations.map((location) => collectUrlsFromSitemap(location, visited))
    );

    return nestedResults.flat();
  }

  return locations.filter((location) => {
    try {
      const parsed = new URL(location);
      return (
        parsed.origin === new URL(SITE_URL).origin &&
        (parsed.pathname === new URL(SITE_URL).pathname ||
          parsed.pathname.startsWith(`${new URL(SITE_URL).pathname}/`))
      );
    } catch {
      return false;
    }
  });
}

async function verifyKeyFile() {
  const content = (await fetchText(KEY_LOCATION)).trim();

  if (content !== INDEXNOW_KEY) {
    throw new Error(
      `The public key file exists, but its content does not match the IndexNow key.`
    );
  }

  console.log(`Verified IndexNow key file: ${KEY_LOCATION}`);
}

async function submitToIndexNow(urlList) {
  const response = await fetch(INDEXNOW_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      Accept: "application/json",
      "User-Agent": "Weight-Loss-Without-Starving-IndexNow/1.0",
    },
    body: JSON.stringify({
      host: new URL(SITE_URL).host,
      key: INDEXNOW_KEY,
      keyLocation: KEY_LOCATION,
      urlList,
    }),
  });

  const responseBody = await response.text();

  if (![200, 202].includes(response.status)) {
    throw new Error(
      `IndexNow rejected the submission. HTTP ${response.status}. ${responseBody}`
    );
  }

  console.log(
    `IndexNow accepted ${urlList.length} URL(s). HTTP ${response.status}.`
  );
}

async function main() {
  await verifyKeyFile();

  const urls = [...new Set(await collectUrlsFromSitemap(SITEMAP_URL))].sort();

  if (urls.length === 0) {
    throw new Error(`No page URLs were found in ${SITEMAP_URL}.`);
  }

  console.log(`Found ${urls.length} URL(s) in the live sitemap.`);
  await submitToIndexNow(urls);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
