'use client';

import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
// remarkBreaks is removed as we preprocess newlines now

interface AssistantMessageProps {
  content: string;
}

export const AssistantMessage: React.FC<AssistantMessageProps> = ({
  content,
}) => {
  const processedContent = content.replace(/\n(?!\n)/g, '\n\n');

  return (
    <motion.div
      className="flex items-start rounded-lg px-4 py-3 max-w-[90%] md:max-w-[80%] lg:max-w-[70%] w-full"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.3 }}
    >
      <div className="text-foreground w-full prose prose-sm dark:prose-invert max-w-none">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {processedContent}
        </ReactMarkdown>
      </div>
    </motion.div>
  );
};
