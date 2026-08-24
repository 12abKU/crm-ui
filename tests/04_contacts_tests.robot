*** Settings ***
Resource          resources/common.resource
Suite Setup       Login To CRM
Suite Teardown    Close Browser

*** Test Cases ***
Create Pre-requisite Account
    Navigate To Sidebar Item    Accounts
    Wait Until Location Is    ${BASE_URL}/accounts    timeout=10s
    Sleep    2s
    Execute Javascript    document.evaluate("//button[contains(., 'Add Account')]", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue.click()
    Sleep    1s
    
    Input Text By Label    Company Name    Robot Corp ${RND}
    Input Text By Label    Website    robot${RND}.com
    Input Text By Label    Phone    111222${RND}
    Input Text By Label    Industry    Technology
    
    Select From Custom Dropdown By Label    Employee Range    51-200
    Select From Custom Dropdown By Label    Tag    Enterprise
    
    Execute Javascript    document.evaluate("//button[contains(., 'Save')]", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue.click()
    Sleep    2s

Create Contact
    Navigate To Sidebar Item    Contacts
    Wait Until Location Is    ${BASE_URL}/contacts    timeout=10s
    Sleep    2s
    Execute Javascript    document.evaluate("//button[contains(., 'Add Contact')]", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue.click()
    Sleep    1s
    
    Input Text By Label    First Name    Robot Contact
    Input Text By Label    Last Name    ${RND}
    Input Text By Label    Email    robot.contact.${RND}@test.com
    Input Text By Label    Phone    999${RND}999
    Input Text By Label    Designation    Tester
    Select From Custom Dropdown By Label    Account    Robot Corp ${RND}
    

    Execute Javascript    document.evaluate("//button[contains(., 'Save')]", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue.click()
    Wait Until Page Contains    Robot Contact ${RND}    timeout=10s

Edit Contact
    Sleep    2s
    Wait Until Page Contains Element    xpath=//tr[contains(., 'Robot Contact ${RND}')]//button[contains(., 'Edit')]    timeout=10s
    Execute Javascript    document.evaluate("(//tr[contains(., 'Robot Contact ${RND}')]//button[contains(., 'Edit')])[1]", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue.click()
    Sleep    1s
    
    Input Text By Label    First Name    Robot Contact Edited
    Input Text By Label    Email    robot.contact.edited.${RND}@test.com
    Execute Javascript    document.evaluate("//button[contains(., 'Save')]", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue.click()
    Sleep    2s
    Wait Until Page Contains    Robot Contact Edited    timeout=10s

Delete Contact
    Sleep    2s
    Wait Until Page Contains Element    xpath=//tr[contains(., 'Robot Contact Edited ${RND}')]//button[contains(., 'Delete')]    timeout=10s
    Execute Javascript    document.evaluate("(//tr[contains(., 'Robot Contact Edited ${RND}')]//button[contains(., 'Delete')])[1]", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue.click()
    Wait Until Element Is Visible    xpath=//button[contains(., 'Delete') or contains(., 'Yes') or contains(., 'Confirm')]    timeout=10s
    Execute Javascript    
    ...    var xpath = "//h3[contains(., 'Delete')]/../..//button[contains(., 'Delete') or contains(., 'Yes') or contains(., 'Confirm')]";
    ...    var btn = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
    ...    if (btn) btn.click();
    Sleep    2s
    Reload Page
    Wait Until Page Does Not Contain Element    xpath=//tr[contains(., 'Robot Contact ${RND} Edited')]    timeout=10s
