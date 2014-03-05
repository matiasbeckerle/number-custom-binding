/**
 * number, a custom binding for KnockoutJS
 * Version 0.1
 * 2014-03-05
 * Copyright Matias Beckerle
 * Licensed under The MIT License (http://www.opensource.org/licenses/mit-license.php)
 * 
 * Some code are inspired or taken from:
 * http://josscrowcroft.github.com/accounting.js/
 */

(function (ko) {

	ko.bindingHandlers.number = {

		update: function (element, valueAccessor) {
			var options = ko.utils.extend({}, ko.bindingHandlers.number.defaults);
			var newValue = ko.utils.unwrapObservable(valueAccessor());

			if (newValue === Object(newValue)) {
				options = ko.utils.extend(options, newValue);
				newValue = newValue.value;
			}

			var formattedValue = formatNumber(newValue, options);

			ko.bindingHandlers.text.update(element, function () {
				return formattedValue;
			});
		},

		getFormatted: function (number, newOptions) {
			var options = ko.utils.extend({}, ko.bindingHandlers.number.defaults);
			if (newOptions) {
				options = ko.utils.extend(options, newOptions);
			}

			return formatNumber(number, options);
		},

		defaults: {
			precision: null,
			thousandSeparator: ',',
			decimalSeparator: '.',
			prefix: '',
			suffix: ''
		}

	};

	/**
	 * Takes a string and removes all formatting/cruft and returns the raw float value
	 */
	var unformat = function (value, decimal) {
		// Return the value as-is if it's already a number:
		if (typeof value === 'number') return value;

		// Build regex to strip out everything except digits, decimal point and minus sign:
		var regex = new RegExp('[^0-9-' + decimal + ']', ['g']),
			unformatted = parseFloat(
				('' + value)
				.replace(/\((.*)\)/, '-$1') // replace bracketed values with negatives
				.replace(regex, '')         // strip out any cruft
				.replace(decimal, '.')      // make sure decimal point is standard
			);

		// This will fail silently which may cause trouble
		return !isNaN(unformatted) ? unformatted : 0;
	};

	/**
	 * Format a number, with comma-separated thousands and custom precision/decimal places
	 */
	var formatNumber = function (number, options) {
		// Ensure we are working with a valid number
		number = unformat(number, options.decimalSeparator);

		var base,
			mod,
			decimal = number % 1,
			negative = number < 0 ? '-' : '';

		if (options.precision === null) {
			base = parseInt(Math.abs(number || 0), 10) + '';
		} else {
			base = parseInt(Math.abs(number || 0).toFixed(options.precision), 10) + '';
		}

		mod = base.length > 3 ? base.length % 3 : 0;

		var formattedValue = negative
			+ (mod ? base.substr(0, mod) + options.thousandSeparator : '')
			+ base.substr(mod).replace(/(\d{3})(?=\d)/g, '$1' + options.thousandSeparator);

		if (options.precision) {
			formattedValue += options.decimalSeparator + Math.abs(number).toFixed(options.precision).split('.')[1];
		} else if (options.precision === null && decimal > 0) {
			var numberAsString = number + '';
			formattedValue += numberAsString.substr(numberAsString.indexOf('.'));
		}

		return options.prefix + formattedValue + options.suffix;
	};

})(ko);