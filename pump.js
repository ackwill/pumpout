var CLIENT_ID = "362878149208-dfs57d9rsl70f9bet7f5a55mu5rfhp6u.apps.googleusercontent.com";

var SCOPES = ["https://www.google.com/calendar/feeds",
              "https://www.googleapis.com/auth/plus.login",
              "https://www.googleapis.com/auth/plus.profile.emails.read",
              "https://www.googleapis.com/auth/spreadsheets"];

var SCRIPT_ID = "M6VwDp8tq5aObkqmMh7xb8ZSCr23GME13";

var SAVE_RANGE = -1; // normally 10, -1 is all of the data

var DEBUG = true;

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

/**
* Initiate auth flow in response to user clicking authorize button.
*/
function handleAuthClick(event) {
    gapi.auth.authorize({
        client_id: CLIENT_ID, scope: SCOPES, immediate: false
    },
    handleAuthResult);
    return false;
}

/**
* Handle response from authorization server.
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

function autofill(id) {
    var request = {
        'function': 'getDataFromIndex',
        'parameters': [
            id,
            SAVE_RANGE,
        ],
        'devMode' : DEBUG,
    };

    // Make the API request.
    var op = gapi.client.request({
        'root': 'https://script.googleapis.com',
        'path': 'v1/scripts/' + SCRIPT_ID + ':run',
        'method': 'POST',
        'body': request
    });

    op.execute(function(resp) {
        if (!parseAPIResponse(resp)) {
            var response = resp.response.result;

            var field = document.getElementsByName("data");

            for(var i=0; i < response.length; i++) {
                field[i].value = response[i];
            }
        }
    });
}

function populateDropdown() {
    var request = {
        'function': 'getRecent',
        'parameters': [
            SAVE_RANGE,
        ],
        'devMode' : DEBUG,
    };

    // Make the API request.
    var op = gapi.client.request({
        'root': 'https://script.googleapis.com',
        'path': 'v1/scripts/' + SCRIPT_ID + ':run',
        'method': 'POST',
        'body': request
    });

    op.execute(function(resp) {
        if (!parseAPIResponse(resp)) {
            var response = resp.response.result;

            for(var i=0; i < response.length; i++) {
                $("#ddmenu").append("<li><a onclick=\"autofill(" + i + ")\">" + response[i] + "</a></li>");
            }
            appendOutputDiv("names loaded");
        }
    });
}

function callPumpoutFunction() {

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
        ],
        'devMode' : DEBUG,
    };

    // Make the API request.
    var op = gapi.client.request({
        'root': 'https://script.googleapis.com',
        'path': 'v1/scripts/' + SCRIPT_ID + ':run',
        'method': 'POST',
        'body': request
    });

    op.execute(function(resp) {
        if(!parseAPIResponse(resp)) {
            var post_stats = resp.response.result;
            appendOutputDiv(post_stats);
            var field = document.getElementsByName("data");
            for(var i=0; i < field.length; i++) {
                field[i].value = "";
            }
        }
    });
}

function parseAPIResponse(resp) {
    if (resp.error && resp.error.status) {
        // The API encountered a problem before the script
        // started executing.
        appendOutputDiv('Error calling API:');
        appendOutputDiv(JSON.stringify(resp, null, 2));
        return true;
    } else if (resp.error) {
        // The API executed, but the script returned an error.

        // Extract the first (and only) set of error details.
        // The values of this object are the script's 'errorMessage' and
        // 'errorType', and an array of stack trace elements.
        var error = resp.error.details[0];
        appendOutputDiv('Script error message: ' + error.errorMessage);

        if (error.scriptStackTraceElements) {
            // There may not be a stacktrace if the script didn't start
            // executing.
            appendOutputDiv('Script error stacktrace:');
            for (var i = 0; i < error.scriptStackTraceElements.length; i++) {
                var trace = error.scriptStackTraceElements[i];
                appendOutputDiv('\t' + trace.function + ':' + trace.lineNumber);
            }
        }
        return true;
    }
    return false;
}

/**
* Append a pre element to the body containing the given message
* as its text node.
*/
function appendOutputDiv(message) {
    var pre = document.getElementById('output');
    var textContent = document.createTextNode(message + '\n');
    if(DEBUG) {
        pre.appendChild(textContent);
    } else {
        pre.textContent = message + "\n";
    }
}
