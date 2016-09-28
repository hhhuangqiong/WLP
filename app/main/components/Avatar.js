import React, { PropTypes } from 'react';
import classNames from 'classnames';
import UserAvatar from 'react-user-avatar';

const SMALL = 'small';
const MEDIUM = 'medium';
const LARGE = 'large';

function Avatar(props) {
  const { className, firstName, lastName, size, ...restProps } = props;

  let name;
  // initial will be extract by the first char between space
  // pick a char from firstName and a char from last name if both exist, remove space respectively
  if (lastName) {
    name = `${firstName.replace(/\s+/g, '')} ${lastName.replace(/\s+/g, '')}`;
  } else {
    // pick two char from firstName and avoid more than 2 initals are picked
    const items = firstName.trim().split(' ');
    name = `${items.shift()} ${items.join('')}`.trim();
  }

  // remove all the symbol in the name because it will also considered to be space and splitted as initial
  name = name.replace(/[&\/\\#,+()$~%.'":*?<>{}]/g, '');
  // color and borderRadius will be handled by the react-component and added as inner style
  // icon size, font size, font color and font style will be handled in the scss
  // all the letters will be capital letters.
  const mClassName = classNames('avatar', 'capitalize', className, size);
  return <UserAvatar className={mClassName} name={name} {...restProps } />;
}

Avatar.propTypes = {
  src: PropTypes.string,
  firstName: PropTypes.string.isRequired,
  lastName: PropTypes.string,
  color: PropTypes.string,
  borderRadius: PropTypes.string,
  colors: PropTypes.arrayOf(PropTypes.string),
  size: PropTypes.oneOf([SMALL, MEDIUM, LARGE]).isRequired,
  className: PropTypes.string,
};

Avatar.defaultProps = {
  size: MEDIUM,
};

export default Avatar;
