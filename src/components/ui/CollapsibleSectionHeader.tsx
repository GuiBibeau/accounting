'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface CollapsibleSectionHeaderProps {
  title: string;
  isExpanded: boolean;
  onToggle: () => void;
  className?: string;
}

export const CollapsibleSectionHeader: React.FC<CollapsibleSectionHeaderProps> = ({
  title,
  isExpanded,
  onToggle,
  className = '',
}) => {
  return (
    <div className={`flex items-center justify-between ${className}`}>
      <h2 className="font-medium text-sm text-muted-foreground">{title}</h2>
      <motion.button
        onClick={onToggle}
        className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        aria-label={isExpanded ? `Hide ${title}` : `Show ${title}`}
      >
        <AnimatePresence mode="wait" initial={false}>
          {isExpanded ? (
            <motion.div
              key="down"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown className="w-4 h-4" />
            </motion.div>
          ) : (
            <motion.div
              key="right"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronRight className="w-4 h-4" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
};
