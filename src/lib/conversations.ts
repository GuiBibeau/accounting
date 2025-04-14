export interface Conversation {
  id: number;
  title: string;
  date: string; // Keeping date as string as used in the original component
  active?: boolean; // Optional active flag
}

// You might add functions here later to fetch/manage conversations
