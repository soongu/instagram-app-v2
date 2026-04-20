import styles from './DateDivider.module.scss';

const formatDateLabel = (date) => {
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(date);
};

const DateDivider = ({ dateString }) => {
  if (!dateString) return null;
  const date = new Date(dateString);
  return <div className={styles.divider}>{formatDateLabel(date)}</div>;
};

export default DateDivider;
