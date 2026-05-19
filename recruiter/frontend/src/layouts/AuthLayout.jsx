import bgimage from '../../src/assets/images/bgimage.png';

const AuthLayout = ({ children }) => {
  return (
    <>
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8"
      style={{
        backgroundImage: `url(${bgimage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        height: '100vh',
      }}
    >
      <div className="max-w-md w-full space-y-8">
        {children}
      </div>
    </div>
    </>
    
  );
};

export default AuthLayout;

