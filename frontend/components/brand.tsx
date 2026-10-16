import Link from "next/link";
export default function Brand() {
  return (
    <Link className="brand" href="/" aria-label="AEGIS-X home">
      <svg
        viewBox="0 0 32 32"
        width="30"
        height="30"
        fill="none"
        aria-hidden="true"
      >
        <path d="M3 26 14 5h6l9 21h-7L17 13l-7 13H3Z" fill="currentColor" />
        <path d="M12 23h9l2 4H10l2-4Z" fill="currentColor" />
      </svg>
      <span>
        AEGIS<span className="brand-x">—X</span>
        <small>SECURITY, ENGINEERED.</small>
      </span>
    </Link>
  );
}
