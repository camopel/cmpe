var Upload = {
	initial:function(){
		$( ".widget input" ).checkboxradio({
			icon: false
		});

		var jf = $('#upload_file').filer({
			showThumbs: true,
			addMore: false,
			allowDuplicates: false,
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
				}
			});
			return false;
		});
	}	
};

