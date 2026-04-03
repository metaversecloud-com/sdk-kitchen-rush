// displays tray
import '../styles/Order.css';
import { TrayProps } from '../types/TrayProps'


const Tray = ({tray}: TrayProps) => { 
    return (
    //   <div className={isActive ? "order-card active" : "order-card"}>
    <div> 
      {/* HEADER */}
      <div className="order-header">
        <h3>Your Tray</h3>
      </div>

      {/* VISUALIZATION BOX */}
      <div className="order-visual">
        {/* Replace these with icons later */}
        <div className="visual-item">{tray.size}</div>
        <div className="visual-item">{tray.temp}</div>
        <div className="visual-item">{tray.milk}</div>
        {tray.flavor && <div className="visual-item">{tray.flavor}</div>}
        {tray.toppings?.map(t => (
          <div className="visual-item" key={t}>{t}</div>
        ))}
      </div>
    </div>

    );
};

export default Tray