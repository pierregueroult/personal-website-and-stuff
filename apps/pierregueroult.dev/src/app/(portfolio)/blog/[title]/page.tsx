export default async function ArticlePage({ params }: PageProps<'/blog/[title]'>) {
  const title = (await params).title;
  return <div>Article Page: {title}</div>;
}
