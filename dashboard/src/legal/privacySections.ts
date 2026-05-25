import type { LegalSection } from "./legalSectionTypes";
import {
  LEGAL_EFFECTIVE_DATE,
  LEGAL_JURISDICTION,
  LEGAL_OPERATOR_DISPLAY,
  LEGAL_PRODUCT_NAME,
  LEGAL_SUPPORT_EMAIL,
} from "./legalMeta";

export const privacySections: LegalSection[] = [
  {
    id: "intro",
    title: "Introduction and Scope of This Privacy Policy",
    blocks: [
      {
        type: "p",
        text: `${LEGAL_OPERATOR_DISPLAY} (“we”, “us”, “our”, “the Company”, “the Data Controller”) operates ${LEGAL_PRODUCT_NAME}, which encompasses the guard mobile application, the client operations dashboard, associated application programming interfaces (APIs), and all related ancillary services (collectively referred to as the “Services”). This Privacy Policy (the “Policy”) constitutes a legally binding statement regarding our data processing activities and explains, in accordance with applicable data protection laws including but not limited to the General Data Protection Regulation (GDPR), the California Consumer Privacy Act (CCPA), the California Privacy Rights Act (CPRA), the UK GDPR, and other global privacy frameworks, the manner in which we collect, use, disclose, transfer, store, protect, and otherwise process personal data when you access or use the Services. Effective Date: ${LEGAL_EFFECTIVE_DATE}.`,
      },
      {
        type: "p",
        text: "THIS POLICY IS A LEGALLY ENFORCEABLE DOCUMENT. By accessing, downloading, installing, or using the Services in any manner, you expressly acknowledge that you have read, understood, and agree to be bound by the terms and conditions set forth herein. IF YOU DO NOT AGREE WITH ANY PROVISION OF THIS POLICY, YOU ARE PROHIBITED FROM USING THE SERVICES AND MUST IMMEDIATELY CEASE ANY USE THEREOF.",
      },
      {
        type: "p",
        text: "This Policy is intended to be read in conjunction with our Terms of Service, any applicable end user license agreements, and any other notices or consents we may provide to you at the time of data collection. In the event of any conflict between this Policy and any other agreement, this Policy shall control with respect to privacy and data protection matters unless explicitly stated otherwise in writing.",
      },
    ],
  },
  {
    id: "definitions",
    title: "Definitions and Interpretation",
    blocks: [
      {
        type: "p",
        text: "For the purposes of this Policy, the following terms shall have the meanings ascribed to them below, unless the context otherwise requires:",
      },
      {
        type: "ul",
        items: [
          "“Personal Data” means any information relating to an identified or identifiable natural person (‘data subject’); an identifiable natural person is one who can be identified, directly or indirectly, in particular by reference to an identifier such as a name, an identification number, location data, an online identifier, or to one or more factors specific to the physical, physiological, genetic, mental, economic, cultural, or social identity of that natural person.",
          "“Processing” means any operation or set of operations which is performed upon personal data, whether or not by automated means, such as collection, recording, organization, structuring, storage, adaptation or alteration, retrieval, consultation, use, disclosure by transmission, dissemination or otherwise making available, alignment or combination, restriction, erasure, or destruction.",
          "“Data Controller” means the natural or legal person, public authority, agency, or other body which, alone or jointly with others, determines the purposes and means of the processing of personal data.",
          "“Data Processor” means a natural or legal person, public authority, agency, or other body which processes personal data on behalf of the Data Controller.",
          "“Data Subject” means an identified or identifiable natural person whose personal data is being processed.",
          "“Supervisory Authority” means an independent public authority established by a Member State of the European Union or other jurisdiction pursuant to applicable data protection law.",
        ],
      },
      {
        type: "p",
        text: "Capitalized terms not otherwise defined herein shall have the meaning given to them in applicable data protection legislation or our Terms of Service, as the case may be.",
      },
    ],
  },
  {
    id: "controller",
    title:
      "Data Controller Identification and Joint Controllership Arrangements",
    blocks: [
      {
        type: "p",
        text: `For all personal data processed in connection with ${LEGAL_PRODUCT_NAME}, the primary Data Controller is ${LEGAL_OPERATOR_DISPLAY}, with its principal place of business as set forth in our Terms of Service. The designated Data Protection Officer (DPO) or privacy contact person can be reached via email at ${LEGAL_SUPPORT_EMAIL} or by mail at our registered address. All data subject requests, privacy inquiries, and complaints should be directed to this contact.`,
      },
      {
        type: "p",
        text: "IMPORTANT NOTICE REGARDING EMPLOYMENT DATA: If you are a guard applicant, current guard, former guard, or employee of a client organization that utilizes our Services, your employer, contracting entity, or security company (the “Client Organization”) may act as an independent Data Controller, joint controller, or Data Processor with respect to certain workforce-related data that they upload, configure, or otherwise make available through the dashboard. In such circumstances, the Client Organization bears primary responsibility for providing you with appropriate privacy notices, obtaining any necessary consents, and establishing the legal basis for processing under applicable law. We act as a Data Processor (or sub-processor) with respect to such data, processing it solely on behalf of and under the instructions of the Client Organization. We encourage you to review the privacy policy of your employer or contracting entity in addition to this Policy to fully understand how your personal data is collected, used, and shared in the employment context.",
      },
      {
        type: "p",
        text: "Where we and a Client Organization act as joint controllers, we have entered into an agreement that allocates responsibilities between us in accordance with Article 26 of the GDPR or equivalent provisions under other applicable laws. Notwithstanding any such allocation, you may exercise your rights under applicable data protection law against each joint controller individually.",
      },
    ],
  },
  {
    id: "lawful-bases",
    title: "Lawful Bases for Processing (GDPR and Similar Regimes)",
    blocks: [
      {
        type: "p",
        text: "To the extent that the General Data Protection Regulation (Regulation (EU) 2016/679) or substantially similar legislation applies to our processing of your personal data, we rely upon the following lawful bases for processing, each as more particularly described below:",
      },
      {
        type: "ul",
        items: [
          "Consent: You have given clear, affirmative, unambiguous, and freely given consent for us to process your personal data for a specific purpose. You have the right to withdraw your consent at any time without affecting the lawfulness of processing based on consent before its withdrawal.",
          "Contractual Necessity: Processing is necessary for the performance of a contract to which you are a party, or in order to take steps at your request prior to entering into a contract. This includes providing the core functionality of our Services, user authentication, and account management.",
          "Legal Obligation: Processing is necessary for compliance with a legal obligation to which we are subject, including but not limited to retention of records, responses to lawful governmental requests, and compliance with court orders.",
          "Vital Interests: Processing is necessary in order to protect the vital interests of you or another natural person. This includes emergency situations involving threats to life, health, or safety, such as panic button activations or incident reporting involving imminent danger.",
          "Legitimate Interests: Processing is necessary for the purposes of the legitimate interests pursued by us or by a third party, except where such interests are overridden by your fundamental rights and freedoms. Our legitimate interests include: (a) preventing fraud, abuse, and unauthorized access to our Services; (b) maintaining the security, integrity, and availability of our systems; (c) improving and developing new features and functionality; (d) enforcing our legal rights and defending against claims; (e) conducting internal analytics and performance monitoring; and (f) engaging in direct marketing of similar services to existing business customers, subject to applicable opt-out rights.",
        ],
      },
      {
        type: "p",
        text: "For processing activities based on legitimate interests, we have conducted a Legitimate Interests Assessment (LIA) as required under applicable law, balancing our interests against your rights and freedoms. You have the right to object, on grounds relating to your particular situation, to processing based on legitimate interests by contacting us as set forth above.",
      },
    ],
  },
  {
    id: "categories",
    title: "Detailed Categories of Personal Data We Process",
    blocks: [
      {
        type: "p",
        text: "We process the following categories of personal data, which we have organized by data subject role and processing context. This list is exhaustive and reflects our current data inventory as required under Article 30 of the GDPR:",
      },
      {
        type: "h3",
        text: "A. Identity and Account Data",
      },
      {
        type: "ul",
        items: [
          "Legal name (first, middle initial or name where applicable, and last/family name);",
          "Professional or business email address (distinct from personal email where provided);",
          "Business telephone number and, where necessary for emergency contact purposes, personal telephone number;",
          "Company or organizational name, department, job title, and role within the organization;",
          "Unique user identifiers, usernames, and authentication credentials, including password hashes (salted using industry-standard cryptographic hashing algorithms; we do not store plaintext passwords or reversibly encrypted passwords);",
          "Session tokens, refresh tokens, and JSON Web Tokens (JWTs) for authentication and session management;",
          "Multi-factor authentication (MFA) settings and recovery codes where you have enabled this security feature;",
          "Profile photographs or avatars if you voluntarily upload such images;",
          "Preferred language and communication preferences.",
        ],
      },
      {
        type: "h3",
        text: "B. Guard Onboarding, Compliance, and Workforce Data",
      },
      {
        type: "ul",
        items: [
          "Date of birth and age verification information (for compliance with minimum age and employment eligibility requirements);",
          "Country or countries of citizenship, residency status, and work authorization documentation where required by client organizations;",
          "Emergency contact information, including names, relationships, and telephone numbers of designated emergency contacts;",
          "Government-issued identification documents, including but not limited to passport numbers, national identification card numbers, driver's license numbers, and, where you choose to upload them, scanned copies or photographs of such documents;",
          "Background check information, including results of criminal history checks where authorized by law and with appropriate consent;",
          "Training and certification records, including completion dates, certification numbers, and expiration dates for security-related credentials;",
          "Employment history, qualifications, and other information provided during the application or onboarding process;",
          "Biometric data (only where explicitly consented to and where required for time and attendance tracking or identity verification; we do not collect biometric data without separate, explicit consent);",
          "Email verification status, timestamps, and confirmation codes.",
        ],
      },
      {
        type: "h3",
        text: "C. Operational, Security, and Location Data",
      },
      {
        type: "ul",
        items: [
          "Shift data: shift start times, shift end times, scheduled versus actual shift durations, break times, overtime calculations, and associated metadata;",
          "Assigned sites and zones: physical addresses, GPS coordinates, site names, zone designations, and access permissions;",
          "Checkpoint scan events: unique QR code identifiers, RFID tag identifiers, NFC tag identifiers, timestamp of each scan, device identifier used for scanning, and verification outcome (success/failure/rejection);",
          "GPS location data: precise geolocation information (latitude and longitude coordinates) collected when you use location-dependent features such as geofenced shift commencement, checkpoint verification, route evidence logging, or panic button activations. Location data is collected only when you have granted the requisite permissions through your device operating system and when you are actively using location-enabled features;",
          "Approximate location derived from IP address geolocation databases (city/region/country level, non-precise);",
          "Wi-Fi and Bluetooth signal data where used to enhance location accuracy or verify proximity to checkpoints;",
          "Motion data and accelerometer information where used to detect falls, unusual activity, or device tampering.",
        ],
      },
      {
        type: "h3",
        text: "D. Incident Reports and Evidentiary Data",
      },
      {
        type: "ul",
        items: [
          "Incident descriptions, narratives, classifications, and categorizations (e.g., theft, trespass, medical emergency, fire, vandalism, suspicious activity);",
          "Timestamps of incident creation, updates, resolution, and any other significant milestones;",
          "Geolocation data associated with incidents, including address, GPS coordinates, and named locations;",
          "Media attachments, including photographs, video recordings, audio recordings, and digital signatures that you or other authorized users choose to submit in connection with incident reports. Such media may contain additional personal data (e.g., images of individuals, license plates, or property) and should only be submitted in compliance with applicable laws;",
          "Witness statements, witness contact information, and witness signatures where collected;",
          "Property and evidence logs, including chain of custody information;",
          "Follow-up actions, corrective measures taken, and internal investigation notes.",
        ],
      },
      {
        type: "h3",
        text: "E. Device, Technical, and Usage Data",
      },
      {
        type: "ul",
        items: [
          "IP address (including IPv4 and IPv6 addresses) from which you access our Services;",
          "Device identifiers, including Android ID, IDFA (Identifier for Advertisers), Google Advertising ID, or other platform-specific identifiers;",
          "Device type, brand, model, and manufacturer;",
          "Operating system name, version, build number, and update status;",
          "Application version number, build number, and installation identifier;",
          "Mobile network carrier, connection type (Wi-Fi, cellular, ethernet), network speed, and signal strength;",
          "Browser type, browser version, browser language, and plugins installed (for web-based interfaces);",
          "Screen resolution, color depth, and device orientation capabilities;",
          "Diagnostic logs, including crash reports, exception logs, stack traces, and error messages;",
          "Performance monitoring data, including API response times, load times, and resource utilization metrics;",
          "Feature usage analytics, including which features are accessed, frequency of use, duration of use, and sequence of actions;",
          "Referrer URLs (the website or page that directed you to our Services);",
          "Timestamps of each request, session start and end times, and idle periods.",
        ],
      },
      {
        type: "h3",
        text: "F. Communications and Support Data",
      },
      {
        type: "ul",
        items: [
          "Email communications you send to us, including support tickets, inquiries, complaints, and feedback;",
          "In-app chat messages, including both live chat and asynchronous messaging;",
          "Telephone call recordings where permitted by law and where you have consented to such recording;",
          "Email delivery metadata, including open rates, click-through rates, bounce notifications, and unsubscribe requests;",
          "Survey responses and feedback forms that you voluntarily complete;",
          "Interactions with our customer support team, including notes, resolutions, and follow-up communications.",
        ],
      },
      {
        type: "h3",
        text: "G. Registration and Visitor Data",
      },
      {
        type: "ul",
        items: [
          "Data entered into optional registration forms configured by client organizations, which may include: full name, contact information (email, phone, address), organization affiliation, purpose of visit, host name, date and time of visit, vehicle information, and any other fields designated by the client organization;",
          "Check-in and check-out timestamps;",
          "Visitor badges issued, including badge numbers and access permissions;",
          "Non-disclosure agreements (NDAs) or other legal documents signed electronically;",
          "Temperature readings or health screening information where required for public health purposes.",
        ],
      },
    ],
  },
  {
    id: "purposes",
    title: "Purposes of Processing and Legal Bases Mapping",
    blocks: [
      {
        type: "p",
        text: "We process personal data for the specific, explicit, and legitimate purposes set forth below. For each purpose, we have identified the corresponding legal bases under applicable data protection law and, where relevant, the categories of personal data involved:",
      },
      {
        type: "h3",
        text: "Purpose 1: Service Provision, Account Management, and Core Functionality",
      },
      {
        type: "ul",
        items: [
          "Legal Bases: Contractual Necessity (Article 6(1)(b) GDPR), Legitimate Interests (Article 6(1)(f) GDPR)",
          "Data Categories: Identity and account data, guard onboarding data, operational data",
          "Description: Creating and managing user accounts, authenticating users, synchronizing data across devices, providing dashboards and reporting features, maintaining user preferences, enabling shift management functionality, and delivering all core features of the Services.",
        ],
      },
      {
        type: "h3",
        text: "Purpose 2: Identity Verification and Eligibility Determination",
      },
      {
        type: "ul",
        items: [
          "Legal Bases: Legal Obligation (Article 6(1)(c) GDPR), Contractual Necessity (Article 6(1)(b) GDPR), Legitimate Interests (Article 6(1)(f) GDPR)",
          "Data Categories: Guard onboarding and compliance data, identity and account data",
          "Description: Verifying your identity when you create an account, reset your password, or request access to your data; confirming eligibility and qualifications for guard positions where required by client organizations or applicable law; conducting email verification and, where implemented, phone number verification; validating government identification documents where required for compliance purposes.",
        ],
      },
      {
        type: "h3",
        text: "Purpose 3: Safety, Security, Fraud Prevention, and Enforcement",
      },
      {
        type: "ul",
        items: [
          "Legal Bases: Legitimate Interests (Article 6(1)(f) GDPR), Legal Obligation (Article 6(1)(c) GDPR), Vital Interests (Article 6(1)(d) GDPR)",
          "Data Categories: All categories, with particular emphasis on location data, incident reports, technical data",
          "Description: Detecting, preventing, and investigating security incidents, fraud, unauthorized access, and misuse of our Services; enforcing our Terms of Service and other agreements; responding to panic button activations and emergency situations; protecting the life, health, and safety of individuals; conducting forensic investigations; logging access attempts and system activities; implementing and monitoring security measures; cooperating with law enforcement investigations where required or permitted by law.",
        ],
      },
      {
        type: "h3",
        text: "Purpose 4: Service Improvement, Analytics, and Product Development",
      },
      {
        type: "ul",
        items: [
          "Legal Bases: Legitimate Interests (Article 6(1)(f) GDPR), Consent (Article 6(1)(a) GDPR) for certain analytics features",
          "Data Categories: Device and technical data, usage data, operational data (aggregated or pseudonymized where possible)",
          "Description: Analyzing usage patterns and trends to improve the performance, reliability, and user experience of our Services; debugging and fixing errors; developing new features and functionality; conducting A/B testing and user research; capacity planning and infrastructure optimization; generating aggregate statistics and anonymized reports; training machine learning models for fraud detection or incident classification (using only anonymized or pseudonymized data).",
        ],
      },
      {
        type: "h3",
        text: "Purpose 5: Communications, Notifications, and Customer Support",
      },
      {
        type: "ul",
        items: [
          "Legal Bases: Contractual Necessity (Article 6(1)(b) GDPR), Legitimate Interests (Article 6(1)(f) GDPR), Consent (Article 6(1)(a) GDPR) for marketing communications where required",
          "Data Categories: Identity and account data, communications data",
          "Description: Sending you service-related notifications, security alerts, and policy updates; responding to support inquiries and troubleshooting issues; providing onboarding assistance and training; sending marketing communications about our services only where you have consented or where permitted under applicable law (with clear opt-out mechanisms); conducting customer satisfaction surveys; managing newsletter subscriptions.",
        ],
      },
      {
        type: "h3",
        text: "Purpose 6: Legal Compliance and Regulatory Obligations",
      },
      {
        type: "ul",
        items: [
          "Legal Bases: Legal Obligation (Article 6(1)(c) GDPR), Legitimate Interests (Article 6(1)(f) GDPR)",
          "Data Categories: All categories as necessary for specific compliance obligations",
          "Description: Complying with applicable laws, regulations, court orders, subpoenas, and other legal processes; responding to requests from supervisory authorities, law enforcement, and other government agencies; maintaining records as required by employment, tax, and data protection laws; fulfilling data breach notification obligations; complying with data retention and deletion requirements; responding to data subject rights requests.",
        ],
      },
    ],
  },
  {
    id: "sensitive-data",
    title: "Special Categories of Personal Data (Sensitive Data)",
    blocks: [
      {
        type: "p",
        text: "Under Article 9 of the GDPR and similar provisions in other data protection laws, certain categories of personal data are considered 'sensitive' or 'special categories' of data, including data revealing racial or ethnic origin, political opinions, religious or philosophical beliefs, trade union membership, genetic data, biometric data for the purpose of uniquely identifying a natural person, data concerning health, or data concerning a natural person's sex life or sexual orientation.",
      },
      {
        type: "p",
        text: "We generally do NOT collect or process sensitive categories of personal data, with the following limited exceptions where we have obtained your explicit consent (Article 9(2)(a) GDPR) or where processing is necessary for reasons of substantial public interest (Article 9(2)(g) GDPR) or for the establishment, exercise, or defense of legal claims (Article 9(2)(f) GDPR):",
      },
      {
        type: "ul",
        items: [
          "Biometric data: Where you voluntarily elect to use biometric authentication features (e.g., fingerprint or facial recognition for device unlock), we may collect and process biometric templates or hashes solely for authentication purposes and only with your explicit, written consent. Biometric data is stored locally on your device whenever possible and is not shared with our servers unless strictly necessary for the functionality requested.",
          "Health data: Incident reports may contain information about physical injuries, medical emergencies, or health conditions where such information is necessary for responding to emergencies, filing insurance claims, or complying with workplace safety reporting obligations. We limit our collection of health data to that which is strictly necessary for the specific incident reporting purpose.",
        ],
      },
      {
        type: "p",
        text: "We do NOT collect or process data concerning racial or ethnic origin, political opinions, religious or philosophical beliefs, trade union membership, or sex life or sexual orientation. If a client organization uploads or configures fields that could collect such data, the client organization bears sole responsibility for ensuring appropriate legal bases for processing, including obtaining explicit consent where required.",
      },
    ],
  },
  {
    id: "location",
    title: "Location Data: Detailed Disclosure and Consent Requirements",
    blocks: [
      {
        type: "p",
        text: "Our Services include features that rely on collection of precise geolocation data, which may constitute sensitive data under certain legal frameworks such as the California Consumer Privacy Act (CCPA/CPRA) and the GDPR where it can be used to track an individual's movements. We are committed to transparency and user control regarding location data:",
      },
      {
        type: "ul",
        items: [
          "COLLECTION TRIGGERS: Location data is collected only when you actively use location-dependent features, including: (a) initiating or concluding a shift with geofencing enabled, (b) scanning NFC, QR, or RFID checkpoints that require location verification, (c) creating incident reports with location tagging, (d) activating panic buttons or emergency features, (e) logging route evidence or patrol paths, and (f) using any feature that explicitly requests location information.",
          "PERMISSION REQUIREMENTS: We do not collect location data unless you have granted the requisite permissions through your device operating system (Android or iOS). You control location permissions at the operating system level and may modify, grant, or revoke such permissions at any time through your device settings. We respect your device's location permission settings and do not attempt to circumvent them.",
          "BACKGROUND LOCATION: We do NOT collect location data when the application is in the background (i.e., when you are not actively using the application) except to the extent strictly necessary to complete an action you initiated while the app was in the foreground (e.g., completing a shift that spans across periods of background activity). We do not engage in continuous background location tracking for analytics, marketing, or any purpose not directly tied to a user-initiated feature.",
          "PRECISION: We collect precise GPS location data (accurate to within approximately 5-10 meters under typical conditions) when you use location-enabled features. We also may collect approximate location derived from IP address databases (accurate to city or region level) even when GPS permissions are not granted, solely for security, fraud prevention, and compliance with geographic restrictions.",
          "DATA RETENTION: Location data is retained in accordance with our retention schedule set forth in Section [Retention]. We retain shift-related location data for the duration of our contractual relationship with the applicable client organization plus any additional period required for legal compliance or dispute resolution. Incident-related location data is retained for the longer of (a) the incident retention period required by the client organization, or (b) any applicable statute of limitations for claims arising from such incident.",
          "WITHDRAWAL OF CONSENT: You may withdraw your consent to location collection at any time by: (a) changing your device location permissions (settings → applications → ${LEGAL_PRODUCT_NAME} → permissions → location → deny/remove), (b) contacting us to request deletion of previously collected location data, or (c) ceasing use of location-dependent features while continuing to use other features that do not require location. You are hereby notified that withdrawing consent for location collection will render certain features inoperable, including geofenced shift tracking, checkpoint verification, and location-based incident reporting. We will not penalize you for withdrawing consent nor condition your use of non-location-dependent features on your provision of location data.",
        ],
      },
    ],
  },
  {
    id: "sharing",
    title:
      "Disclosure of Personal Data to Third Parties and Categories of Recipients",
    blocks: [
      {
        type: "p",
        text: "We do not and will not sell your personal data to any third party for monetary or other valuable consideration. 'Sell' is defined broadly under laws such as the CCPA/CPRA to include any transfer of personal data for valuable consideration. We do not engage in such transfers. However, we may share your personal data with the following categories of recipients as necessary for the purposes described in this Policy:",
      },
      {
        type: "h3",
        text: "A. Client Organizations (Employers/Contracting Entities)",
      },
      {
        type: "p",
        text: "We share personal data with the client organization that employs you, contracts with you, or otherwise authorizes your use of our Services, but only to the extent necessary for the client organization's operations, compliance, and incident management as configured in their account. The specific data shared with the client organization includes:",
      },
      {
        type: "ul",
        items: [
          "Identity and account data (name, contact information, role, permissions);",
          "Guard onboarding and compliance data (training records, certification status, eligibility verification results);",
          "Operational data (shift schedules, attendance, time records, assigned sites, checkpoint completion data);",
          "Incident reports created by you or within your area of responsibility;",
          "Location data (shift tracking information, patrol routes, location histories);",
          "Performance analytics and metrics (response times, completion rates, quality assurance scores where implemented).",
          "The client organization may further share this data with their own service providers, affiliates, or legal advisors as permitted by their own privacy policies and applicable law.",
        ],
      },
      {
        type: "h3",
        text: "B. Service Providers and Subprocessors",
      },
      {
        type: "p",
        text: "We engage third-party service providers who assist us in delivering the Services, including but not limited to:",
      },
      {
        type: "ul",
        items: [
          "Cloud hosting and infrastructure providers (e.g., Amazon Web Services, Google Cloud Platform, Microsoft Azure) that store and process data on our behalf;",
          "Database and storage providers;",
          "Email delivery and communication platform providers;",
          "Customer support and ticketing system providers;",
          "Analytics and error monitoring providers (e.g., Sentry, LogRocket, Mixpanel, Google Analytics);",
          "Content delivery networks (CDNs) for media assets;",
          "Security and fraud prevention services;",
          "Payment processing providers (for client billing, not for individual guard data);",
          "Background check and identity verification services (where applicable and with your consent).",
        ],
      },
      {
        type: "p",
        text: "We enter into data processing agreements (DPAs) with all service providers that process personal data on our behalf, as required under Article 28 of the GDPR and equivalent provisions in other laws. These agreements contractually obligate service providers to process personal data only in accordance with our instructions, to implement appropriate security measures, and to promptly notify us of any data breaches. A complete, up-to-date list of our subprocessors is available upon request.",
      },
      {
        type: "h3",
        text: "C. Professional Advisors and Auditors",
      },
      {
        type: "p",
        text: "We may disclose personal data to our professional advisors, including lawyers, accountants, auditors, insurers, and consultants, when such disclosure is reasonably necessary for the provision of professional services, legal compliance, risk management, or dispute resolution. Such recipients are bound by confidentiality obligations and may not use your personal data for any purpose other than providing services to us.",
      },
      {
        type: "h3",
        text: "D. Law Enforcement, Regulatory Authorities, and Legal Process",
      },
      {
        type: "p",
        text: "WE MAY DISCLOSE YOUR PERSONAL DATA TO THIRD PARTIES WITHOUT YOUR CONSENT WHEN REQUIRED BY LAW OR IN RESPONSE TO VALID LEGAL PROCESS, INCLUDING BUT NOT LIMITED TO:",
      },
      {
        type: "ul",
        items: [
          "In response to a subpoena, court order, search warrant, or other lawful government request, whether civil or criminal in nature;",
          "To comply with applicable laws, regulations, rules, or ordinances;",
          "To cooperate with law enforcement investigations of suspected or actual illegal activity;",
          "To protect our rights, property, or safety, or the rights, property, or safety of others, including in connection with the prevention or investigation of fraud, security incidents, or threats to public safety;",
          "To establish, exercise, or defend against legal claims;",
          "To respond to emergency situations involving an imminent threat of death or serious physical injury to any individual, including panic button activations and incident reports with life-safety implications;",
          "To comply with reporting obligations under mandatory reporting laws (e.g., child abuse or elder abuse reporting).",
        ],
      },
      {
        type: "h3",
        text: "E. Corporate Transactions (Mergers, Acquisitions, Bankruptcy)",
      },
      {
        type: "p",
        text: "In the event of a merger, acquisition, reorganization, sale of assets, bankruptcy, or other similar corporate transaction, your personal data may be transferred to the acquiring entity or successor-in-interest as part of the transaction. We will provide advance notice of such transfer where required by applicable law and will require the acquiring entity to honor the commitments made in this Policy or to provide you with notice and choice before using your personal data for purposes materially different from those set forth herein.",
      },
    ],
  },
  {
    id: "transfers",
    title: "International Data Transfers and Cross-Border Data Flows",
    blocks: [
      {
        type: "p",
        text: `Our infrastructure, subprocessors, and personnel may be located in various countries, which may include countries outside of ${LEGAL_JURISDICTION} that do not provide the same level of data protection as your home jurisdiction. Specifically, we may transfer personal data to countries including, but not limited to, the United States, member states of the European Union, the United Kingdom, and other jurisdictions where our service providers maintain facilities.`,
      },
      {
        type: "p",
        text: "WHEN WE TRANSFER PERSONAL DATA ACROSS INTERNATIONAL BORDERS, WE IMPLEMENT APPROPRIATE SAFEGUARDS AS REQUIRED BY APPLICABLE DATA PROTECTION LAW, INCLUDING:",
      },
      {
        type: "ul",
        items: [
          "European Union Standard Contractual Clauses (SCCs) adopted by the European Commission, as updated pursuant to Implementing Decision (EU) 2021/914, which impose data protection obligations on the parties transferring data, including obligations to ensure that data subjects have enforceable rights and effective legal remedies;",
          "The EU-US Data Privacy Framework (DPF) and its successors, where applicable, for transfers to certified entities in the United States;",
          "The UK International Data Transfer Agreement (IDTA) or UK Addendum to the EU SCCs for transfers subject to UK data protection law;",
          "Binding Corporate Rules (BCRs) for intra-group transfers, where applicable;",
          "Approved codes of conduct or certification mechanisms, where available;",
          "Express contractual commitments from recipients that incorporate standard data protection clauses or equivalent safeguards;",
          "Transfer impact assessments (TIAs) to evaluate and mitigate risks associated with international transfers, including assessment of surveillance laws and government access practices in recipient countries.",
        ],
      },
      {
        type: "p",
        text: "We conduct transfer impact assessments (TIAs) prior to making any restricted transfer of personal data to a country that the European Commission has not determined to provide adequate protection. These assessments evaluate the laws and practices of the recipient country, including any surveillance or national security laws that may permit government authorities to access transferred data. Where necessary, we implement supplementary measures to ensure an essentially equivalent level of protection. Copies of our TIAs and information about supplementary measures are available upon request.",
      },
      {
        type: "p",
        text: "You have the right to obtain a copy of the appropriate safeguards under which your personal data is transferred to a third country or international organization. To request such information, please contact us at the email address provided above.",
      },
    ],
  },
  {
    id: "retention",
    title: "Data Retention: Periods and Criteria",
    blocks: [
      {
        type: "p",
        text: "We retain personal data for no longer than is necessary for the purposes for which it was collected, or as required to comply with legal obligations, resolve disputes, enforce our agreements, or protect our legitimate interests. Our retention practices are documented in our formal Data Retention and Erasure Policy, which is available upon request. The specific retention periods vary by data category as follows:",
      },
      {
        type: "h3",
        text: "A. Account and Identity Data",
      },
      {
        type: "ul",
        items: [
          "Active user accounts: Retained for the duration of your employment or contractual relationship with the client organization plus up to ninety (90) days post-termination to facilitate account reactivation or data export.",
          "Inactive user accounts: Retained for up to two (2) years from the date of last login, after which the account may be scheduled for deletion with notice provided to the account owner and client organization.",
          "Authentication credentials: Password hashes retained until account deletion; session tokens retained for up to thirty (30) days or until logout, whichever occurs first.",
        ],
      },
      {
        type: "h3",
        text: "B. Operational and Shift Data",
      },
      {
        type: "ul",
        items: [
          "Shift records, checkpoint logs, and patrol data: Retained for the duration of the contractual relationship with the applicable client organization plus three (3) years, unless a longer retention period is (i) required by the client organization's policies, (ii) reasonably necessary for pending litigation or claims, or (iii) required by applicable law.",
          "Time and attendance records: Retained for the longer of (i) three (3) years, or (ii) the period required by applicable employment and tax laws in the relevant jurisdiction.",
        ],
      },
      {
        type: "h3",
        text: "C. Incident Reports",
      },
      {
        type: "ul",
        items: [
          "Incident reports and associated media (photographs, videos, audio recordings, signatures): Retained for the longer of (i) seven (7) years from the date of incident closure, (ii) the applicable statute of limitations for any claims arising from such incident (which may be up to ten (10) years or longer depending on jurisdiction), (iii) any period required by the client organization's document retention policy, or (iv) any period required by applicable law or regulation.",
          "Incident reports involving minors, personal injury, or potential criminal liability: Retained for the longer of the periods above or until the minor reaches the age of majority plus the applicable statute of limitations (typically up to twenty (20) years).",
        ],
      },
      {
        type: "h3",
        text: "D. Location Data",
      },
      {
        type: "ul",
        items: [
          "Precise GPS location data: Retained for the longer of (i) the duration of the shift or patrol to which it relates, plus three (3) years, or (ii) any retention period required by the client organization or applicable law.",
          "Aggregated or anonymized location data (which no longer identifies a specific individual): May be retained indefinitely for analytics and infrastructure planning purposes.",
        ],
      },
      {
        type: "h3",
        text: "E. Technical and Log Data",
      },
      {
        type: "ul",
        items: [
          "Server access logs (IP addresses, timestamps, requested resources): Retained for up to twelve (12) months for security and debugging purposes, after which logs are rotated and deleted except where preserved in connection with a specific security incident or legal hold.",
          "Application error logs and crash reports: Retained for up to ninety (90) days to facilitate debugging and performance improvements.",
          "Analytics data (aggregated or pseudonymized): May be retained for up to twenty-four (24) months to identify long-term usage trends.",
        ],
      },
      {
        type: "h3",
        text: "F. Deletion and Anonymization",
      },
      {
        type: "p",
        text: "When personal data is no longer required for the purposes set forth in this Policy or for compliance with legal obligations, we will securely delete or anonymize such data. 'Deletion' means permanent erasure or destruction such that the data cannot be recovered or reconstructed. 'Anonymization' means the process of irreversibly removing or altering identifiers such that the data can no longer be associated with an identified or identifiable natural person, even when combined with other available information. We maintain written procedures governing the secure deletion and anonymization of personal data, which are audited on an annual basis.",
      },
      {
        type: "p",
        text: "Notwithstanding the foregoing, we may retain copies of personal data (i) in backup systems for up to ninety (90) days following deletion from primary systems, solely for disaster recovery and business continuity purposes; and (ii) where required by legal hold notices issued in connection with pending or threatened litigation, government investigations, or regulatory proceedings, in which case retention will continue until the legal hold is lifted.",
      },
    ],
  },
  {
    id: "security",
    title: "Data Security: Technical and Organizational Measures",
    blocks: [
      {
        type: "p",
        text: "We implement and maintain comprehensive technical and organizational measures designed to protect personal data against accidental, unauthorized, or unlawful access, destruction, loss, alteration, disclosure, or damage. These measures are informed by industry best practices, applicable legal requirements, and periodic risk assessments. Our security measures include, but are not limited to:",
      },
      {
        type: "h3",
        text: "A. Technical Security Measures",
      },
      {
        type: "ul",
        items: [
          "ENCRYPTION: All personal data is encrypted in transit using Transport Layer Security (TLS) 1.2 or higher with strong cipher suites. Personal data at rest (stored on disk, database, or backup media) is encrypted using AES-256 or equivalent strong encryption algorithms. Encryption keys are managed in accordance with industry standards, including regular key rotation, separation of duties, and restricted access.",
          "ACCESS CONTROLS: We implement role-based access controls (RBAC), least-privilege access principles, and mandatory access controls (MAC) where appropriate. Access to personal data is granted only to those personnel, service providers, and systems that have a legitimate business need for such access. Access rights are reviewed quarterly and revoked immediately upon termination of employment or contract.",
          "AUTHENTICATION: We require strong authentication measures, including password complexity requirements (minimum length, character class requirements), account lockout policies, multi-factor authentication (MFA) for privileged accounts, and secure session management with appropriate timeouts. Password hashes are stored using bcrypt, Argon2, or other adaptive one-way hashing algorithms with per-user salts.",
          "NETWORK SECURITY: Our infrastructure is protected by firewalls, intrusion detection/prevention systems (IDS/IPS), distributed denial-of-service (DDoS) mitigation, network segmentation, and regular vulnerability scanning. We maintain a formal patch management program to ensure timely application of security updates.",
          "LOGGING AND MONITORING: We maintain comprehensive audit logs of all access to and processing of personal data, including user identification, timestamps, actions performed, and data accessed. Logs are protected from tampering, retained as set forth in Section [Retention], and monitored for suspicious activity with automated alerting.",
          "SECURITY TESTING: We conduct regular security assessments, including but not limited to: (i) dynamic and static application security testing (DAST/SAST), (ii) penetration testing by internal and external qualified security professionals, (iii) vulnerability scanning, (iv) code reviews, and (v) threat modeling. Critical findings are remediated according to severity-based SLAs.",
          "BACKUP AND DISASTER RECOVERY: We maintain encrypted backups of personal data in geographically separate facilities, with regular testing of restoration procedures. Our recovery point objective (RPO) and recovery time objective (RTO) are defined in our Business Continuity Plan, available to client organizations upon request under NDA.",
        ],
      },
      {
        type: "h3",
        text: "B. Organizational Security Measures",
      },
      {
        type: "ul",
        items: [
          "DATA PROTECTION POLICIES: We maintain a comprehensive set of written information security policies, including but not limited to: Acceptable Use Policy, Access Control Policy, Data Classification Policy, Incident Response Policy, Password Policy, Remote Access Policy, and Vendor Management Policy. All policies are reviewed and updated at least annually.",
          "EMPLOYEE TRAINING AND AWARENESS: All personnel with access to personal data receive mandatory data protection and security awareness training upon hire and annually thereafter. Training covers applicable legal requirements, internal policies, incident reporting procedures, and emerging threats (e.g., phishing, social engineering). Completion is tracked and documented.",
          "CONFIDENTIALITY OBLIGATIONS: All personnel, contractors, and service providers are bound by written confidentiality agreements that survive the termination of their relationship with us. Personnel are informed of the confidential nature of personal data and the importance of complying with this Policy.",
          "INCIDENT RESPONSE: We maintain an Incident Response Plan (IRP) that establishes procedures for detecting, containing, eradicating, recovering from, and notifying relevant parties about security incidents involving personal data. The IRP includes specific timeframes for notification to affected data subjects and supervisory authorities as required by applicable law (e.g., within 72 hours for GDPR breaches). We conduct tabletop exercises and mock incident drills at least annually to test and improve our IRP.",
          "THIRD-PARTY RISK MANAGEMENT: Prior to engaging any service provider that will process personal data on our behalf, we conduct due diligence on the provider's security practices, require contractual commitments to implement appropriate security measures, and obtain the right to audit compliance. Providers are reassessed at least annually, and material changes in risk profile trigger enhanced review.",
          "DATA PROTECTION IMPACT ASSESSMENTS (DPIAs): Where required under Article 35 of the GDPR or other applicable laws, we conduct DPIAs prior to undertaking processing that is likely to result in a high risk to the rights and freedoms of natural persons. DPIAs are also conducted when adopting new technologies, implementing new processing activities, or making significant changes to existing processing.",
        ],
      },
      {
        type: "p",
        text: "NOTWITHSTANDING THE FOREGOING, NO METHOD OF ELECTRONIC TRANSMISSION OR STORAGE IS 100% SECURE. WHILE WE STRIVE TO USE COMMERCIALLY ACCEPTABLE MEANS TO PROTECT PERSONAL DATA, WE CANNOT AND DO NOT GUARANTEE ABSOLUTE SECURITY. BY USING THE SERVICES, YOU ACKNOWLEDGE AND ACCEPT THE INHERENT SECURITY RISKS ASSOCIATED WITH TRANSMITTING DATA OVER THE INTERNET AND OTHER NETWORKS. YOU ARE ALSO RESPONSIBLE FOR IMPLEMENTING AND MAINTAINING APPROPRIATE SECURITY MEASURES ON YOUR END, INCLUDING PROTECTING YOUR LOGIN CREDENTIALS, KEEPING YOUR DEVICE OPERATING SYSTEM AND APPLICATIONS UPDATED, AND PROMPTLY REPORTING ANY SUSPECTED SECURITY INCIDENTS TO US.",
      },
    ],
  },
  {
    id: "rights",
    title: "Data Subject Rights Under Applicable Law",
    blocks: [
      {
        type: "p",
        text: "Depending on your jurisdiction of residence, you may have certain rights regarding your personal data under applicable data protection laws, including but not limited to the GDPR (for European Economic Area residents), the UK GDPR (for UK residents), the CCPA/CPRA (for California residents), the LGPD (for Brazilian residents), the POPIA (for South African residents), and similar laws in other jurisdictions. These rights are not absolute and may be subject to exceptions, exemptions, or limitations as provided by law.",
      },
      {
        type: "h3",
        text: "A. Rights Under the GDPR (EEA and UK Residents)",
      },
      {
        type: "ul",
        items: [
          "RIGHT OF ACCESS (Article 15): You have the right to obtain from us confirmation as to whether or not we are processing your personal data, and, where that is the case, access to the personal data and certain related information, including the purposes of processing, categories of data, recipients, retention periods, and information about your rights.",
          "RIGHT TO RECTIFICATION (Article 16): You have the right to obtain from us without undue delay the rectification of inaccurate personal data concerning you. Taking into account the purposes of the processing, you have the right to have incomplete personal data completed, including by means of providing a supplementary statement.",
          "RIGHT TO ERASURE ('RIGHT TO BE FORGOTTEN') (Article 17): You have the right to obtain from us the erasure of personal data concerning you without undue delay, and we have the obligation to erase personal data without undue delay where one of the following grounds applies: (a) the personal data is no longer necessary for the purposes for which it was collected or processed; (b) you withdraw consent on which the processing is based and there is no other legal ground for the processing; (c) you object to the processing and there are no overriding legitimate grounds for the processing; (d) the personal data has been unlawfully processed; (e) erasure is required for compliance with a legal obligation; or (f) the personal data has been collected in relation to the offer of information society services to a child.",
          "RIGHT TO RESTRICTION OF PROCESSING (Article 18): You have the right to obtain from us restriction of processing where one of the following applies: (a) you contest the accuracy of the personal data (for a period enabling us to verify accuracy); (b) the processing is unlawful and you oppose erasure and request restriction instead; (c) we no longer need the personal data for processing but you require it for the establishment, exercise, or defense of legal claims; or (d) you have objected to processing pending verification of whether our legitimate grounds override yours.",
          "RIGHT TO DATA PORTABILITY (Article 20): You have the right to receive the personal data concerning you which you have provided to us, in a structured, commonly used, and machine-readable format, and have the right to transmit that data to another controller without hindrance from us, where the processing is based on consent or a contract and is carried out by automated means.",
          "RIGHT TO OBJECT (Article 21): You have the right to object, on grounds relating to your particular situation, at any time to processing of personal data concerning you which is based on legitimate interests or the performance of a task carried out in the public interest. We will no longer process the personal data unless we demonstrate compelling legitimate grounds for the processing which override your interests, rights, and freedoms, or for the establishment, exercise, or defense of legal claims.",
          "RIGHTS RELATED TO AUTOMATED DECISION-MAKING AND PROFILING (Article 22): You have the right not to be subject to a decision based solely on automated processing, including profiling, which produces legal effects concerning you or similarly significantly affects you. We do not engage in fully automated decision-making with legal or significant effects without human intervention.",
          "RIGHT TO WITHDRAW CONSENT (Article 7(3)): Where processing is based on your consent, you have the right to withdraw your consent at any time without affecting the lawfulness of processing based on consent before its withdrawal.",
        ],
      },
      {
        type: "h3",
        text: "B. Rights Under the CCPA/CPRA (California Residents)",
      },
      {
        type: "ul",
        items: [
          "RIGHT TO KNOW (Categories and Specific Pieces): You have the right to request that we disclose: (a) the categories of personal data we have collected about you, (b) the categories of sources from which personal data is collected, (c) the business or commercial purpose for collecting or selling personal data, (d) the categories of third parties with whom we share personal data, and (e) the specific pieces of personal data we have collected about you (subject to certain identity verification requirements and security protections).",
          "RIGHT TO DELETE: You have the right to request that we delete any personal data about you which we have collected from you, subject to certain exceptions, including but not limited to where the data is necessary to: (a) complete the transaction for which the personal data was collected, (b) detect security incidents or protect against malicious, deceptive, fraudulent, or illegal activity, (c) exercise free speech or ensure the right of another consumer to exercise their free speech rights, (d) comply with a legal obligation, or (e) otherwise use the personal data internally in a lawful manner compatible with the context in which you provided it.",
          "RIGHT TO CORRECT: You have the right to request that we correct inaccurate personal data about you, taking into account the nature of the personal data and the purposes of processing.",
          "RIGHT TO OPT-OUT OF SALE OR SHARING: You have the right to direct us not to sell or share your personal data to third parties. As stated elsewhere in this Policy, we do not and will not sell your personal data for monetary or other valuable consideration. We also do not share your personal data for cross-context behavioral advertising purposes (i.e., we do not use your data to target advertising to you based on your activity across different websites or services). Accordingly, there is no sale or sharing to opt out of.",
          "RIGHT TO LIMIT USE OF SENSITIVE PERSONAL DATA: You have the right to limit our use of sensitive personal data (including precise geolocation and biometric data) to only those uses that are necessary to provide the Services you have requested. To exercise this right, you may either (a) withdraw consent for the specific sensitive data uses via your device permissions or account settings, or (b) contact us as set forth below.",
          "RIGHT TO NON-DISCRIMINATION: You have the right not to receive discriminatory treatment by us for exercising any of your CCPA/CPRA rights. Discriminatory treatment includes denying goods or services, charging different prices or rates, providing a different level or quality of goods or services, or suggesting that you will receive a different price or level of quality of goods or services.",
          "RIGHT TO DESIGNATE AN AUTHORIZED AGENT: You have the right to designate an authorized agent to make requests under the CCPA/CPRA on your behalf. We will require the authorized agent to provide proof of your written permission (e.g., a signed power of attorney) and may take steps to verify your identity directly.",
        ],
      },
      {
        type: "h3",
        text: "C. Exercising Your Rights",
      },
      {
        type: "p",
        text: `To exercise any of the rights described above, please submit a verifiable consumer request to us by: (a) emailing us at ${LEGAL_SUPPORT_EMAIL}, (b) calling us at the telephone number provided on our website, or (c) submitting a request through our privacy request portal (available upon request). All requests should include sufficient information to allow us to reasonably verify your identity (such as your full name, email address associated with your account, and the client organization through which you use our Services), as well as a description of the right you wish to exercise and the specific data to which your request relates.`,
      },
      {
        type: "p",
        text: "We will acknowledge receipt of your request within a reasonable time (and within the timeframes required by applicable law, generally 10 business days for CCPA/CPRA requests and 30 days for GDPR requests). We will respond to your request within the applicable statutory timeframe (typically 30 days for GDPR, 45 days for CCPA/CPRA). We may extend the response period by up to an additional 60 days for GDPR requests or 45 days for CCPA/CPRA requests where reasonably necessary, provided we notify you of the extension within the original response period, together with the reasons for the delay.",
      },
      {
        type: "p",
        text: "We will provide the requested information free of charge, except where the request is manifestly unfounded, excessive, or repetitive, in which case we may charge a reasonable fee (taking into account the administrative costs of providing the information or communication or taking the action requested) or refuse to act on the request. We will inform you of our decision and the reasons for any fee or refusal within the applicable response period.",
      },
      {
        type: "p",
        text: "Where we are processing personal data on behalf of a Client Organization (as Data Processor), we will forward your request to the relevant Client Organization for response, as they are the Data Controller with primary responsibility for such data. We will assist the Client Organization in responding to your request to the extent required by applicable law and our agreement with the Client Organization.",
      },
      {
        type: "h3",
        text: "D. Right to Lodge a Complaint (EEA and UK Residents)",
      },
      {
        type: "p",
        text: `If you believe that our processing of your personal data violates applicable data protection law, you have the right to lodge a complaint with a supervisory authority, in particular in the Member State of your habitual residence, place of work, or place of the alleged infringement. For ${LEGAL_JURISDICTION}, the competent supervisory authority is the ${LEGAL_JURISDICTION} data protection authority. You also have the right to pursue legal proceedings before a court of competent jurisdiction. We would, however, appreciate the opportunity to address your concerns before you approach a supervisory authority or court. Please contact us first at ${LEGAL_SUPPORT_EMAIL}.`,
      },
    ],
  },
  {
    id: "children",
    title: "Children's Privacy and Age Limitations",
    blocks: [
      {
        type: "p",
        text: "THE SERVICES ARE NOT DIRECTED TO, AND ARE NOT INTENDED TO BE USED BY, CHILDREN UNDER THE AGE OF 16 (OR THE MINIMUM AGE REQUIRED FOR DATA PROCESSING CONSENT IN YOUR JURISDICTION, WHICH MAY BE 13, 14, OR 15 IN CERTAIN JURISDICTIONS). WE DO NOT KNOWINGLY COLLECT PERSONAL DATA FROM CHILDREN UNDER THE APPLICABLE AGE LIMIT. WE DO NOT KNOWINGLY USE OR DISCLOSE PERSONAL DATA OF CHILDREN FOR ANY PURPOSE, INCLUDING FOR MARKETING OR PROFILING.",
      },
      {
        type: "p",
        text: "If you are a parent or guardian and you believe that your child under the applicable age limit has provided personal data to us without your consent, please contact us immediately at the email address provided above. Upon receiving such notification, we will take reasonable steps to verify the relationship and, where verified, will promptly delete the child's personal data from our systems, including from backups where technically feasible.",
      },
      {
        type: "p",
        text: "In the context of incident reporting, guard onboarding, or other legitimate business purposes, it is possible that personal data relating to a child (e.g., a student at a school where our Services are deployed, or a child involved in an incident) may be incidentally processed as part of our Services. Such processing is performed solely on behalf of the Client Organization (e.g., the school or security company) and only to the extent necessary for the legitimate business purpose. The Client Organization bears primary responsibility for complying with applicable laws regarding the processing of children's data, including obtaining parental consent where required under laws such as the Children's Online Privacy Protection Act (COPPA) or the GDPR (which requires parental consent for children under 16 in most EU Member States).",
      },
    ],
  },
  {
    id: "cookies",
    title: "Cookies, Tracking Technologies, and Similar Technologies",
    blocks: [
      {
        type: "p",
        text: "Our web-based interfaces (dashboard, marketing website, and any other web-accessible Services) may use cookies, local storage objects, pixel tags, web beacons, and similar technologies to enhance functionality, improve security, personalize content, and analyze usage. This section explains our use of such technologies and your control over them.",
      },
      {
        type: "h3",
        text: "A. Types of Technologies Used",
      },
      {
        type: "ul",
        items: [
          "COOKIES: Small text files stored on your device by your web browser. Cookies may be 'session cookies' (deleted when you close your browser) or 'persistent cookies' (remain on your device until deleted or until they expire).",
          "LOCAL STORAGE: HTML5 local storage that allows data to be stored persistently on your device, typically with larger storage capacity than cookies and without automatic transmission to the server with each request.",
          "PIXEL TAGS / WEB BEACONS: Transparent graphic images placed on web pages or in emails that allow us to track user interactions, such as whether an email has been opened or a web page visited.",
          "FINGERPRINTING: We do NOT use device fingerprinting technologies for tracking or advertising purposes, though certain security and fraud detection features may collect device characteristics to identify suspicious activity.",
        ],
      },
      {
        type: "h3",
        text: "B. Categories of Cookies We Use",
      },
      {
        type: "ul",
        items: [
          "STRICTLY NECESSARY COOKIES: Required for the operation of our Services. These cookies enable you to navigate the Services and use essential features such as authentication, session management, and security. Without these cookies, the Services would not function properly. Examples: authentication cookies, load balancer session affinity cookies, CSRF (cross-site request forgery) tokens. Legal basis: Legitimate interests (Article 6(1)(f) GDPR) or performance of a contract (Article 6(1)(b) GDPR).",
          "PREFERENCE COOKIES: Allow the Services to remember choices you make and preferences you set, such as language, region, or display settings. These cookies enhance your user experience but are not strictly necessary. Legal basis: Consent (Article 6(1)(a) GDPR) where required by applicable law, otherwise legitimate interests.",
          "ANALYTICS / PERFORMANCE COOKIES: Collect information about how you use the Services, such as which pages you visit most often, how long you spend on each page, whether you encounter error messages, and which links you click. This data is aggregated and anonymized where possible and is used to improve the performance and user experience of our Services. Legal basis: Consent (Article 6(1)(a) GDPR) where required by applicable law, otherwise legitimate interests.",
          "FUNCTIONALITY COOKIES: Enable enhanced functionality and personalization, such as video playback, interactive maps, or social media integration. Legal basis: Consent (Article 6(1)(a) GDPR) where required by applicable law, otherwise legitimate interests.",
          "TARGETING / ADVERTISING COOKIES: WE DO NOT USE targeting or advertising cookies on our Services. We do not track your activity across different websites or services for advertising purposes, and we do not share your data with advertising networks or data brokers. Any analytics cookies we use are for internal service improvement only, not for third-party advertising.",
        ],
      },
      {
        type: "h3",
        text: "C. Third-Party Cookies",
      },
      {
        type: "p",
        text: "We may allow certain third parties to set cookies on our Services for specific limited purposes, including:",
      },
      {
        type: "ul",
        items: [
          "Analytics providers (e.g., Google Analytics, Mixpanel) that help us understand how users interact with our Services. These providers may set cookies to collect anonymized usage data. We have configured such providers to minimize data collection and to not share data with other services.",
          "Error monitoring providers (e.g., Sentry) that help us identify and fix technical issues. These providers may set cookies to track session context and error occurrences.",
          "Customer support providers (e.g., Intercom, Zendesk) that enable live chat and support ticket functionality. These providers may set cookies to remember your conversation history and authenticate support requests.",
        ],
      },
      {
        type: "p",
        text: "These third parties are contractually prohibited from using cookies for any purpose other than providing the specific services we have engaged them to perform. We do not permit third parties to use cookies for advertising, cross-site tracking, or data monetization.",
      },
      {
        type: "h3",
        text: "D. Cookie Consent and Control",
      },
      {
        type: "p",
        text: "Where required by applicable law (including the ePrivacy Directive as implemented in EU Member States and the UK, the California Consumer Privacy Act, and similar laws), we obtain your consent before placing non-essential cookies on your device. Essential cookies (strictly necessary) do not require consent and are set automatically.",
      },
      {
        type: "p",
        text: "You can control and manage cookies in several ways:",
      },
      {
        type: "ul",
        items: [
          "COOKIE CONSENT TOOL: Our Services display a cookie consent banner upon your first visit, allowing you to accept, reject, or customize non-essential cookies. You can change your cookie preferences at any time by clicking the 'Cookie Preferences' link in the footer of our website or through your account settings.",
          "BROWSER SETTINGS: Most web browsers allow you to control cookies through their settings. You can configure your browser to block all cookies, delete existing cookies, notify you when cookies are set, or block third-party cookies. Please note that blocking essential cookies may prevent the Services from functioning properly. Information about managing cookies in popular browsers is available at: Google Chrome, Mozilla Firefox, Apple Safari, Microsoft Edge, and other browser documentation.",
          "OPT-OUT TOOLS: For analytics cookies, you can install browser add-ons or opt-out tools provided by specific analytics providers, such as the Google Analytics Opt-out Browser Add-on (available at https://tools.google.com/dlpage/gaoptout).",
        ],
      },
      {
        type: "p",
        text: "For users in California, we honor Global Privacy Control (GPC) signals as a valid opt-out request for the sale or sharing of personal data. As noted above, we do not engage in such activities, but we will record and respect GPC signals as an expression of your privacy preferences.",
      },
    ],
  },
  {
    id: "automated",
    title: "Automated Decision-Making and Profiling",
    blocks: [
      {
        type: "p",
        text: "We do not engage in automated decision-making that produces legal effects or similarly significantly affects you without human intervention. However, we may use limited automated processes and algorithms for the following purposes, each of which is subject to appropriate human oversight and review:",
      },
      {
        type: "ul",
        items: [
          "FRAUD DETECTION: Automated analysis of usage patterns, device characteristics, and transaction data to identify potentially fraudulent or abusive behavior. These algorithms flag suspicious activity for human review and do not automatically block access without verification.",
          "SECURITY MONITORING: Automated log analysis and intrusion detection to identify potential security incidents (e.g., brute force attacks, unusual access patterns, malware signatures). Alerts are generated for investigation by our security team.",
          "ANOMALY DETECTION: Automated monitoring of shift patterns, checkpoints, and incident reports to identify anomalous behavior (e.g., missed checkpoints, unusual shift durations, unexpected location deviations). These detections are surfaced to supervisors for contextual assessment.",
          "RECOMMENDATION SYSTEMS: Automated suggestions based on historical data (e.g., suggesting optimal patrol routes, identifying high-risk times or locations). These recommendations are non-binding and may be overridden by human judgment.",
        ],
      },
      {
        type: "p",
        text: "Where automated decision-making as defined in Article 22 of the GDPR (i.e., solely automated decisions with legal or significant effects) may be implemented in the future, we will provide prior notice, obtain explicit consent where required, and implement appropriate safeguards including the right to human intervention, the right to express your point of view, and the right to contest the decision.",
      },
    ],
  },
  {
    id: "changes",
    title: "Changes and Amendments to This Privacy Policy",
    blocks: [
      {
        type: "p",
        text: "We reserve the right to modify, amend, or update this Policy at any time to reflect changes in our data processing practices, legal requirements, industry standards, or operational needs. When we make material changes to this Policy, we will provide prominent notice of such changes through appropriate channels, which may include:",
      },
      {
        type: "ul",
        items: [
          "Posting the updated Policy on our website and within the mobile application with a new 'Effective Date' clearly displayed at the top of the Policy;",
          "Sending an email notification to the email address associated with your account (for users with accounts);",
          "Displaying an in-app notification or pop-up notice upon login or next use of the Services;",
          "Requesting renewed consent where the changes materially alter our processing activities or legal bases, and where such consent is required under applicable law.",
        ],
      },
      {
        type: "p",
        text: `Changes to this Policy are effective as of the Effective Date stated at the beginning of the Policy, unless otherwise required by applicable law. YOUR CONTINUED USE OF THE SERVICES AFTER THE EFFECTIVE DATE OF ANY UPDATED POLICY CONSTITUTES YOUR ACCEPTANCE OF THE UPDATED POLICY TO THE FULLEST EXTENT PERMITTED BY LAW. IF YOU DO NOT AGREE WITH ANY UPDATED PROVISION, YOU MUST CEASE USING THE SERVICES IMMEDIATELY AND, WHERE APPLICABLE, REQUEST DELETION OF YOUR ACCOUNT AND PERSONAL DATA AS SET FORTH IN THE 'YOUR RIGHTS' SECTION ABOVE.`,
      },
      {
        type: "p",
        text: "We maintain an archive of prior versions of this Policy for at least five (5) years following each update. Archived versions are available upon request by contacting us at the email address provided above.",
      },
    ],
  },
  {
    id: "govlaw",
    title: "Governing Law and Dispute Resolution",
    blocks: [
      {
        type: "p",
        text: `This Privacy Policy and all matters arising out of or relating to this Policy shall be governed by and construed in accordance with the laws of ${LEGAL_JURISDICTION}, without regard to its conflict of laws principles. Any legal action or proceeding arising out of or relating to this Policy or our data processing activities shall be brought exclusively in the courts of ${LEGAL_JURISDICTION}, and you hereby consent to the personal jurisdiction and venue of such courts.`,
      },
      {
        type: "p",
        text: "Notwithstanding the foregoing, you may also have the right to lodge a complaint with a supervisory authority (for data protection matters) in your jurisdiction of residence as described in the 'Your Rights' section above.",
      },
    ],
  },
  {
    id: "contact",
    title: "Contact Information and Lodge a Complaint",
    blocks: [
      {
        type: "p",
        text: `If you have any questions, concerns, or complaints regarding this Privacy Policy, our data processing practices, or your rights under applicable law, please contact us:`,
      },
      {
        type: "ul",
        items: [
          `By email: ${LEGAL_SUPPORT_EMAIL} (preferred method for prompt response)`,
          `By mail: ${LEGAL_OPERATOR_DISPLAY}, Legal/Privacy Department, [Full Street Address], ${LEGAL_JURISDICTION} [Postal Code]`,
          `Through our website: [Contact form URL]`,
          `By phone: [Telephone number with country code, business hours, and timezone]`,
        ],
      },
      {
        type: "p",
        text: "We will acknowledge receipt of your inquiry within five (5) business days and will make a good faith effort to resolve your concern promptly, generally within thirty (30) days. If you are not satisfied with our response, you may have the right to lodge a complaint with your local supervisory authority or seek other remedies as provided by law.",
      },
    ],
  },
];
