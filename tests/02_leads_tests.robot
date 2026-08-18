*** Settings ***
Resource          resources/common.resource
Suite Setup       Login To CRM
Suite Teardown    Close Browser

*** Test Cases ***
Create Lead
    Navigate To Sidebar Item    Leads
    Wait Until Location Is    ${BASE_URL}/leads    timeout=10s
    Sleep    2s
    Execute Javascript    document.evaluate("//button[contains(., 'New Lead')]", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue.click()
    Sleep    1s
    
    Input Text By Label    Lead Title    Robot Test Lead ${RND}
    Select From Custom Dropdown By Label    Source    Website
    Input Text By Label    Company    Robot Corp ${RND}
    Input Text By Label    Contact Person    Robot Contact ${RND}
    Input Text By Label    Email    robot.${RND}@corp.com
    Input Text By Label    Phone    999${RND}999
    Input Text By Label    Message/Notes    Test notes
    
    Click Checkbox    DPDP Consent
    Execute Javascript    document.evaluate("//button[contains(., 'Save')]", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue.click()
    Wait Until Page Contains    Robot Test Lead ${RND}    timeout=10s

Edit Lead
    Sleep    2s
    Execute Javascript    document.evaluate("//h4[contains(., 'Robot Test Lead ${RND}')]/../../..//span[text()='edit']", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue.click()
    Sleep    1s
    Input Text By Label    Lead Title    Robot Test Lead ${RND} - Edited
    # Save changes
    Execute Javascript    document.evaluate("//button[contains(., 'Save')]", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue.click()
    Sleep    1s
    
    # Click confirmation modal
    Wait Until Element Is Visible    xpath=//button[contains(., 'Save Changes')]    timeout=10s
    Execute Javascript    document.evaluate("//button[contains(., 'Save Changes')]", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue.click()
    
    # Verify update
    Wait Until Page Contains    Robot Test Lead ${RND} - Edited    timeout=10s

Delete Lead
    Sleep    2s
    Execute Javascript    document.evaluate("//h4[contains(., 'Robot Test Lead ${RND} - Edited')]/../../..//span[text()='delete']", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue.click()
    Wait Until Element Is Visible    xpath=//button[contains(., 'Delete') or contains(., 'Yes') or contains(., 'Confirm')]    timeout=10s
    Execute Javascript    
    ...    var xpath = "//h3[contains(., 'Delete')]/../..//button[contains(., 'Delete') or contains(., 'Yes') or contains(., 'Confirm')]";
    ...    var btn = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
    ...    if (btn) btn.click();
    Sleep    2s
    Reload Page
    Wait Until Page Does Not Contain Element    xpath=//h4[contains(., 'Robot Test Lead ${RND} - Edited')]    timeout=10s
