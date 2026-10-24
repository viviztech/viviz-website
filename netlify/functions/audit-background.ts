import { verifyAuditInvocation } from "../../lib/website-audit/execution";
import { expireAuditData, hasDispatchableAudit } from "../../lib/website-audit/repository";
import { runAuditWorkerOnce } from "../../lib/website-audit/worker";

interface BackgroundDependencies {
  verify: (request: Request) => Promise<{ auditId: string } | null>;
  cleanup: () => Promise<void>;
  runJob: (auditId: string) => Promise<boolean>;
  isPending: (auditId: string) => Promise<boolean>;
}

export function createAuditBackgroundHandler(dependencies: BackgroundDependencies) {
  return async (request: Request): Promise<void> => {
    // Background requests receive 202 before this handler runs. Invalid signatures
    // must stop here, before touching the database or starting a crawl.
    const invocation = await dependencies.verify(request);
    if (!invocation) return;
    let retry = false;
    try {
      await dependencies.cleanup();
      const worked = await dependencies.runJob(invocation.auditId);
      retry = !worked && await dependencies.isPending(invocation.auditId);
    } catch {
      // Provider logs must not receive raw database errors or connection details.
      throw new Error("audit_worker_unavailable");
    }
    if (retry) {
      // Netlify retries a thrown error; the DB lease prevents duplicate scans.
      throw new Error("audit_worker_busy");
    }
  };
}

export default createAuditBackgroundHandler({
  verify: verifyAuditInvocation,
  cleanup: expireAuditData,
  runJob: runAuditWorkerOnce,
  isPending: hasDispatchableAudit,
});

export const config = { background: true, method: "POST" } as const;
