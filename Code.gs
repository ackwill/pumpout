/**
* Google App Script to act as server side
*/

var log_url = "https://docs.google.com/spreadsheets/d/1YLXXWZRG2PDfFChFvEqu1rZtSMghgtCtMD2pVqNtVz8/edit";
var boat_data_url = "https://docs.google.com/spreadsheets/d/150YSIayrc4N12C3iiRtKiWk09QwL-498tvxEj8aEC9k/edit";
var calendar_id = "6urgedlk625hkrh1909g7po5ds@group.calendar.google.com";

function fixName(name) {
  var arr = name.split(" ");
  for(var i=0; i<arr.length; i++) {
    arr[i] = arr[i].charAt(0).toUpperCase() + arr[i].slice(1);
  }
  return arr.join(" ");
}

// Search for saved boat data
function search(term) {
  var sheet = SpreadsheetApp.openByUrl(boat_data_url).getActiveSheet();
  var data = sheet.getDataRange().getDisplayValues();
  var row = null;

  for(var i=data.length-1; i >= 0; i--) {
    if(data[i].indexOf(term.toLowerCase()) != -1) {
      row = data[i];
      sheet.deleteRow(i+1);
      sheet.appendRow(row);
      row[0] = row[0].toUpperCase();
      row[2] = fixName(row[2]);
      break;
    }
  }
  return row;
}

// Called if a boat has been added/updated
function cleanupSheet(newname, send) {

  var sheet = SpreadsheetApp.openByUrl(boat_data_url);
  var data = sheet.getDataRange().getValues();

  for(var i=0; i < data.length; i++) {
    if(data[i].indexOf(newname) != -1) {
      sheet.deleteRow(i+1);
    }
  }

  sheet.appendRow(send);

  sheet.sort(1);
}

// Return pumpout data given a name index
function getDataFromIndex(index, amount) {
  var data = SpreadsheetApp.openByUrl(boat_data_url).getActiveSheet();

  if(amount == -1) {
    amount = data.getLastRow();
  }

  var rows = data.getLastRow();

  var range = data.getRange(rows-amount+1, 1, amount, data.getLastColumn());

  var values = range.getValues();

  //data.deleteRow(rows-amount+index+1);
  //data.appendRow(values[index]);

  var tmp = values[index][0]
  values[index][0] = fixName(String(values[index][2]));
  values[index][2] = fixName(String(tmp));

  return values[index];
}

// Only show most resent 10 or 15 used boats
function getRecent(amount) {

  var data = SpreadsheetApp.openByUrl(boat_data_url).getActiveSheet();
  var rows = data.getLastRow();

  if(amount == -1) {
    amount = data.getLastRow();
  }

  var range = data.getRange(rows-amount+1, 1, amount, data.getLastColumn());

  var values = range.getValues();

  var names = [];
  for(var i = 0; i < values.length; i++) {
    names.push(fixName(values[i][0]));
  }

  return names;
}

function appendPumpout(mooring, side, name, port, length, pob, gal) {

  var entry = [];

  // Check if this boat or location has been logged before.
  if(side == "" && name == "" && port == "" && length == "" && pob == "" && gal == "") {
    entry = search(mooring.toLowerCase());
  } else if(mooring == "" && side == "" && port == "" && length == "" && pob == "" && gal == "") {
    entry = search(name.toLowerCase());
  } else if(mooring == "" && side == "" && name == "" && port == "" && length == "" && pob == "" && gal == "") {
    entry = null;
  } else {
    entry = [mooring, side, name, port, length, pob, gal]
    var send = entry.slice(0);
    var tmp = send[2];
    send[2] = send[0].toLowerCase();
    send[0] = tmp.toLowerCase();
    cleanupSheet(String(entry[2]).toLowerCase(), send);
  }

  if(entry == null) {
    return "Error Logging Pumpout";
  }

  var ss = SpreadsheetApp.openByUrl(log_url);
  var sheet = ss.getActiveSheet();

  var currentdate = new Date();
  var datetime = (currentdate.getMonth()+1) + "/"
                + currentdate.getDate() + "/"
                + currentdate.getFullYear();

  var lastrow = sheet.getLastRow();
  var loggerName = Plus.People.get("me").displayName;

  entry = [lastrow-12, datetime].concat(entry, ['=SUM(I14:I' + (lastrow+1) + ')', "", loggerName]);

  var cal = CalendarApp.getCalendarById(calendar_id);
  var eventName = entry[4] + ", " + entry[8] + " gallons";
  cal.createEvent(eventName,
     currentdate,
     currentdate,
     {
       location: entry[2],
       description: entry.slice(2, 9).join(" ") + " by: " + loggerName
     });

  sheet.appendRow(entry);
  return "Logged " + entry[4];
}
