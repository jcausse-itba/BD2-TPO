/**
 * query3.js — Historial completo de un paciente (consultas + vacunaciones).
 */
import api from '../js/api.js';
import { renderTable, showLoading, showError, showToast, badge, escapeHTML } from '../js/ui.js';

export default async function init(container) {
    container.innerHTML = `
        <div class="page-header">
            <h1 class="page-header__title">📜 Query 3 — Historial de paciente</h1>
            <p class="page-header__subtitle">Consultas y vacunaciones de un paciente a ingresar, ordenadas por fecha</p>
        </div>

        <div class="card mb-6">
            <div class="card__body">
                <div class="param-bar">
                    <div class="form-group">
                        <label class="form-label" for="q3-paciente">ID Paciente</label>
                        <input class="form-input" id="q3-paciente" type="text" placeholder="Ej: P001">
                    </div>
                    <button class="btn btn--primary" id="q3-btn">Consultar</button>
                </div>
            </div>
        </div>

        <div class="card">
            <div class="card__header">
                <span class="card__title">Historial</span>
                <span class="badge badge--primary">MongoDB</span>
            </div>
            <div class="card__body card__body--flush" id="q3-table">
                <div class="state-message">
                    <div class="state-message__icon">📜</div>
                    <div class="state-message__text">Ingrese un ID de paciente para buscar.</div>
                </div>
            </div>
        </div>`;

    const input = document.getElementById('q3-paciente');
    const btn = document.getElementById('q3-btn');
    const tableEl = document.getElementById('q3-table');

    async function search() {
        const id_paciente = input.value.trim();
        if (!id_paciente) {
            showToast('Ingrese un ID de paciente.', 'error');
            return;
        }

        showLoading(tableEl);
        try {
            const data = await api.query3(id_paciente);
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

    btn.addEventListener('click', search);
    input.addEventListener('keydown', e => { if (e.key === 'Enter') search(); });
}
