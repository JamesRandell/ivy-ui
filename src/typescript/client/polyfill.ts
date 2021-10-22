/**
 * Allows us to create customer events back to IE9. This is a 
 * pre-requisite for me creating hooks in my code to trigger 
 * an event when I call functions etc.
 */

/*
(function () {

    if ( typeof window.CustomEvent === "function" ) return false;
  
    function CustomEvent ( event, params ) {
      params = params || { bubbles: false, cancelable: false, detail: undefined };
      var evt = document.createEvent( 'CustomEvent' );
      evt.initCustomEvent( event, params.bubbles, params.cancelable, params.detail );
      return evt;
     }
  
    CustomEvent.prototype = window.Event.prototype;
  
    window.CustomEvent = CustomEvent;
  })();
  */
/**
 * adds the startsWith, a substring comparison tool
 */
  if (!String.prototype.startsWith) {
    Object.defineProperty(String.prototype, 'startsWith', {
        value: function(search, rawPos) {
            var pos = rawPos > 0 ? rawPos|0 : 0;
            return this.substring(pos, pos + search.length) === search;
        }
    });
}