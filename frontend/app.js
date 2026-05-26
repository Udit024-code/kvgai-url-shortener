const API_BASE = "http://127.0.0.1:8000";

// Action: Intercept Form Submissions
document.getElementById('shortenBtn').addEventListener('click', async () => {
    const urlValue = document.getElementById('urlInput').value.trim();
    if(!urlValue) {
        alert("Please provide a valid URL string.");
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/shorten`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ original_url: urlValue })
        });

        if(response.ok) {
            document.getElementById('urlInput').value = '';
            fetchAnalytics(); // Instantly reload table with the new link
        } else {
            alert("Error connecting with backend shortening services.");
        }
    } catch (err) {
        console.error("Transmission interruption:", err);
    }
});

// Action: Fetch Data Rows and Display Badges Dynamically
async function fetchAnalytics() {
    try {
        const response = await fetch(`${API_BASE}/analytics`);
        if(!response.ok) return;

        const data = await response.json();
        const tbody = document.getElementById('analyticsTableBody');
        tbody.innerHTML = ''; // Clear previous fields

        // Reverse iterate so newest short links appear right at the top
        data.reverse().forEach(item => {
            const tr = document.createElement('tr');
            
            // Set appropriate badge styling context
            let badgeClass = 'safe';
            if(item.safety_status.toLowerCase() === 'suspicious') badgeClass = 'suspicious';
            if(item.safety_status.toLowerCase() === 'dangerous') badgeClass = 'dangerous';

            // THE FIX: Using ${API_BASE}/${item.short_code} instead of the undefined short_url
            tr.innerHTML = `
                <td style="max-width: 250px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                    <a href="${item.original_url}" target="_blank">${item.original_url}</a>
                </td>
                <td><a href="${API_BASE}/${item.short_code}" target="_blank">${API_BASE}/${item.short_code}</a></td>
                <td><strong>${item.clicks}</strong></td>
                <td><span class="badge ${badgeClass}">${item.safety_status}</span></td>
                <td style="color: #475569; font-size: 14px;">${item.safety_reason}</td>
            `;
            tbody.appendChild(tr);
        });
    } catch (err) {
        console.error("Dashboard synchronization error:", err);
    }
}

// Action: Wipes out data rows via API call
document.getElementById('clearBtn').addEventListener('click', async () => {
    if (confirm("Are you sure you want to permanently clear all dashboard analytics data?")) {
        try {
            const response = await fetch(`${API_BASE}/clear-all`, { method: 'DELETE' });
            if (response.ok) {
                fetchAnalytics(); // Instantly update frontend table to empty state
            } else {
                alert("Failed to clear database logs.");
            }
        } catch (err) {
            console.error("Wipe command transmission error:", err);
        }
    }
});

// Event Loop Links
document.getElementById('refreshBtn').addEventListener('click', fetchAnalytics);
window.addEventListener('DOMContentLoaded', fetchAnalytics);