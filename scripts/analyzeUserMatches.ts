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
  <title>User Compatibility Matrix</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
      padding: 20px;
      background: #f5f5f5;
    }
    h1 {
      color: #333;
    }
    .info {
      background: white;
      padding: 15px;
      border-radius: 8px;
      margin-bottom: 20px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    table {
      border-collapse: collapse;
      background: white;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      border-radius: 8px;
      overflow: hidden;
    }
    th, td {
      border: 1px solid #ddd;
      padding: 12px 8px;
      text-align: center;
      min-width: 60px;
      max-width: 120px;
      word-break: break-all;
      font-size: 11px;
      line-height: 1.3;
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
      max-width: 150px;
    }
    td.row-header {
      background-color: #f8f9fa;
      font-weight: 600;
      text-align: left;
      max-width: 150px;
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
    <p><strong>Total Users:</strong> ${users.length}</p>
    <p><strong>Score Range:</strong> 0.0 (no match) to 1.0 (perfect match)</p>
    <p><strong>Algorithm:</strong> Average of interest overlap and trait similarity (cosine similarity)</p>
    <p><strong>How to Read:</strong> Pick a ROW (you looking for events), then scan across COLUMNS (potential hosts). The score shows how much of YOUR interests each person covers. Higher = better match for you.</p>
  </div>
  
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
  
  <div class="legend">
    <div class="legend-item">
      <div class="legend-color score-high"></div>
      <span>0.8 - 1.0 (Excellent Match)</span>
    </div>
    <div class="legend-item">
      <div class="legend-color score-med-high"></div>
      <span>0.6 - 0.8 (Good Match)</span>
    </div>
    <div class="legend-item">
      <div class="legend-color score-med"></div>
      <span>0.4 - 0.6 (Moderate Match)</span>
    </div>
    <div class="legend-item">
      <div class="legend-color score-med-low"></div>
      <span>0.2 - 0.4 (Low Match)</span>
    </div>
    <div class="legend-item">
      <div class="legend-color score-low"></div>
      <span>0.0 - 0.2 (Very Low Match)</span>
    </div>
  </div>
</body>
</html>
`;
  return html;
}

function main() {
  const csvPath = path.join(
    __dirname,
    "../assets/data/Characteristics and preferences_January 29, 2026_17.32.csv",
  );

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
