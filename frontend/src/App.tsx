import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { AuthProvider } from '@/lib/auth'
import { Navbar } from '@/components/Navbar'
import { PrivateRoute } from '@/components/PrivateRoute'
import { BackgroundVideo } from '@/components/BackgroundVideo'
import { TechCanvasBackground } from '@/components/TechCanvasBackground'
import { CopilotAssistant } from '@/components/CopilotAssistant'
import { SecurityAlertDrawer } from '@/components/SecurityAlertDrawer'
import Landing from '@/pages/Landing'
import Auth from '@/pages/Auth'
import Analyze from '@/pages/Analyze'
import Dashboard from '@/pages/Dashboard'
import Results from '@/pages/Results'
import Methodology from '@/pages/Methodology'
import LiveMonitor from '@/pages/LiveMonitor'
import Settings from '@/pages/Settings'
import Evaluation from '@/pages/Evaluation'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <BackgroundVideo />
        <TechCanvasBackground />
        <Navbar />
        <AnimatePresence mode="wait">
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/methodology" element={<Methodology />} />
            <Route path="/evaluation" element={<Evaluation />} />
            <Route path="/results/:id" element={<Results />} />
            <Route path="/analyze" element={
              <PrivateRoute><Analyze /></PrivateRoute>
            } />
            <Route path="/monitor" element={
              <PrivateRoute><LiveMonitor /></PrivateRoute>
            } />
            <Route path="/dashboard" element={
              <PrivateRoute><Dashboard /></PrivateRoute>
            } />
            <Route path="/settings" element={
              <PrivateRoute><Settings /></PrivateRoute>
            } />

            {/* 404 */}
            <Route path="*" element={
              <div style={{ textAlign: 'center', padding: '6rem 1.5rem', color: 'var(--text-muted)', position: 'relative', zIndex: 1 }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>404</div>
                <p style={{ marginBottom: '1.5rem' }}>Page not found</p>
                <a href="/" className="btn-primary" style={{ textDecoration: 'none' }}>Go Home</a>
              </div>
            } />
          </Routes>
        </AnimatePresence>
        <SecurityAlertDrawer />
        <CopilotAssistant />
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
