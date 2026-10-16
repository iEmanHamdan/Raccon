// The left side of the form witch have the animation of the nfc sacn and the context
export default function AuthPromo({ scene }) {
  return (
    <div className="auth-promo">
      {/* NFC Illustration */}
      <div className="auth-promo__scene">{scene}</div>

      {/* Promotional Text */}
      <div className="auth-promo__content">
        <h2 className="auth-promo__title">
          كل قطعة
          <br />
          تحكي حكاية.
        </h2>

        <p className="auth-promo__description">
          جهّز رحلة البحث، شاركها مع ضيوفك، وتابع مين الأول على طول.
        </p>
      </div>

      {/* Decorative Stripes */}
      <div className="auth-promo__pattern" aria-hidden="true" />
    </div>
  );
}
