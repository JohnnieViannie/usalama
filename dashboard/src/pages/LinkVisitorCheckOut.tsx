import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiGetAnonymous, apiPostAnonymous } from "@/lib/api";

type PublicMeta = {
  title: string;
  eventName?: string;
  siteName?: string;
  token: string;
};

export default function LinkVisitorCheckOut() {
  const { token = "" } = useParams();

  const [meta, setMeta] = useState<PublicMeta | null>(null);
  const [metaError, setMetaError] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [doneSite, setDoneSite] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const loadMeta = useCallback(async () => {
    if (!token) {
      setMeta(null);
      setMetaError("Missing registration link.");
      return;
    }
    try {
      const m = await apiGetAnonymous<PublicMeta>(`/public-registration/${token}/`);
      setMeta(m);
      setMetaError(null);
    } catch (e) {
      setMetaError(e instanceof Error ? e.message : "Invalid or expired link");
    }
  }, [token]);

  useEffect(() => {
    void loadMeta();
  }, [loadMeta]);

  const submit = async () => {
    setBusy(true);
    setActionError(null);
    try {
      const res = await apiPostAnonymous<{ ok: boolean; siteName: string }>("/visitor-sessions/checkout/", {
        checkoutCode: code,
      });
      setDoneSite(res.siteName);
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "Sign-out failed");
    } finally {
      setBusy(false);
    }
  };

  const headline = meta
    ? [meta.title, meta.eventName].filter(Boolean).join(" · ") || "Visitor sign-out"
    : "Visitor sign-out";

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/40 p-4">
      <div className="w-full max-w-md rounded-xl border bg-card p-6 shadow-sm">
        <h1 className="text-lg font-semibold">Visitor sign-out</h1>
        {meta && !metaError && <p className="mt-2 text-sm text-muted-foreground">{headline}</p>}
        {meta?.siteName ? <p className="text-sm text-muted-foreground">{meta.siteName}</p> : null}

        {metaError && (
          <p className="mt-4 text-sm text-destructive">
            {metaError} You can still enter your checkout code if you have it.
          </p>
        )}

        {!doneSite && (
          <div className="mt-6 space-y-4">
            <p className="text-sm text-muted-foreground">Enter the checkout code you received at sign-in.</p>
            <Input
              placeholder="Checkout code"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              className="font-mono tracking-widest"
              autoCapitalize="characters"
            />
            {actionError && <p className="text-sm text-destructive">{actionError}</p>}
            <Button className="w-full" onClick={() => void submit()} disabled={busy || code.trim().length < 4}>
              {busy ? "Working…" : "Sign out"}
            </Button>
          </div>
        )}

        {doneSite && (
          <p className="mt-6 text-sm font-medium text-emerald-700 dark:text-emerald-400">
            Signed out successfully{doneSite ? ` — ${doneSite}` : ""}.
          </p>
        )}
      </div>
    </div>
  );
}
