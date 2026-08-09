const PDFDocument = require("pdfkit");
const shop = require("../config/shopDetails");

const generateBillPdf = (res, sale) => {
    const doc = new PDFDocument({ margin: 50 });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=${sale.billNumber}.pdf`);
    doc.pipe(res);

    // Shop header
    doc.fontSize(20).text(shop.shopName, { align: "center" });
    doc.fontSize(9).text(shop.address, { align: "center" });
    doc.text(`DL No: ${shop.dlNo}`, { align: "center" });
    doc.text(`GSTIN: ${shop.gstin}  |  Ph: ${shop.phone}  |  Email: ${shop.email}`, {
        align: "center",
    });
    doc.moveDown(0.5);
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown();

    // Bill info (left) + Customer info (right)
    const infoTop = doc.y;
    doc.fontSize(11);
    doc.text(`Bill No: ${sale.billNumber}`, 50, infoTop);
    doc.text(`Date: ${new Date(sale.saleDate).toLocaleString()}`, 50, infoTop + 16);

    doc.fontSize(10);
    if (sale.customerName) doc.text(`M/s: ${sale.customerName}`, 320, infoTop, { width: 220 });
    if (sale.customerDLNo) doc.text(`DL No: ${sale.customerDLNo}`, 320, infoTop + 14, { width: 220 });
    if (sale.customerAddress)
        doc.text(`Address: ${sale.customerAddress}`, 320, infoTop + 28, { width: 220 });

    doc.y = infoTop + 50;
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown(0.5);

    // Table header
    const tableTop = doc.y;
    doc.fontSize(8);
    doc.text("Medicine", 50, tableTop, { width: 105 });
    doc.text("Batch", 155, tableTop, { width: 50 });
    doc.text("Expiry", 205, tableTop, { width: 50 });
    doc.text("MRP", 255, tableTop, { width: 40 });
    doc.text("Unit Rate", 295, tableTop, { width: 50 });
    doc.text("Qty", 345, tableTop, { width: 35 });
    doc.text("Total", 380, tableTop, { width: 55, align: "right" });
    doc.moveTo(50, tableTop + 14).lineTo(550, tableTop + 14).stroke();

    let y = tableTop + 22;
    sale.items.forEach((item) => {
        const expiryStr = item.expiryDate
            ? new Date(item.expiryDate).toLocaleDateString("en-GB", { month: "2-digit", year: "2-digit" })
            : "-";
        doc.text(item.medicineName, 50, y, { width: 105 });
        doc.text(item.batchNumber, 155, y, { width: 50 });
        doc.text(expiryStr, 205, y, { width: 50 });
        doc.text(`${item.mrp}`, 255, y, { width: 40 });
        doc.text(`${item.pricePerItem}`, 295, y, { width: 50 });
        doc.text(String(item.quantity), 345, y, { width: 35 });
        doc.text(`Rs.${item.total}`, 380, y, { width: 55, align: "right" });
        y += 18;
    });

    doc.moveTo(50, y + 5).lineTo(550, y + 5).stroke();
    y += 18;

    // Totals
    doc.fontSize(10);
    doc.text(`Subtotal: Rs.${sale.subtotal}`, 350, y, { width: 200, align: "right" });
    y += 15;
    doc.text(`Discount (${sale.discountPercent}%): -Rs.${sale.discountAmount}`, 350, y, {
        width: 200,
        align: "right",
    });
    y += 15;
    doc.text(`GST (${sale.gstPercent}%): +Rs.${sale.gstAmount}`, 350, y, {
        width: 200,
        align: "right",
    });
    y += 18;
    doc.fontSize(13).text(`Total Payable: Rs.${sale.totalAmount}`, 350, y, {
        width: 200,
        align: "right",
    });

    doc.moveDown(2);
    doc.fontSize(8).text(
        "Note: Goods once sold cannot be taken back. Please check goods at the time of delivery.",
        { align: "center" }
    );

    // Signature block
    const sigY = Math.max(doc.y + 40, 650);
    doc.fontSize(10).text(`For: ${shop.shopName}`, 380, sigY, { width: 170, align: "center" });
    doc.moveTo(380, sigY + 35).lineTo(550, sigY + 35).stroke();
    doc.fontSize(9).text("Signatory Authorised", 380, sigY + 40, { width: 170, align: "center" });

    doc.fontSize(9).text("Thank you for your business!", 50, sigY + 40, { width: 250, align: "left" });

    doc.end();
};

module.exports = generateBillPdf;