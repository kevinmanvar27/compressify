import Link from "next/link";

export const Hero = () => (
  <div className="pt-10 md:pt-20 px-6 lg:px-0">
    <h1 className="text-center text-4xl font-bold md:text-5xl lg:text-7xl lg:font-semibold text-gray-900 text-balance">
      Compress Videos
    </h1>
    <h2 className="sm:text-lg max-w-xl mx-auto text-gray-500 text-center mt-9">
      Eliminate oversized files! Reduce video size by <span>90%</span> without
      sacrificing quality, all while working offline.
    </h2>
    <div className="flex gap-4 items-center justify-center mt-10 mb-10">
      <Link
        className="bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-zinc-700 via-zinc-950 to-zinc-950 rounded-lg text-white/90 relative px-3.5 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 transition ease-in-out duration-500 focus:ring-zinc-950 flex-shrink-0"
        href={"/video"}
      >
        Compress Now
      </Link>
    </div>
  </div>
);
