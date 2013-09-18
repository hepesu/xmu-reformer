var reformer = {
	modal : function (name, args) {
		var modal = function (name, args) {
			this.name = name || 'modal';
			this.args = $.extend({}, args, {
					backdrop : true,
					keyboard : true,
					show : false,
					once : true,
					closeButton : true
				});
			this.modal = '<div id="' + this.name + '" class="modal hide fade" tabindex="-1" role="dialog" aria-labelledby="' + this.name + 'Label" aria-hidden="true">'
				 + '<div class="modal-header"><button type="button" class="close" data-dismiss="modal" aria-hidden="true">×</button><h3 id="' + this.name + 'Label"></h3></div>'
				 + '<div class="modal-body"></div>'
				 + '<div class="modal-footer"><button class="btn" data-dismiss="modal" aria-hidden="true">关闭</button></div>'
				 + '</div>';
		};
		modal.prototype = {
			init : function () {
				var self = this;
				if ($('#' + this.name).length === 0)
					$(document.body).append(this.modal);
				$('#' + this.name).modal(this.args);
				if (this.args.once)
					$('#' + this.name).on('hidden', function () {
						self.destroy();
					});
				return this;
			},
			show : function () {
				$('.modal').modal('hide');
				$('#' + this.name).modal('show');
				return this;
			},
			hide : function () {
				$('#' + this.name).modal('hide');
				return this;
			},
			toggle : function () {
				$('#' + this.name).modal('toggle');
				return this;
			},
			option : function (opts) {
				$('#' + this.name).modal(opts);
				return this;
			},
			title : function (title) {
				$('#' + this.name + 'Label').html(title);
				this.modal = $('#' + this.name).html();
				return this;
			},
			content : function (content) {
				$('#' + this.name + ' .modal-body').html(content);
				this.modal = $('#' + this.name).html();
				return this;
			},
			footer : function (footer) {
				$('#' + this.name + ' .modal-footer').html(footer);
				if (this.args.closeButton)
					$('#' + this.name + ' .modal-footer').append('<button class="btn" data-dismiss="modal" aria-hidden="true">关闭</button>');
				this.modal = $('#' + this.name).html();
				return this;
			},
			select : function () {
				return $('#' + this.name);
			},
			destroy : function () {
				$('#' + this.name).remove();
			}
		}
		var _modal = new modal(name, args);
		return _modal.init();
	},
	tableInput : function (selector) {
		$(selector).find('td:not(:has(a))').dblclick(function () {
			var td = $(this);
			var oldText = td.text().replace(/(^\s*)|(\s*$)/g, '');
			
			input = $("<textarea>" + oldText + "</textarea>");
			input.width($(this).width());
			input.height($(this).height());
			input.css({
				"border-width" : "0px",
				'margin' : '0',
				'padding' : '0'
			});
			
			td.html(input);
			input.click(function () {
				return false;
			});
			input.focus();
			input.blur(function () {
				var input_blur = $(this);
				var newText = input_blur.val();
				td.html(newText);
			});
			
			function leng(a) {
				return a.replace(/(^\s*)|(\s*$)/g, '').replace(/[^x00-xff]/g, "aa").length / 2.0;
			}
		});
	},
	injectScript : function (scriptResource, callback) {
		var script = document.createElement("script");
		script.type = "text/javascript";
		script.charset = "utf-8";
		script.src = chrome.extension.getURL(scriptResource);
		script.onload = callback;
		(document.head || document.body || document.documentElement).
		appendChild(script);
	},
	injectCSS : function (cssResource, callback) {
		var css = document.createElement('LINK');
		css.type = 'text/css';
		css.rel = 'stylesheet';
		css.href = chrome.extension.getURL(cssResource);
		css.onload = callback;
		(document.head || document.body || document.documentElement).
		appendChild(css);
	},
	router : {
		routes : {},
		action : {},
		extend : function (router) {
			return $.extend({}, this, router);
		},
		matchURL : function (patterns, href) {
			var _href = href || document.location.href;
			function match(pattern, href) {
				var reg = new RegExp(pattern, 'i');
				return _href.match(reg);
			}
			if ($.isArray(patterns)) {
				for (i in patterns)
					if (match(patterns[i]))
						return true;
			} else {
				if (match(patterns))
					return true;
			}
			return false;
		},
		navigate : function (href) {
			var r = this.routes;
			var self = this;
			if (self.action.initialize)
				self.action.initialize();
			checker();
			function checker() {
				var _href = href || document.location.href;
				if ($.isEmptyObject(r))
					return;
				for (action in r) {
					if (self.matchURL(r[action], _href)) {
						if (self.action[action])
							self.action[action]();
						else
							console.log("Missing ActionModule:", action);
						return;
					}
				}
			}
		}
	},
	handler : {
		initialize : function (caller) {
			var self = this;
			window.addEventListener("message", function (event) {
				var data = event.data;
				//if (event.source != window)
				//return;
				if (event.data.sender && (event.data.sender == caller)) {
					if (self.action[event.data.request])
						self.action[event.data.request](event.data.message);
					else
						console.log("Missing ActionModule:", event.data.request);
				}
			}, false);
		},
		extend : function (handler) {
			return $.extend({}, this, handler);
		},
		action : {}
	},
	getRuntime : function () {
		if (chrome.extension)
			return 'chromeApp';
		else
			return 'pageApp';
	},
	initialize : function () {
	//Global control
		jQuery.fx.off = true;
		var runtime = reformer.getRuntime();
		if (runtime === 'chromeApp')
			reformer.chromeApp.initialize();
		if (runtime === 'pageApp')
			reformer.pageApp.initialize();
	}
};
reformer.chromeApp = (function () {
	var pageRouter = reformer.router.extend({
			routes : {
				'gradeModule' : 'stuPersonalGradeSearch',
				'tableModule' : ['studentCourse.do.action=table', 'courseTable'],
				'historyModule' : 'History',
				'statusModule' : ['studentCourse.do.action=query', 'courseChoosed'],
				'chooseModule' : 'chooseCourse',
				'evalueModule' : ['reEvalue','gSEvaluate'],
				'chromeCourseModule' : 'chrome.+course'
			},
			action : {
				defaultAction : function () {},
				initialize : function () {
					$('#box-btn').attr('disabled', 'true').removeClass('btn-info');
					$('#box-btnMenu').empty();
				},
				chromeCourseModule : function () {
					$('#box-btn').removeAttr('disabled').addClass('btn-info');
					$('#box-btnMenu').append('<li><a target="_blank" href="' + chrome.extension.getURL('course.html') + '">窗口打开</a></li>');
				},
				gradeModule : function () {
					$('#box-btn').removeAttr('disabled').addClass('btn-info');
					$('#box-btnMenu').append('<li><a href="#" data-action="getGradestatus">统计信息</a></li>'
						 + '<li><a href="#" data-action="getChecked">选择全部</a></li>'
						 + '<li><a href="#" data-action="getTypechecked">选择选修</a></li>');
					$('#box-btnMenu a').click(function () {
						window.postMessage({
							sender : "script",
							request : $(this).attr('data-action'),
							message : ""
						}, "*");
					});
				},
				evalueModule : function () {
					$('#box-btn').removeAttr('disabled').addClass('btn-info');
					$('#box-btnMenu').append('<li><a href="#" data-action="getEvaluate">一键评教</a></li>'
						 + '<li><a href="#" data-action="getEvaluatesubmit">提交</a></li>');
					$('#box-btnMenu a').click(function () {
						window.postMessage({
							sender : "script",
							request : $(this).attr('data-action'),
							message : ""
						}, "*");
					});
				},
				tableModule : function () {
					$('#box-btn').removeAttr('disabled').addClass('btn-info');
					$('#box-btnMenu').append('<li><a href="#" id="table-btn">保存课程表</a></li>');
					$('#table-btn').click(function () {
						var time = new Date().getTime();
						$.get('http://59.77.7.100:8080/manage//studentCourse.do?action=table')
						.success(function (txt) {
							var reg = /<table[\s\S]*?<\/table>/gi;
							var temp = {
								time : time,
								content : String(reg.exec(txt))
							};
							chrome.extension.sendMessage({
								request : "getCoursetable",
								message : temp
							}, function (response) {
								if (response)
									window.postMessage({
										sender : "script",
										request : "getNotice",
										message : "<p>保存成功。</p>"
									}, "*");
								else
									window.postMessage({
										sender : "script",
										request : "getNotice",
										message : "<p>保存失败。</p>"
									}, "*");
							});
						})
						.error(function () {
							window.postMessage({
								sender : "script",
								request : "getNotice",
								message : "<p>获取失败，当前网站可能遇到错误，请稍候再试。</p>"
							}, "*");
						});
					});
				},
				historyModule : function () {
					$('#box-btn').removeAttr('disabled').addClass('btn-info');
					$('#box-btnMenu').append('<li><a href="#" data-action="getHistory">选择学期</a></li>');
					$('#box-btnMenu a').click(function () {
						window.postMessage({
							sender : "script",
							request : $(this).attr('data-action'),
							message : ""
						}, "*");
					});
				},
				statusModule : function () {
					$('#box-btn').removeAttr('disabled').addClass('btn-info');
					$('#box-btnMenu').append('<li><a href="#" data-action="getStatus">统计信息</a></li>');
					$('#box-btnMenu a').click(function () {
						window.postMessage({
							sender : "script",
							request : $(this).attr('data-action'),
							message : ""
						}, "*");
					});
				},
				chooseModule : function () {
					$('#box-btn').removeAttr('disabled').addClass('btn-info');
					$('#box-btnMenu').append('<li><a href="#" data-action="getCoursetable">课程表</a></li>'
						 + '<li><a href="#" data-action="getAllcourse">显示全部</a></li>'
						 + '<li><a href="#" data-action="getFiltercourse">过滤可选</a></li>');
					$('#box-btnMenu a').click(function () {
						window.postMessage({
							sender : "script",
							request : $(this).attr('data-action'),
							message : ""
						}, "*");
					});
					window.postMessage({
						sender : "script",
						request : "doCoursecode",
						message : ""
					}, "*");
				}
			}
		});
	var handler = reformer.handler.extend({
			action : {
				hrefChange : function (data) {
					//alert(data)
					pageRouter.navigate(data);
				},
				reportBeat : function (data) {
					chrome.extension.sendMessage({
						request : "getNotice",
						message : {
							title : '排队通知',
							content : "排队中部分功能可能不正常 目前：" + data
						}
					});
				},
				getBinding : function () {
					$(top.document).find('#holderIframe').show();
					$(window).bind('beforeunload', function () {
						$(top.document).find('#holderIframe').hide();
					});
				}
			}
		});
	var router = reformer.router.extend({
			routes : {
				'gradeModule' : 'stuPersonalGradeSearch',
				'ajaxTableModule' : 'courseTable.queryByTeacher',
				'loginModule' : ['manage.jsp', 'login.do'],
				'historyModule' : 'history',
				'statusModule' : 'studentCourse.do.action=query',
				//'fastLoginModule' : 'siteId=58&pageId=215#1',
				'chromePageModule' : 'chrome',
				'chooseCourseModule' : 'chooseCourse',
				'evalueModule' : ['reEvalue','gSEvaluate']
			},
			action : {
				defaultAction : function () {},
				initialize : function () {
					var excludeURL = reformer.router.matchURL(['changeToBBSBoard', 'login.jsp', 'logout.jsp', 'FCKeditor']);
					if (reformer.router.matchURL('59.77.7.100')) {
						reformer.injectScript('script/patch.js');
						reformer.injectScript('script/lib/jquery.js', function () {
							reformer.injectScript('script/lib/bootstrap.js');
							reformer.injectScript('script/reformer.js');
						});
						if (!excludeURL) {
							reformer.injectCSS('css/bootstrap.css');
							reformer.injectCSS('css/styles.css');
						}
						$().ready(function () {
							if (!excludeURL) {
								$('table').attr('width', '99%').css({
									'width' : '99%'
								});
								$('input,select').addClass('input-small');
							}
						});
					}
				},
				evalueModule : function () {
					$('textarea').css({
						'height' : '100%',
						'width' : '100%'
					});
				},
				historyModule : function () {
					$(document.body).hide();
					$.get('http://59.77.7.100:8080/manage/studentCourse.do?modulegroup=student&module=chooseCourse&action=queryHistory&currentpage=1&pages=1&querytype=pages&totalrecords=999&recordsPerPage=999')
					.success(function (msg) {
						$(document.body).html(msg);
					})
					.complete(function () {
						$(document.body).show();
					});
				},
				chooseCourseModule : function () {
					$('.spec input').after('<input type="button" class="button input-small prepare" value="备选">');
					$('.prepare').click(function () {
						var $el = $(this).parent().parent().find('a');
						chrome.extension.sendMessage({
							request : 'doPrepare',
							message : {
								name : $el.text(),
								code : $el.attr('name')
							}
						}, function (msg) {
							window.postMessage({
								sender : "script",
								request : "getNotice",
								message : "<p>备选成功！</p>"
							}, "*");
						});
					});
				},
				chromePageModule : function () {
					if (top != window && top == parent) {
						top.postMessage({
							sender : "page",
							request : "hrefChange",
							message : location.href
						}, "*");
						top.postMessage({
							sender : "page",
							request : "getBinding",
							message : ''
						}, "*");
					}
				},
				/*fastLoginModule : function () {
				if (window.location.hash.length > 0) {
				chrome.extension.sendMessage({
				request : 'fastLogin'
				}, function (msg) {
				var name = msg.name;
				var password = msg.password;
				var style = msg.style;
				if (name == 'null') {
				alert('错误\n请正常登录');
				} else {
				var temphtml = '<form name="form" style="display:none" id="form" method="post" target="_self" action="/manage/login.do">'
				+ '<input type="text" name="name" autocomplete="off"  id="name"/>'
				+ '<select name="style" id="style">'
				+ '<option value="student">学生</option>'
				+ '<option value="manager">管理</option>'
				+ '<option value="teacher">教师</option>'
				+ '<option value="other">其他</option>'
				+ '</select>'
				+ '<input  type="password" name="password" autocomplete="off" id="password"/>'
				+ '</form>';
				document.body.innerHTML = temphtml;
				document.getElementById("name").value = name;
				document.getElementById("password").value = password;
				document.getElementById("style").value = style;
				document.getElementById("form").submit();
				}
				});
				}
				},*/
				statusModule : function () {
					reformer.tableInput('table');
					$().ready(function () {
						chrome.extension.sendMessage({
							request : 'quitCourse'
						}, function (msg) {
							if (msg === 'true')
								$('input:disabled').removeAttr('disabled');
						});
					});
				},
				gradeModule : function () {
					reformer.tableInput('table');
					$().ready(function () {
						chrome.extension.sendMessage({
							request : "gpaSetting"
						}, function (msg) {
							$('body').append('<div id="gpa"  style="display:none">' + "{'名称':'加权平均','优':95,'良':85,'及格':65,'合格':80,'两级':true,'加权':true};{'名称':'标准算法','优':4.0,'良':3.0,'及格':1.0,'合格':3.0,'两级':true,'加权':false,'算法':{'4.0':'100-90','3.0':'89-80','2.0':'79-70','1.0':'69-60','0.0':'59-0'}};" + msg + '</div>');
						});
						$('.spec').prepend(function (e) {
							return '<input type="checkbox" id="' + e + '"/>';
						});
						$('input:checkbox').attr('checked', 'true');
						$('th span strong').parent().parent().parent().addClass('selectterm').click(function () {
							$(this).nextUntil('.selectterm').find('input:checkbox').click();
						})
					});
				},
				ajaxTableModule : function () {
					function handleStateChange1(targetselect, text, xmlHttp, defaultvalue) {
						if (xmlHttp.readyState == 4) {
							if (xmlHttp.status == 200) {
								updateOpts(targetselect, text, xmlHttp, defaultvalue);
							}
						}
					}
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
					function updateOpts(target, text, xmlHttp, defaultvalue) {
						var result = xmlHttp.responseXML;
						//result.
						var Ids,
						Names;
						var Ids = result.getElementsByTagName("value");
						var Names = result.getElementsByTagName("display");
						var str,
						arrlen;
						arrlen = Ids.length;
						//alert(text+"--"+result.getElementsByTagName("display").length);
						var targetselect = document.getElementsByName(target)[0];
						targetselect.length = 0;
						var defaultindex = -1;
						for (var i = 0; i < arrlen; i++) {
							if (defaultvalue == Ids[i].firstChild.nodeValue) {
								defaultindex = i;
							}
							if (Ids[i].firstChild.nodeValue == "group") {
								var group = document.createElement("OPTGROUP");
								group.label = Names[i].firstChild.nodeValue;
								targetselect.appendChild(group);
								continue;
							}
							targetselect.options.add(new Option(Names[i].firstChild.nodeValue, Ids[i].firstChild.nodeValue));
						}
						if (defaultindex != -1) {
							targetselect.options[defaultindex].selected = "selected";
						} else {
							if (text != "" && text != "") {
								targetselect.options.add(new Option("--请选择" + text + "--", "null"), 0);
								targetselect.options[0].selected = "selected";
							}
						}
					}
					$().ready(function () {
						getOpts('qbtDep', '', 'dep_no_col', '系');
						getOpts('qbtTerm', '', 'term', '学期');
					});
				},
				loginModule : function () {
					var $body = $('body');
					$body.hide().removeAttr('onload').css({
						'background' : 'whiteSmoke',
						'padding-top' : '60px'
					});
					chrome.extension.sendMessage({
						request : "setUseragent",
						message : 'true'
					});
					$(document).ready(function () {
						if ($('span.style1')[3] != undefined || document.title.indexOf('排队') > -1) {
							var nav = '<div class="navbar  navbar-inverse  navbar-fixed-top">'
								 + '<div class="navbar-inner">'
								 + '<a class="brand" href="#">厦门大学教务系统</a>'
								 + '<ul id="nav" class="nav"><ul class="nav">'
								 + '</ul></ul>'
								 + '</div>'
								 + '</div>';
							var container = '<div class="holder">'
								 + '<div class="box-header">'
								 + '<h2><i class="icon-book"></i><span class="break"></span><span id="box-title">' + (document.title.indexOf('排队') == -1 ? $('span.style1')[3].innerText : '') + (document.title.indexOf('排队') > -1 ? '<span class="label label-warning">排队中</span>' : '') + '</span></h2>'
								 + '<div class="box-icon pull-right">'
								 + '<button disabled id="box-btn" class="btn dropdown-toggle" data-toggle="dropdown" ><i class="icon-wrench"></i></button>'
								 + '<ul id="box-btnMenu" class="dropdown-menu" style="top:34px;"></ul>'
								 + '</div></div>'
								 + '<div class="box-content"><iframe id="holderIframe" src="' + chrome.extension.getURL('welcome.html') + '" frameborder="0" scrolling="auto"></iframe>'
								 + '</div></div>';
							$body.html(nav + container);
							
							var posHandler = function () {
								var h = $(window).height();
								var w = $(window).width();
								var h1 = $('.navbar').height();
								$(".holder").height(h - h1 - 50).width(w - 40).css('top', (h1 + 20) + 'px');
								$("#holderIframe").css('height', ($(".holder").height() - 64) + 'px');
							}
							
							$(window).bind({
								resize : posHandler,
								beforeunload : function () {
									chrome.extension.sendMessage({
										request : "setUseragent",
										message : 'false'
									});
								}
							});
							
							getModule();
						} else {
							$body.fadeIn(400);
							$('link').remove()
							$('table').removeAttr('width', '99%').css({
								'width' : ''
							});
							$('input,select').removeClass('input-small');
						}
						
						function getModule() {
							$.get('http://59.77.7.100:8080/manage/getauthmodule.do')
							.success(function (msg) {
								var tmpDom = document.createElement('div');
								tmpDom.innerHTML = msg;
								
								var txt = '';
								$(tmpDom).find('a[onclick]').each(function () {
									txt += '<li class="dropdown">';
									var click_href = "";
									txt += '<a class="dropdown-toggle" data-toggle="dropdown" href="#">' + $(this).text().split('◇')[1] + '<b class="caret"></b></a>';
									txt += '<ul class="dropdown-menu">';
									var reg = /menu\d*/ig;
									var menun = reg.exec($(this).attr('onmouseover'));
									$(tmpDom).find('div[id=' + menun + '] td[onclick]').each(function () {
										txt += '<li>';
										try {
											var surltemp = /src=[\s\S]*?;/gi.exec($(this).attr('onclick')).toString().slice(5, -2);
											if (surltemp.indexOf('manage/') > -1)
												surltemp = surltemp.split("manage/")[1];
											click_href = 'http://' + String(window.location.href).split('/')[2] + "/manage/" + surltemp;
										} catch (e) {
											click_href = "#";
										}
										txt += '<a class="iframeUrl"  href="#" data-iframe="' + click_href + '">' + $(this).text() + '</a>';
										txt += '</li>';
									});
									txt += '</ul></li>';
								});
								
								$('#nav .nav').append(txt);
								posHandler();
							})
							.error(function () {
								window.postMessage({
									sender : "script",
									request : "getNotice",
									message : "<p>载入失败，稍后重试。</p>"
								}, "*");
								setTimeout(function () {
									getModule()
								}, 60 * 1000);
							})
							.complete(function () {
								chrome.extension.sendMessage({
									request : 'backupUrls'
								}, function (msg) {
									var ttxt = '';
									if (msg !== 'false' && !$('#nav .nav').hasClass('backup-btn')) {
										omenu = JSON.parse(msg);
										ttxt = '<li class="dropdown"><a href="#" class="dropdown-toggle" data-toggle="dropdown">备用<b class="caret"></b></a><ul class="dropdown-menu">';
										for (i in omenu) {
											var stxt = '<li>';
											var surlt = 'http://' + String(window.location.href).split('/')[2] + "/manage/" + omenu[i].url;
											stxt += '<a class="iframeUrl"  href="#" data-iframe="' + surlt + '">' + omenu[i].title + '</a>';
											stxt += '</li>';
											ttxt += stxt;
										}
										ttxt += '</ul></li>';
										$('#nav .nav')
										.prepend(ttxt)
										.addClass('backup-btn');
									}
									if (!$('#nav .nav').hasClass('other-btn'))
										$('#nav .nav')
										.append('<li><a class="iframeUrl" href="#" data-iframe="' + chrome.extension.getURL('course.html') + '">选课辅助</a></li><li><a class="iframeUrl" href="#" data-iframe="' + chrome.extension.getURL('option.html') + '">设置</a></li><li><a href="http://' + String(window.location.href).split('/')[2] + '/manage/logout.jsp">退出</a></li>')
										.addClass('other-btn');
									
									$('.iframeUrl').unbind().click(function () {
										var self = $(this);
										$('#holderIframe').hide(function () {
											$('#box-title').html(self.text());
											$('#holderIframe').attr('src', self.attr('data-iframe'));
										});
									});
									posHandler();
								});
								$body.show();
								//$body.fadeIn(400);
							});
						}
					});
				}
			}
		});
	return {
		handler : handler,
		router : router,
		initialize : function () {
			this.handler.initialize('page');
			this.router.navigate();
		}
	};
})();
reformer.pageApp = (function () {
	var handler = reformer.handler.extend({
			action : {
				getNotice : function (data) {
					if (!$(window.top.document).find("#modal")[0])
						window.top.reformer.modal().title('通知').content(data).show();
				},
				getStatus : function () {
					var b = [];
					$($('#holderIframe')[0].contentWindow.document.body).find('input:button').each(function () {
						var a = $(this).parent().parent().children('td');
						var ctype1 = a[1].innerHTML.replace(/(^\s*)|(\s*$)/g, '').replace(/[^\一-\龥]/g, '');
						var ctype2 = a[2].innerHTML.replace(/(^\s*)|(\s*$)/g, '').replace(/[^\一-\龥]/g, '');
						var temp = parseFloat(a[6].innerHTML.replace(/\/.*/ig, ''));
						var cpoint = isNaN(temp) ? 0.0 : temp;
						b.push({
							'cpoint' : cpoint,
							'ctype1' : ctype1,
							'ctype2' : ctype2
						});
					});
					
					var px = 0;
					var py = 0;
					var ps = 0;
					
					for (j = 0; j < b.length; j++) {
						var p = b[j].cpoint;
						if (b[j].ctype2.indexOf('选修') > -1) {
							if (b[j].ctype1.indexOf('方向性课') > -1)
								py += p;
							else if (b[j].ctype1.indexOf('通识教育') > -1)
								px += p;
						}
						ps += p;
					}
					
					var txt = '<div class="alert alert-success">总学分:' + ps + '分</div>'
						 + '<div class="alert alert-success">校选(选修中通识教育课程):' + px + '分</div>'
						 + '<div class="alert alert-success">院选(选修中方向性课、学科或专业方向性课程):' + py + '分</div>';
					
					reformer.modal().title('统计信息').content(txt).show();
				},
				getGradestatus : function () {
					function getGrade() {
						var gradeTMP = [];
						$($('#holderIframe')[0].contentWindow.document.body).find('a').each(function (i) {
							var courseChecked = $($('#holderIframe')[0].contentWindow.document.body).find('#' + i)[0].checked ? 1 : 0;
							if ($(this).html().indexOf('重新评测') < 0) {
								$(this)
								.parent()
								.parent()
								.children('td,th')
								.css('background', 'rgba(255,0,0,0.25)')
								courseChecked = 0;
							}
							var courseTd = $(this).parent().parent().children();
							gradeTMP.push({
								'ccheck' : courseChecked,
								'cname' : courseTd[1].innerHTML.replace(/&nbsp;/ig, ''),
								'cpoint' : parseFloat(courseTd[2].innerHTML.replace(/\/.*/ig, '')) || 0,
								'ctype1' : courseTd[3].innerHTML.replace(/&nbsp;/ig, ''),
								'ctype2' : courseTd[4].innerHTML.replace(/&nbsp;/ig, ''),
								'cgrade' : courseTd[5].innerHTML.replace(/&nbsp;/ig, '')
							});
						});
						return gradeTMP;
					}
					function gradeStatus(t) {
						var m;
						var txt = '<div class="alert alert-success">';
						var wwindow,
						ttext;
						
						try {
							var k = $($('#holderIframe')[0].contentWindow.document.body).find("#gpa").html();
							if (k.indexOf(';') > -1) {
								k = k.split(';');
								for (o in k) {
									if (k[o].length < 1)
										break;
									var gpa_method = (new Function("return " + k[o]))();
									var sp = 0;
									var sg = 0;
									m = 0;
									if (gpa_method['打印']) {
										wwindow = window.open("", "", "toolbar =no, menubar=no, scrollbars=yes, resizable=yes, location=no, status=no");
										ttext = '<table><tbody><tr><td>课程</td><td>类型</td><td>学分</td><td>权重</td><td>分数</td><td>绩点</td></tr>';
									}
									for (j = 0; j < t.length; j++) {
										if (t[j].ccheck) {
											var grade = t[j].cgrade;
											var point = t[j].cpoint;
											var name = t[j].cname;
											var type = t[j].ctype2;
											if (isNaN(grade)) {
												if (grade.indexOf('优') > -1)
													grade = (gpa_method['优'] > 4) ? gpa_method['优'] / 25 : gpa_method['优'];
												else if (grade.indexOf('良') > -1)
													grade = (gpa_method['良'] > 4) ? gpa_method['良'] / 25 : gpa_method['良'];
												else if (grade.indexOf('及格') > -1 && grade.indexOf('不') == -1)
													grade = (gpa_method['及格'] > 4) ? gpa_method['及格'] / 25 : gpa_method['及格'];
												else if (grade.indexOf('合格') > -1) {
													if (!gpa_method['两级']) {
														grade = 0.0;
														point = 0.0;
													} else {
														if (grade.indexOf('合格') > -1 && grade.indexOf('不') == -1)
															grade = (gpa_method['合格'] > 4) ? gpa_method['合格'] / 25 : gpa_method['合格'];
														else {
															grade = 0.0;
															point = 0.0;
														}
													}
												} else {
													grade = 0.0;
													point = 0.0;
												}
												if (isNaN(grade)) {
													m = '文字转换错误。';
													break;
												}
												//console.log('check1:' + grade);
											} else {
												if (!gpa_method['加权']) {
													grade = parseFloat(grade);
													for (u in gpa_method['算法']) {
														var n = gpa_method['算法'][u].split('-');
														var mt1 = parseFloat(n[0]);
														var mt2 = parseFloat(n[1]);
														var max = Math.max(mt1, mt2);
														var min = Math.min(mt1, mt2);
														/*if(grade>90){
														console.log((grade >= min && grade <= max));
														console.log(grade+'>='+min+'&&'+grade+'<='+max)
														}*/
														if (grade >= min && grade <= max) {
															grade = u;
															break;
														}
													}
												} else {
													//console.log('ave' + grade + ',' + grade / 25)
													grade /= 25.0;
												}
												if (grade > 10) {
													m = '数字转换错误。';
													break;
												}
												//console.log('check2:' + grade);
											}
											var weight = 1;
											if (gpa_method['系数'] != undefined) {
												for (r in gpa_method['系数'])
													if (name.indexOf(r) > -1) {
														weight = gpa_method['系数'][r];
														//console.log(name+':'+weight);
														break;
													}
											}
											if (!isNaN(grade)) {
												sp += point;
												sg += grade * point * weight;
												//console.log('sum:' + sp + ',' + sg)
												
											} else {
												m = '分数错误。';
												break;
											}
											if (gpa_method['打印']) {
												ttext += '<tr><td>' + name + '</td><td>' + type + '</td><td>' + point + '</td><td>' + weight + '</td><td>' + t[j].cgrade + '</td><td>' + grade + '</td></tr>';
											}
										}
									}
									if (gpa_method['打印']) {
										ttext += "</tbody></table>"
										wwindow.document.write(ttext);
									}
									if (String(m).length <= 1 && sg != 0 && sp != 0)
										m = (sg / sp).toFixed(2);
									if (gpa_method['名称'])
										txt += '<div>' + gpa_method['名称'] + ':' + m + '</div>';
									else
										txt += '<div>方法' + (parseInt(o) + 1) + ':' + m + '</div>';
								}
							}
						} catch (e) {
							txt += '错误！';
						}
						txt += '</div>';
						
						var px = 0;
						var py = 0;
						var ps = 0;
						var pd = 0;
						for (j = 0; j < t.length; j++) {
							if (t[j].ccheck) {
								p = t[j].cpoint;
								if (t[j].cname.indexOf('辅修') > -1) {
									pd += p;
								} else if (t[j].ctype2.indexOf('选修') > -1) {
									if (t[j].ctype1.indexOf('方向性课') > -1)
										py += p;
									else if (t[j].ctype1.indexOf('通识教育') > -1)
										px += p;
								}
								ps += p;
							}
						}
						txt += '<div><div class="alert alert-success">总学分:' + ps + '分</div>';
						if (pd > 0)
							txt += '<div class="alert alert-success">辅修:' + pd + '分</div>';
						txt += '<div class="alert alert-success">校选(选修中通识教育课程):' + px + '分</div>';
						txt += '<div class="alert alert-success">院选(选修中方向性课、学科或专业方向性课程):' + py + '分</div></div>';
						
						txt += '<div class="alert alert-warning">注释：缺、免修等不计入。</div>';
						
						return txt;
					}
					
					reformer.modal().title('统计信息').content(gradeStatus(getGrade())).show();
				},
				getChecked : function () {
					$($('#holderIframe')[0].contentWindow.document.body).find('input[type="checkbox"]').click();
				},
				getTypechecked : function () {
					$($('#holderIframe')[0].contentWindow.document.body).find('a').each(function () {
						a = $(this).parent().parent().children();
						if (a[4].innerHTML.replace(/&nbsp;/ig, '').indexOf('选修') > -1) {
							$(this).parent().parent().find('input[type="checkbox"]').click();
						}
					});
				},
				getEvaluate : function () {
					a = $($('#holderIframe')[0].contentWindow.document.body).find('select');
					for (i = 0; i < a.length; i++)
						a[i].options[1].selected = true;
				},
				getEvaluatesubmit : function () {
					$('#holderIframe')[0].contentWindow.do_submit();
				},
				getHistory : function () {
					var termList = createSelect($('#holderIframe')[0].contentWindow.document.body.innerHTML);
					var modal = reformer.modal();
					modal.title('选择学期').content(termList).footer('<button class="btn btn-primary" id="history-btn">确定</button>').show();
					var opt = $('#term')[0].options[$('#term')[0].selectedIndex].value;
					$('#term').change(function () {
						opt = this.options[this.selectedIndex].value;
					});
					$('#history-btn').click(function () {
						var d = document.getElementById("holderIframe").contentWindow.document.getElementsByTagName('th');
						if (opt != "全部") {
							for (i = 5; i < d.length; i++) {
								if (opt != d[i].innerHTML.replace(/(^\s*)|(\s*$)/g, '')) {
									d[i].parentNode.style.display = 'none';
								} else {
									d[i].parentNode.style.display = 'table-row';
								}
							}
						} else {
							for (i = 5; i < d.length; i++) {
								d[i].parentNode.style.display = 'table-row';
							}
						}
						modal.hide();
					});
					function createSelect(h) {
						var e = [];
						var temp = '';
						var f = -1;
						try {
							k = h.split('<th class="spec" style="white-space:normal">');
							for (i = 6; i < k.length; i++) {
								cx = String(k[i].split('</th>')[0].replace(/(^\s*)|(\s*$)/g, ''));
								if (temp != cx) {
									temp = cx;
									f++;
								}
								e[f] = temp;
							}
							var select = "<select id='term'>";
							for (i = 0; i < e.length; i++) {
								select += "<option value='" + e[i] + "'>" + e[i] + "</option>";
							}
							select += "<option value='全部'>全部</option></select>";
							return select;
						} catch (e) {
							return "<div>错误</div>"
						}
					}
				},
				getAllcourse : function () {
					$('#holderIframe')[0].contentWindow.goPage(1, 999);
				},
				getFiltercourse : function () {
					$($('#holderIframe')[0].contentWindow.document.body).find('input:disabled').parent().parent().hide(200);
				},
				doCoursecode : function () {
					$($('#holderIframe')[0].contentWindow.document.body).find('a[onclick]').each(function () {
						var $el = $(this);
						$el.parent().parent().tooltip({
							title : $el.attr('name')
						})
					});
				},
				getCoursetable : function () {
					var modal = reformer.modal('table');
					$.get('http://59.77.7.100:8080/manage//studentCourse.do?action=table')
					.success(function (msg) {
						var reg = /<table[\s\S]*?<\/table>/gi;
						var tmpDom = document.createElement('div');
						tmpDom.innerHTML = String(reg.exec(msg));
						tmpDom.getElementsByTagName("table")[0].style.width = '100%';
						tmpDom.getElementsByTagName("table")[0].cellPadding = '0';
						tmpDom.getElementsByTagName("table")[0].cellSpacing = '0';
						$(tmpDom).find("table").addClass('table');
						var tds = tmpDom.getElementsByTagName('td');
						var ths = tmpDom.getElementsByTagName('th');
						for (var e = 1; e < 8; e++) {
							$(ths[e]).attr('data-queryDay', e).addClass('queryDay').css('cursor', 'pointer');
						}
						tds[0].style.display = 'none';
						for (var d = 1; d < tds.length; d++) {
							if (0 <= d && d <= 7)
								t = 1;
							else if (0 <= d / 2 && d / 2 <= 7)
								t = 2;
							else if (0 <= d / 3 && d / 3 <= 7)
								t = 3;
							else if (0 <= d / 4 && d / 4 <= 7)
								t = 4;
							else if (0 <= d / 5 && d / 5 <= 7)
								t = 5;
							var temp = '<div class="hiddenBlock">' + tds[d].innerHTML + '</div>';
							var day = (d % 7 == 0) ? 7 : d % 7;
							var time;
							var time2;
							switch (t) {
							case 1:
								time = 14;
								time2 = 20;
								break;
							case 2:
								time = 15;
								time2 = 21;
								break;
							case 3:
								time = 17;
								time2 = 22;
								break;
							case 4:
								time = 18;
								time2 = 23;
								break;
							case 5:
								time = 19;
								time2 = 24;
								break;
							}
							$(tds[d])
							.html(temp)
							.addClass('choose queryTime')
							.attr('data-queryDay', day)
							.attr('data-queryTime1', time)
							.attr('data-queryTime2', time2);
						}
						var trs = tmpDom.getElementsByTagName('tr');
						trs[trs.length - 1].style.display = 'none';
						trs[trs.length - 2].style.display = 'none';
						trs[trs.length - 3].style.display = 'none';
						modal.title('课程表').content(tmpDom.innerHTML).show();
						var targetWindow = $('#holderIframe')[0].contentWindow;
						$('.queryDay').click(function () {
							targetWindow.location.href = 'http://59.77.7.100:8080/manage/chooseCourse.do?action=query2&queryDay=' + $(this).attr('data-queryDay');
							modal.hide();
						});
						$('.queryTime').mousedown(function (event) {
							if (event.button == 0) {
								targetWindow.location.href = 'http://59.77.7.100:8080/manage/chooseCourse.do?action=query2&queryTime=' + $(this).attr('data-queryTime1') + '&queryDay=' + $(this).attr('data-queryDay');
							} else if (event.button == 1) {
								targetWindow.location.href = 'http://59.77.7.100:8080/manage/chooseCourse.do?action=query2&queryTime=' + $(this).attr('data-queryTime2') + '&queryDay=' + $(this).attr('data-queryDay');
							}
							modal.hide();
						});
					})
					.error(function () {
						reformer.modal().title('通知').content("<p>课程表初始化失败。</p>").show();
					})
				},
			}
		});
	var router = reformer.router.extend({
			routes : {},
			action : {
				initialize : function () {
					if (top != window && top == parent) {
						top.postMessage({
							sender : "page",
							request : "hrefChange",
							message : location.href
						}, "*");
						top.postMessage({
							sender : "page",
							request : "getBinding",
							message : ''
						}, "*");
					}
				}
			}
		});
	return {
		handler : handler,
		router : router,
		initialize : function () {
			this.handler.initialize('script');
			this.router.navigate();
		}
	}
})();
reformer.initialize();
