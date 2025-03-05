import React from 'react';

interface ListWindowProps {
  title: string;
  items: any[];
  formatItem: (item: any) => string;
}

const ListWindow: React.FC<ListWindowProps> = ({ title, items, formatItem }) => {
  return (
    <div className="bg-zinc-100 rounded-2xl shadow p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold text-gray-500">{title}</h2>
      </div>
      <div className="overflow-y-auto max-h-[80vh]">
      
        <ul>
          {items && items.length > 0 ? (
            items.map((item: any) => (
              <li key={item.id || item.created_at} className="py-2 border-b text-gray-500">
                {formatItem(item)}
              </li>
            ))
          ) : (
            <li className="py-2 text-gray-500">No data available.</li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default ListWindow;