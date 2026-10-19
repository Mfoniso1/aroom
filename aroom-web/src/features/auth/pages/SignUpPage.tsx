import { useNavigate } from 'react-router-dom'
import { GraduationCap, Building2, UserCheck, ArrowRight } from 'lucide-react'
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
  iconBg: string
  iconColor: string
  ctaLabel: string
}

const ROLES: RoleOption[] = [
  {
    id: 'student',
    icon: <GraduationCap className="w-6 h-6" />,
    title: 'Student',
    subtitle: 'Find verified campus rooms & book free physical inspections.',
    badge: '₦0 Inspection Fee',
    badgeColor: 'bg-emerald-100 text-emerald-800',
    iconBg: 'bg-emerald-100',
    iconColor: 'text-emerald-600',
    ctaLabel: 'Sign up as Student',
  },
  {
    id: 'landlord',
    icon: <Building2 className="w-6 h-6" />,
    title: 'Direct Landlord',
    subtitle: 'List your own properties directly to students with 0% agency fee.',
    badge: 'Direct Owner',
    badgeColor: 'bg-amber-100 text-amber-800',
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-600',
    ctaLabel: 'Apply as Landlord',
  },
  {
    id: 'agent',
    icon: <UserCheck className="w-6 h-6" />,
    title: 'Campus Agent',
    subtitle: 'Join our Team-Leader-verified agent roster and manage student houses.',
    badge: 'Verified Roster',
    badgeColor: 'bg-teal-100 text-teal-800',
    iconBg: 'bg-teal-100',
    iconColor: 'text-teal-600',
    ctaLabel: 'Apply as Agent',
  },
]

export function SignUpPage() {
  const navigate = useNavigate()

  return (
    <div className="relative min-h-[82vh] flex flex-col">
      <PageBackground image="/images/rooms/house-02-modern.jpg" blackOverlayOpacity={52} />

      <HeroSection className="py-8 sm:py-12 px-4 min-h-0">
        <div className="text-center max-w-xl mx-auto">
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            Create your Aroom account
          </h1>
          <p className="mt-1.5 text-xs sm:text-sm text-slate-200">
            Select your account type to get started in under 60 seconds.
          </p>
        </div>
      </HeroSection>

      <div className="flex-1 flex flex-col items-center justify-start px-3.5 sm:px-6 pb-12 max-w-4xl mx-auto w-full">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
          {ROLES.map((role) => (
            <button
              key={role.id}
              type="button"
              onClick={() => navigate(`/signup/${role.id}`)}
              className="group flex flex-col justify-between text-left rounded-2xl border border-slate-200 bg-white hover:border-emerald-500 p-5 transition-all duration-200 cursor-pointer shadow-md hover:shadow-xl"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-4">
                  <div className={`p-2.5 rounded-xl ${role.iconBg} ${role.iconColor}`}>
                    {role.icon}
                  </div>
                  <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${role.badgeColor}`}>
                    {role.badge}
                  </span>
                </div>

                <h2 className="text-lg font-extrabold text-slate-900 mb-1">{role.title}</h2>
                <p className="text-slate-500 text-xs sm:text-sm leading-relaxed">
                  {role.subtitle}
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-extrabold text-emerald-700 group-hover:text-emerald-800">
                <span>{role.ctaLabel}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </button>
          ))}
        </div>

        <p className="mt-6 text-xs text-slate-200 text-center">
          Already have an account?{' '}
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="text-emerald-300 font-bold underline cursor-pointer"
          >
            Sign in here
          </button>
        </p>
      </div>
    </div>
  )
}
