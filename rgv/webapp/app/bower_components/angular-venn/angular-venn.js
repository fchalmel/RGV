angular.module('angular-venn', [])
.directive('venn', function() {
	return {
		scope: {
			venn: '=',
			vennKey: '=?',
			vennKeySize: '=?',
			vennMap: '=?'
		},
		restrict: 'AE',
		controller: function($scope, $element) {
			$scope.chartD3 = venn.VennDiagram();

			/**
			* Return all possible combinations of the provided array
			* e.g. [a, b] => [[a], [b], [a, b]]
			* @param array arr The array to return the combinations for
			* @return array All possible combinations of the provided array
			*/
			$scope.getCombinations = function(arr) {
				var sets = [];
				for (var val = 1; val < Math.pow(2, arr.length); val++) {
					var set = [];
					for (var index = 0; index < arr.length; index++) {
						if (val & Math.pow(2, index)) set.push(arr[index]);
					}
					sets.push({sets: set, size: 0});
				}
				return sets;
			};

			$scope.$watch('venn', function() {
				var sets;

				if (!$scope.venn) {
					throw new Error('Venn data is invalid');
				} else if ($scope.vennKey || $scope.vennMap) {
					// Use key method or map method{{{
					var sets = {};
					var seenKeys = {};
					// Iterate over each item and compute the initial set from data {{{
					$scope.venn.forEach(function(i) {
						if ($scope.vennKey && !i[$scope.vennKey]) return; // Key not specified for this item
						var iKeys = $scope.vennKey ? i[$scope.vennKey] : $scope.vennMap(i);
						$scope.getCombinations(iKeys).forEach(function(combination) {
							var setSize = $scope.vennKeySize && i[$scope.vennKeySize] ? i[$scope.vennKeySize] : 1;
							if (combination.sets.length == 1) seenKeys[combination.sets[0]] = true;
							var combinationKey = combination.sets.join('|');
							if (sets[combinationKey]) { // Set already created
								sets[combinationKey].size += setSize;
							} else { // First time we've seen this set
								sets[combinationKey] = {sets: combination.sets, size: setSize};
							}
						});
					});
					// }}}
					// Back-fill any missing set combinations {{{
					$scope.getCombinations(Object.keys(seenKeys)).forEach(function(combination) {
						var combinationKey = combination.sets.join('|');
						if (sets[combinationKey]) return; // Already exists
						sets[combinationKey] = {sets: combination.sets, size: 0};
					});
					// }}}
					// Convert set object into array {{{
					sets = Object.keys(sets).map(function(k) { return sets[k] });
					// }}}
					// }}}
				} else {
					// Use plain set method {{{
					sets = $scope.venn;
					// }}}
				}

				d3.select($element[0]).datum(sets).call($scope.chartD3);
			}, true);
		},
		link: function($scope, elem, attr, ctrl) {
		}
	}
});
