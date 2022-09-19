import { format as DateFormat } from 'date-fns';

export const isValidDate = (
  dateStr: string,
  format: string = 'yyyy-MM-dd'
): boolean => {
  const d = new Date(dateStr);
  try {
    const formatDate = DateFormat(d, format);
    return dateStr === formatDate;
  } catch (error) {
    return false;
  }
};
