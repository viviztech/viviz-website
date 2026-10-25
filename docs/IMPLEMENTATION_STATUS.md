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

The local/unit/browser checks below are historical implementation baselines. The completed public production verification is recorded in the Coolify status section.

- The configured local PostgreSQL connection is reused; credentials were not copied into documentation.
- The additive `001_website_audits.sql`, `002_audit_report_downloads.sql` and `003_audit_ai_usage.sql` migrations have been applied locally. Existing business tables are preserved. The migration runner records applied files and skips them on later runs.
- Current automated verification including the Coolify changes: **110 tests passed**, including database bootstrap/migration cases and the opt-in local PostgreSQL integration tests, with AI/email delivery disabled. Coverage also includes network restrictions, crawl boundaries, deterministic recommendations, mocked deeper Gemini output/redaction/fallback/budgets, customer response separation, staff access, origin/body validation, ownership, quotas, idempotency, stale revisions, cancellation, deletion, expiry, PDF contact capture, worker startup/shutdown failures, signed background dispatch/readiness, scheduled recovery and job-specific claims. The suite ran sequentially to fit local memory limits.
- TypeScript compilation and the full Next.js production build passed for the current Coolify changes, including a production build without runtime secrets. Targeted ESLint passed for the contact route and migration tests. Coolify Compose structure checks passed for web/worker migration gates, standalone mode and no host ports. The earlier Netlify worker bundle build also passed. Local Docker remains unavailable; the actual Coolify image build and private runtime checks are verified separately below.
- All three compiled worker functions (`audit.mjs`, `audit-health.mjs` and `audit-rescue.mjs`) imported successfully in plain Node without the `react-server` flag. Local smoke checks confirmed unsigned audit work did nothing, unsigned health returned 401, signed health checked the local database and returned ready/200, and the disabled scheduler did nothing. These checks made no external website, Gemini or notification request. They do not establish production deployment or provider execution.
- Browser checks passed at 1440 px and 360 px across the landing page and all four customer report sections: no horizontal overflow, hydration errors or page exceptions. Disabled sample mutations were verified. Existing third-party analytics requests were blocked by the test environment.
- A live `example.com` scan passed through submission, durable worker progress, retained HTML observations, private report/PDF access, idempotent enquiry storage and deletion. The PDF contained 12,525 bytes; no notification email was sent, and generated test records were removed.
- The PDF contact gate passed browser checks at 1440 px and 360 px using an isolated fictional report: blank/invalid fields blocked submission, valid name/email generated a 27,832-byte PDF and one download contact, keyboard focus returned after download, and Escape/Cancel closed the dialog. Direct GET returned 405, missing details returned 400, and another browser returned 404. Deletion removed the download contact; no enquiry was created, no email was sent, and fixture data was removed.
- The current customer/staff split passed a separate isolated browser/API run: customer JSON and an eight-page customer PDF excluded a seeded technical diagnostic; the same diagnostic was present in authorized staff HTML and the seven-page technical PDF. Customer/anonymous cookies could not access staff reports; actual existing staff login enabled them. Reassessment/decision responses retained the customer contract, enquiry selections used the correct IDs, and report deletion revoked staff exports. Test enquiries/contacts/reports were removed; no notification email or live Gemini request was sent.
- The customer PDF was rendered and checked for all expected sections, repeated privacy footers and text outside page bounds. Integration tests use mocked Gemini responses; separate real Gemini-assisted audits have passed on private and public Coolify as recorded below. Broader model quality and free-tier usage calibration remain unverified.
- One repeat database test encountered PostgreSQL error 53100 (disk space). After reclaiming unused space only in the new audit tables, the final complete suite passed. The system drive hosting local PostgreSQL still had very little free space (about 38 MiB when checked); free sufficient system-drive capacity before sustained local use. No unrelated files or business tables were cleaned.
- Database integration tests require `AUDIT_DB_TESTS=true` and a migrated local PostgreSQL database. They use fictional rows, clean up their fixtures and do not deliver emails.
- Real scans need the website and a configured execution service: a recent standalone worker heartbeat in default mode, or a reachable signed Netlify health endpoint in Netlify mode. Missing readiness produces HTTP 503.
- The worker deployment additions passed targeted ESLint and TypeScript checks. Compose YAML parsed successfully, and the new CLI correctly reported a ready local schema with an offline worker. The subsequent Coolify deployment built the actual Docker images and passed private web/worker checks; local Docker remains unavailable.
- No paid provider account or hosting resource has been provisioned. A Netlify Free worker project was created with the owner's OAuth authorization but remains undeployed and is no longer the selected target. The existing Coolify server now hosts the full site and database.
- Historical diagnosis on 24 October 2026 found PostgreSQL `42P01` on the Vercel audit route. The 25 October migration restored and verified the original records on Coolify and passed the public audit lifecycle. Vercel is now paused and Neon is read-only, with original business rows retained.

## Coolify production status — 25 October 2026

The site, audit worker and production database are active on the existing Coolify server. Application **viviz-website** (`yvvtdetv81ed1rkfluljzlum`) runs deployment `gla3klmkmetbr48rn5zveyja` at commit **`03418d7`** from `deploy/coolify-hosting`; `main` is unchanged. Web/worker and native PostgreSQL are healthy. Compose uses the migration startup gate and predefined networking. Only web is publicly routed; PostgreSQL, the worker and web port 3000 have no published host ports.

The active private PostgreSQL 17 resource is **viviz-postgresql-production** (`whogu4vmippacy6c6bpq5zvq`). After the owner confirmed readiness, Vercel was paused and source database/role read-only defaults were verified over direct, pooled and Neon HTTP transports. Original business rows were not mutated. The final consistent **31,424-byte** source backup is retained privately off-host on the owner's D: drive. Restore import **108**, integrity comparison **109** and post-migration validation **110** passed: all twelve original table fingerprints, three sequence states, original columns/constraints, seven audit tables and three migration records are preserved. The former rehearsal database (`muhldiu6qypv45johlplqyb4`) remains separate and private.

The owner copied and removed Hostinger's existing apex ALIAS, then added **A `@` → `187.127.178.143`, TTL 300**. The existing `www` CNAME to the apex and mail records were unchanged. Web routes both HTTPS names through internal port 3000 with a permanent `www`-to-apex redirect. Trusted certificates were obtained with an application-only route refresh after DNS changed; the shared proxy was not restarted.

Final public checks against the new address with strict certificate/hostname validation passed: apex HTTPS 200, permanent `www` redirect, staff login, existing invoice/offer-letter PDFs, owner-isolated audit progress, name/email-required customer PDF, staff-only technical PDF and test-audit deletion followed by 404. The complete audit returned **`aiAssisted:true`**. The proof is kept privately in `.env.coolify-backups/public-cutover-verified.json`. Ordinary, unpinned public health/home requests also returned 200 from the new site with trusted HTTPS, the correct canonical URL and no indexing-blocking header/meta directive.

An unsigned public callback initially exposed an internal-origin redirect. Commit `03418d7` uses canonical `BASE_URL` for callback redirects; focused GET/POST tests and lint passed. The final callback check returned 303 to `https://viviz.in/pay/result?error=missing_response`. No live charge was initiated. The broader historical baseline passed 110 automated tests, TypeScript and a secret-free production build; the final image build and live-flow checks passed separately.

Staff/session, Resend, SabPaisa `prod` and Gemini settings are saved privately and applied as runtime-only values with log redaction. Resend authentication passed a read-only domains request; no email was sent or verified `viviz.in` sending domain established, and the existing onboarding sender is retained. Local synthetic payment signature acceptance/tamper rejection passed without provider HTTP. Live email delivery and checkout are not claimed verified.

Gemini uses **`gemini-3.5-flash-lite`**, with application caps of 20 requests per day, two per minute and five audits per day globally. Authenticated model discovery and private/public enriched audits passed. One earlier public attempt used the expected rules fallback and failed the strict AI-only check; the final retry passed. Provider/quota/validation failures can still retain the rules report. [Google documents the model's free tier](https://ai.google.dev/gemini-api/docs/pricing); no unlimited-free or broader quality-calibration claim is made.

Daily local backups are **active at 03:00 IST**, retaining the last 14 successful archives on existing server storage with S3 disabled. The first backup succeeded with a 47,413-byte archive. The final source archive is also held off-host; automated off-host replication is not configured. The [deployment guide](./COOLIFY_DEPLOYMENT.md) records runtime/build settings, backup configuration and recovery limits.

Vercel remains paused and Neon remains read-only; neither source nor the rehearsal database was deleted. An earlier catalog reset did not clear PgBouncer's cached startup read-only state, so a full rollback was not demonstrated. The reviewed forward resume recognized the owned pooler session and passed fresh transport checks while preserving original journals. Any reversal after new production writes requires reconciliation and fresh pool/transport proof. The local unfreeze/restore helper now requires `--reconciliation-confirmed` after public verification; its guard passed without network access.

DNS propagation is still finishing: some Google responses retained the old Vercel address while Cloudflare and ordinary public checks reached the new server. Keep the legacy write fence in place while caches expire. Remaining follow-up is monitoring, delivery/checkout verification when deliberately authorized, and the planned broader website-audit pilot. No old-resource retirement or deletion is required now.

## Prior unused Netlify option

The earlier worker-only target was the current credit-based Netlify Free plan. It remains an unused alternative, not the selected migration. [Background Functions](https://docs.netlify.com/build/functions/background-functions/) support up to fifteen minutes on that plan. The [Free allowance](https://www.netlify.com/pricing/) is 300 credits per month with a hard cap; hosted projects pause at exhaustion instead of incurring overage charges. It is a usage-limited free option, not an unlimited service.

The retained root `netlify.toml` builds only the worker with `npm run audit:migrate && npm run audit:build:netlify`, publishes `netlify/public`, and packages functions from `output/audit-worker/functions` with the automatic Next.js adapter disabled. This option would require `AUDIT_EXECUTION_MODE=netlify`, a stable worker URL and the same private signing secret on both hosts. Its scheduled recovery/retention is configured every twelve minutes (`*/12 * * * *`), within the fifteen-minute queued-job expiry. The selected Coolify stack instead uses `standalone` and does not require these Netlify secrets or callbacks.

The recovery interval leaves room for an idle Neon database to suspend between checks. [Neon documents](https://neon.com/docs/introduction/cost-optimization) a five-minute inactivity period and warns that frequent cron jobs can keep compute active. Actual usage depends on other activity in the shared database; this interval and the five-scan daily cap do not guarantee that total use fits either provider's free allowance.

Optional enquiry notification delivery retains the durable outbox and stable Resend idempotency keys. Each scheduled run attempts at most one notification, with an eight-second provider request timeout; failed attempts remain subject to the existing bounded retry policy. Delivery stayed disabled during verification.

OAuth connection to the owner's `VivizTechnologies` Netlify account is authorized and complete. The account's current credit-based Free plan was verified with 300 credits, Background Functions available, overage accumulation disabled and automatic top-up not enabled. The worker project [`viviz-audit-worker`](https://app.netlify.com/projects/viviz-audit-worker/configuration/env) has been created with production address `https://viviz-audit-worker.netlify.app` (project ID `2b039747-e889-4b61-b33a-b9cb9ed2e1d3`). This project address does not establish that functions have been deployed.

The private signing secret and execution mode/URL flags are staged on Netlify only. `AUDIT_ENABLED=false` keeps the unused project disabled. No production credentials are exposed in documentation. It has not been deployed or deleted. Do not activate it for the selected Coolify migration; account connection and project creation were prior work, not evidence of a live audit service.

The isolated official Netlify CLI 27.14.2 and function packager 16.5.1 verified the rebuilt function metadata: `audit` uses background invocation and runtime 2, `audit-rescue` has schedule `*/12 * * * *`, and `audit-health` uses runtime 2. The twelve-minute schedule recheck passed ten targeted Netlify tests, the worker bundle build and official packaging verification. A temporary migration helper was prepared with only the three approved audit SQL migrations and passed three mocked checks; it has not run against production and must be removed from the final three-function worker artifact. The prior 108-test application result is unchanged. No code was pushed during this account-connection/setup step.

Netlify [allows commercial projects on Free](https://www.netlify.com/guides/netlify-vs-vercel/). At that earlier stage the website used Vercel Hobby, whose [scope is personal and non-commercial](https://vercel.com/docs/plans/hobby). The full site has since moved to the existing Coolify server; this Netlify alternative remains unused.

## Post-cutover follow-up

- Monitor DNS propagation, worker readiness, database storage/connections and successful daily backup execution; retain the private and public verification proofs.
- Repeat relevant live-flow checks after meaningful code/configuration changes. The public staff/audit/PDF/privacy path has passed; broader reassessment/enquiry/pilot coverage remains part of the product validation plan.
- Run the planned 20-site pilot across representative business types; review false positives, usefulness, accessibility and recommendation sequencing with people.
- Configure any optional provider deliberately and measure actual limits, usage cost, failure behavior and data-processing implications. Verify the intended Resend sender/recipient before email delivery.
- Preserve paused/read-only Vercel/Neon sources and private journals. Reconcile new production writes and prove fresh pool/transport behavior before any rollback. Assign server, backup, retention and notification monitoring ownership; no old-resource deletion is required now.

No browser pilot, provider cost calibration or broader GrowthOS readiness is claimed by the presence of source files or unit tests. See the [product plan](./website-audit-product-plan.md) for future stages.
