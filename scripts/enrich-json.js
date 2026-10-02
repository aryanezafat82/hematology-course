// scripts/enrich-json.js
// Usage: node scripts/enrich-json.js
//
// Enriches every card in every session JSON with:
//   **bold**     → Latin genes / proteins / drugs / tests / diseases
//   ==highlight== → Persian disease names / key syndromes
//   ++green++    → numbers with units
//   @@warning@@  → dangerous / critical phrases
//
// Skips anything already wrapped. Idempotent (safe to re-run).

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SESSIONS_DIR = path.join(__dirname, '..', 'src', 'data', 'sessions');

// ─────────────────────────────────────────────────────────────
// TERM LISTS
// ─────────────────────────────────────────────────────────────

const BOLD_TERMS = [
  // Genes / tumor suppressors
  'TP53', 'RB1', 'APC', 'SMAD4', 'SMAD2', 'BRCA-1', 'BRCA-2', 'PTEN',
  'STK-11', 'CDKN2A', 'CDKN1A', 'VHL', 'MYH', 'MLH-1', 'MLH1', 'MSH-2',
  'MSH2', 'MSH-3', 'MSH-6', 'PMS-1', 'PMS-2', 'PMS1', 'PMS2', 'WAF1',
  'CDH-1', 'CDH1', 'HAX-1', 'ELANE', 'RMRP', 'SBDS', 'CXCR4', 'ITGB2',
  'SLC35C1', 'RAB27A', 'LYST', 'SH2D1A', 'BIRC4', 'NLRC4', 'SLC7A7',
  'LIPA', 'MPO', 'SMARCD2', 'CEBPE', 'CHS1', 'PIG-A', 'UBA1',

  // Oncogenes
  'KRAS', 'BRAF', 'EGFR', 'HER2', 'cMET', 'MET', 'RET', 'ALK', 'ROS1',
  'ROS-1', 'NTRK', 'FGFR', 'MYC', 'MLLT3', 'DEK', 'NUP214', 'BCOR',
  'U2AF1', 'ZRSR2', 'STAG2', 'ASXL1', 'EZH2', 'SF3B1', 'SRSF2', 'TET2',
  'DNMT3A', 'KMT2A', 'NPM1', 'FLT3', 'CEBPA', 'DDX41', 'RUNX1', 'ANKRD26',
  'ETV6', 'GATA1', 'GATA2', 'MECOM', 'MYD88',

  // Chromosomal abnormalities / fusions
  'BCR-ABL', 'BCR-ABL1', 'PML-RARA', 'PML::RARA', 'RUNX1::RUNX1T1',
  'CBFB::MYH11', 'DEK::NUP214', 'GATA2,MECOM', 'TMPRSS2-ERG', 'EWS-Fli',
  'EWS-FLI', 'BCL-2', 'BCL-XL', 'BCL2', 'MYC-IgH', 'EML4-ALK', 'EML4::ALK',

  // RBC metabolism
  'G6PD', 'PK', 'NADPH', 'HMP', 'ATP', 'EM', '2,3-DPG', '2,3-BPG',

  // MPN / JAK-STAT
  'JAK2', 'JAK1', 'V617F', 'CALR', 'MPL', 'STAT3',

  // Signaling
  'HIF-1α', 'HIF-2α', 'HIF1A', 'VEGF', 'VEGFR2', 'VEGFR', 'IDH1', 'IDH2',
  'PI3K', 'AKT', 'mTOR', 'MAPK', 'MEK', 'ERK', 'RAF', 'S6', 'RANK',
  'DKK-1', 'TGF-β', 'TNF', 'TNF-α', 'IFN-γ', 'IL-1', 'IL-1β', 'IL-6',
  'IL-10', 'IL-2', 'IL-5', 'SDF-1α', 'IGF-1', 'IGF-II',

  // Apoptosis
  'FAS', 'FASL', 'TRAIL', 'BAX', 'PUMA', 'NOXA', 'BCI-xL', 'Mcl-1',
  'APAF1', 'CAD', 'Lamin-A', 'MDM2', 'ATM',

  // Immunology
  'PD-1', 'PD-L1', 'CTLA-4', 'CTLA4', 'CAR-T', 'CD19', 'CD20', 'CD22',
  'CD55', 'CD59', 'CD34', 'CD4', 'CD8', 'DAF', 'MIRL', 'GPI', 'HRF',
  'MAG', 'HLA', 'MHC-I', 'MHC', 'HLA-matched', 'GVHD', 'IgG', 'IgM',
  'IgA', 'IgD', 'IgE',

  // Diseases / abbreviations (English)
  'CML', 'AML', 'APL', 'ALL', 'CLL', 'NHL', 'HCC', 'HNSCC', 'MDS',
  'MPN', 'PV', 'PMF', 'ET', 'CIMF', 'ITP', 'TTP', 'HUS', 'DIC', 'PNH',
  'HLH', 'MAS', 'TLS', 'TACO', 'TRALI', 'FNHTR', 'MGUS', 'SMM', 'AL',
  'AA', 'ATTR', 'ATTRm', 'ATTRwt', 'NSCLC', 'SCLC', 'RCC', 'NET', 'IPMN',
  'FAP', 'HNPCC', 'SVCS', 'MAS-HLH', 'HDFN', 'CHIP', 'AML-pCT', 'VEXAS',
  'RPLS', 'WHIM', 'IBMFS', 'HCC', 'IBD', 'CKD', 'CHF', 'ARF', 'DVT',
  'MI', 'CVA', 'TIA', 'ICU', 'CNS', 'GI', 'GU', 'RLQ',

  // Viruses
  'HIV', 'HIV-1', 'HBV', 'HCV', 'HPV', 'EBV', 'CMV', 'HTLV-1', 'HTLV',
  'HEV', 'HSV', 'VZV', 'BKV', 'MSI', 'MSI-high', 'TMB',

  // Hemoglobins
  'Hb', 'HbA', 'HbA2', 'HbF', 'HbS', 'HbH', 'Hb Bart', 'Hb Lepore',
  'Hb Portland', 'Hb C',

  // Labs / tests
  'MCV', 'MCH', 'MCHC', 'RBC', 'WBC', 'Hct', 'RDW', 'ANC', 'LDH',
  'CRP', 'ESR', 'EPO', 'PSA', 'AFP', 'BNP', 'NT-proBNP', 'SPEP',
  'UPEP', 'SIFE', 'UIFE', 'FLC', 'FVIII', 'FIX', 'vWF', 'PT', 'aPTT',
  'INR', 'TT', 'FDP', 'ISS', 'IPSS', 'DIPSS', 'IPSS-M', 'PET', 'CT',
  'MRI', 'EUS', 'ERCP', 'EBUS', 'MRCP', 'ECG', 'EKG', 'CXR', 'FISH',
  'PCR', 'NGS', 'FNA', 'EMR', 'CCyR', 'MMR', 'MR4', 'MR4.5', 'DMR',
  'TFR', 'MRD', 'CR', 'R0', 'pCT', 'Gy', 'rad', 'NAT', 'CBLA', 'ELISA',
  'RIA', 'MRA', 'DAT', 'IAT', 'PFA-100', 'NBT', 'DHR',

  // Drugs
  'Imatinib', 'Dasatinib', 'Nilotinib', 'Bosutinib', 'Ponatinib',
  'Venetoclax', 'Ivosidenib', 'Enasidenib', 'Larotrectinib',
  'Entrectinib', 'Ruxolitinib', 'Fedratinib', 'Trastuzumab',
  'Bevacizumab', 'Ramucirumab', 'Rituximab', 'Tocilizumab',
  'Emapalumab', 'Ipilimumab', 'Nivolumab', 'Pembrolizumab',
  'Atezolizumab', 'Avelumab', 'Durvalumab', 'Tremelimumab',
  'Elotuzumab', 'Daratumumab', 'Blinatumomab', 'Gemtuzumab',
  'Cetuximab', 'Panitumumab', 'Alemtuzumab', 'Anakinra', 'Canakinumab',
  '5-FU', '5-Fluorouracil', 'Doxorubicin', 'Cisplatin', 'Carboplatin',
  'Paclitaxel', 'Vincristine', 'Vinblastine', 'Vinorelbine',
  'Cyclophosphamide', 'Ifosfamide', 'Methotrexate', 'Gemcitabine',
  'Cytarabine', 'Azacitidine', 'Decitabine', 'Lenalidomide',
  'Thalidomide', 'Pomalidomide', 'Bortezomib', 'Carfilzomib',
  'Ixazomib', 'Allopurinol', 'Febuxostat', 'Rasburicase', 'Mesna',
  'Luspatercept', 'Eltrombopag', 'Dexamethasone', 'Prednisone',
  'Doxepin', 'Sildenafil', 'Cidofovir', 'Eculizumab', 'Busulfan',
  'Procarbazine', 'Irinotecan', 'Etoposide', 'Bleomycin', 'Mitomycin',
  'CHOP', 'FOLFOX', 'FOLFIRINOX', 'IDAC', 'HDM/SCT', 'Whipple',
  'Ibrutinib', 'Sorafenib', 'Sunitinib', 'Regorafenib', 'Lenvatinib',
  'Cabozantinib', 'Trametinib', 'Dabrafenib', 'Lapatinib', 'Pertuzumab',
  'T-DM1', 'Crizotinib', 'Ceritinib', 'Alectinib', 'Irigotinib',
  'Toribatin', 'Vandetanib', 'Lanectinib', 'Erlotinib', 'Gefitinib',
  'Afatinib', 'Osimertinib', 'Nab-paclitaxel', 'DDAVP', 'EACA',
  'Tranexamic', 'Desferrioxamine', 'Deferasirox', 'Warfarin',
  'Heparin', 'Aspirin', 'Ibuprofen', 'Romiplostim', 'Somatostatin',
  'Octreotide', 'Mepolizumab', 'Eculizumab', 'Ravulizumab',

  // Other significant
  'Vogelstein', 'Warburg', 'Gompertzian', 'Karnofsky', 'ECOG',
  'Mentzer', 'Coombs', 'Ham', 'Donath-Landsteiner', 'Brilliant',
  'Cresyl', 'Golf ball', 'Budd-Chiari', 'Pancoast', 'Horner',
  'Eaton-Lambert', 'Li-Fraumeni', 'Chédiak-Higashi', 'Gaucher',
  'Shwachman-Diamond', 'Diamond-Blackfan', 'Kostmann', 'Imerslund',
  'Plummer-Vinson', 'Gaisböck', 'Felty', 'Gaisbock', 'Niemann-Pick',
  'Hurler', 'McLeod', 'Tangier', 'Zollinger-Ellison', 'Peutz-Jeghers',
  'Cowden', 'MonoMAC', 'Dejerine-Sottas',

  // Microbes
  'E. coli', 'H. pylori', 'S. pneumoniae', 'S. aureus', 'Klebsiella',
  'Pneumocystis', 'Aspergillus', 'Histoplasma', 'Toxoplasma',
  'Schistosoma', 'Plasmodium', 'Babesia', 'Leishmania', 'Trypanosoma',
  'Brucella', 'Mycobacterium', 'Burkholderia cepacia', 'Parvovirus',
  'B19', 'parvovirus',

  // Other terms
  'Warburg effect', 'Hallmarks', 'TNM', 'RECIST', 'AJCC', 'IS', 'VAF',
  'LOH', 'CHIP', 'CRS', 'SIRS', 'DIC', 'TACO', 'RBCs', 'nRBC',
  'Golf-ball', 'Bite cells', 'Heinz', 'Auer', 'Reed-Sternberg',
  'Bence Jones', 'Döhle bodies', 'Dohle', 'Pelger-Huet',
  'Rouleaux', 'Sia', 'Bombay', 'PV', 'ET',
];

const HIGHLIGHT_TERMS = [
  // Hemoglobinopathies
  'تالاسمی آلفا', 'تالاسمی بتا', 'تالاسمی ماژور', 'تالاسمی مینور',
  'تالاسمی اینترمدیا', 'کم‌خونی داسی‌شکل', 'هیدروپس فتالیس',
  'بیماری HbH', 'هموگلوبینوپاتی', 'آنمی سیدروبلاستیک',

  // Membrane defects
  'اسفروسیتوز ارثی', 'الیپتوسیتوز ارثی', 'اسفروسیتوز',

  // Enzyme defects
  'کمبود G6PD', 'کمبود پیروات کیناز', 'فاویسم', 'آنزیم‌پاتی',

  // Anemias
  'آنمی آپلاستیک', 'آنمی فقر آهن', 'آنمی مگالوبلاستیک',
  'آنمی التهاب', 'آنمی پرنیشیوز', 'آپلازی خالص گلبول قرمز',
  'کم‌خونی‌های ماکروسیتیک', 'کم‌خونی میکروسیتیک',
  'کم‌خونی همولیتیک خودایمن', 'آنمی همولیتیک اکتسابی',
  'آنمی همولیتیک', 'آنمی نورموسیتیک',

  // Hemolysis
  'همولیز اکستراواسکولار', 'همولیز اینتراواسکولار',
  'همولیز ایمنی', 'همولیز میکروآنژیوپاتیک',
  'همولیز مکانیکی', 'همولیز مزمن', 'آمیلوئیدوز AL',
  'آمیلوئیدوز اولیه', 'آمیلوئیدوز سیستمیک',
  'هموگلوبینوری شبانه پاروکسیسمال',

  // Leukemias / lymphomas
  'لوسمی میلوژنوس مزمن', 'لوسمی میلوئید حاد',
  'لوسمی حاد پرومیلوسیتی', 'لوسمی حاد لنفوسیتی',
  'لوسمی لنفوسیتی مزمن', 'لنفوم فولیکولار', 'لنفوم بورکیت',
  'لنفوم هوچکین', 'لنفوم غیرهوچکین', 'سارکوم یوئینگ',
  'کروموزوم فیلادلفیا', 'سندرم Li-Fraumeni',
  'نئوپلاسم‌های میلوپرولیفراتیو',

  // MPN
  'پلی‌سیتمی ورا', 'میلوفیبروز اولیه', 'ترومبوسیتوز اولیه',
  'ماکروگلوبولینمی والدنشتروم', 'میلوفیبروز مزمن',
  'لوسمی نوتروفیلیک مزمن', 'لوسمی ائوزینوفیلیک مزمن',

  // Plasma cell
  'مولتیپل میلوما', 'پلاسماسیتوما', 'پلاسماسل لوسمی',
  'گاموپاتی مونوکلونال', 'پاراپروتئینمی', 'دیسکرازی پلاسماسل',

  // Hemostasis
  'پورپورای ترومبوسیتوپنیک ایمنی', 'ترومبوسیتوپنی ترومبوتیک',
  'سندرم همولیتیک اورمیک', 'هیپرفیبرینولیز', 'هموفیلی A',
  'هموفیلی B', 'بیماری فون ویلبراند', 'سندرم فانکونی',
  'ترومبوسیتوپنی ترومبوتیک ترومبوسیتوپنیک',

  // Crises
  'بحران همولیتیک', 'بحران آپلاستیک', 'بحران واسکولار',
  'بحران بلاستیک', 'بحران داسی‌شدن', 'ترومبوز ورید کبدی',
  'اسکوستراسیون طحال',

  // Syndromes
  'سندرم لیز تومور', 'سندرم ورید اجوف فوقانی',
  'سندرم Eaton-Lambert', 'سندرم کوشینگ', 'سندرم هورنر',
  'سندرم Pancoast', 'سندرم Budd-Chiari', 'سندرم Felty',
  'سندرم WHIM', 'سندرم Chédiak-Higashi', 'سندرم Imerslund',
  'سندرم Gaisböck', 'سندرم Plummer-Vinson', 'بیماری Gaucher',
  'لنفوهیستیوسیتوز هموفاگوسیتیک', 'سندرم فعال‌سازی ماکروفاژ',
  'سندرم لیز', 'سندرم شکنندگی اسمزی',
  'سندرم تونل کارپال', 'سندرم فانکونی بالغ',
  'سندرم Zollinger-Ellison', 'سندرم کریسمس',
  'سندرم Shwachman-Diamond', 'سندرم Diamond-Blackfan',
  'سندرم Kostmann', 'سندرم Hurler', 'سندرم McLeod',
  'سندرم Tangier', 'بیماری Niemann-Pick', 'بیماری Wolman',

  // Neurological
  'مننژیت نئوپلاستیک', 'فشردگی نخاع', 'افزایش فشار داخل جمجمه',
  'دژنراسیون طناب خلفی', 'ماکروگلوسی', 'علامت راکون‌آی',
  'نوروپاتی محیطی', 'نوروپاتی حسی', 'آتاکسی', 'رومبرگ',

  // GI
  'مری بارت', 'لینیتیس پلاستیکا', 'آدنوکارسینوم',
  'کلانژیوکارسینوما', 'کارسینوم هپاتوسلولار', 'انسداد روده',
  'انتروکولیت نوتروپنیک', 'تیفلیت', 'متاپلازی روده‌ای',
  'گاستریت آتروفیک', 'سوءجذب', 'گلوتن‌انتروپاتی',
  'سندرم روده تحریک‌پذیر', 'زخم پپتیک',

  // Pulmonary
  'ندول ریوی منفرد', 'لکوستاز', 'هموپتیزی ماسیو',
  'هموپتیزی', 'افیوژن پلورال', 'انسداد راه هوایی',
  'پانکواست', 'سندرم سولکوس فوقانی',

  // Emergencies
  'هیپرکلسمی', 'هیپوناترمی', 'اسید لاکتیک', 'هیپوگلیسمی',
  'نارسایی آدرنال', 'سیستیت هموراژیک', 'آنافیلاکسی',
  'شوک سپتیک', 'سپسیس', 'نارسایی حاد کلیه', 'آسیت',
  'انسفالوپاتی', 'هپاتیت', 'پنومونی',

  // Specific conditions
  'هیپراوریکمی', 'هیپرفسفاتمی', 'هیپوکلسمی', 'هیپرکالمی',
  'هیپوکالمی', 'هیپوگلیسمی کاذب', 'هایپرلکوسیتوز',
  'هایپرویسکوزیته', 'ترومبوسیتوز', 'لکوسیتوز',
  'نوتروپنی', 'نوتروفیلی', 'لکوپنی', 'پانسیتوپنی',
  'بی‌سیتوپنی', 'سیتوپنی',
  'ترومبوسیتوپنی', 'آنمی', 'پلی‌سیتمی',
  'میلوفیبروز', 'فیبروز مغز استخوان', 'مغز استخوان هیپوسلولار',
  'مغز استخوان هایپرسلولار', 'دیسپلازی',

  // Other
  'کمبود ویتامین K', 'کمبود آهن', 'کمبود B12', 'کمبود فولات',
  'کمبود مس', 'کمبود روی', 'کمبود G6PD',
  'هایپرپاراتیروئیدیسم', 'هیپوتیروئیدی', 'هیپوفیزیت',
  'دیسپروتئینمی', 'هیپرگاماگلوبولینمی', 'هیپوگاماگلوبولینمی',
  'آگاماگلوبولینمی', 'ایمونوگلوبولین',
];

// Numbers with units — matches Persian & English digits
const NUMBER_RE = /((?:[۰-۹]+|[0-9]+)(?:[.,][۰-۹0-9]+)?(?:\s*[-–]\s*(?:[۰-۹]+|[0-9]+)(?:[.,][۰-۹0-9]+)?)?\s*(?:روز|ساعت|سال|ماه|هفته|گرم|میلی‌گرم|گرم در دسی‌لیتر|g\/dL|mg\/dL|میلی‌لیتر|لیتر|میلی‌مول|میکرومول|واحد|فیلد|فیلم|٪|%|fL|pg|mg|Bq\/m3|Gy|rad|IU|µL|μL|mL|L|cP|kDa|bp|log|pack-year|pack-years|روز بعد|mm|cm|g\/L|kg|nm|pmol\/L|µmol\/L|mU\/L))(?![0-9۰-۹])/g;

const WARNING_PHRASES = [
  'ناسازگار با حیات',
  'کشندگی بیش از ۹۰٪',
  'کشندگی >۹۰٪',
  'کشندگی بالا',
  'مرگ‌ومیر بالا',
  'مورتالیتی بالا',
  'علت اصلی مرگ',
  'علت شایع مرگ',
  'کشنده',
  'شدیدترین',
  'تهدیدکننده حیات',
  'تهدیدکننده زندگی',
  'حاد و شدید',
  'بدخیم',
  'مقاوم به درمان',
  'مقاومت',
  'بی‌اثر',
  'شکست درمان',
  'پاسخ ناکافی',
  'فقدان پاسخ',
  'عدم پاسخ',
  'شایع‌ترین ژن جهش‌یافته',
  'پیش‌آگهی بد',
  'بدترین پیش‌آگهی',
  'پیش‌آگهی ضعیف',
  'پرخطر',
  'خطر بالا',
  'خطر افزایش‌یافته',
  'خطر بیشتر',
  'فرار ایمنی',
  'سمیت کنترل‌نشده',
  'خونریزی مغزی',
  'خونریزی داخل‌جمجمه‌ای',
  'خونریزی خودبه‌خودی',
  'شوک سپتیک',
  'سندرم کمپارتمان',
  'نارسایی حاد کلیه',
  'نارسایی ارگان',
  'منع مصرف',
  'نباید داده شود',
  'ممنوع است',
  'اجتناب شود',
  'اجتناب‌ناپذیر',
  'بی‌مهار',
  'بدون درمان قطعی',
  'درمان قطعی ندارد',
  'بدون درمان مؤثر',
  'پیشرفت سریع',
  'بدتر شدن سریع',
  'بدتر شدن تحت حاد',
  'بدون علامت',
  'آنرژیک',
  'مداخله فوری',
  'اورژانس پزشکی',
  'حالت اورژانسی',
  'بحران',
  'عوارض جدی',
  'عوارض off-target',
  'ریسک بالای عفونت',
  'وابسته به ترانسفوزیون',
  'وابسته به ترانسفوزیون مادام‌العمر',
  'ماسپرشن',
  'میلوساپرشن',
  'نقص ایمنی',
  'کمبود ایمنی',
];

// ─────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────

function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Sort longest-first so nested terms work correctly.
const BOLD_SORTED = [...BOLD_TERMS].sort((a, b) => b.length - a.length);
const HIGHLIGHT_SORTED = [...HIGHLIGHT_TERMS].sort((a, b) => b.length - a.length);
const WARNING_SORTED = [...WARNING_PHRASES].sort((a, b) => b.length - a.length);

// Latin word: must be surrounded by non-word chars (or line edges).
function latinBoundary(term) {
  const esc = escapeRegExp(term);
  // If the term starts/ends with non-letter, don't force a word boundary.
  const start = /^[A-Za-z0-9]/.test(term) ? '(?<![\\w\\*])' : '';
  const end = /[A-Za-z0-9]$/.test(term) ? '(?![\\w\\*])' : '';
  return new RegExp(`${start}${esc}${end}`, 'g');
}

// Persian phrase: not already wrapped by one of our markers.
function persianRegex(term) {
  const esc = escapeRegExp(term);
  // Avoid matching inside an existing wrapper.
  return new RegExp(`(?<![=\\+@])(?<!\\*\\*)${esc}(?![=\\+@])(?!\\*\\*)`, 'g');
}

// ─────────────────────────────────────────────────────────────
// ENRICHMENT
// ─────────────────────────────────────────────────────────────

function applyBold(text) {
  if (!text || typeof text !== 'string') return text;
  let out = text;
  for (const term of BOLD_SORTED) {
    out = out.replace(latinBoundary(term), (match) => `**${match}**`);
  }
  return out;
}

function applyHighlight(text) {
  if (!text || typeof text !== 'string') return text;
  let out = text;
  for (const term of HIGHLIGHT_SORTED) {
    out = out.replace(persianRegex(term), (match) => `==${match}==`);
  }
  return out;
}

function applyWarning(text) {
  if (!text || typeof text !== 'string') return text;
  let out = text;
  for (const term of WARNING_SORTED) {
    out = out.replace(persianRegex(term), (match) => `@@${match}@@`);
  }
  return out;
}

function applyNumbers(text) {
  if (!text || typeof text !== 'string') return text;
  // Don't touch numbers already inside any markup.
  return text.replace(NUMBER_RE, (match) => {
    // Skip if this match is inside an existing wrapper.
    // Simple heuristic: assume safe since we run number pass last-ish.
    return `++${match.trim()}++`;
  });
}

/**
 * Full enrichment pipeline for a single string field.
 * Order matters: bold → highlight → warning → numbers.
 */
function enrichString(text) {
  if (!text || typeof text !== 'string') return text;
  if (/^https?:\/\//.test(text)) return text;

  let out = text;

  out = applyBold(out);
  out = applyHighlight(out);
  out = applyWarning(out);
  out = applyNumbers(out);

  // Cleanup: collapse double markup, stray empties.
  out = out.replace(/(\*\*|==|\+\+|@@)\1+/g, '$1$1');
  out = out.replace(/\*\*\*\*/g, '');
  out = out.replace(/====/g, '');
  out = out.replace(/\+\+\+\+/g, '');
  out = out.replace(/@@@@/g, '');

  // Remove empty wrappers like **==** or ++ ++
  out = out.replace(/\*\*\s*\*\*/g, '');
  out = out.replace(/==\s*==/g, '');
  out = out.replace(/\+\+\s*\+\+/g, '');
  out = out.replace(/@@\s*@@/g, '');

  return out;
}

function enrichCard(card) {
  if (!card || typeof card !== 'object') return;
  const fields = ['title', 'content', 'question', 'answer', 'explanation'];
  for (const f of fields) {
    if (typeof card[f] === 'string') {
      card[f] = enrichString(card[f]);
    }
  }
  if (Array.isArray(card.options)) {
    card.options = card.options.map((o) =>
      typeof o === 'string' ? enrichString(o) : o
    );
  }
  if (Array.isArray(card.columns)) {
    card.columns = card.columns.map((c) =>
      typeof c === 'string' ? enrichString(c) : c
    );
  }
  if (Array.isArray(card.headers)) {
    card.headers = card.headers.map((c) =>
      typeof c === 'string' ? enrichString(c) : c
    );
  }
  if (Array.isArray(card.rows)) {
    card.rows = card.rows.map((row) =>
      Array.isArray(row)
        ? row.map((cell) =>
            typeof cell === 'string' ? enrichString(cell) : cell
          )
        : row
    );
  }
}

// ─────────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────────

function main() {
  if (!fs.existsSync(SESSIONS_DIR)) {
    console.error(`❌ پوشه پیدا نشد: ${SESSIONS_DIR}`);
    process.exit(1);
  }

  const files = fs
    .readdirSync(SESSIONS_DIR)
    .filter((f) => f.endsWith('.json') && !f.startsWith('.'))
    .sort();

  console.log(`📂 ${files.length} فایل در ${SESSIONS_DIR}\n`);

  let totalCards = 0;
  let changedCards = 0;
  const summary = [];

  for (const file of files) {
    const full = path.join(SESSIONS_DIR, file);
    const raw = fs.readFileSync(full, 'utf8');

    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch (e) {
      console.error(`🔴 ${file}: JSON خراب است — ${e.message}`);
      continue;
    }

    const session = parsed.session ?? parsed;
    const sections = session.sections ?? [];

    let fileCards = 0;
    let fileChanged = 0;

    for (const sec of sections) {
      for (const card of sec.cards ?? []) {
        const before = JSON.stringify(card);
        enrichCard(card);
        const after = JSON.stringify(card);
        if (before !== after) fileChanged++;
        fileCards++;
      }
    }

    fs.writeFileSync(full, JSON.stringify(parsed, null, 2) + '\n', 'utf8');

    totalCards += fileCards;
    changedCards += fileChanged;
    summary.push({
      'فایل': file,
      'کارت‌ها': fileCards,
      'تغییر یافته': fileChanged,
    });
    console.log(
      `  ✅ ${file.padEnd(22)} → ${String(fileChanged).padStart(3)} / ${fileCards}`
    );
  }

  console.log('');
  console.table(summary);
  console.log('');
  console.log(`🎉 کل: ${totalCards} کارت بررسی شد، ${changedCards} کارت تغییر کرد`);
  console.log('');
  console.log('💡 اگر نتیجه خوب نبود:');
  console.log('   rm -rf src/data/sessions && mv src/data/sessions.bak src/data/sessions');
}

main();