

export enum Species {
  Falciparum = 'Plasmodium falciparum',
  Vivax = 'Plasmodium vivax',
  Malariae = 'Plasmodium malariae',
  Ovale = 'Plasmodium ovale',
  None = 'None'
}

export enum Stage {
  Ring = 'Ring Stage',
  Trophozoite = 'Trophozoite',
  Schizont = 'Schizont',
  Gametocyte = 'Gametocyte',
  None = 'None'
}

export enum Severity {
  Mild = 'Mild',         // < 1%
  Moderate = 'Moderate', // 1-5%
  Severe = 'Severe'      // > 5%
}

export interface Patient {
  id: string;
  name: string;
  email?: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  weight: number; // kg
  contact: string;
  travelHistory?: string;
  symptoms: string[];
  isPregnant?: boolean;
  g6pdDeficiency?: boolean;
}

export interface AnalysisResult {
  isInfected: boolean;
  species: Species;
  stage: Stage;
  parasitemia: number;
  severity: Severity;
  confidence: number;
  treatmentRecommendation?: string;
  explanation?: string;
  clinicalNotes?: string;
  dlMetadata?: {
    processingTime: number;
    speciesConfidence: number;
    stageConfidence: number;
    detectedParasites: number;
  };
}

export interface LabData {
  hemoglobin?: number;
  platelets?: number;
  wbc?: number;
  bilirubin?: number;
  isFever?: boolean;
}

export interface Report {
  id: string;
  patientId: string;
  patientName: string;
  date: string;
  type: 'Microscopy' | 'Lab Risk';
  status: 'Completed' | 'Pending';
  result?: AnalysisResult;
  labRiskScore?: number; // 0-100
  labRiskLevel?: 'Low' | 'Medium' | 'High';
  imageUrl?: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'alert' | 'info' | 'success';
  date: string;
  read: boolean;
}

export type View = 'dashboard' | 'scan' | 'lab' | 'records' | 'book' | 'profile' | 'about';
export type UserRole = 'doctor' | 'patient';
