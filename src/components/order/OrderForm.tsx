"use client";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { identitySchema } from "@/lib/validation";
import VisibilityToggle from "./VisibilityToggle";
import UploadField from "./UploadField";
import type { z } from "zod";

type Identity = z.infer<typeof identitySchema>;

const STEPS = [
  "Verifikasi email",
  "Identitas",
  "Pendidikan",
  "Pengalaman",
  "Proyek",
  "Skill & lainnya",
  "Tampil & review",
] as const;

const VISIBILITY_FIELDS: { key: string; label: string }[] = [
  { key: "full_name", label: "Nama lengkap" },
  { key: "headline", label: "Headline / profesi" },
  { key: "bio", label: "Tentang saya" },
  { key: "date_of_birth", label: "Tanggal lahir" },
  { key: "gender", label: "Jenis kelamin" },
  { key: "nationality", label: "Kewarganegaraan" },
  { key: "location", label: "Kota / lokasi" },
  { key: "photo_url", label: "Foto profil" },
  { key: "email", label: "Email (hati-hati, ini data pribadi)" },
  { key: "phone", label: "Nomor HP (hati-hati, ini data pribadi)" },
  { key: "whatsapp", label: "WhatsApp" },
  { key: "website_url", label: "Website" },
  { key: "linkedin_url", label: "LinkedIn" },
  { key: "github_url", label: "GitHub" },
  { key: "instagram_url", label: "Instagram" },
];

const STATUS_LABELS: Record<string, string> = {
  draft: "Draft — belum selesai diisi",
  preview: "Pratinjau — belum dibayar",
  pending_payment: "Menunggu pembayaran",
  paid: "Lunas",
  domain_pending: "Lunas — menunggu aktivasi domain",
  published: "Aktif",
  expired: "Kedaluwarsa",
  cancelled: "Dibatalkan",
  deleted: "Dihapus",
};

function statusLabel(status: string): string {
  return STATUS_LABELS[status] ?? status;
}

const inputCls = "mt-1 block w-full min-h-[48px] rounded-md border px-3 py-2 text-base";
const labelCls = "block text-sm font-medium";

function emptyListItem(kind: string): Record<string, unknown> {
  if (kind === "education") return { institution: "", degree: "", fieldOfStudy: "", startDate: "", endDate: "", description: "", isVisible: true };
  if (kind === "experiences") return { company: "", position: "", startDate: "", endDate: "", isCurrent: false, description: "", isVisible: true };
  if (kind === "projects") return { title: "", description: "", url: "", imageUrl: "", techStack: [], isVisible: true };
  if (kind === "skills") return { name: "", category: "", level: 3, isVisible: true };
  if (kind === "certifications") return { name: "", issuer: "", issueDate: "", expiryDate: "", credentialId: "", credentialUrl: "", isVisible: true };
  return { title: "", publisher: "", publishedDate: "", url: "", description: "", isVisible: true };
}

export default function OrderForm({ token }: { token: string }) {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<Record<string, unknown> | null>(null);
  const [lists, setLists] = useState<Record<string, Record<string, unknown>[]>>({
    education: [], experiences: [], projects: [], skills: [], certifications: [], publications: [],
  });
  const [visibility, setVisibility] = useState<Record<string, boolean>>({
    full_name: true, headline: true, bio: true, location: true, photo_url: true,
    email: false, phone: false, whatsapp: false,
  });
  const [savedAt, setSavedAt] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [busy, setBusy] = useState(false);

  const identityForm = useForm<Identity>({
    defaultValues: {
      fullName: "", headline: "", bio: "", dateOfBirth: "", gender: undefined,
      nationality: "", address: "", city: "", province: "", postalCode: "",
      phone: "", whatsapp: "", email: "", websiteUrl: "", linkedinUrl: "",
      githubUrl: "", instagramUrl: "", photoUrl: "",
    },
  });

  useEffect(() => {
    (async () => {
      const res = await fetch(`/api/orders/${token}`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Link tidak valid.");
        setLoading(false);
        return;
      }
      setOrder(data.order);
      const p = (data.order?.profile ?? {}) as Record<string, unknown>;
      identityForm.reset({
        fullName: String(p.full_name ?? ""),
        headline: String(p.headline ?? ""),
        bio: String(p.bio ?? ""),
        dateOfBirth: p.date_of_birth ? String(p.date_of_birth).slice(0, 10) : "",
        gender: (p.gender as Identity["gender"]) ?? undefined,
        nationality: String(p.nationality ?? ""),
        address: String(p.address ?? ""),
        city: String(p.city ?? ""),
        province: String(p.province ?? ""),
        postalCode: String(p.postal_code ?? ""),
        phone: String(p.phone ?? ""),
        whatsapp: String(p.whatsapp ?? ""),
        email: String(p.email ?? data.order?.email ?? ""),
        websiteUrl: String(p.website_url ?? ""),
        linkedinUrl: String(p.linkedin_url ?? ""),
        githubUrl: String(p.github_url ?? ""),
        instagramUrl: String(p.instagram_url ?? ""),
        photoUrl: String(p.photo_url ?? ""),
      });
      // Ubah format database (snake_case) ke format form (camelCase)
      const mapList = (rows: Record<string, unknown>[], map: (r: Record<string, unknown>) => Record<string, unknown>) =>
        (rows ?? []).map(map);
      setLists({
        education: mapList(data.lists?.education ?? [], (r) => ({ institution: r.institution, degree: r.degree ?? "", fieldOfStudy: r.field_of_study ?? "", startDate: r.start_date ? String(r.start_date).slice(0, 10) : "", endDate: r.end_date ? String(r.end_date).slice(0, 10) : "", gpa: r.gpa ?? undefined, description: r.description ?? "", isVisible: r.is_visible ?? true })),
        experiences: mapList(data.lists?.experiences ?? [], (r) => ({ company: r.company, position: r.position, startDate: r.start_date ? String(r.start_date).slice(0, 10) : "", endDate: r.end_date ? String(r.end_date).slice(0, 10) : "", isCurrent: r.is_current ?? false, description: r.description ?? "", isVisible: r.is_visible ?? true })),
        projects: mapList(data.lists?.projects ?? [], (r) => ({ title: r.title, description: r.description ?? "", url: r.url ?? "", imageUrl: r.image_url ?? "", techStack: r.tech_stack ?? [], isVisible: r.is_visible ?? true })),
        skills: mapList(data.lists?.skills ?? [], (r) => ({ name: r.name, category: r.category ?? "", level: r.level ?? 3, isVisible: r.is_visible ?? true })),
        certifications: mapList(data.lists?.certifications ?? [], (r) => ({ name: r.name, issuer: r.issuer ?? "", issueDate: r.issue_date ? String(r.issue_date).slice(0, 10) : "", expiryDate: r.expiry_date ? String(r.expiry_date).slice(0, 10) : "", credentialId: r.credential_id ?? "", credentialUrl: r.credential_url ?? "", isVisible: r.is_visible ?? true })),
        publications: mapList(data.lists?.publications ?? [], (r) => ({ title: r.title, publisher: r.publisher ?? "", publishedDate: r.published_date ? String(r.published_date).slice(0, 10) : "", url: r.url ?? "", description: r.description ?? "", isVisible: r.is_visible ?? true })),
      });
      setVisibility((v) => ({ ...v, ...(data.visibility ?? {}) }));
      setLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  async function saveStep(stepName: string, data: unknown): Promise<boolean> {
    setError("");
    const res = await fetch(`/api/orders/${token}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ step: stepName, data }),
    });
    const out = await res.json();
    if (!res.ok) {
      if (out.error === "OTP_REQUIRED") {
        setError(out.message ?? "Perlu OTP dulu.");
        setStep(0);
      } else {
        setError(out.error ?? "Gagal menyimpan.");
      }
      return false;
    }
    setSavedAt(new Date().toLocaleTimeString("id-ID"));
    return true;
  }

  async function verifyEmail() {
    setBusy(true);
    setError("");
    const res = await fetch(`/api/orders/${token}/verify`, { method: "POST" });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) {
      setError(data.error ?? "Verifikasi gagal.");
      return;
    }
    setNotice("Email terverifikasi. Kamu bisa lanjut ke pembayaran setelah pratinjau (Tahap 4).");
    setOrder((o) => (o ? { ...o, email_verified_at: new Date().toISOString() } : o));
  }

  async function requestOtp() {
    const res = await fetch(`/api/orders/${token}/otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "request", purpose: "edit-private" }),
    });
    const data = await res.json();
    if (!res.ok) setError(data.error ?? "Gagal mengirim OTP.");
    else {
      setOtpSent(true);
      setNotice(data.message ?? "Kode OTP dikirim ke email kamu.");
    }
  }

  async function verifyOtp() {
    const res = await fetch(`/api/orders/${token}/otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "verify", purpose: "edit-private", code: otpCode }),
    });
    const data = await res.json();
    if (!res.ok) setError(data.error ?? "OTP salah.");
    else {
      setNotice(data.message ?? "OTP terverifikasi.");
      setOtpSent(false);
    }
  }

  if (loading) return <p className="px-6 py-16 text-center">Memuat pesanan…</p>;
  if (error && !order) return <p className="mx-auto max-w-xl px-6 py-16 text-danger">{error}</p>;

  const verified = Boolean(order?.email_verified_at);
  const progress = Math.round(((step + 1) / STEPS.length) * 100);

  async function nextFromIdentity() {
    const values = identityForm.getValues();
    const parsed = identitySchema.safeParse(values);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Ada data identitas yang tidak valid.");
      return;
    }
    const ok = await saveStep("identity", parsed.data);
    if (ok) setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }

  async function nextFromList(kind: string, apiStep: string) {
    const ok = await saveStep(apiStep, lists[kind] ?? []);
    if (ok) setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }

  function updateList(kind: string, idx: number, patch: Record<string, unknown>) {
    setLists((prev) => ({
      ...prev,
      [kind]: prev[kind].map((item, i) => (i === idx ? { ...item, ...patch } : item)),
    }));
  }

  // Field daftar: `parse` mengubah teks ketikan menjadi nilai
  // yang disimpan (mis. "Figma, HTML" -> ["Figma", "HTML"]),
  // `display` sebaliknya; `disabledWhen` menonaktifkan input
  // (mis. tanggal selesai saat "masih bekerja" dicentang).
  // `extra` merender kontrol tambahan per item (mis. checkbox).
  type ListField = {
    key: string;
    label: string;
    type?: string;
    step?: string;
    min?: string;
    max?: string;
    placeholder?: string;
    parse?: (v: string) => unknown;
    display?: (v: unknown) => string;
    disabledWhen?: (item: Record<string, unknown>) => boolean;
  };

  function renderListEditor(kind: string, apiStep: string, fields: ListField[], title: string, advance = true, extra?: (item: Record<string, unknown>, idx: number) => React.ReactNode) {
    const items = lists[kind] ?? [];
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-bold">{title}</h2>
        <p className="text-sm text-muted">Kosongkan saja kalau belum ada. Bisa ditambah nanti sebelum bayar.</p>
        {items.map((item, idx) => (
          <div key={idx} className="space-y-3 rounded-2xl border p-4">
            {fields.map((f) => (
              <div key={f.key}>
                <label className={labelCls}>{f.label}</label>
                <input
                  type={f.type ?? "text"}
                  step={f.step}
                  min={f.min}
                  max={f.max}
                  placeholder={f.placeholder}
                  disabled={f.disabledWhen?.(item)}
                  value={f.display ? f.display(item[f.key]) : String(item[f.key] ?? "")}
                  onChange={(e) =>
                    updateList(kind, idx, {
                      [f.key]: f.parse
                        ? f.parse(e.target.value)
                        : f.type === "number"
                          ? e.target.value === ""
                            ? undefined
                            : Number(e.target.value)
                          : e.target.value,
                    })
                  }
                  className={`${inputCls} disabled:opacity-40`}
                />
              </div>
            ))}
            {extra ? extra(item, idx) : null}
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={Boolean(item.isVisible)} onChange={(e) => updateList(kind, idx, { isVisible: e.target.checked })} className="h-5 w-5" />
              Tampilkan item ini di portofolio
            </label>
            <button type="button" onClick={() => setLists((p) => ({ ...p, [kind]: p[kind].filter((_, i) => i !== idx) }))} className="text-sm text-danger underline">
              Hapus item ini
            </button>
          </div>
        ))}
        <button type="button" onClick={() => setLists((p) => ({ ...p, [kind]: [...p[kind], emptyListItem(kind)] }))} className="min-h-[48px] w-full rounded-md border border-dashed px-4 py-2 font-medium">
          + Tambah {title.toLowerCase()}
        </button>
        <button type="button" onClick={() => (advance ? nextFromList(kind, apiStep) : saveStep(apiStep, lists[kind] ?? []))} className="min-h-[52px] w-full btn-primary px-4 py-3 font-semibold text-white">
          {advance ? "Simpan & lanjut" : "Simpan bagian ini"}
        </button>
      </div>
    );
  }

  return (
    <main className="mx-auto max-w-2xl px-4 pb-28 pt-6">
      <div className="mb-2 flex items-center justify-between text-sm">
        <span>Langkah {step + 1} dari {STEPS.length}</span>
        <span>{savedAt ? `Tersimpan otomatis ✓ ${savedAt}` : "Draft tersimpan otomatis per langkah"}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-gray-200" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
        <div className="h-full bg-brand-500 transition-all" style={{ width: `${progress}%` }} />
      </div>
      <h1 className="mt-4 text-2xl font-bold">{STEPS[step]}</h1>
      {/* Dashboard klien — halaman ini adalah dashboardnya:
          status pesanan + domain, link situs, edit data (form
          di bawah), ganti template (lewat pratinjau), dan
          hapus data. Tidak ada akun klien. */}
      <section className="mt-4 rounded-2xl border bg-white p-4">
        <h2 className="font-bold">Dashboard pesanan</h2>
        <dl className="mt-3 space-y-1 text-sm">
          <div className="flex justify-between gap-2"><dt className="text-muted">Status</dt><dd className="font-medium">{statusLabel(String(order?.status ?? ""))}</dd></div>
          <div className="flex justify-between gap-2"><dt className="text-muted">Domain</dt><dd className="font-medium">{String(order?.subdomain ?? "")}.portofolio.my.id</dd></div>
          <div className="flex justify-between gap-2"><dt className="text-muted">Template</dt><dd className="font-medium">{String(order?.template_id ?? "")}</dd></div>
          <div className="flex justify-between gap-2"><dt className="text-muted">Harga</dt><dd className="font-medium">Rp{Number(order?.price_snapshot ?? 0).toLocaleString("id-ID")}</dd></div>
        </dl>
        {String(order?.status ?? "") === "published" ? (
          <p className="mt-3 text-sm">Situs kamu sudah aktif: <a className="font-medium text-brand-500 underline" href={`https://${String(order?.subdomain ?? "")}.portofolio.my.id`}>{String(order?.subdomain ?? "")}.portofolio.my.id</a></p>
        ) : (
          <p className="mt-3 text-sm text-muted">Situs belum aktif — {String(order?.status ?? "") === "domain_pending" ? "pembayaran lunas, admin sedang mengaktifkan domain (maks. 1x24 jam)." : "selesaikan form, pratinjau, dan pembayaran dulu."}</p>
        )}
        <div className="mt-3 flex flex-wrap gap-2">
          <a href={`/pesanan/${token}/status`} className="min-h-[44px] rounded-md border px-3 py-2 text-sm font-medium">Lihat status</a>
          <a href={`/pesanan/${token}/preview`} className="min-h-[44px] rounded-md border px-3 py-2 text-sm font-medium">Pratinjau &amp; ganti template</a>
        </div>
        <div className="mt-4 border-t pt-3">
          <p className="text-sm font-medium">Ekspor data saya (JSON)</p>
          <p className="mt-1 text-xs text-muted">Unduh seluruh data kamu. Butuh OTP email dulu (pakai tombol OTP di Langkah 1) — OTP berlaku 15 menit.</p>
          <button
            type="button"
            onClick={async () => {
              setError("");
              const res = await fetch(`/api/orders/${token}/export`, { method: "POST" });
              if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                if (data.error === "OTP_REQUIRED") {
                  setError(data.message ?? "Perlu OTP dulu.");
                  setStep(0);
                } else {
                  setError(data.error ?? "Gagal mengekspor data.");
                }
                return;
              }
              const blob = await res.blob();
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = `data-portofolio-${String(order?.subdomain ?? "klien")}.json`;
              a.click();
              URL.revokeObjectURL(url);
              setNotice("Data kamu sudah diunduh.");
            }}
            className="mt-2 min-h-[44px] rounded-md border px-3 py-2 text-sm font-medium"
          >
            Unduh data saya (JSON)
          </button>
        </div>
        <div className="mt-4 border-t pt-3">
          <p className="text-sm font-medium">Hapus data saya</p>
          <p className="mt-1 text-xs text-muted">Menghapus semua data secara permanen. Link konfirmasi dikirim ke email kamu — data tidak terhapus sebelum link itu dibuka dan dikonfirmasi.</p>
          <button
            type="button"
            disabled={busy}
            onClick={async () => {
              setBusy(true);
              setError("");
              const res = await fetch(`/api/orders/${token}/delete-request`, { method: "POST" });
              const data = await res.json();
              setBusy(false);
              if (!res.ok) setError(data.error ?? "Gagal meminta hapus data.");
              else setNotice(data.message ?? "Link konfirmasi dikirim ke email kamu.");
            }}
            className="mt-2 min-h-[44px] rounded-md border border-red-300 px-3 py-2 text-sm font-medium text-danger disabled:opacity-50"
          >
            {busy ? "Mengirim…" : "Hapus data saya"}
          </button>
        </div>
        {order?.draft_expires_at ? <p className="mt-3 text-xs text-muted">Draft kedaluwarsa {new Date(String(order.draft_expires_at)).toLocaleDateString("id-ID")}</p> : null}
      </section>

      {error ? <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-danger">{error}</p> : null}
      {notice ? <p className="mt-4 rounded-xl bg-green-50 p-3 text-sm text-success">{notice}</p> : null}

      {step === 0 && (
        <div className="mt-6 space-y-4">
          <div className={`rounded-2xl border p-4 ${verified ? "bg-green-50" : "bg-yellow-50"}`}>
            <p className="font-semibold">{verified ? "Email sudah terverifikasi ✓" : "Email belum terverifikasi"}</p>
            <p className="mt-1 text-sm">Kamu membuka halaman ini lewat link yang dikirim ke email <strong>{String(order?.email ?? "")}</strong>. Tekan tombol di bawah untuk menandai email terverifikasi. Tanpa verifikasi ini, pesanan tidak bisa lanjut ke pembayaran.</p>
          </div>
          {!verified && (
            <button type="button" onClick={verifyEmail} disabled={busy} className="min-h-[52px] w-full btn-primary px-4 py-3 font-semibold text-white disabled:opacity-50">
              {busy ? "Memverifikasi…" : "Verifikasi email saya"}
            </button>
          )}
          <div className="rounded-2xl border p-4">
            <h2 className="font-semibold">Kode OTP — untuk ubah data pribadi (bukan verifikasi email)</h2>
            <p className="mt-1 text-sm text-muted"><strong>Kode ini tidak memverifikasi email.</strong> Email diverifikasi dengan tombol biru di atas. Kode ini hanya dipakai kalau kamu mengubah data pribadi nanti (email, nomor HP, WhatsApp, alamat, atau tanggal lahir) setelah data pertama terisi — kode 6 digit dikirim ke email kamu, berlaku 10 menit, maks 5 kali coba.</p>
            <div className="mt-3 flex gap-2">
              <button type="button" onClick={requestOtp} className="min-h-[48px] flex-1 rounded-md border px-4 py-2 font-medium">Kirim kode OTP</button>
              <input value={otpCode} onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, "").slice(0, 6))} placeholder="123456" inputMode="numeric" className="min-h-[48px] w-32 rounded-md border px-3 text-center text-lg tracking-widest" />
              <button type="button" onClick={verifyOtp} disabled={!otpSent && otpCode.length !== 6} className="min-h-[48px] rounded-md bg-gray-900 px-4 py-2 font-medium text-white disabled:opacity-50">Verifikasi OTP</button>
            </div>
          </div>
          <button type="button" onClick={() => setStep(1)} className="min-h-[52px] w-full btn-primary px-4 py-3 font-semibold text-white">Lanjut ke identitas</button>
        </div>
      )}

      {step === 1 && (
        <form className="mt-6 space-y-4" onSubmit={(e) => { e.preventDefault(); nextFromIdentity(); }}>
          <div>
            <label className={labelCls}>Nama lengkap *</label>
            <input {...identityForm.register("fullName")} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Headline / profesi</label>
            <input {...identityForm.register("headline")} placeholder="Contoh: Fullstack Web Developer" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Tentang saya</label>
            <textarea {...identityForm.register("bio")} rows={4} className={inputCls} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Tanggal lahir</label>
              <input type="date" {...identityForm.register("dateOfBirth")} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Jenis kelamin</label>
              <select {...identityForm.register("gender")} className={inputCls}>
                <option value="">Pilih…</option>
                <option value="laki-laki">Laki-laki</option>
                <option value="perempuan">Perempuan</option>
                <option value="lainnya">Lainnya</option>
                <option value="tidak-ingin-menjawab">Tidak ingin menjawab</option>
              </select>
            </div>
          </div>
          <div>
            <label className={labelCls}>Kewarganegaraan</label>
            <input {...identityForm.register("nationality")} placeholder="Indonesia" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Alamat lengkap</label>
            <textarea {...identityForm.register("address")} rows={2} placeholder="Jalan, nomor rumah, RT/RW" className={inputCls} />
            <p className="mt-1 text-xs text-muted">Alamat tidak pernah tampil di portofolio publik, apa pun pengaturan tampilnya.</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className={labelCls}>Kota</label><input {...identityForm.register("city")} className={inputCls} /></div>
            <div><label className={labelCls}>Provinsi</label><input {...identityForm.register("province")} className={inputCls} /></div>
          </div>
          <div>
            <label className={labelCls}>Kode pos</label>
            <input {...identityForm.register("postalCode")} inputMode="numeric" className={inputCls} />
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div><label className={labelCls}>Nomor HP</label><input {...identityForm.register("phone")} inputMode="tel" placeholder="0812xxxx" className={inputCls} /></div>
            <div><label className={labelCls}>WhatsApp</label><input {...identityForm.register("whatsapp")} inputMode="tel" className={inputCls} /></div>
          </div>
          <div>
            <label className={labelCls}>Email *</label>
            <input type="email" {...identityForm.register("email")} className={inputCls} />
          </div>
          <UploadField token={token} label="Foto profil" currentUrl={identityForm.watch("photoUrl")} onUploaded={(url) => identityForm.setValue("photoUrl", url)} />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div><label className={labelCls}>Website</label><input {...identityForm.register("websiteUrl")} placeholder="https://…" className={inputCls} /></div>
            <div><label className={labelCls}>LinkedIn</label><input {...identityForm.register("linkedinUrl")} placeholder="https://…" className={inputCls} /></div>
            <div><label className={labelCls}>GitHub</label><input {...identityForm.register("githubUrl")} placeholder="https://…" className={inputCls} /></div>
            <div><label className={labelCls}>Instagram</label><input {...identityForm.register("instagramUrl")} placeholder="https://…" className={inputCls} /></div>
          </div>
          <button type="submit" className="min-h-[52px] w-full btn-primary px-4 py-3 font-semibold text-white">Simpan & lanjut</button>
        </form>
      )}

      {step === 2 && renderListEditor("education", "education", [
        { key: "institution", label: "Institusi / sekolah / kampus *" },
        { key: "degree", label: "Gelar / jenjang" },
        { key: "fieldOfStudy", label: "Bidang studi" },
        { key: "gpa", label: "IPK (0–4, boleh kosong)", type: "number", step: "0.01", min: "0", max: "4" },
        { key: "startDate", label: "Tanggal mulai", type: "date" },
        { key: "endDate", label: "Tanggal selesai", type: "date" },
        { key: "description", label: "Keterangan" },
      ], "Pendidikan")}

      {step === 3 && renderListEditor("experiences", "experiences", [
        { key: "company", label: "Perusahaan *" },
        { key: "position", label: "Posisi *" },
        { key: "startDate", label: "Tanggal mulai", type: "date" },
        { key: "endDate", label: "Tanggal selesai", type: "date", disabledWhen: (item) => Boolean(item.isCurrent) },
        { key: "description", label: "Deskripsi pekerjaan" },
      ], "Pengalaman", true, (item, idx) => (
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={Boolean(item.isCurrent)}
            onChange={(e) =>
              updateList("experiences", idx, e.target.checked ? { isCurrent: true, endDate: "" } : { isCurrent: false })
            }
            className="h-5 w-5"
          />
          Saya masih bekerja di sini (tampil sebagai “Sekarang”)
        </label>
      ))}

      {step === 4 && (
        <div className="mt-6">
          {renderListEditor("projects", "projects", [
            { key: "title", label: "Judul proyek *" },
            { key: "description", label: "Deskripsi" },
            { key: "url", label: "URL proyek" },
            { key: "imageUrl", label: "URL gambar proyek (opsional)" },
            {
              key: "techStack",
              label: "Teknologi (pisah dengan koma, contoh: Figma, HTML, CSS)",
              placeholder: "Figma, HTML, CSS",
              parse: (v: string) => v.split(",").map((s) => s.trim()).filter(Boolean),
              display: (v: unknown) => (Array.isArray(v) ? (v as string[]).join(", ") : String(v ?? "")),
            },
          ], "Proyek")}
          <p className="mt-3 text-sm text-muted">Gambar proyek: upload lewat tombol di bawah, lalu tempel URL hasil upload ke kolom gambar di item proyek (atau isi langsung URL gambar yang sudah ada).</p>
          <div className="mt-3">
            <UploadField token={token} label="Gambar proyek" onUploaded={(url) => setNotice(`Gambar ter-upload: ${url}. Tempel URL ini ke kolom gambar proyek. ` + url)} />
          </div>
        </div>
      )}

      {step === 5 && (
        <div className="mt-6 space-y-8">
          {renderListEditor("skills", "skills", [
            { key: "name", label: "Nama skill *" },
            { key: "category", label: "Kategori" },
            { key: "level", label: "Level (1-5)", type: "number" },
          ], "Skill", false)}
          {renderListEditor("certifications", "certifications", [
            { key: "name", label: "Nama sertifikasi *" },
            { key: "issuer", label: "Penerbit" },
            { key: "issueDate", label: "Tanggal terbit", type: "date" },
            { key: "credentialId", label: "ID kredensial" },
          ], "Sertifikasi", false)}
          {renderListEditor("publications", "publications", [
            { key: "title", label: "Judul publikasi *" },
            { key: "publisher", label: "Penerbit" },
            { key: "publishedDate", label: "Tanggal terbit", type: "date" },
            { key: "url", label: "URL" },
          ], "Publikasi", false)}
          <button
            type="button"
            onClick={async () => {
              const a = await saveStep("skills", lists.skills ?? []);
              const b = await saveStep("certifications", lists.certifications ?? []);
              const c = await saveStep("publications", lists.publications ?? []);
              if (a && b && c) setStep(6);
            }}
            className="min-h-[52px] w-full btn-primary px-4 py-3 font-semibold text-white"
          >
            Simpan semua & lanjut ke tampil & review
          </button>
        </div>
      )}

      {step === 6 && (
        <div className="mt-6 space-y-4">
          <h2 className="text-xl font-bold">Pilih yang tampil di portofolio</h2>
          <p className="text-sm text-muted">Matikan toggle untuk data yang tidak mau kamu tampilkan. Email dan nomor HP secara default mati — nyalakan hanya kalau kamu memang mau orang lain bisa menghubungimu lewat situ.</p>
          <div className="space-y-2">
            {VISIBILITY_FIELDS.map((f) => (
              <VisibilityToggle key={f.key} label={f.label} checked={visibility[f.key] ?? (f.key === "email" || f.key === "phone" || f.key === "whatsapp" ? false : true)} onChange={(v) => setVisibility((prev) => ({ ...prev, [f.key]: v }))} />
            ))}
          </div>
          <button
            type="button"
            onClick={async () => {
              const ok = await saveStep("visibility", visibility);
              if (ok) setNotice("Preferensi tampil tersimpan. Langkah berikutnya (Tahap 4): lihat pratinjau berwatermark, lalu lanjut ke pembayaran.");
            }}
            className="min-h-[52px] w-full btn-primary px-4 py-3 font-semibold text-white"
          >
            Simpan preferensi
          </button>
          <button
            type="button"
            onClick={async () => {
              // Submit pratinjau: draft -> preview (Tahap 4),
              // lalu buka /preview/[orderId]?token=...
              setError("");
              const res = await fetch(`/api/orders/${token}/preview`, { method: "POST" });
              const out = await res.json();
              if (!res.ok) {
                setError(out.error ?? "Gagal membuat pratinjau.");
                return;
              }
              window.location.href = `/preview/${out.orderId}?token=${token}`;
            }}
            className="block min-h-[52px] w-full rounded-md border px-4 py-3 text-center font-semibold"
          >
            Lihat pratinjau
          </button>
          <p className="text-sm text-muted">
            Status email: {verified ? "terverifikasi ✓" : "belum terverifikasi — selesaikan Langkah 1 dulu"}.
            Pembayaran baru bisa dilanjutkan setelah email terverifikasi dan pratinjau selesai dirender (Tahap 4-5).
          </p>
        </div>
      )}

      <div className="fixed inset-x-0 bottom-0 border-t bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-2xl gap-2 px-4 py-3">
          <button type="button" disabled={step === 0} onClick={() => setStep((s) => Math.max(s - 1, 0))} className="min-h-[48px] flex-1 rounded-md border px-4 py-2 font-medium disabled:opacity-40">
            ← Kembali
          </button>
          <button type="button" disabled={step >= STEPS.length - 1} onClick={() => setStep((s) => Math.min(s + 1, STEPS.length - 1))} className="min-h-[48px] flex-1 rounded-md bg-gray-900 px-4 py-2 font-medium text-white disabled:opacity-40">
            Lanjut →
          </button>
        </div>
      </div>
    </main>
  );
}
