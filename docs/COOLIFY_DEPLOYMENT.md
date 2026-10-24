# Deploy the full Viviz site on the existing Coolify server

The selected deployment moves the website, audit worker and PostgreSQL data to the owner's existing Coolify server. It replaces the earlier worker-only Netlify proposal. Keep Vercel and Neon available until the new site, restored data and payment flow have been verified; then retire their production use. No new paid hosting service is required or provisioned by this plan.

The owner has configured dashboard DNS and HTTPS. `https://coolify.viviz.in` resolves to `187.127.178.143` with a trusted certificate; its unauthenticated `/api/health` returns 200 and authenticated Coolify API access (4.5.0) works. The token is stored only in ignored private local access configuration; no value is included here. The owner has no SSH access, so preparation uses the authenticated HTTPS API.

The **Viviz Website** project (`p7snoy3td2uupcnbzon9pm1g`) and its **production** environment (`veg72ary2usrrwv4wzudosf4`) are created. The reviewed 39-file deployment change was pushed as commit `b628f68` to `deploy/coolify-hosting`; `main` is unchanged. Coolify application **viviz-website** (`yvvtdetv81ed1rkfluljzlum`) uses that branch, Compose path `/docker-compose.coolify.yml` and predefined networking. Private deployment `de72a07hoa1550myzgv7zrei` built commit `ba80475` and finished healthy; the restored database, web process, worker and audit lifecycle passed the rehearsal checks below. Automatic and preview deployments are disabled. No public application domain or host port is configured, and the proxy's Docker `exposedByDefault=false` setting is verified. Original production credentials and the final website cutover remain pending; Vercel and Neon are still live.

## Dashboard HTTPS without SSH

The completed dashboard setup used the existing Hostinger DNS and Coolify interface:

1. In Hostinger's DNS settings for `viviz.in`, add an **A** record with name `coolify` and value `187.127.178.143`. Keep the existing website records unchanged; this prepares only `coolify.viviz.in`, not the production site cutover.
2. Once that hostname resolves to the server, use the existing Coolify interface to set **Settings > General > URL** to `https://coolify.viviz.in` and save it.
3. Open `https://coolify.viviz.in` and confirm it serves the expected dashboard with a browser-trusted certificate, valid hostname and no TLS warning. Only then use the HTTPS address for login, tokens and private deployment settings. If certificate issuance fails, resolve DNS/proxy/certificate errors first; do not bypass certificate validation or use a token over the HTTP IP address.

The owner completed the dashboard hostname change, and trusted HTTPS/API access is verified. These dashboard records are separate from the production website records; the private rehearsal below is verified and the production website cutover remains pending.

## Resources and repository configuration

Create a native Coolify PostgreSQL database as a separate persistent resource, then a Git Application using the repository's `docker-compose.coolify.yml`. Keeping PostgreSQL separate gives it its own persistent volume, lifecycle, backup/import controls and health check. Do not put its data in an application container's writable layer. [Coolify's PostgreSQL guide](https://coolify.io/docs/databases/postgresql) describes the resource and private connection URL.

The inspected Neon source runs PostgreSQL **17.11** with only `plpgsql` installed. The created native target uses **PostgreSQL 17 Alpine**, UUID `muhldiu6qypv45johlplqyb4`, and is healthy. Its named persistent volume `postgres-data-muhldiu6qypv45johlplqyb4` mounts at `/var/lib/postgresql/data`; no public database port is exposed. Use PostgreSQL 17-compatible dump/restore tools and retain private database networking.

The Git Application contains three services:

| Service | Role |
| --- | --- |
| `migrate` | One-shot `npm run db:migrate`; web/worker startup depends on success. `exclude_from_hc: true` prevents its completed state from marking the application unhealthy |
| `web` | Standalone Next.js image from `Dockerfile`, listening internally on port 3000; public/static and PDF assets are included |
| `worker` | Long-lived audit worker from `Dockerfile.audit-worker`, sharing the database; no public port |

Choose the repository/branch and a reviewed commit in Coolify. Set the build strategy to **Compose**, base directory to `/`, and Compose location to `/docker-compose.coolify.yml` relative to the repository root. Use the normal managed Compose path rather than Raw deployment. Enable **Advanced > Docker compose > Predefined network > Connect to predefined network** so the application can reach the native PostgreSQL resource on the selected destination network. Set `DATABASE_URL` to that resource's **internal** URL and verify its generated hostname resolves from the application network. [Coolify's Compose documentation](https://coolify.io/docs/applications/builds/docker-compose) explains the networking and migration-service settings.

For the final public cutover, assign only `web` the domain `https://viviz.in:3000`. The suffix routes the proxy to the internal container port; visitors use ordinary HTTPS on port 443. Include the existing `www`/redirect behavior if currently used. Do not add host `ports:` mappings for PostgreSQL, the worker or web port 3000. The verified rehearsal has no application domain and no published service ports; leave production routing and DNS unchanged during preparation.

## Private configuration

Enter secrets directly in Coolify's environment settings. Copy existing production values from the owner's settings; do not use local development credentials or print secrets in deployment logs.

The production Vercel values are sensitive/write-only, including the database, staff, email, payment and Gemini settings. They cannot be recovered through the Vercel API. Obtain the required private values from the owner's original provider/account settings; do not extract them through the running application. The owner saved the direct Neon connection privately. The labelled private `.env.coolify-migration` file still awaits the original staff/session, email, payment and optional Gemini values needed for production activation. Corresponding provider fields in Coolify are empty. The private rehearsal uses generated temporary staff credentials held only in ignored local configuration; replace these with the original production values before public activation. No secret values are documented here.

| Variable | Migration requirement |
| --- | --- |
| `DATABASE_URL` | Coolify PostgreSQL private connection; restore Neon before application bootstrap |
| `INVOICE_PASSWORD`, `INVOICE_SESSION_SECRET` | Set the production staff password. Reuse the current session secret if available; a new secure secret requires staff to sign in again |
| `NEXT_PUBLIC_BASE_URL` | `https://viviz.in`, supplied at build and runtime |
| `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` | Preserve the current verification token at build time |
| `RESEND_API_KEY` | Preserve the existing site contact-mail configuration; separate audit delivery remains opt-in |
| `SABPAISA_MERCHANT_ID`, `SABPAISA_API_KEY`, `SABPAISA_SECRET_KEY`, `SABPAISA_ENV` | Preserve actual production merchant credentials and live environment; do not accept the template's `uat` default for a live merchant |
| `AUDIT_EXECUTION_MODE` | `standalone`; the Compose file fixes this for web and worker |
| `AUDIT_ENABLED` | Keep `false` through data preparation; enable after migrations and worker readiness |
| Audit quotas | Start with `AUDIT_GLOBAL_DAILY_LIMIT=5`; adjust after measuring server/database capacity |
| Optional Gemini | Preserve the chosen free-tier key, supported model and application caps; leave disabled until deliberately configured |

The SabPaisa library accepts older names, but the Compose file uses canonical names. If Vercel currently stores `SABPAISA_CLIENT_CODE`, copy its value into `SABPAISA_MERCHANT_ID`; map `SABPAISA_AUTH_KEY` to `SABPAISA_API_KEY` and `SABPAISA_AUTH_IV` to `SABPAISA_SECRET_KEY`. Preserve the current Google Analytics configuration in the source; removing Vercel Analytics does not replace it with another service. Public build variables must be present before building the web image.

### Compose build settings

Keep database, staff and provider secrets available at runtime only (`is_runtime=true`, `is_buildtime=false`). Make the public `NEXT_PUBLIC_*` build variables available at build time and runtime. Set **Inject Build Arguments to Dockerfile** to `false` (`inject_build_args_to_dockerfile=false`) and keep environment-value log redaction enabled.

Coolify 4.5.0 parses required Compose environment references during `docker compose build`, before it writes the real runtime environment file. Set **Custom Build Command** (`docker_compose_custom_build_command`) to the following single line, which supplies harmless values for the three required references during build configuration parsing:

```sh
DATABASE_URL=postgres://build:build@invalid.invalid/build INVOICE_PASSWORD=build-only-placeholder INVOICE_SESSION_SECRET=build-only-placeholder docker compose build --pull
```

These values are placeholders, not credentials or a database used by the application. Keep the actual secrets runtime-only. Coolify adds the Compose file and build-environment file flags; after the build it writes the runtime environment and starts the services with their actual values. This configuration passed the private Docker image build and startup on the existing server.

## Rehearse the Neon restore before cutover

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

SSH is not required for the selected restore path. After creating the private target database, upload the protected dump through Coolify's authenticated database-import upload API, then start an [import](https://coolify.io/docs/api/endpoints/databases/create-database-import) using `source: "upload"` and the returned `upload_id`. Use the intended empty target, leave `replace_existing` and `keep_owners` false, inspect the generated restore command/error handling, and poll import status through completion before migrations. An HTTP 202 confirms acceptance only. This route completed the rehearsal below; the final cutover restore remains pending.

### Completed restore rehearsal

The source inventory contains twelve tables: nine in `neon_auth` (including the retained `project_config` row), plus `public.employees`, `public.invoices` and `public.payments`. It also contains three sequences. All original business records are preserved; detailed counts and hashes remain in ignored private verification files. Client transport was verified as TLS 1.3 with a trusted certificate; Neon proxy behavior means a false backend `pg_stat_ssl` value does not describe that client connection.

A consistent `pg_export_snapshot` capture produced a **31,135-byte full custom-format backup**, held only in the ignored private `.env.coolify-backups` directory. Its checksum and `pg_restore` archive listing were checked. The target was confirmed empty before import **102**, which completed with exit code 0. Read-only validation import **103** also completed with exit code 0: full row hashes for all twelve tables, all three sequence states, column definitions and constraints matched the captured source.

After application migrations and HTTP checks, read-only validation import **105** also finished with exit code 0. Every original table's data and sequence state still matched, original columns and constraints were preserved, and all seven audit tables and three migration records were verified. Detailed proofs remain in ignored private files.

This was a rehearsal snapshot while the live site continued using Neon. No source writes, production website DNS cutover or final production freeze/restore occurred. Take a new final snapshot after the planned write freeze; the rehearsed copy is not assumed to contain changes made since capture.

### Completed private application rehearsal

Deployment `de72a07hoa1550myzgv7zrei` built and started the actual Docker images on Coolify from product commit `ba80475`. The `migrate` service completed, and `web` and `worker` are healthy. `npm run audit:check` returned `ready:true`, one active worker, all seven audit tables and all three audit migrations. Local Docker is still unavailable; the image-build and runtime evidence comes from the existing Coolify server.

Private HTTP checks passed for web health, the home page, logo/signature assets, unauthorized staff rejection, staff login, original invoice/employee records and invoice/offer-letter PDFs. A real `example.com` audit also passed: submission returned 202, another browser received 404, direct GET PDF returned 405, missing download-contact details returned 400, and the customer PDF downloaded successfully after contact capture. Customer output excluded raw technical fields. Unauthorized technical access returned 401; staff login enabled the technical PDF. Both PDFs had valid PDF signatures and private access. Deleting the report returned 200 and a subsequent read returned 404.

The reusable [web smoke script](../scripts/deployment-web-smoke.mjs) and [audit smoke script](../scripts/deployment-audit-smoke.mjs) were committed in `e7ad69f`; `bb90e7f` fixes the test harness's `node:crypto` binding under indirect evaluation. These later commits contain test scripts and do not change the running product image. Tests ran inside the owned containers through disabled tasks; the audit verification task was removed after execution. AI and email delivery stayed off, and no payment or email request was made. Original provider behavior and final production configuration remain unverified.

## Final cutover

Schedule a maintenance window; this Compose deployment does not promise zero downtime or rolling replacement.

1. Freeze writes on the old system, including staff changes, audit/enquiry submissions and **new payment initiation**. Handle payment callbacks deliberately: allow agreed in-flight transactions to settle or retain/reconcile callback events using the provider's supported workflow. DNS changes alone do not freeze old instances. Do not allow two independent databases to accept production writes.
2. Take the final dump from Neon after the freeze and restore it into a fresh empty production target using the successful rehearsal procedure. Recheck counts, IDs, payment states and sequences. If restore or verification fails, stop before DNS cutover and keep the source intact.
3. Set the private Coolify environment and deploy the reviewed Compose commit. The `migrate` service must succeed before web and worker start. The worker also runs `db:migrate` on each process start; the completed one-shot service is an initial deployment gate and is not guaranteed to rerun on every ordinary Docker restart. Check migration logs and run the migration explicitly when a later schema change requires it.
4. Verify `/api/health` responds. This endpoint proves web-process liveness only: separately run `npm run audit:check` from the worker terminal and confirm the intended database schema and recent worker heartbeat. Check staff authentication, existing records, public images and invoice/offer-letter PDF output. With audits enabled, run one public-site audit and confirm customer report/PDF contact capture, staff-only technical access, cancellation/deletion and persisted data across restart. Optional Gemini/email checks require their intentionally configured settings.
5. Configure and verify the Coolify HTTPS route, then update the existing DNS records to the server. Confirm `https://viviz.in`, canonical redirects, certificate validity and Secure staff/audit cookies from outside the server. Recheck payment return/callback at `https://viviz.in/api/pay/callback` and reconcile in-flight transactions before reopening payments. Test live payment behavior only through an intentionally authorized transaction; do not silently switch credentials or initiate charges as a deployment probe.
6. Reopen production writes on the Coolify deployment after verification. Watch worker readiness, queue age, database storage/connections, backups, errors and payment status. Keep Vercel/Neon intact through the agreed rollback window; stop their production traffic only after the new system is accepted. Retirement comes after the final backup and reconciliation, not before deployment checks.

If cutover fails before writes reopen, restore routing to the preserved old site/database. If the Coolify database has already accepted new writes or callbacks, reconcile those changes before reverting; pointing DNS back alone would lose or split data. Do not delete Vercel, Neon or the unused Netlify project as an automatic deployment step.

## Current verification

Current verification passed **110 tests**, TypeScript compilation and the full Next.js production build without runtime secrets. The real Coolify Docker image build, private web/worker startup, schema/heartbeat readiness, existing business-record/PDF checks and the full customer/staff audit lifecycle also passed. The private PostgreSQL target passed the source snapshot restore and read-only comparison, including preservation after application migrations and runtime checks. Earlier Netlify packaging checks are historical verification of the unused alternative. Original staff/provider settings, live provider behavior, the final write freeze/restore, public domain assignment, production website HTTPS/DNS cutover and retirement of old hosting remain pending. The original production site/database remain live on Vercel/Neon. The owner added only the Coolify dashboard DNS record; website routing remains unchanged.
