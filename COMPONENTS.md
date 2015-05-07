graph TD;
  Html-->App;
  App-->PublicHtml;
  App-->AuthenticatedHtml;
  PublicHtml-->PublicHeader;
  PublicHtml-->CenteredPanel;
  CenteredPanel-->SignIn;
  CenteredPanel-->ForgetPass;
  AuthenticatedHtml-->MenuSidebar;
  AuthenticatedHtml-->ContentFrame;
  ContentFrame-->AppHeader;
  ContentFrame-->ActionBar;
  ContentFrame-->Contents;
  ContentFrame-->SubNavigation;
  AppHeader-->Navigation;
  Navigation-->CompanySwitcher;
  SubNavigation-->UserList;
  UserList-->Searchbar;
  UserList-->UserListItem;
  Contents-->SectionComponents;







