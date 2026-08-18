*** Settings ***
Library           SeleniumLibrary    timeout=10s
Library           String
Library           Collections

*** Variables ***
${BASE_URL}       http://localhost:5173
${TEST_USER}      kabhay@gmail.com
${TEST_PASS}      123456

*** Keywords ***
Login To CRM
    ${RND}=    Generate Random String    4    [NUMBERS]
    Set Global Variable    ${RND}
    
    Open Browser    ${BASE_URL}/login    chrome    options=add_argument("--window-size=1920,1080");add_argument("--disable-search-engine-choice-screen")
    Wait Until Page Contains Element    xpath=//input[@type='email']    timeout=10s
    Input Text    xpath=//input[@type='email']    ${TEST_USER}
    Input Password    xpath=//input[@type='password']    ${TEST_PASS}
    Click Button    xpath=//button[@type='submit']
    Wait Until Location Is    ${BASE_URL}/    timeout=10s
    Wait Until Page Contains Element    xpath=//nav    timeout=10s

Navigate To Sidebar Item
    [Arguments]    ${item_name}
    Wait Until Page Contains Element    xpath=//a[contains(., '${item_name}')]    timeout=10s
    Execute Javascript    
    ...    var xpath = "//a[contains(., '${item_name}')]";
    ...    var el = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
    ...    if (el) {
    ...        el.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true, view: window }));
    ...        el.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, cancelable: true, view: window }));
    ...        el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
    ...    }

Click Button By Text
    [Arguments]    ${button_text}
    Wait Until Page Contains Element    xpath=//button[contains(., '${button_text}')]    timeout=10s
    Execute Javascript    
    ...    var xpath = "//button[contains(., '${button_text}')]";
    ...    var el = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
    ...    if (el) {
    ...        el.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true, view: window }));
    ...        el.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, cancelable: true, view: window }));
    ...        el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
    ...    }

Input Text By Label
    [Arguments]    ${label_text}    ${value}
    Wait Until Page Contains Element    xpath=//label[contains(., '${label_text}')]    timeout=10s
    Execute Javascript    
    ...    var xpath = "//label[contains(., '${label_text}')]/following-sibling::*[self::input or self::textarea]";
    ...    var el = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
    ...    if (!el) {
    ...        xpath = "//label[contains(., '${label_text}')]/..//input";
    ...        el = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
    ...    }
    ...    if (el) {
    ...        var proto = el.tagName === 'TEXTAREA' ? window.HTMLTextAreaElement.prototype : window.HTMLInputElement.prototype;
    ...        var setter = Object.getOwnPropertyDescriptor(proto, 'value').set;
    ...        setter.call(el, '${value}');
    ...        el.dispatchEvent(new Event('input', { bubbles: true }));
    ...        el.dispatchEvent(new Event('change', { bubbles: true }));
    ...    } else {
    ...        throw new Error("Could not find input for label: ${label_text}");
    ...    }

Select From Custom Dropdown By Label
    [Arguments]    ${label_text}    ${option_text}
    Wait Until Page Contains Element    xpath=//label[contains(., '${label_text}')]    timeout=10s
    # Focus the button and simulate full click
    Execute Javascript    
    ...    var xpath = "//label[contains(., '${label_text}')]/following-sibling::*//button";
    ...    var el = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
    ...    if (el) {
    ...        el.click();
    ...    } else throw new Error("Dropdown button not found for label: ${label_text}");
    Sleep    1s
    
    # Check if input search exists
    ${search_exists} =    Execute Javascript    return !!document.querySelector("input[placeholder='Search...']");
    Run Keyword If    ${search_exists}    Execute Javascript
    ...    var input = document.querySelector("input[placeholder='Search...']");
    ...    var setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
    ...    setter.call(input, '${option_text}');
    ...    input.dispatchEvent(new Event('input', { bubbles: true }));
    ...    input.dispatchEvent(new Event('change', { bubbles: true }));
    
    Run Keyword If    ${search_exists}    Sleep    2s
    
    # Click the option
    Wait Until Page Contains Element    xpath=//button[not(contains(@class, 'crm-select')) and (contains(., '${option_text}') or contains(., 'Create'))]    timeout=10s
    Execute Javascript
    ...    var xpath = "//button[not(contains(@class, 'crm-select')) and (contains(., '${option_text}') or contains(., 'Create'))]";
    ...    var el = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
    ...    if (el) {
    ...        el.click();
    ...    } else throw new Error("Option not found: ${option_text}");
    Sleep    0.5s

Click Checkbox
    [Arguments]    ${label_text}
    Wait Until Page Contains Element    xpath=//span[contains(text(), '${label_text}')]    timeout=10s
    Execute Javascript    
    ...    var xpath = "//span[contains(text(), '${label_text}')]/../preceding-sibling::input";
    ...    var el = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
    ...    if (el) {
    ...        if (!el.checked) {
    ...            el.click();
    ...        }
    ...    } else {
    ...        throw new Error("Checkbox not found for label: ${label_text}");
    ...    }
