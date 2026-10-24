# Website Audit: setup and operations

The first delivery adds the free Website Audit and Adaptive Growth Planner to the existing Viviz Next.js site. Read [IMPLEMENTATION_STATUS.md](./IMPLEMENTATION_STATUS.md) for verification and launch status, and [the product plan](./website-audit-product-plan.md) for the broader intent.

## Start locally

Use a supported Node.js installation with npm and an accessible PostgreSQL database. This workspace already has a local database configuration; do not overwrite it with sample credentials. `.env.example` documents variable names without secrets.

From the repository root in PowerShell:

```powershell
npm.cmd ci
npm.cmd run audit:migrate
```

The additive migration creates only the `website_audit*` tables and indexes. It has been applied to the configured local development database. It does not migrate or replace existing invoice, employee or payment data. Apply it to each deployment database before enabling the feature.

Keep the worker running in one terminal:

```powershell
npm.cmd run audit:worker
```

Start the site in another terminal:

```powershell
npm.cmd run dev
```

Open `/website-audit`. `/website-audit/example` is an explicitly labelled fictional report, available without a scan. Actual scans accept public website addresses only; localhost/private-address bypasses are deliberately unavailable.

New audit submissions return HTTP 503 when no worker has sent a heartbeat in the last 90 seconds or `AUDIT_ENABLED=false`. Starting only the web server is insufficient. A report link also requires the cookie of the browser that created the report.

## Implemented architecture

- Next.js Node.js API routes validate requests, enforce browser ownership and enqueue durable PostgreSQL jobs.
- A separate `scripts/audit-worker.ts` process claims jobs using transactions, row locks, expiring leases and fencing tokens. A web request never owns the lifetime of a scan.
- The native HTTP/HTTPS collector resolves and validates public addresses, pins the connection to an approved address, checks every redirect, follows robots policy, and extracts bounded HTML facts with Cheerio.
- Discovery stays on the approved origin and combines permitted sitemaps, links and prioritized public information pages. Account, administration, action, download and transaction routes are excluded.
- Deterministic analysis combines those observations with optional visitor answers. The versioned capability catalog supplies prerequisites, alternatives, operating needs, effort, verification and roadmap sequencing.
- PostgreSQL stores observations, reports, assessment revisions, decisions and enquiry snapshots. Reports and PDFs are generated from that evidence; target scripts and HTML are never executed inside the app.
- Enquiries save transactionally before notification. The worker drains the outbox, using stable Resend idempotency keys and bounded retries.

The runtime does not use Firecrawl or Inngest. These were planning candidates. The shipped collection path is DNS-pinned HTML collection plus a PostgreSQL queue and an independently hosted Node worker.

## Runtime limits

| Control | Default behavior |
| --- | --- |
| Coverage | Up to 25 public HTML page observations; coverage and limitations are shown |
| Discovery and collection | At most 500 discovered URLs, 80 requests and 20 MiB across collection |
| Time | HTML crawl budget 330 seconds; job lease renewal stops after ten minutes |
| Liveness | Worker heartbeat and job lease renewal every 15 seconds; 90-second lease |
| Recovery | At most two job claims; stale work is recovered or finalized by cleanup |
| Concurrency | Two jobs globally; each worker process currently executes one job at a time |
| Rolling 24-hour submissions | Three per browser, twelve per hashed IP and one hundred globally |
| Assessment revisions | Six saved assessments per audit by default |
| Conflicts | One active audit per browser and target origin; stale revisions return HTTP 409 |

The documented quota and concurrency environment variables in `.env.example` are bounded overrides, not unlimited settings. Scale workers only with a deliberate cost and database-connection budget. Two independent workers are needed to use the default concurrency of two fully.

## Optional services

The core collector, rule engine, report, PDF and saved enquiry work without a new paid provider account. No new paid accounts have been configured by this implementation.

| Feature | Required configuration | Behavior without it |
| --- | --- | --- |
| Google PageSpeed Insights | `AUDIT_PAGESPEED_ENABLED=true` and `PAGESPEED_API_KEY` | Lab results are marked unavailable; no score is invented |
| Direct CrUX field data | `AUDIT_CRUX_ENABLED=true` and `CRUX_API_KEY` | Real-user data is marked unavailable, not failed |
| Gemini language editing | `AUDIT_AI_ENABLED=true`, `GEMINI_API_KEY`, explicit `AUDIT_AI_MODEL` | Deterministic recommendation wording remains intact |
| Resend notifications | `AUDIT_SEND_EMAIL=true`, `RESEND_API_KEY`, verified `AUDIT_FROM_EMAIL`, intended `AUDIT_TO_EMAIL` | Enquiries remain saved with notification pending |

PageSpeed measures at most four declared page/device samples: a primary page on mobile and desktop and up to two additional pages on mobile. Its external browser and resource requests are operated by Google, separately from the collector. CrUX tries mobile URL data and then origin data; many sites lack sufficient public data. Lab TBT is not INP.

Gemini can edit only bounded action and verification wording for existing rule-selected recommendations. Strict validation rejects unsupported output and preserves the original. It cannot select modules, change evidence or scores, assert trends, or activate software. There is no default model. Do not enable a provider without confirming its own availability, account quota, data terms and spending controls.

## Deployment

1. Deploy the existing Next.js site using its normal build/start process.
2. Provision persistent PostgreSQL reachable from both web and worker and apply `audit:migrate` once.
3. Deploy a long-running Node worker with the same database and audit settings. `Dockerfile.audit-worker` supplies a container entry point; inject credentials through deployment secrets.
4. Permit public DNS and outbound public HTTP/HTTPS from the worker; the web process also performs DNS validation. Optional providers need outbound HTTPS to their fixed service endpoints.
5. Keep worker timeouts above the job budget, enable process restart, and allow graceful SIGTERM/SIGINT shutdown. A short-lived serverless invocation is not a replacement for the worker.
6. Ensure the hosting proxy sets trusted `x-forwarded-for` headers. IP limits use that value; strip client-supplied forwarding headers before requests reach the application.
7. Monitor worker heartbeat age, queue age, failed/partial audits, provider availability and notification status. Keep cleanup running: the worker runs it at startup and approximately once per minute.
8. Confirm private responses remain uncached and HTTPS is enabled. Audit APIs/PDFs use private, no-store and noindex headers; the production ownership cookie is Secure and HttpOnly.

Web and worker each use a PostgreSQL pool of up to four connections. Size connection limits for the number of processes. Keep `AUDIT_ENABLED=false` during database maintenance or if collection should pause. No production deployment is implied by local implementation.

## API map

| Route | Purpose |
| --- | --- |
| `POST /api/audits` | Validate, apply quotas and enqueue an idempotent submission |
| `GET /api/audits/[id]` | Read the browser-owned audit and progress |
| `DELETE /api/audits/[id]` | Delete retained report data and revoke queued/running work |
| `POST /api/audits/[id]/cancel` | Cancel collection without deleting the audit entry |
| `PATCH /api/audits/[id]/assessment` | Update visitor answers using the current revision |
| `POST /api/audits/[id]/recommendations/[recommendationId]/decision` | Include, defer or reject a recommendation using the current revision |
| `GET /api/audits/[id]/report` | Download the private PDF |
| `POST /api/audits/[id]/enquiry` | Save a consented enquiry and selected revision snapshot |

All mutations require a same-origin request; routes with structured payloads require bounded JSON bodies. Read, export and mutation routes enforce the ownership cookie; an unguessable ID alone grants no report access. Selection and enquiry requests use revision checks; resubmission keys prevent accidental duplicate jobs and enquiries.

## Privacy and retention

The `viviz_audit_session` cookie lasts up to 30 days; the database retains its hash, not the raw token. IPs are hashed for quota counting. Clearing cookies loses report access. There is no registration or compulsory email gate. Only a consented implementation enquiry adds contact details.

Audit observations, answers, selections and reports expire after 30 days. Access is denied at expiry even before cleanup. Cleanup clears their substantive data and assessment history, then removes expired/deleted queue records after their expiry plus one day. A delete action immediately clears report/evidence/answers and fences out late worker writes; its minimal quota tombstone can remain until scheduled cleanup.

Submitted enquiries retain an independent assessment snapshot and contact details for up to 24 months. Deleting a report does not delete an already submitted enquiry, sent email, downloaded PDF or independent infrastructure backup. Enquiry deletion requests follow `/privacy#website-audit`; operators must handle them in both retained database records and relevant delivery systems. Do not put confidential/customer records in optional answers.

Optional PageSpeed/CrUX receive the checked target URL. Optional Gemini receives bounded recommendation context with sensitive patterns removed, not raw pages, cookies or enquiry contacts. Resend receives enquiry details only when delivery is enabled. Keep optional services disabled until configured intentionally. Avoid URLs, contact data and provider credentials in diagnostic logs.

## Verification

```powershell
npm.cmd run test:audit
npm.cmd run lint
npm.cmd run build
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
