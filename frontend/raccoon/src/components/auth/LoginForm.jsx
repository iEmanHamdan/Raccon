import { useState } from "react";
import { Link } from "react-router-dom";
import AuthField from "../ui/AuthField";
import Button from "../ui/Button";
import InlineMessage from "../ui/InlineMessage";

// Validate Username or Email
function validateIdentifier(value) {
  const identifier = value.trim();

  // Required
  if (!identifier) {
    return "أدخل اسم المستخدم أو البريد الإلكتروني.";
  }

  // Email Validation
  if (identifier.includes("@")) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(identifier)) {
      return "أدخل بريدًا إلكترونيًا صحيحًا.";
    }

    return "";
  }

  // Username Length
  if (identifier.length < 3) {
    return "اسم المستخدم يجب أن يكون 3 أحرف على الأقل.";
  }

  // Username Format
  const usernameRegex = /^[a-z0-9_]+$/;

  if (!usernameRegex.test(identifier)) {
    return "استخدم حروفًا إنجليزية صغيرة أو أرقامًا أو _ فقط.";
  }

  return "";
}

export default function LoginForm({
  onLogin,
  isSubmitting = false,
  serverError = "",
  notice = "", // success message, e.g. after resetting the password
  onEdit,
}) {
  const [values, setValues] = useState({ identifier: "", password: "" });
  const [touched, setTouched] = useState({});

  // Check if all required fields have values
  const isFormValid =
    validateIdentifier(values.identifier) === "" && values.password !== "";

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

      <div className="login-form__error" aria-live="polite">
        {serverError ? (
          <InlineMessage type="error" message={serverError} />
        ) : (
          notice && <InlineMessage type="success" message={notice} />
        )}
      </div>

      {/* Fields */}
      <div className="login-form__fields">
        <AuthField
          label="اسم المستخدم أو الإيميل"
          name="identifier"
          type="text"
          inputDir="auto" //for language
          value={values.identifier}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="اسم المستخدم أو البريد الإلكتروني"
          error={
            touched.identifier ? validateIdentifier(values.identifier) : ""
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
        <Link to="/forgot-password">نسيت كلمة المرور؟</Link>
      </div>

      {/* Submit */}
      <div className="login-form__submit">
        <Button
          type="submit" // make inSubmit work
          variant="primary"
          fullWidth
          disabled={!isFormValid}
          loading={isSubmitting} // children
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
