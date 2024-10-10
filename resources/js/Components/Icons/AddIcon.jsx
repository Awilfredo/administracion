function AddIcon({ width = "200", height = "200", className='' }) {
    return (
        <svg
            className={className}
            xmlns="http://www.w3.org/2000/svg"
            width={width}
            height={height}
            viewBox="0 0 14 14"
        >
            <path
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M7 4v6M4 7h6m.5-6.5h-7a3 3 0 0 0-3 3v7a3 3 0 0 0 3 3h7a3 3 0 0 0 3-3v-7a3 3 0 0 0-3-3"
            />
        </svg>
    );
}

export default AddIcon;
