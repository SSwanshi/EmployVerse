import React from 'react';

const DashboardSkeleton = () => {
  return (
    <div className="min-h-screen bg-slate-50/50 animate-pulse">
      {/* Hero Section Skeleton */}
      <div className="relative overflow-hidden bg-slate-900 border-b border-slate-800 min-h-screen lg:h-screen py-24 lg:py-0 flex flex-col justify-center">
        <div className="relative max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 w-full mt-8 lg:mt-0">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Left Content */}
            <div className="text-left space-y-6">
              <div className="h-12 md:h-16 bg-slate-800 rounded-lg w-3/4"></div>
              <div className="space-y-3">
                <div className="h-4 bg-slate-800 rounded w-full max-w-xl"></div>
                <div className="h-4 bg-slate-800 rounded w-5/6 max-w-xl"></div>
                <div className="h-4 bg-slate-800 rounded w-4/6 max-w-xl"></div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 max-w-md">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="h-10 bg-slate-800/60 rounded-xl"></div>
                ))}
              </div>
            </div>
            {/* Right Image */}
            <div className="hidden lg:block ml-[70px]">
              <div className="h-96 bg-slate-800 rounded-2xl"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions Skeleton */}
      <section className="py-16 bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="h-8 bg-gray-200 rounded w-48 mx-auto mb-12"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex flex-col items-center p-8 bg-slate-50 border border-slate-100 rounded-2xl">
                <div className="w-14 h-14 bg-gray-200 rounded-xl mb-5"></div>
                <div className="h-5 bg-gray-200 rounded w-32"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tools Section Skeleton */}
      <section className="py-16 bg-slate-50 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="h-8 bg-gray-200 rounded w-64 mx-auto mb-12"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-2xl border border-slate-100 overflow-hidden h-80 flex flex-col">
                <div className="h-48 bg-gray-200"></div>
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
                    <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                  </div>
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default DashboardSkeleton;
