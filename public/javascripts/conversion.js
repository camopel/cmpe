var Conversion={
	LastSelectedRow:-1,
	RawData:null,
	UserDict:null,
	cd_form:null,
	cd_dialog:null,
	cd_name:null,
	cd_year:null,
	cd_season:null,
	cd_sjsuid:null,
	cd_conv:null,
	cd_id:null,
	cd_comment:null,
	cd_allFields:null,
	name_filter:"",
	dict:["","Winter","Spring","Summer","Fall"],
	semester2String:function(s){return (Conversion.dict[s.charAt(3)]+" "+s.charAt(0)+"0"+s.substring(1,3));},
	create:function(){
		if(Conversion.RawData!=null)
		{
			$("#ConversionTable").html("");
			$("#ct_professor").html("");
			$("#ct_professor").append($('<option>',{value: "" , text: "All"}));
			$('#msg').text("");
			Conversion.RawData=null;
		}
		$.ajax({
			url: '/conv',
			type: 'get',
			data: "cmd=show",
			success: function(data) {					
				if(data.success=='true')
				{
					Conversion.UserDict = data.users;					
					for (var id in data.users){
						var name = data.users[id];
						$("#ct_professor").append($('<option>',{value: name , text: name}));
					}
					$("#ct_professor").val(Conversion.name_filter);
					
					Conversion.RawData = data.data;
					data.data.forEach(function(row){
						$("#ConversionTable").append('<tr><td class="checkbox"></td><td>'+row.name+'</td><td class="ys">'+Conversion.semester2String(row.semester)+'</td><td class="cv">'+row.conv+'</td><td class="left">'+row.comment+'</td></tr>');
					});
					
					$("#ConversionTable").find('tr').click(function(ev) {
						var td = $(ev.target).get(0);
						$(td).toggleClass('checked');
						
						if(Conversion.LastSelectedRow>=0 && Conversion.LastSelectedRow != $(this).index())
						{
							var lastbox = $('#ConversionTable tr:eq(' + Conversion.LastSelectedRow + ') td:eq(0)');
							$(lastbox).removeClass('checked');
						}					
						if($(td).hasClass("checked")) Conversion.LastSelectedRow = $(this).index();
						else Conversion.LastSelectedRow=-1;
					});
					Conversion.nameChange();
					Conversion.updateTotal();
				}
				else $('#msg').text(data.msg);
				
				if(data.redirectpage!=null) window.location = data.redirectpage;			
			}
		});
	},
	updateConversion:function(){
		$(".validateTips").removeClass( "ui-state-highlight");
		var valid = true;
		Conversion.cd_allFields.removeClass( "ui-state-error" );
		valid = valid && Conversion.checkLength( Conversion.cd_conv, "Conversion");
		valid = valid && Conversion.checkLength( Conversion.cd_sjsuid, "SJSU ID");	
		if(!valid) return;
		$.ajax({
			url: '/conv',
			type: 'get',
			data: "cmd=update&"+$('#cd_form').serialize(),
			success: function(data){
				if(data.success=='true')
				{
					Conversion.RawData[Conversion.LastSelectedRow].semester= Conversion.cd_year.val()+Conversion.cd_season.val();
					Conversion.RawData[Conversion.LastSelectedRow].conv=Conversion.cd_conv.val();
					Conversion.RawData[Conversion.LastSelectedRow].comment=Conversion.cd_comment.val();
					Conversion.RawData[Conversion.LastSelectedRow].sjsuid=Conversion.cd_sjsuid.val();
					var name = Conversion.UserDict[Conversion.cd_sjsuid.val()];
					Conversion.RawData[Conversion.LastSelectedRow].name=name;					
					var lastrow = $('#ConversionTable tr:eq(' + Conversion.LastSelectedRow + ')');
					var semster = Conversion.semester2String(Conversion.RawData[Conversion.LastSelectedRow].semester);					
					$(lastrow).html('<td class="checkbox checked"></td><td>'+name+'</td><td class="ys">'+semster+'</td><td class="cv">'+Conversion.cd_conv.val()+'</td><td class="left">'+Conversion.cd_comment.val()+'</td>');
					Conversion.updateTotal();
					Conversion.cd_close();
				}
				else Conversion.updateTips(data.msg);
			}
		});
	},
	cd_close:function(){
		Conversion.cd_form[0].reset();
        Conversion.cd_allFields.removeClass( "ui-state-error" );
		Conversion.cd_dialog.dialog( "close" );
	},
	updateTips:function(t){
		$(".validateTips").text(t).addClass( "ui-state-highlight" );
    },	
	checkLength:function(o, n){
      if(o.val().length==0){
        o.addClass( "ui-state-error" );
        Conversion.updateTips( n + " must not be empty" );
        return false;
      }else return true;
    },
	updateShow:function(){
		Conversion.cd_name.css("display","");
		$("#cd_form label:eq(0)").css("display","");
		Conversion.cd_dialog.dialog( "option", "buttons", [{
			"text": "Update",
			click: Conversion.updateConversion
		}]);
		if(Conversion.LastSelectedRow>=0)
		{
			Conversion.cd_id.val(Conversion.RawData[Conversion.LastSelectedRow].id);
			Conversion.cd_name.val(Conversion.RawData[Conversion.LastSelectedRow].name);
			Conversion.cd_sjsuid.val(Conversion.RawData[Conversion.LastSelectedRow].sjsuid);
			Conversion.cd_year.val(Conversion.RawData[Conversion.LastSelectedRow].semester.substring(0,3));				
			Conversion.cd_season.val(Conversion.RawData[Conversion.LastSelectedRow].semester.charAt(3));
			Conversion.cd_conv.val(Conversion.RawData[Conversion.LastSelectedRow].conv);
			Conversion.cd_comment.val(Conversion.RawData[Conversion.LastSelectedRow].comment);
			Conversion.cd_dialog.dialog("open");
		}
	},
	addShow:function(){
		Conversion.cd_name.css("display","none");
		$("#cd_form label:eq(0)").css("display","none");
		Conversion.cd_dialog.dialog( "option", "buttons", [{
			"text": "Add",
			click: function(){
				$.ajax({
					url: '/conv',
					type: 'get',
					data: "cmd=add&"+$('#cd_form').serialize(),
					success: function(data){						
						if(data.success=='true'){
							Conversion.create();
						}
						Conversion.cd_close();
						if(data.redirectpage!=null) window.location = data.redirectpage;
					}});
			}
		}]);
		Conversion.cd_dialog.dialog("open");
	},
	delShow:function(){
		if(Conversion.LastSelectedRow>=0){
			$.ajax({
			url: '/conv',
			type: 'get',
			data: "cmd=del&id="+Conversion.RawData[Conversion.LastSelectedRow].id,
			success: function(data){				
				if(data.success=='true'){
					Conversion.create();
				}
				if(data.redirectpage!=null) window.location = data.redirectpage;
			}});
		}
	},
	initial:function(){	
		Conversion.cd_name = $( "#cd_name" );
		Conversion.cd_year = $( "#cd_year" );
		Conversion.cd_season = $( "#cd_season" );
		Conversion.cd_sjsuid = $( "#cd_sjsuid" );		
		Conversion.cd_conv = $( "#cd_conv" );		
		Conversion.cd_comment = $( "#cd_comment" );		
		Conversion.cd_id = $( "#cd_id" );
		Conversion.cd_allFields = $([]).add( Conversion.cd_conv ).add( Conversion.cd_email ).add(Conversion.cd_sjsuid);
		Conversion.cd_dialog = $( "#UpdateConversionDialog" ).dialog({
		  autoOpen: false,
		  height: 550,
		  width: 350,
		  modal: true,
		  buttons: {
			"Update": Conversion.updateConversion
		  },
		  close: Conversion.cd_close
		});
		Conversion.cd_form = Conversion.cd_dialog.find("form").on("submit",function(event){
			event.preventDefault();
			Conversion.updateConversion();
		});
		$("#BtnUpdateConversion" ).button().on("click",Conversion.updateShow);
		$("#BtnAddConversion" ).button().on("click",Conversion.addShow);
		$("#BtnDelConversion" ).button().on("click",Conversion.delShow);
		$("#ct_semester").change(Conversion.ysChange);
		//Initial Select
		var today = new Date();
		var year = today.getFullYear();
		for(var i=year;i>=2013;i--){
			for(var j=4;j>=2;j--){
				var s = Conversion.dict[j]+" "+i;
				$("#ct_semester").append($('<option>',{value: s, text: s}));
			}
		}
		
		for(var i=year;i>=2013;i--){
			$("#cd_year").append($('<option>',{value: "2"+i%100, text: i}));			
		}
		
		$("#ct_professor").change(Conversion.nameChange);		
	},
	ysChange:function(e){
		$("#ConversionTable tr").each(function(i,row){
			var tdtxt = $(row).children("td.ys").text();
			var tartxt = $("#ct_semester").val();//$("#ct_semester").val()+" "+$("#ct_year").val();
			if(tdtxt.indexOf(tartxt)!=-1) $(row).css("display","");
			else $(row).css("display","none");
		});
		Conversion.updateTotal();
		Conversion.name_filter = "";
		$("#ct_professor").val("");
	},
	nameChange:function(){
		var selName = $("#ct_professor").val();
		Conversion.name_filter = selName;
		$("#ConversionTable tr").each(function(i,row){
			var rowProfName = $(row).children(":nth-child(2)").text();							
			if(rowProfName.indexOf(selName)!=-1) $(row).css("display","");
			else $(row).css("display","none");
		});
		Conversion.updateTotal();
		$("#ct_semester").val("");
	},
	updateTotal:function(){
		var sum=0;
		$("#ConversionTable tr").each(function(i,row){
			if($(row).css('display') != 'none'){
				sum+=parseFloat($(row).children("td.cv").text());
			}				
		});
		$("#ct_totalconv").text(sum.toFixed(2));
	}
};


