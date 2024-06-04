import { DeleteIcon } from "@/Components/DeleteIcon";
import EditIcon from "@/Components/EditIcon";
import TablaResumen from "@/Components/TablaResumen";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { useState } from "react";
function Resumen({ auth, ausencias, llegadas_tarde }) {
    const [state, setstate] = useState();
    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                    Resumen de los ultimos 30 dias
                </h2>
            }
        >
            <div className="">
                <div class="flex justify-center mt-10 flex-wrap">
                    {llegadas_tarde.length ? (
                        <TablaResumen
                            resumen={llegadas_tarde}
                            tipo="Tarde"
                        ></TablaResumen>
                    ) : (
                        ""
                    )}
                    {ausencias.length ? (
                        <TablaResumen
                            resumen={ausencias}
                            tipo="Ausencia"
                        ></TablaResumen>
                    ) : (
                        ""
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

export default Resumen;
