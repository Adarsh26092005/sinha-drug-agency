import * as XLSX from "xlsx";
import { formatDate, formatDateTime } from "./formatDate";

// Simple export - used by Stock, Purchase History, Low Stock, Expiring Soon, Expired
export function exportToExcel(data, filename, sheetName = "Sheet1") {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    XLSX.writeFile(workbook, `${filename}.xlsx`);
}

// Sales export with merged cells - bill-level fields (Bill No, Date, Customer, DL No,
// Address, Discount %, GST %, Bill Total) span all item rows of that bill instead of repeating
export function exportSalesToExcel(sales, filename) {
    const rows = [];
    const merges = [];
    let currentRow = 1; // row 0 is the header row

    // Columns that should merge when a bill has more than 1 item
    const mergeColumnIndexes = [0, 1, 2, 3, 4, 12, 13, 14];

    sales.forEach((s) => {
        const itemCount = s.items.length;

        s.items.forEach((item, idx) => {
            rows.push({
                "Bill No": idx === 0 ? s.billNumber : "",
                Date: idx === 0 ? formatDateTime(s.saleDate) : "",
                Customer: idx === 0 ? s.customerName || "-" : "",
                "Customer DL No": idx === 0 ? s.customerDLNo || "-" : "",
                "Customer Address": idx === 0 ? s.customerAddress || "-" : "",
                Medicine: item.medicineName,
                "Batch No": item.batchNumber,
                "Expiry Date": formatDate(item.expiryDate),
                Qty: item.quantity,
                MRP: item.mrp,
                "Unit Price": item.pricePerItem,
                "Item Total": item.total,
                "Bill Discount %": idx === 0 ? s.discountPercent : "",
                "Bill GST %": idx === 0 ? s.gstPercent : "",
                "Bill Total": idx === 0 ? s.totalAmount : "",
            });
        });

        if (itemCount > 1) {
            mergeColumnIndexes.forEach((c) => {
                merges.push({
                    s: { r: currentRow, c },
                    e: { r: currentRow + itemCount - 1, c },
                });
            });
        }

        currentRow += itemCount;
    });

    const worksheet = XLSX.utils.json_to_sheet(rows);
    worksheet["!merges"] = merges;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sales");
    XLSX.writeFile(workbook, `${filename}.xlsx`);
}