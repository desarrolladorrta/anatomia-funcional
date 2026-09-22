import "./styles.css";
import {
  challengeMeta,
  classificationItems,
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
  startedAt: null,
  finishedAt: null,
  answers: {},
  drafts: {},
});

let state = loadState();
let timerId;

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
          <p>Estos datos acompa&ntilde;ar&aacute;n el reporte que recibe el docente.</p>
        </div>
        <form id="profile-form" class="intake-form">
          <label>
            Nombre completo
            <input name="name" autocomplete="name" maxlength="80" required placeholder="Escribe tu nombre" />
          </label>
          <label>
            Grupo o curso <span>(opcional)</span>
            <input name="group" maxlength="40" placeholder="Ej. Anatom&iacute;a 2A" />
          </label>
          <label class="consent-row">
            <input type="checkbox" name="consent" />
            <span>Autorizo el env&iacute;o de mi resultado al docente al finalizar <b>(opcional)</b>.</span>
          </label>
          <button class="primary-action" type="submit">Iniciar misi&oacute;n ${icon("arrow")}</button>
        </form>
        <p class="privacy-note">El progreso se guarda en este dispositivo. No solicitamos documento ni correo.</p>
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
        shareConsent: data.get("consent") === "on",
      },
      sessionId: crypto.randomUUID(),
      startedAt: new Date().toISOString(),
    };
    persist();
    render();
  });
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
        <div><span>PUNTAJE</span><strong id="score">${state.score}</strong></div>
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
  document.querySelector("#reset-button").addEventListener("click", confirmReset);
  document.querySelector("#exit-control")?.addEventListener("click", () => {
    state.finishedAt = new Date().toISOString();
    persist();
    render();
  });
  updateTimer();
  timerId = window.setInterval(updateTimer, 1000);
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

function confirmReset() {
  if (!window.confirm("Se borrar\u00e1 el progreso de esta misi\u00f3n. \u00bfDeseas continuar?")) return;
  localStorage.removeItem(STORAGE_KEY);
  state = emptyState();
  render();
}

function openChallenge(index) {
  if (index > state.current) return;
  const dialog = document.querySelector("#challenge-dialog");
  dialog.innerHTML = `
    <div class="dialog-rail">
      <span>ESTACI&Oacute;N</span><strong>${String(index + 1).padStart(2, "0")}</strong><i></i><small>${challengeMeta[index].specimen}</small>
    </div>
    <div class="dialog-body">
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
    form.addEventListener("submit", (event) => validateChallenge(event, index));
    form.addEventListener("input", () => saveDraft(index, form));
    form.addEventListener("change", () => saveDraft(index, form));
    dialog.querySelector("[data-hint]")?.addEventListener("click", () => revealHint(index));
  }
  dialog.showModal();
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
  return `<form novalidate>
    <div class="challenge-instruction"><strong>Clasifica cada muestra.</strong><p>Marca A para axial o P para apendicular. Luego justifica el criterio que utilizaste.</p></div>
    <div class="classification-grid">
      ${classificationItems.map(([number, bone]) => `<div class="specimen-row" data-row="${number}" role="group" aria-labelledby="bone-label-${number}"><span class="bone-label" id="bone-label-${number}"><i>${number}</i><b>${bone}</b></span><div class="system-options"><label><input type="radio" name="bone-${number}" value="axial" /> A</label><label><input type="radio" name="bone-${number}" value="appendicular" /> P</label></div></div>`).join("")}
    </div>
    <label class="long-answer">Justificaci&oacute;n anat&oacute;mica<textarea name="reason" rows="3" minlength="30" required placeholder="Explica c&oacute;mo diferenciaste ambos sistemas..."></textarea></label>
    <div class="hint-panel" hidden>Piensa en el eje central: cr&aacute;neo, columna y caja tor&aacute;cica. Las cinturas y extremidades se proyectan desde ese eje.</div>
    ${challengeActions(0)}
  </form>`;
}

function renderRegions() {
  const options = `<option value="">Selecciona</option>${regionSets.map(([code, bones]) => `<option value="${code}">${code} - ${bones}</option>`).join("")}`;
  return `<form novalidate>
    <div class="challenge-instruction"><strong>Reconstruye el mapa corporal.</strong><p>Asigna a cada regi&oacute;n el conjunto de huesos correspondiente. Cada letra se usa una vez.</p></div>
    <div class="region-map">${regions.map(([region], index) => `<label data-row="${index}"><span><b>${index + 1}</b>${region}</span><select name="region-${index}" required>${options}</select></label>`).join("")}</div>
    <div class="hint-panel" hidden>Empieza por los conjuntos inequ&iacute;vocos: estern&oacute;n y costillas forman el t&oacute;rax; v&eacute;rtebras, sacro y c&oacute;ccix forman la columna.</div>
    ${challengeActions(1)}
  </form>`;
}

function renderMovement() {
  return `<form novalidate>
    <div class="challenge-instruction"><strong>Analiza el cuerpo en acci&oacute;n.</strong><p>Selecciona solo huesos pertinentes para cada situaci&oacute;n. Puede haber varias respuestas correctas.</p></div>
    <div class="movement-cases">${movementCases.map((item) => `<fieldset data-case="${item.id}"><legend>${item.title}</legend><p>${item.prompt}</p><div class="bone-chips">${item.options.map((option) => `<label><input type="checkbox" name="${item.id}" value="${option}" /><span>${option}</span></label>`).join("")}</div></fieldset>`).join("")}</div>
    <label class="long-answer">Mini-desaf&iacute;o<textarea name="reason" rows="3" minlength="35" required placeholder="Elige uno de los casos y explica por qu&eacute; esos huesos son relevantes..."></textarea></label>
    <div class="hint-panel" hidden>Relaciona la ubicaci&oacute;n con la funci&oacute;n: el salto concentra carga en el miembro inferior; la caja tor&aacute;cica protege; la columna sostiene y transmite fuerzas.</div>
    ${challengeActions(2)}
  </form>`;
}

function renderMysteries() {
  return `<form novalidate>
    <div class="challenge-instruction"><strong>Identifica cinco piezas sin ver su etiqueta.</strong><p>Escribe el nombre del hueso y clasif&iacute;calo como axial o apendicular.</p></div>
    <div class="mystery-list">${mysteries.map((item, index) => `<fieldset data-row="${index}"><legend><span>${index + 1}</span>${item.clue}</legend><div><label>Hueso<input name="mystery-${index}" autocomplete="off" required /></label><label>Sistema<select name="system-${index}" required><option value="">Selecciona</option><option value="axial">Axial</option><option value="appendicular">Apendicular</option></select></label></div></fieldset>`).join("")}</div>
    <div class="hint-panel" hidden>Las iniciales de las respuestas forman F-E-E-V-O. Revisa que cada nombre coincida con la ubicaci&oacute;n descrita.</div>
    ${challengeActions(3)}
  </form>`;
}

function renderFinalCase() {
  return `<form novalidate>
    <div class="case-file">
      <span>CASO DEPORTIVO / SALTO VERTICAL</span>
      <p>Una estudiante analiza qu&eacute; estructuras pertenecen al eje corporal y cu&aacute;les al aparato locomotor de las extremidades.</p>
    </div>
    <div class="final-questions">
      <label data-row="axial"><span>1</span><b>Dos huesos axiales importantes para la postura</b><input name="axial" required placeholder="Separados por coma" /></label>
      <label data-row="appendicular"><span>2</span><b>Tres huesos apendiculares del miembro inferior</b><input name="appendicular" required placeholder="Separados por coma" /></label>
      <label data-row="connector"><span>3</span><b>Estructura que une el miembro inferior al esqueleto axial</b><input name="connector" required /></label>
      <label data-row="load"><span>4</span><b>Hueso que recibe directamente la carga entre f&eacute;mur y tobillo</b><input name="load" required /></label>
      <label class="long-answer" data-row="reason"><span>5</span><b>&iquest;Por qu&eacute; clasificar los huesos ayuda a analizar el movimiento?</b><textarea name="reason" rows="3" minlength="45" required></textarea></label>
      <label class="long-answer exit-phrase" data-row="phrase"><span>6</span><b>Construye la frase de salida</b><small>Incluye: axial, apendicular, movimiento y protecci&oacute;n.</small><textarea name="phrase" rows="2" required></textarea></label>
    </div>
    <div class="hint-panel" hidden>La cintura p&eacute;lvica transfiere cargas del eje a los miembros inferiores. En la pierna, la tibia es el principal hueso de carga.</div>
    ${challengeActions(4)}
  </form>`;
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
  else registerFailure(form, result.message);
}

function validateClassification(form) {
  let correct = 0;
  const selections = {};
  classificationItems.forEach(([number, , answer]) => {
    const value = new FormData(form).get(`bone-${number}`);
    selections[number] = value;
    const row = form.querySelector(`[data-row="${number}"]`);
    const isCorrect = value === answer;
    markInvalid(row, !isCorrect);
    if (isCorrect) correct += 1;
  });
  const reason = form.elements.reason.value.trim();
  const ok = correct === classificationItems.length && reason.length >= 30;
  return {
    ok,
    message: correct < classificationItems.length ? `${correct} de 12 clasificaciones son correctas. Revisa las muestras marcadas.` : "La clasificaci&oacute;n es correcta; ampl&iacute;a la justificaci&oacute;n a por lo menos 30 caracteres.",
    answers: { selections, reason, code: 37 },
  };
}

function validateRegions(form) {
  const answers = {};
  let correct = 0;
  regions.forEach(([, answer], index) => {
    const value = form.elements[`region-${index}`].value;
    answers[index] = value;
    const row = form.querySelector(`[data-row="${index}"]`);
    markInvalid(row, value !== answer);
    if (value === answer) correct += 1;
  });
  return {
    ok: correct === regions.length,
    message: `${correct} de 7 regiones est&aacute;n bien relacionadas. Revisa las filas se&ntilde;aladas.`,
    answers: { matches: answers, code: "EFB" },
  };
}

function validateMovement(form) {
  const answers = {};
  let correctCases = 0;
  movementCases.forEach((item) => {
    const selected = new FormData(form).getAll(item.id);
    answers[item.id] = selected;
    const valid = selected.length >= item.minimum && selected.every((value) => item.answers.includes(value));
    markInvalid(form.querySelector(`[data-case="${item.id}"]`), !valid);
    if (valid) correctCases += 1;
  });
  const reason = form.elements.reason.value.trim();
  const ok = correctCases === movementCases.length && reason.length >= 35;
  return {
    ok,
    message: correctCases < movementCases.length ? `${correctCases} de 4 casos tienen una selecci&oacute;n pertinente. Retira distractores o agrega estructuras clave.` : "Las selecciones son pertinentes; desarrolla un poco m&aacute;s el mini-desaf&iacute;o.",
    answers: { cases: answers, reason },
  };
}

function validateMysteries(form) {
  const answers = [];
  let correct = 0;
  mysteries.forEach((item, index) => {
    const bone = normalize(form.elements[`mystery-${index}`].value);
    const system = form.elements[`system-${index}`].value;
    const valid = item.answer.includes(bone) && system === item.system;
    markInvalid(form.querySelector(`[data-row="${index}"]`), !valid);
    answers.push({ bone, system });
    if (valid) correct += 1;
  });
  return {
    ok: correct === mysteries.length,
    message: `${correct} de 5 identificaciones son correctas. Contrasta la ubicaci&oacute;n y el sistema de las piezas marcadas.`,
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
  const correct = Object.values(checks).filter(Boolean).length;
  return {
    ok: correct === 6,
    message: `${correct} de 6 componentes cumplen el protocolo. Revisa los campos se&ntilde;alados y conserva la justificaci&oacute;n anat&oacute;mica.`,
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
    version: 1,
    submissionId: state.sessionId,
    activity: "Mision: liberar el esqueleto",
    student: state.profile.name,
    group: state.profile.group,
    startedAt: state.startedAt,
    finishedAt: state.finishedAt,
    elapsedMinutes: getElapsedMinutes(),
    score: state.score,
    attempts: state.attempts,
    hints: state.hints,
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
  document.querySelector("#new-mission").addEventListener("click", confirmReset);
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
  const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `mision-esqueleto-${normalize(state.profile.name).replaceAll(" ", "-")}.json`;
  link.click();
  URL.revokeObjectURL(link.href);
}

render();
