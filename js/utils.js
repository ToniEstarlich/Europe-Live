/* =====================================================
   EUROPE LIVE — UTILITIES
===================================================== */

function escapeHtml(value) {

    const element =
        document.createElement("div");

    element.textContent =
        value;

    return element.innerHTML;

}
