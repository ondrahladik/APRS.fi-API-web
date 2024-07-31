document.addEventListener('DOMContentLoaded', function() {
    const url = 'api-proxy.php?name=MYCALL-1&what=loc'; // Change to your call sign !!!

    /* 

    The call sign must be in the APRS.fi database, it is also possible to list multiple call signs. 

    For example: const url = 'api-proxy.php?name=MYCALL-1,MYCALL-2,MYCALL-9&what=loc'; 

    */

    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok ' + response.statusText);
            }
            return response.text();
        })
        .then(data => {
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(data, 'application/xml');
            
            if (xmlDoc.getElementsByTagName('parsererror').length) {
                throw new Error('Error parsing XML');
            }

            const entries = xmlDoc.getElementsByTagName('entry');
            const tbody = document.getElementById('dataBody');

            const map = L.map('map');
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            }).addTo(map);

            const markers = [];

            for (let i = 0; i < entries.length; i++) {
                const entry = entries[i];

                const nameElement = entry.getElementsByTagName('name')[0];
                const latElement = entry.getElementsByTagName('lat')[0];
                const lngElement = entry.getElementsByTagName('lng')[0];
                const symbolElement = entry.getElementsByTagName('symbol')[0];
                const timeElement = entry.getElementsByTagName('time')[0];
                const lasttimeElement = entry.getElementsByTagName('lasttime')[0];
                const srccallElement = entry.getElementsByTagName('srccall')[0];
                const dstcallElement = entry.getElementsByTagName('dstcall')[0];
                const commentElement = entry.getElementsByTagName('comment')[0];
                const pathElement = entry.getElementsByTagName('path')[0];

                const name = nameElement ? nameElement.textContent : '';
                const lat = latElement ? latElement.textContent : '';
                const lng = lngElement ? lngElement.textContent : '';
                const symbol = symbolElement ? symbolElement.textContent : '';
                const time = timeElement ? timeElement.textContent : '';
                const lasttime = lasttimeElement ? lasttimeElement.textContent : '';
                const srccall = srccallElement ? srccallElement.textContent : '';
                const dstcall = dstcallElement ? dstcallElement.textContent : '';
                const comment = commentElement ? commentElement.textContent : '';
                const path = pathElement ? pathElement.textContent : '';

                if (!lat || !lng) {
                    continue; 
                }

                const symbolImage = `<div class="symbol-container">${getAPRSSymbolImageTag(symbol)}</div>`;

                const formattedTime = formatDate(time);
                const formattedLastTime = formatDate(lasttime);

                const location = `${lat}, ${lng}`;

                const aprsLink = `https://aprs.fi/info/a/${name}`;

                const locator = calculateLocator(parseFloat(lat), parseFloat(lng));

                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${symbolImage}</td> <!-- Use the symbol image here -->
                    <td><a href="${aprsLink}" target="_blank">${name}</a></td>
                    <td>${location}</td>
                    <td>${locator}</td>
                    <td>${formattedTime}</td>
                    <td>${formattedLastTime}</td>
                    <td>${srccall}</td>
                    <td>${dstcall}</td>
                    <td>${comment}</td>
                    <td>${path}</td>
                `;
                tbody.appendChild(row);

                const iconHtml = symbolImage;

                const customIcon = L.divIcon({
                    html: iconHtml,
                    className: 'custom-icon', 
                    iconSize: [30, 30],
                    iconAnchor: [15, 15] 
                });

                const marker = L.marker([lat, lng], { icon: customIcon }).addTo(map)
                    .bindPopup(`<b>${name}</b>`);
                markers.push(marker);
            }

            const group = new L.featureGroup(markers);
            map.fitBounds(group.getBounds().pad(0.3)); 
        })
        .catch(error => {
            console.error('Error fetching the XML data:', error);
            const tbody = document.getElementById('dataBody');
            tbody.innerHTML = `<tr><td colspan="9">Error loading data: ${error.message}</td></tr>`;
        });
});

function formatDate(unixTime) {
    const date = new Date(parseInt(unixTime) * 1000);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;
}

function calculateLocator(lat, lon) {
    const A = "A".charCodeAt(0);

    lat += 90.0;
    lon += 180.0;

    const fieldLat = Math.floor(lat / 10);
    const fieldLon = Math.floor(lon / 20);
    const squareLat = Math.floor(lat % 10);
    const squareLon = Math.floor(lon % 20 / 2);
    const subSquareLat = Math.floor((lat % 1) * 24);
    const subSquareLon = Math.floor(((lon % 2) / 2) * 24);

    const locator = String.fromCharCode(A + fieldLon) +
                    String.fromCharCode(A + fieldLat) +
                    squareLon.toString() +
                    squareLat.toString() +
                    String.fromCharCode(A + subSquareLon) +
                    String.fromCharCode(A + subSquareLat);

    return locator;
}
