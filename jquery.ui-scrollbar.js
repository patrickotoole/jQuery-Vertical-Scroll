/**
* Title: jQuery UI Vertical Scrollbar
* Adds a vertical scrollbar to DOM object using jQuery UI
* 
* Usage:
*	$('.elemeinlineStyleForWrappernt').scrollbar();
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
* Version: 0.0.1i
**/

(function($) {
	
	$.fn.scrollbar = function(method,user_options) {
		var options = {
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
			},
			originalStyle : {}
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
				var step = scrollStep > 10 ? scrollStep/10 : 1;
				$.fn.scrollbar.wheel(id,step,scrollDifference);
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
						id = c.attr("id") || "scrollable_content_" + cl +"_"+ index;

					options.wrapperHeight 		= h;
					options.wrapperWidth 		= w;
					var scrollContentWrapper 	= WrapContent(this);
					
					if (options.scrollDifference > 0)
					{		
						// Create div with current objects dimensions, styling
						var scroll_slider = CreateSlider(id);
						var new_c = jQuery("<div></div>").attr("class",cl).attr("id",id);
						
						// Use inline style on wrapper?
						!options.scrollbar.inlineStyleForWrapper ? null : (options.originalStyle != undefined) ? new_c.attr("style",options.originalStyle) : null;
						new_c.css({'position':'relative','overflow-y':'hidden','width':w,'height':h});

						// Insert newly wrapped content and remove old content
						new_c.append(scroll_slider).append(scrollContentWrapper);
						c.after(new_c);			
						c.remove();

						// Format slider
						SliderToScrollbar(id,h);
						GenerateScrollControls(id);
						
						// Save options and trigger completion event
						new_c.data("scroll-options",options);
						jQuery(this).trigger('scroll_drawn');
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
					var $this = jQuery(this);
					var id = $this.attr("id");
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
			var scrollDifference = (function(opt) {return opt.scrollDifference;})(options);
			
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
			options.originalStyle = jQuery(current_content).attr("style") ? jQuery(current_content).attr("style") : "";
//				jQuery(current_content).attr("style") ? $.parseJSON("{\""+jQuery(current_content).attr("style").replace(/\s/g,"").replace(/;$/,"").replace(/;/g,"\",\"").replace(/:/g,"\":\"")+"\"}") : {};
			
			s_content.css({"height":"auto",'width':jQuery(current_content).width() - options.scrollbar.width - options.scrollbar.margin});
			jQuery(s_content).css({"position":"absolute","left":0,"top":0}).attr("class","scroll_content").removeAttr("id");
			
			options.setContentHeight(s_content,current_content);
			options.scrollDifference = options.contentHeight - options.wrapperHeight;
			s_content.css({"height":options.contentHeight});

			var sc_wrap = jQuery('<div></div>').css({
				"position"	: "relative",
				"float"		: "left",
				'width'		: options.wrapperWidth - options.scrollbar.width - options.scrollbar.margin,
				'height'	: options.wrapperHeight,
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
				c.html(original_content.html()).removeAttr("style").attr("style",options.originalStyle);
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
			var handle_h = parseInt(((1-((options.contentHeight-h)/options.contentHeight))*h - end_caps*2)/2)*2;
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
				var arrow = jQuery('<div style="height:' + end_caps +'px;padding:0px;border:0px;position:relative"></div>').attr('class','ui-widget-content');
				var icon_w = 16;	// note: .width() property changed from 1.4.2 to 1.5.1; no longer needs to be rendered
				var arrow_icon = jQuery('<div></div>').addClass('ui-icon').width(icon_w).height(icon_w);
				
				scroll_outer.prepend(arrow.clone(true).addClass('scroll_up'));
				scroll_outer.append(arrow.clone(true).addClass('scroll_down'));

				if (end_caps >=5)
				{
					var w = (icon_w-scroll_outer.width())/2;
					var h = (icon_w-end_caps)/2;

					w = (parseInt(w) == w) ? [w,w+1] 	: [w - 0.5*w/Math.abs(w),w - 0.5*w/Math.abs(w)+1];
					h = (parseInt(h) == h) ? [h,h] 		: [h + 0.5*h/Math.abs(h),h-0.5*h/Math.abs(h)];

					scroll_outer.children(".scroll_up").css({"cursor":"default"}).html(arrow_icon.clone().
						css({'position':'absolute','left':-w[0],'overflow':'hidden','width':'15px','max-height':"16px"}).addClass('ui-icon-carat-1-n').css({top:-h[0]}));

					scroll_outer.children('.scroll_down').css({"cursor":"default"});				
					scroll_outer.children(".scroll_down").html(arrow_icon.clone().
						css({'position':'absolute','left':-w[1],'top':-h[1],'overflow':'hidden','width':'15px','max-height':"16px"}).addClass('ui-icon-carat-1-s'));
				}
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
		width: 9,
		margin: 2,
		end_cap_size : 16,
		incrementSize : undefined,
		horizontalVisible : true,
		inlineStyleForWrapper : true
	};
	
	/**
	* Function: $.fn.scrollbar.incrementSlider
	* Moves slider and corresponding content by specified amount. Made an external function to
	* allow for animation, easing, etc to be added to the movement.
	* Parameters: 
	*	step - increment size
	*	id  - id of wrapping object
	*	scrollDifference - total distance scrollbar can travel
	*/
	$.fn.scrollbar.incrementSlider = function(step,id,scrollDifference) {

		var scroll_bar = $('#' + id + ' > .scrollbar_outer > .scrollbar');
		var slider_val = scroll_bar.slider("value");
		
		step += .5*Math.abs(step)/step
		slider_val += step;
		scroll_bar.slider("value", slider_val);
		
		var top_val = parseInt(((100-slider_val)*scrollDifference)/100);
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
			$("#"+id).mousewheel(function(event, totalDelta,deltaX,deltaY){
				return $.fn.scrollbar.wheel.increment(id,scrollDifference,deltaY);
			});
		} else {
			$.fn.scrollbar.wheel.handler(id,scrollDifference);
		}
	};
	$.fn.scrollbar.wheel.handler = function (id,scrollDifference) {
		var types = ['DOMMouseScroll', 'mousewheel'];
		var $this = $("#"+id).first()[0];

		if ($this.addEventListener) {
            for (var i=types.length; i;) {
                $this.addEventListener(types[--i], mini_handler, false);
            }
        } else {
			$this.onmousewheel = mini_handler;
		}

		function mini_handler(event)
		{
			var orgEvent = event || window.event, deltaY;
			event = $.event.fix(orgEvent);
			
			deltaY = 
				orgEvent.wheelDeltaY !== undefined ? orgEvent.wheelDeltaY/120 :
				event.wheelDelta ? event.wheelDelta/120 :
				(orgEvent.axis !== undefined && orgEvent.axis === orgEvent.HORIZONTAL_AXIS) ? 0 :
				event.detail ? -event.detail/3 : 0;

			var propagate = $.fn.scrollbar.wheel.increment(id,scrollDifference,deltaY);

			if (!propagate) {
				(orgEvent.stopPropagation) ? orgEvent.stopPropagation() : orgEvent.cancelBubble = true;
				if (event.preventDefault) event.preventDefault();
				event.returnValue = false;
			}

		}
	}
	$.fn.scrollbar.wheel.increment = function (id,scrollDifference,deltaY) {
		var slider_value = $('#' + id).children(' .scrollbar_outer').children('.scrollbar').slider("value");
		
		if (((slider_value == 0 ) && (deltaY > 0)) || ((slider_value == 100 ) && (deltaY < 0)) ||((slider_value > 0 ) && (slider_value < 100 )))
		{
			var step = 
				parseInt(deltaY*$.fn.scrollbar.wheel.increment.multiplier) == deltaY*$.fn.scrollbar.wheel.increment.multiplier ? deltaY*$.fn.scrollbar.wheel.increment.multiplier :
				parseInt(deltaY/0.025) == deltaY/0.025 	? $.fn.scrollbar.wheel.increment.multiplier = 40 : 
				parseInt(deltaY*3) == deltaY*3 			? $.fn.scrollbar.wheel.increment.multiplier = 3*3 : null;
			
			var current_direction = Math.abs(step)/step;
			
			step = step/scrollDifference*100;
			current_direction === $.fn.scrollbar.wheel.increment.previous_direction ?	
				$.fn.scrollbar.incrementSlider(step,id,scrollDifference) : $.fn.scrollbar.wheel.increment.previous_direction = current_direction ;
			return false;
		}
		return true;
	}
	$.fn.scrollbar.wheel.increment.multiplier = (function() { if (jQuery.browser.msie == true) return 5; return 1;})();
	$.fn.scrollbar.wheel.increment.previous_direction = 1;
	
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