import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { apiPrefix } from "@/lib/api";
import { toast } from "sonner";
import type { RegistrationField } from "@/lib/mockData";

type PublicFormResponse = {
  title: string;
  eventName?: string;
  siteName?: string;
  token: string;
  companyName?: string;
  fields: RegistrationField[];
};

export default function PublicRegistration() {
  const { token = "" } = useParams();
  const [meta, setMeta] = useState<PublicFormResponse | null>(null);
  const [values, setValues] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${apiPrefix}/public-registration/${token}/`);
        if (!res.ok) throw new Error(await res.text());
        const data = (await res.json()) as PublicFormResponse;
        setMeta(data);
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Failed to load registration form");
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  const setValue = (key: string, val: string) => {
    setValues((prev) => ({ ...prev, [key]: val }));
  };

  const requiredMissing = (meta?.fields || [])
    .filter((field) => field.required)
    .filter((field) => !(values[field.key] || "").trim());

  const fieldError = (field: RegistrationField): string => {
    if (!field.required) return "";
    if (!touched[field.key]) return "";
    const val = (values[field.key] || "").trim();
    return val ? "" : `${field.label} is required`;
  };

  const submit = async () => {
    if (!meta) return;
    const nextTouched: Record<string, boolean> = {};
    (meta.fields || []).forEach((field) => {
      nextTouched[field.key] = true;
    });
    setTouched((prev) => ({ ...prev, ...nextTouched }));
    if (requiredMissing.length > 0) {
      toast.error("Please complete required fields");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`${apiPrefix}/public-registration/${token}/submit/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ values }),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Submission failed");
      }
      setSubmitted(true);
      toast.success("Registration submitted");
      setValues({});
      setTouched({});
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Submission failed");
    } finally {
      setSaving(false);
    }
  };

  const renderInput = (field: RegistrationField) => {
    const commonClass = `w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none transition ${
      fieldError(field) ? "border-destructive" : "focus:border-primary"
    }`;
    const value = values[field.key] ?? "";
    if (field.type === "textarea") {
      return (
        <textarea
          className={`${commonClass} min-h-24`}
          value={value}
          onBlur={() => setTouched((prev) => ({ ...prev, [field.key]: true }))}
          onChange={(e) => setValue(field.key, e.target.value)}
        />
      );
    }
    return (
      <input
        className={commonClass}
        type={
          field.type === "datetime"
            ? "datetime-local"
            : field.type === "number"
            ? "number"
            : field.type === "email"
            ? "email"
            : field.type === "phone"
            ? "tel"
            : "text"
        }
        value={value}
        onBlur={() => setTouched((prev) => ({ ...prev, [field.key]: true }))}
        onChange={(e) => setValue(field.key, e.target.value)}
      />
    );
  };

  return (
    <div className="min-h-screen bg-muted/20 py-8">
      <div className="mx-auto w-full max-w-3xl px-4">
        <div className="mb-5 rounded-2xl border bg-card p-6">
          <div className="text-xs font-semibold uppercase tracking-wide text-primary">
            {meta?.companyName || "Company Registration"}
          </div>
          <h1 className="mt-2 text-2xl font-semibold">{meta?.title || "Event Registration"}</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {meta?.eventName ? `${meta.eventName}` : "Registration Form"}
            {meta?.siteName ? ` · ${meta.siteName}` : ""}
          </p>
          <p className="mt-3 text-sm text-muted-foreground">
            Fill this form once. Required questions are marked with <span className="text-destructive">*</span>.
          </p>
        </div>

        {loading && (
          <div className="rounded-xl border bg-card p-6 text-sm text-muted-foreground">
            Loading registration form...
          </div>
        )}

        {submitted && (
          <div className="mb-4 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700">
            Submission received successfully.
          </div>
        )}

        <div className="space-y-4">
          {(meta?.fields || []).map((field) => (
            <div key={field.key} className="rounded-xl border bg-card p-4">
              <label className="mb-2 block text-sm font-medium">
                {field.label}
                {field.required ? <span className="ml-1 text-destructive">*</span> : null}
              </label>
              {renderInput(field)}
              {fieldError(field) ? (
                <div className="mt-1 text-xs text-destructive">{fieldError(field)}</div>
              ) : null}
            </div>
          ))}
        </div>

        {!loading && (
          <div className="mt-5 rounded-xl border bg-card p-4">
            <div className="mb-3 text-xs text-muted-foreground">
              {requiredMissing.length > 0
                ? `${requiredMissing.length} required field(s) left`
                : "All required fields completed"}
            </div>
            <p className="mb-3 text-xs text-muted-foreground">
              By submitting, you acknowledge our{" "}
              <Link to="/privacy" className="text-primary underline-offset-2 hover:underline" target="_blank" rel="noreferrer">
                Privacy Policy
              </Link>{" "}
              and{" "}
              <Link to="/terms" className="text-primary underline-offset-2 hover:underline" target="_blank" rel="noreferrer">
                Terms of Service
              </Link>
              .
            </p>
            <button
              className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground disabled:opacity-60"
              onClick={() => void submit()}
              disabled={saving || !meta}
            >
              {saving ? "Submitting..." : "Submit registration"}
            </button>
          </div>
        )}

        <p className="mt-8 text-center text-xs text-muted-foreground">
          <Link to="/privacy" className="underline-offset-4 hover:underline" target="_blank" rel="noreferrer">
            Privacy
          </Link>
          <span className="mx-2">·</span>
          <Link to="/terms" className="underline-offset-4 hover:underline" target="_blank" rel="noreferrer">
            Terms
          </Link>
        </p>
      </div>
    </div>
  );
}
