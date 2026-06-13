/**
 * query10.js — Pacientes de una sucursal determinada.
 */
import api from '../js/api.js';
import { renderTable, showLoading, showError, showToast, badge, escapeHTML } from '../js/ui.js';

export default async function init(container) {
    container.innerHTML = `
        <div class="page-header">
            <h1 class="page-header__title">🏥 Query 10 — Pacientes por sucursal</h1>
            <p class="page-header__subtitle">Pacientes atendidos en una sucursal determinada (a través del veterinario)</p>
        </div>

        <div class="card mb-6">
            <div class="card__body">
                <div class="param-bar">
                    <div class="form-group">
                        <label class="form-label" for="q10-sucursal">Sucursal</label>
                        <input class="form-input" id="q10-sucursal" type="text" placeholder="Ej: Palermo">
                    </div>
                    <button class="btn btn--primary" id="q10-btn">Consultar</button>
                </div>
            </div>
        </div>

        <div class="card">
            <div class="card__header">
                <span class="card__title">Resultados</span>
                <span class="badge badge--primary">MongoDB</span>
            </div>
            <div class="card__body card__body--flush" id="q10-table">
                <div class="state-message">
                    <div class="state-message__icon">🏥</div>
                    <div class="state-message__text">Ingresá una sucursal para buscar.</div>
                </div>
            </div>
        </div>`;

    const input = document.getElementById('q10-sucursal');
    const btn = document.getElementById('q10-btn');
    const tableEl = document.getElementById('q10-table');

    async function search() {
        const sucursal = input.value.trim();
        if (!sucursal) {
            showToast('Ingresá un nombre de sucursal.', 'error');
            return;
        }

        showLoading(tableEl);
        try {
            const data = await api.query10(sucursal);
            renderTable(tableEl, data, true, [
                { key: 'id_paciente', label: 'ID Paciente' },
                { key: 'nombre', label: 'Nombre' },
                { key: 'especie', label: 'Especie' },
                { key: 'raza', label: 'Raza' },
                {
                    key: 'activo', label: 'Activo',
                    render: v => badge(v, v === 'True' ? 'success' : 'danger'),
                },
            ]);
        } catch (err) {
            showError(tableEl, err.message);
            showToast(err.message, 'error');
        }
    }

    btn.addEventListener('click', search);
    input.addEventListener('keydown', e => { if (e.key === 'Enter') search(); });
}

