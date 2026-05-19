import { useEffect, useRef, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
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

  return (
    <div className="min-h-screen -mt-24">
      {/* Header Hero Section */}
      <header className="pt-32 pb-24 bg-gradient-to-b from-blue-300 via-blue-500 to-blue-800 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-pattern opacity-10"></div>
        <div className="container mx-auto px-6 relative">
          <div className="flex flex-col md:flex-row items-center">
            <div
              ref={headerTextRef}
              className="md:w-1/2 text-center md:text-left transform transition-all duration-700 translate-y-8 opacity-0 text-black"
              id="header-text"
            >
              <h1 className="text-5xl font-bold leading-tight">
                {' '}
                Unlock Seemless <span className="text-yellow-300">Career</span> Potential
              </h1>
              <p className="text-xl mt-6 text-blue-100 max-w-lg">
                Discover worldwide opportunities to enhance your career, demonstrate your skills, strengthen your CV, and connect with leading employers.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 justify-center md:justify-start">
                <Link
                  to="/jobs"
                  className="bg-yellow-400 hover:bg-yellow-500 text-blue-800 font-bold py-3 px-8 rounded-full transition-all duration-300 hover:shadow-xl transform hover:-translate-y-1"
                >
                  Find Jobs
                </Link>
              </div>
            </div>
            <div
              ref={headerImageRef}
              className="md:w-1/3 mt-12 md:mt-0 transform transition-all duration-700 translate-x-8 opacity-0"
              id="header-image"
            >
              <img
                src={headerImage}
                alt="Career Opportunities"
                className="rounded-lg"
                height="200px"
                width="300px"
              />
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 w-full overflow-hidden">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M0 120L48 105C96 90 192 60 288 55C384 50 480 70 576 75C672 80 768 70 864 75C960 80 1056 100 1152 100C1248 100 1344 80 1392 70L1440 60V120H1392C1344 120 1248 120 1152 120C1056 120 960 120 864 120C768 120 672 120 576 120C480 120 384 120 288 120C192 120 96 120 48 120H0Z"
              fill="white"
            />
          </svg>
        </div>
      </header>

      {/* Explore Opportunities Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-blue-700 mb-12">
            Explore Opportunities
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl mx-auto">
            <div className="bg-green-100 rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 relative">
              <div className="p-6">
                <h3 className="text-2xl font-bold text-green-800 mb-2">Internships</h3>
                <p className="text-green-700 mb-6">
                  Gain
                  <br />
                  Practical
                  <br />
                  Experience
                </p>
                <Link
                  to="/internships"
                  className="bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-300 inline-block mt-2"
                >
                  Find Internships
                </Link>
              </div>
              <div className="absolute right-0 bottom-0 h-full max-h-48 pointer-events-none">
                <img
                  src={cardInternship}
                  alt="Student with internship materials"
                  className="h-full object-contain rounded-none"
                />
              </div>
            </div>

            <div className="bg-blue-100 rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 relative">
              <div className="p-6">
                <h3 className="text-2xl font-bold text-blue-800 mb-2">Jobs</h3>
                <p className="text-blue-700 mb-6">
                  Explore
                  <br />
                  Diverse Careers
                </p>
                <Link
                  to="/jobs"
                  className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-300 inline-block mt-2"
                >
                  Find Jobs
                </Link>
              </div>
              <div className="absolute right-0 bottom-0 h-full max-h-48 pointer-events-none">
                <img
                  src={cardJob}
                  alt="Professional with job offers"
                  className="h-full object-contain rounded-none"
                />
              </div>
            </div>

            <div className="bg-yellow-100 rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 relative">
              <div className="p-6">
                <h3 className="text-2xl font-bold text-yellow-800 mb-2">Premium</h3>
                <p className="text-yellow-700 mb-6">
                  Battle
                  <br />
                  For Excellence
                </p>
                <Link
                  to="/payment"
                  className="bg-yellow-500 hover:bg-yellow-600 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-300 inline-block mt-2"
                >
                  Join Premium
                </Link>
              </div>
              <div className="absolute right-0 bottom-0 h-full max-h-48 pointer-events-none">
                <img
                  src={cardPremium}
                  alt="Trophy and competition"
                  className="h-full object-contain rounded-none"
                />
              </div>
            </div>

            <div className="bg-pink-100 rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 relative">
              <div className="p-6">
                <h3 className="text-2xl font-bold text-pink-800 mb-2">Explore</h3>
                <p className="text-pink-700 mb-6">
                  Compete with
                  <br />
                  smart minds
                </p>
                <Link
                  to="https://gohire-recruiter.vercel.app/login"
                  className="bg-pink-500 hover:bg-pink-600 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-300 inline-block mt-2"
                >
                  Login as Recruiter
                </Link>
              </div>
              <div className="absolute right-0 bottom-0 h-full max-h-48 pointer-events-none">
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
                transform: translateX(calc(-150px * 7));
              }
            }
          }
        `}</style>
      </section>

      {/* Who's Using GoHire Section */}
      <section className="text-center py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2
            ref={whoHeadingRef}
            className="text-4xl font-bold text-blue-700 mb-3 transform transition-all duration-500 opacity-0"
            id="who-heading"
          >
            Who's using <span className="text-yellow-500">GoHire</span>?
          </h2>
          <p
            ref={whoSubheadingRef}
            className="text-xl text-gray-600 max-w-2xl mx-auto mb-16 transform transition-all duration-500 opacity-0"
            id="who-subheading"
          >
            Join set of users who have revolutionized their hiring and job-seeking experience
          </p>
          <div className="grid md:grid-cols-3 gap-10 mt-8 px-4 md:px-16">
            <div
              ref={card1Ref}
              className="bg-white p-8 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 opacity-0"
              id="card-1"
            >
              <div className="w-20 h-20 bg-blue-100 text-blue-700 rounded-full mx-auto flex items-center justify-center mb-6">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-10 w-10"
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
              <h3 className="text-2xl font-semibold text-blue-700 mb-4">Students</h3>
              <p className="text-gray-600 mb-6">
                Explore opportunities, apply for jobs, network, gain insights, access
                internships, enhance skills, receive career guidance, and connect with recruiters.
              </p>
            </div>

            <div
              ref={card2Ref}
              className="bg-white p-8 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 opacity-0"
              id="card-2"
            >
              <div className="w-20 h-20 bg-yellow-100 text-yellow-700 rounded-full mx-auto flex items-center justify-center mb-6">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-10 w-10"
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
              <h3 className="text-2xl font-semibold text-blue-700 mb-4">
                Companies and Recruiters
              </h3>
              <p className="text-gray-600 mb-6">
                Find talent, post jobs, screen candidates, streamline hiring, track applications,
                build networks, conduct interviews, and enhance employer branding.
              </p>
            </div>

            <div
              ref={card3Ref}
              className="bg-white p-8 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 opacity-0"
              id="card-3"
            >
              <div className="w-20 h-20 bg-green-100 text-green-700 rounded-full mx-auto flex items-center justify-center mb-6">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-10 w-10"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M12 14l9-5-9-5-9 5 9 5z" />
                  <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold text-blue-700 mb-4">Professionals</h3>
              <p className="text-gray-600 mb-6">
                Explore new opportunities, network, upskill, track industry trends, apply for
                promotions, connect with recruiters, and access career resources.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-500 text-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="md:w-1/2 mb-10 md:mb-0">
              <h2 className="text-3xl font-bold mb-6">
                Ready to transform your career journey?
              </h2>
              <p className="text-blue-100 mb-8">
                Join thousands of professionals who have already discovered new opportunities
                through GoHire.
              </p>
              <Link
                to="/login"
                className="bg-white text-blue-700 hover:bg-yellow-400 font-bold py-3 px-8 rounded-full transition-all duration-300 inline-block hover:shadow-lg transform hover:-translate-y-1"
              >
                Get Started Now
              </Link>
            </div>
            <div className="md:w-5/12 grid grid-cols-2 gap-4">
              <div className="bg-white p-6 rounded-lg transform transition-all hover:scale-105 duration-300">
                <h3 className="text-3xl font-bold mb-2 text-black">
                  {statsLoading ? '...' : statsError ? '—' : stats.jobCount}
                </h3>
                <p className="text-blue-600 font-bold">Job Opportunities</p>
              </div>
              <div className="bg-white p-6 rounded-lg transform transition-all hover:scale-105 duration-300">
                <h3 className="text-3xl font-bold mb-2 text-black">
                  {statsLoading ? '...' : statsError ? '—' : stats.companyCount}
                </h3>
                <p className="text-blue-600 font-bold">Hiring Companies</p>
              </div>
              <div className="bg-white p-6 rounded-lg transform transition-all hover:scale-105 duration-300">
                <h3 className="text-3xl font-bold mb-2 text-black">
                  {statsLoading ? '...' : statsError ? '—' : stats.internshipCount}
                </h3>
                <p className="text-blue-600 font-bold">Internship Opportunities</p>
              </div>
              <div className="bg-white p-6 rounded-lg transform transition-all hover:scale-105 duration-300">
                <h3 className="text-3xl font-bold mb-2 text-black">
                  {statsLoading ? '...' : statsError ? '—' : stats.applicantCount}
                </h3>
                <p className="text-blue-600 font-bold">Applicants Registered</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
