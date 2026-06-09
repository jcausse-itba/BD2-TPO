/**
 * query13.js — ABM completo de propietarios: alta, modificación, baja lógica.
 *
 * Uses tabs to switch between the three operations.
 */
import api from '../js/api.js';
import { showToast, escapeHTML } from '../js/ui.js';

const FIELDS = [
    { name: 'id_propietario', label: 'ID Propietario', type: 'text',   placeholder: 'Ej: PROP021' },
    { name: 'nombre',         label: 'Nombre',         type: 'text',   placeholder: 'Juan' },
    { name: 'apellido',       label: 'Apellido',       type: 'text',   placeholder: 'Pérez' },
    { name: 'dni',             label: 'DNI',            type: 'number', placeholder: '12345678' },
    { name: 'email',           label: 'Email',          type: 'email',  placeholder: 'juan@mail.com' },
    { name: 'telefono',       label: 'Teléfono',       type: 'number', placeholder: '1122334455' },
    { name: 'ciudad',         label: 'Ciudad',          type: 'text',   placeholder: 'Buenos Aires' },
    { name: 'provincia',      label: 'Provincia',       type: 'text',   placeholder: 'Buenos Aires' },
];

function buildFormHTML(prefix) {
    const inputs = FIELDS.map(f => `
        <div class="form-group">
            <label class="form-label" for="${prefix}-${f.name}">${f.label}</label>
            <input class="form-input" id="${prefix}-${f.name}" type="${f.type}" placeholder="${f.placeholder}">
        </div>`).join('');
    return `<div class="form-grid">${inputs}</div>`;
}

function getFormData(prefix) {
    const data = {};
    for (const f of FIELDS) {
        const el = document.getElementById(`${prefix}-${f.name}`);
        data[f.name] = f.type === 'number' ? Number(el.value) : el.value.trim();
    }
    return data;
}

export default function init(container) {
    container.innerHTML = `
        <div class="page-header">
            <h1 class="page-header__title">✏️ Query 13 — ABM Propietarios</h1>
            <p class="page-header__subtitle">Alta, modificación de datos y baja lógica de propietarios</p>
        </div>

        <div class="tabs" id="q13-tabs">
            <button class="tab tab--active" data-tab="alta">Alta</button>
            <button class="tab" data-tab="modif">Modificación</button>
            <button class="tab" data-tab="baja">Baja lógica</button>
        </div>

        <!-- Alta -->
        <div class="card" id="q13-alta">
            <div class="card__header"><span class="card__title">Registrar nuevo propietario</span></div>
            <div class="card__body">
                ${buildFormHTML('alta')}
                <div class="form-actions">
                    <button class="btn btn--primary" id="q13-alta-btn">Crear propietario</button>
                </div>
            </div>
        </div>

        <!-- Modificación -->
        <div class="card" id="q13-modif" style="display:none;">
            <div class="card__header"><span class="card__title">Modificar propietario existente</span></div>
            <div class="card__body">
                ${buildFormHTML('modif')}
                <div class="form-actions">
                    <button class="btn btn--primary" id="q13-modif-btn">Guardar cambios</button>
                </div>
            </div>
        </div>

        <!-- Baja -->
        <div class="card" id="q13-baja" style="display:none;">
            <div class="card__header"><span class="card__title">Baja lógica de propietario</span></div>
            <div class="card__body">
                <div class="param-bar">
                    <div class="form-group">
                        <label class="form-label" for="baja-id">ID Propietario</label>
                        <input class="form-input" id="baja-id" type="text" placeholder="Ej: PROP001">
                    </div>
                    <button class="btn btn--danger" id="q13-baja-btn">Dar de baja</button>
                </div>
            </div>
        </div>`;

    // Tab switching
    const tabs = document.getElementById('q13-tabs');
    const panels = { alta: document.getElementById('q13-alta'), modif: document.getElementById('q13-modif'), baja: document.getElementById('q13-baja') };

    tabs.addEventListener('click', e => {
        const btn = e.target.closest('.tab');
        if (!btn) return;
        const target = btn.dataset.tab;

        tabs.querySelectorAll('.tab').forEach(t => t.classList.toggle('tab--active', t === btn));
        Object.entries(panels).forEach(([k, el]) => { el.style.display = k === target ? '' : 'none'; });
    });

    // Alta
    document.getElementById('q13-alta-btn').addEventListener('click', async () => {
        try {
            const data = getFormData('alta');
            const res = await api.createPropietario(data);
            showToast(res.message, 'success');
        } catch (err) {
            showToast(err.message, 'error');
        }
    });

    // Modificación
    document.getElementById('q13-modif-btn').addEventListener('click', async () => {
        try {
            const data = getFormData('modif');
            const res = await api.updatePropietario(data);
            showToast(res.message, 'success');
        } catch (err) {
            showToast(err.message, 'error');
        }
    });

    // Baja
    document.getElementById('q13-baja-btn').addEventListener('click', async () => {
        try {
            const id = document.getElementById('baja-id').value.trim();
            if (!id) { showToast('Ingresá un ID de propietario.', 'error'); return; }
            const res = await api.deletePropietario(id);
            showToast(res.message, 'success');
        } catch (err) {
            showToast(err.message, 'error');
        }
    });
}
