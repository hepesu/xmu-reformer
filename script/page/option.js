function pageClose() {
	localStorage["backupUrlsSwitch"] = document.getElementById("backupUrlsSwitch").checked;
	localStorage["gpaSetting"] = document.getElementById("gpaSetting").value;
	
	window.close();
}
function settingAjax() {
	var dnow = new Date();
	if (dnow.getTime() - localStorage.updateTime > 60000 || !localStorage.appSetting)
		$.get("http://hellophpjwc.sinaapp.com/jwcset/").success(function (smsg) {
			if (JSON.parse(smsg)) {
				localStorage.appSetting = smsg;
			} else {
				reformer.modal().title('通知').content("<p>获取错误:信息错误，请联系作者。</p>").show();
			}
			localStorage.updateTime = dnow.getTime();
		}).error(function () {
			reformer.modal().title('通知').content("<p>获取错误:信息错误，请联系作者。</p>").show();
		});
}
function pageInit() {
	var personInfo = JSON.parse(localStorage.personInfo || null) || {
		name : '',
		password : '',
		style : 'student'
	};
	document.getElementById("name").value = personInfo["name"];
	document.getElementById("password").value = personInfo["password"];
	document.getElementById("style").value = personInfo["style"];
	
	document.getElementById("gpaSetting").value = localStorage["gpaSetting"] || '';
	
	if (localStorage["backupUrlsSwitch"] === 'true')
		$("#backupUrlsSwitch").click();
	
	if (!localStorage["quitCourse"])
		localStorage["quitCourse"] = 'false';
	
	settingAjax();
}
$(document).ready(function () {
	pageInit();
	
	$("#save-form").submit(function () {
		var personInfo = {
			name : document.getElementById("name").value,
			password : document.getElementById("password").value,
			style : document.getElementById("style").value
		}
		localStorage.personInfo = JSON.stringify(personInfo);
	});
	
	$("#reset-btn").click(function () {
		localStorage.removeItem("personInfo");
		pageInit();
	}).tooltip({
		title : '清空账户、密码信息。'
	});
	
	$("#sc-btn").click(function () {
		pageClose();
	}).tooltip({
		title : '如果喜欢本扩展，请分享给你的朋友吧！'
	});
	
	$("#clear-btn").click(function () {
		localStorage.clear();
		reformer.modal().title('通知').content("<p>清空完成。</p>").show();
		pageInit();
	}).tooltip({
		title : '清空所有的用户数据，包括课程表、备选课表等。'
	});
	
	$("#refresh-btn").click(function () {
		localStorage.updateTime = 0;
		settingAjax();
		reformer.modal().title('通知').content("<p>更新完成。</p>").show();
	}).tooltip({
		title : '获取更新信息。'
	});
	
	$("#backupUrlsSwitch").tooltip({
		title : '这会开启备用的用户页面。'
	});
});
