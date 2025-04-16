'use client';

import { motion } from 'framer-motion';

export function PulseDot() {
  return (
    <motion.div
      className="flex items-center mt-1"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5 }}
    >
      <motion.div
        className="w-2 h-2 bg-blue-500 rounded-full mr-1"
        animate={{
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 2,
          repeat: Number.POSITIVE_INFINITY,
          repeatType: 'reverse',
        }}
      />
    </motion.div>
  );
}
