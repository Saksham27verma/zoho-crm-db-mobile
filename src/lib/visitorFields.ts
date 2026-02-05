export type VisitorRow = Record<string, unknown>;

export type FieldDef = { label: string; keys: string[] };
export type SectionDef = { title: string; fields: FieldDef[] };

export const VISITOR_SECTIONS: SectionDef[] = [
  {
    title: "Visitor Information",
    fields: [
      { label: "Visitor Name", keys: ["Visitor_Name", "name", "visitor_name"] },
      { label: "Visitor Owner", keys: ["Visitor_Owner", "owner", "visitor_owner"] },
      { label: "Center", keys: ["Center", "centre", "branch"] },
      { label: "Date of Entry", keys: ["Date_of_Entry", "date_of_entry", "created_at"] },
      { label: "Date of visit", keys: ["Date_of_visit", "date_of_visit", "visit_date"] },
      { label: "Date of followup", keys: ["Date_of_followup", "date_of_followup"] },
      { label: "Phone", keys: ["Phone", "phone", "mobile"] },
      { label: "Email", keys: ["Email", "email"] },
      { label: "Address", keys: ["Address", "address"] },
      { label: "Visit Reason", keys: ["Visit_Reason", "visit_reason", "reason"] },
      { label: "Hearing aid status", keys: ["Hearing_aid_status", "hearing_aid_status"] },
      { label: "Remarks", keys: ["Remarks", "remarks", "notes"] },
      { label: "Reference", keys: ["Reference", "reference"] },
    ],
  },
  {
    title: "Clinical Details",
    fields: [
      { label: "Patient's Age", keys: ["Patient_Age", "patient_age", "age"] },
      { label: "Symptoms", keys: ["Symptoms", "symptoms"] },
      { label: "Rinne test", keys: ["Rinne_test", "rinne_test"] },
      { label: "Weber's test", keys: ["Webers_test", "weber_test"] },
      { label: "Test name", keys: ["Test_name", "test_name"] },
      { label: "Name of Hearing Aid", keys: ["Name_of_Hearing_Aid", "name_of_hearing_aid"] },
      { label: "Date of purchase", keys: ["Date_of_purchase", "date_of_purchase"] },
    ],
  },
  {
    title: "Hearing Aid Sale",
    fields: [
      { label: "Trial period", keys: ["Trial_period", "trial_period"] },
      { label: "Warranty", keys: ["Warranty", "warranty"] },
      { label: "Who sold?", keys: ["Who_sold", "who_sold", "sold_by"] },
      { label: "Date of sale", keys: ["Date_of_sale", "date_of_sale"] },
      { label: "Payment Done", keys: ["Payment_Done", "payment_done"] },
    ],
  },
];
