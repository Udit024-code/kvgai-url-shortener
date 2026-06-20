const BACKEND_URL = "https://securepath-backend.onrender.com";
const COLD_START_WARNING_MS = 4000; // if a request takes longer than this, assume Render is waking up

document.addEventListener("DOMContentLoaded", () => {
    const shortenForm = document.getElementById("shortenForm");
    const shortenBtn = document.getElementById("shortenBtn");
    const urlInput = document.getElementById("urlInput");
    const aliasInput = document.getElementById("aliasInput");
    const dashboardBody = document.getElementById("analyticsTableBody");
    const refreshBtn = document.getElementById("refreshBtn");
    const clearBtn = document.getElementById("clearBtn");
    const statusDot = document.querySelector(".status-dot");
    const statusText = document.getElementById("statusText");

    pingHealth();
    fetchAnalyticsHistory();

    // --- TOASTS (replaces alert()) ---
    function showToast(message, type = "info") {
        const container = document.getElementById("toastContainer");
        const toast = document.createElement("div");
        toast.className = `toast ${type}`;
        toast.textContent = message;
        container.appendChild(toast);
        setTimeout(() => toast.remove(), 4000);
    }

    // --- BACKEND HEALTH (lets the header reflect real status) ---
    async function pingHealth() {
        try {
            const res = await fetch(`${BACKEND_URL}/health`);
            if (res.ok) {
                statusDot.classList.remove("offline");
                statusText.textContent = "System Online";
            } else {
                throw new Error("unhealthy");
            }
        } catch {
            statusDot.classList.add("offline");
            statusText.textContent = "Reconnecting...";
        }
    }

    // --- SHORTEN + SCAN ---
    if (shortenForm) {
        shortenForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            const originalUrl = urlInput.value.trim();
            const customAlias = aliasInput ? aliasInput.value.trim() : "";

            if (!originalUrl) {
                showToast("Please enter a valid URL.", "error");
                return;
            }

            shortenBtn.disabled = true;
            const label = shortenBtn.querySelector(".btn-label");
            label.textContent = "Scanning with AI...";

            // If Render's free instance is asleep, this request can take 30-60s.
            // Tell the user what's happening instead of letting the button look frozen.
            const wakeupTimer = setTimeout(() => {
                label.textContent = "Waking up server (cold start)...";
            }, COLD_START_WARNING_MS);

            try {
                const response = await fetch(`${BACKEND_URL}/shorten`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        original_url: originalUrl,
                        custom_alias: customAlias
                    })
                });

                if (!response.ok) {
                    const rawServerText = await response.text();
                    throw new Error(rawServerText || "Something went wrong.");
                }

                await response.json();

                urlInput.value = "";
                if (aliasInput) aliasInput.value = "";

                await fetchAnalyticsHistory();
                showToast("Link shortened and scanned successfully.", "success");

            } catch (error) {
                let message = error.message;
                try {
                    // FastAPI error bodies are JSON like {"detail": "..."}
                    const parsed = JSON.parse(message);
                    message = parsed.detail || message;
                } catch { /* not JSON, use as-is */ }
                showToast(message, "error");
                console.error(error);
            } finally {
                clearTimeout(wakeupTimer);
                shortenBtn.disabled = false;
                label.textContent = "Shorten & Scan";
            }
        });
    }

    // --- REFRESH ---
    if (refreshBtn) {
        refreshBtn.addEventListener("click", () => {
            refreshBtn.disabled = true;
            refreshBtn.textContent = "Refreshing...";
            Promise.all([fetchAnalyticsHistory(), pingHealth()]).finally(() => {
                refreshBtn.disabled = false;
                refreshBtn.textContent = "Refresh";
            });
        });
    }

    // --- CLEAR DASHBOARD ---
    if (clearBtn) {
        clearBtn.addEventListener("click", async () => {
            const confirmDelete = confirm("Clear all analytics data? This cannot be undone.");
            if (!confirmDelete) return;

            try {
                const response = await fetch(`${BACKEND_URL}/clear-all`, { method: "DELETE" });
                if (response.ok) {
                    await fetchAnalyticsHistory();
                    showToast("Dashboard cleared.", "success");
                } else {
                    showToast("Failed to clear dashboard.", "error");
                }
            } catch (error) {
                console.error("Error clearing dashboard:", error);
                showToast("Could not reach the server.", "error");
            }
        });
    }

    // --- COPY TO CLIPBOARD (event delegation, works for dynamically rendered rows) ---
    dashboardBody.addEventListener("click", async (e) => {
        const btn = e.target.closest(".copy-btn");
        if (!btn) return;
        try {
            await navigator.clipboard.writeText(btn.dataset.url);
            const original = btn.textContent;
            btn.textContent = "Copied";
            btn.classList.add("copied");
            setTimeout(() => {
                btn.textContent = original;
                btn.classList.remove("copied");
            }, 1200);
        } catch {
            showToast("Couldn't copy automatically — select the link manually.", "error");
        }
    });

    // --- FETCH & RENDER ---
    function renderSkeleton() {
        dashboardBody.innerHTML = Array.from({ length: 3 }).map(() => `
            <tr class="skeleton-row">
                <td><div class="skeleton-bar" style="width:80%"></div></td>
                <td><div class="skeleton-bar" style="width:60%"></div></td>
                <td><div class="skeleton-bar" style="width:36px;height:36px"></div></td>
                <td><div class="skeleton-bar" style="width:30%"></div></td>
                <td><div class="skeleton-bar" style="width:50%"></div></td>
                <td><div class="skeleton-bar" style="width:90%"></div></td>
            </tr>
        `).join("");
    }

    async function fetchAnalyticsHistory() {
        if (!dashboardBody) return;
        renderSkeleton();
        try {
            const response = await fetch(`${BACKEND_URL}/analytics`);
            if (!response.ok) throw new Error("Failed to load analytics");
            const data = await response.json();
            renderDashboardTable(data);
            updateStats(data);
        } catch (error) {
            console.error(error);
            dashboardBody.innerHTML = `
                <tr><td colspan="6" class="error-state">
                    Couldn't reach the backend. It may be waking up from sleep — try Refresh in about a minute.
                </td></tr>`;
        }
    }

    function updateStats(linksArray) {
        const totalLinks = linksArray.length;
        const totalClicks = linksArray.reduce((sum, l) => sum + (l.clicks || 0), 0);
        const threats = linksArray.filter(
            l => (l.safety_status || "").toLowerCase() !== "safe"
        ).length;

        document.getElementById("statTotal").textContent = totalLinks;
        document.getElementById("statClicks").textContent = totalClicks;
        document.getElementById("statThreats").textContent = threats;
    }

    function renderDashboardTable(linksArray) {
        dashboardBody.innerHTML = "";
        if (!linksArray || linksArray.length === 0) {
            dashboardBody.innerHTML = `
                <tr><td colspan="6" class="empty-state">
                    No links yet — paste a URL above to generate your first AI-scanned short link.
                </td></tr>`;
            return;
        }

        linksArray.forEach(link => {
            const row = document.createElement("tr");

            const statusStr = (link.safety_status || "Safe").toLowerCase();
            let badgeClass = "badge-safe";
            if (statusStr === "suspicious") badgeClass = "badge-warning";
            if (statusStr === "dangerous") badgeClass = "badge-danger";

            const clickableShortUrl = `${BACKEND_URL}/${link.short_code}`;
            const domainPart = BACKEND_URL.replace(/^https?:\/\//, "");

            row.innerHTML = `
                <td data-label="Destination" class="truncate">${escapeHtml(link.original_url)}</td>
                <td data-label="Short URL">
                    <div class="short-url-cell">
                        <a class="short-url-link" href="${clickableShortUrl}" target="_blank" rel="noopener">
                            <span class="short-url-domain">${domainPart}/</span><span class="short-url-code">${escapeHtml(link.short_code)}</span>
                        </a>
                        <button class="copy-btn" data-url="${clickableShortUrl}">Copy</button>
                    </div>
                </td>
                <td data-label="QR">
                    <div class="qr-container">
                        <img src="https://api.qrserver.com/v1/create-qr-code/?size=60x60&data=${encodeURIComponent(clickableShortUrl)}" width="40" height="40" alt="QR code for ${escapeHtml(link.short_code)}"/>
                    </div>
                </td>
                <td data-label="Clicks">${link.clicks || 0}</td>
                <td data-label="Safety"><span class="status-badge ${badgeClass}">${link.safety_status || "Safe"}</span></td>
                <td data-label="AI Analysis" class="reason-text">${escapeHtml(link.safety_reason || "Clean")}</td>
            `;
            dashboardBody.appendChild(row);
        });
    }

    function escapeHtml(str) {
        const div = document.createElement("div");
        div.textContent = str ?? "";
        return div.innerHTML;
    }
});
