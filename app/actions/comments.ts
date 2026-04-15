"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

const schema = z.object({
  postId: z.string().min(1),
  parentId: z.string().optional(),
  content: z.string().min(2).max(4000),
});

export async function addComment(input: {
  postId: string;
  parentId?: string;
  content: string;
}): Promise<{ error?: string; id?: string }> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Not signed in" };

  const parsed = schema.safeParse(input);
  if (!parsed.success) return { error: "Invalid comment" };

  const post = await prisma.post.findUnique({
    where: { id: parsed.data.postId },
    select: { id: true, slug: true },
  });
  if (!post) return { error: "Post not found" };

  const created = await prisma.comment.create({
    data: {
      postId: post.id,
      authorId: session.user.id,
      parentId: parsed.data.parentId ?? null,
      content: parsed.data.content,
    },
  });

  revalidatePath(`/posts/${post.slug}`);
  return { id: created.id };
}

export async function deleteComment(commentId: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Not signed in" };

  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
    include: { post: { select: { slug: true } } },
  });
  if (!comment) return { error: "Not found" };

  const isAuthor = comment.authorId === session.user.id;
  const isAdmin = session.user.role === "ADMIN";
  if (!isAuthor && !isAdmin) return { error: "Not allowed" };

  await prisma.comment.delete({ where: { id: commentId } });
  revalidatePath(`/posts/${comment.post.slug}`);
}

export async function toggleHideComment(commentId: string) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") return { error: "Not allowed" };
  const c = await prisma.comment.findUnique({
    where: { id: commentId },
    include: { post: { select: { slug: true } } },
  });
  if (!c) return { error: "Not found" };
  await prisma.comment.update({
    where: { id: commentId },
    data: { hidden: !c.hidden },
  });
  revalidatePath(`/posts/${c.post.slug}`);
  revalidatePath(`/admin/comments`);
}
