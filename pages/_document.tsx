import Document, { Html, Head, Main, NextScript, DocumentContext } from 'next/document';

export default class MyDocument extends Document {
  static async getInitialProps(ctx: DocumentContext) {
    const initialProps = await Document.getInitialProps(ctx);
    return { ...initialProps };
  }

  render() {
    return (
      <Html>
        <Head>
          <link key="css-notosansjp" rel="stylesheet" href="https://fonts.googleapis.com/earlyaccess/notosansjp.css" type="text/css" media="all" />
          {/* Google Tag Manager */}
          <script
            dangerouslySetInnerHTML={{
              __html: `
                gtmコードペースト
              `,
            }}
          />
          {/* End Google Tag Manager */}
        </Head>
        <body className="">
          {/* Google Tag Manager (noscript) */}
          {/* End Google Tag Manager (noscript) */}
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}
