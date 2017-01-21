var Upload = {
	initial:function(){
		$( ".widget input" ).checkboxradio({
			icon: false
		});

		var jf = $('#upload_file').filer({
			showThumbs: true,
			addMore: false,
			allowDuplicates: false,
			maxSize:5,
			limit:1,
			extensions:["xlsx","xls"],
			templates:{				
				removeConfirmation: false
			},
			captions:{				
				errors: {
					filesType: "Only spreadsheet is allowed to be uploaded."					
				}
			},
			onRemove:function(){
				$('#msg').text("");	
			}
		});

		$("#upload_form").on("submit",function(event){
			event.preventDefault();			
			if(jf[0].files.length==0)
			{
				alert("No file selected!");
				return false;
			}
			var formData = new FormData($(this)[0]);
			$.ajax({
				url: "/upload",
				type: 'POST',
				data: formData,
				async: false,        
				cache: false,
				contentType: false,
				processData: false,
				success: function (data) {
					$('#msg').text(data.msg);
					if(data.redirectpage!=null) window.location = data.redirectpage;
					$('.jFiler-items').remove();
				}
			});
			var filerKit = $("#upload_file").prop("jFiler");
			filerKit.reset();
			return false;
		});
	}	
};

