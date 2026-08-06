'use client';

interface StatusBadgeProps {
  status: string;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const norm = String(status || '').trim().toLowerCase();

  let styles = 'bg-gray-100 text-gray-700 border-gray-200';
  let label = status;

  if (norm === 'active' || norm === 'paid' || norm === 'returned' || norm === 'approved') {
    styles = 'bg-emerald-100 text-emerald-800 border-emerald-200';
  } else if (norm === 'suspended' || norm === 'overdue' || norm === 'damaged' || norm === 'lost' || norm === 'rejected') {
    styles = 'bg-red-100 text-red-800 border-red-200';
  } else if (norm === 'borrowed' || norm === 'pending' || norm === 'return_requested' || norm === 'unrequested') {
    styles = 'bg-amber-100 text-amber-800 border-amber-200';
  }

  if (norm === 'return_requested') label = 'Return Requested';

  return (
    <span className={`inline-block px-2.5 py-0.5 text-[11px] font-extrabold rounded-full border uppercase tracking-wider ${styles}`}>
      {label}
    </span>
  );
}
