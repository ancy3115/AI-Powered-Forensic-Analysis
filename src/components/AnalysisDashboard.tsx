import { motion } from "framer-motion";
import { Shield, ShieldAlert, ShieldCheck, AlertTriangle, Info, FileWarning, Eye, Clock, Type, Fingerprint } from "lucide-react";

export type Finding = {
  id: string;
  layer: string;
  severity: "critical" | "warning" | "info" | "pass";
  title: string;
  description: string;
  confidence: number;
  evidence?: string;
};

export type AnalysisResult = {
  verdict: "forged" | "suspicious" | "genuine";
  overallConfidence: number;
  findings: Finding[];
  metadata: {
    fileName: string;
    fileSize: string;
    analyzedAt: string;
    duration: string;
  };
};

const severityConfig = {
  critical: { icon: ShieldAlert, color: "text-destructive", bg: "bg-destructive/10", border: "border-destructive/30", glow: "border-glow-destructive" },
  warning: { icon: AlertTriangle, color: "text-warning", bg: "bg-warning/10", border: "border-warning/30", glow: "border-glow-warning" },
  info: { icon: Info, color: "text-primary", bg: "bg-primary/10", border: "border-primary/30", glow: "" },
  pass: { icon: ShieldCheck, color: "text-success", bg: "bg-success/10", border: "border-success/30", glow: "border-glow-success" },
};

const layerIcons: Record<string, typeof Eye> = {
  "Metadata": Clock,
  "Signature": Fingerprint,
  "Structure": FileWarning,
  "Content": Type,
  "Visual": Eye,
};

const verdictConfig = {
  forged: { icon: ShieldAlert, label: "FORGED", color: "text-destructive", bg: "bg-destructive/10", border: "border-destructive/40", glow: "border-glow-destructive" },
  suspicious: { icon: AlertTriangle, label: "SUSPICIOUS", color: "text-warning", bg: "bg-warning/10", border: "border-warning/40", glow: "border-glow-warning" },
  genuine: { icon: ShieldCheck, label: "GENUINE", color: "text-success", bg: "bg-success/10", border: "border-success/40", glow: "border-glow-success" },
};

interface AnalysisDashboardProps {
  result: AnalysisResult;
}

const AnalysisDashboard = ({ result }: AnalysisDashboardProps) => {
  const verdict = verdictConfig[result.verdict];
  const VerdictIcon = verdict.icon;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-5xl mx-auto space-y-6"
    >
      {/* Verdict Banner */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className={`forensic-panel p-6 border ${verdict.border} ${verdict.glow} relative overflow-hidden`}
      >
        <div className="absolute inset-0 scanline pointer-events-none" />
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-xl ${verdict.bg} flex items-center justify-center`}>
              <VerdictIcon className={`w-7 h-7 ${verdict.color}`} />
            </div>
            <div>
              <p className="text-muted-foreground text-xs font-mono uppercase tracking-widest">Document Verdict</p>
              <h2 className={`text-2xl font-bold font-mono tracking-wider ${verdict.color}`}>{verdict.label}</h2>
            </div>
          </div>
          <div className="text-right">
            <p className="text-muted-foreground text-xs font-mono uppercase">Confidence</p>
            <p className={`text-3xl font-bold font-mono ${verdict.color}`}>{result.overallConfidence}%</p>
          </div>
        </div>
      </motion.div>

      {/* Metadata Row */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-3"
      >
        {[
          { label: "File", value: result.metadata.fileName },
          { label: "Size", value: result.metadata.fileSize },
          { label: "Analyzed", value: result.metadata.analyzedAt },
          { label: "Duration", value: result.metadata.duration },
        ].map((item) => (
          <div key={item.label} className="forensic-panel p-3">
            <p className="text-muted-foreground text-xs font-mono uppercase tracking-wider">{item.label}</p>
            <p className="text-foreground text-sm font-mono mt-1 truncate">{item.value}</p>
          </div>
        ))}
      </motion.div>

      {/* Explainable AI Findings */}
      <div>
        <h3 className="text-foreground font-semibold font-mono text-sm tracking-wider uppercase mb-4 flex items-center gap-2">
          <Shield className="w-4 h-4 text-primary" />
          Explainable AI Findings
        </h3>
        <div className="space-y-3">
          {result.findings.map((finding, i) => {
            const sev = severityConfig[finding.severity];
            const SevIcon = sev.icon;
            const LayerIcon = layerIcons[finding.layer] || Eye;
            return (
              <motion.div
                key={finding.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.08 }}
                className={`forensic-panel p-4 border ${sev.border}`}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-lg ${sev.bg} flex items-center justify-center shrink-0 mt-0.5`}>
                    <SevIcon className={`w-5 h-5 ${sev.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <LayerIcon className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="text-muted-foreground text-xs font-mono uppercase">{finding.layer} Analysis</span>
                      <span className={`ml-auto text-xs font-mono ${sev.color}`}>{finding.confidence}% conf.</span>
                    </div>
                    <h4 className="text-foreground font-medium text-sm">{finding.title}</h4>
                    <p className="text-muted-foreground text-sm mt-1">{finding.description}</p>
                    {finding.evidence && (
                      <div className="mt-2 p-2 bg-secondary/50 rounded border border-border">
                        <p className="text-xs font-mono text-muted-foreground">
                          <span className="text-primary">Evidence:</span> {finding.evidence}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Forensic Timeline */}
      <div>
        <h3 className="text-foreground font-semibold font-mono text-sm tracking-wider uppercase mb-4 flex items-center gap-2">
          <Clock className="w-4 h-4 text-primary" />
          Forensic Timeline Reconstruction
        </h3>
        <div className="forensic-panel p-5 relative overflow-hidden">
          <div className="absolute inset-0 scanline pointer-events-none" />
          <div className="relative z-10 space-y-0">
            {[
              { time: "T+0.00s", event: "Document received — hash fingerprint generated", status: "info" as const },
              { time: "T+0.12s", event: "Metadata extraction — EXIF/XMP fields parsed", status: "info" as const },
              { time: "T+0.45s", event: "Signature analysis — handwriting pattern comparison", status: result.verdict === "genuine" ? "pass" as const : "warning" as const },
              { time: "T+1.20s", event: "Structural integrity — layout and formatting verified", status: "info" as const },
              { time: "T+2.10s", event: "Content analysis — NLP consistency check", status: result.verdict === "forged" ? "critical" as const : "pass" as const },
              { time: "T+3.40s", event: `Verdict computed — ${verdictConfig[result.verdict].label}`, status: result.verdict === "genuine" ? "pass" as const : result.verdict === "forged" ? "critical" as const : "warning" as const },
            ].map((entry, i) => {
              const dotColor = entry.status === "critical" ? "bg-destructive" : entry.status === "warning" ? "bg-warning" : entry.status === "pass" ? "bg-success" : "bg-primary";
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 + i * 0.1 }}
                  className="flex items-center gap-4 py-2"
                >
                  <span className="text-muted-foreground font-mono text-xs w-16 shrink-0">{entry.time}</span>
                  <div className="flex flex-col items-center w-3">
                    <div className={`w-2.5 h-2.5 rounded-full ${dotColor}`} />
                    {i < 5 && <div className="w-px h-6 bg-border" />}
                  </div>
                  <span className="text-foreground text-sm font-mono">{entry.event}</span>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default AnalysisDashboard;
