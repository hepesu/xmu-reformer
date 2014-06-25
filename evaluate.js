(function (window, ko, $) {
	var obj = ko.dataFor($("#topic")[0]);
	if (!obj)
		obj = init();
	(function () {
		if (!obj)
			return 0;
		var fn = arguments.callee;
		if (!obj.isEndTopic()) {
			$("#topic #tableid_" + (obj.displayIndex() - 1) + " input[rbl=100]").attr("checked", 1);
			obj.nextTopic();
			setTimeout(function () {
				fn();
			}, 100);
		} else {
			$("#topic .lx3").val("无建议");
			$(".saveButton").click();
		}
	})();
})(window, ko, jQuery);

//None my work LOL
function init() {
	//Dirty fix =_=
	window.sfpgFlag = /sfpgFlag/.test(document.body.innerHTML) ? 0 : undefined;

	var index = 0;
	var table = jQuery("#topic .zb");
	//  类型1 = 单选
	//  类型3 = 主观
	//  类型10= 主观得分题
	var option = 0;
	document.getElementById("prevlink").style.color = "#AAAAAA";
	if (topic.length == 1) {
		document.getElementById("nextlink").style.color = "#AAAAAA";
	}
	var validationRule = {
		'lx1' : function (current) {
			var checked = jQuery('input[type=radio]:checked', this);
			if (checked.length) {
				return true;
			}
			alert('提示：请选择!');
			return false;
		},
		'lx3' : function (current) {
			var value = this.val();
			if (value == '') {
				alert('提示：请输入!');
				this.focus();
				return false;
			}
			var textCount = 0;
			var pbcFlag = false;

			for (var i = 0; i < pbc.length; i++) {
				if (value.indexOf(pbc[i]) >= 0) {
					pbcFlag = true;
					break;
				}
			}

			if (pbcFlag) {
				jQuery("font[color=red]").html("");
				alert('主观内容含有屏蔽词，不能保存');
				return false;
			}
			return true;
		},
		'lx10' : function (current) {
			var fz = jQuery('tr:first .fz', current);
			if (fz) {
				fz = parseInt(fz.text());
			}
			var value = this.val();
			if (value == '') {
				alert('提示：请输入 0 ~ ' + fz + ' 范围分数!');
				this.focus();
				return false;
			}
			if (isNaN(value)) {
				alert('提示：请输入数字!');
				this.focus();
				return false;
			}
			//		var isFloat=/^\d*(\.\d{1,2})?jQuery/;
			var isFloat = /^(([1-9]\d+)|(\d))(\.([1-9]|(\d[1-9])))?jQuery/;
			if (!isFloat.test(value)) {
				alert('提示：请输入数字，最多只能到小数点后两位!');
				this.focus();
				return false;
			}
			value = parseInt(value);
			if (fz) {

				if (value > fz || value < 0) {
					alert('提示：请输入 0 ~ ' + fz + ' 范围分数!');
					this.focus();
					return false;
				}
			}
			return true;
		}
	};
	var check = window.pjcheck = function () {
		//var current  = table.find(':visible');
		var current = jQuery("#tableid_" + index);
		for (var rule in validationRule) {
			var dom = jQuery('.' + rule, current);
			if (dom.length) {
				for (var i = 0; i < dom.length; i++) {
					var result = validationRule[rule].call(jQuery(dom[i]), current);
					if (result === false) {
						return false;
					}
				}
			}
		}
		return true;
	}

	var inputValue = {
		'lx1' : function (current) {
			var checked = jQuery('input[type=radio]:checked', this);
			if (checked.length > 0) {
				//			var rfz = checked[0].rfz;
				//			var rbl = checked[0].rbl;
				var rfz = jQuery('input[type=radio]:checked', this).attr("rfz");
				var rbl = jQuery('input[type=radio]:checked', this).attr("rbl");
				return rfz * rbl / 100;
			} else {
				return '未填';
			}
		},
		'lx3' : function (current) {
			var value = this.val();
			if (value != '') {
				return '已填';
			} else {
				return '未填';
			}
		},
		'lx10' : function (current) {
			var value = this.val();
			if (value != '') {
				return value;
			} else {
				return '未填';
			}
		}
	};

	var changePfgk = window.pjcheck = function () {
		//var aa  = table.find(':visible');
		var aa = jQuery("#tableid_" + index);
		for (var rule in validationRule) {
			var dom = jQuery('.' + rule, aa);
			if (dom.length) {
				for (var i = 0; i < dom.length; i++) {
					var ivalue = inputValue[rule].call(jQuery(dom[i]), aa);
					var divIndex = index + 1;
					var divId = "z_" + i + "_" + divIndex;
					//alert(rule+"&&"+divId+"&&"+dom[i].id);
					document.getElementById(divId).innerHTML = ivalue;
				}
			}
		}
		return true;
	}

	var changeColor = window.pjcheck = function (func) {
		//var current  = table.find(':visible');
		var current = jQuery("#tableid_" + index);
		var obj = jQuery("div[name='pfgk_content']");
		for (var m = 0; m < obj.length; m++) {
			obj[m].style.background = "#FFFFFF";
		}
		for (var rule in validationRule) {
			var dom = jQuery('.' + rule, current);
			if (dom.length) {
				for (var n = 0; n < dom.length; n++) {
					var divIndex;
					if (func == "next") {
						divIndex = index + 2;
					} else {
						divIndex = index;
					}
					if (divIndex <= 0) {
						divIndex = 1;
					} else if (divIndex > obj.length / dom.length) {
						divIndex = obj.length / dom.length;
					}
					var divId = "z_" + n + "_" + divIndex;
					document.getElementById(divId).style.background = "#FFA4A4";
				}
			}
		}
		return true;
	}

	jQuery(table[index]).show();
	var viewModel = function () {
		var displayIndex = this.displayIndex = ko.observable(index + 1);
		var totalTopic = this.totalTopic = topic.length;
		//实现暂存功能

		jQuery(".tempButton").bind('click', function () {
			//showAndHidden();
			if (!check()) {
				return false;
			}
			jQuery.ajax({
				type : 'post',
				url : jQuery("#tempSaveUrl").val(),
				data : jQuery("#frm").serialize(),
				async : false
			}).done(function (data) {
				if (data.success) {
					alert("提示：暂存成功!");
					changePfgk();
				} else {
					alert("提示：暂存失败!");
				}
			});
		});
		this.nextTopic = function () {
			/*if(!check()){
			return false;
			}
			if(window.sfpgFlag != undefined){
			jQuery.ajax({
			type : 'post',
			url : jQuery("#tempSaveUrl").val(),
			data : jQuery("#frm").serialize()
			}).done(function (data){

			});
			}
			changePfgk();
			changeColor("next");
			var newIndex = index + 1;
			if(newIndex + 1 <= totalTopic){
			index = newIndex;
			displayIndex(index + 1);
			table.hide();
			jQuery(table[index]).show();
			}
			if(displayIndex() >= totalTopic){
			document.getElementById("nextlink").style.color = "#AAAAAA";
			}else{
			document.getElementById("prevlink").style.color = "#0088CC";
			}
			countScore();
			 */
			if (!check()) {
				return false;
			}
			if (option == 0) {
				option = 1;
				if (window.sfpgFlag != undefined) {
					jQuery.ajax({
						type : 'post',
						url : jQuery("#tempSaveUrl").val(),
						data : jQuery("#commonDiv,#tableid_" + index).find("input,textarea").serialize()
					}).done(function (data) {
						if (data.success === true) {
							changePfgk();
							changeColor("next");
							var newIndex = index + 1;
							if (newIndex + 1 <= totalTopic) {
								index = newIndex;
								displayIndex(index + 1);
								table.hide();
								jQuery(table[index]).show();
							}
							if (displayIndex() >= totalTopic) {
								document.getElementById("nextlink").style.color = "#AAAAAA";
							} else {
								document.getElementById("prevlink").style.color = "#0088CC";
							}
							countScore();
						} else {
							alert(data.success);
						}
						option = 0;
					});
				} else {
					changePfgk();
					changeColor("next");
					var newIndex = index + 1;
					if (newIndex + 1 <= totalTopic) {
						index = newIndex;
						displayIndex(index + 1);
						table.hide();
						jQuery(table[index]).show();
					}
					if (displayIndex() >= totalTopic) {
						document.getElementById("nextlink").style.color = "#AAAAAA";
					} else {
						document.getElementById("prevlink").style.color = "#0088CC";
					}
					countScore();
					option = 0;
				}
			}
		};
		this.prevTopic = function () {
			changePfgk();
			changeColor("prev");
			var newIndex = index - 1;
			if (newIndex >= 0) {
				index = newIndex;
				displayIndex(index + 1);
				table.hide();
				jQuery(table[index]).show();
			}
			if (displayIndex() <= 1) {
				document.getElementById("prevlink").style.color = "#AAAAAA";
			} else {
				document.getElementById("nextlink").style.color = "#0088CC";
			}
			countScore();
		};

		this.isEndTopic = ko.computed(function () {
				var result = displayIndex() >= totalTopic;
				return result;
			});
	}
	ko.applyBindings(new viewModel());

	jQuery(".saveButton").bind('click', function () {
		//		m_save();
		/*jQuery(".saveButton").attr("disabled",true);
		if(!check()){
		jQuery(".saveButton").attr("disabled",false);
		return false;
		}

		var rev = eval('(' + jQuery.ajax({
		type:'POST',
		url:jQuery("#SaveUrl").val(),
		data:jQuery("#frm").serialize(),
		async:false
		}).responseText + ')');

		if(rev.success){
		alert("提交成功!");
		//jQuery(".tempButton").removeattr("disabled");
		//window.location.href= ctx + '/jxpg/xscx/index.do';
		jumpUrl(jQuery("#retURL").val());
		}else{
		alert("提交失败!");
		}*/
		if (!check()) {
			return false;
		}

		if (window.confirm("是否确认提交")) {
			jQuery.ajax({
				type : 'post',
				url : jQuery("#SaveUrl").val(),
				data : jQuery("#commonDiv,#tableid_" + index).find("input,textarea").serialize()
			}).done(function (data) {
				if (data.success === true) {
					alert("提交成功!");
					jumpUrl(jQuery("#retURL").val());
				} else {
					alert("提交失败!请检查问卷是否填写完整");
				}
			});

		}

	});

	jQuery(".returnButton").bind('click', function () {

		window.history.go(-1);
		//		//m_return();
		//		var isFlag = jQuery("#isFlag").val();
		//		if(isFlag != "true"){
		//			window.returnValue = "undo";
		//		}
		//		window.close();
	});
	jQuery("a[rel=power]").each(function () {
		jQuery("#" + this.id).powerFloat({
			target : jQuery("#targetDiv"),
			hoverFollow : true,
			position : "0-0"
		});
	});
	FixTable("pgTable", 1, window.screen.availWidth * 0.98, 380);

	jQuery("#pgTable_tableData input[type=radio]").each(function () {
		var curId = jQuery(this).attr("id");
		jQuery("#pgTable_tableData").find("input[checked]").each(function () {
			var selectedId = jQuery(this).attr("id");
			if (curId == selectedId) {
				jQuery(this).attr("checked", "checked");
			}
		});
	});

	jQuery('input[type=radio]').change(function () {
		jQuery('font', jQuery(this).parent()).removeClass('raidoSelected');
		jQuery(this).next().addClass('raidoSelected');
	});

	countScore();

	return ko.dataFor(jQuery("#topic")[0]);
};

function jumpUrl(url) {
	window.location = url;
}
/**
 *	功能:键盘控制，只能输入数字
 *	参数:	无
 *	返回:	无
 **/
function keyPressContor() {
	if (event.keyCode < 48 || event.keyCode > 57) {
		event.returnValue = false;
	}
}
function m_save() {
	if (!window.pjcheck()) {
		return false;
	}
	var singCount = jQuery("#singlgSub").val();
	var multCount = jQuery("#multiSub").val();
	var selMultCount = 0;
	var selTitle = '';

	var selSingCount = jQuery("#frm :radio:checked").length;
	jQuery("#frm :checkbox:checked").each(function (e) {
		if (selTitle.indexOf(jQuery(this).attr("name")) < 0) {
			selTitle += jQuery(this).attr("name");
			selMultCount++;
		}

	});
	if (selMultCount < multCount) {
		jQuery("font[color=red]").html("");
		alert('请选择完所有题目再保存');
		return;
	}
	var textCount = 0;
	var pbcFlag = false;
	jQuery(".lx3").each(function () {
		if (jQuery(this).val() == '')
			textCount++;
		for (var i = 0; i < pbc.length; i++) {
			if (jQuery(this).val().indexOf(pbc[i]) >= 0) {
				pbcFlag = true;
				return;
			}
		}
	});
	if (pbcFlag) {
		jQuery("font[color=red]").html("");
		alert('主观内容含有屏蔽词，不能继续');
		return;
	}
	if (singCount > selSingCount) {
		jQuery("font[color=red]").html("");
		alert("请选择完所有题目再保存！");
		return;
	}
	if (jQuery("#ZGSFBT").val() == '1' && textCount > 0) {
		jQuery("font[color=red]").html("");
		alert("请选择完所有题目再保存！");
		return;
	}

	jQuery("#pgTable_tableData").find("textarea[name=zgcss]").each(function () {
		var curId = jQuery(this).attr("id");
		var hidId = "";
		hidId = curId.replace("zg_", "hid_");
		jQuery("#" + hidId).val(jQuery(this).val());
	});
	//ajax
	var rev = eval('(' + jQuery.ajax({
				type : 'POST',
				url : jQuery("#frm").attr("action"),
				data : jQuery("#frm").serialize(),
				async : false
			}).responseText + ')');

	if (rev.success) {
		alert("提交成功!");
		//window.location.href= ctx + '/jxpg/xscx/index.do';
		jumpUrl(jQuery("#retURL").val());
	} else {
		alert("提交失败!");
	}
	//jQuery("#frm").submit();
}
function m_return() {
	/*
	 * var appPath = jQuery("#appPath").val();
	var retURL = jQuery("#retURL").val();
	jQuery("#frm").attr("action", appPath+retURL);
	jQuery("#frm").submit();*/
	var appPath = jQuery("#appPath").val();
	var retURL = jQuery("#retURL").val();
	document.location.href = appPath + retURL;
}

function showAndHidden() {
	jQuery("#pgTable_tableData").find("input[type=radio],textarea[name=zgcss]").each(function () {
		var curId = jQuery(this).attr("id");
		var hidId = "";
		if (curId.indexOf("zg") != -1) {
			hidId = curId.replace("zg_", "hid_");
		}
		jQuery("#" + hidId).val(jQuery(this).val());
	});
}

function FixTable(TableID, FixColumnNumber, width, height) {
	if (jQuery("#" + TableID + "_tableLayout").length != 0) {
		jQuery("#" + TableID + "_tableLayout").before(jQuery("#" + TableID));
		jQuery("#" + TableID + "_tableLayout").empty();
	} else {
		jQuery("#" + TableID).after("<div id='" + TableID + "_tableLayout' style='overflow:hidden;height:" + height + "px; width:" + width + "px;'></div>");
	}
	jQuery('<div id="' + TableID + '_tableFix"></div>'
		 + '<div id="' + TableID + '_tableHead"></div>'
		 + '<div id="' + TableID + '_tableColumn"></div>'
		 + '<div id="' + TableID + '_tableData"></div>').appendTo("#" + TableID + "_tableLayout");
	var oldtable = jQuery("#" + TableID);
	var tableFixClone = oldtable.clone(true);
	tableFixClone.attr("id", TableID + "_tableFixClone");
	jQuery("#" + TableID + "_tableFix").append(tableFixClone);
	var tableHeadClone = oldtable.clone(true);
	tableHeadClone.attr("id", TableID + "_tableHeadClone");
	jQuery("#" + TableID + "_tableHead").append(tableHeadClone);
	var tableColumnClone = oldtable.clone(true);
	tableColumnClone.attr("id", TableID + "_tableColumnClone");
	jQuery("#" + TableID + "_tableColumn").append(tableColumnClone);
	jQuery("#" + TableID + "_tableData").append(oldtable);
	jQuery("#" + TableID + "_tableLayout table").each(function () {
		jQuery(this).css("margin", "0");
	});
	var HeadHeight = jQuery("#" + TableID + "_tableHead thead").height();
	HeadHeight += 2;
	jQuery("#" + TableID + "_tableHead").css("height", HeadHeight);
	jQuery("#" + TableID + "_tableFix").css("height", HeadHeight);
	var ColumnsWidth = 0;
	var ColumnsNumber = 0;
	jQuery("#" + TableID + "_tableColumn tr:last td:lt(" + FixColumnNumber + ")").each(function () {
		ColumnsWidth += jQuery(this).outerWidth(true);
		ColumnsNumber++;
	});
	ColumnsWidth += 2;
	if (jQuery.browser.msie) {
		switch (jQuery.browser.version) {
		case "7.0":
			if (ColumnsNumber >= 3)
				ColumnsWidth--;
			break;
		case "8.0":
			if (ColumnsNumber >= 2)
				ColumnsWidth--;
			break;
		}
	}
	jQuery("#" + TableID + "_tableColumn").css("width", ColumnsWidth);
	jQuery("#" + TableID + "_tableFix").css("width", ColumnsWidth);
	jQuery("#" + TableID + "_tableData").scroll(function () {
		jQuery("#" + TableID + "_tableHead").scrollLeft(jQuery("#" + TableID + "_tableData").scrollLeft());
		jQuery("#" + TableID + "_tableColumn").scrollTop(jQuery("#" + TableID + "_tableData").scrollTop());
	});
	jQuery("#" + TableID + "_tableFix").css({
		"overflow" : "hidden",
		"position" : "relative",
		"z-index" : "50",
		"background-color" : "Silver"
	});
	jQuery("#" + TableID + "_tableHead").css({
		"overflow" : "hidden",
		"width" : width - 17,
		"position" : "relative",
		"z-index" : "45",
		"background-color" : "Silver"
	});
	jQuery("#" + TableID + "_tableColumn").css({
		"overflow" : "hidden",
		"height" : height - 17,
		"position" : "relative",
		"z-index" : "40",
		"background-color" : "#F5FAFE"
	});
	jQuery("#" + TableID + "_tableData").css({
		"overflow" : "scroll",
		"width" : width,
		"height" : height,
		"position" : "relative",
		"z-index" : "35"
	});
	if (jQuery("#" + TableID + "_tableHead").width() > jQuery("#" + TableID + "_tableFix table").width()) {
		jQuery("#" + TableID + "_tableHead").css("width", jQuery("#" + TableID + "_tableFix table").width());
		jQuery("#" + TableID + "_tableData").css("width", jQuery("#" + TableID + "_tableFix table").width() + 17);
	}
	if (jQuery("#" + TableID + "_tableColumn").height() > jQuery("#" + TableID + "_tableColumn table").height()) {
		jQuery("#" + TableID + "_tableColumn").css("height", jQuery("#" + TableID + "_tableColumn table").height());
		jQuery("#" + TableID + "_tableData").css("height", jQuery("#" + TableID + "_tableColumn table").height() + 17);
	}
	jQuery("#" + TableID + "_tableFix").offset(jQuery("#" + TableID + "_tableLayout").offset());
	jQuery("#" + TableID + "_tableHead").offset(jQuery("#" + TableID + "_tableLayout").offset());
	jQuery("#" + TableID + "_tableColumn").offset(jQuery("#" + TableID + "_tableLayout").offset());
	jQuery("#" + TableID + "_tableData").offset(jQuery("#" + TableID + "_tableLayout").offset());
}

function countScore() {
	jQuery(".pf").each(function () {
		var id = jQuery(this).attr("id");
		var bpr = id.split("_")[1];
		var index = id.split("_")[2];
		var zf = 0;
		var mtdf = jQuery(".mtdf_" + bpr + "_" + index);
		for (var i = 0; i < mtdf.length; i++) {
			if (!isNaN(mtdf[i].innerHTML)) {
				zf += parseFloat(mtdf[i].innerHTML);
			}
		}
		document.getElementById("tzf_" + bpr + "_" + index).innerHTML = "当前总分：" + parseFloat(zf).toFixed(0);
	});

}
