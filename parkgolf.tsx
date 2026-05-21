import { useState, useEffect, useRef } from "react";

const FIELDS = ["A", "B", "C", "D"];
const HOLES = [1, 2, 3, 4, 5, 6, 7, 8, 9];
const POINTS = [1, 2, 3, 4, 5, 6, 7, 8];
const PLAYER_COLORS = [
  {
    id: "blue",
    label: "Azul",
    main: "#2563eb",
    light: "#dbeafe",
    dark: "#1e3a8a",
  },
  {
    id: "green",
    label: "Verde",
    main: "#16a34a",
    light: "#dcfce7",
    dark: "#14532d",
  },
  {
    id: "red",
    label: "Vermelho",
    main: "#dc2626",
    light: "#fee2e2",
    dark: "#7f1d1d",
  },
  {
    id: "yellow",
    label: "Amarelo",
    main: "#ca8a04",
    light: "#fef9c3",
    dark: "#713f12",
  },
  {
    id: "cyan",
    label: "Ciano",
    main: "#0891b2",
    light: "#cffafe",
    dark: "#164e63",
  },
  {
    id: "orange",
    label: "Laranja",
    main: "#ea580c",
    light: "#ffedd5",
    dark: "#7c2d12",
  },
  {
    id: "purple",
    label: "Roxo",
    main: "#7c3aed",
    light: "#ede9fe",
    dark: "#3b0764",
  },
  {
    id: "brown",
    label: "Marrom",
    main: "#92400e",
    light: "#fef3c7",
    dark: "#451a03",
  },
];

function ld(k, d) {
  try {
    const v = localStorage.getItem(k);
    return v ? JSON.parse(v) : d;
  } catch {
    return d;
  }
}
function sd(k, v) {
  try {
    localStorage.setItem(k, JSON.stringify(v));
  } catch {}
}
function fmtTime(ms) {
  if (!ms && ms !== 0) return "—";
  const s = Math.floor(ms / 1000),
    m = Math.floor(s / 60),
    h = Math.floor(m / 60);
  return h > 0 ? `${h}h ${m % 60}min` : `${m}min ${s % 60}s`;
}
function nowTimeStr() {
  const d = new Date();
  return d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}
function getColor(id) {
  return PLAYER_COLORS.find((c) => c.id === id) || PLAYER_COLORS[0];
}

const SESSION_KEY = "pg_session";

const css = `
*{box-sizing:border-box;}
.pg-wrap{max-width:400px;margin:0 auto;padding:0 0 2rem;width:100%;}
.pg-tabs{display:flex;border-bottom:1px solid #e0e0e0;margin-bottom:14px;overflow-x:auto;}
.pg-tab{flex-shrink:0;padding:9px 10px;border:none;background:transparent;cursor:pointer;font-size:12px;white-space:nowrap;}
.pg-tab.on{border-bottom:2px solid #1a1a1a;color:#1a1a1a;font-weight:500;}
.pg-tab.off{border-bottom:2px solid transparent;color:#888;}
@media(prefers-color-scheme:dark){.pg-tab.on{border-bottom-color:#e8e8e8;color:#e8e8e8;}.pg-tab.off{color:#666;}}
.pg-section{padding:0 10px;}
.pg-campo{flex:1;padding:8px 0;border:none;cursor:pointer;border-radius:7px;font-size:14px;transition:all .1s;}
.pg-campo.on{background:#1a1a1a;color:#fff;font-weight:500;}
.pg-campo.off{background:#f0f0f0;color:#666;}
@media(prefers-color-scheme:dark){.pg-campo.on{background:#e8e8e8;color:#111;}.pg-campo.off{background:#2a2a2a;color:#888;}}
.pg-hbtn{width:30px;height:30px;border-radius:50%;cursor:pointer;font-size:12px;border:none;transition:all .1s;display:flex;align-items:center;justify-content:center;flex-shrink:0;}
.pg-hbtn.on{background:#1a1a1a;color:#fff;font-weight:500;outline:2px solid #aaa;outline-offset:2px;}
.pg-hbtn.done{background:#d4edda;color:#276237;}
.pg-hbtn.off{background:#f0f0f0;color:#888;}
@media(prefers-color-scheme:dark){.pg-hbtn.on{background:#e8e8e8;color:#111;outline-color:#666;}.pg-hbtn.done{background:#1a3d24;color:#6fcf88;}.pg-hbtn.off{background:#2a2a2a;color:#888;}}
.pg-ptbtn{padding:8px 0;font-size:14px;border:none;cursor:pointer;border-radius:7px;transition:all .1s;}
.pg-timer{display:flex;align-items:center;gap:6px;margin-bottom:12px;background:#f5f5f5;border-radius:8px;padding:7px 10px;}
@media(prefers-color-scheme:dark){.pg-timer{background:#222;}}
.pg-summary{background:#f5f5f5;border-radius:10px;padding:10px 12px;}
@media(prefers-color-scheme:dark){.pg-summary{background:#222;}}
.pg-scard{background:#f5f5f5;border-radius:8px;padding:9px 10px;margin-bottom:8px;}
@media(prefers-color-scheme:dark){.pg-scard{background:#222;}}
.pg-hcard{border:1px solid #e0e0e0;border-radius:8px;padding:9px 10px;margin-bottom:8px;}
@media(prefers-color-scheme:dark){.pg-hcard{border-color:#333;}}
.pg-hcard.finished{border-left:4px solid #16a34a;}
.pg-hcard.saved{border-left:4px solid #ea580c;}
.pg-pbtn{padding:5px 10px;font-size:12px;border-radius:6px;border:1px solid #ccc;background:#fff;cursor:pointer;}
@media(prefers-color-scheme:dark){.pg-pbtn{background:#333;border-color:#555;color:#ccc;}}
.pg-dot{width:20px;height:20px;border-radius:50%;cursor:pointer;border:2px solid transparent;transition:all .1s;flex-shrink:0;}
.pg-dot.sel{border-color:#1a1a1a;transform:scale(1.2);}
@media(prefers-color-scheme:dark){.pg-dot.sel{border-color:#fff;}}
.pg-input{width:100%;font-size:14px;padding:7px 10px;border:1px solid #ccc;border-radius:6px;background:#fff;color:#111;}
@media(prefers-color-scheme:dark){.pg-input{background:#222;border-color:#444;color:#eee;}}
.pg-select{font-size:13px;padding:6px 8px;border:1px solid #ccc;border-radius:6px;background:#fff;color:#111;cursor:pointer;}
@media(prefers-color-scheme:dark){.pg-select{background:#222;border-color:#444;color:#eee;}}
.pg-btn{padding:7px 14px;font-size:13px;border-radius:6px;border:1px solid #ccc;background:#f7f7f7;color:#333;cursor:pointer;}
@media(prefers-color-scheme:dark){.pg-btn{background:#2a2a2a;border-color:#444;color:#ccc;}}
.pg-btn-primary{padding:8px 14px;font-size:13px;border-radius:6px;border:none;background:#1a1a1a;color:#fff;cursor:pointer;}
@media(prefers-color-scheme:dark){.pg-btn-primary{background:#e8e8e8;color:#111;}}
.pg-btn-green{padding:7px 12px;font-size:12px;border-radius:6px;border:none;background:#16a34a;color:#fff;cursor:pointer;}
.pg-btn-orange{padding:7px 12px;font-size:12px;border-radius:6px;border:none;background:#ea580c;color:#fff;cursor:pointer;}
.pg-btn-blue{padding:7px 12px;font-size:12px;border-radius:6px;border:none;background:#2563eb;color:#fff;cursor:pointer;}
.pg-psel{display:flex;align-items:center;gap:8px;padding:9px 0;border-bottom:1px solid #eee;cursor:pointer;}
.pg-psel:last-child{border-bottom:none;}
.pg-psel-check{width:20px;height:20px;border-radius:50%;border:2px solid #ccc;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:all .1s;}
.pg-psel-check.on{border-color:#1a1a1a;background:#1a1a1a;}
@media(prefers-color-scheme:dark){.pg-psel-check.on{border-color:#e8e8e8;background:#e8e8e8;}}
.pg-banner{border-radius:8px;padding:10px 12px;margin-bottom:14px;font-size:13px;}
.pg-banner.orange{background:#fff7ed;border:1px solid #fdba74;}
@media(prefers-color-scheme:dark){.pg-banner.orange{background:#431407;border-color:#9a3412;color:#fed7aa;}}
.pg-badge{display:inline-block;font-size:10px;padding:2px 7px;border-radius:10px;font-weight:500;margin-left:5px;vertical-align:middle;}
.pg-badge.saved{background:#ffedd5;color:#9a3412;}
.pg-badge.finished{background:#dcfce7;color:#14532d;}
@media(prefers-color-scheme:dark){.pg-badge.saved{background:#431407;color:#fdba74;}.pg-badge.finished{background:#14532d;color:#86efac;}}
.pg-modal-bg{position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.55);z-index:999;display:flex;align-items:center;justify-content:center;padding:20px;}
.pg-modal{background:#fff;border-radius:12px;padding:20px;max-width:340px;width:100%;}
@media(prefers-color-scheme:dark){.pg-modal{background:#1e1e1e;color:#eee;}}
.pg-footer{text-align:center;margin-top:28px;padding-top:12px;border-top:1px solid #e0e0e0;}
`;

export default function App() {
  const [tab, setTab] = useState("placar");
  const [players, setPlayers] = useState(() => ld("pg_players", []));
  const [matches, setMatches] = useState(() => ld("pg_matches", []));

  const [selPids, setSelPids] = useState([]);
  const [matchName, setMatchName] = useState("");
  const [started, setStarted] = useState(false);
  const [scores, setScores] = useState({});
  const [field, setField] = useState("A");
  const [hole, setHole] = useState(1);
  const [startTime, setStartTime] = useState(null);
  const [startTimeStr, setStartTimeStr] = useState("");
  const [elapsed, setElapsed] = useState(0);
  const [paused, setPaused] = useState(false);
  const [pausedAt, setPausedAt] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [confirmFinish, setConfirmFinish] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const timerRef = useRef(null);

  const [newName, setNewName] = useState("");
  const [editRowId, setEditRowId] = useState(null);
  const [editRowName, setEditRowName] = useState("");

  const [statPlayer, setStatPlayer] = useState("all");
  const [histLimit, setHistLimit] = useState(5);
  const [histShowAll, setHistShowAll] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [sessionMatch, setSessionMatch] = useState(null);
  const [showResumePrompt, setShowResumePrompt] = useState(false);

  useEffect(() => {
    sd("pg_players", players);
  }, [players]);
  useEffect(() => {
    sd("pg_matches", matches);
  }, [matches]);

  useEffect(() => {
    if (started) {
      sd(SESSION_KEY, {
        selPids,
        matchName,
        scores,
        field,
        hole,
        elapsed,
        paused,
        editingId,
        startTimeStr,
      });
    }
  }, [started, scores, field, hole, elapsed, paused]);

  useEffect(() => {
    const sess = ld(SESSION_KEY, null);
    if (sess && sess.selPids && sess.selPids.length > 0) {
      setSessionMatch(sess);
      setShowResumePrompt(true);
    }
  }, []);

  useEffect(() => {
    function handleBefore(e) {
      if (started) {
        sd(SESSION_KEY, {
          selPids,
          matchName,
          scores,
          field,
          hole,
          elapsed,
          paused,
          editingId,
          startTimeStr,
        });
        e.preventDefault();
        e.returnValue = "";
      }
    }
    window.addEventListener("beforeunload", handleBefore);
    return () => window.removeEventListener("beforeunload", handleBefore);
  }, [
    started,
    selPids,
    matchName,
    scores,
    field,
    hole,
    elapsed,
    paused,
    editingId,
    startTimeStr,
  ]);

  useEffect(() => {
    if (started && !paused && startTime) {
      timerRef.current = setInterval(
        () => setElapsed(Date.now() - startTime),
        1000,
      );
    } else clearInterval(timerRef.current);
    return () => clearInterval(timerRef.current);
  }, [started, paused, startTime]);

  function resumeSession() {
    if (!sessionMatch) return;
    setSelPids(sessionMatch.selPids || []);
    setMatchName(sessionMatch.matchName || "");
    setScores(sessionMatch.scores || {});
    setField(sessionMatch.field || "A");
    setHole(sessionMatch.hole || 1);
    setStartTimeStr(sessionMatch.startTimeStr || "");
    const e = sessionMatch.elapsed || 0;
    setElapsed(e);
    setStartTime(Date.now() - e);
    setPaused(false);
    setEditingId(sessionMatch.editingId || null);
    setStarted(true);
    setShowResumePrompt(false);
    setSessionMatch(null);
    setTab("placar");
  }
  function discardSession() {
    localStorage.removeItem(SESSION_KEY);
    setSessionMatch(null);
    setShowResumePrompt(false);
  }

  function addPlayer() {
    const n = newName.trim();
    if (!n) return;
    const colorId = PLAYER_COLORS[players.length % PLAYER_COLORS.length].id;
    setPlayers((p) => [...p, { id: Date.now(), name: n, colorId }]);
    setNewName("");
  }
  function delPlayer(id) {
    setPlayers((p) => p.filter((x) => x.id !== id));
  }
  function saveRow(id) {
    const n = editRowName.trim();
    if (!n) return;
    setPlayers((p) => p.map((x) => (x.id === id ? { ...x, name: n } : x)));
    setEditRowId(null);
  }
  function setColor(id, c) {
    setPlayers((p) => p.map((x) => (x.id === id ? { ...x, colorId: c } : x)));
  }
  function toggleSel(id) {
    setSelPids((s) =>
      s.includes(id) ? s.filter((x) => x !== id) : [...s, id],
    );
  }

  function startMatch() {
    if (!selPids.length) return;
    localStorage.removeItem(SESSION_KEY);
    const t = Date.now();
    setStartTime(t);
    setStartTimeStr(nowTimeStr());
    setElapsed(0);
    setScores({});
    setField("A");
    setHole(1);
    setStarted(true);
    setPaused(false);
    setEditingId(null);
    setConfirmFinish(false);
  }
  function togglePause() {
    if (!paused) {
      setPaused(true);
      setPausedAt(Date.now());
    } else {
      setStartTime((t) => t + (Date.now() - pausedAt));
      setPaused(false);
      setPausedAt(null);
    }
  }
  function goNext() {
    const fi = FIELDS.indexOf(field);
    if (hole < 9) setHole((h) => h + 1);
    else if (fi < 3) {
      setField(FIELDS[fi + 1]);
      setHole(1);
    }
  }

  function persistMatch(status) {
    const date = new Date().toLocaleDateString("pt-BR");
    const name = matchName.trim() || `Partida ${date}`;
    const rec = {
      id: editingId || Date.now(),
      name,
      date,
      startTime: startTimeStr,
      duration: elapsed,
      players: selPids.slice(),
      scores: JSON.parse(JSON.stringify(scores)),
      status,
    };
    if (editingId) {
      setMatches((m) => m.map((x) => (x.id === editingId ? rec : x)));
    } else {
      setMatches((m) => [...m, rec]);
    }
    return rec;
  }
  function exitMatch() {
    localStorage.removeItem(SESSION_KEY);
    setStarted(false);
    setScores({});
    setStartTime(null);
    setElapsed(0);
    setPaused(false);
    setEditingId(null);
    setMatchName("");
    setConfirmFinish(false);
    setShowSaveModal(false);
  }
  function handleSaveBtn() {
    setShowSaveModal(true);
  }
  function handleContinue() {
    setShowSaveModal(false);
  }
  function handleSaveForLater() {
    persistMatch("saved");
    exitMatch();
  }
  function handleFinish() {
    persistMatch("finished");
    exitMatch();
  }

  function reopenMatch(m) {
    setSelPids(m.players.slice());
    setMatchName(m.name || "");
    setScores(JSON.parse(JSON.stringify(m.scores)));
    setEditingId(m.id);
    setField("A");
    setHole(1);
    setStartTimeStr(m.startTime || "");
    setStartTime(Date.now() - (m.duration || 0));
    setElapsed(m.duration || 0);
    setPaused(false);
    setStarted(true);
    setConfirmFinish(false);
    setTab("placar");
  }
  function deleteMatch(id) {
    setMatches((m) => m.filter((x) => x.id !== id));
    setConfirmDeleteId(null);
  }

  function sc(pid, f, h) {
    return scores?.[pid]?.[f]?.[h] ?? null;
  }
  function setScore(pid, f, h, v) {
    setScores((s) => {
      const n = JSON.parse(JSON.stringify(s));
      if (!n[pid]) n[pid] = {};
      if (!n[pid][f]) n[pid][f] = {};
      n[pid][f][h] = v;
      return n;
    });
  }
  function fTotal(pid, f) {
    return HOLES.reduce((s, h) => s + (sc(pid, f, h) || 0), 0);
  }
  function total(pid) {
    return FIELDS.reduce((s, f) => s + fTotal(pid, f), 0);
  }
  function pname(id) {
    return players.find((p) => p.id === id)?.name ?? "?";
  }
  function pcol(id) {
    return getColor(players.find((p) => p.id === id)?.colorId);
  }

  const isLast = field === "D" && hole === 9;
  const selObjs = players.filter((p) => selPids.includes(p.id));
  function hClass(h) {
    if (h === hole) return "pg-hbtn on";
    if (selObjs.length && selObjs.every((p) => sc(p.id, field, h) !== null))
      return "pg-hbtn done";
    return "pg-hbtn off";
  }

  const lastSaved = [...matches].reverse().find((m) => m.status === "saved");

  function statsPlayer(pid) {
    const rows = matches
      .map((m) => {
        if (!m.players.includes(pid)) return null;
        let tot = 0,
          cnt = 0;
        FIELDS.forEach((f) =>
          HOLES.forEach((h) => {
            const v = m.scores?.[pid]?.[f]?.[h];
            if (v) {
              tot += v;
              cnt++;
            }
          }),
        );
        return cnt > 0 ? { tot, cnt } : null;
      })
      .filter(Boolean);
    if (!rows.length) return null;
    const fullRows = rows.filter((x) => x.cnt === 36);
    return {
      games: rows.length,
      avg: (
        rows.reduce((s, x) => s + x.tot, 0) /
        rows.reduce((s, x) => s + x.cnt, 0)
      ).toFixed(2),
      best: fullRows.length ? Math.min(...fullRows.map((x) => x.tot)) : null,
      worst: fullRows.length ? Math.max(...fullRows.map((x) => x.tot)) : null,
    };
  }
  function statsField(f, pid) {
    const vals = [];
    matches.forEach((m) => {
      const pids =
        pid === "all" ? m.players : m.players.filter((x) => x === pid);
      pids.forEach((p) => {
        let tot = 0,
          cnt = 0;
        HOLES.forEach((h) => {
          const v = m.scores?.[p]?.[f]?.[h];
          if (v) {
            tot += v;
            cnt++;
          }
        });
        if (cnt > 0) vals.push({ tot, cnt });
      });
    });
    if (!vals.length) return null;
    const fullVals = vals.filter((x) => x.cnt === 9);
    return {
      avg: (
        vals.reduce((s, x) => s + x.tot, 0) /
        vals.reduce((s, x) => s + x.cnt, 0)
      ).toFixed(2),
      best: fullVals.length ? Math.min(...fullVals.map((x) => x.tot)) : null,
      worst: fullVals.length ? Math.max(...fullVals.map((x) => x.tot)) : null,
    };
  }

  const sortedMatches = [...matches].reverse();
  const effectiveLimit =
    histShowAll || histLimit === "todas" ? sortedMatches.length : histLimit;
  const visibleMatches = sortedMatches.slice(0, effectiveLimit);
  const hasMore =
    !histShowAll &&
    histLimit !== "todas" &&
    sortedMatches.length > effectiveLimit;

  const Footer = () => (
    <div className="pg-footer">
      <p style={{ fontSize: 11, color: "#aaa", margin: 0 }}>
        Cartão de Pontuação ParkGolf &nbsp;·&nbsp; @SergioStevan Jr
        &nbsp;·&nbsp; 2026
      </p>
    </div>
  );

  return (
    <div className="pg-wrap">
      <style>{css}</style>

      {/* Resume modal */}
      {showResumePrompt && sessionMatch && (
        <div className="pg-modal-bg">
          <div className="pg-modal">
            <p style={{ fontWeight: 500, fontSize: 15, marginBottom: 6 }}>
              Partida em andamento encontrada
            </p>
            <p style={{ fontSize: 13, color: "#666", marginBottom: 16 }}>
              Partida: <b>{sessionMatch.matchName || "sem nome"}</b>. O que
              deseja fazer?
            </p>
            <div style={{ display: "flex", gap: 8, flexDirection: "column" }}>
              <button
                className="pg-btn-orange"
                onClick={resumeSession}
                style={{ padding: "10px", fontSize: 13 }}
              >
                Continuar partida salva
              </button>
              <button
                className="pg-btn"
                onClick={discardSession}
                style={{ padding: "10px", fontSize: 13 }}
              >
                Descartar e iniciar nova
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Save modal */}
      {showSaveModal && (
        <div className="pg-modal-bg">
          <div className="pg-modal">
            <p style={{ fontWeight: 500, fontSize: 15, marginBottom: 6 }}>
              O que deseja fazer?
            </p>
            <p style={{ fontSize: 13, color: "#666", marginBottom: 16 }}>
              Partida: <b>{matchName || "sem nome"}</b>
            </p>
            <div style={{ display: "flex", gap: 8, flexDirection: "column" }}>
              <button
                className="pg-btn-primary"
                onClick={handleContinue}
                style={{ padding: "10px", fontSize: 13 }}
              >
                Continuar esta partida
              </button>
              <button
                className="pg-btn-blue"
                onClick={handleSaveForLater}
                style={{ padding: "10px", fontSize: 13 }}
              >
                Salvar para mais tarde
              </button>
              <button
                className="pg-btn"
                onClick={() => {
                  setShowSaveModal(false);
                  startMatch();
                }}
                style={{ padding: "10px", fontSize: 13 }}
              >
                Iniciar uma nova partida
              </button>
            </div>
            <button
              onClick={() => setShowSaveModal(false)}
              style={{
                marginTop: 10,
                width: "100%",
                fontSize: 12,
                color: "#888",
                background: "none",
                border: "none",
                cursor: "pointer",
              }}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      <div className="pg-tabs">
        {[
          ["jogadores", "Jogadores"],
          ["placar", "Placar"],
          ["stats", "Estatísticas"],
          ["hist", "Histórico"],
        ].map(([k, l]) => (
          <button
            key={k}
            className={`pg-tab ${tab === k ? "on" : "off"}`}
            onClick={() => setTab(k)}
          >
            {l}
          </button>
        ))}
      </div>

      {/* ── JOGADORES ── */}
      {tab === "jogadores" && (
        <div className="pg-section">
          <p style={{ fontSize: 12, color: "#888", marginBottom: 10 }}>
            Cadastre jogadores e escolha uma cor para cada um.
          </p>
          <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
            <input
              className="pg-input"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addPlayer()}
              placeholder="Nome do jogador"
              style={{ flex: 1 }}
            />
            <button className="pg-btn-primary" onClick={() => addPlayer()}>
              Adicionar
            </button>
          </div>
          {players.length === 0 && (
            <p style={{ color: "#888", fontSize: 13 }}>
              Nenhum jogador cadastrado.
            </p>
          )}
          {players.map((p) => {
            const col = getColor(p.colorId);
            return (
              <div
                key={p.id}
                style={{ padding: "8px 0", borderBottom: "1px solid #eee" }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 7,
                    marginBottom: 7,
                  }}
                >
                  <div
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: "50%",
                      background: col.main,
                      flexShrink: 0,
                    }}
                  />
                  {editRowId === p.id ? (
                    <>
                      <input
                        className="pg-input"
                        value={editRowName}
                        onChange={(e) => setEditRowName(e.target.value)}
                        style={{ flex: 1 }}
                        autoFocus
                        onKeyDown={(e) => e.key === "Enter" && saveRow(p.id)}
                      />
                      <button
                        className="pg-btn"
                        onClick={() => saveRow(p.id)}
                        style={{ fontSize: 11, padding: "4px 8px" }}
                      >
                        Salvar
                      </button>
                      <button
                        className="pg-btn"
                        onClick={() => setEditRowId(null)}
                        style={{ fontSize: 11, padding: "4px 8px" }}
                      >
                        Cancelar
                      </button>
                    </>
                  ) : (
                    <>
                      <span style={{ flex: 1, fontSize: 14 }}>{p.name}</span>
                      <button
                        className="pg-btn"
                        onClick={() => {
                          setEditRowId(p.id);
                          setEditRowName(p.name);
                        }}
                        style={{ fontSize: 11, padding: "4px 8px" }}
                      >
                        Editar
                      </button>
                      <button
                        className="pg-btn"
                        onClick={() => delPlayer(p.id)}
                        style={{
                          fontSize: 11,
                          padding: "4px 8px",
                          color: "#c0392b",
                        }}
                      >
                        Excluir
                      </button>
                    </>
                  )}
                </div>
                <div
                  style={{
                    display: "flex",
                    gap: 6,
                    marginLeft: 17,
                    flexWrap: "wrap",
                    alignItems: "center",
                  }}
                >
                  {PLAYER_COLORS.map((c) => (
                    <button
                      key={c.id}
                      className={`pg-dot ${p.colorId === c.id ? "sel" : ""}`}
                      style={{ background: c.main }}
                      title={c.label}
                      onClick={() => setColor(p.id, c.id)}
                    />
                  ))}
                </div>
              </div>
            );
          })}
          <Footer />
        </div>
      )}

      {/* ── PLACAR ── */}
      {tab === "placar" && (
        <div className="pg-section">
          {!started ? (
            <div>
              {lastSaved && (
                <div className="pg-banner orange">
                  <p
                    style={{ fontWeight: 500, margin: "0 0 4px", fontSize: 13 }}
                  >
                    Partida salva (não finalizada)
                  </p>
                  <p style={{ margin: "0 0 10px", fontSize: 12 }}>
                    {lastSaved.name} — {lastSaved.date}
                    {lastSaved.startTime ? ` às ${lastSaved.startTime}` : ""}
                  </p>
                  <button
                    className="pg-btn-orange"
                    onClick={() => reopenMatch(lastSaved)}
                    style={{ fontSize: 12, padding: "6px 12px" }}
                  >
                    Continuar esta partida
                  </button>
                </div>
              )}
              <p style={{ fontSize: 13, fontWeight: 500, marginBottom: 8 }}>
                Selecione os jogadores
              </p>
              {players.length === 0 && (
                <p style={{ color: "#888", fontSize: 13, marginBottom: 12 }}>
                  Nenhum jogador cadastrado. Vá à aba Jogadores.
                </p>
              )}
              <div
                style={{
                  border: "1px solid #e0e0e0",
                  borderRadius: 8,
                  marginBottom: 14,
                  padding: "0 10px",
                }}
              >
                {players.length === 0 && (
                  <p style={{ color: "#888", fontSize: 13, padding: "10px 0" }}>
                    —
                  </p>
                )}
                {players.map((p) => {
                  const col = getColor(p.colorId);
                  const sel = selPids.includes(p.id);
                  return (
                    <div
                      key={p.id}
                      className="pg-psel"
                      onClick={() => toggleSel(p.id)}
                    >
                      <div className={`pg-psel-check ${sel ? "on" : ""}`}>
                        {sel && (
                          <svg width="12" height="12" viewBox="0 0 12 12">
                            <polyline
                              points="2,6 5,9 10,3"
                              stroke="#fff"
                              strokeWidth="2"
                              fill="none"
                            />
                          </svg>
                        )}
                      </div>
                      <div
                        style={{
                          width: 10,
                          height: 10,
                          borderRadius: "50%",
                          background: col.main,
                          flexShrink: 0,
                        }}
                      />
                      <span style={{ fontSize: 14 }}>{p.name}</span>
                    </div>
                  );
                })}
              </div>
              <p style={{ fontSize: 13, fontWeight: 500, marginBottom: 6 }}>
                Nome da partida
              </p>
              <input
                className="pg-input"
                value={matchName}
                onChange={(e) => setMatchName(e.target.value)}
                placeholder={`Partida ${new Date().toLocaleDateString("pt-BR")}`}
                style={{ marginBottom: 14 }}
              />
              <button
                className="pg-btn-primary"
                onClick={startMatch}
                disabled={!selPids.length}
                style={{ width: "100%", padding: "11px", fontSize: 15 }}
              >
                Iniciar nova partida{" "}
                {selPids.length > 0
                  ? `(${selPids.length} jogador${selPids.length > 1 ? "es" : ""})`
                  : ""}
              </button>
              <Footer />
            </div>
          ) : (
            <>
              <div className="pg-timer">
                <span style={{ fontSize: 12, color: "#888" }}>Tempo</span>
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 500,
                    fontVariantNumeric: "tabular-nums",
                    flex: 1,
                  }}
                >
                  {fmtTime(elapsed)}
                </span>
                <button
                  className="pg-pbtn"
                  onClick={togglePause}
                  style={{ marginRight: 4 }}
                >
                  {paused ? "▶ Continuar" : "⏸ Pausar"}
                </button>
                <button className="pg-btn-green" onClick={handleSaveBtn}>
                  Salvar
                </button>
              </div>
              {matchName && (
                <p
                  style={{
                    fontSize: 12,
                    color: "#888",
                    marginBottom: 10,
                    textAlign: "center",
                  }}
                >
                  {matchName}
                  {startTimeStr ? ` · início ${startTimeStr}` : ""}
                </p>
              )}

              <div style={{ display: "flex", gap: 5, marginBottom: 12 }}>
                {FIELDS.map((f) => (
                  <button
                    key={f}
                    className={`pg-campo ${f === field ? "on" : "off"}`}
                    onClick={() => {
                      setField(f);
                      setHole(1);
                      setConfirmFinish(false);
                    }}
                  >
                    Campo {f}
                  </button>
                ))}
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  marginBottom: 14,
                }}
              >
                <div style={{ display: "flex", gap: 3, flex: 1 }}>
                  {HOLES.map((h) => (
                    <button
                      key={h}
                      className={hClass(h)}
                      onClick={() => {
                        setHole(h);
                        setConfirmFinish(false);
                      }}
                    >
                      {h}
                    </button>
                  ))}
                </div>
                {isLast ? (
                  confirmFinish ? (
                    <div style={{ display: "flex", gap: 4 }}>
                      <button
                        className="pg-btn-green"
                        onClick={handleFinish}
                        style={{
                          fontSize: 11,
                          padding: "6px 8px",
                          whiteSpace: "nowrap",
                        }}
                      >
                        Confirmar
                      </button>
                      <button
                        className="pg-btn"
                        onClick={() => setConfirmFinish(false)}
                        style={{
                          fontSize: 11,
                          padding: "6px 8px",
                          whiteSpace: "nowrap",
                        }}
                      >
                        Cancelar
                      </button>
                    </div>
                  ) : (
                    <button
                      className="pg-btn-green"
                      onClick={() => setConfirmFinish(true)}
                      style={{
                        fontSize: 12,
                        padding: "6px 10px",
                        whiteSpace: "nowrap",
                      }}
                    >
                      Finalizar
                    </button>
                  )
                ) : (
                  <button
                    className="pg-btn"
                    onClick={goNext}
                    style={{
                      fontSize: 12,
                      padding: "6px 10px",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Próximo →
                  </button>
                )}
              </div>

              <div style={{ marginBottom: 12 }}>
                {selObjs.map((p) => {
                  const cur = sc(p.id, field, hole);
                  const col = getColor(p.colorId);
                  return (
                    <div key={p.id} style={{ marginBottom: 12 }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 5,
                          marginBottom: 5,
                        }}
                      >
                        <div
                          style={{
                            width: 9,
                            height: 9,
                            borderRadius: "50%",
                            background: col.main,
                            flexShrink: 0,
                          }}
                        />
                        <span
                          style={{
                            fontSize: 13,
                            color: "#555",
                            fontWeight: 500,
                          }}
                        >
                          {p.name}
                        </span>
                      </div>
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "repeat(8,1fr)",
                          gap: 4,
                        }}
                      >
                        {POINTS.map((pt) => {
                          const sel = cur === pt;
                          return (
                            <button
                              key={pt}
                              className="pg-ptbtn"
                              onClick={() => setScore(p.id, field, hole, pt)}
                              style={{
                                background: sel ? col.main : col.light,
                                color: sel ? "#fff" : col.dark,
                                fontWeight: sel ? "500" : "400",
                                transform: sel ? "scale(1.07)" : "scale(1)",
                                outline: sel
                                  ? `2px solid ${col.main}88`
                                  : "none",
                                outlineOffset: 2,
                              }}
                            >
                              {pt}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="pg-summary">
                <p style={{ fontSize: 12, fontWeight: 500, marginBottom: 7 }}>
                  Resumo
                </p>
                <table
                  style={{
                    width: "100%",
                    fontSize: 11,
                    borderCollapse: "collapse",
                  }}
                >
                  <thead>
                    <tr>
                      <th
                        style={{
                          textAlign: "left",
                          paddingBottom: 3,
                          color: "#888",
                          fontWeight: 400,
                        }}
                      >
                        Jogador
                      </th>
                      {FIELDS.map((f) => (
                        <th
                          key={f}
                          style={{
                            textAlign: "center",
                            paddingBottom: 3,
                            color: "#888",
                            fontWeight: 400,
                            paddingLeft: 4,
                          }}
                        >
                          C.{f}
                        </th>
                      ))}
                      <th
                        style={{
                          textAlign: "center",
                          paddingBottom: 3,
                          color: "#888",
                          fontWeight: 400,
                          paddingLeft: 4,
                        }}
                      >
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {selObjs.map((p) => {
                      const col = getColor(p.colorId);
                      return (
                        <tr key={p.id}>
                          <td style={{ padding: "2px 0" }}>
                            <span
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 4,
                              }}
                            >
                              <span
                                style={{
                                  width: 7,
                                  height: 7,
                                  borderRadius: "50%",
                                  background: col.main,
                                  display: "inline-block",
                                  flexShrink: 0,
                                }}
                              />
                              <span
                                style={{
                                  whiteSpace: "nowrap",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  maxWidth: 70,
                                }}
                              >
                                {p.name}
                              </span>
                            </span>
                          </td>
                          {FIELDS.map((f) => (
                            <td
                              key={f}
                              style={{
                                textAlign: "center",
                                padding: "2px 4px",
                              }}
                            >
                              {fTotal(p.id, f) || "—"}
                            </td>
                          ))}
                          <td
                            style={{
                              textAlign: "center",
                              fontWeight: 500,
                              padding: "2px 4px",
                            }}
                          >
                            {total(p.id) || "—"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <Footer />
            </>
          )}
        </div>
      )}

      {/* ── ESTATÍSTICAS ── */}
      {tab === "stats" && (
        <div className="pg-section">
          {matches.length === 0 ? (
            <p style={{ color: "#888", fontSize: 13 }}>
              Nenhuma partida registrada ainda.
            </p>
          ) : (
            <>
              <p style={{ fontSize: 13, fontWeight: 500, marginBottom: 10 }}>
                {matches.length} partida(s) registrada(s)
              </p>
              <p style={{ fontSize: 12, color: "#888", marginBottom: 7 }}>
                Por jogador
              </p>
              {players.map((p) => {
                const st = statsPlayer(p.id);
                if (!st) return null;
                const col = getColor(p.colorId);
                return (
                  <div
                    key={p.id}
                    className="pg-scard"
                    style={{ borderLeft: `4px solid ${col.main}` }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 5,
                        marginBottom: 6,
                      }}
                    >
                      <div
                        style={{
                          width: 9,
                          height: 9,
                          borderRadius: "50%",
                          background: col.main,
                        }}
                      />
                      <span style={{ fontWeight: 500, fontSize: 13 }}>
                        {p.name}
                      </span>
                    </div>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(4,1fr)",
                        gap: 5,
                        fontSize: 11,
                      }}
                    >
                      <div>
                        <div style={{ color: "#888", marginBottom: 2 }}>
                          Partidas
                        </div>
                        <b>{st.games}</b>
                      </div>
                      <div>
                        <div style={{ color: "#888", marginBottom: 2 }}>
                          Média/buraco
                        </div>
                        <b>{st.avg}</b>
                      </div>
                      <div>
                        <div style={{ color: "#888", marginBottom: 2 }}>
                          Melhor total
                        </div>
                        <b style={{ color: "#16a34a" }}>
                          {st.best !== null ? st.best : "—"}
                        </b>
                      </div>
                      <div>
                        <div style={{ color: "#888", marginBottom: 2 }}>
                          Pior total
                        </div>
                        <b style={{ color: "#dc2626" }}>
                          {st.worst !== null ? st.worst : "—"}
                        </b>
                      </div>
                    </div>
                  </div>
                );
              })}
              <p
                style={{
                  fontSize: 11,
                  color: "#888",
                  marginBottom: 14,
                  fontStyle: "italic",
                }}
              >
                A melhor pontuação é a menor pontuação realizada com todos os 36
                buracos preenchidos.
              </p>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 8,
                }}
              >
                <p style={{ fontSize: 12, color: "#888", margin: 0 }}>
                  Por campo
                </p>
                <select
                  className="pg-select"
                  value={statPlayer}
                  onChange={(e) => setStatPlayer(e.target.value)}
                >
                  <option value="all">Todos os jogadores</option>
                  {players.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 7,
                  marginBottom: 14,
                }}
              >
                {FIELDS.map((f) => {
                  const st = statsField(
                    f,
                    statPlayer === "all" ? "all" : Number(statPlayer),
                  );
                  if (!st) return null;
                  return (
                    <div key={f} className="pg-scard">
                      <p
                        style={{
                          fontWeight: 500,
                          fontSize: 13,
                          marginBottom: 4,
                        }}
                      >
                        Campo {f}
                      </p>
                      <div style={{ fontSize: 11 }}>
                        <div>
                          <span style={{ color: "#888" }}>Média/buraco: </span>
                          {st.avg}
                        </div>
                        <div>
                          <span style={{ color: "#16a34a" }}>
                            Melhor (9 buracos):{" "}
                          </span>
                          {st.best !== null ? st.best : "—"}
                        </div>
                        <div>
                          <span style={{ color: "#dc2626" }}>
                            Pior (9 buracos):{" "}
                          </span>
                          {st.worst !== null ? st.worst : "—"}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
          <Footer />
        </div>
      )}

      {/* ── HISTÓRICO ── */}
      {tab === "hist" && (
        <div className="pg-section">
          {matches.length === 0 ? (
            <p style={{ color: "#888", fontSize: 13 }}>
              Nenhuma partida registrada ainda.
            </p>
          ) : (
            <>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 8,
                }}
              >
                <p style={{ fontSize: 13, fontWeight: 500, margin: 0 }}>
                  {matches.length} partida(s)
                </p>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontSize: 12, color: "#888" }}>Exibir:</span>
                  <select
                    className="pg-select"
                    value={histLimit}
                    onChange={(e) => {
                      const v = e.target.value;
                      setHistLimit(v === "todas" ? "todas" : Number(v));
                      setHistShowAll(false);
                      setConfirmDeleteId(null);
                    }}
                  >
                    {[5, 10, 20, "todas"].map((v) => (
                      <option key={v} value={v}>
                        {v === "todas" ? "Todas" : v}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  gap: 10,
                  marginBottom: 10,
                  fontSize: 11,
                  color: "#888",
                }}
              >
                <span>
                  <span
                    style={{
                      display: "inline-block",
                      width: 8,
                      height: 8,
                      borderRadius: 2,
                      background: "#16a34a",
                      marginRight: 4,
                    }}
                  />
                  Finalizada
                </span>
                <span>
                  <span
                    style={{
                      display: "inline-block",
                      width: 8,
                      height: 8,
                      borderRadius: 2,
                      background: "#ea580c",
                      marginRight: 4,
                    }}
                  />
                  Salva (em aberto)
                </span>
              </div>

              {visibleMatches.map((m) => {
                const finished = m.status === "finished";
                return (
                  <div
                    key={m.id}
                    className={`pg-hcard ${finished ? "finished" : "saved"}`}
                  >
                    {confirmDeleteId === m.id && (
                      <div
                        style={{
                          background: "#fff3cd",
                          border: "1px solid #ffc107",
                          borderRadius: 6,
                          padding: "8px 10px",
                          marginBottom: 8,
                          fontSize: 12,
                        }}
                      >
                        <p style={{ margin: "0 0 7px", color: "#856404" }}>
                          Apagar "{m.name || `Partida ${m.date}`}"?
                        </p>
                        <div style={{ display: "flex", gap: 6 }}>
                          <button
                            onClick={() => deleteMatch(m.id)}
                            style={{
                              padding: "4px 12px",
                              fontSize: 12,
                              borderRadius: 5,
                              border: "none",
                              background: "#dc2626",
                              color: "#fff",
                              cursor: "pointer",
                            }}
                          >
                            Confirmar
                          </button>
                          <button
                            onClick={() => setConfirmDeleteId(null)}
                            className="pg-btn"
                            style={{ padding: "4px 12px", fontSize: 12 }}
                          >
                            Cancelar
                          </button>
                        </div>
                      </div>
                    )}
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        marginBottom: 6,
                      }}
                    >
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            flexWrap: "wrap",
                            gap: 4,
                          }}
                        >
                          <span style={{ fontSize: 13, fontWeight: 500 }}>
                            {m.name || `Partida ${m.date}`}
                          </span>
                          <span
                            className={`pg-badge ${finished ? "finished" : "saved"}`}
                          >
                            {finished ? "Finalizada" : "Salva"}
                          </span>
                        </div>
                        <div
                          style={{ fontSize: 11, color: "#888", marginTop: 3 }}
                        >
                          {m.date}
                          {m.startTime ? ` · início: ${m.startTime}` : ""} ·
                          duração: {fmtTime(m.duration)}
                        </div>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          gap: 5,
                          alignItems: "center",
                          flexShrink: 0,
                          marginLeft: 6,
                        }}
                      >
                        <button
                          className="pg-btn"
                          onClick={() => reopenMatch(m)}
                          style={{ fontSize: 11, padding: "3px 7px" }}
                        >
                          Reabrir
                        </button>
                        <button
                          onClick={() => setConfirmDeleteId(m.id)}
                          title="Apagar"
                          style={{
                            padding: "3px 7px",
                            fontSize: 14,
                            borderRadius: 5,
                            border: "1px solid #f5c6cb",
                            background: "#fff5f5",
                            cursor: "pointer",
                            lineHeight: 1,
                          }}
                        >
                          🗑
                        </button>
                      </div>
                    </div>
                    <table
                      style={{
                        width: "100%",
                        fontSize: 11,
                        borderCollapse: "collapse",
                      }}
                    >
                      <thead>
                        <tr>
                          <th
                            style={{
                              textAlign: "left",
                              fontWeight: 400,
                              color: "#888",
                              paddingBottom: 2,
                            }}
                          >
                            Jogador
                          </th>
                          {FIELDS.map((f) => (
                            <th
                              key={f}
                              style={{
                                textAlign: "center",
                                fontWeight: 400,
                                color: "#888",
                                paddingBottom: 2,
                              }}
                            >
                              C.{f}
                            </th>
                          ))}
                          <th
                            style={{
                              textAlign: "center",
                              fontWeight: 400,
                              color: "#888",
                              paddingBottom: 2,
                            }}
                          >
                            Total
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {m.players.map((pid) => {
                          const ft = FIELDS.map((f) =>
                            HOLES.reduce(
                              (s, h) => s + (m.scores?.[pid]?.[f]?.[h] || 0),
                              0,
                            ),
                          );
                          const tot = ft.reduce((a, b) => a + b, 0);
                          const col = pcol(pid);
                          return (
                            <tr key={pid}>
                              <td style={{ padding: "2px 0" }}>
                                <span
                                  style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: 4,
                                  }}
                                >
                                  <span
                                    style={{
                                      width: 6,
                                      height: 6,
                                      borderRadius: "50%",
                                      background: col.main,
                                      display: "inline-block",
                                      flexShrink: 0,
                                    }}
                                  />
                                  <span
                                    style={{
                                      whiteSpace: "nowrap",
                                      overflow: "hidden",
                                      textOverflow: "ellipsis",
                                      maxWidth: 65,
                                    }}
                                  >
                                    {pname(pid)}
                                  </span>
                                </span>
                              </td>
                              {ft.map((v, i) => (
                                <td
                                  key={i}
                                  style={{
                                    textAlign: "center",
                                    padding: "2px 3px",
                                  }}
                                >
                                  {v || "—"}
                                </td>
                              ))}
                              <td
                                style={{
                                  textAlign: "center",
                                  fontWeight: 500,
                                  padding: "2px 3px",
                                }}
                              >
                                {tot || "—"}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                );
              })}
              {hasMore && (
                <button
                  className="pg-btn"
                  onClick={() => setHistShowAll(true)}
                  style={{
                    width: "100%",
                    padding: "9px",
                    fontSize: 13,
                    marginTop: 4,
                  }}
                >
                  Apresentar as demais ({sortedMatches.length - effectiveLimit}{" "}
                  partidas)
                </button>
              )}
            </>
          )}
          <Footer />
        </div>
      )}
    </div>
  );
}
