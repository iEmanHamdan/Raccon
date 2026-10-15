// This is the left side in the register form

import styles from "./RegisterBanner.module.css";

export default function RegisterBanner() {
  return (
    <aside className={styles.animationSide}>
      <div className={styles.bannerContent}>
        <h2>
          كل قطعة
          <br />
          تحكي حكاية.
        </h2>

        <p>جهّز رحلة البحث، شاركها مع ضيوفك، وخلّهم يدورون على أول خيط.</p>
      </div>

      <div className={styles.bannerPattern} aria-hidden="true" />
    </aside>
  );
}
