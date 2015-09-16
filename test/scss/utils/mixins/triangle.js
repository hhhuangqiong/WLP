import path from 'path';
import Sassaby from 'sassaby';

const TEST_CASE = 'triangle';
const SIZE = 'rem-calc(5)';
const COLOR = '#fff';

describe(TEST_CASE, () => {
  let filePath = path.resolve(__dirname, `../../../../public/scss/utils/mixins/_${TEST_CASE}.scss`);
  let sassaby = new Sassaby(filePath);
  let mixin = sassaby.includedMixin(TEST_CASE);

  it('should create a triangle to point to the bottom', () => {
    let direction = 'down';
    mixin.calledWithArgs(`$direction: ${direction}`).declares('border-left', `${SIZE}-3px solid transparent`);
    mixin.calledWithArgs(`$direction: ${direction}`).declares('border-right', `${SIZE}-3px solid transparent`);
    mixin.calledWithArgs(`$direction: ${direction}`).declares('border-top', `${SIZE}px solid ${COLOR}`);
  });

  it('should create a triangle to point to the top', () => {
    let direction = 'up';
    mixin.calledWithArgs(`$direction: ${direction}`).declares('border-left', `${SIZE}-3px solid transparent`);
    mixin.calledWithArgs(`$direction: ${direction}`).declares('border-right', `${SIZE}-3px solid transparent`);
    mixin.calledWithArgs(`$direction: ${direction}`).declares('border-bottom', `${SIZE}px solid ${COLOR}`);
  });

  it('should create a triangle to point to the left', () => {
    let direction = 'left';
    mixin.calledWithArgs(`$direction: ${direction}`).declares('border-top', `${SIZE}-3px solid transparent`);
    mixin.calledWithArgs(`$direction: ${direction}`).declares('border-bottom', `${SIZE}-3px solid transparent`);
    mixin.calledWithArgs(`$direction: ${direction}`).declares('border-right', `${SIZE}px solid ${COLOR}`);
  });

  it('should create a triangle to point to the right', () => {
    let direction = 'right';
    mixin.calledWithArgs(`$direction: ${direction}`).declares('border-top', `${SIZE}-3px solid transparent`);
    mixin.calledWithArgs(`$direction: ${direction}`).declares('border-bottom', `${SIZE}-3px solid transparent`);
    mixin.calledWithArgs(`$direction: ${direction}`).declares('border-left', `${SIZE}px solid ${COLOR}`);
  });

  it('should create a triangle with different colors', () => {
    let color1 = 'blue';
    let color2 = 'red';
    mixin.calledWithArgs(`$color: ${color1}`).declares('border-top', `${SIZE}px solid ${color1}`);
    mixin.calledWithArgs(`$color: ${color2}`).declares('border-top', `${SIZE}px solid ${color2}`);
  });

  it('should create a triangle with different size', () => {
    let size1 = 'rem-calc(8)';
    let size2 = 'rem-calc(67)';
    mixin.calledWithArgs(`$size: ${size1}`).declares('border-top', `${size1}px solid ${COLOR}`);
    mixin.calledWithArgs(`$size: ${size2}`).declares('border-top', `${size2}px solid ${COLOR}`);
  });
});
