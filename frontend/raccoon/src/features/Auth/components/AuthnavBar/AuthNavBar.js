import Mark from "../../../../assets/Mark.png";
import styles from "./AuthNavbar.module.css";

export default function AuthNavbar() {
  return (
    <nav className={styles.authNavbar}>
      <span className={styles.authHelp}>مساعدة</span>

      <img src={Mark} alt="Raccon Logo" className={styles.authLogo} />
    </nav>
  );
}
