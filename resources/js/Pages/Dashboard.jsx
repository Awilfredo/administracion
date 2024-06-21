import Card from "@/Components/Card";
import Table from "@/Components/Table";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, useForm } from "@inertiajs/react";
import { useEffect, useState } from "react";

export default function Dashboard({ auth }) {
    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                    Dashboard
                </h2>
            }
        >
            <Head title="Dashboard" />
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 mt-5 gap-4 mx-10">
                <Card>fdgfdg</Card>
                <Card></Card>
            </div>
        </AuthenticatedLayout>
    );
}
