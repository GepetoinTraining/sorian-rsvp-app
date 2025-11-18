'use client';

import { DatePickerInput } from '@mantine/dates';
import { IconCalendar } from '@tabler/icons-react';
import dayjs from 'dayjs';
import 'dayjs/locale/pt-br';

interface DateSelectorProps {
  label?: string;
  placeholder?: string;
  value: string[]; // strictly strings
  onChange: (dates: string[]) => void;
  error?: string | string[];
}

export function DateSelector({ 
  label = "Datas do Evento", 
  placeholder = "Selecione as datas",
  value, 
  onChange,
  error 
}: DateSelectorProps) {
  
  // Internal: Convert strings to Date objects for Mantine
  // We filter out invalid dates to prevent crashes
  const internalValue = value
    .map(dateStr => {
      // Fix specific timezone issues by appending T12:00:00 to ensure mid-day
      // This prevents dates shifting to the previous day due to timezone offsets
      const d = new Date(`${dateStr}T12:00:00`); 
      return isNaN(d.getTime()) ? null : d;
    })
    .filter((d): d is Date => d !== null);

  const handleChange = (dates: Date[]) => {
    // Convert back to simple YYYY-MM-DD strings
    const strings = dates.map(d => dayjs(d).format('YYYY-MM-DD'));
    onChange(strings);
  };

  return (
    <DatePickerInput
      type="multiple"
      label={label}
      placeholder={placeholder}
      leftSection={<IconCalendar size={16} />}
      value={internalValue}
      // FIX: Double cast to resolve "string[] vs Date[]" type conflict
      onChange={(val) => handleChange(val as unknown as Date[])}
      locale="pt-br"
      valueFormat="DD MMM YYYY"
      clearable
      error={error}
    />
  );
}