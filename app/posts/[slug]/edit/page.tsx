import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { EditForm } from "./edit-form";

export const metadata = { title: "Edit post" };

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect(`/login?next=/posts/${slug}/edit`);

  const post = await prisma.post.findUnique({
    where: { slug },
    include: { tags: { include: { tag: true } } },
  });
  if (!post) notFound();
  if (post.authorId !== session.user.id && session.user.role !== "ADMIN") {
    redirect(`/posts/${slug}`);
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Edit post</h1>
      </div>
      <EditForm
        postId={post.id}
        defaults={{
          title: post.title,
          content: post.content,
          coverUrl: post.coverUrl ?? "",
          tags: post.tags.map((t) => t.tag.name).join(", "),
          published: post.published,
        }}
      />
    </div>
  );
}
