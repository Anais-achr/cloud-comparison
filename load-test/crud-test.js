import http from 'k6/http';
import { check } from 'k6';

// Script de charge UNIQUE, rejoue a l'identique sur les 3 deploiements.
// Il effectue des operations CRUD aleatoires (create / read / update / delete
// qui apparaissent au hasard) pour imiter un usage reel.
//
// Lancement :
//   k6 run -e BASE_URL=http://IP_OU_DOMAINE -e VUS=10 load-test/crud-test.js
//   k6 run -e BASE_URL=... -e VUS=10 --summary-export=metrics/results.json load-test/crud-test.js
//
// Metriques recuperees automatiquement par k6 :
//   - http_req_duration ....... temps de reponse (avg, med, p90, p95, max)
//   - http_reqs ............... debit (requetes / seconde)
//   - http_req_failed ......... taux d'erreurs sous charge

const BASE = __ENV.BASE_URL || 'http://localhost:3000';
const VUS = Number(__ENV.VUS || 10);
const jsonHeaders = { 'Content-Type': 'application/json' };

// Le tag "name" regroupe les URLs dynamiques (/tasks/:id) sous UNE seule metrique
// au lieu d'en creer une par id. Sans ca, k6 genere des dizaines de milliers de
// series temporelles (1 par id) -> forte conso memoire et agregation faussee.
const tag = (name, extra) => Object.assign({ tags: { name } }, extra || {});

// Variable au niveau module = etat propre a chaque VU dans k6.
// Chaque utilisateur virtuel garde la liste des ids qu'il a crees.
let knownIds = [];

export const options = {
  scenarios: {
    crud: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '20s', target: VUS }, // montee en charge
        { duration: '40s', target: VUS }, // palier (mesure principale)
        { duration: '10s', target: 0 },   // descente
      ],
    },
  },
  thresholds: {
    http_req_failed: ['rate<0.05'],
    http_req_duration: ['p(95)<1500'],
  },
};

function randInt(n) {
  return Math.floor(Math.random() * n);
}

function pickKnownId() {
  if (knownIds.length === 0) return null;
  return knownIds[randInt(knownIds.length)];
}

export default function () {
  const action = Math.random();

  if (action < 0.30 || knownIds.length === 0) {
    // CREATE (~30%, force si on n'a encore rien cree)
    const payload = JSON.stringify({ title: `task-${Date.now()}-${randInt(1000000)}` });
    const res = http.post(`${BASE}/tasks`, payload, tag('POST /tasks', { headers: jsonHeaders }));
    check(res, { 'create -> 201': (r) => r.status === 201 });
    if (res.status === 201) {
      const body = res.json();
      if (body && body.id) knownIds.push(body.id);
    }
  } else if (action < 0.65) {
    // READ (~35%) : moitie liste, moitie lecture par id
    if (Math.random() < 0.5) {
      const res = http.get(`${BASE}/tasks`, tag('GET /tasks'));
      check(res, { 'list -> 200': (r) => r.status === 200 });
    } else {
      const id = pickKnownId();
      const res = http.get(`${BASE}/tasks/${id}`, tag('GET /tasks/:id'));
      check(res, { 'read -> 200/404': (r) => r.status === 200 || r.status === 404 });
    }
  } else if (action < 0.85) {
    // UPDATE (~20%)
    const id = pickKnownId();
    const res = http.put(`${BASE}/tasks/${id}`, JSON.stringify({ done: true }), tag('PUT /tasks/:id', { headers: jsonHeaders }));
    check(res, { 'update -> 200/404': (r) => r.status === 200 || r.status === 404 });
  } else {
    // DELETE (~15%)
    const id = pickKnownId();
    const res = http.del(`${BASE}/tasks/${id}`, null, tag('DELETE /tasks/:id', { headers: jsonHeaders }));
    check(res, { 'delete -> 204/404': (r) => r.status === 204 || r.status === 404 });
    if (res.status === 204) {
      knownIds = knownIds.filter((x) => x !== id);
    }
  }
}
