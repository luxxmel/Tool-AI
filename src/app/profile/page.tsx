import { redirect } from "next/navigation";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const userId = params?.userId ? `&userId=${params.userId}` : "";
  redirect(`/?tab=profile${userId}`);
}
