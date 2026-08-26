# CSV SafeCheck

CSV SafeCheck is a free, independent preflight utility for current Shopify product CSV files. It reports a documented subset of deterministic import problems with exact row and column locations and applies only conservative formatting fixes.

## Use the checker online

[Open CSV SafeCheck](https://csv-safecheck.pages.dev/) in a current browser. There is no sign-in or upload step: the static page is delivered by Cloudflare Pages, while the selected CSV contents are processed in browser memory and are not sent to the host.

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

## Repair Pack research

The free checker remains useful without payment. A one-time `$9` Local Repair Pack—local batch files, deterministic repair export, and a before/after audit bundle—is only a product hypothesis and is not for sale.

After a successful local result, the included checker can show a research page with an optional prefilled public GitHub issue. Never attach or paste CSV files, catalog data, store data, or personal data into an issue. Issues are not a support channel, no individual response is promised, and submitting one is not a purchase.

## Support and scope

This is a self-service research release. Use GitHub issues only for reproducible software defects that contain no store or customer data. Do not submit private files. Current scope and limitations are included in the download.

GitHub Pages is intentionally disabled. The hosted checker uses Cloudflare Pages; GitHub distributes the downloadable offline release.
