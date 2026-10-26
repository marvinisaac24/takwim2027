import * as XLSX from 'xlsx';
import { SalaryRecord } from '../types/takwim';
import { DAY_NAMES_MS, MONTH_NAMES_MS } from '../constants/calendar2027';

const MONTH_MAP: { [key: string]: number } = {
  'januari': 1, 'jan': 1, 'january': 1, '1': 1, '01': 1,
  'februari': 2, 'feb': 2, 'february': 2, '2': 2, '02': 2,
  'mac': 3, 'mar': 3, 'march': 3, '3': 3, '03': 3,
  'april': 4, 'apr': 4, '4': 4, '04': 4,
  'mei': 5, 'may': 5, '5': 5, '05': 5,
  'jun': 6, 'june': 6, '6': 6, '06': 6,
  'julai': 7, 'jul': 7, 'july': 7, '7': 7, '07': 7,
  'ogos': 8, 'ogo': 8, 'og': 8, 'aug': 8, 'august': 8, '8': 8, '08': 8,
  'september': 9, 'sep': 9, 'sept': 9, '9': 9, '09': 9,
  'oktober': 10, 'okt': 10, 'oct': 10, 'october': 10, '10': 10,
  'november': 11, 'nov': 11, '11': 11,
  'disember': 12, 'dis': 12, 'dec': 12, 'december': 12, '12': 12,
};

function getDayNameFromDate(dateStr: string): string {
  try {
    const d = new Date(dateStr + 'T00:00:00');
    return DAY_NAMES_MS[d.getDay()] || '';
  } catch {
    return '';
  }
}

/**
 * Universal Parser for Civil Service Salary Schedule from any format:
 * - Excel (.xlsx, .xls)
 * - CSV (.csv)
 * - Plain Text / Paste from JANM circular / WhatsApp / Word / PDF
 * - JSON
 */
export async function parseSalarySchedule(
  input: File | string,
  existingList: SalaryRecord[] = []
): Promise<{
  success: boolean;
  records: SalaryRecord[];
  detectedCount: number;
  message: string;
}> {
  let rawText = '';

  if (typeof input === 'string') {
    rawText = input;
  } else {
    const file = input;
    const fileName = file.name.toLowerCase();

    if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
      // Excel File Handling
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      // Convert sheet to CSV formatted string for unified regex parsing
      rawText = XLSX.utils.sheet_to_csv(worksheet);
    } else {
      // CSV, TXT, JSON, etc.
      rawText = await file.text();
    }
  }

  // Clone existing list as base template
  const resultsMap = new Map<number, SalaryRecord>();
  existingList.forEach(r => resultsMap.set(r.month, { ...r }));

  let detectedCount = 0;

  // Split into lines
  const lines = rawText.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);

  // Check if it's JSON format
  if (rawText.trim().startsWith('[') && rawText.trim().endsWith(']')) {
    try {
      const parsedJson = JSON.parse(rawText);
      if (Array.isArray(parsedJson)) {
        for (const item of parsedJson) {
          const m = Number(item.month || item.bulan);
          const d = String(item.date || item.tarikh || '');
          if (m >= 1 && m <= 12 && d.length >= 8) {
            resultsMap.set(m, {
              month: m,
              date: d,
              dayName: item.dayName || item.hari || getDayNameFromDate(d),
              note: item.note || item.catatan || `Gaji Penjawat Awam Bulan ${MONTH_NAMES_MS[m - 1]}`,
            });
            detectedCount++;
          }
        }
        if (detectedCount > 0) {
          return {
            success: true,
            records: Array.from(resultsMap.values()).sort((a, b) => a.month - b.month),
            detectedCount,
            message: `${detectedCount} rekod tarikh gaji berjaya diekstrak daripada fail JSON.`,
          };
        }
      }
    } catch {
      // fallback to line parsing
    }
  }

  // Regex patterns to identify salary rows
  // 1. Standard ISO date: 2027-MM-DD or 2027/MM/DD
  const isoDateRegex = /\b2027[-/](0[1-9]|1[0-2])[-/](0[1-9]|[12][0-9]|3[01])\b/;
  // 2. Malaysian date: DD/MM/2027 or DD-MM-2027
  const msDateRegex = /\b(0[1-9]|[12][0-9]|3[01])[-/.](0[1-9]|1[0-2])[-/.](2027)\b/;
  // 3. Word date: 25 Januari 2027 or 25 Jan 2027
  const wordDateRegex = /\b(0?[1-9]|[12][0-9]|3[01])\s*(?:hb|hb\.)?\s*(januari|februari|mac|april|mei|jun|julai|ogos|september|oktober|november|disember|jan|feb|mar|apr|may|jun|jul|aug|sep|okt|nov|dis)\s*(?:2027)?\b/i;

  for (const line of lines) {
    let matchedMonth: number | null = null;
    let matchedDate: string | null = null;
    let matchedDayName: string | null = null;
    let matchedNote = '';

    // Check ISO date
    const isoMatch = line.match(isoDateRegex);
    if (isoMatch) {
      const parts = isoMatch[0].replace(/\//g, '-').split('-');
      matchedMonth = parseInt(parts[1], 10);
      matchedDate = `2027-${String(matchedMonth).padStart(2, '0')}-${String(parts[2]).padStart(2, '0')}`;
    }

    // Check MS date (DD/MM/2027)
    if (!matchedDate) {
      const msMatch = line.match(msDateRegex);
      if (msMatch) {
        const d = msMatch[1];
        const m = parseInt(msMatch[2], 10);
        matchedMonth = m;
        matchedDate = `2027-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      }
    }

    // Check Word date (e.g. 25 Januari 2027)
    if (!matchedDate) {
      const wordMatch = line.match(wordDateRegex);
      if (wordMatch) {
        const d = wordMatch[1];
        const mName = wordMatch[2].toLowerCase();
        matchedMonth = MONTH_MAP[mName] || null;
        if (matchedMonth) {
          matchedDate = `2027-${String(matchedMonth).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        }
      }
    }

    // Detect month from line if date only had day
    if (!matchedMonth) {
      const lower = line.toLowerCase();
      for (const [mName, mVal] of Object.entries(MONTH_MAP)) {
        if (lower.includes(mName) && mVal <= 12) {
          matchedMonth = mVal;
          break;
        }
      }
    }

    // Extract Day Name if mentioned in line
    const lowerLine = line.toLowerCase();
    for (const dName of ['isnin', 'selasa', 'rabu', 'khamis', 'jumaat', 'sabtu', 'ahad']) {
      if (lowerLine.includes(dName)) {
        matchedDayName = dName.charAt(0).toUpperCase() + dName.slice(1);
        break;
      }
    }

    // Extract Note / Catatan (e.g. Aidilfitri, Krismas, Awal, Raya)
    if (lowerLine.includes('aidilfitri') || lowerLine.includes('hari raya')) {
      matchedNote = 'Awal Sempena Hari Raya Aidilfitri';
    } else if (lowerLine.includes('krismas') || lowerLine.includes('christmas')) {
      matchedNote = 'Awal Sempena Sambutan Hari Krismas';
    } else if (lowerLine.includes('tahun baru cina') || lowerLine.includes('cny')) {
      matchedNote = 'Awal Sempena Tahun Baharu Cina';
    } else if (lowerLine.includes('gawai')) {
      matchedNote = 'Awal Sempena Hari Gawai Dayak';
    } else if (matchedMonth) {
      matchedNote = `Gaji Penjawat Awam Bulan ${MONTH_NAMES_MS[matchedMonth - 1]}`;
    }

    if (matchedMonth && matchedDate) {
      const finalDayName = matchedDayName || getDayNameFromDate(matchedDate);
      resultsMap.set(matchedMonth, {
        month: matchedMonth,
        date: matchedDate,
        dayName: finalDayName,
        note: matchedNote || `Gaji Penjawat Awam Bulan ${MONTH_NAMES_MS[matchedMonth - 1]}`,
      });
      detectedCount++;
    }
  }

  const finalRecords = Array.from(resultsMap.values()).sort((a, b) => a.month - b.month);

  if (detectedCount > 0) {
    return {
      success: true,
      records: finalRecords,
      detectedCount,
      message: `Berjaya membaca & mengekstrak ${detectedCount} tarikh gaji ke dalam takwim sekolah!`,
    };
  }

  return {
    success: false,
    records: existingList,
    detectedCount: 0,
    message: 'Tiada format tarikh gaji 2027 yang sah dapat dikesan. Sila pastikan terdapat tarikh bulan (Januari-Disember) dan hari (1-31).',
  };
}
