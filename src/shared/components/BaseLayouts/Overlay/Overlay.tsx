const Overlay = () => {
  return (
    <div>
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-16 left-12 w-24 h-24 bg-blue-500/40 rounded-full blur-xl"></div>
        <div className="absolute top-32 right-16 w-32 h-32 bg-purple-500/35 rounded-full blur-2xl"></div>
        <div className="absolute bottom-24 left-24 w-28 h-28 bg-pink-500/30 rounded-full blur-xl"></div>
        <div className="absolute bottom-40 right-20 w-20 h-20 bg-cyan-500/40 rounded-full blur-lg"></div>

        <div className="absolute top-1/4 left-1/3 w-16 h-16 bg-indigo-500/35 rounded-full blur-lg"></div>
        <div className="absolute top-1/2 right-1/4 w-18 h-18 bg-rose-500/40 rounded-full blur-md"></div>
        <div className="absolute bottom-1/3 left-1/2 w-22 h-22 bg-emerald-500/25 rounded-full blur-xl"></div>
        <div className="absolute top-2/3 right-1/3 w-14 h-14 bg-violet-500/45 rounded-full blur-sm"></div>

        <div className="absolute top-20 left-1/2 w-8 h-8 bg-amber-500/50 rounded-full blur-sm"></div>
        <div className="absolute top-3/4 left-1/4 w-10 h-10 bg-teal-500/35 rounded-full blur-md"></div>
        <div className="absolute bottom-16 right-1/3 w-6 h-6 bg-orange-500/45 rounded-full blur-xs"></div>
        <div className="absolute top-1/3 left-1/6 w-12 h-12 bg-lime-500/30 rounded-full blur-lg"></div>
        <div className="absolute bottom-1/2 right-1/6 w-16 h-16 bg-red-500/25 rounded-full blur-xl"></div>
        <div className="absolute top-1/6 right-2/3 w-14 h-14 bg-sky-500/40 rounded-full blur-md"></div>
      </div>

      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-10 left-10 w-32 h-32 bg-blue-400/30 rounded-full blur-2xl"></div>
        <div className="absolute top-20 right-20 w-40 h-40 bg-purple-400/25 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-20 w-36 h-36 bg-pink-400/20 rounded-full blur-2xl"></div>
        <div className="absolute bottom-32 right-32 w-28 h-28 bg-cyan-400/25 rounded-full blur-xl"></div>

        <div className="absolute top-1/3 left-1/4 w-24 h-24 bg-indigo-400/20 rounded-full blur-xl"></div>
        <div className="absolute top-2/3 right-1/3 w-20 h-20 bg-rose-400/25 rounded-full blur-lg"></div>
        <div className="absolute bottom-1/3 left-1/2 w-32 h-32 bg-emerald-400/15 rounded-full blur-2xl"></div>
        <div className="absolute top-1/2 right-1/4 w-16 h-16 bg-violet-400/30 rounded-full blur-lg"></div>

        <div className="absolute top-1/4 left-3/4 w-12 h-12 bg-amber-400/35 rounded-full blur-md"></div>
        <div className="absolute top-3/4 left-1/3 w-14 h-14 bg-teal-400/25 rounded-full blur-lg"></div>
        <div className="absolute bottom-1/4 right-1/2 w-10 h-10 bg-orange-400/30 rounded-full blur-sm"></div>
        <div className="absolute top-1/2 left-1/6 w-18 h-18 bg-lime-400/20 rounded-full blur-lg"></div>
      </div>

      <div className="absolute inset-0 bg-white/30"></div>
    </div>
  );
};

export default Overlay;
