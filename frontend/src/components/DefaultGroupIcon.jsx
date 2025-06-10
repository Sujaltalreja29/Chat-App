// components/DefaultGroupIcon.jsx
import { Hash } from "lucide-react";

const DefaultGroupIcon = ({ 
  className = "w-12 h-12", 
  iconClassName = "w-6 h-6",
  showBorder = true 
}) => {
  return (
    <div className={`
      bg-gradient-to-br from-primary/20 to-primary/40 
      rounded-full flex items-center justify-center 
      ${showBorder ? 'border-2 border-primary/30' : ''}
      ${className}
    `}>
      <Hash className={`text-primary ${iconClassName}`} />
    </div>
  );
};

export default DefaultGroupIcon;