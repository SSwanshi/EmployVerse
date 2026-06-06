import { useEffect, useRef, useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { getStats } from '../services/statsApi';
import headerImage from '../assets/images/header_image.webp';
import cardInternship from '../assets/images/card_internship.webp';
import cardJob from '../assets/images/card_job.webp';
import cardPremium from '../assets/images/card_premium.webp';
import cardMore from '../assets/images/card_more.webp';
import logoAmazon from '../assets/images/brand_logo_amazon.webp';
import logoFlipkart from '../assets/images/brand_logo_flipkart.webp';
import logoLoreal from '../assets/images/brand_logo_loreal.webp';
import logoWalmart from '../assets/images/brand_logo_walmart.webp';
import logoWipro from '../assets/images/brand_logo_wipro.webp';
import logoAsianPaints from '../assets/images/brand_logo_asianpaints.webp';
import logoHp from '../assets/images/brand_logo_hp.webp';
import logoAditya from '../assets/images/brand_logo_aditya.webp';

const Home = () => {
  const navigate = useNavigate();
  const [heroSearchQuery, setHeroSearchQuery] = useState('');
  const { user } = useContext(AuthContext);
  const { showToast } = useToast();
  const [toastShown, setToastShown] = useState(false);

  const headerTextRef = useRef(null);
  const headerImageRef = useRef(null);
  const whoHeadingRef = useRef(null);
  const whoSubheadingRef = useRef(null);
  const card1Ref = useRef(null);
  const card2Ref = useRef(null);
  const card3Ref = useRef(null);

  // Show premium expired toast
  useEffect(() => {
    if (user && user.premiumExpired && !toastShown) {
      showToast('Your premium plan has expired. Please renew to continue enjoying premium features.', 'warning');
      setToastShown(true);
    }
  }, [user, toastShown, showToast]);

  // Animate header elements on mount
  useEffect(() => {
    setTimeout(() => {
      if (headerTextRef.current) {
        headerTextRef.current.classList.remove('translate-y-8', 'opacity-0');
      }
    }, 300);

    setTimeout(() => {
      if (headerImageRef.current) {
        headerImageRef.current.classList.remove('translate-x-8', 'opacity-0');
      }
    }, 600);
  }, []);

  // Intersection Observer for scroll animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.remove('opacity-0');
            if (entry.target.id === 'who-heading' || entry.target.id === 'who-subheading') {
              entry.target.classList.add('opacity-100');
            } else if (entry.target.id === 'card-1') {
              setTimeout(() => {
                entry.target.classList.add('opacity-100');
              }, 200);
            } else if (entry.target.id === 'card-2') {
              setTimeout(() => {
                entry.target.classList.add('opacity-100');
              }, 400);
            } else if (entry.target.id === 'card-3') {
              setTimeout(() => {
                entry.target.classList.add('opacity-100');
              }, 600);
            }
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    if (whoHeadingRef.current) observer.observe(whoHeadingRef.current);
    if (whoSubheadingRef.current) observer.observe(whoSubheadingRef.current);
    if (card1Ref.current) observer.observe(card1Ref.current);
    if (card2Ref.current) observer.observe(card2Ref.current);
    if (card3Ref.current) observer.observe(card3Ref.current);

    return () => {
      observer.disconnect();
    };
  }, []);

  const [stats, setStats] = useState({
    jobCount: 0,
    internshipCount: 0,
    companyCount: 0,
    applicantCount: 0,
  });
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getStats();
        setStats({
          jobCount: data.jobCount ?? 0,
          internshipCount: data.internshipCount ?? 0,
          companyCount: data.companyCount ?? 0,
          applicantCount: data.applicantCount ?? 0,
        });
      } catch {
        setStatsError(true);
      } finally {
        setStatsLoading(false);
      }
    };
    fetchStats();
  }, []);

  const brandLogos = [
    logoAmazon,
    logoFlipkart,
    logoLoreal,
    logoWalmart,
    logoWipro,
    logoAsianPaints,
    logoHp,
    logoAditya,
  ];

  const handleHeroSearch = (e) => {
    e.preventDefault();
    if (heroSearchQuery.trim()) {
      const params = new URLSearchParams();
      params.set('q', heroSearchQuery.trim());
      navigate(`/search?${params.toString()}`);
    }
  };

  return (
    <div className="min-h-screen -mt-20">
      {/* Header Hero Section */}
      <header className="min-h-screen lg:h-screen flex items-center justify-center bg-slate-950 text-white relative overflow-hidden pt-32 pb-16 lg:py-0">
        {/* Glow Effects */}
        <div className="absolute top-1/4 left-1/10 w-64 h-64 lg:w-96 lg:h-96 bg-blue-500/10 rounded-full blur-[100px] lg:blur-[120px] pointer-events-none animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/10 w-64 h-64 lg:w-96 lg:h-96 bg-indigo-500/5 rounded-full blur-[80px] lg:blur-[100px] pointer-events-none animate-pulse"></div>

        <div className="container mx-auto px-4 lg:px-6 relative z-10">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-10 lg:gap-16">
            {/* Left Content */}
            <div
              ref={headerTextRef}
              className="w-full lg:w-1/2 text-center lg:text-left transform transition-all duration-700 translate-y-8 opacity-0 lg:pr-12 flex flex-col items-center lg:items-start"
              id="header-text"
            >
              <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 ">
                
                
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black leading-[1.1] tracking-tight text-white">
                Discover your <br />
                <span className="text-blue-500">dream career</span> today.
              </h1>
              <p className="text-slate-400 text-base md:text-lg mt-6 max-w-xl leading-relaxed">
                Connect with leading global employers, access exclusive premium postings, showcase your verified credentials, and accelerate your career.
              </p>

              {/* Advanced Search Container inside Hero */}
              <form
                onSubmit={handleHeroSearch}
                className="mt-8 lg:mt-10 bg-slate-900/90 border border-slate-800/80 p-2 lg:p-2.5 rounded-2xl shadow-2xl w-full max-w-xl flex flex-col sm:flex-row gap-2 sm:gap-3 relative z-10 backdrop-blur-md"
              >
                <div className="flex-1 flex items-center min-w-0 bg-slate-800/50 sm:bg-transparent rounded-xl sm:rounded-none px-2 sm:px-0">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 ml-2 text-slate-400 shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                  <input
                    type="text"
                    placeholder="Job title or keywords..."
                    value={heroSearchQuery}
                    onChange={(e) => setHeroSearchQuery(e.target.value)}
                    className="w-full bg-transparent border-0 text-white placeholder-slate-400 focus:outline-none focus:ring-0 text-sm px-3 py-3 lg:py-3"
                  />
                </div>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 sm:py-3 px-6 rounded-xl text-sm transition-all duration-200 shadow-md flex items-center justify-center shrink-0 cursor-pointer w-full sm:w-auto"
                >
                  Find Careers
                </button>
              </form>
            </div>

            {/* Right Media Graphic */}
            <div
              ref={headerImageRef}
              className="w-full lg:w-5/12 flex justify-center relative transform transition-all duration-700 translate-x-8 opacity-0 mt-12 lg:mt-0"
              id="header-image"
            >
              {/* Main Image */}
              <div className="relative p-3 bg-slate-900 border border-slate-800 rounded-3xl shadow-3xl overflow-hidden animate-[float_6s_ease-in-out_infinite]">
                <img
                  src={headerImage}
                  alt="Career Opportunities"
                  className="rounded-2xl max-w-full h-auto"
                  style={{ maxHeight: '320px', objectFit: 'cover' }}
                  width="440"
                />
              </div>

              {/* Floating Stat Card 1 */}
              <div className="absolute -top-6 -left-2 sm:-left-6 bg-slate-900/90 border border-slate-800 p-3 sm:p-4 rounded-2xl shadow-xl flex items-center gap-2 sm:gap-3 backdrop-blur-md animate-[float_8s_ease-in-out_infinite_delay-1s]">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wide">Verified Postings</p>
                  <p className="text-xs sm:text-sm font-extrabold text-white">10k+ Open Roles</p>
                </div>
              </div>

              {/* Floating Stat Card 2 */}
              <div className="absolute -bottom-6 -right-2 sm:-right-6 bg-slate-900/90 border border-slate-800 p-3 sm:p-4 rounded-2xl shadow-xl flex items-center gap-2 sm:gap-3 backdrop-blur-md animate-[float_7s_ease-in-out_infinite_delay-2.5s]">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <div>
                  <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wide">Corporate Network</p>
                  <p className="text-xs sm:text-sm font-extrabold text-white">Top Tech Firms</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Explore Opportunities Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-extrabold text-center text-slate-900 tracking-tight mb-16">
            Explore Opportunities
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {/* Internships */}
            <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:border-blue-500/20 transition-all duration-300 transform hover:-translate-y-1 relative group p-8">
              <div className="relative z-10 max-w-[60%]">
                <h3 className="text-2xl font-bold text-slate-900 mb-2">Internships</h3>
                <p className="text-slate-500 mb-6 text-sm leading-relaxed">
                  Gain practical experience and boost your professional skills.
                </p>
                <Link
                  to="/internships"
                  className="bg-slate-900 hover:bg-black text-white text-xs font-bold py-3 px-5 rounded-xl transition-all duration-200 inline-block shadow-sm"
                >
                  Find Internships
                </Link>
              </div>
              <div className="absolute right-0 bottom-0 h-full max-h-40 md:max-h-48 pointer-events-none transition-transform duration-300 group-hover:scale-105">
                <img
                  src={cardInternship}
                  alt="Student with internship materials"
                  className="h-full object-contain rounded-none"
                />
              </div>
            </div>

            {/* Jobs */}
            <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:border-blue-500/20 transition-all duration-300 transform hover:-translate-y-1 relative group p-8">
              <div className="relative z-10 max-w-[60%]">
                <h3 className="text-2xl font-bold text-slate-900 mb-2">Jobs</h3>
                <p className="text-slate-500 mb-6 text-sm leading-relaxed">
                  Explore diverse careers and find long-term corporate growth.
                </p>
                <Link
                  to="/jobs"
                  className="bg-slate-900 hover:bg-black text-white text-xs font-bold py-3 px-5 rounded-xl transition-all duration-200 inline-block shadow-sm"
                >
                  Find Jobs
                </Link>
              </div>
              <div className="absolute right-0 bottom-0 h-full max-h-40 md:max-h-48 pointer-events-none transition-transform duration-300 group-hover:scale-105">
                <img
                  src={cardJob}
                  alt="Professional with job offers"
                  className="h-full object-contain rounded-none"
                />
              </div>
            </div>

            {/* Premium */}
            <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:border-blue-500/20 transition-all duration-300 transform hover:-translate-y-1 relative group p-8">
              <div className="relative z-10 max-w-[60%]">
                <h3 className="text-2xl font-bold text-slate-900 mb-2">Premium</h3>
                <p className="text-slate-500 mb-6 text-sm leading-relaxed">
                  Unlock access to direct recruiter outreach and top placement tools.
                </p>
                <Link
                  to="/payment"
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-3 px-5 rounded-xl transition-all duration-200 inline-block shadow-sm"
                >
                  Join Premium
                </Link>
              </div>
              <div className="absolute right-0 bottom-0 h-full max-h-40 md:max-h-48 pointer-events-none transition-transform duration-300 group-hover:scale-105">
                <img
                  src={cardPremium}
                  alt="Trophy and competition"
                  className="h-full object-contain rounded-none"
                />
              </div>
            </div>

            {/* Explore */}
            <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:border-blue-500/20 transition-all duration-300 transform hover:-translate-y-1 relative group p-8">
              <div className="relative z-10 max-w-[60%]">
                <h3 className="text-2xl font-bold text-slate-900 mb-2">Recruiting</h3>
                <p className="text-slate-500 mb-6 text-sm leading-relaxed">
                  Post opportunities and screen applicants directly with smart tools.
                </p>
                <Link
                  to="https://employverse-recruiter.swanshi.me/login"
                  className="bg-slate-900 hover:bg-black text-white text-xs font-bold py-3 px-5 rounded-xl transition-all duration-200 inline-block shadow-sm"
                >
                  Login as Recruiter
                </Link>
              </div>
              <div className="absolute right-0 bottom-0 h-full max-h-40 md:max-h-48 pointer-events-none transition-transform duration-300 group-hover:scale-105">
                <img
                  src={cardMore}
                  alt="Resource box with tools"
                  className="h-full object-contain rounded-none"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Brand Logos Scrolling Section */}
      <section className="bg-white py-6 overflow-hidden">
        <div className="w-full relative">
          <div className="overflow-hidden w-full">
            <div
              className="flex animate-scroll hover:animate-pause"
              style={{
                width: 'calc(200px * 16)',
                animation: 'scroll 20s linear infinite',
              }}
            >
              {[...brandLogos, ...brandLogos].map((logo, index) => (
                <div
                  key={index}
                  className="flex-shrink-0 w-[200px] h-20 p-4 hover:transition-opacity duration-300 flex justify-center items-center"
                >
                  <img src={logo} alt="Partner Logo" className="h-20 object-contain" />
                </div>
              ))}
            </div>
          </div>
        </div>
        <style>{`
          @keyframes scroll {
            0% {
              transform: translateX(0);
            }
            100% {
              transform: translateX(calc(-200px * 7));
            }
          }
          .animate-scroll {
            animation: scroll 30s linear infinite;
          }
          .animate-scroll:hover {
            animation-play-state: paused;
          }
          @media (max-width: 768px) {
            @keyframes scroll {
              0% {
                transform: translateX(0);
              }
              100% {
                transform: translateX(calc(-200px * 7));
              }
            }
          }
        `}</style>
      </section>

      {/* Who's Using EmployVerse Section */}
      <section className="text-center py-24 bg-white">
        <div className="container mx-auto px-6">
          <h2
            ref={whoHeadingRef}
            className="text-4xl font-extrabold text-slate-900 tracking-tight mb-3 transform transition-all duration-500 opacity-0"
            id="who-heading"
          >
            Who's using <span className="text-blue-600">EmployVerse</span>?
          </h2>
          <p
            ref={whoSubheadingRef}
            className="text-md text-slate-500 max-w-2xl mx-auto mb-20 transform transition-all duration-500 opacity-0 leading-relaxed"
            id="who-subheading"
          >
            Join the set of users who have revolutionized their hiring and job-seeking experience.
          </p>
          <div className="grid md:grid-cols-3 gap-8 mt-8 px-4 md:px-12">
            {/* Students */}
            <div
              ref={card1Ref}
              className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg hover:border-blue-500/20 transition-all duration-300 transform hover:-translate-y-1 opacity-0 flex flex-col justify-between"
              id="card-1"
            >
              <div>
                <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-6">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-7 w-7"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3 text-left">Students</h3>
                <p className="text-slate-500 text-sm leading-relaxed text-left mb-6">
                  Explore opportunities, apply for jobs, network, gain insights, access
                  internships, enhance skills, receive career guidance, and connect with recruiters.
                </p>
              </div>
              <ul className="space-y-2.5 text-left border-t border-slate-50 pt-5 mt-auto">
                <li className="flex items-center gap-2.5 text-xs font-semibold text-slate-700">
                  <span className="w-5 h-5 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">✓</span>
                  1,000+ Internships & Entry Jobs
                </li>
                <li className="flex items-center gap-2.5 text-xs font-semibold text-slate-700">
                  <span className="w-5 h-5 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">✓</span>
                  One-click PDF Resume Upload
                </li>
                <li className="flex items-center gap-2.5 text-xs font-semibold text-slate-700">
                  <span className="w-5 h-5 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">✓</span>
                  Direct Access to HR Managers
                </li>
              </ul>
            </div>

            {/* Recruiters */}
            <div
              ref={card2Ref}
              className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg hover:border-blue-500/20 transition-all duration-300 transform hover:-translate-y-1 opacity-0 flex flex-col justify-between"
              id="card-2"
            >
              <div>
                <div className="w-14 h-14 bg-slate-50 text-slate-700 rounded-xl flex items-center justify-center mb-6">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-7 w-7"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3 text-left">
                  Recruiters
                </h3>
                <p className="text-slate-500 text-sm leading-relaxed text-left mb-6">
                  Find talent, post jobs, screen candidates, streamline hiring, track applications,
                  build networks, conduct interviews, and enhance employer branding.
                </p>
              </div>
              <ul className="space-y-2.5 text-left border-t border-slate-50 pt-5 mt-auto">
                <li className="flex items-center gap-2.5 text-xs font-semibold text-slate-700">
                  <span className="w-5 h-5 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">✓</span>
                  Direct Access to 50k+ Job Seekers
                </li>
                <li className="flex items-center gap-2.5 text-xs font-semibold text-slate-700">
                  <span className="w-5 h-5 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">✓</span>
                  Applicant Screening Dashboard
                </li>
                <li className="flex items-center gap-2.5 text-xs font-semibold text-slate-700">
                  <span className="w-5 h-5 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">✓</span>
                  Branded Corporate Profiles
                </li>
              </ul>
            </div>

            {/* Professionals */}
            <div
              ref={card3Ref}
              className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg hover:border-blue-500/20 transition-all duration-300 transform hover:-translate-y-1 opacity-0 flex flex-col justify-between"
              id="card-3"
            >
              <div>
                <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-6">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-7 w-7"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3 text-left">Professionals</h3>
                <p className="text-slate-500 text-sm leading-relaxed text-left mb-6">
                  Explore new opportunities, network, upskill, track industry trends, apply for
                  promotions, connect with recruiters, and access career resources.
                </p>
              </div>
              <ul className="space-y-2.5 text-left border-t border-slate-50 pt-5 mt-auto">
                <li className="flex items-center gap-2.5 text-xs font-semibold text-slate-700">
                  <span className="w-5 h-5 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">✓</span>
                  Premium Career Insights & Stats
                </li>
                <li className="flex items-center gap-2.5 text-xs font-semibold text-slate-700">
                  <span className="w-5 h-5 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">✓</span>
                  1-click Easy Apply features
                </li>
                <li className="flex items-center gap-2.5 text-xs font-semibold text-slate-700">
                  <span className="w-5 h-5 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">✓</span>
                  Verified Profile Credentials
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-slate-900 text-white border-t border-slate-800">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-12">
            <div className="md:w-1/2 text-center md:text-left">
              <h2 className="text-3xl font-extrabold tracking-tight mb-6">
                Ready to transform your career journey?
              </h2>
              <p className="text-slate-400 mb-8 text-sm leading-relaxed max-w-md">
                Join thousands of professionals who have already discovered new opportunities
                through EmployVerse.
              </p>
              <Link
                to="/login"
                className="bg-blue-600 text-white hover:bg-blue-700 font-bold py-3.5 px-8 rounded-xl transition-all duration-300 inline-block shadow-lg hover:shadow-blue-500/10"
              >
                Get Started Now
              </Link>
            </div>
            <div className="md:w-5/12 grid grid-cols-2 gap-4">
              <div className="bg-slate-800/40 border border-slate-800 p-6 rounded-2xl hover:border-slate-700 transition-colors duration-200 text-center">
                <h3 className="text-3xl font-black mb-2 text-white">
                  {statsLoading ? <div className="h-8 w-16 bg-slate-700 rounded animate-pulse mx-auto"></div> : statsError ? '—' : stats.jobCount}
                </h3>
                <p className="text-blue-400 text-xs font-semibold uppercase tracking-wider">Job Opportunities</p>
              </div>
              <div className="bg-slate-800/40 border border-slate-800 p-6 rounded-2xl hover:border-slate-700 transition-colors duration-200 text-center">
                <h3 className="text-3xl font-black mb-2 text-white">
                  {statsLoading ? <div className="h-8 w-16 bg-slate-700 rounded animate-pulse mx-auto"></div> : statsError ? '—' : stats.companyCount}
                </h3>
                <p className="text-blue-400 text-xs font-semibold uppercase tracking-wider">Hiring Companies</p>
              </div>
              <div className="bg-slate-800/40 border border-slate-800 p-6 rounded-2xl hover:border-slate-700 transition-colors duration-200 text-center">
                <h3 className="text-3xl font-black mb-2 text-white">
                  {statsLoading ? <div className="h-8 w-16 bg-slate-700 rounded animate-pulse mx-auto"></div> : statsError ? '—' : stats.internshipCount}
                </h3>
                <p className="text-blue-400 text-xs font-semibold uppercase tracking-wider">Internship Roles</p>
              </div>
              <div className="bg-slate-800/40 border border-slate-800 p-6 rounded-2xl hover:border-slate-700 transition-colors duration-200 text-center">
                <h3 className="text-3xl font-black mb-2 text-white">
                  {statsLoading ? <div className="h-8 w-16 bg-slate-700 rounded animate-pulse mx-auto"></div> : statsError ? '—' : stats.applicantCount}
                </h3>
                <p className="text-blue-400 text-xs font-semibold uppercase tracking-wider">Registered Users</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
