/*
 *  Project: jQuery Tour
 *  Description: Create a tour for your website
 *  Author: Rafael Michels Motta
 *  License: MIT
 */
;(function ( $, window, document, undefined ) {

  var pluginName = 'tour',
    defaults = {
      name: null, // The name of your tour. Is like an ID,
      version : null,
      openOn: 'load', // Open on plugin load or other specific event
      localStorage: {
      	timesToView: 3,
      	openOnLastStep: false
      },
      events:{
      	beforeOpen: null,
      	onOpen: null,
      	onStepMove: null,
      	onStepNext: null,
      	onStepPrev: null,
      	beforeClose: null, // TODO
      	onClose: null      // TODO
      },
      analytics: {
        timesViewed: 0,
      	totalTime: null, // TODO
      	stepTime: [],  // TODO
        endStep: null   // TODO
      },
      texts: {
      	closeTitle: "Fechar",
      	headerTitle: "Primeira vez aqui?",
      	mainButton: 'Começar tour',
      	nextButton: 'Próximo &gt;',
      	prevButton: '&lt; Anterior',
      	restartButton: 'Reiniciar',
      	endButton: 'Terminar'
      },
      tipOffset: 10, // Distance of the tip for the highlight element
      steps: {}, // The JSON array of the steps of your tour
      overlay: true,
      placement: 'bottom'
    };

  function Plugin( element, options ) {
    this.element = element;
    this.options = $.extend( {}, defaults, options) ;
    this._defaults = defaults;
    this._name = pluginName;
    this.currentIndex = -1;
    this.stepAnalytics = [];
        
    this.init();
  }
	
  /**
   * @description Initialized the Plugin. We check some values, then we initialize each tour
   * @params No params
   * @updated 25/11/2012
   */
  Plugin.prototype.init = function (){
  	
  	// A name must be given to get configuration data and to helps when you need more than one tour on one page
    if(!this.options.name){
      return false;
    }
     
    // We to se if the event is valid, and assign as default the load event
    switch(this.options.openOn){
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
      default: this.options.openOn = 'load';
    }
    
    if(this.options.localStorage){
    	this.getLocalStorageData();
    }else{
      this.options.openOn === 'load' ? this.showInitialBar() : this.elementEventHandler();	
    }
  };
  
  /**
   * @description Bind the event on the element which initialized the plugin
   * @params No params
   * @updated 26/11/2012
   */
  Plugin.prototype.elementEventHandler = function() {
  	var self = this;
  	
  	$(this.element).bind(this.options.openOn, function(e){
  	  e.preventDefault(); self.showInitialBar(); 
  	});
  };
  
  /**
   * @description Bind events on the Tour Box
   * @params No params
   * @updated 26/11/2012
   */
  Plugin.prototype.events = function() {
  	var self = this;
  	
  	$('.start-tour, .next-step').bind('click', function() { self.moveStep(self, true); });
  	$('.prev-step').bind('click', function() { self.moveStep(self, false); });
  	$('.restart-tour').bind('click', function() { self.restartTour(self); });
  	$('.end-tour').bind('click', function() { self.endTour(self); });
  };
  
  
  /**
   * @description Get LocalStorage data and verify if is necessary to open the tour div
   * @params No params
   * @updated 26/11/2012
   */
  Plugin.prototype.getLocalStorageData = function() {
  	
  	 // A version MUST be given if use localStorage
    if(!this.options.version) {
      this.options.version = 'V1.0';
    }
    
    var tourObj = localStorage.getItem('tour');

    // Didnt found any configuration on localStorage
    if(!tourObj) {
      this.options.openOn === 'load' ? this.showInitialBar() : this.elementEventHandler();
    }else{
      tourObj = JSON.parse(tourObj);
      for(var i in tourObj){
      	
        if(tourObj[i].name === this.options.name){
        		
        	// If you change the version, we reset this localStorage data
        	if(tourObj[i].version === this.options.version){
        		// Se if has reached the num of total visualizations of the tour
        		
        	  if(tourObj[i].analytics.timesViewed < this.options.localStorage.timesToView){
        	  	// TODO - FAZER PARA PODER RECOMECAR DE ONDE PAROU - INTERFACE DEVE MOSTRAR MSGM
        	  	this.options.openOn === 'load' ? this.showInitialBar() : this.elementEventHandler();
        	  }
        	  return false;
        	}else{
        	  this.options.openOn === 'load' ? this.showInitialBar() : this.elementEventHandler();
        	  return false;
        	}
        }
      }
      
      this.options.openOn === 'load' ? this.showInitialBar() : this.elementEventHandler();
    }
  };
  
  /**
  * @description Create HTML of the Tour BOX
  * @params No params
  * @updated 26/11/2012
  */
  Plugin.prototype.showInitialBar = function () {
    var html = '<section class="tour-container">';
          html += '<div class="not-started"> '
    	    html += '<a href="javascript:void(0)" title="' + this._defaults.texts.closeTitle + '" class="end-tour">x</a>';
    		  html += '<header><p>'+ this._defaults.texts.headerTitle +'</p></header>';
    		   html += '<div class="actions-container">';
    		     html += '<button class="start-tour">'+ this._defaults.texts.mainButton +'</button>';
    		     html += '<button class="prev-step">'+ this._defaults.texts.prevButton +'</button>';
    		     html += '<button class="next-step">'+ this._defaults.texts.nextButton +'</button>';
    		     html += '<button class="end-tour">'+ this._defaults.texts.endButton +'</button>';
    		   html += '</div>';
    		   html += '<footer>';
    		     html += '<a href="javascript:void(0)" class="end-tour">'+ this._defaults.texts.endButton +'</a>';
    		     html += '<a href="javascript:void(0)" class="restart-tour">'+ this._defaults.texts.restartButton +'</a>';
    		   html += '</footer>';
    	   html += '</div>'
    	 html += '</section>';
    	 html += '<div class="tour-overlay num_1"></div><div class="tour-overlay num_2"></div><div class="tour-overlay num_3"></div><div class="tour-overlay num_4"></div>';
    	
    $(document.body).append(html);
    
    
    this.events();
  };
  
 /**
  * @description 
  * @params No params
  * @updated 26/11/2012
  */
  Plugin.prototype.moveStep = function (self, isNext) {
    var stepObj = isNext ? self.options.steps[++self.currentIndex] : self.options.steps[--self.currentIndex];
    var tourContainer = $('.tour-container').children('div').get(0);
 	
	if(self.currentIndex === 0){
		tourContainer.className = 'started_first';
	}else if(self.currentIndex > 0 ) {
		tourContainer.className = 'started_middle';
	}
	if (!self.options.steps[self.currentIndex + 1]) {
		tourContainer.className = 'started_last';
	}
    
    self.resetStep(self);
    if(stepObj) { self.createOverlay(stepObj, self); }
  };
  
  /**
  * @description 
  * @params No params
  * @updated 26/11/2012
  */
  Plugin.prototype.resetStep = function (self) {
   	 $('.tour-container').find('.next-step').removeAttr('disabled');
     $('.tour-overlay').removeAttr('style');
     $('.tour-tip').remove();
  };
  
  /**
  * @description 
  * @params No params
  * @updated 26/11/2012
  */
  Plugin.prototype.endTour = function (self) {
  	self.resetStep(self);
  	$('.tour-container').fadeOut();
  	
  	if(!self.options.analytics.disabled){
  	  // Zerar contador de tempo
      var tourObj = JSON.parse(localStorage.getItem('tour')) || [];
  	  var updated;
  	  
  		if(tourObj.length > 0 ) {
  		  for(var i in tourObj) {
            if(tourObj[i].name === self.options.name){
              if(tourObj[i].version === self.options.version){
              	// TODO - ATUALIZAR O RESTO
            	tourObj[i].analytics.timesViewed++;
                updated = true;
              }else{
              	// If is a newer version, we delete the current object
              	tourObj.splice(i, 1);
              }
              break;
            } 	
  		  }
  		}
  		
  		if(!updated){
  		  tourObj.push(self.createStorageObject(self));
  		}
  		localStorage.setItem('tour', JSON.stringify(tourObj));
  	}
  };
  
  //TODO
  Plugin.prototype.startStepAnalytic = function() {
  	
  };
  
  Plugin.prototype.endStepAnalytic = function() {
  	
  };
  
  Plugin.prototype.createStorageObject = function(self) {
  	
  	// We get the current STEP to know where the user end the tour
  	var currentStep = self.currentIndex;
  	// Check if user has completed all steps
  	if(currentStep + 1 === self.options.steps.length) {
  	  // -1 represent a user who has completed all steps of the tour
  	  currentStep = -1; 
  	}
  	
  	return {
      name: self.options.name,
	  version: self.options.version,
      analytics : {
      	totalSteps: self.options.steps.length,
      	endStep: currentStep, 
        timesViewed: 1,
	    totalTime: null, // TODO
        stepsInfo: []    // TODO
	  }
    };
  };
  
  
  
  /**
  * @description 
  * @params No params
  * @updated 26/11/2012
  */
  Plugin.prototype.restartTour = function (self) {
  	self.resetStep(self);
  	self.currentIndex = -1;
  	$('.tour-container').find('.next-step').trigger('click');
  };
   
  /**
  * @description 
  * @params No params
  * @updated 26/11/2012
  */
  Plugin.prototype.createOverlay = function (tipObject, self) {
    var properties = self.getElementProperties(tipObject.el);
    
    $('.num_1').css({ width: properties.left, height: $(document.body).height() } );
	$('.num_2').css({ width: properties.width,height: $(document.body).height() - (properties.top + properties.height),top: properties.top + properties.height,left: properties.left});
    $('.num_3').css({ width: $(document.body).width() - (properties.left + properties.width), height: $(document.body).height() });
    $('.num_4').css({ height: properties.top,left: properties.left,width: properties.width });
    $('.tour-overlay').show();
    
    if(tipObject.message) {
    	self.createTip(tipObject, properties, self);
    }
    
  };
  
  /**
  * @description 
  * @params No params
  * @updated 26/11/2012
  */
  Plugin.prototype.getElementProperties = function ($el) {
  	return { left: $el.offset().left, top: $el.offset().top, width: $el.outerWidth(), height: $el.outerHeight() };
  };
    
  /**
  * @description 
  * @params No params
  * @updated 26/11/2012
  */ 
  Plugin.prototype.createTip = function (tipObject, properties, self) {
    var html  = '<div class="tour-tip">';
    if(tipObject.title){
      html += '<h3>'+ tipObject.title +'</h3>';
    }
    html += '<div class="content">'+ tipObject.message +'</div>';
    html += '</div>';
    	    
    $(document.body).append(html);
    self.setTipPosition(tipObject, properties, self);
    
    $targetObject = tipObject.placement === 'top' ? $('.tour-tip') : $(tipObject.el);
    
    $('html, body').animate({
	  scrollTop: $targetObject.offset().top
	});
		 			
    if(tipObject.action){
      self.tourElementHandler(tipObject, self);
    }
  };
  
  /**
  * @description 
  * @params No params
  * @updated 26/11/2012
  */
  Plugin.prototype.tourElementHandler = function (tipObject, self) {
  	if(tipObject.action.blockByEvent) { $('.tour-container').find('.next-step').attr('disabled', 'true'); }
  	
  	tipObject.el.bind(tipObject.action.eventType + '.tour-object', {self: self}, self.tourElementAction);
  };
  
  /**
  * @description 
  * @params No params
  * @updated 26/11/2012
  */
  Plugin.prototype.tourElementAction = function (e) {
  	$(this).unbind(e.type + '.tour-object');
  	var self = e.data.self;
  	$('.tour-container').find('.next-step').trigger('click');
  };
  
  /**
  * @description 
  * @params No params
  * @updated 26/11/2012
  */
  Plugin.prototype.setTipPosition = function (tipObject, properties, self) {
    var $tourTip = $('.tour-tip');
   	
   	if(!tipObject.placement){ 
   	  tipObject.placement = 'bottom';
   	}else{
   		if(tipObject.placement !== 'top' || tipObject.placement !== 'bottom' ||
   		  tipObject.placement !== 'left' || tipObject.placement !== 'right'){
   		  	tipObject.placement = 'bottom';
   		  }
   	}
   	
    if(tipObject.placement === 'top'){
      $tourTip.css({ 
        top: properties.top - $tourTip.height() - self.options.tipOffset,
        left: properties.left + ((properties.width - $tourTip.width()) / 2) 
      });
      
    }else if(tipObject.placement === 'bottom'){
      $tourTip.css({ 
        top: properties.top + properties.height + self.options.tipOffset,
        left: properties.left + ((properties.width - $tourTip.width()) / 2)
      });
      
    }else if(tipObject.placement === 'right'){
      $tourTip.css({
      	top: properties.top + ((properties.height - $tourTip.height()) /2 ),
      	left: properties.left + properties.width + self.options.tipOffset
      });
      
    }else if(tipObject.placement === 'left'){
      $tourTip.css({
      	top: properties.top + ((properties.height - $tourTip.height()) /2 ),
      	left: properties.left - $tourTip.width() - self.options.tipOffset
      }); 
    }
  };
  
  $.fn[pluginName] = function ( options ) {
    return this.each(function () {
      if (!$.data(this, 'plugin_' + pluginName)) {
        $.data(this, 'plugin_' + pluginName, new Plugin( this, options ));
      }
    });
  }

})(jQuery, window, document);

// var DragHandler = {
//  
//  
	// // private property.
	// _oElem : null,
//  
//  
	// // public method. Attach drag handler to an element.
	// attach : function(oElem) {
		// oElem.onmousedown = DragHandler._dragBegin;
//  
		// // callbacks
		// oElem.dragBegin = new Function();
		// oElem.drag = new Function();
		// oElem.dragEnd = new Function();
//  
		// return oElem;
	// },
//  
//  
	// // private method. Begin drag process.
	// _dragBegin : function(e) {
		// var oElem = DragHandler._oElem = this;
		// this.style.cursor = 'move';
//  		
		// if (isNaN(parseInt(oElem.style.left))) { oElem.style.left = $(this).offset().left + 'px'; }
		// if (isNaN(parseInt(oElem.style.top))) { oElem.style.top = $(this).offset().top + 'px'; }
//  
		// var x = parseInt(oElem.style.left);
		// var y = parseInt(oElem.style.top);
//  
		// e = e ? e : window.event;
		// oElem.mouseX = e.clientX;
		// oElem.mouseY = e.clientY;
//  
		// oElem.dragBegin(oElem, x, y);
//  
		// document.onmousemove = DragHandler._drag;
		// document.onmouseup = DragHandler._dragEnd;
		// return false;
	// },
//  
//  
	// // private method. Drag (move) element.
	// _drag : function(e) {
		// var oElem = DragHandler._oElem;
//  
		// var x = parseInt(oElem.style.left);
		// var y = parseInt(oElem.style.top);
//  
		// e = e ? e : window.event;
		// oElem.style.left = x + (e.clientX - oElem.mouseX) + 'px';
		// oElem.style.top = y + (e.clientY - oElem.mouseY) + 'px';
//  
		// oElem.mouseX = e.clientX;
		// oElem.mouseY = e.clientY;
//  
		// oElem.drag(oElem, x, y);
//  
		// return false;
	// },
//  
//  
	// // private method. Stop drag process.
	// _dragEnd : function() {
		// var oElem = DragHandler._oElem;
//  
		// var x = parseInt(oElem.style.left);
		// var y = parseInt(oElem.style.top);
//  
		// oElem.dragEnd(oElem, x, y);
//  
		// document.onmousemove = null;
		// document.onmouseup = null;
		// DragHandler._oElem = null;
	// }
//  
// }