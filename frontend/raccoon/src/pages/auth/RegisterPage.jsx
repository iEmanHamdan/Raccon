import { useState } from "react";

import AuthLayout from "../../components/layout/AuthLayout";
import AuthPromo from "../../components/layout/AuthPromo";
import DehmScan from "../../components/ui/DehmScan";
import RegisterForm from "../../components/auth/RegisterForm";

import { registerUser } from "../../api/authApi";

export default function RegisterPage() {
  const [isSubmitting, setIsSubmitting] = useState(false); // is the submitting is load

  const [serverError, setServerError] = useState(""); // backend error
  const [fieldErrors, setFieldErrors] = useState({}); // check the logic of auth in backend
  const [successMessage, setSuccessMessage] = useState(""); // message register success

  async function handleRegister(userData) {
    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setServerError("");
    setFieldErrors({});
    setSuccessMessage("");

    try {
      await registerUser(userData);

      setSuccessMessage("تم إنشاء الحساب بنجاح");
    } catch (error) {
      console.error("Register API Error:", {
        status: error.status,
        detail: error.detail,
        message: error.message,
      });
      if (error.status === 400) {
        setServerError("اسم المستخدم أو البريد الإلكتروني مستخدم مسبقًا");
      } else if (error.status === 422) {
        const errors = {};

        if (Array.isArray(error.detail)) {
          for (const item of error.detail) {
            const field = item.loc?.[1];

            if (
              [
                "name",
                "username",
                "email",
                "phone_number",
                "password",
                "avatar_id",
              ].includes(field)
            ) {
              errors[field] = "تحقق من قيمة هذا الحقل";
            }
          }
        }

        setFieldErrors(errors);

        if (Object.keys(errors).length === 0) {
          setServerError("يرجى مراجعة البيانات المدخلة");
        }
      } else {
        setServerError("تعذر الاتصال بالخادم أو إكمال التسجيل. حاول مرة أخرى");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleEdit() {
    setServerError("");
    setFieldErrors({});
    setSuccessMessage("");
  }

  return (
    <AuthLayout promo={<AuthPromo scene={<DehmScan />} />}>
      <RegisterForm
        onRegister={handleRegister}
        isSubmitting={isSubmitting}
        serverError={serverError}
        fieldErrors={fieldErrors}
        successMessage={successMessage}
        onEdit={handleEdit}
      />
    </AuthLayout>
  );
}
