export default async function ArticlePage({ params }: PageProps<'/[locale]/blog/[title]'>) {
  const title = (await params).title;
  return <div>Article Page: {title}</div>;
}
