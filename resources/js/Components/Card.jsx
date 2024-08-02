function Card({children, title, dato}) {
    return (
        <div className="md:col-span-2 lg:col-span-1">
            <div className="h-full py-8 px-6 space-y-6 rounded-xl border border-gray-200 bg-white">
                
                <div className="grid gap-4 text-gray-600">
                        <div className="flex justify-center text-blue-400">
                        {children}
                        </div>
                        <div className="w-full flex flex-wrap mt-5 justify-center">
                            <p className="w-full text-center text-lg">
                                {title}
                            </p>
                            <span className="text-7xl mt-5">
                                {dato}
                            </span>
                        </div>
                    </div>
            </div>
        </div>
    );
}

export default Card;

