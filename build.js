// --- MAP INTEGRATED APPLICATION --- //


// Uses attestations.geojson data to build 3 organization structures //
const fs = require("fs").promises;  // shorthand fileSystem
const src = JSON.parse(fs.readFileSync("attestations.geojson", "utf8"));
const atts = src.features.map(f => f.properties);
const byId = new Map(atts.map(a => [a.attestation_id, a]));

// NAME NORMALIZATION FOR SEARCH //
const fold = s => s.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase()
    .replace(/k/g, "i").replace(/v/g, "u");
// use Levenshtein distance to find minimum number of single-character edits required to change one word to the other
function levDist(a, b) {
    const d = Array.from({ length: a.length +1 }, (_, i) => [i, ...Array(b.length).fill(0)])
    for (let j = 1; j <= b.length; j++) d[0][j] = j;
    for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++)
        d[i][j] = Math.min(d[i-1][j] + 1, d[i][j-1] + 1, d[i-1][j-1] + (a[i-1] === b[j-1] ? 0 : 1));
}
const nameMatch = (x, y) => {
    const a = fold(x), b = fold(y);
    return a === b ? "exact" : levDist(a, b) <= 2 ? "variant" : null;
};

// ARRAY FOR NESTED ATTRIBUTES //
const councils = Object.entries(src.councils)
    .map(([council_id, c]) => ({
        council_id,
        dataset: "spanishbishoprics",
        name: c.name,
        year: c.year,
        assemblies: [],
        sessions: [],
        reliability: null,
        legacy: {
            key: c.legacy_key,
            total_signers: c.legacy_total_signers,
            unknown_see_signers: c.legacy_unknown_see_signers,
            potential_bishops: c.legacy_potential_bishops
        }
    }))
    .sort((a, b) => a.year - b.year)
;

// TABLE FOR INTERACTIONS WITHIN A COUNCIL //
const interactions = [];




// --- END OF SCRIPT --- // 