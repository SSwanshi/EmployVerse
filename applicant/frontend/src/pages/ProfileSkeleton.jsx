const ProfileSkeleton = () => {
  return (
    <div className="pt-28 pb-20 bg-slate-50 min-h-screen font-sans">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Left Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Profile Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-150/60 p-6 animate-pulse">
              <div className="flex flex-col items-center">
                <div className="w-32 h-32 rounded-full bg-slate-200 mb-6"></div>
                <div className="h-5 bg-slate-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-slate-200 rounded w-1/2 mb-6"></div>
                
                <div className="w-full mb-3">
                  <div className="h-10 border border-slate-200 border-dashed rounded-xl bg-slate-100"></div>
                </div>
                <div className="flex space-x-2 w-full">
                  <div className="flex-1 h-8 bg-slate-200 rounded-xl"></div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-150/60 p-6 animate-pulse">
              <div className="h-3 bg-slate-200 rounded w-1/2 mb-4"></div>
              <div className="space-y-2">
                <div className="h-10 bg-slate-100 rounded-xl"></div>
                <div className="h-10 bg-slate-100 rounded-xl"></div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Profile Information */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-150/60 overflow-hidden animate-pulse">
              <div className="px-6 py-4 border-b border-slate-50">
                <div className="h-5 bg-slate-200 rounded w-1/4"></div>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[1, 2, 3, 4, 5, 6].map(i => (
                    <div key={i} className="flex flex-col gap-1 bg-slate-50 p-4 rounded-xl border border-slate-100/50">
                      <div className="h-3 bg-slate-200 rounded w-1/3"></div>
                      <div className="h-4 bg-slate-200 rounded w-1/2 mt-1"></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Resume Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-150/60 overflow-hidden animate-pulse">
              <div className="px-6 py-4 border-b border-slate-50">
                <div className="h-5 bg-slate-200 rounded w-1/4"></div>
              </div>
              <div className="p-6">
                <div className="h-24 bg-slate-50 rounded-2xl border border-slate-100/50"></div>
              </div>
            </div>

            {/* Additional Information */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-150/60 overflow-hidden animate-pulse">
              <div className="px-6 py-4 border-b border-slate-50">
                <div className="h-5 bg-slate-200 rounded w-1/3"></div>
              </div>
              <div className="p-6 space-y-6">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="bg-white p-5 rounded-2xl border border-slate-150/65 shadow-sm">
                    <div className="h-3 bg-slate-200 rounded w-1/4 mb-3"></div>
                    <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSkeleton;
