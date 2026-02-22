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

// ===== Interest & Analysis Types (Phase 1) =====

export type LifeDomain =
  | 'health'
  | 'career'
  | 'education'
  | 'finance'
  | 'relationships'
  | 'creativity'
  | 'travel'
  | 'lifestyle'
  | 'hobby'
  | 'other';

export type InterestCategory =
  | 'activity'
  | 'skill'
  | 'topic'
  | 'place'
  | 'experience'
  | 'other';

export interface ExtractedInterest {
  name: string;
  category: InterestCategory;
  specificity: 'broad' | 'medium' | 'specific';
  confidence: number; // 0-1
}

export interface AspirationAnalysis {
  aspiration_id: string;
  interests: ExtractedInterest[];
  emotions: string[];
  values: string[];
  life_domain: LifeDomain;
  created_at: string;
}

export interface Interest {
  id: string;
  name: string;
  name_ko: string;
  category: InterestCategory;
  parent_interest_id: string | null;
}

export interface UserInterest {
  id: string;
  user_id: string;
  interest_id: string;
  source_aspiration_id: string;
  strength: number; // 0-1
  status: 'active' | 'inactive';
  interest?: Interest;
}

export interface AspirationGroup {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  color: string;
  icon: string;
  created_at: string;
}

export interface AspirationGroupMember {
  aspiration_id: string;
  group_id: string;
  similarity_score: number;
  group?: AspirationGroup;
}

export interface Recommendation {
  id: string;
  user_id: string;
  interest_id: string | null;
  type: 'similar' | 'cross_user' | 'personality';
  reasoning: string;
  novelty_score: number;
  user_response: 'accepted' | 'dismissed' | 'ignored' | null;
  created_at: string;
  interest?: Interest;
}

// Extended Aspiration with analysis data
export interface AspirationWithAnalysis extends Aspiration {
  life_domain?: LifeDomain;
  auto_tags?: string[];
  analysis?: AspirationAnalysis;
  groups?: AspirationGroupMember[];
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

export interface Feedback {
  id: string;
  user_id: string;
  rating: number;
  comment: string;
  created_at: string;
}
