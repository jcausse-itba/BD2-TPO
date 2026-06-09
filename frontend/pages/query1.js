/**
 * query1.js — Pacientes activos con datos del propietario.
 */
import api from '../js/api.js';
import { renderTable, showLoading, showError, showToast, badge } from '../js/ui.js';

export default async function init(container) {
    container.innerHTML = `
        <div class="page-header">
            <h1 class="page-header__title">🐾 Query 1 — Pacientes activos</h1>
            <p class="page-header__subtitle">Pacientes activos con la totalidad de los datos de su propietario</p>
        </div>
        <div class="card">
            <div class="card__header">
                <span class="card__title">Resultados</span>
                <span class="badge badge--primary">MongoDB</span>
            </div>
            <div class="card__body card__body--flush" id="q1-table"></div>
        </div>`;

    const tableEl = document.getElementById('q1-table');
    showLoading(tableEl);

    try {
        const data = await api.query1();
        renderTable(tableEl, data, [
            { key: 'nombre', label: 'Paciente' },
            { key: 'propietario.nombre', label: 'Nombre propietario' },
            { key: 'propietario.apellido', label: 'Apellido' },
            { key: 'propietario.dni', label: 'DNI' },
            { key: 'propietario.email', label: 'Email' },
            { key: 'propietario.telefono', label: 'Teléfono' },
            { key: 'propietario.ciudad', label: 'Ciudad' },
            { key: 'propietario.provincia', label: 'Provincia' },
        ]);
    } catch (err) {
        showError(tableEl, err.message);
        showToast(err.message, 'error');
    }
}
