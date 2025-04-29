'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext'; 
import {
  getAllUserConversations,
  type Conversation,
} from '@/lib/conversations';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'; 

export default function ConversationHistoryPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user?.uid) {
      setLoading(true);
      setError(null);
      getAllUserConversations(user.uid)
        .then((data) => {
          setConversations(data);
        })
        .catch((err) => {
          console.error('Error fetching conversation history:', err);
          setError('Failed to load conversation history.');
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [user]); 

  return (
    <div className="flex flex-col flex-1 overflow-y-auto p-4"> {/* Added flex classes */}
      <h1 className="text-2xl font-bold mb-4">Conversation History</h1>

      {loading && <p>Loading history...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {!loading && !error && conversations.length === 0 && (
        <p>No conversations found.</p>
      )}

      {!loading && !error && conversations.length > 0 && (
        <Table>
          <TableCaption>A list of your recent conversations.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead className="text-right">Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {conversations.map((conv: Conversation) => ( 
              <TableRow key={conv.id}>
                <TableCell className="font-medium">
                  <Link href={`/chat/${conv.id}`} className="hover:underline">
                    {conv.title}
                  </Link>
                </TableCell>
                <TableCell className="text-right">{conv.date}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
