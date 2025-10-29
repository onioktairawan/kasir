
import React, { useMemo } from 'react';

interface SalesActivityChartProps {
  data: { date: string; sales: number }[];
}

const SalesActivityChart: React.FC<SalesActivityChartProps> = ({ data }) => {
  const maxSales = useMemo(() => {
    if (data.length === 0) return 1; // Avoid division by zero
    return Math.max(...data.map(d => d.sales), 1); // Use 1 as minimum to avoid zero max
  }, [data]);

  const getBarHeight = (sales: number) => {
    if (sales === 0) return '2%'; // Give a very small height for zero sales days
    const percentage = (sales / maxSales) * 100;
    return `${Math.max(percentage, 2)}%`; // Ensure a minimum visible height
  };

  const isDifferentMonth = (index: number) => {
    if (index === 0) return true;
    const currentMonth = new Date(data[index].date).getMonth();
    const prevMonth = new Date(data[index - 1].date).getMonth();
    return currentMonth !== prevMonth;
  };

  return (
    <div className="w-full overflow-x-auto pb-4">
      <div className="flex space-x-1 h-48 items-end" style={{ minWidth: `${data.length * 1.5}rem`}}>
        {data.map((day, index) => {
          const date = new Date(day.date);
          const isToday = date.toDateString() === new Date().toDateString();
          return (
            <div key={day.date} className="flex-1 flex flex-col items-center justify-end h-full relative group">
              {isDifferentMonth(index) && (
                <div className="absolute -top-5 text-xs text-gray-400 font-semibold">
                    {date.toLocaleDateString('id-ID', { month: 'short' })}
                </div>
              )}
              <div
                className="w-full bg-primary-200 dark:bg-primary-800/50 rounded-md transition-all duration-300 ease-in-out group-hover:bg-primary-400 dark:group-hover:bg-primary-600"
                style={{ height: getBarHeight(day.sales) }}
              />
              <div className="absolute bottom-full mb-2 w-max px-2 py-1 bg-gray-800 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                <p>{date.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' })}</p>
                <p className="font-bold">{day.sales.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })}</p>
              </div>
               <span className={`text-xs mt-2 text-gray-500 dark:text-gray-400 ${isToday ? 'font-bold text-primary-600 dark:text-primary-400' : ''}`}>
                {date.getDate()}
               </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SalesActivityChart;
