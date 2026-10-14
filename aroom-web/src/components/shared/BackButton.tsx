import { useNavigate } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'

interface BackButtonProps {
  /** Optional hardcoded fallback or override destination */
  to?: string
  label?: string
  className?: string
}

/**
 * BackButton
 * Clean floating or inline back button that navigates to the previous page in history,
 * or to a provided route if specified.
 */
export function BackButton({ to, label = 'Back to previous page', className = '' }: BackButtonProps) {
  const navigate = useNavigate()

  const handleBack = () => {
    if (to) {
      navigate(to)
    } else if (window.history.length > 1) {
      navigate(-1)
    } else {
      navigate('/')
    }
  }

  return (
    <button
      type="button"
      onClick={handleBack}
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/90 hover:bg-white text-slate-700 hover:text-slate-900 border border-slate-200/90 hover:border-slate-300 text-sm font-semibold shadow-sm hover:shadow transition-all duration-200 active:scale-[0.98] cursor-pointer backdrop-blur-xs ${className}`}
      aria-label={label}
    >
      <ChevronLeft className="w-4 h-4 text-slate-500" />
      <span>{label}</span>
    </button>
  )
}
