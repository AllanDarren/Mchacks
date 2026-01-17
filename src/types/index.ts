export type Role = 'student' | 'mentor';

export interface Profile {
  id: string;
  full_name: string;
  avatar_url: string | null;
  role: Role;
  bio: string | null;
  created_at: string;
  updated_at: string;
}

export interface Skill {
  id: string;
  name: string;
  created_at: string;
}

export interface ProfileSkill {
  profile_id: string;
  skill_id: string;
  created_at: string;
}

export interface User {
  id: string;
  email: string;
  profile: Profile | null;
}
