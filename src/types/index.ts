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

// Alert System Types
export type AlertType =
  | 'reminder'       // 일반 리마인더 (주기적)
  | 'deadline_soon'  // 임박 (3일 이내)
  | 'deadline_today' // 당일
  | 'overdue';       // 초과

export type UrgencyLevel = 'low' | 'medium' | 'high' | 'critical';
export type AlertStatus = 'pending' | 'done';

export interface Alert {
  id: string;
  user_id: string;
  aspiration_id: string;
  type: AlertType;
  status: AlertStatus;
  message: string;
  sent_to_discord: boolean;
  created_at: string;
  read_at: string | null;
  aspiration?: Aspiration;
}
