
Requirement Aggregation and Supplier Matching Portal (RASMP)
________________________________________
1. INTRODUCTION
1.1 Purpose
The Requirement Aggregation and Supplier Matching Portal (RASMP) is a web-based platform designed to connect customers who have specific product or service requirements with verified suppliers, dealers, manufacturers, distributors, brokers, and service providers.
Unlike traditional marketplaces where sellers list products and buyers search for them, this platform follows a reverse marketplace model where customers post their requirements and verified suppliers respond with suitable offerings.
The platform ensures that only genuine suppliers with direct ownership, stock availability, manufacturing capability, distribution rights, or service expertise can respond to customer requirements.
________________________________________
1.2 Scope
The system shall facilitate:
•	Customer registration and requirement posting
•	Supplier registration and verification
•	Requirement matching
•	Supplier responses and quotations
•	Customer-supplier communication
•	Supplier selection
•	Requirement closure
•	Lead management
•	Reporting and analytics
The platform shall support multiple categories including:
•	Real Estate
•	Construction Materials
•	Industrial Equipment
•	Electronics
•	Vehicles
•	Manufacturing
•	Agriculture
•	Professional Services
•	Fashion and Lifestyle
•	Home Improvement
________________________________________
1.3 Definitions
Term	Description
Customer	User posting a requirement
Supplier	Vendor responding to requirements
Requirement	Product or service request
Lead	Customer requirement visible to suppliers
Admin	Platform administrator
Quotation	Supplier response with pricing and details
________________________________________
2. OVERALL DESCRIPTION
2.1 Product Perspective
The system acts as an intermediary platform between customers and verified suppliers.
Flow:
Customer → Requirement Submission → Supplier Matching → Supplier Response → Customer Selection → Requirement Closure
________________________________________
2.2 Product Functions
The system shall:
•	Register customers
•	Register suppliers
•	Verify suppliers
•	Manage requirements
•	Match suppliers to requirements
•	Handle quotations
•	Track lead status
•	Manage communications
•	Generate reports
________________________________________
2.3 User Classes
Customer
•	Individual Buyers
•	Businesses
•	Industrial Buyers
•	Property Seekers
Supplier
•	Manufacturers
•	Dealers
•	Distributors
•	Brokers
•	Service Providers
Admin
•	Platform Administrators
•	Verification Team
________________________________________
3. SYSTEM MODULES
Module 1: Customer Management
Features
•	Registration
•	Login
•	Profile Management
•	Password Recovery
•	Requirement History
________________________________________
Module 2: Supplier Management
Features
•	Registration
•	Document Upload
•	Verification Workflow
•	Approval/Rejection
•	Profile Management
________________________________________
Module 3: Requirement Management
Features
•	Create Requirement
•	Edit Requirement
•	Delete Requirement
•	Close Requirement
•	Requirement Tracking
________________________________________
Module 4: Lead Management
Features
•	Requirement Distribution
•	Supplier Matching
•	Lead Tracking
•	Response Monitoring
________________________________________
Module 5: Quotation Management
Features
•	Submit Quotations
•	Upload Documents
•	Price Proposals
•	Negotiation Tracking
________________________________________
Module 6: Communication Management
Features
•	Internal Messaging
•	Contact Sharing
•	Notifications
•	Status Updates
________________________________________
Module 7: Administration
Features
•	User Management
•	Supplier Verification
•	Category Management
•	Report Generation
•	Fraud Detection
________________________________________
4. FUNCTIONAL REQUIREMENTS
FR-01 Customer Registration
The system shall allow customers to register using:
•	Full Name
•	Mobile Number
•	Email Address
•	Password
The system shall verify the mobile number through OTP.
________________________________________
FR-02 Customer Login
The system shall authenticate registered customers.
________________________________________
FR-03 Customer Profile Management
The system shall allow customers to:
•	Update profile
•	Change password
•	Manage contact details
________________________________________
FR-04 Requirement Creation
The customer shall create a requirement with:
•	Requirement Title
•	Category
•	Subcategory
•	Location
•	Quantity
•	Budget
•	Description
•	Required Date
________________________________________
FR-05 Requirement Management
The customer shall:
•	Edit requirements
•	View requirements
•	Close requirements
•	Track requirement status
________________________________________
FR-06 Supplier Registration
The system shall allow suppliers to register with:
•	Company Name
•	Owner Name
•	Mobile Number
•	Email
•	Address
•	GST Number
•	Business License
•	Identity Proof
________________________________________
FR-07 Supplier Verification
Admin shall manually verify supplier documents.
Verification statuses:
•	Pending
•	Approved
•	Rejected
________________________________________
FR-08 Supplier Login
Only approved suppliers shall be able to access supplier functions.
________________________________________
FR-09 Requirement Viewing
Approved suppliers shall view requirements based on:
•	Category
•	Location
•	Supplier Type
________________________________________
FR-10 Supplier Declaration
Before responding, supplier must accept:
"I confirm that I directly own, manufacture, stock, distribute, represent, or provide the product/service mentioned and am not acting as an intermediary between multiple suppliers."
________________________________________
FR-11 Quotation Submission
Suppliers shall submit:
•	Product/Service Details
•	Price
•	Delivery Timeline
•	Additional Notes
Attachments:
•	Catalog
•	Brochure
•	Images
•	PDF Quotations
________________________________________
FR-12 Requirement Matching
The system shall automatically match requirements with relevant suppliers.
Matching parameters:
•	Category
•	Location
•	Industry
•	Supplier Type
________________________________________
FR-13 Customer Review of Responses
Customers shall:
•	View quotations
•	Compare suppliers
•	Shortlist suppliers
________________________________________
FR-14 Supplier Selection
Customer shall select one supplier.
Requirement status:
•	Supplier Selected
________________________________________
FR-15 Requirement Closure
Customer shall close requirement after completion.
Statuses:
•	Open
•	Under Review
•	Supplier Selected
•	Completed
•	Cancelled
________________________________________
FR-16 Notification System
The system shall notify users regarding:
•	New Requirement
•	New Response
•	Supplier Approval
•	Requirement Closure
•	Supplier Selection
________________________________________
FR-17 Admin Management
Admin shall manage:
•	Users
•	Suppliers
•	Categories
•	Requirements
•	Reports
________________________________________
5. BUSINESS RULES
BR-01
Suppliers must possess direct ownership, stock, manufacturing authority, distribution rights, brokerage authority, or service capability.
________________________________________
BR-02
Supplier-to-supplier lead forwarding is prohibited.
________________________________________
BR-03
Fake suppliers shall be permanently suspended.
________________________________________
BR-04
Customers may receive multiple supplier responses.
________________________________________
BR-05
Customers can select only one final supplier for each requirement.
________________________________________
BR-06
Only verified suppliers may access requirements.
________________________________________
6. NON-FUNCTIONAL REQUIREMENTS
Security
•	Password Encryption
•	Secure Login
•	OTP Verification
•	Role-Based Access Control
•	SSL Security
________________________________________
Performance
•	Response Time < 3 Seconds
•	Support 5000+ Concurrent Users
________________________________________
Availability
•	99% System Uptime
________________________________________
Scalability
The platform shall support:
•	Multiple Cities
•	Multiple States
•	Multiple Industries
________________________________________
Reliability
•	Automatic Data Backup
•	Recovery Mechanisms
________________________________________
7. DATABASE DESIGN
CUSTOMER
Field
customer_id
name
email
mobile
password
status
________________________________________
SUPPLIER
Field
supplier_id
company_name
owner_name
mobile
email
gst_number
verification_status
________________________________________
CATEGORY
Field
category_id
category_name
________________________________________
SUBCATEGORY
Field
subcategory_id
category_id
subcategory_name
________________________________________
REQUIREMENT
Field
requirement_id
customer_id
category_id
title
description
quantity
budget
location
status
created_date
________________________________________
QUOTATION
Field
quotation_id
requirement_id
supplier_id
amount
delivery_time
remarks
status
________________________________________
SUPPLIER_SELECTION
Field
selection_id
requirement_id
supplier_id
selection_date
________________________________________
DOCUMENTS
Field
document_id
supplier_id
document_type
document_path
________________________________________
8. SYSTEM WORKFLOW
Step 1:
Customer Registration
↓
Step 2:
Requirement Submission
↓
Step 3:
Supplier Verification
↓
Step 4:
Requirement Matching
↓
Step 5:
Supplier Response
↓
Step 6:
Quotation Submission
↓
Step 7:
Customer Comparison
↓
Step 8:
Supplier Selection
↓
Step 9:
Requirement Completion
↓
Step 10:
Feedback & Closure
________________________________________
9. SUCCESS CRITERIA
The system will be considered successful when:
•	Verified suppliers actively respond to requirements.
•	Genuine leads are generated.
•	Supplier-to-supplier lead forwarding is minimized.
•	Customer satisfaction increases.
•	Requirement fulfillment time decreases.
•	Platform adoption grows across industries.

