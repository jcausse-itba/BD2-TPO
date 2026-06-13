/**
 * query4.js — Propietarios con más de un paciente.
 */
import api from '../js/api.js';
import { renderTable, showLoading, showError, showToast } from '../js/ui.js';

export default async function init(container) {
    container.innerHTML = `
        <div class="page-header">
            <h1 class="page-header__title">👥 Query 4 — Propietarios con +1 paciente</h1>
            <p class="page-header__subtitle">Propietarios activos que tienen más de un paciente registrado</p>
        </div>
        <div class="card">
            <div class="card__header">
                <span class="card__title">Resultados</span>
                <span class="badge badge--primary">MongoDB</span>
            </div>
            <div class="card__body card__body--flush" id="q4-table"></div>
        </div>`;

    const tableEl = document.getElementById('q4-table');
    showLoading(tableEl);

    try {
        const data = await api.query4();
        renderTable(tableEl, data, true, [
            { key: 'nombre', label: 'Nombre' },
            { key: 'apellido', label: 'Apellido' },
        ]);
    } catch (err) {
        showError(tableEl, err.message);
        showToast(err.message, 'error');
    }
}

