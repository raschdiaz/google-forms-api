const CLIENT_ID = environment.CLIENT_ID;
const SCOPES = 'https://www.googleapis.com/auth/forms.body.readonly';
// Discovery doc URL for APIs used by the quickstart
const DISCOVERY_DOC = 'https://forms.googleapis.com/$discovery/rest?version=v1';

let tokenClient;
let gapiInited = false;
let gisInited = false;

/**
    * Callback after api.js is loaded.
*/
function loadGoogleAPI() {
    console.log("loadGoogleAPI()")
    gapi.load('client:auth', function () {
        console.log("Init GAPI Client")
        gapi.client.init({
            clientId: CLIENT_ID,
            discoveryDocs: [DISCOVERY_DOC]
        }).then(function () {
            gapiInited = true;
            // Set google credentials automatically if there is a current session (credentials saved on localStorage)
            let credentials = localStorage.getItem('credentials');
            if (credentials) {
                credentials = JSON.parse(credentials);
                gapi.client.setToken(credentials);
                sessionInit();
            } else {
                if (gapiInited && gisInited) {
                    sessionInit();
                }
            }
        }, function (error) {
            console.error(error);
            throw error;
        });
    });
}


/**
 * Callback after Google Identity Services are loaded.
 */
function loadGoogleTokenClient() {
    console.log("loadGoogleTokenClient()")
    tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: SCOPES,
        callback: async (credentials) => {
            gisInited = true;
            if (credentials.error !== undefined) {
                throw (credentials);
            }
            // DON'T SAVE THE CREDENTIALS ON LOCAL STORAGE!!!
            localStorage.setItem('credentials', JSON.stringify(credentials));
            if (gapiInited && gisInited) {
                sessionInit();
            }
        },
        error_callback: (error) => {
            console.error(error);
            throw (error)
        }
    });
}

function sessionInit() {
    console.log("sessionInit()");
    enableSessionButtons();
}

/**
 *  Sign in the user upon button click.
 */
function handleAuthClick() {
    console.log("handleAuthClick()")
    if (gapi.client.getToken() === null) {
        // Prompt the user to select a Google Account and ask for consent to share their data
        // when establishing a new session.
        tokenClient.requestAccessToken({ prompt: 'consent' });
    } else {
        // Skip display of account chooser and consent dialog for an existing session.
        tokenClient.requestAccessToken({ prompt: '' });
    }
}

/**
 *  Sign out the user upon button click.
 */
function handleSignoutClick() {
    const token = gapi.client.getToken();
    if (token !== null) {
        google.accounts.oauth2.revoke(token.access_token);
        gapi.client.setToken('');
        document.getElementById('content').innerText = '';
        document.getElementById('authorize_button').innerText = 'Authorize';
        document.getElementById('signout_button').style.visibility = 'hidden';
        document.getElementById('search').style.visibility = 'hidden';
    }
}

/**
 * Enables user interaction after all libraries are loaded.
 */
function enableSessionButtons() {
    console.log("enableSessionButtons()")
    document.getElementById('signout_button').style.visibility = 'visible';
    document.getElementById('authorize_button').innerText = 'Refresh';
    document.getElementById('search').style.visibility = 'visible';
}

async function requestForm(formId) {
    console.log("requestForm()", formId)
    let response;
    try {
        console.log(gapi.client.forms.forms)
        response = await gapi.client.forms.forms.get({ formId: formId });
        console.log(response)
        console.log(response.result)
        return response.result;
    } catch (error) {
        handleError(error);
    }
}

async function requestFormResponses(formId) {
    console.log("requestFormResponses()", formId)
    let response;
    try {
        response = await gapi.client.forms.forms.responses.list({ formId: formId });
        console.log(response)
        console.log(response.result)
        return response.result;
    } catch (error) {
        handleError(error);
    }
}

async function handleError(error) {
    // It's very helpful to log the entire error object for debugging.
    console.error("API Error:", error);
    let errorCode = error.status || error.code
    switch (errorCode) {
        case 401:
            // UNAUTHENTICATED
            // The token is invalid or expired. Let's try to get a new one.
            // There is not a way to get and use a "refresh_token" using this logic on javascript https://stackoverflow.com/a/24468307/6774579
            document.getElementById("authorize_button").click();
            break;
        case 404:
            // NOT FOUND
            console.error(`Form not found. This can happen if the formId is incorrect or if the authenticated user does not have permission to view the form.`);
            // You could display a message to the user here.
            // For example: document.getElementById('content').innerText = 'Form not found. Please check the ID and your permissions.';
            break;
        default:
            // For other errors, re-throwing is often a good default for unhandled cases.
            throw error;
    }
}

function executeRequests(formId) {
    requestForm(formId);
    requestFormResponses(formId);
}