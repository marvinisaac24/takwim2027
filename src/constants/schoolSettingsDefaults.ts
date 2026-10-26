import { SchoolSettings, CivicValueRecord, SalaryRecord } from '../types/takwim';

// Clean SVG Logo data URI for SK Tudan
export const DEFAULT_SCHOOL_LOGO = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none"><rect width="100" height="100" rx="20" fill="%231e3a8a"/><path d="M50 15 L78 30 L78 60 C78 76 50 88 50 88 C50 88 22 76 22 60 L22 30 Z" fill="%23fbbf24" stroke="%23ffffff" stroke-width="2"/><path d="M50 22 L72 35 L72 58 C72 71 50 81 50 81 C50 81 28 71 28 58 L28 35 Z" fill="%231e40af"/><text x="50" y="47" font-size="10" font-weight="bold" fill="%23ffffff" text-anchor="middle" font-family="sans-serif">SK TUDAN</text><text x="50" y="60" font-size="7" font-weight="bold" fill="%23fbbf24" text-anchor="middle" font-family="sans-serif">MIRI, SARAWAK</text><circle cx="50" cy="70" r="3" fill="%23ef4444"/></svg>';

export const DEFAULT_CIVIC_VALUES: CivicValueRecord[] = [
  {
    month: 1,
    coreValue: 'Kasih Sayang',
    subTheme: 'Sayangi Diri & Hormati Keluarga',
    note: 'Amalan gaya hidup sihat dan menghargai ibu bapa',
    weeklyActivities: [
      {
        minggu: 1,
        subNilai: 'Sayangi Diri & Kesihatan',
        tajukAktiviti: 'Regangan Minda & Pernafasan Segar',
        cadanganAktiviti5Minit: 'Guru membimbing murid melakukan senaman regangan 5-Minute Stretch dan teknik pernafasan santai di tapak perhimpunan/dalam kelas untuk memulakan hari dengan bertenaga.',
        fokusSasaran: 'Semua Murid & Guru'
      },
      {
        minggu: 2,
        subNilai: 'Kasih Ibu Bapa & Keluarga',
        tajukAktiviti: 'Kad Ucapan Terima Kasih Ibu Bapa',
        cadanganAktiviti5Minit: 'Murid menulis 1 mesej penghargaan ringkas pada nota pelekat atau buku catatan: "Terima kasih ibu/ayah kerana menjaga saya hari ini" untuk ditunjukkan kepada ibu bapa di rumah.',
        fokusSasaran: 'Semua Murid'
      },
      {
        minggu: 3,
        subNilai: 'Sentuhan Selamat & Batas Diri',
        tajukAktiviti: 'Isyarat Lampu Isyarat Batas Diri',
        cadanganAktiviti5Minit: 'Penerangan ringkas 5 minit peraturan lampu isyarat keselamatan: Bahagian tubuh peribadi (Lampu Merah - Dilarang sentuh), cara menolak tegas ("JANGAN!") dan segera melapor kepada guru.',
        fokusSasaran: 'Tahap 1, Tahap 2 & Prasekolah'
      },
      {
        minggu: 4,
        subNilai: 'Sayangi Rakan & Komuniti',
        tajukAktiviti: 'High-Five Penghargaan Rakan',
        cadanganAktiviti5Minit: 'Setiap murid berpusing kepada rakan sebelah kiri dan kanan, memberikan kata pujian ikhlas (contoh: "Awak seorang kawan yang baik/rajin") bersama senyuman dan sapaan mesra.',
        fokusSasaran: 'Semua Murid'
      }
    ]
  },
  {
    month: 2,
    coreValue: 'Hormat-menghormati',
    subTheme: 'Menghargai Kepelbagaian Kaum & Budaya',
    note: 'Perpaduan warga sekolah dan masyarakat majmuk',
    weeklyActivities: [
      {
        minggu: 1,
        subNilai: 'Adab Terhadap Guru & Orang Tua',
        tajukAktiviti: 'Latihan Tunduk Hormat & Beri Laluan',
        cadanganAktiviti5Minit: 'Simulasi praktikal 5 minit: Cara menundukkan sedikit badan apabila melintas di hadapan guru atau orang tua dan memberi laluan dengan tertib di koridor sekolah.',
        fokusSasaran: 'Semua Murid'
      },
      {
        minggu: 2,
        subNilai: 'Keharmonian Silang Budaya Sarawak',
        tajukAktiviti: 'Salam Tradisi Etnik Sarawak',
        cadanganAktiviti5Minit: 'Guru berkongsi salam tradisi pelbagai kaum di Sarawak (Melayu, Iban, Cina, Melanau, Orang Ulu) dan murid mencubanya secara berpasangan dengan rasa bangga.',
        fokusSasaran: 'Warga Sekolah'
      },
      {
        minggu: 3,
        subNilai: 'Hormati Pandangan Rakan',
        tajukAktiviti: 'Frasa Santun "Saya Hormati Pandangan Awak"',
        cadanganAktiviti5Minit: 'Murid berlatih menggunakan frasa diplomatik apabila tidak bersetuju: "Saya hormati pendapat awak, mari kita cari jalan penyelesaian bersama" tanpa mengejek atau meninggi suara.',
        fokusSasaran: 'Tahap 1 & Tahap 2'
      },
      {
        minggu: 4,
        subNilai: 'Menghormati Hak Milik Rakan',
        tajukAktiviti: 'Adab Meminjam & Memulangkan Barang',
        cadanganAktiviti5Minit: 'Peringatan adab ringkas: Sentiasa minta izin sebelum menggunakan barang rakan, jaga dengan cermat dan pulangkan tepat pada masa berserta ucapan terima kasih.',
        fokusSasaran: 'Semua Murid'
      }
    ]
  },
  {
    month: 3,
    coreValue: 'Bertanggungjawab',
    subTheme: 'Kebersihan Persekitaran & Jimat Tenaga',
    note: 'Amalan 3R, keceriaan bilik darjah, penjimatan elektrik/air',
    weeklyActivities: [
      {
        minggu: 1,
        subNilai: 'Kebersihan Ruang Pembelajaran',
        tajukAktiviti: 'Ops 5 Minit Kutip Sampah & Susun Meja',
        cadanganAktiviti5Minit: 'Setiap murid memeriksa lantai bawah meja masing-masing, mengutip cebisan sampah, menyusun kerusi meja lurus dan memastikan papan putih bersih sebelum PdP bermula.',
        fokusSasaran: 'Semua Kelas'
      },
      {
        minggu: 2,
        subNilai: 'Penjimatan Elektrik & Air',
        tajukAktiviti: 'Skuad Cilik Matikan Suis & Paip',
        cadanganAktiviti5Minit: 'Melantik wakil murid setiap baris untuk memeriksa suis kipas/lampu dipadamkan semasa keluar kelas dan memastikan pili air tandas ditutup rapat selepas mencuci tangan.',
        fokusSasaran: 'Semua Murid'
      },
      {
        minggu: 3,
        subNilai: 'Pengurusan Masa Harian',
        tajukAktiviti: 'Senarai 3 Keutamaan Petang Saya',
        cadanganAktiviti5Minit: 'Murid mencatat 3 perkara penting yang perlu disiapkan selepas pulang sekolah (cth: kerja rumah BM, ulangkaji sains, tolong ibu) untuk mengelakkan budaya bertangguh.',
        fokusSasaran: 'Tahap 2'
      },
      {
        minggu: 4,
        subNilai: 'Integriti & Kejujuran Akademik',
        tajukAktiviti: 'Ikrar Kejujuran Cilik',
        cadanganAktiviti5Minit: 'Murid berdiri melafazkan komitmen: "Saya berjanji akan sentiasa jujur membuat latihan sendiri, tidak meniru dan berbangga dengan hasil usaha diri sendiri".',
        fokusSasaran: 'Semua Murid'
      }
    ]
  },
  {
    month: 4,
    coreValue: 'Kegembiraan',
    subTheme: 'Budi Bahasa & Keceriaan Sekolah',
    note: 'Senyum, sapa, salam dan komunikasi berhemah',
    weeklyActivities: [
      {
        minggu: 1,
        subNilai: 'Amalan 3S (Senyum, Sapa, Salam)',
        tajukAktiviti: 'Kuasa Senyuman 5 Saat',
        cadanganAktiviti5Minit: 'Murid saling berpandangan dan mengukir senyuman ikhlas selama 5 saat diikuti ucapan "Selamat Pagi, semoga hari awak ceria!". Rasai perubahan suasana gembira dalam kelas.',
        fokusSasaran: 'Warga Sekolah'
      },
      {
        minggu: 2,
        subNilai: 'Menghargai Kebaikan & Bersyukur',
        tajukAktiviti: 'Balang Kesyukuran Pagi',
        cadanganAktiviti5Minit: 'Tiga orang murid dipilih secara rawak menyebut satu perkara indah yang mereka syukuri hari ini (cth: sarapan sedap, dapat kawan baru, selamat sampai ke sekolah).',
        fokusSasaran: 'Semua Murid'
      },
      {
        minggu: 3,
        subNilai: 'Semangat Berpasukan & Harmoni',
        tajukAktiviti: 'Tepukan Semangat SK Tudan Ceria',
        cadanganAktiviti5Minit: 'Guru mengetuai tepukan irama motivasi SK Tudan bersama sorakan positif untuk membangkitkan aura kegembiraan sebelum memulakan sesi akademik harian.',
        fokusSasaran: 'Semua Murid'
      },
      {
        minggu: 4,
        subNilai: 'Kemaafan & Berdamai',
        tajukAktiviti: 'Jabat Tangan Kemaafan',
        cadanganAktiviti5Minit: 'Murid diajar melepaskan rasa marah kecil dengan berjabat tangan bersama rakan sambil menyebut: "Saya maafkan awak, kita kawan baik selamanya".',
        fokusSasaran: 'Semua Murid'
      }
    ]
  },
  {
    month: 5,
    coreValue: 'Kasih Sayang',
    subTheme: 'Sayangi Alam Sekitar & Fauna',
    note: 'Kelestarian hijau dan keprihatinan terhadap makhluk hidup',
    weeklyActivities: [
      {
        minggu: 1,
        subNilai: 'Kelestarian Alam Hijau Sekolah',
        tajukAktiviti: 'Sayangi Pokok Koridor Kelas',
        cadanganAktiviti5Minit: 'Murid menyiram pokok bunga di hadapan kelas masing-masing, mengutip daun kering dan menghargai udara segar yang dibekalkan oleh tumbuh-tumbuhan hijau.',
        fokusSasaran: 'Semua Murid'
      },
      {
        minggu: 2,
        subNilai: 'Penghargaan Kepada Guru',
        tajukAktiviti: 'Gema "Terima Kasih Cikguku"',
        cadanganAktiviti5Minit: 'Sempena sambutan Hari Guru, murid melafazkan serentak ucapan penghargaan penuh santun dan menulis satu ayat terima kasih kepada guru yang mengajar mereka.',
        fokusSasaran: 'Semua Murid'
      },
      {
        minggu: 3,
        subNilai: 'Kasih & Empati Terhadap Murid Berkeperluan Khas',
        tajukAktiviti: 'Simulasi Empati 1 Minit',
        cadanganAktiviti5Minit: 'Murid menutup mata selama 60 saat untuk merasai cabaran insan tanpa penglihatan, membina rasa empati dan tekad sentiasa membantu rakan OKU di sekolah.',
        fokusSasaran: 'Semua Murid'
      },
      {
        minggu: 4,
        subNilai: 'Sekolah Selamat Tanpa Buli',
        tajukAktiviti: 'Lafaz Ikrar Sifar Buli',
        cadanganAktiviti5Minit: 'Seluruh warga sekolah berdiri mengangkat tangan kanan melafazkan: "Kami menolak buli fizikal, lisan dan siber. SK Tudan sekolah penyayang, selamat dan harmoni".',
        fokusSasaran: 'Semua Murid & Staf'
      }
    ]
  },
  {
    month: 6,
    coreValue: 'Hormat-menghormati',
    subTheme: 'Menghormati Hak Asasi & Pemimpin',
    note: 'Mematuhi peraturan sekolah dan menghormati pentadbir',
    weeklyActivities: [
      {
        minggu: 1,
        subNilai: 'Hormati Lambang Kebangsaan & Negeri',
        tajukAktiviti: 'Postur Tegak Nyanyian Lagu Rasmi',
        cadanganAktiviti5Minit: 'Latihan postur berdiri tegak sempurna, tangan di sisi dan menyanyikan lagu Negaraku serta Ibu Pertiwiku dengan penuh rasa hormat dan bersemangat waja.',
        fokusSasaran: 'Perhimpunan Rasmi'
      },
      {
        minggu: 2,
        subNilai: 'Adab Di Tempat Awam & Kantin',
        tajukAktiviti: 'Disiplin Beratur Tanpa Memotong',
        cadanganAktiviti5Minit: 'Peringatan amalan tertib di kantin: Beratur mengikut garisan, menunggu giliran dengan sabar, tidak menolak rakan dan meletakkan pinggan ke dalam besen yang disediakan.',
        fokusSasaran: 'Semua Murid'
      },
      {
        minggu: 3,
        subNilai: 'Keselamatan Jalan Raya',
        tajukAktiviti: 'Peraturan Lintasan Belang Zebra',
        cadanganAktiviti5Minit: 'Ulangkaji 3 langkah melintas selamat: Berhenti, lihat kanan, lihat kiri, lihat kanan semula dan angkat tangan ketika melintas di hadapan pagar sekolah.',
        fokusSasaran: 'Semua Murid'
      },
      {
        minggu: 4,
        subNilai: 'Menghormati Pemimpin Cilik',
        tajukAktiviti: 'Sokongan Kepada Pengawas & Ketua Kelas',
        cadanganAktiviti5Minit: 'Murid diajar mendengar arahan pengawas sekolah dan ketua kelas dengan penuh kerjasama sebagai tanda menghormati kepimpinan muda sekolah.',
        fokusSasaran: 'Semua Murid'
      }
    ]
  },
  {
    month: 7,
    coreValue: 'Bertanggungjawab',
    subTheme: 'Integriti & Disiplin Diri',
    note: 'Ketepatan masa, kejujuran akademik, dan etika digital',
    weeklyActivities: [
      {
        minggu: 1,
        subNilai: 'Etika Digital & Gadjet Sihat',
        tajukAktiviti: 'Formula 20-20-20 & Had Masa Skrin',
        cadanganAktiviti5Minit: 'Panduan menjaga mata dan minda: Setiap 20 minit melihat skrin telefon di rumah, rehatkan mata melihat objek hijau sejauh 20 kaki selama 20 saat.',
        fokusSasaran: 'Tahap 1 & Tahap 2'
      },
      {
        minggu: 2,
        subNilai: 'Penjagaan Harta Kerajaan (SPBT)',
        tajukAktiviti: 'Spot-Check Kasih Buku Teks',
        cadanganAktiviti5Minit: 'Murid mengeluarkan buku teks, memeriksa balutan plastik kemas, memastikan nama tercatat dan tiada helaian yang koyak atau diconteng.',
        fokusSasaran: 'Semua Murid'
      },
      {
        minggu: 3,
        subNilai: 'Tanggungjawab Tandas Bersih',
        tajukAktiviti: 'Kempen "Pam Sempurna & Tutup Pili"',
        cadanganAktiviti5Minit: 'Peringatan berhemah sivik tandas: Pastikan mengepam tandas sehingga bersih, buang tisu ke tong sampah dan pastikan lantai tidak basah berlebihan.',
        fokusSasaran: 'Semua Murid'
      },
      {
        minggu: 4,
        subNilai: 'Pematuhan Masa Sekolah',
        tajukAktiviti: 'Langkah Awal Elak Lewat Ke Sekolah',
        cadanganAktiviti5Minit: 'Refleksi ringkas: Bangun awal, siapkan beg malam sebelumnya dan hadir ke sekolah sekurang-kurangnya 15 minit sebelum loceng pertama berbunyi.',
        fokusSasaran: 'Semua Murid'
      }
    ]
  },
  {
    month: 8,
    coreValue: 'Kegembiraan',
    subTheme: 'Semangat Patriotik & Kemerdekaan',
    note: 'Cintakan negara, penghayatan Rukun Negara, bulan kebangsaan',
    weeklyActivities: [
      {
        minggu: 1,
        subNilai: 'Cintakan Tanah Air & Bendera',
        tajukAktiviti: 'Hormati Jalur Gemilang & Bendera Sarawak',
        cadanganAktiviti5Minit: 'Penerangan makna warna Jalur Gemilang dan adab memastikan bendera tidak menyentuh tanah atau dikibarkan dalam keadaan koyak.',
        fokusSasaran: 'Warga Sekolah'
      },
      {
        minggu: 2,
        subNilai: 'Menghayati Rukun Negara',
        tajukAktiviti: 'Lafaz Ikrar 5 Prinsip Rukun Negara',
        cadanganAktiviti5Minit: 'Murid melafazkan 5 prinsip Rukun Negara dengan nada mantap berserta penerangan ringkas 1 minit mengenai maksud Keluhuran Perlembagaan.',
        fokusSasaran: 'Semua Murid'
      },
      {
        minggu: 3,
        subNilai: 'Mengenang Jasa Pahlawan',
        tajukAktiviti: 'Kisah 1 Minit Tokoh Pejuang',
        cadanganAktiviti5Minit: 'Guru/pengawas berkongsi kisah keberanian tokoh pahlawan tempatan (Rentap / Rosli Dhobi / Tunku Abdul Rahman) yang berkorban demi kebebasan tanah air.',
        fokusSasaran: 'Semua Murid'
      },
      {
        minggu: 4,
        subNilai: 'Sorakan Kemerdekaan & Perpaduan',
        tajukAktiviti: 'Gema 7 Kali "MERDEKA!"',
        cadanganAktiviti5Minit: 'Murid bersama-sama melaungkan laungan "Merdeka!" sebanyak 7 kali dengan tangan kanan digenggam ke udara, membangkitkan rasa bangga menjadi anak Malaysia.',
        fokusSasaran: 'Perhimpunan Rasmi'
      }
    ]
  },
  {
    month: 9,
    coreValue: 'Kasih Sayang',
    subTheme: 'Kedamaian Sejagat & Keprihatinan Sosial',
    note: 'Prihatin insan memerlukan dan kempen anti-buli',
    weeklyActivities: [
      {
        minggu: 1,
        subNilai: 'Kedamaian & Harmoni Sejagat',
        tajukAktiviti: 'Doa & Hasrat Kedamaian Dunia',
        cadanganAktiviti5Minit: 'Sempena Hari Keamanan Sedunia, murid berdiri bertafakur selama 1 minit mengharapkan kedamaian dan menolak sebarang bentuk keganasan.',
        fokusSasaran: 'Semua Murid'
      },
      {
        minggu: 2,
        subNilai: 'Prihatin & Suka Bersedekah',
        tajukAktiviti: 'Kempen "Kongsi Rezeki Rakan"',
        cadanganAktiviti5Minit: 'Murid digalakkan mengamalkan sikap prihatin dengan berkongsi alat tulis lebih atau menyumbang ke Tabung Kebajikan Kasih Murid SK Tudan.',
        fokusSasaran: 'Warga Sekolah'
      },
      {
        minggu: 3,
        subNilai: 'Menyayangi Harta Benda Sekolah',
        tajukAktiviti: 'Kempen Meja Bersih Bebas Conteng',
        cadanganAktiviti5Minit: 'Murid memeriksa permukaan meja belajar mereka, memadam kesan pensel/pen dan berikrar menjaga perabot sekolah sebagai kemudahan generasi masa hadapan.',
        fokusSasaran: 'Semua Kelas'
      },
      {
        minggu: 4,
        subNilai: 'Kasih Sayang Terhadap Warga Emas',
        tajukAktiviti: 'Panggilan Kasih Kepada Datuk & Nenek',
        cadanganAktiviti5Minit: 'Murid digalakkan menelefon atau memeluk datuk dan nenek di rumah hujung minggu ini, bertanya khabar dan menyatakan rasa sayang yang mendalam.',
        fokusSasaran: 'Semua Murid'
      }
    ]
  },
  {
    month: 10,
    coreValue: 'Hormat-menghormati',
    subTheme: 'Menghargai Warga Emas & Golongan OKU',
    note: 'Adab santun kepada warga tua dan empati inklusif',
    weeklyActivities: [
      {
        minggu: 1,
        subNilai: 'Menghargai Staf Sokongan Sekolah',
        tajukAktiviti: 'Salam Santun Kakitangan Pembersihan & Pengawal',
        cadanganAktiviti5Minit: 'Murid diingatkan sentiasa memberi salam dan mengucapkan terima kasih kepada pakcik pengawal keselamatan dan makcik pembersihan yang memastikan sekolah selamat dan bersih.',
        fokusSasaran: 'Semua Murid'
      },
      {
        minggu: 2,
        subNilai: 'Adab Komunikasi Siber Berhemah',
        tajukAktiviti: 'Formula T-H-I-N-K Sebelum Kongsi',
        cadanganAktiviti5Minit: 'Panduan media sosial: Pastikan apa yang ditaip adalah True (Benar), Helpful (Membantu), Inspiring (Menginspirasi), Necessary (Perlu), Kind (Baik). Elakkan kata nista.',
        fokusSasaran: 'Tahap 2'
      },
      {
        minggu: 3,
        subNilai: 'Zon Senyap & Hormati Waktu Belajar',
        tajukAktiviti: 'Amalan 5 Minit Membaca Senyap',
        cadanganAktiviti5Minit: 'Murid duduk membaca buku Nilam secara senyap tanpa membuat bising ketika guru sedang membuat persediaan atau dalam pertukaran waktu PdP.',
        fokusSasaran: 'Semua Kelas'
      },
      {
        minggu: 4,
        subNilai: 'Hormati Amalan Ibadah Pelbagai Kaum',
        tajukAktiviti: 'Menghargai Kepelbagaian Perayaan',
        cadanganAktiviti5Minit: 'Perkongsian ringkas mengenai perayaan Deepavali / pesta tradisi dan pentingnya saling mengucapkan selamat serta menjaga adab kejiranan.',
        fokusSasaran: 'Warga Sekolah'
      }
    ]
  },
  {
    month: 11,
    coreValue: 'Bertanggungjawab',
    subTheme: 'Kelestarian Masa Depan & Pengurusan Masa',
    note: 'Persediaan akhir tahun, perancangan akademik masa hadapan',
    weeklyActivities: [
      {
        minggu: 1,
        subNilai: 'Fokus & Ketenangan Menghadapi Peperiksaan/UASA',
        tajukAktiviti: 'Latihan Fokus & Mindset Tenang',
        cadanganAktiviti5Minit: 'Teknik pernafasan 4-7-8 untuk meredakan keresahan sebelum memulakan kertas ujian dan doa ketenangan agar dapat menjawab dengan penuh keyakinan.',
        fokusSasaran: 'Semua Murid'
      },
      {
        minggu: 2,
        subNilai: 'Refleksi Kejayaan Sahsiah Diri',
        tajukAktiviti: '3 Pencapaian Terbaik Saya Tahun Ini',
        cadanganAktiviti5Minit: 'Murid mencatat 3 perkara positif yang berjaya mereka capai tahun ini (cth: kehadiran penuh, pandai membaca, tolong kawan, kurangkan marah).',
        fokusSasaran: 'Semua Murid'
      },
      {
        minggu: 3,
        subNilai: 'Amanah Pemulangan Buku Teks',
        tajukAktiviti: 'Susunan Kemas Buku SPBT',
        cadanganAktiviti5Minit: 'Murid menyemak kelengkapan buku teks mengikut senarai semak, memastikan tiada buku yang tertinggal dan menyerahkannya kepada guru kelas dengan teratur.',
        fokusSasaran: 'Semua Murid'
      },
      {
        minggu: 4,
        subNilai: 'Kebersihan Menjelang Cuti Panjang',
        tajukAktiviti: 'Gotong-Royong Kosongkan Laci Meja',
        cadanganAktiviti5Minit: 'Membersihkan laci meja daripada sebarang sampah makanan atau kertas terbiar, mengelap tingkap dan menyusun perabot kelas sebelum cuti penggal bermula.',
        fokusSasaran: 'Semua Kelas'
      }
    ]
  },
  {
    month: 12,
    coreValue: 'Kegembiraan',
    subTheme: 'Cakna Komuniti & Bersyukur',
    note: 'Menilai pencapaian tahunan dan mengeratkan ukhuwah',
    weeklyActivities: [
      {
        minggu: 1,
        subNilai: 'Meraikan Kejayaan Rakan',
        tajukAktiviti: 'Tepukan Tahniah & Sorakan Bangga',
        cadanganAktiviti5Minit: 'Sempena Hari Anugerah Cemerlang, murid diajar bertepuk tangan meraikan kejayaan rakan yang menerima anugerah dan menanam tekad berusaha gigih tahun hadapan.',
        fokusSasaran: 'Semua Murid'
      },
      {
        minggu: 2,
        subNilai: 'Kesyukuran Perjalanan Setahun',
        tajukAktiviti: 'Ucapan Terima Kasih Rakan Sekelas',
        cadanganAktiviti5Minit: 'Murid dan guru saling berjabat tangan dan mengucapkan terima kasih atas persahabatan, bimbingan dan kenangan manis sepanjang tahun sesi akademik 2027.',
        fokusSasaran: 'Warga Sekolah'
      },
      {
        minggu: 3,
        subNilai: 'Cuti Berfaedah & Bermanfaat',
        tajukAktiviti: 'Pelan Cuti Sihat & Selamat',
        cadanganAktiviti5Minit: 'Peringatan keselamatan cuti sekolah: Jauhi bermain di kawasan berbahaya (sungai/parit dalam), bantu ibu bapa di rumah dan luangkan masa membaca buku.',
        fokusSasaran: 'Semua Murid'
      },
      {
        minggu: 4,
        subNilai: 'Azam & Semangat Tahun Baharu',
        tajukAktiviti: 'Tekad Baharu SK Tudan Cemerlang',
        cadanganAktiviti5Minit: 'Murid menetapkan 1 azam peribadi untuk menjadi anak yang lebih soleh, murid yang lebih cemerlang dan insan yang lebih berbudi pekerti pada tahun berikutnya.',
        fokusSasaran: 'Semua Murid'
      }
    ]
  }
];

export const DEFAULT_SALARY_DATES: SalaryRecord[] = [
  { month: 1, date: '2027-01-25', dayName: 'Isnin', note: 'Gaji Penjawat Awam Bulan Januari' },
  { month: 2, date: '2027-02-25', dayName: 'Khamis', note: 'Gaji Penjawat Awam Bulan Februari' },
  { month: 3, date: '2027-03-25', dayName: 'Khamis', note: 'Gaji Penjawat Awam Bulan Mac' },
  { month: 4, date: '2027-04-23', dayName: 'Jumaat', note: 'Gaji Penjawat Awam Bulan April (Awal Sempena Hari Raya Aidilfitri)' },
  { month: 5, date: '2027-05-25', dayName: 'Selasa', note: 'Gaji Penjawat Awam Bulan Mei' },
  { month: 6, date: '2027-06-25', dayName: 'Jumaat', note: 'Gaji Penjawat Awam Bulan Jun' },
  { month: 7, date: '2027-07-23', dayName: 'Jumaat', note: 'Gaji Penjawat Awam Bulan Julai' },
  { month: 8, date: '2027-08-25', dayName: 'Rabu', note: 'Gaji Penjawat Awam Bulan Ogos' },
  { month: 9, date: '2027-09-24', dayName: 'Jumaat', note: 'Gaji Penjawat Awam Bulan September' },
  { month: 10, date: '2027-10-25', dayName: 'Isnin', note: 'Gaji Penjawat Awam Bulan Oktober' },
  { month: 11, date: '2027-11-25', dayName: 'Khamis', note: 'Gaji Penjawat Awam Bulan November' },
  { month: 12, date: '2027-12-21', dayName: 'Selasa', note: 'Gaji Penjawat Awam Bulan Disember (Awal Sempena Sambutan Hari Krismas)' },
];

export const DEFAULT_TEACHERS_LIST: string[] = [
  'Pn. Hajah Fatimah Binti Ismail (Guru Besar)',
  'En. Ahmad Bin Mansor (PK Pentadbiran & Kurikulum)',
  'Pn. Dayang Norliza Binti Awang (PK HEM)',
  'En. Justin Ak Jerry (PK Kokurikulum)',
  'Pn. Shirley Wong Mei Ling (PK Petang)',
  'Pn. Mariam Binti Abdullah (KP Bahasa Melayu)',
  'En. David Lee (KP Bahasa Inggeris)',
  'Pn. Noraini Binti Kassim (KP Matematik)',
  'En. Robert Anak Ding (KP Sains)',
  'Ustaz Mohd Hafiz Bin Zain (KP Pendidikan Islam)',
  'Pn. Tan Siew Ling (KP Pendidikan Moral)',
  'En. Wilson Anak Jimbau (KP Reka Bentuk & Teknologi)',
  'Pn. Catherine Ngo (KP Pendidikan Muzik)',
  'En. Patrick Anak Francis (KP Pendidikan Seni Visual)',
  'En. Mohd Azam Bin Salleh (KP Pendidikan Jasmani & Kesihatan)',
  'Ustazah Nurul Ain Binti Yusof (KP Bahasa Arab)',
  'Pn. Siti Rohani Binti Samad (Guru Perpustakaan & Media)',
  'Pn. Rozita Binti Bujang (Guru Pemulihan Khas)',
  'Pn. Jennifer Ak Thomas (Guru Bimbingan & Kaunseling)',
  'En. Wan Mohd Zulkifli (Guru Data & Maklumat ICT)',
  'Pn. Alice Ting (Guru Prasekolah)',
  'En. Rosli Bin Karim (Guru Disiplin)',
  'Pn. Juliana Binti Jemat (Penyelaras SPBT)',
  'En. Sylvester Anak Henry (Penyelaras 1M1S)',
  'Pn. Norazlin Binti Othman (Penyelaras RMT & Susu)',
  'En. Zulhairi Bin Hassan (Penyelaras Unit Beruniform)',
  'Pn. Grace Sim (Penyelaras Kelab & Persatuan)',
  'En. Awangku Azhar Bin Awang Damit (Guru Bertugas Mingguan)',
];

export const DEFAULT_SCHOOL_SETTINGS: SchoolSettings = {
  schoolName: 'SK Tudan, Miri',
  schoolCode: 'YBB4345',
  schoolLogo: DEFAULT_SCHOOL_LOGO,
  schoolPhone: '085-654321',
  schoolEmail: 'ybb4345@moe.edu.my',
  adminReviewers: {
    guruBesar: 'Pn. Hajah Fatimah Binti Ismail (Guru Besar)',
    pk1: 'En. Ahmad Bin Mansor (PK Pentadbiran & Kurikulum)',
    pkHem: 'Pn. Dayang Norliza Binti Awang (PK HEM)',
    pkKk: 'En. Justin Ak Jerry (PK Kokurikulum)',
    pkPetang: 'Pn. Shirley Wong Mei Ling (PK Petang)',
  },
  teachersList: DEFAULT_TEACHERS_LIST,
  civicValues: DEFAULT_CIVIC_VALUES,
  salaryDates: DEFAULT_SALARY_DATES,
  extractedPrograms: [],
};
