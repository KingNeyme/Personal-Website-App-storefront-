import { notFound } from "next/navigation";

import { BlogPost } from "../../components/PublicPage";
import { getPostBySlug } from "../../lib/content";

export default async function BlogPostPage({ searchParams }) {
  const params = await searchParams;
  const slug = params?.slug;
  const post = slug ? await getPostBySlug(slug) : null;

  if (!post) notFound();

  return <BlogPost post={post} />;
}
