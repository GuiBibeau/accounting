import React from 'react';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';
// Potential icon import: import { PaperClipIcon } from '@heroicons/react/20/solid'; // Example

export function ChatInterface() {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleUploadClick = () => {
    // This function would trigger the hidden file input.
    // No actual upload logic implemented yet.
    fileInputRef.current?.click();
  };

  return (
    <div className="flex flex-col h-[500px] border border-zinc-200 dark:border-zinc-700 rounded-lg overflow-hidden bg-white dark:bg-zinc-900">
      {/* Chat History Area */}
      <div className="flex-1 p-4 overflow-y-auto bg-zinc-50 dark:bg-zinc-800/50">
        {/* Placeholder - messages would be rendered here */}
        <p className="text-sm text-zinc-500 dark:text-zinc-400">Chat messages will appear here.</p>
      </div>

      {/* Input Area */}
      <div className="p-3 border-t border-zinc-200 dark:border-zinc-700">
        <div className="flex items-end gap-2">
          <Textarea
            placeholder="Send a message..."
            className="flex-1 resize-none min-h-[40px]" // Adjusted styling
            rows={1}
          />
          {/* Hidden file input */}
          <input
            type="file"
            ref={fileInputRef}
            accept=".pdf,.csv"
            className="hidden"
            // onChange would handle file selection later
          />
          {/* Upload Button */}
          <Button
            plain // Using plain style for a less prominent look
            aria-label="Attach file"
            onClick={handleUploadClick}
            className="p-2" // Adjust padding for button size
          >
            {/* Using a simple text label for now, could be an icon */}
            Attach
            {/* Example Icon: <PaperClipIcon className="size-5 text-zinc-500 dark:text-zinc-400" /> */}
          </Button>
          {/* Submit Button */}
          <Button>Send</Button> {/* Changed text to 'Send' */}
        </div>
      </div>
    </div>
  );
}
