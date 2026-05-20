import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-slate-950 text-slate-300 py-12 font-sans border-t border-slate-900">
      <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr] gap-12 md:gap-8">
        {/* Left: Brand Details */}
        <div className="pr-0 md:pr-12">
          <h3 className="text-2xl font-extrabold tracking-tight mb-4 text-white">
            <span className="text-blue-500">Employ</span>Verse
          </h3>
          <p className="text-slate-400 leading-relaxed text-sm">
            EmployVerse is a modern recruiter’s platform designed to simplify and
            optimize your hiring workflow. Recruiters can easily post job and
            internship opportunities, manage applicants, and connect with top
            talent — all in one seamless dashboard. Our mission is to empower
            companies with smart tools for faster, better hiring decisions.
          </p>
        </div>

        {/* Center: Quick Links */}
        <div className="md:pl-10">
          <h4 className="text-sm font-bold uppercase tracking-wider text-slate-100 mb-5">Quick Links</h4>
          <ul className="space-y-3 text-sm">
            <li>
              <Link to="/dashboard" className="text-slate-400 hover:text-blue-400 transition-colors duration-200">
                Home
              </Link>
            </li>
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

        {/* Right: Contact Info */}
        <div className="md:text-right">
          <h4 className="text-sm font-bold uppercase tracking-wider text-slate-100 mb-5">Contact Info</h4>
          <ul className="space-y-3 text-sm text-slate-400">
            <li>Phone: 8102109959</li>
            <li>Email: sarvjeetswanshi25@gmail.com</li>
            <li>Address: Chennai, India</li>
          </ul>
        </div>
      </div>

      {/* Bottom Line */}
      <div className="container mx-auto px-6 mt-12 pt-8 border-t border-slate-800/60 text-center md:flex md:justify-between md:items-center">
        <div className="text-slate-500 text-sm font-medium">
          &copy; {new Date().getFullYear()} EmployVerse. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
