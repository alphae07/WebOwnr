export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children} {/* No global header/footer */}
      </body>
    </html>
  );
}
