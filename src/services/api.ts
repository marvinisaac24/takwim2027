import { TakwimEntry, HolidayRecord, PanitiaConfig, SchoolSettings, CivicValueRecord, SalaryRecord } from '../types/takwim';

const noCacheGet = (url: string) => {
  const sep = url.includes('?') ? '&' : '?';
  return fetch(`${url}${sep}_t=${Date.now()}`, {
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
    },
    cache: 'no-store',
  });
};

export const api = {
  // System Status
  async getStatus() {
    const res = await noCacheGet('/api/status');
    if (!res.ok) throw new Error('Gagal menghubungi pelayan pangkalan data');
    return res.json();
  },

  // Takwim Entries
  async getEntries(params?: Record<string, string | number>) {
    const query = new URLSearchParams();
    if (params) {
      for (const [k, v] of Object.entries(params)) {
        if (v !== undefined && v !== null && v !== '') {
          query.append(k, String(v));
        }
      }
    }
    const qStr = query.toString();
    const url = qStr ? `/api/takwim?${qStr}` : '/api/takwim';
    const res = await noCacheGet(url);
    if (!res.ok) throw new Error('Gagal memuatkan rekod takwim');
    return res.json();
  },

  async getEntry(id: string) {
    const res = await noCacheGet(`/api/takwim/${id}`);
    if (!res.ok) throw new Error('Gagal memuatkan perincian program');
    return res.json();
  },

  async createEntry(data: Partial<TakwimEntry>) {
    const res = await fetch('/api/takwim', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Gagal menyimpan program');
    return json;
  },

  async updateEntry(id: string, data: Partial<TakwimEntry>) {
    const res = await fetch(`/api/takwim/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Gagal mengemas kini program');
    return json;
  },

  async deleteEntry(id: string) {
    const res = await fetch(`/api/takwim/${id}`, {
      method: 'DELETE',
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Gagal memadam program');
    return json;
  },

  async bulkUploadEntries(payload: {
    entries: Partial<TakwimEntry>[];
    mode?: 'replace' | 'append';
    excludeWeekends?: boolean;
  }) {
    const res = await fetch('/api/takwim/bulk-upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Gagal memuat naik takwim pukal');
    return json;
  },

  async clearTakwim() {
    const res = await fetch('/api/takwim/clear', {
      method: 'POST',
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Gagal mengosongkan takwim');
    return json;
  },

  // Approval
  async updateApproval(
    id: string,
    payload: {
      status: string;
      komen?: string;
      approverId: string;
      approverName: string;
      approverRole: string;
    }
  ) {
    const res = await fetch(`/api/takwim/${id}/approval`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Gagal mengemas kini kelulusan');
    return json;
  },

  // Implementation status
  async updateImplementation(
    id: string,
    payload: {
      status: string;
      tarikhSebenar?: string;
      ringkasanHasil?: string;
      laporanPautan?: string;
      userId: string;
      userName: string;
    }
  ) {
    const res = await fetch(`/api/takwim/${id}/implementation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Gagal mengemas kini status pelaksanaan');
    return json;
  },

  // Trash & Restore
  async getTrash() {
    const res = await noCacheGet('/api/trash');
    if (!res.ok) throw new Error('Gagal memuatkan senarai tong sampah');
    return res.json();
  },

  async restoreEntry(id: string) {
    const res = await fetch(`/api/trash/${id}/restore`, {
      method: 'POST',
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Gagal memulihkan rekod');
    return json;
  },

  // Drafts
  async getDraft(userId: string) {
    const res = await noCacheGet(`/api/drafts/${userId}`);
    if (!res.ok) return null;
    const json = await res.json();
    return json.data;
  },

  async saveDraft(userId: string, data: Partial<TakwimEntry>) {
    await fetch(`/api/drafts/${userId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  },

  async deleteDraft(userId: string) {
    await fetch(`/api/drafts/${userId}`, {
      method: 'DELETE',
    });
  },

  // Holidays
  async getHolidays() {
    const res = await noCacheGet('/api/holidays');
    if (!res.ok) throw new Error('Gagal memuatkan senarai cuti');
    return res.json();
  },

  async addHoliday(data: Partial<HolidayRecord>) {
    const res = await fetch('/api/holidays', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Gagal menambah cuti');
    return json;
  },

  async updateHoliday(id: string, data: Partial<HolidayRecord>) {
    const res = await fetch(`/api/holidays/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Gagal mengemas kini cuti');
    return json;
  },

  async verifyAllHolidays() {
    const res = await fetch('/api/holidays/verify-all', {
      method: 'POST',
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Gagal mengesahkan cuti');
    return json;
  },

  // Panitia
  async getPanitia() {
    const res = await noCacheGet('/api/panitia');
    if (!res.ok) throw new Error('Gagal memuatkan maklumat panitia');
    return res.json();
  },

  async updatePanitia(id: string, data: Partial<PanitiaConfig>) {
    const res = await fetch(`/api/panitia/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Gagal mengemas kini panitia');
    return json;
  },

  async addPanitia(data: Partial<PanitiaConfig>) {
    const res = await fetch('/api/panitia', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Gagal menambah panitia');
    return json;
  },

  // Tuesday Assemblies & Full 2027 Takwim Generation
  async generateTuesdayAssemblies() {
    const res = await fetch('/api/generate-tuesday-assemblies', {
      method: 'POST',
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Gagal menjana perhimpunan Selasa');
    return json;
  },

  async seedFullTakwim() {
    const res = await fetch('/api/seed-full-takwim', {
      method: 'POST',
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Gagal memuatkan takwim penuh 2027');
    return json;
  },

  // Reset
  async resetSeed() {
    const res = await fetch('/api/reset-seed', {
      method: 'POST',
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Gagal set semula');
    return json;
  },

  // School Settings & Configurations
  async getSettings(): Promise<{ success: boolean; data: SchoolSettings }> {
    const res = await noCacheGet('/api/settings');
    if (!res.ok) throw new Error('Gagal memuatkan ketetapan sekolah');
    return res.json();
  },

  async updateSettings(data: Partial<SchoolSettings>) {
    const res = await fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Gagal menyimpan ketetapan sekolah');
    return json;
  },

  async uploadTeachers(teachers: string[], replace = false) {
    const res = await fetch('/api/settings/upload-teachers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ teachers, replace }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Gagal mengemas kini senarai guru');
    return json;
  },

  async uploadManagementBook(rawText: string, sourceName?: string) {
    const res = await fetch('/api/settings/upload-book', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rawText, sourceName }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Gagal mengekstrak program daripada buku pengurusan');
    return json;
  },

  async uploadCivicValues(civicValues: CivicValueRecord[]) {
    const res = await fetch('/api/settings/upload-civic', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ civicValues }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Gagal mengemas kini nilai sivik');
    return json;
  },

  async uploadSalaryDates(salaryDates: SalaryRecord[]) {
    const res = await fetch('/api/settings/upload-salary', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ salaryDates }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Gagal mengemas kini jadual gaji');
    return json;
  },
};
