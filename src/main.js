import "./styles.css";
import {
  challengeMeta,
  classificationItems,
  movementBoneImages,
  movementCases,
  mysteries,
  regions,
  regionSets,
} from "./challenges.js";

const STORAGE_KEY = "cecar-mision-esqueleto-v1";
const resultsEndpoint = import.meta.env.VITE_RESULTS_ENDPOINT?.trim();
const asset = (name) => `${import.meta.env.BASE_URL}${name}`;

const emptyState = () => ({
  profile: null,
  sessionId: null,
  current: 0,
  completed: [],
  score: 1000,
  attempts: 0,
  hints: 0,
  hintUsed: [],
  interruptions: 0,
  inactiveSeconds: 0,
  startedAt: null,
  finishedAt: null,
  answers: {},
  drafts: {},
});

let state = loadState();
let timerId;
let sessionHiddenAt = null;

console.info(
  "%cActividad acad\u00e9mica protegida%c\nEl progreso, los intentos, las pistas y las interrupciones de sesi\u00f3n quedan registrados en el reporte. Modificar la aplicaci\u00f3n desde la consola invalida la evidencia de la actividad.",
  "color:#55d5df;background:#061019;padding:6px 10px;font-weight:700;font-size:14px;",
  "color:inherit;font-size:12px;",
);

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return saved?.profile ? { ...emptyState(), ...saved } : emptyState();
  } catch {
    return emptyState();
  }
}

function persist() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function normalize(value = "") {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function escapeHtml(value = "") {
  return value.replace(/[&<>"]/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
  })[character]);
}

function icon(name) {
  const paths = {
    lock: '<rect x="6" y="10" width="12" height="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
    unlock: '<rect x="6" y="10" width="12" height="10" rx="2"/><path d="M16 10V7a4 4 0 0 0-7.5-2"/>',
    check: '<path d="m5 12 4 4L19 6"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    flask: '<path d="M9 3h6M10 3v6l-5 9a2 2 0 0 0 2 3h10a2 2 0 0 0 2-3l-5-9V3"/><path d="M8 15h8"/>',
    hint: '<path d="M9 18h6M10 22h4"/><path d="M8.5 14.5A6 6 0 1 1 16 14c-1 .8-1.5 1.5-1.5 3h-5c0-1.2-.3-1.8-1-2.5Z"/>',
    download: '<path d="M12 3v12m0 0 4-4m-4 4-4-4"/><path d="M5 19h14"/>',
    send: '<path d="m4 4 17 8-17 8 3-8-3-8Z"/><path d="M7 12h14"/>',
    close: '<path d="m6 6 12 12M18 6 6 18"/>',
    arrow: '<path d="M5 12h14m-5-5 5 5-5 5"/>',
    reset: '<path d="M4 12a8 8 0 1 0 3-6.2L4 9"/><path d="M4 4v5h5"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7h.01"/>',
  };
  return `<svg aria-hidden="true" viewBox="0 0 24 24">${paths[name]}</svg>`;
}

function render() {
  clearInterval(timerId);
  if (!state.profile) renderIntro();
  else if (state.finishedAt) renderReport();
  else renderMission();
}

function renderIntro() {
  window.scrollTo(0, 0);
  document.body.className = "intro-page";
  document.querySelector("#app").innerHTML = `
    <main id="main-content" class="intro-shell">
      <section class="intro-copy" aria-labelledby="mission-title">
        <img class="brand brand--intro" src="${asset("logo-cecar.png")}" alt="CECAR - Corporaci&oacute;n Universitaria del Caribe" />
        <p class="mission-code">PROTOCOLO AF-87 / ACCESO RESTRINGIDO</p>
        <h1 id="mission-title">Libera el<br />esqueleto.</h1>
        <p class="intro-lead">El laboratorio de Anatom&iacute;a Funcional ha quedado bloqueado. Supera cinco pruebas sobre el esqueleto axial y apendicular para activar la salida.</p>
        <section class="participation-guide" aria-labelledby="participation-title">
          <div class="participation-guide__heading">
            <h2 id="participation-title">&iquest;C&oacute;mo participar?</h2>
            <p>Pon a prueba tus conocimientos y supera los diferentes desaf&iacute;os de la misi&oacute;n.</p>
          </div>
          <ol>
            <li><span>01</span><p><strong>Lee</strong> con atenci&oacute;n cada reto.</p></li>
            <li><span>02</span><p><strong>Analiza</strong> la informaci&oacute;n presentada.</p></li>
            <li><span>03</span><p><strong>Responde</strong> y registra tus resultados.</p></li>
            <li><span>04</span><p><strong>Avanza</strong> hasta completar la misi&oacute;n.</p></li>
          </ol>
        </section>
        <dl class="mission-facts">
          <div><dt>Duraci&oacute;n</dt><dd>45-60 min</dd></div>
          <div><dt>Modalidad</dt><dd>Individual</dd></div>
          <div><dt>Pruebas</dt><dd>5 estaciones</dd></div>
        </dl>
      </section>

      <section class="intake-panel" aria-labelledby="access-title">
        <div class="panel-index"><span>ACCESO</span><strong>01</strong></div>
        <div>
          <h2 id="access-title">Identifica tu muestra</h2>
          <p>Antes de comenzar, registra tus datos acad&eacute;micos. Estos acompa&ntilde;ar&aacute;n el reporte que recibe el docente.</p>
        </div>
        <form id="profile-form" class="intake-form">
          <label>
            Nombre completo
            <input name="name" autocomplete="name" maxlength="80" required placeholder="Escribe tu nombre" />
          </label>
          <label>
            Grupo o curso
            <input name="group" maxlength="40" required placeholder="Ej. Grupo 2A" />
          </label>
          <label>
            Asignatura
            <input name="subject" maxlength="80" required placeholder="Ej. Anatom&iacute;a Funcional" />
          </label>
          <label class="consent-row">
            <input type="checkbox" name="consent" />
            <span>Autorizo el env&iacute;o de mi resultado al docente al finalizar <b>(opcional)</b>.</span>
          </label>
          <button class="primary-action" type="submit">Iniciar misi&oacute;n ${icon("arrow")}</button>
          <button class="scoring-link" type="button" data-open-scoring>${icon("info")} &iquest;C&oacute;mo funcionan los puntos y las pistas?</button>
        </form>
        <p class="privacy-note">El progreso se guarda en este dispositivo. Durante la misi&oacute;n se registran los cambios de pesta&ntilde;a como interrupciones de sesi&oacute;n. No solicitamos documento ni correo.</p>
      </section>
    </main>`;

  document.querySelector("#profile-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    state = {
      ...emptyState(),
      profile: {
        name: data.get("name").trim(),
        group: data.get("group").trim(),
        subject: data.get("subject").trim(),
        shareConsent: data.get("consent") === "on",
      },
      sessionId: crypto.randomUUID(),
      startedAt: new Date().toISOString(),
    };
    persist();
    render();
  });
  document.querySelector("[data-open-scoring]").addEventListener("click", openScoringDialog);
}

function renderMission() {
  window.scrollTo(0, 0);
  document.body.className = "mission-page";
  const completedCount = state.completed.length;
  const progress = (completedCount / challengeMeta.length) * 100;
  const student = escapeHtml(state.profile.name.split(" ")[0]);
  document.querySelector("#app").innerHTML = `
    <header class="mission-header">
      <img class="brand" src="${asset("logo-cecar.png")}" alt="CECAR" />
      <div class="header-readouts" aria-label="Estado de la misi&oacute;n">
        <div><span>TIEMPO</span><strong id="timer">60:00</strong></div>
        <button class="score-readout" type="button" data-open-scoring aria-label="Puntaje ${state.score}. Ver c&oacute;mo funcionan los puntos y las pistas"><span>PUNTAJE ${icon("info")}</span><strong id="score">${state.score}</strong></button>
        <div><span>PROGRESO</span><strong>${completedCount}/5</strong></div>
      </div>
      <button class="quiet-button" id="reset-button" type="button" title="Reiniciar misi&oacute;n">${icon("reset")}<span>Reiniciar</span></button>
    </header>

    <main id="main-content" class="mission-workbench">
      <section class="mission-heading">
        <div>
          <p>EXPEDIENTE DE ${student.toUpperCase()}</p>
          <h1>Mesa de liberaci&oacute;n anat&oacute;mica</h1>
        </div>
        <p>Inspecciona cada compartimento en orden. Las respuestas abiertas quedar&aacute;n registradas para revisi&oacute;n docente.</p>
      </section>

      <section class="specimen-tray" aria-label="Mapa de retos">
        <div class="tray-scale" aria-hidden="true"><span>0</span><i></i><i></i><i></i><i></i><i></i><span>87</span></div>
        <div class="skeleton-stage">
          <img src="${asset("skeleton-mission.webp")}" alt="Ilustraci&oacute;n de referencia de un esqueleto humano, con el eje central en azul y las extremidades en coral" width="1024" height="1536" />
          <div class="system-legend" aria-label="Leyenda">
            <span><i class="axial-dot"></i>Axial</span>
            <span><i class="appendicular-dot"></i>Apendicular</span>
          </div>
        </div>
        <div class="challenge-stack">
          ${challengeMeta.map((challenge, index) => challengeButton(challenge, index)).join("")}
        </div>
        <div class="tray-footer">
          <span>MUESTRA 206</span>
          <div class="progress-track" aria-label="${progress}% completado"><i style="transform:scaleX(${progress / 100})"></i></div>
          <span>${completedCount === 5 ? "LISTA PARA LIBERAR" : "CADENA DE CUSTODIA ACTIVA"}</span>
        </div>
      </section>

      <aside class="field-note">
        <span>${icon("flask")}</span>
        <div><strong>Principio de orientaci&oacute;n</strong><p>Axial es el eje central que protege y sostiene. Apendicular son las cinturas y extremidades que hacen posible el movimiento.</p></div>
      </aside>

      ${completedCount === 5 ? `<button class="exit-control" id="exit-control" type="button"><span>Cinco cierres liberados</span><strong>Abrir salida ${icon("unlock")}</strong></button>` : ""}
    </main>

    <dialog class="challenge-dialog" id="challenge-dialog" aria-labelledby="dialog-title"></dialog>
    <div class="toast" id="toast" role="status" aria-live="polite"></div>`;

  document.querySelectorAll("[data-challenge]").forEach((button) => {
    button.addEventListener("click", () => openChallenge(Number(button.dataset.challenge)));
  });
  document.querySelector("#reset-button").addEventListener("click", openResetDialog);
  document.querySelector("[data-open-scoring]").addEventListener("click", openScoringDialog);
  document.querySelector("#exit-control")?.addEventListener("click", () => {
    state.finishedAt = new Date().toISOString();
    persist();
    render();
  });
  updateTimer();
  timerId = window.setInterval(updateTimer, 1000);
}

function hasActiveMission() {
  return Boolean(state.profile && !state.finishedAt);
}

function handleVisibilityChange() {
  if (!hasActiveMission()) {
    sessionHiddenAt = null;
    return;
  }

  if (document.visibilityState === "hidden") {
    if (sessionHiddenAt) return;
    sessionHiddenAt = Date.now();
    state.interruptions += 1;
    persist();
    return;
  }

  if (!sessionHiddenAt) return;
  const inactiveSeconds = Math.max(1, Math.round((Date.now() - sessionHiddenAt) / 1000));
  sessionHiddenAt = null;
  state.inactiveSeconds += inactiveSeconds;
  persist();
  showIntegrityDialog(inactiveSeconds);
}

function handleBeforeUnload(event) {
  if (!hasActiveMission()) return;
  event.preventDefault();
  event.returnValue = "";
}

function showIntegrityDialog(inactiveSeconds) {
  document.querySelector("#integrity-dialog")?.remove();
  const dialog = document.createElement("dialog");
  dialog.id = "integrity-dialog";
  dialog.className = "integrity-dialog";
  dialog.setAttribute("aria-labelledby", "integrity-title");
  dialog.setAttribute("aria-describedby", "integrity-description");
  dialog.innerHTML = `
    <div class="integrity-dialog__marker">${icon("info")}<span>SESI&Oacute;N</span></div>
    <div class="integrity-dialog__content">
      <p>CONTROL DE ACTIVIDAD</p>
      <h2 id="integrity-title">Interrupci&oacute;n registrada</h2>
      <p id="integrity-description">La misi&oacute;n estuvo fuera de pantalla durante <strong>${inactiveSeconds} ${inactiveSeconds === 1 ? "segundo" : "segundos"}</strong>.</p>
      <div class="integrity-dialog__detail"><span>${icon("clock")}</span><p>El cambio de pesta&ntilde;a y su duraci&oacute;n aproximada se incluir&aacute;n en el reporte para brindar contexto al docente.</p></div>
      <button class="primary-action" type="button" data-integrity-close>Continuar misi&oacute;n ${icon("arrow")}</button>
    </div>`;
  document.body.append(dialog);

  const close = () => {
    dialog.close();
    dialog.remove();
  };
  dialog.querySelector("[data-integrity-close]").addEventListener("click", close);
  dialog.addEventListener("cancel", (event) => {
    event.preventDefault();
    close();
  });
  dialog.showModal();
  dialog.querySelector("[data-integrity-close]").focus();
}

function openScoringDialog() {
  document.querySelector("#scoring-dialog")?.remove();
  const dialog = document.createElement("dialog");
  dialog.id = "scoring-dialog";
  dialog.className = "scoring-dialog";
  dialog.setAttribute("aria-labelledby", "scoring-title");
  dialog.setAttribute("aria-describedby", "scoring-description");
  dialog.innerHTML = `
    <div class="scoring-dialog__marker">${icon("info")}<span>REGLAS</span></div>
    <div class="scoring-dialog__content">
      <button class="icon-button scoring-dialog__close" type="button" data-scoring-close aria-label="Cerrar explicaci&oacute;n">${icon("close")}</button>
      <p>MARCADOR DE MISI&Oacute;N</p>
      <h2 id="scoring-title">Puntos y pistas</h2>
      <p id="scoring-description">Tu objetivo es completar las cinco estaciones conservando la mayor cantidad de puntos posible.</p>
      <dl class="scoring-rules">
        <div><dt><strong>1000</strong><span>Puntos iniciales</span></dt><dd>Comienzas la misi&oacute;n con el puntaje completo.</dd></div>
        <div><dt><strong>&minus;15</strong><span>Por intento incorrecto</span></dt><dd>Se descuenta al verificar un reto con respuestas incorrectas o incompletas.</dd></div>
        <div><dt><strong>&minus;20</strong><span>Por cada pista</span></dt><dd>Puedes solicitar una pista en cada estaci&oacute;n. Te orienta, pero no revela la respuesta.</dd></div>
      </dl>
      <div class="scoring-note"><span>${icon("clock")}</span><p><strong>El tiempo no descuenta puntos.</strong> Se registra para el reporte final y la actividad dura aproximadamente 45 a 60 minutos.</p></div>
      <p class="scoring-floor">El puntaje nunca baja de 0. Los intentos, las pistas y el resultado final quedan registrados para revisi&oacute;n docente.</p>
      <button class="primary-action" type="button" data-scoring-close>Entendido ${icon("check")}</button>
    </div>`;
  document.body.append(dialog);

  const close = () => {
    dialog.close();
    dialog.remove();
  };
  dialog.querySelectorAll("[data-scoring-close]").forEach((button) => button.addEventListener("click", close));
  dialog.addEventListener("cancel", (event) => {
    event.preventDefault();
    close();
  });
  dialog.showModal();
  dialog.querySelector("[data-scoring-close]").focus();
}

function challengeButton(challenge, index) {
  const isComplete = state.completed.includes(index);
  const isAvailable = index <= state.current;
  const status = isComplete ? "Superado" : isAvailable ? "Disponible" : "Bloqueado";
  const iconName = isComplete ? "check" : isAvailable ? "unlock" : "lock";
  return `
    <button class="challenge-slot ${isComplete ? "is-complete" : ""}" type="button" data-challenge="${index}" ${isAvailable ? "" : "disabled"}>
      <span class="slot-number">${String(index + 1).padStart(2, "0")}</span>
      <span class="slot-copy"><small>${challenge.specimen} / ${status}</small><strong>${challenge.short}</strong><span>${challenge.description}</span></span>
      <span class="slot-status">${icon(iconName)}</span>
    </button>`;
}

function updateTimer() {
  const timer = document.querySelector("#timer");
  if (!timer || !state.startedAt) return;
  const elapsed = Math.floor((Date.now() - new Date(state.startedAt).getTime()) / 1000);
  const remaining = Math.max(0, 3600 - elapsed);
  const minutes = Math.floor(remaining / 60).toString().padStart(2, "0");
  const seconds = (remaining % 60).toString().padStart(2, "0");
  timer.textContent = `${minutes}:${seconds}`;
  timer.closest("div").classList.toggle("is-alert", remaining <= 300);
}

function openResetDialog() {
  document.querySelector("#reset-dialog")?.remove();
  const dialog = document.createElement("dialog");
  dialog.id = "reset-dialog";
  dialog.className = "reset-dialog";
  dialog.setAttribute("aria-labelledby", "reset-title");
  dialog.setAttribute("aria-describedby", "reset-description");
  dialog.innerHTML = `
    <div class="reset-dialog__marker">${icon("reset")}<span>NUEVA SESI&Oacute;N</span></div>
    <div class="reset-dialog__content">
      <button class="icon-button reset-dialog__close" type="button" data-reset-cancel aria-label="Cerrar sin reiniciar">${icon("close")}</button>
      <p>CONTROL DE MISI&Oacute;N</p>
      <h2 id="reset-title">&iquest;Qu&eacute; quieres reiniciar?</h2>
      <p id="reset-description">Se eliminar&aacute;n el progreso, las respuestas, el puntaje y el tiempo de esta misi&oacute;n. Los resultados que ya se enviaron al docente no se borrar&aacute;n.</p>
      <div class="reset-options">
        <button class="reset-option reset-option--primary" type="button" data-reset-progress>
          <span>${icon("reset")}</span>
          <strong>Reiniciar los retos</strong>
          <small>Conserva a ${escapeHtml(state.profile?.name || "este estudiante")} y comienza desde la estaci&oacute;n 1.</small>
        </button>
        <button class="reset-option" type="button" data-reset-all>
          <span>${icon("close")}</span>
          <strong>Cambiar de estudiante</strong>
          <small>Borra la identificaci&oacute;n actual y vuelve a la pantalla de acceso.</small>
        </button>
      </div>
      <button class="text-button reset-cancel" type="button" data-reset-cancel>Continuar la misi&oacute;n actual</button>
    </div>`;
  document.body.append(dialog);

  const close = () => {
    dialog.close();
    dialog.remove();
  };
  dialog.querySelectorAll("[data-reset-cancel]").forEach((button) => button.addEventListener("click", close));
  dialog.querySelector("[data-reset-progress]").addEventListener("click", () => resetMission(true));
  dialog.querySelector("[data-reset-all]").addEventListener("click", () => resetMission(false));
  dialog.addEventListener("cancel", (event) => {
    event.preventDefault();
    close();
  });
  dialog.showModal();
  dialog.querySelector("[data-reset-cancel]").focus();
}

function resetMission(keepProfile) {
  const profile = keepProfile ? state.profile : null;
  state = {
    ...emptyState(),
    profile,
    sessionId: profile ? crypto.randomUUID() : null,
    startedAt: profile ? new Date().toISOString() : null,
  };
  persist();
  document.querySelector("#reset-dialog")?.remove();
  render();
}

function openChallenge(index) {
  if (index > state.current) return;
  const dialog = document.querySelector("#challenge-dialog");
  const isWizard = index >= 0 && index <= 4;
  dialog.classList.toggle("challenge-dialog--wizard", isWizard);
  dialog.innerHTML = `
    <div class="dialog-rail">
      <span>ESTACI&Oacute;N</span><strong>${String(index + 1).padStart(2, "0")}</strong><i></i><small>${challengeMeta[index].specimen}</small>
    </div>
    <div class="dialog-body ${isWizard ? "dialog-body--wizard" : ""}">
      <header class="dialog-header">
        <div><p>${challengeMeta[index].title}</p><h2 id="dialog-title">${challengeMeta[index].short}</h2></div>
        <button class="icon-button" data-close type="button" aria-label="Cerrar reto">${icon("close")}</button>
      </header>
      <div class="challenge-content">${state.completed.includes(index) ? renderCompletedChallenge(index) : renderChallenge(index)}</div>
    </div>`;
  dialog.querySelectorAll("[data-close]").forEach((button) => button.addEventListener("click", () => dialog.close()));
  const form = dialog.querySelector("form");
  if (form) {
    restoreDraft(index, form);
    if (index === 0) initializeClassificationWizard(form);
    if (index === 1) initializeRegionWizard(form);
    if (index === 2) initializeMovementWizard(form);
    if (index === 3) initializeMysteryWizard(form);
    if (index === 4) initializeFinalWizard(form);
    form.addEventListener("submit", (event) => validateChallenge(event, index));
    form.addEventListener("input", () => saveDraft(index, form));
    form.addEventListener("change", () => saveDraft(index, form));
    dialog.querySelector("[data-hint]")?.addEventListener("click", () => revealHint(index));
  }
  dialog.showModal();
  if (isWizard) dialog.querySelector('[data-wizard-slide]:not([hidden]) h3, [data-wizard-slide]:not([hidden]) textarea')?.focus();
}

function renderCompletedChallenge(index) {
  const codes = ["37", "EFB", "MOV", "FEEVO", "SALIDA"];
  return `<div class="completed-summary">
    <div class="seal-mark">${icon("check")}</div>
    <p>ESTACI&Oacute;N VERIFICADA</p>
    <h3>${challengeMeta[index].title}</h3>
    <span>C&oacute;digo ${codes[index]} registrado. Las respuestas ya forman parte del reporte final.</span>
    <button class="secondary-action" data-close type="button">Volver a la mesa</button>
  </div>`;
}

function saveDraft(index, form) {
  const draft = {};
  for (const [name, value] of new FormData(form).entries()) {
    if (draft[name] === undefined) draft[name] = value;
    else draft[name] = Array.isArray(draft[name]) ? [...draft[name], value] : [draft[name], value];
  }
  state.drafts[index] = draft;
  persist();
}

function restoreDraft(index, form) {
  const draft = state.drafts[index];
  if (!draft) return;
  for (const element of form.elements) {
    if (!element.name || draft[element.name] === undefined) continue;
    const saved = draft[element.name];
    if (element.type === "checkbox") element.checked = (Array.isArray(saved) ? saved : [saved]).includes(element.value);
    else if (element.type === "radio") element.checked = saved === element.value;
    else element.value = saved;
  }
}

function challengeActions(index) {
  const used = state.hintUsed.includes(index);
  return `<div class="challenge-actions">
    <button class="hint-button" data-hint type="button" ${used ? "disabled" : ""}>${icon("hint")}${used ? "Pista utilizada" : "Solicitar pista (-20)"}</button>
    <button class="primary-action" type="submit">Verificar protocolo ${icon("arrow")}</button>
  </div><div class="form-feedback" role="alert" aria-live="assertive"></div>`;
}

function renderChallenge(index) {
  if (index === 0) return renderClassification();
  if (index === 1) return renderRegions();
  if (index === 2) return renderMovement();
  if (index === 3) return renderMysteries();
  return renderFinalCase();
}

function renderClassification() {
  return `<form class="classification-wizard" data-classification-wizard novalidate>
    <input type="hidden" name="wizard-step" value="0" />
    <div class="wizard-progress" aria-live="polite">
      <div><span data-wizard-label>Muestra 1 de 12</span><strong data-wizard-count>1/12</strong></div>
      <div class="wizard-progress__track" role="progressbar" aria-label="Progreso de clasificaci&oacute;n" aria-valuemin="1" aria-valuemax="12" aria-valuenow="1" data-wizard-progressbar><i data-wizard-progress></i></div>
    </div>
    <div class="wizard-slides">
      ${classificationItems.map(([number, bone, , slug], index) => `<section class="wizard-slide" data-wizard-slide="${index}" data-row="${number}" aria-labelledby="bone-question-${number}" ${index === 0 ? "" : "hidden"}>
        <figure class="specimen-visual">
          <img ${index === 0 ? `src="${asset(`bones/${slug}.webp`)}"` : ""} data-src="${asset(`bones/${slug}.webp`)}" width="640" height="640" alt="Vista anat&oacute;mica del hueso ${bone}" />
          <figcaption><span>MUESTRA ${String(number).padStart(2, "0")}</span><small>Vista anat&oacute;mica de referencia</small></figcaption>
        </figure>
        <div class="wizard-question">
          <p>CLASIFICACI&Oacute;N DEL SISTEMA</p>
          <h3 id="bone-question-${number}" tabindex="-1">&iquest;El ${bone.toLowerCase()} pertenece al esqueleto axial o apendicular?</h3>
          <p class="wizard-question__help">Observa su forma y recuerda en qu&eacute; regi&oacute;n del cuerpo se encuentra.</p>
          <div class="wizard-choices" role="radiogroup" aria-labelledby="bone-question-${number}">
            <label><input type="radio" name="bone-${number}" value="axial" /><span><b>Axial</b><small>Eje central, cr&aacute;neo, columna o caja tor&aacute;cica</small></span></label>
            <label><input type="radio" name="bone-${number}" value="appendicular" /><span><b>Apendicular</b><small>Cinturas o extremidades superiores e inferiores</small></span></label>
          </div>
          <div class="wizard-answer-status" role="status">Selecciona una opci&oacute;n para continuar.</div>
        </div>
      </section>`).join("")}
      <section class="wizard-slide wizard-slide--final" data-wizard-slide="12" hidden>
        <div class="wizard-final">
          <span>CIERRE DEL PROTOCOLO</span>
          <h3 tabindex="-1">Explica tu criterio anat&oacute;mico.</h3>
          <p>Ya clasificaste las doce muestras. Resume c&oacute;mo distingues el eje central de las cinturas y extremidades.</p>
          <label class="long-answer">Justificaci&oacute;n anat&oacute;mica<textarea name="reason" rows="4" minlength="30" required placeholder="El esqueleto axial... mientras que el apendicular..."></textarea></label>
          <div class="wizard-summary"><strong data-wizard-answered>0</strong><span>de 12 muestras respondidas</span></div>
        </div>
      </section>
    </div>
    <div class="hint-panel" hidden>Piensa en el eje central: cr&aacute;neo, columna y caja tor&aacute;cica. Las cinturas y extremidades se proyectan desde ese eje.</div>
    <div class="wizard-controls">
      <button class="secondary-action" data-wizard-back type="button">Anterior</button>
      <button class="hint-button" data-hint type="button" ${state.hintUsed.includes(0) ? "disabled" : ""}>${icon("hint")}${state.hintUsed.includes(0) ? "Pista utilizada" : "Solicitar pista (-20)"}</button>
      <button class="primary-action" data-wizard-next type="button">Siguiente muestra ${icon("arrow")}</button>
    </div>
    <div class="form-feedback" role="alert" aria-live="assertive"></div>
  </form>`;
}

function initializeClassificationWizard(form) {
  const lastQuestion = classificationItems.length - 1;
  const finalStep = classificationItems.length;
  const nextButton = form.querySelector("[data-wizard-next]");
  const backButton = form.querySelector("[data-wizard-back]");

  const showStep = (requestedStep) => {
    const step = Math.max(0, Math.min(finalStep, requestedStep));
    form.elements["wizard-step"].value = String(step);
    form.querySelectorAll("[data-wizard-slide]").forEach((slide) => {
      slide.hidden = Number(slide.dataset.wizardSlide) !== step;
    });
    const activeSlide = form.querySelector(`[data-wizard-slide="${step}"]`);
    const image = activeSlide.querySelector("img[data-src]");
    if (image && !image.src) image.src = image.dataset.src;
    const nextImage = form.querySelector(`[data-wizard-slide="${Math.min(lastQuestion, step + 1)}"] img[data-src]`);
    if (nextImage && !nextImage.src) nextImage.src = nextImage.dataset.src;

    const isFinal = step === finalStep;
    const selected = isFinal ? null : new FormData(form).get(`bone-${step + 1}`);
    form.querySelector("[data-wizard-label]").textContent = isFinal ? "Justificaci\u00f3n final" : `Muestra ${step + 1} de 12`;
    form.querySelector("[data-wizard-count]").textContent = isFinal ? "12/12" : `${step + 1}/12`;
    form.querySelector("[data-wizard-progress]").style.transform = `scaleX(${isFinal ? 1 : (step + 1) / 12})`;
    form.querySelector("[data-wizard-progressbar]").setAttribute("aria-valuenow", String(isFinal ? 12 : step + 1));
    backButton.disabled = step === 0;
    nextButton.type = isFinal ? "submit" : "button";
    nextButton.innerHTML = isFinal ? `Verificar reto ${icon("check")}` : `Siguiente muestra ${icon("arrow")}`;
    nextButton.disabled = !isFinal && !selected;
    if (!isFinal) activeSlide.querySelector(".wizard-answer-status").textContent = selected ? `${selected === "axial" ? "Axial" : "Apendicular"} seleccionado. Puedes continuar.` : "Selecciona una opci\u00f3n para continuar.";
    form.querySelector("[data-wizard-answered]").textContent = classificationItems.filter(([number]) => new FormData(form).get(`bone-${number}`)).length;
    saveDraft(0, form);
    activeSlide.scrollTop = 0;
    activeSlide.querySelector(".wizard-question")?.scrollTo(0, 0);
    activeSlide.querySelector("h3, textarea")?.focus({ preventScroll: true });
  };

  form.showClassificationStep = showStep;
  form.querySelectorAll('.wizard-choices input[type="radio"]').forEach((radio) => {
    radio.addEventListener("change", () => {
      const slide = radio.closest(".wizard-slide");
      markInvalid(slide, false);
      slide.querySelector(".wizard-answer-status").textContent = `${radio.value === "axial" ? "Axial" : "Apendicular"} seleccionado. Puedes continuar.`;
      nextButton.disabled = false;
    });
  });
  backButton.addEventListener("click", () => showStep(Number(form.elements["wizard-step"].value) - 1));
  nextButton.addEventListener("click", () => {
    if (nextButton.type === "submit") return;
    const step = Number(form.elements["wizard-step"].value);
    if (!new FormData(form).get(`bone-${step + 1}`)) return;
    showStep(step + 1);
  });
  showStep(Number(form.elements["wizard-step"].value) || 0);
}

function renderRegions() {
  return `<form class="region-wizard" data-region-wizard novalidate>
    <input type="hidden" name="region-step" value="0" />
    <div class="wizard-progress" aria-live="polite">
      <div><span data-region-label>Regi&oacute;n 1 de 7</span><strong data-region-count>1/7</strong></div>
      <div class="wizard-progress__track" role="progressbar" aria-label="Progreso de cartograf&iacute;a corporal" aria-valuemin="1" aria-valuemax="7" aria-valuenow="1" data-region-progressbar><i data-region-progress></i></div>
    </div>
    <div class="wizard-slides">
      ${regions.map(([region], index) => `<section class="wizard-slide region-slide" data-wizard-slide="${index}" data-row="${index}" aria-labelledby="region-question-${index}" ${index === 0 ? "" : "hidden"}>
        <div class="region-evidence">
          <div class="region-evidence__index"><span>REGI&Oacute;N CORPORAL</span><strong>${String(index + 1).padStart(2, "0")}</strong></div>
          <h2 class="region-evidence__name">${region}</h2>
          <p class="region-evidence__hint">Identifica el conjunto &oacute;seo que pertenece a esta regi&oacute;n del cuerpo.</p>
        </div>
        <div class="region-question">
          <p>CARTOGRAF&Iacute;A CORPORAL</p>
          <h3 id="region-question-${index}" tabindex="-1">&iquest;Qu&eacute; conjunto &oacute;seo forma esta regi&oacute;n?</h3>
          <p class="region-question__help">Cada conjunto se usa una sola vez en toda la estaci&oacute;n.</p>
          <div class="region-options" role="radiogroup" aria-labelledby="region-question-${index}">
            ${regionSets.map(([code, bones]) => `<label><input type="radio" name="region-${index}" value="${code}" /><span><b>${code}</b><small>${bones}</small></span></label>`).join("")}
          </div>
          <div class="region-answer-status" role="status">Selecciona un conjunto para continuar.</div>
        </div>
      </section>`).join("")}
      <section class="wizard-slide wizard-slide--final" data-wizard-slide="7" hidden>
        <div class="wizard-final region-review">
          <span>REVISI&Oacute;N DEL MAPA</span>
          <h3 tabindex="-1">Confirma tus siete regiones.</h3>
          <p>Comprueba que cada regi&oacute;n tenga un conjunto &oacute;seo distinto antes de verificar.</p>
          <div class="region-review__list">
            ${regions.map(([region], index) => `<div><span>${String(index + 1).padStart(2, "0")}</span><b>${region}</b><small data-review-region="${index}">Sin asignar</small></div>`).join("")}
          </div>
          <div class="wizard-summary"><strong data-region-answered>0</strong><span>de 7 regiones asignadas</span></div>
        </div>
      </section>
    </div>
    <div class="hint-panel" hidden>Empieza por los conjuntos inequ&iacute;vocos: estern&oacute;n y costillas forman el t&oacute;rax; v&eacute;rtebras, sacro y c&oacute;ccix forman la columna.</div>
    <div class="wizard-controls">
      <button class="secondary-action" data-region-back type="button">Anterior</button>
      <button class="hint-button" data-hint type="button" ${state.hintUsed.includes(1) ? "disabled" : ""}>${icon("hint")}${state.hintUsed.includes(1) ? "Pista utilizada" : "Solicitar pista (-20)"}</button>
      <button class="primary-action" data-region-next type="button">Siguiente regi&oacute;n ${icon("arrow")}</button>
    </div>
    <div class="form-feedback" role="alert" aria-live="assertive"></div>
  </form>`;
}

function initializeRegionWizard(form) {
  const finalStep = regions.length;
  const setLabel = Object.fromEntries(regionSets);
  const nextButton = form.querySelector("[data-region-next]");
  const backButton = form.querySelector("[data-region-back]");
  const isComplete = (step) => Boolean(new FormData(form).get(`region-${step}`));

  const showStep = (requestedStep) => {
    const step = Math.max(0, Math.min(finalStep, requestedStep));
    form.elements["region-step"].value = String(step);
    form.querySelectorAll("[data-wizard-slide]").forEach((slide) => {
      slide.hidden = Number(slide.dataset.wizardSlide) !== step;
    });
    const activeSlide = form.querySelector(`[data-wizard-slide="${step}"]`);
    const isFinal = step === finalStep;
    form.querySelector("[data-region-label]").textContent = isFinal ? "Revisi\u00f3n final" : `Regi\u00f3n ${step + 1} de 7`;
    form.querySelector("[data-region-count]").textContent = isFinal ? "7/7" : `${step + 1}/7`;
    form.querySelector("[data-region-progress]").style.transform = `scaleX(${isFinal ? 1 : (step + 1) / 7})`;
    form.querySelector("[data-region-progressbar]").setAttribute("aria-valuenow", String(isFinal ? 7 : step + 1));
    backButton.disabled = step === 0;
    nextButton.type = isFinal ? "submit" : "button";
    nextButton.innerHTML = isFinal ? `Verificar reto ${icon("check")}` : `Siguiente regi\u00f3n ${icon("arrow")}`;
    nextButton.disabled = !isFinal && !isComplete(step);

    if (!isFinal) {
      activeSlide.querySelector(".region-answer-status").textContent = isComplete(step) ? "Conjunto seleccionado. Puedes continuar." : "Selecciona un conjunto para continuar.";
    }
    regions.forEach((_, index) => {
      const value = new FormData(form).get(`region-${index}`);
      form.querySelector(`[data-review-region="${index}"]`).textContent = value ? `${value} \u00b7 ${setLabel[value]}` : "Sin asignar";
    });
    form.querySelector("[data-region-answered]").textContent = regions.filter((_, index) => isComplete(index)).length;
    saveDraft(1, form);
    activeSlide.scrollTop = 0;
    activeSlide.querySelector(".region-question")?.scrollTo(0, 0);
    activeSlide.querySelector("h3, input")?.focus({ preventScroll: true });
  };

  form.showRegionStep = showStep;
  form.querySelectorAll('.region-options input[type="radio"]').forEach((radio) => {
    radio.addEventListener("change", () => {
      const slide = radio.closest(".region-slide");
      const step = Number(slide.dataset.wizardSlide);
      markInvalid(slide, false);
      slide.querySelector(".region-answer-status").textContent = "Conjunto seleccionado. Puedes continuar.";
      nextButton.disabled = !isComplete(step);
    });
  });
  backButton.addEventListener("click", () => showStep(Number(form.elements["region-step"].value) - 1));
  nextButton.addEventListener("click", () => {
    if (nextButton.type === "submit") return;
    const step = Number(form.elements["region-step"].value);
    if (!isComplete(step)) return;
    showStep(step + 1);
  });
  showStep(Number(form.elements["region-step"].value) || 0);
}

function renderMovement() {
  return `<form class="movement-wizard" data-movement-wizard novalidate>
    <input type="hidden" name="movement-step" value="0" />
    <div class="wizard-progress" aria-live="polite">
      <div><span data-movement-label>Caso 1 de 4</span><strong data-movement-count>1/4</strong></div>
      <div class="wizard-progress__track" role="progressbar" aria-label="Progreso de anatom&iacute;a funcional" aria-valuemin="1" aria-valuemax="4" aria-valuenow="1" data-movement-progressbar><i data-movement-progress></i></div>
    </div>
    <div class="wizard-slides">
      ${movementCases.map((item, index) => `<section class="wizard-slide movement-slide" data-wizard-slide="${index}" data-case="${item.id}" aria-labelledby="movement-question-${item.id}" ${index === 0 ? "" : "hidden"}>
        <figure class="specimen-visual movement-visual">
          <img ${index === 0 ? `src="${asset(`movement-cases/${item.image}.webp`)}"` : ""} data-src="${asset(`movement-cases/${item.image}.webp`)}" width="640" height="640" alt="Situaci&oacute;n funcional: ${item.title}" />
          <figcaption><span>CASO ${String(index + 1).padStart(2, "0")}</span><small>${item.title}</small></figcaption>
        </figure>
        <div class="movement-question">
          <p>AN&Aacute;LISIS BIOMEC&Aacute;NICO</p>
          <h3 id="movement-question-${item.id}" tabindex="-1">${item.title}</h3>
          <p class="movement-question__help">${item.prompt}</p>
          <fieldset class="movement-options">
            <legend>Selecciona todos los huesos pertinentes</legend>
            <div>${item.options.map((option) => `<label><input type="checkbox" name="${item.id}" value="${option}" /><span class="movement-option-visual"><img src="${asset(`bones/${movementBoneImages[option]}.webp`)}" width="640" height="640" alt="" loading="lazy" /><b>${option}</b><i aria-hidden="true">${icon("check")}</i></span></label>`).join("")}</div>
          </fieldset>
          <div class="movement-answer-status" role="status">Selecciona al menos una estructura para continuar.</div>
        </div>
      </section>`).join("")}
      <section class="wizard-slide wizard-slide--final" data-wizard-slide="4" hidden>
        <div class="wizard-final">
          <span>CIERRE DEL AN&Aacute;LISIS</span>
          <h3 tabindex="-1">Explica una cadena funcional.</h3>
          <p>Elige uno de los cuatro casos y relaciona la acci&oacute;n con los huesos que seleccionaste.</p>
          <label class="long-answer">Mini-desaf&iacute;o<textarea name="reason" rows="4" minlength="35" required placeholder="En el caso de... estos huesos son relevantes porque..."></textarea></label>
          <div class="wizard-summary"><strong data-movement-answered>0</strong><span>de 4 casos respondidos</span></div>
        </div>
      </section>
    </div>
    <div class="hint-panel" hidden>Relaciona la ubicaci&oacute;n con la funci&oacute;n: el salto concentra carga en el miembro inferior; la caja tor&aacute;cica protege; la columna sostiene y transmite fuerzas.</div>
    <div class="wizard-controls">
      <button class="secondary-action" data-movement-back type="button">Anterior</button>
      <button class="hint-button" data-hint type="button" ${state.hintUsed.includes(2) ? "disabled" : ""}>${icon("hint")}${state.hintUsed.includes(2) ? "Pista utilizada" : "Solicitar pista (-20)"}</button>
      <button class="primary-action" data-movement-next type="button">Siguiente caso ${icon("arrow")}</button>
    </div>
    <div class="form-feedback" role="alert" aria-live="assertive"></div>
  </form>`;
}

function initializeMovementWizard(form) {
  const finalStep = movementCases.length;
  const nextButton = form.querySelector("[data-movement-next]");
  const backButton = form.querySelector("[data-movement-back]");

  const showStep = (requestedStep) => {
    const step = Math.max(0, Math.min(finalStep, requestedStep));
    form.elements["movement-step"].value = String(step);
    form.querySelectorAll("[data-wizard-slide]").forEach((slide) => {
      slide.hidden = Number(slide.dataset.wizardSlide) !== step;
    });
    const activeSlide = form.querySelector(`[data-wizard-slide="${step}"]`);
    const image = activeSlide.querySelector("img[data-src]");
    if (image && !image.src) image.src = image.dataset.src;
    const nextImage = form.querySelector(`[data-wizard-slide="${Math.min(finalStep - 1, step + 1)}"] img[data-src]`);
    if (nextImage && !nextImage.src) nextImage.src = nextImage.dataset.src;

    const isFinal = step === finalStep;
    const selected = isFinal ? [] : new FormData(form).getAll(movementCases[step].id);
    form.querySelector("[data-movement-label]").textContent = isFinal ? "Justificaci\u00f3n final" : `Caso ${step + 1} de 4`;
    form.querySelector("[data-movement-count]").textContent = isFinal ? "4/4" : `${step + 1}/4`;
    form.querySelector("[data-movement-progress]").style.transform = `scaleX(${isFinal ? 1 : (step + 1) / 4})`;
    form.querySelector("[data-movement-progressbar]").setAttribute("aria-valuenow", String(isFinal ? 4 : step + 1));
    backButton.disabled = step === 0;
    nextButton.type = isFinal ? "submit" : "button";
    nextButton.innerHTML = isFinal ? `Verificar reto ${icon("check")}` : `Siguiente caso ${icon("arrow")}`;
    nextButton.disabled = !isFinal && selected.length === 0;
    if (!isFinal) activeSlide.querySelector(".movement-answer-status").textContent = selected.length ? `${selected.length} ${selected.length === 1 ? "estructura seleccionada" : "estructuras seleccionadas"}. Puedes continuar.` : "Selecciona al menos una estructura para continuar.";
    form.querySelector("[data-movement-answered]").textContent = movementCases.filter((item) => new FormData(form).getAll(item.id).length > 0).length;
    saveDraft(2, form);
    activeSlide.scrollTop = 0;
    activeSlide.querySelector(".movement-question")?.scrollTo(0, 0);
    activeSlide.querySelector("h3, textarea")?.focus({ preventScroll: true });
  };

  form.showMovementStep = showStep;
  form.querySelectorAll('.movement-options input[type="checkbox"]').forEach((checkbox) => {
    checkbox.addEventListener("change", () => {
      const slide = checkbox.closest(".movement-slide");
      const selected = new FormData(form).getAll(slide.dataset.case);
      markInvalid(slide, false);
      slide.querySelector(".movement-answer-status").textContent = selected.length ? `${selected.length} ${selected.length === 1 ? "estructura seleccionada" : "estructuras seleccionadas"}. Puedes continuar.` : "Selecciona al menos una estructura para continuar.";
      nextButton.disabled = selected.length === 0;
    });
  });
  backButton.addEventListener("click", () => showStep(Number(form.elements["movement-step"].value) - 1));
  nextButton.addEventListener("click", () => {
    if (nextButton.type === "submit") return;
    const step = Number(form.elements["movement-step"].value);
    if (new FormData(form).getAll(movementCases[step].id).length === 0) return;
    showStep(step + 1);
  });
  showStep(Number(form.elements["movement-step"].value) || 0);
}

function renderMysteries() {
  return `<form class="mystery-wizard" data-mystery-wizard novalidate>
    <input type="hidden" name="mystery-step" value="0" />
    <div class="wizard-progress" aria-live="polite">
      <div><span data-mystery-label>Pista 1 de 5</span><strong data-mystery-count>1/5</strong></div>
      <div class="wizard-progress__track" role="progressbar" aria-label="Progreso de identificaci&oacute;n" aria-valuemin="1" aria-valuemax="5" aria-valuenow="1" data-mystery-progressbar><i data-mystery-progress></i></div>
    </div>
    <div class="wizard-slides">
      ${mysteries.map((item, index) => `<section class="wizard-slide mystery-slide" data-wizard-slide="${index}" data-row="${index}" aria-labelledby="mystery-question-${index}" ${index === 0 ? "" : "hidden"}>
        <div class="mystery-evidence">
          <div class="mystery-evidence__index"><span>FICHA SIN ETIQUETA</span><strong>${String(index + 1).padStart(2, "0")}</strong></div>
          <blockquote>${item.clue}</blockquote>
          <div class="mystery-evidence__keys"><span>UBICACI&Oacute;N</span><span>FORMA</span><span>FUNCI&Oacute;N</span></div>
        </div>
        <div class="mystery-question">
          <p>PROTOCOLO DE IDENTIFICACI&Oacute;N</p>
          <h3 id="mystery-question-${index}" tabindex="-1">&iquest;Qu&eacute; hueso describe la pista?</h3>
          <ol class="mystery-instructions" aria-label="Pasos para responder">
            <li><b>1</b><span>Lee la pista y localiza la regi&oacute;n corporal.</span></li>
            <li><b>2</b><span>Escribe el nombre del hueso en singular.</span></li>
            <li><b>3</b><span>Indica si pertenece al sistema axial o apendicular.</span></li>
          </ol>
          <label class="mystery-name">Nombre del hueso<input name="mystery-${index}" autocomplete="off" required placeholder="Ejemplo: f&eacute;mur" /></label>
          <fieldset class="mystery-system">
            <legend>Sistema esquel&eacute;tico</legend>
            <div>
              <label><input type="radio" name="system-${index}" value="axial" /><span><b>Axial</b><small>Eje central del cuerpo</small></span></label>
              <label><input type="radio" name="system-${index}" value="appendicular" /><span><b>Apendicular</b><small>Cinturas y extremidades</small></span></label>
            </div>
          </fieldset>
          <div class="mystery-answer-status" role="status">Completa el nombre y el sistema para continuar.</div>
        </div>
      </section>`).join("")}
      <section class="wizard-slide wizard-slide--final" data-wizard-slide="5" hidden>
        <div class="wizard-final mystery-review">
          <span>REVISI&Oacute;N DE IDENTIFICACIONES</span>
          <h3 tabindex="-1">Confirma tus cinco fichas.</h3>
          <p>Comprueba que cada nombre coincida con la pista y que su sistema esquel&eacute;tico sea correcto antes de verificar.</p>
          <div class="mystery-review__list">
            ${mysteries.map((_, index) => `<div><span>${String(index + 1).padStart(2, "0")}</span><b data-review-bone="${index}">Sin responder</b><small data-review-system="${index}">Sistema pendiente</small></div>`).join("")}
          </div>
          <div class="wizard-summary"><strong data-mystery-answered>0</strong><span>de 5 fichas completas</span></div>
        </div>
      </section>
    </div>
    <div class="hint-panel" hidden>Las iniciales de las respuestas forman F-E-E-V-O. Revisa que cada nombre coincida con la ubicaci&oacute;n descrita.</div>
    <div class="wizard-controls">
      <button class="secondary-action" data-mystery-back type="button">Anterior</button>
      <button class="hint-button" data-hint type="button" ${state.hintUsed.includes(3) ? "disabled" : ""}>${icon("hint")}${state.hintUsed.includes(3) ? "Pista utilizada" : "Solicitar pista (-20)"}</button>
      <button class="primary-action" data-mystery-next type="button">Siguiente pista ${icon("arrow")}</button>
    </div>
    <div class="form-feedback" role="alert" aria-live="assertive"></div>
  </form>`;
}

function initializeMysteryWizard(form) {
  const finalStep = mysteries.length;
  const nextButton = form.querySelector("[data-mystery-next]");
  const backButton = form.querySelector("[data-mystery-back]");
  const isComplete = (step) => form.elements[`mystery-${step}`].value.trim() && new FormData(form).get(`system-${step}`);

  const showStep = (requestedStep) => {
    const step = Math.max(0, Math.min(finalStep, requestedStep));
    form.elements["mystery-step"].value = String(step);
    form.querySelectorAll("[data-wizard-slide]").forEach((slide) => {
      slide.hidden = Number(slide.dataset.wizardSlide) !== step;
    });
    const activeSlide = form.querySelector(`[data-wizard-slide="${step}"]`);
    const isFinal = step === finalStep;
    form.querySelector("[data-mystery-label]").textContent = isFinal ? "Revisi\u00f3n final" : `Pista ${step + 1} de 5`;
    form.querySelector("[data-mystery-count]").textContent = isFinal ? "5/5" : `${step + 1}/5`;
    form.querySelector("[data-mystery-progress]").style.transform = `scaleX(${isFinal ? 1 : (step + 1) / 5})`;
    form.querySelector("[data-mystery-progressbar]").setAttribute("aria-valuenow", String(isFinal ? 5 : step + 1));
    backButton.disabled = step === 0;
    nextButton.type = isFinal ? "submit" : "button";
    nextButton.innerHTML = isFinal ? `Verificar reto ${icon("check")}` : `Siguiente pista ${icon("arrow")}`;
    nextButton.disabled = !isFinal && !isComplete(step);

    if (!isFinal) {
      activeSlide.querySelector(".mystery-answer-status").textContent = isComplete(step) ? "Identificaci\u00f3n completa. Puedes continuar." : "Completa el nombre y el sistema para continuar.";
    }
    mysteries.forEach((_, index) => {
      const bone = form.elements[`mystery-${index}`].value.trim();
      const system = new FormData(form).get(`system-${index}`);
      form.querySelector(`[data-review-bone="${index}"]`).textContent = bone || "Sin responder";
      form.querySelector(`[data-review-system="${index}"]`).textContent = system ? (system === "axial" ? "Sistema axial" : "Sistema apendicular") : "Sistema pendiente";
    });
    form.querySelector("[data-mystery-answered]").textContent = mysteries.filter((_, index) => isComplete(index)).length;
    saveDraft(3, form);
    activeSlide.scrollTop = 0;
    activeSlide.querySelector(".mystery-question")?.scrollTo(0, 0);
    activeSlide.querySelector("h3, input")?.focus({ preventScroll: true });
  };

  form.showMysteryStep = showStep;
  form.querySelectorAll('.mystery-name input, .mystery-system input[type="radio"]').forEach((control) => {
    control.addEventListener("input", () => {
      const slide = control.closest(".mystery-slide");
      const step = Number(slide.dataset.wizardSlide);
      markInvalid(slide, false);
      slide.querySelector(".mystery-answer-status").textContent = isComplete(step) ? "Identificaci\u00f3n completa. Puedes continuar." : "Completa el nombre y el sistema para continuar.";
      nextButton.disabled = !isComplete(step);
    });
  });
  backButton.addEventListener("click", () => showStep(Number(form.elements["mystery-step"].value) - 1));
  nextButton.addEventListener("click", () => {
    if (nextButton.type === "submit") return;
    const step = Number(form.elements["mystery-step"].value);
    if (!isComplete(step)) return;
    showStep(step + 1);
  });
  showStep(Number(form.elements["mystery-step"].value) || 0);
}

const finalComponents = [
  { key: "axial", type: "input", label: "Dos huesos axiales importantes para la postura", placeholder: "Separados por coma", help: "Piensa en el eje central que sostiene el tronco." },
  { key: "appendicular", type: "input", label: "Tres huesos apendiculares del miembro inferior", placeholder: "Separados por coma", help: "Recorre la extremidad desde el muslo hasta el pie." },
  { key: "connector", type: "input", label: "Estructura que une el miembro inferior al esqueleto axial", placeholder: "Una estructura", help: "Transfiere la carga del eje hacia las piernas." },
  { key: "load", type: "input", label: "Hueso que recibe la carga entre f\u00e9mur y tobillo", placeholder: "Un hueso", help: "Es el principal hueso de carga de la pierna." },
  { key: "reason", type: "textarea", label: "\u00bfPor qu\u00e9 clasificar los huesos ayuda a analizar el movimiento?", minlength: 45, help: "Relaciona estructura, funci\u00f3n y movimiento (m\u00ednimo 45 caracteres)." },
  { key: "phrase", type: "textarea", label: "Construye la frase de salida", help: "Incluye: axial, apendicular, movimiento y protecci\u00f3n." },
];

function renderFinalCase() {
  return `<form class="final-wizard" data-final-wizard novalidate>
    <input type="hidden" name="final-step" value="0" />
    <div class="wizard-progress" aria-live="polite">
      <div><span data-final-label>Componente 1 de 6</span><strong data-final-count>1/6</strong></div>
      <div class="wizard-progress__track" role="progressbar" aria-label="Progreso del caso deportivo" aria-valuemin="1" aria-valuemax="6" aria-valuenow="1" data-final-progressbar><i data-final-progress></i></div>
    </div>
    <div class="wizard-slides">
      ${finalComponents.map((step, index) => `<section class="wizard-slide final-slide" data-wizard-slide="${index}" data-row="${step.key}" aria-labelledby="final-question-${index}" ${index === 0 ? "" : "hidden"}>
        <figure class="specimen-visual final-visual">
          <img src="${asset("movement-cases/salto-aterrizaje.webp")}" width="640" height="640" alt="Caso deportivo: an&aacute;lisis de un salto vertical" />
          <figcaption><span>CASO / SALTO VERTICAL</span><small>Componente ${index + 1} de 6</small></figcaption>
        </figure>
        <div class="final-question">
          <p>PROTOCOLO DE SALIDA</p>
          <h3 id="final-question-${index}" tabindex="-1">${step.label}</h3>
          <p class="final-question__help">${step.help}</p>
          <label class="final-field">${step.type === "textarea" ? `<textarea name="${step.key}" rows="4"${step.minlength ? ` minlength="${step.minlength}"` : ""} required placeholder="Escribe tu respuesta..."></textarea>` : `<input name="${step.key}" autocomplete="off" required placeholder="${step.placeholder}" />`}</label>
          <div class="final-answer-status" role="status">Escribe tu respuesta para continuar.</div>
        </div>
      </section>`).join("")}
      <section class="wizard-slide wizard-slide--final" data-wizard-slide="6" hidden>
        <div class="wizard-final final-review">
          <span>REVISI&Oacute;N DEL PROTOCOLO</span>
          <h3 tabindex="-1">Confirma tu caso deportivo.</h3>
          <p>Revisa cada componente antes de liberar la salida.</p>
          <div class="final-review__list">
            ${finalComponents.map((step, index) => `<div><span>${index + 1}</span><b>${step.label}</b><small data-review-final="${index}">Sin responder</small></div>`).join("")}
          </div>
          <div class="wizard-summary"><strong data-final-answered>0</strong><span>de 6 componentes escritos</span></div>
        </div>
      </section>
    </div>
    <div class="hint-panel" hidden>La cintura p&eacute;lvica transfiere cargas del eje a los miembros inferiores. En la pierna, la tibia es el principal hueso de carga.</div>
    <div class="wizard-controls">
      <button class="secondary-action" data-final-back type="button">Anterior</button>
      <button class="hint-button" data-hint type="button" ${state.hintUsed.includes(4) ? "disabled" : ""}>${icon("hint")}${state.hintUsed.includes(4) ? "Pista utilizada" : "Solicitar pista (-20)"}</button>
      <button class="primary-action" data-final-next type="button">Siguiente componente ${icon("arrow")}</button>
    </div>
    <div class="form-feedback" role="alert" aria-live="assertive"></div>
  </form>`;
}

function initializeFinalWizard(form) {
  const finalStep = finalComponents.length;
  const nextButton = form.querySelector("[data-final-next]");
  const backButton = form.querySelector("[data-final-back]");
  const valueOf = (i) => form.elements[finalComponents[i].key].value.trim();
  const isComplete = (i) => valueOf(i).length > 0;

  const showStep = (requestedStep) => {
    const step = Math.max(0, Math.min(finalStep, requestedStep));
    form.elements["final-step"].value = String(step);
    form.querySelectorAll("[data-wizard-slide]").forEach((slide) => {
      slide.hidden = Number(slide.dataset.wizardSlide) !== step;
    });
    const activeSlide = form.querySelector(`[data-wizard-slide="${step}"]`);
    const isFinal = step === finalStep;
    form.querySelector("[data-final-label]").textContent = isFinal ? "Revisi\u00f3n final" : `Componente ${step + 1} de 6`;
    form.querySelector("[data-final-count]").textContent = isFinal ? "6/6" : `${step + 1}/6`;
    form.querySelector("[data-final-progress]").style.transform = `scaleX(${isFinal ? 1 : (step + 1) / 6})`;
    form.querySelector("[data-final-progressbar]").setAttribute("aria-valuenow", String(isFinal ? 6 : step + 1));
    backButton.disabled = step === 0;
    nextButton.type = isFinal ? "submit" : "button";
    nextButton.innerHTML = isFinal ? `Verificar reto ${icon("check")}` : `Siguiente componente ${icon("arrow")}`;
    nextButton.disabled = !isFinal && !isComplete(step);

    if (!isFinal) {
      activeSlide.querySelector(".final-answer-status").textContent = isComplete(step) ? "Respuesta registrada. Puedes continuar." : "Escribe tu respuesta para continuar.";
    }
    finalComponents.forEach((_, index) => {
      const value = valueOf(index);
      form.querySelector(`[data-review-final="${index}"]`).textContent = value ? (value.length > 64 ? `${value.slice(0, 64)}\u2026` : value) : "Sin responder";
    });
    form.querySelector("[data-final-answered]").textContent = finalComponents.filter((_, index) => isComplete(index)).length;
    saveDraft(4, form);
    activeSlide.scrollTop = 0;
    activeSlide.querySelector(".final-question")?.scrollTo(0, 0);
    activeSlide.querySelector("h3, input, textarea")?.focus({ preventScroll: true });
  };

  form.showFinalStep = showStep;
  form.querySelectorAll(".final-field input, .final-field textarea").forEach((control) => {
    control.addEventListener("input", () => {
      const slide = control.closest(".final-slide");
      const step = Number(slide.dataset.wizardSlide);
      markInvalid(slide, false);
      slide.querySelector(".final-answer-status").textContent = isComplete(step) ? "Respuesta registrada. Puedes continuar." : "Escribe tu respuesta para continuar.";
      nextButton.disabled = !isComplete(step);
    });
  });
  backButton.addEventListener("click", () => showStep(Number(form.elements["final-step"].value) - 1));
  nextButton.addEventListener("click", () => {
    if (nextButton.type === "submit") return;
    const step = Number(form.elements["final-step"].value);
    if (!isComplete(step)) return;
    showStep(step + 1);
  });
  showStep(Number(form.elements["final-step"].value) || 0);
}

function revealHint(index) {
  const hint = document.querySelector(".hint-panel");
  hint.hidden = false;
  state.hints += 1;
  state.score = Math.max(0, state.score - 20);
  state.hintUsed.push(index);
  persist();
  const button = document.querySelector("[data-hint]");
  button.disabled = true;
  button.innerHTML = `${icon("hint")}Pista utilizada`;
  document.querySelector("#score").textContent = state.score;
}

function validateChallenge(event, index) {
  event.preventDefault();
  const form = event.currentTarget;
  let result;
  if (index === 0) result = validateClassification(form);
  if (index === 1) result = validateRegions(form);
  if (index === 2) result = validateMovement(form);
  if (index === 3) result = validateMysteries(form);
  if (index === 4) result = validateFinal(form);
  if (result.ok) completeChallenge(index, result.answers);
  else {
    if (index === 0 && Number.isInteger(result.focusStep)) form.showClassificationStep(result.focusStep);
    if (index === 1 && Number.isInteger(result.focusStep)) form.showRegionStep(result.focusStep);
    if (index === 2 && Number.isInteger(result.focusStep)) form.showMovementStep(result.focusStep);
    if (index === 3 && Number.isInteger(result.focusStep)) form.showMysteryStep(result.focusStep);
    if (index === 4 && Number.isInteger(result.focusStep)) form.showFinalStep(result.focusStep);
    registerFailure(form, result.message);
  }
}

function validateClassification(form) {
  let correct = 0;
  let firstWrong = null;
  const selections = {};
  classificationItems.forEach(([number, , answer], index) => {
    const value = new FormData(form).get(`bone-${number}`);
    selections[number] = value;
    const row = form.querySelector(`[data-row="${number}"]`);
    const isCorrect = value === answer;
    markInvalid(row, !isCorrect);
    if (!isCorrect && firstWrong === null) firstWrong = index;
    if (isCorrect) correct += 1;
  });
  const reason = form.elements.reason.value.trim();
  const ok = correct === classificationItems.length && reason.length >= 30;
  return {
    ok,
    message: correct < classificationItems.length ? `${correct} de 12 clasificaciones son correctas. Revisa las muestras marcadas.` : "La clasificaci&oacute;n es correcta; ampl&iacute;a la justificaci&oacute;n a por lo menos 30 caracteres.",
    focusStep: firstWrong ?? classificationItems.length,
    answers: { selections, reason, code: 37 },
  };
}

function validateRegions(form) {
  const answers = {};
  let correct = 0;
  let firstWrong = null;
  regions.forEach(([, answer], index) => {
    const value = new FormData(form).get(`region-${index}`) || "";
    answers[index] = value;
    const row = form.querySelector(`[data-row="${index}"]`);
    markInvalid(row, value !== answer);
    if (value !== answer && firstWrong === null) firstWrong = index;
    if (value === answer) correct += 1;
  });
  return {
    ok: correct === regions.length,
    message: `${correct} de 7 regiones est&aacute;n bien relacionadas. Revisa las regiones se&ntilde;aladas.`,
    focusStep: firstWrong,
    answers: { matches: answers, code: "EFB" },
  };
}

function validateMovement(form) {
  const answers = {};
  let correctCases = 0;
  let firstWrong = null;
  movementCases.forEach((item, index) => {
    const selected = new FormData(form).getAll(item.id);
    answers[item.id] = selected;
    const valid = selected.length >= item.minimum && selected.every((value) => item.answers.includes(value));
    markInvalid(form.querySelector(`[data-case="${item.id}"]`), !valid);
    if (!valid && firstWrong === null) firstWrong = index;
    if (valid) correctCases += 1;
  });
  const reason = form.elements.reason.value.trim();
  const ok = correctCases === movementCases.length && reason.length >= 35;
  return {
    ok,
    message: correctCases < movementCases.length ? `${correctCases} de 4 casos tienen una selecci&oacute;n pertinente. Retira distractores o agrega estructuras clave.` : "Las selecciones son pertinentes; desarrolla un poco m&aacute;s el mini-desaf&iacute;o.",
    focusStep: firstWrong ?? movementCases.length,
    answers: { cases: answers, reason },
  };
}

function validateMysteries(form) {
  const answers = [];
  let correct = 0;
  let firstWrong = null;
  mysteries.forEach((item, index) => {
    const bone = normalize(form.elements[`mystery-${index}`].value);
    const system = form.elements[`system-${index}`].value;
    const valid = item.answer.includes(bone) && system === item.system;
    markInvalid(form.querySelector(`[data-row="${index}"]`), !valid);
    if (!valid && firstWrong === null) firstWrong = index;
    answers.push({ bone, system });
    if (valid) correct += 1;
  });
  return {
    ok: correct === mysteries.length,
    message: `${correct} de 5 identificaciones son correctas. Contrasta la ubicaci&oacute;n y el sistema de las piezas marcadas.`,
    focusStep: firstWrong,
    answers: { mysteries: answers, code: "FEEVO" },
  };
}

function validateFinal(form) {
  const data = Object.fromEntries(new FormData(form));
  const axialAllowed = ["vertebra", "vertebras", "columna", "columna vertebral", "sacro", "craneo", "esternon", "costilla", "costillas", "occipital"];
  const appendicularAllowed = ["femur", "patela", "rotula", "tibia", "fibula", "perone", "tarso", "tarsos", "metatarso", "metatarsos", "falange", "falanges"];
  const axial = [...new Set(data.axial.split(",").map(normalize).filter(Boolean))];
  const appendicular = [...new Set(data.appendicular.split(",").map(normalize).filter(Boolean))];
  const checks = {
    axial: axial.filter((item) => axialAllowed.includes(item)).length >= 2,
    appendicular: appendicular.filter((item) => appendicularAllowed.includes(item)).length >= 3,
    connector: ["cintura pelvica", "huesos coxales", "coxales", "coxal", "pelvis"].includes(normalize(data.connector)),
    load: normalize(data.load) === "tibia",
    reason: data.reason.trim().length >= 45,
    phrase: ["axial", "apendicular", "movimiento", "proteccion"].every((word) => normalize(data.phrase).includes(word)),
  };
  Object.entries(checks).forEach(([key, valid]) => markInvalid(form.querySelector(`[data-row="${key}"]`), !valid));
  let firstWrong = null;
  finalComponents.forEach((step, index) => {
    if (!checks[step.key] && firstWrong === null) firstWrong = index;
  });
  const correct = Object.values(checks).filter(Boolean).length;
  return {
    ok: correct === 6,
    message: `${correct} de 6 componentes cumplen el protocolo. Revisa los componentes se&ntilde;alados y conserva la justificaci&oacute;n anat&oacute;mica.`,
    focusStep: firstWrong,
    answers: data,
  };
}

function markInvalid(container, invalid) {
  container.classList.toggle("is-wrong", invalid);
  container.querySelectorAll("input, select, textarea").forEach((control) => {
    if (invalid) control.setAttribute("aria-invalid", "true");
    else control.removeAttribute("aria-invalid");
  });
}

function registerFailure(form, message) {
  state.attempts += 1;
  state.score = Math.max(0, state.score - 15);
  persist();
  const feedback = form.querySelector(".form-feedback");
  feedback.innerHTML = `<strong>Protocolo incompleto.</strong><span>${message}</span>`;
  feedback.classList.add("is-visible");
  form.querySelector('[aria-invalid="true"]')?.focus({ preventScroll: true });
  feedback.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function completeChallenge(index, answers) {
  if (!state.completed.includes(index)) state.completed.push(index);
  state.answers[index] = answers;
  delete state.drafts[index];
  state.current = Math.min(4, Math.max(state.current, index + 1));
  persist();
  const dialog = document.querySelector("#challenge-dialog");
  dialog.querySelector(".dialog-body").classList.remove("dialog-body--wizard");
  const codes = ["37", "EFB", "MOV", "FEEVO", "SALIDA"];
  dialog.querySelector(".dialog-body").innerHTML = `
    <div class="success-seal">
      <div class="seal-mark">${icon("check")}</div>
      <p>COMPARTIMENTO LIBERADO</p>
      <h2>${challengeMeta[index].title}</h2>
      <span>C&Oacute;DIGO RECUPERADO</span>
      <strong>${codes[index]}</strong>
      <button class="primary-action" id="continue-mission" type="button">Continuar misi&oacute;n ${icon("arrow")}</button>
    </div>`;
  dialog.querySelector("#continue-mission").addEventListener("click", () => {
    dialog.close();
    renderMission();
    showToast(index === 4 ? "Todos los cierres est&aacute;n listos." : `Estaci&oacute;n ${index + 2} desbloqueada.`);
  });
}

function showToast(message) {
  const toast = document.querySelector("#toast");
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("is-visible");
  window.setTimeout(() => toast.classList.remove("is-visible"), 3200);
}

function getElapsedMinutes() {
  const end = state.finishedAt ? new Date(state.finishedAt) : new Date();
  return Math.max(1, Math.round((end - new Date(state.startedAt)) / 60000));
}

function createReport() {
  return {
    version: 2,
    submissionId: state.sessionId,
    activity: "Mision: liberar el esqueleto",
    student: state.profile.name,
    group: state.profile.group,
    subject: state.profile.subject,
    startedAt: state.startedAt,
    finishedAt: state.finishedAt,
    elapsedMinutes: getElapsedMinutes(),
    score: state.score,
    attempts: state.attempts,
    hints: state.hints,
    integrity: {
      interruptions: state.interruptions,
      inactiveSeconds: state.inactiveSeconds,
    },
    completedChallenges: state.completed.length,
    answers: state.answers,
  };
}

function renderReport() {
  window.scrollTo(0, 0);
  document.body.className = "report-page";
  const report = createReport();
  document.querySelector("#app").innerHTML = `
    <main id="main-content" class="report-shell">
      <header class="report-brand"><img class="brand" src="${asset("logo-cecar.png")}" alt="CECAR" /><span>ANATOM&Iacute;A FUNCIONAL</span></header>
      <section class="release-panel">
        <div class="release-stamp">${icon("unlock")}<span>ACCESO</span><strong>LIBERADO</strong></div>
        <div class="release-copy">
          <p>PROTOCOLO COMPLETADO</p>
          <h1>La salida est&aacute; abierta.</h1>
          <p>${escapeHtml(state.profile.name)}, clasificaste estructuras axiales y apendiculares y las conectaste con el movimiento humano. Tus justificaciones quedan listas para revisi&oacute;n docente.</p>
        </div>
        <dl class="result-strip">
          <div><dt>Puntuaci&oacute;n</dt><dd>${report.score}<small>/1000</small></dd></div>
          <div><dt>Tiempo</dt><dd>${report.elapsedMinutes}<small>min</small></dd></div>
          <div><dt>Intentos</dt><dd>${report.attempts}</dd></div>
          <div><dt>Pistas</dt><dd>${report.hints}</dd></div>
        </dl>
      </section>

      <section class="report-actions" aria-labelledby="report-title">
        <div><h2 id="report-title">Entrega de evidencia</h2><p>Env&iacute;a el reporte a la hoja del docente y conserva una copia local.</p></div>
        <div class="report-buttons">
          <button class="primary-action" id="send-results" type="button">${icon("send")} Enviar al docente</button>
          <button class="secondary-action" id="download-results" type="button">${icon("download")} Descargar reporte</button>
        </div>
        <label class="report-consent"><input id="report-consent" type="checkbox" ${state.profile.shareConsent ? "checked" : ""} /> Autorizo el env&iacute;o de este resultado al docente.</label>
        <div class="submission-status" id="submission-status" role="status" aria-live="polite"></div>
      </section>

      <section class="learning-close">
        <blockquote>El esqueleto axial protege y sostiene; el apendicular transforma la fuerza muscular en movimiento.</blockquote>
        <button class="text-button" id="new-mission" type="button">Iniciar una nueva misi&oacute;n</button>
      </section>
    </main>`;
  document.querySelector("#send-results").addEventListener("click", sendResults);
  document.querySelector("#report-consent").addEventListener("change", (event) => {
    state.profile.shareConsent = event.currentTarget.checked;
    persist();
  });
  document.querySelector("#download-results").addEventListener("click", downloadReport);
  document.querySelector("#new-mission").addEventListener("click", openResetDialog);
}

async function sendResults() {
  const button = document.querySelector("#send-results");
  const status = document.querySelector("#submission-status");
  if (!state.profile.shareConsent) {
    status.className = "submission-status is-warning";
    status.textContent = "Autoriza el env\u00edo antes de compartir el reporte. Tambi\u00e9n puedes descargarlo sin enviarlo.";
    document.querySelector("#report-consent").focus();
    return;
  }
  if (!resultsEndpoint) {
    status.className = "submission-status is-warning";
    status.innerHTML = "El endpoint de Google Sheets a&uacute;n no est&aacute; configurado. Descarga el reporte o define <code>VITE_RESULTS_ENDPOINT</code> antes de publicar.";
    return;
  }
  button.disabled = true;
  button.innerHTML = `${icon("send")} Enviando...`;
  try {
    await fetch(resultsEndpoint, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(createReport()),
    });
    status.className = "submission-status is-success";
    status.innerHTML = "La solicitud de env&iacute;o fue entregada a Google Sheets. Conserva la copia descargable hasta que el docente confirme la recepci&oacute;n.";
    button.innerHTML = `${icon("check")} Solicitud enviada`;
  } catch {
    status.className = "submission-status is-error";
    status.innerHTML = "No fue posible conectar con la hoja. Descarga el reporte e int&eacute;ntalo de nuevo cuando tengas conexi&oacute;n.";
    button.disabled = false;
    button.innerHTML = `${icon("send")} Reintentar env&iacute;o`;
  }
}

function downloadReport() {
  const report = createReport();
  const text = formatReportAsText(report);
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `mision-esqueleto-${normalize(state.profile.name).replaceAll(" ", "-")}.txt`;
  link.click();
  URL.revokeObjectURL(link.href);
}

function formatReportAsText(report) {
  const pad = (value, length = 2) => String(value).padStart(length, "0");
  const formatDate = (iso) => {
    if (!iso) return "(sin registro)";
    const date = new Date(iso);
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
  };

  const line = "=".repeat(72);
  const subline = "-".repeat(72);
  const out = [];
  out.push(line);
  out.push("  REPORTE DE MISIÓN: LIBERAR EL ESQUELETO");
  out.push("  Anatomía Funcional - REDI CECAR");
  out.push(line);
  out.push("");
  out.push("DATOS DEL ESTUDIANTE");
  out.push(subline);
  out.push(`  Nombre:            ${report.student || "(sin nombre)"}`);
  out.push(`  Grupo:             ${report.group || "(sin grupo)"}`);
  out.push(`  Asignatura:        ${report.subject || "(sin asignatura)"}`);
  out.push(`  Sesión:            ${report.submissionId || "-"}`);
  out.push(`  Inicio:            ${formatDate(report.startedAt)}`);
  out.push(`  Finalización:      ${formatDate(report.finishedAt)}`);
  out.push(`  Tiempo invertido:  ${report.elapsedMinutes} min`);
  out.push("");
  out.push("RESULTADO GLOBAL");
  out.push(subline);
  out.push(`  Puntuación:        ${report.score} / 1000`);
  out.push(`  Intentos:          ${report.attempts}`);
  out.push(`  Pistas usadas:     ${report.hints}`);
  out.push(`  Interrupciones:    ${report.integrity?.interruptions || 0}`);
  out.push(`  Tiempo fuera:      ${formatDuration(report.integrity?.inactiveSeconds || 0)}`);
  out.push(`  Estaciones:        ${report.completedChallenges} de 5`);
  out.push("");

  challengeMeta.forEach((meta, index) => {
    const answers = report.answers?.[index];
    out.push(`ESTACIÓN ${index + 1}: ${meta.title.toUpperCase()}`);
    out.push(subline);
    if (!answers) {
      out.push("  (no completada)");
      out.push("");
      return;
    }
    out.push(...summarizeChallenge(index, answers));
    out.push("");
  });

  out.push(line);
  out.push("  Bloque técnico (formato JSON para Google Sheets)");
  out.push(line);
  out.push(JSON.stringify(report, null, 2));
  out.push("");
  return out.join("\n");
}

function formatDuration(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  if (!minutes) return `${seconds} s`;
  return `${minutes} min ${seconds} s`;
}

function summarizeChallenge(index, answers) {
  const lines = [];
  switch (index) {
    case 0: {
      const selections = answers.selections || {};
      let correct = 0;
      classificationItems.forEach(([number, , answer]) => {
        if (selections[number] === answer) correct += 1;
      });
      lines.push(`  Huesos clasificados: ${correct} de ${classificationItems.length} correctos`);
      if (answers.reason) {
        lines.push(`  Justificación:`);
        lines.push(`    ${answers.reason.replace(/\n/g, "\n    ")}`);
      }
      break;
    }
    case 1: {
      const matches = answers.matches || {};
      let correct = 0;
      regions.forEach(([, answer], i) => {
        if (matches[i] === answer) correct += 1;
      });
      lines.push(`  Regiones bien relacionadas: ${correct} de ${regions.length}`);
      break;
    }
    case 2: {
      const cases = answers.cases || {};
      const caseNames = Object.keys(cases);
      lines.push(`  Casos respondedos:  ${caseNames.length} de 4`);
      Object.entries(cases).forEach(([caseId, selected]) => {
        if (Array.isArray(selected) && selected.length) {
          lines.push(`    - ${caseId}: ${selected.join(", ")}`);
        }
      });
      if (answers.reason) {
        lines.push(`  Mini-desafío:`);
        lines.push(`    ${answers.reason.replace(/\n/g, "\n    ")}`);
      }
      break;
    }
    case 3: {
      const given = answers.mysteries || [];
      const total = mysteries.length;
      const correct = given.reduce((acc, item, i) => {
        const expected = mysteries[i];
        if (!expected) return acc;
        const boneMatch = item.bone && expected.answer.includes(item.bone);
        const systemMatch = item.system === expected.system;
        return acc + (boneMatch && systemMatch ? 1 : 0);
      }, 0);
      lines.push(`  Huesos identificados: ${correct} de ${total} correctos`);
      given.forEach((item, i) => {
        const bone = item.bone || "(sin respuesta)";
        const system = item.system ? ` (${item.system})` : "";
        lines.push(`    ${i + 1}. ${bone}${system}`);
      });
      break;
    }
    case 4: {
      lines.push(`  Huesos axiales:           ${answers.axial || "-"}`);
      lines.push(`  Huesos apendiculares:     ${answers.appendicular || "-"}`);
      lines.push(`  Estructura conectora:     ${answers.connector || "-"}`);
      lines.push(`  Hueso de carga:           ${answers.load || "-"}`);
      if (answers.reason) {
        lines.push(`  Justificación:`);
        lines.push(`    ${answers.reason.replace(/\n/g, "\n    ")}`);
      }
      if (answers.phrase) {
        lines.push(`  Frase de salida:`);
        lines.push(`    ${answers.phrase.replace(/\n/g, "\n    ")}`);
      }
      break;
    }
    default:
      lines.push(`  ${JSON.stringify(answers)}`);
  }
  return lines;
}

document.addEventListener("visibilitychange", handleVisibilityChange);
window.addEventListener("beforeunload", handleBeforeUnload);
render();
