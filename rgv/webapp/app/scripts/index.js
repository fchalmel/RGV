jQuery(document).ready(function($){
	//open the lateral panel
	$('.panel-open').on('click', function(event){
		event.preventDefault();
		$('.slide-panel').addClass('is-visible');
	});
	//close the lateral panel
	$('.slide-panel').on('click', function(event){
		if( $(event.target).is('.slide-panel') || $(event.target).is('.panel-close') ) { 
			$('.slide-panel').removeClass('is-visible');
			event.preventDefault();
		}
	});
});

