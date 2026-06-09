/**
 * query14.js — Registro de nueva consulta médica.
 */
import api from '../js/api.js';
import { showToast } from '../js/ui.js';

const FIELDS = [
    { name: 'id_consulta', label: 'ID Consulta',  type: 'text',   placeholder: 'Ej: C100' },
    { name: 'id_paciente', label: 'ID Paciente',   type: 'text',   placeholder: 'Ej: P001' },
    { name: 'id_vet',      label: 'ID Veterinario',type: 'text',   placeholder: 'Ej: V001' },
    { name: 'fecha',       label: 'Fecha',          type: 'date',   placeholder: '' },
    { name: 'motivo',      label: 'Motivo',         type: 'text',   placeholder: 'Control general' },
    { name: 'diagnostico', label: 'Diagnóstico',    type: 'text',   placeholder: 'Sin anomalías' },
    { name: 'costo',       label: 'Costo ($)',      type: 'number', placeholder: '3500' },
    { name: 'estado',      label: 'Estado',          type: 'text',   placeholder: 'Finalizada / Seguimiento' },
];

export default function init(container) {
    const inputs = FIELDS.map(f => `
        <div class="form-group">
            <label class="form-label" for="q14-${f.name}">${f.label}</label>
            <input class="form-input" id="q14-${f.name}" type="${f.type}" placeholder="${f.placeholder}">
        </div>`).join('');

    container.innerHTML = `
        <div class="page-header">
            <h1 class="page-header__title">🆕 Query 14 — Nueva consulta médica</h1>
            <p class="page-header__subtitle">Registro con validación de paciente y veterinario existentes</p>
        </div>

        <div class="card">
            <div class="card__header"><span class="card__title">Datos de la consulta</span></div>
            <div class="card__body">
                <div class="form-grid">${inputs}</div>
                <div class="form-actions">
                    <button class="btn btn--primary" id="q14-btn">Registrar consulta</button>
                </div>
            </div>
        </div>`;

    document.getElementById('q14-btn').addEventListener('click', async () => {
        try {
            const data = {};
            for (const f of FIELDS) {
                const el = document.getElementById(`q14-${f.name}`);
                if (f.type === 'number') {
                    data[f.name] = Number(el.value);
                } else if (f.type === 'date') {
                    data[f.name] = el.value; // already YYYY-MM-DD
                } else {
                    data[f.name] = el.value.trim();
                }
            }
            const res = await api.createConsulta(data);
            showToast(res.message, 'success');
        } catch (err) {
            showToast(err.message, 'error');
        }
    });
}
