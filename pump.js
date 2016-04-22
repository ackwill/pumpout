// Your Client ID can be retrieved from your project in the Google
// Developer Console, https://console.developers.google.com
var CLIENT_ID = "362878149208-dfs57d9rsl70f9bet7f5a55mu5rfhp6u.apps.googleusercontent.com";

var SCOPES = ["https://www.googleapis.com/auth/drive",
"https://www.googleapis.com/auth/plus.login",
"https://www.googleapis.com/auth/plus.profile.emails.read",
"https://www.googleapis.com/auth/spreadsheets"];

var SCRIPT_ID = "M6VwDp8tq5aObkqmMh7xb8ZSCr23GME13";

var savednames = [];

/**
* Check if current user has authorized this application.
*/
function checkAuth() {
    gapi.auth.authorize({
        'client_id': CLIENT_ID,
        'scope': SCOPES.join(' '),
        'immediate': true
    }, handleAuthResult);
}

function fired() {
    console.log("fired");
    $("#ddmenu").append("<li><a onclick=\"fired()\">Savage</a></li>");
}

function autofill(id) {
    var request = {
        'function': 'getDataFromIndex',
        'parameters': [
            id,
            10
        ],
        'devMode' : true,
    };

    // Make the API request.
    var op = gapi.client.request({
        'root': 'https://script.googleapis.com',
        'path': 'v1/scripts/' + SCRIPT_ID + ':run',
        'method': 'POST',
        'body': request
    });

    op.execute(function(resp) {
        if (resp.error && resp.error.status) {
            // The API encountered a problem before the script
            // started executing.
            appendPre('Error calling API:');
            appendPre(JSON.stringify(resp, null, 2));
        } else if (resp.error) {
            // The API executed, but the script returned an error.

            // Extract the first (and only) set of error details.
            // The values of this object are the script's 'errorMessage' and
            // 'errorType', and an array of stack trace elements.
            var error = resp.error.details[0];
            appendPre('Script error message: ' + error.errorMessage);

            if (error.scriptStackTraceElements) {
                // There may not be a stacktrace if the script didn't start
                // executing.
                appendPre('Script error stacktrace:');
                for (var i = 0; i < error.scriptStackTraceElements.length; i++) {
                    var trace = error.scriptStackTraceElements[i];
                    appendPre('\t' + trace.function + ':' + trace.lineNumber);
                }
            }
        } else {
            var response = resp.response.result;

            var field = document.getElementsByName("data");

            arraymove(savednames, id, savednames.length-1);

            $("#ddmenu").empty();

            for(var i=0; i < savednames.length; i++) {
                $("#ddmenu").append("<li><a onclick=\"autofill(" + i + ")\">" + savednames[i] + "</a></li>");
            }

            for(var i=0; i < response.length; i++) {
                field[i].value = response[i];
            }
        }
    });
}

function arraymove(arr, fromIndex, toIndex) {
    var element = arr[fromIndex];
    arr.splice(fromIndex, 1);
    arr.splice(toIndex, 0, element);
}

function populateDropdown() {
    var request = {
        'function': 'getRecent',
        'parameters': [
            10,
        ],
        'devMode' : true,
    };

    // Make the API request.
    var op = gapi.client.request({
        'root': 'https://script.googleapis.com',
        'path': 'v1/scripts/' + SCRIPT_ID + ':run',
        'method': 'POST',
        'body': request
    });

    op.execute(function(resp) {
        if (resp.error) {
            appendPre("Failed to load names");
        } else {

            var response = resp.response.result;

            savednames = response;

            for(var i=0; i < response.length; i++) {
                $("#ddmenu").append("<li><a onclick=\"autofill(" + i + ")\">" + response[i] + "</a></li>");
            }
            appendPre("names loaded");
        }
    });
}

/**
* Handle response from authorization server.
*
* @param {Object} authResult Authorization result.
*/
function handleAuthResult(authResult) {
    var authorizeDiv = document.getElementById("authorize-div");
    var formDiv = document.getElementById("submitForm");
    if (authResult && !authResult.error) {
        // Hide auth UI, then load client library.
        authorizeDiv.style.display = "none";
        formDiv.style.display = "inline";
        populateDropdown();
    } else {
        // Show auth UI, allowing the user to initiate authorization by
        // clicking authorize button.
        authorizeDiv.style.display = "inliner";
    }
}

/**
* Initiate auth flow in response to user clicking authorize button.
*
* @param {Event} event Button click event.
*/
function handleAuthClick(event) {
    gapi.auth.authorize({
        client_id: CLIENT_ID, scope: SCOPES, immediate: false
    },
    handleAuthResult);
    return false;
}

function callPumpoutFunction(ignore) {

    var data = document.getElementsByName("data");

    var request = {
        'function': 'appendPumpout',
        'parameters': [
            data[0].value,
            data[1].value,
            data[2].value,
            data[3].value,
            data[4].value,
            data[5].value,
            data[6].value,
            ignore,
        ],
        'devMode' : true,
    };

    // Make the API request.
    var op = gapi.client.request({
        'root': 'https://script.googleapis.com',
        'path': 'v1/scripts/' + SCRIPT_ID + ':run',
        'method': 'POST',
        'body': request
    });

    op.execute(function(resp) {
        if (resp.error && resp.error.status) {
            // The API encountered a problem before the script
            // started executing.
            appendPre('Error calling API:');
            appendPre(JSON.stringify(resp, null, 2));
        } else if (resp.error) {
            // The API executed, but the script returned an error.

            // Extract the first (and only) set of error details.
            // The values of this object are the script's 'errorMessage' and
            // 'errorType', and an array of stack trace elements.
            var error = resp.error.details[0];
            appendPre('Script error message: ' + error.errorMessage);

            if (error.scriptStackTraceElements) {
                // There may not be a stacktrace if the script didn't start
                // executing.
                appendPre('Script error stacktrace:');
                for (var i = 0; i < error.scriptStackTraceElements.length; i++) {
                    var trace = error.scriptStackTraceElements[i];
                    appendPre('\t' + trace.function + ':' + trace.lineNumber);
                }
            }
        } else {

            var folderSet = resp.response.result;
            appendPre(folderSet);
        }
    });
}

/**
* Append a pre element to the body containing the given message
* as its text node.
*
* @param {string} message Text to be placed in pre element.
*/
function appendPre(message) {
    var pre = document.getElementById('output');
    var textContent = document.createTextNode(message + '\n');
    pre.appendChild(textContent);
}
