import { CivicValueRecord, HolidayRecord } from '../types/takwim';
import { MONTH_NAMES_MS, getDayStatus, getAllDefaultHolidays } from '../constants/calendar2027';

export interface CivicTuesdaySlot {
  month: number;
  monthName: string;
  weekIndex: number; // 1, 2, 3, 4, 5
  tuesdayDate: string; // "2027-02-09"
  tuesdayDisplay: string; // "9 Feb 2027"
  coreValue: string; // "Kasih Sayang", etc.
  subTheme: string;
  subNilai: string;
  tajukAktiviti: string;
  cadanganAktiviti5Minit: string;
  fokusSasaran: string;
  isHoliday: boolean;
  holidayReason?: string;
  statusPelaksanaan: 'Terlaksana Mengikut Jadual' | 'Dibatalkan (Cuti - Tiada Carry Forward)';
  catatanStatus: string;
}

/**
 * Membina jadual pelaksanaan Nilai Sivik pada setiap hari Selasa mengikut Takwim Persekolahan 2027.
 * Peraturan Khas Pengguna: Subtema TIDAK BOLEH CARRY FORWARD sekiranya hari Selasa adalah cuti umum atau apa-apa cuti.
 * Jika cuti, status ditandakan Dibatalkan (Tiada Carry Forward) dan minggu seterusnya tetap melaksanakan subtema minggunya sendiri.
 */
export function getCivicTuesdaySchedule(
  civicValues: CivicValueRecord[],
  holidays: HolidayRecord[] = getAllDefaultHolidays(),
  filterMonth?: number
): CivicTuesdaySlot[] {
  const year = 2027;
  const results: CivicTuesdaySlot[] = [];

  const targetMonths = filterMonth ? [filterMonth] : [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

  for (const m of targetMonths) {
    const monthRecord = civicValues.find(c => c.month === m);
    const coreValue = monthRecord?.coreValue || 'Kasih Sayang';
    const subTheme = monthRecord?.subTheme || 'Penerapan amalan nilai murni';
    const monthName = MONTH_NAMES_MS[m - 1] || `Bulan ${m}`;

    // Cari semua hari Selasa dalam bulan ini (year 2027)
    const totalDays = new Date(year, m, 0).getDate();
    const tuesdaysInMonth: { dateStr: string; dayNum: number }[] = [];

    for (let day = 1; day <= totalDays; day++) {
      const dateStr = `${year}-${String(m).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const d = new Date(dateStr + 'T00:00:00');
      if (d.getDay() === 2) { // 2 = Selasa
        tuesdaysInMonth.push({ dateStr, dayNum: day });
      }
    }

    // Padankan setiap hari Selasa dengan aktiviti mingguan (M1, M2, M3, M4, M5)
    tuesdaysInMonth.forEach((tuesday, idx) => {
      const weekIndex = idx + 1;
      const statusInfo = getDayStatus(tuesday.dateStr, holidays);
      const isHoliday = statusInfo.isHoliday || statusInfo.isSchoolHoliday || !statusInfo.isPdPDay;
      const holidayReason = statusInfo.reason || statusInfo.statusLabel;

      // Ambil aktiviti sedia ada bagi minggu tersebut
      const act = monthRecord?.weeklyActivities?.[idx];

      let subNilai = act?.subNilai;
      let tajukAktiviti = act?.tajukAktiviti;
      let cadanganAktiviti = act?.cadanganAktiviti5Minit;
      let fokusSasaran = act?.fokusSasaran || 'Semua Murid & Guru';

      // Jika bulan mempunyai 5 hari Selasa dan aktiviti ke-5 tiada, jana aktiviti pengukuhan
      if (!tajukAktiviti) {
        subNilai = `Pengukuhan Nilai ${coreValue}`;
        tajukAktiviti = `Refleksi & Penghayatan Amalan Nilai ${coreValue}`;
        cadanganAktiviti = `Guru meminta 2-3 orang murid berkongsi amalan murni berkenaan ${coreValue} yang telah mereka amalkan sepanjang bulan ${monthName} di tapak perhimpunan atau kelas.`;
      }

      const tuesdayDisplay = `${tuesday.dayNum} ${monthName} ${year}`;

      const statusPelaksanaan: 'Terlaksana Mengikut Jadual' | 'Dibatalkan (Cuti - Tiada Carry Forward)' = isHoliday
        ? 'Dibatalkan (Cuti - Tiada Carry Forward)'
        : 'Terlaksana Mengikut Jadual';

      const catatanStatus = isHoliday
        ? `Hari Selasa ${tuesdayDisplay} adalah ${holidayReason}. Mengikut dasar sekolah, subtema minggu ini TIDAK DI-CARRY FORWARD.`
        : `Dilaksanakan pada Perhimpunan Dwisesi Selasa (Pagi: 07:00-07:30 / Petang: 12:40-01:10) & 5 minit PdP.`;

      results.push({
        month: m,
        monthName,
        weekIndex,
        tuesdayDate: tuesday.dateStr,
        tuesdayDisplay,
        coreValue,
        subTheme,
        subNilai: subNilai || subTheme,
        tajukAktiviti: tajukAktiviti || `Aktiviti Sivik Minggu ${weekIndex}`,
        cadanganAktiviti5Minit: cadanganAktiviti || 'Aktiviti ringkas 5 minit bersama murid.',
        fokusSasaran,
        isHoliday,
        holidayReason,
        statusPelaksanaan,
        catatanStatus,
      });
    });
  }

  return results;
}
