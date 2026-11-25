import { notFound } from "next/navigation";
import Link from "next/link";
import { getTemplate, TEMPLATE_LIST } from "@/lib/templates/registry";
import { demoPortfolio } from "@/lib/templates/demo-data";

// /demo/[template] — bandingkan kelima template dengan
// data contoh yang SAMA (persona fiktif John Alex). Bukan data asli
// klien, dan tidak butuh login.
export default function DemoPage({ params }: { params: { template: string } }) {
  const meta = getTemplate(params.template);
  if (!meta) notFound();
  const { Component } = meta;
  const data = { ...demoPortfolio, template_id: meta.id, template_name: meta.name };

  return (
    <div>
      <nav className="sticky top-0 z-40 border-b bg-white/95 px-4 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-2">
          <span className="mr-2 rounded-full bg-yellow-100 px-3 py-1 text-xs font-bold">DEMO — data contoh</span>
          {TEMPLATE_LIST.map((t) => (
            <Link
              key={t.id}
              href={`/demo/${t.id}`}
              aria-current={t.id === meta.id ? "page" : undefined}
              className={`rounded-full px-3 py-2 text-sm font-medium ${t.id === meta.id ? "bg-gray-900 text-white" : "bg-gray-100 hover:bg-gray-200"}`}
            >
              {t.name}
            </Link>
          ))}
          <Link href="/" className="ml-auto text-sm font-medium text-brand-500 underline">
            ← Pesan template ini
          </Link>
        </div>
        <p className="mx-auto mt-2 max-w-5xl text-xs text-muted">{meta.description} Data contoh: John Alex, Fullstack Web Developer.</p>
      </nav>
      <Component data={data} />
    </div>
  );
}
