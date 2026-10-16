export default function CoreFallback() {
  return (
    <svg
      className="core-fallback"
      viewBox="0 0 600 600"
      role="img"
      aria-label="AEGIS Core precision assembly, static rendering"
    >
      <defs>
        <linearGradient id="metal" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#93979c" />
          <stop offset=".2" stopColor="#17191d" />
          <stop offset=".6" stopColor="#50545a" />
          <stop offset="1" stopColor="#090a0c" />
        </linearGradient>
      </defs>
      <g transform="translate(300 300) rotate(-28)">
        <ellipse
          rx="215"
          ry="200"
          fill="none"
          stroke="url(#metal)"
          strokeWidth="40"
        />
        <ellipse
          rx="160"
          ry="90"
          fill="none"
          stroke="url(#metal)"
          strokeWidth="30"
          transform="rotate(65)"
        />
        <ellipse
          rx="135"
          ry="130"
          fill="none"
          stroke="#c6ff00"
          strokeWidth="2"
        />
        <path
          d="M0-95 85-20 55 80-55 80-85-20Z"
          fill="url(#metal)"
          stroke="#6d7179"
          strokeWidth="2"
        />
        <path
          d="M0-95V20L55 80M0 20-85-20M0 20 85-20M0 20-55 80"
          fill="none"
          stroke="#96999f"
          strokeWidth="1"
        />
        {Array.from({ length: 12 }, (_, i) => (
          <path
            key={i}
            d="M0-199v-21"
            stroke="#9b9e9f"
            strokeWidth="3"
            transform={`rotate(${i * 30})`}
          />
        ))}
      </g>
    </svg>
  );
}
