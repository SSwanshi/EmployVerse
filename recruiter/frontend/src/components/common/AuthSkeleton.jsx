import React from 'react';

const AuthSkeleton = () => {
  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-white font-sans animate-pulse">
      {/* Left side: Premium Branding Panel Skeleton */}
      <div className="hidden lg:flex flex-col justify-between bg-slate-950 p-16">
        <div className="h-8 w-48 bg-slate-800 rounded"></div>
        <div className="my-auto max-w-md space-y-8">
          <div className="h-12 w-full bg-slate-800 rounded"></div>
          <div className="h-12 w-3/4 bg-slate-800 rounded"></div>
          <div className="h-4 w-full bg-slate-800 rounded mt-8"></div>
          <div className="h-4 w-5/6 bg-slate-800 rounded"></div>
          <div className="space-y-4 mt-8">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-lg bg-slate-800"></div>
              <div className="h-4 w-48 bg-slate-800 rounded"></div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-lg bg-slate-800"></div>
              <div className="h-4 w-56 bg-slate-800 rounded"></div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-lg bg-slate-800"></div>
              <div className="h-4 w-40 bg-slate-800 rounded"></div>
            </div>
          </div>
        </div>
        <div className="h-3 w-64 bg-slate-800 rounded"></div>
      </div>

      {/* Right side: Form Container Skeleton */}
      <div className="flex items-center justify-center bg-slate-50 px-6 py-12 w-full h-full">
        <div className="w-full max-w-md bg-white border border-slate-100 rounded-2xl shadow-xl p-8 md:p-10">
          <div className="text-center mb-8">
            <div className="h-8 w-48 bg-slate-200 rounded mx-auto mb-2"></div>
            <div className="h-4 w-32 bg-slate-100 rounded mx-auto"></div>
          </div>
          
          <div className="space-y-5">
            <div>
              <div className="h-3 w-24 bg-slate-200 rounded mb-1.5"></div>
              <div className="h-11 w-full bg-slate-100 rounded-xl border border-slate-200"></div>
            </div>
            <div>
              <div className="flex justify-between mb-1.5">
                <div className="h-3 w-24 bg-slate-200 rounded"></div>
                <div className="h-3 w-20 bg-slate-200 rounded"></div>
              </div>
              <div className="h-11 w-full bg-slate-100 rounded-xl border border-slate-200"></div>
            </div>
            
            <div className="h-12 w-full bg-slate-200 rounded-xl mt-8"></div>
            
            <div className="h-3 w-40 bg-slate-100 rounded mx-auto mt-6"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthSkeleton;
