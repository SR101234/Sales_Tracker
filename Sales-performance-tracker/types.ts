
export enum TransactionType {
  NEW_SIP = 'NEW_SIP',
  CLOSED_SIP = 'CLOSED_SIP',
  RELOGIN = 'RELOGIN',
  NONE = 'NONE'
}

export enum ServiceType {
  NOMINEE_UPDATE = 'Nominee Update',
  MOBILE_UPDATE = 'Mobile Update',
  KYC = 'KYC',
  KYC_UPDATE = 'KYC Update',
  UPDATE_EMAIL = 'Update Email',
  MINOR_TO_MAJOR = 'Minor to Major',
  FATCA_UPDATE = 'FATCA Update',
  BANK_UPDATE = 'Bank Update',
  SIGNATURE_UPDATE = 'Signature Update',
  OTHER = 'Other'
}

export type InvestmentMode = 'SIP' | 'LUMPSUM' | 'REDEMPTION';

export interface SalesAgent {
  id: string;
  name: string;
  email: string;
  panNumber?: string;
  monthlySipTarget: number;
  monthlyLumpsumTarget: number;
  annualTarget: number;
}

export interface SubTask {
  id: string;
  agentId: string;
  clientName: string;
  panOrFolio: string;
  serviceType: ServiceType;
  amc: string;
  newInformation: string;
  date: string;
  remark: string;
  transactionNumber?: string;
}

export interface SIPTransaction {
  id: string;
  agentId: string;
  clientName: string;
  panOrFolio: string;
  schemeName: string;
  amount: number;
  type: TransactionType;
  mode: InvestmentMode;
  recordingDate: string;
  sipDate?: string;
  date?: string;
  notes?: string;
  remark?: string;
}

export interface PerformanceStats {
  agentName: string;
  achievedSip: number;
  targetSip: number;
  sipPercentage: number;
  achievedLumpsum: number;
  targetLumpsum: number;
  lumpsumPercentage: number;
  totalNewSIP: number;
  totalClosedSIP: number;
  totalRedemption: number;
  totalRelogin: number;
}
