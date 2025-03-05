import React from "react";

interface ListWindowProps {
  title: string;
  items: any[];
  formatItem: (item: any) => string;
  // If true, center the content (useful for when there are only a few logs)
  centerContent?: boolean;
}

const ListWindow: React.FC<ListWindowProps> = ({
  title,
  items,
  formatItem,
  centerContent = false,
}) => {
  return (
    <div className="bg-zinc-100 rounded-2xl shadow p-6 h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold text-gray-500">{title}</h2>
      </div>
      {centerContent ? (
        // When centerContent is true, let the container grow and center its inner content vertically.
        <div className="flex-grow flex flex-col items-center justify-center">
          <ul className="w-full">
            {items && items.length > 0 ? (
              items.map((item: any) => (
                <li
                  key={item.id || item.created_at}
                  className="py-2 border-b text-gray-500"
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
        // Otherwise, use a scrollable container with a max height.
        <div className="overflow-y-auto max-h-[60vh]">
          <ul>
            {items && items.length > 0 ? (
              items.map((item: any) => (
                <li
                  key={item.id || item.created_at}
                  className="py-2 border-b text-gray-500"
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