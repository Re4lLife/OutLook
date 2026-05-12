// app/profile/page.js
import Profile from "../_components/Profile";
import { getProfileData } from "../_lib/actions/getProfileData";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { redirect } from "next/navigation";

export default async function ProfilePage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('outlook_token')?.value;
  if (!token) redirect('/get-started/sign-in');

  let userId;
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    userId = payload.userId;
  } catch {
    redirect('/get-started/sign-in');
  }

  const res = await getProfileData(userId);
  if (!res.success) redirect('/get-started/sign-in');

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <Profile initialProfile={res.user} userId={userId} />
    </div>
  );
}