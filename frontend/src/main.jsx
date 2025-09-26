import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './index.css'
import { AuthProvider } from './contexts/AuthContext'
import MainLayout from './components/layout/MainLayout'
import ModernAuthLayout from './components/layout/ModernAuthLayout' // <-- Import the new layout
import PrivateRoute from './components/routing/PrivateRoute'
import PublicRoute from './components/routing/PublicRoute'
import Home from './pages/Home'
import PageNotFound from './pages/PageNotFound'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import PatientDashboard from './pages/patient/Dashboard'
import MedicalHistory from './pages/patient/MedicalHistory'
import PatientAppointments from './pages/patient/Appointments'
import Prescriptions from './pages/patient/Prescriptions'
import BookAppointment from './pages/patient/BookAppointment'
import DoctorDashboard from './pages/doctor/Dashboard'
import DoctorAppointments from './pages/doctor/Appointments'
import DoctorAvailability from './pages/doctor/Availability'
import CreatePrescription from './pages/doctor/CreatePrescription'
import DoctorKyc from './pages/doctor/Kyc'
import AdminDashboard from './pages/admin/Dashboard'
import ManageSpecializations from './pages/admin/ManageSpecializations'
import KycRequests from './pages/admin/KycRequests'
import ManageDoctors from './pages/admin/ManageDoctors'
import AboutUs from './pages/AboutUs';
import Contact from './pages/Contact';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Home />,
  },
  {
    path: '/auth',
    element: (
      <PublicRoute>
        {/* Use the new ModernAuthLayout here */}
        <ModernAuthLayout />
      </PublicRoute>
    ),
    children: [
      { path: 'login', element: <Login /> },
      { path: 'register', element: <Register /> },
    ],
  },
  {
    path: '/patient',
    element: (
      <PrivateRoute allowedRoles={['patient']}>
        <MainLayout role="patient" />
      </PrivateRoute>
    ),
    children: [
      { index: true, element: <PatientDashboard /> },
      { path: 'medical-history', element: <MedicalHistory /> },
      { path: 'appointments', element: <PatientAppointments /> },
      { path: 'prescriptions', element: <Prescriptions /> },
      { path: 'book-appointment', element: <BookAppointment /> },
    ],
  },
  {
    path: '/doctor',
    element: (
      <PrivateRoute allowedRoles={['doctor']}>
        <MainLayout role="doctor" />
      </PrivateRoute>
    ),
    children: [
      { index: true, element: <DoctorDashboard /> },
      { path: 'appointments', element: <DoctorAppointments /> },
      { path: 'availability', element: <DoctorAvailability /> },
      { path: 'prescriptions/new', element: <CreatePrescription /> },
    ],
  },
  {
    path: '/admin',
    element: (
      <PrivateRoute allowedRoles={['admin']}>
        <MainLayout role="admin" />
      </PrivateRoute>
    ),
    children: [
      { index: true, element: <AdminDashboard /> },
      { path: 'specializations', element: <ManageSpecializations /> },
      { path: 'doctors', element: <ManageDoctors /> },
    ],
  },
  // New parent route for generic pages
  {
    element: (
      <PrivateRoute>
        <MainLayout />
      </PrivateRoute>
    ),
    children: [
      { path: 'about', element: <AboutUs /> },
      { path: 'contact', element: <Contact /> },
    ]
  },
  {
    path: '/doctor/kyc',
    element: (
      <PrivateRoute allowedRoles={['doctor']}>
        <MainLayout role="doctor" />
      </PrivateRoute>
    ),
    children: [
      { index: true, element: <DoctorKyc /> },
    ],
  },
  {
    path: '/admin/kyc-requests',
    element: (
      <PrivateRoute allowedRoles={['admin']}>
        <MainLayout role="admin" />
      </PrivateRoute>
    ),
    children: [
      { index: true, element: <KycRequests /> },
    ],
  },
  { path: '*', element: <PageNotFound /> },
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <RouterProvider
        router={router}
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      />
    </AuthProvider>
  </React.StrictMode>
);