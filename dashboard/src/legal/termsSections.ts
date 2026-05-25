import type { LegalSection } from "./legalSectionTypes";
import {
  LEGAL_EFFECTIVE_DATE,
  LEGAL_GOVERNING_LAW_SUMMARY,
  LEGAL_JURISDICTION,
  LEGAL_OPERATOR_DISPLAY,
  LEGAL_PRODUCT_NAME,
  LEGAL_SUPPORT_EMAIL,
  LEGAL_TERMS_VERSION,
} from "./legalMeta";

export const termsSections: LegalSection[] = [
  {
    id: "agreement",
    title: "Agreement to Terms and Formation of Contract",
    blocks: [
      {
        type: "p",
        text: `THESE TERMS OF SERVICE (“Terms”) CONSTITUTE A LEGALLY BINDING CONTRACT between you (“you”, “your”, “User”, “Subscriber”) and ${LEGAL_OPERATOR_DISPLAY} (“we”, “us”, “our”, “Company”, “Licensor”) governing your access to, subscription for, and use of ${LEGAL_PRODUCT_NAME} (the “Services”), including any software, mobile applications, dashboards, application programming interfaces (APIs), documentation, updates, and support services provided by us. These Terms apply regardless of whether you access the Services as an individual guard user, as an administrator on behalf of a client organization, or as a visitor to our marketing or informational websites. Version ${LEGAL_TERMS_VERSION}. Effective Date: ${LEGAL_EFFECTIVE_DATE}.`,
      },
      {
        type: "p",
        text: "BY CREATING AN ACCOUNT, CLICKING AN “I ACCEPT” OR “AGREE” BUTTON, DOWNLOADING THE APPLICATION, EXECUTING AN ORDER FORM THAT REFERENCES THESE TERMS, OR OTHERWISE ACCESSING OR USING THE SERVICES, YOU EXPRESSLY ACKNOWLEDGE THAT YOU HAVE READ, UNDERSTOOD, AND AGREE TO BE BOUND BY THESE TERMS, INCLUDING ANY UPDATES OR MODIFICATIONS THERETO. IF YOU DO NOT AGREE TO ANY PROVISION OF THESE TERMS, YOU ARE PROHIBITED FROM USING THE SERVICES AND MUST IMMEDIATELY CEASE ANY ACCESS OR USE THEREOF.",
      },
      {
        type: "p",
        text: "If you are accepting these Terms on behalf of an organization, company, government entity, or other legal entity (collectively, “Organization”), you represent and warrant that: (a) you have the full legal authority to bind such Organization to these Terms; (b) you have read and understand these Terms on behalf of such Organization; and (c) you agree to these Terms on behalf of such Organization. In such case, references to “you” and “your” shall refer to both you as the individual accepting these Terms and the Organization you represent. If you do not have such authority, or if you do not agree with these Terms on behalf of the Organization, you must not accept these Terms or use the Services on behalf of such Organization.",
      },
      {
        type: "p",
        text: "These Terms, together with our Privacy Policy (which is incorporated herein by this reference), constitute the entire agreement between you and us regarding the Services and supersede all prior agreements, understandings, representations, and warranties, whether written or oral. Any additional or different terms proposed by you are hereby rejected unless expressly agreed to in writing by an authorized representative of the Company.",
      },
    ],
  },
  {
    id: "definitions",
    title: "Definitions and Interpretation",
    blocks: [
      {
        type: "p",
        text: "For the purposes of these Terms, the following capitalized terms shall have the meanings ascribed to them below:",
      },
      {
        type: "ul",
        items: [
          "“Services” means the collective suite of tools provided by the Company, including the guard mobile application, client operations dashboard, APIs, related software, hosted services, documentation, and any updates, upgrades, patches, or modifications thereto.",
          "“User” means any individual who accesses or uses the Services, whether as a guard, administrator, supervisor, viewer, or visitor.",
          "“Client Organization” means any Organization that subscribes to the Services for use by its employees, contractors, agents, or other authorized personnel.",
          "“Guard User” means an individual user of the mobile application who performs security-related functions including shift management, checkpoint scanning, incident reporting, and related activities.",
          "“Administrator” means a User designated by a Client Organization with authority to configure settings, manage Users, access reports, and perform administrative functions within the Services.",
          "“Content” means any data, information, text, images, photographs, video, audio, signatures, documents, or other materials uploaded, submitted, generated, or transmitted through the Services by any User.",
          "“Order Form” means any ordering document, statement of work, or online subscription process that specifies the Services subscribed to, fees, subscription term, and other commercial terms.",
          "“Subscription Term” means the period of time during which you are authorized to access and use the Services, as specified in the applicable Order Form.",
        ],
      },
    ],
  },
  {
    id: "services",
    title: "Description of Services and Service Levels",
    blocks: [
      {
        type: "p",
        text: `${LEGAL_PRODUCT_NAME} provides a comprehensive suite of security operations tools designed to facilitate the management, monitoring, and documentation of security personnel activities. The Services include, but are not limited to:`,
      },
      {
        type: "ul",
        items: [
          "Guard mobile workflows, including shift initiation and conclusion, real-time checkpoint scanning (QR code, NFC, RFID, or other identifier technologies), incident reporting, digital evidence capture (photographs, video, audio, signatures), and panic/emergency alert functionality;",
          "Client dashboards for real-time monitoring of guard activities, configuration of sites and checkpoints, generation of operational reports, management of User accounts and permissions, and review of incident documentation;",
          "Application programming interfaces (APIs) for integration with third-party systems, subject to separate API terms and rate limitations;",
          "Administrative tools for User onboarding, role-based access control (RBAC), audit logging, and compliance management;",
          "Location-based services including GPS tracking, geofencing, route verification, and proximity detection (subject to User permissions and device capabilities);",
          "Notification and alert systems for time-sensitive operational communications, emergency broadcasts, and system announcements;",
          "Analytics and reporting features providing insights into operational performance, compliance metrics, and security incidents.",
        ],
      },
      {
        type: "p",
        text: "WE RESERVE THE RIGHT TO MODIFY, UPDATE, ADD TO, OR DISCONTINUE ANY FEATURE OR FUNCTIONALITY OF THE SERVICES AT ANY TIME, WITH OR WITHOUT NOTICE TO YOU, TO THE FULLEST EXTENT PERMITTED BY APPLICABLE LAW. We will use commercially reasonable efforts to provide advance notice of material changes that adversely affect existing functionality, but we are not liable for any modification, suspension, or discontinuation of the Services. Certain features may be offered on a beta, pilot, or evaluation basis (“Beta Features”). Beta Features are provided “AS IS” without warranty of any kind and may be subject to additional terms.",
      },
      {
        type: "p",
        text: "WE DO NOT GUARANTEE UNINTERRUPTED, ERROR-FREE, OR SECURE OPERATION OF THE SERVICES. The Services may be subject to limitations, delays, and other problems inherent in the use of the internet and electronic communications, including but not limited to network unavailability, latency, packet loss, hardware failures, software bugs, and third-party service interruptions. We are not responsible for any delays, delivery failures, or other damages resulting from such problems. Service level agreements (SLAs), if any, will be set forth in a separate written agreement between the Company and a Client Organization; in the absence of such agreement, no minimum service levels are guaranteed.",
      },
    ],
  },
  {
    id: "accounts",
    title: "Account Registration, Eligibility, and Security Obligations",
    blocks: [
      {
        type: "p",
        text: "To access certain features of the Services, you are required to register for an account. You agree to provide true, accurate, current, and complete registration information (including your legal name, email address, and any other information requested) and to promptly update such information as necessary to keep it accurate and current. You represent and warrant that all information you provide is truthful and that you have the legal capacity and authority to enter into these Terms.",
      },
      {
        type: "p",
        text: "ELIGIBILITY: By registering for an account, you represent and warrant that you: (a) are at least eighteen (18) years of age (or the age of majority in your jurisdiction, if higher); (b) have not been previously suspended or removed from the Services; (c) are not located in a country that is subject to a U.S. government embargo or that has been designated as a “terrorist supporting” country; and (d) are not listed on any U.S. government list of prohibited or restricted parties. If you are registering as a Guard User, you further represent that you are employed by or contracted to a Client Organization that has authorized your use of the Services and that you will comply with both these Terms and your employer’s applicable policies.",
      },
      {
        type: "p",
        text: "ACCOUNT SECURITY: You are solely responsible for safeguarding your account credentials, including your password, API keys, session tokens, and any multi-factor authentication (MFA) devices or recovery codes. You agree to: (a) not share your credentials with any unauthorized third party; (b) use a strong, unique password that you do not use for other services; (c) enable MFA where offered; (d) immediately notify us of any actual or suspected unauthorized use of your account or any other security breach by emailing ${LEGAL_SUPPORT_EMAIL}; and (e) log out of your account at the end of each session. YOU ARE FULLY RESPONSIBLE AND LIABLE FOR ALL ACTIVITIES THAT OCCUR UNDER YOUR ACCOUNT, WHETHER AUTHORIZED OR UNAUTHORIZED, UNLESS AND UNTIL YOU HAVE NOTIFIED US OF A SECURITY BREACH AND WE HAVE HAD A REASONABLE OPPORTUNITY TO ACT UPON SUCH NOTICE. We are not liable for any loss or damage arising from your failure to comply with these security obligations.",
      },
      {
        type: "p",
        text: "Guard accounts may require linkage to a Client Organization and approval by a Client Organization administrator before operational access is granted. We are not responsible for delays or denials of access resulting from actions or inactions of Client Organizations. You acknowledge that Client Organizations may set additional access requirements, policies, or restrictions beyond those set forth in these Terms, and you agree to comply therewith.",
      },
    ],
  },
  {
    id: "acceptable",
    title: "Acceptable Use Policy and Prohibited Conduct",
    blocks: [
      {
        type: "p",
        text: "You agree to use the Services only for lawful purposes and in accordance with these Terms. You shall not, and shall not permit any third party to, directly or indirectly:",
      },
      {
        type: "ul",
        items: [
          "Violate any applicable local, state, national, or international law, regulation, ordinance, treaty, or court order, including but not limited to laws relating to data protection (GDPR, CCPA, etc.), employment, privacy, surveillance, evidence handling, and emergency response;",
          "Violate or infringe upon the intellectual property rights, privacy rights, publicity rights, or other proprietary rights of any third party;",
          "Attempt to gain unauthorized access to the Services, other Users' accounts or data, our computer systems or networks, or any third-party systems connected to the Services, including through password mining, phishing, social engineering, credential stuffing, or any other means;",
          "Engage in any activity that disrupts, degrades, impairs, or interferes with the Services or the equipment, networks, or systems used to provide the Services, including denial-of-service (DoS) attacks, introduction of malware (including viruses, worms, Trojan horses, ransomware, spyware, or other malicious code), excessive automated requests, or any activity that imposes an unreasonable or disproportionately large load on our infrastructure;",
          "Probe, scan, or test the vulnerability of any system or network used to provide the Services, or breach or attempt to breach any security or authentication measures, unless (i) you are acting under a coordinated vulnerability disclosure program authorized in writing by the Company, or (ii) such activities are explicitly permitted by applicable law (e.g., security research exemptions) and you provide advance notice to us and do not exploit any discovered vulnerability;",
          "Reverse engineer, decompile, disassemble, reconstruct, or derive the source code of, or any trade secrets embodied in, the Services, except to the extent such restriction is expressly prohibited by applicable mandatory law (e.g., certain interoperability rights under the EU Software Directive);",
          "Rent, lease, sublicense, distribute, resell, timeshare, or otherwise commercially exploit the Services to any third party without our express written permission;",
          "Copy, modify, create derivative works of, or build upon the Services or any portion thereof, except as expressly permitted by these Terms or applicable law;",
          "Remove, obscure, or alter any proprietary rights notices (including copyright, trademark, or patent notices) appearing on or within the Services;",
          "Use the Services to transmit, store, or process any content that: (a) is defamatory, obscene, pornographic, abusive, harassing, threatening, discriminatory, or hateful; (b) encourages illegal activity or violence; (c) infringes on third-party rights; (d) contains malware; or (e) is false, misleading, or deceptive;",
          "Misrepresent your identity, affiliation, or credentials in connection with your use of the Services, including impersonating another person, entity, or government official;",
          "Forge, manipulate, spoof, falsify, or otherwise misrepresent operational data, including but not limited to: (i) location data (GPS, Wi-Fi, or Bluetooth signals) to falsely indicate presence at a checkpoint or site; (ii) timestamps to misrepresent the time of an event or shift activity; (iii) incident reports to create false evidence or conceal genuine incidents; (iv) shift data to inaccurately record attendance or work hours; or (v) any other data that could be relied upon by a Client Organization, law enforcement, regulatory agency, or court of law;",
          "Use the Services to intentionally trigger false panic alerts, emergency notifications, or other alarm features in a manner that could cause harm, divert emergency services, or create unnecessary panic or disruption;",
          "Attempt to extract, scrape, or harvest data from the Services using automated means (bots, crawlers, scrapers) without our express written permission;",
          "Use the Services to store or process protected health information (HIPAA), payment card information (PCI-DSS), or other highly regulated data unless you have entered into a separate agreement with us that explicitly provides for such processing and you have implemented any required compliance measures; and",
          "Encourage, enable, or assist any third party in engaging in any of the foregoing prohibited activities.",
        ],
      },
      {
        type: "p",
        text: "We reserve the right to investigate any suspected violation of this Acceptable Use Policy and to take any action we deem appropriate in our sole discretion, including but not limited to suspending or terminating your account, reporting you to law enforcement authorities, or taking legal action against you. You acknowledge and agree that we have no obligation to monitor your use of the Services, but we have the right to do so and to disclose any information as necessary to satisfy applicable law, regulation, legal process, or government request, or to protect our rights or the rights of others.",
      },
    ],
  },
  {
    id: "guard-ops",
    title: "Guard Operations: Location Data, Accuracy, and Evidence Integrity",
    blocks: [
      {
        type: "p",
        text: "Certain features of the Services rely on Global Positioning System (GPS) technology, Wi-Fi positioning, cellular triangulation, Bluetooth signal detection, or other location-determination methods (collectively, “Location Data”). YOU UNDERSTAND AND AGREE THAT:",
      },
      {
        type: "ul",
        items: [
          "Location Data accuracy is subject to inherent limitations including: (a) device hardware capabilities and quality; (b) environmental factors such as tall buildings, dense foliage, indoor spaces, tunnels, adverse weather, or electromagnetic interference; (c) availability and precision of GPS satellite signals; (d) network connectivity and quality of service from mobile carriers; (e) device settings and permissions granted (or not granted) by you; (f) battery saving modes that may reduce location accuracy; and (g) other factors beyond our reasonable control. We DO NOT WARRANT that Location Data will be accurate, precise, timely, or complete.",
          "You are solely responsible for ensuring that your device has adequate power, network connectivity, and permissions to enable location-dependent features. We are not liable for any operational consequences arising from inaccurate, delayed, or missing Location Data.",
          "YOU AGREE NOT TO MANIPULATE, SPOOF, FORGE, FALSIFY, OR OTHERWISE MISREPRESENT LOCATION DATA OR CHECKPOINT SCAN INFORMATION. Do not use GPS spoofing applications, mock location settings, VPN or proxy services that alter perceived location, or any other technique intended to deceive the Services regarding your actual physical presence. Any detection of such activity may result in immediate termination of your account, notification to your Client Organization, potential legal action for fraud, and reporting to law enforcement authorities where appropriate.",
          "YOU ACKNOWLEDGE AND AGREE that your Client Organization, employer, supervisor, or other authorized parties may rely on Location Data and checkpoint information (including timestamps, scan patterns, and associated metadata) for critical operational decisions, including but not limited to: verifying compliance with patrol routes, confirming attendance at assigned sites, investigating incidents, establishing timelines, evaluating guard performance, determining payroll or compensation eligibility, defending legal claims, and complying with contractual obligations to third parties. Your provision of false or misleading operational data may result in serious consequences, including termination of employment, criminal prosecution for fraud or falsification of business records, and civil liability for damages caused to your Client Organization or third parties.",
        ],
      },
      {
        type: "p",
        text: "INCIDENT REPORTING AND EVIDENCE INTEGRITY: When you submit incident reports, photographs, video, audio, signatures, or other evidence through the Services, you represent and warrant that such Content is true, accurate, complete, and authentic to the best of your knowledge. You agree not to edit, alter, modify, or manipulate evidentiary Content in any manner that could affect its authenticity or admissibility in legal proceedings. We retain metadata (including timestamps, device identifiers, and geolocation where available) associated with evidentiary Content to support chain-of-custody and authentication purposes. We may, in our discretion, generate cryptographic hashes or employ other tamper-evident technologies to verify the integrity of evidentiary Content. You agree not to challenge the admissibility or authenticity of properly documented evidentiary Content collected through the Services solely on the basis that it was collected, stored, or transmitted using software or cloud services, to the fullest extent permitted by applicable rules of evidence.",
    },
    ]
  },
  {
    id: "content",
    title: "User Content: Ownership, License, and Responsibilities",
    blocks: [
      {
        type: "p",
        text: "As between you and the Company, you retain all right, title, and interest in and to any Content that you upload, submit, generate, or transmit through the Services (your “User Content”), including any intellectual property rights therein. Nothing in these Terms transfers ownership of your User Content to us.",
      },
      {
        type: "p",
        text: "However, by submitting, uploading, or transmitting User Content through the Services, you grant the Company and our authorized service providers a worldwide, non-exclusive, royalty-free, fully paid-up, sublicensable (to our service providers only), and transferable license to host, store, cache, backup, archive, reproduce, format, adapt, modify (for technical purposes only, such as format conversion or compression), display, distribute, transmit, and otherwise process your User Content solely for the following purposes:",
      },
      {
        type: "ul",
        items: [
          "Providing, operating, maintaining, supporting, and improving the Services (including enabling sharing of Content with your Client Organization and other authorized Users within your organization);",
          "Creating backups and disaster recovery copies as necessary for the security and continuity of the Services;",
          "Complying with applicable laws, regulations, legal process, or enforceable government requests;",
          "Enforcing these Terms and investigating potential violations;",
          "Protecting the rights, property, or safety of the Company, our Users, or the public;",
          "Aggregating or anonymizing data for analytical, statistical, or research purposes (provided such aggregated or anonymized data no longer identifies you or any specific individual).",
        ],
      },
      {
        type: "p",
        text: "This license continues for as long as your User Content is retained by us in accordance with our retention policies, and survives termination of these Terms solely to the extent necessary to comply with legal obligations, resolve disputes, or enforce our rights. You represent and warrant that you have all rights necessary to grant the licenses set forth herein, including any necessary consents or permissions from third parties (such as individuals captured in photographs, your employer, or other data subjects).",
      },
      {
        type: "p",
        text: "YOU ARE SOLELY RESPONSIBLE FOR YOUR USER CONTENT. We are not responsible for any loss, damage, or liability arising from your User Content, including any third-party claims of infringement, defamation, privacy violation, or unauthorized data processing. You agree not to submit any User Content that: (i) violates any law or third-party rights; (ii) you do not have the right to submit; or (iii) contains sensitive personal data (e.g., health information, financial account numbers, government identifiers) unless such submission is necessary for the legitimate purposes of the Services and you have obtained all required consents.",
      },
    ],
  },
  {
    id: "client",
    title: "Client Organizations: Additional Responsibilities and Indemnities",
    blocks: [
      {
        type: "p",
        text: "IF YOU ARE A CLIENT ORGANIZATION OR AN ADMINISTRATOR ACTING ON BEHALF OF A CLIENT ORGANIZATION, YOU ASSUME ADDITIONAL RESPONSIBILITIES under these Terms, including but not limited to:",
      },
      {
        type: "ul",
        items: [
          "Ensuring that all Guard Users and other personnel within your Organization who access the Services are authorized to do so and have agreed to comply with these Terms;",
          "Maintaining accurate and up-to-date records of which individuals within your Organization are authorized to access the Services, and promptly revoking access for any individual who is no longer employed by or contracted to your Organization or who no longer requires access;",
          "Implementing and maintaining appropriate security measures on your internal systems, networks, and devices used to access the Services, including firewalls, antivirus software, access controls, and employee security training;",
          "Obtaining all necessary consents, providing all required notices, and otherwise complying with applicable data protection laws with respect to any personal data you upload to the Services or collect from Guard Users or other data subjects through the Services, including but not limited to: (a) employee and contractor consent for monitoring, location tracking, and data processing; (b) notices to individuals captured in incident report photographs or video; (c) lawful bases for processing under GDPR, CCPA, or other applicable laws; and (d) compliance with works council, union, or other labor representation requirements;",
          "Establishing and maintaining your own policies and procedures governing acceptable use of the Services by your personnel, including any additional restrictions beyond those set forth in these Terms, and ensuring your personnel are aware of and comply with such policies;",
          "Conducting your own due diligence to ensure that the Services meet your operational, legal, and compliance requirements, including any specific requirements applicable to your industry or jurisdiction (e.g., security industry regulations, evidence handling standards, record retention laws);",
          "Paying all fees and charges associated with your subscription in accordance with the applicable Order Form or billing agreement;",
          "Indemnifying, defending, and holding harmless the Company from and against any and all claims, damages, losses, liabilities, costs, and expenses (including reasonable attorneys' fees) arising out of or related to: (a) your use of the Services, including any use by your personnel; (b) any User Content submitted by you or your personnel; (c) any violation of these Terms by you or your personnel; (d) your violation of any applicable law or third-party right; (e) your failure to obtain required consents or provide required notices; or (f) any dispute between you and your personnel or between you and any third party arising from the Services.",
        ],
      },
      {
        type: "p",
        text: "IF YOU ARE A GUARD USER: You acknowledge that your Client Organization (employer, contractor, or security company) may have additional policies, procedures, and requirements that apply to your use of the Services, including but not limited to employment policies, codes of conduct, collective bargaining agreements, and operational protocols. These Terms do not supersede or replace such policies, and you remain obligated to comply with them. In the event of any conflict between these Terms and your Client Organization's policies, the more restrictive term shall apply to the extent permitted by law. We are not a party to any agreement between you and your Client Organization and disclaim any liability arising from such relationship.",
      },
    ],
  },
  {
    id: "third",
    title: "Third-Party Services and Integrations",
    blocks: [
      {
        type: "p",
        text: "The Services may integrate with, contain links to, or depend upon third-party services, applications, platforms, content, or websites (collectively, “Third-Party Services”). These Third-Party Services include, but are not limited to, mapping services (e.g., Google Maps, Mapbox), identity providers (e.g., Okta, Microsoft Azure AD), email services (e.g., SendGrid, Amazon SES), cloud infrastructure providers (e.g., AWS, Google Cloud, Microsoft Azure), analytics providers (e.g., Mixpanel, Google Analytics), and error monitoring services (e.g., Sentry).",
      },
      {
        type: "p",
        text: "Your use of Third-Party Services is governed solely by the terms of service and privacy policies of the respective third-party providers. We do not control, endorse, or assume any responsibility for the content, functionality, security, availability, or data practices of any Third-Party Service. YOU AGREE THAT WE ARE NOT LIABLE FOR ANY DAMAGES OR LOSSES ARISING FROM YOUR USE OF, RELIANCE UPON, OR INABILITY TO USE ANY THIRD-PARTY SERVICE, INCLUDING BUT NOT LIMITED TO:",
      },
      {
        type: "ul",
        items: [
          "Interruptions, delays, errors, or unavailability of Third-Party Services that affect the performance of our Services;",
          "Security breaches, data leaks, or unauthorized access to your data resulting from vulnerabilities in Third-Party Services;",
          "Changes to Third-Party Services (including deprecation, pricing changes, or discontinuation) that require corresponding changes to our Services or affect our ability to provide the same level of functionality;",
          "Non-compliance by a Third-Party Service with applicable laws, regulations, or industry standards;",
          "Any false, misleading, inaccurate, or incomplete content provided by a Third-Party Service (including map data, addresses, or directions).",
        ],
      },
      {
        type: "p",
        text: "We reserve the right to modify or discontinue integration with any Third-Party Service at any time without notice, including if the third-party changes its terms or pricing in a manner we deem commercially unreasonable. We will use commercially reasonable efforts to provide advance notice of such changes that materially affect the functionality of the Services.",
      },
    ],
  },
  {
    id: "fees",
    title: "Fees, Payments, and Billing",
    blocks: [
      {
        type: "p",
        text: "Access to certain features of the Services requires payment of fees as set forth in an Order Form, subscription agreement, or online checkout process. Unless otherwise specified in an Order Form, all fees are: (a) quoted in U.S. Dollars (USD) or such other currency as agreed; (b) non-cancelable, non-refundable, and non-creditable except as expressly set forth in these Terms or as required by applicable law; (c) exclusive of all taxes, duties, levies, or similar governmental assessments (including but not limited to VAT, GST, sales tax, use tax, or withholding tax), for which you are solely responsible; and (d) payable in advance for the Subscription Term, unless otherwise agreed in writing.",
      },
      {
        type: "p",
        text: "You authorize us or our payment processor to charge your designated payment method for all fees as they become due. You represent and warrant that you have the legal right to use the payment method you provide and that all information you provide is accurate and complete. If your payment method fails or your account is past due, we may suspend access to the Services until all outstanding fees are paid. Past due amounts may accrue interest at the rate of 1.5% per month (or the maximum lawful rate, if lower) from the due date until paid in full. You are responsible for all reasonable costs of collection (including attorneys' fees and collection agency fees) incurred in collecting past due amounts.",
      },
      {
        type: "p",
        text: "We reserve the right to change our fees upon thirty (30) days' advance written notice. Any fee change will apply at the start of the next Renewal Term (as defined below) following the notice period. Your continued use of the Services after the effective date of a fee change constitutes your acceptance of the new fees.",
      },
    ],
  },
  {
    id: "term-termination",
    title: "Term, Termination, and Suspension",
    blocks: [
      {
        type: "p",
        text: "SUBSCRIPTION TERM: For Client Organizations, the initial Subscription Term shall be as set forth in the applicable Order Form. Unless either party provides written notice of non-renewal at least thirty (30) days prior to the end of the then-current Subscription Term, the Subscription Term shall automatically renew for successive periods of equal duration (each, a “Renewal Term”) at the then-current fees. For Guard Users and other individual Users, your right to access the Services continues until terminated by either you or us, or until your Client Organization terminates your access.",
      },
      {
        type: "p",
        text: "TERMINATION FOR CONVENIENCE: You may terminate your account at any time by ceasing use of the Services and requesting account deletion by emailing ${LEGAL_SUPPORT_EMAIL}. We may terminate your account or suspend your access to the Services for any reason or no reason, with or without notice, to the fullest extent permitted by applicable law.",
      },
      {
        type: "p",
        text: "TERMINATION FOR CAUSE: Either party may terminate these Terms immediately upon written notice if the other party: (a) materially breaches these Terms and fails to cure such breach within thirty (30) days after receiving written notice thereof; (b) becomes insolvent, files for bankruptcy, or has a receiver or trustee appointed for its assets; or (c) ceases to do business in the ordinary course. Additionally, we may terminate your access to the Services immediately without notice if you violate the Acceptable Use Policy, engage in fraudulent or illegal activity, or pose a security risk to the Services or other Users.",
      },
      {
        type: "p",
        text: "EFFECTS OF TERMINATION: Upon termination of these Terms for any reason: (a) all licenses and rights granted to you hereunder immediately terminate; (b) you must immediately cease all use of the Services and delete or destroy any copies of software or documentation in your possession; (c) we may delete or deactivate your account and, subject to our Data Retention Policy and applicable law, delete User Content associated with your account; (d) any fees paid are non-refundable, and any unpaid fees for the remainder of the Subscription Term become immediately due and payable. The following sections shall survive termination: Ownership and Licenses (to the extent necessary to enforce rights accrued prior to termination), Disclaimer of Warranties, Limitation of Liability, Indemnity, Governing Law, and any other provision that by its nature should survive.",
      },
      {
        type: "p",
        text: "SUSPENSION: We may suspend your access to the Services immediately without liability if: (a) we reasonably believe that your use of the Services poses a security risk or may cause harm to us or others; (b) you are using the Services in violation of applicable law; (c) your payment is past due; or (d) we are required to do so by law or court order. We will make commercially reasonable efforts to notify you of any suspension and to limit the scope and duration of suspension to the extent feasible.",
      },
    ],
  },
  {
    id: "disclaimer",
    title: "Disclaimer of Warranties",
    blocks: [
      {
        type: "p",
        text: "TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, THE SERVICES, INCLUDING ALL SOFTWARE, CONTENT, DOCUMENTATION, AND RELATED MATERIALS, ARE PROVIDED “AS IS,” “AS AVAILABLE,” AND “WITH ALL FAULTS,” WITHOUT ANY WARRANTIES OF ANY KIND, WHETHER EXPRESS, IMPLIED, STATUTORY, OR OTHERWISE. THE COMPANY AND ITS AFFILIATES, LICENSORS, AND SERVICE PROVIDERS EXPRESSLY DISCLAIM ALL WARRANTIES, INCLUDING BUT NOT LIMITED TO:",
      },
      {
        type: "ul",
        items: [
          "THE IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, TITLE, QUIET ENJOYMENT, AND NON-INFRINGEMENT;",
          "ANY WARRANTY THAT THE SERVICES WILL MEET YOUR REQUIREMENTS, BE UNINTERRUPTED, TIMELY, SECURE, OR ERROR-FREE;",
          "ANY WARRANTY THAT DEFECTS OR ERRORS WILL BE CORRECTED;",
          "ANY WARRANTY REGARDING THE ACCURACY, RELIABILITY, COMPLETENESS, CURRENCY, OR QUALITY OF ANY DATA, INFORMATION, OR CONTENT OBTAINED THROUGH THE SERVICES, INCLUDING LOCATION DATA, CHECKPOINT SCANS, INCIDENT REPORTS, OR ANALYTICAL OUTPUTS;",
          "ANY WARRANTY THAT THE SERVICES WILL BE COMPATIBLE WITH YOUR DEVICE, OPERATING SYSTEM, OR THIRD-PARTY SOFTWARE;",
          "ANY WARRANTY REGARDING THE SECURITY OF DATA TRANSMITTED OVER THE INTERNET OR STORED ON OUR SYSTEMS, EXCEPT AS EXPRESSLY SET FORTH IN OUR SECURITY STATEMENTS OR DATA PROCESSING AGREEMENTS;",
          "ANY WARRANTY THAT THE SERVICES WILL BE AVAILABLE IN ANY PARTICULAR GEOGRAPHIC LOCATION OR THAT GEOGRAPHIC RESTRICTIONS WILL NOT APPLY TO YOUR USE; AND",
          "ANY WARRANTY ARISING FROM COURSE OF DEALING, COURSE OF PERFORMANCE, OR USAGE OF TRADE.",
        ],
      },
      {
        type: "p",
        text: "NO ADVICE OR INFORMATION, WHETHER ORAL OR WRITTEN, OBTAINED BY YOU FROM US OR THROUGH THE SERVICES SHALL CREATE ANY WARRANTY NOT EXPRESSLY STATED IN THESE TERMS. SOME JURISDICTIONS DO NOT ALLOW THE EXCLUSION OF IMPLIED WARRANTIES OR LIMITATIONS ON APPLICABLE STATUTORY RIGHTS, SO THE ABOVE EXCLUSIONS AND LIMITATIONS MAY NOT APPLY TO YOU TO THE EXTENT PROHIBITED BY LAW. IN SUCH JURISDICTIONS, OUR LIABILITY IS LIMITED TO THE GREATEST EXTENT PERMITTED BY LAW.",
      },
      {
        type: "p",
        text: "THE SERVICES ARE NOT DESIGNED, MANUFACTURED, OR INTENDED FOR USE IN HAZARDOUS ENVIRONMENTS REQUIRING FAIL-SAFE PERFORMANCE OR IN WHICH THE FAILURE OF THE SERVICES COULD LEAD DIRECTLY TO DEATH, PERSONAL INJURY, SEVERE PHYSICAL DAMAGE, OR ENVIRONMENTAL DISASTER (COLLECTIVELY, “HIGH-RISK ACTIVITIES”). YOU EXPRESSLY ASSUME ALL RISKS ASSOCIATED WITH USING THE SERVICES IN CONNECTION WITH HIGH-RISK ACTIVITIES, AND WE DISCLAIM ANY LIABILITY FOR ANY DAMAGES ARISING FROM SUCH USE.",
      },
    ],
  },
  {
    id: "liability",
    title: "Limitation of Liability",
    blocks: [
      {
        type: "p",
        text: "TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT SHALL THE COMPANY, ITS AFFILIATES, OFFICERS, DIRECTORS, EMPLOYEES, AGENTS, LICENSORS, OR SERVICE PROVIDERS BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, EXEMPLARY, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO:",
      },
      {
        type: "ul",
        items: [
          "LOSS OF PROFITS, REVENUE, GOODWILL, OR ANTICIPATED SAVINGS;",
          "LOSS OR CORRUPTION OF DATA (INCLUDING USER CONTENT, INCIDENT REPORTS, OR LOCATION HISTORIES);",
          "LOSS OF USE OF THE SERVICES OR ANY HARDWARE, SOFTWARE, OR EQUIPMENT;",
          "COSTS OF PROCURING SUBSTITUTE GOODS OR SERVICES;",
          "BUSINESS INTERRUPTION OR OPERATIONAL DELAYS;",
          "PERSONAL INJURY, PROPERTY DAMAGE, OR DEATH ARISING FROM OR RELATED TO YOUR USE OR INABILITY TO USE THE SERVICES;",
          "MISTAKES, OMISSIONS, INTERRUPTIONS, DELETION OF FILES, ERRORS, DEFECTS, VIRUSES, OR DELAYS IN OPERATION OR TRANSMISSION; AND",
          "ANY OTHER INDIRECT, SPECIAL, OR CONSEQUENTIAL LOSS OR DAMAGE, WHETHER BASED ON WARRANTY, CONTRACT, TORT (INCLUDING NEGLIGENCE AND GROSS NEGLIGENCE), PRODUCT LIABILITY, STATUTE, OR ANY OTHER LEGAL THEORY, EVEN IF THE COMPANY HAS BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.",
        ],
      },
      {
        type: "p",
        text: "TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, THE COMPANY'S TOTAL AGGREGATE LIABILITY FOR ALL CLAIMS ARISING OUT OF OR RELATING TO THESE TERMS OR THE SERVICES, WHETHER IN CONTRACT, TORT (INCLUDING NEGLIGENCE), OR OTHERWISE, SHALL BE LIMITED TO THE GREATER OF: (A) THE TOTAL FEES PAID OR PAYABLE BY YOU TO THE COMPANY FOR THE SERVICES DURING THE TWELVE (12) MONTH PERIOD IMMEDIATELY PRECEDING THE EVENT GIVING RISE TO THE CLAIM (OR, IF YOU HAVE PAID NO SUCH FEES, ONE HUNDRED U.S. DOLLARS (USD $100.00)); OR (B) THE MINIMUM AMOUNT REQUIRED BY APPLICABLE LAW.",
      },
      {
        type: "p",
        text: "THE FOREGOING LIMITATIONS SHALL APPLY EVEN IF ANY REMEDY STATED HEREIN FAILS OF ITS ESSENTIAL PURPOSE AND REGARDLESS OF WHETHER A PARTY KNEW OR SHOULD HAVE KNOWN OF THE POSSIBILITY OF SUCH DAMAGES. SOME JURISDICTIONS DO NOT ALLOW THE EXCLUSION OR LIMITATION OF LIABILITY FOR CONSEQUENTIAL OR INCIDENTAL DAMAGES, SO THE ABOVE LIMITATION MAY NOT APPLY TO YOU TO THE EXTENT PROHIBITED BY LAW. IN SUCH JURISDICTIONS, OUR LIABILITY IS LIMITED TO THE GREATEST EXTENT PERMITTED BY LAW.",
      },
      {
        type: "p",
        text: "YOU ACKNOWLEDGE AND AGREE THAT THE FEES CHARGED FOR THE SERVICES REFLECT THE ALLOCATION OF RISK SET FORTH IN THESE TERMS AND THAT THE LIMITATIONS OF LIABILITY CONTAINED HEREIN ARE AN ESSENTIAL BASIS OF THE BARGAIN BETWEEN THE PARTIES.",
      },
    ],
  },
  {
    id: "indemnity",
    title: "Indemnification Obligations",
    blocks: [
      {
        type: "p",
        text: "You agree to defend, indemnify, and hold harmless the Company, its affiliates, and each of their respective officers, directors, employees, agents, licensors, and service providers (collectively, the “Indemnified Parties”) from and against any and all claims, demands, actions, suits, proceedings, investigations, arbitrations, mediations, judgments, awards, settlements, losses, damages, liabilities, costs, and expenses (including reasonable attorneys’ fees, expert witness fees, court costs, and settlement costs) arising out of or related to:",
      },
      {
        type: "ul",
        items: [
          "Your use of the Services, including any use by your personnel or any third party accessing the Services through your account;",
          "Your User Content, including any claim that your User Content infringes, misappropriates, or violates any third-party intellectual property right, privacy right, publicity right, or other proprietary right;",
          "Your violation of these Terms, including the Acceptable Use Policy;",
          "Your violation of any applicable law, regulation, or third-party right;",
          "Your failure to obtain any required consents, authorizations, or approvals from your personnel, employees, contractors, data subjects, or any third party in connection with your use of the Services;",
          "Any dispute between you and your personnel, employees, contractors, or Client Organization (including disputes regarding employment, compensation, privacy, or data processing);",
          "Any inaccurate, incomplete, misleading, or falsified data provided by you or through your account; and",
          "Your negligence, willful misconduct, or fraud.",
        ],
      },
      {
        type: "p",
        text: "We reserve the right, at our own expense, to assume the exclusive defense and control of any matter otherwise subject to indemnification by you, in which event you will cooperate with us in asserting any available defenses. You shall not settle any claim that affects the Company or any other Indemnified Party without our prior written consent, which consent shall not be unreasonably withheld, conditioned, or delayed. This indemnification obligation survives termination of these Terms and your use of the Services.",
      },
    ],
  },
  {
    id: "ip",
    title: "Intellectual Property Rights",
    blocks: [
      {
        type: "p",
        text: "The Services, including all software, code, algorithms, databases, user interfaces, graphics, logos, trademarks, service marks, trade names, documentation, and all intellectual property rights therein (collectively, the “Company IP”), are and shall remain the sole and exclusive property of the Company or our licensors. Nothing in these Terms transfers or conveys to you any right, title, or interest in or to the Company IP, except the limited license rights expressly granted herein. All rights not expressly granted to you are reserved by the Company.",
      },
      {
        type: "p",
        text: "You are granted a limited, non-exclusive, non-transferable, non-sublicensable, revocable right to access and use the Services solely for your internal business purposes during the Subscription Term, subject to your compliance with these Terms. You shall not, and shall not permit any third party to, use the Company IP for any purpose other than as expressly authorized herein. You acknowledge that the Company IP constitutes valuable trade secrets and confidential information of the Company.",
      },
      {
        type: "p",
        text: "You agree not to challenge, contest, or otherwise impair the Company’s ownership of or rights in the Company IP, including any trademarks or service marks. Any unauthorized use of the Company IP is strictly prohibited and may result in termination of your account and legal action. You also agree to promptly notify us in writing of any suspected infringement of the Company IP of which you become aware.",
      },
    ],
  },
  {
    id: "confidentiality",
    title: "Confidentiality and Trade Secrets",
    blocks: [
      {
        type: "p",
        text: "In the course of using the Services, you may have access to certain non-public information of the Company that is designated as confidential or that reasonably should be understood to be confidential given the nature of the information and the circumstances of disclosure (“Confidential Information”). Confidential Information includes, but is not limited to: software source code, object code, algorithms, system architecture, security measures, pricing information, customer lists, business strategies, internal reports, and any information regarding the Company's product roadmap or research and development activities.",
      },
      {
        type: "p",
        text: "You agree to: (a) hold all Confidential Information in strict confidence; (b) not disclose Confidential Information to any third party without the Company's prior written consent; (c) not use Confidential Information for any purpose other than as necessary to use the Services as permitted by these Terms; (d) protect Confidential Information using the same degree of care you use to protect your own confidential information, but in no event less than reasonable care; and (e) promptly return or destroy all Confidential Information upon the Company's request or upon termination of these Terms.",
      },
      {
        type: "p",
        text: "Confidential Information does not include information that: (a) is or becomes publicly available through no fault of yours; (b) is rightfully received by you from a third party without restriction on disclosure; (c) is independently developed by you without reference to or reliance upon Confidential Information; or (d) is required to be disclosed by law or court order, provided you give us prompt notice and cooperate with any effort to obtain a protective order.",
      },
    ],
  },
  {
    id: "law",
    title: "Governing Law and Dispute Resolution",
    blocks: [
      {
        type: "p",
        text: LEGAL_GOVERNING_LAW_SUMMARY,
      },
      {
        type: "p",
        text: `BINDING ARBITRATION AND CLASS ACTION WAIVER: To the maximum extent permitted by applicable law, any dispute, claim, or controversy arising out of or relating to these Terms or the Services (including the breach, termination, enforcement, interpretation, or validity thereof) shall be resolved EXCLUSIVELY by binding arbitration administered by a neutral arbitration provider mutually agreed upon by the parties (or, if the parties cannot agree, by the American Arbitration Association (AAA) or Judicial Arbitration and Mediation Services (JAMS)), in accordance with its then-current commercial arbitration rules. The arbitration shall be conducted in ${LEGAL_JURISDICTION} in the English language, before a single arbitrator. Judgment on the arbitration award may be entered in any court having jurisdiction.`,
      },
      {
        type: "p",
        text: "YOU AND THE COMPANY AGREE THAT EACH MAY BRING CLAIMS AGAINST THE OTHER ONLY IN YOUR OR ITS INDIVIDUAL CAPACITY, AND NOT AS A PLAINTIFF OR CLASS MEMBER IN ANY PURPORTED CLASS OR REPRESENTATIVE PROCEEDING. THE ARBITRATOR MAY NOT CONSOLIDATE MORE THAN ONE PERSON'S CLAIMS AND MAY NOT OTHERWISE PRESIDE OVER ANY FORM OF CLASS OR REPRESENTATIVE PROCEEDING. IF THIS CLASS ACTION WAIVER IS DEEMED UNENFORCEABLE WITH RESPECT TO ANY CLAIM, THEN THAT CLAIM SHALL BE SEVERED FROM THE ARBITRATION AND BROUGHT IN COURT, WITH ALL OTHER CLAIMS REMAINING IN ARBITRATION.",
      },
      {
        type: "p",
        text: `For disputes that qualify for small claims court (or the equivalent in your jurisdiction), either party may elect to bring an individual action in small claims court instead of arbitration, provided the action remains in small claims court and is not removed or appealed to a higher court. All other disputes shall be resolved exclusively through arbitration.`,
      },
      {
        type: "p",
        text: `Notwithstanding the foregoing, either party may seek injunctive or other equitable relief in any court of competent jurisdiction to protect its intellectual property rights, confidential information, or to prevent the unauthorized use or disclosure of such information. The exclusive venue for any such equitable action shall be the courts of ${LEGAL_JURISDICTION}.`,
      },
    ],
  },
  {
    id: "changes",
    title: "Modifications to Terms",
    blocks: [
      {
        type: "p",
        text: "We reserve the right to modify, amend, or update these Terms at any time in our sole discretion. When we make material changes to these Terms, we will provide notice through appropriate channels, which may include: (a) posting the updated Terms on our website and within the Services; (b) sending an email to the email address associated with your account; (c) displaying an in-app notification upon your next login; or (d) requiring you to re-accept the updated Terms.",
      },
      {
        type: "p",
        text: `Unless a shorter period is required by law, changes become effective thirty (30) days after the date of notice for material changes, and immediately upon posting for non-material changes (such as clarifications, typographical corrections, or administrative updates). YOUR CONTINUED USE OF THE SERVICES AFTER THE EFFECTIVE DATE OF ANY UPDATED TERMS CONSTITUTES YOUR ACCEPTANCE OF THE UPDATED TERMS TO THE FULLEST EXTENT PERMITTED BY LAW. IF YOU DO NOT ACCEPT THE UPDATED TERMS, YOU MUST CEASE USING THE SERVICES AND CLOSE YOUR ACCOUNT.`,
      },
      {
        type: "p",
        text: "We maintain an archive of prior versions of these Terms for at least two (2) years following each update. Archived versions are available upon request by contacting us at ${LEGAL_SUPPORT_EMAIL}.",
      },
    ],
  },
  {
    id: "general",
    title: "General Provisions",
    blocks: [
      {
        type: "p",
        text: "ENTIRE AGREEMENT: These Terms, together with the Privacy Policy, any Order Forms, and any other documents expressly incorporated by reference, constitute the entire and exclusive agreement between you and the Company regarding your use of the Services, and supersede all prior or contemporaneous agreements, communications, representations, or understandings, whether written or oral.",
      },
      {
        type: "p",
        text: "SEVERABILITY: If any provision of these Terms is held to be invalid, illegal, or unenforceable by a court of competent jurisdiction or an arbitrator, such provision shall be enforced to the maximum extent possible, and the remaining provisions shall continue in full force and effect. The invalid, illegal, or unenforceable provision shall be deemed reformed to the minimum extent necessary to make it valid, legal, and enforceable while preserving the original intent of the parties.",
      },
      {
        type: "p",
        text: "WAIVER: No waiver of any provision of these Terms shall be effective unless in writing and signed by an authorized representative of the Company. The failure of the Company to enforce any provision of these Terms shall not constitute a waiver of the right to enforce such provision in the future, nor shall it constitute a waiver of any other provision.",
      },
      {
        type: "p",
        text: "ASSIGNMENT: You may not assign, delegate, or transfer these Terms or any of your rights or obligations hereunder, whether by operation of law or otherwise, without the Company's prior written consent. Any attempted assignment in violation of this section shall be null and void. The Company may assign these Terms without your consent to any affiliate or in connection with any merger, acquisition, reorganization, sale of all or substantially all of its assets, or similar transaction.",
      },
      {
        type: "p",
        text: "NOTICES: All notices under these Terms shall be in writing. Notices to the Company shall be sent by email to ${LEGAL_SUPPORT_EMAIL} or by certified mail to the Company's registered address. Notices to you shall be sent to the email address associated with your account or posted within the Services. Notices are deemed received upon the earlier of: (a) actual receipt; (b) if sent by email, twenty-four (24) hours after sending (unless the sender receives a delivery failure notification); (c) if posted within the Services, when first made available to you; or (d) if sent by certified mail, five (5) business days after mailing.",
      },
      {
        type: "p",
        text: "FORCE MAJEURE: Neither party shall be liable for any delay or failure to perform its obligations under these Terms (other than payment obligations) due to causes beyond its reasonable control, including but not limited to acts of God, natural disasters, war, terrorism, civil unrest, labor strikes, embargoes, governmental actions, pandemics, epidemics, quarantines, internet outages, power failures, cyberattacks, or failures of third-party services.",
      },
      {
        type: "p",
        text: "RELATIONSHIP OF THE PARTIES: The parties are independent contractors. Nothing in these Terms shall be construed to create a partnership, joint venture, agency, franchise, sales representative, or employment relationship between the parties. Neither party has the authority to bind the other or to incur any obligation on the other's behalf.",
      },
      {
        type: "p",
        text: "NO THIRD-PARTY BENEFICIARIES: These Terms are for the benefit of the parties only and are not intended to confer any rights or remedies upon any third party, except as expressly provided herein (including the Indemnified Parties as third-party beneficiaries of the indemnification obligations).",
      },
      {
        type: "p",
        text: "EXPORT CONTROL: The Services may be subject to export control laws and regulations, including the U.S. Export Control Regulations (EAR) and sanctions administered by OFAC. You agree to comply with all applicable export and re-export restrictions and to not access or use the Services in any prohibited country or for any prohibited purpose.",
      },
      {
        type: "p",
        text: "CONSUMER RIGHTS: If you are a consumer using the Services for personal, family, or household purposes (and not for commercial or employment purposes), certain consumer protection laws in your jurisdiction may provide you with rights that cannot be waived by these Terms. Nothing in these Terms is intended to limit such non-waivable statutory rights.",
      },
    ],
  },
  {
    id: "contact",
    title: "Contact Information",
    blocks: [
      {
        type: "p",
        text: `If you have any questions, comments, or concerns regarding these Terms of Service, please contact us at:`,
      },
      {
        type: "ul",
        items: [
          `Email: ${LEGAL_SUPPORT_EMAIL} (preferred)`,
          `Mail: ${LEGAL_OPERATOR_DISPLAY}, Attn: Legal Department, [Full Street Address], ${LEGAL_JURISDICTION} [Postal Code]`,
          `Phone: [Phone number with country code and business hours]`,
        ],
      },
      {
        type: "p",
        text: `We will acknowledge receipt of your inquiry within five (5) business days and will make a good faith effort to respond substantively within fifteen (15) business days.`,
      },
    ],
  },
];