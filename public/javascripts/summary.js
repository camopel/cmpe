var Summary={
	create:function(){
		$("#BalanceTable").html("");
		$('#msg').text("");
		$.ajax({
			url: '/proj',
			type: 'get',
			data: "cmd=show",
			success: function(data) {					
				if(data.success=='true')
				{
					var points = {};
					data.data.forEach(function(row){
						if(points[row.name]==null) points[row.name]=0.0;
						points[row.name]+=parseFloat(row.points);
						
					});
					for(var name in points){
						$("#BalanceTable").append('<tr><td>'+name+'</td><td class="pts">'+points[name].toFixed(2)+'</td></tr>');			
					}		
				}
				else $('#msg').text(data.msg);				
				if(data.redirectpage!=null) window.location = data.redirectpage;
			}
		});
	},	
	initial:function(){		
		$("#Balance_condition").change(Summary.filterChange);	
		$("#Balance_number").change(Summary.filterChange);
	},
	filterChange:function(e){
		var n = parseFloat($("#Balance_number").val().length==0?"0":$("#Balance_number").val());
		var condition = $("#Balance_condition").val();
		$("#BalanceTable tr").each(function(i,row){
			var tdval = parseFloat($(row).children("td.pts").text());
			$(row).css("display","none");
			if(condition=="al" || (condition=="ge"&&tdval>=n) || (condition=="gt"&&tdval>n) || (condition=="eq"&&tdval==n) || (condition=="lt"&&tdval<n || (condition=="le"&&tdval<=n))) $(row).css("display","");
		});
		Project.updateTotal();		
	}
};
