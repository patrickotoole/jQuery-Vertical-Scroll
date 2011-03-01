(function($) {
	/**
	* Title: jQuery UI Vertical Scrollbar
	* Adds a vertical scrollbar to DOM object using jQuery UI
	* 
	* Usage:
	*	$('.element').addScrollbar();
	*	$('.element').addScrollbar({location:""});
	* 
	* Dependencies: jquery.ui, jquery.mousewheel
	* License:
	* 	Copyright (c) 2011 Patrick O'Toole
	*	Licensed Under the MIT/X-11 License 
	* 	www.rickotoole.com
	*
	* Version: 0.0.1a -- rough draft
	**/
	
	
	$.fn.addScrollbar = function(user_options) {
		var defaultOptions = {
			toolbar : {
				location : "left",
				width: 10,
				margin: 2,
				background_color : "black",
				color : "grey",
				end_cap_size : 20,
				incrementSize : undefined,//25
				horizontalVisible : true
			},
			scrollDifference : 0,
			contentHeight : 0
		};
		defaultOptions.toolbar = MergeOptions(user_options)
		var options = defaultOptions;

		/**
		* Function: MergeOptions
		* Merges the default toolbar options with the user specified options
		* Parameters: 
		* 	options - hash of user defined options
		*/
		function MergeOptions(options){
			return jQuery.extend(true,defaultOptions.toolbar,options);
		}
		
		/**
		* Function GenerateToolbar
		* Uses options.toolbar to create a DOM toolbar
		* Parameters: id - id of parent DOM object
		*/
		function GenerateToolbar(id) {
			var margin_l = (options.toolbar.location == "left") ? 0 : options.toolbar.margin;
			var margin_r = (options.toolbar.location == "right") ? 0 : options.toolbar.margin;
			
			var scroll_wrap = jQuery('<div></div>').css({
				"margin-right"	: margin_r,
				"margin-left"	: margin_l,
				"position"		: "relative",
				"float"			: options.toolbar.location
			}).attr('class','scrollbar_outer');
			var scroll_bar = jQuery('<div></div>').attr('class','scrollbar').slider({
				orientation: 'vertical',
				min:0,
				max:100,
				value:100,
				slide: function(event, ui) {
					var topValue = -((100-ui.value)*options.scrollDifference/100);
					$('#' + id + ' > .scroll_content_wrapper > .scroll_content').css({top:topValue});
				}
			}).css({
				"width"			: options.toolbar.width,
				"overflow"		: "visible",
				"border"		: "0px"
			});
			scroll_wrap.append(scroll_bar)
			return scroll_wrap;
		}
		
		/**
		* Function: GenerateWrappedContent
		* Creates an object with attributes specified in options.toolbar that
		* size the object such that if can be position next to the scroll wrapper.
		* Parameters: current_content - current, selected DOM object
		*/
		function GenerateWrappedContent(current_content) {
			var s_content = current_content.clone(true);
			jQuery(s_content).css({
				"position"	:"absolute",
				"left"		:0,
				"top"		:0,
//				"overflow-x": "visible"
			}).attr("class","scroll_content").removeAttr("id");
			
			jQuery(current_content).after(s_content);
			options.contentHeight = jQuery(s_content).height();
			jQuery(s_content).remove();
			
			var sc_wrap = jQuery('<div></div>').css({
				"position"	: "relative",
				"float"		: "left",
				'width'		: jQuery(current_content).width() - options.toolbar.width - options.toolbar.margin,
				'height'	: options.contentHeight,
				"overflow-y": "hidden",
//				'overflow-x': 'visible'
			}).addClass('scroll_content_wrapper');
			
			(!options.toolbar.horizontalVisible) ? sc_wrap.css({"overflow-x":"hidden"}) : null;
			sc_wrap.append(s_content);
			
			return sc_wrap;
		}
		
		/**
		* Function: GenerateScrollBackground
		* Creates background objects for scrollbar and handles clicks on background
		* Parameters:
		*	sliderMargin - height of background margin
		* 	id - id of parent DOM object
		*/
		function GenerateScrollBackground(sliderMargin,id) {
			var background = jQuery('<div style="height:' + sliderMargin +'px;padding:0px;border:0px;"></div>').attr('class','ui-widget-content');
			$('#' + id + ' >.scrollbar_outer').
				prepend(background.clone(true).addClass('scroll_top')).
				append(background.clone(true).addClass('scroll_bottom'));
			
			$('#' + id + ' > .scrollbar_outer > .scroll_top').click(function() {IncrementSlider(100,id);});
			$('#' + id + ' > .scrollbar_outer > .scroll_bottom').click(function() {IncrementSlider(-100,id);});
		}
		
		/**
		* Function: GenerateScrollEndcaps
		* Creates endcap objects for scrollbar, handles clicks, populates default content
		* Parameters:
		*	end_caps - height of end caps
		*	scrollStep - size of scrollbar movement
		* 	id - id of parent DOM object
		*/
		function GenerateScrollEndcaps(end_caps,scrollStep,id) {
			var arrow = jQuery('<div style="height:' + end_caps +'px;padding:0px;border:0px;"></div>').attr('class','ui-widget-content');
			$('#' + id + ' >.scrollbar_outer').
				prepend(arrow.clone(true).addClass('scroll_up')).
				append(arrow.clone(true).addClass('scroll_down'));
			
			$('#' + id + ' > .scrollbar_outer > .scroll_up').click(function() {IncrementSlider(scrollStep,id);});
			$('#' + id + ' > .scrollbar_outer > .scroll_down').click(function() {IncrementSlider(-scrollStep,id);});
			
			$('#' + id + ' > .scrollbar_outer > .scroll_up').html('&uarr;').css({"text-align":"center","cursor":"default"});
			$('#' + id + ' > .scrollbar_outer > .scroll_down').html('&darr;').css({"text-align":"center","cursor":"default"});
		}
		
		/**
		* Function: GenerateMouseScrollControl
		* Creates controls to handle mousewheel scrolling
		* Parameters: 
		*	scrollStep - size of scrollbar movement
		*	id - id of parent DOM object
		*/
		function GenerateMouseScrollControl(scrollStep,id) {
			$("#"+id).mousewheel(function(event, amount){
				if (
					(($('#' + id + ' > .scrollbar_outer > .scrollbar').slider("value") == 0 ) && (amount > 0)) || 
					(($('#' + id + ' > .scrollbar_outer > .scrollbar').slider("value") == 100 ) && (amount < 0)) ||
					(($('#' + id + ' > .scrollbar_outer > .scrollbar').slider("value") > 0 ) && ($('#' + id + ' > .scrollbar_outer >.scrollbar').slider("value") < 100 ))
					)
				{
					var multiplier = 50;
					IncrementSlider(amount*scrollStep,id);
					event.preventDefault();
				}
			});
		}
		
		/**
		* Function: GenerateTouchScrollControl
		* Creates controls to handle iOS style scrolling
		* Parameters: id - id of parent DOM object
		*/
		function GenerateTouchScrollControl(id) {
			$("#"+id).live('touchstart',function(start_event) {
				start_event.preventDefault();
				var original = this;
				var e = start_event.originalEvent;
				
				if (e.targetTouches.length != 1)
					return false;
				
				var previousY = e.targetTouches[0].clientY;
				var currentY = previousY;
				
				$("#"+id).live('touchmove', 
					function(move_event) {
						var me = start_event.originalEvent;						
						previousY = currentY;
						currentY = me.targetTouches[0].clientY;
						var deltaY = previousY - currentY;

						IncrementSlider(-deltaY,id);
						move_event.preventDefault();
					}
				);
				
				$("#"+id).live('touchend', 
					function(end_event) {
						$("#"+id).die('touchmove');
						$("#"+id).die('touchend');
					}
				);
			});
		}
		
		
		/**
		* Function: IncrementSlider
		* Moves slider and corresponding content by specified amount
		* Parameters: step - increment size
		*/
		function IncrementSlider(step,id) {
			var slider_val = $('#' + id + ' > .scrollbar_outer > .scrollbar').slider("value");
			slider_val += step;
			$('#' + id + ' > .scrollbar_outer > .scrollbar').slider("value", slider_val);
			
			var top_val = ((100-slider_val)*options.scrollDifference)/100;
			(top_val < 0) ? top_val = 0 : undefined;
			(Math.abs(top_val)>options.scrollDifference) ? top_val = options.scrollDifference : undefined;

			$('#' + id + ' > .scroll_content_wrapper > .scroll_content').css({top:-top_val});

		}
		
		
		return this.each(function(index) {
			var c = jQuery(this), 
				w = c.width(),h = c.height(),
				cl = c.attr("class"),
				id = c.attr("id") || "scrollable_content_" + index;

			var original_content = c.children('.scroll_content_wrapper').children('.scroll_content') || [];
			(original_content.length > 0) ? c.html(original_content.html()).removeAttr("style") : null;

			

			// Create div with current objects dimensions, styling
			var new_c = jQuery("<div></div>").
				attr("class",cl).
				attr("id",id).
				css({
					'position'	: 'relative',
					'overflow-y': 'hidden',
					'overflow-x': 'visible',
					'width'		: w,
					'height'	: h,
				});
			
			var scrollContentWrapper = GenerateWrappedContent(this);
			options.scrollDifference = options.contentHeight - h;
			
			if (options.scrollDifference > 0)
			{
				var toolbar = GenerateToolbar(id);
				
				new_c.append(toolbar);
				new_c.append(scrollContentWrapper);
				c.after(new_c);	
				c.remove();
				

				var end_caps = options.toolbar.end_cap_size;
				var handle_h = (1-((options.contentHeight-h)/options.contentHeight))*h - end_caps*2;
				handle_h = (handle_h > options.toolbar.end_cap_size*2) ? handle_h : options.toolbar.end_cap_size*2;
				
				var sliderHeight 	= h - handle_h - end_caps*2;
				var sliderMargin 	= (h - sliderHeight)*0.5 - end_caps;
				sliderMargin = (sliderMargin > 0) ? sliderMargin : 0;
				var scrollStep = (options.toolbar.incrementSize) ? options.toolbar.incrementSize : parseInt(sliderHeight/5);
				var handle_border = parseInt($(".ui-slider-handle").css('border-top-width')) + parseInt($(".ui-slider-handle").css('border-bottom-width'));
				
				// Set positioning of SliderUI components
				$("#" + id + " .scrollbar_outer > .scrollbar > .ui-slider-handle").css({
					height	: handle_h - handle_border+"px",
					left	: 0,	
					width	: options.toolbar.width-2,
					'margin-bottom':-0.5*handle_h
				});
				$("#" + id + " .scrollbar_outer > .ui-slider-vertical").css({
					height : sliderHeight,
					"border-radius": 0,
					"-moz-border-radius": 0
				});
			    $("#" + id + " .scrollbar_outer > .scrollbar > .ui-slider-range").css({top: -sliderMargin});
					
				GenerateScrollBackground(sliderMargin,id);
				(end_caps > 0) ? GenerateScrollEndcaps(end_caps,scrollStep,id) : null;
				jQuery.isFunction(jQuery.fn.mousewheel) ? GenerateMouseScrollControl(scrollStep,id,cl) : null;
				GenerateTouchScrollControl(id);
			}
			else
			{
				console.log(id);

			}
			

			
		});
	};
})(jQuery);