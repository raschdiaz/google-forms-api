<!DOCTYPE html>
<html>

<head>
    <title>Google Forms API</title>
    <meta charset="utf-8" />
</head>

<body>
    <button id="authorize_button" onclick="handleAuthClick()">Authorize</button>
    <button id="signout_button" onclick="handleSignoutClick()" style="visibility: hidden;">Sign Out</button>
    <div id="search" style="visibility: hidden;">
        Form ID: <input id="form-id" type="text" value="19Y1ko5DdYovUeGib31HDmVO5P1m4CG85t-NzcEdKCzs"/>
        <button id="search-button" onclick="executeRequests(document.getElementById('form-id').value);">Search</button>
        </br>
        </br>
        <pre id="content" style="white-space: pre-wrap;"></pre>
    </div>
    <script type="text/javascript">

        function loadScriptSync(src, callback) {
            var script = document.createElement('script');
            script.src = src;
            script.type = "text/javascript";
            script.async = true;
            script.defer = true;
            script.onload = callback;
            document.getElementsByTagName('body')[0].appendChild(script);
        }

        async function loadEnvironment() {
            const response = await fetch("./environment.json");
            return await response.json();
        }

        function getQueryParams() {
            const params = new URLSearchParams(window.location.search);
            const formId = params.get("formId");
            const apiUrl = params.get("apiUrl");
            if (formId && apiUrl) {
                executeRequests(formId, apiUrl);
            }
        }

        // Load environment variables and logic synchronously
        loadEnvironment().then((environment) => {
            window.environment = environment;
            loadScriptSync("index.js", function () {
                loadScriptSync("https://apis.google.com/js/api.js", window.loadGoogleAPI);
                loadScriptSync("https://accounts.google.com/gsi/client", window.loadGoogleTokenClient);
            });

        });

    </script>
</body>

</html>