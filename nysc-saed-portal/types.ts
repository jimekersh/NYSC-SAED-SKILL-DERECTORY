
export type UserRole = 'ADMIN' | 'INSTRUCTOR' | 'CORPER' | 'STAFF' | 'GUEST';

export type ApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface Skill {
  id: string;
  name: string;
  category: string;
}

export interface UserBase {
  id: string;
  name: string;
  email: string;
  password?: string;
  status: ApprovalStatus;
  profilePic?: string;
}

export interface Instructor extends UserBase {
  headline: string;
  about: string;
  coverImage: string;
  skills: string[];
  rating: number;
  reviewCount: number;
  phoneNumber: string;
  location: {
    lat: number;
    lng: number;
    address: string;
    state: string;
    lga: string;
  };
  linkedInUrl: string;
  verified?: boolean;
}

export interface Corper extends UserBase {
  stateCode: string;
  batch: string;
  currentSkillId?: string;
  interests?: string;
  stateOfService: string;
}

export interface Staff extends UserBase {
  staffId: string;
  state: string;
  department: string;
}

export interface Admin extends UserBase {
  security_key?: string;
}

export interface Registration {
  id: string;
  corper_id: string;
  corper_name: string;
  instructor_id: string;
  skill_id?: string;
  skill_name: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'COMPLETED';
  date: string;
  gender?: 'MALE' | 'FEMALE';
}

export interface ActivityReport {
  quarter: string;
  totalRegistrations: number;
  acceptedCount: number;
  topSkills: { skill: string; count: number }[];
}
