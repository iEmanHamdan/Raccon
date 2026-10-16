import AuthLayout from "../../components/layout/AuthLayout";
import AuthPromo from "../../components/layout/AuthPromo";

import DehmScan from "../../components/ui/DehmScan";
import LoginForm from "../../components/auth/LoginForm";

export default function LoginPage() {
  return (
    <AuthLayout promo={<AuthPromo scene={<DehmScan />} variant="login" />}>
      <div className="login-page">
        <LoginForm />
      </div>
    </AuthLayout>
  );
}
