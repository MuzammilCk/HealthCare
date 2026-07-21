import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  Star,
  Check,
  X,
  AlertCircle,
  FileText
} from 'lucide-react';

// Status Badge Component
export const StatusBadge = ({ status, type = 'appointment' }) => {
  const getStatusConfig = (status, type) => {
    const configs = {
      appointment: {
        'Scheduled': {
          bg: 'bg-brand-cyan/10',
          text: 'text-brand-cyan-fg',
          border: 'border-brand-cyan/20',
          icon: <Clock className="w-3 h-3" />
        },
        'Completed': {
          bg: 'bg-green-500/10',
          text: 'text-green-600',
          border: 'border-green-500/20',
          icon: <Check className="w-3 h-3" />
        },
        'Cancelled': {
          bg: 'bg-red-500/10',
          text: 'text-red-600',
          border: 'border-red-500/20',
          icon: <X className="w-3 h-3" />
        },
        'Missed': {
          bg: 'bg-orange-500/10',
          text: 'text-orange-600',
          border: 'border-orange-500/20',
          icon: <AlertCircle className="w-3 h-3" />
        },
        'Rejected': {
          bg: 'bg-red-500/10',
          text: 'text-red-600',
          border: 'border-red-500/20',
          icon: <X className="w-3 h-3" />
        },
        'cancelled_refunded': {
          bg: 'bg-yellow-500/10',
          text: 'text-yellow-600',
          border: 'border-yellow-500/20',
          icon: <X className="w-3 h-3" />
        },
        'cancelled_no_refund': {
          bg: 'bg-red-500/10',
          text: 'text-red-600',
          border: 'border-red-500/20',
          icon: <X className="w-3 h-3" />
        }
      },
      kyc: {
        'Submitted': {
          bg: 'bg-yellow-500/10',
          text: 'text-yellow-600',
          border: 'border-yellow-500/20',
          icon: <AlertCircle className="w-3 h-3" />
        },
        'Approved': {
          bg: 'bg-green-500/10',
          text: 'text-green-600',
          border: 'border-green-500/20',
          icon: <Check className="w-3 h-3" />
        },
        'Rejected': {
          bg: 'bg-red-500/10',
          text: 'text-red-600',
          border: 'border-red-500/20',
          icon: <X className="w-3 h-3" />
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
        <Star
          key={star}
          className={`
            ${sizeClasses[size]} transition-all duration-200 cursor-pointer
            ${star <= (hoverRating || rating)
              ? 'text-yellow-400 fill-yellow-400'
              : 'text-muted-foreground'
            }
            ${interactive ? 'hover:text-yellow-400 hover:fill-yellow-400' : ''}
          `}
          onMouseEnter={() => interactive && setHoverRating(star)}
          onMouseLeave={() => interactive && setHoverRating(0)}
          onClick={() => interactive && onRate && onRate(star)}
        />
      ))}
      {rating > 0 && (
        <span className="ml-1 text-sm text-muted-foreground font-medium">
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
      ${sizeClasses[size]} rounded-full bg-gradient-to-br from-brand-cyan to-brand-teal
      flex items-center justify-center text-white font-semibold
      shadow-sm ring-2 ring-border
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
      <div className="flex items-center gap-2 text-foreground">
        <Calendar className="w-4 h-4 text-brand-cyan-fg" />
        <span className="font-medium">{formatDate(date)}</span>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2 text-foreground">
        <Calendar className="w-4 h-4 text-brand-cyan-fg" />
        <span className="font-medium">{formatDate(date)}</span>
      </div>
      {time && (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Clock className="w-4 h-4 text-brand-teal" />
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
    return <span className="text-foreground">{text || '—'}</span>;
  }

  return (
    <div className="relative">
      <span className="text-foreground">
        {isExpanded ? text : `${text.substring(0, maxLength)}...`}
      </span>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="ml-2 text-brand-cyan-fg hover:text-brand-teal text-sm font-medium transition-colors"
      >
        {isExpanded ? 'Less' : 'More'}
      </button>
    </div>
  );
};

// Modern Table Container with Enhanced Depth
export const ModernTableContainer = ({ children, title, subtitle, actions }) => {
  return (
    <div className="bg-card rounded-2xl shadow-card dark:shadow-card-dark border border-border overflow-hidden">
      {(title || subtitle || actions) && (
        <div className="px-8 py-6 border-b border-border bg-foreground/5 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div>
              {title && (
                <h3 className="text-xl font-bold text-foreground tracking-tight">{title}</h3>
              )}
              {subtitle && (
                <p className="text-sm font-medium text-muted-foreground mt-1">{subtitle}</p>
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

// Modern Table Header with Enhanced Typography
export const ModernTableHeader = ({ columns }) => {
  return (
    <thead className="bg-foreground/5 backdrop-blur-sm sticky top-0 z-10">
      <tr>
        {columns.map((column, index) => (
          <th
            key={index}
            className="px-8 py-5 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider border-b border-border"
          >
            <div className="flex items-center gap-3">
              <span className="opacity-80">{column.icon}</span>
              <span className="font-bold">{column.label}</span>
            </div>
          </th>
        ))}
      </tr>
    </thead>
  );
};

// Modern Table Row with Enhanced Hover Effects
export const ModernTableRow = ({ children, isEven = false, onClick = null, className = '' }) => {
  return (
    <tr
      className={`
        ${isEven ? 'bg-foreground/5' : 'bg-background'}
        hover:bg-foreground/5 hover:shadow-sm
        transition-all duration-300 border-b border-border last:border-b-0
        ${onClick ? 'cursor-pointer hover:scale-[1.01]' : ''}
        ${className}
      `}
      onClick={onClick}
    >
      {children}
    </tr>
  );
};

// Modern Table Cell with Enhanced Spacing
export const ModernTableCell = ({ children, className = '' }) => {
  return (
    <td className={`px-8 py-5 whitespace-nowrap ${className}`}>
      {children}
    </td>
  );
};

// Action Button Component with Enhanced Variants
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
    primary: 'bg-gradient-to-r from-brand-cyan to-brand-teal hover:from-brand-cyan/90 hover:to-brand-teal/90 text-white shadow-lg shadow-brand-cyan/25 hover:shadow-brand-cyan/40',
    secondary: 'bg-card hover:bg-foreground/5 text-foreground border-2 border-border hover:border-foreground/20 shadow-sm hover:shadow-md',
    outline: 'bg-transparent hover:bg-foreground/5 text-brand-cyan-fg border-2 border-border hover:border-brand-cyan/30 shadow-sm hover:shadow-md',
    ghost: 'bg-transparent hover:bg-foreground/5 text-muted-foreground hover:text-foreground shadow-none hover:shadow-sm',
    success: 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg shadow-green-500/25 hover:shadow-green-500/40',
    danger: 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg shadow-red-500/25 hover:shadow-red-500/40',
    warning: 'bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white shadow-lg shadow-yellow-500/25 hover:shadow-yellow-500/40'
  };

  const sizes = {
    xs: 'px-3 py-1.5 text-xs font-medium',
    sm: 'px-4 py-2 text-sm font-semibold',
    md: 'px-6 py-2.5 text-sm font-semibold',
    lg: 'px-8 py-3 text-base font-semibold'
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        inline-flex items-center gap-2 rounded-xl font-medium transition-all duration-200
        ${variants[variant]} ${sizes[size]}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 active:scale-95'}
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
      <div className="mx-auto w-16 h-16 bg-foreground/5 rounded-full flex items-center justify-center mb-4">
        {icon || <FileText className="w-8 h-8 text-muted-foreground" />}
      </div>
      <h3 className="text-lg font-medium text-foreground mb-2">{title}</h3>
      <p className="text-muted-foreground mb-6 max-w-sm mx-auto">{description}</p>
      {action}
    </div>
  );
};

// Loading State Component
export const LoadingState = ({ rows = 5 }) => {
  return (
    <div className="animate-pulse">
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="flex items-center space-x-4 py-4 px-6 border-b border-border">
          <div className="rounded-full bg-foreground/5 h-10 w-10"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-foreground/5 rounded w-3/4"></div>
            <div className="h-3 bg-foreground/5 rounded w-1/2"></div>
          </div>
          <div className="h-8 bg-foreground/5 rounded w-20"></div>
        </div>
      ))}
    </div>
  );
};

// Mobile Card Component with Enhanced Depth
export const MobileCard = ({ children, className = '' }) => {
  return (
    <div className={`
      bg-card rounded-2xl shadow-card dark:shadow-card-dark border border-border p-6 mb-6
      hover:shadow-glow hover:scale-[1.02] transition-all duration-300
      ${className}
    `}>
      {children}
    </div>
  );
};
