import AddIcon from "./Icons/AddIcon";

function CardAdd({ onClick, children }) {
    return (
        <div className="bg-white sm:100   mt-5 py-5 rounded-xl flex justify-center flex-wrap">
            <div className="w-full flex justify-center">
                <button
                    className="text-gray-600 hover:text-gray-900"
                    onClick={onClick}
                >
                    <AddIcon width="64px" height="64px"></AddIcon>
                </button>
            </div>
            {children}
        </div>
    );
}

export default CardAdd;
