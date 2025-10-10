export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center h-full">
      <div className="mb-8 relative">
        {/* Pulsing Circle */}
        <div className="w-16 h-16 border-4 border-white/20 rounded-full">
          <div className="w-full h-full border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
        {/* Center Dot */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-primary rounded-full animate-pulse"></div>
      </div>

      <div className="text-white text-lg font-medium tracking-wider">
        <span className="inline-block animate-pulse">Loading</span>
        <span className="inline-block animate-bounce ml-1">.</span>
        <span className="inline-block animate-bounce delay-100 ml-0.5">.</span>
        <span className="inline-block animate-bounce delay-200 ml-0.5">.</span>
      </div>

      <style jsx>{`
        .delay-100 {
          animation-delay: 0.2s;
        }
        .delay-200 {
          animation-delay: 0.4s;
        }
        @keyframes bounce {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-4px);
          }
        }
      `}</style>
    </div>
  );
}
