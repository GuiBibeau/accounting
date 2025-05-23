'use client';

import { motion } from 'framer-motion';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

interface UserMessageProps {
  content: string;
  userEmail: string | null | undefined;
}

export const UserMessage: React.FC<UserMessageProps> = ({
  content,
  userEmail,
}) => {
  return (
    <motion.div className="flex items-center gap-3 bg-accent rounded-full px-4 py-3 max-w-[90%] md:max-w-[80%] lg:max-w-[70%] w-full hover:bg-accent/90">
      <Avatar className="h-8 w-8 bg-primary text-primary-foreground">
        <AvatarImage src="/user-avatar.png" />
        <AvatarFallback className="bg-primary text-primary-foreground">
          {userEmail?.charAt(0).toUpperCase() || 'U'}
        </AvatarFallback>
      </Avatar>
      <div>{content}</div>
    </motion.div>
  );
};
