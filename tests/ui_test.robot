*** Settings ***
Library    SeleniumLibrary

*** Variables ***
${URL}       http://localhost:5173
${BROWSER}   Chrome

*** Test Cases ***
Verify App Loads
    Open Browser    ${URL}    ${BROWSER}
    Wait Until Page Contains Element    tag=body    timeout=10s
    Log    Page loaded successfully!
    Sleep    2s
    Close Browser
