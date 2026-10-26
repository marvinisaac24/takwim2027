import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { TakwimEntry, HolidayRecord, SchoolSettings, BidangType, CivicValueRecord } from '../types/takwim';
import { DAY_NAMES_MS, MONTH_NAMES_MS, getAcademicWeekForDate, getDayStatus } from '../constants/calendar2027';
import { getCivicTuesdaySchedule } from './civicScheduleHelper';

function formatDayName(dateStr: string): string {
  try {
    const d = new Date(dateStr + 'T00:00:00');
    return DAY_NAMES_MS[d.getDay()] || '';
  } catch {
    return '';
  }
}

/**
 * Generate full self-contained printable HTML document for Takwim
 */
export function generateTakwimHTML(
  entries: TakwimEntry[],
  holidays: HolidayRecord[],
  selectedMonth: number,
  settings?: SchoolSettings
): string {
  const year = 2027;
  const monthName = MONTH_NAMES_MS[selectedMonth - 1] || 'Bulan';
  const schoolName = settings?.schoolName || 'SK Tudan, Miri';
  const schoolCode = settings?.schoolCode || 'YBB4345';
  const schoolLogo = settings?.schoolLogo || '';
  
  // Find civic value for this month
  const civicVal = settings?.civicValues?.find(c => c.month === selectedMonth);
  // Find salary date for this month
  const salaryRec = settings?.salaryDates?.find(s => s.month === selectedMonth);

  // Compute days in month
  const totalDays = new Date(year, selectedMonth, 0).getDate();
  const days: {
    dateStr: string;
    dayNum: number;
    dayOfWeek: number;
    dayName: string;
    isTuesday: boolean;
    weekInfo: ReturnType<typeof getAcademicWeekForDate>;
    statusInfo: ReturnType<typeof getDayStatus>;
  }[] = [];

  for (let d = 1; d <= totalDays; d++) {
    const dateStr = `${year}-${String(selectedMonth).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const dateObj = new Date(dateStr + 'T00:00:00');
    const dayOfWeek = dateObj.getDay();
    days.push({
      dateStr,
      dayNum: d,
      dayOfWeek,
      dayName: DAY_NAMES_MS[dayOfWeek],
      isTuesday: dayOfWeek === 2,
      weekInfo: getAcademicWeekForDate(dateStr),
      statusInfo: getDayStatus(dateStr, holidays),
    });
  }

  // Map entries by date and bidang
  const map = new Map<string, { [key in BidangType]?: TakwimEntry[] }>();
  for (const e of entries) {
    if (e.isDeleted) continue;
    const start = e.tarikhMula;
    const end = e.tarikhAkhir || start;
    for (const day of days) {
      if (day.dateStr >= start && day.dateStr <= end) {
        if (!map.has(day.dateStr)) map.set(day.dateStr, {});
        const dayObj = map.get(day.dateStr)!;
        if (!dayObj[e.bidangUtama]) dayObj[e.bidangUtama] = [];
        dayObj[e.bidangUtama]!.push(e);
      }
    }
  }

  const reviewers = settings?.adminReviewers || {
    guruBesar: 'Guru Besar',
    pk1: 'Penolong Kanan Pentadbiran',
    pkHem: 'Penolong Kanan HEM',
    pkKk: 'Penolong Kanan Kokurikulum',
    pkPetang: 'Penyelia Petang',
  };

  const rowsHTML = days.map(day => {
    const isWeekend = day.dayOfWeek === 0 || day.dayOfWeek === 6;
    const isHoliday = day.statusInfo.isHoliday || day.statusInfo.isSchoolHoliday;
    const dayMap = map.get(day.dateStr) || {};
    const isSalaryDay = salaryRec && salaryRec.date === day.dateStr;

    let rowStyle = '';
    if (isHoliday) rowStyle = 'background-color: #f1f5f9;';
    else if (isWeekend) rowStyle = 'background-color: #f8fafc;';
    else if (day.isTuesday) rowStyle = 'background-color: #eff6ff;';

    const renderCell = (bidang: BidangType) => {
      const list = dayMap[bidang] || [];
      const showAssembly = bidang === 'Pengurusan dan Staf' && day.isTuesday && day.statusInfo.isPdPDay;

      let html = '';
      if (showAssembly) {
        html += `
          <div style="background-color: #f3e8ff; border-left: 3px solid #7e22ce; padding: 4px; margin-bottom: 4px; font-size: 10px; border-radius: 3px;">
            <strong style="color: #581c87;">Perhimpunan Rasmi Dwisesi</strong><br/>
            <span style="color: #6b21a8;">Pagi: 07:00-07:30 | Petang: 12:40-01:10</span>
          </div>
        `;
      }

      list.forEach(item => {
        html += `
          <div style="background-color: #ffffff; border: 1px solid #cbd5e1; padding: 4px; margin-bottom: 3px; font-size: 10.5px; border-radius: 3px;">
            <strong>${item.tajuk}</strong><br/>
            <span style="font-size: 9.5px; color: #475569;">
              ${item.sepanjangHari ? 'Sepanjang Hari' : `${item.masaMula} - ${item.masaAkhir}`} · ${item.unitUtama || ''} ${item.penyelaras ? `(${item.penyelaras})` : ''}
            </span>
          </div>
        `;
      });
      return html;
    };

    return `
      <tr style="${rowStyle}">
        <td style="border: 1px solid #cbd5e1; padding: 5px; vertical-align: top; font-weight: bold; white-space: nowrap;">
          ${day.dateStr.slice(8)}/${day.dateStr.slice(5, 7)}<br/>
          <span style="font-size: 10px; color: ${day.isTuesday ? '#1d4ed8' : isWeekend ? '#dc2626' : '#334155'}; font-weight: normal;">
            ${day.dayName}
          </span>
          ${isSalaryDay ? '<br/><span style="display:inline-block; background-color:#dcfce7; color:#15803d; border:1px solid #86efac; border-radius:3px; padding:1px 3px; font-size:9px; font-weight:bold; margin-top:2px;">💰 GAJI</span>' : ''}
        </td>
        <td style="border: 1px solid #cbd5e1; padding: 5px; vertical-align: top; text-align: center; font-weight: bold; color: #1d4ed8;">
          ${day.weekInfo.code !== 'Tiada Slot' ? day.weekInfo.code : '-'}
        </td>
        <td style="border: 1px solid #cbd5e1; padding: 5px; vertical-align: top; font-size: 10px;">
          <strong>${day.statusInfo.statusLabel}</strong>
          ${day.statusInfo.reason ? `<br/><span style="color: #64748b;">${day.statusInfo.reason}</span>` : ''}
        </td>
        <td style="border: 1px solid #cbd5e1; padding: 4px; vertical-align: top;">${renderCell('Pengurusan dan Staf')}</td>
        <td style="border: 1px solid #cbd5e1; padding: 4px; vertical-align: top;">${renderCell('Kurikulum')}</td>
        <td style="border: 1px solid #cbd5e1; padding: 4px; vertical-align: top;">${renderCell('Hal Ehwal Murid')}</td>
        <td style="border: 1px solid #cbd5e1; padding: 4px; vertical-align: top;">${renderCell('Kokurikulum')}</td>
        <td style="border: 1px solid #cbd5e1; padding: 4px; vertical-align: top;">${renderCell('Panitia Mata Pelajaran')}</td>
      </tr>
    `;
  }).join('');

  return `<!DOCTYPE html>
<html lang="ms">
<head>
  <meta charset="UTF-8">
  <title>Takwim Persekolahan ${year} - ${monthName} (${schoolName})</title>
  <style>
    @page {
      size: A4 landscape;
      margin: 8mm;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      margin: 0;
      padding: 10px;
      color: #0f172a;
      background: #ffffff;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .header-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 8px;
      border-bottom: 2px solid #1e3a8a;
      padding-bottom: 6px;
    }
    .header-logo {
      width: 55px;
      height: 55px;
      object-fit: contain;
    }
    .title-main {
      font-size: 15px;
      font-weight: 800;
      color: #1e3a8a;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin: 0;
    }
    .title-sub {
      font-size: 12px;
      font-weight: 600;
      color: #334155;
      margin: 2px 0 0 0;
    }
    .civic-banner {
      background-color: #f0fdf4;
      border: 1px solid #bbf7d0;
      border-radius: 4px;
      padding: 4px 8px;
      margin-bottom: 8px;
      font-size: 11px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .main-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 11px;
    }
    .main-table th {
      background-color: #1e3a8a;
      color: #ffffff;
      border: 1px solid #0f172a;
      padding: 6px 4px;
      text-align: left;
      font-size: 11px;
      font-weight: bold;
    }
    .signatures-section {
      margin-top: 15px;
      width: 100%;
      border-collapse: collapse;
      page-break-inside: avoid;
    }
    .sig-box {
      border: 1px dashed #94a3b8;
      border-radius: 4px;
      padding: 8px;
      font-size: 10px;
      text-align: center;
      background-color: #fafafa;
    }
    .sig-line {
      margin-top: 35px;
      border-top: 1px solid #000000;
      padding-top: 2px;
      font-weight: bold;
    }
    @media print {
      body { padding: 0; }
      .no-print { display: none !important; }
      table { page-break-inside: auto; }
      tr { page-break-inside: avoid; page-break-after: auto; }
      thead { display: table-header-group; }
    }
  </style>
</head>
<body>
  <!-- School Header -->
  <table class="header-table">
    <tr>
      ${schoolLogo ? `<td style="width: 60px; vertical-align: middle;"><img src="${schoolLogo}" class="header-logo" alt="Logo" /></td>` : ''}
      <td style="vertical-align: middle; padding-left: 8px;">
        <h1 class="title-main">${schoolName} (${schoolCode})</h1>
        <div class="title-sub">TAKWIM PENGURUSAN DAN TAKWIM PERSEKOLAHAN TAHUN ${year} · BULAN ${monthName.toUpperCase()}</div>
        <div style="font-size: 10px; color: #64748b;">Setiap Hari Selasa: Perhimpunan Dwisesi Rasmi (Sesi Pagi: 07:00 - 07:30 | Sesi Petang: 12:40 - 01:10)</div>
      </td>
      <td style="text-align: right; vertical-align: middle; font-size: 10px; color: #475569;">
        <div>Tarikh Cetakan: <strong>${new Date().toLocaleDateString('ms-MY')}</strong></div>
        <div>Status Dokumen: <strong>RASMI & DISAHKAN</strong></div>
      </td>
    </tr>
  </table>

  <!-- Civic Value & Salary schedule info bar -->
  <div class="civic-banner">
    <div>
      <strong>Nilai Sivik KPM Bulan Ini:</strong> <span style="color: #166534; font-weight: bold;">${civicVal ? `${civicVal.coreValue} (${civicVal.subTheme})` : 'Penerapan Sivik Sepanjang Hayat'}</span>
    </div>
    <div>
      ${salaryRec ? `<strong>Jadual Gaji:</strong> <span style="color: #15803d; font-weight: bold;">${salaryRec.date} (${salaryRec.dayName})</span>` : ''}
    </div>
  </div>

  <!-- Multi Column Table -->
  <table class="main-table">
    <thead>
      <tr>
        <th style="width: 60px;">Tarikh / Hari</th>
        <th style="width: 45px; text-align: center;">Minggu</th>
        <th style="width: 80px;">Status / Cuti</th>
        <th style="width: 17%;">Pengurusan & Staf</th>
        <th style="width: 17%;">Kurikulum</th>
        <th style="width: 17%;">Hal Ehwal Murid (HEM)</th>
        <th style="width: 17%;">Kokurikulum</th>
        <th style="width: 18%;">Panitia Mata Pelajaran</th>
      </tr>
    </thead>
    <tbody>
      ${rowsHTML}
    </tbody>
  </table>

  <!-- Administrator Approval & Verification Section (5 Portfolios) -->
  <table class="signatures-section">
    <tr>
      <td style="width: 20%; padding: 4px;">
        <div class="sig-box">
          <div>Disediakan Oleh:</div>
          <div class="sig-line">Guru Penyelaras Takwim</div>
          <div>SK Tudan, Miri</div>
        </div>
      </td>
      <td style="width: 20%; padding: 4px;">
        <div class="sig-box">
          <div>Disemak Oleh (Pentadbiran/Kurikulum):</div>
          <div class="sig-line">${reviewers.pk1 || 'PK Pentadbiran'}</div>
          <div>Penolong Kanan Pentadbiran</div>
        </div>
      </td>
      <td style="width: 20%; padding: 4px;">
        <div class="sig-box">
          <div>Disemak Oleh (HEM):</div>
          <div class="sig-line">${reviewers.pkHem || 'PK HEM'}</div>
          <div>Penolong Kanan HEM</div>
        </div>
      </td>
      <td style="width: 20%; padding: 4px;">
        <div class="sig-box">
          <div>Disemak Oleh (Kokurikulum & Petang):</div>
          <div class="sig-line">${reviewers.pkKk || 'PK Kokurikulum'}</div>
          <div>PK Kokurikulum / ${reviewers.pkPetang || 'PK Petang'}</div>
        </div>
      </td>
      <td style="width: 20%; padding: 4px;">
        <div class="sig-box" style="border: 1.5px solid #1e3a8a; background-color: #eff6ff;">
          <div style="font-weight: bold; color: #1e3a8a;">Disahkan & Diluluskan Oleh:</div>
          <div class="sig-line" style="color: #1e3a8a;">${reviewers.guruBesar || 'Guru Besar'}</div>
          <div style="font-weight: bold;">Guru Besar SK Tudan</div>
        </div>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/**
 * Print Takwim using dedicated hidden iframe for foolproof multi-device printing
 */
export function printTakwimDocument(
  entries: TakwimEntry[],
  holidays: HolidayRecord[],
  selectedMonth: number,
  settings?: SchoolSettings
) {
  const html = generateTakwimHTML(entries, holidays, selectedMonth, settings);

  // Setup direct DOM print portal (works reliably across desktop, mobile and embedded frames)
  let portal = document.getElementById('takwim-direct-print-portal');
  if (!portal) {
    portal = document.createElement('div');
    portal.id = 'takwim-direct-print-portal';
    document.body.appendChild(portal);
  }

  let styleEl = document.getElementById('takwim-print-portal-style') as HTMLStyleElement;
  if (!styleEl) {
    styleEl = document.createElement('style');
    styleEl.id = 'takwim-print-portal-style';
    styleEl.innerHTML = `
      @media screen {
        #takwim-direct-print-portal {
          display: none !important;
        }
      }
      @media print {
        @page {
          size: A4 landscape;
          margin: 6mm 6mm 6mm 6mm;
        }
        html, body {
          margin: 0 !important;
          padding: 0 !important;
          background: #ffffff !important;
          color: #000000 !important;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        body > *:not(#takwim-direct-print-portal) {
          display: none !important;
        }
        #takwim-direct-print-portal {
          display: block !important;
          position: static !important;
          width: 100% !important;
          margin: 0 !important;
          padding: 0 !important;
        }
      }
    `;
    document.head.appendChild(styleEl);
  }

  // Extract body and inner CSS
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
  const bodyContent = bodyMatch ? bodyMatch[1] : html;
  const styleMatch = html.match(/<style[^>]*>([\s\S]*)<\/style>/i);
  const innerCss = styleMatch ? `<style>${styleMatch[1]}</style>` : '';

  portal.innerHTML = innerCss + bodyContent;

  setTimeout(() => {
    try {
      window.print();
    } catch (err) {
      console.warn('Window print blocked, falling back to download printable HTML file', err);
      downloadPrintableHTML(entries, holidays, selectedMonth, settings);
    }
  }, 150);
}

/**
 * Download Standalone Printable HTML file for offline viewing and zero-hassle printing
 */
export function downloadPrintableHTML(
  entries: TakwimEntry[],
  holidays: HolidayRecord[],
  selectedMonth: number,
  settings?: SchoolSettings
) {
  const monthName = MONTH_NAMES_MS[selectedMonth - 1] || 'Bulan';
  const html = generateTakwimHTML(entries, holidays, selectedMonth, settings);
  const blob = new Blob([html], { type: 'text/html;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `Takwim_SK_Tudan_2027_${monthName}_Bercetak.html`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export Multi-Column Takwim to Authentic Excel (.xlsx) file
 */
export function exportMultiColumnExcel(
  entries: TakwimEntry[],
  holidays: HolidayRecord[],
  selectedMonth: number,
  settings?: SchoolSettings
) {
  const year = 2027;
  const monthName = MONTH_NAMES_MS[selectedMonth - 1] || 'Bulan';
  const schoolName = settings?.schoolName || 'SK Tudan, Miri';
  const salaryRec = settings?.salaryDates?.find(s => s.month === selectedMonth);
  const civicVal = settings?.civicValues?.find(c => c.month === selectedMonth);

  const totalDays = new Date(year, selectedMonth, 0).getDate();
  const rows: any[] = [];

  for (let d = 1; d <= totalDays; d++) {
    const dateStr = `${year}-${String(selectedMonth).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const dateObj = new Date(dateStr + 'T00:00:00');
    const dayOfWeek = dateObj.getDay();
    const isTuesday = dayOfWeek === 2;
    const weekInfo = getAcademicWeekForDate(dateStr);
    const statusInfo = getDayStatus(dateStr, holidays);
    const isSalaryDay = salaryRec && salaryRec.date === dateStr;

    // Filter entries on this date
    const dayEntries = entries.filter(
      (e) => !e.isDeleted && e.tarikhMula <= dateStr && (e.tarikhAkhir || e.tarikhMula) >= dateStr
    );

    const getBidangText = (b: BidangType) => {
      const list = dayEntries.filter((e) => e.bidangUtama === b);
      const parts: string[] = [];

      if (b === 'Pengurusan dan Staf' && isTuesday && statusInfo.isPdPDay) {
        parts.push('★ PERHIMPUNAN RASMI (Pagi 07:00-07:30 | Petang 12:40-01:10)');
      }

      list.forEach((e) => {
        parts.push(
          `${e.tajuk} [${e.sepanjangHari ? 'Sepanjang Hari' : `${e.masaMula}-${e.masaAkhir}`}] (${e.unitUtama}) - Penyelaras: ${e.penyelaras}`
        );
      });

      return parts.join('\n');
    };

    let statusCol = statusInfo.statusLabel;
    if (statusInfo.reason) statusCol += ` - ${statusInfo.reason}`;
    if (isSalaryDay) statusCol += ` [💰 GAJI PENJAWAT AWAM: ${salaryRec?.note || ''}]`;

    rows.push({
      'Tarikh': `${String(d).padStart(2, '0')}/${String(selectedMonth).padStart(2, '0')}/${year}`,
      'Hari': DAY_NAMES_MS[dayOfWeek],
      'Minggu PdP': weekInfo.code !== 'Tiada Slot' ? weekInfo.code : '-',
      'Status / Cuti': statusCol,
      'Pengurusan dan Staf': getBidangText('Pengurusan dan Staf'),
      'Kurikulum': getBidangText('Kurikulum'),
      'Hal Ehwal Murid (HEM)': getBidangText('Hal Ehwal Murid'),
      'Kokurikulum': getBidangText('Kokurikulum'),
      'Panitia Mata Pelajaran': getBidangText('Panitia Mata Pelajaran'),
    });
  }

  const worksheet = XLSX.utils.json_to_sheet(rows);
  worksheet['!cols'] = [
    { wch: 12 }, // Tarikh
    { wch: 10 }, // Hari
    { wch: 12 }, // Minggu PdP
    { wch: 28 }, // Status / Cuti
    { wch: 35 }, // Pengurusan
    { wch: 35 }, // Kurikulum
    { wch: 35 }, // HEM
    { wch: 35 }, // Koko
    { wch: 35 }, // Panitia
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, `Takwim_${monthName}_2027`);

  const filename = `Takwim_${schoolName.replace(/[^a-zA-Z0-9]/g, '_')}_2027_${monthName}.xlsx`;
  XLSX.writeFile(workbook, filename);
}

/**
 * Export filtered Takwim data to authentic Excel (.xlsx) file
 */
export function exportTakwimToExcel(entries: TakwimEntry[], sheetTitle: string = 'Takwim SK Tudan 2027') {
  const rows = entries.map((e, index) => ({
    'Bil': index + 1,
    'Tarikh Mula': e.tarikhMula,
    'Tarikh Akhir': e.tarikhAkhir !== e.tarikhMula ? e.tarikhAkhir : '',
    'Hari': formatDayName(e.tarikhMula),
    'Minggu PdP': e.mingguAkademik,
    'Masa': e.sepanjangHari ? 'Sepanjang Hari' : `${e.masaMula} - ${e.masaAkhir}`,
    'Nama Program / Aktiviti': e.tajuk,
    'Bidang Utama': e.bidangUtama,
    'Unit / Panitia': e.unitUtama + (e.unitBersama?.length ? ` (Bersama: ${e.unitBersama.join(', ')})` : ''),
    'Jenis': e.jenisPengisian,
    'Tempat': e.tempat,
    'Penyelaras': e.penyelaras,
    'Status Kelulusan': e.statusKelulusan,
    'Status Pelaksanaan': e.statusPelaksanaan,
    'Catatan': e.catatan || '',
  }));

  const worksheet = XLSX.utils.json_to_sheet(rows);
  worksheet['!cols'] = [
    { wch: 5 },  // Bil
    { wch: 12 }, // Tarikh Mula
    { wch: 12 }, // Tarikh Akhir
    { wch: 10 }, // Hari
    { wch: 12 }, // Minggu PdP
    { wch: 16 }, // Masa
    { wch: 40 }, // Nama Program
    { wch: 22 }, // Bidang Utama
    { wch: 26 }, // Unit
    { wch: 14 }, // Jenis
    { wch: 22 }, // Tempat
    { wch: 25 }, // Penyelaras
    { wch: 16 }, // Status Kelulusan
    { wch: 18 }, // Status Pelaksanaan
    { wch: 28 }, // Catatan
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Takwim 2027');

  const filename = `Takwim_SK_Tudan_2027_${sheetTitle.replace(/[^a-zA-Z0-9]/g, '_')}.xlsx`;
  XLSX.writeFile(workbook, filename);
}

/**
 * Export data to standard CSV with UTF-8 BOM
 */
export function exportTakwimToCSV(entries: TakwimEntry[], filename: string = 'takwim_sk_tudan_2027.csv') {
  const headers = [
    'Bil',
    'Tarikh Mula',
    'Tarikh Akhir',
    'Hari',
    'Minggu PdP',
    'Masa Mula',
    'Masa Akhir',
    'Program / Aktiviti',
    'Bidang',
    'Unit / Panitia',
    'Tempat',
    'Penyelaras',
    'Kelulusan',
    'Pelaksanaan',
    'Catatan'
  ];

  const csvRows = [headers.map(h => `"${h}"`).join(',')];

  entries.forEach((e, i) => {
    const row = [
      i + 1,
      e.tarikhMula,
      e.tarikhAkhir || e.tarikhMula,
      formatDayName(e.tarikhMula),
      e.mingguAkademik,
      e.masaMula,
      e.masaAkhir,
      `"${(e.tajuk || '').replace(/"/g, '""')}"`,
      `"${(e.bidangUtama || '').replace(/"/g, '""')}"`,
      `"${(e.unitUtama || '').replace(/"/g, '""')}"`,
      `"${(e.tempat || '').replace(/"/g, '""')}"`,
      `"${(e.penyelaras || '').replace(/"/g, '""')}"`,
      e.statusKelulusan,
      e.statusPelaksanaan,
      `"${(e.catatan || '').replace(/"/g, '""')}"`
    ];
    csvRows.push(row.join(','));
  });

  const csvContent = '\uFEFF' + csvRows.join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export approved programs to iCalendar (.ics) format
 */
export function exportTakwimToICS(entries: TakwimEntry[]) {
  const approvedOnly = entries.filter(e => e.statusKelulusan === 'Diluluskan');
  if (approvedOnly.length === 0) {
    alert('Tiada program berstatus "Diluluskan" untuk dieksport ke kalendar.');
    return;
  }

  const formatICSDate = (dateStr: string, timeStr?: string) => {
    const [y, m, d] = dateStr.split('-');
    if (!timeStr) return `${y}${m}${d}`;
    const [hh, mm] = timeStr.split(':');
    return `${y}${m}${d}T${hh}${mm}00`;
  };

  const icsEvents = approvedOnly.map(e => {
    const uid = `${e.id}@sktudan.edu.my`;
    const dtStamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    let dtStart = '';
    let dtEnd = '';

    if (e.sepanjangHari) {
      dtStart = `VALUE=DATE:${formatICSDate(e.tarikhMula)}`;
      const endD = new Date((e.tarikhAkhir || e.tarikhMula) + 'T00:00:00');
      endD.setDate(endD.getDate() + 1);
      const nextDayStr = endD.toISOString().split('T')[0];
      dtEnd = `VALUE=DATE:${formatICSDate(nextDayStr)}`;
    } else {
      dtStart = `TZID=Asia/Kuala_Lumpur:${formatICSDate(e.tarikhMula, e.masaMula)}`;
      dtEnd = `TZID=Asia/Kuala_Lumpur:${formatICSDate(e.tarikhAkhir || e.tarikhMula, e.masaAkhir)}`;
    }

    const summary = e.tajuk.replace(/,/g, '\\,');
    const description = `Penyelaras: ${e.penyelaras}\\nUnit: ${e.unitUtama}\\nBidang: ${e.bidangUtama}\\nMinggu: ${e.mingguAkademik}`.replace(/,/g, '\\,');
    const location = (e.tempat || 'SK Tudan').replace(/,/g, '\\,');

    return [
      'BEGIN:VEVENT',
      `UID:${uid}`,
      `DTSTAMP:${dtStamp}`,
      `DTSTART;${dtStart}`,
      `DTEND;${dtEnd}`,
      `SUMMARY:${summary}`,
      `DESCRIPTION:${description}`,
      `LOCATION:${location}`,
      'STATUS:CONFIRMED',
      'END:VEVENT',
    ].join('\r\n');
  });

  const icsBody = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//SK Tudan Miri//e-Takwim 2027//MS',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:e-Takwim SK Tudan 2027',
    'X-WR-TIMEZONE:Asia/Kuala_Lumpur',
    ...icsEvents,
    'END:VCALENDAR',
  ].join('\r\n');

  const blob = new Blob([icsBody], { type: 'text/calendar;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', 'takwim_sk_tudan_2027.ics');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Legacy alias for backwards compatibility
 */
export function printTakwim() {
  window.print();
}

/**
 * Export Weekly Civic Values & 5-Minute Activities Schedule to Excel (.xlsx)
 * Diselaraskan mengikut setiap hari Selasa Takwim 2027.
 * Peraturan Khas: Subtema TIDAK di-carry forward sekiranya hari Selasa adalah cuti umum atau cuti sekolah.
 */
export function exportCivicScheduleToExcel(
  civicValues: CivicValueRecord[],
  settings?: SchoolSettings,
  holidays?: HolidayRecord[]
) {
  const schoolName = settings?.schoolName || 'SK Tudan, Miri';
  const tuesdaySlots = getCivicTuesdaySchedule(civicValues, holidays);

  const rows = tuesdaySlots.map((slot, idx) => ({
    'Bil': idx + 1,
    'Bulan': slot.monthName,
    'Minggu': `Minggu ${slot.weekIndex}`,
    'Tarikh Pelaksanaan (Selasa)': slot.tuesdayDisplay,
    'Status Pelaksanaan (Dasar Tiada Carry Forward)': slot.statusPelaksanaan,
    'Catatan Status Hari': slot.isHoliday ? `CUTI: ${slot.holidayReason} (Tidak Di-Carry Forward)` : 'HARI PERSEKOLAHAN (PdP Berjadual)',
    'Nilai Teras Sivik': slot.coreValue,
    'Sub-Tema Bulanan': `${slot.subTheme} (${slot.subNilai})`,
    'Tajuk Aktiviti 5 Minit': slot.tajukAktiviti,
    'Cadangan Aktiviti Ringkas (Panduan Guru)': slot.cadanganAktiviti5Minit,
    'Kumpulan Sasaran': slot.fokusSasaran,
  }));

  const worksheet = XLSX.utils.json_to_sheet(rows);
  worksheet['!cols'] = [
    { wch: 6 },  // Bil
    { wch: 14 }, // Bulan
    { wch: 12 }, // Minggu
    { wch: 18 }, // Tarikh Selasa
    { wch: 32 }, // Status Pelaksanaan
    { wch: 35 }, // Catatan Status Hari
    { wch: 20 }, // Nilai Teras
    { wch: 35 }, // Sub-Tema
    { wch: 30 }, // Tajuk Aktiviti
    { wch: 60 }, // Cadangan Aktiviti 5 Minit
    { wch: 25 }, // Kumpulan Sasaran
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Jadual_Sivik_Selasa_2027');

  const filename = `Jadual_Pelaksanaan_Nilai_Sivik_Selasa_SK_Tudan_2027.xlsx`;
  XLSX.writeFile(workbook, filename);
}

/**
 * Generate full self-contained printable HTML document for Weekly Civic Values with Tuesday dates
 */
export function generateCivicScheduleHTML(
  civicValues: CivicValueRecord[],
  settings?: SchoolSettings,
  holidays?: HolidayRecord[]
): string {
  const year = 2027;
  const schoolName = settings?.schoolName || 'SK Tudan, Miri';
  const schoolCode = settings?.schoolCode || 'YBB4345';
  const schoolLogo = settings?.schoolLogo || '';

  const tuesdaySlots = getCivicTuesdaySchedule(civicValues, holidays);

  const getCoreValueColor = (val: string) => {
    if (val.includes('Kasih Sayang')) return '#15803d'; // Green
    if (val.includes('Hormat')) return '#1d4ed8'; // Blue
    if (val.includes('Bertanggungjawab')) return '#b45309'; // Amber
    return '#be123c'; // Rose
  };

  const rowsHTML = tuesdaySlots.map((slot) => {
    const isCancelled = slot.isHoliday;
    const rowBg = isCancelled ? '#fff7ed' : '#ffffff';
    const statusBadge = isCancelled 
      ? `<span style="display: inline-block; padding: 2px 6px; font-size: 10px; font-weight: bold; background: #fee2e2; color: #991b1b; border: 1px solid #f87171; border-radius: 4px;">DIBATALKAN: CUTI (TIADA CARRY FORWARD)</span><div style="font-size: 9.5px; color: #b45309; margin-top: 2px;">${slot.holidayReason || 'Cuti'}</div>`
      : `<span style="display: inline-block; padding: 2px 6px; font-size: 10px; font-weight: bold; background: #dcfce7; color: #166534; border: 1px solid #86efac; border-radius: 4px;">TERLAKSANA (DWISESI)</span><div style="font-size: 9.5px; color: #475569; margin-top: 2px;">Pagi: 07:00-07:30 | Petang: 12:40-01:10</div>`;

    return `
      <tr style="background-color: ${rowBg};">
        <td style="border: 1px solid #cbd5e1; padding: 6px; font-weight: bold; text-align: center; vertical-align: top;">
          ${slot.monthName}
          <div style="font-size: 10px; color: #64748b; font-weight: normal;">Bulan ${slot.month}</div>
        </td>
        <td style="border: 1px solid #cbd5e1; padding: 6px; text-align: center; font-weight: bold; vertical-align: top; color: #1e3a8a;">
          M${slot.weekIndex}
        </td>
        <td style="border: 1px solid #cbd5e1; padding: 6px; vertical-align: top;">
          <div style="font-weight: bold; color: #0f172a; font-size: 11px;">${slot.tuesdayDisplay}</div>
          <div style="margin-top: 4px;">${statusBadge}</div>
        </td>
        <td style="border: 1px solid #cbd5e1; padding: 6px; vertical-align: top; font-weight: bold; color: ${getCoreValueColor(slot.coreValue)};">
          ${slot.coreValue}
          <div style="font-size: 10px; font-weight: normal; color: #475569; margin-top: 2px;">${slot.subTheme}</div>
        </td>
        <td style="border: 1px solid #cbd5e1; padding: 6px; vertical-align: top; font-weight: bold; color: #0f172a;">
          ${slot.tajukAktiviti}
          <div style="font-size: 10px; font-weight: normal; color: #64748b;">Sub-Nilai: ${slot.subNilai}</div>
        </td>
        <td style="border: 1px solid #cbd5e1; padding: 6px; vertical-align: top; font-size: 11px; line-height: 1.4; color: #1e293b;">
          <strong>⏱ Panduan 5 Minit:</strong> ${slot.cadanganAktiviti5Minit}
          ${isCancelled ? `<div style="margin-top: 4px; padding: 4px; background: #fffbeb; border: 1px solid #fde68a; border-radius: 4px; font-size: 10px; color: #92400e;">⚠️ <em>Peringatan: Disebabkan cuti pada hari Selasa ini, aktiviti subtema ini dibatalkan dan tidak di-carry forward ke minggu berikutnya.</em></div>` : ''}
        </td>
        <td style="border: 1px solid #cbd5e1; padding: 6px; vertical-align: top; font-size: 10.5px; color: #334155;">
          ${slot.fokusSasaran || 'Semua Murid & Guru'}
        </td>
      </tr>
    `;
  }).join('');

  return `<!DOCTYPE html>
<html lang="ms">
<head>
  <meta charset="UTF-8">
  <title>Jadual Pelaksanaan Nilai Sivik & Aktiviti 5 Minit ${year} - ${schoolName}</title>
  <style>
    @page {
      size: A4 landscape;
      margin: 8mm;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      margin: 0;
      padding: 10px;
      color: #0f172a;
      background: #ffffff;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .header-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 10px;
      border-bottom: 2px solid #1e3a8a;
      padding-bottom: 6px;
    }
    .header-logo {
      width: 50px;
      height: 50px;
      object-fit: contain;
    }
    .title-main {
      font-size: 15px;
      font-weight: 800;
      color: #1e3a8a;
      text-transform: uppercase;
      margin: 0;
    }
    .title-sub {
      font-size: 12px;
      font-weight: 600;
      color: #334155;
      margin: 2px 0 0 0;
    }
    .main-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 11px;
    }
    .main-table th {
      background-color: #1e3a8a;
      color: #ffffff;
      border: 1px solid #0f172a;
      padding: 6px;
      text-align: left;
      font-size: 11px;
      font-weight: bold;
    }
    @media print {
      body { padding: 0; }
      .no-print { display: none !important; }
      table { page-break-inside: auto; }
      tr { page-break-inside: avoid; }
      thead { display: table-header-group; }
    }
  </style>
</head>
<body>
  <table class="header-table">
    <tr>
      ${schoolLogo ? `<td style="width: 55px; vertical-align: middle;"><img src="${schoolLogo}" class="header-logo" alt="Logo" /></td>` : ''}
      <td style="vertical-align: middle; padding-left: 8px;">
        <h1 class="title-main">${schoolName} (${schoolCode})</h1>
        <div class="title-sub">JADUAL PELAKSANAAN NILAI SIVIK BULANAN KPM & CADANGAN AKTIVITI 5 MINIT TAHUN ${year}</div>
        <div style="font-size: 10px; color: #64748b;">Panduan Pelaksanaan Mingguan (Perhimpunan Dwisesi Selasa / Homeroom / 5 Minit Pertama PdP)</div>
      </td>
      <td style="text-align: right; vertical-align: middle; font-size: 10px; color: #475569;">
        <div>Tarikh Cetakan: <strong>${new Date().toLocaleDateString('ms-MY')}</strong></div>
        <div>Status Dokumen: <strong>PANDUAN RASMI GURU</strong></div>
      </td>
    </tr>
  </table>

  <table class="main-table">
    <thead>
      <tr>
        <th style="width: 80px; text-align: center;">Bulan</th>
        <th style="width: 50px; text-align: center;">Minggu</th>
        <th style="width: 150px;">Nilai Teras Sivik & Sub-Tema</th>
        <th style="width: 170px;">Tajuk & Sub-Nilai</th>
        <th>Cadangan Aktiviti Ringkas 5 Minit (Panduan Guru)</th>
        <th style="width: 110px;">Sasaran</th>
      </tr>
    </thead>
    <tbody>
      ${rowsHTML}
    </tbody>
  </table>
</body>
</html>`;
}

/**
 * Download Civic Value Schedule as standalone printable HTML with Tuesday dates
 */
export function downloadCivicScheduleHTML(
  civicValues: CivicValueRecord[],
  settings?: SchoolSettings,
  holidays?: HolidayRecord[]
) {
  const html = generateCivicScheduleHTML(civicValues, settings, holidays);
  const blob = new Blob([html], { type: 'text/html;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `Jadual_Pelaksanaan_Nilai_Sivik_5Minit_SK_Tudan_2027.html`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Print Civic Schedule document via isolated iframe
 */
export function printCivicScheduleDocument(
  civicValues: CivicValueRecord[],
  settings?: SchoolSettings,
  holidays?: HolidayRecord[]
) {
  const html = generateCivicScheduleHTML(civicValues, settings, holidays);

  let portal = document.getElementById('takwim-direct-print-portal');
  if (!portal) {
    portal = document.createElement('div');
    portal.id = 'takwim-direct-print-portal';
    document.body.appendChild(portal);
  }

  let styleEl = document.getElementById('takwim-print-portal-style') as HTMLStyleElement;
  if (!styleEl) {
    styleEl = document.createElement('style');
    styleEl.id = 'takwim-print-portal-style';
    styleEl.innerHTML = `
      @media screen {
        #takwim-direct-print-portal {
          display: none !important;
        }
      }
      @media print {
        @page {
          size: A4 landscape;
          margin: 6mm 6mm 6mm 6mm;
        }
        html, body {
          margin: 0 !important;
          padding: 0 !important;
          background: #ffffff !important;
          color: #000000 !important;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        body > *:not(#takwim-direct-print-portal) {
          display: none !important;
        }
        #takwim-direct-print-portal {
          display: block !important;
          position: static !important;
          width: 100% !important;
          margin: 0 !important;
          padding: 0 !important;
        }
      }
    `;
    document.head.appendChild(styleEl);
  }

  const bodyMatch = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
  const bodyContent = bodyMatch ? bodyMatch[1] : html;
  const styleMatch = html.match(/<style[^>]*>([\s\S]*)<\/style>/i);
  const innerCss = styleMatch ? `<style>${styleMatch[1]}</style>` : '';

  portal.innerHTML = innerCss + bodyContent;

  setTimeout(() => {
    try {
      window.print();
    } catch (err) {
      console.warn('Window print blocked, falling back to download', err);
      downloadCivicScheduleHTML(civicValues, settings);
    }
  }, 150);
}

/**
 * Download sample official Takwim Excel template for bulk upload
 */
export function downloadBulkTakwimTemplate(schoolName = 'SK Tudan, Miri') {
  const templateData = [
    {
      'Tarikh Mula': '2027-01-08',
      'Tarikh Akhir': '2027-01-08',
      'Tajuk Program': 'Mesyuarat Guru & Staf Bil. 1/2027',
      'Bidang Utama': 'Pengurusan dan Staf',
      'Unit': 'Pentadbiran Sekolah',
      'Masa Mula': '08:00',
      'Masa Akhir': '12:30',
      'Tempat': 'Bilik Gerakan',
      'Penyelaras': 'Guru Besar',
      'Catatan': 'Semua guru dan AKP'
    },
    {
      'Tarikh Mula': '2027-01-11',
      'Tarikh Akhir': '2027-01-11',
      'Tajuk Program': 'Mesyuarat Kurikulum Bil. 1/2027',
      'Bidang Utama': 'Kurikulum',
      'Unit': 'Pengurusan Kurikulum',
      'Masa Mula': '08:00',
      'Masa Akhir': '11:00',
      'Tempat': 'Bilik Gerakan',
      'Penyelaras': 'PK Pentadbiran',
      'Catatan': 'Penyelarasan DSKP & RPT'
    },
    {
      'Tarikh Mula': '2027-01-12',
      'Tarikh Akhir': '2027-01-12',
      'Tajuk Program': 'Mesyuarat HEM Bil. 1/2027',
      'Bidang Utama': 'Hal Ehwal Murid',
      'Unit': 'Disiplin & Pengawas',
      'Masa Mula': '08:00',
      'Masa Akhir': '11:00',
      'Tempat': 'Bilik Wawasan',
      'Penyelaras': 'PK HEM',
      'Catatan': 'Agihan tugas kebajikan & SPBT'
    },
    {
      'Tarikh Mula': '2027-01-13',
      'Tarikh Akhir': '2027-01-13',
      'Tajuk Program': 'Mesyuarat Kokurikulum Bil. 1/2027',
      'Bidang Utama': 'Kokurikulum',
      'Unit': 'Pengurusan Kokurikulum',
      'Masa Mula': '08:00',
      'Masa Akhir': '11:00',
      'Tempat': 'Dewan Sri Tudan',
      'Penyelaras': 'PK Kokurikulum',
      'Catatan': 'Pendaftaran 1M1S & Unit Beruniform'
    },
    {
      'Tarikh Mula': '2027-01-15',
      'Tarikh Akhir': '2027-01-15',
      'Tajuk Program': 'Mesyuarat Panitia Bahasa Melayu Bil. 1/2027',
      'Bidang Utama': 'Panitia Mata Pelajaran',
      'Unit': 'Bahasa Melayu',
      'Masa Mula': '08:00',
      'Masa Akhir': '10:30',
      'Tempat': 'Bilik Mesyuarat 2',
      'Penyelaras': 'Ketua Panitia BM',
      'Catatan': 'Perancangan intervensi literasi'
    }
  ];

  const ws = XLSX.utils.json_to_sheet(templateData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Templat_Takwim');
  XLSX.writeFile(wb, `Templat_Takwim_SK_Tudan_2027.xlsx`);
}

/**
 * ============================================================================
 * OFFICIAL PDF EXPORT SUITE (JSPDF + AUTOTABLE)
 * Generates vector A4 PDF files directly downloadable on all mobile and desktop devices
 * ============================================================================
 */

/**
 * Clean title helper for PDF exports
 */
function cleanPdfTitle(title: string): string {
  if (!title) return '';
  return title
    .replace(/\[\s*bank\s*cadangan\s*takwim\s*\]/gi, '')
    .replace(/bank\s*cadangan\s*takwim\s*[:-]?/gi, '')
    .replace(/^cadangan\s*takwim\s*[:-]?/gi, '')
    .replace(/^cadangan\s*[:-]?/gi, '')
    .trim();
}

/**
 * 1. Download Official Monthly Takwim as A4 Landscape PDF
 */
export function downloadMonthlyTakwimPDF(
  entries: TakwimEntry[],
  holidays: HolidayRecord[],
  selectedMonth: number,
  settings?: SchoolSettings
) {
  const year = 2027;
  const monthName = MONTH_NAMES_MS[selectedMonth - 1] || 'Bulan';
  const schoolName = settings?.schoolName || 'SK Tudan, Miri';
  const schoolCode = settings?.schoolCode || 'YBB4345';
  const civicVal = settings?.civicValues?.find(c => c.month === selectedMonth);
  const salaryRec = settings?.salaryDates?.find(s => s.month === selectedMonth);
  const reviewers = settings?.adminReviewers || {
    guruBesar: 'Guru Besar',
    pk1: 'Penolong Kanan Pentadbiran',
    pkHem: 'Penolong Kanan HEM',
    pkKk: 'Penolong Kanan Kokurikulum',
    pkPetang: 'Penyelia Petang',
  };

  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  const totalDays = new Date(year, selectedMonth, 0).getDate();
  const days: {
    dateStr: string;
    dayNum: number;
    dayOfWeek: number;
    dayName: string;
    isTuesday: boolean;
    weekInfo: ReturnType<typeof getAcademicWeekForDate>;
    statusInfo: ReturnType<typeof getDayStatus>;
    isSalaryDay: boolean;
  }[] = [];

  for (let d = 1; d <= totalDays; d++) {
    const dateStr = `${year}-${String(selectedMonth).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const dateObj = new Date(dateStr + 'T00:00:00');
    const dayOfWeek = dateObj.getDay();
    days.push({
      dateStr,
      dayNum: d,
      dayOfWeek,
      dayName: DAY_NAMES_MS[dayOfWeek],
      isTuesday: dayOfWeek === 2,
      weekInfo: getAcademicWeekForDate(dateStr),
      statusInfo: getDayStatus(dateStr, holidays),
      isSalaryDay: salaryRec ? salaryRec.date === dateStr : false,
    });
  }

  // Map entries by date and bidang
  const map = new Map<string, { [key in BidangType]?: TakwimEntry[] }>();
  for (const e of entries) {
    if (e.isDeleted) continue;
    const start = e.tarikhMula;
    const end = e.tarikhAkhir || start;
    for (const day of days) {
      if (day.dateStr >= start && day.dateStr <= end) {
        if (!map.has(day.dateStr)) map.set(day.dateStr, {});
        const dayObj = map.get(day.dateStr)!;
        if (!dayObj[e.bidangUtama]) dayObj[e.bidangUtama] = [];
        dayObj[e.bidangUtama]!.push(e);
      }
    }
  }

  // Build table rows
  const tableRows = days.map(day => {
    const isWeekend = day.dayOfWeek === 0 || day.dayOfWeek === 6;
    const isHoliday = day.statusInfo.isHoliday || day.statusInfo.isSchoolHoliday;
    const dayMap = map.get(day.dateStr) || {};

    const formatBidangCell = (bidang: BidangType) => {
      const list = dayMap[bidang] || [];
      const parts: string[] = [];

      if (bidang === 'Pengurusan dan Staf' && day.isTuesday && day.statusInfo.isPdPDay) {
        parts.push('[Selasa] Perhimpunan Dwisesi (Pagi: 07:00-07:30 | Petang: 12:40-01:10)');
      }

      list.forEach(item => {
        const title = cleanPdfTitle(item.tajuk);
        const time = item.sepanjangHari ? 'Sepanjang Hari' : `${item.masaMula}-${item.masaAkhir}`;
        const unit = item.unitUtama ? `[${item.unitUtama}]` : '';
        const pic = item.penyelaras ? `(${item.penyelaras})` : '';
        parts.push(`• ${title} ${time} ${unit} ${pic}`.trim());
      });

      return parts.join('\n');
    };

    let dateCol = `${day.dateStr.slice(8)}/${day.dateStr.slice(5, 7)}\n${day.dayName}`;
    if (day.isSalaryDay) dateCol += '\n[GAJI]';

    let statusCol = day.statusInfo.statusLabel;
    if (day.statusInfo.reason) statusCol += `\n${day.statusInfo.reason}`;

    return [
      dateCol,
      day.weekInfo.code !== 'Tiada Slot' ? day.weekInfo.code : '-',
      statusCol,
      formatBidangCell('Pengurusan dan Staf'),
      formatBidangCell('Kurikulum'),
      formatBidangCell('Hal Ehwal Murid'),
      formatBidangCell('Kokurikulum'),
      formatBidangCell('Panitia Mata Pelajaran'),
    ];
  });

  // Header Banner
  doc.setFillColor(30, 58, 138); // Navy Blue
  doc.rect(10, 8, 277, 18, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(255, 255, 255);
  doc.text(`${schoolName.toUpperCase()} (${schoolCode})`, 14, 15);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(224, 231, 255);
  doc.text(`TAKWIM PENGURUSAN DAN PERSEKOLAHAN TAHUN 2027 · BULAN ${monthName.toUpperCase()}`, 14, 21);
  doc.text('Setiap Hari Selasa: Perhimpunan Dwisesi Rasmi (Sesi Pagi: 07:00-07:30 | Sesi Petang: 12:40-01:10)', 14, 24.5);

  doc.setFontSize(7.5);
  doc.text(`Tarikh Cetak: ${new Date().toLocaleDateString('ms-MY')} | Status: RASMI & DISAHKAN`, 220, 15);

  // Subheader: Civic & Salary
  doc.setFillColor(240, 253, 244);
  doc.setDrawColor(187, 247, 208);
  doc.rect(10, 27.5, 277, 6, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(22, 101, 52);
  const civicText = civicVal ? `Nilai Sivik KPM Bulan Ini: ${civicVal.coreValue} (${civicVal.subTheme})` : 'Nilai Sivik: Amalan Sivik Sepanjang Sesi';
  const salaryText = salaryRec ? `Jadual Pembayaran Gaji: ${salaryRec.date} (${salaryRec.dayName})` : '';
  doc.text(civicText, 14, 31.5);
  if (salaryText) {
    doc.text(salaryText, 220, 31.5);
  }

  // Render Table
  autoTable(doc, {
    startY: 35,
    head: [[
      'Tarikh/Hari',
      'Minggu',
      'Status / Cuti',
      'Pengurusan & Staf',
      'Kurikulum',
      'Hal Ehwal Murid (HEM)',
      'Kokurikulum',
      'Panitia Mata Pelajaran'
    ]],
    body: tableRows,
    theme: 'grid',
    styles: {
      font: 'helvetica',
      fontSize: 6.8,
      cellPadding: 1.5,
      lineColor: [203, 213, 225],
      lineWidth: 0.15,
      overflow: 'linebreak',
      valign: 'top',
    },
    headStyles: {
      fillColor: [30, 58, 138],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 7.2,
      halign: 'left',
    },
    columnStyles: {
      0: { cellWidth: 16, fontStyle: 'bold' },
      1: { cellWidth: 12, halign: 'center', fontStyle: 'bold', textColor: [29, 78, 216] },
      2: { cellWidth: 22 },
      3: { cellWidth: 45 },
      4: { cellWidth: 45 },
      5: { cellWidth: 45 },
      6: { cellWidth: 45 },
      7: { cellWidth: 47 },
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    didDrawPage: (data) => {
      // Footer page count
      const pageStr = `Halaman ${data.pageNumber}`;
      doc.setFontSize(7);
      doc.setTextColor(148, 163, 184);
      doc.text(pageStr, 280, 205, { align: 'right' });
      doc.text(`e-Takwim SK Tudan 2027 (${schoolCode})`, 10, 205);
    }
  });

  // Verification & Signatures section at the bottom
  const finalY = (doc as any).lastAutoTable?.finalY || 160;
  if (finalY < 170) {
    const sigY = Math.max(finalY + 6, 175);
    const boxW = 53;
    const boxH = 22;
    const startX = 10;
    const gap = 3;

    const sigs = [
      { role: 'Disediakan Oleh:', name: 'Guru Penyelaras Takwim', title: 'SK Tudan, Miri' },
      { role: 'Disemak (Pentadbiran):', name: reviewers.pk1 || 'PK Pentadbiran', title: 'Penolong Kanan Pentadbiran' },
      { role: 'Disemak (HEM):', name: reviewers.pkHem || 'PK HEM', title: 'Penolong Kanan HEM' },
      { role: 'Disemak (Kokurikulum):', name: reviewers.pkKk || 'PK Kokurikulum', title: 'PK Kokurikulum / Petang' },
      { role: 'Disahkan & Diluluskan:', name: reviewers.guruBesar || 'Guru Besar', title: 'Guru Besar SK Tudan' },
    ];

    sigs.forEach((s, idx) => {
      const bx = startX + idx * (boxW + gap);
      doc.setFillColor(idx === 4 ? 239 : 250, idx === 4 ? 246 : 250, idx === 4 ? 255 : 250);
      doc.setDrawColor(idx === 4 ? 30 : 203, idx === 4 ? 58 : 213, idx === 4 ? 138 : 225);
      doc.rect(bx, sigY, boxW, boxH, 'FD');

      doc.setFont('helvetica', idx === 4 ? 'bold' : 'normal');
      doc.setFontSize(6.5);
      doc.setTextColor(idx === 4 ? 30 : 71, idx === 4 ? 58 : 85, idx === 4 ? 138 : 105);
      doc.text(s.role, bx + 2, sigY + 4);

      // Signature line
      doc.line(bx + 3, sigY + 16, bx + boxW - 3, sigY + 16);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(6.5);
      doc.setTextColor(15, 23, 42);
      doc.text(s.name, bx + 2, sigY + 19);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(5.5);
      doc.setTextColor(100, 116, 139);
      doc.text(s.title, bx + 2, sigY + 21);
    });
  }

  doc.save(`Takwim_SK_Tudan_2027_${monthName}.pdf`);
}

/**
 * 2. Download Takwim Mengikut Panitia Mata Pelajaran as Dedicated PDF
 */
export function downloadPanitiaTakwimPDF(
  entries: TakwimEntry[],
  panitiaName: string,
  settings?: SchoolSettings,
  holidays?: HolidayRecord[]
) {
  const schoolName = settings?.schoolName || 'SK Tudan, Miri';
  const schoolCode = settings?.schoolCode || 'YBB4345';
  const reviewers = settings?.adminReviewers || {
    guruBesar: 'Guru Besar',
    pk1: 'Penolong Kanan Pentadbiran',
    pkHem: 'Penolong Kanan HEM',
    pkKk: 'Penolong Kanan Kokurikulum',
    pkPetang: 'Penyelia Petang',
  };

  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  const panitiaLower = panitiaName.toLowerCase();
  const panitiaEntries = entries.filter(e => {
    if (e.isDeleted) return false;
    const unitMatch = (e.unitUtama || '').toLowerCase().includes(panitiaLower);
    const titleMatch = (e.tajuk || '').toLowerCase().includes(panitiaLower);
    return unitMatch || (e.bidangUtama === 'Panitia Mata Pelajaran' && titleMatch);
  }).sort((a, b) => a.tarikhMula.localeCompare(b.tarikhMula));

  // Header Banner
  doc.setFillColor(13, 148, 136); // Teal
  doc.rect(10, 8, 277, 18, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(255, 255, 255);
  doc.text(`${schoolName.toUpperCase()} (${schoolCode})`, 14, 15);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(204, 251, 241);
  doc.text(`TAKWIM PENGURUSAN DAN PERSEKOLAHAN PANITIA ${panitiaName.toUpperCase()} 2027`, 14, 21);
  doc.text('Perancangan Mesyuarat Panitia, Kit PLC KPM, Moderasi PBD & Program Peningkatan Akademik', 14, 24.5);

  doc.setFontSize(8);
  doc.text(`Jumlah Program: ${panitiaEntries.length} | Tarikh Cetak: ${new Date().toLocaleDateString('ms-MY')}`, 215, 15);

  const rows = panitiaEntries.map((e, idx) => {
    const title = cleanPdfTitle(e.tajuk);
    const mNum = e.bulan || (new Date(e.tarikhMula + 'T00:00:00').getMonth() + 1);
    const mName = MONTH_NAMES_MS[mNum - 1] || '';
    const dayName = formatDayName(e.tarikhMula);
    const time = e.sepanjangHari ? 'Sepanjang Hari' : `${e.masaMula} - ${e.masaAkhir}`;

    return [
      (idx + 1).toString(),
      `${e.tarikhMula}\n(${dayName})`,
      mName,
      e.mingguAkademik || '-',
      e.jenisPengisian,
      title,
      e.tempat || 'Bilik Mesyuarat',
      time,
      e.penyelaras || `Ketua Panitia ${panitiaName}`,
      e.statusKelulusan,
    ];
  });

  autoTable(doc, {
    startY: 30,
    head: [[
      'Bil',
      'Tarikh (Hari)',
      'Bulan',
      'Minggu',
      'Jenis',
      'Tajuk Program / Aktiviti / Mesyuarat',
      'Tempat',
      'Masa',
      'Penyelaras',
      'Status'
    ]],
    body: rows.length > 0 ? rows : [['-', '-', '-', '-', '-', `Tiada rekod program khusus didaftarkan untuk Panitia ${panitiaName}. Sila klik Tambah Program.`, '-', '-', '-', '-']],
    theme: 'grid',
    styles: {
      font: 'helvetica',
      fontSize: 7.5,
      cellPadding: 2,
      lineColor: [203, 213, 225],
      lineWidth: 0.15,
      valign: 'top',
    },
    headStyles: {
      fillColor: [13, 148, 136],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8,
    },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      1: { cellWidth: 22, fontStyle: 'bold' },
      2: { cellWidth: 16 },
      3: { cellWidth: 14, halign: 'center', fontStyle: 'bold' },
      4: { cellWidth: 20 },
      5: { cellWidth: 85, fontStyle: 'bold' },
      6: { cellWidth: 28 },
      7: { cellWidth: 24 },
      8: { cellWidth: 38 },
      9: { cellWidth: 20, halign: 'center' },
    },
    alternateRowStyles: {
      fillColor: [240, 253, 250],
    },
    didDrawPage: (data) => {
      doc.setFontSize(7.5);
      doc.setTextColor(148, 163, 184);
      doc.text(`Dokumen Rasmi Panitia ${panitiaName} · Halaman ${data.pageNumber}`, 280, 205, { align: 'right' });
    }
  });

  // Signatures
  const finalY = (doc as any).lastAutoTable?.finalY || 150;
  if (finalY < 170) {
    const sigY = Math.max(finalY + 8, 175);
    const boxW = 85;
    const boxH = 22;

    const sigs = [
      { role: 'Disediakan Oleh:', name: `Ketua Panitia ${panitiaName}`, title: `Panitia ${panitiaName} SK Tudan` },
      { role: 'Disemak & Disahkan Oleh:', name: reviewers.pk1 || 'Penolong Kanan Pentadbiran', title: 'Penolong Kanan Pentadbiran SK Tudan' },
      { role: 'Diluluskan Oleh:', name: reviewers.guruBesar || 'Guru Besar', title: 'Guru Besar SK Tudan' },
    ];

    sigs.forEach((s, idx) => {
      const bx = 10 + idx * (boxW + 11);
      doc.setFillColor(250, 250, 250);
      doc.setDrawColor(203, 213, 225);
      doc.rect(bx, sigY, boxW, boxH, 'FD');

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(71, 85, 105);
      doc.text(s.role, bx + 3, sigY + 4);

      doc.line(bx + 3, sigY + 16, bx + boxW - 3, sigY + 16);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(15, 23, 42);
      doc.text(s.name, bx + 3, sigY + 19);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6);
      doc.setTextColor(100, 116, 139);
      doc.text(s.title, bx + 3, sigY + 21);
    });
  }

  doc.save(`Takwim_Panitia_${panitiaName.replace(/\s+/g, '_')}_2027.pdf`);
}

/**
 * 3. Download Takwim Mengikut Bidang (Kurikulum / HEM / Kokurikulum / Pentadbiran)
 */
export function downloadBidangTakwimPDF(
  entries: TakwimEntry[],
  bidang: BidangType,
  settings?: SchoolSettings,
  holidays?: HolidayRecord[]
) {
  const schoolName = settings?.schoolName || 'SK Tudan, Miri';
  const schoolCode = settings?.schoolCode || 'YBB4345';
  const reviewers = settings?.adminReviewers || {
    guruBesar: 'Guru Besar',
    pk1: 'Penolong Kanan Pentadbiran',
    pkHem: 'Penolong Kanan HEM',
    pkKk: 'Penolong Kanan Kokurikulum',
    pkPetang: 'Penyelia Petang',
  };

  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  const filtered = entries.filter(e => !e.isDeleted && e.bidangUtama === bidang)
    .sort((a, b) => a.tarikhMula.localeCompare(b.tarikhMula));

  // Determine header color
  let headerColor = [30, 58, 138];
  let reviewerName = reviewers.pk1;
  let reviewerTitle = 'Penolong Kanan Pentadbiran';

  if (bidang === 'Hal Ehwal Murid') {
    headerColor = [180, 83, 9]; // Amber
    reviewerName = reviewers.pkHem;
    reviewerTitle = 'Penolong Kanan HEM';
  } else if (bidang === 'Kokurikulum') {
    headerColor = [4, 120, 87]; // Emerald
    reviewerName = reviewers.pkKk;
    reviewerTitle = 'Penolong Kanan Kokurikulum';
  } else if (bidang === 'Pengurusan dan Staf') {
    headerColor = [107, 33, 168]; // Purple
    reviewerName = reviewers.guruBesar;
    reviewerTitle = 'Guru Besar SK Tudan';
  }

  doc.setFillColor(headerColor[0], headerColor[1], headerColor[2]);
  doc.rect(10, 8, 277, 18, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(255, 255, 255);
  doc.text(`${schoolName.toUpperCase()} (${schoolCode})`, 14, 15);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(240, 240, 255);
  doc.text(`TAKWIM PENGURUSAN DAN PERSEKOLAHAN BIDANG ${bidang.toUpperCase()} 2027`, 14, 21);
  doc.text('Takwim Rasmi Pengoperasian, Program Utama dan Aktiviti Sepanjang Tahun', 14, 24.5);

  doc.setFontSize(8);
  doc.text(`Jumlah Program: ${filtered.length} | Tarikh Cetak: ${new Date().toLocaleDateString('ms-MY')}`, 215, 15);

  const rows = filtered.map((e, idx) => {
    const title = cleanPdfTitle(e.tajuk);
    const mNum = e.bulan || (new Date(e.tarikhMula + 'T00:00:00').getMonth() + 1);
    const mName = MONTH_NAMES_MS[mNum - 1] || '';
    const dayName = formatDayName(e.tarikhMula);
    const time = e.sepanjangHari ? 'Sepanjang Hari' : `${e.masaMula} - ${e.masaAkhir}`;

    return [
      (idx + 1).toString(),
      `${e.tarikhMula}\n(${dayName})`,
      mName,
      e.mingguAkademik || '-',
      e.unitUtama || bidang,
      e.jenisPengisian,
      title,
      e.tempat || 'Sekolah',
      time,
      e.penyelaras || '-',
      e.statusKelulusan,
    ];
  });

  autoTable(doc, {
    startY: 30,
    head: [[
      'Bil',
      'Tarikh (Hari)',
      'Bulan',
      'Minggu',
      'Unit',
      'Jenis',
      'Tajuk Program / Aktiviti',
      'Tempat',
      'Masa',
      'Penyelaras',
      'Status'
    ]],
    body: rows.length > 0 ? rows : [['-', '-', '-', '-', '-', '-', `Tiada rekod program untuk bidang ${bidang}.`, '-', '-', '-', '-']],
    theme: 'grid',
    styles: {
      font: 'helvetica',
      fontSize: 7.5,
      cellPadding: 2,
      lineColor: [203, 213, 225],
      lineWidth: 0.15,
      valign: 'top',
    },
    headStyles: {
      fillColor: headerColor as [number, number, number],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8,
    },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      1: { cellWidth: 22, fontStyle: 'bold' },
      2: { cellWidth: 16 },
      3: { cellWidth: 14, halign: 'center', fontStyle: 'bold' },
      4: { cellWidth: 28 },
      5: { cellWidth: 18 },
      6: { cellWidth: 75, fontStyle: 'bold' },
      7: { cellWidth: 26 },
      8: { cellWidth: 22 },
      9: { cellWidth: 30 },
      10: { cellWidth: 16, halign: 'center' },
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
  });

  doc.save(`Takwim_${bidang.replace(/\s+/g, '_')}_SK_Tudan_2027.pdf`);
}

/**
 * 4. Download Full 12-Month Takwim Booklet as Multi-Page PDF
 */
export function downloadYearlyTakwimPDF(
  entries: TakwimEntry[],
  holidays: HolidayRecord[],
  settings?: SchoolSettings
) {
  const schoolName = settings?.schoolName || 'SK Tudan, Miri';
  const schoolCode = settings?.schoolCode || 'YBB4345';
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  // Cover Page
  doc.setFillColor(30, 58, 138);
  doc.rect(0, 0, 297, 210, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(26);
  doc.setTextColor(255, 255, 255);
  doc.text('KEMENTERIAN PENDIDIKAN MALAYSIA', 148.5, 55, { align: 'center' });

  doc.setFontSize(22);
  doc.setTextColor(254, 240, 138); // Yellow
  doc.text(schoolName.toUpperCase(), 148.5, 75, { align: 'center' });
  doc.setFontSize(14);
  doc.setTextColor(224, 231, 255);
  doc.text(`KOD SEKOLAH: ${schoolCode} · MIRI, SARAWAK`, 148.5, 85, { align: 'center' });

  doc.setFontSize(28);
  doc.setTextColor(255, 255, 255);
  doc.text('BUKU TAKWIM PENGURUSAN DAN PERSEKOLAHAN', 148.5, 115, { align: 'center' });
  doc.setFontSize(20);
  doc.setTextColor(254, 240, 138);
  doc.text('SESI AKADEMIK 2027', 148.5, 127, { align: 'center' });

  doc.setFontSize(11);
  doc.setTextColor(224, 231, 255);
  doc.text('Merangkumi Pengurusan & Pentadbiran, Kurikulum, Hal Ehwal Murid, Kokurikulum & Panitia', 148.5, 142, { align: 'center' });
  doc.text('Diselaraskan dengan Kalendar Akademik KPM, Kit PLC dan Instrumen SK@S', 148.5, 149, { align: 'center' });

  doc.setFontSize(9);
  doc.setTextColor(199, 210, 254);
  doc.text(`Tarikh Dikeluarkan: ${new Date().toLocaleDateString('ms-MY')} · Status: DILULUSKAN RASMI`, 148.5, 185, { align: 'center' });

  // Add Monthly Pages (1-12)
  for (let m = 1; m <= 12; m++) {
    doc.addPage('a4', 'landscape');
    const monthName = MONTH_NAMES_MS[m - 1];
    const civicVal = settings?.civicValues?.find(c => c.month === m);
    const salaryRec = settings?.salaryDates?.find(s => s.month === m);

    // Mini Header
    doc.setFillColor(30, 58, 138);
    doc.rect(10, 8, 277, 14, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(255, 255, 255);
    doc.text(`${schoolName} (${schoolCode}) · TAKWIM BULAN ${monthName.toUpperCase()} 2027`, 14, 16);

    const civicText = civicVal ? `Nilai Sivik: ${civicVal.coreValue} (${civicVal.subTheme})` : '';
    const salaryText = salaryRec ? `Gaji: ${salaryRec.date}` : '';
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(224, 231, 255);
    doc.text([civicText, salaryText].filter(Boolean).join(' | '), 210, 16);

    // Get days for month m
    const totalDays = new Date(2027, m, 0).getDate();
    const days = [];
    for (let d = 1; d <= totalDays; d++) {
      const dateStr = `2027-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const dObj = new Date(dateStr + 'T00:00:00');
      days.push({
        dateStr,
        dayName: DAY_NAMES_MS[dObj.getDay()],
        dayOfWeek: dObj.getDay(),
        weekInfo: getAcademicWeekForDate(dateStr),
        statusInfo: getDayStatus(dateStr, holidays),
        isTuesday: dObj.getDay() === 2,
        isSalaryDay: salaryRec ? salaryRec.date === dateStr : false,
      });
    }

    const monthRows = days.map(day => {
      const dayEntries = entries.filter(e => !e.isDeleted && day.dateStr >= e.tarikhMula && day.dateStr <= (e.tarikhAkhir || e.tarikhMula));
      
      const getBidangText = (bidang: BidangType) => {
        const list = dayEntries.filter(e => e.bidangUtama === bidang);
        const parts: string[] = [];
        if (bidang === 'Pengurusan dan Staf' && day.isTuesday && day.statusInfo.isPdPDay) {
          parts.push('[Perhimpunan Dwisesi]');
        }
        list.forEach(i => parts.push(`• ${cleanPdfTitle(i.tajuk)}`));
        return parts.join('\n');
      };

      let dateCol = `${day.dateStr.slice(8)}/${day.dateStr.slice(5, 7)}\n${day.dayName}`;
      if (day.isSalaryDay) dateCol += '\n[GAJI]';

      return [
        dateCol,
        day.weekInfo.code !== 'Tiada Slot' ? day.weekInfo.code : '-',
        day.statusInfo.statusLabel,
        getBidangText('Pengurusan dan Staf'),
        getBidangText('Kurikulum'),
        getBidangText('Hal Ehwal Murid'),
        getBidangText('Kokurikulum'),
        getBidangText('Panitia Mata Pelajaran'),
      ];
    });

    autoTable(doc, {
      startY: 25,
      head: [[
        'Tarikh',
        'Mggu',
        'Status',
        'Pengurusan & Staf',
        'Kurikulum',
        'HEM',
        'Kokurikulum',
        'Panitia Mata Pelajaran'
      ]],
      body: monthRows,
      theme: 'grid',
      styles: {
        font: 'helvetica',
        fontSize: 6.5,
        cellPadding: 1.2,
        lineColor: [203, 213, 225],
        lineWidth: 0.15,
        overflow: 'linebreak',
        valign: 'top',
      },
      headStyles: {
        fillColor: [30, 58, 138],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 7,
      },
      columnStyles: {
        0: { cellWidth: 15, fontStyle: 'bold' },
        1: { cellWidth: 12, halign: 'center', fontStyle: 'bold' },
        2: { cellWidth: 20 },
        3: { cellWidth: 46 },
        4: { cellWidth: 46 },
        5: { cellWidth: 46 },
        6: { cellWidth: 46 },
        7: { cellWidth: 46 },
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252],
      },
      didDrawPage: (data) => {
        doc.setFontSize(7);
        doc.setTextColor(148, 163, 184);
        doc.text(`Takwim Penuh 2027 · ${monthName} · Halaman ${data.pageNumber}`, 280, 205, { align: 'right' });
      }
    });
  }

  doc.save(`Takwim_Penuh_12_Bulan_SK_Tudan_2027.pdf`);
}

/**
 * 5. Download Weekly Civic Values & 5-Minute Activities Schedule as PDF
 */
export function downloadCivicSchedulePDF(
  civicValues: CivicValueRecord[],
  settings?: SchoolSettings,
  holidays?: HolidayRecord[]
) {
  const schoolName = settings?.schoolName || 'SK Tudan, Miri';
  const schoolCode = settings?.schoolCode || 'YBB4345';
  const tuesdaySlots = getCivicTuesdaySchedule(civicValues, holidays);

  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  doc.setFillColor(15, 118, 110); // Teal 700
  doc.rect(10, 8, 277, 18, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(255, 255, 255);
  doc.text(`${schoolName.toUpperCase()} (${schoolCode})`, 14, 15);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(204, 251, 241);
  doc.text('JADUAL PENERAPAN NILAI SIVIK & AKTIVITI 5 MINIT PERHIMPUNAN DWISESI 2027', 14, 21);
  doc.text('Setiap Hari Selasa: Sesi Pagi (07:00-07:30) & Sesi Petang (12:40-01:10) · KPM', 14, 24.5);

  const rows = tuesdaySlots.map((slot, idx) => [
    (idx + 1).toString(),
    slot.monthName,
    `Minggu ${slot.weekIndex}`,
    slot.tuesdayDisplay,
    slot.statusPelaksanaan,
    slot.coreValue,
    `${slot.subTheme} (${slot.subNilai})`,
    slot.tajukAktiviti,
    slot.cadanganAktiviti5Minit,
    slot.fokusSasaran,
  ]);

  autoTable(doc, {
    startY: 30,
    head: [[
      'Bil',
      'Bulan',
      'Minggu',
      'Tarikh (Selasa)',
      'Status Pelaksanaan',
      'Nilai Teras',
      'Sub-Tema Bulanan',
      'Tajuk Aktiviti 5 Minit',
      'Cadangan Panduan Guru',
      'Sasaran'
    ]],
    body: rows,
    theme: 'grid',
    styles: {
      font: 'helvetica',
      fontSize: 6.8,
      cellPadding: 1.8,
      lineColor: [203, 213, 225],
      lineWidth: 0.15,
      valign: 'top',
    },
    headStyles: {
      fillColor: [15, 118, 110],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 7.5,
    },
    columnStyles: {
      0: { cellWidth: 8, halign: 'center' },
      1: { cellWidth: 16 },
      2: { cellWidth: 15, halign: 'center', fontStyle: 'bold' },
      3: { cellWidth: 22, fontStyle: 'bold' },
      4: { cellWidth: 26 },
      5: { cellWidth: 24, fontStyle: 'bold' },
      6: { cellWidth: 32 },
      7: { cellWidth: 38, fontStyle: 'bold' },
      8: { cellWidth: 70 },
      9: { cellWidth: 26 },
    },
    alternateRowStyles: {
      fillColor: [240, 253, 250],
    },
  });

  doc.save(`Jadual_Nilai_Sivik_5_Minit_SK_Tudan_2027.pdf`);
}

/**
 * 6. Download Academic Weeks & PdP Calendar Schedule as PDF (M01-M44)
 */
export function downloadWeeklyAgendaPDF(
  settings?: SchoolSettings,
  holidays?: HolidayRecord[]
) {
  const schoolName = settings?.schoolName || 'SK Tudan, Miri';
  const schoolCode = settings?.schoolCode || 'YBB4345';
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  doc.setFillColor(30, 58, 138);
  doc.rect(10, 8, 190, 18, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(255, 255, 255);
  doc.text(`${schoolName.toUpperCase()} (${schoolCode})`, 14, 15);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(224, 231, 255);
  doc.text('JADUAL MINGGU PERSEKOLAHAN PdP & TAKWIM PENGGAL SESI 2027 (M01 - M44)', 14, 21);
  doc.text('Kalendar Akademik KPM Kumpulan B (Sarawak) · 44 Minggu PdP', 14, 24.5);

  // 44 weeks data
  const weekRows = [];
  let currentD = new Date('2027-01-04T00:00:00');
  for (let w = 1; w <= 44; w++) {
    const mondayStr = currentD.toISOString().split('T')[0];
    const fridayD = new Date(currentD);
    fridayD.setDate(fridayD.getDate() + 4);
    const fridayStr = fridayD.toISOString().split('T')[0];

    const weekCode = `M${String(w).padStart(2, '0')}`;
    const mNum = currentD.getMonth() + 1;
    const mName = MONTH_NAMES_MS[mNum - 1];

    let term = 'Penggal 1';
    if (w > 30) term = 'Penggal 3';
    else if (w > 17) term = 'Penggal 2';

    weekRows.push([
      weekCode,
      `Minggu Ke-${w}`,
      term,
      mName,
      `${mondayStr} hingga ${fridayStr}`,
      'Hari Persekolahan & PdP Berjadual',
    ]);

    // Next week
    currentD.setDate(currentD.getDate() + 7);
  }

  autoTable(doc, {
    startY: 30,
    head: [['Kod', 'Minggu Persekolahan', 'Penggal', 'Bulan', 'Julat Tarikh (Isnin - Jumaat)', 'Catatan Pengoperasian']],
    body: weekRows,
    theme: 'grid',
    styles: {
      font: 'helvetica',
      fontSize: 7.5,
      cellPadding: 1.5,
      lineColor: [203, 213, 225],
      lineWidth: 0.15,
    },
    headStyles: {
      fillColor: [30, 58, 138],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8,
    },
    columnStyles: {
      0: { cellWidth: 15, halign: 'center', fontStyle: 'bold' },
      1: { cellWidth: 28, fontStyle: 'bold' },
      2: { cellWidth: 22, halign: 'center' },
      3: { cellWidth: 22 },
      4: { cellWidth: 48, fontStyle: 'bold' },
      5: { cellWidth: 55 },
    },
  });

  doc.save(`Jadual_Minggu_Persekolahan_PdP_2027.pdf`);
}



