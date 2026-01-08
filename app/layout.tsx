import "./globals.css";
import GoogleAnalytics from "@/components/analytics/GoogleAnalytics";
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <GoogleAnalytics />
        {children}
      </body>
    </html>
  );
}
