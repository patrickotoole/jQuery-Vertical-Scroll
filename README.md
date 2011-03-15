# jQuery UI Vertical Scrollbar

----

This is a plugin written for jQuery which adds a vertical scrollbar to DOM object using the jQuery UI slider. Detects object height/ necessary height to display contents and determines if a scrollbar is necessary. Rewraps content and creates a scrollbar inside existing object. 

View the demo here:
http://patrickotoole.github.com/jQuery-Vertical-Scroll/index.html

#### User has four methods to control scroll of object:
* click
* drag
* wheel (mouse)
* touch (iOS)

The functionality for each of these controls is stubbed out as secondary functions to allow for custom handling, scrolling and animation of events. The increment function is also stubbed for the same purpose. Default functionality and handling of all events is included.

Usage
----
*	$('.element').scrollbar();
*	$('.element').scrollbar(method, scrollbar_options);

### Methods
* Create -- creates the scrollbar with specified options
	$('.element').scrollbar("create", options_hash);	
* Destroy -- removes scrollbar
	$('.element').scrollbar("destroy");
* Refresh -- removes scrollbar and creates scrollbar using original options
	$('.element').scrollbar("refresh");
* Increment -- external functionality to increment scrollbar
	$('.element').scrollbar("increment", step);

### Options

* location: left or right,
* width: int,
* margin: int,
* end_cap_size : int,
* incrementSize : int,
* horizontalVisible : bool
* inlineStyleForWrapper : bool

Dependencies
---
* Uses jquery.ui as base for toolbar. Allows for matching css etc.


To Do / Progress
-----
* No longer dependent on mousewheel.js -- uses if available 
* Documentation of exposed functions and expandability forthcoming
* Test suite / test page for various situations in process

