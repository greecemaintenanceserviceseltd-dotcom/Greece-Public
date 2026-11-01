import PDFDocument from "pdfkit";

export async function documentPdf(title: string, record: Record<string, any>, items: Record<string, any>[], company: Record<string, any>) {
  const doc = new PDFDocument({ margin: 48, size: "A4" });
  const chunks: Buffer[] = [];
  const result = new Promise<Buffer>((resolve, reject) => {
    doc.on("data", chunk => chunks.push(Buffer.from(chunk)));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);
  });
  doc.fillColor("#9b603b").fontSize(22).text(company.company_name || "Greece");
  doc.fillColor("#333333").fontSize(10).text(`${company.address || ""}\n${company.email || ""}\n${company.phone || ""}`);
  doc.moveDown().fontSize(20).text(title);
  doc.fontSize(11).moveDown().text(record.number || record.month || "");
  for (const key of ["company_name", "contact_name", "full_name", "title", "issue_date", "due_date", "valid_until", "status"])
    if (record[key]) doc.text(`${key.replaceAll("_", " ")}: ${record[key]}`);
  doc.moveDown();
  for (const item of items) {
    doc.fontSize(11).text(String(item.description || "Service"));
    doc.fontSize(10).text(`${item.quantity || 1} x ${Number(item.unit_price || 0).toFixed(2)} = ${Number(item.total || 0).toFixed(2)}`);
    doc.moveDown(0.5);
  }
  const totals = record.net_salary !== undefined ? ["base_salary", "bonuses", "deductions", "tax", "net_salary"] : ["subtotal", "vat_amount", "total"];
  for (const key of totals) doc.fontSize(key === "total" || key === "net_salary" ? 15 : 11).text(`${key.replaceAll("_", " ")}: ${Number(record[key] || 0).toFixed(2)} ${company.currency || "ILS"}`);
  if (record.notes) doc.moveDown().fontSize(10).text(String(record.notes));
  doc.end();
  return result;
}

export function download(bytes: Buffer | ArrayBuffer, filename: string, contentType: string) {
  return new Response(new Uint8Array(bytes instanceof Buffer ? bytes : new Uint8Array(bytes)), { headers: {
    "Content-Type": contentType,
    "Content-Disposition": `attachment; filename="${filename.replace(/[^\w. -]/g, "_").slice(0, 180)}"`,
    "Cache-Control": "no-store",
  } });
}

export async function payslipBatch(records: Record<string, any>[], company: Record<string, any>) {
  const doc = new PDFDocument({ margin: 48, size: "A4" });
  const chunks: Buffer[] = [];
  const result = new Promise<Buffer>((resolve, reject) => {
    doc.on("data", chunk => chunks.push(Buffer.from(chunk)));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);
  });
  for (const [index, row] of records.entries()) {
    if (index) doc.addPage();
    doc.fontSize(22).text(company.company_name || "Greece");
    doc.fontSize(18).moveDown().text(`Payslip ${row.month}`);
    doc.fontSize(12).moveDown().text(row.full_name || row.employee_id);
    for (const key of ["base_salary", "bonuses", "deductions", "tax", "net_salary"]) doc.moveDown().text(`${key.replaceAll("_", " ")}: ${Number(row[key] || 0).toFixed(2)} ${company.currency || "ILS"}`);
  }
  doc.end();
  return result;
}
