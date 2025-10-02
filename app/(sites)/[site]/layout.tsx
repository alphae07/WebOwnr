export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    
      <div>
        {children} {/* No global header/footer */}
      </div>
    
  );
}
