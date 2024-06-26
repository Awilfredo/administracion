function Calendar() {
    const fechaHoraActual = new Date();
    const diaSemana = fechaHoraActual.getDay();
    const diaMes = fechaHoraActual.getDate();
    const mes = fechaHoraActual.getMonth();
    return (
        <div className="bg-gray-100 p-6">
            <div class="flex bg-white shadow-md justify-start md:justify-center rounded-lg overflow-x-scroll mx-auto py-4 px-2  md:mx-12 mb-10">
                <div class="flex group hover:bg-purple-500 hover:shadow-lg hover-dark-shadow rounded-full mx-1 transition-all	duration-300	 cursor-pointer justify-center w-16">
                    <div class="flex items-center px-4 py-4">
                        <div class="text-center">
                            <p class="text-gray-900 group-hover:text-gray-100 text-sm transition-all  group-hover:font-semibold duration-300">
                                {" "}
                                Sun{" "}
                            </p>
                            <p class="text-gray-900 group-hover:text-gray-100 mt-3 group-hover:font-bold transition-all	duration-300">
                                {" "}
                                11{" "}
                            </p>
                        </div>
                    </div>
                </div>

                <div class="flex group hover:bg-purple-500 hover:shadow-lg hover-dark-shadow rounded-full mx-1 transition-all	duration-300	 cursor-pointer justify-center  w-16">
                    <div class="flex items-center px-4 py-4">
                        <div class="text-center">
                            <p class="text-gray-900 group-hover:text-gray-100 text-sm transition-all  group-hover:font-semibold duration-300">
                                {" "}
                                Mon{" "}
                            </p>
                            <p class="text-gray-900 group-hover:text-gray-100 mt-3 group-hover:font-bold transition-all	duration-300">
                                {" "}
                                12{" "}
                            </p>
                        </div>
                    </div>
                </div>

                <div class="flex group hover:bg-purple-500 hover:shadow-lg hover-dark-shadow rounded-full mx-1 transition-all	duration-300	 cursor-pointer justify-center  w-16">
                    <div class="flex items-center px-4 py-4">
                        <div class="text-center">
                            <p class="text-gray-900 group-hover:text-gray-100 text-sm transition-all font-normal group-hover:font-semibold	duration-300">
                                {" "}
                                Tue{" "}
                            </p>
                            <p class="text-gray-900 group-hover:text-gray-100 mt-3 group-hover:font-bold transition-all	duration-300">
                                {" "}
                                13
                            </p>
                        </div>
                    </div>
                </div>

                <div class="flex group bg-purple-600 shadow-lg dark-shadow rounded-full mx-1 cursor-pointer justify-center relative  w-16">
                    <span class="flex h-2 w-2 absolute bottom-1.5 ">
                        <span class="animate-ping absolute group-hover:opacity-75 opacity-0 inline-flex h-full w-full rounded-full bg-purple-400 "></span>
                        <span class="relative inline-flex rounded-full h- w-3 bg-purple-100"></span>
                    </span>
                    <div class="flex items-center px-4 my-2 py-4">
                        <div class="text-center">
                            <p class="text-gray-100 text-sm font-semibold">
                                {" "}
                                Wed{" "}
                            </p>
                            <p class="text-gray-100  mt-3 font-bold"> 14 </p>
                        </div>
                    </div>
                </div>

                <div class="flex group hover:bg-purple-500 hover:shadow-lg hover-dark-shadow rounded-full mx-1 transition-all	duration-300 cursor-pointer justify-center w-16">
                    <div class="flex items-center px-4 py-4">
                        <div class="text-center">
                            <p class="text-gray-900 group-hover:text-gray-100 text-sm transition-all  group-hover:font-semibold duration-300">
                                {" "}
                                Thu{" "}
                            </p>
                            <p class="text-gray-900 group-hover:text-gray-100 mt-3 group-hover:font-bold transition-all	duration-300">
                                {" "}
                                15{" "}
                            </p>
                        </div>
                    </div>
                </div>

                <div class="flex group hover:bg-purple-500 hover:shadow-lg hover-dark-shadow rounded-full mx-1 transition-all	duration-300	 cursor-pointer justify-center  w-16">
                    <div class="flex items-center px-4 py-4">
                        <div class="text-center">
                            <p class="text-gray-900 group-hover:text-gray-100 text-sm transition-all  group-hover:font-semibold duration-300">
                                {" "}
                                Fri{" "}
                            </p>
                            <p class="text-gray-900 group-hover:text-gray-100 mt-3 group-hover:font-bold transition-all	duration-300">
                                {" "}
                                16{" "}
                            </p>
                        </div>
                    </div>
                </div>

                <div class="flex group hover:bg-purple-500 hover:shadow-lg hover-dark-shadow rounded-full mx-1 transition-all	duration-300	 cursor-pointer justify-center w-16">
                    <div class="flex items-center px-4 py-4">
                        <div class="text-center">
                            <p class="text-gray-900 group-hover:text-gray-100 text-sm transition-all  group-hover:font-semibold duration-300">
                                {" "}
                                Sat{" "}
                            </p>
                            <p class="text-gray-900 group-hover:text-gray-100 mt-3 group-hover:font-bold transition-all	duration-300">
                                {" "}
                                17{" "}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Calendar;
