import { useState } from "react";
import { Link } from "react-router-dom";

import AuthField from "../ui/AuthField";
import Button from "../ui/Button";
import InlineMessage from "../ui/InlineMessage";

export default function LoginForm({
  onLogin,
  isSubmitting = false,
  serverError = "",
  onEdit,
}) {
  const [values, setValues] = useState({
    identifier: "",
    password: "",
  });

  const [touched, setTouched] = useState({});

  // Check if all required fields have values
  const isFormValid = values.identifier.trim() !== "" && values.password !== "";

  // Update input values
  function handleChange(event) {
    const { name, value } = event.target;

    setValues((previous) => ({
      ...previous,
      [name]: value,
    }));

    if (onEdit) {
      onEdit();
    }
  }

  // Mark the field as touched
  function handleBlur(event) {
    const { name } = event.target;

    setTouched((previous) => ({
      ...previous,
      [name]: true,
    }));
  }

  // Submit Login
  function handleSubmit(event) {
    event.preventDefault();

    if (!isFormValid || isSubmitting) {
      return;
    }

    if (onLogin) {
      onLogin({
        identifier: values.identifier.trim(),
        password: values.password,
      });
    }
  }

  return (
    <form className="login-form" onSubmit={handleSubmit} noValidate>
      {/* Header */}
      <div className="login-form__header">
        <h1 className="login-form__title">هلا، حياك من جديد</h1>

        <p className="login-form__subtitle">ادخل حسابك عشان تتابع باقاتك.</p>
      </div>

      {/* Backend Error */}
      {serverError && (
        <div className="login-form__error">
          <InlineMessage type="error" message={serverError} />
        </div>
      )}

      {/* Fields */}
      <div className="login-form__fields">
        <AuthField
          label="اسم المستخدم أو الإيميل"
          name="identifier"
          type="text"
          inputDir="auto"
          value={values.identifier}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="اسم المستخدم أو البريد الإلكتروني"
          error={
            touched.identifier && !values.identifier.trim()
              ? "أدخل اسم المستخدم أو البريد الإلكتروني."
              : ""
          }
          autoComplete="username"
        />

        <AuthField
          label="كلمة المرور"
          name="password"
          type="password"
          value={values.password}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="أدخل كلمة المرور"
          error={
            touched.password && !values.password ? "أدخل كلمة المرور." : ""
          }
          autoComplete="current-password"
        />
      </div>

      {/* Forgot Password */}
      <div className="login-form__forgot">
        <span>نسيت كلمة المرور؟</span>
      </div>

      {/* Submit */}
      <div className="login-form__submit">
        <Button
          type="submit"
          variant="primary"
          fullWidth
          disabled={!isFormValid}
          loading={isSubmitting}
        >
          ادخل
        </Button>
      </div>

      {/* Register Link */}
      <div className="login-form__footer">
        <p>
          أول مرة معنا؟ <Link to="/register">أنشئ حساب جديد</Link>
        </p>
      </div>
    </form>
  );
}
