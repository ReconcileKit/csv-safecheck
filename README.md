# CSV SafeCheck

<p align="center"><img src="assets/csv-safecheck-logo.png" width="120" height="120" alt="CSV SafeCheck spreadsheet validation mark"></p>

CSV SafeCheck is a free, independent preflight utility for current Shopify product CSV files. It reports a documented subset of deterministic import problems with exact row and column locations and applies only conservative formatting fixes.

## Use the checker online

[Open CSV SafeCheck](https://csv-safecheck.pages.dev/) in a current browser. There is no sign-in or upload step: the static page is delivered by Cloudflare Pages, while the selected CSV contents are processed in browser memory and are not sent to the host.

Need batch or agency use? [Preview the exact batch summary and compare the automatically delivered paid options](https://csv-safecheck.pages.dev/repair-pack): through 2 Sep 2026 at 00:00 UTC, code `LAUNCH10` makes the Local Batch Audit Pack ZAR49.50 for up to 25 files and the Agency Batch License ZAR198 for one organization across up to 10 authorized client migration projects.

Shopify creators, consultants, and migration specialists can also [review the affiliate program](https://csv-safecheck.pages.dev/affiliates): approved partners earn 10% on attributed sales through Lemon Squeezy.

## Download the offline edition

1. [Download CSV SafeCheck offline v0.1.0](https://github.com/ReconcileKit/csv-safecheck/releases/download/v0.1.0/csv-safecheck-offline-v0.1.0.zip) (ZIP, 25,363 bytes).
2. Optionally download [SHA256SUMS.txt](https://github.com/ReconcileKit/csv-safecheck/releases/download/v0.1.0/SHA256SUMS.txt) and verify the archive before opening it.
3. Unzip the archive and open `index.html` in a current desktop browser.
4. Choose a synthetic or authorized Shopify product CSV and run the local preflight.

For release notes and the complete asset list, see the [latest GitHub Release](https://github.com/ReconcileKit/csv-safecheck/releases/latest).

The checker has no installer, account, analytics collector, upload endpoint, remote script, AI API, or payment integration. Selected CSV contents are processed in browser memory. Review the included Privacy, Terms, Limitations, Acceptable Use, and Refund pages before use.

The initial release checks only a documented subset and does not guarantee Shopify import acceptance. Back up your catalog and use Shopify's import preview before applying changes. CSV SafeCheck is not affiliated with, sponsored by, or endorsed by Shopify.

## Shopify CSV problems covered

- **[Illegal quoting, invalid UTF-8, and malformed rows](https://csv-safecheck.pages.dev/guides/illegal-quoting):** the strict parser rejects malformed quoted-field suffixes, invalid encoding, NUL bytes, and inconsistent column counts instead of silently merging data.
- **[Invalid or incorrect product CSV headers](https://csv-safecheck.pages.dev/guides/invalid-headers):** the current profile checks case-sensitive core headings, duplicate headers, create/update identifiers, and important dynamic-column exceptions.
- **[Validation failed: options are not unique / duplicate product variants](https://csv-safecheck.pages.dev/guides/duplicate-variants):** expressed option combinations are compared within each handle while image-only continuation rows are excluded from duplicate-variant findings.
- **Deterministic field checks:** the release checks handle syntax, status, documented booleans, money syntax, variant dependencies, unsupported variant-metafield headers, and HTTPS product-image syntax. Store-dependent conditions remain explicitly unverified.

Primary references: Shopify's [product CSV guidance](https://help.shopify.com/en/manual/products/import-export/using-csv?locale=en-US), [product import instructions](https://help.shopify.com/en/manual/products/import-export/import-products), and [common product CSV import problems](https://help.shopify.com/en/manual/products/import-export/common-import-issues). The download includes longer guides with exact boundaries and safe next steps.

## Local Batch Audit Pack

The free checker remains useful without payment. For people who need to check a batch, the **ZAR55 one-time Local Batch Audit Pack** processes up to 25 Shopify CSVs locally in one browser session, produces per-file reports plus a combined audit report, and exports separate corrected copies only for deterministic safe fixes when no formula risk is detected. There is no subscription.

**10% launch discount:** both checkout links apply code `LAUNCH10` automatically through 2 Sep 2026 at 00:00 UTC.

[Buy the Local Batch Audit Pack](https://csv-safecheck.lemonsqueezy.com/checkout/buy/660279c4-dfc6-4b9a-81e5-13aebef11d11?checkout%5Bdiscount_code%5D=LAUNCH10) through Lemon Squeezy for card or PayPal checkout and automatic delivery. The delivered file is self-contained and has no network client, analytics, account, wallet, or payment code; selected CSV contents and filenames remain in the browser.

Shopify partners and migration teams can instead buy the **ZAR220 one-time [Agency Batch License](https://csv-safecheck.lemonsqueezy.com/checkout/buy/0808e074-9a57-4ae5-9aa2-2906881a1056?checkout%5Bdiscount_code%5D=LAUNCH10)**. It licenses one purchasing organization to use the same local pack internally on up to 10 authorized client migration or catalog projects. The tool and agency license are delivered automatically; there is no subscription or custom-work obligation.

## Support and scope

This is a self-service research release. GitHub issues are only for reproducible software defects that contain no store or customer data; they are not the sole or required commercial-intent gate. Do not submit private files. Current scope and limitations are included in the download.

GitHub Pages is intentionally disabled. The hosted checker uses Cloudflare Pages; GitHub distributes the downloadable offline release.
