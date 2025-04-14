'use client';
import { motion } from 'framer-motion';
import { ChevronLeft } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getConversation } from '@/lib/conversations';

const pageTransition = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

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
  return (
    <motion.div
      key="chat-view"
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={pageTransition}
      className="flex-1 flex flex-col"
    >
      <div className="p-4 flex items-center">
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
        <div className="flex-1 text-center font-medium">{title}</div>
        <div className="w-5"></div> 
      </div>
      {children}
    </motion.div>
  );
}
