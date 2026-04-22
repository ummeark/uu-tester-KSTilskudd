/**
 * Genererer 30 deterministiske testdata-rader for KS Tilskudd.
 * Output: testdata/tilskudd-testdata.json
 *
 * Kjør: node testdata/generer-testdata.js
 *
 * Deterministisk: samme input gir alltid samme output.
 * UUID-er er avledet fra sha256 av et fast seed-streng.
 */

import { createHash } from 'crypto';
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ── UUID fra deterministisk hash ──────────────────────────────────────────────
function uuid(seed) {
  const h = createHash('sha256').update(`ks-tilskudd-testdata-${seed}`).digest('hex');
  return [h.slice(0,8), h.slice(8,12), `4${h.slice(13,16)}`,
    `${['8','9','a','b'][parseInt(h[16],16)%4]}${h.slice(17,20)}`, h.slice(20,32)].join('-');
}

// ── Vokabular ─────────────────────────────────────────────────────────────────

const FORVALTER = [
  { kode: '32', region: 'Akershus', orgnr: '930580783', navn: 'AKERSHUS FYLKESKOMMUNE', epost: 'postmottak@akershus.no' },
  { kode: '46', region: 'Vestland', orgnr: '821311632', navn: 'VESTLAND FYLKESKOMMUNE', epost: 'post@vlfk.no' },
  { kode: '5001', region: 'Trondheim', orgnr: '942110464', navn: 'TRONDHEIM KOMMUNE', epost: 'postmottak@trondheim.kommune.no' },
  { kode: '1505', region: 'Kristiansund', orgnr: '940373661', navn: 'KRISTIANSUND KOMMUNE', epost: 'postmottak@kristiansund.kommune.no' },
  { kode: '5501', region: 'Tromsø', orgnr: '940101808', navn: 'TROMSØ KOMMUNE', epost: 'postmottak@tromso.kommune.no' },
  { kode: '31', region: 'Østfold', orgnr: '930580694', navn: 'ØSTFOLD FYLKESKOMMUNE', epost: 'espenho@ofk.no' },
  { kode: '33', region: 'Buskerud', orgnr: '938633193', navn: 'BUSKERUD FYLKESKOMMUNE', epost: 'postmottak@buskerud.no' },
  { kode: '42', region: 'Agder', orgnr: '921708597', navn: 'AGDER FYLKESKOMMUNE', epost: 'postmottak@agderfk.no' },
  { kode: '11', region: 'Rogaland', orgnr: '971045698', navn: 'ROGALAND FYLKESKOMMUNE', epost: 'firmapost@rogaland.no' },
  { kode: '18', region: 'Nordland', orgnr: '964982953', navn: 'NORDLAND FYLKESKOMMUNE', epost: 'postmottak@nfk.no' },
  { kode: '3', region: 'Oslo', orgnr: '958935420', navn: 'OSLO KOMMUNE', epost: 'postmottak@oslo.kommune.no' },
  { kode: '4601', region: 'Bergen', orgnr: '964338531', navn: 'BERGEN KOMMUNE', epost: 'postmottak@bergen.kommune.no' },
  { kode: '1103', region: 'Stavanger', orgnr: '964965137', navn: 'STAVANGER KOMMUNE', epost: 'postmottak@stavanger.kommune.no' },
  { kode: '3301', region: 'Drammen', orgnr: '920637906', navn: 'DRAMMEN KOMMUNE', epost: 'postmottak@drammen.kommune.no' },
  { kode: '3403', region: 'Hamar', orgnr: '970540008', navn: 'HAMAR KOMMUNE', epost: 'postmottak@hamar.kommune.no' },
  { kode: '34', region: 'Innlandet', orgnr: '920717152', navn: 'INNLANDET FYLKESKOMMUNE', epost: 'postmottak@innlandetfylke.no' },
  { kode: '40', region: 'Telemark', orgnr: '940192226', navn: 'TELEMARK FYLKESKOMMUNE', epost: 'postmottak@telemarkfylke.no' },
  { kode: '39', region: 'Vestfold', orgnr: '921707134', navn: 'VESTFOLD FYLKESKOMMUNE', epost: 'postmottak@vestfoldfylke.no' },
  { kode: '50', region: 'Trøndelag', orgnr: '817920632', navn: 'TRØNDELAG FYLKESKOMMUNE', epost: 'postmottak@trondelagfylke.no' },
  { kode: '56', region: 'Finnmark', orgnr: '921590597', navn: 'FINNMARK FYLKESKOMMUNE', epost: 'postmottak@ffk.no' },
  { kode: '15', region: 'Møre og Romsdal', orgnr: '944183779', navn: 'MØRE OG ROMSDAL FYLKESKOMMUNE', epost: 'mrfylke@mrfylke.no' },
  { kode: '55', region: 'Troms', orgnr: '930068128', navn: 'TROMS FYLKESKOMMUNE', epost: 'postmottak@tromsfylke.no' },
  { kode: '1804', region: 'Bodø', orgnr: '840029112', navn: 'BODØ KOMMUNE', epost: 'postmottak@bodo.kommune.no' },
  { kode: '5007', region: 'Namsos', orgnr: '959469059', navn: 'NAMSOS KOMMUNE', epost: 'postmottak@namsos.kommune.no' },
  { kode: '5601', region: 'Alta', orgnr: '940203901', navn: 'ALTA KOMMUNE', epost: 'postmottak@alta.kommune.no' },
  { kode: '3107', region: 'Fredrikstad', orgnr: '920699768', navn: 'FREDRIKSTAD KOMMUNE', epost: 'postmottak@fredrikstad.kommune.no' },
  { kode: '3205', region: 'Lillestrøm', orgnr: '820760062', navn: 'LILLESTRØM KOMMUNE', epost: 'postmottak@lillestrom.kommune.no' },
  { kode: '3201', region: 'Bærum', orgnr: '935478715', navn: 'BÆRUM KOMMUNE', epost: 'postmottak@baerum.kommune.no' },
  { kode: '3203', region: 'Asker', orgnr: '820397631', navn: 'ASKER KOMMUNE', epost: 'postmottak@asker.kommune.no' },
  { kode: '4204', region: 'Kristiansand', orgnr: '963296746', navn: 'KRISTIANSAND KOMMUNE', epost: 'postmottak@kristiansand.kommune.no' },
];

// 30 arketype-definisjoner – én per rad
const ARKETYPER = [
  // ── Næringsfond (5 rader) ──
  {
    suffix: 'NÆRINGS', tittel: 'Næringsfond {region} 2026',
    kategori: 'Næring og innovasjon', status: 'AKTIV',
    kortBeskrivelse: 'Næringsfond for utvikling av bedrifter og nyetablerere i {region}. Støtten skal bidra til vekst, arbeidsplasser og bærekraftig næringsutvikling.',
    naeringer: ['IT-tjenester', 'Produksjon av næringsmidler', 'Engroshandel', 'Tjenester tilknyttet informasjonsteknologi'],
    mottakerStorrelse: ['Lite foretak', 'Mellomstort foretak'],
    soeknadsfrist: '2026-10-01', publisertFra: '2026-01-15', publisertTil: '2026-10-01',
    soknadsramme: 5000000,
    avsnitt: [
      { overskrift: 'Formål', innhold: '<p>Formålet med {region}s næringsfond er å stimulere til økt næringsaktivitet, nyetableringer og vekst i eksisterende bedrifter.</p>' },
      { overskrift: 'Hvem kan søke', innhold: '<ul><li>Bedrifter registrert i {region}</li><li>Nyetablerere med forretningsadresse i {region}</li><li>Næringsklynger og bedriftsnettverk</li></ul>' },
      { overskrift: 'Hva kan støttes', innhold: '<p>Det kan gis støtte til investeringer, produktutvikling, markedsarbeid og kompetansetiltak. Maksimal støtte per bedrift er kr 200 000. Egenandel på minimum 50 % kreves.</p>' },
      { overskrift: 'Slik søker du', innhold: '<p>Søknad sendes via www.regionalforvaltning.no. Søknaden skal inneholde beskrivelse av tiltaket, budsjett og finansieringsplan.</p>' },
    ],
  },
  {
    suffix: 'BIOMIDL', tittel: 'BIO-midlar {region} 2026',
    kategori: 'Kompetanse og omstilling', status: 'AKTIV',
    kortBeskrivelse: 'Støtte til bedriftsintern opplæring (BIO) i {region}. Midlene skal styrke kompetansen blant ansatte i forbindelse med omstillingsprosjekter.',
    naeringer: ['Alle næringer'],
    mottakerStorrelse: ['Lite foretak', 'Mellomstort foretak', 'Stort foretak'],
    soeknadsfrist: '2026-12-10', publisertFra: '2026-02-01', publisertTil: '2026-12-10',
    soknadsramme: 5225000,
    avsnitt: [
      { overskrift: 'Om ordningen', innhold: '<p>BIO-midlar gis til ekstraordinære opplæringstiltak knyttet til et konkret omstillingsprosjekt i bedriften. Opplæringen skal styrke de ansattes kompetanse slik at bedriften kan gjennomføre omstillingen.</p>' },
      { overskrift: 'Krav til søknaden', innhold: '<ul><li>Konkret omstillingsprosjekt må ligge til grunn</li><li>Opplæringstiltaket må være ekstraordinært</li><li>Tiltaket kan ikke starte før tilsagn er gitt</li><li>Bedriften må være minimum 2 år gammel</li></ul>' },
      { overskrift: 'Støttebeløp', innhold: '<p>Maksimal støtte per søknad: kr 250 000. Maksimalt kr 40 000 per deltaker. Søknadane behandles fortløpende så lenge det er midler igjen.</p>' },
    ],
  },
  {
    suffix: 'INNOVER', tittel: 'Innovasjon i byutvikling {region} 2026',
    kategori: 'Byutvikling og innovasjon', status: 'AKTIV',
    kortBeskrivelse: 'Støtteordning for innovative prosjekter som bidrar til bærekraftig byutvikling i {region}.',
    naeringer: ['Arkitektvirksomhet', 'Tjenester tilknyttet informasjonsteknologi', 'FoU innen naturvitenskap og teknikk', 'Administrativ rådgivning'],
    mottakerStorrelse: ['Lite foretak', 'Mellomstort foretak', 'Stort foretak'],
    soeknadsfrist: '2026-09-01', publisertFra: '2026-03-01', publisertTil: '2026-09-01',
    soknadsramme: 8000000,
    avsnitt: [
      { overskrift: 'Formål', innhold: '<p>Ordningen skal stimulere til innovative løsninger for mer bærekraftige, inkluderende og smarte byer. Prosjekter som kombinerer teknologi, design og brukerinvolvering prioriteres.</p>' },
      { overskrift: 'Prioriterte områder', innhold: '<ul><li>Klimatilpasning og grønn infrastruktur</li><li>Mobilitet og transport</li><li>Digitale innbyggertjenester</li><li>Inkluderende offentlige rom</li></ul>' },
      { overskrift: 'Tildelingskriterier', innhold: '<p>Prosjekter vurderes etter innovasjonsgrad, gjennomføringsevne, bærekraft og overføringsverdi til andre kommuner.</p>' },
    ],
  },
  {
    suffix: 'KOMMNAER', tittel: 'Kommunalt næringsfond {region} 2026',
    kategori: 'Lokalt næringsliv', status: 'AKTIV',
    kortBeskrivelse: 'Kommunalt næringsfond for bedrifter og nyetablerere i {region}. Støtten skal utløse nye arbeidsplasser eller sikre eksisterende.',
    naeringer: ['Hotellvirksomhet', 'Restaurantvirksomhet', 'Detaljhandel', 'Annen tjenesteyting'],
    mottakerStorrelse: ['Lite foretak', 'Mellomstort foretak'],
    soeknadsfrist: '2026-10-01', publisertFra: '2026-01-01', publisertTil: '2026-10-01',
    soknadsramme: 2000000,
    avsnitt: [
      { overskrift: 'Hva', innhold: '<p>Det er bare bedrifter og nyetablerere som kan motta støtte. Kommunalt næringsfond skal bare brukes på bedriftsrettede tiltak, i regi av enkeltbedrifter eller i form av nettverk mellom bedrifter.</p>' },
      { overskrift: 'Slik søker du', innhold: '<p>Søknad sendes via www.regionalforvaltning.no. Egenkapital skal være en del av budsjettet – maksimalt 50 % av kostnadene kan være tilskudd fra næringsfondet.</p>' },
      { overskrift: 'Søknadsfrister', innhold: '<p>Det er 2 årlige søknadsfrister: 1. april og 1. oktober. Ta kontakt med kommunen om du har spørsmål.</p>' },
    ],
  },
  {
    suffix: 'ARKTNAR', tittel: 'Arktisk næringsfond {region} 2026',
    kategori: 'Arktisk næring', status: 'AKTIV',
    kortBeskrivelse: 'Næringsfond for bedrifter i arktisk region med fokus på marin sektor, reiseliv og bærekraftig ressursutnyttelse.',
    naeringer: ['Akvakultur', 'Fiske og fangst', 'Hotellvirksomhet', 'Naturbasert turisme'],
    mottakerStorrelse: ['Lite foretak', 'Mellomstort foretak'],
    soeknadsfrist: '2026-11-01', publisertFra: '2026-02-15', publisertTil: '2026-11-01',
    soknadsramme: 3500000,
    avsnitt: [
      { overskrift: 'Formål', innhold: '<p>Fondet skal bidra til næringsutvikling i arktiske strøk med vekt på bærekraftig utnyttelse av naturressurser, klimatilpasning og utvikling av reiseliv.</p>' },
      { overskrift: 'Prioriterte satsinger', innhold: '<ul><li>Marin bioteknologi og akvakultur</li><li>Naturbasert reiseliv</li><li>Klimasmart logistikk</li><li>Samisk næringsliv</li></ul>' },
    ],
  },

  // ── Kompetanse (5 rader) ──
  {
    suffix: 'STIMINTE', tittel: 'Stimuleringsmidler internasjonalt samarbeid {region} 2026',
    kategori: 'Internasjonalt samarbeid', status: 'AKTIV',
    kortBeskrivelse: 'Støtte til aktører i {region} som vil gjennomføre søknadsprosesser mot EU-programmer. Kompetanseheving, nettverksbygging og forberedende prosjektarbeid.',
    naeringer: ['Næringsklynger og nettverk', 'Forskningsmiljøer', 'Frivillig sektor', 'Offentlige aktører'],
    mottakerStorrelse: ['Lite foretak', 'Mellomstort foretak', 'Stort foretak'],
    soeknadsfrist: '2026-04-10', publisertFra: '2026-01-20', publisertTil: '2026-04-10',
    soknadsramme: 1000000,
    avsnitt: [
      { overskrift: 'Formål', innhold: '<p>Formålet er å sette aktører i stand til å gjennomføre søknadsprosesser mot EU-programmer som Horisont Europa, Kreativt Europa og Erasmus+.</p>' },
      { overskrift: 'Hvem kan søke', innhold: '<ul><li>Kommuner</li><li>Næringsklynger og nettverk</li><li>Forskningsmiljøer</li><li>Frivillig sektor</li><li>Kulturaktører og ungdomsorganisasjoner</li></ul>' },
      { overskrift: 'Vilkår', innhold: '<p>Krav om egenfinansiering på minimum 50 %. Støtten kan utgjøre maksimalt 50 % av forprosjektkostnaden, begrenset til kr 100 000.</p>' },
    ],
  },
  {
    suffix: 'KOMPBED', tittel: 'Kompetanseheving i bedrift {region} 2026',
    kategori: 'Kompetanseutvikling', status: 'AKTIV',
    kortBeskrivelse: 'Tilskudd til kompetanseheving for ansatte i små og mellomstore bedrifter i {region}. Prioriterer digital og grønn kompetanse.',
    naeringer: ['Alle næringer'],
    mottakerStorrelse: ['Lite foretak', 'Mellomstort foretak'],
    soeknadsfrist: '2026-09-15', publisertFra: '2026-03-01', publisertTil: '2026-09-15',
    soknadsramme: 3000000,
    avsnitt: [
      { overskrift: 'Om ordningen', innhold: '<p>Ordningen gir støtte til kurs, etterutdanning og intern kompetansebygging i bedrifter. Prioritet gis til tiltak som styrker digital kompetanse og grønn omstilling.</p>' },
      { overskrift: 'Støttebeløp', innhold: '<p>Inntil 70 % av kursutgiftene, maksimalt kr 100 000 per bedrift per år. Kursarrangør må være godkjent.</p>' },
    ],
  },
  {
    suffix: 'GRØNTEKN', tittel: 'Grønn teknologi {region} 2026',
    kategori: 'Klimateknologi', status: 'AKTIV',
    kortBeskrivelse: 'Støtteordning for innføring og utvikling av grønn teknologi i næringslivet i {region}.',
    naeringer: ['Produksjon og distribusjon av elektrisitet', 'Tjenester tilknyttet informasjonsteknologi', 'FoU innen naturvitenskap og teknikk'],
    mottakerStorrelse: ['Lite foretak', 'Mellomstort foretak', 'Stort foretak'],
    soeknadsfrist: '2026-08-31', publisertFra: '2026-02-01', publisertTil: '2026-08-31',
    soknadsramme: 10000000,
    avsnitt: [
      { overskrift: 'Formål', innhold: '<p>Ordningen skal fremme innføring av klimavennlig teknologi i næringslivet og redusere klimagassutslipp i {region}.</p>' },
      { overskrift: 'Støttede tiltak', innhold: '<ul><li>Innkjøp av elektriske kjøretøy og maskiner</li><li>Energieffektiviseringstiltak</li><li>Utvikling av klimateknologi</li><li>Pilotprosjekter for sirkulærøkonomi</li></ul>' },
    ],
  },
  {
    suffix: 'MARITIME', tittel: 'Maritim innovasjon {region} 2026',
    kategori: 'Maritim næring', status: 'AKTIV',
    kortBeskrivelse: 'Støtte til innovasjonsprosjekter i maritim sektor i {region} med fokus på grønn skipsfart og digital transformasjon.',
    naeringer: ['Sjøfart og kysttrafikk', 'Bygging av skip og båter', 'Akvakultur', 'Tjenester tilknyttet informasjonsteknologi'],
    mottakerStorrelse: ['Lite foretak', 'Mellomstort foretak', 'Stort foretak'],
    soeknadsfrist: '2026-10-15', publisertFra: '2026-02-01', publisertTil: '2026-10-15',
    soknadsramme: 7000000,
    avsnitt: [
      { overskrift: 'Formål', innhold: '<p>Ordningen skal styrke den maritime klusteren i {region} gjennom støtte til innovasjons- og teknologiprosjekter med vekt på klimavennlig og digitalt drevet skipsfart.</p>' },
      { overskrift: 'Hvem kan søke', innhold: '<p>Bedrifter i maritim sektor, klyngeorganisasjoner og FoU-institusjoner med aktivitet i {region}.</p>' },
    ],
  },
  {
    suffix: 'DIGIKOMP', tittel: 'Digital kompetanse {region} 2026',
    kategori: 'Digitalisering', status: 'AKTIV',
    kortBeskrivelse: 'Midler til kompetanseheving innen digital teknologi for bedrifter og offentlige virksomheter i {region}.',
    naeringer: ['Tjenester tilknyttet informasjonsteknologi', 'Databehandling og web-portaler', 'Alle næringer'],
    mottakerStorrelse: ['Lite foretak', 'Mellomstort foretak', 'Stort foretak'],
    soeknadsfrist: '2026-11-30', publisertFra: '2026-01-01', publisertTil: '2026-11-30',
    soknadsramme: 4000000,
    avsnitt: [
      { overskrift: 'Om ordningen', innhold: '<p>Ordningen gir tilskudd til kurs og opplæring innen kunstig intelligens, dataanalyse, cybersikkerhet og digital forretningsutvikling.</p>' },
      { overskrift: 'Prioriterte kompetanseområder', innhold: '<ul><li>Kunstig intelligens og maskinlæring</li><li>Cybersikkerhet</li><li>Dataanalyse og visualisering</li><li>Digital prosjektledelse</li></ul>' },
    ],
  },

  // ── Kultur (5 rader) ──
  {
    suffix: 'KULTBYUT', tittel: 'Kulturbymidler {region} 2026',
    kategori: 'Kultur og kreativ næring', status: 'AKTIV',
    kortBeskrivelse: 'Støtte til kulturprosjekter som styrker byens kulturliv og kreative næringer i {region}.',
    naeringer: ['Kulturell virksomhet', 'Underholdningsvirksomhet', 'Kunstnerisk virksomhet'],
    mottakerStorrelse: ['Lite foretak'],
    soeknadsfrist: '2026-05-01', publisertFra: '2026-01-15', publisertTil: '2026-05-01',
    soknadsramme: 6000000,
    avsnitt: [
      { overskrift: 'Formål', innhold: '<p>Midlene skal stimulere til et mangfoldig og levende kulturliv i {region} med særlig vekt på nyskapende kunstneriske uttrykk og tilgjengelig kultur for alle.</p>' },
      { overskrift: 'Hvem kan søke', innhold: '<p>Profesjonelle kunstnere, kulturorganisasjoner og kreative bedrifter med aktivitet i {region}. Frivillige organisasjoner kan søke dersom de samarbeider med profesjonelle aktører.</p>' },
    ],
  },
  {
    suffix: 'BERGKULT', tittel: 'Kulturprosjekter {region} 2026',
    kategori: 'Lokalt kulturliv', status: 'AKTIV',
    kortBeskrivelse: 'Kommunalt tilskudd til kulturprosjekter som fremmer mangfold, inkludering og lokal identitet i {region}.',
    naeringer: ['Kulturell virksomhet', 'Frivillig organisasjonsarbeid'],
    mottakerStorrelse: ['Lite foretak'],
    soeknadsfrist: '2026-03-15', publisertFra: '2026-01-01', publisertTil: '2026-03-15',
    soknadsramme: 2500000,
    avsnitt: [
      { overskrift: 'Hva støttes', innhold: '<p>Konserter, forestillinger, utstillinger, festivaler og andre kulturarrangementer. Prosjekter som involverer barn og unge prioriteres.</p>' },
      { overskrift: 'Søknadskriterier', innhold: '<ul><li>Tydelig kulturelt formål</li><li>Bred publikumsappell</li><li>God geografisk spredning i {region}</li><li>Egenfinansiering på minst 30 %</li></ul>' },
    ],
  },
  {
    suffix: 'LOKFEST', tittel: 'Lokale festivaler {region} 2026',
    kategori: 'Festival og arrangement', status: 'AKTIV',
    kortBeskrivelse: 'Tilskudd til lokale festivaler og kulturarrangementer som bygger stedsidentitet og tiltrekker besøkende til {region}.',
    naeringer: ['Arrangementvirksomhet', 'Hotellvirksomhet', 'Serveringsvirksomhet'],
    mottakerStorrelse: ['Lite foretak', 'Mellomstort foretak'],
    soeknadsfrist: '2026-02-28', publisertFra: '2026-01-10', publisertTil: '2026-02-28',
    soknadsramme: 1500000,
    avsnitt: [
      { overskrift: 'Formål', innhold: '<p>Ordningen skal støtte lokale festivaler som har en positiv effekt på stedsidentitet, reiseliv og næringsutvikling i {region}.</p>' },
      { overskrift: 'Vilkår', innhold: '<p>Festivalen må ha vært arrangert tidligere eller ha et solid planverk. Minimum 500 besøkende. Arrangementet må gjennomføres i {region}.</p>' },
    ],
  },
  {
    suffix: 'KULTAR', tittel: 'Kulturarv {region} 2026',
    kategori: 'Kulturarv og bevaring', status: 'AKTIV',
    kortBeskrivelse: 'Støtte til prosjekter som bevarer og formidler kulturarv i {region}. Prioritet til prosjekter med digital formidling og bred tilgjengelighet.',
    naeringer: ['Museer og kulturinstitusjoner', 'Arkiv- og bibliotekvirksomhet'],
    mottakerStorrelse: ['Lite foretak'],
    soeknadsfrist: '2026-06-01', publisertFra: '2026-02-01', publisertTil: '2026-06-01',
    soknadsramme: 2000000,
    avsnitt: [
      { overskrift: 'Prioriterte tiltak', innhold: '<ul><li>Digitalisering av kulturarv</li><li>Restaurering og vedlikehold av verneverdige bygg</li><li>Formidlingsprosjekter rettet mot unge</li><li>Dokumentasjon av stedsnavn og tradisjoner</li></ul>' },
    ],
  },
  {
    suffix: 'INNLKULT', tittel: 'Kulturutvikling Innlandet {region} 2026',
    kategori: 'Regional kulturutvikling', status: 'INAKTIV',
    kortBeskrivelse: 'Regional støtteordning for kulturprosjekter som styrker kulturlivet på tvers av kommuner i {region}.',
    naeringer: ['Kulturell virksomhet', 'Kunstnerisk virksomhet'],
    mottakerStorrelse: ['Lite foretak', 'Mellomstort foretak'],
    soeknadsfrist: '2025-12-01', publisertFra: '2025-08-01', publisertTil: '2025-12-01',
    soknadsramme: 3000000,
    avsnitt: [
      { overskrift: 'Merk', innhold: '<p>Denne ordningen er avsluttet for 2025. Ny utlysning forventes i januar 2026. Kontakt {region} fylkeskommune for mer informasjon.</p>' },
    ],
  },

  // ── Klima (5 rader) ──
  {
    suffix: 'KLIMAOMST', tittel: 'Klimaomstilling {region} 2026',
    kategori: 'Klimaomstilling', status: 'AKTIV',
    kortBeskrivelse: 'Tilskudd til klimaomstillingstiltak for bedrifter og organisasjoner i {region}. Støtten skal fremme reduksjon av klimagassutslipp.',
    naeringer: ['Industri', 'Transport og lagring', 'Bygge- og anleggsvirksomhet', 'Landbruk'],
    mottakerStorrelse: ['Lite foretak', 'Mellomstort foretak', 'Stort foretak'],
    soeknadsfrist: '2026-09-30', publisertFra: '2026-03-01', publisertTil: '2026-09-30',
    soknadsramme: 15000000,
    avsnitt: [
      { overskrift: 'Formål', innhold: '<p>Ordningen skal bidra til at {region} når sine klimamål innen 2030. Tilskudd gis til prosjekter med dokumenterte og målbare klimaeffekter.</p>' },
      { overskrift: 'Støttede tiltak', innhold: '<ul><li>Energieffektivisering i bygg og industri</li><li>Overgang til fornybar energi</li><li>Utslippsreduksjon i transport</li><li>Sirkulærøkonomi-tiltak</li></ul>' },
      { overskrift: 'Rapportering', innhold: '<p>Alle prosjekter som mottar støtte må rapportere på faktiske klimagassreduksjoner innen 12 måneder etter prosjektavslutning.</p>' },
    ],
  },
  {
    suffix: 'GRØNENER', tittel: 'Grønn energi {region} 2026',
    kategori: 'Fornybar energi', status: 'AKTIV',
    kortBeskrivelse: 'Støtte til prosjekter som øker produksjon og bruk av fornybar energi i {region}.',
    naeringer: ['Produksjon og distribusjon av elektrisitet', 'Produksjon og distribusjon av gass', 'Bygg- og anleggsvirksomhet'],
    mottakerStorrelse: ['Lite foretak', 'Mellomstort foretak', 'Stort foretak'],
    soeknadsfrist: '2026-08-15', publisertFra: '2026-01-20', publisertTil: '2026-08-15',
    soknadsramme: 20000000,
    avsnitt: [
      { overskrift: 'Prioriterte teknologier', innhold: '<ul><li>Sol- og vindkraft</li><li>Bioenergi og biogass</li><li>Varmepumper og fjernvarme</li><li>Energilagring</li></ul>' },
      { overskrift: 'Søknadsprosess', innhold: '<p>Prosjekter over kr 500 000 krever teknisk faglig vurdering. Søknad sendes via regionalforvaltning.no med nødvendig teknisk dokumentasjon.</p>' },
    ],
  },
  {
    suffix: 'BÆRELOKA', tittel: 'Bærekraftig lokalsamfunn {region} 2026',
    kategori: 'Bærekraftig utvikling', status: 'AKTIV',
    kortBeskrivelse: 'Støtteordning for prosjekter som bidrar til mer bærekraftige lokalsamfunn i {region} med fokus på FNs bærekraftsmål.',
    naeringer: ['Offentlig administrasjon', 'Frivillig organisasjonsarbeid', 'Alle næringer'],
    mottakerStorrelse: ['Lite foretak', 'Mellomstort foretak'],
    soeknadsfrist: '2026-07-01', publisertFra: '2026-03-01', publisertTil: '2026-07-01',
    soknadsramme: 5000000,
    avsnitt: [
      { overskrift: 'Krav til søknaden', innhold: '<p>Søknaden må koble prosjektet tydelig til ett eller flere av FNs 17 bærekraftsmål og beskrive forventet effekt på lokalsamfunnet.</p>' },
    ],
  },
  {
    suffix: 'KLIMTRON', tittel: 'Klimatiltak {region} 2026',
    kategori: 'Klimatilpasning', status: 'AKTIV',
    kortBeskrivelse: 'Tilskudd til klimatilpasning og forebygging av klimarisiko i kommuner og bedrifter i {region}.',
    naeringer: ['Bygg- og anleggsvirksomhet', 'Landbruk', 'Offentlig administrasjon'],
    mottakerStorrelse: ['Lite foretak', 'Mellomstort foretak', 'Stort foretak'],
    soeknadsfrist: '2026-10-31', publisertFra: '2026-04-01', publisertTil: '2026-10-31',
    soknadsramme: 8000000,
    avsnitt: [
      { overskrift: 'Tilpasningsområder', innhold: '<ul><li>Flomsikring og overvannshåndtering</li><li>Skredforebygging</li><li>Tilpasning av bygg til ekstremvær</li><li>Klimarobuste transportsystemer</li></ul>' },
    ],
  },
  {
    suffix: 'GRØNNORD', tittel: 'Grønn omstilling {region} 2026',
    kategori: 'Grønn næringsomstilling', status: 'INAKTIV',
    kortBeskrivelse: 'Støtte til grønn næringsomstilling for bedrifter i {region}. Ordningen er midlertidig stanset i påvente av ny statsbudsjettbevilgning.',
    naeringer: ['Industri', 'Fiske og fangst', 'Sjøfart'],
    mottakerStorrelse: ['Lite foretak', 'Mellomstort foretak'],
    soeknadsfrist: '2025-11-30', publisertFra: '2025-05-01', publisertTil: '2025-11-30',
    soknadsramme: 4000000,
    avsnitt: [
      { overskrift: 'Status', innhold: '<p>Ordningen er midlertidig stanset. Ny utlysning forventes Q1 2026 etter statsbudsjettet er vedtatt.</p>' },
    ],
  },

  // ── Landbruk (5 rader) ──
  {
    suffix: 'LANDINNO', tittel: 'Landbruksinnovasjon {region} 2026',
    kategori: 'Landbruk og matproduksjon', status: 'AKTIV',
    kortBeskrivelse: 'Tilskudd til innovasjon og modernisering i landbruket i {region}. Prioritet til prosjekter som øker produksjonskapasitet eller reduserer klimaavtrykk.',
    naeringer: ['Jordbruk', 'Husdyrhold', 'Veksthusnæring', 'Matforedling'],
    mottakerStorrelse: ['Lite foretak', 'Mellomstort foretak'],
    soeknadsfrist: '2026-09-01', publisertFra: '2026-02-15', publisertTil: '2026-09-01',
    soknadsramme: 4000000,
    avsnitt: [
      { overskrift: 'Støttede tiltak', innhold: '<ul><li>Investering i ny landbruksteknologi</li><li>Presisjonsjordbruk og sensorer</li><li>Klimasmart husdyrhold</li><li>Lokal matproduksjon og kortreistmat</li></ul>' },
    ],
  },
  {
    suffix: 'ARKTLAND', tittel: 'Arktisk landbruk {region} 2026',
    kategori: 'Arktisk landbruk', status: 'AKTIV',
    kortBeskrivelse: 'Støtte til landbruksprosjekter i arktiske strøk i {region} med vekt på klimatilpasning og nyskapende driftsformer.',
    naeringer: ['Jordbruk', 'Reindrift', 'Veksthusproduksjon'],
    mottakerStorrelse: ['Lite foretak'],
    soeknadsfrist: '2026-10-01', publisertFra: '2026-02-01', publisertTil: '2026-10-01',
    soknadsramme: 2500000,
    avsnitt: [
      { overskrift: 'Særpreg', innhold: '<p>Ordningen tar hensyn til de særskilte utfordringene ved landbruk i arktisk klima, inkludert kortere vekstsesong, permafrost og samisk reindrift.</p>' },
    ],
  },
  {
    suffix: 'BODLAND', tittel: 'Landbruksstøtte {region} 2026',
    kategori: 'Kommunalt landbruksstøtte', status: 'AKTIV',
    kortBeskrivelse: 'Kommunalt tilskudd til landbruksdrift og bygdeutvikling i {region}. Støtten skal opprettholde aktiv landbruksdrift i kommunen.',
    naeringer: ['Jordbruk', 'Skogbruk', 'Husdyrhold'],
    mottakerStorrelse: ['Lite foretak'],
    soeknadsfrist: '2026-05-15', publisertFra: '2026-01-15', publisertTil: '2026-05-15',
    soknadsramme: 1200000,
    avsnitt: [
      { overskrift: 'Om ordningen', innhold: '<p>Tilskuddet skal bidra til å opprettholde aktiv landbruksdrift i {region} og sikre at matproduksjonsressursene utnyttes.</p>' },
    ],
  },
  {
    suffix: 'BYGDUTV', tittel: 'Bygdeutvikling {region} 2026',
    kategori: 'Bygde- og stedsutvikling', status: 'AKTIV',
    kortBeskrivelse: 'Støtte til stedsutvikling og attraktivitetstiltak i bygdesamfunn i {region}.',
    naeringer: ['Jordbruk', 'Reiseliv', 'Tjenesteyting', 'Handel'],
    mottakerStorrelse: ['Lite foretak', 'Mellomstort foretak'],
    soeknadsfrist: '2026-08-01', publisertFra: '2026-03-01', publisertTil: '2026-08-01',
    soknadsramme: 3000000,
    avsnitt: [
      { overskrift: 'Hva støttes', innhold: '<ul><li>Sentrumsutvikling og møteplasser</li><li>Bredbåndsutbygging i grissgrendte strøk</li><li>Lokale næringspark-initiativer</li><li>Attraktivitetstiltak for tilflytting</li></ul>' },
    ],
  },
  {
    suffix: 'MATPROD', tittel: 'Matproduksjon {region} 2026',
    kategori: 'Lokal matproduksjon', status: 'AKTIV',
    kortBeskrivelse: 'Tilskudd til utvikling av lokal matproduksjon og -foredling i {region}. Støtten skal bidra til økt matmangfold og kortreist mat.',
    naeringer: ['Produksjon av næringsmidler', 'Jordbruk', 'Fiske og fangst'],
    mottakerStorrelse: ['Lite foretak'],
    soeknadsfrist: '2026-07-15', publisertFra: '2026-02-01', publisertTil: '2026-07-15',
    soknadsramme: 1800000,
    avsnitt: [
      { overskrift: 'Prioriterte produkter', innhold: '<p>Lokale og tradisjonelle matprodukter, kortreist mat, bærekraftig havmat, og produkter med geografisk indikasjon prioriteres.</p>' },
    ],
  },

  // ── Teknologi og digitalisering (5 rader) ──
  {
    suffix: 'DIGINNOV', tittel: 'Digital innovasjon {region} 2026',
    kategori: 'Digitalisering og innovasjon', status: 'AKTIV',
    kortBeskrivelse: 'Tilskudd til digitale innovasjonsprosjekter i næringslivet i {region} med fokus på AI, automatisering og nye forretningsmodeller.',
    naeringer: ['Tjenester tilknyttet informasjonsteknologi', 'Databehandling og web-portaler', 'FoU innen naturvitenskap og teknikk'],
    mottakerStorrelse: ['Lite foretak', 'Mellomstort foretak'],
    soeknadsfrist: '2026-11-01', publisertFra: '2026-03-15', publisertTil: '2026-11-01',
    soknadsramme: 6000000,
    avsnitt: [
      { overskrift: 'Prioriterte teknologier', innhold: '<ul><li>Kunstig intelligens og maskinlæring</li><li>Automatisering og robotikk</li><li>IoT og sensorteknologi</li><li>Blokkjede og distribuerte løsninger</li></ul>' },
    ],
  },
  {
    suffix: 'TEKNKOMP', tittel: 'Teknologikompetanse {region} 2026',
    kategori: 'Teknologisk kompetanse', status: 'AKTIV',
    kortBeskrivelse: 'Støtte til oppbygging av teknologisk kompetanse i næringslivet og offentlig sektor i {region}.',
    naeringer: ['Alle næringer'],
    mottakerStorrelse: ['Lite foretak', 'Mellomstort foretak', 'Stort foretak'],
    soeknadsfrist: '2026-10-01', publisertFra: '2026-01-15', publisertTil: '2026-10-01',
    soknadsramme: 5000000,
    avsnitt: [
      { overskrift: 'Støttede aktiviteter', innhold: '<ul><li>Etterutdanning innen teknologi</li><li>Lærlingplasser i teknologibedrifter</li><li>Mentorprogrammer med teknologieksperter</li><li>Workshops og hackathons</li></ul>' },
    ],
  },
  {
    suffix: 'SMABEDRI', tittel: 'Småbedriftsstøtte {region} 2026',
    kategori: 'Gründerstøtte', status: 'AKTIV',
    kortBeskrivelse: 'Særskilt støtteordning for nyoppstartede bedrifter og gründere i {region}. Støtten dekker etableringskostnader og tidlig markedsarbeid.',
    naeringer: ['Alle næringer'],
    mottakerStorrelse: ['Lite foretak'],
    soeknadsfrist: '2026-12-01', publisertFra: '2026-01-01', publisertTil: '2026-12-01',
    soknadsramme: 2000000,
    avsnitt: [
      { overskrift: 'Hvem kan søke', innhold: '<p>Bedrifter som er under 2 år gamle på søknadstidspunktet og har organisasjonsnummer i {region}. Enkeltpersonforetak kan søke.</p>' },
      { overskrift: 'Hva støttes', innhold: '<ul><li>Etableringskostnader (inntil kr 30 000)</li><li>Første markedsføringskampanje</li><li>Prototyping og produktutvikling</li><li>Deltakelse på messer og salgsarenaer</li></ul>' },
    ],
  },
  {
    suffix: 'STARSUP', tittel: 'Oppstartsstøtte {region} 2026',
    kategori: 'Oppstart og etablering', status: 'AKTIV',
    kortBeskrivelse: 'Tilskudd og veiledning til gründere og startups i {region}. Inkluderer kobling mot mentorer og investormiljøer.',
    naeringer: ['Tjenester tilknyttet informasjonsteknologi', 'FoU', 'Alle næringer'],
    mottakerStorrelse: ['Lite foretak'],
    soeknadsfrist: '2026-09-01', publisertFra: '2026-02-01', publisertTil: '2026-09-01',
    soknadsramme: 3000000,
    avsnitt: [
      { overskrift: 'Programinnhold', innhold: '<ul><li>Oppstartsstipend på inntil kr 75 000</li><li>6 måneders mentorprogram</li><li>Tilgang til co-working space</li><li>Demo Day for investorer</li></ul>' },
    ],
  },
  {
    suffix: 'SMARTBY', tittel: 'Smart by-innovasjon {region} 2026',
    kategori: 'Smart by', status: 'AKTIV',
    kortBeskrivelse: 'Støtte til smart by-prosjekter som bruker teknologi for å forbedre bymiljø, mobilitet og innbyggertjenester i {region}.',
    naeringer: ['Tjenester tilknyttet informasjonsteknologi', 'Transport', 'Offentlig administrasjon'],
    mottakerStorrelse: ['Lite foretak', 'Mellomstort foretak', 'Stort foretak'],
    soeknadsfrist: '2026-10-15', publisertFra: '2026-03-01', publisertTil: '2026-10-15',
    soknadsramme: 12000000,
    avsnitt: [
      { overskrift: 'Smart by-satsinger', innhold: '<ul><li>Smarte transportsystemer</li><li>Sensorbasert parkeringsforvaltning</li><li>Energismarte bygg og kvartal</li><li>Innbyggerapp og digital dialog</li></ul>' },
      { overskrift: 'Samarbeidskrav', innhold: '<p>Prosjekter som involverer samarbeid mellom kommunen, næringslivet og FoU-miljøer prioriteres. Minst én av partene må ha erfaring med smart by-teknologi.</p>' },
    ],
  },
];

// ── Generer 30 rader ───────────────────────────────────────────────────────────
const rader = ARKETYPER.map((ark, i) => {
  const fv = FORVALTER[i];
  const region = fv.region;
  const fill = (s) => s.replace(/{region}/g, region);
  const ordningId = `${fv.kode}-${ark.suffix}-2026`;

  return {
    tilskuddsordningId: uuid(ordningId),
    ordningId,
    tittel: fill(ark.tittel),
    kortBeskrivelse: fill(ark.kortBeskrivelse),
    status: ark.status,
    regionsnivaa: fv.kode,
    region,
    satsingsomraade: ark.kategori,
    naeringer: ark.naeringer,
    soeknadsfrist: ark.soeknadsfrist,
    mottakerStorrelse: ark.mottakerStorrelse,
    forvalter: {
      organisasjonsnummer: fv.orgnr,
      navn: fv.navn,
      rolleType: 'FORVALTER',
      kontaktEpost: fv.epost,
    },
    publisertFra: ark.publisertFra,
    publisertTil: ark.publisertTil,
    soknadsramme: ark.soknadsramme,
    avsnitt: ark.avsnitt.map(a => ({ overskrift: a.overskrift, innhold: fill(a.innhold) })),
  };
});

// ── Skriv testdata JSON ───────────────────────────────────────────────────────
const utFil = join(__dirname, 'tilskudd-testdata.json');
writeFileSync(utFil, JSON.stringify(rader, null, 2), 'utf-8');
console.log(`✓ Genererte ${rader.length} rader → ${utFil}`);

// ── Injiser i testdata-hub.html ───────────────────────────────────────────────
const htmlFil = join(__dirname, '..', 'docs', 'testdata-hub.html');
let html = readFileSync(htmlFil, 'utf-8');
// Erstatt alt mellom de to markørene (eller første placeholder)
html = html.replace(
  /const TESTDATA = [\s\S]*?;(\s*\n)/,
  `const TESTDATA = ${JSON.stringify(rader, null, 2)};\n`
);
writeFileSync(htmlFil, html, 'utf-8');
console.log(`✓ Injiserte testdata i docs/testdata-hub.html`);
