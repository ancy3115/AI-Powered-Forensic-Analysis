import { AnalysisResult, Finding } from "@/components/AnalysisDashboard";

const MOCK_DELAY = 400;

const forgedFindings: Finding[] = [
  {
    id: "f1",
    layer: "Metadata",
    severity: "critical",
    title: "Creation date inconsistency detected",
    description: "The document's creation timestamp (2019-03-15) conflicts with the last-modified date (2018-11-02). Documents cannot be modified before they are created.",
    confidence: 97,
    evidence: "Created: 2019-03-15T09:23:11Z | Modified: 2018-11-02T14:05:33Z — temporal anomaly Δ = -133 days",
  },
  {
    id: "f2",
    layer: "Signature",
    severity: "warning",
    title: "Signature pattern deviation from reference",
    description: "The handwriting velocity profile shows abrupt changes inconsistent with natural signing motion. Pen pressure varies unnaturally at stroke transitions.",
    confidence: 84,
    evidence: "Velocity std-dev: 4.2 (expected < 2.0) | Pressure delta at stroke joins: 0.73 (threshold: 0.4)",
  },
  {
    id: "f3",
    layer: "Structure",
    severity: "critical",
    title: "Hidden layers with edited content found",
    description: "The PDF contains concealed layers with different text content underneath visible elements, indicating post-creation manipulation.",
    confidence: 95,
    evidence: "Layer count: 3 (expected: 1) | Hidden text: 'Original Amount: $5,000' vs visible: '$50,000'",
  },
  {
    id: "f4",
    layer: "Content",
    severity: "warning",
    title: "Language style inconsistency across sections",
    description: "NLP analysis reveals different writing styles between paragraphs, suggesting content was copied from multiple sources or altered by a different author.",
    confidence: 78,
    evidence: "Stylometric score sections 1-3: 0.92 coherence | Sections 4-5: 0.41 coherence — behavioral drift detected",
  },
  {
    id: "f5",
    layer: "Visual",
    severity: "info",
    title: "Font rendering artifacts detected",
    description: "Subtle pixel-level differences in character rendering suggest text was added at a different time or with different software than the original document.",
    confidence: 72,
    evidence: "Anti-aliasing pattern mismatch in 12 character instances across 3 paragraphs",
  },
];

const genuineFindings: Finding[] = [
  {
    id: "g1",
    layer: "Metadata",
    severity: "pass",
    title: "Metadata timeline is consistent",
    description: "All timestamps (creation, modification, access) follow a logical chronological order with no anomalies detected.",
    confidence: 98,
  },
  {
    id: "g2",
    layer: "Signature",
    severity: "pass",
    title: "Signature matches reference profile",
    description: "Handwriting velocity, pressure, and stroke patterns are within expected parameters for natural signing behavior.",
    confidence: 94,
    evidence: "Velocity std-dev: 1.3 (threshold < 2.0) | Pressure consistency: 0.91",
  },
  {
    id: "g3",
    layer: "Structure",
    severity: "pass",
    title: "Document structure is intact",
    description: "Single-layer document with no hidden content, embedded objects, or structural manipulation detected.",
    confidence: 99,
  },
  {
    id: "g4",
    layer: "Content",
    severity: "pass",
    title: "Consistent language and style throughout",
    description: "NLP analysis shows uniform writing style, vocabulary, and tone across all sections of the document.",
    confidence: 96,
  },
  {
    id: "g5",
    layer: "Visual",
    severity: "info",
    title: "Minor compression artifacts (expected)",
    description: "Standard JPEG compression artifacts detected — consistent with normal scanning/saving processes, not indicative of tampering.",
    confidence: 88,
  },
];

function randomize(base: number, range: number): number {
  return Math.min(99, Math.max(50, base + Math.floor(Math.random() * range * 2 - range)));
}

function randomizeFindings(findings: Finding[]): Finding[] {
  const count = Math.max(3, Math.floor(Math.random() * findings.length) + 2);
  const shuffled = [...findings].sort(() => Math.random() - 0.5).slice(0, count);
  return shuffled.map(f => ({
    ...f,
    confidence: randomize(f.confidence, 10),
  }));
}

export function simulateAnalysis(
  fileName: string,
  fileSize: number,
  onProgress: (progress: number, layer: string, layers: { name: string; status: "pending" | "running" | "done" | "warning" | "error" }[]) => void,
  onComplete: (result: AnalysisResult) => void
) {
  const isForged = Math.random() > 0.4;
  const layerNames = ["Metadata", "Signature", "Structure", "Content", "Visual"];
  const layers = layerNames.map((name) => ({ name, status: "pending" as const }));

  let step = 0;
  const totalSteps = layerNames.length;

  const interval = setInterval(() => {
    if (step < totalSteps) {
      const updated = layers.map((l, i) => {
        if (i < step) return { ...l, status: "done" as const };
        if (i === step) return { ...l, status: "running" as const };
        return { ...l, status: "pending" as const };
      });
      const progress = Math.round(((step + 0.5) / totalSteps) * 100);
      onProgress(progress, layerNames[step], updated);
      step++;
    } else {
      clearInterval(interval);

      const finalLayers = layers.map((l) => {
        if (isForged && (l.name === "Metadata" || l.name === "Structure")) {
          return { ...l, status: "error" as const };
        }
        if (isForged && l.name === "Signature") {
          return { ...l, status: "warning" as const };
        }
        return { ...l, status: "done" as const };
      });
      onProgress(100, "Complete", finalLayers);

      const randomizedFindings = randomizeFindings(isForged ? forgedFindings : genuineFindings);
      const overallConfidence = isForged ? randomize(89, 7) : randomize(94, 5);
      const duration = (2.5 + Math.random() * 3).toFixed(1) + "s";

      setTimeout(() => {
        onComplete({
          verdict: isForged ? "forged" : "genuine",
          overallConfidence,
          findings: randomizedFindings,
          metadata: {
            fileName,
            fileSize: `${(fileSize / 1024).toFixed(1)} KB`,
            analyzedAt: new Date().toLocaleTimeString(),
            duration,
          },
        });
      }, 600);
    }
  }, MOCK_DELAY);

  return () => clearInterval(interval);
}
