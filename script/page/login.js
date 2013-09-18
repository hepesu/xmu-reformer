$(document).ready(function () {
	var personInfo = JSON.parse(localStorage.personInfo || null) || {
		name : '',
		password : '',
		style : 'student'
	};
	document.getElementById("name").value = personInfo["name"];
	document.getElementById("password").value = personInfo["password"];
	document.getElementById("style").value = personInfo["style"];
	
	$('#fast_mask').click(function () {
		$('#fast').slideToggle(200)
	});
	$('#login_btn').click(function () {
		localStorage.loginInfo = JSON.stringify({name:$("#name").val(),password:$("#password").val(),style:$("#style").val()});
		window.open('http://59.77.7.100:8080/manage/login.jsp?siteId=58&pageId=215#1');
	});
	$('#set_btn').click(function () {
		chrome.tabs.create({
			url : 'option.html',
			selected : true
		});
	});
	$('#table_btn').click(function () {
		chrome.tabs.create({
			url : 'table.html',
			selected : true
		});
	});
	$('#course_btn').click(function () {
		chrome.tabs.create({
			url : 'course.html',
			selected : true
		});
	});
	
	var time_txt = '待更新';
	if (JSON.parse(localStorage.appSetting)) {
		var weeknum = Math.ceil((new Date().getTime() - new Date(JSON.parse(localStorage.appSetting).startdate).getTime()) / 604800000);
		if (!isNaN(weeknum) && weeknum > -1)
			time_txt = '第' + weeknum + '周';
	}
	$('#time').html(time_txt);
	
});
