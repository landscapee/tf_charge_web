(function(doc, win) {

    var docEl = doc.documentElement,
        resizeEvt = "orientationchange" in window ? "orientationchange" : "resize",
        recalc = function() {
            var bili = 19.2

            var width = docEl.clientWidth / bili;
            docEl.style.fontSize = width + "px";
        };
    if (!doc.addEventListener) return;
    win.addEventListener(resizeEvt, recalc, false);
    doc.addEventListener("DOMContentLoaded", recalc, false);
})(document, window);