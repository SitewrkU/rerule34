export function formatDate(dateString, withTime = false) {
  const date = new Date(dateString);

  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();

  const baseDate = `${day}.${month}.${year}`;

  if (!withTime) {
    return baseDate;
  }

  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  return `${baseDate} ${hours}:${minutes}:${seconds}`;
}

export function formatDuration(sec: number) {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  if (m > 0){
    return `${m}хв`
  }else{
    return `${s}сек`
  }
}