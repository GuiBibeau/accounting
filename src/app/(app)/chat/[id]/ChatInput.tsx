import { motion } from 'framer-motion';
import { PaperclipIcon, SendHorizontal } from 'lucide-react';

type Props = {
  handleSubmitMessage: (e: React.FormEvent<HTMLFormElement>) => void;
  handleInputChange: (
    e:
      | React.ChangeEvent<HTMLInputElement>
      | React.ChangeEvent<HTMLTextAreaElement>
  ) => void;
  input: string;
};

export const ChatInput: React.FC<Props> = ({
  handleSubmitMessage,
  input,
  handleInputChange,
}) => {
  return (
    <div className="p-4 w-full mb-8">
      <div className="relative mx-auto max-w-[90%] md:max-w-[80%] lg:max-w-[70%]">
        <motion.div className="rounded-xl bg-card border border-border overflow-hidden focus-within:border-ring hover:border-border/80">
          <form onSubmit={handleSubmitMessage}>
            <input
              value={input}
              onChange={handleInputChange}
              className="w-full bg-transparent px-4 py-3 outline-none resize-none h-12"
              placeholder="Ask anything, create anything"
            />

            <div className="absolute right-2 bottom-2 flex items-center">
              <motion.button
                className="p-2 text-muted-foreground hover:text-foreground"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <PaperclipIcon className="w-5 h-5" />
              </motion.button>
              <motion.button
                type="submit"
                className="p-2 rounded-full bg-primary hover:bg-primary/90 ml-2"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <SendHorizontal className="w-5 h-5 text-primary-foreground" />
              </motion.button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};
