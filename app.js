/**
 * Het scherm aan de helpteksten hangen.
 *
 * Alles hier is gewoon DOM-werk; de enige HelpCCMS-code staat in help.js. Elke
 * plek die uitleg toont, doet dat op dezelfde manier: vraag de sleutel, en doe
 * niets als er niets komt.
 */
import { getHelp } from "./help.js";

/**
 * Tooltip: de korte vorm.
 *
 * `short_desc` is het veld dat daarvoor bedoeld is. Staat het niet ingevuld, dan
 * nemen we de eerste alinea van de tekst; een tooltip met vier alinea's erin is
 * geen tooltip meer. Dit is precies waarom dat veld apart bestaat, en waarom het
 * de moeite waard is om het te vullen.
 */
async function vulTooltip(el) {
  const key = el.dataset.tip;
  const help = await getHelp(key);
  if (!help) return leegLaten(el);
  const tekst = help.short_desc || (help.text ?? "").split(/\n\s*\n/)[0] || "";
  el.innerHTML = "";
  const kop = document.createElement("b");
  kop.textContent = help.title || key;
  el.append(kop, document.createTextNode(tekst));
}

/** Field help: één regel onder het veld. Platte tekst, geen opmaak. */
async function vulVeld(el) {
  const key = el.dataset.field;
  const help = await getHelp(key);
  if (!help) return leegLaten(el);
  el.textContent = help.short_desc || (help.text ?? "").split(/\n\s*\n/)[0] || "";
}

/**
 * Komt er niets, dan verdwijnt het element.
 *
 * Dit is de regel die HelpCCMS zelf aanhoudt en aanraadt: help mag nooit een scherm
 * breken. Een ontbrekende uitleg is een klein verlies; een leeg kadertje of een
 * foutmelding op de plek van een uitleg is een bugmelding. Vier van de zes sleutels
 * op deze pagina zijn op dit moment niet gepubliceerd, en je ziet er niets van.
 */
function leegLaten(el) {
  el.textContent = "";
  el.style.display = "none";
}

// ── Het paneel ────────────────────────────────────────────────────────────
const paneel = document.querySelector(".panel");
const paneelTitel = document.getElementById("panel-title");
const paneelBody = document.getElementById("panel-body");
const paneelKey = document.getElementById("panel-key");

async function openPaneel(key) {
  const help = await getHelp(key);
  if (!help) return; // geen tekst, geen paneel
  paneelTitel.textContent = help.title || key;
  // `html` is klaar om in te voegen; `text` is dezelfde inhoud zonder opmaak.
  paneelBody.innerHTML = help.html || `<p>${help.text ?? ""}</p>`;
  paneelKey.textContent = key;
  paneel.dataset.open = "true";
}

paneel.querySelector(".close").addEventListener("click", () => {
  paneel.dataset.open = "false";
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") paneel.dataset.open = "false";
});

// ── Tabs ──────────────────────────────────────────────────────────────────
for (const knop of document.querySelectorAll("[data-tab]")) {
  knop.addEventListener("click", () => {
    for (const k of document.querySelectorAll("[data-tab]")) {
      k.setAttribute("aria-selected", String(k === knop));
    }
    for (const s of document.querySelectorAll("[data-panel]")) {
      s.hidden = s.dataset.panel !== knop.dataset.tab;
    }
  });
}

// ── Opstarten ─────────────────────────────────────────────────────────────
//
// Laat ophalen en niet vroeg: dit gebeurt bij het openen van de pagina omdat de
// tooltip en de field help meteen in beeld staan. Het paneel vraagt zijn tekst pas
// op het moment dat iemand klikt, en dat is de gewoonte die HelpCCMS aanraadt.
document.querySelectorAll("[data-tip]").forEach(vulTooltip);
document.querySelectorAll("[data-field]").forEach(vulVeld);

for (const knop of document.querySelectorAll("[data-help-panel]")) {
  knop.addEventListener("click", () => openPaneel(knop.dataset.helpPanel));
}

// Puur om te laten zien wat deze pagina opvraagt; hoort niet bij de integratie.
document.getElementById("keylist").textContent = [
  ...new Set(
    [...document.querySelectorAll("[data-tip],[data-field],[data-help-panel]")].map(
      (el) => el.dataset.tip || el.dataset.field || el.dataset.helpPanel,
    ),
  ),
].join(" · ");
