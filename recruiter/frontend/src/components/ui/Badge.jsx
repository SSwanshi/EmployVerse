const Badge = ({ children, variant = 'default', className = '' }) => {
  const variants = {
    default: 'bg-gray-100 text-gray-800',
    primary: 'bg-gray-100 text-black',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-gray-100 text-black',
    danger: 'bg-red-100 text-red-800',
  };

  return (
    <span className={`px-2 py-1 text-xs rounded ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};

export default Badge;

