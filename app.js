const STORAGE_KEY = "northstar-crm-prospects";
const STATUSES = ["Prospect", "Contacted", "Meeting", "Client"];
const CLIENT_TYPES = ["CGP", "Private Bank", "Institutional Investor", "Family Office"];
const PRODUCT_INTERESTS = ["Autocall", "Reverse Convertible", "Phoenix", "Other"];
const AVATAR_COLORS = [
  ["#eaf1f5", "#52788d"],
  ["#f5eee8", "#a27551"],
  ["#edf1e8", "#788a54"],
  ["#f1ebf4", "#866a92"],
  ["#e8f1ef", "#4d8177"],
  ["#f5ecec", "#a66d70"],
];

const elements = {
  rows: document.querySelector("#prospect-rows"),
  emptyState: document.querySelector("#empty-state"),
  emptyTitle: document.querySelector("#empty-title"),
  emptyCopy: document.querySelector("#empty-copy"),
  dialog: document.querySelector("#prospect-dialog"),
  form: document.querySelector("#prospect-form"),
  formError: document.querySelector("#form-error"),
  search: document.querySelector("#search-input"),
  filter: document.querySelector("#status-filter"),
  toast: document.querySelector("#toast"),
};

let prospects = loadProspects();
let toastTimer;

function loadProspects() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === null) return [];
    const parsed = JSON.parse(saved);
    if (!Array.isArray(parsed)) throw new Error("Saved prospect data is not a list.");
    return parsed.filter(isProspect).map((prospect) => ({
      ...prospect,
      clientType: CLIENT_TYPES.includes(prospect.clientType) ? prospect.clientType : "",
      productInterest: PRODUCT_INTERESTS.includes(prospect.productInterest) ? prospect.productInterest : "",
      nextFollowUp: typeof prospect.nextFollowUp === "string" ? prospect.nextFollowUp : "",
    }));
  } catch (error) {
    console.error("Could not load saved prospects:", error);
    window.setTimeout(() => showToast("Saved data could not be loaded. Check the browser console."), 0);
    return [];
  }
}

function isProspect(value) {
  return value !== null
    && typeof value === "object"
    && typeof value.id === "string"
    && typeof value.companyName === "string"
    && typeof value.contactName === "string"
    && typeof value.email === "string"
    && typeof value.phone === "string"
    && STATUSES.includes(value.status)
    && typeof value.lastContact === "string"
    && typeof value.notes === "string";
}

function saveProspects() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prospects));
    return true;
  } catch (error) {
    console.error("Could not save prospects:", error);
    showToast("Your changes could not be saved. Check your browser storage settings.");
    return false;
  }
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[character]);
}

function formatDate(value) {
  if (!value) return "Not recorded";
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return "Not recorded";
  return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric", year: "numeric" }).format(date);
}

function getVisibleProspects() {
  const query = elements.search.value.trim().toLocaleLowerCase();
  const status = elements.filter.value;
  return prospects.filter((prospect) => {
    const matchesStatus = status === "All" || prospect.status === status;
    const searchable = [
      prospect.companyName,
      prospect.contactName,
      prospect.email,
      prospect.phone,
      prospect.notes,
      prospect.clientType,
      prospect.productInterest,
    ]
      .join(" ")
      .toLocaleLowerCase();
    return matchesStatus && searchable.includes(query);
  });
}

function render() {
  const visible = getVisibleProspects();
  elements.rows.innerHTML = visible.map((prospect) => {
    const colorIndex = [...prospect.companyName].reduce((total, character) => total + character.charCodeAt(0), 0) % AVATAR_COLORS.length;
    const [background, foreground] = AVATAR_COLORS[colorIndex];
    const contactDetails = prospect.email || prospect.phone;
    const contactSubline = prospect.email && prospect.phone ? prospect.phone : "";
    const statusClass = prospect.status.toLowerCase();

    return `
      <tr>
        <td>
          <div class="company-cell">
            <span class="company-initial" style="background:${background};color:${foreground}" aria-hidden="true">${escapeHtml(prospect.companyName.charAt(0).toUpperCase())}</span>
            <span class="company-copy"><strong>${escapeHtml(prospect.companyName)}</strong><small>${escapeHtml(prospect.notes || "Business relationship")}</small></span>
          </div>
        </td>
        <td><div class="contact-cell"><strong>${escapeHtml(prospect.contactName)}</strong><small>${escapeHtml(contactDetails || "No contact details")}${contactSubline ? ` · ${escapeHtml(contactSubline)}` : ""}</small></div></td>
        <td>${escapeHtml(prospect.clientType || "Not specified")}</td>
        <td>${escapeHtml(prospect.productInterest || "Not specified")}</td>
        <td><span class="status-pill status-${statusClass}">${escapeHtml(prospect.status)}</span></td>
        <td class="date-cell">${escapeHtml(formatDate(prospect.lastContact))}</td>
        <td class="date-cell">${escapeHtml(formatDate(prospect.nextFollowUp))}</td>
        <td><div class="row-actions">
          <button class="icon-button edit-button" type="button" data-id="${escapeHtml(prospect.id)}" aria-label="Edit ${escapeHtml(prospect.companyName)}" title="Edit prospect">✎</button>
          <button class="icon-button delete-button" type="button" data-id="${escapeHtml(prospect.id)}" aria-label="Delete ${escapeHtml(prospect.companyName)}" title="Delete prospect">×</button>
        </div></td>
      </tr>`;
  }).join("");

  const hasVisibleRows = visible.length > 0;
  elements.emptyState.classList.toggle("visible", !hasVisibleRows);
  elements.rows.closest("table").hidden = !hasVisibleRows;
  const isFiltered = elements.search.value.trim() !== "" || elements.filter.value !== "All";
  elements.emptyTitle.textContent = isFiltered ? "No matching prospects" : "Your pipeline starts here";
  elements.emptyCopy.textContent = isFiltered
    ? "Try a different search or status filter to find the prospect you need."
    : "Add your first prospect to keep important business relationships organized.";
  document.querySelector("#empty-add-button").hidden = isFiltered;
  document.querySelector("#total-count").textContent = String(prospects.length);
  document.querySelector("#conversation-count").textContent = String(prospects.filter((prospect) => ["Contacted", "Meeting"].includes(prospect.status)).length);
  document.querySelector("#client-count").textContent = String(prospects.filter((prospect) => prospect.status === "Client").length);
  document.querySelector("#nav-count").textContent = String(prospects.length);
  document.querySelector("#list-count").textContent = String(prospects.length);
  document.querySelector("#table-footer-copy").textContent = `Showing ${visible.length} ${visible.length === 1 ? "prospect" : "prospects"}`;
}

function openDialog(prospect) {
  elements.form.reset();
  elements.formError.textContent = "";
  document.querySelector("#prospect-id").value = prospect ? prospect.id : "";
  document.querySelector("#dialog-title").textContent = prospect ? "Edit prospect" : "Add a prospect";
  document.querySelector("#save-button").textContent = prospect ? "Save changes" : "Save prospect";
  document.querySelector("#company-name").value = prospect?.companyName ?? "";
  document.querySelector("#contact-name").value = prospect?.contactName ?? "";
  document.querySelector("#email").value = prospect?.email ?? "";
  document.querySelector("#phone").value = prospect?.phone ?? "";
  document.querySelector("#status").value = prospect?.status ?? "Prospect";
  document.querySelector("#last-contact").value = prospect?.lastContact ?? "";
  document.querySelector("#client-type").value = prospect?.clientType ?? "";
  document.querySelector("#product-interest").value = prospect?.productInterest ?? "";
  document.querySelector("#next-follow-up").value = prospect?.nextFollowUp ?? "";
  document.querySelector("#notes").value = prospect?.notes ?? "";
  elements.dialog.showModal();
  document.querySelector("#company-name").focus();
}

function showToast(message) {
  window.clearTimeout(toastTimer);
  elements.toast.textContent = message;
  elements.toast.classList.add("visible");
  toastTimer = window.setTimeout(() => elements.toast.classList.remove("visible"), 3000);
}

function handleSubmit(event) {
  event.preventDefault();
  elements.formError.textContent = "";
  if (!elements.form.reportValidity()) return;

  const id = document.querySelector("#prospect-id").value;
  const existing = prospects.find((prospect) => prospect.id === id);
  const prospect = {
    id: existing?.id ?? (globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`),
    companyName: document.querySelector("#company-name").value.trim(),
    contactName: document.querySelector("#contact-name").value.trim(),
    email: document.querySelector("#email").value.trim(),
    phone: document.querySelector("#phone").value.trim(),
    status: document.querySelector("#status").value,
    lastContact: document.querySelector("#last-contact").value,
    clientType: document.querySelector("#client-type").value,
    productInterest: document.querySelector("#product-interest").value,
    nextFollowUp: document.querySelector("#next-follow-up").value,
    notes: document.querySelector("#notes").value.trim(),
  };

  if (!prospect.companyName || !prospect.contactName) {
    elements.formError.textContent = "Please enter both a company name and a contact name.";
    return;
  }

  const updated = existing
    ? prospects.map((item) => item.id === id ? prospect : item)
    : [prospect, ...prospects];
  const previousProspects = prospects;
  prospects = updated;
  if (!saveProspects()) {
    prospects = previousProspects;
    return;
  }

  elements.dialog.close();
  render();
  showToast(existing ? "Prospect updated." : "Prospect added.");
}

function handleRowAction(event) {
  const button = event.target.closest("button[data-id]");
  if (!button) return;
  const prospect = prospects.find((item) => item.id === button.dataset.id);
  if (!prospect) return;

  if (button.classList.contains("edit-button")) {
    openDialog(prospect);
    return;
  }
  if (button.classList.contains("delete-button")) {
    if (!window.confirm(`Delete ${prospect.companyName} from your prospects?`)) return;
    const previousProspects = prospects;
    prospects = prospects.filter((item) => item.id !== prospect.id);
    if (!saveProspects()) {
      prospects = previousProspects;
      return;
    }
    render();
    showToast("Prospect deleted.");
  }
}
function importCsv(file) {
  const reader = new FileReader();

  reader.onload = (event) => {
    const text = event.target.result;
    const lines = text.split(/\r?\n/).filter((line) => line.trim());

    // On saute la première ligne : les titres du CSV
    const dataLines = lines.slice(1);

    let imported = 0;

    dataLines.forEach((line) => {
      // Découpe le CSV en respectant les champs entre guillemets
      const values = line.match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g);

      if (!values || values.length < 4) return;

      const clean = (value) =>
        (value || "").replace(/^"|"$/g, "").replace(/""/g, '"').trim();

      const name = clean(values[0]);
      const region = clean(values[1]);
      const registrations = clean(values[2]);
      const profileUrl = clean(values[3]);
      const phone = clean(values[4]);
      const email = clean(values[5]);
      const website = clean(values[6]);
      const address = clean(values[7]);

      prospects.push({
        id: crypto.randomUUID(),
        companyName: name,
        contactName: "",
        email: email,
        phone: phone,
        status: "New",
        lastContact: "",
        clientType: "Wealth manager",
        productInterest: registrations,
        nextFollowUp: "",
        notes: [
          region && `Region: ${region}`,
          profileUrl && `CNCEF: ${profileUrl}`,
          website && `Website: ${website}`,
          address && `Address: ${address}`
        ].filter(Boolean).join(" | ")
      });

      imported++;
    });

    saveProspects();
    render();
    showToast(`${imported} prospects imported.`);
  };

  reader.readAsText(file, "UTF-8");
}
async function loadDemoProspects() {
    // Ne remplace pas les données si l'utilisateur en possède déjà
    if (prospects.length > 0) return;

    try {
        const response = await fetch("prospects-demo.csv");
        if (!response.ok) throw new Error("CSV not found");

        const blob = await response.blob();
        const file = new File([blob], "prospects-demo.csv", {
            type: "text/csv"
        });

        importCsv(file);
    } catch (error) {
        console.error("Could not load demo prospects:", error);
    }
}
function exportCsv() {
  const columns = [
    "Company name",
    "Contact name",
    "Email",
    "Phone number",
    "Status",
    "Last contact date",
    "Client type",
    "Product interest",
    "Next follow-up date",
    "Notes",
  ];
  const rows = prospects.map((prospect) => [
    prospect.companyName,
    prospect.contactName,
    prospect.email,
    prospect.phone,
    prospect.status,
    prospect.lastContact,
    prospect.clientType,
    prospect.productInterest,
    prospect.nextFollowUp,
    prospect.notes,
  ]);
  const csvCell = (value) => `"${String(value).replace(/"/g, '""')}"`;
  const csv = [columns, ...rows].map((row) => row.map(csvCell).join(",")).join("\r\n");
  const url = URL.createObjectURL(new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = "marius-perrin-prospects.csv";
  link.click();
  URL.revokeObjectURL(url);
  showToast("Prospects exported as CSV.");
}

document.querySelector("#add-prospect-button").addEventListener("click", () => openDialog());
document.querySelector("#empty-add-button").addEventListener("click", () => openDialog());
document.querySelectorAll(".close-dialog").forEach((button) => button.addEventListener("click", () => elements.dialog.close()));
elements.dialog.addEventListener("click", (event) => {
  if (event.target === elements.dialog) elements.dialog.close();
});
elements.form.addEventListener("submit", handleSubmit);
elements.rows.addEventListener("click", handleRowAction);
elements.search.addEventListener("input", render);
elements.filter.addEventListener("change", render);
document.querySelector("#import-button").addEventListener("click", () => {
  document.querySelector("#csv-file-input").click();
});
document.querySelector("#csv-file-input").addEventListener("change", (event) => {
  const file = event.target.files[0];

  if (file) {
    importCsv(file);
  }

  event.target.value = "";
});
document.querySelector("#export-button").addEventListener("click", exportCsv);
document.addEventListener("keydown", (event) => {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
    event.preventDefault();
    elements.search.focus();
  }
});

document.querySelector("#today-label").textContent = new Intl.DateTimeFormat(undefined, {
  weekday: "short",
  month: "short",
  day: "numeric",
}).format(new Date());
loadDemoProspects();
render();
