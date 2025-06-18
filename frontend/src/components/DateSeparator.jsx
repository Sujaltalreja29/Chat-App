// components/DateSeparator.jsx
import { formatDateSeparator } from "../lib/utils";

const DateSeparator = ({ date, isMobile = false }) => {
  return (
    <div className={`flex items-center justify-center my-4 ${
      isMobile ? 'my-3' : 'my-4'
    }`}>
      <div className={`bg-base-200 text-base-content/70 px-3 py-1 rounded-full shadow-sm border border-base-300 ${
        isMobile ? 'text-xs px-2 py-1' : 'text-sm px-3 py-1'
      }`}>
        <span className="font-medium">
          {formatDateSeparator(date)}
        </span>
      </div>
    </div>
  );
};

export default DateSeparator;