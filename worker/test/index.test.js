// Lancer : node --test worker/test/
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import worker from "../src/index.js";

test("redirige l'apex vers www en 301", async () => {
  const reponse = await worker.fetch(new Request("https://sobima.fr/approche?x=1"), {});
  assert.equal(reponse.status, 301);
  assert.equal(reponse.headers.get("location"), "https://www.sobima.fr/approche?x=1");
  assert.match(reponse.headers.get("strict-transport-security"), /max-age=31536000/);
});

test("sert les assets sur www", async () => {
  let appelee = false;
  const env = {
    ASSETS: {
      fetch: () => {
        appelee = true;
        return new Response("ok");
      },
    },
  };
  const reponse = await worker.fetch(new Request("https://www.sobima.fr/approche"), env);
  assert.equal(reponse.status, 200);
  assert.equal(await reponse.text(), "ok");
  assert.equal(appelee, true);
});

test("sert /.well-known/security.txt", async () => {
  const reponse = await worker.fetch(new Request("https://www.sobima.fr/.well-known/security.txt"), {});
  const texte = await reponse.text();
  assert.equal(reponse.status, 200);
  assert.equal(reponse.headers.get("content-type"), "text/plain; charset=utf-8");
  assert.match(reponse.headers.get("strict-transport-security"), /max-age=31536000/);
  assert.match(texte, /^Contact: mailto:contact@sobima\.fr$/m);
  assert.match(texte, /^Expires: \d{4}-\d{2}-\d{2}T/m);
  assert.ok(new Date(texte.match(/^Expires: (.+)$/m)[1]) > new Date());
});

test("_headers des pages statiques porte HSTS", () => {
  const entetes = readFileSync(new URL("../../site-v4/_headers", import.meta.url), "utf8");
  assert.match(entetes, /^\s*Strict-Transport-Security: max-age=31536000/m);
});
