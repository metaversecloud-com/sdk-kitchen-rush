// renders order card visually
// need icons for each ingredient
// a timer progress bar
// a visual distinction;
import '../styles/Order.css';
import { OrderProps } from '../types/OrderProps'


const Order = ({order, isActive}: OrderProps) => { 
    return (
      <div className={isActive ? "order-card active" : "order-card"}>

      {/* HEADER */}
      <div className="order-header">
        <h3>Current Order</h3>

        {/* {isActive && (
          <div className="timer-bar">
            <div 
            className="timer-fill"
            style={{ '--timer-duration': `${order.timeLimit / 1000}s` } as React.CSSProperties}
          />
          </div>
        )} */}
      </div>

      {/* VISUALIZATION BOX */}
      <div className="order-visual">
        {/* Replace these with icons later */}
        <div className="visual-item">{order.size}</div>
        <div className="visual-item">{order.temp}</div>
        <div className="visual-item">{order.milk}</div>
        {order.flavor && <div className="visual-item">{order.flavor}</div>}
        {order.toppings?.map(t => (
          <div className="visual-item" key={t}>{t}</div>
        ))}
      </div>

      {/* INGREDIENT SECTIONS */}
      <div className="order-details">

        <div className="detail-group">
          <label>Size</label>
          <div className="options-row">
            <span className="option">{order.size}</span>
          </div>
        </div>

        <div className="detail-group">
          <label>Temp</label>
          <div className="options-row">
            <span className="option">{order.temp}</span>
          </div>
        </div>

        <div className="detail-group">
          <label>Milk</label>
          <div className="options-row">
            <span className="option">{order.milk}</span>
          </div>
        </div>

        {order.flavor && (
          <div className="detail-group">
            <label>Flavor</label>
            <div className="options-row">
              <span className="option">{order.flavor}</span>
            </div>
          </div>
        )}

        {order.toppings && (
          <div className="detail-group">
            <label>Toppings</label>
            <div className="options-row">
              {order.toppings.map(t => (
                <span className="option" key={t}>{t}</span>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>

    );
};

export default Order