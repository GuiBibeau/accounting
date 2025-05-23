import React from 'react';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';
import { Card, CardContent, CardFooter } from './ui/card';

export function ChatInterface() {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <Card className="flex flex-col h-[500px]">
      {/* Chat History Area */}
      <CardContent className="flex-1 p-4 overflow-y-auto bg-muted/50">
        <p className="text-sm text-muted-foreground">
          Chat messages will appear here.
        </p>
      </CardContent>

      {/* Input Area */}
      <CardFooter className="p-3 border-t">
        <div className="flex items-end gap-2 w-full">
          <Textarea
            placeholder="Send a message..."
            className="flex-1 resize-none min-h-[40px]"
            rows={1}
          />

          <input
            type="file"
            ref={fileInputRef}
            accept=".pdf,.csv"
            className="hidden"
          />

          <Button
            variant="ghost"
            size="icon"
            onClick={handleUploadClick}
            aria-label="Attach file"
          >
            Attach
          </Button>

          <Button>Send</Button>
        </div>
      </CardFooter>
    </Card>
  );
}
