import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-slate-950 text-slate-300 py-12 border-t border-slate-900 font-sans">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8">
        <div>
          <h3 className="text-xl font-extrabold mb-4 text-white tracking-tight">
            <span className="text-blue-500">Employ</span>Verse
          </h3>
          <p className="text-slate-400 text-sm leading-relaxed">
            Find your dream job or internship. Connect with top recruiters and elevate your career workflow today.
          </p>
        </div>
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-100 mb-4">Quick Links</h4>
          <ul className="space-y-2.5 text-sm">
            <li>
              <Link to="/jobs" className="text-slate-400 hover:text-blue-400 transition-colors duration-200">
                Jobs
              </Link>
            </li>
            <li>
              <Link to="/internships" className="text-slate-400 hover:text-blue-400 transition-colors duration-200">
                Internships
              </Link>
            </li>
            <li>
              <Link to="/companies" className="text-slate-400 hover:text-blue-400 transition-colors duration-200">
                Companies
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-100 mb-4">Legal</h4>
          <ul className="space-y-2.5 text-sm">
            <li>
              <Link to="/terms" className="text-slate-400 hover:text-blue-400 transition-colors duration-200">
                Terms of Use
              </Link>
            </li>
            <li>
              <Link to="/privacy" className="text-slate-400 hover:text-blue-400 transition-colors duration-200">
                Privacy Policy
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-6 mt-10 pt-6 border-t border-slate-900 text-center text-slate-500 text-xs font-medium">
        <p>&copy; {new Date().getFullYear()} EmployVerse. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
