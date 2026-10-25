import assert from "node:assert/strict";
import test from "node:test";
import { NextRequest } from "next/server";

test("payment callbacks use the configured public origin behind a reverse proxy", async (t) => {
  const previousBaseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  t.after(() => {
    if (previousBaseUrl === undefined) delete process.env.NEXT_PUBLIC_BASE_URL;
    else process.env.NEXT_PUBLIC_BASE_URL = previousBaseUrl;
  });
  process.env.NEXT_PUBLIC_BASE_URL = "https://viviz.example";
  const { GET, POST } = await import("../app/api/pay/callback/route");

  for (const method of ["GET", "POST"] as const) {
    const request = new NextRequest("http://0.0.0.0:3000/api/pay/callback", {
      method,
      headers: {
        host: "0.0.0.0:3000",
        "x-forwarded-host": "untrusted.example",
        "x-forwarded-proto": "https",
        ...(method === "POST" ? { "content-type": "application/json" } : {}),
      },
      ...(method === "POST" ? { body: "{}" } : {}),
    });
    const response = await (method === "GET" ? GET(request) : POST(request));

    assert.equal(response.status, 303);
    assert.equal(
      response.headers.get("location"),
      "https://viviz.example/pay/result?error=missing_response",
    );
  }
});
