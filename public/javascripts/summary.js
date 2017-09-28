var Summary={
	tabUICallback:null,
	showdetail:function(e){
		var t=$(event.target).text();
		var tab="Project";
		if(t.indexOf("conv")!=-1) tab="Conversion";
		var name = $(event.target).parent().parent().children(":first-child").text();		
		if(Summary.tabUICallback!=null) Summary.tabUICallback(tab,name);
	},
	create:function(){
		$("#BalanceTable").html("");
		$('#msg').text("");
		$.ajax({
			url: '/proj',
			type: 'get',
			data: "cmd=summary",
			success: function(data) {					
				if(data.success=='true')
				{
					var points = {};
					data.projects.forEach(function(row){
						if(points[row.sjsuid]==null) points[row.sjsuid]=0.0;
						points[row.sjsuid]+=parseFloat(row.points);						
					});
					data.conversion.forEach(function(row){
						if(points[row.sjsuid]==null) points[row.sjsuid]=0.0;
						points[row.sjsuid]+=parseFloat(row.conv);						
					});					
					for(var sid in points){
						$("#BalanceTable").append('<tr><td>'+sid+'</td><td>'+data.users[sid]+'</td><td class="pts">'+points[sid].toFixed(2)+'</td>'+'<td><a>project detail</a></td><td><a>conversion detail</a></td></tr>');
					}
					$("#BalanceTable tr td a").click(Summary.showdetail);
					
				}
				else $('#msg').text(data.msg);				
				//if(data.redirectpage!=null) window.location = data.redirectpage;
			}
		});
	},	
	initial:function(cb){		
		$("#Balance_condition").change(Summary.filterChange);	
		$("#Balance_number").change(Summary.filterChange);
		if(cb) Summary.tabUICallback = cb;
	},
	filterChange:function(e){
		var n = parseFloat($("#Balance_number").val().length==0?"0":$("#Balance_number").val());
		var condition = $("#Balance_condition").val();
		$("#BalanceTable tr").each(function(i,row){
			var tdval = parseFloat($(row).children("td.pts").text());
			$(row).css("display","none");
			if(condition=="al" || (condition=="ge"&&tdval>=n) || (condition=="gt"&&tdval>n) || (condition=="eq"&&tdval==n) || (condition=="lt"&&tdval<n || (condition=="le"&&tdval<=n))) $(row).css("display","");
		});	
	}
};
