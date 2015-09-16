import path from 'path';
import Sassaby from 'sassaby';

const TEST_CASE = 'animation';

describe(TEST_CASE, () => {
  let filePath = path.resolve(__dirname, `../../../../public/scss/utils/mixins/_${TEST_CASE}.scss`);
  let sassaby = new Sassaby(filePath);

  describe('fadeIn', () => {
    let mixin = sassaby.includedMixin('fadeIn');

    it('should maintain the same fadeIn animate duration', () => {
      let duration = 5;
      mixin.calledWithArgs().declares('animation-duration', '1s');
      mixin.calledWithArgs(duration).declares('animation-duration', `${duration}s`);
    });
  });
});
