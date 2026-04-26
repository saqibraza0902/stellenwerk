import { notFound } from "next/navigation";

export default async function CityPage({
  params,
}: {
  params: { slug: string; jobSlug: string };
}) {
  const { slug, jobSlug } = await params;
  console.log("Logs here==>", slug, jobSlug);
  const res = await fetch(
    `https://www.stellenwerk.de/${slug.toLowerCase()}/${jobSlug}`,
    {
      cache: "no-store",
    },
  );

  if (!res.ok) return notFound();

  const html = await res.text();

  return (
    <div className="p-6">
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
}
