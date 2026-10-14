import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { GraduationCap, Building2, UserCheck, ArrowRight, ChevronLeft } from 'lucide-react'
import { PageBackground } from '@/components/shared/PageBackground'
import { HeroSection } from '@/components/shared/HeroSection'

type Role = 'student' | 'landlord' | 'agent'

interface RoleOption {
  id: Role
  icon: React.ReactNode
  title: string
  subtitle: string
  badge: string
  badgeColor: string
  cardBorder: string
  cardBg: string
  iconBg: string
  iconColor: string
  perks: string[]
}

const ROLES: RoleOption[] = [
  {
    id: 'student',
    icon: <GraduationCap className="w-8 h-8" />,
    title: 'Student',
    subtitle: 'Looking for accommodation near campus',
    badge: 'Most Popular',
    badgeColor: 'bg-emerald-100 text-emerald-700',
    cardBorder: 'border-emerald-400 ring-2 ring-emerald-400/30',
    cardBg: 'bg-white hover:bg-emerald-50/40',
    iconBg: 'bg-emerald-100',
    iconColor: 'text-emerald-600',
    perks: [
      'Browse verified rooms near your campus',
      'Pay securely with escrow protection',
      'Book physical inspections for free',
      'Report fake listings & scam agents',
    ],
  },
  {
    id: 'landlord',
    icon: <Building2 className="w-8 h-8" />,
    title: 'Landlord',
    subtitle: 'I own property and want to list rooms',
    badge: 'List & Earn',
    badgeColor: 'bg-amber-100 text-amber-700',
    cardBorder: 'border-amber-300 ring-2 ring-amber-300/30',
    cardBg: 'bg-white hover:bg-amber-50/40',
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-600',
    perks: [
      'List your rooms for free',
      'Reach thousands of verified students',
      'Manage inquiries from one dashboard',
      'Get paid safely through the platform',
    ],
  },
  {
    id: 'agent',
    icon: <UserCheck className="w-8 h-8" />,
    title: 'Agent',
    subtitle: 'I represent landlords and help students find rooms',
    badge: 'Earn Commission',
    badgeColor: 'bg-violet-100 text-violet-700',
    cardBorder: 'border-violet-300 ring-2 ring-violet-300/30',
    cardBg: 'bg-white hover:bg-violet-50/40',
    iconBg: 'bg-violet-100',
    iconColor: 'text-violet-600',
    perks: [
      'Create a verified agent profile',
      'List multiple properties at once',
      'Earn commissions on successful lets',
      'Build trust with verified badge',
    ],
  },
]

export function SignUpPage() {
  const navigate = useNavigate()
  const [selected, setSelected] = useState<Role | null>(null)
  const [hovered, setHovered] = useState<Role | null>(null)

  const activeRole = hovered ?? selected

  const handleContinue = () => {
    if (!selected) return
    // Future: navigate to role-specific registration form
    // For now shows a coming-soon placeholder
    navigate(`/signup/${selected}`)
  }

  return (
    <div className="relative min-h-[85vh] flex flex-col">
      <PageBackground image="/images/rooms/house-02-modern.jpg" blackOverlayOpacity={50} />
      
      {/* High-quality Hero Section - inherits unified page background with zero photo division */}
      <HeroSection className="py-14 px-4 min-h-60 sm:min-h-72">
        <div className="text-center max-w-xl mx-auto flex flex-col items-center justify-center">
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Create your Aroom account
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-200">
            Choose how you'll be using Aroom — you can always update this later.
          </p>
        </div>
      </HeroSection>

      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12 max-w-5xl mx-auto w-full">
        {/* Back link */}
        <button
          onClick={() => navigate(-1)}
          className="self-start mb-6 flex items-center gap-1.5 text-slate-700 hover:text-slate-900 bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-slate-200 text-sm font-medium transition-colors shadow-xs"
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </button>

      {/* Role Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 w-full max-w-4xl">
        {ROLES.map((role) => {
          const isSelected = selected === role.id
          const isActive = activeRole === role.id

          return (
            <button
              key={role.id}
              onClick={() => setSelected(role.id)}
              onMouseEnter={() => setHovered(role.id)}
              onMouseLeave={() => setHovered(null)}
              className={[
                'relative flex flex-col items-start text-left rounded-2xl border-2 p-6 transition-all duration-200 cursor-pointer shadow-sm',
                isSelected ? role.cardBorder : 'border-slate-200 hover:border-slate-300',
                role.cardBg,
                isSelected ? 'shadow-lg scale-[1.02]' : 'hover:shadow-md',
              ].join(' ')}
              aria-pressed={isSelected}
            >
              {/* Badge */}
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full mb-4 ${role.badgeColor}`}>
                {role.badge}
              </span>

              {/* Icon */}
              <div className={`p-3 rounded-xl mb-4 ${role.iconBg} ${role.iconColor}`}>
                {role.icon}
              </div>

              {/* Title & subtitle */}
              <h2 className="text-xl font-bold text-slate-900 mb-1">{role.title}</h2>
              <p className="text-slate-500 text-sm mb-5 leading-relaxed">{role.subtitle}</p>

              {/* Perks — shown only when hovered or selected */}
              <ul
                className={`space-y-2 text-sm text-slate-600 transition-all duration-300 overflow-hidden ${
                  isActive ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                {role.perks.map((perk) => (
                  <li key={perk} className="flex items-start gap-2">
                    <span className={`mt-0.5 w-4 h-4 shrink-0 rounded-full flex items-center justify-center text-white text-[10px] font-bold ${role.iconBg} ${role.iconColor}`}>
                      ✓
                    </span>
                    {perk}
                  </li>
                ))}
              </ul>

              {/* Selected indicator */}
              {isSelected && (
                <span className={`absolute top-4 right-4 w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-bold ${role.iconBg} ${role.iconColor} border-2 border-current`}>
                  ✓
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* CTA */}
      <div className="mt-10 flex flex-col items-center gap-3 w-full max-w-xs">
        <button
          onClick={handleContinue}
          disabled={!selected}
          className={[
            'w-full flex items-center justify-center gap-2 py-4 px-8 rounded-xl font-bold text-base transition-all duration-200',
            selected
              ? 'bg-green-600 hover:bg-green-700 text-white shadow-md hover:shadow-lg active:scale-[0.98]'
              : 'bg-slate-200 text-slate-400 cursor-not-allowed',
          ].join(' ')}
        >
          Continue as {selected ? ROLES.find((r) => r.id === selected)?.title : '…'}
          <ArrowRight className="w-5 h-5" />
        </button>

        <p className="text-slate-400 text-sm text-center">
          Already have an account?{' '}
          <button
            onClick={() => navigate('/login')}
            className="text-green-600 font-semibold hover:underline"
          >
            Log in
          </button>
        </p>
      </div>
    </div>
  </div>
  )
}
