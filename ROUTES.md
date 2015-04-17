# URLs & APIs

Notes:

  - This is the draft of the proposed URLs within the app. Anything below is subjected to __change__.
  - `host` & `post` are omitted fro the sake of brevity.

Pre-login
---------

```
GET /signin               # login froms
GET /account/locked

```

Post-login
------------

```
/admin        # super user, e.g., M800 admin
  /companies
  /accounts
  /settings

# identifier could be 'carrierId'
/w/{white-label-identifier}
  /               # overview page
  /accounts       # list of accounts managed by this a/c
  /end-users      # end users under this a/c
  /calls          # calls index page
  /im             # IM index page (stats)
  /vsf            # virtual store front
  /top-up         # top-up history page
  /settings       # general setting page

/r/{reseller-identifier}
  # TBC

```

