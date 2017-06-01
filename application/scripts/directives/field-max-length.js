var main = function () {
	var link = function (scope, element, attrs, ngModel) {
    if (!scope.step || scope.step == 'any') {
               return;
            }

            var prec = 1;
            for (var i = scope.step; i != 1; i *= 10) {
                prec *= 10;
            }

            element.on('keypress', function (e) {
                console.log(e);
                var val = Number(element.val() + (e.charCode !== 0  ? String.fromCharCode(e.charCode) : ''));

                if (val) {
                    var newVal = Math.floor(val * prec) / prec;

                    if (val != newVal) {
                        e.preventDefault();
                    }
                }
            });
        }

  return {
    restrict: 'A',
    require: 'ngModel',
    link: link
  };
};
  
if (module) {
	module.exports = main;
}
if (typeof define === 'function') {
	define(main);
}
