var Faculty = {
	LastSelectedRow:-1,
	RawData:null,
	fd_ln:null,
	fd_fn:null,
	fd_email:null,
	fd_sid:null,
	fd_id:null,
	fd_allFields:null,
	fd_form:null,
	fd_dialog:null,
	updateFaculty:function()
	{
		$(".validateTips").removeClass( "ui-state-highlight");
		var valid = true;
		Faculty.fd_allFields.removeClass( "ui-state-error" );
		valid = valid && Faculty.checkLength( Faculty.fd_ln, "LastName");
		valid = valid && Faculty.checkLength( Faculty.fd_fn, "FirstName");
		valid = valid && Faculty.checkLength( Faculty.fd_email, "Email");
		valid = valid && Faculty.checkLength( Faculty.fd_sid, "SJSU ID");
		valid = valid && Faculty.checkRegexp( Faculty.fd_email, Faculty.emailRegex, "eg. name@domain.com" );		
		if(!valid) return;		
		$.ajax({
			url: '/faculty',
			type: 'get',
			data: "cmd=update&"+$('#fd_form').serialize(),
			success: function(data){
				if(data.success=='true')
				{
					Faculty.RawData[Faculty.LastSelectedRow].lastname=Faculty.fd_ln.val();
					Faculty.RawData[Faculty.LastSelectedRow].firstname=Faculty.fd_fn.val();
					Faculty.RawData[Faculty.LastSelectedRow].email=Faculty.fd_email.val();
					Faculty.RawData[Faculty.LastSelectedRow].sid=Faculty.fd_sid.val();
					var lastrow = $('#FacultyTable tr:eq(' + Faculty.LastSelectedRow + ')');
					var faculty_name = Faculty.fd_fn.val()+','+Faculty.fd_ln.val();
					$(lastrow).html('<td class="checkbox checked"></td><td>'+Faculty.fd_sid.val()+'</td><td>'+faculty_name+'</td><td>'+Faculty.fd_email.val()+'</td>');
					Faculty.fd_close();
				}
				else updateTips(data.msg);
			}
		});
	},
	fd_close:function(){
		Faculty.fd_form[0].reset();
        Faculty.fd_allFields.removeClass( "ui-state-error" );
		Faculty.fd_dialog.dialog( "close" );
	},
	updateTips:function(t){
		$(".validateTips").text(t).addClass( "ui-state-highlight" );
    },
	checkRegexp:function(o,n){
		var regexp= /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
		if ( !( regexp.test(o.val()))){o.addClass( "ui-state-error" );Faculty.updateTips( n );return false;} 
		else { return true; }
    },
	checkLength:function(o, n){
      if(o.val().length==0) {
        o.addClass( "ui-state-error" );
        Faculty.updateTips( n + " must not be empty" );
        return false;
      }
	  else {
        return true;
      }
    },
	create:function(){
		if(Faculty.RawData!=null)
		{
			$("#FacultyTable").html("");
			$('#msg').text("");
			Faculty.RawData=null;
		}
		$.ajax({
			url: '/faculty',
			type: 'get',
			data: "cmd=show",
			success: function(data) {					
				if(data.success=='true')
				{
					Faculty.RawData = data.data;
					data.data.forEach(function(row){
						var faculty_name = row.firstname+','+row.lastname;
						$("#FacultyTable").append( '<tr><td class="checkbox"></td><td>'+row.sid+'</td><td>'+faculty_name+'</td><td>'+row.email+'</td></tr>');
					});
					
					$("#FacultyTable").find('tr').click(function(ev) {
						var td = $(ev.target).get(0);
						$(td).toggleClass('checked');
						
						if(Faculty.LastSelectedRow>=0 && Faculty.LastSelectedRow != $(this).index())
						{
							var lastbox = $('#FacultyTable tr:eq(' + Faculty.LastSelectedRow + ') td:eq(0)');
							$(lastbox).removeClass('checked');
						}					
						if($(td).hasClass("checked")) Faculty.LastSelectedRow = $(this).index();
						else Faculty.LastSelectedRow=-1;
						//$('#msg').text(Faculty.LastSelectedRow);
					});
				}
				else $('#msg').text(data.msg);
				
				if(data.redirectpage!=null) window.location = data.redirectpage;				
			}
		});
	},
	updateShow:function(){		
		Faculty.fd_dialog.dialog( "option", "buttons", [{
			"text": "Update",
			click: Faculty.updateFaculty
		}]);
		if(Faculty.LastSelectedRow>=0)
		{
			Faculty.fd_id.val(Faculty.RawData[Faculty.LastSelectedRow].id);
			Faculty.fd_ln.val(Faculty.RawData[Faculty.LastSelectedRow].lastname);
			Faculty.fd_fn.val(Faculty.RawData[Faculty.LastSelectedRow].firstname);
			Faculty.fd_email.val(Faculty.RawData[Faculty.LastSelectedRow].email);
			Faculty.fd_sid.val(Faculty.RawData[Faculty.LastSelectedRow].sid);
			Faculty.fd_dialog.dialog("open");
		}
	},
	addShow:function(){		
		Faculty.fd_dialog.dialog( "option", "buttons", [{
			"text": "Add",
			click: function(){
				$.ajax({
					url: '/faculty',
					type: 'get',
					data: "cmd=add&"+$('#fd_form').serialize(),
					success: function(data){						
						if(data.success=='true'){
							Faculty.create();
						}
						Faculty.fd_close();
						if(data.redirectpage!=null) window.location = data.redirectpage;
					}});
			}
		}]);
		Faculty.fd_dialog.dialog("open");
	},
	delShow:function(){
		if(Faculty.LastSelectedRow>=0){
			$.ajax({
			url: '/faculty',
			type: 'get',
			data: "cmd=del&id="+Faculty.RawData[Faculty.LastSelectedRow].id,
			success: function(data){				
				if(data.success=='true'){
					Faculty.create();
				}
				if(data.redirectpage!=null) window.location = data.redirectpage;
			}});
		}
	},
	initial:function(){		
		Faculty.fd_ln = $( "#fd_lastname" );
		Faculty.fd_fn = $( "#fd_firstname" );
		Faculty.fd_email = $( "#fd_email" );
		Faculty.fd_sid = $( "#fd_sjsuid" );
		Faculty.fd_id = $( "#fd_id" );
		Faculty.fd_allFields = $( [] ).add( Faculty.fd_ln ).add( Faculty.fd_fn ).add( Faculty.fd_email ).add(Faculty.fd_sid);
		Faculty.fd_dialog = $( "#UpdateFacultyDialog" ).dialog({
		  autoOpen: false,
		  height: 400,
		  width: 350,
		  modal: true,
		  buttons: {
			"Update": Faculty.updateFaculty
		  },
		  close: Faculty.fd_close
		});
		Faculty.fd_form = Faculty.fd_dialog.find("form").on("submit",function(event){
			event.preventDefault();
			Faculty.updateFaculty();
		});
		$("#BtnUpdateFaculty").button().on("click",Faculty.updateShow);
		$("#BtnAddFaculty").button().on("click",Faculty.addShow);
		$("#BtnDelFaculty").button().on("click",Faculty.delShow);
	}
};