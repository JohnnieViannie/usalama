import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import SignaturePad from "@/components/incident-investigation/SignaturePad";
import { recordCustodyTransfer } from "@/lib/incidentInvestigationApi";
import type { SignatureValue } from "@/lib/incidentInvestigationTypes";
import { toast } from "sonner";

type Props = {
  investigationId: number;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onRecorded: () => void;
  defaultEvidenceId?: string;
};

export default function CustodyDialog({
  investigationId,
  open,
  onOpenChange,
  onRecorded,
  defaultEvidenceId = "",
}: Props) {
  const [evidenceId, setEvidenceId] = useState(defaultEvidenceId);
  const [fromName, setFromName] = useState("");
  const [toName, setToName] = useState("");
  const [notes, setNotes] = useState("");
  const [signature, setSignature] = useState<SignatureValue>({});
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!evidenceId.trim() || !fromName.trim() || !toName.trim()) {
      toast.error("Evidence ID, from, and to are required");
      return;
    }
    if (!signature.data_url) {
      toast.error("Digital signature is required for chain of custody");
      return;
    }
    setBusy(true);
    try {
      await recordCustodyTransfer(investigationId, {
        evidenceId: evidenceId.trim(),
        fromName: fromName.trim(),
        toName: toName.trim(),
        notes: notes.trim(),
        signatureData: signature.data_url,
        transferredAt: new Date().toISOString(),
      });
      toast.success("Custody transfer recorded");
      onRecorded();
      onOpenChange(false);
      setFromName("");
      setToName("");
      setNotes("");
      setSignature({});
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to record custody");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Chain of custody transfer</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label>Evidence ID</Label>
            <Input value={evidenceId} onChange={(e) => setEvidenceId(e.target.value)} />
          </div>
          <div>
            <Label>From</Label>
            <Input value={fromName} onChange={(e) => setFromName(e.target.value)} />
          </div>
          <div>
            <Label>To</Label>
            <Input value={toName} onChange={(e) => setToName(e.target.value)} />
          </div>
          <div>
            <Label>Notes</Label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
          </div>
          <SignaturePad value={signature} onChange={setSignature} signerLabel="Transfer signature *" />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={submit} disabled={busy}>Record transfer</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
