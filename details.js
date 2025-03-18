document.addEventListener("DOMContentLoaded", async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const sys_id = urlParams.get("sys_id");
    if (!sys_id) {
        document.body.innerHTML = "<h2>Error: No VOD ID provided.</h2>";
        return;
    }

    const useDummyData = true; // Set to false to use the API instead

    if (useDummyData) {
        try {
            const response = await fetch('./dummyData.json'); // Load dummy data
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();
            const filteredData = data.result.find(item => item.sys_id === sys_id);

            if (!filteredData) {
                document.body.innerHTML = "<h2>No details found for this VOD.</h2>";
                return;
            }

            populateDetails(filteredData);
        } catch (error) {
            console.error("Fetch error:", error);
            document.body.innerHTML = "<h2>Error fetching details from dummy data.</h2>";
        }
    } else {
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
    // Adding button to save data to Emma
    const closeButton = document.getElementById('closebutton');

    const button = document.createElement('button');
    button.textContent = 'Send To Emm';
    button.className = 'emm-button'; // Added class instead of inline style
    button.setAttribute('onclick', `SendDataToEmm('${details.sys_id}')`);
    closeButton.parentNode.insertBefore(button, closeButton.nextSibling);
}

async function SendDataToEmm(sys_id) {
    
    const useDummyData = true; // Set to false to use the API instead

    if (useDummyData) {
        try {
            const response = await fetch('./dummyData.json'); // Load dummy data
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();
            const filteredData = data.result.find(item => item.sys_id === sys_id);

            if (!filteredData) {
                document.body.innerHTML = "<h2>No details found for this VOD.</h2>";
                return;
            }

            Saveinemma(filteredData);
        } catch (error) {
            console.error("Fetch error:", error);
            document.body.innerHTML = "<h2>Error fetching details from dummy data.</h2>";
        }
    } else {
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

            Saveinemma(data.result[0]);
        } catch (error) {
            console.error("Fetch error:", error);
            document.body.innerHTML = "<h2>Error fetching details.</h2>";
        }
    }
}

async function Saveinemma(data) 
{
    const configResponse = await fetch("config.json");
    const config = await configResponse.json();
    const apiURL = config.systemFields.apiURL;
    const projectFileVirtualPath = config.systemFields.projectVirtualPath
    const projectPath = config.systemFields.projectPath;
    const metadataSetId = config.systemFields.metadataSetId;
    const assetMetadataSetId = config.systemFields.assetMetadataSetId;
    const rawAuthToken = config.systemFields.authToken;

    if (!apiURL || !projectPath || !metadataSetId || !rawAuthToken || !assetMetadataSetId || !projectFileVirtualPath) {
        throw new Error("❌ Missing required fields in config.json");
    }

    // Base64 encode the auth token
    const encodedAuthToken = btoa(rawAuthToken);
    let currentdate = new Date();
    let year = currentdate.getFullYear();
    const storageId = 1016;
    let maintitle = data.vod_title.replace(/ /g, '_');
    let title =`${data.number}_${year}_${maintitle}_${storageId}`;
    const projectName = title;
    //Its AWS S3 Storage ID
    
    console.log("Final Storage ID Used:", storageId);
    const pr_projectFileName = `${projectName}.prproj`;
    const pr_projectFilePath = `${projectPath}${pr_projectFileName}`;
    const pr_projectFileVirtualPath = `${projectFileVirtualPath}/${pr_projectFileName}`;

     // ✅ After Effects Asset Information
    const ae_projectFileName = `${projectName}_MoGFX.aep`;
    const ae_projectFilePath = `${projectPath}${ae_projectFileName}`;
    const ae_projectFileVirtualPath = `${projectFileVirtualPath}/${ae_projectFileName}`;
    
    // Dynamically map metadataFieldId values
    const metadataValues = [
        {"metadataFieldId": 1675,"metadataValue": data.number},
        {"metadataFieldId": 1669,"metadataValue": `${year}`},
        {"metadataFieldId": 1260,"metadataValue": projectName},
        {"metadataFieldId": 1673,"metadataValue": 1016}
    ];
    const pr_payload = {
        "projectName": projectName,
        "projectDescription": "Generated via Web Form - Premiere",
        "users": [],
        "collectionName": "Default Collection",
        "metadataSetId": metadataSetId,
        "metadataValues": metadataValues,
        "storageId": storageId,
        "projectFileName": pr_projectFileName,
        "projectFilePath": pr_projectFilePath,
        "projectFileVirtualPath": pr_projectFileVirtualPath,
        "projectType": "Premiere",
        "categoryPaths": [`Active/${projectName}/Project Files`]
    };

    console.log("Premiere Project Payload:", JSON.stringify(pr_payload, null, 2));
    const pr_response = await fetch(`${apiURL}Projects`, {
        method: "POST",
        headers: {
            "Authorization": `Basic ${encodedAuthToken}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify(pr_payload)
    });
    const pr_result = await pr_response.json();
    if (pr_response.ok) {
        console.log("✅ Premiere Project Created Successfully!", pr_result);
        
    } else {
        console.error("❌ Failed to Create Premiere Project:", pr_result);
        return; // Stop execution if Premiere Project fails
    }
    const premiereProjectId = pr_result.id; // Ensure this field exists in the response
    const premiereProjectVesionId = pr_result.projectVersionId;
    console.log("✅ Extracted Premiere Project ID:", premiereProjectId);
    console.log("✅ Extracted Premiere Project Version ID:", premiereProjectVesionId);
    // ✅ Prepare request payload for After Effects Asset
    const asset_payload = {
        "title": `${projectName}_MoGFX`,
        "fileName": ae_projectFileName,
        "description": "AEP File created using the Create Project script",
        "author": "API User",
        "assetType": "Video",
        "storageId": storageId,
        "originalVirtualPath": ae_projectFileVirtualPath,
        "originalFilePath": ae_projectFilePath,
        "size": 12, // Change this to the actual file size if needed
        "projects": [
            {
                "projectId": premiereProjectId, // Linking it to the Premiere Project
                "projectVersionId": premiereProjectVesionId
            }
        ],
        "categoryPaths": [`Active/${projectName}/Project Files`],
        "metadataSetId": assetMetadataSetId,
        "customMetadata": metadataValues
    };

    console.log("Asset Payload:", JSON.stringify(asset_payload, null, 2));
     // ✅ Make API request for After Effects Asset
    const asset_response = await fetch(`${apiURL}assets`, {
        method: "POST",
        headers: {
            "Authorization": `Basic ${encodedAuthToken}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify(asset_payload)
    });
    const asset_result = await asset_response.json();
    if (asset_response.ok) {
        console.log("✅ After Effects Asset Created Successfully!", asset_result);
        await createCategoriesInEMAM("Standard", projectName);
        alert("✅ Premiere Project and After Effects Asset successfully created in eMAM!");
        window.close();
    } else {
        console.error("❌ Failed to Create After Effects Asset:", asset_result);
        alert("❌ Failed to Create After Effects Asset.");
    }
    
}
///
async function createCategoriesInEMAM(templateName, projectName) {
    try {
        // Load config.json dynamically
        const configResponse = await fetch("config.json");
        const config = await configResponse.json();

        // Extract system fields
        const apiURL = config.systemFields.apiURL;
        const rawAuthToken = config.systemFields.authToken; // This is not yet encoded

        if (!apiURL || !rawAuthToken) {
            throw new Error("Missing required fields in config.json");
        }

        // Base64 encode the auth token
        const encodedAuthToken = btoa(rawAuthToken);

        // Extract category paths from the selected template
        const templates = config.templates;
        let categoryPaths = [];

        for (const template of templates) {
            if (template.name === templateName) {
                categoryPaths = template.categoryPaths || [];
                break;
            }
        }

        if (categoryPaths.length === 0) {
            throw new Error("No category paths found for the selected template.");
        }

        // Dynamically update category paths to include "Active/${projectName}/"
        const updatedCategoryPaths = categoryPaths.map(path => `Active/${projectName}/${path}`);

        // Prepare request payload with parentCategoryId: 0
        const payload = {
            "categoryPaths": updatedCategoryPaths,
            "parentCategoryId": 0
        };

        // Make API request
        const response = await fetch(`${apiURL}Categories`, {
            method: "POST",
            headers: {
                "Authorization": `Basic ${encodedAuthToken}`, // Use Base64 encoded auth token
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });

        const result = await response.json();
        if (response.ok) {
            //alert("✅ Categories created successfully in eMAM!");
            console.log("eMAM API Response:", result);
        } else {
            alert("❌ Failed to create categories in eMAM.");
            console.error("eMAM API Error:", result);
        }
    } catch (error) {
        alert("❌ Network error while creating categories.");
        console.error("Network Error:", error);
    }
}