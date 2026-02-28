import Link from "next/link";
import Image from "next/image";
import styles from "./BrandLogo.module.css";

const BrandLogo = ({ href = "/", variant = "header", compact = false, className = "" }) => {
  const variantClass = variant === "dark" ? styles.dark : styles.header;
  const compactClass = compact ? styles.compact : "";
  const classes = [styles.root, variantClass, compactClass, className].filter(Boolean).join(" ");

  return (
    <Link className={classes} href={href} aria-label="Vitamind">
      <span className={styles.frame} aria-hidden="true">
        <Image
          className={`${styles.brand} ${styles.brandNight}`}
          src="/assets/imgs/template/vitamind-night.svg"
          alt=""
          width={473}
          height={87}
        />
        <Image
          className={`${styles.brand} ${styles.brandDay}`}
          src="/assets/imgs/template/vitamind-day.svg"
          alt=""
          width={473}
          height={87}
        />
      </span>
    </Link>
  );
};

export { BrandLogo };
