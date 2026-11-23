/**
 * Seed script — populates the database with realistic sample data.
 *
 * Creates 6 users, 15 cases (12 active + 3 legacy disposed), 19 hearings,
 * and 6 judgments.
 *
 * Exposes two reusable functions:
 *  - `seedDatabase()` : wipes + inserts (assumes DB is already connected)
 *  - `seedIfEmpty()`  : only seeds when no users exist (used on server boot)
 *
 * When run directly as `node seed.js`, connects, seeds, disconnects, exits.
 */
require('dotenv').config();

const { connectDB, closeDB } = require('../config/db');
const User = require('../models/User');
const Case = require('../models/Case');
const Hearing = require('../models/Hearing');
const Judgment = require('../models/Judgment');

const DEFAULT_PASSWORD = 'password123';

// Helper to build a Date N days from a fixed reference (relative to "now").
function daysFromNow(days, hour = 10, minute = 0) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(hour, minute, 0, 0);
  return d;
}

/** User seed data. Password is set on the doc (pre-save hook hashes it). */
const usersSeed = [
  {
    name: 'System Administrator',
    email: 'admin@judiciary.gov',
    password: DEFAULT_PASSWORD,
    role: 'admin',
    employeeId: 'ADM001',
    phone: '+91 98100 00001',
    court: 'High Court - Mumbai',
  },
  {
    name: 'Justice Anil Sharma',
    email: 'anil.sharma@judiciary.gov',
    password: DEFAULT_PASSWORD,
    role: 'judge',
    employeeId: 'JUD101',
    phone: '+91 98100 00002',
    specialization: 'Criminal Law',
    court: 'High Court - Mumbai',
  },
  {
    name: 'Justice Priya Mehta',
    email: 'priya.mehta@judiciary.gov',
    password: DEFAULT_PASSWORD,
    role: 'judge',
    employeeId: 'JUD102',
    phone: '+91 98100 00003',
    specialization: 'Family Law',
    court: 'High Court - Mumbai',
  },
  {
    name: 'Adv. Rajesh Kumar',
    email: 'rajesh.kumar@lawyer.com',
    password: DEFAULT_PASSWORD,
    role: 'lawyer',
    barNumber: 'MAH/2015/0456',
    phone: '+91 98100 00004',
    specialization: 'Criminal Law',
  },
  {
    name: 'Adv. Sneha Reddy',
    email: 'sneha.reddy@lawyer.com',
    password: DEFAULT_PASSWORD,
    role: 'lawyer',
    barNumber: 'MAH/2017/0892',
    phone: '+91 98100 00005',
    specialization: 'Civil Law',
  },
  {
    name: 'Registrar Suresh Iyer',
    email: 'suresh.iyer@judiciary.gov',
    password: DEFAULT_PASSWORD,
    role: 'registrar',
    employeeId: 'REG001',
    phone: '+91 98100 00006',
    court: 'High Court - Mumbai',
  },
];

/**
 * Cases seed. `judge` / `lawyer` / `registrar` are filled in by email
 * lookup at run-time so the references stay valid.
 */
const casesSeed = [
  {
    caseNumber: 'CRL/2024/001',
    title: 'State v. Ramesh Gupta',
    caseType: 'Criminal',
    status: 'In Progress',
    plaintiff: 'State of Maharashtra',
    defendant: 'Ramesh Gupta',
    description:
      'The accused is charged under Sections 420 and 468 of the IPC for an alleged real-estate fraud amounting to ₹1.2 crore. The prosecution has filed 12 witness statements and 7 documentary exhibits. The defense contends that the transactions were civil in nature and that the accused had no mens rea. The trial is at the stage of cross-examination of the investigating officer.',
    judgeEmail: 'anil.sharma@judiciary.gov',
    lawyerEmail: 'rajesh.kumar@lawyer.com',
    registrarEmail: 'suresh.iyer@judiciary.gov',
    priority: 'High',
    courtRoom: 'Court Room 1',
    filingDate: daysFromNow(-120, 9, 30),
    nextHearingDate: daysFromNow(8, 11, 0),
  },
  {
    caseNumber: 'CIV/2024/002',
    title: 'Sharma v. Sharma Properties',
    caseType: 'Civil',
    status: 'Pending',
    plaintiff: 'Ramesh Sharma',
    defendant: 'Sharma Properties Pvt. Ltd.',
    description:
      'A civil suit seeking specific performance of a sale agreement dated 12 March 2023. The plaintiff claims the defendant backed out of selling a commercial unit after accepting a token advance of ₹25 lakh. The defendant argues the agreement was conditional on board approval that was never granted. Discovery of internal board minutes is pending.',
    judgeEmail: 'priya.mehta@judiciary.gov',
    lawyerEmail: 'sneha.reddy@lawyer.com',
    registrarEmail: 'suresh.iyer@judiciary.gov',
    priority: 'Medium',
    courtRoom: 'Court Room 2',
    filingDate: daysFromNow(-90, 10, 0),
    nextHearingDate: daysFromNow(15, 14, 0),
  },
  {
    caseNumber: 'FAM/2024/003',
    title: 'Mehta v. Mehta',
    caseType: 'Family',
    status: 'In Progress',
    plaintiff: 'Anita Mehta',
    defendant: 'Rohit Mehta',
    description:
      'A petition under Section 13 of the Hindu Marriage Act seeking divorce on grounds of cruelty and desertion. The petitioner has also sought custody of the two minor children and interim maintenance of ₹60,000 per month. Mediation ordered by the court failed to reach a settlement. Currently at the stage of evidence of the petitioner.',
    judgeEmail: 'priya.mehta@judiciary.gov',
    lawyerEmail: 'sneha.reddy@lawyer.com',
    registrarEmail: 'suresh.iyer@judiciary.gov',
    priority: 'High',
    courtRoom: 'Court Room 3',
    filingDate: daysFromNow(-80, 11, 0),
    nextHearingDate: daysFromNow(5, 10, 30),
  },
  {
    caseNumber: 'CRL/2024/004',
    title: 'State v. Imran Khan',
    caseType: 'Criminal',
    status: 'Adjourned',
    plaintiff: 'State of Maharashtra',
    defendant: 'Imran Khan',
    description:
      'The accused faces charges under Sections 307 (attempt to murder) and 326 (voluntarily causing grievous hurt by dangerous weapons) of the IPC arising out of a bar altercation in Andheri. The key eyewitness has been unwell and unable to attend the last two hearings. The defense has filed an application for bail, pending decision.',
    judgeEmail: 'anil.sharma@judiciary.gov',
    lawyerEmail: 'rajesh.kumar@lawyer.com',
    registrarEmail: 'suresh.iyer@judiciary.gov',
    priority: 'High',
    courtRoom: 'Court Room 1',
    filingDate: daysFromNow(-70, 9, 0),
    nextHearingDate: daysFromNow(12, 11, 30),
  },
  {
    caseNumber: 'CIV/2024/005',
    title: 'Tata Industries v. XYZ Corp',
    caseType: 'Civil',
    status: 'In Progress',
    plaintiff: 'Tata Industries Ltd.',
    defendant: 'XYZ Corp',
    description:
      'A commercial dispute over breach of a supply contract worth ₹4.5 crore. The plaintiff alleges the defendant failed to deliver critical components on schedule, causing cascading production losses. The defendant has filed a counter-claim alleging the plaintiff\'s specifications were unworkable. The court appointed an independent technical commissioner whose report is awaited.',
    judgeEmail: 'priya.mehta@judiciary.gov',
    lawyerEmail: 'sneha.reddy@lawyer.com',
    registrarEmail: 'suresh.iyer@judiciary.gov',
    priority: 'Medium',
    courtRoom: 'Court Room 2',
    filingDate: daysFromNow(-65, 10, 0),
    nextHearingDate: daysFromNow(20, 15, 30),
  },
  {
    caseNumber: 'PROP/2024/006',
    title: 'Patel v. Patel Estate',
    caseType: 'Property',
    status: 'Pending',
    plaintiff: 'Jignesh Patel',
    defendant: 'Patel Estate Holdings',
    description:
      'A partition suit concerning ancestral agricultural land in Nashik district measuring approximately 14 acres. The plaintiff seeks division of the property per the 1972 family settlement. The defendant disputes the validity of the settlement deed and contends that a portion of the land was already gifted. Revenue records have been called for.',
    judgeEmail: 'anil.sharma@judiciary.gov',
    lawyerEmail: 'rajesh.kumar@lawyer.com',
    registrarEmail: 'suresh.iyer@judiciary.gov',
    priority: 'Low',
    courtRoom: 'Court Room 4',
    filingDate: daysFromNow(-55, 9, 30),
    nextHearingDate: daysFromNow(25, 14, 0),
  },
  {
    caseNumber: 'CRL/2024/007',
    title: 'State v. Vijay Singh',
    caseType: 'Criminal',
    status: 'Disposed',
    plaintiff: 'State of Maharashtra',
    defendant: 'Vijay Singh',
    description:
      'The accused was convicted under Sections 380 (theft in dwelling) and 411 (dishonestly receiving stolen property) of the IPC for a series of house-break-ins in the western suburbs. The prosecution relied on CCTV footage, fingerprint matches, and the recovery of stolen items from the accused\'s residence. The defense pleaded lack of mens rea.',
    judgeEmail: 'anil.sharma@judiciary.gov',
    lawyerEmail: 'rajesh.kumar@lawyer.com',
    registrarEmail: 'suresh.iyer@judiciary.gov',
    priority: 'Medium',
    courtRoom: 'Court Room 1',
    filingDate: daysFromNow(-200, 9, 0),
    nextHearingDate: null,
  },
  {
    caseNumber: 'CON/2024/008',
    title: 'PIL: Environment Watch v. Union of India',
    caseType: 'Constitutional',
    status: 'In Progress',
    plaintiff: 'Environment Watch (NGO)',
    defendant: 'Union of India',
    description:
      'A public interest litigation seeking directions to enforce construction dust norms at major infrastructure projects in the Mumbai Metropolitan Region. The petitioners allege violation of NGT guidelines and Article 21 right to a clean environment. The Union has filed an affidavit outlining compliance measures. The bench is considering appointment of an amicus curiae.',
    judgeEmail: 'priya.mehta@judiciary.gov',
    lawyerEmail: 'sneha.reddy@lawyer.com',
    registrarEmail: 'suresh.iyer@judiciary.gov',
    priority: 'High',
    courtRoom: 'Court Room 5',
    filingDate: daysFromNow(-45, 10, 30),
    nextHearingDate: daysFromNow(18, 10, 0),
  },
  {
    caseNumber: 'FAM/2024/009',
    title: 'Khan v. Khan',
    caseType: 'Family',
    status: 'Filed',
    plaintiff: 'Fatima Khan',
    defendant: 'Asif Khan',
    description:
      'A petition under the Muslim Women (Protection of Rights on Divorce) Act, 1986, seeking maintenance and the return of personal effects and mehr amount of ₹1,50,000. The petitioner alleges desertion since November 2023. The matter is at the filing stage; notice to the respondent is pending service.',
    judgeEmail: 'priya.mehta@judiciary.gov',
    lawyerEmail: 'sneha.reddy@lawyer.com',
    registrarEmail: 'suresh.iyer@judiciary.gov',
    priority: 'Medium',
    courtRoom: 'Court Room 3',
    filingDate: daysFromNow(-20, 11, 0),
    nextHearingDate: daysFromNow(28, 11, 30),
  },
  {
    caseNumber: 'CIV/2024/010',
    title: 'Bank v. Defaulter Co.',
    caseType: 'Civil',
    status: 'Disposed',
    plaintiff: 'Apex Bank Ltd.',
    defendant: 'Defaulter Co. Pvt. Ltd.',
    description:
      'A recovery suit filed by the bank under the Recovery of Debts Due to Banks and Financial Institutions Act for an outstanding loan of ₹3.8 crore plus interest. The defendant did not contest the claim effectively; an ex-parte hearing was conducted after multiple non-appearances. The tribunal passed a decree in favour of the bank.',
    judgeEmail: 'anil.sharma@judiciary.gov',
    lawyerEmail: 'rajesh.kumar@lawyer.com',
    registrarEmail: 'suresh.iyer@judiciary.gov',
    priority: 'Low',
    courtRoom: 'Court Room 2',
    filingDate: daysFromNow(-180, 10, 0),
    nextHearingDate: null,
  },
  {
    caseNumber: 'CRL/2024/011',
    title: 'State v. Unknown',
    caseType: 'Criminal',
    status: 'Pending',
    plaintiff: 'State of Maharashtra',
    defendant: 'Unknown Person(s)',
    description:
      'An FIR under Sections 448 (house-trespass) and 452 read with 380 IPC registered on the basis of a complaint regarding a break-in at a jewellery shop in Bandra. The accused remains unidentified; the investigation is ongoing with CCTV analysis. The matter is being monitored by the court for periodic status reports from the police.',
    judgeEmail: 'anil.sharma@judiciary.gov',
    lawyerEmail: 'rajesh.kumar@lawyer.com',
    registrarEmail: 'suresh.iyer@judiciary.gov',
    priority: 'Medium',
    courtRoom: 'Court Room 1',
    filingDate: daysFromNow(-40, 9, 0),
    nextHearingDate: daysFromNow(22, 14, 30),
  },
  {
    caseNumber: 'PROP/2024/012',
    title: 'Realty Group v. Municipal Corp',
    caseType: 'Property',
    status: 'Closed',
    plaintiff: 'Realty Group Developers',
    defendant: 'Municipal Corporation of Greater Mumbai',
    description:
      'A writ petition challenging the municipal corporation\'s refusal to grant an Occupation Certificate for a residential tower in Powai on grounds of alleged setback violations. The court directed a joint inspection by the corporation and the developer; the inspection report confirmed compliance after corrective work. The petition was disposed accordingly and the matter closed.',
    judgeEmail: 'priya.mehta@judiciary.gov',
    lawyerEmail: 'sneha.reddy@lawyer.com',
    registrarEmail: 'suresh.iyer@judiciary.gov',
    priority: 'High',
    courtRoom: 'Court Room 4',
    filingDate: daysFromNow(-220, 10, 0),
    nextHearingDate: null,
  },
];

/**
 * Hearings seed. `caseNumber`, `judgeEmail` resolved at run-time.
 * Mix of past (Completed) and upcoming (Scheduled) for active cases.
 */
const hearingsSeed = [
  // Case 1: CRL/2024/001 — In Progress
  {
    caseNumber: 'CRL/2024/001', daysOffset: -60, time: '10:00', courtRoom: 'Court Room 1',
    judgeEmail: 'anil.sharma@judiciary.gov', status: 'Completed',
    agenda: 'Framing of charges', notes: 'Charges framed under Sec 420, 468 IPC. Accused pleads not guilty. Witness summons issued.',
  },
  {
    caseNumber: 'CRL/2024/001', daysOffset: -25, time: '11:30', courtRoom: 'Court Room 1',
    judgeEmail: 'anil.sharma@judiciary.gov', status: 'Completed',
    agenda: 'Examination of PW-1 and PW-2', notes: 'Both prosecution witnesses examined and cross-examined. IO testimony scheduled next.',
  },
  {
    caseNumber: 'CRL/2024/001', daysOffset: 8, time: '11:00', courtRoom: 'Court Room 1',
    judgeEmail: 'anil.sharma@judiciary.gov', status: 'Scheduled',
    agenda: 'Cross-examination of Investigating Officer', notes: '',
  },
  // Case 2: CIV/2024/002 — Pending
  {
    caseNumber: 'CIV/2024/002', daysOffset: -30, time: '14:00', courtRoom: 'Court Room 2',
    judgeEmail: 'priya.mehta@judiciary.gov', status: 'Completed',
    agenda: 'Admission/denial of documents', notes: 'Documents admitted subject to proof. Defendant to file list of relied-upon documents.',
  },
  {
    caseNumber: 'CIV/2024/002', daysOffset: 15, time: '14:00', courtRoom: 'Court Room 2',
    judgeEmail: 'priya.mehta@judiciary.gov', status: 'Scheduled',
    agenda: 'Filing of board minutes', notes: '',
  },
  // Case 3: FAM/2024/003 — In Progress
  {
    caseNumber: 'FAM/2024/003', daysOffset: -40, time: '10:30', courtRoom: 'Court Room 3',
    judgeEmail: 'priya.mehta@judiciary.gov', status: 'Completed',
    agenda: 'Mediation report', notes: 'Mediation unsuccessful. Court directs petitioner to lead evidence.',
  },
  {
    caseNumber: 'FAM/2024/003', daysOffset: -10, time: '10:30', courtRoom: 'Court Room 3',
    judgeEmail: 'priya.mehta@judiciary.gov', status: 'Completed',
    agenda: 'Petitioner evidence (PW-1)', notes: 'Petitioner examined. Cross-examination deferred at request of respondent counsel.',
  },
  {
    caseNumber: 'FAM/2024/003', daysOffset: 5, time: '10:30', courtRoom: 'Court Room 3',
    judgeEmail: 'priya.mehta@judiciary.gov', status: 'Scheduled',
    agenda: 'Cross-examination of petitioner', notes: '',
  },
  // Case 4: CRL/2024/004 — Adjourned
  {
    caseNumber: 'CRL/2024/004', daysOffset: -35, time: '11:30', courtRoom: 'Court Room 1',
    judgeEmail: 'anil.sharma@judiciary.gov', status: 'Adjourned',
    agenda: 'Eyewitness testimony', notes: 'Eyewitness unwell. Hearing adjourned. Bail application kept pending.',
  },
  {
    caseNumber: 'CRL/2024/004', daysOffset: 12, time: '11:30', courtRoom: 'Court Room 1',
    judgeEmail: 'anil.sharma@judiciary.gov', status: 'Scheduled',
    agenda: 'Eyewitness testimony + bail hearing', notes: '',
  },
  // Case 5: CIV/2024/005 — In Progress
  {
    caseNumber: 'CIV/2024/005', daysOffset: -28, time: '15:30', courtRoom: 'Court Room 2',
    judgeEmail: 'priya.mehta@judiciary.gov', status: 'Completed',
    agenda: 'Commissioner appointment', notes: 'Independent technical commissioner appointed. Report awaited.',
  },
  {
    caseNumber: 'CIV/2024/005', daysOffset: 20, time: '15:30', courtRoom: 'Court Room 2',
    judgeEmail: 'priya.mehta@judiciary.gov', status: 'Scheduled',
    agenda: 'Commissioner report submission', notes: '',
  },
  // Case 6: PROP/2024/006 — Pending
  {
    caseNumber: 'PROP/2024/006', daysOffset: -20, time: '14:00', courtRoom: 'Court Room 4',
    judgeEmail: 'anil.sharma@judiciary.gov', status: 'Completed',
    agenda: 'First hearing — directions', notes: 'Court calls for revenue records from Tehsildar, Nashik.',
  },
  {
    caseNumber: 'PROP/2024/006', daysOffset: 25, time: '14:00', courtRoom: 'Court Room 4',
    judgeEmail: 'anil.sharma@judiciary.gov', status: 'Scheduled',
    agenda: 'Submission of revenue records', notes: '',
  },
  // Case 8: CON/2024/008 — In Progress
  {
    caseNumber: 'CON/2024/008', daysOffset: -15, time: '10:00', courtRoom: 'Court Room 5',
    judgeEmail: 'priya.mehta@judiciary.gov', status: 'Completed',
    agenda: 'Union affidavit compliance', notes: 'Affidavit filed. Court considering appointment of amicus curiae.',
  },
  {
    caseNumber: 'CON/2024/008', daysOffset: 18, time: '10:00', courtRoom: 'Court Room 5',
    judgeEmail: 'priya.mehta@judiciary.gov', status: 'Scheduled',
    agenda: 'Consideration of amicus appointment', notes: '',
  },
  // Case 9: FAM/2024/009 — Filed
  {
    caseNumber: 'FAM/2024/009', daysOffset: 28, time: '11:30', courtRoom: 'Court Room 3',
    judgeEmail: 'priya.mehta@judiciary.gov', status: 'Scheduled',
    agenda: 'Service of notice and first appearance', notes: '',
  },
  // Case 11: CRL/2024/011 — Pending
  {
    caseNumber: 'CRL/2024/011', daysOffset: -10, time: '14:30', courtRoom: 'Court Room 1',
    judgeEmail: 'anil.sharma@judiciary.gov', status: 'Completed',
    agenda: 'Status report from investigating officer', notes: 'CCTV analysis in progress. Next status report in 30 days.',
  },
  {
    caseNumber: 'CRL/2024/011', daysOffset: 22, time: '14:30', courtRoom: 'Court Room 1',
    judgeEmail: 'anil.sharma@judiciary.gov', status: 'Scheduled',
    agenda: 'Further status report', notes: '',
  },
];

/**
 * Judgments seed. `caseNumber` and `judgeEmail` resolved at run-time.
 * Includes a legacy disposed case (CRL/2023/099) that is created on the fly
 * to host one extra judgment, since all other disposed cases already have one.
 */
const judgmentsSeed = [
  {
    caseNumber: 'CRL/2024/007',
    judgeEmail: 'anil.sharma@judiciary.gov',
    judgmentDate: daysFromNow(-50, 12, 0),
    verdict: 'Guilty',
    summary:
      'The court found the accused guilty under Sections 380 and 411 IPC based on corroborated CCTV evidence, fingerprint matches, and recovery of stolen items. The defense of lacking mens rea was rejected as the accused was found in conscious possession of stolen property shortly after the incidents.',
    fullText:
      'The prosecution has established beyond reasonable doubt that the accused committed a series of house-break-ins in the western suburbs between January and April 2024. CCTV footage from three locations clearly identifies the accused entering the premises at the material times. Fingerprint analysis conducted by the State Forensic Laboratory returned positive matches on 9 of 11 lifted prints. Stolen jewellery and electronic items were recovered from the accused\'s residence pursuant to a lawful search under Section 100 CrPC. The defense argued that the accused was a receiver of stolen goods without knowledge of their provenance; however, the proximity in time between the thefts and recovery, combined with the absence of any plausible explanation for possession, rebuts this contention. The accused is convicted under Sections 380 and 411 IPC. Sentence will be pronounced separately.',
    sentenceOrRelief: '5 years rigorous imprisonment + fine ₹50,000',
  },
  {
    caseNumber: 'CIV/2024/010',
    judgeEmail: 'anil.sharma@judiciary.gov',
    judgmentDate: daysFromNow(-45, 12, 0),
    verdict: 'In Favor of Plaintiff',
    summary:
      'The tribunal decreed the suit in favour of the plaintiff bank for the outstanding loan amount of ₹3.8 crore plus contractual interest, holding that the defendant had failed to discharge its repayment obligations and had not contested the claim despite due service of notice.',
    fullText:
      'The plaintiff bank has filed the present recovery suit for an outstanding loan amount of ₹3.8 crore plus interest, pursuant to a term loan agreement dated 5 February 2022. The defendant was duly served with notice under Section 13(2) of the SARFAESI Act and the present plaint. Despite adequate opportunity, the defendant chose not to enter appearance or contest the claim. The documentary evidence on record — the loan agreement, account statements, and demand notices — stands unrebutted. In view of the clear default and the absence of any triable defense, the plaintiff is entitled to a decree. The defendant is liable to pay the principal of ₹3.8 crore along with contractual interest @ 12% per annum from the date of default until realization, together with costs of the suit.',
    sentenceOrRelief: '₹25 lakh damages awarded (decree for outstanding principal + interest)',
  },
  {
    caseNumber: 'PROP/2024/012',
    judgeEmail: 'priya.mehta@judiciary.gov',
    judgmentDate: daysFromNow(-30, 12, 0),
    verdict: 'In Favor of Defendant',
    summary:
      'The court dismissed the petition after a joint inspection confirmed that the developer had complied with setback norms following corrective work. The refusal of the Occupation Certificate was found to be untenable in law and the Corporation was directed to issue the certificate within four weeks.',
    fullText:
      'The petitioner challenged the refusal of the Municipal Corporation to grant an Occupation Certificate for a residential tower in Powai on the ground of alleged setback violations. The court directed a joint inspection by the Corporation and the developer. The inspection report, dated 10 April 2024, confirms that following corrective structural work, the building complies with the sanctioned plan and the prevailing Development Control Regulations. There is no evidence on record to sustain the Corporation\'s refusal. The court therefore disposes of the petition with a direction to the Corporation to issue the Occupation Certificate within four weeks, subject to the petitioner paying the requisite statutory fees. The petitioner is also held entitled to costs of ₹50,000.',
    sentenceOrRelief: 'Petition dismissed with costs; Corporation directed to issue OC',
  },
  {
    caseNumber: 'CRL/2023/099', // legacy disposed case created on the fly
    judgeEmail: 'anil.sharma@judiciary.gov',
    judgmentDate: daysFromNow(-300, 12, 0),
    verdict: 'Acquitted',
    summary:
      'The accused was acquitted of charges under Sections 279 and 304-A IPC for want of credible evidence establishing rash and negligent driving. The sole eyewitness account was inconsistent and the forensic reconstruction did not support the prosecution theory.',
    fullText:
      'The prosecution charged the accused under Sections 279 and 304-A IPC for causing death by rash and negligent driving. The case rested on the testimony of a single eyewitness whose account contained material inconsistencies regarding the speed and direction of the vehicle. The forensic reconstruction tendered by the prosecution did not corroborate the eyewitness on the point of impact. The accused denied the allegation and produced documentary evidence that he was at a different location at the material time, supported by toll receipts. In view of the contradictions in the prosecution case and the failure to establish guilt beyond reasonable doubt, the accused is entitled to the benefit of doubt and is hereby acquitted.',
    sentenceOrRelief: 'Acquitted for lack of evidence',
  },
  {
    caseNumber: 'CIV/2023/055', // second legacy disposed case
    judgeEmail: 'priya.mehta@judiciary.gov',
    judgmentDate: daysFromNow(-260, 12, 0),
    verdict: 'Dismissed',
    summary:
      'The plaintiff\'s suit for declaration of title was dismissed as time-barred and for failure to establish continuous possession within the limitation period. The court held that the cause of action arose more than three years prior to filing.',
    fullText:
      'The plaintiff filed the present suit seeking declaration of title and possession over the suit property measuring approximately 0.4 acres. The defendant contended, inter alia, that the suit was barred by limitation under Article 113 of the Schedule to the Limitation Act, 1963, as the cause of action arose upon the defendant\'s entry into possession in March 2018, whereas the suit was filed in May 2024. On a perusal of the pleadings and the documentary record, the court finds that the plaintiff was aware of the defendant\'s possession since at least June 2018, yet chose to file the suit beyond the prescribed period of three years. No sufficient cause for the delay has been pleaded or proved. The suit is therefore dismissed as barred by limitation, with no order as to costs.',
    sentenceOrRelief: 'Suit dismissed; no order as to costs',
  },
  {
    caseNumber: 'FAM/2023/021', // third legacy disposed case
    judgeEmail: 'priya.mehta@judiciary.gov',
    judgmentDate: daysFromNow(-200, 12, 0),
    verdict: 'Not Guilty',
    summary:
      'In a contested matrimonial petition, the court found that the allegations of cruelty were not substantiated by cogent evidence and dismissed the petition for divorce while granting the respondent the right to reside in the shared household.',
    fullText:
      'The petitioner sought dissolution of marriage under Section 13(1)(ia) of the Hindu Marriage Act on the ground of cruelty. The respondent denied the allegations and filed a counter-affidavit. After examining the evidence, the court finds that the specific instances of cruelty pleaded in the petition — namely alleged verbal abuse, denial of food, and social isolation — are not substantiated by independent corroborative material. The testimony of the petitioner\'s relatives is partisan and does not inspire confidence. The petitioner has failed to discharge the burden of proof. The petition is dismissed. However, considering the financial disparity, the respondent is held entitled to maintain her right of residence in the shared household under Section 19 of the Protection of Women from Domestic Violence Act, 2005.',
    sentenceOrRelief: 'Petition dismissed; respondent\'s residence right upheld',
  },
];

/**
 * Build legacy disposed cases (referenced by judgments 4-6) so the
 * foreign keys resolve. These cases did not appear in the main casesSeed.
 */
const legacyCasesSeed = [
  {
    caseNumber: 'CRL/2023/099',
    title: 'State v. Suresh Pawar',
    caseType: 'Criminal',
    status: 'Disposed',
    plaintiff: 'State of Maharashtra',
    defendant: 'Suresh Pawar',
    description:
      'A case under Sections 279 and 304-A IPC arising from a fatal road accident on the Western Express Highway in October 2017. The accused was charged with causing death by rash and negligent driving. After a full trial, the accused was acquitted for want of credible evidence.',
    judgeEmail: 'anil.sharma@judiciary.gov',
    lawyerEmail: 'rajesh.kumar@lawyer.com',
    registrarEmail: 'suresh.iyer@judiciary.gov',
    priority: 'Medium',
    courtRoom: 'Court Room 1',
    filingDate: daysFromNow(-360, 9, 0),
    nextHearingDate: null,
  },
  {
    caseNumber: 'CIV/2023/055',
    title: 'Deshmukh v. Patil',
    caseType: 'Civil',
    status: 'Disposed',
    plaintiff: 'Vijay Deshmukh',
    defendant: 'Anil Patil',
    description:
      'A suit for declaration of title and possession over 0.4 acres of land in Thane district. The plaintiff alleged trespass by the defendant. The suit was ultimately dismissed as barred by limitation.',
    judgeEmail: 'priya.mehta@judiciary.gov',
    lawyerEmail: 'sneha.reddy@lawyer.com',
    registrarEmail: 'suresh.iyer@judiciary.gov',
    priority: 'Low',
    courtRoom: 'Court Room 2',
    filingDate: daysFromNow(-320, 10, 0),
    nextHearingDate: null,
  },
  {
    caseNumber: 'FAM/2023/021',
    title: 'Gupta v. Gupta',
    caseType: 'Family',
    status: 'Disposed',
    plaintiff: 'Saurabh Gupta',
    defendant: 'Neha Gupta',
    description:
      'A contested petition under Section 13(1)(ia) of the Hindu Marriage Act alleging cruelty. The court found the allegations unsubstantiated and dismissed the petition while protecting the respondent\'s right of residence.',
    judgeEmail: 'priya.mehta@judiciary.gov',
    lawyerEmail: 'sneha.reddy@lawyer.com',
    registrarEmail: 'suresh.iyer@judiciary.gov',
    priority: 'Medium',
    courtRoom: 'Court Room 3',
    filingDate: daysFromNow(-280, 11, 0),
    nextHearingDate: null,
  },
];

/**
 * Run the actual data insertion. Assumes a DB connection is already open.
 * Idempotent: wipes existing User/Case/Hearing/Judgment docs first.
 * @returns {Promise<{users:number,cases:number,hearings:number,judgments:number}>}
 */
async function seedDatabase() {
  console.log('🧹 Clearing existing data…');
  await Promise.all([
    User.deleteMany({}),
    Case.deleteMany({}),
    Hearing.deleteMany({}),
    Judgment.deleteMany({}),
  ]);

  // 1) Users.
  console.log('👥 Inserting users…');
  const createdUsers = await User.create(usersSeed);
  const userByEmail = createdUsers.reduce((acc, u) => {
    acc[u.email] = u;
    return acc;
  }, {});
  console.log(`   ✓ ${createdUsers.length} users inserted.`);

  // 2) Cases (main + legacy).
  console.log('📁 Inserting cases…');
  const allCasesSeed = [...casesSeed, ...legacyCasesSeed];
  const caseDocs = allCasesSeed.map((c) => ({
    ...c,
    judge: userByEmail[c.judgeEmail]?._id,
    lawyer: userByEmail[c.lawyerEmail]?._id,
    registrar: userByEmail[c.registrarEmail]?._id,
  }));
  deleteUndefinedProps(caseDocs);
  const createdCases = await Case.create(caseDocs);
  const caseByNumber = createdCases.reduce((acc, c) => {
    acc[c.caseNumber] = c;
    return acc;
  }, {});
  console.log(`   ✓ ${createdCases.length} cases inserted.`);

  // 3) Hearings.
  console.log('⚖️ Inserting hearings…');
  const hearingDocs = hearingsSeed.map((h) => ({
    case: caseByNumber[h.caseNumber]?._id,
    date: daysFromNow(h.daysOffset, parseInt(h.time.split(':')[0], 10), parseInt(h.time.split(':')[1], 10)),
    time: h.time,
    courtRoom: h.courtRoom,
    judge: userByEmail[h.judgeEmail]?._id,
    status: h.status,
    agenda: h.agenda,
    notes: h.notes,
  }));
  const createdHearings = await Hearing.create(hearingDocs);
  console.log(`   ✓ ${createdHearings.length} hearings inserted.`);

  // 4) Judgments.
  console.log('📜 Inserting judgments…');
  const judgmentDocs = judgmentsSeed
    .filter((j) => caseByNumber[j.caseNumber] && userByEmail[j.judgeEmail])
    .map((j) => ({
      case: caseByNumber[j.caseNumber]._id,
      judge: userByEmail[j.judgeEmail]._id,
      judgmentDate: j.judgmentDate,
      verdict: j.verdict,
      summary: j.summary,
      fullText: j.fullText,
      sentenceOrRelief: j.sentenceOrRelief,
    }));
  const createdJudgments = await Judgment.create(judgmentDocs);
  console.log(`   ✓ ${createdJudgments.length} judgments inserted.`);

  const counts = {
    users: createdUsers.length,
    cases: createdCases.length,
    hearings: createdHearings.length,
    judgments: createdJudgments.length,
  };
  console.log('✅ Seed completed successfully.', counts);
  console.log(`   Default password for all users: ${DEFAULT_PASSWORD}`);
  return counts;
}

/**
 * Seed only when the database has no users. Used on server boot so a fresh
 * in-memory MongoDB auto-populates with demo data.
 */
async function seedIfEmpty() {
  const count = await User.countDocuments();
  if (count > 0) {
    console.log(`[seed] Skipping auto-seed (${count} users already present).`);
    return null;
  }
  console.log('[seed] Empty database detected — auto-seeding demo data…');
  return seedDatabase();
}

/**
 * Strip undefined keys from a list of plain objects (mutates in place).
 * @param {Array<object>} docs
 */
function deleteUndefinedProps(docs) {
  docs.forEach((d) => {
    Object.keys(d).forEach((k) => {
      if (d[k] === undefined || d[k] === null) delete d[k];
    });
  });
}

// Export for reuse from server.js.
module.exports = { seedDatabase, seedIfEmpty };

// When run directly as `npm run seed`, do the full connect → seed → close cycle.
if (require.main === module) {
  console.log('🌱 Starting database seed…');
  (async () => {
    await connectDB();
    await seedDatabase();
    await closeDB();
    process.exit(0);
  })().catch((err) => {
    console.error('❌ Seed failed:', err);
    closeDB().finally(() => process.exit(1));
  });
}
