/**
 * query12.js — Propietarios sin consultas en el último año.
 */
import api from '../js/api.js';
import { renderTable, showLoading, showError, showToast } from '../js/ui.js';

export default async function init(container) {
    container.innerHTML = `
        <div class="page-header">
            <h1 class="page-header__title">🚫 Query 12 — Propietarios sin consultas</h1>
            <p class="page-header__subtitle">Propietarios activos sin consultas registradas en el último año</p>
        </div>
        <div class="card">
            <div class="card__header">
                <span class="card__title">Resultados</span>
                <span class="badge badge--primary">MongoDB</span>
            </div>
            <div class="card__body card__body--flush" id="q12-table"></div>
        </div>`;

    const tableEl = document.getElementById('q12-table');
    showLoading(tableEl);

    try {
        const data = await api.query12();
        renderTable(tableEl, data, true, [
            { key: 'id_propietario', label: 'ID' },
            { key: 'nombre', label: 'Nombre' },
            { key: 'apellido', label: 'Apellido' },
        ]);
    } catch (err) {
        showError(tableEl, err.message);
        showToast(err.message, 'error');
    }
}

