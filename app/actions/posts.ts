"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { excerptFrom, toSlug } from "@/lib/utils";

const postSchema = z.object({
  title: z.string().min(6).max(140),
  content: z.string().min(40),
  coverUrl: z.string().url().optional().or(z.literal("")),
  tags: z.string().max(200).optional(),
  published: z.boolean().optional(),
});

function parseTagNames(raw?: string): string[] {
  if (!raw) return [];
  return Array.from(
    new Set(
      raw
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
        .slice(0, 5)
    )
  );
}

async function upsertTagsByName(names: string[]) {
  const ids: string[] = [];
  for (const name of names) {
    const slug = toSlug(name);
    const tag = await prisma.tag.upsert({
      where: { slug },
      update: { name },
      create: { slug, name },
    });
    ids.push(tag.id);
  }
  return ids;
}

async function uniqueSlug(base: string, ignoreId?: string) {
  let slug = toSlug(base);
  if (!slug) slug = "post";
  let i = 0;
  // try up to 50 variants
  while (i < 50) {
    const candidate = i === 0 ? slug : `${slug}-${i}`;
    const existing = await prisma.post.findUnique({ where: { slug: candidate } });
    if (!existing || existing.id === ignoreId) return candidate;
    i++;
  }
  return `${slug}-${Date.now()}`;
}

export async function createPostAction(
  _prev: { error?: string } | undefined,
  formData: FormData
): Promise<{ error?: string }> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Not signed in" };

  const raw = {
    title: String(formData.get("title") ?? "").trim(),
    content: String(formData.get("content") ?? "").trim(),
    coverUrl: String(formData.get("coverUrl") ?? "").trim(),
    tags: String(formData.get("tags") ?? "").trim(),
    published: formData.get("published") === "on",
  };
  const parsed = postSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const slug = await uniqueSlug(parsed.data.title);
  const tagIds = await upsertTagsByName(parseTagNames(parsed.data.tags));

  const post = await prisma.post.create({
    data: {
      slug,
      title: parsed.data.title,
      content: parsed.data.content,
      excerpt: excerptFrom(parsed.data.content),
      coverUrl: parsed.data.coverUrl || null,
      published: parsed.data.published ?? true,
      authorId: session.user.id,
      tags: { create: tagIds.map((id) => ({ tagId: id })) },
    },
  });

  revalidatePath("/");
  redirect(`/posts/${post.slug}`);
}

export async function updatePostAction(
  postId: string,
  _prev: { error?: string } | undefined,
  formData: FormData
): Promise<{ error?: string }> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Not signed in" };

  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (!post) return { error: "Post not found" };
  if (post.authorId !== session.user.id && session.user.role !== "ADMIN") {
    return { error: "Not allowed" };
  }

  const raw = {
    title: String(formData.get("title") ?? "").trim(),
    content: String(formData.get("content") ?? "").trim(),
    coverUrl: String(formData.get("coverUrl") ?? "").trim(),
    tags: String(formData.get("tags") ?? "").trim(),
    published: formData.get("published") === "on",
  };
  const parsed = postSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const slug =
    parsed.data.title === post.title ? post.slug : await uniqueSlug(parsed.data.title, postId);
  const tagIds = await upsertTagsByName(parseTagNames(parsed.data.tags));

  await prisma.$transaction([
    prisma.postTag.deleteMany({ where: { postId } }),
    prisma.post.update({
      where: { id: postId },
      data: {
        title: parsed.data.title,
        slug,
        content: parsed.data.content,
        excerpt: excerptFrom(parsed.data.content),
        coverUrl: parsed.data.coverUrl || null,
        published: parsed.data.published ?? true,
        tags: { create: tagIds.map((id) => ({ tagId: id })) },
      },
    }),
  ]);

  revalidatePath("/");
  revalidatePath(`/posts/${slug}`);
  redirect(`/posts/${slug}`);
}

export async function deletePostAction(postId: string): Promise<{ error?: string } | void> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Not signed in" };
  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (!post) return { error: "Not found" };
  if (post.authorId !== session.user.id && session.user.role !== "ADMIN") {
    return { error: "Not allowed" };
  }
  await prisma.post.delete({ where: { id: postId } });
  revalidatePath("/");
  redirect("/");
}
