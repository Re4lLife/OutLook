import { getChatData } from "../../_lib/actions/getChatData";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import ChatInterface from "../../_components/ChatInterface";



export default async function Page({ params }) {
  const { id } = await params;

  const cookieStore = await cookies();
  const token = cookieStore.get('outlook_token')?.value;

  if (!token) return <div className="ml-[32.5vw] mt-[40vh]">Unauthorized</div>;

  let userId;

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    userId = payload.userId;
  } catch (err) {
    return <div className="ml-[32.5vw] mt-[40vh]">Session expired. Please sign in again.</div>;
  }

  const res = await getChatData(id, userId);

  if (!res.success) return <div className="ml-[32.5vw] mt-[40vh]">Chat not found</div>;

  return <ChatInterface initialData={res.data} userId={userId} chatId={id} />;
}