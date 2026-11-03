// Lancer : node --test worker/test/
import { test } from "node:test";
import assert from "node:assert/strict";
import { traiterEvenement } from "../src/evenements.js";

const requete = (corps, entetes = {}) =>
  new Request("https://www.sobima.fr/api/evenement", {
    method: "POST",
    headers: { "Content-Type": "application/json", Origin: "https://www.sobima.fr", ...entetes },
    body: typeof corps === "string" ? corps : JSON.stringify(corps),
  });

const env = () => {
  const points = [];
  return { points, EVENEMENTS: { writeDataPoint: (point) => points.push(point) } };
};

test("enregistre un événement autorisé sans query string", async () => {
  const e = env();
  const r = await traiterEvenement(requete({ evenement: "devis_envoye", page: "/devis-contact?utm=test" }), e);
  assert.equal(r.status, 204);
  assert.deepEqual(e.points, [{ indexes: ["devis_envoye"], blobs: ["devis_envoye", "/devis-contact"] }]);
});

test("refuse un événement inconnu", async () => {
  const e = env();
  const r = await traiterEvenement(requete({ evenement: "achat", page: "/" }), e);
  assert.equal(r.status, 422);
  assert.equal(e.points.length, 0);
});

test("refuse une origine tierce", async () => {
  const e = env();
  const r = await traiterEvenement(requete({ evenement: "clic_telephone", page: "/" }, { Origin: "https://exemple.fr" }), e);
  assert.equal(r.status, 403);
});

test("refuse un corps non JSON", async () => {
  const e = env();
  const r = await traiterEvenement(requete("pas du json", { "Content-Type": "text/plain" }), e);
  assert.equal(r.status, 415);
});

test("refuse au-delà de la limite de débit", async () => {
  const e = env();
  e.LIMITE_EVENEMENT = { limit: async () => ({ success: false }) };
  const r = await traiterEvenement(requete({ evenement: "clic_email", page: "/" }), e);
  assert.equal(r.status, 429);
  assert.equal(e.points.length, 0);
});
