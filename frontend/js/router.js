/**
 * router.js — Minimal hash-based page router.
 *
 * Pages are loaded via dynamic import() from the /pages directory.
 * Each page module must export a default `init(container)` function.
 */

const pageCache = new Map();

/**
 * Register the router. Call once on DOMContentLoaded.
 * @param {HTMLElement} outlet — the element where page content is injected
 * @param {function} onNavigate — optional callback after page load (e.g. update sidebar)
 */
export function initRouter(outlet, onNavigate) {
    async function navigate() {
        const hash = location.hash.slice(1) || 'home';
        const pageName = hash.split('?')[0]; // strip any query parts

        // Highlight active sidebar link
        if (typeof onNavigate === 'function') onNavigate(pageName);

        try {
            let mod = pageCache.get(pageName);
            if (!mod) {
                mod = await import(`../pages/${pageName}.js`);
                pageCache.set(pageName, mod);
            }

            outlet.innerHTML = '';
            await mod.default(outlet);
        } catch (err) {
            console.error(`[router] Failed to load page "${pageName}":`, err);
            outlet.innerHTML = `
                <div class="state-message">
                    <div class="state-message__icon">🔌</div>
                    <div class="state-message__text">
                        No se pudo cargar la página <strong>${pageName}</strong>.
                    </div>
                </div>`;
        }
    }

    window.addEventListener('hashchange', navigate);
    navigate(); // initial load
}
