
import { SalesAgent, SIPTransaction, TransactionType } from './types';

export const INITIAL_AGENTS: SalesAgent[] = [
  { 
    id: '1', 
    name: 'Rajesh Kumar', 
    email: 'rajesh@mfd.com', 
    monthlySipTarget: 200000, 
    monthlyLumpsumTarget: 300000, 
    annualTarget: 6000000 
  },
  { 
    id: '2', 
    name: 'Priya Sharma', 
    email: 'priya@mfd.com', 
    monthlySipTarget: 150000, 
    monthlyLumpsumTarget: 250000, 
    annualTarget: 4800000 
  },
  { 
    id: '3', 
    name: 'Amit Singh', 
    email: 'amit@mfd.com', 
    monthlySipTarget: 300000, 
    monthlyLumpsumTarget: 300000, 
    annualTarget: 7200000 
  },
];

export const INITIAL_TRANSACTIONS: SIPTransaction[] = [
  { id: 't1', agentId: '1', clientName: 'Aditya Birla', panOrFolio: 'ABCDE1234F', schemeName: 'HDFC Top 100', amount: 10000, type: TransactionType.NEW_SIP, mode: 'SIP', recordingDate: '2024-05-01', sipDate: '2024-05-05' },
  { id: 't2', agentId: '2', clientName: 'Suresh Raina', panOrFolio: 'FL99882211', schemeName: 'ICICI Prudential Bluechip', amount: 5000, type: TransactionType.RELOGIN, mode: 'SIP', recordingDate: '2024-05-02', sipDate: '2024-05-10' },
  { id: 't3', agentId: '3', clientName: 'Mitali Raj', panOrFolio: 'XYZPD9988G', schemeName: 'SBI Small Cap', amount: 15000, type: TransactionType.NEW_SIP, mode: 'LUMPSUM', recordingDate: '2024-05-03' },
  { id: 't4', agentId: '1', clientName: 'Virat Kohli', panOrFolio: 'PAN009988M', schemeName: 'Nippon India Growth', amount: 20000, type: TransactionType.NONE, mode: 'REDEMPTION', recordingDate: '2024-05-04' },
  { id: 't5', agentId: '2', clientName: 'Smriti Mandhana', panOrFolio: 'FL11223344', schemeName: 'Axis Bluechip', amount: 8000, type: TransactionType.CLOSED_SIP, mode: 'SIP', recordingDate: '2024-05-05', sipDate: '2024-05-15' },
];
