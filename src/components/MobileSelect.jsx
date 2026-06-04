import React, { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

/**
 * Drop-in replacement for Radix Select that renders as a bottom-sheet Drawer on mobile
 * and as the normal popover on desktop.
 *
 * Props mirror the standard Select:
 *   value, onValueChange, placeholder, disabled, children (SelectItem nodes)
 * Plus an optional `label` string shown in the drawer header.
 */
export default function MobileSelect({ value, onValueChange, placeholder, disabled, label, children, className }) {
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);

  // Collect items from children so we can render them in the drawer too
  const items = React.Children.toArray(children);

  // Find display label for current value
  const selectedItem = items.find(child => child.props?.value === value);
  const displayLabel = selectedItem?.props?.children ?? value ?? placeholder ?? 'Select…';

  if (!isMobile) {
    return (
      <Select value={value} onValueChange={onValueChange} disabled={disabled}>
        <SelectTrigger className={className}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {children}
        </SelectContent>
      </Select>
    );
  }

  // Mobile: trigger opens a bottom drawer
  return (
    <>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen(true)}
        className={cn(
          'flex h-11 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background',
          'focus:outline-none focus:ring-1 focus:ring-ring',
          'disabled:cursor-not-allowed disabled:opacity-50',
          !value && 'text-muted-foreground',
          className
        )}
      >
        <span className={cn(!value && 'text-muted-foreground')}>{displayLabel}</span>
        <svg className="h-4 w-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerContent>
          {label && (
            <DrawerHeader>
              <DrawerTitle>{label}</DrawerTitle>
            </DrawerHeader>
          )}
          <div className="flex flex-col gap-1 p-4 pb-8 overflow-y-auto max-h-[60vh]">
            {items.map((child, i) => {
              const itemValue = child.props?.value;
              const isSelected = itemValue === value;
              return (
                <button
                  key={itemValue ?? i}
                  type="button"
                  onClick={() => {
                    onValueChange?.(itemValue);
                    setOpen(false);
                  }}
                  className={cn(
                    'w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                    isSelected
                      ? 'bg-secondary/10 text-secondary'
                      : 'hover:bg-muted text-foreground'
                  )}
                >
                  {child.props?.children}
                </button>
              );
            })}
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
}