/*
 *  Project: jQuery Tour
 *  Description: Create a tour for your website
 *  Author: Rafael Michels Motta
 *  License: MIT
 */
;(function ( $, window, document, undefined ) {
  var __DEV__ = window.__DEV__ || 0;
	
  
  var Tour = function(element, options) {
    this.settings = $.extend({}, $.fn.tour.defaults, options);
    this.$element = $(element);
    this.currentIndex = -1;
    
    // FIX THIS
    $.extend(this, StorageHelper);
    $.extend(this, OverlayHelper);
    $.extend(this, TipHelper);
    $.extend(this, PositionHelper);
    
    if(this.settings.beforeStart){
   	  this.settings.beforeStart.apply(this);
   	}
   	
    this.initialize();
  }
 
  Tour.prototype = {
    
    /**
  	* @description
  	* @params No params
  	* @updated 27/01/2012
  	*/
    initialize: function() { 	
  	  // A name must be given to get configuration data and to helps when you need more than one tour on one page
      if(!this.settings.name){
      	if (__DEV__) {
      	  console.log('Tour: A name must be given to get configuration data and to helps when you need more than one tour on one page.');
      	}
        return false;
      }
      
      // We to se if the event is valid, and assign as default the load event
      switch(this.settings.openOn){
        case 'load' : break;
        case 'click': break;
        case 'dbclick': break;
        case 'blur': break;
        case 'focus': break;
        case 'focusin': break;
        case 'focusout': break;
        case 'hover': break;
        case 'keydown': break;
        case 'keypress': break;
        case 'mousedown': break;
        case 'mouseover': break;
        case 'mouseleave': break;
        case 'mouseenter': break;
        case 'mouseup': break;
        case 'scroll': break;
        default: this.settings.openOn = 'load';
      }
      
      //TODO - FIX THIS
      this.createMarkup(function(_this){
        if(_this.settings.localStorage){
      	  _this.getData();
        }else{
          _this.settings.openOn === 'load' ?
            _this.open() : _this.elementEventHandler();
        }
      });
      
  	},
  	
  	/**
  	* @description
  	* @params No params
  	* @updated 27/01/2012
  	*/
  	open: function(e) {
  	  if(e) e.preventDefault();
  	  var target = e ? $(this).data('tour').settings.name : this.settings.name;
  	  $(document.getElementById(target)).show();
  	  
  	  if(this.settings.events.onOpen){
  	  	this.settings.events.onOpen.apply(this);
  	  }
  	},
  	
  	/**
  	 * @description
  	 * @params No params
  	 * @updated 27/01/2012
  	 */
  	elementEventHandler: function() {
  	  this.$element.bind('click', this.open);
  	},
  	
  	/**
  	 * @description Create the Main Box of the Tour
  	 * @params (function) callback
  	 * @updated 27/01/2012
  	 */
  	createMarkup: function(callback) {
  	  var tmpl = this.settings.tmpl.container;
  	  var data = $.extend(this.settings.labels, {name: this.settings.name});

  	  var $body = $('body');
  	  
  	  // Replace texts
  	  $.each(data, function(key, value){
  	    tmpl = tmpl.replace('{{' + key + '}}', value);
  	  });
  	  
  	  $body.append(tmpl).append(this.settings.tmpl.overlay);
  	  
  	  this.$tourContainer = $('#' + this.settings.name).data('tour', this);
  	  
  	  this.events();
  	  callback(this);
  	},
  	
  	/**
  	 * @description
  	 * @params No params
  	 * @updated 27/01/2012
  	 */
  	events: function() {
  	  $('.start-tour, .next-step').bind('click', this.changeStep);
  	  $('.prev-step').bind('click', this.changeStep);
  	  $('.close-tour').bind('click', this.endTour);
  	},
  	
  	/**
  	 * @description
  	 * @params No params
  	 * @updated 27/01/2012
  	 */
  	changeStep: function() {
      var $this = $(this);
  	  var action = $this.get(0).className;
      var $container = $this.parents('.tour-container');
  	  var _this = $container.data('tour');
  	  
  	  var tourStep = action === 'start-tour' || action === 'next-step' ?
  	    _this.settings.steps[++_this.currentIndex] : _this.settings.steps[--_this.currentIndex];
  	    
  	  var className;
  	  
  	  if(_this.currentIndex === 0 ) { 
  	  	className = 'started_first'; 
  	  }else if(_this.currentIndex > 0 ) {
        className = 'started_middle';
      }
  	  if(!_this.settings.steps[_this.currentIndex + 1]) { 
  	  	className = 'started_last';
  	  }
  	  
  	  $container.removeClass('not-initialized started_first started_middle started_last').addClass(className)
  	  			.hide();
  	  
  	  
  	  if(_this.settings.overlay){
  	    _this.createOverlay();
  	  }
  	  
  	  if(_this.settings.events.onStepMove){
  	  	_this.settings.events.onStepMove.apply(_this, [action]);
  	  }
   	},
  	
  	/**
  	 * @description
  	 * @params No params
  	 * @updated 27/01/2012
  	 */
  	endTour: function() {
  	  var $container = $(this).parents('.tour-container');
  	  var _this = $container.data('tour');
  	  
  	  $container.remove();
  	  
  	  // TODO - FIX
  	  $('.tour-overlay').fadeOut();
  	  
  	  if(_this.settings.events.onClose){
  	    _this.settings.events.onClose.apply(_this);
  	  }
  	  
  	  _this.saveData();
  	},
  	
  	tourStepEventHandler: function(tourStep) {
  	  if(tourStep.action.expectEvent) { 
  	  	this.$tourContainer.find('.next-step').attr('disabled', 'true');
  	  }
  	    
  	  var target = tourStep.action.target === 'this' ? tourStep.el : tourStep.el.find(tourStep.action.target);
  	 
  	  var eventType = tourStep.action.eventType;
  	  target.bind(eventType + '.tour-event', {_this: this}, this.tourStepAction);
  	},
  	
  	tourStepAction: function(e){
  	  var $this = $(this);
  	  var _this = e.data._this;
  	  
  	  console.log(_this);
  	  $this.unbind(e.type + '.tour-event');
  	  _this.$tourContainer.find('.next-step').trigger('click');
  	}
  	
  };
  
  
  var StorageHelper = {
  	
  	/**
  	 * @description
  	 * @params No params
  	 * @updated 27/01/2012
  	 */
  	getData: function() {
  		
  	  var tourData = localStorage.getItem('tour');

      // Didnt found any configuration on localStorage
      if(!tourData) {
        this.settings.openOn === 'load' ? 
          this.open() : this.elementEventHandler();
      }
      else{
      	tourData = JSON.parse(tourData);
      	
      	for(var i in tourData){
      	  if(tourData[i].name === this.settings.name){
        	if(tourData[i].analytics.timesViewed < this.settings.localStorage.timesToView){
        	  // TODO - FAZER PARA PODER RECOMECAR DE ONDE PAROU - INTERFACE DEVE MOSTRAR MSGM
        	  this.settings.openOn === 'load' ? 
                  this.open() : this.elementEventHandler();
        	}
        	return false;
          }
        }
      }
    },
    
    /**
  	 * @description
  	 * @params No params
  	 * @updated 27/01/2012
  	 */
    saveData: function() {
      var tourData = JSON.parse(localStorage.getItem('tour')) || [];
  	  var updated;
  	 
  	  if(tourData.length > 0 ) {
  	    for(var i in tourData) {
          if(tourData[i].name === this.settings.name){
              tourData[i].analytics.timesViewed++;
              updated = true;
              break;
          } 	
  	    }
  	  }
  	  
  	  if(!updated){
  	    tourData.push(this.createStorageObject(this));
  	  }
  	  
  	  localStorage.setItem('tour', JSON.stringify(tourData));
    },
    
    /**
  	 * @description
  	 * @params No params
  	 * @updated 27/01/2012
  	 */
    createStorageObject: function() {  	
  	  
  	  return {
        name: this.settings.name,
        analytics : {
      	  totalSteps: this.settings.steps.length,
      	  endStep: this.currentIndex + 1,
          timesViewed: 1,
	      totalTime: null
	    }
      };
  }
  	
  };
  
  var OverlayHelper = {
  	
  	/**
  	 * @description
  	 * @params No params
  	 * @updated 27/01/2012
  	 */
  	createOverlay: function() {
  	  var tourStep = this.settings.steps[this.currentIndex];
  	  var properties = this.getElementProperties(tourStep.el);
  	  var $body = $(document.body);
  	  var $window = $(window);
  		
  	  var height = $body.height() > $window.height() ? $body.height() : $window.height(); 
  		
  	  $('.num_1').css({ width: properties.left, height: height } );
	  $('.num_2').css({ width: properties.width,height: height - (properties.top + properties.height),top: properties.top + properties.height,left: properties.left});
      $('.num_3').css({ width: $body.width() - (properties.left + properties.width), height: height });
      $('.num_4').css({ height: properties.top,left: properties.left,width: properties.width });
      $('.tour-overlay').show();
        
      this.setTipPosition(tourStep, properties);
  	}
  	
  };
  
  var TipHelper = {
  	
  	/**
  	* @description
  	* @params No params
  	* @updated 27/01/2012
  	*/
  	setTipPosition: function(tourStep, properties) {
  	  var title = this.settings.labels.title;
  	  	  title += ' (' + this.settings.labels.titleStep + ' ' +  (this.currentIndex + 1);
  	  	  title += ' - ' + this.settings.steps.length + ')';
  	  
  	  this.$tourContainer.css('position', 'absolute')
  	  	  .find('.next-step').removeAttr('disabled').end()
  	  	  .find('h2').html(title).end()
  	  	  .find('p').html(tourStep.message).end()
  	  	  .fadeIn(300);
  	  
  	  switch(tourStep.placement){
  	  	case 'bottom' :
  	  	  this.$tourContainer.css({ 
            top: properties.top + properties.height + this.settings.tip.offset,
            left: properties.left + ((properties.width - this.$tourContainer.width()) / 2)
          });
          
  	  	  break;
  	  	  
  	  	case 'top' :
		  this.$tourContainer.css({ 
            top: properties.top - this.$tourContainer.height() - this.settings.tip.offset,
            left: properties.left + ((properties.width - this.$tourContainer.width()) / 2) 
          });
          
          break;
  	  	
  	  	case 'left' : 
  	  	  this.$tourContainer.css({
      	    top: properties.top + ((properties.height - this.$tourContainer.height()) /2 ),
      	    left: properties.left - this.$tourContainer.width() - this.settings.tip.offset
          });
          
          break;
  	  	
  	  	case 'right' : 
  	  	  this.$tourContainer.css({
      	    top: properties.top + ((properties.height - this.$tourContainer.height()) /2 ),
      	    left: properties.left + properties.width + this.settings.tip.offset
          });
          
          break;
  	  }
  	  
  	  if(this.settings.autoScrolling){
  	  	$('html, body').animate({scrollTop: tourStep.el.offset().top });
  	  }
  	  
  	  if(tourStep.action) {
  	    this.tourStepEventHandler(tourStep);
  	  }
  	}
  	
  };
  
  var AnalyticHelper = {
  	
  	/**
  	* @description
  	* @params No params
  	* @updated 27/01/2012
  	*/
  	startCounter: function() { 
  	
  	},
  	
  	/**
  	* @description
  	* @params No params
  	* @updated 27/01/2012
  	*/
  	endCounter: function() {
  		
  	}
  	
  };
  
  var PositionHelper = {
  	
  	/**
  	* @description
  	* @params No params
  	* @updated 27/01/2012
  	*/
  	getElementProperties: function($el) {
  	  return { 
  	  	left: $el.offset().left,
  	  	top: $el.offset().top,
  	  	width: $el.outerWidth(),
  	  	height: $el.outerHeight()
  	  };
  	}
  	
  };
  
  $.fn.tour = function (options) {
    if ( options === true ) {
      return this.data('tour');
    }
  	return this.each(function () {
      var $this = $(this);
      if ( typeof options == 'string' ) {
        return $this.data('tour')[options]();
      }
      $(this).data('tour', new Tour( this, options ));
    })
  };
  
  $.fn.tour.defaults = {
    name: null, // Name of your tour
    
    openOn: 'load', // Event OR false will not open
    
    enablePrevButton: false,	// TODO
    autoScrolling: false,
    
    // LocalStorage deffinitions. If you don`t want to use, just put FALSE
    localStorage: { //TODO
      timesToView: 1,
      openOnLastStep: false
    },
    
    $tourContainer: null,
    $overlay: null,	// TODO
    
    // html template. Is not recommended you change the markup
    tmpl : {
      container: '<section class="tour-container not-initialized" id="{{name}}"><div><h2>{{welcomeTitle}}</h2><p>{{welcomeMessage}}</p></div><footer><button  class="start-tour">{{start}}</button><button class="next-step">{{nextStep}}</button><button class="close-tour" href="javascript:void(0)">{{close}}</button></footer></section>',
      overlay: '<div class="tour-overlay num_1"></div><div class="tour-overlay num_2"></div><div class="tour-overlay num_3"></div><div class="tour-overlay num_4"></div>'
    },
    
    // If you don`t want to use, just set analytics as false
    analytics: { // TODO
      timesViewed: 0,
      totalTime: null, 
      stepTime: [],
      endStep: null   
    },
    
    events: {
      beforeStart: null,
      onOpen: null,
      onClose: null,
      onStepMove: null
    },
    
    labels: {
      close: "Fechar",
      start: "Iniciar Tour",
      nextStep: 'Continuar &gt;',
      prevStep: '&lt; Voltar',
      title: 'Tour',
      titleStep: 'Etapa',
      welcomeTitle: 'Lorem',
      welcomeMessage: 'lalalallalaa'
    },
      
    tip: {
      offset: 10,
      animate: '',
      delayIn: '',
      defaultPlacement: 'top'
    },
      
    overlay: true,
      
    steps: {}
  };
  
})(jQuery, window, document);