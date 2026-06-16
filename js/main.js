/* ============================================================
   main.js  ·  Lógica compartida
   - Gate de identificación: se muestra UNA SOLA VEZ,
     queda guardado en localStorage y no vuelve a aparecer
   - Barra superior con nombre del estudiante
   - Quiz reutilizable
   ============================================================ */
(function () {

  /* ----------------------------------------------------------
     Ocultar el gate INMEDIATAMENTE si ya hay sesión activa.
     Se hace ANTES de DOMContentLoaded para evitar el flash.
  ---------------------------------------------------------- */
  (function ocultarGateRapido() {
    try {
      const s = JSON.parse(localStorage.getItem("seg_estudiante"));
      if (s && s.correo) {
        // Inyecta el estilo inline para que el gate nunca sea visible
        const st = document.createElement("style");
        st.textContent = "#gate { display: none !important; }";
        document.head.appendChild(st);
      }
    } catch (e) {}
  })();

  /* ----------------------------------------------------------
     baseUrl: calcula la raíz del sitio desde cualquier página
  ---------------------------------------------------------- */
  function baseUrl() {
    const p = location.pathname;
    // /temas/, /dashboard/, /unidad1/ → subir un nivel
    if (/\/(temas|dashboard|unidad1|unidad2|unidad3|unidad4|unidad5)\//.test(p)) return "../";
    return "";
  }

  /* ----------------------------------------------------------
     Barra superior: muestra nombre y botón salir
  ---------------------------------------------------------- */
  function pintarBarra() {
    const bar = document.querySelector(".topbar .who");
    if (!bar) return;
    const s = Tracker.getStudent();
    if (s) {
      bar.innerHTML =
        `<span class="dot"></span>
         <span class="who-name">${s.nombre} ${s.apellido}</span>
         <a href="#" id="btn-salir" class="who-salir">Salir</a>`;
      document.getElementById("btn-salir").onclick = (e) => {
        e.preventDefault();
        if (confirm("¿Cerrar sesión? La próxima vez tendrás que volver a ingresar tus datos.")) {
          Tracker.logout();
          location.href = baseUrl() + "index.html";
        }
      };
    }
  }

  /* ----------------------------------------------------------
     Gate de identificación
     Solo actúa si hay un #gate en la página Y no hay sesión
  ---------------------------------------------------------- */
  function initGate() {
    const gate = document.getElementById("gate");
    if (!gate) return;

    // Si ya hay sesión, ocultar y salir
    if (Tracker.getStudent()) {
      gate.style.display = "none";
      return;
    }

    // Mostrar el gate
    gate.style.display = "";

    const form = document.getElementById("gate-form");
    if (!form) return;

    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const campos = {
        nombre:   { el: form.nombre,   test: v => v.trim().length > 1,
                    msg: "Ingresa tu nombre." },
        apellido: { el: form.apellido, test: v => v.trim().length > 1,
                    msg: "Ingresa tu apellido." },
        correo:   { el: form.correo,
                    test: v => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v.trim()),
                    msg: "Ingresa un correo válido." }
      };

      let todoBien = true;
      Object.values(campos).forEach(({ el, test }) => {
        const field = el.closest(".field");
        const pasa  = test(el.value);
        field.classList.toggle("invalid", !pasa);
        if (!pasa) todoBien = false;
      });
      if (!todoBien) return;

      // Guardar en localStorage (persiste entre visitas y páginas)
      Tracker.identify({
        nombre:   form.nombre.value,
        apellido: form.apellido.value,
        correo:   form.correo.value
      });

      gate.style.display = "none";
      pintarBarra();
    });

    // Limpiar error al escribir
    form.querySelectorAll("input").forEach(input => {
      input.addEventListener("input", () =>
        input.closest(".field").classList.remove("invalid"));
    });
  }

  /* ----------------------------------------------------------
     Quiz reutilizable
     Uso: renderQuiz("t1", [{q:"...", opciones:[...], correcta:0}])
  ---------------------------------------------------------- */
  function renderQuiz(temaId, preguntas) {
    const cont = document.getElementById("quiz");
    if (!cont) return;

    cont.innerHTML = preguntas.map((p, i) => `
      <div class="q" data-i="${i}">
        <p class="qtext">${i + 1}. ${p.q}</p>
        ${p.opciones.map((o, j) => `
          <label class="opt">
            <input type="radio" name="q${i}" value="${j}">
            <span>${o}</span>
          </label>`).join("")}
      </div>`).join("") +
      `<p class="quiz-result" id="quiz-result"></p>`;

    // Insertar "Revisar respuestas" en la barra de navegación inferior
    const nav = document.querySelector("nav");
    if (nav) {
      const btnCheck = document.createElement("button");
      btnCheck.className = "btn-quiz-check";
      btnCheck.id = "quiz-check";
      btnCheck.textContent = "Revisar respuestas";
      nav.insertBefore(btnCheck, nav.firstElementChild);
    }

    document.getElementById("quiz-check").onclick = () => {
      let aciertos = 0;
      preguntas.forEach((p, i) => {
        const qEl  = cont.querySelector(`.q[data-i="${i}"]`);
        const sel  = qEl.querySelector(`input[name="q${i}"]:checked`);
        const opts = qEl.querySelectorAll(".opt");
        opts.forEach(o => o.classList.remove("correct", "wrong"));
        opts[p.correcta].classList.add("correct");
        if (sel) {
          const v = +sel.value;
          if (v === p.correcta) aciertos++;
          else opts[v].classList.add("wrong");
        }
      });
      const total = preguntas.length;
      const res   = document.getElementById("quiz-result");
      const pct   = Math.round(aciertos / total * 100);
      res.textContent = `Resultado: ${aciertos} de ${total} correctas (${pct}%)` +
        (aciertos === total ? " · ¡Módulo dominado! ✓" : " · Revisa las marcadas en rojo.");
      res.className = "quiz-result " + (aciertos === total ? "ok" : "warn");

      Tracker.registrarQuiz(temaId, aciertos, total);
      if (aciertos >= Math.ceil(total * 0.6)) {
        Tracker.completarModulo(temaId, document.title);
      }
    };
  }

  /* ----------------------------------------------------------
     Inicialización
  ---------------------------------------------------------- */
  document.addEventListener("DOMContentLoaded", () => {
    initGate();
    pintarBarra();
  });

  // API pública
  window.UI = { baseUrl, pintarBarra };
  window.renderQuiz = renderQuiz;

})();
