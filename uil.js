(function () {
/**
* UIL UI Library
*/
	/**
	* @DomReady
	*	Ensure document model has loaded
	*	https://code.google.com/p/domready/
	*/
    var DomReady = window.DomReady = {};
    var userAgent = navigator.userAgent.toLowerCase();

    // Figure out what browser is being used
    var browser = {
    	version: (userAgent.match( /.+(?:rv|it|ra|ie)[\/: ]([\d.]+)/ ) || [])[1],
    	safari: /webkit/.test(userAgent),
    	opera: /opera/.test(userAgent),
    	msie: (/msie/.test(userAgent)) && (!/opera/.test( userAgent )),
    	mozilla: (/mozilla/.test(userAgent)) && (!/(compatible|webkit)/.test(userAgent))
    };

	var readyBound = false;
	var isReady = false;
	var readyList = [];

	// Handle when the DOM is ready
	function domReady() {
		// Make sure that the DOM is not already loaded
		if(!isReady) {
			// Remember that the DOM is ready
			isReady = true;
	        if(readyList) {
	            for(var fn = 0; fn < readyList.length; fn++) {
	                readyList[fn].call(window, []);
	            }
	            readyList = [];
	        }
		}
	};

	// From Simon Willison. A safe way to fire onload w/o screwing up everyone else.
	function addLoadEvent(func) {
	  var oldonload = window.onload;
	  if (typeof window.onload != 'function') {
	    window.onload = func;
	  } else {
	    window.onload = function() {
	      if (oldonload) {
	        oldonload();
	      }
	      func();
	    }
	  }
	};
	// does the heavy work of working through the browsers idiosyncracies (let's call them that) to hook onload.
	function bindReady() {
		if(readyBound) {
		    return;
	    }
	
		readyBound = true;
		// Mozilla, Opera (see further below for it) and webkit nightlies currently support this event
		if (document.addEventListener && !browser.opera) {
			// Use the handy event callback
			document.addEventListener("DOMContentLoaded", domReady, false);
		}

		// If IE is used and is not in a frame
		// Continually check to see if the document is ready
		if (browser.msie && window == top) (function(){
			if (isReady) return;
			try {
				// If IE is used, use the trick by Diego Perini
				// http://javascript.nwbox.com/IEContentLoaded/
				document.documentElement.doScroll("left");
			} catch(error) {
				setTimeout(arguments.callee, 0);
				return;
			}
			// and execute any waiting functions
		    domReady();
		})();

		if(browser.opera) {
			document.addEventListener( "DOMContentLoaded", function () {
				if (isReady) return;
				for (var i = 0; i < document.styleSheets.length; i++)
					if (document.styleSheets[i].disabled) {
						setTimeout( arguments.callee, 0 );
						return;
					}
				// and execute any waiting functions
	            domReady();
			}, false);
		}

		if(browser.safari) {
		    var numStyles;
			(function(){
				if (isReady) return;
				if (document.readyState != "loaded" && document.readyState != "complete") {
					setTimeout( arguments.callee, 0 );
					return;
				}
				if (numStyles === undefined) {
	                var links = document.getElementsByTagName("link");
	                for (var i=0; i < links.length; i++) {
	                	if(links[i].getAttribute('rel') == 'stylesheet') {
	                	    numStyles++;
	                	}
	                }
	                var styles = document.getElementsByTagName("style");
	                numStyles += styles.length;
				}
				if (document.styleSheets.length != numStyles) {
					setTimeout( arguments.callee, 0 );
					return;
				}
				// and execute any waiting functions
				domReady();
			})();
		}
		// A fallback to window.onload that will always work
	    addLoadEvent(domReady);
	};
	
	// This is the public function that people can use to hook up ready.
	DomReady.ready = function(fn, args) {
		// Attach the listeners
		bindReady();
    
		// If the DOM is already ready
		if (isReady) {
			// Execute the function immediately
			fn.call(window, []);
	    } else {
			// Add the function to the wait list
	        readyList.push( function() { return fn.call(window, []); } );
	    }
	};
	// Fire bindReady()!
	bindReady();

	/**
	* @namespace UIL holds all UI Library functionality
	*/
	var UIL = {
		
		/**
		* @init
		*	Load UIL modules
		**/
		init: function() {
			this.enableTips();
			//this.tabOrder();
		},

		/**
		* @tabOrder
		*/
		tabOrder: function(){
			var elems = document.querySelectorAll("a, input, select, textarea") ;
			
			for(var i = 0; i < elems.length; i++) {
				console.log(elems[i].getAttribute('tabindex'));
				if(elems[i].getAttribute('tabindex') === undefined) {
					elems[i].createAttribute('tabindex');
					elems[i].setAttribute('tabindex', i+1);
				}else if(elems[i].getAttribute('tabindex') === null) {
					elems[i].setAttribute('tabindex', i+1);
				}
			}
		},

		/**
		* @enableTips
		* USAGE: <a class="UIL_csh" data-tip-on="false"><span class="tooltip">**Enter content here**</span></span>
		*		Using data-tip-pos="" attribute with either top, right, bottom, left will move tipbox to appropriate position. 
		*		Default is 'left' and attribute is not absolutley required in this situation. Box will reposition itself if lack of viewport room.
		*/
		enableTips: function(){
			// Open / close tooltip
			function doTip(el) {
				var elem = UIL.getTarget(el);
				if(elem.getAttribute('data-tip-on')  === 'false') {
					tipReset();
					elem.setAttribute('data-tip-on', 'true');
					var rect = elem.getBoundingClientRect();
					//console.log(elem.getBoundingClientRect());
					var tipId = Math.random().toString(36).substring(7);
						elem.setAttribute('data-tip-id', tipId);
					var tip = document.createElement("span");
					tip.setAttribute('id', tipId);
					tip.innerHTML 	= '<span class="uilib_csh_wrap">'
									+	'<span class="uilib_csh_container">'
									+		'<span class="uilib_csh_close"><span class="sr-only">Close</span></span>'
									+		'<span class="uilib_csh_content">'
									+ 			elem.innerHTML
									+		'</span>'
									+		'<span class="uilib_csh_arrow"></span>'
									+		'<span class="uilib_csh_arrow_inner"></span>'
									+		'<span class="uilib_csh_arrow_shadow"></span>'
									+	'</span>'
									+ '</span>';
					tip.setAttribute('class','uilib_csh_tip');					
					elem.appendChild(tip);
					var position = elem.getAttribute('data-tip-pos');
					//Check whether tip can be shown in current viewport dimensions and shift
					if (rect.top + tip.clientHeight < 0) { //no room top
						position = "right";
					}
					if (rect.bottom + tip.clientHeight > UIL.getViewportSize().height) { //no room bottom
						position = "right";
					}					
					if (rect.left + tip.clientWidth > UIL.getViewportSize().width) { //no room right
						position = "top";
					}								
					if (rect.top - tip.clientHeight < 0 && rect.left + tip.clientWidth > UIL.getViewportSize().width) { //no room top or right
						position = "bottom";
					}
					if (rect.top - tip.clientHeight < 0 && rect.left + tip.clientWidth > UIL.getViewportSize().width && rect.bottom + tip.clientHeight > UIL.getViewportSize().height) { //no room top or right or bottom
						position = "left";
					}
					if (rect.left - tip.clientWidth < 0) { //no room left
						position = "right";
					}
					switch (position) {
						case "top":
							tip.setAttribute("style","top:-" + parseInt(tip.clientHeight) + "px;right:-6px;");
							tip.className = tip.className + " csh_top";
							break;
						case "left":
							tip.setAttribute("style","top:0px;right:20px;");
							tip.className = tip.className + " csh_left";
							break;
						case "bottom":
							tip.setAttribute("style","bottom:-" + parseInt(tip.clientHeight) + "px;right:-6px;");
							tip.className = tip.className + " csh_bottom";
							break;
						default:
							tip.className = tip.className + " csh_right";
							break;
					}
					// Fix up event listener for close button
					// Polyfill: preventDefault to allow just X button to close
					(el.preventDefault) ? el.preventDefault() : el.returnValue = false;
					for(var close = UIL.getClass('uilib_csh_close'), i = 0; i < close.length; i++) {
						UIL.bindEvent(close[i],"click", tipReset);
					}
				}
			}
			//close any and all open tooltips
			function tipReset() {
				for(i = 0; i < elems.length; i++) {
					elems[i].setAttribute('data-tip-on', 'false');
					var tip = document.getElementById(elems[i].getAttribute('data-tip-id'));
					if ( tip ) {
						tip.parentNode.removeChild(tip);
						elems[i].removeAttribute('data-tip-id');
					}
				}
			}
			// add listeners for tooltips	
			for(var elems = this.getClass('uilib_csh'), i = 0; i < elems.length; i++) {
				this.bindEvent(elems[i],"click", doTip);
			};			
		},				
		/**
		* @getClass
		* @param {string} className - The class name required
		* @param {string} tag - Any tag specified
		* @param {string} elm - Any element specified
		* @return {array} - Array of collected items
		*	Polyfill getElementsByClassName
		*	Code/licensing: http://code.google.com/p/getelementsbyclassname/ 
		*/			
		getClass: function (className, tag, elm){
			if (document.getElementsByClassName) {
				getElementsByClassName = function (className, tag, elm) {
					elm = elm || document;
					var elements = elm.getElementsByClassName(className),
						nodeName = (tag)? new RegExp("\\b" + tag + "\\b", "i") : null,
						returnElements = [],
						current;
					for(var i=0, il=elements.length; i<il; i+=1){
						current = elements[i];
						if(!nodeName || nodeName.test(current.nodeName)) {
							returnElements.push(current);
						}
					}
					return returnElements;
				};
			}
			else if (document.evaluate) {
				getElementsByClassName = function (className, tag, elm) {
					tag = tag || "*";
					elm = elm || document;
					var classes = className.split(" "),
						classesToCheck = "",
						xhtmlNamespace = "http://www.w3.org/1999/xhtml",
						namespaceResolver = (document.documentElement.namespaceURI === xhtmlNamespace)? xhtmlNamespace : null,
						returnElements = [],
						elements,
						node;
					for(var j=0, jl=classes.length; j<jl; j+=1){
						classesToCheck += "[contains(concat(' ', @constructor, ' '), ' " + classes[j] + " ')]";
					}
					try	{
						elements = document.evaluate(".//" + tag + classesToCheck, elm, namespaceResolver, 0, null);
					}
					catch (e) {
						elements = document.evaluate(".//" + tag + classesToCheck, elm, null, 0, null);
					}
					while ((node = elements.iterateNext())) {
						returnElements.push(node);
					}
					return returnElements;
				};
			}
			else {
				getElementsByClassName = function (className, tag, elm) {
					tag = tag || "*";
					elm = elm || document;
					var classes = className.split(" "),
						classesToCheck = [],
						elements = (tag === "*" && elm.all)? elm.all : elm.getElementsByTagName(tag),
						current,
						returnElements = [],
						match;
					for(var k=0, kl=classes.length; k<kl; k+=1){
						classesToCheck.push(new RegExp("(^|\\s)" + classes[k] + "(\\s|$)"));
					}
					for(var l=0, ll=elements.length; l<ll; l+=1){
						current = elements[l];
						match = false;
						for(var m=0, ml=classesToCheck.length; m<ml; m+=1){
							match = classesToCheck[m].test(current.className);
							if (!match) {
								break;
							}
						}
						if (match) {
							returnElements.push(current);
						}
					}
					return returnElements;
				};
			}
			return getElementsByClassName(className, tag, elm);	
		},
		/**
		* @getTarget
		* @param {event} e - Triggered event
		* @return {element} - Returns element that triggered event
		*	Polyfill target
		*/
		getTarget: function(e) {
			 e = e || window.event;
			 var target = e.target || e.srcElement;
			 return target;
		},
		/**
		* @bindEvent
		* @param {node} - The element passed
		* @param {event} - The event passed for binding
		* @param {eventhandler} - The function used to handle event
		*	Polyfill event binding
		*/
		bindEvent: function(el, eventName, eventHandler) {
			if (el.addEventListener){
				el.addEventListener(eventName, eventHandler, false);
			} else if (el.attachEvent){
				el.attachEvent('on'+eventName, eventHandler);
			}
		},
		/**
		* @getViewportSize
		* @param {self}
		* @return {object} - Returns width:x, height:y of viewport
		*	Polyfill window.innerWidth && window.innerHeight
		*/		
		getViewportSize: function() {
			var x=0;
			var y=0;
			if (self.innerHeight) { // all except Explorer < 9
				x = self.innerWidth;
				y = self.innerHeight;
			}else if (document.documentElement && document.documentElement.clientHeight) { // Explorer 6 Strict Mode
				x = document.documentElement.clientWidth;
				y = document.documentElement.clientHeight;
			} else if (document.body) {  // other Explorers < 9
				x = document.body.clientWidth;
				y = document.body.clientHeight;
			}
			return {
				width: x, 
				height: y
			};
		}
	}
	// Attach UIL namespace to global
	window.UIL = UIL;
	// Is the DOM ready? Load UIL!
	DomReady.ready(function() {
		UIL.init();
    });
})();
