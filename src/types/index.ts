export type AspirationStatus = 'active' | 'completed' | 'archived';

export interface Aspiration {
  id: string;
  user_id: string;
  title: string;
  details: string;
  deadline: string | null;
  status: AspirationStatus;
  created_at: string;
  updated_at: string;
}

export interface UserSettings {
  id: string;
  user_id: string;
  discord_webhook_url: string | null;
  notification_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface Reminder {
  id: string;
  user_id: string;
  aspiration_id: string;
  content: string;
  sent_to: 'app' | 'discord' | 'both';
  created_at: string;
  aspiration?: Aspiration;
}

export interface User {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
}

export interface CreateAspirationInput {
  title: string;
  details: string;
  deadline?: string | null;
}

export interface UpdateAspirationInput {
  title?: string;
  details?: string;
  deadline?: string | null;
  status?: AspirationStatus;
}
