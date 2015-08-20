# URLs & APIs

Notes:

  - This is the draft of the proposed URLs within the app. Anything below is subjected to __change__.
  - The `host` & `post` are omitted for the sake of brevity.
  - The endpoint
    - can return a response without view.
    - will be used in:
      - API call to backend (Express) server
      - <form> actions
    - 'identifier' below could means 'carrier id', 'white lable user id'

Pre-login
---------

```
GET  /sign-in # sign in form
POST /signin # not used yet; where sign in form submitted

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
```

Post-login
------------

```
/admin        # super user, i.e., M800 admin
  # overview, default page
  /
  /companies
    /{company-identifier}
      # for partial update (e.g., logo only); TBC
      /logo
      # similar to '/r/{reseller-identifier}/settings' below
      /settings
        /service
        /widget
    /query
  /accounts
  /settings


# reseller
#
# view as white label user
# has same default page as the '/admin', though with less privileges
/r/{reseller-identifier}
  /               # overview page
  /settings
  /password       # edit/update password

/w/{white-label-identifier}
  # overview page
  /
  /logout

  # list of accounts (e.g., administrator, marketing) managed by this reseller
  /accounts
    # query the list of adminstrator, technical, marketer, ...
    /groups

    # Account detail page
    #
    # NB:
    # - no edit/update password for individual user in group
    #
    # - GET (read), POST (create and/or update)
    # - PUT & Delete (TBC):
    #   [method-override] (https://github.com/expressjs/method-override)
    /{account-identifier}

    # account detail - edit view, e.g., form
    /{account-identifier}/edit

  # end users under this a/c
  # + pagination support via query string
  /end-users
    # Information belong to this user: wallet, account, app
    /{end-user-identifier}

  /whitelist
    /upload

  /calls          # calls index page
    /             # overview
    /details      # details report
      /query      # filtering, parameter(s) could be passed via query string

  /im             # IM index page (stats)
    /
    /details
      /query

  /account        # account management page

  /vsf            # virtual store front
    /
    /details
      /query

  /top-up         # top-up history page
    /query

  /settings       # general setting page
    /profile
      /logo       # for partial update (e.g., ajax upload); TBC

    /service      # service config; should include other information, like feature list
    /widget       # widget config

```
