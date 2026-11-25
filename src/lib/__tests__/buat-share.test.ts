// Tes alur berbagi (/buat): magic bytes PDF dan pemetaan
// nomor telepon/WhatsApp dari draft ke PortfolioData.
import { describe, expect, it } from "vitest";
import { validatePdfMagicBytes } from "../sanitize";
import { draftToPortfolioData, emptyBuatDraft, normalizeBuatDraft } from "../buat";

describe("validatePdfMagicBytes", () => {
  it("PDF asli (diawali %PDF) lolos", () => {
    const pdf = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x34]);
    expect(validatePdfMagicBytes(pdf)).toBeNull();
  });

  it("byte acak ditolak", () => {
    const acak = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
    expect(validatePdfMagicBytes(acak)).not.toBeNull();
  });

  it("teks biasa dan file kosong ditolak", () => {
    const teks = new TextEncoder().encode("Halo, ini bukan PDF.");
    expect(validatePdfMagicBytes(teks)).not.toBeNull();
    expect(validatePdfMagicBytes(new Uint8Array([]))).not.toBeNull();
  });

  it("awalan %PDF yang terpotong ditolak", () => {
    expect(validatePdfMagicBytes(new Uint8Array([0x25, 0x50, 0x44]))).not.toBeNull();
  });
});

describe("draftToPortfolioData: phone & whatsapp", () => {
  it("memetakan phone dan whatsapp dari draft, email tetap null", () => {
    const data = draftToPortfolioData(
      {
        ...emptyBuatDraft(),
        fullName: "John Alex",
        phone: "081234567890",
        whatsapp: "6281234567890",
      },
      "minimalis"
    );
    expect(data.phone).toBe("081234567890");
    expect(data.whatsapp).toBe("6281234567890");
    expect(data.email).toBeNull();
  });

  it("kosong / hanya spasi jadi null", () => {
    const data = draftToPortfolioData(
      { ...emptyBuatDraft(), fullName: "Budi", phone: "   ", whatsapp: "" },
      "minimalis"
    );
    expect(data.phone).toBeNull();
    expect(data.whatsapp).toBeNull();
  });
});

describe("normalizeBuatDraft", () => {
  it("menerima draft valid dan melengkapi field yang hilang", () => {
    const hasil = normalizeBuatDraft({ fullName: "John Alex" });
    expect(hasil).not.toBeNull();
    expect(hasil?.fullName).toBe("John Alex");
    expect(hasil?.education).toEqual([]);
    expect(hasil?.templateId).toBeNull();
  });

  it("menolak draft tanpa nama / nama terlalu pendek", () => {
    expect(normalizeBuatDraft({ fullName: "" })).toBeNull();
    expect(normalizeBuatDraft({ fullName: "D" })).toBeNull();
    expect(normalizeBuatDraft(null)).toBeNull();
    expect(normalizeBuatDraft("bukan-objek")).toBeNull();
  });

  it("menormalisasi URL tanpa protokol (menambah https://)", () => {
    const hasil = normalizeBuatDraft({
      ...emptyBuatDraft(),
      fullName: "John Alex",
      websiteUrl: "johnalex.example.com",
    });
    expect(hasil?.websiteUrl).toBe("https://johnalex.example.com");
  });
});
