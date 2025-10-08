import type { PostListResponseDto } from '@repo/db/dto/blog/post-list-item.dto';

import Link from 'next/link';

import { get } from '@/lib/fetch/server';

export default async function MainBlogPage(props: PageProps<'/[locale]/blog'>) {
  const params = await props.params;
  const locale = params.locale;

  const { ok, data } = await get<PostListResponseDto>('/blog?pageSize=20', false);

  if (!ok) {
    return <div>Failed to load blog posts</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Blog</h1>
      
      {data.posts.length === 0 ? (
        <p className="text-muted-foreground">No blog posts yet.</p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {data.posts.map((post) => (
            <Link
              key={post.id}
              href={`/${locale}/blog/${post.slug}`}
              className="block p-6 border rounded-lg hover:shadow-lg transition-shadow"
            >
              <h2 className="text-2xl font-semibold mb-2">{post.title}</h2>
              
              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                {post.readingTime && <span>{post.readingTime} min read</span>}
                {post.viewCount > 0 && <span>{post.viewCount} views</span>}
              </div>

              {post.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 text-xs rounded-full bg-primary/10 text-primary"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </Link>
          ))}
        </div>
      )}

      {data.hasMore && (
        <div className="mt-8 text-center">
          <p className="text-muted-foreground">
            Showing {data.posts.length} of {data.total} posts
          </p>
          {/* TODO: Add pagination controls */}
        </div>
      )}
    </div>
  );
}
