# Website Audit: setup and operations

The first delivery adds the free Website Audit and Adaptive Growth Planner to the existing Viviz Next.js site. Read [IMPLEMENTATION_STATUS.md](./IMPLEMENTATION_STATUS.md) for verification and launch status, and [the product plan](./website-audit-product-plan.md) for the broader intent.

**Selected hosting: move the entire website, audit worker and database to the owner's existing Coolify server.** Follow [COOLIFY_DEPLOYMENT.md](./COOLIFY_DEPLOYMENT.md) for configuration, Neon data restore, HTTPS/DNS cutover and retirement of Vercel/Neon after verification. Use `AUDIT_EXECUTION_MODE=standalone` for this stack. The Netlify instructions retained below describe an earlier unused option; the created Netlify project has not been deployed or deleted.

## Start locally

Use a supported Node.js installation with npm and an accessible PostgreSQL database. This workspace already has a local database configuration; do not overwrite it with sample credentials. `.env.example` documents variable names without secrets.

From the repository root in PowerShell:

```powershell
npm.cmd ci
npm.cmd run audit:migrate
```

The migration command applies versioned audit migrations, including `002_audit_report_downloads.sql` for PDF contact capture and `003_audit_ai_usage.sql` for shared Gemini usage limits, and records which files were applied. It creates only the `website_audit*` tables and indexes. It does not migrate or replace existing invoice, employee or payment data. Run it against each deployment database before enabling a new version.

Keep the worker running in one terminal:

```powershell
npm.cmd run audit:worker
```

Start the site in another terminal:

```powershell
npm.cmd run dev
```

Open `/website-audit`. `/website-audit/example` is an explicitly labelled fictional report, available without a scan. Actual scans accept public website addresses only; localhost/private-address bypasses are deliberately unavailable.

Local development uses `AUDIT_EXECUTION_MODE=standalone`, the default. In this mode new audit submissions return HTTP 503 when no worker has sent a heartbeat in the last 90 seconds or `AUDIT_ENABLED=false`. Starting only the web server is insufficient. The free hosted mode below uses authenticated background-function readiness instead of a continuous process heartbeat. A report link also requires the cookie of the browser that created the report.

## Implemented architecture

- Next.js Node.js API routes validate requests, enforce browser ownership and enqueue durable PostgreSQL jobs.
- Jobs run either in a separate `scripts/audit-worker.ts` process or in a Netlify Background Function. Both use the same PostgreSQL transactions, row locks, expiring leases and fencing tokens. The request that submits a scan never owns its lifetime.
- The native HTTP/HTTPS collector resolves and validates public addresses, pins the connection to an approved address, checks every redirect, follows robots policy, and extracts bounded HTML facts with Cheerio.
- Discovery stays on the approved origin and combines permitted sitemaps, links and prioritized public information pages. Account, administration, action, download and transaction routes are excluded.
- Deterministic analysis combines those observations with optional visitor answers. The versioned capability catalog supplies prerequisites, alternatives, operating needs, effort, verification and roadmap sequencing.
- PostgreSQL stores observations, reports, assessment revisions, decisions and enquiry snapshots. Reports and PDFs are generated from that evidence; target scripts and HTML are never executed inside the app.
- Enquiries save transactionally before notification. Worker execution drains the outbox, using stable Resend idempotency keys and bounded retries.

The runtime does not use Firecrawl or Inngest. These were planning candidates. The collection path is DNS-pinned HTML collection plus a PostgreSQL queue, with standalone and Netlify background execution options.

## Runtime limits

| Control | Default behavior |
| --- | --- |
| Coverage | Up to 25 public HTML page observations; coverage and limitations are shown |
| Discovery and collection | At most 500 discovered URLs, 80 requests and 20 MiB across collection |
| Time | HTML crawl budget 330 seconds; job lease renewal stops after ten minutes |
| Liveness | Standalone process heartbeat and active job lease renewal every 15 seconds; 90-second lease. Netlify mode checks its signed health endpoint before submission |
| Recovery | At most two job claims; stale work is recovered or finalized by cleanup |
| Concurrency | Two jobs globally; each worker process currently executes one job at a time |
| Rolling 24-hour submissions | Three per browser, twelve per hashed IP and one hundred globally |
| Assessment revisions | Six saved assessments per audit by default |
| Conflicts | One active audit per browser and target origin; stale revisions return HTTP 409 |

The documented quota and concurrency environment variables in `.env.example` are bounded overrides, not unlimited settings. The template starts at five scans per rolling day for a small free-hosting pilot; the application default remains one hundred if the override is omitted. Monitor actual hosting credits before changing it. Two independent standalone workers are needed to use the default concurrency of two fully; Netlify can invoke separate jobs concurrently within the same database limit.

## Optional services

The core collector, rule engine, report, PDF and saved enquiry work without a new paid provider account. No new paid accounts have been configured by this implementation.

| Feature | Required configuration | Behavior without it |
| --- | --- | --- |
| Google PageSpeed Insights | `AUDIT_PAGESPEED_ENABLED=true` and `PAGESPEED_API_KEY` | Lab results are marked unavailable; no score is invented |
| Direct CrUX field data | `AUDIT_CRUX_ENABLED=true` and `CRUX_API_KEY` | Real-user data is marked unavailable, not failed |
| Deeper Gemini analysis | `AUDIT_AI_ENABLED=true`, `GEMINI_API_KEY`, supported `AUDIT_AI_MODEL` | Plain-language report generated from the checks remains available |
| Resend notifications | `AUDIT_SEND_EMAIL=true`, `RESEND_API_KEY`, verified `AUDIT_FROM_EMAIL`, intended `AUDIT_TO_EMAIL` | Enquiries remain saved with notification pending |

PageSpeed measures at most four declared page/device samples: a primary page on mobile and desktop and up to two additional pages on mobile. Its external browser and resource requests are operated by Google, separately from the collector. CrUX tries mobile URL data and then origin data; many sites lack sufficient public data. Lab TBT is not INP.

Gemini receives bounded, redacted excerpts from up to eight readable public pages, a limited set of checks/recommendations and categorical business context. It can add a plain-language overview, explanations, evidence-linked strengths and up to three tentative ideas/questions. This advisory layer is stored separately from the original checks. It cannot change technical findings, measurements, confidence, priorities, prerequisites or visitor decisions, and cannot claim live trend/competitor research. Invalid, unavailable, timed-out or quota-limited output falls back to the report prepared from checks. A business-answer update rebuilds the advisory layer; a newer edit or deletion wins over a late AI result.

To enable the free-tier integration:

1. Create a key in a Google AI Studio project that uses the free tier, with no billing upgrade. The app cannot determine billing status from an API key; model eligibility alone does not guarantee a request is unbilled.
2. Store `GEMINI_API_KEY` as a server/worker secret. Set `AUDIT_AI_ENABLED=true` and `AUDIT_AI_MODEL=gemini-3.8-flash`. The supported alternative is `gemini-3.5-flash-lite`. These models were listed with free standard input/output on [Google's pricing page](https://ai.google.dev/gemini-api/docs/pricing) on 24 October 2026. Recheck availability and project limits before deployment.
3. Run migrations and restart both web and worker. A missing key or disabled flag makes no provider request. No live Gemini request was made during local verification because no key is configured.
4. Start with `AUDIT_AI_DAILY_LIMIT=20` and `AUDIT_AI_MINUTE_LIMIT=2`, lowering them to fit the project's actual quota. These are shared, persistent application caps, not claims about Google's quota. Failures count against the budget. There is one bounded request per enrichment attempt, no retry, paid-model fallback, grounding search or tools. Input is capped at 32 KB, response at 48 KB, output at 6,144 tokens and provider time at 20 seconds. Old aggregate budget windows are removed after two days; they contain no customer identifiers.

Free-tier inputs and outputs may be used to improve Google's products, including human review under [Google's terms](https://ai.google.dev/gemini-api/terms). The payload excludes download/enquiry contact details and messages, credentials, raw HTML, page headers, form fields and full URLs. Redaction reduces direct personal identifiers in public excerpts; it is not a guarantee that arbitrary public text contains no identifying information. Use only intentionally public content. No paid account or billing configuration is created by this code.

## Customer and Viviz reports

Customer report pages and PDFs explain the gap, why it matters to visitors, the suggested change and a practical sequence. Every public audit API uses an explicit customer response contract; technical page bodies, response headers, raw measurements, rule diagnostics and the full stored report are excluded, rather than hidden in the UI. Existing stored reports receive the same plain-language projection. Advisory ideas are clearly labelled and do not become selectable verified findings.

Viviz staff use `/invoice/website-audits` and `/invoice/website-audits/[id]` through the existing invoice administration login at `/invoice/login`. The existing `INVOICE_PASSWORD` and `INVOICE_SESSION_SECRET` must be configured. This reuses the existing trusted administration access; it does not introduce employee-level roles. Staff can read technical checks, evidence, measurements, retained page observations, categorical customer context, choices and provisional AI analysis. The technical PDF is available at `GET /api/invoices/website-audits/[id]/report`. Both pages and the data layer recheck staff access; an anonymous report ownership cookie grants no technical access. Staff responses are private, uncached and excluded from indexing. Report expiry/deletion revokes staff access too.

## Prior unused option: Netlify hosted worker

This earlier worker-only proposal is retained as reference and is **not the selected deployment**. It would keep the website on Vercel and share its production database with a Netlify worker. The current choice instead moves all three components to Coolify using the guide above. No Netlify functions have been deployed. [Netlify Background Functions](https://docs.netlify.com/build/functions/background-functions/) allow up to fifteen minutes on its current credit-based Free plan; legacy plans have different eligibility.

The current [Free plan](https://www.netlify.com/pricing/) includes 300 credits per month with a hard limit and no overage charges. Reaching the shared account limit pauses hosted projects until the next cycle. A production deployment currently uses 15 credits and function compute uses 10 credits per GB-hour; request traffic and bandwidth also consume credits. Start with `AUDIT_GLOBAL_DAILY_LIMIT=5` on both hosts, avoid unnecessary production deployments and monitor the account's usage. Five scans per day is a starting limit, not a guarantee that all use fits: recovery, invocation duration, other projects and deployments share the allowance. Keep the account on Free and do not enable paid add-ons, credit purchases or auto recharge.

Netlify explicitly [permits commercial projects on Free](https://www.netlify.com/guides/netlify-vs-vercel/). The existing website is on Vercel Hobby, whose [documented scope is personal, non-commercial use](https://vercel.com/docs/plans/hobby). The selected full-site Coolify migration replaces this earlier worker-only approach; this archived worker configuration does not migrate the website or its domain.

### Reference configuration for the unused worker option

1. The owner's OAuth connection is now authorized. The `VivizTechnologies` account has been verified on the current credit-based **Free** plan with 300 credits and Background Functions enabled; overage accumulation is disabled and automatic top-up is not enabled. The worker project `viviz-audit-worker` has been created at `https://viviz-audit-worker.netlify.app`. Its [environment settings](https://app.netlify.com/projects/viviz-audit-worker/configuration/env) are the destination for private worker configuration. No functions have been deployed yet. Use the root `netlify.toml` for deployment. If a private organization-owned repository is unavailable on Free, use a local CLI/API deployment rather than upgrading the account.
2. Configure private environment variables for **both build and functions** on Netlify. Use the exact production `DATABASE_URL` already used by the website, including its SSL settings. Do not use the workspace's localhost database or create a second database. Set `AUDIT_ENABLED=true`, `AUDIT_EXECUTION_MODE=netlify`, and `AUDIT_GLOBAL_DAILY_LIMIT=5`. Create one signing secret from at least 32 random bytes and store it as `AUDIT_WORKER_SECRET`; use the same value on both hosts. Do not commit it or use a `NEXT_PUBLIC_` name.
3. Use `AUDIT_WORKER_URL=https://viviz-audit-worker.netlify.app/.netlify/functions/audit` on both Netlify and the website host. This value and the matching signing secret are already staged on Netlify; the website still needs matching settings before activation. The matching health endpoint is `/.netlify/functions/audit-health`. This is a worker endpoint, not a customer report address. Add the same signing secret, `AUDIT_EXECUTION_MODE=netlify`, enabled flag and daily cap to the website's production environment. Keep collection disabled until the worker and database are ready.
4. Keep optional providers disabled unless intentionally configured. For Gemini, set `GEMINI_API_KEY`, `AUDIT_AI_ENABLED=true`, `AUDIT_AI_MODEL=gemini-3.8-flash`, `AUDIT_AI_DAILY_LIMIT=20` and `AUDIT_AI_MINUTE_LIMIT=2` on both hosts. The same flags are needed by the website for later business-answer updates. Keep `AUDIT_SEND_EMAIL=false` until a verified sender and intended recipient are configured.
5. Build the Netlify worker using `npm run audit:migrate && npm run audit:build:netlify`. The repository configuration publishes `netlify/public` and functions from `output/audit-worker/functions`; `NETLIFY_NEXT_PLUGIN_SKIP=true` disables the automatic Next.js adapter for this worker-only project. Applied audit migrations are skipped; missing audit tables are created in the configured shared database before functions are published. Do not replace this command with `next build`.
6. Explicitly **publish** the worker project after reviewing its configuration. New projects on current Netlify accounts can start private; the website must be able to reach the worker's production functions. Do not protect this project with interactive login. Worker requests themselves require a timestamped signature and a valid job ID, and the health check requires its own signed request.
7. Redeploy the website with its new execution settings after the worker is published. Run `npm run audit:check` with the same production configuration available through a private local environment or the hosting command runner. In Netlify mode it verifies the schema and signed health response; it does not require an idle process to send a continuous heartbeat. `npm run audit:check -- --schema-only` checks the database tables only. Do not paste credentials into command lines, logs or chat.
8. Run one audit through the live website and confirm the saved report, customer PDF and staff-only technical view. Check cancellation, deletion and recovery before opening the service to wider traffic. A function's immediate HTTP 202 only confirms invocation acceptance, not successful completion of the audit.

The dispatcher sends only a signed audit ID; the function claims that specific durable job. Duplicate invocations remain subject to database leases and fencing. Normal jobs are dispatched immediately; Netlify retries failed background invocations after one and then two minutes. The `audit-rescue` scheduled function runs every twelve minutes (`*/12 * * * *`) to recover queued/stale work and perform retention cleanup, so recovery does not depend on leaving a visitor's browser open. This interval is shorter than the fifteen-minute queued-job expiry. If enquiry email is intentionally enabled, each scheduled run attempts at most one outbox notification with an eight-second Resend request timeout. Stable idempotency keys and the existing bounded retry policy remain in use; failures leave a retryable outbox record. Watch queue age, signed health failures, partial/failed reports, database connection use and Netlify credits. Netlify functions must be allowed outbound public DNS, HTTP/HTTPS and database access; optional providers use their fixed HTTPS endpoints.

The twelve-minute recovery interval allows an otherwise idle Neon database to suspend between checks. [Neon's cost guidance](https://neon.com/docs/introduction/cost-optimization) explains that scale to zero follows five minutes of inactivity and that frequent scheduled jobs can keep compute awake. Other website/database activity can still prevent suspension, so monitor the shared Neon compute allowance as well as Netlify credits. Neither the schedule nor a five-scan daily cap guarantees the whole application remains within free limits.

Web and worker each use a PostgreSQL pool of up to four connections. Size the database limit for concurrent invocations. Confirm trusted proxy IP headers and private/no-store audit responses; production ownership cookies must remain Secure and HttpOnly. Keep `AUDIT_ENABLED=false` during database maintenance or while collection should pause. Readiness checks do not fetch a target website, call Gemini or send mail.

The production diagnosis on 24 October 2026 found PostgreSQL `42P01` (missing relation) on audit submission, and the owner confirmed there was no deployed worker. The prior Free Netlify project was created with a signing secret and execution mode/URL flags staged on Netlify only. `AUDIT_ENABLED=false` keeps that unused project disabled. It has not received a production deployment and has not been deleted. Neon remains the source database for the selected Coolify migration. Next deployment access is an authenticated HTTPS Coolify dashboard or SSH connection, followed by private source/target configuration as described in [the Coolify guide](./COOLIFY_DEPLOYMENT.md).

The new worker build applies the missing audit migrations only when given the real production database. A temporary helper containing only the three approved audit migrations has been prepared and passed three mocked checks; it has not contacted production and will be excluded from the final worker artifact. The official Netlify CLI/package tooling has verified the background, scheduled and health function packaging. No production migration, server deployment, worker publication or successful live audit is claimed. The final deployed worker must contain only `audit`, `audit-health` and `audit-rescue`.

### Optional standalone worker on an existing Linux server

The deployable package is `Dockerfile.audit-worker` and `compose.audit-worker.yml`. Use a host with Docker Engine and the Compose plugin. It needs outbound public DNS, HTTP/HTTPS and access to the production PostgreSQL database; the worker exposes no public port and needs no local data volume. The website can remain on Vercel.

In a checkout on the server, create the private worker environment file:

```sh
cp .env.example .env.audit-worker
chmod 600 .env.audit-worker
```

Edit this file on the server. Set `DATABASE_URL` to the exact production database used by the website, including the provider's SSL settings. Do not use the workspace's localhost connection or create another database. Set `AUDIT_ENABLED=true` and `AUDIT_EXECUTION_MODE=standalone` on both web and worker. To enable Gemini, supply `GEMINI_API_KEY`, `AUDIT_AI_ENABLED=true`, `AUDIT_AI_MODEL=gemini-3.8-flash` and the conservative usage caps from the template. Leave `AUDIT_SEND_EMAIL=false` until notification delivery is intentionally configured. Keep matching AI flags/model in the website host for business-answer updates. Actual secrets belong in this file or the hosting secret manager, never `.env.example` or Git. This alternative assumes an already available server; no paid server is authorized or provisioned.

Start and inspect the service:

```sh
docker compose -f compose.audit-worker.yml up -d --build
docker compose -f compose.audit-worker.yml logs --tail=50 worker
docker compose -f compose.audit-worker.yml exec -T worker npm run audit:check
```

The image applies the additive audit migrations before starting the worker, so a deployment with missing audit tables fails with a sanitized migration error rather than advertising readiness. Applied migrations are skipped. Startup cleanup also finishes before a heartbeat is registered. The Docker context allowlist excludes local secrets, Git history, output and site assets. The image intentionally installs `tsx`, currently a development dependency used to run the TypeScript worker; do not change installation to `--omit=dev` without moving that dependency.

Compose restarts an exited worker, records its readiness check and gives an active scan up to eleven minutes to finish on shutdown. Docker health status alone does not restart a hung container; monitor unhealthy status and logs. The check verifies database access, required audit tables, the audit-enabled flag and at least one recent worker heartbeat in that database. It is a shared service-readiness check, not proof that every individual worker process is healthy. It does not fetch a website, invoke Gemini or send mail. `npm run audit:check -- --schema-only` verifies schema without requiring a worker. Output contains stable codes and configuration booleans, never connection strings or API keys.

After startup, run one real audit through the live website, confirm it reaches a report, download the customer PDF and check staff access. Restart the worker and confirm retained reports survive. A successful local test or container build does not verify production until this live path passes.

## API map

| Route | Purpose |
| --- | --- |
| `POST /api/audits` | Validate, apply quotas and enqueue an idempotent submission |
| `GET /api/audits/[id]` | Read the browser-owned audit and progress |
| `DELETE /api/audits/[id]` | Delete retained report data and revoke queued/running work |
| `POST /api/audits/[id]/cancel` | Cancel collection without deleting the audit entry |
| `PATCH /api/audits/[id]/assessment` | Update visitor answers using the current revision |
| `POST /api/audits/[id]/recommendations/[recommendationId]/decision` | Include, defer or reject a recommendation using the current revision |
| `POST /api/audits/[id]/report` | Validate name/email and the current revision, save download contact details, then return the private PDF |
| `POST /api/audits/[id]/enquiry` | Save a consented enquiry and selected revision snapshot |

All mutations require a same-origin request; routes with structured payloads require bounded JSON bodies. Read, export and mutation routes enforce the ownership cookie; an unguessable ID alone grants no report access. Selection and enquiry requests use revision checks; resubmission keys prevent accidental duplicate jobs and enquiries.

Audit JSON returned to customers contains only the customer response contract. Full technical exports use the separate staff-only route above.

## Privacy and retention

The `viviz_audit_session` cookie lasts up to 30 days; the database retains its hash, not the raw token. IPs are hashed for quota counting. Clearing cookies loses report access. Viewing the online report does not require registration or an email address. PDF downloads require a name and valid email, collected in a dialog before the download. The POST body also includes `revision` and `idempotencyKey`; a direct GET returns 405 and cannot bypass the form.

Download requests are stored in `website_audit_report_downloads`, separately from implementation enquiries, without sending emails or subscribing the visitor to marketing. Idempotent retries preserve one contact record. Download contact details expire with the report and are removed immediately when the audit is deleted. They are not exposed through report JSON or sent to optional analysis providers.

Audit observations, answers, selections and reports expire after 30 days. Access is denied at expiry even before cleanup. Cleanup clears their substantive data and assessment history, then removes expired/deleted queue records after their expiry plus one day. A delete action immediately clears report/evidence/answers and fences out late worker writes; its minimal quota tombstone can remain until scheduled cleanup.

Submitted enquiries retain an independent assessment snapshot and contact details for up to 24 months. Deleting a report does not delete an already submitted enquiry, sent email, downloaded PDF or independent infrastructure backup. Enquiry deletion requests follow `/privacy#website-audit`; operators must handle them in both retained database records and relevant delivery systems. Do not put confidential/customer records in optional answers.

Optional PageSpeed/CrUX receive the checked target URL. Optional Gemini receives bounded recommendation context with sensitive patterns removed, not raw pages, cookies or enquiry contacts. Resend receives enquiry details only when delivery is enabled. Keep optional services disabled until configured intentionally. Avoid URLs, contact data and provider credentials in diagnostic logs.

## Verification

```powershell
npm.cmd run test:audit
npm.cmd run lint
npm.cmd run build
npm.cmd run audit:build:netlify
```

Database integration tests are explicit opt-in and refuse non-local PostgreSQL destinations. Apply the migration first. Do not run them beside a production database or an email-delivering worker:

```powershell
$env:AUDIT_DB_TESTS = "true"
npm.cmd run test:audit
Remove-Item Env:AUDIT_DB_TESTS
```

Tests use fictional data and do not send notification emails. See the status document for actual results; these commands are operating instructions, not a claim that a check passed.

## Collection limitations and later work

This release has no JavaScript rendering, target screenshots, visual/mobile layout inspection, keyboard interaction, form submissions or authenticated transaction testing. HTML findings and optional sampled Lighthouse accessibility results do not establish WCAG compliance. A feature not observed on checked pages is not proof that the business lacks it. Unknown provider metrics are excluded from scoring, and the report explains partial coverage.

Specialist rules focus on B2B/service and local-service businesses; other types receive general checks with declared limits. Current trend/competitor assertions require a future sourced evidence feed. Feature suggestions are catalog recommendations, not installed operational modules. Tenant accounts, CMS, CRM, module activation, workflows, billing, analytics integrations and recurring monitoring belong to later GrowthOS phases. The planned 20-site pilot, manual accessibility/visual review and enabled-provider cost evaluation remain launch work.
