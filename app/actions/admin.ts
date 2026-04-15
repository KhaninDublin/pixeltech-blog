"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { toSlug } from "@/lib/utils";

async function requireAdmin() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") throw new Error("Not allowed");
  return session;
}

export async function setUserRoleAction(userId: string, role: "USER" | "AUTHOR" | "ADMIN") {
  await requireAdmin();
  await prisma.user.update({ where: { id: userId }, data: { role } });
  revalidatePath("/admin/users");
}

export async function setUserBannedAction(userId: string, banned: boolean) {
  await requireAdmin();
  await prisma.user.update({ where: { id: userId }, data: { banned } });
  revalidatePath("/admin/users");
}

export async function deleteUserAction(userId: string) {
  const session = await requireAdmin();
  if (session.user.id === userId) return;
  await prisma.user.delete({ where: { id: userId } });
  revalidatePath("/admin/users");
}

export async function togglePostFeaturedAction(postId: string) {
  await requireAdmin();
  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (!post) return;
  await prisma.post.update({ where: { id: postId }, data: { featured: !post.featured } });
  revalidatePath("/admin/posts");
  revalidatePath("/");
}

export async function togglePostPublishedAction(postId: string) {
  await requireAdmin();
  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (!post) return;
  await prisma.post.update({ where: { id: postId }, data: { published: !post.published } });
  revalidatePath("/admin/posts");
  revalidatePath("/");
}

export async function adminDeletePostAction(postId: string) {
  await requireAdmin();
  await prisma.post.delete({ where: { id: postId } });
  revalidatePath("/admin/posts");
  revalidatePath("/");
}

export async function createTagAction(formData: FormData) {
  await requireAdmin();
  const name = String(formData.get("name") ?? "").trim();
  const color = String(formData.get("color") ?? "#8B5CF6").trim();
  if (!name || name.length > 40) return;
  const slug = toSlug(name);
  await prisma.tag.upsert({
    where: { slug },
    update: { color },
    create: { slug, name, color },
  });
  revalidatePath("/admin/tags");
  revalidatePath("/tags");
}

export async function updateTagAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const color = String(formData.get("color") ?? "#8B5CF6").trim();
  if (!id || !name) return;
  await prisma.tag.update({
    where: { id },
    data: { name, color, slug: toSlug(name) },
  });
  revalidatePath("/admin/tags");
  revalidatePath("/tags");
}

export async function deleteTagAction(tagId: string) {
  await requireAdmin();
  await prisma.tag.delete({ where: { id: tagId } });
  revalidatePath("/admin/tags");
  revalidatePath("/tags");
}
