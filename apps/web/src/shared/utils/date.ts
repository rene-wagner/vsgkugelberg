export function formatDate(
  date: string | Date,
  locale: string = 'de-DE',
): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(dateObj);
}

export function formatDateTime(
  date: string | Date,
  locale: string = 'de-DE',
): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(dateObj);
}

export function formatRelativeTime(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);

  const units = [
    { value: 31536000, singular: 'Jahr', plural: 'Jahren' },
    { value: 2592000, singular: 'Monat', plural: 'Monaten' },
    { value: 86400, singular: 'Tag', plural: 'Tagen' },
    { value: 3600, singular: 'Stunde', plural: 'Stunden' },
    { value: 60, singular: 'Minute', plural: 'Minuten' },
    { value: 1, singular: 'Sekunde', plural: 'Sekunden' },
  ];

  for (const unit of units) {
    const value = Math.floor(diffInSeconds / unit.value);
    if (value >= 1) {
      const unitText = value === 1 ? unit.singular : unit.plural;
      return `vor ${value} ${unitText}`;
    }
  }

  return 'jetzt';
}
