export default function Loader({ show, text = "Loading..." }) {
  if (!show) return null;
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-black/30 z-50 backdrop-blur-sm">
      <div className="w-12 h-12 border-4 border-white border-t-[var(--color-primary)] rounded-full animate-spin"></div>
      <p className="text-white mt-4 text-sm tracking-wide">{text}</p>
    </div>
  );
}
