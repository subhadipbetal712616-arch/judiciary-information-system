/**
 * Constants shared across the app — roles, statuses, case types, verdicts.
 */
export const ROLES = ['admin', 'judge', 'lawyer', 'registrar'];

export const CASE_TYPES = ['Civil', 'Criminal', 'Family', 'Constitutional', 'Property'];

export const CASE_STATUSES = [
  'Filed',
  'Pending',
  'In Progress',
  'Adjourned',
  'Disposed',
  'Closed',
];

export const HEARING_STATUSES = ['Scheduled', 'Completed', 'Adjourned', 'Cancelled'];

export const VERDICTS = [
  'Guilty',
  'Not Guilty',
  'In Favor of Plaintiff',
  'In Favor of Defendant',
  'Dismissed',
  'Acquitted',
];

export const PRIORITIES = ['Low', 'Medium', 'High'];

/**
 * Map any status value to a Tailwind badge color class.
 * Keeping the palette strictly within gray/blue/amber/green/red.
 */
export const STATUS_BADGE_CLASS = {
  // Cases
  Filed: 'bg-gray-100 text-gray-700',
  Pending: 'bg-gray-100 text-gray-700',
  'In Progress': 'bg-blue-100 text-blue-700',
  Adjourned: 'bg-amber-100 text-amber-700',
  Disposed: 'bg-green-100 text-green-700',
  Closed: 'bg-red-100 text-red-700',
  // Hearings
  Scheduled: 'bg-blue-100 text-blue-700',
  Completed: 'bg-green-100 text-green-700',
  Cancelled: 'bg-red-100 text-red-700',
};

export const PRIORITY_BADGE_CLASS = {
  Low: 'bg-gray-100 text-gray-700',
  Medium: 'bg-blue-100 text-blue-700',
  High: 'bg-red-100 text-red-700',
};

export const ROLE_BADGE_CLASS = {
  admin: 'bg-red-100 text-red-700',
  judge: 'bg-blue-100 text-blue-700',
  lawyer: 'bg-gray-100 text-gray-700',
  registrar: 'bg-amber-100 text-amber-700',
};

export const VERDICT_BADGE_CLASS = {
  Guilty: 'bg-red-100 text-red-700',
  'Not Guilty': 'bg-green-100 text-green-700',
  'In Favor of Plaintiff': 'bg-blue-100 text-blue-700',
  'In Favor of Defendant': 'bg-amber-100 text-amber-700',
  Dismissed: 'bg-gray-100 text-gray-700',
  Acquitted: 'bg-green-100 text-green-700',
};
