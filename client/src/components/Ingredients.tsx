import React from 'react';
import { Order } from '../types/Order';

interface IngredientsProps {
  tray: Partial<Order>;
  onSelect: (category: keyof Order, value: string) => void;
}

const SINGLE_SELECT: (keyof Order)[] = ['size', 'temp', 'milk', 'flavor'];
const MULTI_SELECT: (keyof Order)[] = ['toppings'];

const INGREDIENTS = {
  size: ['Small', 'Medium', 'Large'],
  temp: ['Hot', 'Iced'],
  milk: ['Whole', 'Oat', 'Almond', 'None'],
  flavor: ['Vanilla', 'Caramel', 'Mocha', 'None'],
  toppings: ['Whip', 'Caramel Drizzle', 'Chocolate Drizzle', 'Cinnamon'],
};

const Ingredients = ({ tray, onSelect }: IngredientsProps) => {
  const isSelected = (category: keyof Order, value: string): boolean => {
    if (category === 'toppings') {
      return (tray.toppings ?? []).includes(value);
    }
    return tray[category] === value;
  };

  return (
    <div className="ingredients">
      {Object.entries(INGREDIENTS).map(([category, options]) => (
        <div key={category} className="ingredient-category">
          <h3>{category}</h3>
          <div className="ingredient-options">
            {options.map(option => (
              <button
                key={option}
                className={isSelected(category as keyof Order, option) ? 'selected' : ''}
                onClick={() => onSelect(category as keyof Order, option)}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Ingredients;