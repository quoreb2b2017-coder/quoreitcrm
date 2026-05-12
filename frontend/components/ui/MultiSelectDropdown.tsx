'use client';

import { useState, useRef, useEffect } from 'react';

export function MultiSelectDropdown({
  options,
  selectedValues,
  onChange,
  placeholder = "Select options...",
}: {
  options: { value: string; label: string }[];
  selectedValues: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggle = (value: string) => {
    if (selectedValues.includes(value)) {
      onChange(selectedValues.filter(v => v !== value));
    } else {
      onChange([...selectedValues, value]);
    }
  };

  const selectedLabels = options
    .filter(opt => selectedValues.includes(opt.value))
    .map(opt => opt.label);

  const displayText = selectedLabels.length === 0
    ? placeholder
    : selectedLabels.length <= 2
      ? selectedLabels.join(', ')
      : `${selectedLabels.length} selected`;

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-left flex justify-between items-center min-h-[42px]"
      >
        <span className={`truncate pr-2 ${selectedValues.length === 0 ? 'text-[var(--muted-foreground)]' : 'text-[var(--foreground)]'}`}>
          {displayText}
        </span>
        <svg className="h-4 w-4 flex-shrink-0 text-[var(--muted-foreground)]" fill="none" strokeWidth="2" stroke="currentColor" viewBox="0 0 24 24">
          <path d="M19 9l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] shadow-lg max-h-60 overflow-y-auto">
          <div className="p-1">
            {options.length === 0 ? (
              <div className="px-3 py-2 text-sm text-[var(--muted-foreground)] cursor-default">No options available</div>
            ) : (
              options.map((option) => {
                const isSelected = selectedValues.includes(option.value);
                return (
                  <div
                    key={option.value}
                    onClick={() => handleToggle(option.value)}
                    className="flex items-center gap-3 rounded-md px-3 py-2 hover:bg-[var(--secondary)] cursor-pointer"
                  >
                    <div className={`flex h-4 w-4 items-center justify-center rounded border ${isSelected ? 'bg-[var(--primary)] border-[var(--primary)] text-white' : 'border-[var(--border)] bg-transparent'}`}>
                      {isSelected && (
                        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <div className="flex flex-col flex-1 overflow-hidden">
                      <span className="text-sm text-[var(--foreground)] select-none truncate">{option.label}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
