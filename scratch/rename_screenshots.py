import os
import shutil

folder = r"d:\Desktop\crm-screenshots"

# The exact ordered list provided to the user
target_names = [
    # Tenant Admin (44)
    "admin_dashboard_summary.png",
    "admin_dashboard_revenue.png",
    "admin_dashboard_deals.png",
    "admin_dashboard_contacts.png",
    "admin_dashboard_activities.png",
    "admin_dashboard_bottlenecks.png",
    "admin_dashboard_team.png",
    "admin_leads_list.png",
    "admin_lead_add_form.png",
    "admin_lead_profile_overview.png",
    "admin_lead_convert_modal.png",
    "admin_lead_assign_modal.png",
    "admin_contacts_list.png",
    "admin_contact_profile.png",
    "admin_accounts_list.png",
    "admin_account_profile.png",
    "admin_deduplication_page.png",
    "admin_deduplication_page_merge_ui.png",
    "admin_deals_kanban_board.png",
    "admin_deal_add_form.png",
    "admin_deal_lost_reason_modal.png",
    "admin_deal_profile_overview.png",
    "admin_deal_profile_journey.png",
    "admin_deal_profile_activities.png",
    "admin_deal_profile_conversation.png",
    "admin_activities_list.png",
    "admin_activity_profile.png",
    "admin_calendar_view.png",
    "admin_conversations_whatsapp.png",
    "admin_conversations_email.png",
    "admin_teammates_chat.png",
    "admin_calls_list.png",
    "admin_quick_dialer.png",
    "admin_documents_list.png",
    "admin_document_preview.png",
    "admin_settings_agent_management.png",
    "admin_settings_permission_editor.png",
    "admin_settings_pipeline.png",
    "admin_settings_app_integrations.png",
    "admin_settings_email_templates.png",
    "admin_settings_automated_sequences.png",
    "admin_audit_logs.png",
    "admin_privacy_compliance.png",
    "admin_support_submit_ticket.png",
    # Agent Manual (10)
    "agent_dashboard_summary.png",
    "agent_leads_list.png",
    "agent_deals_board.png",
    "agent_contact_profile.png",
    "agent_calendar.png",
    "agent_whatsapp_chat.png",
    "agent_teammates_chat.png",
    "agent_quick_dialer.png",
    "agent_profile_settings.png",
    "agent_change_password.png"
]

# 1. Back up the old dark mode screenshots
backup_dir = os.path.join(folder, "dark_mode_backup")
if not os.path.exists(backup_dir):
    os.makedirs(backup_dir)

all_files = os.listdir(folder)
for f in all_files:
    if f in target_names:
        # It's an old named file, move to backup
        shutil.move(os.path.join(folder, f), os.path.join(backup_dir, f))

# 2. Find the 54 new screenshots taken on 2026-08-14
new_screenshots = [f for f in os.listdir(folder) if f.startswith("Screenshot 2026-08-14") and f.endswith(".png")]
new_screenshots.sort() # Sort chronologically

if len(new_screenshots) != len(target_names):
    print(f"Error: Found {len(new_screenshots)} new screenshots, but expected {len(target_names)}.")
else:
    # 3. Rename them in order
    for old_name, new_name in zip(new_screenshots, target_names):
        os.rename(os.path.join(folder, old_name), os.path.join(folder, new_name))
    print(f"Successfully renamed all {len(target_names)} screenshots!")
