import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import type { SignatureValue } from "@/lib/incidentInvestigationTypes";

type Props = {
  value?: SignatureValue;
  onChange: (v: SignatureValue) => void;
  signerLabel?: string;
  disabled?: boolean;
};

export default function SignaturePad({ value, onChange, signerLabel = "Signer name", disabled }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    if (value?.data_url) {
      const img = new Image();
      img.onload = () => ctx.drawImage(img, 0, 0);
      img.src = value.data_url;
    }
  }, [value?.data_url]);

  const pos = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    if ("touches" in e) {
      const t = e.touches[0];
      return { x: (t.clientX - rect.left) * scaleX, y: (t.clientY - rect.top) * scaleY };
    }
    return { x: (e.clientX - rect.left) * scaleX, y: (e.clientY - rect.top) * scaleY };
  };

  const start = (e: React.MouseEvent | React.TouchEvent) => {
    if (disabled) return;
    drawing.current = true;
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const p = pos(e);
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
  };

  const move = (e: React.MouseEvent | React.TouchEvent) => {
    if (!drawing.current || disabled) return;
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const p = pos(e);
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#111";
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
  };

  const end = () => {
    if (!drawing.current) return;
    drawing.current = false;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const data_url = canvas.toDataURL("image/png");
    onChange({
      ...value,
      data_url,
      signed_at: new Date().toISOString(),
    });
  };

  const clear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    onChange({ signer_name: value?.signer_name || "", signed_at: "", data_url: "" });
  };

  return (
    <div className="space-y-2">
      <label className="text-xs font-medium text-muted-foreground">{signerLabel}</label>
      <input
        className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
        value={value?.signer_name || ""}
        disabled={disabled}
        onChange={(e) =>
          onChange({ ...value, signer_name: e.target.value, data_url: value?.data_url, signed_at: value?.signed_at })
        }
        placeholder="Full name"
      />
      <div className="rounded-md border bg-white">
        <canvas
          ref={canvasRef}
          width={400}
          height={120}
          className="h-28 w-full touch-none cursor-crosshair"
          onMouseDown={start}
          onMouseMove={move}
          onMouseUp={end}
          onMouseLeave={end}
          onTouchStart={start}
          onTouchMove={move}
          onTouchEnd={end}
        />
      </div>
      {!disabled && (
        <Button type="button" variant="outline" size="sm" onClick={clear}>
          Clear signature
        </Button>
      )}
    </div>
  );
}
