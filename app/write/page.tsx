import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { WriteForm } from "./write-form";

export const metadata = { title: "Write a post" };

export default async function WritePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?next=/write");
  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">New post</h1>
        <p className="text-sm text-muted">
          Markdown is fully supported. Keep titles under 140 characters.
        </p>
      </div>
      <WriteForm />
    </div>
  );
}
