import React, { PropTypes, Component } from 'react';

class EmptyRow extends Component {
  static propTypes = {
    colSpan: PropTypes.number.isRequired,
  };

  static defaultProps = {
    colSpan: 1
  };

  render() {
    const { colSpan } = this.props;

    return (
      <tr className="empty">
        <td colSpan={colSpan}>
          <div className="text-center">
            <span>No record found</span>
          </div>
        </td>
      </tr>
    );
  }
}

export default EmptyRow;
