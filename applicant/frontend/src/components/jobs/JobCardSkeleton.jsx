const JobCardSkeleton = () => {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 animate-pulse flex flex-col justify-between h-[210px]">
      <div>
        {/* Header Title Row */}
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="flex items-center gap-3 w-full">
            <div className="h-10 w-10 bg-slate-200 rounded-lg shrink-0"></div>
            <div className="w-full">
              <div className="h-4 bg-slate-200 rounded mb-2 w-3/4 max-w-[200px]"></div>
              <div className="h-3 bg-slate-200 rounded w-1/2 max-w-[120px]"></div>
            </div>
          </div>
          <div className="flex flex-col items-end shrink-0">
            <div className="h-3 bg-slate-200 rounded mb-2 w-20"></div>
            <div className="h-2 bg-slate-200 rounded w-16"></div>
          </div>
        </div>

        {/* Badges row */}
        <div className="flex flex-wrap gap-2 mb-4 mt-4">
          <div className="h-5 w-16 bg-slate-200 rounded-lg"></div>
          <div className="h-5 w-20 bg-slate-200 rounded-lg"></div>
          <div className="h-5 w-24 bg-slate-200 rounded-lg"></div>
          <div className="h-5 w-24 bg-slate-200 rounded-lg"></div>
        </div>

        {/* Description */}
        <div className="space-y-2 mt-4">
          <div className="h-3 w-full bg-slate-200 rounded"></div>
          <div className="h-3 w-5/6 bg-slate-200 rounded"></div>
        </div>
      </div>

      {/* Footer Details */}
      <div className="flex items-center justify-between border-t border-slate-50 pt-3.5 mt-auto">
        <div className="h-4 w-24 bg-slate-200 rounded"></div>
        <div className="h-8 w-24 bg-slate-200 rounded-lg"></div>
      </div>
    </div>
  );
};

export default JobCardSkeleton;
