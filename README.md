# CSV SafeCheck

CSV SafeCheck is a free, independent preflight utility for current Shopify product CSV files. It reports a documented subset of deterministic import problems with exact row and column locations and applies only conservative formatting fixes.

## Use the checker online

[Open CSV SafeCheck](https://csv-safecheck.pages.dev/) in a current browser. There is no sign-in or upload step: the static page is delivered by Cloudflare Pages, while the selected CSV contents are processed in browser memory and are not sent to the host.

[Watch the 104-second production demo](https://csv-safecheck.pages.dev/demo) to see the free checker and paid batch workflow explained with synthetic data only. The browser page includes segmented playback, a direct MP4 download, and a written transcript.

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

The free checker remains useful without payment. For people who need to check a batch, the **$3.00 USD one-time Local Batch Audit Pack** processes up to 25 Shopify CSVs locally in one browser session, produces per-file reports plus a combined audit report, and exports separate corrected copies only for deterministic safe fixes when no formula risk is detected. There is no subscription.

The temporary [Base-USDC checkout](https://csv-safecheck-usdc-checkout.csv-safecheck-usdc-checkout.workers.dev/) is available now while the Lemon Squeezy card checkout is under review. It creates a unique exact quote between `2.990001` and `3.000000` native USDC on Base Mainnet for the same v0.1.0 artifact; the small variation associates one payment with one entitlement and is not an exchange-rate claim. The checkout does not connect to a wallet and never requests a signature, private key, seed phrase, password, or token approval. Read the displayed network, token contract, address, exact amount, and payment/refund boundary before sending. The receiving address is receive-only from this application's perspective, so wrong transfers and duplicate payments cannot be automatically returned.

## Support and scope

This is a self-service research release. GitHub issues are only for reproducible software defects that contain no store or customer data; they are not the sole or required commercial-intent gate. Do not submit private files. Current scope and limitations are included in the download.

GitHub Pages is intentionally disabled. The hosted checker uses Cloudflare Pages; GitHub distributes the downloadable offline release.
