// This display the Register form only
import AuthNavbar from "../components/AuthnavBar/AuthNavBar";

import RegisterForm from "../components/RegisterForm/RegisterForm";
import RegisterBanner from "../components/RegisterBanner/RegisterBanner"; //left side

import styles from "./RegisterPage.module.css";

export default function RegisterPage() {
  return (
    <div className={styles.registerPage}>
      <AuthNavbar />

      <main className={styles.registerLayout}>
        <div className={styles.formSide} dir="rtl">
          <RegisterForm />
        </div>

        <RegisterBanner />
      </main>
    </div>
  );
}
