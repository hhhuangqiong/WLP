General Application Structure
------------------------------

```
# Draft

app
|-- client                # client-side (framework) scripts
|-- config                # configuration to be shared between client/server
|-- lib                   # all our 'modules' to be placed here; not depends on server(express)
|   |-- mailer
|   |-- portal
|   `-- repo
`-- server                # server(express)-specific logic
    |-- api               # same as 'controllers'; usually without view rendering
    |-- controllers
    |-- initializers
    |-- middlewares
    `-- routes
```

