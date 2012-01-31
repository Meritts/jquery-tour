jQuery Tour
=======================================================

Overview
--------
Tour is a jQuery Plugin witch allows users to create an easyly tour for your website.

Documentation, Features and Demos
---------------------------------

For a basic use, just follow the example:

<script>
  $(document).ready(function(){
    $(window).tour({
	  name: 'myTour',
	  welcomeLabels: {
	    title: 'A Title for your tour',
		message: 'A description for your feature'
	  },
	  steps: [
	    {
		  el: $('aside'),
		    placement: 'right',
			message: 'Lorem ipsum dolor, simet at magna'
		},
		{
		  el: $('hgroup'),
		  placement: 'bottom',
		  message: 'Lorem ipsum dolor, simet at magna'
		},
		{
		  el: $('#step_3'),
		  placement: 'right',
		  message: 'Lorem ipsum dolor, simet at magna'
		}
	  ]
    });
  });
</script>