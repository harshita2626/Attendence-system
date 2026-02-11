
import { AttendanceRecord, AttendanceStatus, User, UserRole } from '../types';

const STORAGE_KEY = 'edutrack_attendance';
const USERS_KEY = 'edutrack_students';

// Initialize some mock students if none exist
const initializeMockData = () => {
  const students = localStorage.getItem(USERS_KEY);
  if (!students) {
    const mockStudents: User[] = [
      { id: '1', name: 'Alice Johnson', email: 'alice@edu.com', role: UserRole.STUDENT, studentId: 'STU-1001' },
      { id: '2', name: 'Bob Smith', email: 'bob@edu.com', role: UserRole.STUDENT, studentId: 'STU-1002' },
      { id: '3', name: 'Charlie Brown', email: 'charlie@edu.com', role: UserRole.STUDENT, studentId: 'STU-1003' },
      { id: '4', name: 'Diana Prince', email: 'diana@edu.com', role: UserRole.STUDENT, studentId: 'STU-1004' },
      { id: '5', name: 'Edward Norton', email: 'edward@edu.com', role: UserRole.STUDENT, studentId: 'STU-1005' },
    ];
    localStorage.setItem(USERS_KEY, JSON.stringify(mockStudents));
  }
};

export const attendanceService = {
  getStudents: (): User[] => {
    initializeMockData();
    return JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
  },

  getAllRecords: (): AttendanceRecord[] => {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  },

  getRecordsByDate: (date: string): AttendanceRecord[] => {
    const all = attendanceService.getAllRecords();
    return all.filter(r => r.date === date);
  },

  getRecordsByStudent: (studentId: string): AttendanceRecord[] => {
    const all = attendanceService.getAllRecords();
    return all.filter(r => r.studentId === studentId);
  },

  markAttendance: (records: Omit<AttendanceRecord, 'id'>[]): void => {
    const all = attendanceService.getAllRecords();
    const newRecords = records.map(r => ({
      ...r,
      id: Math.random().toString(36).substr(2, 9)
    }));
    
    // In a real system, we'd update existing records for that date instead of just appending
    const filteredAll = all.filter(existing => 
      !newRecords.some(newRec => newRec.date === existing.date && newRec.studentId === existing.studentId)
    );
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...filteredAll, ...newRecords]));
  }
};
