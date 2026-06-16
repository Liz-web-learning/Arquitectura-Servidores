# Arquitectura de Servidores · Unidad 1 — Sitio interactivo

Sitio web educativo para impartir la **Unidad 1: Introducción a la organización
computacional**. Cada tema es un componente de una "placa" navegable, con
simuladores interactivos, mini-quizzes y **registro automático del avance de
cada estudiante** para el dashboard de seguimiento.

## Estructura de carpetas

```
arquitectura-servidores-u1/
├── index.html              ← 🏠 Portada del CURSO (5 unidades, U1 activa)
├── css/
│   └── styles.css          ← Diseño compartido por TODO el sitio
├── js/
│   ├── config.js           ← ⚙️ ÚNICO archivo que editas (ENDPOINT, PIN)
│   ├── tracking.js         ← Motor de registro de interacciones
│   └── main.js             ← Identificación, barra superior y quizzes
├── unidad1/
│   └── index.html          ← Placa de navegación de la Unidad 1 (7 chips)
├── temas/                  ← Contenido de los 7 temas de la Unidad 1
│   ├── 1-evolucion.html         (línea de tiempo + Ley de Moore)
│   ├── 2-logica-digital.html    (simulador de compuertas)
│   ├── 3-procesador.html        (ciclo Fetch-Decode-Execute)
│   ├── 4-memoria.html           (pirámide + clasificador)
│   ├── 5-entrada-salida.html    (polling vs. interrupciones/DMA)
│   ├── 6-multiprocesamiento.html(núcleos en paralelo)
│   └── 7-redundancia.html       (RAID 1 con fallo en vivo)
├── dashboard/
│   └── index.html          ← Panel de seguimiento docente (protegido con PIN)
├── servidor/
│   └── seguimiento.gs      ← Código de Google Apps Script (backend)
└── assets/                 ← (imágenes opcionales)
```

### Jerarquía de navegación del estudiante

```
index.html (portada curso)
  └── unidad1/index.html  (placa U1)
        ├── temas/1-evolucion.html
        ├── temas/2-logica-digital.html
        ├── temas/3-procesador.html
        ├── temas/4-memoria.html
        ├── temas/5-entrada-salida.html
        ├── temas/6-multiprocesamiento.html
        └── temas/7-redundancia.html
```

### Cómo liberar una unidad (cuando llegue la sesión)

1. Crea la carpeta `unidad2/` con su `index.html` (puedes copiar `unidad1/index.html` como plantilla).
2. En el `index.html` raíz busca la tarjeta de la Unidad 2 y cambia:
   - `class="unit-card soon"` → `class="unit-card available"`
   - `<div class="unit-card soon">` → `<a class="unit-card available" href="unidad2/index.html">`
   - Cierra con `</a>` en lugar de `</div>`
   - Cambia el pie `🔒 Se libera...` → `▸ Entrar a la unidad`
3. Haz commit y push. En 2 minutos el sitio se actualiza.

## Cómo publicarlo en GitHub Pages

1. Crea un repositorio (ej. `Arquitectura-Servidores-U1`).
2. Sube **todo el contenido de esta carpeta** (que `index.html` quede en la raíz).
3. En el repo: **Settings → Pages → Branch: `main` / root → Save**.
4. En unos minutos estará en `https://TU-USUARIO.github.io/Arquitectura-Servidores-U1/`.

## Activar el registro centralizado (dashboard real)

Por defecto el sitio **ya funciona** y guarda el avance en el navegador del
estudiante (modo demo). Para reunir los datos de todo el grupo en un solo lugar:

1. Crea una **Google Sheet** vacía.
2. Menú **Extensiones → Apps Script**, pega el contenido de
   `servidor/seguimiento.gs` y guarda.
3. **Implementar → Nueva implementación → Aplicación web**
   (ejecutar como *tú*, acceso *cualquier usuario*). Copia la URL `/exec`.
4. Pega esa URL en `js/config.js`:
   ```js
   ENDPOINT: "https://script.google.com/macros/s/XXXX/exec"
   ```
5. Listo: cada interacción se guarda como fila en tu hoja y el dashboard la lee.

## Qué se registra automáticamente

- **Ingreso** del estudiante (nombre, apellido, correo).
- **Vista** de cada tema y **tiempo** de permanencia.
- **Interacciones** con cada simulador (mover la Ley de Moore, elegir una
  compuerta, provocar un fallo de RAID, etc.).
- **Resultados de quizzes** y **módulos completados**.

El dashboard (`dashboard/index.html`, PIN por defecto `1234`, cámbialo en
`config.js`) muestra métricas del grupo, avance por estudiante e interacción por
tema, y permite **exportar todo a CSV**.

## Para agregar más temas o unidades

Copia cualquier archivo de `temas/`, cambia el contenido y el `const TEMA = "tX"`,
y agrega una entrada al arreglo `TEMAS` en `index.html`. El diseño, el registro y
los quizzes ya funcionan sin tocar nada más.
