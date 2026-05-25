import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import SignaturePad from "@/components/incident-investigation/SignaturePad";
import type {
  EvidenceDigitalRow,
  EvidencePhysicalRow,
  EvidenceTestimonialRow,
  InterviewRow,
  InvestigationJson,
  MeasureRow,
  SignatureValue,
} from "@/lib/incidentInvestigationTypes";

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}

function TextField({
  label,
  value,
  onChange,
  disabled,
  multiline,
}: {
  label: string;
  value?: string;
  onChange: (v: string) => void;
  disabled?: boolean;
  multiline?: boolean;
}) {
  return (
    <Field label={label}>
      {multiline ? (
        <Textarea value={value || ""} disabled={disabled} onChange={(e) => onChange(e.target.value)} rows={3} />
      ) : (
        <Input value={value || ""} disabled={disabled} onChange={(e) => onChange(e.target.value)} />
      )}
    </Field>
  );
}

function newId() {
  return crypto.randomUUID();
}

type SectionProps = {
  data: InvestigationJson;
  onChange: (next: InvestigationJson) => void;
  disabled?: boolean;
};

export function SectionA({ data, onChange, disabled }: SectionProps) {
  const a = data.section_a || {};
  const set = (k: string, v: string) => onChange({ ...data, section_a: { ...a, [k]: v } });
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <TextField label="Incident title *" value={a.incident_title} onChange={(v) => set("incident_title", v)} disabled={disabled} />
      <TextField label="Date & time of incident *" value={a.occurred_at} onChange={(v) => set("occurred_at", v)} disabled={disabled} />
      <TextField label="Date & time reported *" value={a.reported_at} onChange={(v) => set("reported_at", v)} disabled={disabled} />
      <TextField label="Reported by *" value={a.reported_by} onChange={(v) => set("reported_by", v)} disabled={disabled} />
      <TextField label="Location *" value={a.location} onChange={(v) => set("location", v)} disabled={disabled} />
      <Field label="Incident category *">
        <Select value={a.incident_category || ""} onValueChange={(v) => set("incident_category", v)} disabled={disabled}>
          <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
          <SelectContent>
            {["Theft", "Violence", "Unauthorised Access", "Policy Breach", "Data Breach", "Suspicious Activity", "Other"].map((c) => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>
      <div className="md:col-span-2">
        <TextField label="Immediate actions taken *" value={a.immediate_actions} onChange={(v) => set("immediate_actions", v)} disabled={disabled} multiline />
      </div>
      <TextField label="Immediate supervisor notified *" value={a.supervisor_notified} onChange={(v) => set("supervisor_notified", v)} disabled={disabled} />
      <Field label="External authority involved *">
        <Select value={a.external_authority || ""} onValueChange={(v) => set("external_authority", v)} disabled={disabled}>
          <SelectTrigger><SelectValue placeholder="Yes / No" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="yes">Yes</SelectItem>
            <SelectItem value="no">No</SelectItem>
          </SelectContent>
        </Select>
      </Field>
      {a.external_authority === "yes" && (
        <TextField label="Specify authority *" value={a.external_authority_detail} onChange={(v) => set("external_authority_detail", v)} disabled={disabled} />
      )}
    </div>
  );
}

export function SectionB({ data, onChange, disabled }: SectionProps) {
  const b = (data.section_b || {}) as Record<string, unknown>;
  const set = (k: string, v: unknown) => onChange({ ...data, section_b: { ...b, [k]: v } });
  const sig = (b.approval_signature || {}) as SignatureValue;
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="md:col-span-2"><TextField label="What happened? *" value={String(b.what_happened || "")} onChange={(v) => set("what_happened", v)} disabled={disabled} multiline /></div>
      <TextField label="When did it happen? *" value={String(b.when_happened || "")} onChange={(v) => set("when_happened", v)} disabled={disabled} />
      <TextField label="Who was involved? *" value={String(b.who_involved || "")} onChange={(v) => set("who_involved", v)} disabled={disabled} multiline />
      <Field label="Severity *">
        <Select value={String(b.severity_level || "")} onValueChange={(v) => set("severity_level", v)} disabled={disabled}>
          <SelectTrigger><SelectValue placeholder="Level" /></SelectTrigger>
          <SelectContent>
            {["Low", "Medium", "High", "Critical"].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
      </Field>
      <Field label="Priority *">
        <Select value={String(b.priority_level || "")} onValueChange={(v) => set("priority_level", v)} disabled={disabled}>
          <SelectTrigger><SelectValue placeholder="Priority" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="immediate">Immediate (&lt;24h)</SelectItem>
            <SelectItem value="high">High (48h)</SelectItem>
            <SelectItem value="normal">Normal (5 days)</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>
      </Field>
      <div className="md:col-span-2"><TextField label="Investigation scope *" value={String(b.investigation_scope || "")} onChange={(v) => set("investigation_scope", v)} disabled={disabled} multiline /></div>
      <TextField label="Required resources" value={String(b.required_resources || "")} onChange={(v) => set("required_resources", v)} disabled={disabled} />
      <TextField label="Assigned investigator(s) *" value={String(b.assigned_investigators || "")} onChange={(v) => set("assigned_investigators", v)} disabled={disabled} />
      <TextField label="External authority notes" value={String(b.external_authority_notes || "")} onChange={(v) => set("external_authority_notes", v)} disabled={disabled} multiline />
      <div className="md:col-span-2">
        <SignaturePad
          value={sig}
          disabled={disabled}
          signerLabel="Approval to proceed — authorising manager *"
          onChange={(v) => set("approval_signature", v)}
        />
      </div>
    </div>
  );
}

export function SectionC({ data, onChange, disabled }: SectionProps) {
  const checklist = data.section_c?.checklist || [];
  const updateItem = (idx: number, patch: Partial<(typeof checklist)[0]>) => {
    const next = checklist.map((item, i) => (i === idx ? { ...item, ...patch } : item));
    onChange({ ...data, section_c: { checklist: next } });
  };
  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">Failure in scene preservation may compromise the entire investigation.</p>
      {checklist.map((item, idx) => (
        <div key={item.item_id} className="rounded-lg border p-3 grid gap-2 md:grid-cols-3">
          <div className="md:col-span-1 text-sm font-medium">{item.label}</div>
          <Select value={item.yes_no || ""} onValueChange={(v) => updateItem(idx, { yes_no: v })} disabled={disabled}>
            <SelectTrigger><SelectValue placeholder="Yes / No" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="yes">Yes</SelectItem>
              <SelectItem value="no">No</SelectItem>
            </SelectContent>
          </Select>
          <Input placeholder="Comments / evidence of action" value={item.comments || ""} disabled={disabled} onChange={(e) => updateItem(idx, { comments: e.target.value })} />
        </div>
      ))}
    </div>
  );
}

function RepeatableEvidenceD({ data, onChange, disabled }: SectionProps) {
  const d = data.section_d || { physical: [], digital: [], testimonial: [] };
  const setD = (patch: Partial<typeof d>) => onChange({ ...data, section_d: { ...d, ...patch } });

  const addPhysical = () => setD({ physical: [...(d.physical || []), { row_id: newId(), evidence_id: `PHY-${(d.physical?.length || 0) + 1}` }] });
  const addDigital = () => setD({ digital: [...(d.digital || []), { row_id: newId(), evidence_id: `DIG-${(d.digital?.length || 0) + 1}` }] });
  const addTest = () => setD({ testimonial: [...(d.testimonial || []), { row_id: newId(), witness_id: `W-${(d.testimonial?.length || 0) + 1}` }] });

  return (
    <div className="space-y-8">
      <div>
        <div className="mb-2 flex items-center justify-between">
          <h4 className="font-medium">Physical evidence</h4>
          {!disabled && <Button type="button" size="sm" variant="outline" onClick={addPhysical}>Add row</Button>}
        </div>
        {(d.physical || []).map((row, idx) => (
          <EvidencePhysicalForm key={row.row_id} row={row} disabled={disabled} onChange={(r) => {
            const physical = [...(d.physical || [])];
            physical[idx] = r;
            setD({ physical });
          }} onRemove={() => setD({ physical: (d.physical || []).filter((_, i) => i !== idx) })} />
        ))}
      </div>
      <div>
        <div className="mb-2 flex items-center justify-between">
          <h4 className="font-medium">Digital evidence</h4>
          {!disabled && <Button type="button" size="sm" variant="outline" onClick={addDigital}>Add row</Button>}
        </div>
        {(d.digital || []).map((row, idx) => (
          <EvidenceDigitalForm key={row.row_id} row={row} disabled={disabled} onChange={(r) => {
            const digital = [...(d.digital || [])];
            digital[idx] = r;
            setD({ digital });
          }} onRemove={() => setD({ digital: (d.digital || []).filter((_, i) => i !== idx) })} />
        ))}
      </div>
      <div>
        <div className="mb-2 flex items-center justify-between">
          <h4 className="font-medium">Testimonial evidence</h4>
          {!disabled && <Button type="button" size="sm" variant="outline" onClick={addTest}>Add row</Button>}
        </div>
        {(d.testimonial || []).map((row, idx) => (
          <EvidenceTestimonialForm key={row.row_id} row={row} disabled={disabled} onChange={(r) => {
            const testimonial = [...(d.testimonial || [])];
            testimonial[idx] = r;
            setD({ testimonial });
          }} onRemove={() => setD({ testimonial: (d.testimonial || []).filter((_, i) => i !== idx) })} />
        ))}
      </div>
    </div>
  );
}

function EvidencePhysicalForm({ row, onChange, onRemove, disabled }: { row: EvidencePhysicalRow; onChange: (r: EvidencePhysicalRow) => void; onRemove: () => void; disabled?: boolean }) {
  return (
    <div className="mb-3 grid gap-2 rounded-lg border p-3 md:grid-cols-2">
      <TextField label="Evidence ID" value={row.evidence_id} onChange={(v) => onChange({ ...row, evidence_id: v })} disabled={disabled} />
      <TextField label="Description" value={row.description} onChange={(v) => onChange({ ...row, description: v })} disabled={disabled} />
      <TextField label="Location found" value={row.location_found} onChange={(v) => onChange({ ...row, location_found: v })} disabled={disabled} />
      <TextField label="Collected by" value={row.collected_by} onChange={(v) => onChange({ ...row, collected_by: v })} disabled={disabled} />
      <TextField label="Date/time" value={row.collected_at} onChange={(v) => onChange({ ...row, collected_at: v })} disabled={disabled} />
      <TextField label="Chain of custody notes" value={row.custody_notes} onChange={(v) => onChange({ ...row, custody_notes: v })} disabled={disabled} />
      {!disabled && <Button type="button" variant="ghost" size="sm" className="text-destructive" onClick={onRemove}>Remove</Button>}
    </div>
  );
}

function EvidenceDigitalForm({ row, onChange, onRemove, disabled }: { row: EvidenceDigitalRow; onChange: (r: EvidenceDigitalRow) => void; onRemove: () => void; disabled?: boolean }) {
  return (
    <div className="mb-3 grid gap-2 rounded-lg border p-3 md:grid-cols-2">
      <TextField label="Evidence ID" value={row.evidence_id} onChange={(v) => onChange({ ...row, evidence_id: v })} disabled={disabled} />
      <TextField label="Description" value={row.description} onChange={(v) => onChange({ ...row, description: v })} disabled={disabled} />
      <TextField label="Source (CCTV, ACS, etc.)" value={row.source} onChange={(v) => onChange({ ...row, source: v })} disabled={disabled} />
      <TextField label="Preserved by" value={row.preserved_by} onChange={(v) => onChange({ ...row, preserved_by: v })} disabled={disabled} />
      <TextField label="Date/time" value={row.preserved_at} onChange={(v) => onChange({ ...row, preserved_at: v })} disabled={disabled} />
      <TextField label="Hash / unique ID" value={row.hash_or_id} onChange={(v) => onChange({ ...row, hash_or_id: v })} disabled={disabled} />
      {!disabled && <Button type="button" variant="ghost" size="sm" className="text-destructive" onClick={onRemove}>Remove</Button>}
    </div>
  );
}

function EvidenceTestimonialForm({ row, onChange, onRemove, disabled }: { row: EvidenceTestimonialRow; onChange: (r: EvidenceTestimonialRow) => void; onRemove: () => void; disabled?: boolean }) {
  return (
    <div className="mb-3 grid gap-2 rounded-lg border p-3 md:grid-cols-2">
      <TextField label="Witness ID" value={row.witness_id} onChange={(v) => onChange({ ...row, witness_id: v })} disabled={disabled} />
      <TextField label="Name" value={row.name} onChange={(v) => onChange({ ...row, name: v })} disabled={disabled} />
      <Field label="Role">
        <Select value={row.role || ""} onValueChange={(v) => onChange({ ...row, role: v })} disabled={disabled}>
          <SelectTrigger><SelectValue placeholder="Role" /></SelectTrigger>
          <SelectContent>
            {["Witness", "Victim", "Suspect", "Responder"].map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
          </SelectContent>
        </Select>
      </Field>
      <TextField label="Interview date" value={row.interview_date} onChange={(v) => onChange({ ...row, interview_date: v })} disabled={disabled} />
      <div className="md:col-span-2"><TextField label="Summary of statement" value={row.statement_summary} onChange={(v) => onChange({ ...row, statement_summary: v })} disabled={disabled} multiline /></div>
      <Field label="Recording available?">
        <Select value={row.recording_available || ""} onValueChange={(v) => onChange({ ...row, recording_available: v })} disabled={disabled}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="yes">Yes</SelectItem>
            <SelectItem value="no">No</SelectItem>
          </SelectContent>
        </Select>
      </Field>
      {!disabled && <Button type="button" variant="ghost" size="sm" className="text-destructive" onClick={onRemove}>Remove</Button>}
    </div>
  );
}

export function SectionD(props: SectionProps) {
  return <RepeatableEvidenceD {...props} />;
}

export function SectionE({ data, onChange, disabled }: SectionProps) {
  const docs = data.section_e?.documents || [];
  const update = (idx: number, patch: Partial<(typeof docs)[0]>) => {
    onChange({ ...data, section_e: { documents: docs.map((d, i) => (i === idx ? { ...d, ...patch } : d)) } });
  };
  return (
    <div className="space-y-2">
      {docs.map((doc, idx) => (
        <div key={doc.doc_type} className="grid gap-2 rounded-lg border p-3 md:grid-cols-4 items-end">
          <div className="text-sm font-medium md:col-span-1">{doc.label}</div>
          <Select value={doc.attached || ""} onValueChange={(v) => update(idx, { attached: v })} disabled={disabled}>
            <SelectTrigger><SelectValue placeholder="Attached?" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="yes">Yes</SelectItem>
              <SelectItem value="no">No</SelectItem>
            </SelectContent>
          </Select>
          <Input placeholder="Reference / link" value={doc.reference || ""} disabled={disabled} onChange={(e) => update(idx, { reference: e.target.value })} />
          <Input placeholder="Notes" value={doc.notes || ""} disabled={disabled} onChange={(e) => update(idx, { notes: e.target.value })} />
        </div>
      ))}
    </div>
  );
}

const INTERVIEW_CHECKLIST_KEYS = [
  "conducted_privately",
  "neutral_interviewer",
  "open_ended_questions",
  "no_leading_questions",
  "compared_with_evidence",
  "recording_with_consent",
];

export function SectionF({ data, onChange, disabled }: SectionProps) {
  const interviews = data.section_f?.interviews || [];
  const setList = (list: InterviewRow[]) => onChange({ ...data, section_f: { interviews: list } });
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">Standard questions: What did you see/hear? When? Who else was present? What happened before/after? Anything else we should know?</p>
      {interviews.map((row, idx) => (
        <div key={row.row_id} className="rounded-lg border p-4 space-y-3">
          <div className="grid gap-2 md:grid-cols-2">
            <TextField label="Person ID" value={row.person_id} onChange={(v) => { const n = [...interviews]; n[idx] = { ...row, person_id: v }; setList(n); }} disabled={disabled} />
            <TextField label="Name" value={row.name} onChange={(v) => { const n = [...interviews]; n[idx] = { ...row, name: v }; setList(n); }} disabled={disabled} />
            <Field label="Category">
              <Select value={row.category || ""} onValueChange={(v) => { const n = [...interviews]; n[idx] = { ...row, category: v }; setList(n); }} disabled={disabled}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["Witness", "Victim", "Suspect", "Responder"].map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>
            <TextField label="Date" value={row.date} onChange={(v) => { const n = [...interviews]; n[idx] = { ...row, date: v }; setList(n); }} disabled={disabled} />
            <TextField label="Location" value={row.location} onChange={(v) => { const n = [...interviews]; n[idx] = { ...row, location: v }; setList(n); }} disabled={disabled} />
            <TextField label="Interviewer" value={row.interviewer} onChange={(v) => { const n = [...interviews]; n[idx] = { ...row, interviewer: v }; setList(n); }} disabled={disabled} />
          </div>
          <TextField label="Notes / responses" value={row.questions_notes} onChange={(v) => { const n = [...interviews]; n[idx] = { ...row, questions_notes: v }; setList(n); }} disabled={disabled} multiline />
          <div className="grid gap-2 sm:grid-cols-2">
            {INTERVIEW_CHECKLIST_KEYS.map((key) => (
              <label key={key} className="flex items-center gap-2 text-sm">
                <Checkbox
                  checked={!!row.checklist?.[key]}
                  disabled={disabled}
                  onCheckedChange={(c) => {
                    const n = [...interviews];
                    n[idx] = { ...row, checklist: { ...row.checklist, [key]: c === true } };
                    setList(n);
                  }}
                />
                {key.replace(/_/g, " ")}
              </label>
            ))}
          </div>
          {!disabled && (
            <Button type="button" variant="ghost" size="sm" className="text-destructive" onClick={() => setList(interviews.filter((_, i) => i !== idx))}>
              Remove interview
            </Button>
          )}
        </div>
      ))}
      {!disabled && (
        <Button type="button" variant="outline" size="sm" onClick={() => setList([...interviews, { row_id: newId(), person_id: `P-${interviews.length + 1}`, checklist: {} }])}>
          Add interview
        </Button>
      )}
    </div>
  );
}

export function SectionG({ data, onChange, disabled }: SectionProps) {
  const rows = data.section_g?.analysis_rows || [];
  const update = (idx: number, findings: string) => {
    onChange({
      ...data,
      section_g: { analysis_rows: rows.map((r, i) => (i === idx ? { ...r, findings } : r)) },
    });
  };
  return (
    <div className="space-y-3">
      {rows.map((row, idx) => (
        <div key={row.activity_id}>
          <Label className="text-xs text-muted-foreground">{row.activity}</Label>
          <Textarea value={row.findings || ""} disabled={disabled} onChange={(e) => update(idx, e.target.value)} rows={2} className="mt-1" />
        </div>
      ))}
    </div>
  );
}

export function SectionH({ data, onChange, disabled }: SectionProps) {
  const h = data.section_h || {};
  const set = (k: string, v: string) => onChange({ ...data, section_h: { ...h, [k]: v } });
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="md:col-span-2"><TextField label="What actually occurred? *" value={h.what_occurred} onChange={(v) => set("what_occurred", v)} disabled={disabled} multiline /></div>
      <TextField label="Who was responsible? (if known)" value={h.who_responsible} onChange={(v) => set("who_responsible", v)} disabled={disabled} />
      <TextField label="Which procedures failed?" value={h.procedures_failed} onChange={(v) => set("procedures_failed", v)} disabled={disabled} multiline />
      <Field label="Policies violated? *">
        <Select value={h.policies_violated || ""} onValueChange={(v) => set("policies_violated", v)} disabled={disabled}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="yes">Yes</SelectItem>
            <SelectItem value="no">No</SelectItem>
          </SelectContent>
        </Select>
      </Field>
      {h.policies_violated === "yes" && (
        <TextField label="Specify policies" value={h.policies_violated_detail} onChange={(v) => set("policies_violated_detail", v)} disabled={disabled} />
      )}
      <TextField label="Contributing factors" value={h.contributing_factors} onChange={(v) => set("contributing_factors", v)} disabled={disabled} multiline />
      <TextField label="Root cause(s) *" value={h.root_causes} onChange={(v) => set("root_causes", v)} disabled={disabled} multiline />
    </div>
  );
}

export function SectionI({ data, onChange, disabled }: SectionProps) {
  const measures = data.section_i?.measures || [];
  const setList = (list: MeasureRow[]) => onChange({ ...data, section_i: { measures: list } });
  return (
    <div className="space-y-3">
      {measures.map((m, idx) => (
        <div key={m.row_id} className="grid gap-2 rounded-lg border p-3 md:grid-cols-2 lg:grid-cols-3">
          <div className="text-sm font-medium capitalize">{m.measure_type.replace(/_/g, " ")}</div>
          <TextField label="Action required" value={m.action_required} onChange={(v) => { const n = [...measures]; n[idx] = { ...m, action_required: v }; setList(n); }} disabled={disabled} />
          <TextField label="Responsible" value={m.responsible_person} onChange={(v) => { const n = [...measures]; n[idx] = { ...m, responsible_person: v }; setList(n); }} disabled={disabled} />
          <TextField label="Deadline" value={m.deadline} onChange={(v) => { const n = [...measures]; n[idx] = { ...m, deadline: v }; setList(n); }} disabled={disabled} />
          <Field label="Status">
            <Select value={m.status || "open"} onValueChange={(v) => { const n = [...measures]; n[idx] = { ...m, status: v }; setList(n); }} disabled={disabled}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
          </Field>
        </div>
      ))}
    </div>
  );
}

export function SectionJ({ data, onChange, disabled }: SectionProps) {
  const j = data.section_j || {};
  const set = (k: string, v: string) => onChange({ ...data, section_j: { ...j, [k]: v } });
  return (
    <div className="grid gap-4">
      <TextField label="Executive summary *" value={j.executive_summary} onChange={(v) => set("executive_summary", v)} disabled={disabled} multiline />
      <TextField label="Incident background" value={j.incident_background} onChange={(v) => set("incident_background", v)} disabled={disabled} multiline />
      <TextField label="Evidence collected" value={j.evidence_summary} onChange={(v) => set("evidence_summary", v)} disabled={disabled} multiline />
      <TextField label="Findings" value={j.findings_summary} onChange={(v) => set("findings_summary", v)} disabled={disabled} multiline />
      <TextField label="Recommendations" value={j.recommendations_summary} onChange={(v) => set("recommendations_summary", v)} disabled={disabled} multiline />
      <TextField label="Attachments note" value={j.attachments_note} onChange={(v) => set("attachments_note", v)} disabled={disabled} multiline />
      <div className="grid gap-4 md:grid-cols-2">
        <TextField label="Report author *" value={j.report_author} onChange={(v) => set("report_author", v)} disabled={disabled} />
        <TextField label="Report date *" value={j.report_date} onChange={(v) => set("report_date", v)} disabled={disabled} />
        <TextField label="Distribution list (confidential)" value={j.distribution_list} onChange={(v) => set("distribution_list", v)} disabled={disabled} multiline />
        <Field label="Legal / HR review completed">
          <Select value={j.legal_hr_review_completed || ""} onValueChange={(v) => set("legal_hr_review_completed", v)} disabled={disabled}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="yes">Yes</SelectItem>
              <SelectItem value="no">No</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        <TextField label="Legal / HR review date" value={j.legal_hr_review_date} onChange={(v) => set("legal_hr_review_date", v)} disabled={disabled} />
      </div>
    </div>
  );
}

export function SectionK({ data, onChange, disabled }: SectionProps) {
  const k = data.section_k || { sign_offs: [] };
  const signOffs = k.sign_offs || [];
  const setSign = (idx: number, patch: Partial<(typeof signOffs)[0]>) => {
    onChange({
      ...data,
      section_k: { ...k, sign_offs: signOffs.map((s, i) => (i === idx ? { ...s, ...patch } : s)) },
    });
  };
  return (
    <div className="space-y-6">
      {signOffs.map((s, idx) => (
        <div key={s.role} className="rounded-lg border p-4">
          <h4 className="mb-3 font-medium">{s.role}</h4>
          <div className="grid gap-4 md:grid-cols-2">
            <TextField label="Name" value={s.name} onChange={(v) => setSign(idx, { name: v })} disabled={disabled} />
            <TextField label="Date" value={s.date} onChange={(v) => setSign(idx, { date: v })} disabled={disabled} />
            <div className="md:col-span-2">
              <SignaturePad
                value={(s.signature || {}) as SignatureValue}
                disabled={disabled}
                signerLabel={`${s.role} signature`}
                onChange={(sig) => setSign(idx, { signature: sig })}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function PrinciplesPanel({ data, onChange, disabled }: SectionProps) {
  const mistakes = data.mistakes_checklist || {};
  return (
    <div className="space-y-4 rounded-lg border bg-muted/30 p-4 text-sm">
      <h4 className="font-semibold">Key principles</h4>
      <ul className="list-disc pl-5 text-muted-foreground space-y-1">
        <li>Confidentiality — share only on a need-to-know basis</li>
        <li>Integrity — do not alter or fabricate evidence</li>
        <li>Objectivity — follow facts, not bias</li>
        <li>Accuracy — verify every detail</li>
        <li>Legal compliance — data protection, employment, criminal procedure</li>
        <li>Evidence preservation — secure all evidence immediately</li>
      </ul>
      <label className="flex items-center gap-2 font-medium">
        <Checkbox
          checked={!!data.principles_acknowledged}
          disabled={disabled}
          onCheckedChange={(c) => onChange({ ...data, principles_acknowledged: c === true })}
        />
        I acknowledge these investigation principles *
      </label>
      <h4 className="font-semibold pt-2">Common mistakes to avoid</h4>
      <div className="grid gap-2 sm:grid-cols-2">
        {Object.keys(mistakes).map((key) => (
          <label key={key} className="flex items-center gap-2">
            <Checkbox
              checked={!!mistakes[key]}
              disabled={disabled}
              onCheckedChange={(c) =>
                onChange({ ...data, mistakes_checklist: { ...mistakes, [key]: c === true } })
              }
            />
            {key.replace(/_/g, " ")}
          </label>
        ))}
      </div>
    </div>
  );
}

export function renderSection(key: string, props: SectionProps) {
  switch (key) {
    case "section_a": return <SectionA {...props} />;
    case "section_b": return <SectionB {...props} />;
    case "section_c": return <SectionC {...props} />;
    case "section_d": return <SectionD {...props} />;
    case "section_e": return <SectionE {...props} />;
    case "section_f": return <SectionF {...props} />;
    case "section_g": return <SectionG {...props} />;
    case "section_h": return <SectionH {...props} />;
    case "section_i": return <SectionI {...props} />;
    case "section_j": return <SectionJ {...props} />;
    case "section_k": return <SectionK {...props} />;
    default: return null;
  }
}
