var Email = {
	MailList:null,
	ed_dialog:null,
	SelectedMailList:{},
	deselectReceiver:function(e){		
		var div = $(e.target).parent();
		var name = div.children("span:eq(0)").text();		
		delete Email.SelectedMailList[name];
		div.remove();
	},
	selectAction:function(){		
		var html = "";
		Email.SelectedMailList={};
		$("#EmailTable").children('tr').each(function(i,row){
			if($(row).children("td:eq(0)").hasClass("checked")){
				var name = $(row).children("td:eq(1)").text();
				Email.SelectedMailList[name]=Email.MailList[name];
				html+='<div><span>'+name+'</span><span class="vm"/></div>';
			}				
		});
		$("#Receiver").html(html);
		$("#Receiver .vm").click(Email.deselectReceiver);
		Email.ed_close();
	},
	showDialog:function(){
		$("#EmailTable").children('tr').each(function(i,row){
			var name = $(row).children("td:eq(1)").text();
			if(Email.SelectedMailList[name]!=null) $(row).children("td:eq(0)").addClass("checked");
			else $(row).children("td:eq(0)").removeClass("checked");			
		});
		Email.ed_dialog.dialog("open");
	},
	ed_close:function(){
		Email.ed_dialog.dialog( "close" );
	},
	toggleAll:function(){
		$("#EmailTable").children('tr').each(function(i,row){
			 $(row).children("td:eq(0)").toggleClass('checked');
		});
	},
	send:function(){
		var recv = [];
		for(var key in Email.SelectedMailList){
			recv.push(Email.SelectedMailList[key]);
		}
		var email = {
			recv:recv.join(","),
			sub:$(".subject input").val(),
			html:$("#EmailEditor").val()
		}
		$.ajax({
			url: '/eml',
			type: 'post',
			datatype:"json",
			data: email,			
			success: function(data){
				if(data.success=='true') $('#msg').text("Your email is delivered");								
				else $('#msg').text("Your email is failed to deliver, please try later");
			}
		});
	},
	initial:function(){
		Email.ed_dialog = $( "#EmailDialog" ).dialog({
		  autoOpen: false,
		  height: 500,
		  width: 350,
		  modal: true,
		  buttons: {
			"Toggle All":Email.toggleAll,
			"Select": Email.selectAction			
		  },
		  close: Email.ed_close
		});
		$.ajax({
			url: '/faculty',
			type: 'get',
			data: "cmd=maillist",
			success: function(data){
				if(data.success=='true')
				{
					Email.MailList=data.data;
					for (var key in data.data){
						var eml = data.data[key];
						$("#EmailTable").append( '<tr><td class="checkbox"></td><td>'+key+'</td></tr>');
					}
					$("#EmailTable").find('tr').click(function(ev){
						var td = $(ev.target).get(0);
						$(td).toggleClass('checked');
					});
					$(".rcv").click(Email.showDialog);
					$("#Email button").click(Email.send);
				}					
				else $('#msg').text("Could not user mail list,Please try later!");
			}
		});
	},
	create:function(){
		
	}
};