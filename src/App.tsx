import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import Home from './pages/Home';
import CompanyList from './pages/CompanyList';
import CompanyDetail from './pages/CompanyDetail';
import PublicSubmit from './pages/PublicSubmit';
import AdminDashboard from './pages/AdminDashboard';
import AdminCompanyForm from './pages/AdminCompanyForm';
import AdminLogin from './pages/AdminLogin';
import AdminSettings from './pages/AdminSettings';
import PrivateRoute from './components/PrivateRoute';
import { useStore } from './store';
import { Toaster } from 'react-hot-toast';

function App() {
  const fetchCompanies = useStore(state => state.fetchCompanies);
  const fetchSettings = useStore(state => state.fetchSettings);

  useEffect(() => {
    fetchCompanies();
    fetchSettings();
  }, [fetchCompanies, fetchSettings]);

  return (
    <>
      <Toaster 
        position="top-center"
        toastOptions={{
          style: {
            background: '#141414',
            color: '#fff',
            border: '1px solid #262626',
          },
          success: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
      <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="submit" element={<PublicSubmit />} />
          <Route path="companies" element={<CompanyList />} />
          <Route path="companies/:id" element={<CompanyDetail />} />
          
          <Route path="admin/login" element={<AdminLogin />} />
          
          <Route path="admin" element={<PrivateRoute />}>
            <Route index element={<AdminDashboard />} />
            <Route path="settings" element={<AdminSettings />} />
            <Route path="company/new" element={<AdminCompanyForm />} />
            <Route path="company/:id/edit" element={<AdminCompanyForm />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
    </>
  );
}

export default App;
