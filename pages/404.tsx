export default function Custom404() {
  return <h1>404 - Page Not Found</h1>;
}

export async function getStaticProps() {
  const pageMeta = {
    title: '404',
    description: '',
  };
  return {
    props: {
      pageMeta,
    },
  };
}
