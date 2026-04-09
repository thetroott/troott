# Registration, Onboarding, and Login Process - Software Specification

This document outlines the complete user journey and system behavior for talent and business registration, onboarding, and login processes.

---

## Table of Contents

1. [Talent Registration Flow](#talent-registration-flow)
2. [Business Registration Flow](#business-registration-flow)
3. [Account Activation Flow](#account-activation-flow)
4. [Talent Onboarding Flow](#talent-onboarding-flow)
5. [Business Onboarding Flow](#business-onboarding-flow)
6. [Login Flow](#login-flow)

---

## Talent Registration Flow

### User Story
**As a** talent user  
**I want to** register a new account  
**So that** I can access the platform and showcase my skills

### Algorithm: Talent Registration Process

**Step 1**: User submits registration form
- User provides email address
- User provides password
- User selects user type as "talent"
- System receives registration request

**Step 2**: System validates registration input
- System checks if email is provided
- System checks if password is provided
- System checks if user type is provided
- System validates user type is either "talent" or "business"
- If any validation fails, system returns error message and stops process

**Step 3**: System validates email format
- System checks email format against standard email pattern
- System applies special handling for certain domain extensions
- If email format is invalid, system returns error message and stops process

**Step 4**: System checks if user already exists
- System searches for existing user with the same email address
- System performs case-insensitive email lookup
- If user exists and is superadmin, system returns forbidden error and stops process
- If user exists, system returns error message indicating email already registered and stops process
- If user does not exist, system continues to next step

**Step 5**: System validates password strength
- System checks password meets minimum length requirement
- System checks password contains uppercase letter
- System checks password contains lowercase letter
- System checks password contains numeric digit
- System checks password contains special character
- If password does not meet requirements, system returns error message with requirements and stops process

**Step 6**: System creates user account
- System creates new user record in database
- System stores email address in lowercase format
- System stores password type as user-generated
- System sets initial user type as generic user
- System sets account status as inactive and not activated
- System sets onboarding step to 1
- System sets onboarding status to not started
- System stores account creation timestamp
- System generates unique user identifier

**Step 7**: System sets user as self-creator
- System associates user record with user's own identifier as creator
- System updates user record with creator reference

**Step 8**: System encrypts password
- System uses email address as encryption key
- System applies encryption algorithm to password
- System stores encrypted password in user record
- System saves user record to database

**Step 9**: System updates user type
- System changes user type from generic to talent
- System sets talent flag to true
- System sets business flag to false
- System sets admin flag to false
- System saves user record to database

**Step 10**: System generates one-time password
- System generates six-digit numeric code
- System stores code in user record
- System sets code expiration time to 15 minutes from generation
- System marks code type as registration code
- System saves user record to database

**Step 11**: System queues email for delivery
- System creates email job with user information
- System includes one-time password code in email
- System selects email template for account verification
- System personalizes email content with user information
- System adds email job to processing queue
- System returns success response to user

**Step 12**: User receives email
- Email service processes queued email job
- System sends email to user's email address
- Email contains verification code and instructions
- Email includes expiration time information

**Step 13**: System returns registration response
- System returns success response to user
- Response includes user identifier and email address
- Response includes user type information
- Response indicates OTP has been sent to email
- Response excludes sensitive information like password and OTP code

---

## Business Registration Flow

### User Story
**As a** business user  
**I want to** register a new business account  
**So that** I can access the platform and manage my business operations

### Algorithm: Business Registration Process

**Step 1**: User submits registration form
- User provides email address
- User provides password
- User selects user type as "business"
- System receives registration request

**Step 2**: System validates registration input
- System checks if email is provided
- System checks if password is provided
- System checks if user type is provided
- System validates user type is either "talent" or "business"
- If any validation fails, system returns error message and stops process

**Step 3**: System validates email format
- System checks email format against standard email pattern
- System applies special handling for certain domain extensions
- If email format is invalid, system returns error message and stops process

**Step 4**: System checks if user already exists
- System searches for existing user with the same email address
- System performs case-insensitive email lookup
- If user exists and is superadmin, system returns forbidden error and stops process
- If user exists, system returns error message indicating email already registered and stops process
- If user does not exist, system continues to next step

**Step 5**: System validates password strength
- System checks password meets minimum length requirement
- System checks password contains uppercase letter
- System checks password contains lowercase letter
- System checks password contains numeric digit
- System checks password contains special character
- If password does not meet requirements, system returns error message with requirements and stops process

**Step 6**: System creates user account
- System creates new user record in database
- System stores email address in lowercase format
- System stores password type as user-generated
- System sets initial user type as generic user
- System sets account status as inactive and not activated
- System sets onboarding step to 1
- System sets onboarding status to not started
- System stores account creation timestamp
- System generates unique user identifier

**Step 7**: System sets user as self-creator
- System associates user record with user's own identifier as creator
- System updates user record with creator reference

**Step 8**: System encrypts password
- System uses email address as encryption key
- System applies encryption algorithm to password
- System stores encrypted password in user record
- System saves user record to database

**Step 9**: System updates user type
- System changes user type from generic to business
- System sets business flag to true
- System sets talent flag to false
- System sets admin flag to false
- System saves user record to database

**Step 10**: System generates one-time password
- System generates six-digit numeric code
- System stores code in user record
- System sets code expiration time to 15 minutes from generation
- System marks code type as registration code
- System saves user record to database

**Step 11**: System queues email for delivery
- System creates email job with user information
- System includes one-time password code in email
- System selects email template for account verification
- System personalizes email content with user information
- System adds email job to processing queue
- System returns success response to user

**Step 12**: User receives email
- Email service processes queued email job
- System sends email to user's email address
- Email contains verification code and instructions
- Email includes expiration time information

**Step 13**: System returns registration response
- System returns success response to user
- Response includes user identifier and email address
- Response includes user type information
- Response indicates OTP has been sent to email
- Response excludes sensitive information like password and OTP code

---

## Account Activation Flow

### User Story
**As a** registered user  
**I want to** activate my account using the verification code  
**So that** I can log in and access the platform

### Algorithm: Account Activation Process

**Step 1**: User submits activation request
- User provides email address
- User provides verification code from email
- User provides code type as registration code
- System receives activation request

**Step 2**: System validates activation input
- System checks if email is provided
- System checks if verification code is provided
- System checks if code type is provided
- If any field is missing, system returns error message and stops process

**Step 3**: System locates user account
- System searches for user with provided email address
- System performs case-insensitive email lookup
- If user not found, system returns error message and stops process
- If user found, system continues to next step

**Step 4**: System checks account activation status
- System checks if account is already activated
- If account is already active, system returns error message indicating account already activated and stops process
- If account is not active, system continues to next step

**Step 5**: System verifies verification code
- System retrieves stored verification code from user record
- System retrieves code expiration time from user record
- System retrieves code type from user record
- System compares provided code with stored code
- System checks if code type matches
- System checks current time against code expiration time
- If code does not match, system returns error message and stops process
- If code type does not match, system returns error message and stops process
- If code has expired, system clears expired code from user record, returns error message, and stops process
- If code is valid, system continues to next step

**Step 6**: System clears verification code
- System removes verification code from user record
- System removes code expiration time from user record
- System saves user record to database

**Step 7**: System activates user account
- System sets account activated flag to true
- System sets account active flag to true
- System sets account locked flag to false
- System resets login attempt counter to zero
- System saves user record to database

**Step 8**: System updates login information
- System records current timestamp as last login time
- System sets login method as email
- System saves user record to database

**Step 9**: System generates authentication token
- System creates authentication token with user information
- System includes user identifier in token
- System includes user email in token
- System includes token version in token
- System sets token expiration time
- System signs token with secret key
- System stores token in user record
- System saves user record to database

**Step 10**: System prepares activation response
- System collects user profile information
- System includes onboarding status in response
- System includes account status in response
- System includes authentication token in response
- System excludes sensitive information from response

**Step 11**: System returns activation response
- System returns success response to user
- Response includes user profile information
- Response includes authentication token
- Response includes onboarding status
- Response indicates account activated successfully

**Step 12**: User receives activation confirmation
- User receives success response
- User stores authentication token
- User can now use token for authenticated requests

---

## Talent Onboarding Flow

### User Story
**As a** talent user with activated account  
**I want to** complete my profile setup  
**So that** I can fully utilize the platform features

### Algorithm: Talent Onboarding Process

#### Onboarding Step 1: Set User Type

**Step 1**: User initiates onboarding step 1
- User is authenticated with valid token
- User provides user type as talent
- System receives step 1 request

**Step 2**: System locates user account
- System identifies user from authentication token
- System retrieves user record from database
- If user not found, system returns error message and stops process
- If user found, system continues to next step

**Step 3**: System validates user type
- System checks if provided user type is valid
- System validates user type is either talent or business
- If user type is invalid, system returns error message and stops process

**Step 4**: System updates user type
- System changes user type to talent
- System sets talent flag to true
- System sets business flag to false
- System sets onboarding step to 1
- System sets onboarding status to in progress
- System saves user record to database

**Step 5**: System assigns talent role
- System locates talent role in system
- System associates talent role with user account
- System adds role reference to user record
- System adds user reference to role record
- System saves both user and role records to database

**Step 6**: System initializes permissions
- System retrieves default permissions for talent role
- System assigns role permissions to user account
- System stores permission references in user record
- System saves user record to database
- System clears any cached permission data for user

**Step 7**: System returns step 1 completion
- System returns success response
- Response includes updated user type
- Response includes current onboarding step
- Response includes onboarding status

#### Onboarding Step 2: Set Basic Information

**Step 1**: User initiates onboarding step 2
- User is authenticated with valid token
- User provides first name
- User provides last name
- User provides location information including country
- User provides timezone
- System receives step 2 request

**Step 2**: System locates user account
- System identifies user from authentication token
- System retrieves user record from database
- If user not found, system returns error message and stops process
- If user found, system continues to next step

**Step 3**: System validates step progression
- System checks if user completed step 1
- System verifies onboarding step is at least 1
- If step 1 not completed, system returns error message and stops process

**Step 4**: System validates required fields
- System checks if first name is provided
- System checks if last name is provided
- System checks if country is provided in location
- System checks if timezone is provided
- If any required field is missing, system returns error message and stops process

**Step 5**: System updates user basic information
- System stores first name in user record
- System stores last name in user record
- System stores location information in user record
- System stores timezone in user record
- System updates onboarding step to 2
- System saves user record to database

**Step 6**: System returns step 2 completion
- System returns success response
- Response includes current onboarding step
- Response includes onboarding status

#### Onboarding Step 3: Set Talent-Specific Information

**Step 1**: User initiates onboarding step 3
- User is authenticated with valid token
- User provides specialty area
- User provides gender
- User provides date of birth
- System receives step 3 request

**Step 2**: System locates user account
- System identifies user from authentication token
- System retrieves user record from database
- If user not found, system returns error message and stops process
- If user found, system continues to next step

**Step 3**: System validates user type
- System checks if user type is talent
- If user type is not talent, system returns error message and stops process

**Step 4**: System validates step progression
- System checks if user completed step 2
- System verifies onboarding step is at least 2
- If previous steps not completed, system returns error message and stops process

**Step 5**: System validates required fields
- System checks if specialty is provided
- System checks if gender is provided
- System checks if date of birth is provided
- If any required field is missing, system returns error message and stops process

**Step 6**: System validates field formats
- System validates gender against allowed values
- System validates date of birth is valid date
- System calculates age from date of birth
- System checks if age meets minimum requirement
- If any validation fails, system returns error message and stops process

**Step 7**: System checks for existing talent profile
- System searches for existing talent profile linked to user
- If talent profile exists, system proceeds to update existing profile
- If talent profile does not exist, system proceeds to create new profile

**Step 8**: System creates or updates talent profile
- If creating new profile:
  - System generates unique talent code
  - System creates new talent record in database
  - System links talent record to user account
  - System initializes talent profile fields
  - System stores talent-specific information
- If updating existing profile:
  - System updates existing talent record
  - System stores talent-specific information
- System saves talent record to database

**Step 9**: System ensures role and permissions
- System verifies user has talent role assigned
- System verifies user has talent permissions assigned
- If role or permissions missing, system assigns them
- System clears any cached permission data

**Step 10**: System updates onboarding progress
- System updates onboarding step to 3
- System saves user record to database

**Step 11**: System returns step 3 completion
- System returns success response
- Response includes talent profile information
- Response includes current onboarding step
- Response includes onboarding status

---

## Business Onboarding Flow

### User Story
**As a** business user with activated account  
**I want to** complete my business profile setup  
**So that** I can fully utilize the platform features for my business

### Algorithm: Business Onboarding Process

#### Onboarding Step 1: Set User Type

**Step 1**: User initiates onboarding step 1
- User is authenticated with valid token
- User provides user type as business
- System receives step 1 request

**Step 2**: System locates user account
- System identifies user from authentication token
- System retrieves user record from database
- If user not found, system returns error message and stops process
- If user found, system continues to next step

**Step 3**: System validates user type
- System checks if provided user type is valid
- System validates user type is either talent or business
- If user type is invalid, system returns error message and stops process

**Step 4**: System updates user type
- System changes user type to business
- System sets business flag to true
- System sets talent flag to false
- System sets onboarding step to 1
- System sets onboarding status to in progress
- System saves user record to database

**Step 5**: System assigns business role
- System locates business role in system
- System associates business role with user account
- System adds role reference to user record
- System adds user reference to role record
- System saves both user and role records to database

**Step 6**: System initializes permissions
- System retrieves default permissions for business role
- System assigns role permissions to user account
- System stores permission references in user record
- System saves user record to database
- System clears any cached permission data for user

**Step 7**: System returns step 1 completion
- System returns success response
- Response includes updated user type
- Response includes current onboarding step
- Response includes onboarding status

#### Onboarding Step 2: Set Basic Information

**Step 1**: User initiates onboarding step 2
- User is authenticated with valid token
- User provides first name
- User provides last name
- User provides location information including country
- User provides timezone
- System receives step 2 request

**Step 2**: System locates user account
- System identifies user from authentication token
- System retrieves user record from database
- If user not found, system returns error message and stops process
- If user found, system continues to next step

**Step 3**: System validates step progression
- System checks if user completed step 1
- System verifies onboarding step is at least 1
- If step 1 not completed, system returns error message and stops process

**Step 4**: System validates required fields
- System checks if first name is provided
- System checks if last name is provided
- System checks if country is provided in location
- System checks if timezone is provided
- If any required field is missing, system returns error message and stops process

**Step 5**: System updates user basic information
- System stores first name in user record
- System stores last name in user record
- System stores location information in user record
- System stores timezone in user record
- System updates onboarding step to 2
- System saves user record to database

**Step 6**: System returns step 2 completion
- System returns success response
- Response includes current onboarding step
- Response includes onboarding status

#### Onboarding Step 3: Set Business-Specific Information

**Step 1**: User initiates onboarding step 3
- User is authenticated with valid token
- User provides business name
- User provides business type
- User provides industry
- User optionally provides tags
- System receives step 3 request

**Step 2**: System locates user account
- System identifies user from authentication token
- System retrieves user record from database
- If user not found, system returns error message and stops process
- If user found, system continues to next step

**Step 3**: System validates user type
- System checks if user type is business
- If user type is not business, system returns error message and stops process

**Step 4**: System validates step progression
- System checks if user completed step 2
- System verifies onboarding step is at least 2
- If previous steps not completed, system returns error message and stops process

**Step 5**: System validates required fields
- System checks if business name is provided
- System checks if business type is provided
- System checks if industry is provided
- If any required field is missing, system returns error message and stops process

**Step 6**: System validates field formats
- System validates business type against allowed values
- System validates business type is from allowed list
- If validation fails, system returns error message and stops process

**Step 7**: System checks for existing business profile
- System searches for existing business profile linked to user
- If business profile exists, system proceeds to update existing profile
- If business profile does not exist, system proceeds to create new profile

**Step 8**: System creates or updates business profile
- If creating new profile:
  - System generates unique business code
  - System creates new business record in database
  - System links business record to user account
  - System initializes business profile fields
  - System stores business-specific information
  - System sets verification status as unverified
  - System sets public visibility as false
- If updating existing profile:
  - System updates existing business record
  - System stores business-specific information
- System saves business record to database

**Step 9**: System ensures role and permissions
- System verifies user has business role assigned
- System verifies user has business permissions assigned
- If role or permissions missing, system assigns them
- System clears any cached permission data

**Step 10**: System updates onboarding progress
- System updates onboarding step to 3
- System saves user record to database

**Step 11**: System returns step 3 completion
- System returns success response
- Response includes business profile information
- Response includes current onboarding step
- Response includes onboarding status

---

## Login Flow

### User Story
**As a** registered and activated user  
**I want to** log in to my account  
**So that** I can access the platform and my account features

### Algorithm: Login Process

**Step 1**: User submits login request
- User provides email address
- User provides password
- System receives login request

**Step 2**: System validates login input
- System checks if email is provided
- System checks if password is provided
- If email not provided, system returns error message and stops process
- If password not provided, system returns error message and stops process
- System validates email format
- If email format is invalid, system returns error message and stops process

**Step 3**: System locates user account
- System searches for user with provided email address
- System performs case-insensitive email lookup
- System includes password field in search results
- If user not found, system returns error message indicating account not found and stops process
- If user found, system continues to next step

**Step 4**: System checks account lock status
- System checks if account is locked
- System retrieves lock expiration time if account is locked
- System compares current time with lock expiration time
- If account is locked and lock has not expired, system returns error message indicating account is locked and stops process
- If account is locked but lock has expired, system unlocks account and continues
- If account is not locked, system continues to next step

**Step 5**: System checks account deactivation status
- System checks if account is deactivated
- If account is deactivated, system returns error message indicating account has been deactivated and stops process
- If account is not deactivated, system continues to next step

**Step 6**: System verifies password
- System retrieves stored encrypted password from user record
- System encrypts provided password using user's email as key
- System compares encrypted provided password with stored encrypted password
- If passwords do not match, system increments login attempt counter, locks account if threshold reached, returns error message, and stops process
- If passwords match, system continues to next step

**Step 7**: System checks account activation status
- System checks if account is activated
- System checks if account is active
- If account is not activated or not active, system returns error message prompting user to activate account and stops process
- If account is activated and active, system continues to next step

**Step 8**: System activates account if needed
- System ensures account activated flag is set to true
- System ensures account active flag is set to true
- System ensures account locked flag is set to false
- System resets login attempt counter to zero
- System saves user record to database

**Step 9**: System updates login information
- System records current timestamp as last login time
- System sets login method as email
- System saves user record to database

**Step 10**: System generates authentication token
- System creates authentication token with user information
- System includes user identifier in token
- System includes user email in token
- System includes token version in token
- System sets token expiration time
- System signs token with secret key
- System stores token in user record
- System saves user record to database

**Step 11**: System prepares login response
- System collects user profile information
- System includes onboarding status in response
- System includes account status in response
- System includes authentication token in response
- System excludes sensitive information from response

**Step 12**: System returns login response
- System returns success response to user
- Response includes user profile information
- Response includes authentication token
- Response includes onboarding status
- Response indicates user logged in successfully

**Step 13**: User receives login confirmation
- User receives success response
- User stores authentication token
- User uses token for subsequent authenticated requests

---

## Account Locking Mechanism

### Behavior
When user provides incorrect password during login:

**Step 1**: System increments login attempt counter
- System increases login attempt counter by one
- System saves updated counter to user record

**Step 2**: System checks attempt threshold
- System compares login attempt counter with threshold value
- If counter reaches threshold, system proceeds to lock account
- If counter below threshold, system continues with error response

**Step 3**: System locks account if threshold reached
- System sets account locked flag to true
- System sets lock expiration time to 30 minutes from current time
- System saves user record to database

**Step 4**: System returns error response
- System returns error message indicating invalid credentials
- System does not reveal whether email or password was incorrect

**Step 5**: Account lock expiration
- System checks lock expiration time on subsequent login attempts
- If current time exceeds lock expiration time, system unlocks account
- System resets login attempt counter when account is unlocked
- User can attempt login again after lock expiration

---

## Password Security

### Password Requirements
- Minimum length: 8 characters
- Must contain at least one uppercase letter
- Must contain at least one lowercase letter
- Must contain at least one numeric digit
- Must contain at least one special character

### Password Storage
- System encrypts password before storage
- System uses email address as encryption key
- System stores encrypted password in database
- System never stores plain text password

### Password Verification
- System encrypts provided password using same method
- System compares encrypted provided password with stored encrypted password
- System never decrypts stored password for comparison

---

## Token Management

### Token Generation
- System generates token after successful activation or login
- Token contains user identifier, email, and token version
- Token has configurable expiration time
- Token is signed with secret key

### Token Storage
- System stores token in user record
- System also returns token to user in response
- User stores token for authenticated requests

### Token Usage
- User includes token in request headers for authenticated endpoints
- System validates token on each authenticated request
- System checks token signature, expiration, and user status
- System allows or denies request based on token validation

### Token Refresh
- System checks token expiration time
- System automatically generates new token if needed
- System returns new token in response headers
- User updates stored token with new token

---

## Email Verification System

### Code Generation
- System generates six-digit numeric code
- Code is stored in user record
- Code expiration time is set to 15 minutes from generation
- Code type is specified based on purpose

### Code Validation
- System retrieves stored code from user record
- System compares provided code with stored code
- System checks code type matches
- System verifies code has not expired
- System clears code after successful verification

### Code Expiration
- System checks current time against code expiration time
- If code has expired, system clears code from user record
- System returns error message indicating code has expired
- User must request new code if code expires

---

## Onboarding State Management

### Onboarding Steps
- Step 1: Set user type and assign role
- Step 2: Set basic information including name and location
- Step 3: Set user-type-specific information

### Step Progression
- User must complete steps in sequential order
- System validates previous step completion before allowing next step
- System returns error if user attempts to skip steps

### Onboarding Status
- Not Started: User has not begun onboarding
- In Progress: User has started but not completed onboarding
- Completed: User has completed all required onboarding steps

### Onboarding Step Tracking
- System tracks current step in user record
- System updates step number after each step completion
- System updates status based on progress

---

## Error Handling

### Validation Errors
- System validates all required fields
- System validates field formats and types
- System returns specific error messages for validation failures
- System stops process execution on validation errors

### Authentication Errors
- System returns generic error messages for authentication failures
- System does not reveal whether email or password was incorrect
- System returns appropriate error codes for different failure types

### Account Status Errors
- System checks account status before allowing actions
- System returns specific error messages for different account states
- System provides guidance on resolving account status issues

### System Errors
- System handles unexpected errors gracefully
- System returns generic error messages for system failures
- System logs errors for system administrators
- System maintains system security during error conditions