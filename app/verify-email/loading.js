export default function Loading() {
  return (
    /* The 'animate-in' with a 300ms delay prevents the "flash" */
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0b0e14] animate-in fade-in duration-500 delay-300">
      <div className="flex flex-col items-center gap-4">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#30363d] border-t-white"></div>
        <p className="text-sm font-medium tracking-widest text-white/60 animate-pulse">
          OUTLOOK
        </p>
      </div>
    </div>
  );
}