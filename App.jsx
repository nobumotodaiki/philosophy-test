import { useState } from "react";

const API_URL = "https://api.anthropic.com/v1/messages";

const INITIAL_QUESTIONS = [];

const VIEWS = { ADMIN: "admin", TEST: "test", RESULT: "result" };

const palette = {
  bg: "#0D0D0D",
  surface: "#161616",
  card: "#1E1E1E",
  border: "#2A2A2A",
  accent: "#C8A96E",
  accentLight: "#E8C98E",
  text: "#F0EDE8",
  muted: "#8A8680",
  success: "#6EC8A0",
  danger: "#C86E6E",
};

const styles = {
  app: {
    minHeight: "100vh",
    background: palette.bg,
    color: palette.text,
    fontFamily: "'Georgia', 'Times New Roman', serif",
    position: "relative",
  },
  noise: {
    position: "fixed",
    inset: 0,
    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E")`,
    pointerEvents: "none",
    zIndex: 0,
  },
  content: { position: "relative", zIndex: 1 },
  header: {
    borderBottom: `1px solid ${palette.border}`,
    padding: "20px 40px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    background: palette.surface,
  },
  logo: {
    fontSize: "11px",
    letterSpacing: "0.25em",
    textTransform: "uppercase",
    color: palette.accent,
    fontFamily: "'Georgia', serif",
  },
  nav: { display: "flex", gap: "8px" },
  navBtn: (active) => ({
    background: active ? palette.accent : "transparent",
    color: active ? palette.bg : palette.muted,
    border: `1px solid ${active ? palette.accent : palette.border}`,
    padding: "8px 20px",
    fontSize: "11px",
    letterSpacing: "0.15em",
    textTransform: "uppercase",
    cursor: "pointer",
    transition: "all 0.2s",
  }),
  main: { maxWidth: "760px", margin: "0 auto", padding: "60px 24px" },
  sectionTitle: {
    fontSize: "28px",
    fontWeight: "normal",
    color: palette.text,
    marginBottom: "8px",
    letterSpacing: "0.02em",
  },
  sectionSub: {
    fontSize: "13px",
    color: palette.muted,
    marginBottom: "40px",
    letterSpacing: "0.05em",
  },
  card: {
    background: palette.card,
    border: `1px solid ${palette.border}`,
    padding: "28px",
    marginBottom: "16px",
  },
  label: {
    display: "block",
    fontSize: "11px",
    letterSpacing: "0.2em",
    textTransform: "uppercase",
    color: palette.accent,
    marginBottom: "10px",
  },
  input: {
    width: "100%",
    background: palette.surface,
    border: `1px solid ${palette.border}`,
    color: palette.text,
    padding: "12px 16px",
    fontSize: "14px",
    fontFamily: "inherit",
    outline: "none",
    boxSizing: "border-box",
    transition: "border-color 0.2s",
  },
  textarea: {
    width: "100%",
    background: palette.surface,
    border: `1px solid ${palette.border}`,
    color: palette.text,
    padding: "12px 16px",
    fontSize: "14px",
    fontFamily: "inherit",
    outline: "none",
    resize: "vertical",
    minHeight: "100px",
    boxSizing: "border-box",
    lineHeight: "1.6",
  },
  btn: (variant = "primary") => ({
    background: variant === "primary" ? palette.accent : "transparent",
    color: variant === "primary" ? palette.bg : palette.accent,
    border: `1px solid ${palette.accent}`,
    padding: "12px 28px",
    fontSize: "11px",
    letterSpacing: "0.2em",
    textTransform: "uppercase",
    cursor: "pointer",
    fontFamily: "inherit",
    transition: "all 0.2s",
  }),
  btnDanger: {
    background: "transparent",
    color: palette.danger,
    border: `1px solid ${palette.danger}`,
    padding: "6px 14px",
    fontSize: "10px",
    letterSpacing: "0.15em",
    textTransform: "uppercase",
    cursor: "pointer",
    fontFamily: "inherit",
  },
  divider: {
    borderTop: `1px solid ${palette.border}`,
    margin: "32px 0",
  },
  qNumber: {
    fontSize: "11px",
    color: palette.accent,
    letterSpacing: "0.2em",
    textTransform: "uppercase",
    marginBottom: "12px",
  },
  qText: {
    fontSize: "17px",
    lineHeight: "1.7",
    marginBottom: "20px",
    color: palette.text,
  },
  scoreBar: (pct) => ({
    height: "4px",
    background: palette.border,
    marginTop: "8px",
    position: "relative",
  }),
  scoreFill: (pct) => ({
    position: "absolute",
    left: 0,
    top: 0,
    height: "100%",
    width: `${pct}%`,
    background: pct >= 80 ? palette.success : pct >= 50 ? palette.accent : palette.danger,
    transition: "width 1s ease",
  }),
  tag: (score) => ({
    display: "inline-block",
    padding: "3px 10px",
    fontSize: "10px",
    letterSpacing: "0.15em",
    textTransform: "uppercase",
    border: `1px solid ${score >= 80 ? palette.success : score >= 50 ? palette.accent : palette.danger}`,
    color: score >= 80 ? palette.success : score >= 50 ? palette.accent : palette.danger,
    marginBottom: "12px",
  }),
};

// ─── Admin View ────────────────────────────────────────────────────
function AdminView({ questions, setQuestions }) {
  const [companyName, setCompanyName] = useState(
    () => localStorage.getItem("companyName") || ""
  );
  const [philosophy, setPhilosophy] = useState(
    () => localStorage.getItem("philosophy") || ""
  );
  const [newQ, setNewQ] = useState("");
  const [newModel, setNewModel] = useState("");

  const saveSettings = () => {
    localStorage.setItem("companyName", companyName);
    localStorage.setItem("philosophy", philosophy);
    alert("保存しました");
  };

  const addQuestion = () => {
    if (!newQ.trim()) return;
    const q = { id: Date.now(), text: newQ.trim(), modelAnswer: newModel.trim() };
    const updated = [...questions, q];
    setQuestions(updated);
    localStorage.setItem("questions", JSON.stringify(updated));
    setNewQ("");
    setNewModel("");
  };

  const removeQuestion = (id) => {
    const updated = questions.filter((q) => q.id !== id);
    setQuestions(updated);
    localStorage.setItem("questions", JSON.stringify(updated));
  };

  return (
    <div style={styles.main}>
      <div style={styles.sectionTitle}>管理者設定</div>
      <div style={styles.sectionSub}>会社理念と問題を登録してください</div>

      {/* Company Info */}
      <div style={styles.card}>
        <div style={{ marginBottom: "20px" }}>
          <label style={styles.label}>会社名</label>
          <input
            style={styles.input}
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            placeholder="例：株式会社〇〇"
          />
        </div>
        <div style={{ marginBottom: "20px" }}>
          <label style={styles.label}>会社理念・バリュー</label>
          <textarea
            style={styles.textarea}
            value={philosophy}
            onChange={(e) => setPhilosophy(e.target.value)}
            placeholder="例：私たちは誠実さを第一に、お客様の信頼に応える企業を目指します。..."
            rows={5}
          />
        </div>
        <button style={styles.btn("primary")} onClick={saveSettings}>
          保存する
        </button>
      </div>

      <div style={styles.divider} />

      {/* Add Question */}
      <div style={{ ...styles.sectionTitle, fontSize: "20px" }}>問題を追加</div>
      <div style={{ ...styles.sectionSub, marginBottom: "24px" }}>
        {questions.length} 問登録済み
      </div>

      <div style={styles.card}>
        <div style={{ marginBottom: "20px" }}>
          <label style={styles.label}>問題文</label>
          <textarea
            style={styles.textarea}
            value={newQ}
            onChange={(e) => setNewQ(e.target.value)}
            placeholder="例：当社の理念を踏まえ、顧客からクレームを受けた際の対応方針を述べてください。"
          />
        </div>
        <div style={{ marginBottom: "20px" }}>
          <label style={styles.label}>模範解答（任意）</label>
          <textarea
            style={styles.textarea}
            value={newModel}
            onChange={(e) => setNewModel(e.target.value)}
            placeholder="AIが採点時に参考にする模範解答を入力してください（省略可）"
            rows={3}
          />
        </div>
        <button style={styles.btn("primary")} onClick={addQuestion}>
          問題を追加
        </button>
      </div>

      {/* Question List */}
      {questions.length > 0 && (
        <>
          <div style={styles.divider} />
          <div style={{ ...styles.sectionTitle, fontSize: "18px", marginBottom: "20px" }}>
            登録済みの問題
          </div>
          {questions.map((q, i) => (
            <div key={q.id} style={{ ...styles.card, position: "relative" }}>
              <div style={styles.qNumber}>問題 {i + 1}</div>
              <div style={{ fontSize: "15px", lineHeight: "1.6", marginBottom: q.modelAnswer ? "12px" : 0 }}>
                {q.text}
              </div>
              {q.modelAnswer && (
                <div style={{ fontSize: "12px", color: palette.muted, fontStyle: "italic" }}>
                  模範：{q.modelAnswer}
                </div>
              )}
              <button
                style={{ ...styles.btnDanger, position: "absolute", top: "20px", right: "20px" }}
                onClick={() => removeQuestion(q.id)}
              >
                削除
              </button>
            </div>
          ))}
        </>
      )}
    </div>
  );
}

// ─── Test View ─────────────────────────────────────────────────────
function TestView({ questions, onFinish }) {
  const philosophy = localStorage.getItem("philosophy") || "";
  const companyName = localStorage.getItem("companyName") || "当社";
  const [answers, setAnswers] = useState({});
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState("");

  if (questions.length === 0) {
    return (
      <div style={styles.main}>
        <div style={styles.sectionTitle}>テスト未設定</div>
        <div style={{ color: palette.muted, fontSize: "14px", lineHeight: "1.8" }}>
          管理者が問題をまだ登録していません。<br />
          管理者設定から問題を追加してください。
        </div>
      </div>
    );
  }

  const allAnswered = questions.every((q) => (answers[q.id] || "").trim().length > 0) && name.trim();

  const submit = async () => {
    if (!allAnswered) return;
    setLoading(true);

    const msgs = [];
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      setLoadingMsg(`問題 ${i + 1} / ${questions.length} を採点中...`);

      const prompt = `あなたは会社理念テストの採点者です。

【会社名】${companyName}
【会社理念】
${philosophy}

【問題】
${q.text}
${q.modelAnswer ? `\n【模範解答の参考】\n${q.modelAnswer}` : ""}

【受験者の回答】
${answers[q.id]}

以下のJSON形式のみで返してください（他の文字は一切含めない）：
{"score": 点数(0-100の整数), "feedback": "フィードバック（200字以内）", "points": "良かった点", "improvement": "改善点"}`;

      try {
        const res = await fetch(API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "claude-sonnet-4-20250514",
            max_tokens: 1000,
            messages: [{ role: "user", content: prompt }],
          }),
        });
        const data = await res.json();
        const text = data.content?.map((c) => c.text || "").join("") || "{}";
        const clean = text.replace(/```json|```/g, "").trim();
        const parsed = JSON.parse(clean);
        msgs.push({ question: q.text, answer: answers[q.id], ...parsed });
      } catch {
        msgs.push({ question: q.text, answer: answers[q.id], score: 0, feedback: "採点エラー", points: "-", improvement: "-" });
      }
    }

    setLoading(false);
    onFinish({ name, results: msgs });
  };

  return (
    <div style={styles.main}>
      {loading && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)",
          display: "flex", flexDirection: "column", alignItems: "center",
          justifyContent: "center", zIndex: 100, gap: "16px",
        }}>
          <div style={{ width: "40px", height: "40px", border: `2px solid ${palette.border}`, borderTop: `2px solid ${palette.accent}`, borderRadius: "50%", animation: "spin 1s linear infinite" }} />
          <div style={{ color: palette.accent, fontSize: "13px", letterSpacing: "0.1em" }}>{loadingMsg}</div>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}

      <div style={styles.sectionTitle}>{companyName} — 理念テスト</div>
      <div style={styles.sectionSub}>全 {questions.length} 問｜記述式</div>

      <div style={styles.card}>
        <label style={styles.label}>受験者名</label>
        <input
          style={styles.input}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="氏名を入力してください"
        />
      </div>

      <div style={styles.divider} />

      {questions.map((q, i) => (
        <div key={q.id} style={{ ...styles.card, marginBottom: "20px" }}>
          <div style={styles.qNumber}>問題 {i + 1} / {questions.length}</div>
          <div style={styles.qText}>{q.text}</div>
          <textarea
            style={{ ...styles.textarea, minHeight: "140px" }}
            value={answers[q.id] || ""}
            onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })}
            placeholder="ここに回答を入力してください..."
          />
          <div style={{ fontSize: "11px", color: palette.muted, marginTop: "8px", textAlign: "right" }}>
            {(answers[q.id] || "").length} 字
          </div>
        </div>
      ))}

      <button
        style={{
          ...styles.btn("primary"),
          opacity: allAnswered ? 1 : 0.4,
          cursor: allAnswered ? "pointer" : "not-allowed",
          width: "100%",
          padding: "16px",
          fontSize: "12px",
        }}
        onClick={submit}
        disabled={!allAnswered}
      >
        提出して採点する
      </button>
    </div>
  );
}

// ─── Result View ───────────────────────────────────────────────────
function ResultView({ data, onRetake }) {
  const { name, results } = data;
  const avg = Math.round(results.reduce((s, r) => s + (r.score || 0), 0) / results.length);

  return (
    <div style={styles.main}>
      <div style={{ textAlign: "center", marginBottom: "48px" }}>
        <div style={{ fontSize: "12px", color: palette.accent, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "12px" }}>
          採点結果
        </div>
        <div style={{ fontSize: "36px", marginBottom: "4px" }}>{name}</div>
        <div style={{ fontSize: "72px", color: avg >= 80 ? palette.success : avg >= 50 ? palette.accent : palette.danger, lineHeight: 1, marginTop: "16px" }}>
          {avg}
        </div>
        <div style={{ fontSize: "13px", color: palette.muted, marginTop: "8px" }}>総合スコア（100点満点）</div>
        <div style={{ ...styles.scoreBar(), width: "200px", margin: "16px auto 0" }}>
          <div style={styles.scoreFill(avg)} />
        </div>
      </div>

      <div style={styles.divider} />

      {results.map((r, i) => (
        <div key={i} style={{ ...styles.card, marginBottom: "20px" }}>
          <div style={styles.qNumber}>問題 {i + 1}</div>
          <div style={{ fontSize: "14px", color: palette.muted, marginBottom: "16px", lineHeight: "1.6" }}>
            {r.question}
          </div>

          <div style={{ ...styles.input, background: "rgba(255,255,255,0.03)", border: `1px solid ${palette.border}`, marginBottom: "20px", fontSize: "13px", lineHeight: "1.7", padding: "14px 16px", whiteSpace: "pre-wrap" }}>
            {r.answer}
          </div>

          <div style={styles.tag(r.score)}>{r.score}点</div>
          <div style={styles.scoreBar()}>
            <div style={styles.scoreFill(r.score)} />
          </div>

          <div style={{ marginTop: "20px", display: "grid", gap: "12px" }}>
            <div>
              <div style={{ ...styles.label, color: palette.success }}>良かった点</div>
              <div style={{ fontSize: "13px", lineHeight: "1.7", color: palette.text }}>{r.points}</div>
            </div>
            <div>
              <div style={{ ...styles.label, color: palette.danger }}>改善点</div>
              <div style={{ fontSize: "13px", lineHeight: "1.7", color: palette.text }}>{r.improvement}</div>
            </div>
            <div>
              <div style={styles.label}>総合フィードバック</div>
              <div style={{ fontSize: "13px", lineHeight: "1.7", color: palette.muted }}>{r.feedback}</div>
            </div>
          </div>
        </div>
      ))}

      <div style={{ textAlign: "center", marginTop: "40px", display: "flex", gap: "12px", justifyContent: "center" }}>
        <button style={styles.btn("secondary")} onClick={onRetake}>
          もう一度受ける
        </button>
        <button style={styles.btn("primary")} onClick={() => window.print()}>
          印刷・保存
        </button>
      </div>
    </div>
  );
}

// ─── App Root ──────────────────────────────────────────────────────
export default function App() {
  const [view, setView] = useState(VIEWS.TEST);
  const [questions, setQuestions] = useState(
    () => JSON.parse(localStorage.getItem("questions") || "[]")
  );
  const [resultData, setResultData] = useState(null);

  const handleFinish = (data) => {
    setResultData(data);
    setView(VIEWS.RESULT);
  };

  return (
    <div style={styles.app}>
      <div style={styles.noise} />
      <div style={styles.content}>
        <header style={styles.header}>
          <div style={styles.logo}>理念テストシステム</div>
          <nav style={styles.nav}>
            <button style={styles.navBtn(view === VIEWS.ADMIN)} onClick={() => setView(VIEWS.ADMIN)}>
              管理者設定
            </button>
            <button style={styles.navBtn(view === VIEWS.TEST)} onClick={() => { setView(VIEWS.TEST); setResultData(null); }}>
              テストを受ける
            </button>
            {resultData && (
              <button style={styles.navBtn(view === VIEWS.RESULT)} onClick={() => setView(VIEWS.RESULT)}>
                結果を見る
              </button>
            )}
          </nav>
        </header>

        {view === VIEWS.ADMIN && (
          <AdminView questions={questions} setQuestions={setQuestions} />
        )}
        {view === VIEWS.TEST && (
          <TestView questions={questions} onFinish={handleFinish} />
        )}
        {view === VIEWS.RESULT && resultData && (
          <ResultView data={resultData} onRetake={() => setView(VIEWS.TEST)} />
        )}
      </div>
    </div>
  );
}
