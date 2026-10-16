import { isValidPhoneNumber } from "libphonenumber-js";

// هذه داله تتحق من البريد
// ما تغير اي استيت هذه بس تفحص قيمة الايميل ثم ترجع النتيجه وابستخدمها في اكثر من مكان
// and here there is no useState or js it just recive data return a error massage

export function validateRegisterField(field, value, password) {
  // Required fields
  const requiredMessages = {
    name: "الاسم مطلوب",
    username: "اسم المستخدم مطلوب",
    email: "البريد الإلكتروني مطلوب",
    phone: "رقم الجوال مطلوب",
    password: "كلمة المرور مطلوبة",
    confirmPassword: "تأكيد كلمة المرور مطلوب",
  };

  if (value.trim() === "") {
    return requiredMessages[field] || "";
  }

  // Name
  if (field === "name" && value.trim().length < 2) {
    return "الاسم يجب أن يحتوي على حرفين على الأقل";
  }

  // Username
  if (field === "username" && value.trim().length < 3) {
    return "اسم المستخدم يجب أن يحتوي على 3 أحرف على الأقل";
  }

  // Email
  if (field === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    return "البريد الإلكتروني غير صالح";
  }

  // Phone
  if (field === "phone" && !isValidPhoneNumber(value)) {
    return "رقم الجوال غير صالح";
  }

  // Password
  if (field === "password" && value.length < 6) {
    return "كلمة المرور يجب أن تحتوي على 6 أحرف على الأقل";
  }

  // Confirm Password
  if (field === "confirmPassword" && value !== password) {
    return "كلمتا المرور غير متطابقتين";
  }

  return "";
}
