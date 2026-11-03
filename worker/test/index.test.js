// Lancer : node --test worker/test/
import { test } from "node:test";
import assert from "node:assert/strict";
import worker from "../src/index.js";

test("redirige l'apex vers www en 301", async () => {
  const reponse = await worker.fetch(new Request("https://sobima.fr/approche?x=1"), {});
  assert.equal(reponse.status, 301);
  assert.equal(reponse.headers.get("location"), "https://www.sobima.fr/approche?x=1");
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
