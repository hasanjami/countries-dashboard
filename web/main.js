const searchInput = document.getElementById("searchInput");
const regionSelect = document.getElementById("regionSelect");
const sortSelect = document.getElementById("sortSelect");
const orderSelect = document.getElementById("orderSelect");
const results = document.getElementById("results");
const statusDiv = document.getElementById("status");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const pageInfo = document.getElementById("pageInfo");
const detailsDiv = document.getElementById("details");

let currentPage = 1;
let totalItems = 0;
const limit = 10;

async function load(page = 1) {
    const q = searchInput.value.trim();
    const type = regionSelect.value;
    const sort = sortSelect.value;
    const order = orderSelect.value;

    const params = new URLSearchParams({
        q,
        type,
        sort,
        order,
        limit,
        offset: (page - 1) * limit,
    });

    statusDiv.textContent = "Loading...";
    results.innerHTML = "";

    try {
        const res = await fetch(`/items?${params}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();

        console.log(data); // Debug: see what you get

        totalItems = data.total;
        renderTable(data.items);
        renderPager(page);

        statusDiv.textContent = totalItems === 0 ? "No results found." : `Total: ${totalItems}`;
    } catch (err) {
        statusDiv.textContent = `Error: ${err.message}`;
    }
}

function renderTable(items) {
    results.innerHTML = items.map((c, i) => `
    <tr data-idx="${i}" style="cursor:pointer;">
      <td><img src="${c.flags?.png || ''}" alt="flag" style="width:32px;height:20px;"></td>
      <td>${c.name?.common || ''}</td>
      <td>${Array.isArray(c.capital) ? c.capital.join(", ") : "-"}</td>
      <td>${c.region || ''}</td>
      <td>${typeof c.population === "number" ? c.population.toLocaleString() : ''}</td>
    </tr>
  `).join("");
    // Add click event for each row
    Array.from(results.querySelectorAll("tr")).forEach((row, i) => {
        row.onclick = () => showDetails(items[i]);
    });
}

function renderPager(page) {
    currentPage = page;
    const totalPages = Math.ceil(totalItems / limit);

    pageInfo.textContent = `Page ${page} of ${totalPages}`;
    prevBtn.disabled = page <= 1;
    nextBtn.disabled = page >= totalPages;
}

// Show country details
function showDetails(country) {
    detailsDiv.innerHTML = `
        <div class="details-card" style="text-align:center;">
            <button id="backBtn" class="back-btn" style="margin-bottom:24px;">⬅ Back</button>
            <h2 style="font-size:2.2rem; color:#2d7ff9; margin-bottom:18px;">${country.name?.common || ''}</h2>
            <img src="${country.flags?.png || ''}" alt="flag" style="width:160px; height:auto; border-radius:12px; box-shadow:0 2px 16px rgba(44,62,80,0.10); margin-bottom:24px;">
            <div style="font-size:1.1rem; margin-top:10px;">
                <p><strong>Official Name:</strong> ${country.name?.official || ''}</p>
                <p><strong>Capital:</strong> ${Array.isArray(country.capital) ? country.capital.join(", ") : '-'}</p>
                <p><strong>Region:</strong> ${country.region || ''}</p>
                <p><strong>Subregion:</strong> ${country.subregion || ''}</p>
                <p><strong>Population:</strong> ${typeof country.population === "number" ? country.population.toLocaleString() : ''}</p>
                <p><strong>Languages:</strong> ${country.languages ? Object.values(country.languages).join(", ") : '-'}</p>
                <p><strong>Currencies:</strong> ${
                    country.currencies
                    ? Object.values(country.currencies).map(cur => `${cur.name} (${cur.symbol})`).join(", ")
                    : '-'
                }</p>
            </div>
        </div>
    `;
    detailsDiv.style.display = "block";
    document.querySelector("table").style.display = "none";
    document.querySelector(".pager").style.display = "none";
    statusDiv.style.display = "none";
    document.getElementById("backBtn").onclick = () => {
        detailsDiv.style.display = "none";
        document.querySelector("table").style.display = "";
        document.querySelector(".pager").style.display = "";
        statusDiv.style.display = "";
    };
}

// Events
searchInput.addEventListener("input", debounce(() => load(1), 300));
regionSelect.addEventListener("change", () => load(1));
sortSelect.addEventListener("change", () => load(1));
orderSelect.addEventListener("change", () => load(1));
prevBtn.addEventListener("click", () => load(currentPage - 1));
nextBtn.addEventListener("click", () => load(currentPage + 1));

// Debounce helper
function debounce(fn, delay) {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => fn(...args), delay);
    };
}

// Initial load
load();