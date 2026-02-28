import Link from "next/link";
import Image from "next/image";
import styles from "./BrandLogo.module.css";

const BrandLogo = ({ href = "/", variant = "header", compact = false, className = "" }) => {
  const variantClass = variant === "dark" ? styles.dark : styles.header;
  const compactClass = compact ? styles.compact : "";
  const classes = [styles.root, variantClass, compactClass, className].filter(Boolean).join(" ");

  return (
    <Link className={classes} href={href} aria-label="Vitamind">
      <Image
        className={styles.mark}
        src="/assets/imgs/template/LOGO FAVICON_LARGE.png"
        alt="Vitamind"
        width={36}
        height={36}
      />
      <span className={styles.wordmark}>
        <span className={styles.title}>Vitamind</span>
        <span className={styles.subtitle}>Blog cong nghe</span>
      </span>
    </Link>
  );
};

export { BrandLogo };
