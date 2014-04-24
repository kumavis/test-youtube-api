var express = require('express'),
    videos = require('./routes/videos');
 
var app = express();
 
app.get('/videos', videos.listAllActivities);

// You have to provide the credentials, first (in credentials.json file: rename .templ.json into json)
var credentials = require("./credentials");
var request = require("request");

credentials.scope = "https://www.googleapis.com/auth/youtube";
credentials.response_type = "code";
credentials.access_type = "offline";

app.get('/',function(req, res){

	var authUrl = "https://accounts.google.com/o/oauth2/auth?";

	for (var key in credentials) {
		console.log(key, credentials[key]);
		if (key === "client_secret") { continue; }

		authUrl += "&" + key + "=" + credentials[key];
	}
    if (typeof ACCESS_TOKEN == "undefined") {
	  var html = "Click <a href='" + authUrl + "'>here</a> to get the access token.";
	} else {	
	  var html = "Click <a href='http://localhost:3000/videos'>here</a> to see the list of all activities.";
	}
	res.setHeader("Content-Type", "text/html");
	res.end(html);
	return;
});

app.get('/oauth2callback',function(req, res) {
	var url = req.url;

	if (url.indexOf("error") !== -1) {
		return res.end("Error.");
	}

	if (url.indexOf("?code=") === -1) {
		return res.end("Invalid request.");
	}

	var code = url;
	code = code.substring(code.indexOf("?code=") + 6);

	if (!code) {
		return res.end("Code is missing.");
	}

	var formData = "code=" + code +
				   "&client_id=" + credentials.client_id +
				   "&client_secret=" + credentials.client_secret +
				   "&redirect_uri=" + credentials.redirect_uri +
				   "&grant_type=authorization_code";

	var options = {
		url: "https://accounts.google.com/o/oauth2/token",
		headers: {'content-type' : 'application/x-www-form-urlencoded'},
		method: "POST",
		body: formData
	};

	request(options, function (err, response, body) {

		if (err) {
			return res.end(err);
		}

		try {
			body = JSON.parse(body);
		} catch (e) {
			return res.end(e.message + " :: " + body);
		}
		if (body.error) {
			return res.end(err);
		}

		// success
		if (body.access_token) {
			ACCESS_TOKEN = body.access_token;
			var html = "Click <a href='http://localhost:3000'>here</a> to go back.</br> Access token: " + ACCESS_TOKEN;
			res.setHeader("Content-Type", "text/html");
	        return res.end(html);
		}

		return res.end("Something wrong: \n" + JSON.stringify(body, null, 4));
	});

	return;    
});
 
app.listen(3000);

console.log("Open: http://localhost:3000");
