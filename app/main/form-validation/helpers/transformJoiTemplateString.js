// Since the language template string format of react-intl and joi-validation-streagy is not the same,
// getting the same structure of file format to be parsed for these two parsers do not work well together,
// therefore it is necessary to transform react-intl template string format to joi-validation-streagy format
// so that after running defineMessages, the stragy function is able to transform it into its validator
export default function transformJoiTemplateString(messages = {}) {
  const updatedMessages = messages;


  for (const key of Object.keys(messages)) {
    // transform joi template string
    // reference: https://github.com/hapijs/joi/blob/master/lib/language.js
    if (key === 'defaultMessage') {
      updatedMessages[key] = messages[key].replace(/(\{!?\w+\})/g, '{$1}');
    }

    // Go one deeper level and perform the same logic for nested object
    if (typeof messages[key] === 'object') {
      updatedMessages[key] = transformJoiTemplateString(messages[key]);
    }
  }

  return updatedMessages;
}
