# AppSelect Component

A modern, accessible dropdown component for healthcare SaaS applications.

## Features

- ✅ **Consistent Design**: Unified styling across all dropdowns
- ✅ **Accessibility**: Full keyboard navigation, ARIA support, screen reader friendly
- ✅ **Searchable**: Built-in search functionality for long lists
- ✅ **Grouped Options**: Support for categorized options
- ✅ **Loading States**: Async loading with skeleton states
- ✅ **Responsive**: Mobile-first design with full-width on small screens
- ✅ **Customizable**: Multiple sizes, variants, and styling options
- ✅ **TypeScript Ready**: Full type definitions included

## Basic Usage

```jsx
import { AppSelect } from '../components/ui';

const options = [
  { value: 'option1', label: 'Option 1' },
  { value: 'option2', label: 'Option 2' },
  { value: 'option3', label: 'Option 3' }
];

function MyComponent() {
  const [value, setValue] = useState('');
  
  return (
    <AppSelect
      label="Select Option"
      placeholder="Choose an option"
      value={value}
      onChange={setValue}
      options={options}
    />
  );
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `options` | `Array` | `[]` | Array of options or option objects |
| `value` | `string` | `''` | Current selected value |
| `onChange` | `function` | `() => {}` | Callback when selection changes |
| `placeholder` | `string` | `'Select an option'` | Placeholder text |
| `label` | `string` | `''` | Label for the dropdown |
| `disabled` | `boolean` | `false` | Disable the dropdown |
| `loading` | `boolean` | `false` | Show loading state |
| `searchable` | `boolean` | `false` | Enable search functionality |
| `searchPlaceholder` | `string` | `'Search...'` | Search input placeholder |
| `required` | `boolean` | `false` | Mark as required field |
| `error` | `string` | `''` | Error message to display |
| `icon` | `React.Component` | `null` | Icon component to display |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Size variant |
| `variant` | `'default' \| 'outline' \| 'ghost'` | `'default'` | Style variant |
| `grouped` | `boolean` | `false` | Enable grouped options |
| `groupKey` | `string` | `'group'` | Key for group name in options |
| `optionKey` | `string` | `'value'` | Key for option value |
| `optionLabel` | `string` | `'label'` | Key for option label |
| `maxHeight` | `string` | `'max-h-64'` | Maximum height of dropdown |

## Examples

### Searchable Dropdown

```jsx
<AppSelect
  label="Search Districts"
  placeholder="Search and select district"
  value={selectedDistrict}
  onChange={setSelectedDistrict}
  options={districts.map(d => ({ value: d, label: d }))}
  searchable
  searchPlaceholder="Type to search districts..."
  icon={FiMapPin}
/>
```

### Grouped Options

```jsx
const groupedOptions = [
  { value: 'kerala-tvm', label: 'Thiruvananthapuram', group: 'Kerala' },
  { value: 'tamil-chennai', label: 'Chennai', group: 'Tamil Nadu' }
];

<AppSelect
  label="Cities by State"
  placeholder="Select a city"
  value={selectedCity}
  onChange={setSelectedCity}
  options={groupedOptions}
  grouped
  groupKey="group"
  searchable
/>
```

### Loading State

```jsx
<AppSelect
  label="Loading Options"
  placeholder="Loading..."
  options={[]}
  loading={isLoading}
  icon={FiCalendar}
/>
```

### Size Variants

```jsx
// Small
<AppSelect size="sm" options={options} />

// Medium (default)
<AppSelect size="md" options={options} />

// Large
<AppSelect size="lg" options={options} />
```

### Style Variants

```jsx
// Default
<AppSelect variant="default" options={options} />

// Outline
<AppSelect variant="outline" options={options} />

// Ghost
<AppSelect variant="ghost" options={options} />
```

## Accessibility Features

- **Keyboard Navigation**: Full arrow key support, Enter to select, Escape to close
- **Screen Reader Support**: Proper ARIA attributes and roles
- **Focus Management**: Automatic focus handling and restoration
- **High Contrast**: Meets WCAG contrast requirements
- **Touch Friendly**: Optimized for mobile and tablet use

## Styling

The component uses Tailwind CSS classes and follows the design system:

- **Colors**: Primary blue (#2563EB) for focus states
- **Borders**: Light gray (#E5E7EB) with blue focus
- **Shadows**: Subtle shadows with enhanced shadow when open
- **Transitions**: Smooth 150ms transitions for all interactions
- **Typography**: Inter font family with proper weights

## Responsive Behavior

- **Mobile**: Full width with touch-optimized sizing
- **Tablet**: Maintains form layout with appropriate spacing
- **Desktop**: Compact sizing for form layouts
- **Dropdown**: Responsive positioning and width

## Best Practices

1. **Use labels**: Always provide meaningful labels for accessibility
2. **Searchable for long lists**: Enable search for lists with 10+ options
3. **Group related options**: Use grouped options for better organization
4. **Loading states**: Show loading for async data fetching
5. **Error handling**: Display clear error messages
6. **Consistent sizing**: Use appropriate size variants for context

## Migration from Native Select

Replace native `<select>` elements:

```jsx
// Before
<select value={value} onChange={onChange}>
  <option value="">Select option</option>
  {options.map(opt => (
    <option key={opt.value} value={opt.value}>
      {opt.label}
    </option>
  ))}
</select>

// After
<AppSelect
  value={value}
  onChange={onChange}
  options={options}
  placeholder="Select option"
/>
```
