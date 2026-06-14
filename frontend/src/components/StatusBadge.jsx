import React from 'react';

const StatusBadge = ({ status }) => {
  let styles = {};

  switch (status?.toLowerCase()) {
    case 'tersedia':
      styles = {
        bg: '#0F6E5614',
        border: '#0F6E5644',
        color: '#5DCAA5',
        label: 'Tersedia'
      };
      break;
    case 'dipesan':
      styles = {
        bg: '#C9A84C14',
        border: '#C9A84C44',
        color: '#C9A84C',
        label: 'Dipesan'
      };
      break;
    case 'digunakan':
      styles = {
        bg: '#9A3D2014',
        border: '#9A3D2044',
        color: '#E07B5A',
        label: 'Digunakan'
      };
      break;
    default:
      styles = {
        bg: '#FFFFFF0A',
        border: '#FFFFFF22',
        color: '#FFFFFF88',
        label: status || 'Unknown'
      };
  }

  return (
    <span style={{
      backgroundColor: styles.bg,
      border: `1px solid ${styles.border}`,
      color: styles.color,
      padding: '3px 10px',
      borderRadius: '20px',
      fontSize: '10px',
      fontWeight: '500',
      letterSpacing: '0.3px',
      fontFamily: "'Inter', sans-serif"
    }}>
      {styles.label}
    </span>
  );
};

export default StatusBadge;