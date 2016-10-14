var Project={
	LastSelectedRow:-1,
	RawData:null,
	UserDict:null,
	pd_form:null,
	pd_dialog:null,
	pd_id:null,
	pd_name:null,
	pd_sjsuid:null,
	pd_year:null,
	pd_season:null,	
	pd_program:null,
	pd_industry:null,
	pd_student:null,
	pd_code:null,
	pd_project:null,
	pd_points:null,	
	pd_allFields:null,
	dict:["","Winter","Spring","Summer","Fall"],
	semester2String:function(s)
	{
		return (Project.dict[s.charAt(3)]+" "+s.charAt(0)+"0"+s.substring(1,3));
	},
	create:function(){
		if(Project.RawData!=null)
		{
			$("#ProjectTable").html("");
			$('#msg').text("");
			Project.RawData=null;
		}
		$.ajax({
			url: '/proj',
			type: 'get',
			data: "cmd=show",
			success: function(data) {					
				if(data.success=='true')
				{
					Project.RawData = data.data;
					Project.UserDict = data.users;
					data.data.forEach(function(row){
						$("#ProjectTable").append('<tr><td class="checkbox"></td><td>'+row.name+'</td><td class="ys">'+Project.semester2String(row.semester)+'</td><td>'+row.program+'</td><td>'+row.industry+'</td><td>'+row.student+'</td><td>'+row.code+'</td><td>'+row.project+'</td><td class="pi">'+row.points+'</td></tr>');
					});
					
					$("#ProjectTable").find('tr').click(function(ev) {
						var td = $(ev.target).get(0);
						$(td).toggleClass('checked');
						
						if(Project.LastSelectedRow>=0 && Project.LastSelectedRow != $(this).index())
						{
							var lastbox = $('#ProjectTable tr:eq(' + Project.LastSelectedRow + ') td:eq(0)');
							$(lastbox).removeClass('checked');
						}					
						if($(td).hasClass("checked")) Project.LastSelectedRow = $(this).index();
						else Project.LastSelectedRow=-1;
					});
					$("#pt_year").val("");
					Project.updateTotal();
				}
				else $('#msg').text(data.msg);				
				if(data.redirectpage!=null) window.location = data.redirectpage;
			}
		});
	},
	updateProject:function(){
		$(".validateTips").removeClass( "ui-state-highlight");
		var valid = true;
		Project.pd_allFields.removeClass( "ui-state-error" );
		valid = valid && Project.checkLength( Project.pd_program, "Program");
		valid = valid && Project.checkLength( Project.pd_student, "student");
		valid = valid && Project.checkLength( Project.pd_code, "#");
		valid = valid && Project.checkLength( Project.pd_project, "Project Title");
		valid = valid && Project.checkLength( Project.pd_points, "Point Value");
		valid = valid && Project.checkLength( Project.pd_sjsuid, "SJSU ID");	
		if(!valid) return;
		$.ajax({
			url: '/proj',
			type: 'get',
			data: "cmd=update&"+$('#pd_form').serialize(),
			success: function(data){
				if(data.success=='true')
				{
					var name = Project.UserDict[Project.pd_sjsuid.val()];
					Project.RawData[Project.LastSelectedRow].name=name;
					Project.RawData[Project.LastSelectedRow].sjsuid=Project.pd_sjsuid.val();
					var semester = Project.pd_year.val()+Project.pd_season.val();
					Project.RawData[Project.LastSelectedRow].semester = semester;
					Project.RawData[Project.LastSelectedRow].program=Project.pd_program.val();
					Project.RawData[Project.LastSelectedRow].industry=Project.pd_industry.val();
					var student = Project.RawData[Project.LastSelectedRow].student=Project.pd_student.val();
					Project.RawData[Project.LastSelectedRow].code=Project.pd_code.val();
					Project.RawData[Project.LastSelectedRow].project=Project.pd_project.val();
					Project.RawData[Project.LastSelectedRow].points=Project.pd_points.val();					
							
					var lastrow = $('#ProjectTable tr:eq(' + Project.LastSelectedRow + ')');					
					$(lastrow).html('<td class="checkbox checked"></td><td>'+name+'</td><td class="ys">'+Project.semester2String(semester)+'</td><td>'+Project.pd_program.val()+'</td><td>'+Project.pd_industry.val()+'</td><td>'+student+'</td><td>'+Project.pd_code.val()+'</td><td>'+Project.pd_project.val()+'</td><td class="pi">'+Project.pd_points.val()+'</td>');
					Project.updateTotal();
					Project.pd_close();
				}
				else Project.updateTips(data.msg);
			}
		});
	},
	pd_close:function(){
		Project.pd_form[0].reset();
        Project.pd_allFields.removeClass( "ui-state-error" );
		Project.pd_dialog.dialog( "close" );
	},
	updateTips:function(t){
		$(".validateTips").text(t).addClass( "ui-state-highlight" );
    },	
	checkLength:function(o, n){
      if(o.val().length==0){
        o.addClass( "ui-state-error" );
        Project.updateTips( n + " must not be empty" );
        return false;
      }else return true;
    },
	updateShow:function(){
		Project.pd_name.css("display","");
		$("#pd_form label:eq(0)").css("display","");
		Project.pd_dialog.dialog( "option", "buttons", [{
			"text": "Update",
			click: Project.updateProject
		}]);
		if(Project.LastSelectedRow>=0)
		{
			Project.pd_id.val(Project.RawData[Project.LastSelectedRow].id);
			Project.pd_name.val(Project.RawData[Project.LastSelectedRow].name);
			Project.pd_sjsuid.val(Project.RawData[Project.LastSelectedRow].sjsuid);
			Project.pd_year.val(Project.RawData[Project.LastSelectedRow].semester.substring(0,3));				
			Project.pd_season.val(Project.RawData[Project.LastSelectedRow].semester.charAt(3));
			Project.pd_program.val(Project.RawData[Project.LastSelectedRow].program);
			Project.pd_industry.val(Project.RawData[Project.LastSelectedRow].industry);			
			Project.pd_student.val(Project.RawData[Project.LastSelectedRow].student);
			Project.pd_code.val(Project.RawData[Project.LastSelectedRow].code);
			Project.pd_project.val(Project.RawData[Project.LastSelectedRow].project);
			Project.pd_points.val(Project.RawData[Project.LastSelectedRow].points);
			Project.pd_dialog.dialog("open");
		}
	},
	addShow:function(){
		Project.pd_name.css("display","none");
		$("#pd_form label:eq(0)").css("display","none");
		Project.pd_dialog.dialog( "option", "buttons", [{
			"text": "Add",
			click: function(){
				$.ajax({
					url: '/proj',
					type: 'get',
					data: "cmd=add&"+$('#pd_form').serialize(),
					success: function(data){						
						if(data.success=='true'){
							Project.create();
						}
						Project.pd_close();
						if(data.redirectpage!=null) window.location = data.redirectpage;
					}});
			}
		}]);
		Project.pd_dialog.dialog("open");
	},
	delShow:function(){
		if(Project.LastSelectedRow>=0){
			$.ajax({
			url: '/proj',
			type: 'get',
			data: "cmd=del&id="+Project.RawData[Project.LastSelectedRow].id,
			success: function(data){				
				if(data.success=='true'){
					Project.create();
				}
				if(data.redirectpage!=null) window.location = data.redirectpage;
			}});
		}
	},
	initial:function(){
		Project.pd_id = $( "#pd_id" );
		Project.pd_name = $( "#pd_name" );
		Project.pd_year = $( "#pd_year" );
		Project.pd_season = $( "#pd_season" );
		Project.pd_sjsuid = $( "#pd_sjsuid" );		
		Project.pd_program = $( "#pd_program" );
		Project.pd_industry = $( "#pd_industry" );		
		Project.pd_student = $( "#pd_student" );
		Project.pd_code = $( "#pd_code" );		
		Project.pd_project = $( "#pd_project" );
		Project.pd_points = $( "#pd_points" );	
		Project.pd_allFields = $([]).add(Project.pd_student).add(Project.pd_program).add(Project.pd_sjsuid).add(Project.pd_code).add(Project.pd_project).add(Project.pd_points);
		Project.pd_dialog = $( "#UpdateProjectDialog" ).dialog({
		  autoOpen: false,
		  height: 710,
		  width: 350,
		  modal: true,
		  buttons: {
			"Update": Project.updateProject
		  },
		  close: Project.pd_close
		});
		Project.pd_form = Project.pd_dialog.find("form").on("submit",function(event){
			event.preventDefault();
			Project.updateProject();
		});
		$("#BtnUpdateProject" ).on( "click", Project.updateShow);		
		$("#BtnAddProject").button().on("click",Project.addShow);
		$("#BtnDelProject").button().on("click",Project.delShow);
		$("#Project select").change(Project.ysChange);
	},
	ysChange:function(e){
		$("#ProjectTable tr").each(function(i,row){
			var tdtxt = $(row).children("td.ys").text();
			var tartxt = $("#pt_semester").val()+" "+$("#pt_year").val();
			if(tdtxt.indexOf(tartxt)!=-1) $(row).css("display","");
			else $(row).css("display","none");
		});
		Project.updateTotal();		
	},
	updateTotal:function(){
		var sum=0;
		$("#ProjectTable tr").each(function(i,row){
			if($(row).css('display') != 'none'){
				sum+=parseFloat($(row).children("td.pi").text());
			}				
		});
		$("#pt_totalpi").text(sum.toFixed(9));
	}
};
