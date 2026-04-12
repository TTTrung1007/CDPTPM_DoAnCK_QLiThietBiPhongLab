import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import LandingPage from './pages/LandingPage';
import QRScanner from './pages/QRScanner';
import EquipmentDetail from './pages/EquipmentDetail';
import AdminDashboard from './pages/AdminDashboard';
import UserManagement from './pages/UserManagement';
import PrintQR from './pages/PrintQR';
import History from './pages/History';
import EquipmentCatalog from './pages/EquipmentCatalog';
import Profile from './pages/Profile';
import AnalyticsDashboard from './pages/AnalyticsDashboard';
import UserHistoryAdmin from './pages/UserHistoryAdmin';
import CategoryManagement from './pages/admin/CategoryManagement';
import LabManagement from './pages/admin/LabManagement';
import FineManagement from './pages/admin/FineManagement';
import AuditLogViewer from './pages/admin/AuditLogViewer';
import FeedbackManagement from './pages/admin/FeedbackManagement';
import { AuthContext } from './context/AuthContext';
import Cart from './pages/Cart';
import Wishlist from './pages/Wishlist';

function App() {
  const { user } = useContext(AuthContext);

  return (
    <Router>
      <div className="min-h-screen bg-[#fafaff] flex flex-col relative overflow-hidden">
        {/* Dynamic background elements */}
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-slate-50">
          <div className="absolute top-[-10%] left-[-10%] w-[70%] h-[70%] rounded-full bg-blue-400/20 blur-[120px] animate-blob"></div>
          <div className="absolute top-[10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-indigo-400/20 blur-[100px] animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-[-20%] left-[10%] w-[80%] h-[80%] rounded-full bg-purple-400/20 blur-[140px] animate-blob animation-delay-4000"></div>
          <div className="absolute inset-0 bg-dot-pattern opacity-[0.6]"></div>
        </div>

        <div className="relative z-10 flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-1 max-w-full w-full mx-auto p-4 sm:p-6 lg:p-8">
            <Routes>
              <Route path="/login" element={
                user ? (
                  user.role === 'admin' ? <Navigate to="/admin" /> : <Navigate to="/catalog" />
                ) : <Login />
              } />
              
              <Route path="/" element={<LandingPage />} />

              <Route path="/scan" element={
                <ProtectedRoute>
                  <QRScanner />
                </ProtectedRoute>
              } />

              <Route path="/equipment/:id" element={
                <ProtectedRoute>
                  <EquipmentDetail />
                </ProtectedRoute>
              } />

              <Route path="/history" element={
                <ProtectedRoute>
                  <History />
                </ProtectedRoute>
              } />

              <Route path="/catalog" element={
                <ProtectedRoute>
                  <EquipmentCatalog />
                </ProtectedRoute>
              } />

              <Route path="/profile" element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } />

              <Route path="/wishlist" element={
                <ProtectedRoute>
                  <Wishlist />
                </ProtectedRoute>
              } />

              <Route path="/cart" element={
                <ProtectedRoute>
                  <Cart />
                </ProtectedRoute>
              } />

              <Route path="/admin" element={
                <ProtectedRoute adminOnly={true}>
                  <AdminDashboard />
                </ProtectedRoute>
              } />

              <Route path="/admin/analytics" element={
                <ProtectedRoute adminOnly={true}>
                  <AnalyticsDashboard />
                </ProtectedRoute>
              } />

              <Route path="/admin/users" element={
                <ProtectedRoute adminOnly={true}>
                  <UserManagement />
                </ProtectedRoute>
              } />

              <Route path="/admin/users/:userId/history" element={
                <ProtectedRoute adminOnly={true}>
                  <UserHistoryAdmin />
                </ProtectedRoute>
              } />

              <Route path="/admin/categories" element={
                <ProtectedRoute adminOnly={true}>
                  <CategoryManagement />
                </ProtectedRoute>
              } />

              <Route path="/admin/labs" element={
                <ProtectedRoute adminOnly={true}>
                  <LabManagement />
                </ProtectedRoute>
              } />

              <Route path="/admin/fines" element={
                <ProtectedRoute adminOnly={true}>
                  <FineManagement />
                </ProtectedRoute>
              } />

              <Route path="/admin/audit-logs" element={
                <ProtectedRoute adminOnly={true}>
                  <AuditLogViewer />
                </ProtectedRoute>
              } />

              <Route path="/admin/feedbacks" element={
                <ProtectedRoute adminOnly={true}>
                  <FeedbackManagement />
                </ProtectedRoute>
              } />

              <Route path="/admin/print-qr" element={
                <ProtectedRoute adminOnly={true}>
                  <PrintQR />
                </ProtectedRoute>
              } />

              {/* Fallback route to redirect to Landing Page */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;
