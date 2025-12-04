import EditorClient from "@/components/EditorClient";

export default function Page({ params }: any) {
  const siteSlug = params?.siteSlug as string;
  return <EditorClient siteSlug={siteSlug} />;
}
