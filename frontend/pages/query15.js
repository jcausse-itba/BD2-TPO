/**
 * query15.js — Actualización masiva de stock (Cassandra).
 *
 * Dynamic form: the user can add/remove product rows before submitting.
 */
import api from '../js/api.js';
import { showToast, escapeHTML } from '../js/ui.js';

let rowCount = 0;

function createRow() {
    rowCount++;
    const id = rowCount;
    const row = document.createElement('div');
    row.className = 'flex items-center gap-4';
    row.dataset.rowId = id;
    row.innerHTML = `
        <div class="form-group" style="flex:1;">
            <label class="form-label" for="q15-prod-${id}">ID Producto</label>
            <input class="form-input" id="q15-prod-${id}" type="text" placeholder="Ej: PRD001">
        </div>
        <div class="form-group" style="flex:0 0 140px;">
            <label class="form-label" for="q15-qty-${id}">Cantidad</label>
            <input class="form-input" id="q15-qty-${id}" type="number" min="1" placeholder="1">
        </div>
        <button class="btn btn--danger btn--sm q15-remove" data-row="${id}" style="margin-top:auto;" title="Quitar">✕</button>`;
    return row;
}

export default function init(container) {
    rowCount = 0;

    container.innerHTML = `
        <div class="page-header">
            <h1 class="page-header__title">🔄 Query 15 — Actualizar stock</h1>
            <p class="page-header__subtitle">Decrementar unidades de productos tras una consulta (Cassandra)</p>
        </div>

        <div class="card">
            <div class="card__header">
                <span class="card__title">Productos a decrementar</span>
                <button class="btn btn--outline btn--sm" id="q15-add">＋ Agregar producto</button>
            </div>
            <div class="card__body flex flex-col gap-4" id="q15-rows"></div>
            <div class="card__body" style="border-top:1px solid var(--color-border);">
                <div class="form-actions">
                    <button class="btn btn--primary" id="q15-submit">Actualizar stock</button>
                </div>
            </div>
        </div>`;

    const rowsContainer = document.getElementById('q15-rows');

    // Start with one row
    rowsContainer.appendChild(createRow());

    // Add row
    document.getElementById('q15-add').addEventListener('click', () => {
        rowsContainer.appendChild(createRow());
    });

    // Remove row (delegated)
    rowsContainer.addEventListener('click', e => {
        const btn = e.target.closest('.q15-remove');
        if (!btn) return;
        const row = btn.closest('[data-row-id]');
        if (row && rowsContainer.children.length > 1) {
            row.remove();
        } else {
            showToast('Debe haber al menos un producto.', 'error');
        }
    });

    // Submit
    document.getElementById('q15-submit').addEventListener('click', async () => {
        const rows = rowsContainer.querySelectorAll('[data-row-id]');
        const productos = [];

        for (const row of rows) {
            const id = row.dataset.rowId;
            const id_producto = document.getElementById(`q15-prod-${id}`).value.trim();
            const cantidad = Number(document.getElementById(`q15-qty-${id}`).value);

            if (!id_producto || !cantidad || cantidad <= 0) {
                showToast('Completá todos los campos correctamente.', 'error');
                return;
            }
            productos.push({ id_producto, cantidad });
        }

        try {
            const res = await api.decrementStock(productos);
            showToast(res.message, 'success');
        } catch (err) {
            showToast(err.message, 'error');
        }
    });
}
