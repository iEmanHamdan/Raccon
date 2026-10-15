import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { avatars } from "../../../shared/components/Avatars/avatars";

import { validateRegisterField } from "../utils/registerValidation";

// Default form values No need for 6 useState
const initialValues = {
  name: "",
  username: "",
  email: "",
  phone: "",
  password: "",
  confirmPassword: "",
  avatar: avatars[0].image,
};

export default function useRegisterForm() {
  const [values, setValues] = useState(initialValues);

  const [touched, setTouched] = useState({});
  const [errors, setErrors] = useState({});

  const [showPassword, setShowPassword] = useState(false);

  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const navigate = useNavigate();

  // Validate one field
  function validateField(field, value, password = values.password) {
    return validateRegisterField(field, value, password);
  }

  // Handle input changes
  function handleChange(field, value) {
    setValues((previous) => ({
      ...previous,
      [field]: value,
    }));

    if (value.trim() === "") {
      setErrors((previous) => ({
        ...previous,
        [field]: "",
      }));
    } else if (touched[field]) {
      setErrors((previous) => ({
        ...previous,
        [field]: validateField(
          field,
          value,
          field === "password" ? value : values.password,
        ),
      }));
    }

    // Recheck confirmation when password changes
    if (
      field === "password" &&
      touched.confirmPassword &&
      values.confirmPassword
    ) {
      setErrors((previous) => ({
        ...previous,
        confirmPassword: validateField(
          "confirmPassword",
          values.confirmPassword,
          value,
        ),
      }));
    }
  }

  // Validate after leaving an input
  function handleBlur(field) {
    setTouched((previous) => ({
      ...previous,
      [field]: true,
    }));

    setErrors((previous) => ({
      ...previous,
      [field]: validateField(field, values[field]),
    }));
  }

  // Handle form submission
  function handleSubmit(event) {
    event.preventDefault();

    const nextErrors = {};

    const fields = [
      "name",
      "username",
      "email",
      "phone",
      "password",
      "confirmPassword",
    ];

    fields.forEach((field) => {
      nextErrors[field] = validateField(field, values[field]);
    });

    setErrors(nextErrors);

    setTouched(Object.fromEntries(fields.map((field) => [field, true])));

    const hasErrors = Object.values(nextErrors).some(Boolean);

    if (hasErrors) {
      return;
    }

    // مبدئيا لين ما اربطها بالباك
    const publicProfile = {
      name: values.name,
      username: values.username,
      email: values.email,
      phone: values.phone,
      avatar: values.avatar,
    };

    localStorage.setItem("userData", JSON.stringify(publicProfile));

    navigate("/login");
  }

  return {
    values,
    errors,

    showPassword,
    showConfirmPassword,

    setShowPassword,
    setShowConfirmPassword,

    handleChange,
    handleBlur,
    handleSubmit,
  };
}
