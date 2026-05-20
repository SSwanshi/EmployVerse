import { useState } from "react";
import Slider from "@mui/material/Slider";

export default function InternshipFilters({ onFiltersChange }) {
  const [stipendMin, setStipendMin] = useState(0);
  const [duration, setDuration] = useState([0, 12]);
  const [location, setLocation] = useState("");
  const handleSubmit = async () => {
    const filterParams = {
      stipendMin: stipendMin,
      durationMin: duration[0],
      durationMax: duration[1],
      location: location.trim()
    };

    onFiltersChange(filterParams);
  };

  const handleClear = () => {
    setStipendMin(0);
    setDuration([0, 12]);
    setLocation("");
    onFiltersChange({}); // Clear all filters
  };

  return (
    <div className="filter-sidebar w-full md:w-64 bg-white rounded-2xl shadow-sm border border-slate-100 p-6 h-fit font-sans">
      <div className="filter-header flex justify-between items-center border-b border-slate-50 pb-4 mb-6">
        <h3 className="font-extrabold text-slate-900 text-md tracking-tight">Filters</h3>
        <button
          type="button"
          className="text-xs text-blue-600 hover:text-blue-700 font-bold cursor-pointer transition-colors"
          onClick={handleClear}
        >
          Clear All
        </button>
      </div>

      <div className="space-y-6">
        {/* Stipend */}
        <div>
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
            Min Stipend (K)
          </h4>
          <div className="px-1.5">
            <Slider
              value={stipendMin}
              onChange={(_, newValue) => setStipendMin(newValue)}
              valueLabelDisplay="auto"
              min={0}
              max={200}
              sx={{
                color: '#2563eb',
                '& .MuiSlider-thumb': {
                  width: 14,
                  height: 14,
                  backgroundColor: '#ffffff',
                  border: '2.5px solid #2563eb',
                  '&:hover, &.Mui-focusVisible': {
                    boxShadow: '0px 0px 0px 8px rgba(37, 99, 235, 0.1)',
                  },
                },
                '& .MuiSlider-track': {
                  height: 4,
                },
                '& .MuiSlider-rail': {
                  height: 4,
                  color: '#cbd5e1',
                },
              }}
            />
          </div>
          <p className="text-xs font-semibold text-slate-500 mt-1">Min Stipend: {stipendMin}K</p>
        </div>

        {/* Duration */}
        <div>
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
            Duration (Months)
          </h4>
          <div className="px-1.5">
            <Slider
              value={duration}
              onChange={(_, newValue) => setDuration(newValue)}
              valueLabelDisplay="auto"
              min={0}
              max={12}
              sx={{
                color: '#2563eb',
                '& .MuiSlider-thumb': {
                  width: 14,
                  height: 14,
                  backgroundColor: '#ffffff',
                  border: '2.5px solid #2563eb',
                  '&:hover, &.Mui-focusVisible': {
                    boxShadow: '0px 0px 0px 8px rgba(37, 99, 235, 0.1)',
                  },
                },
                '& .MuiSlider-track': {
                  height: 4,
                },
                '& .MuiSlider-rail': {
                  height: 4,
                  color: '#cbd5e1',
                },
              }}
            />
          </div>
          <p className="text-xs font-semibold text-slate-500 mt-1">
            Range: {duration[0]} – {duration[1]} months
          </p>
        </div>

        {/* Location */}
        <div>
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
            Location
          </h4>
          <input
            type="text"
            className="w-full rounded-xl border border-slate-200 py-2 px-3.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all duration-200 text-xs text-slate-800 placeholder:text-slate-400 bg-slate-50"
            placeholder="e.g. Remote, Delhi"
            value={location}
            onChange={(e) => setLocation(e.target.value)}   
          />
        </div>

        {/* Action Button */}
        <button
          onClick={handleSubmit}
          className="w-full bg-slate-900 hover:bg-black text-white py-2.5 rounded-xl font-bold text-xs shadow-md transition-all duration-200 cursor-pointer mt-4"
        >
          Apply Filters
        </button>
      </div>
    </div>
  );
}