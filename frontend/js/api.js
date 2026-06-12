/**
 * api.js — Thin HTTP client for the veterinary clinic API.
 *
 * Provides a single `api` object with typed methods for every endpoint.
 * All methods return Promises; network / HTTP errors are normalised.
 */

const API_BASE = '/api';

/**
 * Internal fetch wrapper.
 * @param {string} path  — e.g. '/query1'
 * @param {RequestInit} options
 * @returns {Promise<any>}
 */
async function request(path, options = {}) {
    const url = `${API_BASE}${path}`;
    const config = {
        headers: { 'Content-Type': 'application/json' },
        ...options,
    };

    const res = await fetch(url, config);

    // Try to parse JSON regardless of status so we can surface server messages
    let body;
    const ct = res.headers.get('content-type') ?? '';
    if (ct.includes('application/json')) {
        body = await res.json();
    } else {
        body = await res.text();
    }

    if (!res.ok) {
        const message =
            (typeof body === 'object' && (body.error || body.message)) ||
            (typeof body === 'string' && body) ||
            `HTTP ${res.status}`;
        throw new Error(message);
    }

    return body;
}

const api = Object.freeze({
    /* ── Read-only queries (GET) ─────────────────── */
    query1:  ()              => request('/query1'),
    query2:  ()              => request('/query2'),
    query3:  ()              => request('/query3'),
    query4:  ()              => request('/query4'),
    query5:  ()              => request('/query5'),
    query6:  ()              => request('/query6'),
    query7:  ()              => request('/query7'),
    query8:  ()              => request('/query8'),
    query9:  ()              => request('/query9'),
    query10: (sucursal)      => request(`/query10?sucursal=${encodeURIComponent(sucursal)}`),
    query11: ()              => request('/query11'),
    query12: ()              => request('/query12'),

    /* ── Query 13 — ABM Propietarios ─────────────── */
    createPropietario: (data) =>
        request('/query13', { method: 'POST', body: JSON.stringify(data) }),

    updatePropietario: (data) =>
        request('/query13', { method: 'PUT', body: JSON.stringify(data) }),

    deletePropietario: (id_propietario) =>
        request('/query13', {
            method: 'DELETE',
            body: JSON.stringify({ id_propietario }),
        }),

    /* ── Query 14 — Nueva consulta médica ────────── */
    createConsulta: (data) =>
        request('/query14', { method: 'POST', body: JSON.stringify(data) }),

    /* ── Query 15 — Actualización masiva de stock ── */
    decrementStock: (productos) =>
        request('/query15', {
            method: 'PUT',
            body: JSON.stringify({ productos }),
        }),
});

export default api;
