import path from 'path';
import Sassaby from 'sassaby';

const TEST_CASE = 'color-radio-button';

describe(TEST_CASE, () => {
  let filePath = path.resolve(__dirname, `../../../../public/scss/utils/mixins/_${TEST_CASE}.scss`);
  let sassaby = new Sassaby(filePath);
  let mixin = sassaby.includedMixin(TEST_CASE);

  it('should create correct border properties', () => {
    let color = 'red';
    mixin.calledWithArgs(color).declares('border', `1px solid ${color}`);
  });

  it('should create correct width and height properties', () => {
    let size = 16;
    mixin.calledWithArgs(`$size: ${size}`).declares('width', `rem-calc(${size})`);
    mixin.calledWithArgs(`$size: ${size}`).declares('height', `rem-calc(${size})`);
  });
});
