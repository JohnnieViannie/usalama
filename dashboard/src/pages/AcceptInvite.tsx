import { FormEvent, useEffect, useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiGet, apiPost } from "@/lib/api";
import { toast } from "sonner";

type InviteInfo = {
  valid: boolean;
  email: string;
  firstName?: string;
  lastName?: string;
  companyName?: string;
  expiresAt: string;
};

export default function AcceptInvite() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = params.get("token") || "";
  const [info, setInfo] = useState<InviteInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    (async () => {
      if (!token) {
        toast.error("Missing invite token");
        setLoading(false);
        return;
      }
      try {
        const data = await apiGet<InviteInfo>(`/dashboard-invite-status/?token=${encodeURIComponent(token)}`);
        setInfo(data);
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Invite is invalid");
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (password.length < 8) return toast.error("Password must be at least 8 characters");
    if (password !== confirm) return toast.error("Passwords do not match");
    setSubmitting(true);
    try {
      await apiPost("/dashboard-invite-accept/", { token, password });
      toast.success("Invite accepted. You can now sign in.");
      navigate("/login");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to accept invite");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md items-center p-6">
      <div className="w-full space-y-4">
        <h1 className="text-2xl font-semibold">Accept Invite</h1>
        {loading && <p className="text-sm text-muted-foreground">Checking invite…</p>}
        {!loading && !info && <p className="text-sm text-destructive">Invite is invalid, expired, or already used.</p>}
        {!loading && info && (
          <>
            <p className="text-sm text-muted-foreground">
              Invited email: <span className="font-medium text-foreground">{info.email}</span>
            </p>
            <form onSubmit={submit} className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="password">Set password</Label>
                <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="confirm">Confirm password</Label>
                <Input id="confirm" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required />
              </div>
              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? "Submitting…" : "Activate account"}
              </Button>
            </form>
          </>
        )}
        <p className="text-center text-xs text-muted-foreground">
          <Link to="/login" className="underline-offset-4 hover:underline">
            Go to sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
