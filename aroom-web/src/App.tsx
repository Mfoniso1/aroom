import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { MainLayout } from '@/components/layout/MainLayout'
import { AgentLayout } from '@/components/layout/AgentLayout'
import { HomePage } from '@/features/marketplace/pages/HomePage'
import { SearchPage } from '@/features/marketplace/pages/SearchPage'
import { ListingDetailPage } from '@/features/marketplace/pages/ListingDetailPage'
import { DashboardPage } from '@/features/agent/pages/DashboardPage'
import { NewListingPage } from '@/features/agent/pages/NewListingPage'
import { OnboardingPage } from '@/features/agent/pages/OnboardingPage'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainLayout><HomePage /></MainLayout>} />
        <Route path="/search" element={<MainLayout><SearchPage /></MainLayout>} />
        <Route path="/listings/:id" element={<MainLayout><ListingDetailPage /></MainLayout>} />

        <Route path="/portal">
          <Route index element={<Navigate to="/portal/dashboard" replace />} />
          <Route path="dashboard" element={<AgentLayout><DashboardPage /></AgentLayout>} />
          <Route path="listings/new" element={<AgentLayout><NewListingPage /></AgentLayout>} />
          <Route path="onboarding" element={<AgentLayout><OnboardingPage /></AgentLayout>} />
        </Route>

        <Route path="*" element={<div className="p-8 text-center text-red-500 font-bold">404 - Page Not Found</div>} />
      </Routes>
    </Router>
  )
}

export default App
