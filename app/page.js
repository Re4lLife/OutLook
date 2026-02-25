import Link from "next/link";


export default function Home() {
  return (
    <>
      <div className="flex text-white flex-col mt-[30vh] items-center justify-center font-sans">
        <span className="font-bold text-4xl">OutLook</span>

        <Link href='/get-started/sign-in'>
          <button className="mt-8 px-8 py-3 bg-blue-800 hover:bg-blue-950 text-white font-semibold rounded-lg transition-colors duration-200">
            Get Started
          </button>
        </Link>

      </div>
    </>
  );
}
