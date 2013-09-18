(function () {
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
})()
