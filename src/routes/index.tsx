import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Scientific Calculator" },
      { name: "description", content: "Animated scientific calculator with trig, logs, powers and more." },
      { property: "og:title", content: "Scientific Calculator" },
      { property: "og:description", content: "Animated scientific calculator with trig, logs, powers and more." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Calc,
});

type K = { l: string; v?: string; t?: "fn" | "op" | "eq" | "clr" };
const keys: K[] = [
  { l: "sin", v: "sin(", t: "fn" }, { l: "cos", v: "cos(", t: "fn" }, { l: "tan", v: "tan(", t: "fn" }, { l: "log", v: "log(", t: "fn" }, { l: "ln", v: "ln(", t: "fn" },
  { l: "√", v: "√(", t: "fn" }, { l: "x²", v: "^2", t: "fn" }, { l: "xʸ", v: "^", t: "fn" }, { l: "π", v: "π", t: "fn" }, { l: "e", v: "e", t: "fn" },
  { l: "(", t: "fn" }, { l: ")", t: "fn" }, { l: "n!", v: "!", t: "fn" }, { l: "AC", t: "clr" }, { l: "⌫", t: "clr" },
  { l: "7" }, { l: "8" }, { l: "9" }, { l: "%", t: "op" }, { l: "÷", t: "op" },
  { l: "4" }, { l: "5" }, { l: "6" }, { l: "1/x", v: "1/(", t: "fn" }, { l: "×", t: "op" },
  { l: "1" }, { l: "2" }, { l: "3" }, { l: "Ans", t: "fn" }, { l: "−", t: "op" },
  { l: "0" }, { l: "." }, { l: "EXP", v: "E", t: "fn" }, { l: "=", t: "eq" }, { l: "+", t: "op" },
];

const fact = (n: number): number => (n < 0 || n % 1 ? NaN : n <= 1 ? 1 : n * fact(n - 1));

function evaluate(expr: string, deg: boolean, ans: number) {
  const r = (x: number) => (deg ? (x * Math.PI) / 180 : x);
  let s = expr
    .replace(/×/g, "*").replace(/÷/g, "/").replace(/−/g, "-")
    .replace(/Ans/g, `(${ans})`).replace(/π/g, "(PI)").replace(/(?<![a-z])e(?![a-z])/g, "(EE)")
    .replace(/E/g, "*10**").replace(/\^/g, "**").replace(/%/g, "/100")
    .replace(/(\d+(\.\d+)?|\([^()]*\))!/g, "F($1)")
    .replace(/√/g, "sqrt").replace(/ln\(/g, "LN(").replace(/log\(/g, "LG(");
  const open = (s.match(/\(/g) || []).length - (s.match(/\)/g) || []).length;
  s += ")".repeat(Math.max(0, open));
  const f = new Function("sin", "cos", "tan", "LG", "LN", "sqrt", "F", "PI", "EE", `return (${s})`);
  const v = f((x: number) => Math.sin(r(x)), (x: number) => Math.cos(r(x)), (x: number) => Math.tan(r(x)), Math.log10, Math.log, Math.sqrt, fact, Math.PI, Math.E);
  if (typeof v !== "number" || !isFinite(v)) throw 0;
  return parseFloat(v.toPrecision(12));
}

function Calc() {
  const [expr, setExpr] = useState("");
  const [res, setRes] = useState("0");
  const [ans, setAns] = useState(0);
  const [deg, setDeg] = useState(true);
  const [flash, setFlash] = useState(0);

  const press = (k: K) => {
    if (k.l === "AC") { setExpr(""); setRes("0"); return; }
    if (k.l === "⌫") { setExpr((e) => e.slice(0, -1)); return; }
    if (k.l === "=") {
      try { const v = evaluate(expr, deg, ans); setRes(String(v)); setAns(v); setFlash((f) => f + 1); }
      catch { setRes("Error"); }
      return;
    }
    setExpr((e) => e + (k.v ?? k.l));
  };

  return (
    <main className="calc-bg flex min-h-screen items-center justify-center p-4">
      <div className="calc-shell w-full max-w-md rounded-3xl p-5">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-sm font-semibold tracking-widest text-muted-foreground">SCIENTIFIC</h1>
          <button onClick={() => setDeg(!deg)} className="calc-key calc-fn rounded-full px-3 py-1 text-xs">{deg ? "DEG" : "RAD"}</button>
        </div>
        <div className="calc-screen mb-5 rounded-2xl p-4 text-right">
          <div className="min-h-6 break-all text-sm text-muted-foreground">{expr || " "}</div>
          <div key={flash} className="calc-result break-all text-4xl font-bold text-foreground">{res}</div>
        </div>
        <div className="grid grid-cols-5 gap-2">
          {keys.map((k, i) => (
            <button key={k.l} onClick={() => press(k)} style={{ animationDelay: `${i * 18}ms` }}
              className={`calc-key calc-${k.t ?? "num"} h-14 rounded-2xl text-lg font-medium`}>
              {k.l}
            </button>
          ))}
        </div>
      </div>
    </main>
  );
}
