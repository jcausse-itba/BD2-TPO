/**
 * query8.js — Stock farmacéutico con menos de 50 unidades (Cassandra).
 */
import api from '../js/api.js';
import { renderTable, showLoading, showError, showToast, badge } from '../js/ui.js';

export default async function init(container) {
    container.innerHTML = `
        <div class="page-header">
            <h1 class="page-header__title">📦 Query 8 — Stock bajo (&lt;50 u.)</h1>
            <p class="page-header__subtitle">Productos farmacéuticos con menos de 50 unidades en stock y su proveedor</p>
        </div>
        <div class="card">
            <div class="card__header">
                <span class="card__title">Resultados</span>
                <span class="badge badge--warning">Cassandra</span>
            </div>
            <div class="card__body card__body--flush" id="q8-table"></div>
        </div>`;

    const tableEl = document.getElementById('q8-table');
    showLoading(tableEl);

    try {
        const data = await api.query8();
        renderTable(tableEl, data, true, [
            { key: 'id_producto', label: 'ID Producto' },
            { key: 'nombre', label: 'Producto' },
            { key: 'categoria', label: 'Categoria'},
            {
                key: 'unidades', label: 'Unidades',
                render: v => {
                    const n = Number(v);
                    const variant = n < 10 ? 'danger' : n < 30 ? 'warning' : 'neutral';
                    return badge(String(v), variant);
                },
            },
            { key: 'precio_unit', label: 'Precio Unitario'},
            { key: 'vencimiento', label: 'Vencimiento'},
            { key: 'proveedor', label: 'Proveedor' },
        ]);
    } catch (err) {
        showError(tableEl, err.message);
        showToast(err.message, 'error');
    }
}

