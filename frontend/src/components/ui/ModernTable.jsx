import React, { useState } from 'react';
import { 
  FiCalendar, FiClock, FiUser, FiActivity, FiFileText, 
  FiStar, FiEye, FiMoreHorizontal, FiCheck, FiX, 
  FiAlertCircle, FiChevronDown, FiChevronRight 
} from 'react-icons/fi';

// Status Badge Component
export const StatusBadge = ({ status, type = 'appointment' }) => {
  const getStatusConfig = (status, type) => {
    const configs = {
      appointment: {
        'Scheduled': { 
          bg: 'bg-gradient-to-r from-blue-50 to-blue-100', 
          text: 'text-blue-700', 
          border: 'border-blue-200',
          icon: <FiClock className="w-3 h-3" />
        },
        'Completed': { 
          bg: 'bg-gradient-to-r from-green-50 to-green-100', 
          text: 'text-green-700', 
          border: 'border-green-200',
          icon: <FiCheck className="w-3 h-3" />
        },
        'Cancelled': { 
          bg: 'bg-gradient-to-r from-red-50 to-red-100', 
          text: 'text-red-700', 
          border: 'border-red-200',
          icon: <FiX className="w-3 h-3" />
        },
        'Follow-up': { 
          bg: 'bg-gradient-to-r from-purple-50 to-purple-100', 
          text: 'text-purple-700', 
          border: 'border-purple-200',
          icon: <FiActivity className="w-3 h-3" />
        }
      },
      kyc: {
        'Submitted': { 
          bg: 'bg-gradient-to-r from-yellow-50 to-yellow-100', 
          text: 'text-yellow-700', 
          border: 'border-yellow-200',
          icon: <FiAlertCircle className="w-3 h-3" />
        },
        'Approved': { 
          bg: 'bg-gradient-to-r from-green-50 to-green-100', 
          text: 'text-green-700', 
          border: 'border-green-200',
          icon: <FiCheck className="w-3 h-3" />
        },
        'Rejected': { 
          bg: 'bg-gradient-to-r from-red-50 to-red-100', 
          text: 'text-red-700', 
          border: 'border-red-200',
          icon: <FiX className="w-3 h-3" />
        }
      }
    };
    
    return configs[type]?.[status] || configs.appointment['Scheduled'];
  };

  const config = getStatusConfig(status, type);
  
  return (
    <span className={`
      inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium
      ${config.bg} ${config.text} ${config.border} border
      transition-all duration-200 hover:shadow-sm
    `}>
      {config.icon}
      {status}
    </span>
  );
};

// Star Rating Component
export const StarRating = ({ rating, interactive = false, onRate = null, size = 'sm' }) => {
  const [hoverRating, setHoverRating] = useState(0);
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <FiStar
          key={star}
          className={`
            ${sizeClasses[size]} transition-all duration-200 cursor-pointer
            ${star <= (hoverRating || rating) 
              ? 'text-yellow-400 fill-yellow-400' 
              : 'text-gray-300'
            }
            ${interactive ? 'hover:text-yellow-400 hover:fill-yellow-400' : ''}
          `}
          onMouseEnter={() => interactive && setHoverRating(star)}
          onMouseLeave={() => interactive && setHoverRating(0)}
          onClick={() => interactive && onRate && onRate(star)}
        />
      ))}
      {rating > 0 && (
        <span className="ml-1 text-sm text-gray-600 font-medium">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
};

// Avatar Component
export const Avatar = ({ name, src, size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base'
  };

  const initials = name?.split(' ').map(n => n[0]).join('').toUpperCase() || '?';
  
  return (
    <div className={`
      ${sizeClasses[size]} rounded-full bg-gradient-to-br from-blue-400 to-blue-600 
      flex items-center justify-center text-white font-semibold
      shadow-sm ring-2 ring-white
    `}>
      {src ? (
        <img src={src} alt={name} className="w-full h-full rounded-full object-cover" />
      ) : (
        initials
      )}
    </div>
  );
};

// Date Time Display Component
export const DateTimeDisplay = ({ date, time, format = 'full' }) => {
  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  if (format === 'date-only') {
    return (
      <div className="flex items-center gap-2 text-gray-700">
        <FiCalendar className="w-4 h-4 text-blue-500" />
        <span className="font-medium">{formatDate(date)}</span>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2 text-gray-700">
        <FiCalendar className="w-4 h-4 text-blue-500" />
        <span className="font-medium">{formatDate(date)}</span>
      </div>
      {time && (
        <div className="flex items-center gap-2 text-gray-600">
          <FiClock className="w-4 h-4 text-teal-500" />
          <span className="text-sm">{time}</span>
        </div>
      )}
    </div>
  );
};

// Expandable Text Component
export const ExpandableText = ({ text, maxLength = 50 }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  if (!text || text.length <= maxLength) {
    return <span className="text-gray-700">{text || '—'}</span>;
  }

  return (
    <div className="relative">
      <span className="text-gray-700">
        {isExpanded ? text : `${text.substring(0, maxLength)}...`}
      </span>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="ml-2 text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
      >
        {isExpanded ? 'Less' : 'More'}
      </button>
    </div>
  );
};

// Modern Table Container
export const ModernTableContainer = ({ children, title, subtitle, actions }) => {
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
      {(title || subtitle || actions) && (
        <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
          <div className="flex items-center justify-between">
            <div>
              {title && (
                <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
              )}
              {subtitle && (
                <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
              )}
            </div>
            {actions && (
              <div className="flex items-center gap-3">
                {actions}
              </div>
            )}
          </div>
        </div>
      )}
      <div className="overflow-x-auto">
        {children}
      </div>
    </div>
  );
};

// Modern Table Header
export const ModernTableHeader = ({ columns }) => {
  return (
    <thead className="bg-gradient-to-r from-gray-50 to-gray-100 sticky top-0 z-10">
      <tr>
        {columns.map((column, index) => (
          <th
            key={index}
            className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200"
          >
            <div className="flex items-center gap-2">
              {column.icon}
              {column.label}
            </div>
          </th>
        ))}
      </tr>
    </thead>
  );
};

// Modern Table Row
export const ModernTableRow = ({ children, isEven = false, onClick = null, className = '' }) => {
  return (
    <tr
      className={`
        ${isEven ? 'bg-gray-50/50' : 'bg-white'}
        hover:bg-blue-50/50 transition-all duration-200 border-b border-gray-100 last:border-b-0
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
      onClick={onClick}
    >
      {children}
    </tr>
  );
};

// Modern Table Cell
export const ModernTableCell = ({ children, className = '' }) => {
  return (
    <td className={`px-6 py-4 whitespace-nowrap ${className}`}>
      {children}
    </td>
  );
};

// Action Button Component
export const ActionButton = ({ 
  variant = 'primary', 
  size = 'sm', 
  icon, 
  children, 
  onClick, 
  disabled = false,
  className = ''
}) => {
  const variants = {
    primary: 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white',
    success: 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white',
    danger: 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white',
    warning: 'bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white',
    secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300'
  };

  const sizes = {
    xs: 'px-2 py-1 text-xs',
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        inline-flex items-center gap-2 rounded-lg font-medium transition-all duration-200
        ${variants[variant]} ${sizes[size]}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-md hover:-translate-y-0.5'}
        ${className}
      `}
    >
      {icon}
      {children}
    </button>
  );
};

// Empty State Component
export const EmptyState = ({ icon, title, description, action }) => {
  return (
    <div className="text-center py-12 px-6">
      <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        {icon || <FiFileText className="w-8 h-8 text-gray-400" />}
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 mb-6 max-w-sm mx-auto">{description}</p>
      {action}
    </div>
  );
};

// Loading State Component
export const LoadingState = ({ rows = 5 }) => {
  return (
    <div className="animate-pulse">
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="flex items-center space-x-4 py-4 px-6 border-b border-gray-100">
          <div className="rounded-full bg-gray-200 h-10 w-10"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
          <div className="h-8 bg-gray-200 rounded w-20"></div>
        </div>
      ))}
    </div>
  );
};

// Mobile Card Component for responsive design
export const MobileCard = ({ children, className = '' }) => {
  return (
    <div className={`
      bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4
      hover:shadow-md transition-shadow duration-200
      ${className}
    `}>
      {children}
    </div>
  );
};
