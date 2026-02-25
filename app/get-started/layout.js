import NavLinks from "../_components/NavLinks";

export const metadata = {
  title: { 
    template: "%s / Get Started",
    default: "GetStarted"
  }
}

export default function GetStartedLayout({ children }) {
  return (
    <>
      <NavLinks />
      {children}
    </>
  );
}