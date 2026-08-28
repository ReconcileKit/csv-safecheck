import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ORIGIN = "https://csv-safecheck.pages.dev/";
const PAID_URL = "https://csv-safecheck.pages.dev/repair-pack";
const FIXTURE = path.join(HERE, "synthetic-shopify-demo.csv");
const OUTPUT = path.resolve(process.env.DEMO_OUTPUT_DIR || path.join(HERE, "artifacts"));
const ALLOWED_HOSTS = ["csv-safecheck.pages.dev"];
const ALLOWED_METHODS = ["GET", "HEAD"];
const ALLOWED_PATHS = [
  "/",
  "/styles.css",
  "/src/app.js",
  "/src/csv.js",
  "/src/rules.js",
  "/src/report.js",
  "/repair-pack"
];

export const PLAN = Object.freeze({
  origin: ORIGIN,
  paidUrl: PAID_URL,
  width: 1280,
  height: 720,
  plannedDurationSeconds: 90,
  cspEnforced: true,
  allowedHosts: ALLOWED_HOSTS,
  allowedMethods: ALLOWED_METHODS,
  allowedPaths: ALLOWED_PATHS,
  requiredSelectors: ["#csv-file", "#analyze", "#summary", "#issue-rows tr", "#download-csv", "#download-report"],
  requiredDownloads: ["corrected-csv", "json-report"]
});

const sha256 = async (filename) => createHash("sha256").update(await readFile(filename)).digest("hex");

async function hold(page, selector, seconds) {
  const target = page.locator(selector).first();
  await target.scrollIntoViewIfNeeded();
  const box = await target.boundingBox();
  if (box) await page.mouse.move(box.x + Math.min(box.width - 4, 24), box.y + Math.min(box.height - 4, 18), { steps: 10 });
  await target.evaluate((element) => {
    if (element instanceof HTMLElement) element.focus({ preventScroll: true });
  });
  await page.waitForTimeout(seconds * 1000);
}

async function validateDownload(kind, destination) {
  const contents = await readFile(destination);
  if (contents.byteLength === 0) throw new Error(`${kind} download was empty`);
  const text = contents.toString("utf8");
  if (kind === "corrected-csv") {
    if (!text.startsWith("Title,URL handle,Price,Status,Charge tax,Product image URL\r\n")) {
      throw new Error("Corrected CSV did not contain the deterministic trimmed header");
    }
    if (!text.includes("Second Demo,broken handle,$12.00,published,yes,http://example.com/demo.jpg")) {
      throw new Error("Corrected CSV did not preserve the synthetic unfixed row");
    }
    return { kind, checks: ["trimmed-header", "unfixed-synthetic-row-preserved"] };
  }
  if (kind === "json-report") {
    let report;
    try {
      report = JSON.parse(text);
    } catch {
      throw new Error("JSON report download was malformed");
    }
    const expectedSummary = report?.schemaVersion === 2
      && report?.summary?.rows === 2
      && report?.summary?.columns === 6
      && report?.summary?.errors === 6
      && report?.summary?.unverified === 2
      && report?.summary?.fixesAvailable === 1;
    if (!expectedSummary) throw new Error("JSON report summary did not match the synthetic fixture");
    if (!report.issues?.some((issue) => issue.ruleId === "header-whitespace" && issue.row === 1 && issue.fixable === true)) {
      throw new Error("JSON report omitted the expected safe header finding");
    }
    if (!report.issues?.some((issue) => issue.ruleId === "handle-format" && issue.row === 3 && issue.column === "URL handle")) {
      throw new Error("JSON report omitted the expected row/cell finding");
    }
    if (/Demo Shirt|broken handle|\$12\.00/.test(text)) throw new Error("JSON report exposed a synthetic cell value");
    return { kind, checks: ["schema-v2", "expected-summary", "exact-findings", "no-cell-values"] };
  }
  throw new Error(`Unknown download kind: ${kind}`);
}

async function saveDownload(page, selector, destination, kind) {
  const [download] = await Promise.all([
    page.waitForEvent("download"),
    page.locator(selector).click()
  ]);
  await download.saveAs(destination);
  const failure = await download.failure();
  if (failure) throw new Error(`Download failed: ${failure}`);
  const validation = await validateDownload(kind, destination);
  return {
    filename: download.suggestedFilename(),
    path: path.basename(destination),
    sha256: await sha256(destination),
    bytes: (await readFile(destination)).byteLength,
    validation
  };
}

async function capture() {
  const { chromium } = await import("playwright");
  const startedAt = new Date();
  const downloadsDir = path.join(OUTPUT, "downloads");
  await mkdir(downloadsDir, { recursive: true });

  const unexpectedUrls = [];
  const requests = [];
  const responses = [];
  const consoleErrors = [];
  const pageErrors = [];
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: PLAN.width, height: PLAN.height },
    acceptDownloads: true,
    colorScheme: "light",
    recordVideo: { dir: OUTPUT, size: { width: PLAN.width, height: PLAN.height } }
  });

  await context.route("**/*", async (route) => {
    const request = route.request();
    const requestUrl = request.url();
    const parsed = new URL(requestUrl);
    const observed = { method: request.method(), url: requestUrl };
    requests.push(observed);
    const permitted = ["http:", "https:"].includes(parsed.protocol)
      && ALLOWED_HOSTS.includes(parsed.hostname)
      && ALLOWED_METHODS.includes(request.method())
      && ALLOWED_PATHS.includes(parsed.pathname)
      && parsed.search === "";
    if (!permitted) {
      unexpectedUrls.push(requestUrl);
      await route.abort("blockedbyclient");
      return;
    }
    await route.continue();
  });

  const page = await context.newPage();
  page.on("response", (response) => responses.push({ url: response.url(), status: response.status() }));
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  page.on("pageerror", (error) => pageErrors.push(error.message));

  let rawVideo;
  let downloads;
  try {
    const landingResponse = await page.goto(ORIGIN, { waitUntil: "networkidle", timeout: 30_000 });
    if (!landingResponse || landingResponse.status() !== 200 || page.url() !== ORIGIN) {
      throw new Error(`Canonical production load failed: ${landingResponse?.status()} ${page.url()}`);
    }
    if (!(await page.title()).includes("CSV SafeCheck")) throw new Error("Unexpected production title");
    await page.locator("text=Local Batch Audit Pack — $3.00 USD, one-time").waitFor();
    await hold(page, "#hero-title", 7);
    await hold(page, ".lede", 6);
    await hold(page, ".hero .interest-link", 7);
    await hold(page, ".upload-panel", 6);

    await page.locator("#csv-file").setInputFiles(FIXTURE);
    await page.locator("#analyze").waitFor({ state: "visible" });
    if (await page.locator("#analyze").isDisabled()) throw new Error("Analyze action stayed disabled");
    await hold(page, "#file-state", 6);

    await page.locator("#analyze").click();
    await page.locator("#results:not([hidden])").waitFor({ state: "visible" });
    await page.locator("#issue-rows tr").first().waitFor({ state: "visible" });
    await hold(page, "#summary", 7);
    await hold(page, "#issue-rows tr:nth-child(1)", 9);
    await hold(page, "#issue-rows tr:nth-child(2)", 7);

    const correctedButton = page.locator("#download-csv");
    if (!(await correctedButton.isVisible()) || await correctedButton.isDisabled()) throw new Error("Safe corrected CSV was not offered");
    await hold(page, ".actions", 4);
    const correctedPath = path.join(downloadsDir, "synthetic-shopify-demo-safe-fixes.csv");
    const corrected = await saveDownload(page, "#download-csv", correctedPath, "corrected-csv");
    await hold(page, "#download-csv", 3);
    const reportPath = path.join(downloadsDir, "synthetic-shopify-demo-report.json");
    const report = await saveDownload(page, "#download-report", reportPath, "json-report");
    await hold(page, "#download-report", 3);

    await hold(page, ".trust-grid", 7);

    const paidResponse = await page.goto(PAID_URL, { waitUntil: "networkidle", timeout: 30_000 });
    if (!paidResponse || paidResponse.status() !== 200 || page.url() !== PAID_URL) {
      throw new Error(`Paid-product page load failed: ${paidResponse?.status()} ${page.url()}`);
    }
    await hold(page, "h1", 8);
    await hold(page, "main p:nth-of-type(3)", 8);
    await hold(page, "h1", 5);

    if (unexpectedUrls.length) throw new Error(`Unexpected network destinations: ${unexpectedUrls.join(", ")}`);
    if (consoleErrors.length || pageErrors.length) throw new Error(`Browser errors: ${[...consoleErrors, ...pageErrors].join(" | ")}`);
    if (responses.some((entry) => entry.status >= 400)) throw new Error("A production resource returned an error status");
    downloads = { corrected, report };
    rawVideo = page.video();
  } finally {
    await context.close();
    await browser.close();
  }

  if (!rawVideo || !downloads) throw new Error("Capture did not complete");
  const videoPath = path.join(OUTPUT, "csv-safecheck-demo-raw.webm");
  await rawVideo.saveAs(videoPath);
  const endedAt = new Date();
  const evidence = {
    schemaVersion: 1,
    origin: ORIGIN,
    finalUrl: PAID_URL,
    startedAt: startedAt.toISOString(),
    endedAt: endedAt.toISOString(),
    elapsedSeconds: Math.round((endedAt - startedAt) / 1000),
    viewport: { width: PLAN.width, height: PLAN.height },
    cspEnforced: true,
    fixture: { filename: path.basename(FIXTURE), sha256: await sha256(FIXTURE) },
    video: { filename: path.basename(videoPath), sha256: await sha256(videoPath), bytes: (await readFile(videoPath)).byteLength },
    downloads,
    requests,
    responses,
    unexpectedUrls,
    consoleErrors,
    pageErrors
  };
  await writeFile(path.join(OUTPUT, "capture-evidence.json"), `${JSON.stringify(evidence, null, 2)}\n`, "utf8");
  process.stdout.write(`${JSON.stringify(evidence)}\n`);
}

if (process.argv.includes("--plan-json")) {
  process.stdout.write(`${JSON.stringify(PLAN)}\n`);
} else {
  await capture();
}
