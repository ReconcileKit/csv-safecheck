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

export const PLAN = Object.freeze({
  origin: ORIGIN,
  paidUrl: PAID_URL,
  width: 1280,
  height: 720,
  plannedDurationSeconds: 90,
  allowedHosts: ALLOWED_HOSTS,
  requiredSelectors: ["#csv-file", "#analyze", "#summary", "#issue-rows tr", "#download-csv", "#download-report"],
  requiredDownloads: ["corrected-csv", "json-report"]
});

const sha256 = async (filename) => createHash("sha256").update(await readFile(filename)).digest("hex");

async function installOverlay(page) {
  await page.evaluate(() => {
    document.querySelector("#csv-safecheck-demo-overlay")?.remove();
    document.querySelector("#csv-safecheck-demo-pointer")?.remove();
    document.querySelector("#csv-safecheck-demo-overlay-style")?.remove();

    const style = document.createElement("style");
    style.id = "csv-safecheck-demo-overlay-style";
    style.textContent = `
      #csv-safecheck-demo-overlay { position: fixed; z-index: 2147483647; left: 24px; right: 24px; bottom: 20px; padding: 14px 20px; border-radius: 12px; background: rgba(17, 33, 25, .94); color: #fff; font: 700 24px/1.25 system-ui, sans-serif; box-shadow: 0 8px 30px rgba(0,0,0,.28); pointer-events: none; }
      #csv-safecheck-demo-overlay small { display: block; margin-top: 3px; color: #cdebd9; font: 500 14px/1.25 system-ui, sans-serif; }
      #csv-safecheck-demo-pointer { position: fixed; z-index: 2147483647; width: 22px; height: 22px; border: 4px solid white; border-radius: 50%; background: #e65f38; box-shadow: 0 2px 12px rgba(0,0,0,.5); transform: translate(-50%, -50%); transition: left .55s ease, top .55s ease; pointer-events: none; }
      .csv-safecheck-demo-highlight { outline: 4px solid #e65f38 !important; outline-offset: 5px !important; border-radius: 6px; }
    `;
    document.head.append(style);

    const overlay = document.createElement("div");
    overlay.id = "csv-safecheck-demo-overlay";
    overlay.innerHTML = `<span></span><small>Editorial demo caption · synthetic data only</small>`;
    document.body.append(overlay);

    const pointer = document.createElement("div");
    pointer.id = "csv-safecheck-demo-pointer";
    pointer.style.left = "92%";
    pointer.style.top = "14%";
    document.body.append(pointer);
  });
}

async function annotate(page, caption, selector, seconds) {
  await page.evaluate(({ text, targetSelector }) => {
    const overlay = document.querySelector("#csv-safecheck-demo-overlay span");
    if (overlay) overlay.textContent = text;
    document.querySelectorAll(".csv-safecheck-demo-highlight").forEach((element) => element.classList.remove("csv-safecheck-demo-highlight"));
    const target = targetSelector ? document.querySelector(targetSelector) : null;
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "center" });
      target.classList.add("csv-safecheck-demo-highlight");
      const rect = target.getBoundingClientRect();
      const pointer = document.querySelector("#csv-safecheck-demo-pointer");
      if (pointer) {
        pointer.style.left = `${Math.min(window.innerWidth - 20, Math.max(20, rect.right - 16))}px`;
        pointer.style.top = `${Math.min(window.innerHeight - 90, Math.max(20, rect.top + 18))}px`;
      }
    }
  }, { text: caption, targetSelector: selector });
  await page.waitForTimeout(seconds * 1000);
}

async function saveDownload(page, selector, destination) {
  const [download] = await Promise.all([
    page.waitForEvent("download"),
    page.locator(selector).click()
  ]);
  await download.saveAs(destination);
  const failure = await download.failure();
  if (failure) throw new Error(`Download failed: ${failure}`);
  return {
    filename: download.suggestedFilename(),
    path: path.basename(destination),
    sha256: await sha256(destination),
    bytes: (await readFile(destination)).byteLength
  };
}

async function capture() {
  const { chromium } = await import("playwright");
  const startedAt = new Date();
  const downloadsDir = path.join(OUTPUT, "downloads");
  await mkdir(downloadsDir, { recursive: true });

  const unexpectedUrls = [];
  const responses = [];
  const consoleErrors = [];
  const pageErrors = [];
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: PLAN.width, height: PLAN.height },
    acceptDownloads: true,
    bypassCSP: true,
    colorScheme: "light",
    recordVideo: { dir: OUTPUT, size: { width: PLAN.width, height: PLAN.height } }
  });

  await context.route("**/*", async (route) => {
    const requestUrl = route.request().url();
    const parsed = new URL(requestUrl);
    if (["http:", "https:"].includes(parsed.protocol) && !ALLOWED_HOSTS.includes(parsed.hostname)) {
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
    await installOverlay(page);

    await annotate(page, "CSV SafeCheck — live production demo", "#hero-title", 7);
    await annotate(page, "Catch Shopify CSV problems before import", ".lede", 6);
    await annotate(page, "Free single-file checker; paid batch pack is $3.00 USD, one-time", ".hero .interest-link", 7);
    await annotate(page, "Choose a synthetic Shopify-style CSV", ".upload-panel", 6);

    await page.locator("#csv-file").setInputFiles(FIXTURE);
    await page.locator("#analyze").waitFor({ state: "visible" });
    if (await page.locator("#analyze").isDisabled()) throw new Error("Analyze action stayed disabled");
    await annotate(page, "The selected CSV stays in this browser", "#file-state", 6);

    await page.locator("#analyze").click();
    await page.locator("#results:not([hidden])").waitFor({ state: "visible" });
    await page.locator("#issue-rows tr").first().waitFor({ state: "visible" });
    await annotate(page, "Deterministic checks — no upload or AI API", "#summary", 7);
    await annotate(page, "Exact row and cell explanations", "#issue-rows tr:nth-child(1)", 9);
    await annotate(page, "Unsafe meanings are reported; only unambiguous formatting is fixed", "#issue-rows tr:nth-child(2)", 7);

    const correctedButton = page.locator("#download-csv");
    if (!(await correctedButton.isVisible()) || await correctedButton.isDisabled()) throw new Error("Safe corrected CSV was not offered");
    await annotate(page, "Real safe-correction and report exports", ".actions", 4);
    const correctedPath = path.join(downloadsDir, "synthetic-shopify-demo-safe-fixes.csv");
    const corrected = await saveDownload(page, "#download-csv", correctedPath);
    await annotate(page, "Corrected CSV downloaded — source file remains unchanged", "#download-csv", 3);
    const reportPath = path.join(downloadsDir, "synthetic-shopify-demo-report.json");
    const report = await saveDownload(page, "#download-report", reportPath);
    await annotate(page, "JSON findings report downloaded", "#download-report", 3);

    await annotate(page, "No upload endpoint, analytics, remote script, or store connection", ".trust-grid", 7);

    const paidResponse = await page.goto(PAID_URL, { waitUntil: "networkidle", timeout: 30_000 });
    if (!paidResponse || paidResponse.status() !== 200 || page.url() !== PAID_URL) {
      throw new Error(`Paid-product page load failed: ${paidResponse?.status()} ${page.url()}`);
    }
    await installOverlay(page);
    await annotate(page, "Local Batch Audit Pack — $3.00 USD, one-time", "h1", 8);
    await annotate(page, "Up to 25 files; per-file reports; combined audit; no subscription", "main p:nth-of-type(3)", 8);
    await annotate(page, "csv-safecheck.pages.dev", "h1", 5);

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
    fixture: { filename: path.basename(FIXTURE), sha256: await sha256(FIXTURE) },
    video: { filename: path.basename(videoPath), sha256: await sha256(videoPath), bytes: (await readFile(videoPath)).byteLength },
    downloads,
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
