import React from "react";

interface InterfaceButtonProps {
    label: string;
    onClick?: () => void;
    className?: string;
}

const InterfaceButton: React.FC<InterfaceButtonProps> = ({ label, onClick, className = "" }) => {
    return (
        <button
            onClick={onClick}
            className={`h-10 px-5 py-3 font-medium text-sm text-[#637381] bg-transparent border border-[#b9babb] rounded-[10px] flex justify-center items-center gap-2.5 transition-colors duration-300 transform hover:bg-zinc-200 focus:outline-none ${className}`}
        >
            <span className="text-center">{label}</span>
        </button>
    );
};

export default InterfaceButton;