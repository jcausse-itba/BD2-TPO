/**
 * query6.js — Pacientes con vacunas vencidas.
 */
import api from '../js/api.js';
import { renderTable, showLoading, showError, showToast, badge } from '../js/ui.js';

export default async function init(container) {
    container.innerHTML = `
        <div class="page-header">
            <h1 class="page-header__title">💉 Query 6 — Vacunas vencidas</h1>
            <p class="page-header__subtitle">Pacientes cuya próxima dosis es anterior a la fecha actual</p>
        </div>
        <div class="card">
            <div class="card__header">
                <span class="card__title">Resultados</span>
                <span class="badge badge--danger">Atención</span>
            </div>
            <div class="card__body card__body--flush" id="q6-table"></div>
        </div>`;

    const tableEl = document.getElementById('q6-table');
    showLoading(tableEl);

    try {
        const data = await api.query6();
        renderTable(tableEl, data, [
            { key: 'id_paciente', label: 'ID Paciente' },
            { key: 'nombre', label: 'Nombre' },
            { key: 'especie', label: 'Especie' },
        ]);
    } catch (err) {
        showError(tableEl, err.message);
        showToast(err.message, 'error');
    }
}
