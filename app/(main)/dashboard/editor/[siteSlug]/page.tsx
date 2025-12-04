// app/dashboard/editor/[siteSlug]/page.tsx
import EditorClient from "@/components/EditorClient";

export default function Page({ params }: any) {
  const { siteSlug } = params;
  // Keep page as a server component and hand the slug down to the client component
  return <EditorClient siteSlug={siteSlug} />;
}
