export default function Avatar({ src, name = "User", size = "md" }) {
  const sizes = {
    sm: "h-8 w-8 text-xs",
    md: "h-10 w-10 text-sm",
    lg: "h-24 w-24 text-2xl",
  };
  const sizeClass = sizes[size] || sizes.md;
  return src ? (
    <img
      className={`${sizeClass} rounded-full object-cover ring-2 ring-white`}
      src={src}
      alt={name}
    />
  ) : (
    <div
      className={`${sizeClass} flex items-center justify-center rounded-full bg-coral font-semibold text-white ring-2 ring-white`}
    >
      {name.charAt(0).toUpperCase()}
    </div>
  );
}
