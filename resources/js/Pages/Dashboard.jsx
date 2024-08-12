import Card from "@/Components/Card";
import { ManejoFechas } from "@/Helpers/ManejoFechas";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link } from "@inertiajs/react";
import {  useState } from "react";

export default function Dashboard({ auth, data }) {
    const [datos, setDatos] = useState(data[0]);
    const { fechaActual } = ManejoFechas();
    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                    Dashboard {fechaActual()}
                </h2>
            }
        >
            <Head title="Dashboard" />
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 mt-5 gap-4 mx-10">
                <Link href={route('empleados.index')}>
                    <Card
                        title="Empleados Activos"
                        dato={datos.empleados_activos}
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="200"
                            height="200"
                            viewBox="0 0 24 24"
                        >
                            <path
                                fill="currentColor"
                                d="M24 14.6c0 .6-1.2 1-2.6 1.2c-.9-1.7-2.7-3-4.8-3.9c.2-.3.4-.5.6-.8h.8c3.1-.1 6 1.8 6 3.5zM6.8 11H6c-3.1 0-6 1.9-6 3.6c0 .6 1.2 1 2.6 1.2c.9-1.7 2.7-3 4.8-3.9l-.6-.9zm5.2 1c2.2 0 4-1.8 4-4s-1.8-4-4-4s-4 1.8-4 4s1.8 4 4 4zm0 1c-4.1 0-8 2.6-8 5c0 2 8 2 8 2s8 0 8-2c0-2.4-3.9-5-8-5zm5.7-3h.3c1.7 0 3-1.3 3-3s-1.3-3-3-3c-.5 0-.9.1-1.3.3c.8 1 1.3 2.3 1.3 3.7c0 .7-.1 1.4-.3 2zM6 10h.3C6.1 9.4 6 8.7 6 8c0-1.4.5-2.7 1.3-3.7C6.9 4.1 6.5 4 6 4C4.3 4 3 5.3 3 7s1.3 3 3 3z"
                            />
                        </svg>
                    </Card>
                </Link>
                <Link href={route('resumen')}>
                <Card dato={datos.empleados_tarde} title="Entradas tarde este mes">
                    <svg
                        className="text-green-800"
                        xmlns="http://www.w3.org/2000/svg"
                        width="200"
                        height="200"
                        viewBox="0 0 24 24"
                    >
                        <path
                            fill="currentColor"
                            d="M10.997 5.998a6.14 6.14 0 0 1 5.8 4.126l.075.233l.044.144h2.33a2.749 2.749 0 0 1 2.744 2.582l.005.167v1a1.75 1.75 0 0 1-1.606 1.743l-.143.005H18.62l.241.584a1.75 1.75 0 0 1-.813 2.22l-.137.064a1.749 1.749 0 0 1-.496.124l-.171.008h-1.787a1.75 1.75 0 0 1-1.51-.867l-.072-.137l-.539-1.143l.054-.007c-1.4.186-2.817.208-4.221.066l-.497-.057l-.535 1.136a1.75 1.75 0 0 1-1.583 1.005H4.75a1.749 1.749 0 0 1-1.618-2.415l.433-1.05a3.242 3.242 0 0 1-1.57-2.78a.75.75 0 0 1 .648-.742L2.745 12h1.88l.497-1.643a6.137 6.137 0 0 1 5.875-4.359Zm6.777 9.693c-.771.31-1.559.565-2.356.765l-.549.129l.362.77a.25.25 0 0 0 .117.119l.053.018l.056.007h1.787a.25.25 0 0 0 .248-.28l-.017-.065l-.478-1.156h-.043l.411-.148l.409-.159Zm-13.552 0l.39.152l.388.141l-.482 1.166a.25.25 0 0 0 .232.345h1.804l.057-.007a.25.25 0 0 0 .17-.137l.359-.763l.044.01a18.168 18.168 0 0 1-2.962-.906Zm6.775-8.194a4.638 4.638 0 0 0-4.371 3.087l-.068.207l-1.136 3.75l.163.059a16.67 16.67 0 0 0 10.42.133l.406-.133l.162-.059l-1.136-3.75a4.64 4.64 0 0 0-4.006-3.273l-.216-.016l-.218-.005Zm-6.977 6.5l.151-.5l-.507.002l.025.052c.086.166.198.316.33.446ZM17.37 12l.756 2.498l2.12.001a.25.25 0 0 0 .243-.192l.007-.058v-.999a1.25 1.25 0 0 0-1.122-1.243l-.128-.006H17.37Z"
                        />
                    </svg>
                </Card>
                </Link> 
                <Link href={route('resumen')}>
                <Card
                    dato={datos.empleados_ausente}
                    title={"Ausencias este mes"}
                >
                    <svg
                        className="text-gray-800"
                        xmlns="http://www.w3.org/2000/svg"
                        width="200"
                        height="200"
                        viewBox="0 0 14 14"
                    >
                        <g
                            fill="none"
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="M11.5 4h-9a2 2 0 0 0-2 2v5.5a2 2 0 0 0 2 2h9a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2m-7 0v-.5a2.5 2.5 0 1 1 5 0V4" />
                            <path d="M5.5 7.5A1.5 1.5 0 1 1 7 9v.5m.002 2a.25.25 0 1 1 0-.5m0 .5a.25.25 0 1 0 0-.5" />
                        </g>
                    </svg>
                </Card>
                </Link> 

                <Link href={route('resumen')}>
                <Card dato={datos.salidas_antes} title={'Salidas antes de hora de este mes'}>
                <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 2048 2048" className="text-red-400"><path fill="currentColor" d="M1792 768q40 0 75 15t61 41t41 61t15 75q0 40-15 75t-41 61t-61 41t-75 15h-320q-26 0-45-19l-147-146l-102 101l211 211q19 19 19 45v384q0 40-15 75t-41 61t-61 41t-75 15q-40 0-75-15t-61-41t-41-61t-15-75v-229l-128-128l-147 146q-19 19-45 19H256q-40 0-75-15t-61-41t-41-61t-15-75q0-40 15-75t41-61t61-41t75-15h293l80-79q-53-23-85-71t-32-106V512q0-27 10-50t27-40t41-28t50-10h512q0-53 20-99t55-82t81-55t100-20q53 0 99 20t82 55t55 81t20 100q0 42-13 80t-36 71t-56 56t-73 37l141 140h165zm-384-512q-27 0-50 10t-40 27t-28 41t-10 50q0 27 10 50t27 40t41 28t50 10q24 0 47-9t41-26t29-38t11-47q0-28-9-53t-25-43t-41-29t-53-11zm384 768q26 0 45-19t19-45q0-32-18-46t-46-18t-63-2t-68 4t-61-1t-45-20l-366-365H640v384q0 26 19 45t45 19q37 0 50-23t16-60t-2-77t-2-77t15-59t51-24h192q26 0 45 19t19 45q0 26-19 45t-45 19H896v192q0 26-19 45l-256 256q-19 19-45 19H256q-26 0-45 19t-19 45q0 26 19 45t45 19h421l174-173q19-19 45-19t45 19l192 192q19 19 19 45v256q0 26 19 45t45 19q26 0 45-19t19-45v-357l-237-238q-19-19-19-45t19-45l192-192q19-19 45-19t45 19l174 173h293z"/></svg>
                </Card>
                </Link>
            </div>
        </AuthenticatedLayout>
    );
}
