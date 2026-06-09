/**
 * query11.js — Ingresos totales por veterinario en el mes actual (vista materializada).
 */
import api from '../js/api.js';
import { renderTable, showLoading, showError, showToast, formatCurrency } from '../js/ui.js';

export default async function init(container) {
    container.innerHTML = `
        <div class="page-header">
            <h1 class="page-header__title">💰 Query 11 — Ingresos por veterinario</h1>
            <p class="page-header__subtitle">Vista agregada: ingresos totales por veterinario en el mes actual</p>
        </div>
        <div class="card">
            <div class="card__header">
                <span class="card__title">Resultados</span>
                <span class="badge badge--primary">MongoDB (vista)</span>
            </div>
            <div class="card__body card__body--flush" id="q11-table"></div>
        </div>`;

    const tableEl = document.getElementById('q11-table');
    showLoading(tableEl);

    try {
        const data = await api.query11();
        renderTable(tableEl, data, [
            { key: '_id', label: 'Veterinario (ID)' },
            { key: 'total_ingresos', label: 'Total ingresos', render: v => v != null ? formatCurrency(v) : '—' },
            { key: 'cantidad_consultas', label: 'Consultas' },
        ]);
    } catch (err) {
        showError(tableEl, err.message);
        showToast(err.message, 'error');
    }
}
