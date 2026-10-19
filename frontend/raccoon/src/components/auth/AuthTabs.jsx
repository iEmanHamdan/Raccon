import { NavLink } from "react-router-dom";

export default function AuthTabs() {
  return (
    <nav className="auth-tabs" aria-label="التنقل بين التسجيل والدخول">
      <NavLink
        to="/register"
        className={({ isActive }) =>
          isActive
            ? "auth-tabs__link auth-tabs__link--active"
            : "auth-tabs__link"
        }
      >
        حساب جديد
      </NavLink>

      <NavLink
        to="/login"
        className={({ isActive }) =>
          isActive
            ? "auth-tabs__link auth-tabs__link--active"
            : "auth-tabs__link"
        }
      >
        دخول
      </NavLink>
    </nav>
  );
}
