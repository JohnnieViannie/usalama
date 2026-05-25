import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiGetAnonymous, apiPostAnonymous } from "@/lib/api";

type Meta = { siteName: string; purpose: string };

export default function VisitorCheckOut() {
  const [searchParams] = useSearchParams();
  const t = searchParams.get("t")?.trim() ?? "";

  const [meta, setMeta] = useState<Meta | null>(null);
  const [metaError, setMetaError] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [doneSite, setDoneSite] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const loadMeta = useCallback(async () => {
    if (!t) {
      setMeta(null);
      setMetaError(null);
      return;
    }
    try {
      const m = await apiGetAnonymous<Meta>(`/visitor-qr-meta/?t=${encodeURIComponent(t)}`);
      if (m.purpose !== "checkout") {
        setMetaError("This link is not for sign-out.");
        return;
      }
      setMeta(m);
      setMetaError(null);
    } catch (e) {
      setMetaError(e instanceof Error ? e.message : "Invalid or expired link");
    }
  }, [t]);

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

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/40 p-4">
      <div className="w-full max-w-md rounded-xl border bg-card p-6 shadow-sm">
        <h1 className="text-lg font-semibold">Visitor sign-out</h1>
        {meta && <p className="mt-2 text-sm text-muted-foreground">{meta.siteName}</p>}
        {!t && !metaError && (
          <p className="mt-2 text-sm text-muted-foreground">Enter the checkout code you received at sign-in.</p>
        )}
        {metaError && (
          <p className="mt-4 text-sm text-destructive">
            {metaError} You can still enter your checkout code if you have it.
          </p>
        )}

        {!doneSite && (
          <div className="mt-6 space-y-4">
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
