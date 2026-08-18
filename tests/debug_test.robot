*** Settings ***
Resource          resources/common.resource
Suite Setup       Login To CRM
Suite Teardown    Close Browser

*** Test Cases ***
Create Lead Test
    Navigate To Sidebar Item    Leads
    Wait Until Location Is    ${BASE_URL}/leads    timeout=10s
    Sleep    2s
    Execute Javascript    document.evaluate("//button[contains(., 'New Lead')]", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue.click()
    Sleep    1s
    
    # Fill inputs using native setter to bypass React hook
    Execute Javascript
    ...    function fillInput(labelText, value) {
    ...        var xpath = "//label[contains(., '" + labelText + "')]/following-sibling::*[self::input or self::textarea]";
    ...        var el = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
    ...        if (!el) {
    ...            xpath = "//label[contains(., '" + labelText + "')]/..//input";
    ...            el = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
    ...        }
    ...        if (el) {
    ...            var proto = el.tagName === 'TEXTAREA' ? window.HTMLTextAreaElement.prototype : window.HTMLInputElement.prototype;
    ...            var setter = Object.getOwnPropertyDescriptor(proto, 'value').set;
    ...            setter.call(el, value);
    ...            el.dispatchEvent(new Event('input', { bubbles: true }));
    ...            el.dispatchEvent(new Event('change', { bubbles: true }));
    ...        } else {
    ...            throw new Error("Could not find " + labelText);
    ...        }
    ...    }
    ...    fillInput('Lead Title', 'Robot Test Lead');
    ...    fillInput('Company', 'Robot Corp');
    ...    fillInput('Contact Person', 'Robot Contact');
    ...    fillInput('Email', 'robot@corp.com');
    ...    fillInput('Phone', '9999999999');
    ...    fillInput('Message/Notes', 'Test notes');
    
    Sleep    2s
    Capture Page Screenshot
