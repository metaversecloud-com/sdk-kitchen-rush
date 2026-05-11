interface BadgeToastProps {
  badgeName: string;
  iconPath: string;
  onClose: () => void;
}

export const BadgeToast = ({ badgeName, iconPath, onClose }: BadgeToastProps) => {
  return (
    <button type="button" className="badge-toast-container" onClick={onClose} aria-label="Dismiss badge">
      <div className="badge-toast-content">
        {iconPath && (
          <div className="badge-icon-wrapper">
            <img src={iconPath} alt="" className="badge-popup-icon" />
          </div>
        )}
        <div className="badge-text">
          <span className="badge-unlocked">ACHIEVEMENT UNLOCKED</span>
          <span className="badge-name">{badgeName}</span>
        </div>
      </div>
    </button>
  );
};

export default BadgeToast;
