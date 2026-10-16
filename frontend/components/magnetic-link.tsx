"use client";
import { useRef } from "react";
import Link from "next/link";
export default function MagneticLink({
  href,
  children,
  className = "",
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLAnchorElement>(null);
  return (
    <Link
      href={href}
      ref={ref}
      className={`button magnetic ${className}`}
      onPointerMove={(e) => {
        if (
          e.pointerType !== "mouse" ||
          matchMedia("(prefers-reduced-motion: reduce)").matches
        )
          return;
        const box = e.currentTarget.getBoundingClientRect();
        e.currentTarget.style.transform = `translate(${(e.clientX - box.left - box.width / 2) * 0.07}px, ${(e.clientY - box.top - box.height / 2) * 0.12}px)`;
      }}
      onPointerLeave={() => {
        if (ref.current) ref.current.style.transform = "";
      }}
    >
      {children}
    </Link>
  );
}
