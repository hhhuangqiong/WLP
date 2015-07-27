# White label portal Access Control

## Dependencies

- mongodb
- redis
- [node_acl](https://github.com/OptimalBits/node_acl)

## Concept

This is a Role Base access control module. All resource privileges are assigned to Role(s), and Role(s) are
assigned to User(s). To check if a Resource is accessible to an User, it will check if an User is with Role(s)
that has sufficient privilege to perform an Action towards the Resource.

this ACL separates the permission checking into two parts, which are by

- carrier group (domain)
- resources and actions

### Major Components

#### UserId

`UserId` comes from the `username` field of PortalUser collection in database

#### CarrierId

`CarrierId` comes from the `carrierId` field of Company collection in database

#### Resource

`Resource` comes from `req.url` and predefined in `config.js`

#### Action

`Action` comes from `req.method` including `GET`, `POST`, `PUT`, `delete`


### Root User

user with role of `root` will skip all permission checking so you do not have to manage changes in resource

### Carrier Group

Carrier is defined as both role and resource. It is always 1-to-1 bound with `carrierId`.

- there is no actions defined for `resource of carrier`, and will use '*' for action parameter
- user assigned to `role of carrier` will be allowed to access that particular carrier

#### When to use:

- right after created/delete a company, you should create/delete a carrier group with its carrierId
- right after created/delete an user under that company, you should assign/remove its carrier group to/from the user
- for m800 or reseller, right after assigning/removing a company to an user, you should assign/remove the corresonding carrier group to/from the user

#### Values:

values come from the `carrierId` field of Company collection in database

- maaii.com
- botler.maaii.com
- (any kind of carrier id)


#### Related Methods:

```
AclManager.isValidCarrier(carrierId, cb)
AclManager.addCarrierGroup(carrierId, cb)
AclManager.removeCarrierGroup(carrierId, cb)
AclManager.addUserCarrier(userId, carrierId, cb)
AclManager.removeUserCarrier(userId, carrierId, cb)
AclManager.isAllowedForCarrier(userId, carrierId, cb)
```

### User Role

Role is the basic unit that contains a set of pre-defined permissions. Users with role(s) assigned
will share the privileges from the role.

#### Values:

values consist of `prefix` and `role`. `Prefix` comes from the Company Schema, where `role` is the pre-defined by user
requirement.

- m800.admin
- reseller.engineering
- wl.marketing
- sdk.marketing
- {prefix}.{role}

#### Related Methods:
```
AclManager.isAllowedForResource(userId, resource, action, cb)
```

### Express Middleware

it is the suggested permission checking flow

#### Flow

- check if the given carrierId is valid (by carrierQuerierService), if not valid, go to 404 page
- check if the given userId is Root-user, if yes, skip permission checking
- check if the given userId has sufficient privilege to access the carrier, if not, go to 401 page
- check if the given userId has sufficient privilege to perform the action to the given resource, if not,

#### AclManager.middleware(userId, carrierId, resource, action)

An universal express middleware used to protect the resource, assuming all arguments could be extracted from
the `req` object, e.g. `req.url`, `req.sessionId` and `req.method`. As it aims for universal usage, it allows
you to pass function as argument, enabling you to define your own logic to extract the needed arguments like this:

```
function getUserId(req) {
  return req.sessionId; // return the session id
}
```

```
function getCarrierId(req) {
  return req.url.split('/')[2]; // return the second param of the url
}
```

```
function getResource(req) {
  return req.url.split('/')[3]; // return the third param of the url
}
```

```
AclManager.middleware(getUserId, getCarrierId, getResource, 'get');
```

or you can manually pass String as arguments like this:

```
AclManager.middleware('role@carrierId.com', 'carrierId.com', 'myResource', 'get')
```

##### Arguments

```
userId {String|Function} user id
carrierId {String|Function} carrier id
resource {String|Function} resource
action {String} action
```

## References

- [WL Portal Requirements](https://issuetracking.maaii.com:9443/display/MAAIIPR/WL+Portal+Requirements)
