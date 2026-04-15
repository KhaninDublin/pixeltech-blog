"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function toggleFollow(targetUserId: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Not signed in" };
  const me = session.user.id;
  if (me === targetUserId) return { error: "Cannot follow yourself" };

  const key = { followerId_followingId: { followerId: me, followingId: targetUserId } };
  const existing = await prisma.follow.findUnique({ where: key });
  if (existing) {
    await prisma.follow.delete({ where: key });
  } else {
    await prisma.follow.create({
      data: { followerId: me, followingId: targetUserId },
    });
  }
  const target = await prisma.user.findUnique({
    where: { id: targetUserId },
    select: { username: true },
  });
  if (target) revalidatePath(`/u/${target.username}`);
  return { following: !existing };
}
