/**
 * query2.js — Consultas en seguimiento con datos del veterinario.
 */
import api from '../js/api.js';
import { renderTable, showLoading, showError, showToast, badge, formatCurrency } from '../js/ui.js';

export default async function init(container) {
    container.innerHTML = `
        <div class="page-header">
            <h1 class="page-header__title">📋 Query 2 — Consultas en seguimiento</h1>
            <p class="page-header__subtitle">Consultas con estado "Seguimiento" y datos del veterinario asignado</p>
        </div>
        <div class="card">
            <div class="card__header">
                <span class="card__title">Resultados</span>
                <span class="badge badge--primary">MongoDB</span>
            </div>
            <div class="card__body card__body--flush" id="q2-table"></div>
        </div>`;

    const tableEl = document.getElementById('q2-table');
    showLoading(tableEl);

    try {
        const data = await api.query2();
        renderTable(tableEl, data, [
            { key: 'id_consulta', label: 'ID Consulta' },
            { key: 'id_vet', label: 'ID Veterinario' },
            { key: 'id_paciente', label: 'ID Paciente' },
            { key: 'fecha', label: 'Fecha' },
            { key: 'motivo', label: 'Motivo' },
            { key: 'diagnostico', label: 'Diagnóstico' },
            { key: 'costo', label: 'Costo', render: v => formatCurrency(v) },
            { key: 'estado', label: 'Estado', render: () => badge('Seguimiento', 'warning') },
            { key: 'veterinario.nombre', label: 'Veterinario' },
            { key: 'veterinario.especialidad', label: 'Especialidad' },
        ]);
    } catch (err) {
        showError(tableEl, err.message);
        showToast(err.message, 'error');
    }
}
