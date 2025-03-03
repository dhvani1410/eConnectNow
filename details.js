document.addEventListener("DOMContentLoaded", async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const sys_id = urlParams.get("sys_id");
    if (!sys_id) {
        document.body.innerHTML = "<h2>Error: No VOD ID provided.</h2>";
        return;
    }
    
    const url = `https://c1bwpmamap02.lib.loc.gov/eConnectNowAPI/api/now/table/x_g_lon_eess_event_video_support?sysparm_query=sys_id=${sys_id}`;
    const username = "ia.emam.user";
    const password = "ygGYz$qOul!vvO$8hcT9M#kxC]tPStTJS==5C{hP";
    const headers = new Headers();
    headers.set('Authorization', 'Basic ' + btoa(username + ":" + password));
    headers.set('Accept', 'application/json');
    
    try {
        const response = await fetch(url, { method: 'GET', headers: headers });
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.json();
        if (data.result.length === 0) {
            document.body.innerHTML = "<h2>No details found for this VOD.</h2>";
            return;
        }
        
        populateDetails(data.result[0]);
    } catch (error) {
        console.error("Fetch error:", error);
        document.body.innerHTML = "<h2>Error fetching details.</h2>";
    }
});

function populateDetails(details) {
    const tbody = document.querySelector("#detailsTable tbody");
    tbody.innerHTML = "";
    
    Object.keys(details).forEach(key => {
        let value = details[key] || 'N/A';
        
        // Handle nested objects
        if (typeof value === 'object' && value !== null) {
            if (value.hasOwnProperty('link')) {
                value = `<a href="${value.link}" target="_blank">View</a>`; // Show hyperlink if available
            } else {
                value = JSON.stringify(value); // Fallback for other objects
            }
        }
        
        const row = document.createElement("tr");
        row.innerHTML = `<td><strong>${key}</strong></td><td>${value}</td>`;
        tbody.appendChild(row);
    });
}