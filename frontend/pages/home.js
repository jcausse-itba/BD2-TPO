/**
 * home.js — Landing / dashboard page.
 */

export default function init(container) {
    container.innerHTML = `
        <div class="page-header">
            <h1 class="page-header__title">🐾 Clínica Veterinaria — Grupo 10</h1>
            <p class="page-header__subtitle">Panel de consultas a las bases de datos MongoDB y Cassandra</p>
        </div>

        <div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: var(--space-6);">
            <div class="card">
                <div class="card__body">
                    <h3 style="margin-bottom:var(--space-2);">📄 Consultas de lectura</h3>
                    <p class="text-muted text-sm">
                        Queries 1–12: consultas de solo lectura sobre pacientes, propietarios, 
                        veterinarios, vacunas, stock farmacéutico e ingresos.
                    </p>
                </div>
            </div>
            <div class="card">
                <div class="card__body">
                    <h3 style="margin-bottom:var(--space-2);">✏️ Operaciones de escritura</h3>
                    <p class="text-muted text-sm">
                        Queries 13–15: ABM de propietarios, registro de consultas médicas 
                        y actualización masiva de stock.
                    </p>
                </div>
            </div>
            <div class="card">
                <div class="card__body">
                    <h3 style="margin-bottom:var(--space-2);">🗄️ Bases de datos</h3>
                    <p class="text-muted text-sm">
                        MongoDB para datos clínicos y Cassandra para el stock farmacéutico. 
                        La API unifica ambas detrás de endpoints REST.
                    </p>
                </div>
            </div>
        </div>

        <p class="text-muted text-sm mt-6">
            Seleccioná una consulta en el menú lateral para comenzar.
        </p>
    `;
}
