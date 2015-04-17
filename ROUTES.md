# URLs & APIs

Notes:

  - This is the draft of the proposed URLs within the app. Anything below is subjected to __change__.
  - `host` & `post` are omitted fro the sake of brevity.

Pre-login
---------

```
GET  /signin # sign in form
POST /signin # where sign in form submitted

# forgot password
GET  /password/recover
POST /password/recover

# reset password
# access by clicking the generated link in "forgot password" email
#
# Query string:
# 1. token
GET  /password/reset

POST /password/reset

# static page
GET /account/locked

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

