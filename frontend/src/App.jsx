import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastHost } from './context/ToastContext';
import { ProtectedRoute, RoleRoute } from './components/layout/ProtectedRoute';
import AppLayout from './components/layout/AppLayout';
import AppLoader from './components/common/AppLoader';

import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import UserManagementPage from './pages/UserManagementPage';
import DashboardPage from './pages/DashboardPage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailsPage from './pages/ProductDetailsPage';
import InventoryPage from './pages/InventoryPage';
import SalesPage from './pages/SalesPage';
import SaleDetailsPage from './pages/SaleDetailsPage';
import PurchasesPage from './pages/PurchasesPage';
import PurchaseDetailsPage from './pages/PurchaseDetailsPage';
import SuppliersPage from './pages/SuppliersPage';
import SupplierDetailsPage from './pages/SupplierDetailsPage';
import CustomersPage from './pages/CustomersPage';
import CustomerDetailsPage from './pages/CustomerDetailsPage';
import AnalyticsPage from './pages/AnalyticsPage';
import NotificationsPage from './pages/NotificationsPage';
import ActivityLogsPage from './pages/ActivityLogsPage';
import SettingsPage from './pages/SettingsPage';
import NotFoundPage from './pages/NotFoundPage';

function App() {
  const [booting, setBooting] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setBooting(false), 900);
    return () => clearTimeout(t);
  }, []);

  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          {booting && <AppLoader />}
          <ToastHost />
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />

            <Route element={<ProtectedRoute />}>
              <Route element={<AppLayout />}>
                <Route path="/" element={<DashboardPage />} />
                <Route path="/products" element={<ProductsPage />} />
                <Route path="/products/:id" element={<ProductDetailsPage />} />
                <Route path="/inventory" element={<InventoryPage />} />
                <Route path="/sales" element={<SalesPage />} />
                <Route path="/sales/:id" element={<SaleDetailsPage />} />
                <Route path="/purchases" element={<PurchasesPage />} />
                <Route path="/purchases/:id" element={<PurchaseDetailsPage />} />
                <Route path="/suppliers" element={<SuppliersPage />} />
                <Route path="/suppliers/:id" element={<SupplierDetailsPage />} />
                <Route path="/customers" element={<CustomersPage />} />
                <Route path="/customers/:id" element={<CustomerDetailsPage />} />
                <Route path="/analytics" element={<AnalyticsPage />} />
                <Route path="/notifications" element={<NotificationsPage />} />
                <Route path="/activity-logs" element={<ActivityLogsPage />} />
                <Route path="/settings" element={<SettingsPage />} />

                <Route element={<RoleRoute roles={['ADMIN']} />}>
                  <Route path="/user-management" element={<UserManagementPage />} />
                </Route>
              </Route>
            </Route>

            <Route path="/404" element={<NotFoundPage />} />
            <Route path="*" element={<Navigate to="/404" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
