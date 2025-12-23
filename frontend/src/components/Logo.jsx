const Logo = ({ className = "h-16 ", variant = "default" }) => {
  return (
    <div className={`flex items-center ${className}`}>
      <img
        src="/logo.png"
        alt="MindSettler Logo"
        className={`h-full w-auto object-contain ${variant === 'invert' ? 'brightness-0 invert' : ''}`}
      />
    </div>
  );
};

export default Logo;