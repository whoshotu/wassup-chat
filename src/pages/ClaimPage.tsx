import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { AlertCircle, ArrowLeft, Check, Copy, KeyRound, Sparkles } from "lucide-react";

/** Deployed license worker, e.g. https://wassup-license.example.workers.dev */
const LICENSE_API_URL = import.meta.env.VITE_LICENSE_API_URL || "";

export default function ClaimPage() {
  const navigate = useNavigate();
  const [orderId, setOrderId] = useState("");
  const [email, setEmail] = useState("");
  const [key, setKey] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  async function claim(event: React.FormEvent) {
    event.preventDefault();
    if (!email.trim() || loading) return;

    setLoading(true);
    setError("");
    setKey("");

    try {
      const response = await fetch(`${LICENSE_API_URL}/claim`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: orderId.trim() || undefined, email: email.trim() }),
      });
      const data = await response.json().catch(() => null);

      if (!response.ok || !data?.ok || typeof data.key !== "string") {
        setError(
          data?.message ||
            "We could not find that purchase. Use the email and order id from your Ko-fi receipt."
        );
        return;
      }
      setKey(data.key);
    } catch {
      setError("Could not reach the license server. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  async function copy() {
    await navigator.clipboard.writeText(key);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-white">
      <header className="flex items-center justify-between px-6 py-6 max-w-3xl mx-auto">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <div className="flex items-center gap-3">
          <div className="bg-primary p-1.5 rounded-lg">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold gradient-text">Wassup</span>
        </div>
      </header>

      <main className="px-6 pb-24 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 mb-6">
          <KeyRound className="w-4 h-4 text-primary" />
          <span className="text-xs font-bold uppercase tracking-widest text-primary">
            Claim your Pro license
          </span>
        </div>

        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
          Get the key for your <span className="gradient-text">30-day pass.</span>
        </h1>
        <p className="text-slate-400 mb-10 leading-relaxed">
          Enter the email and Ko-fi order id from your receipt. You will get a license key to paste
          into the extension. Your 30 days start the first time you activate it.
        </p>

        {LICENSE_API_URL ? (
          <form onSubmit={claim} className="space-y-5 bg-[#121216] border border-white/10 rounded-3xl p-8">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-500">
                Email used at checkout
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full bg-[#0a0a0c] border border-white/10 rounded-xl py-3 px-4 text-slate-200 text-sm focus:outline-none focus:border-primary/50"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-500">
                Ko-fi order id <span className="normal-case tracking-normal text-slate-600">(optional)</span>
              </label>
              <input
                type="text"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                placeholder="txn_1234567"
                className="w-full bg-[#0a0a0c] border border-white/10 rounded-xl py-3 px-4 text-slate-200 text-sm focus:outline-none focus:border-primary/50"
              />
              <p className="text-xs text-slate-600">
                Only needed when you bought more than one pass with the same email.
              </p>
            </div>

            {error && (
              <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/30 rounded-xl p-3">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <p className="text-sm text-red-300">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              disabled={loading || !email.trim()}
              className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl"
            >
              {loading ? "Looking up your purchase..." : "Get my license key"}
            </Button>
          </form>
        ) : (
          <div className="flex items-start gap-2 bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <p className="text-sm text-amber-300">
              Key lookup is not configured in this build. Email support with your Ko-fi receipt and
              we will send your key.
            </p>
          </div>
        )}

        {key && (
          <div className="mt-8 bg-emerald-500/5 border border-emerald-500/30 rounded-3xl p-8">
            <p className="text-xs font-bold uppercase tracking-widest text-emerald-400 mb-3">
              Your license key
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <code className="flex-1 min-w-[240px] bg-[#0a0a0c] border border-white/10 rounded-xl py-3 px-4 text-lg font-mono tracking-wider text-white">
                {key}
              </code>
              <Button
                onClick={copy}
                variant="outline"
                className="border-white/10 bg-white/5 text-white"
              >
                {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                {copied ? "Copied" : "Copy"}
              </Button>
            </div>
            <p className="text-sm text-slate-400 mt-4">
              Open the Wassup Decoder Pro popup, paste the key into <strong>License key</strong>, and
              press Activate. That starts your 30 days.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
