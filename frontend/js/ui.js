/**
 * ui.js — Shared UI helpers (toast notifications, table rendering, etc.)
 *
 * All functions are pure or side-effect-minimal so they can be composed
 * across pages without tight coupling.
 */

/* ── Toast Notifications ─────────────────────── */

/** Ensure the toast container exists in the DOM. */
function getToastContainer() {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.className = 'toast-container';
        document.body.appendChild(container);
    }
    return container;
}

/**
 * Show a toast notification.
 * @param {string} message
 * @param {'success'|'error'|'info'} type
 * @param {number} duration — ms before auto-dismiss
 */
export function showToast(message, type = 'info', duration = 3500) {
    const container = getToastContainer();
    const toast = document.createElement('div');
    toast.className = `toast toast--${type}`;
    toast.textContent = message;
    container.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('toast--exit');
        toast.addEventListener('animationend', () => toast.remove());
    }, duration);
}

/* ── Table Rendering ─────────────────────────── */

/**
 * Render a data array into an HTML table inside a wrapper element.
 *
 * @param {HTMLElement} container — element to populate
 * @param {Array<Object>} data
 * @param {boolean} showIdsDefault — default state for showing 'id_' columns
 * @param {Array<{key: string, label: string, render?: (val, row) => string}>} columns
 */
export function renderTable(container, data, showIdsDefault, columns) {
    if (!data || data.length === 0) {
        container.innerHTML = `
            <div class="state-message">
                <div class="state-message__icon">📭</div>
                <div class="state-message__text">No se encontraron resultados.</div>
            </div>`;
        return;
    }

    const hasIdColumns = columns.some(c => c.key.split('.').pop().startsWith('id_'));

    const cardHeader = container.previousElementSibling;
    let showIds = showIdsDefault;

    if (cardHeader && cardHeader.classList.contains('card__header')) {
        let toggleLabel = cardHeader.querySelector('.id-toggle-label');
        
        if (hasIdColumns) {
            if (!toggleLabel) {
                toggleLabel = document.createElement('label');
                toggleLabel.className = 'toggle-switch id-toggle-label';

                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.checked = showIdsDefault;
                checkbox.className = 'toggle-switch__checkbox id-toggle-checkbox';

                const slider = document.createElement('span');
                slider.className = 'toggle-switch__slider';

                const text = document.createElement('span');
                text.className = 'toggle-switch__text';
                text.textContent = 'Mostrar Identificadores';

                toggleLabel.appendChild(checkbox);
                toggleLabel.appendChild(slider);
                toggleLabel.appendChild(text);

                const badge = cardHeader.querySelector('.badge');
                if (badge) {
                    cardHeader.insertBefore(toggleLabel, badge);
                } else {
                    cardHeader.appendChild(toggleLabel);
                }

                checkbox.addEventListener('change', (e) => {
                    renderTableHTML(container, data, e.target.checked, columns);
                });
            } else {
                toggleLabel.style.display = 'inline-flex';
                const checkbox = toggleLabel.querySelector('.id-toggle-checkbox');
                if (checkbox) showIds = checkbox.checked;
            }
        } else {
            if (toggleLabel) {
                toggleLabel.style.display = 'none';
            }
        }
    }

    renderTableHTML(container, data, showIds, columns);
}

function renderTableHTML(container, data, showIds, columns) {
    const activeColumns = showIds 
        ? columns 
        : columns.filter(c => !c.key.split('.').pop().startsWith('id_'));

    const ths = activeColumns.map(c => `<th>${escapeHTML(c.label)}</th>`).join('');
    const trs = data.map(row => {
        const tds = activeColumns.map(c => {
            const raw = getNestedValue(row, c.key);
            const rendered = c.render ? c.render(raw, row) : escapeHTML(String(raw ?? ''));
            return `<td>${rendered}</td>`;
        }).join('');
        return `<tr>${tds}</tr>`;
    }).join('');

    container.innerHTML = `
        <div class="table-wrapper">
            <table class="table">
                <thead><tr>${ths}</tr></thead>
                <tbody>${trs}</tbody>
            </table>
        </div>`;
}

/* ── Loading State ───────────────────────────── */

/**
 * Show a centered spinner inside a container.
 * @param {HTMLElement} container
 */
export function showLoading(container) {
    container.innerHTML = `
        <div class="state-message">
            <div class="spinner"></div>
            <div class="state-message__text mt-4">Cargando datos…</div>
        </div>`;
}

/**
 * Show an error message inside a container.
 * @param {HTMLElement} container
 * @param {string} message
 */
export function showError(container, message) {
    container.innerHTML = `
        <div class="state-message">
            <div class="state-message__icon">⚠️</div>
            <div class="state-message__text text-danger">${escapeHTML(message)}</div>
        </div>`;
}

/* ── Utilities ───────────────────────────────── */

/**
 * Escape HTML special characters.
 * @param {string} str
 * @returns {string}
 */
export function escapeHTML(str) {
    const div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
}

/**
 * Access nested object properties with dot notation.
 * @param {Object} obj
 * @param {string} path — e.g. 'propietario.nombre'
 * @returns {*}
 */
export function getNestedValue(obj, path) {
    return path.split('.').reduce((acc, part) => acc?.[part], obj);
}

/**
 * Create a badge element string.
 * @param {string} text
 * @param {'primary'|'success'|'warning'|'danger'|'neutral'} variant
 * @returns {string}
 */
export function badge(text, variant = 'neutral') {
    return `<span class="badge badge--${variant}">${escapeHTML(text)}</span>`;
}

/**
 * Format a number as Argentine currency.
 * @param {number} n
 * @returns {string}
 */
export function formatCurrency(n) {
    return new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: 'ARS',
        minimumFractionDigits: 0,
    }).format(n);
}
