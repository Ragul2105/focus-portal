# Fund Tracking Portal - Features

## Overview
Track all funds received/applied by college staff. Scope includes fund registration, activity/grant ID generation, grant request submission, multi-step approvals, and automated H.O letter generation.

## Roles and Access
- Staff: create fund registrations, generate activity/grant IDs, submit grant requests, view approval status.
- HOD (staff with approval role): review and approve/reject requests.
- Principal: final approval/rejection.
- Institution login: can initiate fund details (same flow as staff unless restricted later).

## Core Features

### 1) Authentication
- Login as staff or institution user.

### 2) Fund Registration
- Start a new fund registration.
- Capture registration data:
- Applied as: Team or Individual.
- Team count: required if Applied as = Team.
- Funding agencies: Government or Non-Government.
- Funds from: National or International.
- Activity category: IEEE, R&D Grants, Clubs & Cells, Department Initiatives/Department Programs, Incubation, BIS, Others.
- Activity detail: depends on selected Activity category.
- Fund applied: INR (required) and USD (optional).
- Applied proof: PDF upload for application form and confirmation form.
- Applied application number: optional.
- Applied date: required.
- College Grants Registration ID: auto-generated in format `GR` + year(2 digits) + 4-digit auto increment.
- Example: `GR251001`.

### 3) Activity/Grant ID Generation
- Inputs:
- College Grants Registration ID.
- Applied application number (optional).
- Activity category (from registration).
- Activity detail (code selected based on category).
- Output:
- 10-digit Grant ID generated.
- Email sent to registered user.
- Grant ID format: `YY` / `Dept or Category` / `Scheme` / `Request No` (each 2 digits).
- Example: `25IESBDY01`.
- IEEE example: Year(25) / IEEE(IE) / Student Branch(SB) / Request No(01).
- Clubs example: Year(25) / Clubs & Cells(CC) / Club Code / Request No(01).
- Sample: `25IEEETG01`.

### 4) Grant Request Submission
- Select a grant from registered grants.
- Auto-fetch Activity Category, Activity detail, and amount granted.
- Uploads:
- Initial requisition letter: PDF (Grant Evaluation Form).
- Authorized letter from college with all signatures: PDF, max 10 MB.

### 5) Approval Workflow
- Sequential approvals:
- HOD approval.
- Principal approval.
- Status tracking visible to the initiator: Pending, Approved, Rejected.

### 6) H.O Letter Auto-Generation
- Generate H.O letter after approvals.
- Auto-fill: event name, date, amount granted, amount sanctioned, chairman signature, approval date.

## Activity Category Details

### IEEE (Activity Detail Options)
- IEEE Aerospace and Electronic Systems Society
- IEEE Antennas and Propagation Society
- IEEE Broadcast Technology Society
- IEEE Computer Society
- IEEE Circuits and Systems Society
- IEEE Computational Intelligence Society
- IEEE Communications Society
- IEEE Control Systems Society
- IEEE Consumer Technology Society
- IEEE Dielectrics and Electrical Insulation Society
- IEEE Education Society
- IEEE Electron Devices Society
- IEEE Engineering in Medicine and Biology Society
- IEEE Electromagnetic Compatibility Society
- IEEE Electronics Packaging Society
- IEEE Geoscience and Remote Sensing Society
- IEEE Industry Applications Society
- IEEE Industrial Electronics Society
- IEEE Instrumentation and Measurement Society
- IEEE Information Theory Society
- IEEE Intelligent Transportation Systems Society
- IEEE Magnetics Society
- IEEE Microwave Theory and Techniques Society
- IEEE Nuclear and Plasma Sciences Society
- IEEE Oceanic Engineering Society
- IEEE Professional Communication Society
- IEEE Power & Energy Society
- IEEE Power Electronics Society
- IEEE Photonics Society
- IEEE Product Safety Engineering Society
- IEEE Robotics and Automation Society
- IEEE Reliability Society
- IEEE Society on Social Implications of Technology
- IEEE Systems, Man, and Cybernetics Society
- IEEE Signal Processing Society
- IEEE Solid-State Circuits Society
- IEEE Technology and Engineering Management Society
- IEEE Ultrasonics, Ferroelectrics, and Frequency Control Society
- IEEE Vehicular Technology Society
- IEEE SIGHT
- IEEE WiE
- IEEE Nano Technology Council
- IEEE HKN

### R&D Grants (Activity Detail Options)
- All India Council for Technical Education (AICTE)
- Faculty development programmes (FDP)
- AICTE- IDEA LAB
- Short Term Training Programme (STTP)
- MODERNISATION AND REMOVAL OF OBSOLESCENCE (MODROBS)
- Margdarshan Scheme
- The Smart India Hackathon (SIH)
- AICTE-Scheme for Promoting Interests, Creativity and Ethics among Students (SPICES)
- Youth Undertaking Visit for Acquiring Knowledge (YUVAK)
- Skill and Personality Development Program Centre for SC/ST Students (SPDC)
- Ministry of Education's Innovation Cell (MIC) (idea hackathon)
- Research Promotion Scheme (RPS)
- Anna University
- Centre for Research & Centre for Faculty Development (CFR)
- Faculty development programmes (FDP)
- Department of Defence Production India (DDP)
- Innovations for Defence Excellence (IDEX)
- Department of Science and Technology (DST)
- Science and Engineering Research Board (SERB)
- Anusandhan National Research Foundation (ANRF)
- (MaDeiT Innovation Foundation)
- NIDHI-Entrepreneur-in-Residence
- NIDHI-Prayas
- Nobel Sanso Professional Foundation (NSPF)
- Ministry of Education (MoE)
- Young India Combating COVID with Knowledge, Technology and Innovation (YUKTI)
- Collaborative Research Scheme project (CSR)
- UGC-DAE CSR (UGC)
- University Grants Commission (UGC)
- National Assessment and Accreditation Council (NAAC)
- Vel Tech Incubator Technology Incubator / Ministry of Electronics & Information Technology (MeitY)
- MEITY TIDE 2.0 EIR
- Department of Consumer Affairs (DCA)
- Bureau of Indian Standards (BIS)
- Department of Atomic Energy (DAE)
- Board of Research in Nuclear Sciences (BRNS)
- Ministry of Science & Technology
- The Council of Scientific & Industrial Research
- Indian Institute of Technology (IIT) Delhi
- Unnat Bharat Abhiyan (UBA)
- Wipro Foundation
- Maruthi Power Control System
- Government of Tamilnadu
- Naan Mudhalvan - Niral Thiruvizha
- Tamilnadu State Council for Science and Technology

### Clubs & Cells (Activity Detail Options)
- Automobile Club
- Code Club
- Cyber Club
- ENSAV Club
- Entrepreneurship Cell
- Higher Education Cell
- IPR Cell
- M-Apps Club
- Maths Club
- Robotics Club
- Science Club
- Skill Development Club
- Technoculture Club
- NDLI Club
- Game Development Club
- Google Developers Club
- AI/ML Club
- UHV Cell
- Disaster Management & Safety Club
- Eco and Swachh Bharat Club
- English Literary Club
- Fine Arts Association
- Foreign Language Club
- Health & Yoga Club
- NCC
- NSS
- Photography Club
- Red Ribbon Club
- Rotaract Club
- Sai Muthamizh Mandram
- Women Empowerment Cell - WoWWW
- Young Indians Club
- YRC
- YUCI Club
- Junior Chamber International
- LEO Club
- Nehru Yuva Kendra Sangathan

### Department Initiatives/Programs (Activity Detail Options)
- AI&DS
- CSBS
- EEE
- ECE
- IT
- CSE
- MECH
- S&H
- ICE
- EIE
- CIVIL
- CSE (AI&ML)
- CSE (IoT)
- CSE (SC)
- MECH & AUTO
- MECHATRONICS
- M.Tech (CSE)
- MBA
- CCE

### Incubation (Activity Detail Options)
- Entrepreneurship Development and Innovation Institute (EDII-TN)
- Entrepreneurship Development Programme (EDP)
- Student Startup and Innovation Policy (SSIP)
- Innovation Voucher Programme
- Department for Promotion of Industry and Internal Trade (DP)
- Startup TN
- Startup India
- Anna University Incubation

### BIS (Activity Detail Options)
- Department of Consumer Affairs (DCA)
- Bureau of Indian Standards (BIS)

### Others
- Free text entry.

## Activity Detail Codes for Grant ID

### IEEE Codes
- AE: IEEE Aerospace and Electronic Systems Society
- AP: IEEE Antennas and Propagation Society
- BT: IEEE Broadcast Technology Society
- CS: IEEE Computer Society
- CR: IEEE Circuits and Systems Society
- CI: IEEE Computational Intelligence Society
- CO: IEEE Communications Society
- CN: IEEE Control Systems Society
- CT: IEEE Consumer Technology Society
- DE: IEEE Dielectrics and Electrical Insulation Society
- ES: IEEE Education Society
- ED: IEEE Electron Devices Society
- MB: IEEE Engineering in Medicine and Biology Society
- EM: IEEE Electromagnetic Compatibility Society
- EP: IEEE Electronics Packaging Society
- GR: IEEE Geoscience and Remote Sensing Society
- IA: IEEE Industry Applications Society
- IE: IEEE Industrial Electronics Society
- IM: IEEE Instrumentation and Measurement Society
- IT: IEEE Information Theory Society
- IN: IEEE Intelligent Transportation Systems Society
- MS: IEEE Magnetics Society
- MT: IEEE Microwave Theory and Techniques Society
- NP: IEEE Nuclear and Plasma Sciences Society
- OE: IEEE Oceanic Engineering Society
- PC: IEEE Professional Communication Society
- PN: IEEE Power & Energy Society
- PE: IEEE Power Electronics Society
- PT: IEEE Photonics Society
- PS: IEEE Product Safety Engineering Society
- RA: IEEE Robotics and Automation Society
- RS: IEEE Reliability Society
- SS: IEEE Society on Social Implications of Technology
- SC: IEEE Systems, Man, and Cybernetics Society
- SP: IEEE Signal Processing Society
- SO: IEEE Solid-State Circuits Society
- TM: IEEE Technology and Engineering Management Society
- UF: IEEE Ultrasonics, Ferroelectrics, and Frequency Control Society
- VT: IEEE Vehicular Technology Society
- SI: IEEE SIGHT
- WE: IEEE WiE
- NT: IEEE Nano Technology Council
- HK: IEEE HKN
- EI: IEEE EPICS
- TG: IEEE Tech4Good
- HT: IEEE Humanitarian Technologies Board

### R&D Codes
- Use the scheme/agency short code provided in the R&D list during activity ID generation.

### Clubs & Cells Codes
- AU: Automobile Club
- CO: Code Club
- CY: Cyber Club
- ES: ENSAV Club
- EC: Entrepreneurship Cell
- HE: Higher Education Cell
- IP: IPR Cell
- MA: M-Apps Club
- MT: Maths Club
- RO: Robotics Club
- SC: Science Club
- SD: Skill Development Club
- TC: Technoculture Club
- ND: NDLI Club
- GD: Game Development Club
- GO: Google Developers Club
- AM: AI/ML Club
- UH: UHV Cell
- DM: Disaster Management & Safety Club
- EB: Eco and Swachh Bharat Club
- EL: English Literary Club
- FA: Fine Arts Association
- FL: Foreign Language Club
- HY: Health & Yoga Club
- NC: NCC
- NS: NSS
- PH: Photography Club
- RR: Red Ribbon Club
- RT: Rotaract Club
- SM: Sai Muthamizh Mandram
- WE: Women Empowerment Cell - WoWWW
- YI: Young Indians Club
- YR: YRC
- YU: YUCI Club
- JC: Junior Chamber International
- LE: LEO Club
- NY: Nehru Yuva Kendra Sangathan

### Department Codes
- CE: Civil Engineering
- CS: Computer Science and Engineering
- EC: Electronics and Communication Engineering
- EE: Electrical and Electronics Engineering
- EI: Electronics and Instrumentation Engineering
- SC: Cyber Security
- IC/EICE: Instrumentation and Control Engineering / Electronic Instrumentation and Control Engineering
- ME: Mechanical Engineering
- PR: Production Engineering
- IT: Information Technology
- AI: Artificial Intelligence and Data Science
- CB: Computer Science and Business Systems
- MU: Mechanical and Automation
- CJ: Integrated CSE
- AM: Artificial Intelligence and Machine Learning
- CL: Computer Science and Engineering (Internet of Things)
- CO: Communication Systems
- CN: Computer Science and Engineering (Networks)
- PE: Power Electronics and Drives
- ES: Embedded System Technologies
- CD: CAD/CAM
- DT: Defence Technology
- MG: Master of Business Administration
- CH: Chemistry
- PH: Physics
- MA: Maths

### Incubation Codes
- Use the scheme/agency short code provided in the Incubation list during activity ID generation.

### BIS Codes
- BIS: Bureau of Indian Standards (BIS)

## Scope Boundary
- This document covers the flow up to H.O letter auto-generation after approvals.
