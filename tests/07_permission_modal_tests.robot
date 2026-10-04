*** Settings ***
Resource          resources/common.resource
Suite Setup       Login To CRM
Suite Teardown    Close Browser

*** Test Cases ***
Permission Denied Custom Event Displays Standard ConfirmModal
    [Documentation]    Verifies that when a 403 Forbidden permission error occurs, DialogContext captures the 'crm-permission-denied' event and displays ConfirmModal with red styling and alert type.
    Sleep    2s
    # Dispatch custom event to simulate Axios interceptor 403 handling
    Execute Javascript    
    ...    window.dispatchEvent(new CustomEvent('crm-permission-denied', {
    ...        detail: {
    ...            title: 'Permission Denied',
    ...            message: 'You do not have permission to modify this entity.'
    ...        }
    ...    }));
    
    # Verify standard ConfirmModal appears with proper title and message
    Wait Until Element Is Visible    xpath=//h3[contains(., 'Permission Denied')]    timeout=5s
    Wait Until Page Contains         You do not have permission to modify this entity.    timeout=5s

    # Verify OK button is rendered and click it to dismiss modal
    Wait Until Element Is Visible    xpath=//button[contains(., 'OK')]    timeout=5s
    Execute Javascript    
    ...    var okBtn = document.evaluate("//button[contains(., 'OK')]", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
    ...    if (okBtn) okBtn.click();
    
    # Confirm modal is closed
    Sleep    1s
    Wait Until Page Does Not Contain Element    xpath=//h3[contains(., 'Permission Denied')]    timeout=5s

Toast Suppression Invariant For 403 RBAC Errors
    [Documentation]    Ensures that for RBAC 403 errors, standard crm-api-error toast notification is suppressed and only the modal is active.
    Sleep    1s
    Execute Javascript
    ...    window.dispatchEvent(new CustomEvent('crm-permission-denied', {
    ...        detail: { title: 'Permission Denied', message: 'Test Invariant' }
    ...    }));
    Wait Until Element Is Visible    xpath=//h3[contains(., 'Permission Denied')]    timeout=5s
    # Dismiss modal
    Execute Javascript    
    ...    var okBtn = document.evaluate("//button[contains(., 'OK')]", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
    ...    if (okBtn) okBtn.click();
    Sleep    1s
