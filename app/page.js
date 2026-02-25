"use client";

import { useState } from "react";

export default function Home() {
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [csvData, setCsvData] = useState(null);
  const [tableData, setTableData] = useState([]);
  const [error, setError] = useState("");
  const [phase, setPhase] = useState("idle"); // idle | searching | generating | done

  function parseCSV(text) {
    const lines = text.trim().split("\n");
    if (lines.length < 2) return [];
    const headers = lines[0].split(",").map((h) => h.trim().replace(/"/g, ""));
    return lines.slice(1).map((line) => {
      // Handle quoted fields with commas inside
      const cols = [];
      let current = "";
      let inQuotes = false;
      for (let i = 0; i < line.length; i++) {
        if (line[i] === '"') {
          inQuotes = !inQuotes;
        } else if (line[i] === "," && !inQuotes) {
          cols.push(current.trim());
          current = "";
        } else {
          current += line[i];
        }
      }
      cols.push(current.trim());
      const row = {};
      headers.forEach((h, i) => {
        row[h] = cols[i] || "";
      });
      return row;
    });
  }

  function downloadCSV() {
    const blob = new Blob([csvData], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `keywords-${topic.slice(0, 30).replace(/\s+/g, "-")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!topic.trim()) return;

    setLoading(true);
    setCsvData(null);
    setTableData([]);
    setError("");
    setPhase("searching");

    // Fake phase transitions for UX
    const phaseTimer = setTimeout(() => setPhase("generating"), 8000);

    try {
      const res = await fetch("/api/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic }),
      });

      clearTimeout(phaseTimer);

      const data = await res.json();

      if (!res.ok || data.error) {
        setError(data.error || "Something went wrong.");
        setPhase("idle");
        return;
      }

      setCsvData(data.csv);
      setTableData(parseCSV(data.csv));
      setPhase("done");
    } catch {
      clearTimeout(phaseTimer);
      setError("Network error. Please try again.");
      setPhase("idle");
    } finally {
      setLoading(false);
    }
  }

  const categoryColors = {
    "Pain Point": "#ff6b6b",
    Desire: "#51cf66",
    Identity: "#339af0",
    "Solution Seeking": "#f59f00",
    Emotion: "#cc5de8",
    Transformation: "#20c997",
  };

  const getCategoryColor = (cat) => {
    for (const [key, val] of Object.entries(categoryColors)) {
      if (cat && cat.toLowerCase().includes(key.toLowerCase())) return val;
    }
    return "#868e96";
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=DM+Sans:wght@300;400;500&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --bg: #FBFAF9;
          --surface: #ffffff;
          --surface2: #f5f3f1;
          --border: #e8e3df;
          --border-light: #f0ece8;
          --accent: #d4b2e4;
          --accent-dark: #b48dcb;
          --accent-soft: #f0e6f7;
          --text: #2a2220;
          --muted: #9a8f8a;
          --muted-light: #c4b8b3;
          --success: #7abf8e;
        }

        body {
          background: var(--bg);
          color: var(--text);
          font-family: 'DM Sans', sans-serif;
          min-height: 100vh;
          overflow-x: hidden;
        }

        .container {
          max-width: 860px;
          margin: 0 auto;
          padding: 72px 32px 100px;
        }

        header {
          text-align: center;
          margin-bottom: 64px;
          animation: fadeUp 0.8s ease forwards;
        }

        .eyebrow {
          font-family: 'DM Sans', sans-serif;
          font-size: 10px;
          font-weight: 500;
          letter-spacing: 4px;
          text-transform: uppercase;
          color: var(--accent-dark);
          margin-bottom: 20px;
        }

        h1 {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(40px, 6vw, 68px);
          font-weight: 300;
          line-height: 1.08;
          letter-spacing: -1px;
          color: var(--text);
          margin-bottom: 20px;
        }

        h1 em {
          font-style: italic;
          color: var(--accent-dark);
        }

        .subtitle {
          font-size: 15px;
          color: var(--muted);
          max-width: 420px;
          margin: 0 auto;
          line-height: 1.7;
          font-weight: 300;
        }

        .divider {
          width: 40px;
          height: 1px;
          background: var(--accent);
          margin: 28px auto;
          opacity: 0.6;
        }

        .card {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 4px;
          padding: 48px;
          margin-bottom: 32px;
          animation: fadeUp 0.8s ease 0.1s both;
          box-shadow: 0 1px 3px rgba(42,34,32,0.04), 0 4px 24px rgba(42,34,32,0.03);
        }

        .input-group {
          margin-bottom: 28px;
        }

        label {
          display: block;
          font-size: 10px;
          font-weight: 500;
          letter-spacing: 3px;
          color: var(--muted);
          margin-bottom: 12px;
          text-transform: uppercase;
        }

        textarea {
          width: 100%;
          background: var(--bg);
          border: 1px solid var(--border);
          border-radius: 3px;
          padding: 16px 20px;
          font-family: 'DM Sans', sans-serif;
          font-size: 15px;
          color: var(--text);
          resize: vertical;
          min-height: 108px;
          transition: border-color 0.2s, box-shadow 0.2s;
          outline: none;
          line-height: 1.6;
        }

        textarea:focus {
          border-color: var(--accent);
          box-shadow: 0 0 0 3px rgba(212,178,228,0.2);
        }

        textarea::placeholder { color: var(--muted-light); }

        .examples {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 14px;
        }

        .example-chip {
          background: transparent;
          border: 1px solid var(--border);
          border-radius: 2px;
          padding: 5px 13px;
          font-size: 11px;
          color: var(--muted);
          cursor: pointer;
          transition: all 0.2s;
          font-family: 'DM Sans', sans-serif;
          letter-spacing: 0.3px;
        }

        .example-chip:hover {
          border-color: var(--accent);
          color: var(--accent-dark);
          background: var(--accent-soft);
        }

        .btn {
          width: 100%;
          padding: 17px 32px;
          background: var(--accent);
          border: none;
          border-radius: 3px;
          color: white;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          font-weight: 500;
          letter-spacing: 2px;
          text-transform: uppercase;
          cursor: pointer;
          transition: all 0.25s;
        }

        .btn:hover:not(:disabled) {
          background: var(--accent-dark);
          transform: translateY(-1px);
          box-shadow: 0 6px 24px rgba(212,178,228,0.35);
        }

        .btn:disabled {
          opacity: 0.45;
          cursor: not-allowed;
        }

        .loading-state {
          text-align: center;
          padding: 56px 24px;
          animation: fadeUp 0.4s ease;
        }

        .spinner {
          width: 36px;
          height: 36px;
          border: 2px solid var(--border);
          border-top-color: var(--accent);
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 28px;
        }

        .phase-text {
          font-family: 'Cormorant Garamond', serif;
          font-size: 22px;
          font-weight: 400;
          color: var(--text);
          margin-bottom: 8px;
        }

        .phase-sub {
          font-size: 13px;
          color: var(--muted);
          font-weight: 300;
        }

        .error-box {
          background: #fff5f5;
          border: 1px solid #fdd;
          border-radius: 3px;
          padding: 14px 18px;
          color: #c0675a;
          font-size: 13px;
          margin-top: 16px;
        }

        .results-header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          margin-bottom: 28px;
          flex-wrap: wrap;
          gap: 16px;
          animation: fadeUp 0.4s ease;
          padding-bottom: 24px;
          border-bottom: 1px solid var(--border-light);
        }

        .results-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 28px;
          font-weight: 400;
          color: var(--text);
          line-height: 1.2;
        }

        .results-meta {
          font-size: 12px;
          color: var(--muted);
          margin-top: 4px;
          font-weight: 300;
        }

        .download-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          background: transparent;
          border: 1px solid var(--success);
          border-radius: 3px;
          padding: 10px 20px;
          color: var(--success);
          font-family: 'DM Sans', sans-serif;
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          cursor: pointer;
          transition: all 0.2s;
        }

        .download-btn:hover {
          background: #f0faf3;
          transform: translateY(-1px);
        }

        .table-wrap {
          overflow-x: auto;
          border: 1px solid var(--border);
          border-radius: 4px;
          animation: fadeUp 0.5s ease 0.1s both;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          font-size: 13px;
          background: var(--surface);
        }

        thead tr {
          background: var(--surface2);
          border-bottom: 1px solid var(--border);
        }

        th {
          padding: 13px 16px;
          text-align: left;
          font-family: 'DM Sans', sans-serif;
          font-size: 9px;
          font-weight: 500;
          letter-spacing: 2.5px;
          text-transform: uppercase;
          color: var(--muted);
          white-space: nowrap;
        }

        tbody tr {
          border-bottom: 1px solid var(--border-light);
          transition: background 0.15s;
        }

        tbody tr:last-child { border-bottom: none; }
        tbody tr:hover { background: var(--accent-soft); }

        td {
          padding: 13px 16px;
          vertical-align: middle;
          color: var(--text);
          line-height: 1.4;
        }

        td:first-child {
          font-weight: 400;
          color: var(--text);
        }

        .category-badge {
          display: inline-block;
          padding: 3px 10px;
          border-radius: 2px;
          font-size: 10px;
          font-weight: 500;
          letter-spacing: 0.5px;
          white-space: nowrap;
        }

        .platform-badge {
          display: inline-block;
          background: var(--surface2);
          border: 1px solid var(--border);
          padding: 3px 9px;
          border-radius: 2px;
          font-size: 10px;
          color: var(--muted);
          white-space: nowrap;
          letter-spacing: 0.3px;
        }

        .notes-cell {
          color: var(--muted);
          font-size: 12px;
          max-width: 220px;
          font-weight: 300;
          line-height: 1.5;
        }

        .reset-btn {
          display: block;
          margin: 36px auto 0;
          background: none;
          border: 1px solid var(--border);
          border-radius: 3px;
          padding: 10px 28px;
          color: var(--muted);
          font-family: 'DM Sans', sans-serif;
          font-size: 11px;
          letter-spacing: 2px;
          text-transform: uppercase;
          cursor: pointer;
          transition: all 0.2s;
        }

        .reset-btn:hover {
          border-color: var(--accent);
          color: var(--accent-dark);
        }

        .stats-row {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
          margin-bottom: 28px;
          animation: fadeUp 0.4s ease 0.05s both;
        }

        .stat-chip {
          background: var(--accent-soft);
          border: 1px solid rgba(212,178,228,0.3);
          border-radius: 3px;
          padding: 10px 20px;
          font-size: 11px;
          color: var(--muted);
          letter-spacing: 0.5px;
        }

        .stat-chip strong {
          font-family: 'Cormorant Garamond', serif;
          font-size: 26px;
          font-weight: 400;
          display: block;
          color: var(--accent-dark);
          line-height: 1.1;
          margin-bottom: 2px;
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        @media (max-width: 600px) {
          .card { padding: 28px 24px; }
          .container { padding: 48px 20px 80px; }
          .results-header { flex-direction: column; align-items: flex-start; }
        }
      `}</style>

      <div className="container">
        <header>
          <div className="eyebrow">For Coaches &amp; Consultants</div>
          <h1>
            Find the words your<br />
            <em>ideal clients are searching for</em>
          </h1>
          <div className="divider" />
          <p className="subtitle">
            Describe your ideal client. We search the web for their real pain points and turn them into keywords that get you found.
          </p>
        </header>

        {phase !== "done" && (
          <div className="card">
            <form onSubmit={handleSubmit}>
              <div className="input-group">
                <label>Describe your ideal client & their pain points</label>
                <textarea
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g. burnt out female entrepreneurs who can't switch off and struggle with work-life balance..."
                  disabled={loading}
                />
                <div className="examples">
                  {[
                    "women in their 40s going through divorce",
                    "first-time managers who feel overwhelmed",
                    "solopreneurs struggling with productivity",
                    "people recovering from burnout",
                    "new mums returning to work",
                  ].map((ex) => (
                    <button
                      key={ex}
                      type="button"
                      className="example-chip"
                      onClick={() => setTopic(ex)}
                      disabled={loading}
                    >
                      {ex}
                    </button>
                  ))}
                </div>
              </div>

              {!loading && (
                <button className="btn" type="submit" disabled={!topic.trim()}>
                  Generate Keyword Research →
                </button>
              )}
            </form>

            {loading && (
              <div className="loading-state">
                <div className="spinner" />
                <div className="phase-text">
                  {phase === "searching"
                    ? "🔍 Searching Reddit, forums & social media..."
                    : "✍️ Generating your keyword strategy..."}
                </div>
                <div className="phase-sub">
                  {phase === "searching"
                    ? "Finding real complaints, frustrations and desires"
                    : "Turning pain points into discoverable keywords"}
                </div>
              </div>
            )}

            {error && <div className="error-box">⚠️ {error}</div>}
          </div>
        )}

        {phase === "done" && tableData.length > 0 && (
          <>
            <div className="results-header">
              <div>
                <div className="results-title">Your Keyword Strategy</div>
                <div className="results-meta">for: "{topic}"</div>
              </div>
              <button className="download-btn" onClick={downloadCSV}>
                ↓ Download CSV
              </button>
            </div>

            <div className="stats-row">
              <div className="stat-chip">
                <strong>{tableData.length}</strong>
                Keywords
              </div>
              <div className="stat-chip">
                <strong>
                  {new Set(tableData.map((r) => r.Category)).size}
                </strong>
                Categories
              </div>
              <div className="stat-chip">
                <strong>
                  {new Set(tableData.map((r) => r.Platform)).size}
                </strong>
                Platforms
              </div>
            </div>

            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Keyword</th>
                    <th>Category</th>
                    <th>Platform</th>
                    <th>Intent</th>
                    <th>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {tableData.map((row, i) => (
                    <tr key={i}>
                      <td>{row.Keyword}</td>
                      <td>
                        <span
                          className="category-badge"
                          style={{
                            background: `${getCategoryColor(row.Category)}20`,
                            color: getCategoryColor(row.Category),
                            border: `1px solid ${getCategoryColor(row.Category)}40`,
                          }}
                        >
                          {row.Category}
                        </span>
                      </td>
                      <td>
                        <span className="platform-badge">{row.Platform}</span>
                      </td>
                      <td style={{ color: "var(--muted)", fontSize: "12px" }}>
                        {row.Search_Intent}
                      </td>
                      <td className="notes-cell">{row.Notes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <button
              className="reset-btn"
              onClick={() => {
                setPhase("idle");
                setCsvData(null);
                setTableData([]);
                setTopic("");
              }}
            >
              ← Research a new topic
            </button>
          </>
        )}
      </div>
    </>
  );
}
