/**
 * query9.js — Consultas de tipo "Control" con costo menor a $5.000.
 */
import api from '../js/api.js';
import { renderTable, showLoading, showError, showToast, badge, formatCurrency } from '../js/ui.js';

export default async function init(container) {
    container.innerHTML = `
        <div class="page-header">
            <h1 class="page-header__title">💲 Query 9 — Controles &lt; $5.000</h1>
            <p class="page-header__subtitle">Consultas de tipo "Control" con costo menor a $5.000</p>
        </div>
        <div class="card">
            <div class="card__header">
                <span class="card__title">Resultados</span>
                <span class="badge badge--primary">MongoDB</span>
            </div>
            <div class="card__body card__body--flush" id="q9-table"></div>
        </div>`;

    const tableEl = document.getElementById('q9-table');
    showLoading(tableEl);

    try {
        const data = await api.query9();
        renderTable(tableEl, data, [
            { key: 'id_consulta', label: 'ID Consulta'},
            { key: 'id_paciente', label: 'ID Paciente'},
            { key: 'id_vet', label: 'ID Veterinario'},
            { key: 'fecha', label: 'Fecha' },
            { key: 'motivo', label: 'Motivo' },
            { key: 'diagnostico', label: 'Diagnóstico' },
            { key: 'costo', label: 'Costo', render: v => formatCurrency(v) },
            {
                key: 'estado', label: 'Estado',
                render: v => {
                    const variant =
                        v === 'Finalizada' ? 'success' :
                        v === 'Seguimiento' ? 'warning' : 'neutral';
                    return badge(v, variant);
                },
            },
        ]);
    } catch (err) {
        showError(tableEl, err.message);
        showToast(err.message, 'error');
    }
}
