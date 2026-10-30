// lib/generate-pdf.ts
import html2canvasPro from "html2canvas-pro";
import jsPDF from "jspdf";

export async function downloadAnalysisAsPDF(
  elementId: string,
  filename: string = "Hasil-Analisis-CV.pdf"
) {
  const element = document.getElementById(elementId);
  if (!element) return;

  // Tanggal cetak format Indonesia
  const currentDate = new Date().toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  // Render canvas menggunakan html2canvas-pro
  const canvas = await html2canvasPro(element, {
    scale: 2,
    useCORS: true,
    backgroundColor: "#020617", // slate-950
    onclone: (clonedDoc) => {
      const container = clonedDoc.getElementById(elementId);
      if (!container) return;

      // 1. TAMBAHKAN HEADER CUSTOM
      const header = clonedDoc.createElement("div");
      header.style.cssText = `
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding-bottom: 16px;
        margin-bottom: 24px;
        border-bottom: 1px solid #334155;
        font-family: ui-sans-serif, system-ui, sans-serif;
      `;
      header.innerHTML = `
        <div style="display: flex; align-items: center; gap: 8px;">
          <div style="width: 24px; height: 24px; background-color: #6366f1; border-radius: 6px; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 12px;">
            CV
          </div>
          <span style="font-weight: 700; font-size: 16px; color: #f8fafc; letter-spacing: -0.025em;">
            CV Matcher AI
          </span>
        </div>
        <span style="font-size: 11px; color: #94a3b8; font-family: monospace;">
          Tanggal Dibuat: ${currentDate}
        </span>
      `;
      container.insertBefore(header, container.firstChild);

      // 2. TAMBAHKAN WATERMARK DI BACKGROUND
      const watermark = clonedDoc.createElement("div");
      watermark.style.cssText = `
        position: absolute;
        top: 40%;
        left: 50%;
        transform: translate(-50%, -50%) rotate(-30deg);
        font-size: 72px;
        font-weight: 900;
        color: rgba(255, 255, 255, 0.03);
        letter-spacing: 0.1em;
        pointer-events: none;
        user-select: none;
        white-space: nowrap;
        text-transform: uppercase;
        font-family: ui-sans-serif, system-ui, sans-serif;
      `;
      watermark.innerText = "CONFIDENTIAL REPORT";
      container.style.position = "relative";
      container.appendChild(watermark);

      // 3. TAMBAHKAN FOOTER CUSTOM
      const footer = clonedDoc.createElement("div");
      footer.style.cssText = `
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding-top: 16px;
        margin-top: 32px;
        border-top: 1px solid #334155;
        font-size: 10px;
        color: #64748b;
        font-family: monospace;
      `;
      footer.innerHTML = `
        <span>Laporan Analisis Otomatis - CV & Job Description Matcher</span>
        <span>Halaman 1</span>
      `;
      container.appendChild(footer);
    },
  });

  // Pembuatan PDF menggunakan jsPDF
  const imgData = canvas.toDataURL("image/jpeg", 0.98);
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const imgWidth = 210; // Lebar A4 (mm)
  const pageHeight = 297; // Tinggi A4 (mm)
  const imgHeight = (canvas.height * imgWidth) / canvas.width;
  let heightLeft = imgHeight;
  let position = 0;

  pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);
  heightLeft -= pageHeight;

  while (heightLeft >= 0) {
    position = heightLeft - imgHeight;
    pdf.addPage();
    pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
  }

  pdf.save(filename);
}