const Header = ({ title, children }) => {
  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
          {children}
        </div>
      </div>
    </header>
  );
};

export default Header;

