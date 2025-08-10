import Layout from '@/components/layout/layout';
import styles from '@/styles/modules/index.module.scss';
import gridStyles from '@/styles/modules/grid.module.scss';
import gutterStyles from '@/styles/modules/gutter.module.scss';

// ファイル下に meta情報用の getStaticProps記載

export default function Home() {
  return (
    <Layout>
      <main>

        <article className={`${styles.adv}`}>
          <div className={`${gridStyles['row--container']} ${gutterStyles.container}`}>
            <div className={`${gridStyles['col--12']} ${gridStyles['col--lg-10']} ${gridStyles['col--xl-7']}`}>
              <p>lorem</p>
            </div>
          </div>
        </article>


      </main>
    </Layout>
  );
}

export async function getStaticProps() {
  const pageMeta = {
    description: '',
  };
  return {
    props: {
      pageMeta,
    },
  };
}
