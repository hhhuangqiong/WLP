// Recusively looks for object key that contains 'id'
// and perform stringification in order to work with joi-validation-strategy and react-intl together
export default function stringifyI18nObject(messages = {}) {
  const updatedMessages = messages;

  for (const key of Object.keys(messages)) {
    // Stringify current object message and end current node
    if (key === 'id') {
      return JSON.stringify(messages);
    }

    // Go one deeper level and perform the same logic for nested object
    if (typeof messages[key] === 'object') {
      updatedMessages[key] = stringifyI18nObject(messages[key]);
    }
  }

  return updatedMessages;
}
