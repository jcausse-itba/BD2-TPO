/**
 * query5.js — Veterinarios activos y consultas en últimos 60 días.
 */
import api from '../js/api.js';
import { renderTable, showLoading, showError, showToast, badge } from '../js/ui.js';

export default async function init(container) {
    container.innerHTML = `
        <div class="page-header">
            <h1 class="page-header__title">🩺 Query 5 — Veterinarios últimos 60 días</h1>
            <p class="page-header__subtitle">Veterinarios activos y cantidad de consultas realizadas en los últimos 60 días</p>
        </div>
        <div class="card">
            <div class="card__header">
                <span class="card__title">Resultados</span>
                <span class="badge badge--primary">MongoDB</span>
            </div>
            <div class="card__body card__body--flush" id="q5-table"></div>
        </div>`;

    const tableEl = document.getElementById('q5-table');
    showLoading(tableEl);

    try {
        const data = await api.query5();
        renderTable(tableEl, data, true, [
            { key: 'veterinario.id_vet', label: 'ID Veterinario' },
            { key: 'veterinario.nombre', label: 'Nombre' },
            { key: 'veterinario.especialidad', label: 'Especialidad' },
            { key: 'veterinario.sucursal', label: 'Sucursal' },
            { key: 'veterinario.activo', label: 'Activo', render: v => badge(v, v === 'True' ? 'success' : 'danger') },
            { key: 'total', label: 'Consultas (60 días)' },
        ]);
    } catch (err) {
        showError(tableEl, err.message);
        showToast(err.message, 'error');
    }
}
