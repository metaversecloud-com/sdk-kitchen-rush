import React, { useEffect, useState } from 'react';

interface BadgeToastProps {
  badgeName: string;
  iconPath: string;
  onClose: () => void;
}

const BadgeToast = ({ badgeName, iconPath, onClose }: BadgeToastProps) => {
  return (
    <div className="badge-toast-container">
      <div className="badge-toast-content">
        <div className="badge-icon-wrapper">
          <img src={iconPath} alt={badgeName} className="badge-popup-icon" />
        </div>
        <div className="badge-text">
          <span className="badge-unlocked">ACHIEVEMENT UNLOCKED!</span>
          <span className="badge-name">{badgeName}</span>
        </div>
      </div>
    </div>
  );
};

export default BadgeToast;