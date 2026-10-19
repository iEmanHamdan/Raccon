import { avatars } from "./avatars";
import styles from "./Avatar.module.css";

export default function ProfileAvatar({ src, size = 45 }) {
  return (
    <img
      src={src || avatars[0].image}
      alt="الصورة الشخصية"
      className={styles.profileAvatar}
      style={{
        width: size,
        height: size,
      }}
    />
  );
}
