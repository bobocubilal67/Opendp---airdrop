import { useState } from "react";

const ROLES = [
  { id: "og_alpha", label: "OG Alpha", emoji: "🔷", score: 100, members: 17, description: "En değerli OG rolü" },
  { id: "og_socials", label: "OG Socials", emoji: "🔷", score: 90, members: 20, description: "Sosyal medya OG'leri" },
  { id: "moderator", label: "Moderators", emoji: "🔴", score: 85, members: 8, description: "Sunucu moderatörleri" },
  { id: "alpha_squad", label: "Alpha Squad", emoji: "🔵", score: 70, members: 91, description: "Alpha topluluk üyeleri" },
  { id: "reinforcement", label: "Reinforcement", emoji: "🟠", score: 50, members: 14, description: "Destek rollü" },
];

function getTier(score) {
  if (score >= 160) return { label: "🏆 Whale Tier", color: "#f59e0b", bg: "#451a03" };
  if (score >= 120) return { label: "💎 Diamond", color: "#818cf8", bg: "#1e1b4b" };
  if (score >= 90)  return { label: "🔵 Blue Chip", color: "#38bdf8", bg: "#0c1a2e" };
  if (score >= 60)  return { label: "🟢 Eligible",  color: "#4ade80", bg: "#052e16" };
  return              { label: "⚪ Low Chance",      color: "#6b7280", bg: "#111827" };
}

function formatNum(n) {
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(2) + "B";
  if (n >= 1_000_000)     return (n / 1_000_000).toFixed(2) + "M";
  if (n >= 1_000)         return (n / 1_000).toFixed(1) + "K";
  return Math.round(n).toLocaleString();
}

function formatUSD(n) {
  if (n >= 1_000_000_000) return "$" + (n / 1_000_000_000).toFixed(2) + "B";
  if (n >= 1_000_000)     return "$" + (n / 1_000_000).toFixed(2) + "M";
  if (n >= 1_000)         return "$" + (n / 1_000).toFixed(1) + "K";
  return "$" + n.toFixed(2);
}

function Slider({ label, min, max, step, value, onChange, format, color = "#3b82f6" }) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
        <span style={{ fontSize: 13, color: "#94a3b8" }}>{label}</span>
        <span style={{ fontSize: 14, fontWeight: 700, color }}>{format(value)}</span>
      </div>
      <div style={{ position: "relative", height: 6, background: "rgba(255,255,255,0.08)", borderRadius: 3 }}>
        <div style={{
          position: "absolute", left: 0, top: 0, height: "100%",
          width: pct + "%", background: `linear-gradient(90deg, #3b82f6, ${color})`,
          borderRadius: 3, transition: "width 0.1s",
        }} />
        <input
          type="range" min={min} max={max} step={step} value={value}
          onChange={e => onChange(Number(e.target.value))}
          style={{
            position: "absolute", top: "50%", left: 0,
            transform: "translateY(-50%)", width: "100%",
            opacity: 0, cursor: "pointer", height: 20, margin: 0,
          }}
        />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
        <span style={{ fontSize: 10, color: "#374151" }}>{format(min)}</span>
        <span style={{ fontSize: 10, color: "#374151" }}>{format(max)}</span>
      </div>
    </div>
  );
}

function VestingBar({ tgeUnlock, cliffMonths, vestingMonths, totalTokens, tokenPrice }) {
  const tgeTokens = totalTokens * (tgeUnlock / 100);
  const remainingTokens = totalTokens - tgeTokens;
  const monthlyUnlock = vestingMonths > 0 ? remainingTokens / vestingMonths : 0;
  const months = [];
  months.push({ label: "TGE", tokens: tgeTokens, type: "tge" });
  for (let i = 1; i <= cliffMonths; i++) months.push({ label: `A${i}`, tokens: 0, type: "cliff" });
  for (let i = 1; i <= vestingMonths; i++) months.push({ label: `A${cliffMonths+i}`, tokens: monthlyUnlock, type: "vest" });
  const maxTokens = Math.max(...months.map(m => m.tokens), 1);
  return (
    <div>
      <div style={{ display: "flex", gap: 16, marginBottom: 14, flexWrap: "wrap" }}>
        {[["#f59e0b","TGE Unlock"],["rgba(255,255,255,0.1)","Cliff (kilitli)"],["#8b5cf6","Aylık Vesting"]].map(([c,l]) => (
          <div key={l} style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <div style={{ width: 10, height: 10, borderRadius: 2, background: c }} />
            <span style={{ fontSize: 11, color: "#94a3b8" }}>{l}</span>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 3, alignItems: "flex-end", height: 60, overflowX: "auto", paddingBottom: 4 }}>
        {months.slice(0, 18).map((m, i) => (
          <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", minWidth: 28, flex: "0 0 auto" }}>
            <div style={{
              width: "100%",
              height: Math.max((m.tokens / maxTokens) * 50, m.type === "cliff" ? 4 : 0),
              background: m.type === "tge" ? "#f59e0b" : m.type === "cliff" ? "rgba(255,255,255,0.08)" : "#8b5cf6",
              borderRadius: "3px 3px 0 0", minHeight: m.type === "cliff" ? 4 : 0,
            }} />
            <span style={{ fontSize: 9, color: "#475569", marginTop: 3 }}>{m.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const SECTION = { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, padding: "20px", marginBottom: 16 };

export default function App() {
  const [step, setStep] = useState(1);
  const [selectedRole, setSelectedRole] = useState(null);
  const [xp, setXp] = useState("");
  const [result, setResult] = useState(null);
  const [fdv, setFdv] = useState(1000);
  const [totalSupply, setTotalSupply] = useState(1000);
  const [airdropPct, setAirdropPct] = useState(15);
  const [tgeUnlock, setTgeUnlock] = useState(20);
  const [cliffMonths, setCliffMonths] = useState(3);
  const [vestingMonths, setVestingMonths] = useState(12);

  const handleCalculate = () => {
    const xpVal = parseFloat(xp) || 0;
    const roleScore = selectedRole.score;
    const totalScore = roleScore * (1 + xpVal / 10000);
    const tier = getTier(totalScore);
    const xpBonus = ((xpVal / 10000) * 100).toFixed(1);
    const totalSupplyRaw = totalSupply * 1_000_000;
    const fdvRaw = fdv * 1_000_000;
    const tokenPrice = fdvRaw / totalSupplyRaw;
    const airdropPool = totalSupplyRaw * (airdropPct / 100);
    const estimatedTokens = (airdropPool * (roleScore/100) * 0.008) * (1 + xpVal / 10000);
    const tgeTokens = estimatedTokens * (tgeUnlock / 100);
    const tgeUSD = tgeTokens * tokenPrice;
    const totalUSD = estimatedTokens * tokenPrice;
    setResult({ totalScore, tier, xpBonus, xpVal, roleScore, estimatedTokens, tokenPrice, tgeTokens, tgeUSD, totalUSD });
    setStep(3);
  };

  const reset = () => { setSelectedRole(null); setXp(""); setResult(null); setStep(1); };

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg,#0a0a1a,#0d1a2e,#0a0a1a)", fontFamily: "Inter,system-ui,sans-serif", color: "#e2e8f0", display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div style={{ width: "100%", background: "rgba(255,255,255,0.03)", borderBottom: "1px solid rgba(255,255,255,0.06)", padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", boxSizing: "border-box" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: "linear-gradient(135deg,#3b82f6,#8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, fontWeight: 800, color: "#fff" }}>G</div>
          <span style={{ fontWeight: 700, fontSize: 16 }}>OpenGDP</span>
          <span style={{ background: "rgba(59,130,246,0.15)", color: "#60a5fa", fontSize: 10, padding: "2px 8px", borderRadius: 20, border: "1px solid rgba(59,130,246,0.3)", fontWeight: 600 }}>AIRDROP CALC</span>
        </div>
        <span style={{ fontSize: 11, color: "#475569" }}>GDP Token Tahmin Aracı</span>
      </div>

      <div style={{ width: "100%", maxWidth: 500, padding: "28px 18px", boxSizing: "border-box" }}>
        <div style={{ display: "flex", gap: 6, marginBottom: 28, alignItems: "center" }}>
          {[1,2,3].map(s => (
            <div key={s} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 26, height: 26, borderRadius: "50%", background: step >= s ? "linear-gradient(135deg,#3b82f6,#8b5cf6)" : "rgba(255,255,255,0.06)", border: step === s ? "2px solid #60a5fa" : "2px solid transparent", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: step >= s ? "#fff" : "#475569" }}>{s}</div>
              {s < 3 && <div style={{ width: 28, height: 1, background: step > s ? "#3b82f6" : "rgba(255,255,255,0.1)" }} />}
            </div>
          ))}
          <span style={{ fontSize: 12, color: "#64748b", marginLeft: 4 }}>{step===1?"Rolünü Seç":step===2?"Bilgilerini Gir":"Tahmin Hazır"}</span>
        </div>

        {step === 1 && (
          <div>
            <h2 style={{ fontSize: 21, fontWeight: 800, margin: "0 0 6px", letterSpacing: "-0.5px" }}>Discord Rolün Nedir?</h2>
            <p style={{ fontSize: 13, color: "#64748b", margin: "0 0 22px" }}>OpenGDP Discord sunucusundaki rolünü seç</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
              {ROLES.map(role => (
                <button key={role.id} onClick={() => { setSelectedRole(role); setStep(2); }} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: "13px 16px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between", color: "#e2e8f0", textAlign: "left" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
                    <span style={{ fontSize: 19 }}>{role.emoji}</span>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14 }}>{role.label}</div>
                      <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>{role.description} · {role.members} üye</div>
                    </div>
                  </div>
                  <div style={{ background: "rgba(59,130,246,0.15)", color: "#60a5fa", padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 700 }}>{role.score}p</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <button onClick={() => setStep(1)} style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer", fontSize: 13, padding: 0, marginBottom: 18 }}>← Geri</button>
            <div style={{ background: "rgba(59,130,246,0.07)", border: "1px solid rgba(59,130,246,0.18)", borderRadius: 12, padding: "11px 15px", marginBottom: 22, display: "flex", alignItems: "center", gap: 11 }}>
              <span style={{ fontSize: 20 }}>{selectedRole?.emoji}</span>
              <div><div style={{ fontSize: 12, color: "#64748b" }}>Seçilen rol</div><div style={{ fontWeight: 700 }}>{selectedRole?.label}</div></div>
              <div style={{ marginLeft: "auto", fontWeight: 800, color: "#60a5fa", fontSize: 17 }}>{selectedRole?.score}p</div>
            </div>
            <div style={SECTION}>
              <div style={{ fontSize: 12, color: "#64748b", fontWeight: 600, marginBottom: 14, textTransform: "uppercase", letterSpacing: "0.05em" }}>XP Puanın</div>
              <input type="number" min="0" placeholder="Örnek: 5000" value={xp} onChange={e => setXp(e.target.value)} style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 10, padding: "13px 15px", fontSize: 19, fontWeight: 700, color: "#e2e8f0", outline: "none", boxSizing: "border-box" }} />
              {xp && <div style={{ fontSize: 12, color: "#64748b", marginTop: 8 }}>XP bonusu: <span style={{ color: "#4ade80", fontWeight: 700 }}>+{((parseFloat(xp)/10000)*100).toFixed(1)}%</span></div>}
            </div>
            <div style={SECTION}>
              <div style={{ fontSize: 12, color: "#64748b", fontWeight: 600, marginBottom: 18, textTransform: "uppercase", letterSpacing: "0.05em" }}>⚙️ Tokenomics Varsayımları</div>
              <Slider label="FDV" min={100} max={5000} step={50} value={fdv} onChange={setFdv} format={v=>`$${v}M`} color="#f59e0b" />
              <Slider label="Total Supply" min={100} max={10000} step={100} value={totalSupply} onChange={setTotalSupply} format={v=>`${v}M token`} color="#60a5fa" />
              <Slider label="Airdrop Payı" min={5} max={30} step={1} value={airdropPct} onChange={setAirdropPct} format={v=>`%${v}`} color="#4ade80" />
              <div style={{ padding: "10px 14px", background: "rgba(255,255,255,0.03)", borderRadius: 10, fontSize: 12, color: "#94a3b8" }}>
                Token fiyatı: <span style={{ color: "#f59e0b", fontWeight: 700 }}>${((fdv*1_000_000)/(totalSupply*1_000_000)).toFixed(4)}</span>
                <span style={{ color: "#475569", marginLeft: 10 }}>Havuz: {formatNum(totalSupply*1_000_000*airdropPct/100)} GDP</span>
              </div>
            </div>
            <div style={SECTION}>
              <div style={{ fontSize: 12, color: "#64748b", fontWeight: 600, marginBottom: 18, textTransform: "uppercase", letterSpacing: "0.05em" }}>🔓 Vesting Yapısı</div>
              <Slider label="TGE'de Unlock" min={0} max={100} step={5} value={tgeUnlock} onChange={setTgeUnlock} format={v=>`%${v}`} color="#f59e0b" />
              <Slider label="Cliff Süresi" min={0} max={24} step={1} value={cliffMonths} onChange={setCliffMonths} format={v=>v===0?"Yok":`${v} ay`} color="#ef4444" />
              <Slider label="Vesting Süresi" min={0} max={36} step={1} value={vestingMonths} onChange={setVestingMonths} format={v=>v===0?"Yok":`${v} ay`} color="#8b5cf6" />
            </div>
            <button onClick={handleCalculate} style={{ width: "100%", padding: "15px", background: "linear-gradient(135deg,#3b82f6,#8b5cf6)", border: "none", borderRadius: 12, color: "#fff", fontSize: 16, fontWeight: 700, cursor: "pointer" }}>Tahmini Hesapla →</button>
          </div>
        )}

        {step === 3 && result && (
          <div>
            <div style={{ background: result.tier.bg, border: `1px solid ${result.tier.color}40`, borderRadius: 16, padding: "22px", marginBottom: 16, textAlign: "center" }}>
              <div style={{ fontSize: 30, marginBottom: 6 }}>{result.tier.label.split(" ")[0]}</div>
              <div style={{ fontSize: 21, fontWeight: 800, color: result.tier.color }}>{result.tier.label.split(" ").slice(1).join(" ")}</div>
              <div style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>Airdrop Eligibility Seviyesi</div>
            </div>
            <div style={SECTION}>
              <div style={{ fontSize: 11, color: "#64748b", fontWeight: 600, marginBottom: 14, textTransform: "uppercase" }}>Puan Dökümü</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ fontSize: 13, color: "#94a3b8" }}>{selectedRole?.emoji} {selectedRole?.label}</span><span style={{ fontWeight: 700, color: "#60a5fa" }}>{result.roleScore}</span></div>
                <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ fontSize: 13, color: "#94a3b8" }}>XP Çarpanı</span><span style={{ fontWeight: 700, color: "#4ade80" }}>+{result.xpBonus}%</span></div>
                <div style={{ height: 1, background: "rgba(255,255,255,0.06)" }} />
                <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ fontSize: 14, fontWeight: 700 }}>Toplam Skor</span><span style={{ fontSize: 19, fontWeight: 800, color: result.tier.color }}>{result.totalScore.toFixed(1)}</span></div>
              </div>
            </div>
            <div style={{ background: "rgba(139,92,246,0.08)", border: "1px solid rgba(139,92,246,0.2)", borderRadius: 16, padding: "20px", marginBottom: 16 }}>
              <div style={{ fontSize: 11, color: "#64748b", fontWeight: 600, marginBottom: 14, textTransform: "uppercase" }}>Tahmini Airdrop</div>
              <div style={{ fontSize: 34, fontWeight: 800, color: "#c4b5fd", marginBottom: 4 }}>~{formatNum(result.estimatedTokens)} GDP</div>
              <div style={{ fontSize: 13, color: "#94a3b8", marginBottom: 14 }}>Token fiyatı: <span style={{ color: "#f59e0b", fontWeight: 700 }}>${result.tokenPrice.toFixed(4)}</span> · Toplam: <span style={{ color: "#4ade80", fontWeight: 700 }}>{formatUSD(result.totalUSD)}</span></div>
              <div style={{ display: "flex", gap: 10 }}>
                <div style={{ flex: 1, background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: 10, padding: "12px" }}>
                  <div style={{ fontSize: 11, color: "#fbbf24", fontWeight: 600, marginBottom: 4 }}>🚀 TGE'de Al</div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: "#f59e0b" }}>{formatNum(result.tgeTokens)}</div>
                  <div style={{ fontSize: 11, color: "#94a3b8" }}>{formatUSD(result.tgeUSD)}</div>
                </div>
                <div style={{ flex: 1, background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.2)", borderRadius: 10, padding: "12px" }}>
                  <div style={{ fontSize: 11, color: "#c4b5fd", fontWeight: 600, marginBottom: 4 }}>⏳ Vesting</div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: "#8b5cf6" }}>{formatNum(result.estimatedTokens - result.tgeTokens)}</div>
                  <div style={{ fontSize: 11, color: "#94a3b8" }}>{cliffMonths}ay cliff + {vestingMonths}ay vest</div>
                </div>
              </div>
            </div>
            <div style={SECTION}>
              <div style={{ fontSize: 11, color: "#64748b", fontWeight: 600, marginBottom: 14, textTransform: "uppercase" }}>📅 Unlock Takvimi</div>
              <VestingBar tgeUnlock={tgeUnlock} cliffMonths={cliffMonths} vestingMonths={vestingMonths} totalTokens={result.estimatedTokens} tokenPrice={result.tokenPrice} />
            </div>
            <div style={{ fontSize: 11, color: "#374151", textAlign: "center", marginBottom: 16 }}>⚠️ Resmi değildir. Rakamlar tahminidir, yatırım tavsiyesi değildir.</div>
            <button onClick={reset} style={{ width: "100%", padding: "13px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, color: "#94a3b8", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>← Yeniden Hesapla</button>
          </div>
        )}
      </div>
    </div>
  );
                       }
