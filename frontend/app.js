const BACKEND_URL = "https://securepath-backend.onrender.com";

// Keep-alive ping every 14 minutes to prevent Render cold starts
setInterval(() => {
    fetch(`${BACKEND_URL}/`).catch(() => {});
}, 14 * 60 * 1000);

// Fetch with auto-retry: on network failure, waits delayMs then tries once more.
// This handles Render cold starts — the first request wakes the server,
// the retry (after 8s) hits it once it's up.
async function fetchWithRetry(url, options = {}, delayMs = 8000) {
    try {
        return await fetch(url, options);
    } catch (firstErr) {
        console.warn("Backend unreachable, may be waking up. Retrying in", delayMs / 1000, "seconds...");
        await new Promise(resolve => setTimeout(resolve, delayMs));
        return await fetch(url, options); // throws naturally if it fails again
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const shortenBtn = document.getElementById("shortenBtn");
    const urlInput = document.getElementById("urlInput");
    const aliasInput = document.getElementById("aliasInput");
    const dashboardBody = document.getElementById("analyticsTableBody");
    const refreshBtn = document.getElementById("refreshBtn");
    const clearBtn = document.getElementById("clearBtn");

    let isFetching = false;

    // Silently wake the backend the moment the page loads
    fetch(`${BACKEND_URL}/`).catch(() => {});

    fetchAnalyticsHistory();

    // --- MAIN PIPELINE ---
    if (shortenBtn) {
        shortenBtn.addEventListener("click", async (e) => {
            e.preventDefault();

            const originalUrl = urlInput.value.trim();
            const customAlias = aliasInput ? aliasInput.value.trim() : "";

            if (!originalUrl) {
                alert("Please enter a valid URL.");
                return;
            }

            shortenBtn.disabled = true;
            const originalBtnText = shortenBtn.innerText;
            shortenBtn.innerText = "Scanning AI...";

            try {
                const response = await fetchWithRetry(
                    `${BACKEND_URL}/shorten`,
                    {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            original_url: originalUrl,
                            custom_alias: customAlias
                        })
                    }
                    // On cold start: first fetch fails → waits 8s → retries automatically
                    // Button stays disabled during this so user knows it's working
                );

                if (!response.ok) {
                    const rawServerText = await response.text();
                    throw new Error(rawServerText);
                }

                urlInput.value = "";
                if (aliasInput) aliasInput.value = "";

                await fetchAnalyticsHistory();
                alert("Success! Link shortened successfully.");

            } catch (error) {
                alert("SERVER NOTIFICATION:\n" + error.message);
                console.error(error);
            } finally {
                shortenBtn.innerText = originalBtnText;
                shortenBtn.disabled = false;
            }
        });
    }

    // --- REFRESH BUTTON ---
    if (refreshBtn) {
        refreshBtn.addEventListener("click", async () => {
            refreshBtn.innerText = "Refreshing...";
            await fetchAnalyticsHistory();
            refreshBtn.innerText = "Refresh Data";
        });
    }

    // --- CLEAR DASHBOARD ---
    if (clearBtn) {
        clearBtn.addEventListener("click", async () => {
            const confirmDelete = confirm("Are you sure you want to clear all analytics data? This cannot be undone.");
            if (confirmDelete) {
                try {
                    const response = await fetch(`${BACKEND_URL}/clear-all`, { method: "DELETE" });
                    if (response.ok) {
                        await fetchAnalyticsHistory();
                        alert("Dashboard completely cleared.");
                    } else {
                        alert("Failed to clear dashboard.");
                    }
                } catch (error) {
                    console.error("Error clearing dashboard:", error);
                }
            }
        });
    }

    // --- FETCH & RENDER TABLE ---
    async function fetchAnalyticsHistory() {
        if (!dashboardBody) return;
        if (isFetching) return;
        isFetching = true;
        try {
            const response = await fetch(`${BACKEND_URL}/analytics`);
            if (response.ok) {
                const data = await response.json();
                renderDashboardTable(data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            isFetching = false;
        }
    }

    function renderDashboardTable(linksArray) {
        dashboardBody.innerHTML = "";
        if (!linksArray || linksArray.length === 0) {
            dashboardBody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:#718096; padding:20px;">No links analyzed yet.</td></tr>`;
            return;
        }
        linksArray.forEach(link => {
            const row = document.createElement("tr");

            const statusStr = (link.safety_status || "Safe").toLowerCase();
            let badgeClass = "badge-safe";
            if (statusStr === "suspicious") badgeClass = "badge-warning";
            if (statusStr === "dangerous") badgeClass = "badge-danger";

            const clickableShortUrl = `${BACKEND_URL}/${link.short_code}`;

            row.innerHTML = `
                <td class="truncate">${link.original_url}</td>
                <td><a href="${clickableShortUrl}" target="_blank">${clickableShortUrl}</a></td>
                <td><img src="https://api.qrserver.com/v1/create-qr-code/?size=60x60&data=${encodeURIComponent(clickableShortUrl)}" width="45" height="45"/></td>
                <td style="text-align:center;">${link.clicks || 0}</td>
                <td><span class="status-badge ${badgeClass}">${link.safety_status || "Safe"}</span></td>
                <td>${link.safety_reason || "Clean"}</td>
            `;
            dashboardBody.appendChild(row);
        });
    }
});