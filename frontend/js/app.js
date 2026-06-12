/**
 * app.js — Application entry point.
 *
 * Builds the sidebar, mounts the router, and wires up navigation highlights.
 */

import { initRouter } from './router.js';

/* ── Query metadata (drives the sidebar & page titles) ── */
const QUERIES = [
    { id: 'home',    label: 'Inicio',                      icon: '🏠', section: 'General' },
    { id: 'query1',  label: 'Query 1:  Pacientes activos',            icon: '🐾', section: 'Consultas MongoDB' },
    { id: 'query2',  label: 'Query 2:  Consultas en seguimiento',     icon: '📋', section: 'Consultas MongoDB' },
    { id: 'query3',  label: 'Query 3:  Historial de paciente',        icon: '📜', section: 'Consultas MongoDB' },
    { id: 'query4',  label: 'Query 4:  Propietarios con +1 paciente', icon: '👥', section: 'Consultas MongoDB' },
    { id: 'query5',  label: 'Query 5:  Veterinarios últimos 60 días', icon: '🩺', section: 'Consultas MongoDB' },
    { id: 'query6',  label: 'Query 6:  Vacunas vencidas',             icon: '💉', section: 'Consultas MongoDB' },
    { id: 'query7',  label: 'Query 7:  Top 5 diagnósticos',           icon: '📊', section: 'Consultas MongoDB' },
    { id: 'query8',  label: 'Query 8:  Stock bajo (<50 u.)',           icon: '📦', section: 'Consultas Cassandra' },
    { id: 'query9',  label: 'Query 9:  Controles < $5.000',           icon: '💲', section: 'Consultas MongoDB' },
    { id: 'query10', label: 'Query 10: Pacientes por sucursal',        icon: '🏥', section: 'Consultas MongoDB' },
    { id: 'query11', label: 'Query 11: Ingresos por veterinario',      icon: '💰', section: 'Consultas MongoDB' },
    { id: 'query12', label: 'Query 12: Propietarios sin consultas',    icon: '🚫', section: 'Consultas MongoDB' },
    { id: 'query13', label: 'Query 13: ABM Propietarios',              icon: '✏️', section: 'Operaciones de Escritura' },
    { id: 'query14', label: 'Query 14: Nueva consulta médica',         icon: '🆕', section: 'Operaciones de Escritura' },
    { id: 'query15', label: 'Query 15: Actualizar stock',              icon: '🔄', section: 'Operaciones de Escritura' },
];

export { QUERIES };

/* ── Build Sidebar ───────────────────────────── */
function buildSidebar() {
    const nav = document.getElementById('sidebar-nav');
    let currentSection = '';

    for (const q of QUERIES) {
        if (q.section !== currentSection) {
            currentSection = q.section;
            const title = document.createElement('div');
            title.className = 'sidebar__section-title';
            title.textContent = currentSection;
            nav.appendChild(title);
        }

        const a = document.createElement('a');
        a.href = `#${q.id}`;
        a.className = 'sidebar__link';
        a.dataset.page = q.id;
        a.innerHTML = `
            <span class="sidebar__link-icon">${q.icon}</span>
            <span>${q.label}</span>`;
        nav.appendChild(a);
    }
}

/* ── Highlight active link ───────────────────── */
function highlightLink(pageName) {
    document.querySelectorAll('.sidebar__link').forEach(link => {
        link.classList.toggle('sidebar__link--active', link.dataset.page === pageName);
    });
}

/* ── Bootstrap ───────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
    buildSidebar();
    const outlet = document.getElementById('page-outlet');
    initRouter(outlet, highlightLink);
});
