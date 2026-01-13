const Logo = ({ className = "h-16 ", variant = "default" }) => {
  const isWhite = variant === 'white' || variant === 'invert';

  return (
    <div className={`flex items-center ${className}`}>
      <img
        src="/logo.png"
        alt="MindSettler Logo"
        className={`h-full w-auto object-contain ${isWhite ? 'brightness-0 invert' : ''}`}

      />
    </div>
  );
};

export default Logo;