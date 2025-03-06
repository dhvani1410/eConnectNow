let currentPage = 1;
let totalRecords = 0;
const pageSize = 10;

document.addEventListener("DOMContentLoaded", () => {
    populateVodStatusDropdown();
    fetchData();
});

function populateVodStatusDropdown() {
    const vodStatusDropdown = document.getElementById("vodStatus");
    const statuses = [
        "","Not required", "Cancelled", "On-hold", "Pending", "In Progress", 
        "Awaiting review", "Awaiting quality control", "Awaiting captions", 
        "Awaiting Media Ingest", "Awaiting posting", "Complete - video posted"
    ];
    
    vodStatusDropdown.innerHTML = statuses.map(status => `<option value="${status}">${status}</option>`).join("");
}

async function fetchData(resetPage = false) {
 
    if (resetPage) {
        currentPage = 1; // Reset to the first page when a new search is triggered
    }

    const vodFileName = document.getElementById("vodFileName").value.trim();
    const vodNumber = document.getElementById("vodNumber").value.trim();
    const vodStatus = document.getElementById("vodStatus").value;

    let query = [];
    if (vodFileName) query.push(`vod_file_nameLIKE${encodeURIComponent(vodFileName)}`);
    if (vodNumber) query.push(`numberSTARTSWITH${encodeURIComponent(vodNumber)}`);
    if (vodStatus) query.push(`vod_status=${encodeURIComponent(vodStatus)}`);

    const queryString = query.length
        ? `?sysparm_query=${query.join("%5E")}&sysparm_limit=${pageSize}&sysparm_offset=${(currentPage - 1) * pageSize}`
        : `?sysparm_limit=${pageSize}&sysparm_offset=${(currentPage - 1) * pageSize}`;

    const url = `https://c1bwpmamap02.lib.loc.gov/eConnectNowAPI/api/now/table/x_g_lon_eess_event_video_support${queryString}`;
    
    const useDummyData = true; // Change to `false` when ready to use the actual API

    try {
        let data;
        
        if (useDummyData) {
            const response = await fetch('./dummyData.json'); // Load dummy JSON file
            if (!response.ok) {
                alert('ERR');
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            data = await response.json();
        } else {
            const username = "ia.emam.user";
            const password = "ygGYz$qOul!vvO$8hcT9M#kxC]tPStTJS==5C{hP";
            const headers = new Headers();
            headers.set('Authorization', 'Basic ' + btoa(username + ":" + password));
            headers.set('Accept', 'application/json');

            const response = await fetch(url, { method: 'GET', headers: headers });
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            totalRecords = parseInt(response.headers.get("X-total-count")) || 0;
            data = await response.json();
        }

        populateTable(data.result);
        updatePagination();
    } catch (error) {
        console.error('Fetch error:', error);
    }
}


function populateTable(data) {
    const tbody = document.querySelector("#dataTable tbody");
    tbody.innerHTML = "";
    
    data.forEach(item => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td><a href="#" onclick="showDetails('${item.sys_id}')">${item.number || 'N/A'}</a></td>
            <td>${item.vod_title || 'N/A'}</td>
            <td>${item.vod_description || 'N/A'}</td>
            <td>${item.vod_status || 'N/A'}</td>
            <td>${item.sys_updated_on || 'N/A'}</td>
            <td>${item.vod_notes || 'N/A'}</td>
        `;
        tbody.appendChild(row);
    });
}
function showDetails(sys_id) {
    window.open(`details.html?sys_id=${sys_id}`, '_details', 'width=800,height=600');
}
function updatePagination() {
    const totalPages = Math.ceil(totalRecords / pageSize);

    // If the current page exceeds total pages after a search, reset it
    if (currentPage > totalPages) {
        currentPage = totalPages > 0 ? totalPages : 1;
    }

    document.getElementById("pageInfo").innerText = `Page ${currentPage} of ${totalPages}`;
    document.getElementById("prevBtn").disabled = currentPage <= 1;
    document.getElementById("nextBtn").disabled = currentPage >= totalPages || totalRecords === 0;
}


function prevPage() {
    if (currentPage > 1) {
        currentPage--;
        fetchData();
    }
}

function nextPage() {
    if (currentPage * pageSize < totalRecords) {
        currentPage++;
        fetchData();
    }
}
