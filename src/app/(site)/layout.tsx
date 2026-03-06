import { TopBar, Header, Footer } from "@/components/layout";
import "../globals.css";

interface SiteLayoutProps {
  children: React.ReactNode;
}

export default function SiteLayout({ children }: SiteLayoutProps) {
  return (
    <>
      <TopBar promoText="Скидка 10% на первый вывоз!" />
      <Header />
      <main>{children}</main>
      <Footer />
    </>
  );
}
