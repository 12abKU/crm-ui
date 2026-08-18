*** Settings ***
Resource          resources/common.resource
Suite Setup       Login To CRM
Suite Teardown    Close Browser

*** Test Cases ***
Verify Dashboard
    # Login To CRM already leaves us on the dashboard
    Wait Until Location Is    ${BASE_URL}/    timeout=10s
    Page Should Contain    Dashboard
