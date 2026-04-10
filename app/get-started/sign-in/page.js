import { Suspense } from "react";
import SignInContent from "../../_components/SignInContent";

export default function SignInPage() {
  return (
    <Suspense fallback={null}>
      <SignInContent />
    </Suspense>
  );
}