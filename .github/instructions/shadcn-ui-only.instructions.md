---
name: shadcn-ui-only
description: "Use when: building UI components, creating buttons, forms, dialogs, or any visual elements. ONLY use shadcn/ui components. DO NOT create custom components. Always import from @/components/ui/*."
---

# Shadcn/UI Only - No Custom Components

## The Rule

**ALL UI elements in this app MUST use shadcn/ui components.**

❌ **DO NOT create custom components**
❌ **DO NOT build components from scratch**
✅ **ONLY use pre-built shadcn/ui components**

## Why?

- Consistent design system across the app
- Accessibility built-in
- Dark mode support guaranteed
- Responsive out-of-the-box
- Maintained and tested library

## Using Shadcn/UI Components

### Installation

All required components are already installed in `components/ui/`. Add new ones:

```bash
npx shadcn-ui@latest add [component-name]
```

### Import Pattern

```typescript
// ✅ CORRECT - Always import from @/components/ui/
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
```

❌ **NEVER**:
```typescript
// ❌ WRONG - Don't create custom button components
export function MyCustomButton() { ... }

// ❌ WRONG - Don't import from other locations
import Button from './Button';
```

## Common Shadcn/UI Components

### Structure & Layout

- **Card** - Container with border, padding, dark mode
- **Separator** - Visual divider
- **AspectRatio** - Maintain aspect ratio

### Forms & Input

- **Input** - Text, email, password fields
- **Label** - Form labels
- **Button** - Buttons (many variants)
- **Select** - Dropdown selection
- **Checkbox** - Checkbox input
- **RadioGroup** - Radio buttons
- **Textarea** - Multi-line text input
- **Switch** - Toggle switch
- **Form** - Complete form management

### Dialogs & Overlays

- **Dialog** - Modal dialog
- **AlertDialog** - Alert/confirmation dialog
- **Popover** - Floating popover
- **Tooltip** - Hover tooltip

### Display

- **Badge** - Status badge
- **Progress** - Progress bar
- **Skeleton** - Loading skeleton
- **Alert** - Alert messages
- **Tabs** - Tabbed content

### Navigation

- **Breadcrumb** - Breadcrumb navigation
- **Pagination** - Page navigation
- **Sidebar** - Side navigation

## Example: Building a Form

### ✅ CORRECT - Using shadcn/ui

```typescript
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function LinkForm() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Submit logic
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Link</CardTitle>
        <CardDescription>Enter a URL to shorten</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="url">URL</Label>
            <Input
              id="url"
              type="url"
              placeholder="https://example.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
            />
          </div>
          <Button type="submit" disabled={loading}>
            {loading ? 'Creating...' : 'Create Link'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
```

### ❌ WRONG - Custom Component

```typescript
// ❌ DO NOT DO THIS - Creating a custom form
export function CustomForm() {
  return (
    <div className="border rounded p-4">
      <h2>Create Link</h2>
      <form>
        <div>
          <label>URL</label>
          <input type="url" />
        </div>
        <button>Submit</button>
      </form>
    </div>
  );
}
```

## Dark Mode Support

All shadcn/ui components automatically support dark mode. No extra work needed:

```typescript
// ✅ Dark mode is automatic
<Button>Click me</Button>
// Works in light and dark modes without extra code
```

## Styling

Don't add custom CSS. Use shadcn/ui's built-in styling:

```typescript
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function MyComponent() {
  return (
    <>
      {/* ✅ Use variant prop */}
      <Button variant="default">Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="destructive">Danger</Button>
      <Button variant="ghost">Ghost</Button>

      {/* ✅ Use size prop */}
      <Button size="sm">Small</Button>
      <Button size="default">Default</Button>
      <Button size="lg">Large</Button>

      {/* ✅ Add custom className if needed (with cn util) */}
      <Button className={cn('custom-class', isActive && 'active-class')}>
        Custom
      </Button>
    </>
  );
}
```

## Composing Shadcn/UI Components

You CAN compose shadcn/ui components together, but don't extract them into separate custom components:

```typescript
// ✅ CORRECT - Using multiple shadcn/ui components in one place
export function LinkCard({ link }: { link: Link }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{link.slug}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-slate-600 dark:text-slate-400">{link.url}</p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            Copy
          </Button>
          <Button variant="destructive" size="sm">
            Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
```

## Adding Missing Components

If a component you need isn't installed, add it:

```bash
# Check what's available
npx shadcn-ui@latest list

# Install a new one
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add form
npx shadcn-ui@latest add toast
npx shadcn-ui@latest add dropdown-menu
```

## API Reference

Full shadcn/ui documentation: https://ui.shadcn.com/docs/

Each component in `components/ui/` has:
- **Props** - Available props and variants
- **Examples** - Usage examples
- **Accessibility** - Built-in WCAG compliance
- **Composition** - Sub-components available

## Common Variants

### Button Variants

```typescript
<Button variant="default" />   // Primary
<Button variant="secondary" /> // Secondary
<Button variant="destructive" /> // Red/danger
<Button variant="outline" />   // Bordered
<Button variant="ghost" />     // Minimal
<Button variant="link" />      // Link style
```

### Button Sizes

```typescript
<Button size="sm" />      // Small
<Button size="default" /> // Medium
<Button size="lg" />      // Large
<Button size="icon" />    // Icon button
```

## Input Components

All shadcn/ui form inputs work the same way:

```typescript
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';

export function Form() {
  return (
    <div className="space-y-4">
      <Input type="text" placeholder="Enter text" />
      <Textarea placeholder="Multi-line text" />
      
      <Select>
        <SelectTrigger>
          <SelectValue placeholder="Select option" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="option1">Option 1</SelectItem>
          <SelectItem value="option2">Option 2</SelectItem>
        </SelectContent>
      </Select>

      <Checkbox />
      <Switch />
    </div>
  );
}
```

## Dialog/Modal Pattern

```typescript
'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

export function DialogExample() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Open Dialog</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Dialog Title</DialogTitle>
          <DialogDescription>
            Dialog description goes here
          </DialogDescription>
        </DialogHeader>
        {/* Content */}
      </DialogContent>
    </Dialog>
  );
}
```

## Critical Rules ⚠️

1. **No custom components** - Every UI element comes from shadcn/ui
2. **No custom CSS for UI** - Use variant and className props
3. **Always import from @/components/ui/** - Never from other locations
4. **Composition is OK** - Arrange shadcn/ui components, but don't extract into custom components
5. **Dark mode automatic** - No special handling needed
6. **Install missing components** - Use `shadcn-ui add` command

## Checklist Before Implementing

- [ ] Check if shadcn/ui has this component
- [ ] Component is installed in `components/ui/`
- [ ] Using correct import path `@/components/ui/`
- [ ] Using variant and size props (not custom styling)
- [ ] Dark mode works (test in dark mode)
- [ ] Responsive (test on mobile)
- [ ] Not creating a custom wrapper component

