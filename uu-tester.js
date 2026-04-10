import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const START_URL = process.argv[2] || 'https://tilskudd.fiks.test.ks.no/';
const MAX_SIDER = parseInt(process.argv[3]) || 20;
const dato = new Date().toISOString().slice(0, 10);
const rapportDir = path.join(__dirname, 'rapporter', dato);
fs.mkdirSync(rapportDir, { recursive: true });

const baseOrigin = new URL(START_URL).origin;

console.log(`\n🔍 Starter UU-analyse av: ${START_URL}`);
console.log(`📅 Dato: ${dato}`);
console.log(`📄 Maks antall sider: ${MAX_SIDER}\n`);

const browser = await chromium.launch();
const context = await browser.newContext({ userAgent: 'Mozilla/5.0 UU-Tester/1.0' });

// --- Crawl og analyser alle interne sider ---
const besøkte = new Set();
const kø = [START_URL];
const sideResultater = [];

async function analyserSide(url) {
  const page = await context.newPage();
  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(800);

    const tittel = await page.title();

    // Axe WCAG-analyse
    const axe = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice'])
      .analyze();

    // Finn interne lenker for videre crawling
    const internelenker = await page.evaluate((origin) => {
      return Array.from(document.querySelectorAll('a[href]'))
        .map(a => a.href)
        .filter(href => href.startsWith(origin) && !href.includes('#'))
        .map(href => href.split('?')[0].replace(/\/$/, '') || '/');
    }, baseOrigin);

    // Lenkesjekk (alle lenker på siden)
    const allelenker = await page.evaluate(() =>
      Array.from(document.querySelectorAll('a[href]')).map(a => ({
        tekst: a.innerText.trim() || a.getAttribute('aria-label') || '(ingen tekst)',
        href: a.href,
        intern: a.href.startsWith(window.location.origin),
        harTekst: !!(a.innerText.trim() || a.getAttribute('aria-label'))
      }))
    );

    const lenkeSjekk = await Promise.all(
      allelenker.map(async (l) => {
        if (!l.href || l.href.startsWith('mailto:') || l.href.startsWith('tel:') || l.href.startsWith('javascript:')) {
          return { ...l, status: 'skip', ok: true };
        }
        try {
          const r = await fetch(l.href, { method: 'HEAD', signal: AbortSignal.timeout(6000) });
          return { ...l, status: r.status, ok: r.ok };
        } catch {
          try {
            const r = await fetch(l.href, { method: 'GET', signal: AbortSignal.timeout(6000) });
            return { ...l, status: r.status, ok: r.ok };
          } catch (e) {
            return { ...l, status: 'feil', ok: false };
          }
        }
      })
    );

    // Knapper
    const knapper = await page.evaluate(() =>
      Array.from(document.querySelectorAll('button, [role="button"], input[type="submit"], input[type="button"], input[type="reset"]'))
        .map(el => ({
          tag: el.tagName.toLowerCase(),
          type: el.getAttribute('type') || '',
          tekst: el.innerText?.trim() || el.getAttribute('value') || el.getAttribute('aria-label') || el.getAttribute('title') || '',
          harLabel: !!(el.innerText?.trim() || el.getAttribute('aria-label') || el.getAttribute('title') || el.getAttribute('value')),
          disabled: el.disabled || false
        }))
    );

    // Bilder
    const bilder = await page.evaluate(() =>
      Array.from(document.querySelectorAll('img')).map(img => ({
        src: img.src.split('/').pop() || img.src,
        fullSrc: img.src,
        alt: img.getAttribute('alt') ?? null,
        harAlt: img.hasAttribute('alt'),
        altErTom: img.getAttribute('alt') === '',
        rolle: img.getAttribute('role') || '',
        bredde: img.naturalWidth,
        høyde: img.naturalHeight
      }))
    );

    // Skjemafelt
    const skjemafelt = await page.evaluate(() =>
      Array.from(document.querySelectorAll('input, select, textarea'))
        .filter(el => !['hidden', 'submit', 'button', 'reset'].includes(el.type))
        .map(el => {
          const id = el.id;
          const labelEl = id ? document.querySelector(`label[for="${id}"]`) : null;
          const foreldreLabel = el.closest('label');
          const labelTekst = labelEl?.innerText?.trim() || foreldreLabel?.innerText?.trim() || el.getAttribute('aria-label') || el.getAttribute('placeholder') || '';
          return {
            type: el.type || el.tagName.toLowerCase(),
            id: id || '(ingen id)',
            navn: el.getAttribute('name') || '',
            labelTekst,
            påkrevd: el.required || false,
            harLabel: !!(labelEl || foreldreLabel || el.getAttribute('aria-label') || el.getAttribute('aria-labelledby') || el.getAttribute('title'))
          };
        })
    );

    // Landmarks og struktur
    const struktur = await page.evaluate(() => {
      const overskrifter = Array.from(document.querySelectorAll('h1,h2,h3,h4,h5,h6')).map(h => ({
        nivå: parseInt(h.tagName[1]),
        tekst: h.innerText.trim().slice(0, 100)
      }));
      const landmarks = Array.from(document.querySelectorAll('main, nav, header, footer, aside, section[aria-label], [role="main"], [role="navigation"], [role="banner"]'))
        .map(el => ({ tag: el.tagName.toLowerCase(), rolle: el.getAttribute('role') || el.tagName.toLowerCase(), label: el.getAttribute('aria-label') || '' }));
      const harSkipLink = !!document.querySelector('a[href="#main"], a[href="#innhold"], a[href="#content"]');
      const langAttr = document.documentElement.getAttribute('lang') || '';
      return { overskrifter, landmarks, harSkipLink, langAttr };
    });

    await page.close();

    return {
      url,
      tittel,
      wcag: {
        brudd: axe.violations.length,
        bestått: axe.passes.length,
        kritiske: axe.violations.filter(v => v.impact === 'critical').length,
        alvorlige: axe.violations.filter(v => v.impact === 'serious').length,
        moderate: axe.violations.filter(v => v.impact === 'moderate').length,
        mindre: axe.violations.filter(v => v.impact === 'minor').length,
        detaljer: axe.violations
      },
      lenker: {
        totalt: lenkeSjekk.filter(l => l.status !== 'skip').length,
        døde: lenkeSjekk.filter(l => !l.ok && l.status !== 'skip'),
        tomTekst: lenkeSjekk.filter(l => !l.harTekst && l.status !== 'skip'),
        alle: lenkeSjekk
      },
      knapper,
      bilder,
      skjemafelt,
      struktur,
      internelenker: [...new Set(internelenker)]
    };
  } catch (e) {
    await page.close();
    console.log(`  ⚠️  Kunne ikke laste: ${url} (${e.message.slice(0, 60)})`);
    return null;
  }
}

// Crawl alle sider
while (kø.length > 0 && besøkte.size < MAX_SIDER) {
  const url = kø.shift();
  const normUrl = url.replace(/\/$/, '') || START_URL;
  if (besøkte.has(normUrl)) continue;
  besøkte.add(normUrl);

  console.log(`📄 [${besøkte.size}/${MAX_SIDER}] Analyserer: ${normUrl}`);
  const resultat = await analyserSide(normUrl);
  if (resultat) {
    sideResultater.push(resultat);
    for (const lenke of resultat.internelenker) {
      const norm = lenke.replace(/\/$/, '');
      if (!besøkte.has(norm) && !kø.includes(norm)) kø.push(norm);
    }
  }
}

await browser.close();

// --- Aggregert oppsummering ---
const totalt = {
  sider: sideResultater.length,
  wcagBrudd: sideResultater.reduce((s, r) => s + r.wcag.brudd, 0),
  kritiske: sideResultater.reduce((s, r) => s + r.wcag.kritiske, 0),
  alvorlige: sideResultater.reduce((s, r) => s + r.wcag.alvorlige, 0),
  dødelenker: sideResultater.reduce((s, r) => s + r.lenker.døde.length, 0),
  knapper: sideResultater.reduce((s, r) => s + r.knapper.length, 0),
  knappUtenLabel: sideResultater.reduce((s, r) => s + r.knapper.filter(k => !k.harLabel).length, 0),
  bilder: sideResultater.reduce((s, r) => s + r.bilder.length, 0),
  bilderUtenAlt: sideResultater.reduce((s, r) => s + r.bilder.filter(b => !b.harAlt).length, 0),
  skjemafelt: sideResultater.reduce((s, r) => s + r.skjemafelt.length, 0),
  feltUtenLabel: sideResultater.reduce((s, r) => s + r.skjemafelt.filter(f => !f.harLabel).length, 0),
};

// Lagre JSON
const jsonFil = path.join(rapportDir, 'resultat.json');
fs.writeFileSync(jsonFil, JSON.stringify({ url: START_URL, dato, totalt, sider: sideResultater }, null, 2));

// Generer HTML
const htmlFil = path.join(rapportDir, 'rapport.html');
fs.writeFileSync(htmlFil, genererRapport(START_URL, dato, totalt, sideResultater));

// Terminal-oppsummering
console.log('\n' + '━'.repeat(60));
console.log(`📊 RAPPORT – ${START_URL}`);
console.log('━'.repeat(60));
console.log(`📄 Sider testet:     ${totalt.sider}`);
console.log(`♿ WCAG-brudd:       ${farge(totalt.wcagBrudd, 0, 3, 8)}   (kritiske: ${totalt.kritiske}, alvorlige: ${totalt.alvorlige})`);
console.log(`🔗 Døde lenker:      ${farge(totalt.dødelenker, 0, 1, 5)}`);
console.log(`🔘 Knapper testet:   ${totalt.knapper} (${farge(totalt.knappUtenLabel, 0, 1, 3)} uten label)`);
console.log(`🖼️  Bilder testet:    ${totalt.bilder} (${farge(totalt.bilderUtenAlt, 0, 1, 3)} uten alt)`);
console.log(`📝 Skjemafelt:       ${totalt.skjemafelt} (${farge(totalt.feltUtenLabel, 0, 1, 3)} uten label)`);
console.log('━'.repeat(60));
console.log(`\n📁 HTML-rapport: ${htmlFil}\n`);

open(htmlFil).catch(() => {});

function farge(n, grønn, gul, rød) {
  if (n <= grønn) return `\x1b[32m${n}\x1b[0m`;
  if (n <= gul) return `\x1b[33m${n}\x1b[0m`;
  return `\x1b[31m${n}\x1b[0m`;
}

async function open(fil) {
  const { exec } = await import('child_process');
  exec(`open "${fil}"`);
}

function score(t) {
  return Math.max(0, 100 - t.kritiske * 15 - t.alvorlige * 8 - t.moderate * 3 - t.mindre - t.dødelenker * 5 - t.knappUtenLabel * 4 - t.bilderUtenAlt * 4 - t.feltUtenLabel * 4);
}

function genererRapport(url, dato, totalt, sider) {
  const s = score({
    ...totalt,
    moderate: sider.reduce((a, r) => a + r.wcag.moderate, 0),
    mindre: sider.reduce((a, r) => a + r.wcag.mindre, 0)
  });
  const scoreKlasse = s >= 80 ? 'god' : s >= 50 ? 'middels' : 'dårlig';

  const sidenavigasjon = sider.map((side, i) =>
    `<li><a href="#side-${i}" class="sidenav-link ${side.wcag.kritiske > 0 ? 'har-kritiske' : side.wcag.brudd > 0 ? 'har-brudd' : 'ok'}">
      <span class="sidenavn">${side.tittel || side.url}</span>
      <span class="side-url">${side.url.replace(url, '/')}</span>
      <span class="side-badge">${side.wcag.brudd > 0 ? `${side.wcag.brudd} brudd` : '✅'}</span>
    </a></li>`
  ).join('');

  const sideDetaljer = sider.map((side, i) => `
    <div class="side-seksjon" id="side-${i}">
      <div class="side-header">
        <div>
          <h2>${side.tittel || '(ingen tittel)'}</h2>
          <a href="${side.url}" target="_blank" class="side-url-link">${side.url}</a>
        </div>
        <div class="side-score-badges">
          ${badge(side.wcag.kritiske, 'critical', 'kritiske')}
          ${badge(side.wcag.alvorlige, 'serious', 'alvorlige')}
          ${badge(side.lenker.døde.length, 'dead', 'døde lenker')}
        </div>
      </div>

      <!-- Struktur -->
      <div class="artefakt-grid">
        <div class="artefakt-kort">
          <h3>🏗️ Sidestruktur</h3>
          <table><tbody>
            <tr><td>Språkattributt</td><td>${side.struktur.langAttr ? `<code>${side.struktur.langAttr}</code> ✅` : '<span class="mangler">Mangler ❌</span>'}</td></tr>
            <tr><td>Skip-lenke</td><td>${side.struktur.harSkipLink ? '✅ Funnet' : '<span class="mangler">Mangler ❌</span>'}</td></tr>
            <tr><td>Landmarks</td><td>${side.struktur.landmarks.length > 0 ? side.struktur.landmarks.map(l => `<code>${l.tag}</code>`).join(' ') : '<span class="mangler">Ingen ❌</span>'}</td></tr>
          </tbody></table>
          ${side.struktur.overskrifter.length > 0 ? `
            <h4 style="margin-top:0.8rem">Overskriftshierarki</h4>
            <ul class="overskrift-liste">
              ${side.struktur.overskrifter.map(h => `<li style="padding-left:${(h.nivå-1)*1}rem"><span class="h-badge">H${h.nivå}</span> ${h.tekst}</li>`).join('')}
            </ul>` : ''}
        </div>

        <!-- Knapper -->
        <div class="artefakt-kort">
          <h3>🔘 Knapper testet (${side.knapper.length})</h3>
          ${side.knapper.length === 0
            ? '<p class="ingen">Ingen knapper funnet</p>'
            : `<table>
              <thead><tr><th>Element</th><th>Tekst/Label</th><th>Status</th></tr></thead>
              <tbody>
              ${side.knapper.map(k => `
                <tr>
                  <td><code>${k.tag}${k.type ? `[type=${k.type}]` : ''}</code></td>
                  <td>${k.tekst || '<em>(ingen)</em>'}</td>
                  <td>${k.harLabel ? '✅' : '<span class="mangler">❌ Mangler label</span>'}</td>
                </tr>`).join('')}
              </tbody>
            </table>`}
        </div>

        <!-- Bilder -->
        <div class="artefakt-kort">
          <h3>🖼️ Bilder testet (${side.bilder.length})</h3>
          ${side.bilder.length === 0
            ? '<p class="ingen">Ingen bilder funnet</p>'
            : `<table>
              <thead><tr><th>Fil</th><th>Alt-tekst</th><th>Status</th></tr></thead>
              <tbody>
              ${side.bilder.map(b => `
                <tr>
                  <td style="font-size:0.8rem">${b.src.slice(0, 40)}</td>
                  <td>${b.alt !== null ? (b.alt || '<em>(tom)</em>') : '<em>(ikke satt)</em>'}</td>
                  <td>${b.harAlt ? (b.altErTom ? '⚠️ Tom alt' : '✅') : '<span class="mangler">❌ Mangler alt</span>'}</td>
                </tr>`).join('')}
              </tbody>
            </table>`}
        </div>

        <!-- Skjemafelt -->
        ${side.skjemafelt.length > 0 ? `
        <div class="artefakt-kort">
          <h3>📝 Skjemafelt testet (${side.skjemafelt.length})</h3>
          <table>
            <thead><tr><th>Type</th><th>ID/Navn</th><th>Label</th><th>Påkrevd</th><th>Status</th></tr></thead>
            <tbody>
            ${side.skjemafelt.map(f => `
              <tr>
                <td><code>${f.type}</code></td>
                <td><code>${f.id !== '(ingen id)' ? f.id : f.navn || '—'}</code></td>
                <td>${f.labelTekst || '<em>(ingen)</em>'}</td>
                <td>${f.påkrevd ? '✅' : '—'}</td>
                <td>${f.harLabel ? '✅' : '<span class="mangler">❌ Mangler label</span>'}</td>
              </tr>`).join('')}
            </tbody>
          </table>
        </div>` : ''}

        <!-- Lenker -->
        <div class="artefakt-kort">
          <h3>🔗 Lenker testet (${side.lenker.alle.filter(l => l.status !== 'skip').length})</h3>
          ${side.lenker.døde.length === 0
            ? '<p class="ok-tekst">✅ Ingen døde lenker</p>'
            : `<table>
              <thead><tr><th>Status</th><th>Tekst</th><th>URL</th></tr></thead>
              <tbody>
              ${side.lenker.døde.map(l => `
                <tr>
                  <td><span class="badge critical">${l.status}</span></td>
                  <td>${l.tekst.slice(0, 30)}</td>
                  <td style="font-size:0.75rem;word-break:break-all">${l.href}</td>
                </tr>`).join('')}
              </tbody>
            </table>`}
        </div>
      </div>

      <!-- WCAG-brudd for denne siden -->
      ${side.wcag.detaljer.length > 0 ? `
      <div class="wcag-detaljer">
        <h3>♿ WCAG-brudd på denne siden (${side.wcag.brudd})</h3>
        <table>
          <thead><tr><th>Alvorlighet</th><th>Regel</th><th>Beskrivelse</th><th>Elementer</th></tr></thead>
          <tbody>
          ${side.wcag.detaljer.map(v => `
            <tr>
              <td><span class="badge ${v.impact}">${v.impact}</span></td>
              <td><code>${v.id}</code></td>
              <td>${v.description}</td>
              <td>${v.nodes.length}</td>
            </tr>`).join('')}
          </tbody>
        </table>
      </div>` : '<div class="wcag-ok">✅ Ingen WCAG-brudd på denne siden</div>'}
    </div>
  `).join('');

  return `<!DOCTYPE html>
<html lang="no">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>UU-rapport – ${dato}</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: system-ui, sans-serif; background: #f0f2f5; color: #1a1a2e; display: flex; min-height: 100vh; }

  /* Sidemeny */
  .sidemeny { width: 280px; min-width: 280px; background: #1a1a2e; color: white; padding: 1rem 0; overflow-y: auto; position: sticky; top: 0; height: 100vh; }
  .sidemeny h1 { padding: 0.8rem 1.2rem; font-size: 1rem; border-bottom: 1px solid rgba(255,255,255,0.1); margin-bottom: 0.5rem; }
  .sidemeny h1 span { display: block; font-size: 0.7rem; opacity: 0.6; margin-top: 0.2rem; font-weight: normal; }
  .sidemeny ul { list-style: none; }
  .sidenav-link { display: block; padding: 0.6rem 1.2rem; text-decoration: none; color: rgba(255,255,255,0.8); border-left: 3px solid transparent; transition: all 0.15s; }
  .sidenav-link:hover { background: rgba(255,255,255,0.08); color: white; }
  .sidenav-link.har-kritiske { border-color: #dc3545; }
  .sidenav-link.har-brudd { border-color: #ffc107; }
  .sidenav-link.ok { border-color: #28a745; }
  .sidenavn { display: block; font-size: 0.85rem; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .side-url { display: block; font-size: 0.7rem; opacity: 0.5; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .side-badge { display: block; font-size: 0.7rem; margin-top: 0.2rem; opacity: 0.7; }

  /* Hovedinnhold */
  .hoveddel { flex: 1; padding: 2rem; overflow-y: auto; }
  header { margin-bottom: 2rem; }
  header h1 { font-size: 1.6rem; }
  header p { color: #666; margin-top: 0.3rem; font-size: 0.9rem; }

  /* Score */
  .score-kort { background: white; border-radius: 12px; padding: 1.5rem 2rem; margin-bottom: 1.5rem; display: flex; align-items: center; gap: 2rem; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
  .score-sirkel { width: 90px; height: 90px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.8rem; font-weight: bold; flex-shrink: 0; }
  .score-sirkel.god { background: #d4edda; color: #155724; border: 4px solid #28a745; }
  .score-sirkel.middels { background: #fff3cd; color: #856404; border: 4px solid #ffc107; }
  .score-sirkel.dårlig { background: #f8d7da; color: #721c24; border: 4px solid #dc3545; }

  /* Nøkkeltall */
  .kort-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1rem; margin-bottom: 2rem; }
  .kort { background: white; border-radius: 10px; padding: 1rem; box-shadow: 0 2px 8px rgba(0,0,0,0.08); border-left: 4px solid #ccc; }
  .kort.kritisk { border-color: #dc3545; }
  .kort.advarsel { border-color: #ffc107; }
  .kort.ok { border-color: #28a745; }
  .kort .tall { font-size: 2rem; font-weight: bold; margin: 0.2rem 0; }
  .kort .etikett { font-size: 0.75rem; color: #666; text-transform: uppercase; letter-spacing: 0.04em; }
  .kort .ikon { font-size: 1.3rem; }
  .kort .undertekst { font-size: 0.7rem; color: #999; margin-top: 0.2rem; }

  /* Side-seksjoner */
  .side-seksjon { background: white; border-radius: 12px; padding: 1.5rem; margin-bottom: 1.5rem; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
  .side-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.2rem; padding-bottom: 1rem; border-bottom: 2px solid #f0f2f5; flex-wrap: wrap; gap: 0.5rem; }
  .side-header h2 { font-size: 1.1rem; }
  .side-url-link { font-size: 0.8rem; color: #666; text-decoration: none; }
  .side-url-link:hover { text-decoration: underline; }
  .side-score-badges { display: flex; gap: 0.5rem; flex-wrap: wrap; }

  /* Artefakt-grid */
  .artefakt-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(340px, 1fr)); gap: 1rem; margin-bottom: 1rem; }
  .artefakt-kort { background: #f8f9fa; border-radius: 8px; padding: 1rem; }
  .artefakt-kort h3 { font-size: 0.95rem; margin-bottom: 0.8rem; }
  .artefakt-kort h4 { font-size: 0.85rem; margin-bottom: 0.4rem; color: #555; }

  /* Tabeller */
  table { width: 100%; border-collapse: collapse; font-size: 0.82rem; }
  th { background: #e9ecef; text-align: left; padding: 0.4rem 0.6rem; font-weight: 600; }
  td { padding: 0.4rem 0.6rem; border-bottom: 1px solid #e9ecef; vertical-align: top; }
  tr:hover td { background: rgba(0,0,0,0.02); }

  /* Badges */
  .badge { display: inline-block; padding: 0.15rem 0.5rem; border-radius: 20px; font-size: 0.72rem; font-weight: 600; }
  .badge.critical { background: #f8d7da; color: #721c24; }
  .badge.serious { background: #ffe5d0; color: #7d3c00; }
  .badge.moderate { background: #fff3cd; color: #856404; }
  .badge.minor { background: #e2e3e5; color: #383d41; }
  .badge.dead { background: #f8d7da; color: #721c24; }

  /* Overskrift-liste */
  .overskrift-liste { list-style: none; font-size: 0.82rem; }
  .overskrift-liste li { padding: 0.2rem 0; }
  .h-badge { display: inline-block; width: 24px; font-size: 0.7rem; font-weight: bold; color: #888; }

  /* Status */
  .mangler { color: #dc3545; font-weight: 600; }
  .ok-tekst { color: #28a745; font-size: 0.9rem; }
  .ingen { color: #888; font-style: italic; font-size: 0.85rem; }
  .wcag-ok { background: #d4edda; color: #155724; padding: 0.8rem 1rem; border-radius: 8px; font-size: 0.9rem; }
  .wcag-detaljer { margin-top: 1rem; }
  .wcag-detaljer h3 { font-size: 0.95rem; margin-bottom: 0.6rem; }

  footer { text-align: center; padding: 2rem; color: #888; font-size: 0.8rem; }
</style>
</head>
<body>

<!-- Sidemeny med alle sider -->
<nav class="sidemeny">
  <h1>UU-rapport <span>${dato} · ${totalt.sider} sider</span></h1>
  <ul>${sidenavigasjon}</ul>
</nav>

<div class="hoveddel">
  <header>
    <h1>♿ UU-rapport</h1>
    <p><a href="${url}" target="_blank">${url}</a> · ${dato} · ${totalt.sider} sider analysert</p>
  </header>

  <!-- Score -->
  <div class="score-kort">
    <div class="score-sirkel ${scoreKlasse}">${s}</div>
    <div>
      <strong>Total UU-score</strong>
      <p style="color:#666;font-size:0.9rem;margin-top:0.3rem">Basert på WCAG-brudd, døde lenker og manglende labels på tvers av ${totalt.sider} sider.</p>
    </div>
  </div>

  <!-- Nøkkeltall -->
  <div class="kort-grid">
    <div class="kort ${totalt.sider > 0 ? 'ok' : 'advarsel'}">
      <div class="ikon">📄</div><div class="tall">${totalt.sider}</div><div class="etikett">Sider testet</div>
    </div>
    <div class="kort ${totalt.wcagBrudd === 0 ? 'ok' : totalt.wcagBrudd < 5 ? 'advarsel' : 'kritisk'}">
      <div class="ikon">♿</div><div class="tall">${totalt.wcagBrudd}</div><div class="etikett">WCAG-brudd</div>
      <div class="undertekst">${totalt.kritiske} kritiske · ${totalt.alvorlige} alvorlige</div>
    </div>
    <div class="kort ${totalt.dødelenker === 0 ? 'ok' : 'kritisk'}">
      <div class="ikon">🔗</div><div class="tall">${totalt.dødelenker}</div><div class="etikett">Døde lenker</div>
    </div>
    <div class="kort ${totalt.knappUtenLabel === 0 ? 'ok' : 'advarsel'}">
      <div class="ikon">🔘</div><div class="tall">${totalt.knapper}</div><div class="etikett">Knapper testet</div>
      <div class="undertekst">${totalt.knappUtenLabel} uten label</div>
    </div>
    <div class="kort ${totalt.bilderUtenAlt === 0 ? 'ok' : 'advarsel'}">
      <div class="ikon">🖼️</div><div class="tall">${totalt.bilder}</div><div class="etikett">Bilder testet</div>
      <div class="undertekst">${totalt.bilderUtenAlt} uten alt-tekst</div>
    </div>
    <div class="kort ${totalt.feltUtenLabel === 0 ? 'ok' : 'advarsel'}">
      <div class="ikon">📝</div><div class="tall">${totalt.skjemafelt}</div><div class="etikett">Skjemafelt testet</div>
      <div class="undertekst">${totalt.feltUtenLabel} uten label</div>
    </div>
  </div>

  <!-- Per-side detaljer -->
  ${sideDetaljer}

  <footer>UU-tester · axe-core + Playwright · ${dato}</footer>
</div>

</body>
</html>`;
}

function badge(n, klasse, tekst) {
  if (n === 0) return '';
  return `<span class="badge ${klasse}">${n} ${tekst}</span>`;
}
