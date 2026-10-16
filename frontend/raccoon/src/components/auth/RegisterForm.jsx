import { useState } from "react";
import { Link } from "react-router-dom";

import AuthField from "../ui/AuthField";
import CharacterPicker from "../ui/CharacterPicker";
import Button from "../ui/Button";
import InlineMessage from "../ui/InlineMessage";

const initialValues = {
  name: "",
  username: "",
  email: "",
  phone_number: "",
  password: "",
  confirmPassword: "",
  avatar_id: null,
};

// Frontend Validation
function validateRegister(values) {
  const errors = {};

  // Avatar
  if (!values.avatar_id) {
    errors.avatar_id = "اختر صورة رمزية للمتابعة.";
  }

  // Name
  if (!values.name.trim()) {
    errors.name = "أدخل اسمك.";
  }

  // Username
  if (!values.username.trim()) {
    errors.username = "اختر اسم مستخدم.";
  } else if (values.username.trim().length < 3) {
    errors.username = "اسم المستخدم يجب أن يحتوي على 3 أحرف على الأقل.";
  }

  // Email
  if (!values.email.trim()) {
    errors.email = "أدخل بريدك الإلكتروني.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
    errors.email = "أدخل بريدًا إلكترونيًا صحيحًا.";
  }

  // Phone
  if (!values.phone_number.trim()) {
    errors.phone_number = "أدخل رقم جوالك.";
  } else if (!/^5\d{8}$/.test(values.phone_number.trim())) {
    errors.phone_number = "أدخل رقم جوال سعودي صحيحًا يبدأ بـ 5.";
  }

  // Password
  if (!values.password) {
    errors.password = "أدخل كلمة المرور.";
  } else if (values.password.length < 8) {
    errors.password = "كلمة المرور يجب أن تحتوي على 8 أحرف على الأقل.";
  }

  // Confirm Password
  if (!values.confirmPassword) {
    errors.confirmPassword = "أكد كلمة المرور.";
  } else if (values.confirmPassword !== values.password) {
    errors.confirmPassword = "كلمتا المرور غير متطابقتين.";
  }

  return errors;
}

export default function RegisterForm({
  onRegister,
  isSubmitting = false,
  serverError = "",
  fieldErrors = {},
  successMessage = "",
  onEdit,
}) {
  const [values, setValues] = useState(initialValues);

  const [touched, setTouched] = useState({});

  const errors = validateRegister(values);

  const isFormValid = Object.keys(errors).length === 0;

  function getFieldError(name) {
    if (touched[name] && errors[name]) {
      return errors[name];
    }

    return fieldErrors[name] || "";
  }

  // Update Input
  function handleChange(event) {
    const { name, value } = event.target;
    if (onEdit) {
      onEdit();
    }

    setValues((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  // Validate after leaving field
  function handleBlur(event) {
    const { name } = event.target;

    setTouched((previous) => ({
      ...previous,
      [name]: true,
    }));
  }

  // Select Avatar
  function handleAvatarChange(id) {
    if (onEdit) {
      onEdit();
    }

    setValues((previous) => ({
      ...previous,
      avatar_id: id,
    }));
  }

  // Submit Form
  function handleSubmit(event) {
    event.preventDefault();

    if (!isFormValid || isSubmitting) {
      return;
    }

    if (onRegister) {
      onRegister({
        name: values.name.trim(),
        username: values.username.trim(),
        email: values.email.trim(),
        phone_number: values.phone_number.trim(),
        password: values.password,
        avatar_id: values.avatar_id,
      });
    }
  }

  return (
    <form className="register-form" onSubmit={handleSubmit} noValidate>
      {/* Header */}
      <div className="register-form__header">
        <h1 className="register-form__title">أنشئ حسابك</h1>

        <p className="register-form__signin">
          عندك حساب؟ <Link to="/login">ادخل</Link>
        </p>
      </div>

      {/* Character Picker */}
      <div className="register-form__avatars">
        <CharacterPicker
          value={values.avatar_id}
          onChange={handleAvatarChange}
          required
          error={getFieldError("avatar_id")}
        />
      </div>

      {/* Fields */}
      <div className="register-form__fields">
        <AuthField
          label="الاسم"
          name="name"
          value={values.name}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="اسمك"
          error={getFieldError("name")}
          autoComplete="name"
        />

        <AuthField
          label="اسم المستخدم"
          name="username"
          value={values.username}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="زي: reem_s"
          error={getFieldError("username")}
          autoComplete="username"
        />

        <div className="register-form__field-full">
          <AuthField
            label="الإيميل"
            name="email"
            type="email"
            value={values.email}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="name@example.com"
            error={getFieldError("email")}
            autoComplete="email"
          />
        </div>

        <div className="register-form__field-full">
          <AuthField
            label="رقم الجوال"
            name="phone_number"
            type="tel"
            value={values.phone_number}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="5X XXX XXXX"
            helper="رقم الجوال يبدأ بـ 5"
            error={getFieldError("phone_number")}
            maxLength={9}
            autoComplete="tel-national"
          />
        </div>

        <div className="register-form__field-full">
          <AuthField
            label="كلمة المرور"
            name="password"
            type="password"
            value={values.password}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="8 أحرف أو أكثر"
            helper="8 أحرف أو أكثر"
            error={getFieldError("password")}
            autoComplete="new-password"
          />
        </div>

        <div className="register-form__field-full">
          <AuthField
            label="تأكيد كلمة المرور"
            name="confirmPassword"
            type="password"
            value={values.confirmPassword}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="أعد كتابة كلمة المرور"
            error={getFieldError("confirmPassword")}
            autoComplete="new-password"
          />
        </div>
      </div>

      {/*this part for display backend message*/}
      {serverError && <InlineMessage type="error" message={serverError} />}

      {successMessage && (
        <InlineMessage type="success" message={successMessage} />
      )}

      {/* Submit */}
      <div className="register-form__submit">
        <Button
          type="submit"
          variant="primary"
          fullWidth
          disabled={!isFormValid}
          loading={isSubmitting}
        >
          أنشئ حسابي
        </Button>
      </div>

      {/* Footer */}
      <p className="register-form__footer">
        بحسابك تقدر تفعّل باقاتك وتدخل رحلات البحث.
      </p>
    </form>
  );
}
