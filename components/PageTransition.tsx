"use client";
import { usePathname } from "next/navigation";
import { motion} from "framer-motion";

export default function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <div className="w-full h-full overflow-hidden">
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="h-full w-full overflow-auto"
      >
        {children}
      </motion.div>
    </div>
  );
}
