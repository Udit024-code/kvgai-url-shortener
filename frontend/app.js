const BACKEND_URL = "https://securepath-backend.onrender.com";

document.addEventListener("DOMContentLoaded", () => {
    const shortenBtn = document.getElementById("shortenBtn");
    const urlInput = document.getElementById("urlInput");
    const aliasInput = document.getElementById("aliasInput");
    const dashboardBody = document.getElementById("analyticsTableBody");

    fetchAnalyticsHistory();

    if (shortenBtn) {
        shortenBtn.addEventListener("click", async (e) => {
            e.preventDefault();
            
            const originalUrl = urlInput.value.trim();
            const customAlias = aliasInput ? aliasInput.value.trim() : "";

            if (!originalUrl) {
                alert("Please enter a valid URL.");
                return;
            }

            const originalBtnText = shortenBtn.innerText;
            shortenBtn.innerText = "Scanning AI...";

            try {
                const response = await fetch(`${BACKEND_URL}/shorten`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        original_url: originalUrl,
                        // 🎯 THE FIX: No more 'null'. It sends a pure string every time.
                        custom_alias: customAlias 
                    })
                });

                if (!response.ok) {
                    const rawServerText = await response.text();
                    throw new Error(rawServerText);
                }

                const data = await response.json();
                
                urlInput.value = "";
                if (aliasInput) aliasInput.value = "";
                
                fetchAnalyticsHistory();
                alert("Success! Link shortened successfully.");

            } catch (error) {
                alert("SERVER NOTIFICATION:\n" + error.message);
                console.error(error);
            } finally {
                shortenBtn.innerText = originalBtnText;
            }
        });
    }

    async function fetchAnalyticsHistory() {
        if (!dashboardBody) return;
        try {
            const response = await fetch(`${BACKEND_URL}/analytics`);
            if (response.ok) {
                const data = await response.json();
                renderDashboardTable(data);
            }
        } catch (error) {
            console.error(error);
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
            const safetyStatus = (link.safety_status || "Safe").toLowerCase();
            const badgeClass = safetyStatus === "safe" ? "badge-safe" : "badge-danger";
            row.innerHTML = `
                <td class="truncate">${link.original_url}</td>
                <td><a href="${link.secure_short_url || link.short_url}" target="_blank">${link.secure_short_url || link.short_url}</a></td>
                <td><img src="${link.qr_code_url || `https://api.qrserver.com/v1/create-qr-code/?size=60x60&data=${encodeURIComponent(link.secure_short_url || link.short_url)}`}" width="45" height="45"/></td>
                <td style="text-align:center;">${link.clicks || 0}</td>
                <td><span class="status-badge ${badgeClass}">${link.safety_status || "Safe"}</span></td>
                <td>${link.ai_threat_summary || "Clean"}</td>
            `;
            dashboardBody.appendChild(row);
        });
    }
});