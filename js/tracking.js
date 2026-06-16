/* ============================================================
   tracking.js  ·  Motor de registro de interacciones
   Reutilizable en todas las páginas. No editar para uso normal.
   ============================================================ */
(function () {
  const CFG = window.CONFIG || {};
  const LS_STUDENT = "seg_estudiante";
  const LS_EVENTS  = "seg_eventos";       // buffer local de todos los eventos
  const LS_PROGRESS = "seg_progreso";     // módulos completados

  // ---------- utilidades ----------
  const now = () => new Date().toISOString();
  const uid = () => Math.random().toString(36).slice(2, 10);
  const read = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } };
  const write = (k, v) => localStorage.setItem(k, JSON.stringify(v));

  // ---------- estudiante ----------
  function getStudent() { return read(LS_STUDENT, null); }

  function identify(data) {
    const s = {
      nombre: data.nombre.trim(),
      apellido: data.apellido.trim(),
      correo: data.correo.trim().toLowerCase(),
      sesion: uid(),
      alta: now()
    };
    write(LS_STUDENT, s);
    logEvent({ tipo: "ingreso", tema: "portada", detalle: "Identificación de estudiante" });
    return s;
  }

  function logout() { localStorage.removeItem(LS_STUDENT); }

  // ---------- registro de eventos ----------
  function logEvent({ tipo, tema = "", detalle = "", valor = "" }) {
    const s = getStudent() || {};
    const evt = {
      id: uid(),
      ts: now(),
      sesion: s.sesion || "anon",
      correo: s.correo || "anon",
      nombre: s.nombre || "",
      apellido: s.apellido || "",
      tema, tipo, detalle, valor,
      url: location.pathname.split("/").pop() || "index.html"
    };

    // 1) buffer local (siempre)
    const buf = read(LS_EVENTS, []);
    buf.push(evt);
    write(LS_EVENTS, buf);

    // 2) envío al endpoint (si está configurado)
    if (CFG.ENDPOINT) {
      try {
        fetch(CFG.ENDPOINT, {
          method: "POST",
          mode: "no-cors",
          headers: { "Content-Type": "text/plain;charset=utf-8" },
          body: JSON.stringify(evt)
        }).catch(() => {});
      } catch (e) { /* sin red: queda en buffer local */ }
    }
    return evt;
  }

  // ---------- vista de página + tiempo de permanencia ----------
  function pageView(tema, nombreTema) {
    logEvent({ tipo: "vista", tema, detalle: nombreTema || "" });
    const inicio = Date.now();
    const enviarTiempo = () => {
      const seg = Math.round((Date.now() - inicio) / 1000);
      if (seg < 2) return;            // ignora rebotes
      logEvent({ tipo: "tiempo", tema, detalle: "segundos en la página", valor: seg });
    };
    // se dispara al ocultar/cerrar la pestaña
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") enviarTiempo();
    });
    window.addEventListener("pagehide", enviarTiempo);
  }

  // ---------- progreso de módulos ----------
  function completarModulo(tema, nombreTema) {
    const prog = read(LS_PROGRESS, {});
    if (!prog[tema]) {
      prog[tema] = { fecha: now() };
      write(LS_PROGRESS, prog);
      logEvent({ tipo: "modulo_completado", tema, detalle: nombreTema || "" });
    }
  }
  function getProgreso() { return read(LS_PROGRESS, {}); }

  // ---------- quiz ----------
  function registrarQuiz(tema, aciertos, total) {
    logEvent({ tipo: "quiz", tema, detalle: `${aciertos}/${total} correctas`, valor: aciertos });
  }

  // ---------- interacción genérica (simuladores) ----------
  function interaccion(tema, detalle, valor = "") {
    logEvent({ tipo: "interaccion", tema, detalle, valor });
  }

  // ---------- API pública ----------
  window.Tracker = {
    getStudent, identify, logout, logEvent, pageView,
    completarModulo, getProgreso, registrarQuiz, interaccion,
    // acceso al buffer para el dashboard local
    _eventos: () => read(LS_EVENTS, []),
    _limpiar: () => { localStorage.removeItem(LS_EVENTS); localStorage.removeItem(LS_PROGRESS); }
  };
})();
