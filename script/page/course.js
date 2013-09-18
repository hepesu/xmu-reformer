function doSelect(code) {
	var modal = reformer.modal('msg').title('通知');
	$.get('http://59.77.7.100:8080/manage/chooseCourse.do?action=select&courseCode=' + code)
	.success(function (msg) {
		if (msg.indexOf("成功") > -1)
			modal.content("<p>选课成功</p>");
		else if (msg.indexOf("最高学分") > -1)
			modal.content("<p>该类已达到最高学分</p>");
		else if (msg.indexOf("满") > -1)
			modal.content("<p>该课已经满人</p>");
		else if (msg.indexOf("已选") > -1)
			modal.content("<p>你已经选了此课</p>");
		else
			modal.content("<p>选课失败</p>");
		modal.show();
	})
	.error(function () {
		modal.content('<p>选课失败，当前网站可能遇到错误，请稍候再试。</p>').show();
	}); ;
}
function doInfo(code) {
	var modal = reformer.modal().title('课程详情');
	$.get('http://59.77.7.100:8080/manage/studentCourse.do?action=view&courseCode=' + code)
	.success(function (msg) {
		var tmpDom = document.createElement('div');
		tmpDom.innerHTML = msg;
		$(tmpDom).find('table')
		.addClass('table table-condensed')
		.removeAttr('style');
		$(tmpDom).find('link').remove();
		modal
		.footer('<button class="btn btn-primary doSelect" name="' + code + '">选课</button>')
		.content(tmpDom.innerHTML)
		$('button.doSelect').click(function () {
			doSelect(code);
		});
		modal.show();
	})
	.error(function () {
		modal.content('<p>获取失败，当前网站可能遇到错误，请稍候再试。</p>').show();
	});
}
function doAvail(code) {
	var modal = reformer.modal().title('选课名单');
	$.get('http://59.77.7.100:8080/manage/chooseStatus.do?action=statistics&courseCode=' + code)
	.success(function (msg) {
		var tmpDom = document.createElement('div');
		tmpDom.innerHTML = msg;
		$(tmpDom).find('table')
		.removeAttr('width')
		.removeAttr('style');
		$(tmpDom).find('link').remove();
		modal
		.content(tmpDom.innerHTML)
		.show();
	})
	.error(function () {
		modal.content('<p>获取失败，当前网站可能遇到错误，请稍候再试。</p>').show();
	});
}
function doPrepare(code) {
	var courseList = JSON.parse(localStorage.getItem('courseList')) || [];
	courseList.push({
		name : $("tr[name='" + code + "'] td")[1].innerText,
		code : code
	});
	localStorage.setItem('courseList', JSON.stringify(courseList));
}
function doDelete(code) {
	var courseList = JSON.parse(localStorage.getItem('courseList')) || [];
	$(courseList).each(function (i, j) {
		if (j.code === code)
			courseList.splice(i, 1);
	});
	localStorage.setItem('courseList', JSON.stringify(courseList));
	$("#preChoosed").click();
}
function doSubmit() {
	var courseList = JSON.parse(localStorage.getItem('courseList')) || [];
	$(courseList).each(function (i, j) {
		setTimeout(function () {
			ajaxDelay(j)
		}, 500);
	});
	function ajaxDelay(a) {
		$.get('http://59.77.7.100:8080/manage/chooseCourse.do?action=select&courseCode=' + a.code, function (msg) {
			if (msg.indexOf("成功") > -1)
				$("tr[name='" + a.code + "']").addClass("alert alert-success").tooltip({
					title : '选课成功'
				});
			else
				$("tr[name='" + a.code + "']").addClass("alert alert-error").tooltip({
					title : '选课失败'
				});
			
		});
	}
}
$(document).ready(function () {
	$("#preChoosed").click(function () {
		var courseList = JSON.parse(localStorage.getItem('courseList')) || [];
		var ttxt = '';
		for (i in courseList) {
			ttxt += '<tr name="' + courseList[i].code + '">';
			ttxt += '<td><div class="btn-group"><a class="btn dropdown-toggle" data-toggle="dropdown" href="#">操作<span class="caret"></span></a><ul class="dropdown-menu"><li><a href="#" class="doSelect">选课</a></li><li><a href="#" class="doDelete">删除</a></li><li><a href="#" class="doInfo">查看详细</a></li><li><a href="#" class="doAvail">查看名单</a></li><li class="divider"></li><li><a href="#" class="doSubmit">全部提交</a></li></ul></div></td>';
			ttxt += '<td>' + courseList[i].name + '</td>';
			ttxt += "<td>" + courseList[i].code + "</td>";
			ttxt += "<td>——</td>";
			ttxt += "<td>——</td>";
			ttxt += "<td>——</td>";
			ttxt += "<td>——</td>";
			ttxt += '</tr>';
		}
		
		$('#courseList').html(ttxt);
		$(["doInfo", "doSelect", "doAvail", "doDelete", "doSubmit"]).each(function (i, func) {
			$("." + func).click(function (e) {
				window[func]($(e.target).parentsUntil('tbody').last().attr('name'));
			});
		});
	}).tooltip({
		title : '此处存放备选课程，可以一次全部提交'
	});
	$("#searchCourse").click(function () {
		var code = $("#courseCode").val();
		var teacher = $("#courseTeacher").val();
		//var place = $("#coursePlace").val();
		var name = $("#courseName").val();
		if (!(code.length === 0 && teacher.length === 0 && name.length === 0)) {
			$.get('http://hellophpjwc.sinaapp.com/course/', {
				name : name,
				code : code,
				teacher : teacher //,
				//place : place
			})
			.success(function (msg) {
				var ttxt = '';
				if (msg !== '') {
					ocourse = JSON.parse(msg);
					for (i in ocourse) {
						ttxt += '<tr name="' + ocourse[i].code + '">';
						ttxt += '<td><div class="btn-group"><a class="btn dropdown-toggle" data-toggle="dropdown" href="#">操作<span class="caret"></span></a><ul class="dropdown-menu"><li><a href="#" class="doSelect">选课</a></li><li><a href="#" class="doPrepare">备选</a></li><li><a href="#" class="doInfo">查看详细</a></li><li><a href="#" class="doAvail">查看名单</a></li></ul></div></td>';
						ttxt += '<td>' + ocourse[i].name + '</td>';
						ttxt += "<td>" + ocourse[i].code + "</td>";
						ttxt += "<td>" + ocourse[i].teacher + "</td>";
						ttxt += "<td>" + ocourse[i].place + "</td>";
						ttxt += "<td>" + ocourse[i].time + "</td>";
						ttxt += "<td>" + ocourse[i].availability + "</td>";
						ttxt += '</tr>';
					}
					ttxt = ttxt.replace(/(^\s*)|(\s*$)/g, "").replace(/&nbsp;/g, "").replace(/;/g, "<br>");
					$('#courseList').html(ttxt);
					
					$(["doInfo", "doSelect", "doAvail", "doPrepare"]).each(function (i, func) {
						$("." + func).click(function (e) {
							window[func]($(e.target).parentsUntil('tbody').last().attr('name'));
						});
					});
				} else
					reformer.modal().title('通知').content("<p>未找到课程。</p>").show();
			})
			.error(function () {
				reformer.modal().title('通知').content("<p>查找失败。</p>").show();
			});
		}
	});
	$("#coursePlan").click(function () {
		var modal = reformer.modal().title('开课计划');
		$.get('http://59.77.7.100:8080/manage/stu_Teach_Plan.do')
		.success(function (msg) {
			var term = $(msg).find('select').first().find('option').last().attr('value');
			$.get('http://59.77.7.100:8080/manage/stu_Term_Tp.do?modulegroup=teach_adm&module=stu_teach_plan&studyYearTerm=' + term + '&operation=major')
			.success(function (msg) {
				var tmpDom = document.createElement('div');
				tmpDom.innerHTML = msg;
				$(tmpDom)
				.find('table')
				.addClass('table table-condensed table-hover')
				.removeAttr('style');
				$(tmpDom).find("input")
				.remove();
				$(tmpDom).find('link').remove();
				modal
				.content(tmpDom.innerHTML)
				.show();
				
				$('#modal .spec').parent().dblclick(function () {
					var td = $(this).children('td');
					$("#courseTeacher").val(td[5].innerText);
					$("#courseName").val(td[1].innerText);
					$("#searchCourse").click();
					modal.hide();
				}).tooltip({
					title : '双击查询课程'
				});
			}).error(function () {
				modal.content('<p>获取失败，当前网站可能遇到错误，请稍候再试。</p>').show();
			});
		})
		.error(function () {
			modal.content('<p>获取失败，当前网站可能遇到错误，请稍候再试。</p>').show();
		});
	});
	$("#courseStatus").click(function () {
		var modal = reformer.modal().title('选课情况');
		$.get('http://59.77.7.100:8080/manage/studentCourse.do?action=query')
		.success(function (msg) {
			reg = /<table[\s\S]*?<\/table>/gi;
			var tmpDom = document.createElement('div');
			tmpDom.innerHTML = String(reg.exec(msg));
			$(tmpDom).find('th').first().remove();
			$(tmpDom).find('th.spec').hide();
			$(tmpDom).find('a').parent().each(function () {
				$(this).html($(this).text());
			});
			$(tmpDom).find('table').addClass('table table-condensed table-hover');
			modal.content(tmpDom.innerHTML).show();
			$('th.spec').parent().dblclick(function () {
				var td = $(this).children('td');
				$("#courseTeacher").val(td[7].innerText);
				$("#courseName").val(td[0].innerText);
				$("#searchCourse").click();
				modal.hide();
			}).tooltip({
				title : '双击查询课程'
			});
		})
		.error(function () {
			modal.content('<p>获取失败，当前网站可能遇到错误，请稍候再试。</p>').show();
		});
	});
	$("#courseForm input").keydown(function (e) {
		if (e.which === 13)
			$("#searchCourse").click();
	});
});
