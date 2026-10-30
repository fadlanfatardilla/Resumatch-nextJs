// lib/generate-pdf.ts
import html2canvasPro from "html2canvas-pro";
import jsPDF from "jspdf";

export async function generatePDFDataUrl(elementId: string): Promise<string | null> {
  const element = document.getElementById(elementId);
  if (!element) return null;

  const currentDate = new Date().toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const canvas = await html2canvasPro(element, {
    scale: 2,
    useCORS: true,
    backgroundColor: "#020617",
    onclone: (clonedDoc) => {
      const container = clonedDoc.getElementById(elementId);
      if (!container) return;

      // Sembunyikan elemen interaktif yang tidak perlu dicetak ke PDF (seperti Mock Interview Simulator)
      const interactiveElements = container.querySelectorAll('.hide-on-pdf');
      interactiveElements.forEach((el) => {
        (el as HTMLElement).style.display = 'none';
      });

      // 1. HEADER DENGAN LOGO EXPLICIT RESUMATCH.AI
      const header = clonedDoc.createElement("div");
      header.style.cssText = `
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding-bottom: 16px;
        margin-bottom: 24px;
        border-bottom: 1px solid #334155;
        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      `;

      const botIconSvg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 8V4H8"/>
          <rect width="16" height="12" x="4" y="8" rx="2"/>
          <path d="M2 14h2"/>
          <path d="M20 14h2"/>
          <path d="M15 13v2"/>
          <path d="M9 13v2"/>
        </svg>
      `;

      header.innerHTML = `
        <div style="display: flex; align-items: center; gap: 12px;">
          <div style="width: 36px; height: 36px; background: linear-gradient(135deg, #a855f7 0%, #6366f1 100%); border-radius: 10px; display: flex; align-items: center; justify-content: center;">
            ${botIconSvg}
          </div>
          <span style="font-weight: 700; font-size: 20px; color: #ffffff;">
            Resumatch<span style="color: #818cf8;">.ai</span>
          </span>
        </div>
        <span style="font-size: 11px; color: #94a3b8; font-family: ui-monospace, monospace;">
          Tanggal Dibuat: ${currentDate}
        </span>
      `;
      container.insertBefore(header, container.firstChild);

      const watermark = clonedDoc.createElement("div");
      watermark.style.cssText = `
        position: absolute;
        top: 30%;
        left: 50%;
        transform: translate(-50%, -50%) rotate(-30deg);
        font-size: 50px;
        font-weight: 800;
        color: rgba(255, 255, 255, 0.02);
        letter-spacing: 0.05em;
        pointer-events: none;
        user-select: none;
        white-space: nowrap;
        text-transform: uppercase;
        font-family: ui-monospace, monospace;
        z-index: 0;
      `;
      watermark.innerText = "RESUMATCH.AI REPORT";
      container.style.position = "relative";
      container.appendChild(watermark);

      // 3. FOOTER
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
        font-family: ui-monospace, monospace;
      `;
      footer.innerHTML = `
        <span>Laporan Analisis Otomatis — Resumatch.ai</span>
        <span>Dokumen Resmi ATS Report</span>
      `;
      container.appendChild(footer);
    },
  });

  return canvas.toDataURL("image/jpeg", 0.95);
}

export function saveImageDataAsPDF(imgData: string, filename: string = "Hasil-Analisis-Resumatch.pdf") {
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const imgWidth = 210; // Lebar A4 dalam mm
  const pageHeight = 297; // Tinggi A4 dalam mm
  const imgProps = pdf.getImageProperties(imgData);
  const imgHeight = (imgProps.height * imgWidth) / imgProps.width;
  
  let heightLeft = imgHeight;
  let position = 0;

  pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);
  heightLeft -= pageHeight;

  // Tangani multi-halaman secara rapi jika kontennya panjang
  while (heightLeft > 0) {
    position = heightLeft - imgHeight;
    pdf.addPage();
    pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
  }

  pdf.save(filename);
}

export async function downloadAnalysisAsPDF(
  elementId: string,
  filename: string = "Hasil-Analisis-Resumatch.pdf"
) {
  const imgData = await generatePDFDataUrl(elementId);
  if (imgData) {
    saveImageDataAsPDF(imgData, filename);
  }
}