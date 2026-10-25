import { Link, NavLink } from "react-router-dom";

export default function Navbar({ logo, items, account }) {
  return (
    <header className="rac-navbar" dir="rtl">
      <Link
        to="/home"
        className="rac-navbar__brand"
        aria-label="راكون — الرئيسية"
      >
        <img src={logo} alt="" />
      </Link>

      <nav className="rac-navbar__links" aria-label="التنقل الرئيسي">
        {items.map((item) =>
          item.disabled ? (
            <span
              key={item.to}
              className="rac-navbar__link rac-navbar__link--disabled"
              aria-disabled="true"
              title="قريبًا"
            >
              {item.label}
            </span>
          ) : (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `rac-navbar__link ${isActive ? "rac-navbar__link--active" : ""}`
              }
            >
              {item.label}
            </NavLink>
          ),
        )}
      </nav>

      <div className="rac-navbar__account">{account}</div>
    </header>
  );
}
