import { ShieldCheck, Clock } from 'lucide-react'

type TrustBadgeProps = {
  status: 'verified' | 'unverified_new'
  verifiedAt?: string
  conditionStatus?: 'good' | 'minor_issues' | 'under_repair'
}

export function TrustBadge({ status, verifiedAt }: TrustBadgeProps) {
  if (status === 'verified') {
    return (
      <div className="bg-emerald-600 text-white text-[11px] font-bold px-2.5 py-1 rounded-lg shadow-xs flex items-center gap-1.5 w-fit">
        <ShieldCheck className="h-3.5 w-3.5 text-emerald-200" />
        <span>Mapped &amp; Verified{verifiedAt ? ` • ${verifiedAt}` : ''}</span>
      </div>
    )
  }

  return (
    <div className="bg-amber-500 text-white text-[11px] font-bold px-2.5 py-1 rounded-lg shadow-xs flex items-center gap-1.5 w-fit">
      <Clock className="h-3.5 w-3.5 text-amber-200" />
      <span>Pending Team Leader Mapping</span>
    </div>
  )
}
