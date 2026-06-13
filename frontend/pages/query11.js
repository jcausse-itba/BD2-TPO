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
        renderTable(tableEl, data, true, [
            { key: 'id_vet', label: 'ID de Veterinario' },
            { key: 'nombre', label: 'Nombre' },
            { key: 'apellido', label: 'Apellido' },
            { key: 'sucursal', label: 'Sucursal' },
            { key: 'cantidad_consultas', label: 'Cantidad de consultas' },
            { key: 'ingresos_totales', label: 'Total de Ingresos', render: v => v != null ? formatCurrency(v) : '—' }
        ]);
    } catch (err) {
        showError(tableEl, err.message);
        showToast(err.message, 'error');
    }
}

