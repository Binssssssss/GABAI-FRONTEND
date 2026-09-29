
export const formatTimerTime = (
  totalSecs: number,
): string => {
  const mins = Math.floor(totalSecs / 60);
  const secs = totalSecs % 60;

  return `${mins
    .toString()
    .padStart(2, '0')}:${secs
    .toString()
    .padStart(2, '0')}`;
};

export const generateMessageId = (): string => {
  return (
    Date.now().toString() +
    Math.random().toString().slice(2, 6)
  );
};

export const getCurrentTimestamp = (): string => {
  return new Date().toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
};
