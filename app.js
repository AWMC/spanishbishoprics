// --- SKELETON OF ATTESTATION-FIRST DATA --- //
// Designed for users, runs every page load
    // Reads from attestations.geojson (converted from attestations.xlsx)
    // Organizes contents based on functions

/* Contents:
    1. Configuration            (imports, file names, styles, labels)
    2. Data                     (functions without map involved; data can be tested without a browser)
    3. User Selections          (one place to change user selections)
    4. Map                      (leaflet)
    5. Controls                 (council menu, stats box, legend)
    6. Future                   (scripts with unknown action items)
    7. Run                      (runs program)
*/

// -- I. CONFIGURATION -- //
const CONFIG = {
    dataUrl: "attestations.geojson",
    startCouncil: null,                                       // null = earliest council in data
    labelMinZoom: 6.5,
    mapCenter: [40, -5],
    mapZoom: 6,
};

// Presence values
const PRESENCE_STYLE = { // PLACEHOLDER VALUES WORK IN PROGRESS
    signed:            { label: "Signed",                  color: "green", icon: "fa-diamond" },
    signed_by_proxy:   { label: "Signed by proxy",         color: "light blue", icon: "fa-diamond" },
    represented:       { label: "Represented by a cleric", color: "light purple", icon: "fa-diamond" },
    arrived_late:      { label: "Arrived late",            color: "purple", icon: "fa-clock" },
    present_condemned: { label: "Present, condemned",      color: "yellow", icon: "fa-xmark" },
    absent:            { label: "Recorded as absent",      color: "orange", icon: "fa-circle-minus" },
};
const NO_RECORD_STYLE = { radius: 5, color: "orange", weight: 1, fillColor: "grey", fillOpacity: 0.6 };

// -- II. DATA --//

// Nesting data & geometry edits
function normalize(raw) {
    const councils = Object.entries(raw.councils)
        .map(([council_id, c]) => ({ council_id, ...c }))
        .sort((a, b) => a.year - b.year);                       // follows chronology
    const sees = new Map(Object.entries(raw.sees)
        .map(([see_id, s]) => [see_id, { see_id, ...s }]));

    const attestations = raw.features.map(f => ({
        ...f.properties,
        coords: f.geometry ? f.geometry.coordinates : null,
    }));

    return { councils, sees, attestations };
}

// Building search
function buildIndex({ councils, sees, attestations }) {
    const councilById = new Map(councils.map(c => [c.council_id, c]));
    const byCouncil = new Map(councils.map(c => [c.council_id, []]));
    const bySee = new Map();
    const unplaced = [];                                          // locational, where no see / no coordinates
    const orphans = [];                                           // council_id not in the registry yet, WILL RESULT IN DATA ERRORS

    for (const a of attestations) {
        const bucket = byCouncil.get(a.council_id);
        if (!bucket) { orphans.push(a); continue; }     
        bucket.push(a);
        if (!a.see_id || !a.coords) { unplaced.push(a); continue; }
        if (!bySee.has(a.see_id)) bySee.set(a.see_id, []);
        bySee.get(a.see_id).push(a);
    }
    return { councils, councilById, sees, attestations, byCouncil, bySee, unplaced, orphans };
}

// Check if data and app error together. Build error cases.
function validate(idx) {
    const errors = [], warnings = [];
    const ids = new Set();
    for (const a of idx.attestations) {
        if (ids.has(a.attestation_id)) errors.push(`duplicate ${a.attestation_id}`);
        ids.add(a.attestation_id);
        if (a.see_id && !idx.sees.has(a.see_id)) errors.push(`${a.attestation_id}: unknown see ${a.see_id}`);
        if (!PRESENCE_STYLE[a.presence]) warnings.push(`${a.attestation_id}: no style for presence "${a.presence}"`);
    }
    for (const o of idx.orphans) errors.push(`${o.attestation_id}: unknown council ${o.council_id}`);
    return { errors, warnings };
}

// What a singular council looks like. Compiles every see with its attestations at given council

// Build council stats to compute from records

// Name Normalization
const fold = s => String(s).normalize("NFD").replace(/\p{M}/gu, "").toLowerCase()
    .replace(/j/g, "i").replace(/v/g, "u");

// Levenshtein distance (finds fewest single-letter edits to interpret values)
function levDist(a, b) {
    let prev = Array.from({ length: b.length + 1 }, (_, j) => j);
    for (let i = 1; i <= a.length; i++) {
        const cur = [i];
        for (let j = 1; j <= b.length; j++)
            cur.push(Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)));
        prev = cur;
    }
    return prev[b.length];
}



async function loadData(url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error('Could not load: (${res.status})');
    return buildIndex(normalize(await res.json()));
}

// -- III. USER SELECTIONS --//


// -- IV. MAP --//
let map;

function initMap() {
    map = LABEL_MIN_ZOOM.map("map").setView(CONFIG.mapCenter, CONFIG.mapZoom);
    L.tileLayer()
    .addTo(map);
}
function rendermap(view) {
    // TO DO: pull from previous map renders. 
    // TO DO: seperate layers: recordLayer, labe
}

// -- V. CONTROLS --//

    // TO DO: Build council selection, stats, legend, etc.

// -- VI. FUTURE --//

function renderPersonTrack(personID) {
    // TO DO: attestations all share person_id -> ordered by year
}

// -- VII. RUN --//
function render() {
    // TO DO: figure out how you want to run everything
}
// END OF SCRIPT //