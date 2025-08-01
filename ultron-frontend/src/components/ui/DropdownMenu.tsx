import React, { useState, useRef, useEffect } from 'react';
import { cn } from '../../lib/utils';

interface DropdownMenuProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  align?: 'start' | 'end';
  direction?: 'up' | 'down';
  onClose?: () => void;
}

interface DropdownMenuItemProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  destructive?: boolean;
}

export function DropdownMenu({ trigger, children, align = 'end', direction = 'down', onClose }: DropdownMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        if (onClose) onClose();
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // If trigger is a button, clone it and add onClick
  const triggerWithClick = React.isValidElement(trigger)
    ? React.cloneElement(trigger as React.ReactElement, {
        onClick: (e: React.MouseEvent) => {
          e.stopPropagation();
          setIsOpen((prev) => !prev);
          if (trigger.props.onClick) trigger.props.onClick(e);
        },
      })
    : trigger;

  // Helper to close menu from children
  const closeMenu = () => {
    setIsOpen(false);
    if (onClose) onClose();
  };

  // Pass closeMenu to children via React.cloneElement if needed
  const childrenWithClose = React.Children.map(children, child => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child, { closeMenu });
    }
    return child;
  });

  return (
    <div className="relative" ref={dropdownRef}>
      {triggerWithClick}
      {isOpen && (
        <div
          className={cn(
            direction === 'up'
              ? 'absolute bottom-full mb-2 min-w-[8rem] max-w-[12rem] rounded-lg border bg-popover p-0.5 shadow-lg z-50 animate-fadein'
              : 'absolute top-full mt-2 min-w-[8rem] max-w-[12rem] rounded-lg border bg-popover p-0.5 shadow-lg z-50 animate-fadein',
            align === 'end' ? 'right-0' : 'left-0'
          )}
          style={{ transition: 'opacity 0.18s cubic-bezier(.4,0,.2,1)', opacity: 1 }}
        >
          {childrenWithClose}
        </div>
      )}
      <style>{`
        @keyframes fadein { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
        .animate-fadein { animation: fadein 0.18s cubic-bezier(.4,0,.2,1); }
      `}</style>
    </div>
  );
}

export function DropdownMenuItem({ 
  children, 
  onClick, 
  className, 
  destructive = false, 
  closeMenu 
}: DropdownMenuItemProps & { closeMenu?: () => void }) {
  return (
    <button
      onClick={() => {
        if (onClick) onClick();
        if (closeMenu) closeMenu();
      }}
      className={cn(
        'relative flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground',
        destructive && 'text-destructive hover:bg-destructive/10',
        className
      )}
    >
      {children}
    </button>
  );
}