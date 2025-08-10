import styles from '@/styles/modules/header.module.scss';
import gridStyles from '@/styles/modules/grid.module.scss';
import gutterStyles from '@/styles/modules/gutter.module.scss';
import {ImgPath} from '@/lib/utils/rewritePath';

export default function Header() {
  return (
    <>
      <header className={styles.outer}>
        <div className={`${gridStyles['row--container']} ${gutterStyles.container} jc-start ai-center`}>
          <h1 className={styles.logo}>
            <ImgPath src="logo.png" alt=""/>
          </h1>
        </div>
      </header>
    </>
  );
}