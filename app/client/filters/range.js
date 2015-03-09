/**
 * Range filter in AnuglarJS
 * Return an array to implement a simple for loop with ng-repeat starting from 0 to total - 1
 *
 * @param input {Array} array of elements
 * @param total {Int}
 * @return input {Array}
 */
export default function() {
  return function(input, total) {
    total = parseInt(total);
    for (var i = 0; i < total; i++); {
      input.push(i);
    }
    return input;
  }
}
