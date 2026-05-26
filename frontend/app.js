// We define our FastAPI backend address here
const API_BASE_URL = "http://127.0.0.1:8000";

// 1. Logic to handle the form submission
document.getElementById('shorten-form').addEventListener('submit', async (e) => {
    e.preventDefault(); 
    const longUrl = document.getElementById('long-url').value;

    try {
        const response = await fetch(`${API_BASE_URL}/shorten`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ original_url: longUrl })
        });

        if (response.ok) {
            const data = await response.json();
            
            const resultDiv = document.getElementById('result');
            const shortLinkA = document.getElementById('short-link');
            
            shortLinkA.href = data.short_url;
            shortLinkA.textContent = data.short_url;
            resultDiv.classList.remove('hidden');

            fetchAnalytics(); // Refresh table after creating a link
        } else {
            alert("Oops! Something went wrong shortening the URL.");
        }
    } catch (error) {
        console.error("Error communicating with backend:", error);
    }
});

// 2. Logic to fetch and display the Analytics Table
async function fetchAnalytics() {
    try {
        const response = await fetch(`${API_BASE_URL}/analytics`, { cache: 'no-store' });
        const data = await response.json();

        const tbody = document.querySelector('#analytics-table tbody');
        tbody.innerHTML = ''; 

        data.forEach(link => {
            const row = document.createElement('tr');
            
            const displayUrl = link.original_url.length > 30 ? link.original_url.substring(0, 30) + '...' : link.original_url;

            // Determine which CSS badge class to apply based on what the AI said
            let badgeClass = "badge-safe";
            if (link.safety_status === "Suspicious") badgeClass = "badge-suspicious";
            if (link.safety_status === "Dangerous") badgeClass = "badge-dangerous";

            row.innerHTML = `
                <td><a href="${link.original_url}" target="_blank">${displayUrl}</a></td>
                <td><a href="${API_BASE_URL}/${link.short_code}" target="_blank">${link.short_code}</a></td>
                <td><span class="badge ${badgeClass}">${link.safety_status}</span></td>
                <td style="font-size: 14px; color: #555;"><em>${link.safety_reason}</em></td>
                <td><strong>${link.clicks}</strong></td>
            `;
            tbody.appendChild(row);
        });
    } catch (error) {
        console.error("Error fetching analytics:", error);
    }
}

// 3. Attach the refresh button (THIS is what makes the button alive!)
document.getElementById('refresh-analytics').addEventListener('click', fetchAnalytics);

// 4. Automatically load the table data when you open the page
fetchAnalytics();