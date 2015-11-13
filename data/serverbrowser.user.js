// ==UserScript==
// @name        Agar Serverbrowser
// @description Easily connect to private servers!
// @namespace   https://freigeist.github.io/Agar-Serverbrowser/
// @downloadURL https://freigeist.github.io/Agar-Serverbrowser/data/serverbrowser.user.js
// @updateURL   https://freigeist.github.io/Agar-Serverbrowser/data/serverbrowser.meta.js
// @include     http://agar.io/*
// @include     https://agar.io/*
// @version     0.2
// @grant       none
// ==/UserScript==

function showHideServerBrowser() {
	serverBrowser.style.display = (serverBrowser.style.display == "none" ? "block" : "none");
}

function clickConnect() {
	var id = parseInt(serverSelect.value.slice(1));
	if (isNaN(id)) return;
	switch (serverSelect.value.charAt(0)) {
		case "d": // Server from default list
			if (!serverListDefault[id]) return;
			// I've no fucking idea what the second param does...
			// Leaving it causes an error, but seems to make no difference
			connect("ws://" + serverListDefault[id].ip);
			break;
		case "m": // Agariomods server
			if (!serverListIOMods[id]) return;
			connect("ws://" + serverListIOMods[id].ip);
			break;
	}
	serverBrowser.style.display = "none";
}

function clickReload() {
	loadIOModsServerList();
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

function loadDefaultServerList() {
	var xhr = createCORSRequest('GET', 'https://freigeist.github.io/Agar-Serverbrowser/data/serverlist.json?' + Date.now()); // FU Cache...
	if(xhr != null) {
		xhr.onreadystatechange = function() {
			if (xhr.readyState == 4 && xhr.status == 200) {
				try {
					serverListDefault = JSON.parse(xhr.responseText);
					while (optGroupDefault.firstChild) {
						optGroupDefault.removeChild(optGroupDefault.firstChild);
					}
					var opt, val;
					for (var i = 0; i < serverListDefault.length; i++) {
						opt = document.createElement("option");
						val = document.createAttribute("value");
						val.value = "d" + i;
						opt.setAttributeNode(val);
						opt.appendChild(document.createTextNode(serverListDefault[i].name));
						optGroupDefault.appendChild(opt);
					}
					serverSelect.selectedIndex = 0;
				} catch (e) {
					console.error("Serverlist could not be parsed: " + e);
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
}

function loadIOModsServerList() {
	var xhr = createCORSRequest('GET', 'http://connect.agariomods.com/json/ogar.json?' + Date.now());
	if(xhr != null) {
		xhr.onreadystatechange = function() {
			if (xhr.readyState == 4 && xhr.status == 200) {
				try {
					var list = JSON.parse(xhr.responseText);
					parseIOModsList(list);
					while (optGroupIOMods.firstChild) {
						optGroupIOMods.removeChild(optGroupIOMods.firstChild);
					}
					var opt, val;
					for (var i = 0; i < serverListIOMods.length; i++) {
						opt = document.createElement("option");
						val = document.createAttribute("value");
						val.value = "m" + i;
						opt.setAttributeNode(val);
						opt.appendChild(document.createTextNode(serverListIOMods[i].name));
						optGroupIOMods.appendChild(opt);
					}
					serverSelect.selectedIndex = 0;
				} catch (e) {
					console.error("Serverlist could not be parsed: " + e);
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
}

function parseIOModsList(list) {
	if (typeof(list) !== "object" && !list.games) return;
	serverListIOMods = [];
	var location, se;
	for (var s in list.games) {
		location = s.split(".",1)[0];
		// Pretty names
		switch (location) {
			case "losangeles":
				location = "Los Angeles";
				break;
			case "newjersey":
				location = "New Jersey";
				break;
			case "siliconvalley":
				location = "Silicon Valley";
				break;
			case "atlantabeta":
				location = "Atlanta (beta)";
				break;
			case "londonbeta":
				location = "London (beta)";
				break;
			case "siliconvalleybeta":
				location = "Silicon Valley (beta)";
				break;
			case "sydneybeta":
				location = "Sydney (beta)";
				break;
			case "usaeast":
				location = "USA East";
				break;
			case "usaeastbeta":
				location = "USA East (beta)";
				break;
			default:
				location = location.charAt(0).toUpperCase() + location.slice(1);
		}
		
		for (var i = 0; i < list.games[s].length; i++) {
			se = list.games[s][i];
			if (!se.current_players) continue;
			try {
				serverListIOMods.push({
					name: location + " #" + (i+1) + " - " + se.current_players + "/" + se.max_players + " - " + se.gamemode,
					ip: s + ":" + (1501+i)
				});
			} catch(e) {} // Just in case the format changes
		}
	}
}

var serverListDefault = [], serverListIOMods = [];

/*
 * Add the hamburger menu button
 */

var hamburger = document.createElement("div");
hamburger.setAttribute("style", "position: fixed; top: 5px; left: 5px; font-size: 2em; color: rgb(204, 204, 204); text-shadow: 1px 1px 1px rgb(0, 0, 0); cursor: pointer; z-index: 500;");

var hamburger_text = document.createTextNode("\u2261");
hamburger.appendChild(hamburger_text);

hamburger.addEventListener("click", showHideServerBrowser);

document.body.appendChild(hamburger);

/*
 * Add the browser div
 */

var serverBrowser = document.createElement("div");
serverBrowser.setAttribute("style", "position: fixed; top: 5px; left: 2.5em; color: black; z-index: 500; border-radius: 5px; box-shadow: 2px 2px 3px rgb(68, 68, 68); padding: 5px; overflow: auto; width: 200px; background-color: rgba(0, 172, 48, 0.7); display: none;");

document.body.appendChild(serverBrowser);

/*
 * Add controls to serverBrowser
 */

// Dropdown
var serverSelect = document.createElement("select");

var optGroupDefault = document.createElement("optgroup");
optGroupDefault.setAttribute("label", "Serverlist");
var optGroupIOMods = document.createElement("optgroup");
optGroupIOMods.setAttribute("label", "Agariomods serverlist");

var optionLoading = document.createElement("option");
optionLoading.appendChild(document.createTextNode("Loading..."));

optGroupDefault.appendChild(optionLoading);
optGroupIOMods.appendChild(optionLoading.cloneNode());

serverSelect.appendChild(optGroupDefault);
serverSelect.appendChild(optGroupIOMods);

serverSelect.style.width = "190px";

serverBrowser.appendChild(serverSelect);

console.log(serverSelect.value);

// Reload Button, may be used at a later time
var reloadButton = document.createElement("button");
var reloadButton_style = document.createAttribute("style");
reloadButton_style.value = "width: 80px; color: white; border-radius: 5px; height: 25px; font-weight: bold; border: 1px solid rgb(0, 102, 0); margin-top: 5px; background-color: rgb(0, 170, 0); box-shadow: 1px 1px 2px rgb(0, 102, 0);"; 
reloadButton.setAttributeNode(reloadButton_style);
reloadButton.appendChild(document.createTextNode("Refresh"));

reloadButton.addEventListener("click", clickReload);

serverBrowser.appendChild(reloadButton);

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
 
loadDefaultServerList();
loadIOModsServerList();