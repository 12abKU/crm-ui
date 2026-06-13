import React from 'react';

const SOURCE_CONFIG = {
  INDIAMART: {
    label: "IndiaMart Lead",
    bgClass: "bg-orange-50 border-orange-200",
    textClass: "text-orange-700",
    fields: (li) => [
      { label: "Name",       value: li.senderName },
      { label: "Phone",      value: li.senderPhone },
      { label: "Email",      value: li.senderEmail },
      { label: "Lead ID",    value: li.indiamartLeadId },
      { label: "Product",    value: li.indiamartProduct },
      { label: "Message",    value: li.message },
      { label: "Company",    value: li.indiamartCompany },
      { label: "City",       value: li.city },
      { label: "State",      value: li.indiamartState },
      { label: "Pincode",    value: li.indiamartPincode },
      { label: "Alt Mobile", value: li.indiamartAltMobile },
      { label: "Alt Email",  value: li.indiamartAltEmail },
      { label: "Lead Time",  value: li.indiamartLeadTime },
    ].filter(f => f.value),
  },
  SULEKHA: {
    label: "Sulekha Lead",
    bgClass: "bg-blue-50 border-blue-200",
    textClass: "text-blue-700",
    fields: (li) => [
      { label: "Name",        value: li.senderName },
      { label: "Phone",       value: li.senderPhone },
      { label: "Email",       value: li.senderEmail },
      { label: "Requirement", value: li.sulekhaRequirement },
      { label: "Message",     value: li.message },
      { label: "City",        value: li.city },
      { label: "Service",     value: li.sulekhaService },
      { label: "Category",    value: li.sulekhaCategory },
      { label: "Date",        value: li.sulekhaDate },
    ].filter(f => f.value),
  },
  WHATSAPP: {
    label: "WhatsApp Lead",
    bgClass: "bg-green-50 border-green-200",
    textClass: "text-green-700",
    fields: (li) => [
      { label: "Name",           value: li.senderName },
      { label: "Phone",          value: li.senderPhone },
      { label: "Sender Number",  value: li.whatsappNumber },
      { label: "First Message",  value: li.whatsappFirstMessage },
    ].filter(f => f.value),
  },
};

export default function LeadInfoCard({ leadInfo }) {
  if (!leadInfo) return null;

  const config = SOURCE_CONFIG[leadInfo.source];
  if (!config) return null;

  return (
    <div className={`border rounded-lg p-4 mb-4 ${config.bgClass}`}>
      <h3 className={`font-semibold mb-3 ${config.textClass}`}>
        {config.label}
      </h3>
      <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
        {config.fields(leadInfo).map(({ label, value }) => (
          <div key={label}>
            <span className="text-gray-500 block mb-0.5">{label}</span>
            <p className="font-medium text-gray-800 break-words">{value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
