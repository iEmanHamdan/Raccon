/*
Here there is 3 components 
1 register form for combain the from  
2 password field 
3 text field for normal text 
*/

import { Link } from "react-router-dom";

import { PhoneInput } from "react-international-phone";
import "react-international-phone/style.css";

import AvatarSelector from "../../../../shared/components/Avatars/AvatarSelector";

import useRegisterForm from "../../hooks/useRegisterForm";

import viewIcon from "../../../../assets/view.png";
import hideIcon from "../../../../assets/hide.png";

import styles from "./RegisterForm.module.css";

// Reusable text input
function TextField({
  id,
  label,
  type = "text",
  value,
  onChange,
  onBlur,
  error,
  placeholder,
}) {
  return (
    <div className={styles.formGroup}>
      <label htmlFor={id}>{label}</label>

      <input
        id={id}
        name={id}
        type={type}
        value={value}
        onChange={(event) => onChange(id, event.target.value)}
        onBlur={() => onBlur(id)}
        placeholder={placeholder}
        className={error ? styles.inputInvalid : undefined}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
      />

      {error && (
        <p id={`${id}-error`} className={styles.inputError}>
          {error}
        </p>
      )}
    </div>
  );
}

// Reusable password input
function PasswordField({
  id,
  label,
  value,
  onChange,
  onBlur,
  error,
  visible,
  onToggle,
  placeholder,
}) {
  return (
    <div className={styles.formGroup}>
      <label htmlFor={id}>{label}</label>

      <div className={styles.passwordInput}>
        <input
          id={id}
          name={id}
          type={visible ? "text" : "password"}
          value={value}
          onChange={(event) => onChange(id, event.target.value)}
          onBlur={() => onBlur(id)}
          placeholder={placeholder}
          className={error ? styles.inputInvalid : undefined}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
        />

        <button
          type="button"
          className={styles.passwordEye}
          onClick={onToggle}
          aria-label={visible ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
        >
          <img
            src={visible ? hideIcon : viewIcon}
            alt=""
            className={styles.eyeIcon}
          />
        </button>
      </div>

      {error && (
        <p id={`${id}-error`} className={styles.inputError}>
          {error}
        </p>
      )}
    </div>
  );
}

// Main Register Form
export default function RegisterForm() {
  const {
    values,
    errors,
    showPassword,
    showConfirmPassword,
    setShowPassword,
    setShowConfirmPassword,
    handleChange,
    handleBlur,
    handleSubmit,
  } = useRegisterForm();

  return (
    <div className={styles.registerBox}>
      <h1>أنشئ حسابك</h1>

      <p className={styles.registerDescription}>
        أمامك بضعة أمتار فقط عن الكنز الخفي.. هل أنت مستعد؟
      </p>

      <AvatarSelector
        selectedAvatar={values.avatar}
        onSelect={(image) => handleChange("avatar", image)}
      />

      <form className={styles.registerForm} onSubmit={handleSubmit} noValidate>
        {/* Name and Username */}
        <div className={styles.formRow}>
          <TextField
            id="name"
            label="الاسم كامل"
            placeholder="الاسم كامل"
            value={values.name}
            error={errors.name}
            onChange={handleChange}
            onBlur={handleBlur}
          />

          <TextField
            id="username"
            label="اسم المستخدم"
            placeholder="ادخل اسم المستخدم"
            value={values.username}
            error={errors.username}
            onChange={handleChange}
            onBlur={handleBlur}
          />
        </div>

        {/* Email */}
        <TextField
          id="email"
          label="البريد الإلكتروني"
          type="email"
          placeholder="ادخل البريد الإلكتروني"
          value={values.email}
          error={errors.email}
          onChange={handleChange}
          onBlur={handleBlur}
        />

        {/* Phone */}
        <div className={styles.formGroup}>
          <label htmlFor="phone">رقم الجوال</label>

          <PhoneInput
            defaultCountry="sa"
            value={values.phone}
            inputProps={{
              id: "phone",
              name: "phone",
              autoComplete: "tel",
            }}
            disableDialCodeAndPrefix={true}
            showDisabledDialCodeAndPrefix={true}
            placeholder="5X XXX XXXX"
            onChange={(value) => handleChange("phone", value)}
            onBlur={() => handleBlur("phone")}
            className={errors.phone ? styles.phoneInvalid : undefined}
          />

          {errors.phone && <p className={styles.inputError}>{errors.phone}</p>}
        </div>

        {/* Password */}
        <PasswordField
          id="password"
          label="كلمة المرور"
          placeholder="أدخل كلمة المرور"
          value={values.password}
          error={errors.password}
          visible={showPassword}
          onToggle={() => setShowPassword((previous) => !previous)}
          onChange={handleChange}
          onBlur={handleBlur}
        />

        {/* Confirm Password */}
        <PasswordField
          id="confirmPassword"
          label="تأكيد كلمة المرور"
          placeholder="أعد إدخال كلمة المرور"
          value={values.confirmPassword}
          error={errors.confirmPassword}
          visible={showConfirmPassword}
          onToggle={() => setShowConfirmPassword((previous) => !previous)}
          onChange={handleChange}
          onBlur={handleBlur}
        />

        {/* Login Link */}
        <p className={styles.signinText}>
          لديك حساب بالفعل؟
          <Link to="/login"> تسجيل الدخول</Link>
        </p>

        {/* Register Button */}
        <button type="submit" className={styles.registerButton}>
          إنشاء حساب
        </button>

        {/* Divider */}
        <div className={styles.authDivider}>
          <span>أو</span>
        </div>

        {/* Google Button */}
        <button
          type="button"
          className={styles.googleButton}
          onClick={() => alert("تسجيل الدخول باستخدام Google غير متاح حاليًا")}
        >
          <span className={styles.googleIcon}>G</span>
          المتابعة باستخدام Google
        </button>
      </form>
    </div>
  );
}
