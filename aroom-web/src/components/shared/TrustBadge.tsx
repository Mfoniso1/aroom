import { ShieldCheck, ShieldAlert } from 'lucide-react'

type TrustBadgeProps = {
  status: 'verified' | 'unverified_new'
}

export function TrustBadge({ status }: TrustBadgeProps) {
  if (status === 'verified') {
    return (
      <div className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded shadow-sm flex items-center gap-1 w-fit">
        <ShieldCheck className="h-3 w-3" />
        Verified
      </div>
    )
  }

  return (
    <div className="bg-amber-500 text-white text-xs font-bold px-2 py-1 rounded shadow-sm flex items-center gap-1 w-fit">
      <ShieldAlert className="h-3 w-3" />
      Unverified - New
    </div>
  )
}

