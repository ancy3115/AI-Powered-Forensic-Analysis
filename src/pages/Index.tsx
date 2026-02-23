import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, RotateCcw } from "lucide-react";
import UploadZone from "@/components/UploadZone";
import AnalysisProgress from "@/components/AnalysisProgress";
import AnalysisDashboard, { AnalysisResult } from "@/components/AnalysisDashboard";
import FeatureGrid from "@/components/FeatureGrid";
import { simulateAnalysis } from "@/lib/mockAnalysis";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type AppState = "idle" | "analyzing" | "results";

const Index = () => {
  const [state, setState] = useState<AppState>("idle");
  const [progress, setProgress] = useState(0);
  const [currentLayer, setCurrentLayer] = useState("");
  const [layers, setLayers] = useState<{ name: string; status: "pending" | "running" | "done" | "warning" | "error" }[]>([]);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const cancelRef = useRef<(() => void) | null>(null);

  const handleFileSelect = (file: File) => {
    setState("analyzing");
    setResult(null);

    cancelRef.current = simulateAnalysis(
      file,
      (prog, layer, updatedLayers) => {
        setProgress(prog);
        setCurrentLayer(layer);
        setLayers(updatedLayers);
      },
      (analysisResult) => {
        setResult(analysisResult);
        setState("results");
      },
      (error) => {
        toast.error(error);
        setState("idle");
      }
    );
  };

  const handleReset = () => {
    cancelRef.current?.();
    setState("idle");
    setProgress(0);
    setCurrentLayer("");
    setLayers([]);
    setResult(null);
  };

  return (
    <div className="min-h-screen bg-background grid-bg relative">
      {/* Subtle gradient overlay */}
      <div className="fixed inset-0 bg-gradient-to-b from-primary/[0.02] via-transparent to-background pointer-events-none" />

      <div className="relative z-10">
        {/* Header */}
        <header className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-20">
          <div className="container mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className="text-foreground font-bold text-lg tracking-tight">ForgeGuard</h1>
                <p className="text-muted-foreground text-xs font-mono">AI Document Forensics</p>
              </div>
            </div>
            {state !== "idle" && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
                className="font-mono text-xs"
              >
                <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                New Scan
              </Button>
            )}
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-6 py-12">
          <AnimatePresence mode="wait">
            {state === "idle" && (
              <motion.div
                key="idle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-10"
              >
                {/* Hero */}
                <div className="text-center space-y-4 max-w-2xl mx-auto">
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-mono"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse-glow" />
                    AI-Powered Forensic Analysis
                  </motion.div>
                  <motion.h2
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-4xl md:text-5xl font-bold tracking-tight"
                  >
                    <span className="text-foreground">Detect Document </span>
                    <span className="text-gradient-primary">Forgery</span>
                  </motion.h2>
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-muted-foreground text-lg max-w-xl mx-auto"
                  >
                    Multi-layer AI analysis with explainable results. Metadata, signatures, structure, and content — all verified.
                  </motion.p>
                </div>

                <UploadZone onFileSelect={handleFileSelect} isAnalyzing={false} />
                <FeatureGrid />
              </motion.div>
            )}

            {state === "analyzing" && (
              <motion.div
                key="analyzing"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex flex-col items-center justify-center min-h-[50vh]"
              >
                <AnalysisProgress progress={progress} currentLayer={currentLayer} layers={layers} />
              </motion.div>
            )}

            {state === "results" && result && (
              <motion.div
                key="results"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <AnalysisDashboard result={result} />
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        {/* Footer */}
        <footer className="border-t border-border/50 mt-20">
          <div className="container mx-auto px-6 py-6 text-center">
            <p className="text-muted-foreground text-xs font-mono">
              ForgeGuard — AI Document Forgery Detection System
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Index;
