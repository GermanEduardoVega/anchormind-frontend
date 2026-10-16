//definimos los tipos de datos
export interface Clinic {
  id: number;
  name: string;
  address?: string;
  phone?: string;
  active: boolean;
}

export interface UserProfile {
  id: number;
  username: string;
  fullName: string;
  email: string;
  role: 'PATIENT' | 'PROFESSIONAL' | 'CLINIC_ADMIN' | 'ADMIN';
  clinicId?: number;
  clinicName?: string;
  active: boolean;
  createdAt?: string;
}


// Lo que mandamos al backend en el body
export interface AnxietyRecordRequest {
  rawInput: string;
}

// Lo que devuelve tu backend mapeado por AnxietyRecordMapper
export interface AnxietyRecordResponse {
  id: number;
  timeStamp: string;
  rawInput: string;
  anxietyLevel: number;
  triggerIdentified: string;
  technique: string;
  applicability: string;
  awarenessMessage: string;
  actionSteps: string[];
  user: UserProfile;
}


export interface UserProfile {
  id: number;
  username: string;
  fullName: string;
  email: string;
  role: 'PATIENT' | 'PROFESSIONAL' | 'CLINIC_ADMIN' | 'ADMIN';
  clinicId?: number;
  clinicName?: string;
  active: boolean;
  createdAt?: string;
}