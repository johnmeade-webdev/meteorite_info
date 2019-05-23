let generalMeteoriteInfo = [];
let generalCurrentIndex = 0;
let searchLimit = 30;
let searchOffset = 0;
let isGeneral = true;
let searchMeteoriteInfo = [];
let searchCurrentIndex = 0;

document.querySelector("form").addEventListener('submit', function(event){
    event.preventDefault();
})

/* GLOBAL API CALL */
/* This call is intended for paging through ALL information without searching */
/* Forward pagination is handled through subsequent uses of this call, backward pagination is handled in-house */
/* If search parameters are entered, the 'SEARCH API CALL' will be used */

function checkStatus(res) {
  if (res.ok) {
    return Promise.resolve(res);
  } else {
    return Promise.reject(new Error(res.statusText));
  }
}

function generalAPICall(startIndex = 0, stopIndex = startIndex + 30) {
  fetch(
    "https://data.nasa.gov/resource/gh4g-9sfh.json?$order=name&$limit=" +
      searchLimit +
      "&$offset=" +
      searchOffset
  )
    .then(checkStatus)
    .then(res => res.json())
    .then(data => {
      searchOffset += searchLimit;
      generalMeteoriteInfo = [...generalMeteoriteInfo, ...data];
      populateData(generalMeteoriteInfo, startIndex, stopIndex);
    })
    .catch(err => console.log(err));
}

generalAPICall();

/* SEARCH API CALL */
/* This call is intended to retrieve ALL information about the requested search */
/* Pagination is implemented, but it's done in-house, not through subsequent API calls */

let searchByNameStart = [
  "https://data.nasa.gov/resource/gh4g-9sfh.json?$where=starts_with(name,%20%27",
  "%27)"
];
let searchByNameIncludes = [
  "https://data.nasa.gov/resource/gh4g-9sfh.json?$where=name%20like%20%27%25",
  "%25%27"
];
let searchByNameExact = "https://data.nasa.gov/resource/gh4g-9sfh.json?name=";

function searchAPICall(url, tryAgain = false, tryURL = '') {
  generalCurrentIndex = 0;
  searchCurrentIndex = 0;
  isGeneral = false;

  fetch(url)
    .then(checkStatus)
    .then(res => res.json())
    .then(data => {
      searchMeteoriteInfo = [...searchMeteoriteInfo, ...data];
      if (searchMeteoriteInfo.length > 0 && tryAgain == false) {
        populateData(searchMeteoriteInfo, 0, 30);
      } else {
          if(tryAgain){
              searchAPICall(tryURL, false);
          } else {
            table.innerText = "No Results Found";
          }
      }
    })
    .catch(err => console.log(err));
}

/* IN-HOUSE PAGINATION */

function nextPage() {
  if (isGeneral) {
    clearData();
    if (generalCurrentIndex < generalMeteoriteInfo.length) {
      populateData(
        generalMeteoriteInfo,
        generalCurrentIndex,
        generalCurrentIndex + 30
      );
    } else {
      generalAPICall(generalCurrentIndex);
    }
  } else {
    if (searchCurrentIndex >= searchMeteoriteInfo.length) {
      return;
    }
    clearData();
    populateData(
      searchMeteoriteInfo,
      searchCurrentIndex,
      searchCurrentIndex + 30
    );
  }
}

function backPage() {
  if (isGeneral) {
    if (generalCurrentIndex - 60 >= 0) {
      generalCurrentIndex -= 60;
    } else if (generalCurrentIndex <= 30) {
      return;
    } else {
      generalCurrentIndex = 0;
    }
    clearData();
    populateData(
      generalMeteoriteInfo,
      generalCurrentIndex,
      generalCurrentIndex + 30
    );
  } else {
    if (searchCurrentIndex - 60 >= 0) {
        searchCurrentIndex -= 60;
      } else if (searchCurrentIndex <= 30) {
        return;
      } else {
        searchCurrentIndex = 0;
      }
      clearData();
      populateData(
        searchMeteoriteInfo,
        searchCurrentIndex,
        searchCurrentIndex + 30
      );
  }
}

/* SEARCH FUNCTION */


function search() {
  let searchText = document.querySelector("#searchText").value.toLowerCase();
  let cappedSearchText =
    searchText.slice(0, 1).toUpperCase() + searchText.slice(1);

  if (searchText == "") {
    clearData();
    isGeneral = true;
    populateData(generalMeteoriteInfo, 0, 30);
    return;
  }

  clearData();
  meteorSearchInfo = [];

  if (document.querySelector("#startsWith").checked) {
    let search = encodeURIComponent(cappedSearchText);
    let url = `${searchByNameStart[0]}${search}${searchByNameStart[1]}`;
    searchAPICall(url);
  } else if (document.querySelector("#includes").checked) {
    let search = encodeURIComponent(searchText);
    let url = `${searchByNameIncludes[0]}${search}${searchByNameIncludes[1]}`;
    let search2 = encodeURIComponent(cappedSearchText);
    let url2 = `${searchByNameStart[0]}${search2}${searchByNameStart[1]}`;
    searchAPICall(url2, true, url);
  } else {
    let search = encodeURIComponent(cappedSearchText);
    let url = `${searchByNameExact}${search}`;
    searchAPICall(url);
  }
}

/* ************************* */

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

function populateData(meteorInfo, startIndex, stopIndex) {
  createTableHeader();

  for (let i = startIndex; i < stopIndex && i < meteorInfo.length; i++) {
    createRow(meteorInfo[i]);
    if (isGeneral) {
      generalCurrentIndex++;
    } else {
      searchCurrentIndex++;
    }
  }
}

function clearData() {
  while (table.hasChildNodes()) {
    table.removeChild(table.firstChild);
  }
}
