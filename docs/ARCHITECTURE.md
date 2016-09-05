# Introduction

White Label Portal is to provide an integrated management portal for White-Label (WL) customers, WL reseller, Maaii teams (including Maaii marketing, CS, and engineering teams), and M800 administration team. It provides the information and statistic on IM, SMS, Top up, verification, calls..etc.

# Architecture

{% plantuml %}
@startuml

node "White Label Portal" {
  [Company Management] as WLP_COMPANY_MGMT
  [User Management] as WLP_USER_MGMT
  [Statistic] as WLP_STAT
}

node "Identity Access Management(IAM)" {
  interface "REST API" as IAM_REST
  [Company identity] - IAM_REST
  IAM_REST - [User identity]
  IAM_REST -d- [Role access]
  [OPEN_ID]
}

node "Maaii Provisioning Service (MPS)" {
  interface "REST API" as MPS_REST
  [Provisioning] - MPS_REST
  MPS_REST - [Preset]
}

node "Maaii MUMS" {
  interface "REST API" as MUMS_REST
}

node "Maaii MVS" {
  interface "REST API" as MVS_REST
}

node "Maaii BOSS" {
  interface "REST API" as BOSS_REST
}

[WLP_COMPANY_MGMT] --> MPS_REST
[WLP_COMPANY_MGMT] --> IAM_REST
[WLP_USER_MGMT] --> IAM_REST
[WLP_USER_MGMT] --> [OPEN_ID] : authenticate flow(login, logout)
[WLP_STAT] --> MUMS_REST
[WLP_STAT] --> MVS_REST
[WLP_STAT] --> BOSS_REST

@enduml

{% endplantuml %}

The architecture diagram above demonstrates the connected components from White Label Portal perspective.

## WHITE LABEL PORTAL

### User Management

Module that manage the portal user(irrelevant to the End-User in white label). It manages how user interact with the White Label Portal. Now it is integrated with the IAM. It will follow the IAM flow to login the white label portal.

### Company Management

Module that manage the company, it connects with MPS to provision the company and IAM to store the company identity.

### Statistic

It connects with other REST API from different services to obtain the statistic information according to the company and carrier.

## Identity Access Management

A NodeJs application that include three parts

- (Identity) REST API for managing Identities including Portal User and Companies. WLP will request for the user and company information.

- (Access) REST API for managing Permissions per combination of Company and Web Service(e.g. wlp/lc). WLP will communicate with access permission information to protect the API resources. Also WLP will provide interface to manage the user and permission.

- (OPENID) It provides authentication and UI for Single Sign On(SSO). WLP will make use of IAM Open ID as SSO. It will login/logout via the IAM. It will request for the access token and the protect the resource.

For details, see [IAM documentation](http://deploy.dev.maaii.com:9080)

## Maaii Provisioning Service(MPS)
Maaii Provisioning Service(MPS) is a service that enables automation of service provisioning offered by
Maaii/M800. The main objective of the MPS is to replace the traditional manual service provisioning
through done through CSR forms.

White Label Portal will make use of MPS service to manage the company provision

For details, see [MPS documentation](http://deploy.dev.maaii.com:9080)

## Maaii BOSS

Service of BOSS that provides a REST API for top up and wallet information.

## Maaii MUMS

Service of MUMS that provides a REST API for end user information.

## Maaii MVS

Service of MUMS that provides a REST API for VSF information.
