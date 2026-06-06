const ApplicationCardSkeleton = () => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col gap-3.5 animate-pulse h-[135px]">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-lg bg-slate-200 shrink-0"></div>
        <div className="flex-1 min-w-0 py-1">
          <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-slate-200 rounded w-1/2"></div>
        </div>
        <div className="w-12 h-5 rounded-full bg-slate-200 shrink-0"></div>
      </div>
      <div className="h-px bg-slate-100" />
      <div className="flex items-center justify-between mt-1">
        <div className="w-20 h-6 rounded-full bg-slate-200"></div>
        <div className="flex items-center gap-3">
          <div className="w-20 h-3 rounded bg-slate-200"></div>
          <div className="w-9 h-9 rounded-full bg-slate-200"></div>
        </div>
      </div>
    </div>
  );
};

export default ApplicationCardSkeleton;
