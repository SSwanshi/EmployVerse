import React, { useState, useMemo, useEffect, useRef } from 'react';
import Fuse from 'fuse.js';
import { useDebounce } from '../../hooks/useDebounce';
import { useNavigate } from 'react-router-dom';

/**
 * FuzzySearch Component
 * 
 * @param {Array} data - The array of objects to search through
 * @param {Array} keys - The keys in the objects to search (e.g., ['title', 'company'])
 * @param {string} placeholder - Input placeholder text
 * @param {function} onSelect - Callback when an item is selected
 */
const FuzzySearch = ({ data = [], keys = ['title'], placeholder = "Search...", onSelect }) => {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const wrapperRef = useRef(null);
  const navigate = useNavigate();

  // Custom hook to debounce the query by 300ms
  const debouncedQuery = useDebounce(query, 300);

  // Initialize Fuse instance, memoized to prevent expensive re-instantiations
  const fuse = useMemo(() => {
    return new Fuse(data, {
      keys: keys,
      threshold: 0.4, // Increased threshold for better fuzzy matching
      includeScore: true,
      ignoreLocation: true, // Don't penalize based on match position
      ignoreFieldNorm: true, // Don't penalize matches in longer strings (like full location names)
      useExtendedSearch: true // Allows more advanced searching if needed
    });
  }, [data, keys]);

  // Compute the results in real-time based on the debounced query
  const results = useMemo(() => {
    if (!debouncedQuery) {
      // If query is empty, show top 5 items or all items
      return data.slice(0, 5).map(item => ({ item }));
    }
    // Perform fuzzy search and return top 5 results
    return fuse.search(debouncedQuery).slice(0, 5);
  }, [debouncedQuery, fuse, data]);

  // Handle clicking outside of the search component to close the suggestions box
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsFocused(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [wrapperRef]);

  const handleItemClick = (item) => {
    setQuery('');
    setIsFocused(false);
    if (onSelect) {
      onSelect(item);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      setIsFocused(false);
      navigate(`/search?q=${encodeURIComponent(query)}`);
      setQuery('');
    }
  };

  return (
    <div ref={wrapperRef} className="relative w-full group">
      <form onSubmit={handleSubmit} className="relative w-full">
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/20 to-slate-800/20 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-300 pointer-events-none"></div>
        <input
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          className="relative w-full py-3 px-5 pr-12 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 text-slate-900 border-2 border-slate-400/60 focus:outline-none focus:ring-4 focus:ring-slate-900/30 focus:border-black transition-all duration-300 text-sm placeholder:text-slate-600 font-medium shadow-lg shadow-slate-900/10 hover:border-slate-600 hover:shadow-slate-900/20"
        />
        <button
          type="submit"
          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-700 hover:text-black transition-colors flex items-center justify-center cursor-pointer z-10"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>
      </form>

      {/* Suggestion Box */}
      {isFocused && (data.length > 0) && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-slate-100 overflow-hidden z-50">
          {results.length > 0 ? (
            <ul className="max-h-80 overflow-y-auto">
              {results.map((result, idx) => {
                const item = result.item;
                const title = item.title || item.jobTitle || item.intProfile;
                if (!title) return null; // Don't render items without a title
                
                const subtitle = item.company || item.companyName || item.jobCompany?.companyName || item.intCompany?.companyName || item.type || '';
                const location = item.location || item.jobLocation || item.intLocation || '';
                
                return (
                  <li 
                    key={item.id || item._id || idx}
                    onClick={() => handleItemClick(item)}
                    className="px-5 py-3 hover:bg-slate-50 border-b last:border-0 border-slate-100 cursor-pointer transition-colors"
                  >
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-slate-900">{title}</span>
                      <div className="flex items-center gap-2 mt-0.5">
                        {subtitle && <span className="text-xs text-slate-500 font-semibold">{subtitle}</span>}
                        {subtitle && location && <span className="text-xs text-slate-300">•</span>}
                        {location && <span className="text-xs text-slate-500">{location}</span>}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="px-5 py-4 text-center">
              <span className="text-sm font-semibold text-slate-500">No results found for "{debouncedQuery}"</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FuzzySearch;
