import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-slate-950 text-slate-350 py-16 border-t border-slate-900 font-sans relative overflow-hidden">
      {/* Subtle aesthetic backdrop glow */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-[120px] pointer-events-none"></div>
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 pb-12 border-b border-slate-900">
          {/* Brand block */}
          <div className="lg:col-span-5 space-y-5">
            <Link to="/" className="text-2xl font-black tracking-tight text-white inline-flex items-center">
              <span className="text-blue-500">Employ</span>Verse
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
              Find your dream job or internship. Connect with top recruiters and elevate your career workflow today.
            </p>
          </div>

          {/* Quick Links block */}
          <div className="lg:col-span-3 lg:col-start-7 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Quick Links
            </h4>
            <ul className="space-y-3">
              <li>
                <Link 
                  to="/jobs" 
                  className="text-slate-400 hover:text-white text-sm font-medium transition-colors duration-200 block"
                >
                  Jobs
                </Link>
              </li>
              <li>
                <Link 
                  to="/internships" 
                  className="text-slate-400 hover:text-white text-sm font-medium transition-colors duration-200 block"
                >
                  Internships
                </Link>
              </li>
              <li>
                <Link 
                  to="/companies" 
                  className="text-slate-400 hover:text-white text-sm font-medium transition-colors duration-200 block"
                >
                  Companies
                </Link>
              </li>
              <li>
                <Link 
                  to="/contact" 
                  className="text-slate-400 hover:text-white text-sm font-medium transition-colors duration-200 block"
                >
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal block */}
          <div className="lg:col-span-3 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Legal
            </h4>
            <ul className="space-y-3">
              <li>
                <Link 
                  to="/terms" 
                  className="text-slate-400 hover:text-white text-sm font-medium transition-colors duration-200 block"
                >
                  Terms of Use
                </Link>
              </li>
              <li>
                <Link 
                  to="/privacy" 
                  className="text-slate-400 hover:text-white text-sm font-medium transition-colors duration-200 block"
                >
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom row */}
        <div className="pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-medium text-slate-500">
          <p>&copy; {new Date().getFullYear()} EmployVerse. All rights reserved.</p>
          <div className="flex gap-6 text-slate-400">
            <span className="hover:text-blue-500 cursor-pointer transition-colors duration-200">Twitter</span>
            <span className="hover:text-blue-500 cursor-pointer transition-colors duration-200">LinkedIn</span>
            <span className="hover:text-blue-500 cursor-pointer transition-colors duration-200">GitHub</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
