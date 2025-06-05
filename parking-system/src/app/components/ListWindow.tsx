import React from "react";

interface ListWindowProps {
  title: string;
  items: any[];
  formatItem: (item: any) => string | JSX.Element;
  centerContent?: boolean;
  className?: string;
}

const ListWindow: React.FC<ListWindowProps> = ({
  title,
  items,
  formatItem,
  centerContent = false,
  className = "",
}) => {
  return (
    <div className={`bg-zinc-100 rounded-2xl shadow-md p-6 h-full flex flex-col ${className}`}>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold text-gray-500">{title}</h2>
      </div>
      {centerContent ? (
        <div className="flex-grow flex flex-col items-center justify-center">
          <ul className="w-full">
            {items && items.length > 0 ? (
              items.map((item: any, index: number) => (
                <li
                  key={item.id || item.created_at || index}
                  className={`py-2 text-gray-500 border-b ${
                    index === 0 ? "border-t" : ""
                  }`}
                >
                  {formatItem(item)}
                </li>
              ))
            ) : (
              <li className="py-2 text-gray-500 text-center">
                No data available.
              </li>
            )}
          </ul>
        </div>
      ) : (
        <div className="overflow-y-auto max-h-[70vh]">
          <ul>
            {items && items.length > 0 ? (
              items.map((item: any, index: number) => (
                <li
                  key={item.id || item.created_at || index}
                  className={`py-2 text-gray-500 border-b ${
                    index === 0 ? "border-t" : ""
                  }`}
                >
                  {formatItem(item)}
                </li>
              ))
            ) : (
              <li className="py-2 text-gray-500">No data available.</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ListWindow;