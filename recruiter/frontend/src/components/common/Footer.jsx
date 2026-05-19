import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-blue-900 text-white py-10">
      <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-[2.0fr_0.4fr_1fr] gap-10">
        {/* Left: Brand Details */}
        <div>
          <h3 className="text-2xl font-bold mb-3">
            <span className="text-yellow-400">Go</span>Hire
          </h3>
          <p className="text-gray-300 leading-relaxed">
            GoHire is a modern recruiter’s platform designed to simplify and
            optimize your hiring workflow. Recruiters can easily post job and
            internship opportunities, manage applicants, and connect with top
            talent — all in one seamless dashboard. Our mission is to empower
            companies with smart tools for faster, better hiring decisions.
          </p>
        </div>

        <div className="pl-4 md:pl-10">
          <h4 className="text-lg font-semibold mb-4 text-yellow-400 ">Quick Links</h4>
          <ul className="space-y-2 text-gray-300">
            <li>
              <Link to="/dashboard" className="hover:text-yellow-400 transition">
                Home
              </Link>
            </li>
            <li>
              <Link to="/jobs" className="hover:text-yellow-400 transition">
                Jobs
              </Link>
            </li>
            <li>
              <Link to="/internships" className="hover:text-yellow-400 transition">
                Internships
              </Link>
            </li>
            <li>
              <Link to="/companies" className="hover:text-yellow-400 transition">
                Companies
              </Link>
            </li>
          </ul>
        </div>

        {/* Right: Contact Info */}
        <div className="md:text-right">
          <h4 className="text-lg font-semibold mb-4 text-yellow-400">Contact Info</h4>
          <ul className="space-y-2 text-gray-300">
            <li>📞 Phone: 8102109959</li>
            <li>📧 Email: sarvjeetswanshi25@gmail.com</li>
            <li>📍 Address: Chennai, India</li>
          </ul>
        </div>
      </div>

      {/* Bottom Line */}
      <div className="mt-10 border-t border-blue-700 pt-4 text-center text-gray-400 text-sm">
        &copy; {new Date().getFullYear()} GoHire. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
