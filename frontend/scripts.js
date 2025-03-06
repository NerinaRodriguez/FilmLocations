const inputs = {
    title: document.getElementById('title'),
    production_company: document.getElementById('company'),
    distributor: document.getElementById('distributor'),
    director: document.getElementById('director'),
    writer: document.getElementById('writer'),
    minimum: document.getElementById('minimum'),
    maximum: document.getElementById('maximum')
};

const listsSuggestions = {
    title: document.getElementById('listSuggestionsTitle'),
    production_company: document.getElementById('listSuggestionsCompany'),
    distributor: document.getElementById('listSuggestionsDistributor'),
    director: document.getElementById('listSuggestionsDirector'),
    writer: document.getElementById('listSuggestionsWriter')
};

const divsSuggestions = {
    title: document.getElementById('divSuggestionsTitle'),
    production_company: document.getElementById('divSuggestionsCompany'),
    distributor: document.getElementById('divSuggestionsDistributor'),
    director: document.getElementById('divSuggestionsDirector'),
    writer: document.getElementById('divSuggestionsWriter')
};

const options = {
    title: document.getElementById('optionsTitle'),
    production_company: document.getElementById('optionsCompany'),
    distributor: document.getElementById('optionsDistributor'),
    director: document.getElementById('optionsDirector'),
    writer: document.getElementById('optionsWriter')
};

//Event ID to maintain the effect of the last triggered event since event handlers are executed asynchronously
const idsLastEvent = {
    title: 0,
    production_company: 0,
    distributor: 0,
    director: 0,
    writer: 0
};

//Load map
const map = L.map('map').setView([37.75, -122.48], 12);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>contributors'}).addTo(map);

const markers = L.layerGroup().addTo(map);

async function apply() {
    var query = "";

    if (inputs["minimum"].value.length > 0) {
        query += "minimum=" + inputs["minimum"].value;
    } else {
        query += "minimum=0";
    }
    
    if (inputs["maximum"].value.length > 0) {
        query += "&maximum=" + inputs["maximum"].value;
    } else {
        query += "&maximum=9999";
    }
    
    Object.keys(inputs).forEach(function(key) {
        if (key != "minimum" && key != "maximum") {
            if (inputs[key].value.length > 0) {
                query += "&" + key + "," + options[key].value + "=" + encodeURIComponent(inputs[key].value);
            }
        }
    });
    
    let result = await fetch(`http://localhost/FilmLocations/backend?${query}`);
    
    if(!result.ok){
        console.error('Error: ', error);
    }
    
    let data = await result.json();
    
    markers.clearLayers();
    
    data.forEach(location => {
        if (location.latitude && location.longitude) {
            let marker = L.marker([location.latitude, location.longitude]).addTo(markers);
            let popupContent = '<b>' + location.title + '</b>' + '<p>' + '<b>Release Year:</b> ' + location.release_year + '<br>' + '<b>Director:</b> ' + location.director + '<br>' + '<b>Locations:</b> ' + location.locations + '</p>';
            marker.bindPopup(popupContent)
        }
    });
}

function clearInputs() {
    Object.keys(inputs).forEach(function(key) {
        inputs[key].value = "";
    });
    
    Object.keys(options).forEach(function(key) {
        options[key].value = "is";
    });
}

//async type function to await fetch to request our API
async function getSuggestions(minimum, maximum, select, idEvent) {
    let result = await fetch(`http://localhost/FilmLocations/backend?minimum=${minimum}&maximum=${maximum}&select=${select}&${select}=${inputs[select].value}`);
    
    if(!result.ok){
        console.error('Error: ', error);
    }
    
    let data = await result.json();
    
    if (idEvent === idsLastEvent[select]) {
        if (!(data.length > 0)) {
            listsSuggestions[select].innerHTML = '';
            divsSuggestions[select].style.display = 'none';
        }
        return data;
    } else {
        return [];
    }
}

//async type function to await getSuggestions to request our API
async function eventHandler(field, event) {
    const idEvent = ++idsLastEvent[field];

    if (inputs[field].value.length > 0) {
        const suggestions = await getSuggestions(0, 9999, field, idEvent);
        
        if (suggestions.length > 0) {
            listsSuggestions[field].innerHTML = '';
            suggestions.forEach(suggestion => {
                const item = document.createElement('li');
                item.textContent = suggestion[field];
                
                item.addEventListener('click', function () {
                    inputs[field].value = suggestion[field];
                    listsSuggestions[field].innerHTML = '';
                });
                
                listsSuggestions[field].appendChild(item);
            });

            divsSuggestions[field].style.display = 'block';
        }
    } else {
        if (idEvent === idsLastEvent[field]) {
            listsSuggestions[field].innerHTML = '';
            divsSuggestions[field].style.display = 'none';
        }
    }
}

//Event listeners for autocomplete search
Object.keys(inputs).forEach(function(key) {
    if (key != "minimum" && key != "maximum") {
        inputs[key].addEventListener('keyup', function (event) {
            eventHandler(key, event);
        });
    }
});

//Locate all the markers on the map
apply();

//Hide the suggestions divs on click
document.addEventListener('click', function () {
    const element = document.querySelectorAll('.divSuggestions');
    for (let i = 0; i < element.length; i++) {
        element[i].style.display = 'none';
    }
});
