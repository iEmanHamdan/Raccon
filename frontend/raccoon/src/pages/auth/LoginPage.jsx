import { useState } from "react";
import { loginUser } from "../../api/authApi";

import AuthLayout from "../../components/layout/AuthLayout";
import AuthPromo from "../../components/layout/AuthPromo";

import DehmScan from "../../components/ui/DehmScan";
import LoginForm from "../../components/auth/LoginForm";

export default function LoginPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");

  async function handleLogin(credentials) {
    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setServerError("");

    try {
      const result = await loginUser(credentials);

      // سنكمل إدارة Session بعد معرفة Success Response
      // لا نطبع Token أو بيانات المصادقة في Console
      console.info("Login request succeeded");
    } catch (error) {
      if (error.status === 401 || error.status === 400) {
        setServerError("اسم المستخدم/البريد أو كلمة المرور غير صحيحة.");
      } else if (error.status === 422) {
        setServerError("يرجى التأكد من البيانات المدخلة.");
      } else {
        setServerError("تعذر تسجيل الدخول. حاول مرة أخرى.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthLayout
      promo={
        <AuthPromo
          scene={<DehmScan />}
          mobileTitle="هلا بالكحيلان حياك الله من جديد"
          mobileSubTitle=""
          variant="login"
        />
      }
    >
      <div className="login-page">
        <LoginForm
          onLogin={handleLogin}
          isSubmitting={isSubmitting}
          serverError={serverError}
          onEdit={() => setServerError("")}
        />
      </div>
    </AuthLayout>
  );
}
