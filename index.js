let meteorInfo;
let table = document.querySelector("#table");
let tableCurrentIndex = 0;
let searchAPIAddress = "https://data.nasa.gov/resource/gh4g-9sfh.json?name=";

/* function called within any api calls that checks for errors */

function checkStatus(res) {
  if (res.ok) {
    return Promise.resolve(res);
  } else {
    return Promise.reject(new Error(res.statusText));
  }
}

/* General API Call which is completed on page Load and populated immediately */

function apiCall() {
  fetch("https://data.nasa.gov/resource/gh4g-9sfh.json")
    .then(checkStatus)
    .then(res => res.json())
    .then(data => {
      meteorInfo = data;
      populateData(meteorInfo);
    })
    .catch(err => console.log(err));
}

/* Name Search API Call, completed upon 'enter' of Submit input on search element */

function searchAPICall(name) {
  fetch(`${searchAPIAddress}${name}`)
    .then(checkStatus)
    .then(res => res.json())
    .then(data => {
      meteorSearchInfo = data;
      if(meteorSearchInfo.length > 0){
        populateData(meteorSearchInfo, 1);
      } else {
          table.innerText = 'No Results Found';
      }
    })
    .catch(err => console.log(err));
}

/* Table Creation Functions */

function createTD(dataPoint) {
  let td = document.createElement("td");
  td.innerText = dataPoint;
  return td;
}

function createTH(dataPoint) {
  let th = document.createElement("th");
  th.innerText = dataPoint;
  return th;
}

function tableDataCollection(
  fall,
  id,
  mass,
  name,
  recclass,
  reclat,
  reclong,
  year
) {
  let tdArr = [];
  for (let arg in arguments) {
    if (arguments[arg] == undefined) {
      arguments[arg] = "UA";
    }
    tdArr.push(createTD(arguments[arg]));
  }
  return tdArr;
}

function createTableHeader() {
  let headerRow = document.createElement("tr");
  let headerTextArr = [
    "ID",
    "Name",
    "Fall",
    "Mass(g)",
    "Class",
    "Latitude",
    "Longitude",
    "Year"
  ];
  for (let each in headerTextArr) {
    headerRow.append(createTH(headerTextArr[each]));
  }
  table.append(headerRow);
}

function createRow(meteor) {
  if (meteor.year) {
    meteor.year = meteor.year.slice(0, 4);
  }

  let tr = document.createElement("tr");
  let td = tableDataCollection(
    meteor.id,
    meteor.name,
    meteor.fall,
    meteor.mass,
    meteor.recclass,
    meteor.reclat,
    meteor.reclong,
    meteor.year
  );

  for (let each in td) {
    tr.append(td[each]);
  }

  table.appendChild(tr);
}

function populateData(meteorInfo, returnRowNumber = 20) {
  createTableHeader();
  console.log(`Row Number is: ${returnRowNumber}`);
  for (let i = 0; i < returnRowNumber; i++) {
    if (returnRowNumber == 20) {
      tableCurrentIndex++;
    } else {
      tableCurrentIndex = 0;
    }
    createRow(meteorInfo[i]);
  }
}

function clearData() {
  while (table.hasChildNodes()) {
    table.removeChild(table.firstChild);
  }
}

function forwardPage() {
  clearData();
  createTableHeader();
  let target = tableCurrentIndex + 20;
//   console.log(`Beginning Index is = ${tableCurrentIndex}\nTarget = ${target}`);
  for (let i = tableCurrentIndex; i < target && i < meteorInfo.length; i++) {
    tableCurrentIndex++;
    createRow(meteorInfo[i]);
  }
}

function backPage() {
  let beginningIndex = tableCurrentIndex - 20;
  let target = tableCurrentIndex - 40;
  if (beginningIndex > 0) {
    clearData();
    createTableHeader();
    // console.log(`BeginningIndex = ${beginningIndex}\nTarget = ${target}`);
    for (let i = target; i < beginningIndex && i >= 0; i++) {
      tableCurrentIndex--;
      createRow(meteorInfo[i]);
    }
  }
}

/* Executes the first API call for page load */
apiCall();

/* Search Function */
function search() {
  let searchText = document.querySelector("#searchText").value.toLowerCase();
  let cappedSearchText =
    searchText.slice(0, 1).toUpperCase() + searchText.slice(1);
//   console.log(`Searching for ${cappedSearchText}`);
  clearData();
  if (cappedSearchText == "") {
    populateData(meteorInfo);
  } else {
    searchAPICall(cappedSearchText);
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

