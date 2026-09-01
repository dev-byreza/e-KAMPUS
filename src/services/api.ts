import {
  Course,
  Student,
  Offering,
  PracticeVersion,
  ExerciseGradeRecord,
  PdfGradeRecord,
  SoftSkillGradeRecord,
  AttendanceRecord,
  GradeSnapshot,
  AuditEvent,
} from '../types/assessment';

const API_BASE = '/api';

class ApiService {
  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    try {
      const res = await fetch(`${API_BASE}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        ...options,
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error ${res.status}: ${res.statusText}`);
      }

      return await res.json();
    } catch (err: any) {
      console.warn(`[API] Request failed for ${endpoint}:`, err.message);
      throw err;
    }
  }

  // Health check
  public async checkHealth() {
    return this.request<{ status: string; version: string }>('/health');
  }

  // Courses (Mata Kuliah)
  public async getCourses() {
    return this.request<{ success: boolean; count: number; data: Course[] }>('/courses');
  }

  public async getCourseById(id: string) {
    return this.request<{ success: boolean; data: Course }>(`/courses/${id}`);
  }

  public async createCourse(course: Partial<Course>) {
    return this.request<{ success: boolean; data: Course }>('/courses', {
      method: 'POST',
      body: JSON.stringify(course),
    });
  }

  public async updateCourse(id: string, updates: Partial<Course>) {
    return this.request<{ success: boolean; data: Course }>(`/courses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  public async deleteCourse(id: string) {
    return this.request<{ success: boolean; data: Course }>(`/courses/${id}`, {
      method: 'DELETE',
    });
  }

  // Students
  public async getStudents(params?: { class?: string; search?: string }) {
    const query = new URLSearchParams();
    if (params?.class) query.append('class', params.class);
    if (params?.search) query.append('search', params.search);
    const queryString = query.toString() ? `?${query.toString()}` : '';
    return this.request<{ success: boolean; data: Student[] }>(`/students${queryString}`);
  }

  public async createStudent(student: Partial<Student>) {
    return this.request<{ success: boolean; data: Student }>('/students', {
      method: 'POST',
      body: JSON.stringify(student),
    });
  }

  public async bulkImportStudents(students: Partial<Student>[]) {
    return this.request<{ success: boolean; importedCount: number }>('/students/bulk-import', {
      method: 'POST',
      body: JSON.stringify({ students }),
    });
  }

  public async updateStudent(id: string, updates: Partial<Student>) {
    return this.request<{ success: boolean; data: Student }>(`/students/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  public async deleteStudent(id: string) {
    return this.request<{ success: boolean; data: Student }>(`/students/${id}`, {
      method: 'DELETE',
    });
  }

  // Offerings
  public async getOfferings() {
    return this.request<{ success: boolean; data: Offering[] }>('/offerings');
  }

  public async createOffering(offering: Partial<Offering>) {
    return this.request<{ success: boolean; data: Offering }>('/offerings', {
      method: 'POST',
      body: JSON.stringify(offering),
    });
  }

  public async updateOffering(id: string, updates: Partial<Offering>) {
    return this.request<{ success: boolean; data: Offering }>(`/offerings/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  public async deleteOffering(id: string) {
    return this.request<{ success: boolean; data: Offering }>(`/offerings/${id}`, {
      method: 'DELETE',
    });
  }

  public async toggleRosterVerification(id: string) {
    return this.request<{ success: boolean; data: Offering }>(`/offerings/${id}/verify-roster`, {
      method: 'POST',
    });
  }

  public async toggleDatesVerification(id: string) {
    return this.request<{ success: boolean; data: Offering }>(`/offerings/${id}/verify-dates`, {
      method: 'POST',
    });
  }

  // Practice Versions (Format Engine)
  public async getPracticeVersions() {
    return this.request<{ success: boolean; data: PracticeVersion[] }>('/practice-versions');
  }

  public async createPracticeVersion(version: PracticeVersion) {
    return this.request<{ success: boolean; data: PracticeVersion }>('/practice-versions', {
      method: 'POST',
      body: JSON.stringify(version),
    });
  }

  public async updatePracticeVersion(id: string, updates: Partial<PracticeVersion>) {
    return this.request<{ success: boolean; data: PracticeVersion }>(`/practice-versions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  public async publishPracticeVersion(id: string) {
    return this.request<{ success: boolean; data: PracticeVersion }>(`/practice-versions/${id}/publish`, {
      method: 'POST',
    });
  }

  public async applyPracticeVersion(versionId: string, targetOfferingIds: string[]) {
    return this.request<{ success: boolean; appliedOfferings: string[] }>(`/practice-versions/${versionId}/apply`, {
      method: 'POST',
      body: JSON.stringify({ targetOfferingIds }),
    });
  }

  // Grades
  public async getGrades(offeringId: string) {
    return this.request<{
      success: boolean;
      data: {
        exercises: ExerciseGradeRecord[];
        pdfs: PdfGradeRecord[];
        softSkills: SoftSkillGradeRecord[];
        attendances: AttendanceRecord[];
      };
    }>(`/grades/${offeringId}`);
  }

  public async saveExerciseGrade(record: ExerciseGradeRecord) {
    return this.request<{ success: boolean; data: ExerciseGradeRecord }>('/grades/exercise', {
      method: 'POST',
      body: JSON.stringify(record),
    });
  }

  public async savePdfGrade(record: PdfGradeRecord) {
    return this.request<{ success: boolean; data: PdfGradeRecord }>('/grades/pdf', {
      method: 'POST',
      body: JSON.stringify(record),
    });
  }

  public async saveSoftSkillGrade(record: SoftSkillGradeRecord) {
    return this.request<{ success: boolean; data: SoftSkillGradeRecord }>('/grades/softskill', {
      method: 'POST',
      body: JSON.stringify(record),
    });
  }

  public async saveAttendanceGrade(record: AttendanceRecord) {
    return this.request<{ success: boolean; data: AttendanceRecord }>('/grades/attendance', {
      method: 'POST',
      body: JSON.stringify(record),
    });
  }

  public async bulkPresentAttendance(offeringId: string, sessionOrdinal: number) {
    return this.request<{ success: boolean; updatedCount: number }>('/grades/attendance/bulk-present', {
      method: 'POST',
      body: JSON.stringify({ offeringId, sessionOrdinal }),
    });
  }

  // Snapshots & Finalization
  public async finalizeGrades(payload: {
    offeringId: string;
    snapshots: Partial<GradeSnapshot>[];
    instructorName: string;
  }) {
    return this.request<{ success: boolean; count: number; data: GradeSnapshot[] }>('/snapshots/finalize', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  public async reopenGrades(payload: {
    offeringId: string;
    reason: string;
    actor: string;
  }) {
    return this.request<{ success: boolean; message: string }>('/snapshots/reopen', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  // Audit Logs
  public async getAuditLogs() {
    return this.request<{ success: boolean; count: number; data: AuditEvent[] }>('/audit');
  }

  // System
  public async resetServerDatabase() {
    return this.request<{ success: boolean; message: string }>('/system/reset-db', {
      method: 'POST',
    });
  }
}

export const api = new ApiService();
