/**
 * query3.js — Historial completo de un paciente (consultas + vacunaciones).
 */
import api from '../js/api.js';
import { renderTable, showLoading, showError, showToast, badge, escapeHTML } from '../js/ui.js';

export default async function init(container) {
    container.innerHTML = `
        <div class="page-header">
            <h1 class="page-header__title">📜 Query 3 — Historial de paciente</h1>
            <p class="page-header__subtitle">Consultas y vacunaciones del paciente P001, ordenadas por fecha</p>
        </div>
        <div class="card">
            <div class="card__header">
                <span class="card__title">Historial — P001</span>
                <span class="badge badge--primary">MongoDB</span>
            </div>
            <div class="card__body card__body--flush" id="q3-table"></div>
        </div>`;

    const tableEl = document.getElementById('q3-table');
    showLoading(tableEl);

    try {
        const data = await api.query3();
        renderTable(tableEl, data, [
            { key: 'fecha', label: 'Fecha' },
            {
                key: 'tipo', label: 'Tipo',
                render: v => v === 'Consulta'
                    ? badge('Consulta', 'primary')
                    : badge('Vacunación', 'success'),
            },
            { key: 'detalle', label: 'Detalle' },
            { key: 'diagnostico', label: 'Diagnóstico', render: v => v ? escapeHTML(String(v)) : '—' },
            { key: 'proxima_dosis', label: 'Próxima dosis', render: v => v ? escapeHTML(String(v)) : '—' },
            { key: 'veterinario', label: 'Veterinario' },
        ]);
    } catch (err) {
        showError(tableEl, err.message);
        showToast(err.message, 'error');
    }
}
