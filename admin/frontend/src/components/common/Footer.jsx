const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white mt-auto">
      <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
        <p className="text-center text-sm">
          © {new Date().getFullYear()} GoHire Admin Portal. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;

