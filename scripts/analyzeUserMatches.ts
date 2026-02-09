import { parse } from "csv-parse/sync";
import * as fs from "fs";
import * as path from "path";

// Import the actual match scoring functions
import { getInterestOverlapScore } from "../backend/server/services/event/getInterestOverlapScore/getInterestOverlapScore";
import { getTraitSimilarityScore } from "../backend/server/services/event/getTraitSimilarityScore/getTraitSimilarityScore";

interface UserData {
  name: string;
  interests: string[];
  traits: Record<string, number>;
}

function labelToSlug(label: string): string {
  return label
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

function getMatchScore(userA: UserData, userB: UserData): number {
  const interestScore = getInterestOverlapScore(
    userA.interests,
    userB.interests,
  );
  const traitScore = getTraitSimilarityScore(userA.traits, userB.traits);
  return (interestScore + traitScore) / 2;
}

function parseCSV(csvPath: string): UserData[] {
  const fileContent = fs.readFileSync(csvPath, "utf-8");

  // Split into lines and use first row (with short codes) as headers
  const lines = fileContent.split("\n");
  const shortHeaders = lines[0]; // StartDate, EndDate, ..., Q3, Q4, Q11
  const dataLines = lines.slice(3); // Skip both header rows and the ImportId row
  const csvWithShortHeaders = [shortHeaders, ...dataLines].join("\n");

  const records = parse(csvWithShortHeaders, {
    columns: true,
    skip_empty_lines: true,
    relax_quotes: true,
  }) as Record<string, string>[];

  console.log(`📋 Total CSV records: ${records.length}`);
  if (records.length > 0) {
    console.log(`📝 All columns:`, Object.keys(records[0]));
  }

  const users: UserData[] = [];

  for (let i = 0; i < records.length; i++) {
    const record = records[i];

    // Skip header rows (those with ImportId in fields)
    if (record["ResponseId"]?.includes("ImportId")) {
      console.log(`⏭️  Skipping metadata row ${i + 1}`);
      continue;
    }

    // Use full email or phone number as identifier
    let name = `User ${users.length + 1}`;
    const contact = record["Q11"]; // Email/phone column
    if (contact && typeof contact === "string" && contact.trim()) {
      name = contact.trim();
    }

    // Parse interests from Q3
    const interestsRaw = record["Q3"];
    const interests: string[] = [];
    if (interestsRaw && typeof interestsRaw === "string") {
      const interestLabels = interestsRaw.split(",").map((s) => s.trim());
      for (const label of interestLabels) {
        if (label) {
          interests.push(labelToSlug(label));
        }
      }
    }

    // Parse traits from Q4
    const traitsRaw = record["Q4"];
    const traits: Record<string, number> = {};
    if (traitsRaw && typeof traitsRaw === "string") {
      const traitLabels = traitsRaw.split(",").map((s) => s.trim());
      for (const label of traitLabels) {
        if (label) {
          const slug = labelToSlug(label);
          traits[slug] = 1.0;
        }
      }
    }

    console.log(
      `👤 Processing ${name}: ${interests.length} interests, ${Object.keys(traits).length} traits`,
    );

    // Only include users with at least some data
    if (interests.length > 0 || Object.keys(traits).length > 0) {
      users.push({ name, interests, traits });
    } else {
      console.log(`⚠️  Skipping ${name} - no data`);
    }
  }

  return users;
}

function generateHTMLGrid(users: UserData[], scores: number[][]): string {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>User Compatibility Matrix</title>
  <style>
    * {
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
      margin: 0;
      padding: 20px;
      background: #f5f5f5;
      max-width: 100vw;
      overflow-x: hidden;
    }
    h1 {
      color: #333;
      margin-top: 0;
      font-size: 24px;
    }
    .info {
      background: white;
      padding: 15px;
      border-radius: 8px;
      margin-bottom: 20px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      font-size: 14px;
    }
    .controls {
      background: white;
      padding: 15px;
      border-radius: 8px;
      margin-bottom: 20px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      display: flex;
      gap: 15px;
      align-items: center;
      flex-wrap: wrap;
    }
    .controls button {
      padding: 8px 16px;
      background: #4f47e5;
      color: white;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
    }
    .controls button:hover {
      background: #3d37c7;
    }
    .zoom-level {
      font-weight: 600;
      color: #4f47e5;
    }
    .table-container {
      background: white;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      border-radius: 8px;
      overflow: auto;
      max-height: calc(100vh - 300px);
      max-width: calc(100vw - 40px);
    }
    table {
      border-collapse: collapse;
      background: white;
      width: 100%;
    }
    th, td {
      border: 1px solid #ddd;
      padding: 8px 6px;
      text-align: center;
      min-width: 50px;
      max-width: 100px;
      word-break: break-word;
      font-size: 11px;
      line-height: 1.2;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    th {
      background-color: #4f47e5;
      color: white;
      font-weight: 600;
      position: sticky;
      top: 0;
      z-index: 10;
    }
    th.row-header {
      background-color: #4f47e5;
      color: white;
      text-align: left;
      position: sticky;
      left: 0;
      z-index: 11;
      max-width: 120px;
    }
    td.row-header {
      background-color: #f8f9fa;
      font-weight: 600;
      text-align: left;
      max-width: 120px;
      position: sticky;
      left: 0;
      z-index: 9;
    }
    .score-cell {
      font-weight: 500;
      transition: all 0.2s;
    }
    .score-cell:hover {
      transform: scale(1.1);
      box-shadow: 0 0 8px rgba(79, 71, 229, 0.3);
    }
    .score-high { background-color: #22c55e; color: white; }
    .score-med-high { background-color: #84cc16; color: white; }
    .score-med { background-color: #eab308; color: white; }
    .score-med-low { background-color: #f97316; color: white; }
    .score-low { background-color: #ef4444; color: white; }
    .score-self { background-color: #e5e7eb; color: #6b7280; }
    .legend {
      display: flex;
      gap: 15px;
      margin-top: 20px;
      flex-wrap: wrap;
    }
    .legend-item {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .legend-color {
      width: 30px;
      height: 20px;
      border-radius: 4px;
    }
  </style>
</head>
<body>
  <h1>🤝 User Compatibility Matrix</h1>
  <div class="info">
    <p style="margin: 5px 0;"><strong>Total Users:</strong> ${users.length}</p>
    <p style="margin: 5px 0;"><strong>Score Range:</strong> 0.0 (no match) to 1.0 (perfect match)</p>
    <p style="margin: 5px 0;"><strong>How to Read:</strong> Pick a ROW (you looking for events), then scan across COLUMNS (potential hosts). Higher score = better match for you.</p>
  </div>
  
  <div class="controls">
    <button onclick="zoomIn()">Zoom In (+)</button>
    <button onclick="zoomOut()">Zoom Out (-)</button>
    <button onclick="resetZoom()">Reset (100%)</button>
    <span class="zoom-level">Zoom: <span id="zoom-display">100%</span></span>
  </div>
  
  <div class="table-container">
  <table>
    <thead>
      <tr>
        <th class="row-header">User</th>
        ${users.map((u) => `<th>${u.name}</th>`).join("")}
      </tr>
    </thead>
    <tbody>
      ${users
        .map(
          (userA, i) => `
        <tr>
          <td class="row-header">${userA.name}</td>
          ${users
            .map((userB, j) => {
              const score = scores[i][j];
              let className = "score-cell";
              if (i === j) {
                className += " score-self";
              } else if (score >= 0.8) {
                className += " score-high";
              } else if (score >= 0.6) {
                className += " score-med-high";
              } else if (score >= 0.4) {
                className += " score-med";
              } else if (score >= 0.2) {
                className += " score-med-low";
              } else {
                className += " score-low";
              }
              return `<td class="${className}">${score.toFixed(2)}</td>`;
            })
            .join("")}
        </tr>
      `,
        )
        .join("")}
    </tbody>
  </table>
  </div>
  
  <div class="legend">
    <div class="legend-item">
      <div class="legend-color score-high"></div>
      <span>0.8 - 1.0 (Excellent)</span>
    </div>
    <div class="legend-item">
      <div class="legend-color score-med-high"></div>
      <span>0.6 - 0.8 (Good)</span>
    </div>
    <div class="legend-item">
      <div class="legend-color score-med"></div>
      <span>0.4 - 0.6 (Moderate)</span>
    </div>
    <div class="legend-item">
      <div class="legend-color score-med-low"></div>
      <span>0.2 - 0.4 (Low)</span>
    </div>
    <div class="legend-item">
      <div class="legend-color score-low"></div>
      <span>0.0 - 0.2 (Very Low)</span>
    </div>
  </div>
  
  <script>
    let currentZoom = 100;
    
    function updateZoom() {
      const table = document.querySelector('table');
      table.style.transform = \`scale(\${currentZoom / 100})\`;
      table.style.transformOrigin = 'top left';
      document.getElementById('zoom-display').textContent = currentZoom + '%';
    }
    
    function zoomIn() {
      if (currentZoom < 150) {
        currentZoom += 10;
        updateZoom();
      }
    }
    
    function zoomOut() {
      if (currentZoom > 50) {
        currentZoom -= 10;
        updateZoom();
      }
    }
    
    function resetZoom() {
      currentZoom = 100;
      updateZoom();
    }
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (e.key === '+' || e.key === '=') {
        e.preventDefault();
        zoomIn();
      } else if (e.key === '-' || e.key === '_') {
        e.preventDefault();
        zoomOut();
      } else if (e.key === '0') {
        e.preventDefault();
        resetZoom();
      }
    });
  </script>
</body>
</html>
`;
  return html;
}

function main() {
  // Dynamically find the CSV file in the data directory
  const dataDir = path.join(__dirname, "../assets/data");
  const files = fs.readdirSync(dataDir);
  const csvFile = files.find((file) => file.endsWith(".csv"));

  if (!csvFile) {
    console.error("❌ No CSV file found in assets/data directory");
    return;
  }

  const csvPath = path.join(dataDir, csvFile);

  console.log("📊 Analyzing user compatibility...\n");
  console.log(`Reading CSV from: ${csvPath}\n`);

  const users = parseCSV(csvPath);
  console.log(`\n✓ Parsed ${users.length} users\n`);

  if (users.length === 0) {
    console.error("❌ No users found! Check CSV parsing logic.");
    return;
  }

  // Calculate match scores for all pairs
  console.log("🔄 Calculating match scores...\n");
  const scores: number[][] = [];
  for (let i = 0; i < users.length; i++) {
    scores[i] = [];
    for (let j = 0; j < users.length; j++) {
      const score = getMatchScore(users[i], users[j]);
      scores[i][j] = score;
    }
  }

  // Generate HTML output
  const html = generateHTMLGrid(users, scores);
  const outputPath = path.join(__dirname, "../user-compatibility-matrix.html");
  fs.writeFileSync(outputPath, html);

  console.log(`✓ Generated HTML matrix at: ${outputPath}`);
  console.log("\n📈 Summary Statistics:");

  // Calculate some stats (excluding self-matches)
  let sum = 0;
  let count = 0;
  let max = 0;
  let min = 1;
  let maxPair = ["", ""];
  let minPair = ["", ""];

  for (let i = 0; i < users.length; i++) {
    for (let j = 0; j < users.length; j++) {
      if (i !== j) {
        const score = scores[i][j];
        sum += score;
        count++;
        if (score > max) {
          max = score;
          maxPair = [users[i].name, users[j].name];
        }
        if (score < min) {
          min = score;
          minPair = [users[i].name, users[j].name];
        }
      }
    }
  }

  const avg = sum / count;

  console.log(`  Average compatibility: ${avg.toFixed(3)}`);
  console.log(
    `  Highest compatibility: ${max.toFixed(3)} (${maxPair[0]} ↔ ${maxPair[1]})`,
  );
  console.log(
    `  Lowest compatibility: ${min.toFixed(3)} (${minPair[0]} ↔ ${minPair[1]})`,
  );
  console.log(`\n🎉 Done! Matrix shows compatibility scores from 0.0 to 1.0`);
}

main();
