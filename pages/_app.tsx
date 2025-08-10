import '@/styles/global/style.scss';
// import LayoutBasic from '@components/layout/basic';
// import LayoutSecond from '@components/Layout-second';
// import { useRouter } from 'next/router';
import Head from 'next/head';
import getConfig from 'next/config';
import { AppProps } from 'next/app';

const { publicRuntimeConfig } = getConfig();
const basePath = (publicRuntimeConfig && publicRuntimeConfig.basePath) || '';

export default function MyApp({ Component, pageProps }: AppProps) {
  // const router = useRouter();
  // レイアウトの出し分け_app.jsでやる場合。layout.jsにprops渡して条件分岐させる方法を採用
  // let getLayout;
  // getLayout = (page) => <LayoutBasic>{page}</LayoutBasic>
  // if (router.route.startsWith('/about')) {
  //   getLayout = (page) => <LayoutSecond>{page}</LayoutSecond>
  // }

  // 各ページから受け取ったデータを使って customMeta オブジェクトを構築
  const siteTitle = 'サイトタイトル';
  const customMeta = {
    title: pageProps.pageMeta?.title
      ? `${pageProps.pageMeta.title} | ${siteTitle}`
      : siteTitle,
    ogUrl: pageProps.pageMeta?.ogUrl ? `${basePath}/${pageProps.pageMeta.ogUrl}` : basePath,
    description: pageProps.pageMeta?.description || '',
  };

  return (
    <>
      <Head>
        <meta charSet="utf-8" />
        <meta httpEquiv="x-ua-compatible" content="ie=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, viewport-fit=cover"
        />
        <link rel="icon" href={`${basePath}/img/favicon.ico`} />
        <link rel="apple-touch-icon-precomposed" href={`${basePath}/img/webclip.png`} />
        <title>{customMeta.title}</title>
        <meta name="description" content={customMeta.description} />
        <meta property="og:title" content={customMeta.title} />
        <meta property="og:description" content={customMeta.description} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={customMeta.ogUrl} />
        <meta property="og:image" content={`${basePath}/img/ogp-image.jpg`} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:site_name" content={siteTitle} />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content={customMeta.title} />
        <meta name="twitter:description" content={customMeta.description} />
        <meta name="twitter:image" content={`${basePath}/img/ogp-image.jpg`} />

      </Head>
      {/* {getLayout(<Component {...pageProps} />, pageProps)} */}
      <Component {...pageProps} />
    </>
  );
}
