*** Settings ***
Resource          resources/common.resource
Suite Setup       Login To CRM
Suite Teardown    Close Browser

*** Test Cases ***
Create Deal
    Navigate To Sidebar Item    Deals
    Wait Until Location Is    ${BASE_URL}/deals    timeout=10s
    Sleep    2s
    Execute Javascript    document.evaluate("//button[contains(., 'New Deal')]", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue.click()
    Sleep    1s
    
    Input Text By Label    Title    Robot Test Deal
    Input Text By Label    Amount    5000
    Input Text By Label    Expected Close Date    2027-01-01
    
    Execute Javascript    document.evaluate("//button[contains(., 'Save')]", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue.click()
    Wait Until Page Contains    Robot Test Deal    timeout=10s

Edit Deal
    Sleep    2s
    Execute Javascript    document.evaluate("//*[contains(text(), 'Robot Test Deal')]/ancestor::div[contains(@class, 'p-4')]//span[text()='edit']", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue.click()
    Sleep    1s
    Input Text By Label    Title    Robot Test Deal - Edited
    Execute Javascript    document.evaluate("//button[contains(., 'Save')]", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue.click()
    Sleep    1s
    Wait Until Element Is Visible    xpath=//button[contains(., 'Save Changes')]    timeout=10s
    Execute Javascript    document.evaluate("//button[contains(., 'Save Changes')]", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue.click()
    Wait Until Page Contains    Robot Test Deal - Edited    timeout=10s

Delete Deal
    Sleep    2s
    Execute Javascript    document.evaluate("//*[contains(text(), 'Robot Test Deal - Edited')]/ancestor::div[contains(@class, 'p-4')]//span[text()='delete']", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue.click()
    Wait Until Element Is Visible    xpath=//button[contains(., 'Delete') or contains(., 'Yes') or contains(., 'Confirm')]    timeout=10s
    Execute Javascript    
    ...    var xpath = "//h3[contains(., 'Delete')]/../..//button[contains(., 'Delete') or contains(., 'Yes') or contains(., 'Confirm')]";
    ...    var btn = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
    ...    if (btn) btn.click();
    Wait Until Page Does Not Contain Element    xpath=//*[contains(text(), 'Robot Test Deal ${RND} - Edited')]    timeout=10s
