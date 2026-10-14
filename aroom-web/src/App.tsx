import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { MainLayout } from '@/components/layout/MainLayout'
import { AgentLayout } from '@/components/layout/AgentLayout'
import { HomePage } from '@/features/marketplace/pages/HomePage'
import { SearchPage } from '@/features/marketplace/pages/SearchPage'
import { ListingDetailPage } from '@/features/marketplace/pages/ListingDetailPage'
import { SignUpPage } from '@/features/auth/pages/SignUpPage'
import { StudentRegisterPage } from '@/features/auth/pages/StudentRegisterPage'
import { AgentRegisterPage } from '@/features/auth/pages/AgentRegisterPage'
import { LandlordRegisterPage } from '@/features/auth/pages/LandlordRegisterPage'
import { LoginPage } from '@/features/auth/pages/LoginPage'
import { StudentDashboardPage } from '@/features/student/pages/StudentDashboardPage'
import { DashboardPage } from '@/features/agent/pages/DashboardPage'
import { NewListingPage } from '@/features/agent/pages/NewListingPage'
import { LandlordNewListingPage } from '@/features/agent/pages/LandlordNewListingPage'
import { LandlordDashboardPage } from '@/features/agent/pages/LandlordDashboardPage'
import { OnboardingPage } from '@/features/agent/pages/OnboardingPage'
import { SplashScreen } from '@/components/shared/SplashScreen'

function App() {
  // Always show splash on fresh page load/refresh.
  // SPA navigation never remounts App, so it will not repeat while browsing.
  const [showSplash, setShowSplash] = useState(true)

  const handleSplashComplete = () => {
    setShowSplash(false)
  }

  return (
    <>
      {showSplash && (
        <SplashScreen 
          duration={4200} 
          onComplete={handleSplashComplete} 
        />
      )}

      <Router>
        <Routes>
          {/* Public marketplace */}
          <Route path="/" element={<MainLayout><HomePage /></MainLayout>} />
          <Route path="/search" element={<MainLayout><SearchPage /></MainLayout>} />
          <Route path="/listings/:id" element={<MainLayout><ListingDetailPage /></MainLayout>} />

          {/* Unified Authentication */}
          <Route path="/login" element={<MainLayout><LoginPage /></MainLayout>} />
          <Route path="/signup" element={<MainLayout><SignUpPage /></MainLayout>} />
          
          {/* Dedicated Registration Forms */}
          <Route path="/signup/student" element={<MainLayout><StudentRegisterPage /></MainLayout>} />
          <Route path="/signup/agent" element={<MainLayout><AgentRegisterPage /></MainLayout>} />
          <Route path="/signup/landlord" element={<MainLayout><LandlordRegisterPage /></MainLayout>} />
          <Route path="/signup/:role" element={<MainLayout><SignUpPage /></MainLayout>} />

          {/* Student Portal */}
          <Route path="/student">
            <Route index element={<Navigate to="/student/dashboard" replace />} />
            <Route path="dashboard" element={<MainLayout><StudentDashboardPage /></MainLayout>} />
          </Route>

          {/* Direct Landlord Portal */}
          <Route path="/landlord">
            <Route index element={<Navigate to="/portal/landlord/dashboard" replace />} />
            <Route path="dashboard" element={<Navigate to="/portal/landlord/dashboard" replace />} />
          </Route>

          {/* Agent & Landlord Portal */}
          <Route path="/portal">
            <Route index element={<Navigate to="/portal/dashboard" replace />} />
            <Route path="login" element={<MainLayout><LoginPage /></MainLayout>} />
            <Route path="dashboard" element={<AgentLayout><DashboardPage /></AgentLayout>} />
            <Route path="listings/new" element={<AgentLayout><NewListingPage /></AgentLayout>} />
            <Route path="landlord/dashboard" element={<AgentLayout><LandlordDashboardPage /></AgentLayout>} />
            <Route path="landlord/new" element={<AgentLayout><LandlordNewListingPage /></AgentLayout>} />
            <Route path="onboarding" element={<AgentLayout><OnboardingPage /></AgentLayout>} />
          </Route>

          <Route path="*" element={<div className="p-8 text-center text-red-500 font-bold">404 - Page Not Found</div>} />
        </Routes>
      </Router>
    </>
  )
}

export default App
