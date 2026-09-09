/**
 * De hele integratie met HelpCCMS. Dit bestand is het punt van deze demo:
 * er komt geen pakket aan te pas, geen sleutel, geen build-stap.
 */

const BASE = "https://www.helpccms.com/api/deploy";

// Alleen het id, niets eromheen. De Keys-weergave in de editor heeft een
// kopieerknop die precies deze waarde geeft.
const COLLECTION = "bc8a644e-6785-4ef3-8d3c-a6727b3332dd";

const cache = new Map();

/**
 * Haal één helptekst op aan de hand van zijn sleutel.
 *
 * Geeft `null` terug als er niets is: geen sleutel, niet gepubliceerd, of het
 * netwerk deed niet mee. De aanroeper hoort daarop te rekenen. Help mag nooit een
 * scherm breken; een ontbrekende uitleg is een klein verlies, een kapot paneel is
 * een bugmelding.
 */
export async function getHelp(key, { locale = "en" } = {}) {
  const cacheKey = `${locale}:${key}`;
  if (cache.has(cacheKey)) return cache.get(cacheKey);

  try {
    const res = await fetch(
      `${BASE}/${COLLECTION}/${encodeURIComponent(key)}?locale=${locale}`,
    );
    if (!res.ok) {
      console.warn(`[help] ${key}: ${res.status}`);
      cache.set(cacheKey, null);
      return null;
    }
    const help = await res.json();
    cache.set(cacheKey, help);
    return help;
  } catch (err) {
    console.warn(`[help] ${key}:`, err);
    return null;
  }
}

/** Elke sleutel waar deze collection vandaag antwoord op geeft. */
export async function listHelp() {
  try {
    const res = await fetch(`${BASE}/${COLLECTION}`);
    if (!res.ok) return [];
    return (await res.json()).keys ?? [];
  } catch {
    return [];
  }
}
