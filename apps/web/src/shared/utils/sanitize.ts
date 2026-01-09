export function sanitizeHtml(html: string): string {
  const temp = document.createElement('div');
  temp.textContent = html;
  return temp.innerHTML;
}

export function sanitizeText(text: string): string {
  const temp = document.createElement('div');
  temp.textContent = text;
  return temp.textContent;
}
