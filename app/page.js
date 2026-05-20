import { HomePage } from "../components/PublicPage";
import { getHome, getPosts } from "../lib/content";

export default async function HomeRoute() {
  const [data, posts] = await Promise.all([getHome(), getPosts()]);
  return <HomePage data={data} posts={posts} />;
}
