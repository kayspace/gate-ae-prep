import { useEffect, useState } from "react";
import { CATEGORIES } from "@/lib/feedback.constants";
import { STORAGE_KEYS } from "@/lib/storage";

const COOLDOWN_MS = 30_000;

export function FeedbackView() {
 
  const [nickname, setNickname] = useState("");
  const [category, setCategory] =
    useState<(typeof CATEGORIES)[number]>("General");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle",
  );
  const [errMsg, setErrMsg] = useState("");
  const [cooldownLeft, setCooldownLeft] = useState(0);

  // cooldown tracker
  useEffect(() => {
    if (typeof window === "undefined") return;
    const check = () => {
      const last = Number(
        localStorage.getItem(STORAGE_KEYS.feedbackCooldown) || "0",
      );
      const left = Math.max(0, COOLDOWN_MS - (Date.now() - last));
      setCooldownLeft(left);
    };
    check();
    const t = setInterval(check, 1000);
    return () => clearInterval(t);
  }, [status]);

  const charsLeft = 2000 - message.length;
  const onCooldown = cooldownLeft > 0;
  const canSubmit =
    !onCooldown &&
    status !== "sending" &&
    nickname.trim().length >= 1 &&
    message.trim().length >= 5;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setStatus("sending");
    setErrMsg("");
    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nickname: nickname.trim(),
          category,
          message: message.trim(),
        }),
      });

      console.log("status", response.status);

      const text = await response.text();

      console.log("response text", text);

      if (!response.ok) {
        throw new Error(`Request failed: ${response.status}`);
      }

      const res = await response.json();
      if (res.ok) {
        setStatus("sent");
        setMessage("");
        try {
          localStorage.setItem(
            STORAGE_KEYS.feedbackCooldown,
            String(Date.now()),
          );
        } catch {}
      } else {
        setStatus("error");
        setErrMsg(res.error);
      }
    } catch (err) {
      setStatus("error");
      setErrMsg(err instanceof Error ? err.message : "submission failed");
    }
  };

  return (
    <div className="px-6 md:px-12 py-10 fade-in">
      <div className="section-num">feedback · the lifeline</div>
      <h1 className="serif text-5xl mt-2 mb-6 lowercase">your voice</h1>
      <p className="text-sm text-[var(--muted)] max-w-xl mb-3 leading-relaxed">
        your feedback is what keeps this alive and going. if you love it, hate
        it, found a bug, have an idea, want to praise or roast — drop it here.
        all of it is read and taken into account.
      </p>
      <p className="text-xs text-[var(--faint)] max-w-xl mb-8 leading-relaxed italic">
        one rule: be polite. behind every project is a person. constructive
        beats cruel, always.
      </p>

      {status === "sent" ? (
        <div className="max-w-xl border border-[var(--line)] p-8 fade-in">
          <div className="serif text-2xl mb-2 lowercase">thank you</div>
          <p className="text-sm text-[var(--muted)] leading-relaxed mb-6">
            your feedback landed. it genuinely matters. expect quiet
            improvements driven by notes like yours.
          </p>
          <button
            onClick={() => {
              setStatus("idle");
              setNickname("");
              setCategory("General");
            }}
            className="btn-ghost active px-4"
          >
            send another
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="max-w-xl space-y-5">
          <div>
            <label className="mono text-[10px] uppercase tracking-widest text-[var(--faint)] block mb-2">
              nickname
            </label>
            <input
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              maxLength={40}
              placeholder="how should i address you?"
              className="w-full text-sm border border-[var(--line)] bg-transparent px-3 py-2 focus:border-[var(--fg)] outline-none transition-colors"
              required
            />
          </div>

          <div>
            <label className="mono text-[10px] uppercase tracking-widest text-[var(--faint)] block mb-2">
              category
            </label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((c) => (
                <button
                  type="button"
                  key={c}
                  onClick={() => setCategory(c)}
                  className={`btn-ghost ${category === c ? "active" : ""}`}
                >
                  {c.toLowerCase()}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-baseline justify-between mb-2">
              <label className="mono text-[10px] uppercase tracking-widest text-[var(--faint)]">
                message
              </label>
              <span
                className={`mono text-[10px] ${charsLeft < 0 ? "text-red-500" : "text-[var(--faint)]"}`}
              >
                {charsLeft}
              </span>
            </div>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              maxLength={2000}
              rows={7}
              placeholder="what's on your mind? bugs, ideas, praise, anything..."
              className="w-full text-sm border border-[var(--line)] bg-transparent px-3 py-2 focus:border-[var(--fg)] outline-none transition-colors resize-y leading-relaxed"
              required
            />
          </div>

          {status === "error" && (
            <div className="text-xs text-red-500 mono">{errMsg}</div>
          )}

          <div className="flex items-center gap-4">
            <button
              type="submit"
              disabled={!canSubmit}
              className="btn-ghost active px-5 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {status === "sending" ? "sending..." : "send feedback"}
            </button>
            {onCooldown && (
              <span className="mono text-[10px] text-[var(--faint)] uppercase tracking-widest">
                wait {Math.ceil(cooldownLeft / 1000)}s before sending again
              </span>
            )}
          </div>
        </form>
      )}
    </div>
  );
}
