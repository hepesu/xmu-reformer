(function (window, ko) {
	var obj = ko.dataFor($("#topic")[0]);
	(function () {
		var fn = arguments.callee;
		if (!obj.isEndTopic()) {
			$("#topic #tableid_" + (obj.displayIndex() - 1) + " input[rbl=100]").attr("checked", 1);
			obj.nextTopic();
			setTimeout(function () {
				fn();
			}, 100);
		}else{
			$("#topic .lx3").val("无建议");
			$(".saveButton").click();
		}
	})();
})(window, ko);
