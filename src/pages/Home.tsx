import { Link } from "react-router-dom";
import { usePageTitle } from "../hooks/usePageTitle";

function Home() {
  usePageTitle("litenkod – Hem");

  return (
    <>
      <nav className="fixed right-6 top-6 z-50 flex gap-3 text-sm font-medium">
        <Link
          to="/"
          className="rounded-full border border-slate-200 bg-white/85 px-4 py-1 text-slate-900 shadow-sm backdrop-blur transition hover:bg-white"
        >
          Hem
        </Link>
        <Link
          to="/apex"
          className="rounded-full border border-slate-200 bg-white/85 px-4 py-1 text-slate-900 shadow-sm backdrop-blur transition hover:bg-white"
        >
          Apex
        </Link>
      </nav>
      <div className="flex h-screen w-screen bg-teal-100">
        <div className="w-full flex items-center justify-center flex-col -mt-9">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 110 109.02"
            className="w-10 h-10"
          >
            <title>litenkod</title>
            <path
              d="M26.25,17.26v34.5a13.54,13.54,0,0,1-.92,4.52,10.92,10.92,0,0,1-3.18,4.52,12.22,12.22,0,0,1,3.11,4.52,12.75,12.75,0,0,1,1,4.52v36.06H34v10.18H18.19a3.33,3.33,0,0,1-2.19-.92,4.26,4.26,0,0,1-1.06-3.32V73.53A9.63,9.63,0,0,0,13.31,68,6.23,6.23,0,0,0,9,65.19v-9a4.14,4.14,0,0,0,2.54-.85,7.53,7.53,0,0,0,1.91-2.12,10.06,10.06,0,0,0,1.48-5.09V11.32q0-2.68,1.27-3.46a4.31,4.31,0,0,1,2-.78H34V17.26Z"
              transform="translate(-9 -7.08)"
            ></path>
            <path
              d="M94,17.26V7.08h15.84a4.29,4.29,0,0,1,2,.78q1.27.78,1.27,3.46V48.08a10.12,10.12,0,0,0,1.48,5.09,8,8,0,0,0,1.84,2.12,4.06,4.06,0,0,0,2.61.85v9A6.09,6.09,0,0,0,114.62,68a9.92,9.92,0,0,0-1.55,5.51v38.32a4.09,4.09,0,0,1-1.13,3.32,3.46,3.46,0,0,1-2.12.92H94V105.91h7.77V69.86a13.52,13.52,0,0,1,.92-4.53,10.87,10.87,0,0,1,3.18-4.52,10.88,10.88,0,0,1-3.18-4.53,13.5,13.5,0,0,1-.92-4.52V17.26Z"
              transform="translate(-9 -7.08)"
            ></path>
            <path
              d="M36.38,89.89c0-3.75,2.53-6.38,6.08-6.38s6,2.63,6,6.38-2.33,6.38-6.08,6.38C38.81,96.27,36.38,93.53,36.38,89.89Z"
              transform="translate(-9 -7.08)"
            ></path>
            <path
              d="M57.34,89.89c0-3.75,2.53-6.38,6.08-6.38s6,2.63,6,6.38-2.33,6.38-6.08,6.38C59.77,96.27,57.34,93.53,57.34,89.89Z"
              transform="translate(-9 -7.08)"
            ></path>
            <path
              d="M78.31,89.89c0-3.75,2.53-6.38,6.08-6.38s6,2.63,6,6.38S88,96.27,84.28,96.27C80.74,96.27,78.31,93.53,78.31,89.89Z"
              transform="translate(-9 -7.08)"
            ></path>
          </svg>
          <h1 className="font-display text-6xl">litenkod.se</h1>
          <p className="font-sans text-[0.8rem]">
            liten kod kan göra stora underverk
          </p>
        </div>
      </div>
    </>
  );
}

export default Home;
