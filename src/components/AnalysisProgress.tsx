import { motion } from "framer-motion";

interface AnalysisProgressProps {
  progress: number;
  currentLayer: string;
  layers: { name: string; status: "pending" | "running" | "done" | "warning" | "error" }[];
}

const AnalysisProgress = ({ progress, currentLayer, layers }: AnalysisProgressProps) => {
  const statusColors: Record<string, string> = {
    pending: "bg-muted-foreground/30",
    running: "bg-primary animate-pulse-glow",
    done: "bg-success",
    warning: "bg-warning",
    error: "bg-destructive",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-2xl mx-auto forensic-panel p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-foreground font-semibold font-mono text-sm tracking-wider uppercase">
          Multi-Layer Analysis
        </h3>
        <span className="text-primary font-mono text-sm">{progress}%</span>
      </div>

      {/* Progress bar */}
      <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden mb-6">
        <motion.div
          className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          style={{ boxShadow: "var(--glow-primary)" }}
        />
      </div>

      {/* Layer indicators */}
      <div className="space-y-3">
        {layers.map((layer, i) => (
          <motion.div
            key={layer.name}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="flex items-center gap-3"
          >
            <div className={`w-2.5 h-2.5 rounded-full ${statusColors[layer.status]}`} />
            <span className={`font-mono text-sm ${
              layer.status === "running" ? "text-primary" : 
              layer.status === "done" ? "text-foreground" : 
              layer.status === "warning" ? "text-warning" :
              layer.status === "error" ? "text-destructive" :
              "text-muted-foreground"
            }`}>
              {layer.name}
            </span>
            {layer.status === "running" && (
              <span className="text-primary/60 font-mono text-xs">processing...</span>
            )}
          </motion.div>
        ))}
      </div>

      <p className="text-muted-foreground text-xs font-mono mt-4 text-center">
        Scanning: {currentLayer}
      </p>
    </motion.div>
  );
};

export default AnalysisProgress;
