import React from 'react';

// Base skeleton component with shimmer effect
export const Skeleton = ({ 
  className = '', 
  width = '100%', 
  height = '1rem', 
  rounded = 'md',
  ...props 
}) => {
  return (
    <div
      className={`
        bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 
        animate-pulse bg-[length:200%_100%] 
        ${rounded === 'full' ? 'rounded-full' : 
          rounded === 'lg' ? 'rounded-lg' : 
          rounded === 'md' ? 'rounded-md' : 
          rounded === 'sm' ? 'rounded-sm' : 'rounded'}
        ${className}
      `}
      style={{ 
        width, 
        height,
        animation: 'shimmer 1.5s ease-in-out infinite'
      }}
      {...props}
    />
  );
};

// Skeleton for appointment cards
export const AppointmentSkeleton = ({ count = 5 }) => {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="bg-white dark:bg-bg-card-dark rounded-xl shadow-sm dark:shadow-card-dark border border-gray-100 dark:border-dark-border p-6">
          <div className="flex items-start space-x-4">
            {/* Avatar skeleton */}
            <Skeleton className="w-12 h-12" rounded="full" />
            
            {/* Content skeleton */}
            <div className="flex-1 space-y-3">
              <div className="flex items-center justify-between">
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-6 w-20" rounded="full" />
              </div>
              <Skeleton className="h-4 w-32" />
              <div className="flex items-center space-x-4">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-16" />
              </div>
            </div>
            
            {/* Action button skeleton */}
            <Skeleton className="h-8 w-24" />
          </div>
        </div>
      ))}
    </div>
  );
};

// Skeleton for dashboard stats
export const DashboardStatsSkeleton = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="bg-white dark:bg-bg-card-dark rounded-xl shadow-sm dark:shadow-card-dark border border-gray-100 dark:border-dark-border p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-8 w-16" />
            </div>
            <Skeleton className="w-12 h-12" rounded="lg" />
          </div>
        </div>
      ))}
    </div>
  );
};

// Skeleton for table rows
export const TableSkeleton = ({ rows = 5, columns = 4 }) => {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex items-center space-x-4 py-4">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton 
              key={colIndex} 
              className="h-4 flex-1" 
              width={colIndex === 0 ? '60%' : colIndex === columns - 1 ? '20%' : '100%'}
            />
          ))}
        </div>
      ))}
    </div>
  );
};

// Skeleton for profile cards
export const ProfileSkeleton = () => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center space-x-4">
        <Skeleton className="w-16 h-16" rounded="full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-24" />
        </div>
        <Skeleton className="h-8 w-20" />
      </div>
    </div>
  );
};

// Skeleton for form fields
export const FormSkeleton = ({ fields = 4 }) => {
  return (
    <div className="space-y-6">
      {Array.from({ length: fields }).map((_, index) => (
        <div key={index} className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full" />
        </div>
      ))}
    </div>
  );
};

// Skeleton for medical history cards
export const MedicalHistorySkeleton = ({ count = 3 }) => {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="bg-white dark:bg-bg-card-dark rounded-xl shadow-sm dark:shadow-card-dark border border-gray-100 dark:border-dark-border p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-6 w-16" rounded="full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
            <div className="flex items-center space-x-4">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-16" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// Skeleton for prescription cards
export const PrescriptionSkeleton = ({ count = 3 }) => {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="bg-white dark:bg-bg-card-dark rounded-xl shadow-sm dark:shadow-card-dark border border-gray-100 dark:border-dark-border p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-6 w-20" rounded="full" />
            </div>
            <div className="space-y-3">
              {Array.from({ length: 2 }).map((_, medIndex) => (
                <div key={medIndex} className="flex items-center space-x-3">
                  <Skeleton className="w-4 h-4" rounded="sm" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-20" />
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-16" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// Skeleton for bill cards
export const BillSkeleton = ({ count = 3 }) => {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="bg-white dark:bg-bg-card-dark rounded-xl shadow-sm dark:shadow-card-dark border border-gray-100 dark:border-dark-border p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-4 w-24" />
            </div>
            <div className="text-right space-y-2">
              <Skeleton className="h-5 w-16 ml-auto" />
              <Skeleton className="h-6 w-20 ml-auto" rounded="full" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// Skeleton for doctor cards
export const DoctorSkeleton = ({ count = 6 }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="bg-white dark:bg-bg-card-dark rounded-xl shadow-sm dark:shadow-card-dark border border-gray-100 dark:border-dark-border p-6">
          <div className="flex items-center space-x-4">
            <Skeleton className="w-16 h-16" rounded="full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-20" />
            </div>
          </div>
          <div className="mt-4 space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
          <div className="mt-4 flex items-center justify-between">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-8 w-20" />
          </div>
        </div>
      ))}
    </div>
  );
};

// Skeleton for inventory items
export const InventorySkeleton = ({ count = 8 }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="bg-white dark:bg-bg-card-dark rounded-lg shadow-sm dark:shadow-card-dark border border-gray-100 dark:border-dark-border p-4">
          <div className="space-y-3">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-16" />
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-6 w-16" rounded="full" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// Loading overlay component
export const LoadingOverlay = ({ children, loading, skeleton }) => {
  if (!loading) return children;
  
  return (
    <div className="relative">
      {children}
      <div className="absolute inset-0 bg-white/80 dark:bg-bg-page-dark/80 backdrop-blur-sm flex items-center justify-center z-10">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-sm text-gray-600 dark:text-text-secondary-dark">Loading...</p>
        </div>
      </div>
    </div>
  );
};

// Page loading skeleton
export const PageSkeleton = ({ type = 'default' }) => {
  const renderSkeleton = () => {
    switch (type) {
      case 'appointments':
        return <AppointmentSkeleton />;
      case 'dashboard':
        return (
          <div className="space-y-6">
            <DashboardStatsSkeleton />
            <AppointmentSkeleton count={3} />
          </div>
        );
      case 'doctors':
        return <DoctorSkeleton />;
      case 'bills':
        return <BillSkeleton />;
      case 'prescriptions':
        return <PrescriptionSkeleton />;
      case 'medical-history':
        return <MedicalHistorySkeleton />;
      case 'inventory':
        return <InventorySkeleton />;
      case 'profile':
        return <ProfileSkeleton />;
      default:
        return <AppointmentSkeleton />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-bg-page-dark p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        {renderSkeleton()}
      </div>
    </div>
  );
};

// Add shimmer animation to global CSS
export const addShimmerAnimation = () => {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes shimmer {
      0% {
        background-position: -200% 0;
      }
      100% {
        background-position: 200% 0;
      }
    }
  `;
  document.head.appendChild(style);
};

export default Skeleton;
