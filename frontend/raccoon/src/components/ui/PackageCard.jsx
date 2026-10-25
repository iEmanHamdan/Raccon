import Chip from "./Chip";
import Button from "./Button";
import Mark from "../../assets/Mark.png";

//pkg: package info[title, mode,  description, price, cover], ended: out of stock or not, onDetails: function take the id after click on the "التفاصيل" button, onNotify: if available Inform me
export default function PackageCard({
  pkg,
  ended = false,
  onDetails,
  onNotify,
}) {
  const modeLabel = pkg.mode === "sequential" ? "تسلسلي" : "صيد مفتوح";
  const modeTone = pkg.mode === "sequential" ? "accent" : "dark";

  function handleAction() {
    if (ended) {
      onNotify?.(pkg.id);
      return;
    }

    onDetails(pkg.id);
  }

  return (
    <article className={`package-card ${ended ? "package-card--ended" : ""}`}>
      <div
        className={`package-card__cover package-card__cover--${
          pkg.coverTone || "mint"
        }`}
      >
        {pkg.cover ? (
          <img className="package-card__image" src={pkg.cover} alt="" />
        ) : (
          <div className="package-card__art" aria-hidden="true">
            <i />
            <i />
            <i />
            <i />
            <i />

            <span
              style={{
                maskImage: `url(${Mark})`,
                WebkitMaskImage: `url(${Mark})`,
              }}
            />
          </div>
        )}

        <div className="package-card__mode">
          <Chip tone={modeTone}>{modeLabel}</Chip>
        </div>

        {ended && (
          <div className="package-card__ended">
            <Chip tone="error">نفدت</Chip>
          </div>
        )}
      </div>

      <div className="package-card__body">
        <h2>{pkg.title}</h2>

        <p className="package-card__description">{pkg.description}</p>

        <p className="package-card__meta">{pkg.meta}</p>

        <div className="package-card__footer">
          <strong className="package-card__price">
            {pkg.price} <span aria-label="ريال سعودي">ر.س</span>
          </strong>

          <Button
            variant="outline"
            disabled={ended && !onNotify}
            onClick={handleAction}
          >
            {ended ? "نبّهني إذا توفّر" : "التفاصيل"}
          </Button>
        </div>
      </div>
    </article>
  );
}
