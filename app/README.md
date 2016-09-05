General Application Structure
------------------------------

```
# Draft

app
|-- actions               # Fluxible actions
|-- components            # React components
|-- config                # configuration to be shared between client/server
|-- data                  # seed data and form data
|-- lib                   # all our 'modules' to be placed here; not depends on server(express)
|   |-- portal
|   `-- repo
|-- server                # server(express)-specific logic
|   |-- api               # same as 'controllers'; usually without view rendering
|    |-- controllers
|   |-- initializers
|    |-- middlewares
|    `-- routes
`-- stores                # Fluxible stores
```
