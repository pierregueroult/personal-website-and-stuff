import type { BlogResponse } from '@repo/db/types/blog/blog.interface';

import { MDXRemote } from 'next-mdx-remote-client/rsc';
import { forbidden, notFound, unauthorized } from 'next/navigation';
import Script from 'next/script';
import { Suspense } from 'react';

import { BlogTracking } from '@/components/blog/BlogTracking';
import { PersonalizedRecommendationsSection } from '@/components/blog/PersonalizedRecommendationsSection';
import { TrendingRecommendationsSection } from '@/components/blog/TrendingRecommendationsSection';
import { TrendingSection } from '@/components/blog/TrendingSection';
import ExcalidrawWithClientOnly from '@/components/blog/excalidraw';
import { get } from '@/lib/fetch/server';
import { options } from '@/mdx-options';

const ErrorComponent = () => <div>Error loading content</div>;

export default async function PublicBlogPage(props: PageProps<'/[locale]/blog/[...slug]'>) {
  const slug = (await props.params).slug;

  const { ok, data, code } = await get<BlogResponse>(`/blog/${slug.concat(',')}`, false);

  if (!ok && code === 404) return notFound();
  if (!ok && code === 401) return unauthorized();
  if (!ok && code === 403) return forbidden();
  if (!ok) throw new Error('Internal server error');

  if ('content' in data) {
    return (
      <>
        <BlogTracking articleId={data.database.id} />
        <Suspense fallback={<div>Loading...</div>}>
          <MDXRemote source={data.content} options={options} onError={ErrorComponent} />
        </Suspense>

        {/* Section recommandations personnalisées */}
        <div
          style={{
            marginTop: '40px',
            padding: '20px',
            border: '1px solid #e0e0e0',
            borderRadius: '8px',
          }}
        >
          <PersonalizedRecommendationsSection articleId={data.database.id} maxResults={5}>
            {({ recommendations, trackRecommendationClick, isEmpty, count }) => {
              if (isEmpty) {
                return (
                  <div>
                    <h3>📍 Recommandé pour vous</h3>
                    <p>
                      Aucune recommandation personnalisée pour le moment. Lisez plus d&apos;articles
                      pour obtenir des recommandations personnalisées !
                    </p>
                  </div>
                );
              }

              return (
                <div>
                  <h3>📍 Recommandé pour vous ({count})</h3>
                  <p>Basé sur vos lectures précédentes</p>
                  <ul style={{ listStyle: 'none', padding: 0 }}>
                    {recommendations.map((rec) => (
                      <li
                        key={rec.articleId}
                        style={{
                          marginBottom: '15px',
                          padding: '10px',
                          background: '#f8f9fa',
                          borderRadius: '4px',
                        }}
                      >
                        <button
                          onClick={() => trackRecommendationClick(rec.articleId)}
                          style={{
                            textAlign: 'left',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            width: '100%',
                          }}
                        >
                          <strong>{rec.title}</strong>
                          <br />
                          <small>
                            Score: {rec.finalScore.toFixed(2)} | Comportemental:{' '}
                            {rec.behavioralScore.toFixed(2)} | Contenu:{' '}
                            {rec.contentScore.toFixed(2)}
                          </small>
                          <br />
                          <small>Tags: {rec.tags.join(', ')}</small>
                          <br />
                          <small style={{ color: '#666' }}>
                            Pourquoi: {rec.reasons.join(', ')}
                          </small>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            }}
          </PersonalizedRecommendationsSection>
        </div>

        {/* Section articles tendances */}
        <div
          style={{
            marginTop: '20px',
            padding: '20px',
            border: '1px solid #e0e0e0',
            borderRadius: '8px',
          }}
        >
          <TrendingRecommendationsSection articleId={data.database.id} maxResults={5}>
            {({ recommendations, trackRecommendationClick, isEmpty, count }) => {
              if (isEmpty) {
                return (
                  <div>
                    <h3>🔥 Articles similaires</h3>
                    <p>Aucun article similaire trouvé.</p>
                  </div>
                );
              }

              return (
                <div>
                  <h3>🔥 Articles similaires ({count})</h3>
                  <p>Basé sur le contenu et la popularité</p>
                  <ul style={{ listStyle: 'none', padding: 0 }}>
                    {recommendations.map((rec) => (
                      <li
                        key={rec.articleId}
                        style={{
                          marginBottom: '15px',
                          padding: '10px',
                          background: '#fff8f0',
                          borderRadius: '4px',
                        }}
                      >
                        <button
                          onClick={() => trackRecommendationClick(rec.articleId)}
                          style={{
                            textAlign: 'left',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            width: '100%',
                          }}
                        >
                          <strong>{rec.title}</strong>
                          <br />
                          <small>
                            Similarité: {(rec.similarity || 0).toFixed(2)} | Score:{' '}
                            {rec.finalScore.toFixed(2)}
                          </small>
                          <br />
                          <small>Tags: {rec.tags.join(', ')}</small>
                          <br />
                          <small style={{ color: '#666' }}>
                            Pourquoi: {rec.reasons.join(', ')}
                          </small>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            }}
          </TrendingRecommendationsSection>
        </div>

        {/* Section trending */}
        <div
          style={{
            marginTop: '40px',
            padding: '20px',
            border: '1px solid #e0e0e0',
            borderRadius: '8px',
          }}
        >
          <TrendingSection maxResults={5} days={7} />
        </div>
      </>
    );
  }

  if ('drawing' in data) {
    console.log(data.drawing.files);
    return (
      <>
        <Script id="load-env-variables" strategy="beforeInteractive">
          {`window["EXCALIDRAW_ASSET_PATH"] = window.origin;`}
        </Script>
        <div className="h-[80vh] w-full">
          <ExcalidrawWithClientOnly initialData={data.drawing} viewModeEnabled />
        </div>
      </>
    );
  }

  throw new Error('Unknown content type');
}
