import { useState, useRef, useEffect, useMemo } from 'react';
import { FiChevronDown, FiSearch, FiCheck, FiLoader } from 'react-icons/fi';
import { cn } from '../../utils/cn';

/**
 * AppSelect - A modern, accessible dropdown component for healthcare SaaS
 * 
 * Features:
 * - Consistent styling across all dropdowns
 * - Keyboard navigation support
 * - Search functionality for long lists
 * - Grouped options support
 * - Loading states
 * - Full accessibility compliance
 * - Responsive design
 */
const AppSelect = ({
  options = [],
  value = '',
  onChange = () => {},
  placeholder = 'Select an option',
  disabled = false,
  loading = false,
  searchable = false,
  searchPlaceholder = 'Search...',
  className = '',
  label = '',
  error = '',
  required = false,
  icon: Icon = null,
  size = 'md', // 'sm', 'md', 'lg'
  variant = 'default', // 'default', 'outline', 'ghost'
  grouped = false,
  groupKey = 'group',
  optionKey = 'value',
  optionLabel = 'label',
  maxHeight = 'max-h-64',
  ...props
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const [internalValue, setInternalValue] = useState(value);
  const [openUp, setOpenUp] = useState(false);
  const [dropdownMax, setDropdownMax] = useState(256); // pixels
  
  const selectRef = useRef(null);
  const searchRef = useRef(null);
  const optionRefs = useRef([]);

  // Update internal value when prop changes
  useEffect(() => {
    setInternalValue(value);
  }, [value]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm('');
        setFocusedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchable && searchRef.current) {
      searchRef.current.focus();
    }
  }, [isOpen, searchable]);

  // Auto position: decide opening direction and max height
  useEffect(() => {
    if (!isOpen) return;
    const updatePlacement = () => {
      const el = selectRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const viewportH = window.innerHeight || document.documentElement.clientHeight;
      const gap = 8; // px between control and dropdown
      const preferred = 320; // desired dropdown height
      const spaceBelow = Math.max(0, viewportH - rect.bottom - gap);
      const spaceAbove = Math.max(0, rect.top - gap);
      const shouldOpenUp = spaceBelow < 200 && spaceAbove > spaceBelow;
      setOpenUp(shouldOpenUp);
      const usable = shouldOpenUp ? spaceAbove : spaceBelow;
      const maxH = Math.max(160, Math.min(preferred, usable));
      setDropdownMax(maxH);
    };
    updatePlacement();
    window.addEventListener('resize', updatePlacement);
    window.addEventListener('scroll', updatePlacement, true);
    return () => {
      window.removeEventListener('resize', updatePlacement);
      window.removeEventListener('scroll', updatePlacement, true);
    };
  }, [isOpen]);

  // Filter options based on search term
  const filteredOptions = useMemo(() => {
    if (!searchable || !searchTerm) return options;
    
    return options.filter(option => {
      const label = typeof option === 'string' ? option : option[optionLabel];
      return label.toLowerCase().includes(searchTerm.toLowerCase());
    });
  }, [options, searchTerm, searchable, optionLabel]);

  // Group options if needed
  const groupedOptions = useMemo(() => {
    if (!grouped) return filteredOptions;
    
    const groups = {};
    filteredOptions.forEach(option => {
      const group = option[groupKey] || 'Other';
      if (!groups[group]) groups[group] = [];
      groups[group].push(option);
    });
    
    return Object.entries(groups).map(([groupName, groupOptions]) => ({
      group: groupName,
      options: groupOptions
    }));
  }, [filteredOptions, grouped, groupKey]);

  // Get display value
  const getDisplayValue = () => {
    if (!internalValue) return placeholder;
    
    const option = options.find(opt => {
      const val = typeof opt === 'string' ? opt : opt[optionKey];
      return val === internalValue;
    });
    
    if (!option) return placeholder;
    return typeof option === 'string' ? option : option[optionLabel];
  };

  // Handle option selection
  const handleSelect = (option) => {
    const val = typeof option === 'string' ? option : option[optionKey];
    setInternalValue(val);
    onChange(val, option);
    setIsOpen(false);
    setSearchTerm('');
    setFocusedIndex(-1);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (disabled) return;

    switch (e.key) {
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (isOpen && focusedIndex >= 0) {
          const option = grouped ? groupedOptions[focusedIndex]?.options[0] : filteredOptions[focusedIndex];
          if (option) handleSelect(option);
        } else {
          setIsOpen(!isOpen);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSearchTerm('');
        setFocusedIndex(-1);
        selectRef.current?.focus();
        break;
      case 'ArrowDown':
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        } else {
          const maxIndex = grouped ? groupedOptions.length - 1 : filteredOptions.length - 1;
          setFocusedIndex(prev => Math.min(prev + 1, maxIndex));
        }
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (isOpen) {
          setFocusedIndex(prev => Math.max(prev - 1, 0));
        }
        break;
      case 'Tab':
        setIsOpen(false);
        setSearchTerm('');
        setFocusedIndex(-1);
        break;
    }
  };

  // Scroll focused option into view
  useEffect(() => {
    if (focusedIndex >= 0 && optionRefs.current[focusedIndex]) {
      optionRefs.current[focusedIndex].scrollIntoView({
        block: 'nearest',
        behavior: 'smooth'
      });
    }
  }, [focusedIndex]);

  // Size classes
  const sizeClasses = {
    sm: 'h-10 text-sm px-3',
    md: 'h-12 text-base px-3',
    lg: 'h-14 text-lg px-4'
  };

  // Variant classes
  const variantClasses = {
    default: 'bg-white dark:bg-dark-surface border border-gray-300 dark:border-dark-border hover:border-gray-400 dark:hover:border-dark-surface-hover focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20',
    outline: 'bg-transparent border-2 border-gray-300 dark:border-dark-border hover:border-gray-400 dark:hover:border-dark-surface-hover focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20',
    ghost: 'bg-gray-50 dark:bg-dark-surface border border-transparent dark:border-dark-border hover:bg-gray-100 dark:hover:bg-dark-surface-hover focus:bg-white dark:focus:bg-dark-surface focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
  };

  return (
    <div className={cn('relative', className)} ref={selectRef}>
      {/* Label */}
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-text-secondary-dark mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {/* Select Button */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        disabled={disabled || loading}
        className={cn(
          'w-full flex items-center justify-between rounded-lg transition-all duration-150 ease-in-out',
          'focus:outline-none focus:ring-2 focus:ring-blue-500/20',
          sizeClasses[size],
          variantClasses[variant],
          disabled && 'opacity-50 cursor-not-allowed bg-gray-100 dark:bg-dark-surface',
          loading && 'opacity-75 cursor-wait',
          error && 'border-red-500 focus:border-red-500 focus:ring-red-500/20',
          isOpen && 'ring-2 ring-blue-500/20 border-blue-500'
        )}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-labelledby={label ? `${label}-label` : undefined}
        {...props}
      >
        <div className="flex items-center flex-1 min-w-0">
          {Icon && <Icon className="w-4 h-4 mr-2 text-gray-500 dark:text-text-secondary-dark flex-shrink-0" />}
          <span className={cn(
            'truncate',
            !internalValue && 'text-gray-500 dark:text-text-secondary-dark',
            internalValue && 'text-gray-900 dark:text-text-primary-dark font-medium'
          )}>
            {getDisplayValue()}
          </span>
        </div>
        
        <div className="flex items-center ml-2">
          {loading ? (
            <FiLoader className="w-4 h-4 text-gray-400 dark:text-text-secondary-dark animate-spin" />
          ) : (
            <FiChevronDown className={cn(
              'w-4 h-4 text-gray-400 dark:text-text-secondary-dark transition-transform duration-150',
              isOpen && 'rotate-180'
            )} />
          )}
        </div>
      </button>

      {/* Error Message */}
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}

      {/* Dropdown List */}
      {isOpen && (
        <div
          className={cn(
            'absolute z-[999] w-full bg-white rounded-md shadow-lg border border-gray-200',
            'sm:max-w-none max-w-[calc(100vw-2rem)]', // Responsive width
            openUp ? 'mb-2' : 'mt-2'
          )}
          style={openUp ? { bottom: '100%' } : { top: '100%' }}
        >
          {/* Search Input */}
          {searchable && (
            <div className="p-2 border-b border-gray-200">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  ref={searchRef}
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={searchPlaceholder}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
            </div>
          )}

          {/* Options List */}
          <div className="py-2 overflow-y-auto" style={{ maxHeight: dropdownMax }}>
            {loading ? (
              <div className="flex items-center justify-center py-4">
                <FiLoader className="w-4 h-4 text-gray-400 animate-spin mr-2" />
                <span className="text-sm text-gray-500">Loading...</span>
              </div>
            ) : grouped ? (
              // Grouped Options
              groupedOptions.length === 0 ? (
                <div className="px-3 py-2 text-sm text-gray-500">No options found</div>
              ) : (
                groupedOptions.map((group, groupIndex) => (
                  <div key={group.group}>
                    <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide bg-gray-50">
                      {group.group}
                    </div>
                    {group.options.map((option, optionIndex) => {
                      const index = groupIndex;
                      const val = option[optionKey];
                      const label = option[optionLabel];
                      const isSelected = val === internalValue;
                      const isFocused = index === focusedIndex;
                      
                      return (
                        <button
                          key={val}
                          ref={el => optionRefs.current[index] = el}
                          type="button"
                          onClick={() => handleSelect(option)}
                          className={cn(
                            'w-full text-left px-3 py-2 text-sm transition-colors duration-150',
                            'hover:bg-blue-50 hover:text-blue-600',
                            isSelected && 'bg-blue-50 text-blue-600 font-medium',
                            isFocused && 'bg-blue-50 text-blue-600'
                          )}
                        >
                          <div className="flex items-center justify-between">
                            <span>{label}</span>
                            {isSelected && <FiCheck className="w-4 h-4" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                ))
              )
            ) : (
              // Regular Options
              filteredOptions.length === 0 ? (
                <div className="px-3 py-2 text-sm text-gray-500">No options found</div>
              ) : (
                filteredOptions.map((option, index) => {
                  const val = typeof option === 'string' ? option : option[optionKey];
                  const label = typeof option === 'string' ? option : option[optionLabel];
                  const isSelected = val === internalValue;
                  const isFocused = index === focusedIndex;
                  
                  return (
                    <button
                      key={val}
                      ref={el => optionRefs.current[index] = el}
                      type="button"
                      onClick={() => handleSelect(option)}
                      className={cn(
                        'w-full text-left px-3 py-2 text-sm transition-colors duration-150',
                        'hover:bg-blue-50 hover:text-blue-600',
                        isSelected && 'bg-blue-50 text-blue-600 font-medium',
                        isFocused && 'bg-blue-50 text-blue-600'
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span>{label}</span>
                        {isSelected && <FiCheck className="w-4 h-4" />}
                      </div>
                    </button>
                  );
                })
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AppSelect;
