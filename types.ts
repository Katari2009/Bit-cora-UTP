
export interface Teacher {
  id: string;
  name: string;
}

export enum ComplianceStatus {
  COMPLIED = "Cumple",
  NOT_COMPLIED = "No Cumple",
}

export interface ComplianceRecord {
  id: string;
  teacherId: string;
  teacherName: string; // Denormalized for easier reporting
  date: string; // ISO string format
  course: string;
  subject: string;
  status: ComplianceStatus;
}
