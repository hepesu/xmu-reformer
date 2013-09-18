if (chrome.runtime.onInstalled)
	chrome.runtime.onInstalled.addListener(function (details) {
		if (details.reason === "install")
			//if (localStorage.appFirst !== 'false') {
			chrome.tabs.create({
				url : 'option.html',
				selected : true
			});
		//localStorage.appFirst = 'false';
		//}
	});
if (chrome.runtime.onStartup)
	chrome.runtime.onStartup.addListener(function () {
		settingAjax()
	});
chrome.extension.onMessage.addListener(function (request, sender, sendResponse) {
	switch (request.request) {
	case 'fastLogin':
		var loginInfo = JSON.parse(localStorage.loginInfo || null) || {
			name : 'null',
			password : 'null',
			style : 'student'
		};
		sendResponse(loginInfo);
		localStorage.removeItem('loginInfo');
		break;
	case 'quitCourse':
		sendResponse(localStorage.quitcourse || 'false');
		break;
	case 'gpaSetting':
		sendResponse(localStorage.gpaSetting || '');
		break;
	case 'backupUrls':
		if (localStorage.backupUrlsSwitch === 'true') {
			var tmp = JSON.parse(localStorage.appSetting || null);
			if (tmp.urls)
				sendResponse(tmp.urls);
		} else
			sendResponse('false');
		break;
	case 'setUseragent':
		setUseragent(request.message);
		break;
	case 'getCoursetable':
		var flag = request.message.content.indexOf('课程表') > -1;
		if (flag)
			localStorage.courseTable = JSON.stringify(request.message);
		sendResponse(flag);
		break;
	case 'getCoursestatus':
		var flag = request.message.content.indexOf('选课') > -1;
		if (flag)
			localStorage.courseStatus = JSON.stringify(request.message);
		sendResponse(flag);
		break;
	case 'getNotice':
		getNotice(request.message);
		break;
	case 'doPrepare':
		doPrepare(request.message);
		sendResponse(true);
		break;
	}
});
function setUseragent(swicth) {
	var listener = function (details) {
		for (var i = 0; i < details.requestHeaders.length; ++i) {
			if (details.requestHeaders[i].name == 'User-Agent') {
				details.requestHeaders[i].value = 'Gecko/20100101 ' + details.requestHeaders[i].value;
				break;
			}
		}
		return {
			requestHeaders : details.requestHeaders
		};
	}
	if (swicth == 'true')
		chrome.webRequest.onBeforeSendHeaders.addListener(listener, {
			urls : ["*://59.77.7.100/*"]
		}, ["blocking", "requestHeaders"]);
	else
		if (chrome.webRequest.onBeforeSendHeaders.hasListener(listener))
			chrome.webRequest.onBeforeSendHeaders.removeListener(listener);
}
function getNotice(noticeContent) {
	var notification = webkitNotifications.createNotification(
			'css/icon/icon_48.png',
			noticeContent.title,
			noticeContent.content);
	notification.onshow = function (event) {
		setTimeout(function () {
			event.currentTarget.cancel();
		}, 10 * 1000);
	};
	notification.show();
}
function doPrepare(data) {
	var courseList = JSON.parse(localStorage.getItem('courseList')) || [];
	courseList.push(data);
	localStorage.setItem('courseList', JSON.stringify(courseList));
}
function settingAjax() {
	var dnow = new Date();
	if (dnow.getTime() - localStorage.updateTime > 60000 || !localStorage.appSetting)
		$.get("http://hellophpjwc.sinaapp.com/jwcset/").success(function (smsg) {
			if (JSON.parse(smsg)) {
				localStorage.appSetting = smsg;
			}
			localStorage.updateTime = dnow.getTime();
		});
}
