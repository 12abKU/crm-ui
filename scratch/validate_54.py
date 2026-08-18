import os
import shutil

folder = r"d:\Desktop\crm-screenshots"

# We have the 54 images currently in d:\Desktop\crm-screenshots
# In exact index order (0 to 53):
index_to_true_name = {
    0: "admin_accounts_list.png",
    1: "admin_contact_profile.png",
    2: "admin_deal_profile_conversation.png",
    3: "admin_activities_list.png",
    4: "admin_settings_automated_sequences.png",
    5: "admin_activity_profile.png",
    6: "admin_teammates_chat.png",
    7: "admin_contacts_list.png",
    8: "admin_lead_assign_modal.png",
    9: "admin_conversations_email.png",
    10: "admin_calendar_view.png",
    11: "admin_dashboard_contacts.png",
    12: "admin_dashboard_activities.png",
    13: "admin_dashboard_deals.png",
    14: "admin_privacy_compliance.png", # Item 15 has the Deals/Forecasting/Compliance
    15: "admin_dashboard_revenue.png",
    16: "admin_dashboard_summary.png",
    17: "admin_dashboard_bottlenecks.png",
    18: "admin_deals_kanban_board.png",
    19: "admin_deal_add_form.png",
    20: "admin_deal_profile_journey.png",
    21: "admin_deal_profile_activities.png",
    22: "admin_deal_profile_overview.png",
    23: "admin_deal_lost_reason_modal.png",
    24: "admin_deduplication_page_merge_ui.png",
    25: "admin_account_profile.png",
    26: "admin_deduplication_page.png",
    27: "admin_documents_list.png",
    28: "admin_quick_dialer.png",
    29: "admin_leads_list.png",
    30: "admin_lead_convert_modal.png",
    31: "admin_lead_profile_overview.png",
    32: "admin_lead_add_form.png",
    33: "admin_dashboard_team.png",
    34: "admin_audit_logs.png",
    35: "admin_calls_list.png",
    36: "admin_document_preview.png",
    37: "admin_settings_pipeline.png",
    38: "admin_settings_email_templates.png",
    39: "admin_settings_app_integrations.png",
    40: "admin_settings_agent_management.png",
    41: "admin_settings_permission_editor.png",
    42: "admin_support_submit_ticket.png",
    43: "admin_conversations_whatsapp.png",
    44: "agent_calendar.png",
    45: "agent_change_password.png",
    46: "agent_contact_profile.png",
    47: "agent_dashboard_summary.png",
    48: "agent_deals_board.png",
    49: "agent_leads_list.png",
    50: "agent_profile_settings.png",
    51: "agent_quick_dialer.png",
    52: "agent_teammates_chat.png",
    53: "agent_whatsapp_chat.png"
}

# Verify uniqueness
names_list = list(index_to_true_name.values())
assert len(names_list) == 54, f"Expected 54, got {len(names_list)}"
assert len(set(names_list)) == 54, f"Duplicates found: {[n for n in names_list if names_list.count(n) > 1]}"

print("All 54 items mapped with 100% uniqueness!")
