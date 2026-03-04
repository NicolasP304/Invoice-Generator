const STORAGE_KEY = "invoice-generator-v1";

const state = {
  items: [],
  invoices: [],
  selectedInvoiceId: null,
};

const fields = {
  businessName: document.getElementById("business-name"),
  businessEmail: document.getElementById("business-email"),
  businessPhone: document.getElementById("business-phone"),
  businessAddress: document.getElementById("business-address"),
  businessAbn: document.getElementById("business-abn"),
  bankAccountName: document.getElementById("bank-account-name"),
  bankBsb: document.getElementById("bank-bsb"),
  bankAccountNumber: document.getElementById("bank-account-number"),
  logoUrl: document.getElementById("logo-url"),
  brandColor: document.getElementById("brand-color"),
  clientName: document.getElementById("client-name"),
  clientDetailsName: document.getElementById("client-details-name"),
  clientId: document.getElementById("client-id"),
  billToAddress: document.getElementById("bill-to-address"),
  clientEmail: document.getElementById("client-email"),
  clientPhone: document.getElementById("client-phone"),
  clientAddress: document.getElementById("client-address"),
  invoiceNumber: document.getElementById("invoice-number"),
  invoiceDate: document.getElementById("invoice-date"),
  dueDate: document.getElementById("due-date"),
  taxRate: document.getElementById("tax-rate"),
  discountRate: document.getElementById("discount-rate"),
  currency: document.getElementById("currency"),
  notes: document.getElementById("notes"),
};

const itemsContainer = document.getElementById("items-container");
const itemRowTemplate = document.getElementById("item-row-template");
const historyList = document.getElementById("history-list");
const previewEl = document.getElementById("invoice-preview");

const addItemBtn = document.getElementById("add-item-btn");
const saveDraftBtn = document.getElementById("save-draft-btn");
const clearFormBtn = document.getElementById("clear-form-btn");
const newInvoiceBtn = document.getElementById("new-invoice-btn");
const downloadPdfBtn = document.getElementById("download-pdf-btn");

function toNumber(value) {
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
}

function formatCurrency(amount, currencyCode) {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: currencyCode || "USD",
      currencyDisplay: "symbol",
    }).format(amount);
  } catch {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: "USD",
      currencyDisplay: "symbol",
    }).format(amount);
  }
}

function createEmptyItem() {
  return { id: crypto.randomUUID(), description: "", serviceDate: "", quantity: 1, uom: "Hour", price: 0 };
}

function defaultDates() {
  const now = new Date();
  const due = new Date(now);
  due.setDate(due.getDate() + 14);
  return {
    invoiceDate: now.toISOString().split("T")[0],
    dueDate: due.toISOString().split("T")[0],
  };
}

function nextInvoiceNumber() {
  const highest = state.invoices
    .map((invoice) => Number(invoice.form.invoiceNumber.replace(/\D/g, "")))
    .filter(Number.isFinite)
    .sort((a, b) => b - a)[0];

  return `INV-${String((highest || 0) + 1).padStart(4, "0")}`;
}

function getFormData() {
  return {
    businessName: fields.businessName.value.trim(),
    businessEmail: fields.businessEmail.value.trim(),
    businessPhone: fields.businessPhone.value.trim(),
    businessAddress: fields.businessAddress.value.trim(),
    businessAbn: fields.businessAbn.value.trim(),
    bankAccountName: fields.bankAccountName.value.trim(),
    bankBsb: fields.bankBsb.value.trim(),
    bankAccountNumber: fields.bankAccountNumber.value.trim(),
    logoUrl: fields.logoUrl.value.trim(),
    brandColor: fields.brandColor.value,
    clientName: fields.clientName.value.trim(),
    clientDetailsName: fields.clientDetailsName.value.trim(),
    clientId: fields.clientId.value.trim(),
    billToAddress: fields.billToAddress.value.trim(),
    clientEmail: fields.clientEmail.value.trim(),
    clientPhone: fields.clientPhone.value.trim(),
    clientAddress: fields.clientAddress.value.trim(),
    invoiceNumber: fields.invoiceNumber.value.trim(),
    invoiceDate: fields.invoiceDate.value,
    dueDate: fields.dueDate.value,
    taxRate: toNumber(fields.taxRate.value),
    discountRate: toNumber(fields.discountRate.value),
    currency: fields.currency.value,
    notes: fields.notes.value.trim(),
  };
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function normalizeHexColor(value) {
  return /^#[0-9a-f]{6}$/i.test(value) ? value : "#0f766e";
}

function darkenHex(value, percent) {
  const hex = normalizeHexColor(value).slice(1);
  const amount = 1 - percent / 100;
  const r = Math.max(0, Math.floor(parseInt(hex.slice(0, 2), 16) * amount));
  const g = Math.max(0, Math.floor(parseInt(hex.slice(2, 4), 16) * amount));
  const b = Math.max(0, Math.floor(parseInt(hex.slice(4, 6), 16) * amount));
  return `#${[r, g, b].map((part) => part.toString(16).padStart(2, "0")).join("")}`;
}

function applyBrandColor(color) {
  const safeColor = normalizeHexColor(color);
  document.documentElement.style.setProperty("--primary", safeColor);
  document.documentElement.style.setProperty("--primary-dark", darkenHex(safeColor, 18));
}

function safeImageUrl(url) {
  if (!url) return "";
  return /^https?:\/\//i.test(url) ? url : "";
}

function computeTotals(form, items) {
  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.price, 0);
  const discount = subtotal * (form.discountRate / 100);
  const taxable = Math.max(subtotal - discount, 0);
  const tax = taxable * (form.taxRate / 100);
  const total = taxable + tax;

  return { subtotal, discount, tax, total };
}

function renderItems() {
  itemsContainer.innerHTML = "";

  state.items.forEach((item) => {
    const node = itemRowTemplate.content.firstElementChild.cloneNode(true);
    const [descriptionInput, dateInput, quantityInput, uomInput, priceInput, removeBtn] = node.children;

    descriptionInput.value = item.description;
    dateInput.value = item.serviceDate || "";
    quantityInput.value = item.quantity;
    uomInput.value = item.uom || "Hour";
    priceInput.value = item.price;

    descriptionInput.addEventListener("input", (event) => {
      item.description = event.target.value;
      renderPreview();
    });

    dateInput.addEventListener("input", (event) => {
      item.serviceDate = event.target.value;
      renderPreview();
    });

    quantityInput.addEventListener("input", (event) => {
      item.quantity = Math.max(1, toNumber(event.target.value));
      renderPreview();
    });

    uomInput.addEventListener("input", (event) => {
      item.uom = event.target.value || "Hour";
      renderPreview();
    });

    priceInput.addEventListener("input", (event) => {
      item.price = Math.max(0, toNumber(event.target.value));
      renderPreview();
    });

    removeBtn.addEventListener("click", () => {
      state.items = state.items.filter((row) => row.id !== item.id);
      if (!state.items.length) state.items.push(createEmptyItem());
      renderItems();
      renderPreview();
    });

    itemsContainer.appendChild(node);
  });
}

function formatShortDate(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = String(date.getFullYear()).slice(-2);
  return `${day}/${month}/${year}`;
}

function renderPreview() {
  const form = getFormData();
  const totals = computeTotals(form, state.items);
  applyBrandColor(form.brandColor);

  const logoMarkup = safeImageUrl(form.logoUrl)
    ? `<img class="preview-logo" src="${escapeHtml(form.logoUrl)}" alt="Business logo" />`
    : "";

  const itemsRows = state.items
    .map((item) => {
      const lineTotal = item.quantity * item.price;
      return `<tr>
        <td>${escapeHtml(item.description || "(No description)")}</td>
        <td>${escapeHtml(formatShortDate(item.serviceDate))}</td>
        <td>${item.quantity}</td>
        <td>${escapeHtml(item.uom || "Hour")}</td>
        <td>${formatCurrency(item.price, form.currency)}</td>
        <td>${formatCurrency(lineTotal, form.currency)}</td>
        <td>${formatCurrency(lineTotal, form.currency)}</td>
      </tr>`;
    })
    .join("");

  previewEl.classList.add("invoice-template");

  previewEl.innerHTML = `
    <div class="template-header">
      <div class="preview-business">
        ${logoMarkup}
        <div>
          <p><strong>Accounts Name:</strong> ${escapeHtml(form.businessName || "Your Business")}</p>
          <p>${escapeHtml(form.businessAddress || "")}</p>
          <p><strong>Mobile:</strong> ${escapeHtml(form.businessPhone || "")}</p>
          <p>Email: ${escapeHtml(form.businessEmail || "")}</p>
          <p><strong>ABN:</strong> ${escapeHtml(form.businessAbn || "-")}</p>
        </div>
      </div>
      <div class="template-invoice-meta">
        <p><strong>Tax Invoice Number:</strong> ${escapeHtml(form.invoiceNumber || "-")}</p>
        <p><strong>Invoice Date:</strong> ${escapeHtml(formatShortDate(form.invoiceDate))}</p>
        <p><strong>Due Date:</strong> ${escapeHtml(formatShortDate(form.dueDate))}</p>
      </div>
    </div>

    <div class="template-blocks">
      <div class="template-block">
        <p><strong>Bill to: ${escapeHtml(form.clientName || "-")}</strong></p>
        <p>${escapeHtml(form.billToAddress || form.clientAddress || "")}</p>
      </div>
      <div class="template-block">
        <p><strong>Client Details: ${escapeHtml(form.clientDetailsName || form.clientName || "-")}</strong></p>
        <p>${escapeHtml(form.clientAddress || "")}</p>
        <p><strong>Client I.D:</strong> ${escapeHtml(form.clientId || "-")}</p>
      </div>
    </div>

    <table class="preview-table template-table">
      <thead>
        <tr>
          <th>Services</th>
          <th>Date</th>
          <th>Qty</th>
          <th>UOM</th>
          <th>Unit Price</th>
          <th>Net Amount</th>
          <th>Total</th>
        </tr>
      </thead>
      <tbody>${itemsRows}</tbody>
    </table>

    <div class="template-rule"></div>
    <p class="template-total"><strong>Total:</strong> ${formatCurrency(totals.total, form.currency)}</p>

    <p class="template-note"><strong>*Care Services:</strong> ${escapeHtml(form.notes || "Assistance with selfcare and activities of daily living")}</p>
    <div class="template-bank">
      <p><strong>Bank Details:</strong></p>
      <p><strong>Account Name:</strong> ${escapeHtml(form.bankAccountName || form.businessName || "-")}</p>
      <p><strong>BSB:</strong> ${escapeHtml(form.bankBsb || "-")}</p>
      <p><strong>Account Number:</strong> ${escapeHtml(form.bankAccountNumber || "-")}</p>
    </div>

    <div class="template-contact">
      ${form.clientEmail ? `<p>Client Email: ${escapeHtml(form.clientEmail)}</p>` : ""}
      ${form.clientPhone ? `<p>Client Phone: ${escapeHtml(form.clientPhone)}</p>` : ""}
    </div>
  `;
}

function resetForm() {
  const dates = defaultDates();
  fields.businessName.value = "";
  fields.businessEmail.value = "";
  fields.businessPhone.value = "";
  fields.businessAddress.value = "";
  fields.businessAbn.value = "";
  fields.bankAccountName.value = "";
  fields.bankBsb.value = "";
  fields.bankAccountNumber.value = "";
  fields.logoUrl.value = "";
  fields.brandColor.value = "#0f766e";
  fields.clientName.value = "";
  fields.clientDetailsName.value = "";
  fields.clientId.value = "";
  fields.billToAddress.value = "";
  fields.clientEmail.value = "";
  fields.clientPhone.value = "";
  fields.clientAddress.value = "";
  fields.invoiceNumber.value = nextInvoiceNumber();
  fields.invoiceDate.value = dates.invoiceDate;
  fields.dueDate.value = dates.dueDate;
  fields.taxRate.value = "0";
  fields.discountRate.value = "0";
  fields.currency.value = "AUD";
  fields.notes.value =
    "Assistance with selfcare and activities of daily living";

  state.selectedInvoiceId = null;
  state.items = [createEmptyItem()];

  renderItems();
  renderPreview();
}

function getStorage() {
  try {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    return {
      invoices: Array.isArray(data.invoices) ? data.invoices : [],
    };
  } catch {
    return { invoices: [] };
  }
}

function saveStorage() {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      invoices: state.invoices,
    }),
  );
}

function loadInvoice(invoiceId) {
  const invoice = state.invoices.find((entry) => entry.id === invoiceId);
  if (!invoice) return;

  state.selectedInvoiceId = invoice.id;

  Object.entries(invoice.form).forEach(([key, value]) => {
    if (fields[key]) fields[key].value = value;
  });

  state.items = invoice.items.map((item) => ({ ...item }));
  renderItems();
  renderPreview();
}

function saveInvoice() {
  const form = getFormData();

  if (!form.businessName || !form.clientName) {
    alert("Please fill in at least your business name and client name.");
    return;
  }

  const totals = computeTotals(form, state.items);
  const now = new Date().toISOString();
  const payload = {
    id: state.selectedInvoiceId || crypto.randomUUID(),
    updatedAt: now,
    createdAt:
      state.invoices.find((entry) => entry.id === state.selectedInvoiceId)?.createdAt || now,
    form,
    items: state.items.map((item) => ({ ...item })),
    totals,
  };

  const existingIndex = state.invoices.findIndex((entry) => entry.id === payload.id);
  if (existingIndex >= 0) state.invoices.splice(existingIndex, 1, payload);
  else state.invoices.unshift(payload);

  state.selectedInvoiceId = payload.id;
  saveStorage();
  renderHistory();
  alert("Invoice saved.");
}

function duplicateInvoice(invoiceId) {
  const invoice = state.invoices.find((entry) => entry.id === invoiceId);
  if (!invoice) return;

  const clone = {
    ...invoice,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    form: {
      ...invoice.form,
      invoiceNumber: nextInvoiceNumber(),
      invoiceDate: defaultDates().invoiceDate,
      dueDate: defaultDates().dueDate,
    },
  };

  state.invoices.unshift(clone);
  saveStorage();
  renderHistory();
}

function deleteInvoice(invoiceId) {
  const confirmed = confirm("Delete this saved invoice?");
  if (!confirmed) return;

  state.invoices = state.invoices.filter((entry) => entry.id !== invoiceId);
  if (state.selectedInvoiceId === invoiceId) resetForm();

  saveStorage();
  renderHistory();
}

function formatDate(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString();
}

function renderHistory() {
  historyList.innerHTML = "";

  if (!state.invoices.length) {
    historyList.innerHTML = `<li class="history-item">No saved invoices yet.</li>`;
    return;
  }

  state.invoices.forEach((invoice) => {
    const li = document.createElement("li");
    li.className = "history-item";
    li.innerHTML = `
      <div class="history-item-head">
        <strong>${invoice.form.invoiceNumber || "Untitled"}</strong>
        <span>${formatCurrency(invoice.totals.total, invoice.form.currency)}</span>
      </div>
      <p class="history-meta">${invoice.form.clientName || "Unknown client"} • Updated ${formatDate(invoice.updatedAt)}</p>
      <div class="history-actions">
        <button class="btn btn-secondary small-btn" data-action="load" data-id="${invoice.id}">Open</button>
        <button class="btn btn-secondary small-btn" data-action="duplicate" data-id="${invoice.id}">Duplicate</button>
        <button class="btn btn-danger small-btn" data-action="delete" data-id="${invoice.id}">Delete</button>
      </div>
    `;

    historyList.appendChild(li);
  });
}

function wireListeners() {
  Object.values(fields).forEach((input) => {
    input.addEventListener("input", renderPreview);
  });

  addItemBtn.addEventListener("click", () => {
    state.items.push(createEmptyItem());
    renderItems();
    renderPreview();
  });

  saveDraftBtn.addEventListener("click", saveInvoice);

  clearFormBtn.addEventListener("click", () => {
    const confirmed = confirm("Clear the current form and start fresh?");
    if (!confirmed) return;
    resetForm();
  });

  newInvoiceBtn.addEventListener("click", resetForm);

  downloadPdfBtn.addEventListener("click", () => {
    window.print();
  });

  historyList.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLButtonElement)) return;

    const { action, id } = target.dataset;
    if (!action || !id) return;

    if (action === "load") loadInvoice(id);
    if (action === "duplicate") duplicateInvoice(id);
    if (action === "delete") deleteInvoice(id);
  });
}

function init() {
  state.invoices = getStorage().invoices;
  resetForm();
  renderHistory();
  wireListeners();
}

init();
