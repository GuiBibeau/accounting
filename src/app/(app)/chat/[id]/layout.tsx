'use client';
import { motion } from 'framer-motion';
import { ChevronLeft } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getConversation } from '@/lib/conversations';

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { id } = useParams();
  const router = useRouter();
  const [title, setTitle] = useState('Loading...');

  useEffect(() => {
    if (!id) return;
    
    const fetchTitle = async () => {
      const conversation = await getConversation(id as string);
      setTitle(conversation?.title || 'Untitled Conversation');
    };

    fetchTitle();
  }, [id]);

  const titleBarAnimation = { // Corrected typo: consst -> const
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.5 } }, // Increased duration
  };

  return (
    <div className="flex-1 flex flex-col">
      <div className="p-4 flex items-center">
        {/* Back button is now outside the animated div */}
        <div className="flex items-center gap-3">
          <motion.button
            className="p-1 rounded-full"
            whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
            whileTap={{ scale: 0.9 }}
            onClick={() => router.back()}
          >
            <ChevronLeft className="w-5 h-5" />
          </motion.button>
        </div>
        {/* Animated container for title and spacer */}
        <motion.div
          className="flex-1 flex items-center justify-center" // Adjusted classes for centering title
          initial="hidden"
          animate="visible"
          variants={titleBarAnimation}
        >
          <div className="flex-1 text-center font-medium">{title}</div>
          <div className="w-5"></div> {/* Spacer remains to balance layout */}
        </motion.div>
      </div>
      {children}
    </div>
  );
}
