/**************************************************************
 *Fix & Patch function for jwc
 **************************************************************/
function createXMLHttpRequest() {
	xmlHttp = new XMLHttpRequest();
};
function findDimensions() {
	return false;
};
function getOpts(targetselect, parameter, type, tip, defaultvalue) {
	if (type == "college") {
		text = "学院";
	} else if (type == "dep") {
		text = "系别";
	} else if (type == "term") {
		text = "学期";
		
	} else if (type == "course") {
		text = "课程";
		
	}
	var text = tip;
	var target = targetselect;
	var url = null;
	url = "ajaxdropdown.do?" + parameter + "type=" + type + "&time=" + new Date().getTime();
	var targetselect = document.getElementsByName(target)[0];
	if (targetselect) {
		targetselect.length = 0;
		targetselect.options.add(new Option("查询中，请稍后...", ""));
	}
	var xmlHttp;
	if (window.ActiveXObject) {
		xmlHttp = new ActiveXObject("Microsoft.XMLHTTP");
	} else {
		if (window.XMLHttpRequest) {
			xmlHttp = new XMLHttpRequest();
		}
	}
	xmlHttp.onreadystatechange = function () {
		handleStateChange1(target, text, xmlHttp, defaultvalue);
	};
	xmlHttp.open("get", url, true);
	xmlHttp.send(null);
}
function showMessage(result) {
	if (document.title.indexOf('排队') > -1)
		window.postMessage({
			sender : "page",
			request : "reportBeat",
			message : result
		}, "*");
}
function reportResult() {
	var result = xmlHttp.responseText;
	if (result != "NO") {
		if (result.indexOf("-") == -1 && result != "0") {
			showMessage(result);
		} else {
			a = window.confirm("已经完成排队，需要正常进入吗？\n当前页面可继续操作，但是为了正常使用，推荐进入。");
			if (a)
				top.window.location.href = "manage.jsp";
		}
	}
}
