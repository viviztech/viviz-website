# Website Audit and Adaptive Growth Planner: implementation status

Updated 24 October 2026. Scope: the free audit and lead-generation flow at `/website-audit`, inside the existing Viviz site. This is not completion of the broader GrowthOS platform.

The owner's selected deployment now moves the **entire website, audit worker and database to the already running Coolify server**. Vercel and Neon stay intact until a verified cutover, then their production use is retired. See [COOLIFY_DEPLOYMENT.md](./COOLIFY_DEPLOYMENT.md). The earlier Netlify worker project remains unused and undeployed; it has not been deleted.

## Implemented

- Public landing page with URL input, optional progressive business assessment, process/coverage explanation and fictional example report.
- Native DNS-pinned public HTML crawler with robots handling, bounded sitemap/link discovery, redirect validation, origin constraints and explicit excluded routes.
- Up to 25 public page observations with technical, SEO, HTML accessibility, content, trust, mobile foundations and conversion signals; unavailable checks remain unknown.
- Optional PageSpeed laboratory measurements and separate direct CrUX field data, with declared samples and provider failure states.
- Deterministic B2B/service and local-service analysis, attributed business facts, customer-task journey map, evidence-linked findings and confidence/coverage disclosure.
- Versioned capability catalog and prerequisite-aware Growth Stack, including existing-tool preference, alternatives, operating requirements, verification, effort and staged roadmap.
- Optional bounded Gemini analysis of redacted public evidence, plain-language explanations and provisional opportunities, with persistent request caps and a fallback report from the original checks. Original measurements and rule findings remain unchanged.
- Customer-friendly report pages/PDFs and an explicit customer API response contract; technical observations remain server-side. Viviz technical report pages/PDFs require the existing staff administration login.
- Durable PostgreSQL queue, worker heartbeat, fenced leases, progress checkpoints, cancellation, bounded retry/recovery, rolling quotas and duplicate submission protection.
- Browser-private reports, PDF export after required name/email capture, answer revision limits, include/defer/reject decisions and revision-fenced enquiry selection. Direct GET PDF requests are rejected; download contacts are stored separately and expire with their report.
- Transactional, consented implementation enquiries and idempotent notification outbox; Resend delivery remains explicitly opt-in.
- Thirty-day reports, immediate report deletion/revocation, scheduled retention cleanup and independent enquiry retention disclosure.
- Site navigation/SEO/privacy integration, additive migration, environment template, standalone worker container and [operating instructions](./WEBSITE_AUDIT_SETUP.md).
- Separate-worker deployment package: migration-before-start container, secret-excluding build context, restart/graceful-stop Compose configuration and a sanitized `audit:check` command. Startup cleanup completes before worker readiness is advertised; failed startup/shutdown closes the database pool.
- Free-hosting execution option: worker-only Netlify build configuration, authenticated background job dispatch, signed readiness checks and scheduled recovery/cleanup, while preserving PostgreSQL leases and customer privacy. Deployment and verification status are distinguished below.
- Full-site Coolify deployment source: standalone web Dockerfile with public/PDF assets, private worker, separate one-shot migration service, web liveness route and a full application migration runner. The selected runtime is standalone; the native Coolify PostgreSQL resource is configured separately.

Capabilities in the catalog are recommendations for a future implementation engagement. They do not install CRM, booking, WhatsApp, analytics or other operational modules.

## Implementation decisions relative to the planning baseline

| Planning candidate or ambition | Implemented boundary |
| --- | --- |
| Firecrawl and Inngest evaluation | Native HTTP/HTTPS collection and durable PostgreSQL jobs, with standalone Node and Netlify background execution options |
| Screenshot/visual sample | Deferred; no screenshots, target JavaScript rendering or visual/keyboard inspection |
| Complete website audit | Explicitly scoped public-page sample; report states coverage and untested areas |
| AI explanations | Rules select/rank; optional Gemini adds explanations and explicitly tentative evidence-linked ideas without changing original findings |
| Trend-based ideas | Relevant capability opportunities; no unsourced current-trend claims |
| GrowthOS operational platform | Future scope; tenant accounts, CMS/CRM, entitlements, activation, workflows and billing are not built |

The canonical plan remains the product baseline; this status records the narrower delivered collection scope without implying visual or full-site certification.

## Environment and verification

- The configured local PostgreSQL connection is reused; credentials were not copied into documentation.
- The additive `001_website_audits.sql`, `002_audit_report_downloads.sql` and `003_audit_ai_usage.sql` migrations have been applied locally. Existing business tables are preserved. The migration runner records applied files and skips them on later runs.
- Current automated verification including the Coolify changes: **110 tests passed**, including database bootstrap/migration cases and the opt-in local PostgreSQL integration tests, with AI/email delivery disabled. Coverage also includes network restrictions, crawl boundaries, deterministic recommendations, mocked deeper Gemini output/redaction/fallback/budgets, customer response separation, staff access, origin/body validation, ownership, quotas, idempotency, stale revisions, cancellation, deletion, expiry, PDF contact capture, worker startup/shutdown failures, signed background dispatch/readiness, scheduled recovery and job-specific claims. The suite ran sequentially to fit local memory limits.
- TypeScript compilation and the full Next.js production build passed for the current Coolify changes, including a production build without runtime secrets. Targeted ESLint passed for the contact route and migration tests. Coolify Compose structure checks passed for web/worker migration gates, standalone mode and no host ports. The earlier Netlify worker bundle build also passed. Docker remains unavailable locally, so these results do not establish a successful container image build or deployment.
- All three compiled worker functions (`audit.mjs`, `audit-health.mjs` and `audit-rescue.mjs`) imported successfully in plain Node without the `react-server` flag. Local smoke checks confirmed unsigned audit work did nothing, unsigned health returned 401, signed health checked the local database and returned ready/200, and the disabled scheduler did nothing. These checks made no external website, Gemini or notification request. They do not establish production deployment or provider execution.
- Browser checks passed at 1440 px and 360 px across the landing page and all four customer report sections: no horizontal overflow, hydration errors or page exceptions. Disabled sample mutations were verified. Existing third-party analytics requests were blocked by the test environment.
- A live `example.com` scan passed through submission, durable worker progress, retained HTML observations, private report/PDF access, idempotent enquiry storage and deletion. The PDF contained 12,525 bytes; no notification email was sent, and generated test records were removed.
- The PDF contact gate passed browser checks at 1440 px and 360 px using an isolated fictional report: blank/invalid fields blocked submission, valid name/email generated a 27,832-byte PDF and one download contact, keyboard focus returned after download, and Escape/Cancel closed the dialog. Direct GET returned 405, missing details returned 400, and another browser returned 404. Deletion removed the download contact; no enquiry was created, no email was sent, and fixture data was removed.
- The current customer/staff split passed a separate isolated browser/API run: customer JSON and an eight-page customer PDF excluded a seeded technical diagnostic; the same diagnostic was present in authorized staff HTML and the seven-page technical PDF. Customer/anonymous cookies could not access staff reports; actual existing staff login enabled them. Reassessment/decision responses retained the customer contract, enquiry selections used the correct IDs, and report deletion revoked staff exports. Test enquiries/contacts/reports were removed; no notification email or live Gemini request was sent.
- Current customer PDF was rendered and checked for all expected sections, repeated privacy footers and text outside page bounds. The local Gemini key is not configured. Integration tests use mocked responses; live model quality, free-tier account limits and real provider availability still need verification after configuration.
- One repeat database test encountered PostgreSQL error 53100 (disk space). After reclaiming unused space only in the new audit tables, the final complete suite passed. The system drive hosting local PostgreSQL still had very little free space (about 38 MiB when checked); free sufficient system-drive capacity before sustained local use. No unrelated files or business tables were cleaned.
- Database integration tests require `AUDIT_DB_TESTS=true` and a migrated local PostgreSQL database. They use fictional rows, clean up their fixtures and do not deliver emails.
- Real scans need the website and a configured execution service: a recent standalone worker heartbeat in default mode, or a reachable signed Netlify health endpoint in Netlify mode. Missing readiness produces HTTP 503.
- The worker deployment additions passed targeted ESLint and TypeScript checks. Compose YAML parsed successfully, and the new CLI correctly reported a ready local schema with an offline worker. Docker is not installed in this workspace, so the container build and real host smoke test remain unverified.
- No paid provider account or hosting resource has been provisioned. A Netlify Free worker project was created with the owner's OAuth authorization but remains undeployed and is no longer the selected target. The existing Coolify server will host the full site and database.
- Production diagnosis on 24 October 2026 confirmed the pushed site is deployed on Vercel and an audit request returned PostgreSQL `42P01`. The local migrations described above have not migrated production. Neon is the confirmed source database; the selected target is a separate native Coolify PostgreSQL resource. No production migration, application deployment, production website DNS cutover or successful live audit is claimed.

## Coolify migration status

Repository changes prepare a Git Application with the Compose build strategy and `docker-compose.coolify.yml`: `migrate`, `web` and `worker` services, with no host database or worker ports. The native PostgreSQL resource uses persistent storage and its private/internal URL, reachable after enabling Connect to predefined network. `web` receives `https://viviz.in:3000` in Coolify's domain routing; public HTTPS remains on port 443. The web health route is process liveness only; database/schema and audit heartbeat require `audit:check` separately.

The full `db:migrate` command applies the core schema, two additive invoice upgrades and three audit migrations in a transaction with a ledger and advisory lock. The initial one-shot migration service gates startup; the worker also migrates on each start. Ordinary container restarts do not guarantee the completed one-shot service reruns. Restore the complete Neon database to an empty target **before** bootstrap/migrations, then compare records, IDs, sequences and payment states. No migration has run remotely.

The owner added dashboard DNS and configured `https://coolify.viviz.in`, which resolves to `187.127.178.143` with a trusted certificate. The unauthenticated health endpoint returns 200 and authenticated Coolify API access (4.5.0) works. The token is stored only in ignored private local access configuration. No credential values are documented. The owner has no SSH access; the authenticated HTTPS API is the selected management path.

An empty **Viviz Website** project (`p7snoy3td2uupcnbzon9pm1g`) and **production** environment (`veg72ary2usrrwv4wzudosf4`) have been created on the existing server. No application, target database or deployment has been created. The Neon source connection was requested privately and remains pending. Source version/extension inspection, backup/restore rehearsal, production restore, application deployment, production website HTTPS/DNS cutover and old-host retirement remain pending. Dashboard DNS was changed by the owner; the agent has not cut over production website DNS or migrated its database. Current tests, TypeScript and the full Next.js production build passed; Docker is unavailable locally, so no container image build or deployment has run.

The no-SSH restore route is supported by Coolify's authenticated [database import API](https://coolify.io/docs/api/endpoints/databases/create-database-import): privately upload the backup, submit its upload ID for the empty target, and verify completion/status and restored records before application migrations. No production dump or import has run.

The migration preserves current staff login/session, Resend contact-mail, Google verification/Analytics and SabPaisa live configuration. Legacy SabPaisa aliases must be mapped into the canonical environment names used by Compose. Freeze source writes, including new payments, and settle or reconcile in-flight callbacks before the final dump. Keep Vercel/Neon available until the restored site, PDFs, staff/audit privacy and payment callbacks pass; this Compose path makes no zero-downtime claim. Backups use storage the owner already controls rather than requiring a new paid service.

## Prior unused Netlify option

The earlier worker-only target was the current credit-based Netlify Free plan. It remains an unused alternative, not the selected migration. [Background Functions](https://docs.netlify.com/build/functions/background-functions/) support up to fifteen minutes on that plan. The [Free allowance](https://www.netlify.com/pricing/) is 300 credits per month with a hard cap; hosted projects pause at exhaustion instead of incurring overage charges. It is a usage-limited free option, not an unlimited service.

The retained root `netlify.toml` builds only the worker with `npm run audit:migrate && npm run audit:build:netlify`, publishes `netlify/public`, and packages functions from `output/audit-worker/functions` with the automatic Next.js adapter disabled. This option would require `AUDIT_EXECUTION_MODE=netlify`, a stable worker URL and the same private signing secret on both hosts. Its scheduled recovery/retention is configured every twelve minutes (`*/12 * * * *`), within the fifteen-minute queued-job expiry. The selected Coolify stack instead uses `standalone` and does not require these Netlify secrets or callbacks.

The recovery interval leaves room for an idle Neon database to suspend between checks. [Neon documents](https://neon.com/docs/introduction/cost-optimization) a five-minute inactivity period and warns that frequent cron jobs can keep compute active. Actual usage depends on other activity in the shared database; this interval and the five-scan daily cap do not guarantee that total use fits either provider's free allowance.

Optional enquiry notification delivery retains the durable outbox and stable Resend idempotency keys. Each scheduled run attempts at most one notification, with an eight-second provider request timeout; failed attempts remain subject to the existing bounded retry policy. Delivery stayed disabled during verification.

OAuth connection to the owner's `VivizTechnologies` Netlify account is authorized and complete. The account's current credit-based Free plan was verified with 300 credits, Background Functions available, overage accumulation disabled and automatic top-up not enabled. The worker project [`viviz-audit-worker`](https://app.netlify.com/projects/viviz-audit-worker/configuration/env) has been created with production address `https://viviz-audit-worker.netlify.app` (project ID `2b039747-e889-4b61-b33a-b9cb9ed2e1d3`). This project address does not establish that functions have been deployed.

The private signing secret and execution mode/URL flags are staged on Netlify only. `AUDIT_ENABLED=false` keeps the unused project disabled. No production credentials are exposed in documentation. It has not been deployed or deleted. Do not activate it for the selected Coolify migration; account connection and project creation were prior work, not evidence of a live audit service.

The isolated official Netlify CLI 27.14.2 and function packager 16.5.1 verified the rebuilt function metadata: `audit` uses background invocation and runtime 2, `audit-rescue` has schedule `*/12 * * * *`, and `audit-health` uses runtime 2. The twelve-minute schedule recheck passed ten targeted Netlify tests, the worker bundle build and official packaging verification. A temporary migration helper was prepared with only the three approved audit SQL migrations and passed three mocked checks; it has not run against production and must be removed from the final three-function worker artifact. The prior 108-test application result is unchanged. No code was pushed during this account-connection/setup step.

Netlify [allows commercial projects on Free](https://www.netlify.com/guides/netlify-vs-vercel/). The existing website remains on Vercel Hobby, whose [scope is personal and non-commercial](https://vercel.com/docs/plans/hobby), until verified full-site cutover. The owner has now selected the existing Coolify server instead of this worker-only alternative.

## Before public launch

- Repeat deployment checks with production configuration and retain the verification results above as the local implementation baseline.
- Verify the live end-to-end path on the deployment environment: enqueue, worker progress, partial/failed states, report privacy, PDF, re-assessment, selections, consented enquiry, cancellation and deletion.
- Run the planned 20-site pilot across representative business types; review false positives, usefulness, accessibility and recommendation sequencing with people.
- Configure any optional provider deliberately and measure actual limits, usage cost, failure behavior and data-processing implications. Verify the intended Resend sender/recipient before email delivery.
- Complete the [Coolify restore/cutover procedure](./COOLIFY_DEPLOYMENT.md), verify persistent data and payment callbacks, then retire Vercel/Neon production use after the rollback window. Confirm proxy IP handling and assign server, backup, retention and notification monitoring ownership.

No browser pilot, provider cost calibration or broader GrowthOS readiness is claimed by the presence of source files or unit tests. See the [product plan](./website-audit-product-plan.md) for future stages.
