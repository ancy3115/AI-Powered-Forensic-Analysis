import { AnalysisResult, Finding } from "@/components/AnalysisDashboard";
import { supabase } from "@/integrations/supabase/client";

const LAYER_DELAY = 400;

export function simulateAnalysis(
  file: File,
  onProgress: (progress: number, layer: string, layers: { name: string; status: "pending" | "running" | "done" | "warning" | "error" }[]) => void,
  onComplete: (result: AnalysisResult) => void,
  onError: (error: string) => void
) {
  const layerNames = ["Metadata", "Signature", "Structure", "Content", "Visual"];
  const layers = layerNames.map((name) => ({ name, status: "pending" as const }));
  let cancelled = false;

  // Step 1: Animate layers while AI processes in background
  let step = 0;
  const interval = setInterval(() => {
    if (cancelled) { clearInterval(interval); return; }
    if (step < layerNames.length) {
      const updated = layers.map((l, i) => {
        if (i < step) return { ...l, status: "done" as const };
        if (i === step) return { ...l, status: "running" as const };
        return { ...l, status: "pending" as const };
      });
      onProgress(Math.round(((step + 0.5) / layerNames.length) * 80), layerNames[step], updated);
      step++;
    }
  }, LAYER_DELAY);

  // Step 2: Read file content and call AI
  const analyze = async () => {
    const startTime = Date.now();

    // Read text content from file
    let fileContent = "";
    try {
      if (file.type.startsWith("text/") || file.name.endsWith(".txt") || file.name.endsWith(".md") || file.name.endsWith(".csv")) {
        fileContent = await file.text();
      } else if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
        // For PDFs, read as base64 (first 50KB)
        const slice = file.slice(0, 50000);
        const buffer = await slice.arrayBuffer();
        const bytes = new Uint8Array(buffer);
        let binary = "";
        bytes.forEach(b => binary += String.fromCharCode(b));
        fileContent = `[PDF binary data, first ${bytes.length} bytes - base64 encoded]: ${btoa(binary).substring(0, 2000)}`;
      } else if (file.type.startsWith("image/")) {
        fileContent = `[Image file: ${file.type}, ${file.size} bytes]`;
      } else {
        const text = await file.text();
        fileContent = text.substring(0, 5000);
      }
    } catch {
      fileContent = `[Could not read file content: ${file.type}]`;
    }

    // Truncate content
    if (fileContent.length > 5000) {
      fileContent = fileContent.substring(0, 5000) + "... [truncated]";
    }

    try {
      const { data, error } = await supabase.functions.invoke("analyze-document", {
        body: {
          fileName: file.name,
          fileSize: `${(file.size / 1024).toFixed(1)} KB`,
          fileContent,
        },
      });

      if (cancelled) return;
      clearInterval(interval);

      if (error) {
        console.error("Analysis error:", error);
        onError(error.message || "Analysis failed. Please try again.");
        return;
      }

      if (data?.error) {
        onError(data.error);
        return;
      }

      const duration = ((Date.now() - startTime) / 1000).toFixed(1) + "s";

      // Update layer statuses based on findings
      const finalLayers = layerNames.map((name) => {
        const layerFindings = (data.findings || []).filter((f: Finding) => f.layer === name);
        const hasCritical = layerFindings.some((f: Finding) => f.severity === "critical");
        const hasWarning = layerFindings.some((f: Finding) => f.severity === "warning");
        if (hasCritical) return { name, status: "error" as const };
        if (hasWarning) return { name, status: "warning" as const };
        return { name, status: "done" as const };
      });

      onProgress(100, "Complete", finalLayers);

      setTimeout(() => {
        onComplete({
          verdict: data.verdict,
          overallConfidence: data.overallConfidence,
          findings: data.findings,
          metadata: {
            fileName: file.name,
            fileSize: `${(file.size / 1024).toFixed(1)} KB`,
            analyzedAt: new Date().toLocaleTimeString(),
            duration,
          },
        });
      }, 400);
    } catch (err) {
      if (cancelled) return;
      clearInterval(interval);
      console.error("Network error:", err);
      onError("Failed to connect to analysis service. Please try again.");
    }
  };

  analyze();

  return () => {
    cancelled = true;
    clearInterval(interval);
  };
}
