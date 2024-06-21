function CloseButton({ className = "", onClick }) {
    return (
        <button
            className={
                "bg-red-600 text-white hover:bg-red-700 h-8 w-8 rounded text-xl" + className
            }
            onClick={onClick}
        >
            X
        </button>
    );
}

export default CloseButton;
