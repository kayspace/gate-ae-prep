import { useState } from "react";

export function YtApiKeyBox({
  apiKey,
  onChange,
}: {
  apiKey: string;
  onChange: (v: string) => void;
}) {
  const [showKey, setShowKey] = useState(false);
  return (
    <div className="mb-10 border border-[var(--line)] p-4 max-w-2xl">
      <div className="flex items-baseline justify-between mb-2">
        <span className="tag">yt data api key {apiKey ? "· set" : "· not set"}</span>
        <button
          onClick={() => setShowKey((s) => !s)}
          className="mono text-[10px] text-[var(--muted)] hover:text-[var(--fg)] uppercase tracking-widest"
        >
          {showKey ? "hide" : "show"}
        </button>
      </div>
      {showKey && (
        <>
          <input
            type="text"
            value={apiKey}
            onChange={(e) => onChange(e.target.value)}
            placeholder="AIza..."
            className="w-full text-sm mono border-b border-[var(--line)] py-2 focus:border-[var(--fg)] transition-colors"
          />
          <p className="text-xs text-[var(--muted)] mt-2 leading-relaxed">
            get one free at{" "}
            <a
              className="link-u"
              href="https://console.cloud.google.com/apis/credentials"
              target="_blank"
              rel="noreferrer"
            >
              console.cloud.google.com
            </a>{" "}
            → create project → enable <span className="mono">YouTube Data API v3</span> → create
            api key. saved automatically as you type.
          </p>
        </>
      )}
    </div>
  );
}
