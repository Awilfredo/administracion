function AlertIcon({width='200', heigth='200', className=''}) {
    return (
        <svg
            className={className}
            xmlns="http://www.w3.org/2000/svg"
            width={width}
            height={heigth}
            viewBox="0 0 42 42"
        >
            <path
                fill="currentColor"
                d="M18.295 3.895L1.203 34.555C-.219 37.146.385 39.5 4.228 39.5H36.77c3.854 0 4.447-2.354 3.025-4.945L22.35 3.914c-.354-.691-.868-1.424-1.957-1.414c-1.16.021-1.735.703-2.098 1.395zM18.5 13.5h4v14h-4v-14zm0 17h4v4h-4v-4z"
            />
        </svg>
    );
}

export default AlertIcon;