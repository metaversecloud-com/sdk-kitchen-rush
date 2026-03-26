// renders order card visually
// need icons for each ingredient
// a timer progress bar
// a visual distinction;
import { OrderProps } from '../types/OrderProps'

const Order = ({order, isActive}: OrderProps) => { 
    return (
      <div className={isActive ? 'active-order' : 'queued-order'}>
      <span>{order.size}</span>
      <span>{order.temp}</span>
      <span>{order.milk}</span>
      {order.flavor && <span>{order.flavor}</span>}
      {order.toppings && order.toppings.map(topping => (
        <span key={topping}>{topping}</span>
      ))}
      {isActive && <div className="timer">⏱</div>}
    </div>
    );
};

export default Order