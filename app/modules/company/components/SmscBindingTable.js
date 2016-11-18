import React, { PropTypes } from 'react';
import classNames from 'classnames';

import Icon from '../../../main/components/Icon';

const SmscBindingTablePropTypes = {
  bindings: PropTypes.arrayOf(PropTypes.shape({
    ip: PropTypes.string,
    port: PropTypes.string,
  })).isRequired,
  handleDeleteBinding: PropTypes.func,
  handleOpenBindingDialog: PropTypes.func,
  disabled: PropTypes.bool,
};

const SmscBindingTable = (props) => {
  const {
    bindings,
    handleDeleteBinding,
    handleOpenBindingDialog,
    disabled,
  } = props;
  return (
    <div className={classNames('smsc-bindings-table', { disabled })}>
      {
        bindings.map((item, index) =>
          <div key={index} className="smsc-binding-item">
            <div className="deleteIcon small-2 columns"
              onClick={() => handleDeleteBinding(index)}
            >
              <Icon symbol="icon-minus-circle" />
            </div>
            <div className="small-22 columns"
              onClick={() => handleOpenBindingDialog(index)}
            >
              <div className="small-12 columns">{item.ip}</div>
              <div className="small-12 columns">{item.port}</div>
            </div>
          </div>
        )
      }
    </div>
  );
};

SmscBindingTable.propTypes = SmscBindingTablePropTypes;
export default SmscBindingTable;
