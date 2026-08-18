*** Settings ***
Resource          resources/common.resource
Test Teardown     Close Browser

*** Test Cases ***
Valid User Can Log In
    Login To CRM
    Log    Successfully logged in to CRM dashboard.
