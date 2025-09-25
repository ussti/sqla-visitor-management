export interface NDATemplateData {
  visitorName: string;
  visitorEmail: string;
  companyName?: string;
  date: string;
  signatureDate?: string;
}

export const NDA_TEMPLATE = `
This Mutual Non-Disclosure Agreement ("Agreement") is made as of {{DATE}}, (the "Effective Date") between SQUEAK E CLEAN STUDIOS, LLC. , Inc. and its directly or indirectly wholly-owned subsidiaries ("SQUEAK E CLEAN STUDIOS, LLC. ") on one hand and {{VISITOR_NAME}} ("Participant") on the other.

**PARTICIPANT INFORMATION:**
Name: {{VISITOR_NAME}}
Email: {{VISITOR_EMAIL}}
Company: {{COMPANY_NAME}}
Date: {{DATE}}

**1. Definition.**

"Confidential Information" means information relating to the Discloser's business, including, without limitation, product designs, product plans, data, software and technology, financial information, marketing plans, business opportunities, proposed terms, pricing information, discounts, inventions and know-how disclosed by Discloser to Recipient, either directly or indirectly, whether in writing, verbally or otherwise, and whether prior to, on or after the Effective Date, that either: (a) is designated as confidential by the Discloser at the time of disclosure; or (b) would reasonably be understood, given the nature of the information or the circumstances surrounding its disclosure, to be confidential. Confidential Information also includes the existence of this Agreement and the fact or nature of the discussions between the parties.

**2. Use of Confidential Information.** A party which receives Confidential Information under this Agreement ("Recipient") may use the Confidential Information only to evaluate whether to enter into a business relationship with the party which discloses Confidential Information under this Agreement ("Discloser").

**3. Disclosure of Confidential Information.** Recipient will: (a) hold Confidential Information in strict confidence and take reasonable precautions to protect such Confidential Information (such precautions to include, at a minimum, all precautions Recipient employs with respect to its own confidential materials); (b) not divulge any Confidential Information to any third party (other than to employees or contractors as set forth below); and (c) not copy or reverse engineer any materials disclosed under this Agreement or remove any proprietary markings from any Confidential Information. Any employee or contractor given access to any Confidential Information must have a legitimate "need to know" such Confidential Information for use specified in Section 2 and Recipient will remain responsible for each such person's compliance with the terms of this Agreement.

**4. Term; Confidentiality Period.** Either party may terminate this Agreement upon 30 days prior written notice to the other party. Irrespective of any termination of this Agreement, Recipient's obligations with respect to Confidential Information under this Agreement expire 5 years from the date of receipt of the Confidential Information (except with respect to any trade secrets where such obligations will be perpetual).

**5. Exclusions.** This Agreement imposes no obligations with respect to information which: (a) was in Recipient's possession before receipt from Discloser; (b) is or becomes a matter of public knowledge through no fault of Recipient; (c) was rightfully disclosed to Recipient by a third party without restriction on disclosure; or (d) is developed by Recipient without use of the Confidential Information as can be shown by documentary evidence. Recipient may make disclosures to the extent required by law or court order provided Recipient makes commercially reasonable efforts to provide Discloser with notice of such disclosure as promptly as possible and uses diligent efforts to limit such disclosure and obtain confidential treatment or a protective order and has allowed Discloser to participate in the proceeding.

**6. Return or Destruction of Confidential Information.** Upon termination of this Agreement or written request by Discloser, the Recipient will: (a) cease using the Confidential Information; (b) return or destroy the Confidential Information and all copies, notes or extracts thereof to Discloser within 7 business days of receipt of request; and (c) upon request of Discloser, confirm in writing that Recipient has complied with these obligations.

**7. Proprietary Rights.** Neither party to this Agreement acquires any intellectual property rights or any other rights under this Agreement except the limited right to use the Confidential Information set forth in Section 2.

**8. Disclaimer.** CONFIDENTIAL INFORMATION IS PROVIDED "AS IS" AND WITH ALL FAULTS.

**9. Independent Development.** The Discloser acknowledges that the Recipient may currently or in the future be developing information internally, or receiving information from other parties, that is similar to the Confidential Information. Accordingly, nothing in this Agreement will be construed as a representation or agreement that the Recipient will not develop or have developed for it products, concepts, systems or techniques that are similar to or compete with the products, concepts, systems or techniques contemplated by or embodied in the Confidential Information, provided that the Recipient does not violate any of its obligations under this Agreement in connection with such development.

**10. Publicity.** Neither party will make, or authorize any third party to make, any public announcement or other disclosures related to this Agreement and any potential agreement or relationship with the other party or any of its affiliates or subsidiaries without the prior written approval of the other party. For the purposes of this Agreement public announcements include disclosures to any person or entity other than the Recipient by any means, including but not limited to, press releases, written or oral statements made to the media, blogs, trade organizations, publications, websites, or any other public audience or unauthorized third parties.

**11. Export.** Recipient agrees not to remove or export any such Confidential Information or any direct product thereof, except in compliance with, and with all applicable export laws and regulation.

**12. Injunctive Relief.** Each party acknowledges that any breach of this Agreement may cause irreparable harm for which monetary damages are an insufficient remedy and therefore that upon any breach of this Agreement Discloser will be entitled to appropriate equitable relief without the posting of a bond in addition to whatever remedies it might have at law.

**13. General.** Neither party has an obligation under this Agreement to purchase or offer for sale any item or proceed with any proposed transaction. In the event that any of the provisions of this Agreement will be held illegal or unenforceable by a court of competent jurisdiction, such provisions will be limited or eliminated to the minimum extent necessary so that this Agreement will otherwise remain in full force and effect. Neither party may assign this Agreement without the prior written consent of the other party. This Agreement will be governed by the laws of the State of California and the United States without regard to conflicts of laws provisions thereof. This Agreement supersedes all prior discussions and writings and constitutes the entire agreement between the parties with respect to the subject matter hereof. The prevailing party in any action to enforce this Agreement will be entitled to costs and attorneys' fees. No waiver or modification of this Agreement will be binding upon either party unless made in writing and signed by a duly authorized representative of each party and no failure or delay in enforcing any right will be deemed a waiver.

**PARTICIPANT ACKNOWLEDGMENT:**

By signing below, {{VISITOR_NAME}} acknowledges that they have read, understood, and agree to be bound by the terms of this Non-Disclosure Agreement.

Participant Signature: _________________________________

Participant Name: {{VISITOR_NAME}}

Date: {{SIGNATURE_DATE}}

**For SQUEAK E CLEAN STUDIOS, LLC.:**

Authorized Representative: _________________________________

Date: {{DATE}}
`;

export function fillNDATemplate(data: NDATemplateData): string {
  return NDA_TEMPLATE
    .replace(/\{\{VISITOR_NAME\}\}/g, data.visitorName)
    .replace(/\{\{VISITOR_EMAIL\}\}/g, data.visitorEmail)
    .replace(/\{\{COMPANY_NAME\}\}/g, data.companyName || 'N/A')
    .replace(/\{\{DATE\}\}/g, data.date)
    .replace(/\{\{SIGNATURE_DATE\}\}/g, data.signatureDate || data.date);
}

export function generateNDAFilename(visitorName: string, date?: string): string {
  const cleanName = visitorName.replace(/[^a-zA-Z0-9]/g, '_');
  const dateStr = date ? new Date(date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
  return `NDA_${cleanName}_${dateStr}.pdf`;
}