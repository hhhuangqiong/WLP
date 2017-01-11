import React, { PropTypes } from 'react';
import Dropzone from 'react-dropzone';
import { injectIntl, intlShape, FormattedMessage } from 'react-intl';
import classNames from 'classnames';
/**
 * A ImageUpload component which be used to upload file
 *
 * @class ImageUpload
 * @example
 * <ImageUpload
 *   onImageSelected={onLogoUpload}
 *   imageSrc={logoSrc}
 *   onImageDeleted={onLogoDeleted}
 * />
 */

class ImageUpload extends React.Component {
  static defaultProps = {
    imageSrc: null,
    disabled: false,
  };
  static propTypes = {
    intl: intlShape.isRequired,
    /**
     * The function gets called if a file was uploaded.
     * @type {func}
    */
    onImageSelected: PropTypes.func.isRequired,
    /**
     * The function gets called if a file was deleted.
     * @type {func}
    */
    onImageDeleted: PropTypes.func.isRequired,
    /**
     * The current file src.
     * @type {string}
    */
    imageSrc: PropTypes.string,
    /**
     * Define the minSize of uploaded file.
     * @type {number}
    */
    minSize: PropTypes.number,
    /**
     * Define the maxSize of uploaded file.
     * @type {number}
    */
    maxSize: PropTypes.number,
    /**
     * disable upload file.
     * @type {number}
    */
    disabled: PropTypes.bool,
  };

  constructor(props) {
    super(props);
    this.state = {
      isActive: false,
      isDrop: false,
    };
  }

  onDragEnter = (e) => {
    e.preventDefault();
    if (!this.props.disabled) {
      this.setState({
        isActive: true,
      });
    }
  }

  onDragLeave = (e) => {
    e.preventDefault();
    this.setState({
      isActive: false,
    });
  }

  onDrop = (files) => {
    if (!this.props.disabled) {
      this.props.onImageSelected(files[0]);
      this.setState({
        isActive: false,
        isDrop: true,
      });
    }
  }
  openDrop = () => {
    this.dropzone.open();
  }

  render = () => {
    const { onImageDeleted, imageSrc, minSize, maxSize, disabled } = this.props;
    return (
      <div className="image-upload">
        {
          imageSrc && !disabled ?
          <div className="image-upload__container">
            <span className="image-upload__edit" onClick={this.openDrop}>
              <FormattedMessage
                id="edit"
                defaultMessage="Edit"
              />
            </span>
            <span className="image-upload__edit" onClick={onImageDeleted}>
              <FormattedMessage
                id="delete"
                defaultMessage="Delete"
              />
            </span>
          </div> : null
        }
        <Dropzone
          ref={(node) => { this.dropzone = node; }}
          onDrop={this.onDrop}
          multiple={false}
          minSize={minSize}
          maxSize={maxSize}
          accept={"image/*"}
          onDragEnter={this.onDragEnter}
          onDragLeave={this.onDragLeave}
          disableClick={disabled}
          className={classNames(
            'image-upload__drop-zone',
            { 'image-upload__drop-zone--active': this.state.isActive },
            { 'image-upload__drop-zone--drop': this.state.isDrop && imageSrc },
            { 'image-upload__drop-zone--disabled': disabled },
          )}
        >
        {
          !imageSrc ?
          <div>
              <FormattedMessage
                id="uploadImage"
                defaultMessage="Upload Image"
              />
          </div> : null
        }
        {
          imageSrc ?
          <div> <img className="image-upload__img" src={imageSrc} /></div> : null
        }
      </Dropzone>
      </div>
    );
  }
}
export default injectIntl(ImageUpload);
