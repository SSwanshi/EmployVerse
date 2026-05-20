import React from "react";
import sarvjeetImage from "../assets/images/Sarvjeet.jpg";

const Contact = () => {
  return (
    <div className="bg-slate-50 min-h-screen pt-15 pb-20 font-sans relative overflow-hidden">
      {/* Decorative background gradients */}
      <div className="absolute top-20 left-1/10 w-96 h-96 bg-blue-500/5 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-20 right-1/10 w-96 h-96 bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="max-w-5xl mx-auto px-6 mt-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16 items-center">
          
          {/* Left side: Heading and direct communication info */}
          <div className="space-y-8">
            <div className="space-y-4">
              <span className="text-blue-600 text-xs font-bold uppercase tracking-widest bg-blue-50 px-3 py-1.5 rounded-full">
                Get in Touch
              </span>
              <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-none">
                Contact <span className="text-blue-600">Employ</span>Verse Support.
              </h1>
              <p className="text-slate-500 text-sm leading-relaxed max-w-md">
                Have questions about EmployVerse or need technical help? Reach out to us directly for professional support.
              </p>
            </div>

            <div className="space-y-5">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-blue-600 shadow-sm">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                  </svg>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Email us</p>
                  <a href="mailto:sarvjeet.s23@iiits.in" className="text-sm font-bold text-slate-800 hover:text-blue-600 transition-colors">
                    sarvjeet.s23@iiits.in
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-blue-600 shadow-sm">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                  </svg>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Call us</p>
                  <a href="tel:8102109959" className="text-sm font-bold text-slate-800 hover:text-blue-600 transition-colors">
                    +91 8102109959
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-blue-600 shadow-sm">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  </svg>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Location</p>
                  <p className="text-sm font-bold text-slate-800">
                    Patna, Bihar
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right side: Modern Executive card */}
          <div className="flex justify-center md:justify-end">
            <div className="w-full max-w-sm bg-white border border-slate-100 rounded-3xl p-8 shadow-md hover:shadow-2xl transition-all duration-300 relative group overflow-hidden">
              {/* Subtle top border bar */}
              

              <div className="flex flex-col items-center text-center">
                <div className="relative mb-5">
                  <img
                    src={sarvjeetImage}
                    alt="Sarvjeet Swanshi"
                    className="w-32 h-32 rounded-2xl object-cover border-4 border-slate-50 shadow-sm group-hover:scale-102 transition-transform duration-300"
                  />
                  <div className="absolute -bottom-2 -right-2 bg-slate-900 text-white rounded-lg px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider shadow">
                    Active
                  </div>
                </div>

                <h3 className="font-extrabold text-xl text-slate-900 mb-1">
                  Sarvjeet Swanshi
                </h3>
                <span className="text-xs font-bold text-blue-600 bg-blue-50/50 border border-blue-100 px-3 py-1 rounded-full mb-6">
                  Full Stack Developer
                </span>

                <div className="w-full space-y-3">
                  <a
                    href="mailto:sarvjeet.s23@iiits.in"
                    className="w-full bg-slate-900 hover:bg-black text-white py-3 rounded-xl font-bold transition-all duration-200 text-sm shadow-sm hover:shadow-md flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                    </svg>
                    Email Support
                  </a>
                  <a
                    href="tel:8102109959"
                    className="w-full border border-slate-200 hover:bg-slate-50 text-slate-700 py-3 rounded-xl font-bold transition-all duration-200 text-sm flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                    </svg>
                    Call Directly
                  </a>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Contact;
