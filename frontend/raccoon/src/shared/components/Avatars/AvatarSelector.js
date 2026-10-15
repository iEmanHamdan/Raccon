import { avatars } from "./avatars";
import styles from "./Avatar.module.css";

export default function AvatarSelector({ selectedAvatar, onSelect }) {
  return (
    <div>
      <label>اختر شخصيتك</label>

      <div
        className={styles.avatarOptions}
        role="group"
        aria-label="اختر شخصيتك"
      >
        {avatars.map((avatar) => (
          <button
            key={avatar.id}
            type="button"
            className={styles.avatar}
            aria-pressed={selectedAvatar === avatar.image}
            onClick={() => onSelect(avatar.image)}
          >
            <div className={styles.imageBox}>
              <img src={avatar.image} alt={avatar.name} />

              {selectedAvatar === avatar.image && (
                <span className={styles.check}>✓</span>
              )}
            </div>

            <span>{avatar.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
