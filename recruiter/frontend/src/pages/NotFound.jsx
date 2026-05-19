import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
    return (
        <div className="flex items-center justify-center min-h-screen bg-[#0f172a] p-4 font-['Outfit']">
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute -top-[10%] -left-[10%] w-[400px] h-[400px] bg-[#6366f1] rounded-full blur-[80px] opacity-20"></div>
                <div className="absolute -bottom-[10%] -right-[10%] w-[300px] h-[300px] bg-[#a855f7] rounded-full blur-[80px] opacity-20"></div>
            </div>

            <div className="relative z-10 text-center max-w-lg">
                <div className="text-[8rem] sm:text-[10rem] font-extrabold leading-none bg-gradient-to-br from-[#6366f1] to-[#a855f7] bg-clip-text text-transparent animate-pulse">
                    404
                </div>
                <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">Page Not Found</h1>
                <p className="text-slate-400 text-lg mb-10 leading-relaxed">
                    The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
                </p>
                <Link
                    to="/dashboard"
                    className="inline-block px-8 py-3 bg-[#6366f1] hover:bg-[#4f46e5] text-white font-semibold rounded-lg transition-all transform hover:-translate-y-1 shadow-lg hover:shadow-[#6366f1]/25"
                >
                    Back to Dashboard
                </Link>
            </div>
        </div>
    );
};

export default NotFound;
