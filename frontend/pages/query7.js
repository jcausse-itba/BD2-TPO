/**
 * query7.js — Top 5 diagnósticos más frecuentes.
 */
import api from '../js/api.js';
import { renderTable, showLoading, showError, showToast } from '../js/ui.js';

export default async function init(container) {
    container.innerHTML = `
        <div class="page-header">
            <h1 class="page-header__title">📊 Query 7 — Top 5 diagnósticos</h1>
            <p class="page-header__subtitle">Los cinco diagnósticos más frecuentes en las consultas registradas</p>
        </div>
        <div class="card">
            <div class="card__header">
                <span class="card__title">Ranking</span>
                <span class="badge badge--primary">MongoDB</span>
            </div>
            <div class="card__body card__body--flush" id="q7-table"></div>
        </div>`;

    const tableEl = document.getElementById('q7-table');
    showLoading(tableEl);

    try {
        const data = await api.query7();
        renderTable(tableEl, data, [
            { key: 'diagnostico', label: 'Diagnóstico' },
            { key: 'cantidad', label: 'Cantidad' },
        ]);
    } catch (err) {
        showError(tableEl, err.message);
        showToast(err.message, 'error');
    }
}
