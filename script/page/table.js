function icsSaver(ssd, sfd) {
	/**
	 * 对Date的扩展，将 Date 转化为指定格式的String
	 * 月(M)、日(d)、12小时(h)、24小时(H)、分(m)、秒(s)、周(E)、季度(q) 可以用 1-2 个占位符
	 * 年(y)可以用 1-4 个占位符，毫秒(S)只能用 1 个占位符(是 1-3 位的数字)
	 * eg:
	 * (new Date()).pattern("yyyy-MM-dd hh:mm:ss.S") ==> 2006-07-02 08:09:04.423
	 * (new Date()).pattern("yyyy-MM-dd E HH:mm:ss") ==> 2009-03-10 二 20:09:04
	 * (new Date()).pattern("yyyy-MM-dd EE hh:mm:ss") ==> 2009-03-10 周二 08:09:04
	 * (new Date()).pattern("yyyy-MM-dd EEE hh:mm:ss") ==> 2009-03-10 星期二 08:09:04
	 * (new Date()).pattern("yyyy-M-d h:m:s.S") ==> 2006-7-2 8:9:4.18
	 */
	Date.prototype.pattern = function (fmt) {
		var o = {
			"M+" : this.getMonth() + 1, //月份
			"d+" : this.getDate(), //日
			"h+" : this.getHours() % 12 == 0 ? 12 : this.getHours() % 12, //小时
			"H+" : this.getHours(), //小时
			"m+" : this.getMinutes(), //分
			"s+" : this.getSeconds(), //秒
			"q+" : Math.floor((this.getMonth() + 3) / 3), //季度
			"S" : this.getMilliseconds() //毫秒
		};
		var week = {
			"0" : "\u65e5",
			"1" : "\u4e00",
			"2" : "\u4e8c",
			"3" : "\u4e09",
			"4" : "\u56db",
			"5" : "\u4e94",
			"6" : "\u516d"
		};
		if (/(y+)/.test(fmt)) {
			fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
		}
		if (/(E+)/.test(fmt)) {
			fmt = fmt.replace(RegExp.$1, ((RegExp.$1.length > 1) ? (RegExp.$1.length > 2 ? "\u661f\u671f" : "\u5468") : "") + week[this.getDay() + ""]);
		}
		for (var k in o) {
			if (new RegExp("(" + k + ")").test(fmt)) {
				fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
			}
		}
		return fmt;
	}
	function detertime(a, b) {
		var timet = new Date();
		a = Number(a);
		switch (a) {
		case 1:
			timet.setHours(0, 0, 0);
			break;
		case 2:
			timet.setHours(0, 55, 0);
			break;
		case 3:
			timet.setHours(2, 10, 0);
			break;
		case 4:
			timet.setHours(3, 5, 0);
			break;
		case 5:
			timet.setHours(6, 30, 0);
			break;
		case 6:
			timet.setHours(7, 25, 0);
			break;
		case 7:
			timet.setHours(8, 40, 0);
			break;
		case 8:
			timet.setHours(9, 35, 0);
			break;
		case 9:
			timet.setHours(11, 10, 0);
			break;
		case 10:
			timet.setHours(12, 5, 0);
			break;
		case 11:
			timet.setHours(13, 0, 0);
			break;
		}
		if (!b) {
			return new Date(timet).pattern('HHmmss');
		} else {
			timet = new Date(timet).getTime() + 2700000;
			return new Date(timet).pattern('HHmmss');
		}
	}
	
	var temptxt = 'BEGIN:VCALENDAR\nPRODID:-//Google Inc//Google Calendar 70.9054//EN\nVERSION:2.0\n';
	var tds = document.getElementsByTagName('td');
	for (var d = 1; d < tds.length - 3; d++) {
		var tdsh = tds[d].innerHTML.replace(/（/ig, '(').replace(/）/ig, ')').replace(/(^\s*)|(\s*$)/g, '').replace(/&nbsp;/ig, '');
		if (tdsh.length > 0) {
			/*if(0<=d&&d<=7)t=1;
			else if(0<=d/2&&d/2<=7)t=2;
			else if(0<=d/3&&d/3<=7)t=3;
			else if(0<=d/4&&d/4<=7)t=4;
			else if(0<=d/5&&d/5<=7)t=5;*/
			var day = (d % 7 == 0) ? 7 : d % 7;
			var time,
			time2;
			switch (day) {
			case 0:
				bd = "SU";
				break;
			case 1:
				bd = "MO";
				break;
			case 2:
				bd = "TU";
				break;
			case 3:
				bd = "WE";
				break;
			case 4:
				bd = "TH";
				break;
			case 5:
				bd = "FR";
				break;
			case 6:
				bd = "SA";
				break;
			}
			var tmpt1 = /\(第\d+/.exec(tdsh);
			var tmpt2 = /\d+节\)/.exec(tdsh);
			if (tmpt1 && tmpt2) {
				time = detertime(tmpt1.toString().slice(2), false);
				time2 = detertime(tmpt2.toString().slice(0, -2), true);
			} else {
				var ttmp;
				if (1 <= d&&d <= 7) {
					ttmp = 1;
				} else if (8 <= d&&d <= 14) {
					ttmp = 3;
				} else if (15 <= d&&d <= 21) {
					ttmp = 5;
				} else if (22 <= d&&d <= 28) {
					ttmp = 7;
				} else if (29 <= d&&d <= 35) {
					ttmp = 9;
				}
				console.log(ttmp, d, tds[d].innerHTML)
				time = detertime(ttmp, false);
				time2 = detertime(ttmp + 1, true);
			}
			
			var iweekdelay = 0;
			var iweek = Math.ceil((new Date(ssd).getTime() - new Date(JSON.parse(localStorage.appSetting).startdate).getTime()) / 604800000) + 1;
			var bevenweek = iweek % 2 ? true : false;
			var iInterval;
			if (tdsh.indexOf('双周') > -1) {
				iInterval = 2;
				if (bevenweek)
					iweekdelay = 7;
			} else if (tdsh.indexOf('单周') > -1) {
				iInterval = 2;
				if (!bevenweek)
					iweekdelay = 7;
			} else {
				iInterval = 1;
			}
			
			var datetxt = Number(new Date(ssd).pattern("yyyyMMdd")) + day - (new Date(ssd).getDay()) + iweekdelay;
			
			temptxt += 'BEGIN:VEVENT\nDESCRIPTION:\n';
			temptxt += 'DTEND:' + datetxt + 'T' + time2 + 'Z\n';
			temptxt += 'DTSTART:' + datetxt + 'T' + time + 'Z\n';
			temptxt += 'DTSTAMP:' + datetxt + 'T' + time + 'Z\n';
			temptxt += 'LOCATION:' + tdsh.replace(/.+周\)/, '').replace(/\)\(.+/, '').replace(/\(/ig, '') + '\n';
			temptxt += 'SUMMARY:' + /[^\(\)]+/.exec(tdsh.replace(/.周\)/, '')) + '\n';
			temptxt += 'RRULE:FREQ=WEEKLY;BYDAY=' + bd + ';UNTIL=' + (Number(new Date(sfd).pattern("yyyyMMdd"))) + 'T' + time2 + 'Z;INTERVAL=' + iInterval + '\n';
			temptxt += 'TRANSP:OPAQUE\nEND:VEVENT\n';
		}
	}
	
	temptxt += 'END:VCALENDAR';
	
	var bb = new Blob([temptxt],{type:"text/plain;charset=utf-8"});
	saveAs(bb, "课程表.ics");
}
$(document).ready(function () {
	$(document).bind('keydown', function (event) {
		if (event.ctrlKey && event.keyCode == 80) {
			$('#print_btn').click();
		}
	});
	
	if (localStorage.courseTable) {
		var table = JSON.parse(localStorage.courseTable);
		$('#courseTable').html(table.content).find('table').addClass('table table-bordered');
		$('button').removeAttr('disabled');
		reformer.tableInput('#courseTable');
		
		$('#save_btn').click(function () {
			table.content = $('#courseTable').html();
			localStorage.courseTable = JSON.stringify(table);
			reformer.modal().title('通知').content("<p>保存完成。</p>").show();
		}).tooltip({
			title : '保存修改后的课程表'
		});
		
		$('#print_btn').click(function () {
			var w = window.open();
			w.document.write("<link rel='stylesheet' type='text/css' href='css/bootstrap.css' />");
			w
			w.document.write("<link rel='stylesheet' type='text/css' href='css/styles.css' />");
			w.document.write($('#courseTable').html());
			w.print();
		}).tooltip({
			title : '打印成pdf文档'
		});
		
		$('#ics_btn').click(function () {
			var osetting = JSON.parse(localStorage.appSetting) || {
				startdate : '',
				finishdate : ''
			};
			var stemp = '<div class="control-group"><label class="control-label" for="sd">开始日期</label><div class="controls"><input id="sd" type="text" class="input-small" value="' + osetting.startdate + '"></div></div>'
				 + '<div class="control-group"><label class="control-label" for="sd">结束日期</label><div class="controls"><input id="fd" type="text" class="input-small" value="' + osetting.finishdate + '"></div></div>';
			
			var modal = reformer.modal();
			modal
			.title('选项')
			.footer('<button class="btn btn-primary" id="icsSet_btn"  >确定</button>')
			.content(stemp)
			.show();
			$('#icsSet_btn').click(function () {
				icsSaver(document.getElementById('sd').value, document.getElementById('fd').value);
				modal.hide();
			});
		}).tooltip({
			title : '保存成.ics文件，可用于Google日历等'
		});
	};
	
});
