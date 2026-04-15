"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function toggleLike(postId: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Not signed in" };
  const userId = session.user.id;

  const existing = await prisma.like.findUnique({
    where: { userId_postId: { userId, postId } },
  });
  if (existing) {
    await prisma.like.delete({ where: { userId_postId: { userId, postId } } });
  } else {
    await prisma.like.create({ data: { userId, postId } });
  }
  revalidatePath("/");
  return { liked: !existing };
}

export async function toggleBookmark(postId: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Not signed in" };
  const userId = session.user.id;

  const existing = await prisma.bookmark.findUnique({
    where: { userId_postId: { userId, postId } },
  });
  if (existing) {
    await prisma.bookmark.delete({ where: { userId_postId: { userId, postId } } });
  } else {
    await prisma.bookmark.create({ data: { userId, postId } });
  }
  revalidatePath("/bookmarks");
  return { bookmarked: !existing };
}
