
export function fill (str: string, n: number, space: string = '0') {
  while (str.length < n) {
    str = space + str;
  }

  return str;
}

export function formatDate (dateStr: string) {
  const date = new Date(dateStr);
  const year = date.getFullYear().toString();
  const month = fill((date.getMonth() + 1).toString(), 2);
  const day = fill(date.getDate().toString(), 2);
  const hours = fill(date.getHours().toString(), 2);
  const minutes = fill(date.getMinutes().toString(), 2);

  return year + '-' + month + '-' + day + 'T' + hours + ':' + minutes;
}
