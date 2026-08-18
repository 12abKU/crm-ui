*** Settings ***
Resource          resources/common.resource
Suite Setup       Login To CRM
Suite Teardown    Close Browser

*** Test Cases ***
Create Account
    Navigate To Sidebar Item    Accounts
    Wait Until Location Is    ${BASE_URL}/accounts    timeout=10s
    Sleep    2s
    Execute Javascript    document.evaluate("//button[contains(., 'Add Account')]", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue.click()
    Sleep    1s
    
    Input Text By Label    Company Name    Robot Account ${RND}
    Input Text By Label    Website    robot${RND}.com
    Input Text By Label    Phone    999${RND}999
    Input Text By Label    Industry    Technology
    
    Select From Custom Dropdown By Label    Employee Range    51-200
    Select From Custom Dropdown By Label    Tag    Enterprise
    
    Execute Javascript    document.evaluate("//button[contains(., 'Save')]", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue.click()
    Wait Until Page Contains    Robot Account ${RND}    timeout=10s

Edit Account
    Sleep    2s
    Wait Until Page Contains Element    xpath=//tr[contains(., 'Robot Account ${RND}')]//button[contains(., 'Edit')]    timeout=10s
    Execute Javascript    document.evaluate("(//tr[contains(., 'Robot Account ${RND}')]//button[contains(., 'Edit')])[1]", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue.click()
    Sleep    1s
    
    Input Text By Label    Company Name    Robot Account ${RND} Edited
    Input Text By Label    Website    robot${RND}edit.com
    Input Text By Label    Phone    999${RND}998
    Execute Javascript    document.evaluate("//button[contains(., 'Save')]", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue.click()
    Sleep    2s
    Wait Until Page Contains    Robot Account ${RND} Edited    timeout=10s

Delete Account
    Sleep    2s
    Wait Until Page Contains Element    xpath=//tr[contains(., 'Robot Account ${RND} Edited')]//button[contains(., 'Delete')]    timeout=10s
    Execute Javascript    document.evaluate("(//tr[contains(., 'Robot Account ${RND} Edited')]//button[contains(., 'Delete')])[1]", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue.click()
    Wait Until Element Is Visible    xpath=//button[contains(., 'Delete') or contains(., 'Yes') or contains(., 'Confirm')]    timeout=10s
    Execute Javascript    
    ...    var xpath = "//h3[contains(., 'Delete')]/../..//button[contains(., 'Delete') or contains(., 'Yes') or contains(., 'Confirm')]";
    ...    var btn = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
    ...    if (btn) btn.click();
    Sleep    2s
    Reload Page
    Wait Until Page Does Not Contain Element    xpath=//tr[contains(., 'Robot Account ${RND} Edited')]    timeout=10s
