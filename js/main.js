/* ============================================================
   main.js  ·  Lógica compartida
   - Pantalla de identificación (gate)
   - Barra superior con estudiante
   - Render de quiz reutilizable
   ============================================================ */
(function () {
  const CFG = window.CONFIG || {};

  // ---------- Barra superior ----------
  function pintarBarra() {
    const bar = document.querySelector(".topbar .who");
    if (!bar) return;
    const s = Tracker.getStudent();
    if (s) {
      bar.innerHTML = `<span class="dot"></span> <span class="full">${s.nombre} ${s.apellido}</span>
        <a href="#" id="salir" style="margin-left:8px">salir</a>`;
      const salir = document.getElementById("salir");
      if (salir) salir.onclick = (e) => { e.preventDefault(); Tracker.logout(); location.href = baseUrl() + "index.html"; };
    }
  }

  // calcula la ruta base (para que funcione desde /temas/ o /dashboard/)
  function baseUrl() {
    const p = location.pathname;
    if (p.includes("/temas/") || p.includes("/dashboard/")) return "../";
    return "";
  }

  // ---------- Gate de identificación (solo en index) ----------
  function initGate() {
    const gate = document.getElementById("gate");
    if (!gate) return;
    if (Tracker.getStudent()) { gate.classList.add("hidden"); return; }

    const form = document.getElementById("gate-form");
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const nombre = form.nombre, apellido = form.apellido, correo = form.correo;
      let ok = true;
      const validar = (input, cond) => {
        const field = input.closest(".field");
        field.classList.toggle("invalid", !cond);
        if (!cond) ok = false;
      };
      validar(nombre, nombre.value.trim().length > 1);
      validar(apellido, apellido.value.trim().length > 1);
      validar(correo, /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(correo.value.trim()));
      if (!ok) return;

      Tracker.identify({ nombre: nombre.value, apellido: apellido.value, correo: correo.value });
      gate.classList.add("hidden");
      pintarBarra();
    });
  }

  // ---------- Quiz reutilizable ----------
  // Uso: window.renderQuiz("tema-id", [{q, opciones:[...], correcta:idx}, ...])
  function renderQuiz(temaId, preguntas) {
    const cont = document.getElementById("quiz");
    if (!cont) return;
    cont.innerHTML = preguntas.map((p, i) => `
      <div class="q" data-i="${i}">
        <div class="qtext">${i + 1}. ${p.q}</div>
        ${p.opciones.map((o, j) => `
          <label class="opt"><input type="radio" name="q${i}" value="${j}">${o}</label>
        `).join("")}
      </div>`).join("") +
      `<button class="btn" id="quiz-check">Revisar respuestas</button>
       <div class="quiz-result" id="quiz-result"></div>`;

    document.getElementById("quiz-check").onclick = () => {
      let aciertos = 0;
      preguntas.forEach((p, i) => {
        const qEl = cont.querySelector(`.q[data-i="${i}"]`);
        const sel = qEl.querySelector(`input[name="q${i}"]:checked`);
        qEl.querySelectorAll(".opt").forEach(o => o.classList.remove("correct", "wrong"));
        const opts = qEl.querySelectorAll(".opt");
        opts[p.correcta].classList.add("correct");
        if (sel) {
          const v = +sel.value;
          if (v === p.correcta) aciertos++;
          else opts[v].classList.add("wrong");
        }
      });
      const total = preguntas.length;
      const r = document.getElementById("quiz-result");
      r.textContent = `Resultado: ${aciertos}/${total} correctas` +
        (aciertos === total ? "  ✓ ¡módulo dominado!" : "  · revisa lo marcado en rojo");
      r.style.color = aciertos === total ? "var(--ok)" : "var(--copper)";
      Tracker.registrarQuiz(temaId, aciertos, total);
      if (aciertos >= Math.ceil(total * 0.6)) {
        Tracker.completarModulo(temaId, document.title);
      }
    };
  }

  // exponer
  window.UI = { baseUrl, pintarBarra };
  window.renderQuiz = renderQuiz;

  document.addEventListener("DOMContentLoaded", () => {
    initGate();
    pintarBarra();
  });
})();
