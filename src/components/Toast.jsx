import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Toast({ message }) {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => {
      const event = new CustomEvent("clear-toast");
      window.dispatchEvent(event);
    }, 2200);
    return () => clearTimeout(timer);
  }, [message]);

  return (
    <AnimatePresence>
      {message && (
        <motion.div
          className="toast"
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
        >
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  );
}