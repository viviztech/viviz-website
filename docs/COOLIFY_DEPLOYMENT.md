# Deploy the full Viviz site on the existing Coolify server

The website, audit worker and production PostgreSQL database moved to the owner's existing Coolify server on **25 October 2026**. Trusted HTTPS and the public staff/audit/report flows passed against the new server. DNS propagation is still finishing: some cached resolvers may reach the paused Vercel address. Vercel remains paused and Neon remains read-only, preserved for recovery rather than deleted. No new paid hosting or storage service was provisioned.

The owner has configured dashboard DNS and HTTPS. `https://coolify.viviz.in` resolves to `187.127.178.143` with a trusted certificate; its unauthenticated `/api/health` returns 200 and authenticated Coolify API access (4.5.0) works. The token is stored only in ignored private local access configuration; no value is included here. The owner has no SSH access, so preparation uses the authenticated HTTPS API.

The **Viviz Website** project (`p7snoy3td2uupcnbzon9pm1g`) and **production** environment (`veg72ary2usrrwv4wzudosf4`) contain application **viviz-website** (`yvvtdetv81ed1rkfluljzlum`). It uses `deploy/coolify-hosting`, Compose path `/docker-compose.coolify.yml` and predefined networking; `main` is unchanged. Final deployment `gla3klmkmetbr48rn5zveyja` finished healthy at commit `03418d7`. Only `web` has public HTTPS routes; automatic/preview deployments and host service-port mappings remain disabled. The shared proxy's Docker `exposedByDefault=false` setting remains verified.

## Dashboard HTTPS without SSH

The completed dashboard setup used the existing Hostinger DNS and Coolify interface:

1. In Hostinger's DNS settings for `viviz.in`, add an **A** record with name `coolify` and value `187.127.178.143`. Keep the existing website records unchanged; this prepares only `coolify.viviz.in`, not the production site cutover.
2. Once that hostname resolves to the server, use the existing Coolify interface to set **Settings > General > URL** to `https://coolify.viviz.in` and save it.
3. Open `https://coolify.viviz.in` and confirm it serves the expected dashboard with a browser-trusted certificate, valid hostname and no TLS warning. Only then use the HTTPS address for login, tokens and private deployment settings. If certificate issuance fails, resolve DNS/proxy/certificate errors first; do not bypass certificate validation or use a token over the HTTP IP address.

The owner completed the dashboard hostname change, and trusted HTTPS/API access is verified. Website DNS was changed separately during the completed cutover below.

## Resources and repository configuration

Create a native Coolify PostgreSQL database as a separate persistent resource, then a Git Application using the repository's `docker-compose.coolify.yml`. Keeping PostgreSQL separate gives it its own persistent volume, lifecycle, backup/import controls and health check. Do not put its data in an application container's writable layer. [Coolify's PostgreSQL guide](https://coolify.io/docs/databases/postgresql) describes the resource and private connection URL.

The inspected Neon source runs PostgreSQL **17.11** with only `plpgsql` installed. The private rehearsal resource (`muhldiu6qypv45johlplqyb4`) is retained separately and is no longer the application's active database.

The active **viviz-postgresql-production** resource (`whogu4vmippacy6c6bpq5zvq`) uses PostgreSQL 17 Alpine and persistent storage. It was verified empty before the final restore and now contains the validated source records and audit schema. The application uses its private/internal URL. Neither database exposes a public port. Use PostgreSQL 17-compatible dump/restore tools and retain private database networking.

The Git Application contains three services:

| Service | Role |
| --- | --- |
| `migrate` | One-shot `npm run db:migrate`; web/worker startup depends on success. `exclude_from_hc: true` prevents its completed state from marking the application unhealthy |
| `web` | Standalone Next.js image from `Dockerfile`, listening internally on port 3000; public/static and PDF assets are included |
| `worker` | Long-lived audit worker from `Dockerfile.audit-worker`, sharing the database; no public port |

Choose the repository/branch and a reviewed commit in Coolify. Set the build strategy to **Compose**, base directory to `/`, and Compose location to `/docker-compose.coolify.yml` relative to the repository root. Use the normal managed Compose path rather than Raw deployment. Enable **Advanced > Docker compose > Predefined network > Connect to predefined network** so the application can reach the native PostgreSQL resource on the selected destination network. Set `DATABASE_URL` to that resource's **internal** URL and verify its generated hostname resolves from the application network. [Coolify's Compose documentation](https://coolify.io/docs/applications/builds/docker-compose) explains the networking and migration-service settings.

The applied public routing assigns only `web` the domains `https://viviz.in:3000,https://www.viviz.in:3000`, with the per-service redirect set to `non-www`. The suffix routes the proxy to internal port 3000; visitors use ordinary HTTPS on port 443. The reproducible API configuration is:

```json
{
  "docker_compose_domains": [{
    "name": "web",
    "domain": "https://viviz.in:3000,https://www.viviz.in:3000",
    "redirect": "non-www"
  }],
  "is_force_https_enabled": true,
  "is_permanent_redirect_enabled": true,
  "instant_deploy": false
}
```

Apply routing changes through `PATCH /api/v1/applications/{uuid}` and redeploy. Compose redirects belong inside the service entry. Coolify stores the portless domain names with separate port-3000 overrides. Do not add host `ports:` mappings for PostgreSQL, the worker or web port 3000. [The v4.5.0 API controller](https://raw.githubusercontent.com/coollabsio/coolify/v4.5.0/app/Http/Controllers/Api/ApplicationsController.php) defines these fields.

## Private configuration

Enter secrets directly in Coolify's environment settings. Copy existing production values from the owner's settings; do not use local development credentials or print secrets in deployment logs.

The production Vercel values are sensitive/write-only and cannot be recovered through its API. The owner has now saved the direct Neon connection, staff password/session secret, Resend key, SabPaisa credentials with `prod` environment, and Gemini key privately in `.env.coolify-migration`. These settings have been applied to Coolify and replaced the temporary staff credentials. Secret values remain runtime-only and are excluded from documentation and Git.

Resend authentication passed a read-only domains request. No email was sent, and no verified `viviz.in` sending domain was established; the existing onboarding sender is retained. Contact-email delivery remains unverified. A local synthetic SabPaisa signature was accepted and a changed signature rejected, with no provider HTTP request or charge; this does not verify live checkout or provider-side credentials.

Gemini model discovery succeeded and the runtime selects `gemini-3.5-flash-lite`, a model with a documented free tier. AI is enabled with application caps of **20 requests per day**, **2 per minute** and **5 audits per day globally**. Both private and final public audit checks returned `aiAssisted:true` after validated enrichment. An earlier public attempt used the expected rules fallback and failed the strict AI-only test; the final retry passed. AI enrichment is not guaranteed on every request: provider, quota or validation failures retain the rules report. [Google's pricing documentation](https://ai.google.dev/gemini-api/docs/pricing) describes provider tiers and limits.

| Variable | Migration requirement |
| --- | --- |
| `DATABASE_URL` | Active production PostgreSQL resource's private/internal connection; restore before application bootstrap |
| `INVOICE_PASSWORD`, `INVOICE_SESSION_SECRET` | Set the production staff password. Reuse the current session secret if available; a new secure secret requires staff to sign in again |
| `NEXT_PUBLIC_BASE_URL` | `https://viviz.in`, supplied at build and runtime |
| `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` | Preserve the current verification token at build time |
| `RESEND_API_KEY` | Preserve the existing site contact-mail configuration; separate audit delivery remains opt-in |
| `SABPAISA_MERCHANT_ID`, `SABPAISA_API_KEY`, `SABPAISA_SECRET_KEY`, `SABPAISA_ENV` | Preserve actual production merchant credentials and live environment; do not accept the template's `uat` default for a live merchant |
| `AUDIT_EXECUTION_MODE` | `standalone`; the Compose file fixes this for web and worker |
| `AUDIT_ENABLED` | Keep `false` through data preparation; enable after migrations and worker readiness |
| Audit quotas | Start with `AUDIT_GLOBAL_DAILY_LIMIT=5`; adjust after measuring server/database capacity |
| Gemini | Configured with `gemini-3.5-flash-lite`; preserve the private key and bounded application caps |

The SabPaisa library accepts older names, but the Compose file uses canonical names. If Vercel currently stores `SABPAISA_CLIENT_CODE`, copy its value into `SABPAISA_MERCHANT_ID`; map `SABPAISA_AUTH_KEY` to `SABPAISA_API_KEY` and `SABPAISA_AUTH_IV` to `SABPAISA_SECRET_KEY`. Preserve the current Google Analytics configuration in the source; removing Vercel Analytics does not replace it with another service. Public build variables must be present before building the web image.

### Compose build settings

Keep database, staff and provider secrets available at runtime only (`is_runtime=true`, `is_buildtime=false`). Make the public `NEXT_PUBLIC_*` build variables available at build time and runtime. Set **Inject Build Arguments to Dockerfile** to `false` (`inject_build_args_to_dockerfile=false`) and keep environment-value log redaction enabled.

Coolify 4.5.0 parses required Compose environment references during `docker compose build`, before it writes the real runtime environment file. Set **Custom Build Command** (`docker_compose_custom_build_command`) to the following single line, which supplies harmless values for the three required references during build configuration parsing:

```sh
DATABASE_URL=postgres://build:build@invalid.invalid/build INVOICE_PASSWORD=build-only-placeholder INVOICE_SESSION_SECRET=build-only-placeholder docker compose build --pull
```

These values are placeholders, not credentials or a database used by the application. Keep the actual secrets runtime-only. Coolify adds the Compose file and build-environment file flags; after the build it writes the runtime environment and starts the services with their actual values. This configuration passed the private Docker image build and startup on the existing server.

## Restore procedure used during migration

The following procedure records the completed rehearsal and final restore. It is a reference for future recovery, not an outstanding go-live checklist.

1. Confirm which Neon project, branch and database the live application actually uses. Obtain its **unpooled/direct** connection privately and record PostgreSQL version, extensions, database size, core table row counts, IDs and sequence values. Check invoice, employee, payment and any audit/enquiry records. Inspect the existing environment and callback URLs without exposing their secret values.
2. Take a full custom-format database backup onto storage the owner already controls. Protect it as production data and keep a second copy separate from the target database. Configure ongoing Coolify backups and retention on existing available storage; a paid storage subscription is not required by this plan. A successful dump alone is not proof of recoverability.
3. Restore into a **fresh, empty target database before `db:migrate` or application startup**. Do not bootstrap empty business tables first and treat a failed restore as an acceptable empty site. Review extension/permission differences and stop on any restore error.
4. Run the full application migration after the successful restore. It applies the core schema, two additive invoice upgrades and the three audit migrations transactionally, using a migration ledger and advisory lock. It preserves existing rows and sequences; it is not a substitute for importing Neon data.
5. Compare restored row counts, representative IDs/relations, payment states and sequence values with the source. Check a future generated ID in rehearsal so sequences cannot collide with imported rows. Verify staff login, invoice/offer-letter PDFs and the audit customer/staff separation on the new host. Keep the production site on the source while rehearsing.

Use a protected libpq service/passfile or another private credential mechanism. These examples contain no credentials and assume the two service entries are already configured on the migration host:

```sh
pg_dump --dbname=service=viviz-neon-source --format=custom --no-owner --no-acl --file=viviz-rehearsal.dump
pg_restore --dbname=service=viviz-coolify-rehearsal --no-owner --no-acl --exit-on-error --single-transaction viviz-rehearsal.dump
```

Check each command's exit status before proceeding. Restore into the intended empty database only. `--exit-on-error` and `--single-transaction` prevent a partially restored database from silently becoming the migration baseline; see the [PostgreSQL restore documentation](https://www.postgresql.org/docs/current/app-pgrestore.html). Do not use `--clean` against an existing live database to work around failed rehearsal.

SSH is not required for the selected restore path. After creating the private target database, upload the protected dump through Coolify's authenticated database-import upload API, then start an [import](https://coolify.io/docs/api/endpoints/databases/create-database-import) using `source: "upload"` and the returned `upload_id`. Use the intended empty target, leave `replace_existing` and `keep_owners` false, inspect the generated restore command/error handling, and poll import status through completion before migrations. An HTTP 202 confirms acceptance only. This route completed both the rehearsal and final restore.

### Historical restore rehearsal

The source inventory contains twelve tables: nine in `neon_auth` (including the retained `project_config` row), plus `public.employees`, `public.invoices` and `public.payments`. It also contains three sequences. All original business records are preserved; detailed counts and hashes remain in ignored private verification files. Client transport was verified as TLS 1.3 with a trusted certificate; Neon proxy behavior means a false backend `pg_stat_ssl` value does not describe that client connection.

A consistent `pg_export_snapshot` capture produced a **31,135-byte full custom-format backup**, held only in the ignored private `.env.coolify-backups` directory. Its checksum and `pg_restore` archive listing were checked. The target was confirmed empty before import **102**, which completed with exit code 0. Read-only validation import **103** also completed with exit code 0: full row hashes for all twelve tables, all three sequence states, column definitions and constraints matched the captured source.

After application migrations and HTTP checks, read-only validation import **105** also finished with exit code 0. Every original table's data and sequence state still matched, original columns and constraints were preserved, and all seven audit tables and three migration records were verified. Detailed proofs remain in ignored private files.

This earlier rehearsal ran while the live site still used Neon. Its snapshot was superseded by the final frozen-source snapshot described below.

### Historical private application rehearsal

The initial deployment `de72a07hoa1550myzgv7zrei` built commit `ba80475`. The later configuration deployment `zds2thxgapmdrky1nby4jnm9` built commit `6af2eb7` and finished healthy on **25 October 2026** with the saved staff/provider settings. The `migrate` service completed, and `web` and `worker` are healthy. `npm run audit:check` returned `ready:true`, a recent worker heartbeat, all seven audit tables and AI enabled with its key configured. All three audit migrations were verified separately. Local Docker is still unavailable; the image-build and runtime evidence comes from the existing Coolify server.

Private HTTP checks passed for web health, the home page, logo/signature assets, unauthorized staff rejection, staff login, original invoice/employee records and invoice/offer-letter PDFs. A real `example.com` audit also passed: submission returned 202, another browser received 404, direct GET PDF returned 405, missing download-contact details returned 400, and the customer PDF downloaded successfully after contact capture. Customer output excluded raw technical fields. Unauthorized technical access returned 401; staff login enabled the technical PDF. Both PDFs had valid PDF signatures and private access. Deleting the report returned 200 and a subsequent read returned 404.

The reusable [web smoke script](../scripts/deployment-web-smoke.mjs) and [audit smoke script](../scripts/deployment-audit-smoke.mjs) were committed in `e7ad69f`; `bb90e7f` fixes the test harness's `node:crypto` binding under indirect evaluation. Commit `6af2eb7` adds the opt-in real-AI assertion. Tests ran inside the owned containers through disabled tasks, which were removed afterward. The saved-configuration rehearsal passed with `aiAssisted:true`, valid private customer/staff PDFs, the contact gate and deletion. Email delivery stayed off, and no payment or email request was made. The final public checks are recorded below; live email delivery and checkout remain unverified.

## Active local database backups

The production database's local backup schedule is **active daily at 03:00 IST**, retaining the last **14 successful executions** on existing server storage with S3 disabled. The first backup finished successfully with a **47,413-byte** archive. No paid storage was added. The [v4.5.0 backup API](https://coolify.io/docs/api/endpoints/databases/create-database-backup) uses `save_s3:false`, `dump_all:false`, a string `databases_to_backup`, retention amount 14, retention days 0 and retention storage 0. Omit `disable_local_backup`, which the v4.5.0 controller does not accept.

When changing the schedule, confirm the server's effective timezone: 03:00 IST corresponds to `30 21 * * *` in UTC or `0 3 * * *` in Asia/Kolkata/Calcutta. Verify new executions by success status and positive archive size. Daily archives remain on the database server; the protected final migration archive is also retained off-host on the owner's D: drive. Automated off-host replication is not configured.

## Completed production cutover

After the owner confirmed availability for DNS changes, Vercel production was paused and Neon database/role read-only defaults were set. Direct PostgreSQL, pooled PostgreSQL and Neon HTTP transports all passed the source write-fence checks. Original business records were not modified. The final consistent **31,424-byte** backup is retained privately off-host.

The fresh production database was restored through import **108**. Validation **109** matched every original table's contents, all three sequence states and the original schema. After migration and application startup, validation **110** again confirmed all twelve original tables and three sequences, plus the seven audit tables and three migration records. The application now uses `whogu4vmippacy6c6bpq5zvq`; the rehearsal database is retained privately.

The owner copied and removed the existing Hostinger **ALIAS `@`** record, then added **A `@` → `187.127.178.143`, TTL 300**. The existing `www` CNAME to the apex and mail records were unchanged. Some resolvers still cached `216.198.79.1` while others returned the new address; propagation remains in progress.

Traefik initially served its default self-signed certificate while DNS still pointed to the old host. An application-only route refresh after the DNS change obtained trusted certificates for both apex and `www`; the shared proxy was not restarted. Public checks used the new address with strict certificate and hostname validation.

The public callback check exposed an internal-origin redirect. Commit **`03418d7`** fixes callback redirects to use canonical `BASE_URL`; focused GET/POST callback tests and lint passed. Final deployment **`gla3klmkmetbr48rn5zveyja`** is healthy. Public verification passed:

- HTTPS apex returned 200; `www` redirected permanently to the apex.
- Ordinary, unpinned public health/home requests also returned 200 with trusted HTTPS, the correct canonical URL and no indexing-blocking header/meta directive.
- The unsigned payment callback returned 303 to `https://viviz.in/pay/result?error=missing_response`.
- Staff login, existing invoice PDF and employee offer-letter PDF returned 200.
- A real audit returned 202, progressed to a report with `aiAssisted:true`, and denied another browser with 404.
- Missing PDF contact details returned 400; valid name/email produced the customer PDF. Technical access returned 401 anonymously and produced the PDF for staff.
- The fictional test audit was deleted successfully and subsequent access returned 404.

The complete proof is stored privately in `.env.coolify-backups/public-cutover-verified.json`. No email or live payment charge was initiated during verification.

### Recovery limits and retained sources

Vercel is paused and Neon remains read-only; neither source nor the rehearsal resource was deleted. An earlier freeze reset restored catalog defaults but PgBouncer retained read-only startup state, so a complete rollback was **not** proved. The reviewed forward resume recognized the owned pooler session, preserved original journal values and passed fresh checks across all three transports.

Do not treat catalog resets or DNS changes alone as a recovery procedure. Before reactivating the source, verify fresh direct, pooled and HTTP behavior. If the new production database has accepted writes or callbacks, reconcile them before reversing traffic. The local unfreeze/restore helper requires `--reconciliation-confirmed` after public verification; its guard passed without network access. Keep the private source-state journals and backups; no old-resource deletion is required now.

## Current verification

The historical baseline passed **110 tests**, TypeScript compilation and a production build without runtime secrets. The callback fix passed its focused GET/POST tests and lint. The final Coolify image build, active production database integrity checks, worker readiness, trusted public HTTPS, staff/PDF access and real Gemini-assisted audit lifecycle passed. Daily local backups are active and the first archive succeeded. Remaining follow-up is DNS propagation, operational monitoring, live email-delivery verification and any deliberately authorized live checkout test. Broader model-quality/pilot work is outside this migration verification. Old Vercel/Neon resources remain preserved and fenced; rollback is subject to the recovery limits above.
