import { assign, isEmpty, omit } from 'lodash';
import React, { PropTypes, Component } from 'react';
import { browserHistory } from 'react-router';
import { injectIntl, intlShape } from 'react-intl';
import { connectToStores } from 'fluxible-addons-react';
import WhiteList from '../../components/Whitelist/List';
import whiteListStore from '../../stores/Whitelist';
import { clearWhitelist, fetchWhitelist } from '../../actions/whitelist';
import * as FilterBar from '../../../../main/components/FilterBar';
import FilterBarNavigation from '../../../../main/filter-bar/components/FilterBarNavigation';
import SearchBox, { SUBMIT_KEY } from '../../../../main/components/Searchbox';
import i18nMessages from '../../../../main/constants/i18nMessages';

class WhiteListContainer extends Component {
  constructor(props) {
    super(props);

    this.handlePageRecChange = this.handlePageRecChange.bind(this);
    this.handlePageChange = this.handlePageChange.bind(this);
    this.handleQueryChange = this.handleQueryChange.bind(this);
    this.handleSearchSubmit = this.handleSearchSubmit.bind(this);
  }

  componentDidMount() {
    this.fetchData();
  }

  componentDidUpdate(prevProps) {
    const { search: prevSearch } = prevProps.location;
    const { search: currentSearch } = this.props.location;

    if (prevSearch !== currentSearch) {
      this.fetchData();
    }
  }

  componentWillUnmount() {
    this.context.executeAction(clearWhitelist);
  }

  fetchData() {
    const { identity } = this.context.params;
    let { query } = this.context.location;
    const { pageRec } = this.props;

    // TODO: redefine the correct query based on page and pageRec
    // e.g. on Page 1, from = 0, to = (pageRec - 1)
    // e.g. on Page 2, from = pageRec, to = from + (pageRec - 1)
    if (isEmpty(query)) {
      query = {
        from: 0,
        to: pageRec,
        pageRec,
      };
    }

    this.context.executeAction(fetchWhitelist, {
      carrierId: identity,
      query,
    });
  }

  handleSearchSubmit(e) {
    if (e.which !== SUBMIT_KEY) {
      return;
    }

    const value = e.target.value;
    const changes = { username: value && value.trim(), page: 1 };
    this.handleQueryChange(changes);
  }

  handlePageChange(page) {
    if (!page) {
      return;
    }

    this.handleQueryChange({ current: page });
  }

  handlePageRecChange(pageRec) {
    if (!pageRec) {
      return;
    }

    this.handleQueryChange({ pageRec });
  }

  handleQueryChange(changes) {
    const { pathname, query } = this.context.location;
    const newQuery = omit(assign(query, changes), v => !v);

    browserHistory.push({
      pathname,
      query: newQuery,
    });
  }

  render() {
    const { query } = this.context.location;
    const { formatMessage } = this.props.intl;
    const { username: searchValue } = query;
    const { pageRec } = query || this.props;

    return (
      <div className="row">
        <FilterBar.Wrapper>
          <FilterBarNavigation section="end-user" tab="whitelist" />
          <FilterBar.RightItems>
            <SearchBox
              value={searchValue}
              placeHolder={formatMessage(i18nMessages.mobile)}
              onKeyPressHandler={this.handleSearchSubmit}
              />
          </FilterBar.RightItems>
        </FilterBar.Wrapper>
        <WhiteList
          {...this.props}
          pageRec={pageRec}
          searchValue={searchValue}
          handlePageRecChange={this.handlePageRecChange}
          handlePageChange={this.handlePageChange}
          handleSearchInputChange={this.handleSearchInputChange}
          handleSearchSubmit={this.handleSearchSubmit}
          />
      </div>
    );
  }
}

WhiteListContainer.contextTypes = {
  executeAction: PropTypes.func,
  params: PropTypes.object,
  location: PropTypes.object,
};

WhiteListContainer.propTypes = {
  location: PropTypes.shape({
    search: PropTypes.string,
  }),
  intl: intlShape.isRequired,
  isLoading: PropTypes.bool,
  search: PropTypes.string,
  pageRec: PropTypes.number.isRequired,
};

WhiteListContainer.defaultProps = {
  pageRec: 10,
};

export default connectToStores(
  injectIntl(WhiteListContainer),
  [whiteListStore],
  context => context.getStore(whiteListStore).getState()
);
