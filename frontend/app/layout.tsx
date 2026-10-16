import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/components/providers";
export const metadata:Metadata={title:"AEGIS-X — Intelligence Beyond Threats",description:"Evidence-driven security operations. Synthetic telemetry. Real detection."};
export default function Layout({children}:{children:React.ReactNode}) {return <html lang="en"><body><Providers>{children}</Providers></body></html>}
