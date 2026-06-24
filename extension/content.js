(function () {
  "use strict";

  var STORAGE_KEY = "ss_captions_backup";

  var collectedTextsArray = [];
  var idRecolectar = null;
  var idDescargar = null;
  var recolectando = false;

  // ── UI ────────────────────────────────────────────────────────────

  var estilo = document.createElement("style");
  estilo.textContent = [
    "#ss-toolbar {",
    "  position:fixed; bottom:16px; left:16px; z-index:99999;",
    "  display:flex; gap:8px;",
    "  font-family:'Google Sans',Roboto,Arial,sans-serif; font-size:13px;",
    "}",
    "#ss-toolbar button {",
    "  border:none; border-radius:20px; padding:8px 16px; cursor:pointer;",
    "  font-weight:500; color:#fff;",
    "  box-shadow:0 2px 6px rgba(0,0,0,.3);",
    "  transition:opacity .2s, transform .15s;",
    "}",
    "#ss-toolbar button:active { transform:scale(.95); }",
    "#ss-toolbar button:disabled { opacity:.45; cursor:default; }",
    "#ss-btn-iniciar { background:#1a73e8; }",

    "#ss-btn-descargar { background:#34a853; }",
    "#ss-btn-descargar-cerrar { background:#9334e6; }",
    "#ss-toast {",
    "  position:fixed; bottom:72px; left:16px; z-index:99999;",
    "  max-width:320px; padding:12px 20px; border-radius:8px;",
    "  font-family:'Google Sans',Roboto,Arial,sans-serif; font-size:13px;",
    "  color:#fff; background:#333;",
    "  box-shadow:0 4px 12px rgba(0,0,0,.3);",
    "  opacity:0; transform:translateY(12px);",
    "  transition:opacity .35s, transform .35s;",
    "  pointer-events:none;",
    "}",
    "#ss-toast.visible { opacity:1; transform:translateY(0); }",
  ].join("\n");
  document.head.appendChild(estilo);

  var toolbar = document.createElement("div");
  toolbar.id = "ss-toolbar";
  toolbar.innerHTML =
    '<button id="ss-btn-iniciar">Start</button>' +
    '<button id="ss-btn-descargar" disabled>Download</button>' +
    '<button id="ss-btn-descargar-cerrar" disabled>Download & Stop</button>';
  document.body.appendChild(toolbar);

  var toast = document.createElement("div");
  toast.id = "ss-toast";
  document.body.appendChild(toast);

  var btnIniciar = document.getElementById("ss-btn-iniciar");
  var btnDescargar = document.getElementById("ss-btn-descargar");
  var btnDescargarCerrar = document.getElementById("ss-btn-descargar-cerrar");

  var toastTimer = null;

  function mostrarToast(mensaje) {
    clearTimeout(toastTimer);
    toast.textContent = mensaje;
    toast.classList.add("visible");
    toastTimer = setTimeout(function () {
      toast.classList.remove("visible");
    }, 4000);
  }

  // ── Persistencia en localStorage ──────────────────────────────────

  function guardarRespaldo() {
    if (collectedTextsArray.length === 0) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(collectedTextsArray));
    } catch (_) { /* quota exceeded, ignorar */ }
  }

  function restaurarRespaldo() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        var datos = JSON.parse(raw);
        if (Array.isArray(datos) && datos.length > 0) {
          // Fusionar sin duplicados
          for (var i = 0; i < datos.length; i++) {
            if (collectedTextsArray.indexOf(datos[i]) === -1) {
              collectedTextsArray.push(datos[i]);
            }
          }
          return true;
        }
      }
    } catch (_) { /* datos corruptos */ }
    return false;
  }

  function borrarRespaldo() {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (_) { /* ignorar */ }
  }

  // ── Activación de subtítulos ──────────────────────────────────────

  function panelSubtitulosExiste() {
    return !!document.querySelector('div[aria-label="Subtítulos"]');
  }

  function activarSubtitulos() {
    if (panelSubtitulosExiste()) return true;

    var botones = document.querySelectorAll("button");
    for (var b = 0; b < botones.length; b++) {
      var btn = botones[b];
      var label = (btn.getAttribute("aria-label") || "").toLowerCase();
      if (
        label.includes("subtítulo") ||
        label.includes("subtitulo") ||
        label.includes("caption") ||
        label.includes("subtitles") ||
        label.includes("cc")
      ) {
        if (
          label.includes("activar") ||
          label.includes("turn on") ||
          label.includes("enable") ||
          label.includes("show") ||
          label.includes("mostrar")
        ) {
          btn.click();
          return new Promise(function (resolve) {
            var intentos = 0;
            var check = setInterval(function () {
              if (panelSubtitulosExiste()) {
                clearInterval(check);
                resolve(true);
              }
              if (++intentos > 20) {
                clearInterval(check);
                resolve(false);
              }
            }, 150);
          });
        }
      }
    }
    return false;
  }

  // ── Lógica ────────────────────────────────────────────────────────

  function codigoMeet() {
    // Extrae el id de la URL: https://meet.google.com/cea-bfrq-sen → cea-bfrq-sen
    var path = window.location.pathname.replace(/^\//, "");
    return path || "meet";
  }

  function nombreArchivo() {
    return (
      codigoMeet() +
      "_" +
      new Date().toISOString().replace(/[:.]/g, "-") +
      ".txt"
    );
  }

  // incluirTodo: true para descarga manual, false para recolección periódica
  function recolectar(incluirTodo) {
    var targetNode = document.querySelector('div[aria-label="Subtítulos"]');
    if (!targetNode) return;

    var arrayNode = Array.from(targetNode.children);
    var limite = incluirTodo ? arrayNode.length : arrayNode.length - 3;
    for (var j = 0; j < limite; j++) {
      var childElement = arrayNode[j];
      var text = childElement.innerText.trim();
      if (!text) continue;

      var arreglo = text.toLowerCase().split("\n");
      var texto = "[" + arreglo[0] + "]\n" + arreglo[1];

      var encontrado = false;
      for (var i = 0; i < collectedTextsArray.length; i++) {
        var currentItem = collectedTextsArray[i];
        if (currentItem === texto) {
          encontrado = true;
          break;
        }
        if (texto.includes(currentItem)) {
          encontrado = true;
          collectedTextsArray[i] = texto;
          break;
        }
      }
      if (!encontrado) {
        collectedTextsArray.push(texto);
      }
    }
  }

  function recolectarYPersistir() {
    recolectar();
    guardarRespaldo();
  }

  function descargar() {
    recolectar(true);  // tomar todo al descargar manualmente
    if (collectedTextsArray.length === 0) return;

    var resultado = collectedTextsArray.join("\n");
    var blob = new Blob([resultado], { type: "text/plain" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = nombreArchivo();
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function descargarYLimpiar() {
    descargar();
    borrarRespaldo();
  }

  function descargarYCerrar() {
    descargar();                  // descarga el archivo
    borrarRespaldo();             // limpia localStorage
    collectedTextsArray = [];     // vacía el array en memoria
    detener();                    // frena intervalos y ajusta botones
  }

  function iniciar() {
    if (recolectando) return;

    var promesa = activarSubtitulos();
    var proceder = function (panelOk) {
      recolectando = true;
      recolectarYPersistir();
      idRecolectar = setInterval(recolectarYPersistir, 60 * 1000);
      idDescargar = setInterval(descargarYLimpiar, 20 * 60 * 1000);
      btnIniciar.disabled = true;
      btnDescargar.disabled = false;
      btnDescargarCerrar.disabled = false;

      if (!panelOk) {
        mostrarToast(
          "Activa los subtítulos manualmente con el botón CC de la barra inferior"
        );
      }
    };

    if (promesa && typeof promesa.then === "function") {
      promesa.then(proceder);
    } else {
      proceder(promesa);
    }
  }

  function detener() {
    if (!recolectando) return;
    recolectando = false;
    clearInterval(idRecolectar);
    clearInterval(idDescargar);
    idRecolectar = null;
    idDescargar = null;
    btnIniciar.disabled = false;
    btnDescargar.disabled = true;
    btnDescargarCerrar.disabled = true;
  }

  // ── Cierre de pestaña ─────────────────────────────────────────────

  function descargarAlCerrar() {
    if (!recolectando) return;
    recolectar(true);
    guardarRespaldo();
    // Intentar disparar la descarga antes del cierre
    if (collectedTextsArray.length > 0) {
      var resultado = collectedTextsArray.join("\n");
      var blob = new Blob([resultado], { type: "text/plain" });
      var url = URL.createObjectURL(blob);
      var a = document.createElement("a");
      a.href = url;
      a.download = nombreArchivo();
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  }

  // ── Inicialización ────────────────────────────────────────────────

  if (restaurarRespaldo()) {
    mostrarToast(
      "Subtítulos restaurados de la sesión anterior (" +
      collectedTextsArray.length +
      " líneas). Usa el botón Descargar para guardarlos."
    );
  }

  // ── Eventos ───────────────────────────────────────────────────────

  btnIniciar.addEventListener("click", iniciar);
  btnDescargar.addEventListener("click", descargarYLimpiar);
  btnDescargarCerrar.addEventListener("click", descargarYCerrar);

  // Prevenir cierre accidental: pedir confirmación si hay datos activos
  window.addEventListener("beforeunload", function (e) {
    if (recolectando && collectedTextsArray.length > 0) {
      descargarAlCerrar();
      e.preventDefault();
      e.returnValue = "";
    }
  });

  // Respaldo adicional: pagehide es más fiable que beforeunload en algunos casos
  window.addEventListener("pagehide", function () {
    if (recolectando) {
      recolectar();
      guardarRespaldo();
    }
  });
})();
