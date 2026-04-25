#!/usr/bin/env node
import { stdout, env, exit } from 'process';

const RESET  = '\x1b[0m';
const BOLD   = '\x1b[1m';
const DIM    = '\x1b[2m';
const CYAN   = '\x1b[36m';
const GREEN  = '\x1b[32m';
const YELLOW = '\x1b[33m';
const BLUE   = '\x1b[34m';

const API_KEY = env.ANTHROPIC_API_KEY;
if (!API_KEY) {
  console.error(`\n${YELLOW}Feil: ANTHROPIC_API_KEY er ikke satt i miljøet.${RESET}\n`);
  exit(1);
}

const PROMPT = `Generer et sett med syntetiske søknadsnumre for en norsk tilskuddsforvaltningstjeneste.

Format: [FORVALTER]-[ORDNINGSKODE]-[ÅR]-[LØPENUMMER]

Krav:
- Forvalter: 3–4 bokstaver (departement/direktorat), eller 2 siffer (fylkeskommune), eller 4 siffer (kommune)
- Ordningskode: 8 bokstaver (forkortelse av ordningens navn), skal være lesbar og gi mening for saksbehandlere
- År: 4 siffer (2020–2030)
- Løpenummer: 6–8 siffer, start på 100001

Lag 10 eksempler med variasjon i:
- ulike forvaltere (stat, fylke, kommune)
- ulike ordningstyper
- ulike år

Returner som tabell med kolonnene: forvalter | ordningsnavn | ordningskode | år | søknadsnummer`;

console.log(`\n${BOLD}${BLUE}╔══════════════════════════════════════════════════╗${RESET}`);
console.log(`${BOLD}${BLUE}║  KS Tilskudd – Testdatagenerator med Claude AI  ║${RESET}`);
console.log(`${BOLD}${BLUE}╚══════════════════════════════════════════════════╝${RESET}\n`);
console.log(`${DIM}Sender prompt til claude-sonnet-4-6 ...${RESET}\n`);

const response = await fetch('https://api.anthropic.com/v1/messages', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': API_KEY,
    'anthropic-version': '2023-06-01',
  },
  body: JSON.stringify({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    stream: true,
    messages: [{ role: 'user', content: PROMPT }],
  }),
});

if (!response.ok) {
  const err = await response.text();
  console.error(`${YELLOW}API-feil (${response.status}): ${err}${RESET}`);
  exit(1);
}

console.log(`${CYAN}${BOLD}Generert output:${RESET}\n`);

const reader = response.body.getReader();
const decoder = new TextDecoder();
let buffer = '';

while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  buffer += decoder.decode(value, { stream: true });
  const lines = buffer.split('\n');
  buffer = lines.pop() ?? '';
  for (const line of lines) {
    if (!line.startsWith('data: ')) continue;
    const data = line.slice(6).trim();
    if (!data || data === '[DONE]') continue;
    try {
      const event = JSON.parse(data);
      if (event.type === 'content_block_delta' && event.delta?.type === 'text_delta') {
        stdout.write(event.delta.text);
      }
    } catch { /* ignore malformed SSE frames */ }
  }
}

console.log(`\n\n${GREEN}${BOLD}✓ Ferdig!${RESET} ${DIM}Dataene kan kopieres rett inn i testmiljøet.${RESET}\n`);
