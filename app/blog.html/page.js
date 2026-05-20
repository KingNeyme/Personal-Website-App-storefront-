import { BlogIndex } from "../../components/PublicPage";
import { getPosts } from "../../lib/content";

export default async function BlogPage() {
  const posts = await getPosts();
  return <BlogIndex posts={posts} />;
}
