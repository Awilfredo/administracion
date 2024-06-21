import ApplicationLogo from '@/Components/ApplicationLogo';
import { Link } from '@inertiajs/react';

export default function Guest({ children }) {
    return (
        <div className="min-h-screen flex flex-col sm:justify-center items-center pt-6 sm:pt-0 bg-gradient-to-r from-indigo-300 via-purple-300 to-slate-100">
            <div>
                <Link href="/">
                    <img src="https://static.wixstatic.com/media/98a19d_504d5e7478054d2484448813ac235267~mv2.png" alt="" className='w-40 h-40' />
                </Link>
            </div>

            <div className="w-full sm:max-w-md mt-6 px-6 py-4 bg-white shadow-md overflow-hidden sm:rounded-lg">
                {children}
            </div>
        </div>
    );
}
