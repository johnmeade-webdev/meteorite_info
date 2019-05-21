let meteorInfo;
let table = document.querySelector('#table');
let tableCurrentIndex = 0;

apiCall();

function apiCall() {
    fetch('https://data.nasa.gov/resource/gh4g-9sfh.json')
        .then(checkStatus)
        .then(res => res.json())
        .then((data) => {meteorInfo = data; populateData(meteorInfo)})
        .catch(err => console.log(err));
}

function checkStatus(res){
    if (res.ok) {
        return Promise.resolve(res);
    } else {
        return Promise.reject(new Error(res.statusText));
    }
}

// meteorInfo = [{
//     fall: "Fell",
//     geolocation: {
//         latitude: "50.775",
//         longitude: "6.08333"
//         },
//     id: "1",
//     mass: "21",
//     name: "Aachen",
//     nametype: "Valid",
//     recclass: "L5",
//     reclat: "50.775000",
//     reclong: "6.083330",
//     year: "1880-01-01T00:00:00.000"
//     },
//     {
//     fall: "Fell",
//     geolocation: {
//         latitude: "56.18333",
//         longitude: "10.23333"
//         },
//     id: "2",
//     mass: "720",
//     name: "Aarhus",
//     nametype: "Valid",
//     recclass: "H6",
//     reclat: "56.183330",
//     reclong: "10.233330",
//     year: "1951-01-01T00:00:00.000"
//     }
// ]

function createTD(dataPoint){
    let td = document.createElement('td');
    td.innerText = dataPoint;
    return td;
}

function createTH(dataPoint){
    let th = document.createElement('th');
    th.innerText = dataPoint;
    return th;
}

function tableDataCollection(fall,id,mass,name,recclass,reclat,reclong,year){
    let tdArr = [];
    for (let arg in arguments) {
        if(arguments[arg] == undefined){
            arguments[arg] = 'UA';
        }
        tdArr.push(createTD(arguments[arg]));
    }
    return tdArr;
}

function createTableHeader(){
    let headerRow = document.createElement('tr');
    let headerTextArr = ['ID', 'Name', 'Fall', 'Mass(g)', 'Class', 'Latitude', 'Longitude', 'Year'];
    for(let each in headerTextArr){
        headerRow.append(createTH(headerTextArr[each]));
    }
    table.append(headerRow);
}

function createRow(meteor){
    if(meteor.year){
        meteor.year = meteor.year.slice(0,4);
    }

    let tr = document.createElement('tr');
    let td = tableDataCollection(meteor.id, meteor.name, meteor.fall,meteor.mass, meteor.recclass, meteor.reclat, meteor.reclong, meteor.year);
    
    for(let each in td){
        tr.append(td[each]);
    }

    table.appendChild(tr);
}

function populateData(){
    createTableHeader();
    for(let i = 0; i < 20; i++){
        tableCurrentIndex++;
        createRow(meteorInfo[i]);
    }
}

function clearData(){
    while(table.hasChildNodes()) {
        table.removeChild(table.firstChild);
    }
}

function forwardPage(){
    clearData();
    createTableHeader();
    let target = tableCurrentIndex + 20;
    for(let i = tableCurrentIndex; i < target; i++){
        tableCurrentIndex++;
        createRow(meteorInfo[i]);
    }
}

function backPage(){
    clearData();
    createTableHeader();
    let beginningIndex = tableCurrentIndex;
    let target = tableCurrentIndex - 20;
    // console.log(`BeginningIndex = ${beginningIndex}\nTarget = ${target}`);
    for(let i = target; i < beginningIndex ; i++){
        tableCurrentIndex--;
        createRow(meteorInfo[i]);
    }
}