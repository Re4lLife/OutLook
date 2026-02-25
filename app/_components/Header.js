import Image from "next/image";
import logo from "../public/logo.png"

export default function Header() {
    return (
        <header className="pt-2">
            <div className="flex items-center justify-center rounded-full p-1.5 bg-slate-400/50 w-32 mx-auto">
                <Image
                    src={logo}
                    alt="Outlook Logo"
                    width={30}
                    height={50}
                    priority
                />
                <Image
                    src={logo}
                    alt="Outlook Logo"
                    width={35}
                    height={50}
                    priority
                />
            </div>
        </header>
    );
};

