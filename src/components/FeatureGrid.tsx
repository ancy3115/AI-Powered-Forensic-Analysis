import { motion } from "framer-motion";
import { Shield, Layers, Brain, Search, Fingerprint, FileSearch } from "lucide-react";

const features = [
  {
    icon: Layers,
    title: "Multi-Layer Analysis",
    description: "Metadata, signatures, structure, content, and visual inspection in one scan.",
  },
  {
    icon: Brain,
    title: "Explainable AI",
    description: "See exactly why a document is flagged — evidence, not just a label.",
  },
  {
    icon: Search,
    title: "Forensic Timeline",
    description: "Reconstruct the document's history to detect temporal anomalies.",
  },
  {
    icon: Fingerprint,
    title: "Signature Biometrics",
    description: "Velocity, pressure, and stroke analysis for handwriting verification.",
  },
];

const FeatureGrid = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl mx-auto">
    {features.map((feature, i) => (
      <motion.div
        key={feature.title}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 + i * 0.1 }}
        className="forensic-panel p-5 group hover:border-primary/30 transition-colors"
      >
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
            <feature.icon className="w-4.5 h-4.5 text-primary" />
          </div>
          <div>
            <h3 className="text-foreground font-medium text-sm">{feature.title}</h3>
            <p className="text-muted-foreground text-xs mt-1 leading-relaxed">{feature.description}</p>
          </div>
        </div>
      </motion.div>
    ))}
  </div>
);

export default FeatureGrid;
