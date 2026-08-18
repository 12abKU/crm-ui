import json
import re

with open(r"d:\Desktop\crm-ui\scratch\ocr_full_report.json", "r", encoding="utf-8") as f:
    data = json.load(f)

# Targets to classify:
# 1. admin_dashboard_summary
# 2. admin_dashboard_revenue
# 3. admin_dashboard_deals
# 4. admin_dashboard_contacts
# 5. admin_dashboard_activities
# 6. admin_dashboard_bottlenecks
# 7. admin_dashboard_team
# 8. admin_leads_list
# 9. admin_lead_add_form
# 10. admin_lead_profile_overview
# 11. admin_lead_convert_modal
# 12. admin_lead_assign_modal
# 13. admin_contacts_list
# 14. admin_contact_profile
# 15. admin_accounts_list
# 16. admin_account_profile
# 17. admin_deduplication_page
# 18. admin_deduplication_page_merge_ui
# 19. admin_deals_kanban_board
# 20. admin_deal_add_form
# 21. admin_deal_lost_reason_modal
# 22. admin_deal_profile_overview
# 23. admin_deal_profile_journey
# 24. admin_deal_profile_activities
# 25. admin_deal_profile_conversation
# 26. admin_activities_list
# 27. admin_activity_profile
# 28. admin_calendar_view
# 29. admin_conversations_whatsapp
# 30. admin_conversations_email
# 31. admin_teammates_chat
# 32. admin_calls_list
# 33. admin_quick_dialer
# 34. admin_documents_list
# 35. admin_document_preview
# 36. admin_settings_agent_management
# 37. admin_settings_permission_editor
# 38. admin_settings_pipeline
# 39. admin_settings_app_integrations
# 40. admin_settings_email_templates
# 41. admin_settings_automated_sequences
# 42. admin_audit_logs
# 43. admin_privacy_compliance
# 44. admin_support_submit_ticket
# 45. agent_dashboard_summary
# 46. agent_leads_list
# 47. agent_deals_board
# 48. agent_contact_profile
# 49. agent_calendar
# 50. agent_whatsapp_chat
# 51. agent_teammates_chat
# 52. agent_quick_dialer
# 53. agent_profile_settings
# 54. agent_change_password

for idx, item in enumerate(data):
    t = item["text"]
    name = item["current_filename"]
    w, h = item["width"], item["height"]
    
    classification = "UNKNOWN"
    
    # Check rules
    if "Why was this deal lost?" in t or "LOST REASON" in t:
        classification = "admin_deal_lost_reason_modal"
    elif "Compare & Resolve Duplicates" in t or "PRIMARY (SURVIVING)" in t:
        classification = "admin_deduplication_page_merge_ui"
    elif "Create Automation Rule" in t or "Map trigger events to automated actions" in t:
        classification = "admin_settings_automated_sequences"
    elif "Assign Lead" in t and "select multiple agents/admins" in t:
        classification = "admin_lead_assign_modal"
    elif "New Lead" in t and "LEAD TITLE" in t and "SOURCE" in t and "DPDP consent" in t:
        classification = "admin_lead_add_form"
    elif "DEAL TITLE" in t and "PIPELINE" in t and "STAGE" in t and "EXPECTED CLOSE DATE" in t:
        classification = "admin_deal_add_form"
    elif "STAGE JOURNEY" in t and "TIME IN STAGE" in t:
        classification = "admin_deal_profile_journey"
    elif "ACTIVITY TIMELINE" in t and "New Activity" in t and "CALL" in t and "MEETING" in t and "Save Activity" in t:
        classification = "admin_deal_profile_activities"
    elif "CONVERSATIONS" in t and "Emails with" in t and "Re: disacuss about ai connect" in t:
        classification = "admin_deal_profile_conversation"
    elif "Preview not available" in t and "Download 45.7 KB" in t:
        classification = "admin_document_preview"
    elif "Grant all ACCOUNTS_VIEW" in t or "View accounts Create accounts Edit accounts" in t:
        classification = "admin_settings_permission_editor"
    elif "Dial a number" in t:
        if "agent" in name:
            classification = "agent_quick_dialer"
        else:
            classification = "admin_quick_dialer"
            
    print(f"[{idx+1:02d}] {name} ({w}x{h}) -> DETECTED: {classification}")
