import test from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { readFile } from "node:fs/promises";

const HERE = new URL("./", import.meta.url);

test("capture plan is bounded to real production, synthetic data, and a reviewer-length video", async () => {
  const run = spawnSync(process.execPath, [new URL("record-production-demo.mjs", HERE).pathname, "--plan-json"], {
    encoding: "utf8"
  });
  assert.equal(run.status, 0, run.stderr || run.stdout);
  const plan = JSON.parse(run.stdout);
  assert.equal(plan.origin, "https://csv-safecheck.pages.dev/");
  assert.equal(plan.paidUrl, "https://csv-safecheck.pages.dev/repair-pack");
  assert.equal(plan.width, 1280);
  assert.equal(plan.height, 720);
  assert.equal(plan.priceSelector, ".hero .interest-link");
  assert.ok(plan.plannedDurationSeconds >= 60 && plan.plannedDurationSeconds <= 120);
  assert.equal(plan.cspEnforced, true);
  assert.deepEqual(plan.allowedHosts, ["csv-safecheck.pages.dev"]);
  assert.deepEqual(plan.allowedMethods, ["GET", "HEAD"]);
  assert.deepEqual(plan.allowedPaths, [
    "/",
    "/styles.css",
    "/src/app.js",
    "/src/csv.js",
    "/src/rules.js",
    "/src/report.js",
    "/repair-pack"
  ]);
  assert.ok(plan.requiredSelectors.includes("#issue-rows tr"));
  assert.ok(plan.requiredDownloads.includes("corrected-csv"));
  assert.ok(plan.requiredDownloads.includes("json-report"));

  const fixture = await readFile(new URL("synthetic-shopify-demo.csv", HERE), "utf8");
  assert.match(fixture, /Demo Shirt/);
  assert.match(fixture, /Second Demo/);
  assert.doesNotMatch(fixture, /@|proton|customer|wallet|0x[a-f0-9]{40}/i);
});
