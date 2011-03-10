(function($) {
	/**
	* Title: jQuery UI Vertical Scrollbar
	* Adds a vertical scrollbar to DOM object using jQuery UI
	* 
	* Usage:
	*	$('.element').scrollbar();
	*	$('.element').scrollbar("destroy");
	*	$('.element').scrollbar("refresh");
	*	$('.element').scrollbar("create",{location:"right"});
	* 
	* Dependencies: jquery.ui, jquery.mousewheel
	* License:
	* 	Copyright (c) 2011 Patrick O'Toole
	*	Licensed Under the MIT/X-11 License 
	* 	www.rickotoole.com
	*
	* Version: 0.0.1c 
	**/	
	
	var options;
	$.fn.scrollbar = function(method,user_options) {
		options = {
			scrollbar : $.extend({},user_options,$.fn.scrollbar.defaults),
			scrollDifference : 0,
			setContentHeight : function(content,place_after_object) {
				var height;
				place_after_object = place_after_object ? place_after_object : jQuery('body').children().first();
				jQuery(place_after_object).after(content);
				height = jQuery(content).outerHeight();
				jQuery(content).remove();
				this.contentHeight = height;
				return height;
			}
		}
		var handlers = {
			init : function (scrollStep,id) {
				this.clicks(scrollStep,id);
				this.mousewheel(scrollStep,id);
				this.touch(id);
			},
			/**
			* Function: handlers.clicks
			* Handles clicks which occur inside scrollbar wrapper. Specifically, endcap and background clicks.
			* Parameters:
			*	scrollStep - size of step
			* 	id - id of parent DOM object
			*/
			clicks : function (scrollStep,id) {
				var scrollDifference = (function (opt) {return opt.scrollDifference})(options);
				
				$.fn.scrollbar.click("up",id,scrollStep,scrollDifference);
				$.fn.scrollbar.click("down",id,scrollStep,scrollDifference);
				$.fn.scrollbar.click("top",id,scrollStep,scrollDifference);
				$.fn.scrollbar.click("bottom",id,scrollStep,scrollDifference);
			},
			/**
			* Function: handlers.mousewheel
			* Creates controls to handle mousewheel scrolling
			* Parameters: 
			*	scrollStep - size for one wheel iteration
			*	id - id of parent DOM object
			*/
			mousewheel : function (scrollStep,id) {
				var scrollDifference = (function (opt) {return opt.scrollDifference})(options);
				$.fn.scrollbar.wheel(id,scrollStep,scrollDifference);
			},
			/**
			* Function: handlers.touch
			* Creates controls to handle iOS style scrolling
			* Parameters: id - id of parent DOM object
			*/
			touch : function (id) {
				var scrollDifference = (function (opt) {return opt.scrollDifference})(options);
				$.fn.scrollbar.touch(id,scrollDifference);
			}
		}
		var methods = {
			create : function () {
				return this.each(function(index) {
					options = $.extend(true,options,jQuery(this).data("scroll-options"));
					var c = jQuery(this), 
						w = c.outerWidth(),
						h = c.outerHeight(),
						cl = c.attr("class"),
						id = c.attr("id") || (jQuery("scrollable_content_" + index).length > 0) ? "scrollable_content_" + index : "scrollable_content_" + cl;

					var scrollContentWrapper = WrapContent(this);
					options.scrollDifference = options.contentHeight - h;


					if (options.scrollDifference > 0)
					{		
						// Create div with current objects dimensions, styling
						var scroll_slider = CreateSlider(id);
						var new_c = jQuery("<div></div>").attr("class",cl).attr("id",id).
							css(options.originalStyle).
							css({'position':'relative','overflow-y':'hidden','width':w,'height':h});

						new_c.append(scroll_slider);
						new_c.append(scrollContentWrapper);
						c.after(new_c);			
						c.remove();
						

						SliderToScrollbar(id,h);
						GenerateScrollControls(id);
						new_c.data("scroll-options",options);
					}
					else 
					{
						c.data("scroll-options",options);
					}
				});
			},
			refresh : function () {
				this.each(function() {
					RemoveScrollbar(jQuery(this));
				});
				return methods.create.call(this);
			},
			increment : function (step) {
				return this.each(function() {
					var $this = jQuery(this)
					var id = $this.attr("id")
					scrollDifference = $this.children(".scroll_content_wrapper").children(".scroll_content").height() - $this.height();
					$.fn.scrollbar.incrementSlider(step,id,scrollDifference);
				});
			},
			destroy : function () {
				return this.each(function(index) {
					RemoveScrollbar(jQuery(this));
				});
			}
		}
	
		/**
		* Function CreateSlider
		* Uses options.scrollbar to create a DOM scrollbar
		* Parameters: id - id of parent DOM object
		*/
		function CreateSlider(id) {
			var margin_l = (options.scrollbar.location == "left") ? 0 : options.scrollbar.margin;
			var margin_r = (options.scrollbar.location == "right") ? 0 : options.scrollbar.margin;
			var scrollDifference = (function(opt) {return opt.scrollDifference;})(options)
			
			// Create Scroll wrapper and slider
			var scroll_wrap = jQuery('<div></div>').css({"margin-right": margin_r,"margin-left": margin_l,"position": "relative","float": options.scrollbar.location}).attr('class','scrollbar_outer');
			var scroll_slider = jQuery('<div></div>').attr('class','scrollbar').slider({
				orientation: 'vertical',
				min:0,
				max:100,
				value:100,
				slide: function(event, ui) {
					var topValue = -((100-ui.value)*scrollDifference/100);
					$('#' + id + ' > .scroll_content_wrapper > .scroll_content').css({top:topValue});
				}
			}).css({"width": options.scrollbar.width,"overflow": "visible","border": "0px"});
			
			scroll_wrap.append(scroll_slider)
			return scroll_wrap;
		}
		
		/**
		* Function: WrapContent
		* Creates an object with attributes specified in options.scrollbar that
		* size the object such that if can be position next to the scroll wrapper.
		* Parameters: current_content - current, selected DOM object
		*/
		function WrapContent(current_content) {
			
			var s_content = jQuery(current_content).clone(true,true);
			options.originalStyle = $.parseJSON("{\""+jQuery(current_content).attr("style").replace(/\s/g,"").replace(/;$/,"").replace(/;/g,"\",\"").replace(/:/g,"\":\"")+"\"}");
			s_content.css({"height":"auto",'width':jQuery(current_content).outerWidth() - options.scrollbar.width - options.scrollbar.margin});
			jQuery(s_content).css({"position":"absolute","left":0,"top":0}).attr("class","scroll_content").removeAttr("id");
			
			options.setContentHeight(s_content,current_content);
			
			var sc_wrap = jQuery('<div></div>').css({
				"position"	: "relative",
				"float"		: "left",
				'width'		: jQuery(current_content).outerWidth() - options.scrollbar.width - options.scrollbar.margin,
				'height'	: options.contentHeight,
				"overflow-y": "hidden"
			}).addClass('scroll_content_wrapper');
			
			(!options.scrollbar.horizontalVisible) ? sc_wrap.css({"overflow-x":"hidden"}) : null;
			sc_wrap.append(s_content);
			
			return sc_wrap;
		}
		
		/**
		* Function: RemoveScrollbar
		* Removes scrollbar from div
		* Parameters: c - current jQuery object
		*/
		function RemoveScrollbar(c) {
			var original_content = c.children('.scroll_content_wrapper').children('.scroll_content') || [];
			if (original_content.length > 0) {
				var options = c.data("scroll-options");
				c.html(original_content.html()).removeAttr("style").css(options.originalStyle);
				(c.attr("id").split("_")[0] = "scrollable") ? c.removeAttr("id") : null;
			}
		}
		
		/**
		* Function: SliderToScrollbar
		* Reformats the UI Slider to look like a scrollbar by adding endcaps, background 
		* and changing the dimensions of the slider as specified in options.scrollbar and
		* applicable by the div dimensions.
		* Parameters:
		* 	id - id of wrapping object
		* 	h - height of wrapping object
		*/
		function SliderToScrollbar(id,h) {
			
			// Declare vars, set dimensions
			var end_caps = options.scrollbar.end_cap_size;
			var handle_h = (1-((options.contentHeight-h)/options.contentHeight))*h - end_caps*2;
			handle_h = (handle_h > options.scrollbar.end_cap_size*2) ? handle_h : options.scrollbar.end_cap_size*2;
			
			var sliderHeight = h - handle_h - end_caps*2;
			var sliderMargin = (h - sliderHeight)*0.5 - end_caps;
			sliderMargin = (sliderMargin > 0) ? sliderMargin : 0;
			var handle_border = parseInt($(".ui-slider-handle").css('border-top-width')) + parseInt($(".ui-slider-handle").css('border-bottom-width'));

			// Style scrollbar components
			var scroll_outer = $("#" + id).children(".scrollbar_outer"), scroll_bar = scroll_outer.children(".scrollbar");

			scroll_outer.children(".ui-slider-vertical").css({height:sliderHeight,"border-radius":0,"-moz-border-radius":0});			
			scroll_bar.children(".ui-slider-handle").css({height: handle_h - handle_border+"px",left: 0,width: options.scrollbar.width-2,'margin-bottom':-0.5*handle_h});
		    scroll_bar.children(".ui-slider-range").css({top: -sliderMargin});
		
			// Create scrollbar background
			var background = jQuery('<div style="height:' + sliderMargin +'px;padding:0px;border:0px;"></div>').attr('class','ui-widget-content');
			scroll_outer.prepend(background.clone(true).addClass('scroll_top'));
			scroll_outer.append(background.clone(true).addClass('scroll_bottom'));

			// Create scrollbar endcaps
			if (end_caps > 0)
			{
				var arrow = jQuery('<div style="height:' + end_caps +'px;padding:0px;border:0px;"></div>').attr('class','ui-widget-content');
				scroll_outer.prepend(arrow.clone(true).addClass('scroll_up'));
				scroll_outer.append(arrow.clone(true).addClass('scroll_down'));
				scroll_outer.children('.scroll_up').html('&uarr;').css({"text-align":"center","cursor":"default"});
				scroll_outer.children('.scroll_down').html('&darr;').css({"text-align":"center","cursor":"default"});
			}
			else
			{
				scroll_outer.css('margin-top',1);
			}
		}
		
		
		
		function GenerateScrollControls(id) {
			var scrollbar_v = $("#" + id + " .scrollbar_outer > .ui-slider-vertical");
			options.scrollbar.incrementSize = (options.scrollbar.incrementSize) ? options.scrollbar.incrementSize : parseInt(scrollbar_v.height()/20);
			handlers.init(options.scrollbar.incrementSize,id);
		}
		
		if (methods[method]) {
			return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
		} else if (typeof method === 'object' || !method) {
			options.scrollbar = $.extend({},$.fn.scrollbar.defaults,method);
			return methods.create.apply(this, arguments);
		} else {
			$.error('Method ' +  method + ' does not exist');
		}
	};
	
	
	$.fn.scrollbar.defaults = {
		location : "left",
		width: 10,
		margin: 2,
		end_cap_size : 20,
		incrementSize : undefined,
		horizontalVisible : true
	};
	
	/**
	* Function: $.fn.scrollbar.incrementSlider
	* Moves slider and corresponding content by specified amount
	* Parameters: 
	*	step - increment size
	*	id  - id of wrapping object
	*	scrollDifference - total distance scrollbar can travel
	*/
	$.fn.scrollbar.incrementSlider = function(step,id,scrollDifference) {

		var scroll_bar = $('#' + id + ' > .scrollbar_outer > .scrollbar');
		var slider_val = scroll_bar.slider("value");
		
		
		slider_val += step;
		scroll_bar.slider("value", slider_val);
		
		var top_val = ((100-slider_val)*scrollDifference)/100;
		(top_val < 0) ? top_val = 0 : undefined;
		(Math.abs(top_val) > scrollDifference) ? top_val = scrollDifference : undefined;

		$('#' + id + ' > .scroll_content_wrapper > .scroll_content').css({top:-top_val});
	};
	$.fn.scrollbar.click = function (type,id,scrollStep,scrollDifference) {
		$.fn.scrollbar.click.types[type] (id,scrollStep,scrollDifference);
	};
	$.fn.scrollbar.click.types = {
		up : function (id,scrollStep,scrollDifference) {
			$("#" + id + " > .scrollbar_outer > .scroll_up").live('click',
				function() {$.fn.scrollbar.incrementSlider(scrollStep,id,scrollDifference);});
		},
		down : function (id,scrollStep,scrollDifference) {
			$("#" + id + " > .scrollbar_outer > .scroll_down").live('click',
				function() {$.fn.scrollbar.incrementSlider(-scrollStep,id,scrollDifference);});
		},
		top : function (id,scrollStep,scrollDifference) {			
			$("#" + id ).children(".scrollbar_outer").children('.scroll_top').bind('click',
				function() {$.fn.scrollbar.incrementSlider(100,id,scrollDifference);});
		},
		bottom : function (id,scrollStep,scrollDifference) {
			$("#" + id ).children(".scrollbar_outer").children('.scroll_bottom').bind('click',
				function() {$.fn.scrollbar.incrementSlider(-100,id,scrollDifference);});
		}
	};
	$.fn.scrollbar.wheel = function (id,scrollStep,scrollDifference) {
		if (jQuery.isFunction(jQuery.fn.mousewheel)) {
			$("#"+id).mousewheel(function(event, amount){
				var slider_value = $('#' + id).children(' .scrollbar_outer').children('.scrollbar').slider("value");
				
				if (((slider_value == 0 ) && (amount > 0)) || ((slider_value == 100 ) && (amount < 0)) ||((slider_value > 0 ) && (slider_value < 100 )))
				{
					var multiplier = 0;
					$.fn.scrollbar.incrementSlider(amount*scrollStep,id,scrollDifference);
					event.preventDefault();
					return false;
				}
			});
		}
	};
	$.fn.scrollbar.touch = function (id,scrollDifference) {
		$("#"+id).live('touchstart',function(start_event) {

			var original = this;
			var e = start_event.originalEvent;

			if (e.targetTouches.length != 1)
				return false;

			var previousY = e.targetTouches[0].clientY;
			var currentY = previousY;
			var isClick = true;

			$("#"+id).live('touchmove', 
				function(move_event) {
					isClick = false;
					var me = start_event.originalEvent;						
					previousY = currentY;
					currentY = me.targetTouches[0].clientY;
					var deltaY = previousY - currentY;

					$.fn.scrollbar.incrementSlider(-deltaY,id,scrollDifference);
					move_event.preventDefault();
				}
			);

			$("#"+id).live('touchend', 
				function(end_event) {
					$("#"+id).die('touchmove');
					$("#"+id).die('touchend');

					var end_e = end_event.originalEvent;
					var touch_point = end_e.targetTouches[0] || e.targetTouches[0];

					// Propagate mouse click event
					mouse_click = document.createEvent('MouseEvent');
					if (isClick === true)
					{
						mouse_click.initMouseEvent('click',true,true,touch_point.view,1,touch_point.screenX,touch_point.screenY,touch_point.clickX,touch_point.clientY, false, false, false, false, 0, null);
						touch_point.target.dispatchEvent(mouse_click);
					} 

				}
			);
			start_event.preventDefault();
		});
	}
	
})(jQuery);