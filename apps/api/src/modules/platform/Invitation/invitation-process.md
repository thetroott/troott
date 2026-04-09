# Invitation Management Process - Software Specification

This document outlines the complete user journey and system behavior for invitation management processes.

---

## Table of Contents

1. [Create Invitation Flow](#create-invitation-flow)
2. [Validate Invitation Flow](#validate-invitation-flow)
3. [Revoke Invitation Flow](#revoke-invitation-flow)
4. [Resend Invitation Flow](#resend-invitation-flow)

---

## Create Invitation Flow

### User Story
**As a** resource owner or administrator  
**I want to** create an invitation for a user  
**So that** the user can join a resource

### Algorithm: Create Invitation Process

**Step 1**: User submits invitation creation request
- User provides inviter identifier
- User provides invitee email address
- User provides invitation type
- User provides resource identifier
- User optionally provides invitee user identifier
- System receives invitation creation request

**Step 2**: System validates invitation input
- System checks if inviter identifier is provided
- System checks if invitee email is provided
- System checks if resource identifier is provided
- System checks if invitation type is valid
- If any validation fails, system returns error message and stops process

**Step 3**: System checks for existing invitation
- System searches for existing pending invitation for same email and resource
- If pending invitation exists, system returns error message and stops process
- If no pending invitation exists, system continues to next step

**Step 4**: System generates invitation token
- System generates random token code
- System encrypts token using invitee email
- System stores encrypted token

**Step 5**: System creates invitation record
- System creates new invitation record in database
- System stores invitation type
- System stores inviter reference
- System stores invitee email in lowercase
- System stores invitee user identifier if provided
- System stores resource identifier
- System stores encrypted token
- System sets invitation status to pending
- System sets invitation expiration time to 7 days from creation
- System saves invitation to database

**Step 6**: System returns creation response
- System returns success response
- Response includes raw invitation token
- Response indicates invitation created successfully

---

## Validate Invitation Flow

### User Story
**As an** invited user  
**I want to** validate my invitation token  
**So that** I can accept the invitation

### Algorithm: Validate Invitation Process

**Step 1**: User submits invitation validation request
- User provides invitation token
- User provides email address
- System receives invitation validation request

**Step 2**: System validates request input
- System checks if token is provided
- System checks if email is provided
- If any field missing, system returns error message and stops process

**Step 3**: System encrypts provided token
- System encrypts token using provided email
- System uses same encryption method as invitation creation
- System continues to next step

**Step 4**: System locates invitation
- System searches for invitation with encrypted token
- System filters by pending status
- If invitation not found, system returns error message and stops process
- If invitation found, system continues to next step

**Step 5**: System checks invitation expiration
- System retrieves invitation expiration time
- System compares current time with expiration time
- If invitation has expired, system returns error message and stops process
- If invitation not expired, system continues to next step

**Step 6**: System updates invitation status
- System changes invitation status to accepted
- System saves invitation record to database

**Step 7**: System returns validation response
- System returns success response
- Response includes inviter information
- Response indicates invitation validated and accepted successfully

---

## Revoke Invitation Flow

### User Story
**As a** resource owner or administrator  
**I want to** revoke an invitation  
**So that** the invitation is no longer valid

### Algorithm: Revoke Invitation Process

**Step 1**: User submits invitation revocation request
- User provides invitation token
- User provides email address
- System receives invitation revocation request

**Step 2**: System validates request input
- System checks if token is provided
- System checks if email is provided
- If any field missing, system returns error message and stops process

**Step 3**: System encrypts provided token
- System encrypts token using provided email
- System uses same encryption method as invitation creation
- System continues to next step

**Step 4**: System locates invitation
- System searches for invitation with encrypted token
- System filters by pending status
- If pending invitation not found, system returns error message and stops process
- If pending invitation found, system continues to next step

**Step 5**: System revokes invitation
- System changes invitation status to revoked
- System saves invitation record to database

**Step 6**: System returns revocation response
- System returns success response
- Response indicates invitation revoked successfully

---

## Resend Invitation Flow

### User Story
**As a** resource owner or administrator  
**I want to** resend an invitation  
**So that** the user receives a new invitation token

### Algorithm: Resend Invitation Process

**Step 1**: User submits invitation resend request
- User provides invitation token
- User provides email address
- System receives invitation resend request

**Step 2**: System validates request input
- System checks if token is provided
- System checks if email is provided
- If any field missing, system returns error message and stops process

**Step 3**: System encrypts provided token
- System encrypts token using provided email
- System uses same encryption method as invitation creation
- System continues to next step

**Step 4**: System locates invitation
- System searches for invitation with encrypted token
- If invitation not found, system returns error message and stops process
- If invitation found, system continues to next step

**Step 5**: System checks invitation status
- System checks if invitation is already accepted
- System checks if invitation is already revoked
- If invitation is accepted or revoked, system returns error message and stops process
- If invitation is pending, system continues to next step

**Step 6**: System generates new token
- System generates new random token code
- System encrypts new token using invitee email
- System stores new encrypted token

**Step 7**: System updates invitation
- System updates invitation with new encrypted token
- System resets invitation expiration time to 7 days from update
- System saves invitation record to database

**Step 8**: System returns resend response
- System returns success response
- Response includes new raw invitation token
- Response indicates invitation resent successfully

---

## Invitation Token Security

### Token Generation
- System generates random token codes
- Token length is 29 characters
- Tokens include alphanumeric characters

### Token Encryption
- System encrypts tokens before storage
- System uses invitee email as encryption payload
- System uses separator in encryption process
- Encrypted tokens are stored in database

### Token Validation
- System encrypts provided tokens for comparison
- System compares encrypted tokens with stored tokens
- System validates tokens against email addresses

---

## Invitation Status

### Status Types
- PENDING: Invitation created but not yet accepted
- ACCEPTED: Invitation has been validated and accepted
- REVOKED: Invitation has been revoked by inviter

### Status Transitions
- PENDING -> ACCEPTED: When invitation is validated
- PENDING -> REVOKED: When invitation is revoked
- Status cannot be changed from ACCEPTED or REVOKED

---

## Invitation Expiration

### Expiration Period
- Invitations expire 7 days after creation
- Expiration time is set when invitation is created
- Expiration time is reset when invitation is resent

### Expiration Handling
- System checks expiration during validation
- Expired invitations cannot be validated
- Expired invitations can be revoked
- Expired invitations can be resent to generate new expiration

---

## Error Handling

### Validation Errors
- System validates all required fields
- System returns specific error messages for validation failures
- System stops process execution on validation errors

### Resource Errors
- System validates invitation existence before operations
- System returns specific error messages for invitation not found
- System handles invitation status conflicts gracefully

### System Errors
- System handles unexpected errors gracefully
- System returns error messages for system failures
- System logs errors for system administrators
