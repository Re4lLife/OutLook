"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function NavLinks() {
  const pathname = usePathname();

  const isActive = (path) => pathname === path;

  const linkStyles = "relative text-lg font-medium transition-colors duration-300";
  const activeColor = "text-white"; // Bright text for active
  const inactiveColor = "text-gray-500 hover:text-gray-300"; // Dimmed for inactive

  const underlineStyles = "absolute -bottom-2 left-[-10%] w-[120%] h-[2px] bg-gradient-to-r from-purple-500 to-blue-500 rounded-full";

  return (
    <nav className="mt-[20vh] items-center flex gap-[15vw] justify-center">
      <Link href="/get-started/sign-in" className={`${linkStyles} ${isActive('/get-started/sign-in') ? activeColor : inactiveColor}`}>
        Sign in
        {isActive('/get-started/sign-in') && <div className={underlineStyles} />}
      </Link>

      <Link href="/get-started/sign-up" className={`${linkStyles} ${isActive('/get-started/sign-up') ? activeColor : inactiveColor}`}>
        Sign up
        {isActive('/get-started/sign-up') && <div className={underlineStyles} />}
      </Link>
    </nav>
  );
}