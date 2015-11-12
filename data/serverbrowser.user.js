// ==UserScript==
// @name        Agar Serverbrowser
// @description Easily connect to private servers!
// @namespace   https://freigeist.github.io/Agar-Serverbrowser/
// @downloadURL https://freigeist.github.io/Agar-Serverbrowser/data/serverbrowser.user.js
// @updateURL   https://freigeist.github.io/Agar-Serverbrowser/data/serverbrowser.meta.js
// @include     http://agar.io/*
// @include     https://agar.io/*
// @version     0.1.1
// @grant       none
// ==/UserScript==

function showHideServerBrowser() {
	serverBrowser.style.display = (serverBrowser.style.display == "none" ? "block" : "none");
}

function clickConnect() {
	var id = parseInt(serverSelect.value);
	if (isNaN(id)) return;
	if (!serverList[id]) return;
	connect("ws://" + serverList[id].ip);
	serverBrowser.style.display = "none";
}

function clickReload() {
	// See below
}

function createCORSRequest(method, url) {
	var xhr = new XMLHttpRequest();
		if ("withCredentials" in xhr) {
		// Most browsers.
		xhr.open(method, url, true);
	} else if (typeof XDomainRequest != "undefined") {
		// IE8 & IE9
		xhr = new XDomainRequest();
		xhr.open(method, url);
	} else {
		// CORS not supported.
		xhr = null;
	}
	return xhr;
};

var serverList = [];

/*
 * Add the hamburger menu button
 */

var hamburger = document.createElement("div");

var hamburger_style = document.createAttribute("style");
hamburger_style.value = "position: fixed; top: 5px; left: 5px; font-size: 2em; color: rgb(204, 204, 204); text-shadow: 1px 1px 1px rgb(0, 0, 0); cursor: pointer; z-index: 500;"; 
hamburger.setAttributeNode(hamburger_style);

var hamburger_text = document.createTextNode("\u2261");
hamburger.appendChild(hamburger_text);

hamburger.addEventListener("click", showHideServerBrowser);

document.body.appendChild(hamburger);

/*
 * Add the browser div
 */

var serverBrowser = document.createElement("div");

var serverBrowser_style = document.createAttribute("style");
serverBrowser_style.value = "position: fixed; top: 5px; left: 2.5em; color: black; z-index: 500; border-radius: 5px; box-shadow: 2px 2px 3px rgb(68, 68, 68); padding: 5px; overflow: auto; width: 200px; background-color: rgba(0, 172, 48, 0.7); display: none;"; 
serverBrowser.setAttributeNode(serverBrowser_style);

document.body.appendChild(serverBrowser);

/*
 * Add controls to serverBrowser
 */

// Dropdown
var serverSelect = document.createElement("select");

var serverSelectDefaultOption = document.createElement("option");
serverSelectDefaultOption.appendChild(document.createTextNode("Loading..."));
serverSelect.appendChild(serverSelectDefaultOption);

serverSelect.style.width = "190px";

serverBrowser.appendChild(serverSelect);

console.log(serverSelect.value);

// Reload Button, may be used at a later time
/*var reloadButton = document.createElement("button");
var reloadButton_style = document.createAttribute("style");
reloadButton_style.value = "width: 80px; color: white; border-radius: 5px; height: 25px; font-weight: bold; border: 1px solid rgb(0, 102, 0); margin-top: 5px; background-color: rgb(0, 170, 0); box-shadow: 1px 1px 2px rgb(0, 102, 0);"; 
reloadButton.setAttributeNode(reloadButton_style);
reloadButton.appendChild(document.createTextNode("Reload"));

reloadButton.addEventListener("click", clickReload);

serverBrowser.appendChild(reloadButton);*/

// Connect Button
var connectButton = document.createElement("button");
var connectButton_style = document.createAttribute("style");
connectButton_style.value = "width: 80px; color: white; border-radius: 5px; height: 25px; font-weight: bold; border: 1px solid rgb(0, 102, 0); margin-top: 5px; float: right; background-color: rgb(0, 170, 0); box-shadow: 1px 1px 2px rgb(0, 102, 0);"; 
connectButton.setAttributeNode(connectButton_style);
connectButton.appendChild(document.createTextNode("Connect"));

connectButton.addEventListener("click", clickConnect);

serverBrowser.appendChild(connectButton);

/*
 * Retrieve serverlist (once)
 */

var xhr = createCORSRequest('GET', 'https://freigeist.github.io/Agar-Serverbrowser/data/serverlist.json');
if(xhr != null) {
	xhr.onreadystatechange = function() {
		if (xhr.readyState == 4 && xhr.status == 200) {
			try {
				serverList = JSON.parse(xhr.responseText);
				while (serverSelect.firstChild) {
					serverSelect.removeChild(serverSelect.firstChild);
				}
				var opt, val;
				for (var i = 0; i < serverList.length; i++) {
					opt = document.createElement("option");
					val = document.createAttribute("value");
					val.value = i;
					opt.setAttributeNode(val);
					opt.appendChild(document.createTextNode(serverList[i].name));
					serverSelect.appendChild(opt);
				}
			} catch (e) {
				console.error("Serverlist could not be parsed");
			}
		}
	}

	xhr.onerror = function() {
		console.error("Serverlist could not be received");
	}
	
	xhr.send();
} else {
	console.error("Serverlist could not be received");
}