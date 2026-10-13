# Raccon Technical Documentation

## Table of Contents

- [Project Overview](#project-overview)
- [Terminology and Domain Rules](#terminology-and-domain-rules)
- [User Stories](#user-stories)
  - [Owner Stories](#owner-stories)
  - [Player Stories](#player-stories)
  - [Admin Stories](#admin-stories)
- [Figma Mockups](#figma-mockups)
- [System Architecture](#system-architecture)
- [Data Model and Relationships](#data-model-and-relationships)
- [High-Level Class Diagram](#high-level-class-diagram)
- [High-Level Sequence Diagrams](#high-level-sequence-diagrams)
- [Raccon REST API Documentation](#raccon-rest-api-documentation)
- [Technical Justifications](#technical-justifications)
- [Requirements Traceability](#requirements-traceability)
- [SCM and QA Plans](#scm-and-qa-plans)

## Project Overview

Raccon is an NFC-enabled platform for creating and playing physical, tag-based experiences. Administrators manufacture **packs** and program their NFC tags; customers claim purchased packs, thereby creating **events** that they can configure and publish; players scan the physical tags to view event content. The frontend is designed in React, the API is designed with FastAPI, and persistent data is stored in PostgreSQL.

## Terminology and Domain Rules

| Term | Meaning | Data model / API representation |
|---|---|---|
| **Pack** | Admin-generated physical inventory item containing a fixed set of NFC tags. It exists before purchase or claim. | `packs` |
| **Tag** | A physical NFC tag with a non-sequential public identifier and internal order number. | `tags` |
| **Master authorization token** | Unique, single-use claim credential identifying an unowned pack; Ramz delivers a link to the frontend claim page. | `packs.master_auth_hash` |
| **Event** | Owner-customizable experience created when a pack is claimed. | `events` |
| **Event tag** | Event-specific configuration for one physical tag, stored as JSONB. | `event_tags` |
| **Journey** | Player-facing tag scan operation for an active event. | `POST /journey/scan` |
| **`static_hash`** | Random, unique, public tag identifier, not the tag sequence number. | `tags.static_hash` |
| **Injected user identifier** | User UUID submitted by the client with the scan; must equal the authenticated JWT subject. | `injected_user_hash` request field. |

### Event lifecycle

- **`draft`** — Created automatically at claim time; not scannable. The first non-empty successful setup request transitions it to `paused`.
- **`paused`** — Configuration has been saved; scanning is unavailable. The owner may edit and save the configuration or change the status to `live` through the event update endpoint.
- **`live`** — The scan endpoint accepts scans for this event and returns configured tag content. Configuration editing and saving are rejected until the owner ends the round and returns the event to `paused`.


### Identifier and ownership conventions

Owners are identified by `packs.owner_id`; an event inherits ownership through its associated pack. Admin privileges come from `users.role = "admin"`, verified after JWT authentication. The frontend must not treat public NFC URLs or client-supplied identifiers as proof of authorization.



## User Stories

The user stories below specify the complete intended Raccon experience. **Packs** are admin-generated physical inventory, while **events** are created when customers claim packs and are subsequently configured and managed by their owners.

## Owner Stories

### US-01: Registration

**Category:** Owner &nbsp; · &nbsp; **Priority:** High

**User story**

> As a new visitor,
> I want to register an account,
> So I can buy NFC packs, manage my experiences, or participate in experiences as a player.

**Acceptance criteria**

- The visitor should be able to access the registration page without being signed in.
- If the user already has an account, they can navigate to the login page from the registration page.
- The visitor should be able to select an avatar from the available options, with the first avatar selected by default.
- The registration form should require a name, username, email address, phone number, and password.
- All the registration form fields are mandatory.
- The username and email must be unique and must not already belong to another Raccon account.
- If the entered username is already in use, the system should inform the visitor that the username is unavailable.
- If the entered email address is already registered, the system should inform the visitor that an account already exists with that email.
- The system should validate the format of the entered fields.
- The system should prevent registration until all mandatory fields contain valid values.
- Validation errors should be displayed clearly under the relevant field in red.
- After successful registration, the user should be signed in.
- The created account should be identifiable by the system as an owner or player according to the actions available to that user.

---

### US-02: Log In

**Category:** Owner &nbsp; · &nbsp; **Priority:** High

**User story**

> As a registered user,
> I want to log in to my Raccon account,
> So I can securely access my account.

**Acceptance criteria**

- The user should be able to log in using their username or email address and password.
- Invalid credentials should result in a generic error message without revealing whether a specific account exists.
- After successfully logging in, the user should remain authenticated until their session expires or they log out.
- An authenticated package owner should be able to access packages associated with their account.
- An authenticated player should be able to continue participating in an NFC experience.
- The user should be able to navigate to the Forgot Password page from the login page.
- If a player is redirected to log in after scanning an NFC tag, the system should return the player to the scanned tag after successful authentication.

---

### US-03: Log Out

**Category:** Owner &nbsp; · &nbsp; **Priority:** High

**User story**

> As a registered user,
> I want to log out of my Raccon account,
> So I can end my session when needed.

**Acceptance criteria**

- The authenticated user should be able to access a Log Out option.
- Selecting Log Out should end the user's current session.
- After logging out, the user should be redirected to the login page.
- The user should not be able to access authenticated pages without logging in again.

---

### US-04: Forgot Password

**Category:** Owner &nbsp; · &nbsp; **Priority:** High

**User story**

> As a registered user,
> I want to reset my password if I forget it,
> So I can regain access to my Raccon account.

**Acceptance criteria**

- The sign-in page should display a "Forgot Password?" link.
- Clicking the link should redirect the user to the Forgot Password page.
- The user should be able to enter their registered email address.
- The system should validate the entered email address format.
- After submitting the email address, the system should display a confirmation message indicating that password reset instructions have been sent if the account exists.
- If the email address is associated with a Raccon account, the system should send a password reset link to that email address.
- The password reset link should be unique, time-limited, and usable only once.
- Clicking a valid reset link should redirect the user to a page where they can enter and confirm a new password.
- The system should validate the new password and ensure both password fields match.
- After successfully resetting the password, the system should display a confirmation message and allow the user to return to the sign-in page.
- The user should be able to log in using their new password.
- Expired or previously used reset links should be rejected with a clear error message.

---

### US-05: Manage Account

**Category:** Owner &nbsp; · &nbsp; **Priority:** High

**User story**

> As a registered user,
> I want to manage my Raccon account,
> So I can control my profile information and account settings.

**Acceptance criteria**

- The user should be able to view their profile information.
- The user should be able to edit their username.
- The user should be able to save changes to their profile information.
- The system should display a confirmation message after successfully saving profile changes.
- The user should be able to change their password.
- The user should be required to enter their current password before setting a new password.
- The system should validate the new password before saving it.
- The user should be able to delete their account.
- The system should request confirmation before permanently deleting the account.
- The user should be logged out after successfully deleting their account.

---

### US-06: Claim a Purchased Package

**Category:** Owner &nbsp; · &nbsp; **Priority:** High

**User story**

> As a registered user,
> I want to claim a package I purchased,
> So I can securely access my package and customize its experience.
**Acceptance Criteria**

- The user shall be able to view the available NFC pack options on the Raccon platform.
- Each pack option shall display its gameplay mode (Sequential or Open Hunt), number of NFC tags, and price.
- The user shall be able to select a pack and be redirected to its corresponding product page on Ramz to complete the purchase.
- After a successful purchase, Ramz shall send the customer a unique claim link, such as `https://raccon.app/claim?token=<master-auth-token>`.
- When the customer opens the claim link, the browser shall make an **HTTP GET request** to the React frontend route `/claim`, which displays the pack claim page and preserves the authorization token.
- If the customer is not authenticated, the system shall require them to log in or register while preserving the claim token.
- The React frontend shall display a confirmation action before claiming the pack.
- When the customer confirms, the React frontend shall send an **authenticated HTTP POST request** to the FastAPI endpoint `POST /packs/claim`, including the authorization token in the JSON request body and the customer's JWT in the authorization header.
- The backend shall validate the authorization token and verify that the pack has not already been claimed.
- If the claim is valid, the system shall assign the pack to the authenticated customer and create exactly one event with the initial status `draft`.
- Pack ownership assignment and event creation shall succeed or fail atomically.
- If the token is invalid or already used, the system shall reject the claim and display an appropriate error message without changing pack ownership or creating an event.
- A pack that has already been claimed shall not be claimable by another account.
- After a successful claim, the event shall appear in the customer's owned events list.
- The customer shall be able to access the customization page for the claimed event.
- The physical pack and its NFC tags shall exist before claiming; the claim process shall not create or modify physical tags.
---

### US-07: View and Manage Purchased NFC Packages

**Category:** Owner &nbsp; · &nbsp; **Priority:** High

**User story**

> As an NFC event owner,
> I want to view and identify the NFC packs associated with my account,
> So I can access and manage my purchased experiences.

**Acceptance criteria**

- The owner should be able to view all NFC packs associated with their account.
- A newly claimed pack should use “Untitled” as its default Event Title.
- Package names can be duplicates.
- Each package should display:
  - Event Title
  - Event ID
  - Mode: Sequential or Open Hunt
  - Number of NFC tags
  - Current status
- The Event ID, mode and number of tags should not be editable.
- The package status should not be directly editable by changing the event information.
- The event title should be editable independently of tag configuration.
- The event title field should have a maximum length of 20 characters.
- The owner should be able to rename the event at any time without an edit limit.
- Renaming the event should not count toward the event's customization edit limit.
- The owner should only be able to access packages associated with their account.
- Selecting a package should allow the owner to access its customization interface.
- Previously saved event configurations should remain available when the owner returns to the event.
- `GET /events` should list the owner’s events; `GET /events/{event_id}` should provide the selected event’s configuration details.
- `PATCH /events/{event_id}` should update the event title and control status changes, including transition to `live`.
- Event lifecycle values should be `draft`, `paused`, and `live`; scans should be accepted only while `live`.

---

### US-08: NFC Package Customization

**Category:** Owner &nbsp; · &nbsp; **Priority:** High

**User story**

> As an NFC event owner,
> I want to customize the individual tags in my package,
> So I can create experiences that fit my intended activity.

**Acceptance criteria**

- The customization dashboard should display all NFC tags belonging to the selected package.
- Tags should be displayed as numbered circles in ascending order.
- The total number of displayed tags should match the number of tags included in the claimed pack.
- The first tag should be selected by default when the customization dashboard is initially opened.
- Selecting another tag should load that tag's current configuration into the customization area.
- The currently selected tag should be visually distinguishable from the remaining tags via hover effect.
- The empty tags, configured tags and current tag should be visually distinguishable.
- The customization area should clearly display the number of the tag currently being edited.
- The owner should be able to configure tags individually while remaining within the same event customization session.
- The owner should be able to save the completed event configuration.
- `PUT /events/{event_id}/setup` should save the event-specific tag configurations; the first successful non-empty setup should transition the event from `draft` to `paused`.
- Event configuration must not modify the physical pack’s immutable tag identifiers or ordering.

---

### US-09: Customize Tag Content

**Category:** Owner &nbsp; · &nbsp; **Priority:** High

**User story**

> As an NFC event owner,
> I want to add content to an individual NFC tag,
> So players receive the intended hint or information when they discover that tag.

**Acceptance criteria**

- The owner should be able to add optional hint text to a tag.
- Hint text should have a maximum length of 255 characters and minimum of 0 characters.
- The interface should display the current character count.
- The owner should not be able to enter more than 255 characters.
- The text field should use the Thmanyah font, a font size of 18px, and the color `#2D3B33`.
- The owner should be able to optionally upload an image.
- Supported image formats should be JPG, PNG, and WEBP.
- An uploaded image should not exceed 5 MB.
- Unsupported files should be rejected with a clear validation message.
- Images larger than 5 MB should be rejected with a clear validation message.
- If replacing an existing image fails validation, the previously saved image should remain unchanged.
- Text and image content should both be optional, allowing the owner to configure a tag with text only, an image only, both, or no content.
- Saving should persist the selected tag’s configuration through the event setup request, which submits the event’s tag configuration set.
- After a successful save, the interface should provide confirmation that the tag was saved.
- Successfully configuring a previously empty tag should update the event configuration progress.
- Navigating away from a tag with unsaved changes should warn the owner before those changes are discarded.
- Tag content should be represented by `event_tags.content` as JSONB, using `hint` and `image` fields for clue tags.
- The backend should validate tag membership and event ownership before replacing event tag configurations.

---

### US-10: Edit a Saved Package Configuration

**Category:** Owner &nbsp; · &nbsp; **Priority:** High

**User story**

> As an NFC event owner,
> I want to edit a previously saved event configuration,
> So I can correct or update the experience after its initial customization.

**Acceptance criteria**

- A package should allow a maximum of three editing sessions after its initial configuration is saved.
- The edit limit should apply to the entire package, not to individual tags.
- A saved package should not be directly editable until the owner explicitly selects Edit, and editing is permitted only while the event is `paused`.
- Selecting Edit should open the entire package for editing.
- Once editing is enabled while the event is `paused`, the owner should be able to modify any configurable tag or package-level setting as they would during the initial customization.
- Editing only one tag should still count as one event editing session.
- Editing multiple tags during the same editing session should still count as only one package edit.
- The interface should display how many event edits remain.
- Entering the customization page without making and saving changes should not consume an edit.
- Previewing the event should not consume an edit.
- Discarding changes should not consume an edit.
- An edit should only be consumed when changes from an editing session are successfully saved while the event is `paused`. Saves attempted while `live` shall be rejected without consuming an edit.
- When one edit remains, the system should warn the owner before saving that this will use the event's final edit.
- Once all three event edits have been used, the event configuration should become read-only.
- The Event Title should remain editable even when no customization edits remain.
- The edit allowance belongs to the event as a whole; `PUT /events/{event_id}/setup` is the configuration persistence operation.
- Event title changes through `PATCH /events/{event_id}` should remain independent of the customization edit allowance.

---

### US-11: Configure Freeze Trap

**Category:** Owner &nbsp; · &nbsp; **Priority:** Medium

**User story**

> As an Open Hunt NFC event owner,
> I want to assign a Freeze trap to selected NFC tags,
> So I can temporarily prevent players from continuing the experience.

**Acceptance criteria**

- The owner should be able to configure an individual tag as a Freeze trap.
- Only one trap type should be assigned to a tag at a time.
- When the owner selects Freeze, they should be prompted to specify the Freeze duration.
- The Freeze duration should be selectable in 30-second increments, ranging from 30 seconds to 3 minutes.
- Values outside the allowed range should not be accepted.
- The Freeze configuration should only become active after the event configuration is successfully saved.
- Changes to the Freeze configuration after the initial save should follow the event editing rules defined in US-10.
- A player who successfully scans the tag should be frozen for the configured duration.
- While frozen, the player should not be able to successfully scan another tag.
- The Freeze countdown should be tracked independently for each player.
- Re-scanning the same Freeze tag while frozen should display the remaining time without restarting the countdown.
- A Freeze tag should never become claimed and should remain available to all players throughout the experience.
- Freeze settings should be represented within the trap tag’s event-specific JSONB content.

---

### US-12: Configure Boom Trap

**Category:** Owner &nbsp; · &nbsp; **Priority:** Medium

**User story**

> As an Open Hunt NFC event owner,
> I want to assign a Boom trap to selected NFC tags,
> So I can introduce point penalties into the experience.

**Acceptance criteria**

- The owner should be able to configure an individual tag as a Boom trap.
- Only one trap type should be assigned to a tag at a time.
- When the owner selects Boom, the point deduction should be fixed at one point.
- The Boom configuration should only become active after the event configuration is successfully saved.
- Changes to the Boom configuration after the initial save should follow the event editing rules defined in US-10.
- A player who successfully scans the tag should lose one point.
- A player's score should never fall below zero.
- A Boom tag should never become claimed and should remain available to all players throughout the experience.
- The same player should not be able to trigger the same Boom tag twice consecutively.
- Re-scanning the same Boom tag consecutively should not result in an additional point deduction.
- After successfully scanning a different tag, the player should be able to trigger the previous Boom tag again.
- One player's interaction with a Boom tag should not affect another player's ability to trigger it.
- Boom settings should be represented within the trap tag’s event-specific JSONB content.

---

### US-13: Configure Choose Trap

**Category:** Owner &nbsp; · &nbsp; **Priority:** Medium

**User story**

> As an Open Hunt NFC event owner,
> I want to assign a Choose Trap to selected NFC tags,
> So players can determine the trap behavior encountered by subsequent scanners during the experience.

**Acceptance criteria**

- The owner should be able to configure an individual tag as a Choose Trap.
- Only one trap type should be assigned to a tag at a time.
- The Choose Trap configuration should only become active after the event configuration is successfully saved.
- Changes to the Choose Trap configuration after the initial save should follow the event editing rules defined for event customization.
- A Choose Trap tag should never become claimed and should remain available throughout the Open Hunt experience.
- Multiple players should be able to interact with the same Choose Trap tag.
- When a player is allowed to configure the trap, they should be able to choose between Freeze and Boom.
- Selecting Freeze should prompt the player to specify a duration selectable in 30-second increments, ranging from 30 seconds to 3 minutes.
- Selecting Boom should configure a deduction of one point.
- The player should only be able to select one trap type.
- The confirmed choice takes effect immediately and remains active for subsequent eligible scans until replaced. The effect can include the chooser; the precise set of players affected immediately must be specified in the gameplay rules.
- The player who configures the trap is also subject to its effect on a later eligible scan.
- Any Freeze or Boom behavior configured through Choose Trap should follow the same player-specific rules as a directly configured Freeze or Boom tag.
- Choose-trap configuration should be represented within the trap tag’s event-specific JSONB content.

---

### US-14: Preview Sequential Tag Experience

**Category:** Owner &nbsp; · &nbsp; **Priority:** Medium

**User story**

> As a sequential NFC event owner,
> I want to preview a tag before saving or publishing it,
> So I can understand what the player will see when the tag is scanned.

**Acceptance criteria**

- A Preview button should be available in the tag customization interface.
- Clicking Preview should display a mobile representation of the player's scan-result screen.
- The preview should use the selected tag's current configuration, including unsaved changes.
- The preview should display a circle containing the selected tag number.
- The preview should display the "ﺣﺻﻠﺗﮭﺎ!" heading used in the player experience.
- The preview should display the configured hint text when present.
- The preview should display the configured image when present.
- The preview should use a fixed Sequential experience layout, regardless of the event being customized.
- The preview should display a generic leaderboard with sample player information rather than actual player rankings.
- Opening or closing the preview should not save the event configuration or consume an available package edit.

---

### US-15: Preview Open Hunt Tag Experience

**Category:** Owner &nbsp; · &nbsp; **Priority:** Medium

**User story**

> As an open hunt NFC event owner,
> I want to preview a tag before saving or publishing it,
> So I can understand what the player will see when the tag is scanned.

**Acceptance criteria**

- A Preview button should be available from the tag customization interface.
- Clicking Preview should display a mobile representation of the player's scan-result screen.
- The preview should use the tag's current configuration, including unsaved changes.
- The preview should display a circle with the selected tag number.
- The preview should display the "ﺣﺻﻠﺗﮭﺎ!" heading used in the player experience.
- The preview should display the configured hint text when present.
- The preview should display the configured image when present.
- The preview should use a fixed Open Hunt experience layout, regardless of the event being customized.
- The preview should display a generic leaderboard with sample player information.
- Opening or closing a preview should not save the tag or consume one of the available edits.

## Player Stories

### US-16: Scan a Hashed NFC Tag

**Category:** Player &nbsp; · &nbsp; **Priority:** Medium

**User story**

> As a player,
> I want to access the correct event tag by scanning its unique NFC URL,
> So I can participate securely in a live Raccon experience.

**Acceptance criteria**

- Each physical tag should contain a URL in the format `https://raccon.link/t/{static_hash}`.
- `static_hash` should be a unique identifier that does not reveal the tag's internal sequence number.
- Opening the NFC URL should resolve the corresponding physical tag without exposing its ordering in the link.
- A player who is not authenticated should be redirected to sign in and then returned to the intended tag.
- The frontend should submit the tag's `static_hash` as `tag_hash` to `POST /journey/scan`.
- The scan request should include `injected_user_hash`, containing the authenticated player's UUID.
- The backend should compare that UUID with the user ID in the JWT and reject a mismatch.
- A nonexistent tag hash should be rejected without changing progress or score.
- The backend should reject scans when the associated event has status `draft` or `paused`.
- Only tags belonging to an event with status `live` should be eligible for a successful scan.
- Rejected scans should not award points, advance progress, or trigger traps.
- The scan response should identify the tag's sequence number, configured type, and event-specific content as applicable.

---

### US-17: View Successful Sequential Scan Result

**Category:** Player &nbsp; · &nbsp; **Priority:** High

**User story**

> As a player,
> I want to see the result of a successful sequential NFC scan,
> So I know which tag I discovered and can receive its clue or content.

**Acceptance criteria**

- After a successful scan, the player should see the "ﺣﺻﻠﺗﮭﺎ!" heading.
- The scanned tag number should be prominently displayed inside a numbered circle.
- The configured hint text should be displayed when the owner has provided one.
- The configured image should be displayed when the owner has provided one.
- If neither text nor an image is configured, the scan result should still display the relevant tag information.
- If Tags Left is enabled, the number of remaining tags should be displayed.
- If Tags Left is disabled, this information should not be displayed.
- If Timer is enabled, the time left should be displayed.
- The player's progress should be updated.
- The player should be able to access the sequential leaderboard from the scan-result interface.

---

### US-18: View Successful Open Hunt Scan Result

**Category:** Player &nbsp; · &nbsp; **Priority:** High

**User story**

> As a player,
> I want to see the result of a successful open hunt NFC scan,
> So I can earn its points before another player claims it.

**Acceptance criteria**

- After a successful scan, the player should see the "ﺣﺻﻠﺗﮭﺎ!" heading.
- The configured hint text should be displayed when the owner has provided one.
- The configured image should be displayed when the owner has provided one.
- If neither text nor an image is configured, the scan result should still display the relevant tag information.
- The first player to successfully scan an unclaimed normal tag in the current round should claim that tag.
- The first player to claim the tag should receive exactly one point.
- A tag claimed by Player A should no longer award points to Player B, Player C, or any other player.
- Re-scanning a tag already claimed by the same player should also award no additional points.
- The player should be able to see their current score.
- If Tags Left is enabled, the number of remaining tags should be displayed.
- If Tags Left is disabled, this information should not be displayed.
- If Timer is enabled, the time left should be displayed.
- The player's score should be updated.
- The player should be able to access the open hunt leaderboard from the scan-result interface.

---

### US-19: Experience a Freeze Trap

**Category:** Player &nbsp; · &nbsp; **Priority:** Medium

**User story**

> As an open hunt player,
> I want clear feedback when I activate a Freeze trap,
> So I understand why I temporarily cannot continue scanning tags.

**Acceptance criteria**

- Scanning a tag configured with a Freeze trap should activate the configured Freeze duration.
- The player should be shown a dedicated Freeze screen.
- The Freeze screen should clearly indicate that the player has been frozen.
- A countdown should display the remaining Freeze duration.
- While frozen, attempts to scan other Raccon tags should not be counted as successful scans.
- Scanning another tag during the Freeze period should return the player to the Freeze state and show the remaining time.
- The Freeze duration should continue from the original activation and should not restart because another tag was scanned.
- No points or progression should be awarded for scans rejected during the Freeze period.
- Re-scanning the same freeze tag while already frozen should display the player's existing countdown rather than starting a new Freeze period.
- Once the countdown reaches zero, the player should automatically become eligible to scan tags again.

---

### US-20: Experience a Boom Trap

**Category:** Player &nbsp; · &nbsp; **Priority:** Medium

**User story**

> As an open hunt player,
> I want the result of a Boom trap to be reflected in my score,
> So I can understand the consequence of discovering that tag.

**Acceptance criteria**

- Scanning a tag containing a Boom trap should activate its configured point deduction.
- The configured number of points should be deducted from the player's current score.
- The player's score should never become negative.
- If the deduction exceeds the player's current score, the resulting score should be zero.
- The updated score should be reflected in the player's experience.
- The leaderboard should reflect the player's updated score.
- The scan should record that the Boom trap was triggered.

---

### US-21: View Leaderboard

**Category:** Player &nbsp; · &nbsp; **Priority:** Medium

**User story**

> As a player,
> I want to view the experience leaderboard,
> So I can compare my performance with other players.

**Acceptance criteria**

- The leaderboard should be accessible from the player's scan-result screen.
- The leaderboard should be displayed in a scrollable sheet.
- Each leaderboard entry should display the player's rank, player identity/display name, and score.
- A player’s sequential leaderboard value should represent the highest consecutively completed sequential tag in the current round.
- A player's open hunt leaderboard score should reflect one point per first-claimed normal tag, adjusted by Boom penalties, in the current round.
- The current player's entry should be visually distinguishable from other entries.
- The leaderboard should reflect changes resulting from valid scans and trap effects.
- The player's leaderboard information should refresh after their scan affects their score or progression.

## Admin Stories

### US-22: Prepare an NFC Package

**Category:** Admin &nbsp; · &nbsp; **Priority:** High

**User story**

> As an admin,
> I want to program and lock each NFC tag with its assigned URL,
> So I can prepare a complete physical Raccon package for customers.

**Acceptance criteria**

- The admin should be able to enter a Event ID to load the event configuration and required NFC tags.
- The programming station should indicate which tag to scan next and display the package's programming progress.
- If a scanned tag already contains data, the station should display a red warning and play an error sound.
- A tag containing existing data should not be programmed, and the package's progress should remain unchanged.
- The station should prompt the admin to scan a blank NFC tag.
- If the scanned tag is blank, the station should write its assigned unique URL and apply the configured NDEF/password lock.
- A tag should only be considered successfully programmed after both writing and locking are completed.
- After successful programming and locking, the station should record the tag as "printed" in the backend.
- Once the backend confirms the tag's status, the station should play a success sound and advance to the next tag.
- If programming, locking, or backend recording fails, the station should display an error message and should not count the tag as completed.
- When all required tags are successfully recorded as printed, the station should display "Order 100% Complete."
- Admin authentication should use the same account login flow with authorization enforced through the `admin` role.
- The pack generation operation should assign each pack a master authorization token and each physical tag a unique `static_hash`, UUID, and internal `sequence_num`.
- The admin should retrieve the master authorization link for distribution through Ramz and the ordered factory URLs for NFC programming.
- The master authorization link should lead to the claim flow; claiming the pack should create its event only when a customer successfully claims it.
- Marking a tag as printed must require a successful programming and locking result.

## Figma Mockups

The [Raccon Figma workspace](https://www.figma.com/design/Hdv2zuWiZN8ltgtFmr4mhZ/Raccon-%25E2%2580%2594-User-Stories--Design-System---Mockups?node-id=325-34&p=f&t=XIrNazSEfBlfXD9l-0) brings together project requirements, design foundations, and interface mockups. Its pages are organized into the following sections:

- **Cover and Index:** Introduce the project and track changes and handoff status.
- **Admin:** Documents the brief and user stories in English and Arabic, alongside the sitemap, user flows, and architecture.
- **Foundations:** Defines the brand identity, logo, characters, authentication animation, design tokens for color, typography and spacing, reusable components, and interface copy in Saudi dialect.
- **Intake:** Collects team requests and feedback, with a sandbox for design explorations.

This structure connects the user stories to the design work and gives the team a shared reference for review and implementation.

## System Architecture

```mermaid
flowchart TB
    Store["Ramz store / purchase fulfillment "]
    Admin["Admin / factory station"]
    Owner["Owner on raccon.app"]
    Player["Player NFC scan"]
    Link["raccon.link/t/{static_hash}"]
    React["React frontend / routing / API client"]
    API["FastAPI: auth, users, admin, packs, events, journey"]
    JWT["JWT authentication and role checks"]
    DB[("PostgreSQL: users, packs, tags, events, event_tags")]
    Admin --> React
    Owner --> React
    Store -.->|"Master authorization link"| Owner
    Player --> Link --> React
    React -->|"HTTPS JSON / bearer JWT"| API
    API --> JWT
    API --> DB
```

### Architecture Layers

| Layer | Technology | Responsibility |
|---|---|---|
| Presentation | React (project frontend) | Owner and player screens, tag-link routing, factory interface, request composition |
| API | FastAPI, Pydantic | Request validation, authentication, authorization, event lifecycle, tag scanning |
| Data access | SQLModel / SQLAlchemy | Models, queries, and transactional persistence |
| Database | PostgreSQL | Durable users, packs, tags, events, and JSONB event-specific tag content |
| Migrations | Alembic | Versioned relational schema evolution |
| External systems | Ramz , NFC writing station | Purchase handoff and physical tag programming |


### Operational Data Flow

1. An admin generates a pack and its physical tags before a customer owns it.
2. The factory station retrieves the ordered `raccon.link` URLs, writes them to tags, and marks successful writes as printed.
3. Ramz provides the buyer with a master authorization link. The owner authenticates and submits the token to the claim API.
4. Claiming assigns the pack to the owner and creates an event in `draft` status.
5. The owner retrieves the event, saves the event-specific tag content, and changes the event to `live` using the update endpoint.
6. A player opens an NFC link; the frontend submits the unique tag hash and authenticated user's UUID to the journey scan endpoint.
7. FastAPI checks the JWT user identity, resolves the physical tag, selects the event for the pack, verifies `live` status, and returns content.

## Data Model and Relationships

Raccon separates physical inventory from event configuration. A pack is created by an administrator, contains physical tags, and can be claimed once. Claiming creates exactly one event. Starting a new round **does not** create a new event: the event's `record` JSONB stores the complete history of current and previous rounds, including players, scans, claims, scores, trap effects, and final results.

| Table | Important fields | Constraints and responsibility |
|---|---|---|
| `users` | `id: UUID`, `name`, `username`, `email`, `phone_number`, `password`, `role` | UUID primary key; unique username and email; `password` stores a password hash; `role` distinguishes admins |
| `packs` | `id: UUID`, `owner_id: UUID?`, `mode`, `tags_count`, `master_auth_hash` | Nullable owner; positive tag count; unique single-use claim credential; store a verifier in the target security design |
| `tags` | `id: UUID`, `pack_id: UUID`, `static_hash`, `sequence_num`, `is_printed` | Unique opaque NFC token; unique `(pack_id, sequence_num)`; factory programming state |
| `events` | `id: UUID`, `pack_id: UUID`, `title`, `status`, `edits_used`, `record: JSONB` | `UNIQUE(pack_id)`; `edits_used` from 0 to 3; `record` stores all round/gameplay data |
| `event_tags` | `id: UUID`, `event_id: UUID`, `tag_id: UUID`, `tag_type`, `content: JSONB` | Unique `(event_id, tag_id)`; tag must belong to the event's pack |



### Entity Relationship Diagram

```mermaid
erDiagram
    USERS |o--o{ PACKS : owns
    PACKS ||--|{ TAGS : contains
    PACKS ||--o| EVENTS : has
    EVENTS ||--o{ EVENT_TAGS : configures
    TAGS ||--o| EVENT_TAGS : referenced_by
    USERS {
        UUID id PK
        string name
        string username UK
        string email UK
        string phone_number
        string password
        string role
    }
    PACKS {
        UUID id PK
        UUID owner_id FK "nullable"
        string mode
        int tags_count
        string master_auth_hash UK "credential verifier"
    }
    TAGS {
        UUID id PK
        UUID pack_id FK
        string static_hash UK
        int sequence_num
        boolean is_printed
    }
    EVENTS {
        UUID id PK
        UUID pack_id FK,UK
        string title
        string status
        int edits_used
        JSONB record "all rounds and gameplay history"
    }
    EVENT_TAGS {
        UUID id PK
        UUID event_id FK
        UUID tag_id FK
        string tag_type
        JSONB content
    }
```

### Gameplay Record JSONB Structure

Scan entries are append-only within their round.

```json
{
  "rounds": [
    {
      "round_id": "00000000-0000-4000-8000-000000000101",
      "status": "live",
      "started_at": "2026-10-13T10:00:00Z",
      "ended_at": null,
      "players": {
        "00000000-0000-4000-8000-000000000001": {
          "score": 1,
          "highest_sequential_tag": 0,
          "frozen_until": null,
          "last_successful_tag_id": "00000000-0000-4000-8000-000000000011"
        }
      },
      "claims": {
        "00000000-0000-4000-8000-000000000011": "00000000-0000-4000-8000-000000000001"
      },
      "choose_traps": {},
      "scans": [
        {
          "scan_id": "00000000-0000-4000-8000-000000000102",
          "player_id": "00000000-0000-4000-8000-000000000001",
          "tag_id": "00000000-0000-4000-8000-000000000011",
          "result": "claimed",
          "points_delta": 1,
          "scanned_at": "2026-10-13T10:01:00Z"
        }
      ],
      "final_leaderboard": null
    }
  ]
}
```

The API derives the current leaderboard and play state from the active round in `record`. When a round ends, its final leaderboard is stored within that round. The complete history remains in the same event row.

## High-Level Class Diagram


```mermaid
classDiagram
    direction TB
    class User {
        +UUID id
        +string username
        +string email
        +string password
        +string role
    }
    class Pack {
        +UUID id
        +UUID? owner_id
        +string mode
        +int tags_count
        +string master_auth_hash
    }
    class Tag {
        +UUID id
        +UUID pack_id
        +string static_hash
        +int sequence_num
        +bool is_printed
    }
    class Event {
        +UUID id
        +UUID pack_id
        +string title
        +string status
        +int edits_used
        +JSONB record
    }
    class EventTag {
        +UUID id
        +UUID event_id
        +UUID tag_id
        +string tag_type
        +JSONB content
    }
    class AdminService {
        +generatePacks()
        +markTagPrinted()
    }
    class PackService {
        +previewPack()
        +claimPackAtomically()
    }
    class EventService {
        +setupEvent()
        +openEditingSession()
        +saveEditingSession()
        +startRound()
        +endRound()
    }
    class JourneyService {
        +validateScan()
        +applyScanAtomically()
        +applyTrap()
    }
    class LeaderboardService {
        +getCurrentStandings()
        +getPlayerState()
    }
    User "0..1" <-- "0..*" Pack : owns
    Pack "1" <-- "1..*" Tag : contains
    Pack "1" <-- "0..1" Event : has
    Event "1" <-- "0..*" EventTag : configures
    Tag "1" <-- "0..1" EventTag : configured_as
    AdminService ..> Pack : generates
    PackService ..> Event : creates_once
    EventService ..> Event : updates
    JourneyService ..> Event : locks_and_updates_record
    JourneyService ..> EventTag : reads_configuration
    LeaderboardService ..> Event : reads_record
```

### Class Overview

| Class | Responsibility |
|---|---|
| `User`, `Pack`, `Tag`, `Event`, `EventTag` | Persisted PostgreSQL entities |
| `AdminService`, `PackService` | Factory inventory, token redemption, and atomic pack claiming |
| `EventService` | Event setup, editing quotas, lifecycle, and round start/end |
| `JourneyService` | Sequential ordering, first claims, scores, traps, and atomic record updates |
| `LeaderboardService` | Read current-round scores and progress from `events.record` |

### Event Tag JSONB Shape

The `event_tags.content` JSONB payload follows the `TagContent` fields `hint`, `image`, `boom`, `freeze`, and `choose`. The owner submits `tag_type` separately (`clue` or `trap`). Examples:

**Clue**

```json
{"hint":"Look behind the red door","image":"r2://raccon-media/events/example/clue.webp"}
```

**Freeze**

```json
{"freeze":60}
```

**Boom**

```json
{"boom":1}
```

**Choose**

```json
{"choose":true}
```

Clue image files reside in Cloudflare R2; PostgreSQL stores their references, not the binary files. 

## High-Level Sequence Diagrams

The following diagrams describe registration, event management, tag configuration, and gameplay. Configuration can be saved during initial `draft` setup or while `paused`, but not while `live`.

### 1. User Registration

```mermaid
sequenceDiagram
    actor User
    participant Web as React Frontend
    participant API as FastAPI
    participant DB as PostgreSQL
    User->>Web: Submit registration form
    Web->>API: POST /auth/register
    API->>API: Validate required fields and formats
    API->>DB: Check unique username and email
    DB-->>API: Availability result
    alt Invalid input or duplicate account
        API-->>Web: 400 or 422 validation error
        Web-->>User: Display field errors
    else Valid registration
        API->>API: Hash password
        API->>DB: Insert user
        DB-->>API: User UUID
        API-->>Web: 200 with message and user_id
        Web->>API: POST /auth/login
        API->>DB: Verify account credentials
        DB-->>API: User record
        API-->>Web: 200 with bearer JWT
        Web-->>User: Display home page
    end
```

### 2. View and Rename Packages

```mermaid
sequenceDiagram
    actor Owner
    participant Web as React Frontend
    participant API as FastAPI
    participant DB as PostgreSQL
    Owner->>Web: Open My Packages
    Web->>API: GET /events with JWT
    API->>DB: Find events owned through packs
    DB-->>API: Owned events
    API-->>Web: 200 with event list
    Web-->>Owner: Show event titles and statuses
    Owner->>Web: Select event
    Web->>API: GET /events/{event_id}
    API->>DB: Check ownership and load event tags
    DB-->>API: Event and tags
    alt Event missing or not owned
        API-->>Web: 403 or 404
        Web-->>Owner: Display access error
    else Owner authorized
        API-->>Web: 200 with event configuration
        Web-->>Owner: Display event settings
        Owner->>Web: Change event title and save
        Web->>Web: Enforce 20 character limit
        Web->>API: PATCH /events/{event_id} with title
        API->>DB: Validate ownership and update title
        DB-->>API: Updated event
        API-->>Web: 200 with updated event
        Web-->>Owner: Confirm title change
        Note over API,DB: Title changes do not consume configuration edits
    end
```

### 3. Configure NFC Tag Content

```mermaid
sequenceDiagram
    actor Owner
    participant Web as React Frontend
    participant API as FastAPI
    participant DB as PostgreSQL
    participant R2 as Cloudflare R2
    Owner->>Web: Open event customization
    Web->>API: GET /events/{event_id}
    API->>DB: Verify ownership and read event status
    DB-->>API: Event and configured tags
    API-->>Web: Event configuration
    alt Event is live
        Web-->>Owner: Show read-only configuration
    else Event is draft
        Web-->>Owner: Allow initial setup
    else Event is paused
        Owner->>Web: Select Edit
        Web->>API: POST /events/{event_id}/editing-session
        API->>DB: Check remaining edit quota
        alt Quota exhausted
            API-->>Web: 409 Conflict
            Web-->>Owner: Show read-only configuration
        else Edit available
            API-->>Web: Session ID and edits remaining
            Web-->>Owner: Enable editing
        end
    end
    opt Editing is enabled
        Owner->>Web: Enter optional hint and select image
        Web->>Web: Validate text length and image constraints
        opt Valid image selected
            Web->>API: POST /events/{event_id}/images
            API->>R2: Store image
            R2-->>API: Image reference
            API-->>Web: Image reference
        end
        Owner->>Web: Save full configuration
        Web->>API: PUT /events/{event_id}/setup
        API->>DB: Lock event and recheck status and quota
        alt Event is live or save invalid
            API-->>Web: Reject save without consuming edit
            Web-->>Owner: Display error
        else Valid draft or paused save
            API->>DB: Replace event tag configuration atomically
            API->>DB: Count changed edit or move draft to paused
            DB-->>API: Transaction committed
            API-->>Web: 200 save confirmation
            Web-->>Owner: Show updated configuration
        end
    end
```

### 4. Configure NFC Tag Traps

```mermaid
sequenceDiagram
    actor Owner
    participant Web as React Frontend
    participant API as FastAPI
    participant DB as PostgreSQL
    Owner->>Web: Open trap configuration
    Web->>API: GET /events/{event_id}
    API->>DB: Check owner, mode, status and edit quota
    DB-->>API: Event details
    alt Sequential mode
        API-->>Web: Trap configuration unavailable
        Web-->>Owner: Show clue-only options
    else Event is live
        API-->>Web: Read-only configuration
        Web-->>Owner: Editing blocked during live round
    else Open Hunt event in draft or paused
        opt Event is paused
            Owner->>Web: Select Edit
            Web->>API: POST /events/{event_id}/editing-session
            API->>DB: Validate available editing session
            DB-->>API: Editing quota result
            API-->>Web: Session ID or 409 error
        end
        opt Editing is authorized
            Owner->>Web: Select Freeze, Boom, or Choose
            alt Freeze
                Web-->>Owner: Select 30 to 180 seconds in steps of 30
            else Boom
                Web-->>Owner: Fixed one-point penalty
            else Choose
                Web-->>Owner: Players choose Freeze or Boom during gameplay
            end
            Owner->>Web: Save complete tag configuration
            Web->>API: PUT /events/{event_id}/setup
            API->>DB: Lock event and validate mode, status and quota
            alt Invalid configuration or event now live
                API-->>Web: Reject save
                Web-->>Owner: Display error
            else Valid configuration
                API->>DB: Replace event tag configuration atomically
                API->>DB: Update edit count or draft status
                DB-->>API: Transaction committed
                API-->>Web: 200 confirmation
                Web-->>Owner: Show saved traps
            end
        end
    end
```

### 5. NFC Tag Scanning and Gameplay

```mermaid
sequenceDiagram
    actor Player
    participant Web as React Frontend
    participant API as FastAPI
    participant DB as PostgreSQL
    Player->>Web: Scan NFC tag URL on raccon.link
    Web->>Web: Preserve static_hash
    opt Player is not signed in
        Web-->>Player: Display login page
        Player->>Web: Submit credentials
        Web->>API: POST /auth/login
        API-->>Web: Bearer JWT
        Web->>Web: Restore tag destination
    end
    Web->>API: POST /journey/scan with tag_hash and injected_user_hash
    API->>API: Validate JWT and matching player UUID
    alt Authentication invalid
        API-->>Web: 401 or 403
        Web-->>Player: Display authentication error
    else Identity valid
        API->>DB: Resolve tag, pack and event
        DB-->>API: Tag and event details
        alt Unknown tag or event not live
            API-->>Web: Reject scan without gameplay changes
            Web-->>Player: Display scan error
        else Event is live
            API->>DB: Lock event and read active round in events.record
            DB-->>API: Current player and round state
            alt Player frozen
                API-->>Web: Remaining freeze time
                Web-->>Player: Display freeze countdown
            else Sequential mode
                API->>API: Validate next tag in sequence
                alt Wrong tag order
                    API-->>Web: Reject out-of-order scan
                else Correct next tag
                    API->>DB: Save progress and scan atomically
                    DB-->>API: Committed
                    API-->>Web: Tag content and progress
                end
            else Open Hunt mode
                alt Normal clue tag
                    API->>API: Check current-round claim
                    alt Tag already claimed
                        API-->>Web: No additional points
                    else First valid claim
                        API->>DB: Save claim, scan and point atomically
                        DB-->>API: Committed
                        API-->>Web: Clue, score and progress
                    end
                else Freeze or Boom trap
                    API->>DB: Apply trap and save round state atomically
                    DB-->>API: Committed
                    API-->>Web: Trap effect and updated state
                else Choose trap
                    API-->>Web: Choice required
                    Player->>Web: Confirm Freeze or Boom
                    Web->>API: POST /events/{event_id}/choose-trap
                    API->>DB: Persist choice and effect atomically
                    DB-->>API: Committed
                    API-->>Web: Confirmed trap and updated state
                end
            end
            Web-->>Player: Display scan result
        end
    end
```

### Sequence Diagram Overview

| Diagram | Description |
|---|---|
| User Registration | Validates account details, creates a user, and logs them in through a separate authentication request. |
| View and Rename Packages | Lists owned events, checks ownership, and renames an event without consuming configuration edits. |
| Configure NFC Tag Content | Saves clues and R2 image references, respecting draft setup, paused-only editing, and editing quotas. |
| Configure NFC Tag Traps | Configures Open Hunt traps with validation and paused-only editing rules. |
| NFC Tag Scanning and Gameplay | Authenticates players, processes live scans and trap effects, and updates current-round gameplay in `events.record`. |


## Raccon REST API Documentation

### API conventions

- **Authentication:** Protected endpoints require `Authorization: Bearer <access_token>`. JWTs use HS256, include the user UUID in `sub`, and expire after seven days. 
- **Admin access:** Admin endpoints additionally require `users.role = "admin"`.
- **Reference documentation:** FastAPI generates `/openapi.json`, `/docs`, and a Scalar UI at `/scalar`.

### Endpoint Summary

| Method | Path | Access | Purpose |
|---|---|---|---|
| `POST` | `/auth/register` | Public | Register account |
| `POST` | `/auth/login` | Public | Obtain JWT |
| `POST` | `/auth/logout` | User | Logout acknowledgment |
| `POST` | `/auth/change-password` | User | Change password |
| `DELETE` | `/auth/delete-account` | User | Delete account |
| `GET` | `/users/me` | User | View profile |
| `PATCH` | `/users/me` | User | Update profile |
| `POST` | `/admin/generate-packs` | Admin | Generate inventory |
| `GET` | `/admin/factory/pack/{pack_id}` | Admin | Factory tag URLs |
| `PATCH` | `/admin/factory/tags/{tag_id}/mark-printed` | Admin | Mark tag programmed |
| `GET` | `/packs/preview/{master_auth_hash}` | Public | Preview claimable pack |
| `POST` | `/packs/claim` | User | Claim pack and create draft event |
| `GET` | `/events` | User | List owned events |
| `GET` | `/events/{event_id}` | Owner | View event and tag configuration |
| `PUT` | `/events/{event_id}/setup` | Owner | Replace event tag configuration |
| `PATCH` | `/events/{event_id}` | Owner | Rename or change event status |
| `POST` | `/journey/scan` | User | Scan live event tag |
| `GET` | `/` | Public | Root check |
| `GET` | `/health/` | Public | Health check |
| `GET` | `/scalar` | Public | Interactive API reference |
| `POST` | `/auth/forgot-password` | Public | Begin password recovery |
| `POST` | `/auth/reset-password` | Public | Finish password recovery |
| `GET` | `/events/{event_id}/leaderboard` | User | Leaderboard |
| `GET` | `/events/{event_id}/play-state` | User | Participation/progress |
| `POST` | `/events/{event_id}/choose-trap` | User | Confirm a persistent Choose Trap selection |
| `POST` | `/events/{event_id}/editing-session` | Owner | Explicitly open a configuration editing session |
| `POST` | `/events/{event_id}/images` | Owner | Upload a tag image to Cloudflare R2 |
| `POST` | `/integrations/ramz/webhook` | Store | Purchase notification |

# Raccon API Documentation

The API specification is divided into **internal APIs**, which support Raccon's own application and administrative workflows, and **external services and integrations**, which support infrastructure, deployment, observability, and third-party commerce. Internal endpoints are grouped by responsibility and documented consistently using access, request, response, and key rules. UUIDs and example tokens below are illustrative.

## 1. Internal APIs

### 1.1 Authentication and profile

| Endpoint | Access | Request | Successful response | Validation and important behavior |
|---|---|---|---|---|
| `POST /auth/register` | Public | JSON: `name`, `username`, `email`, `phone_number`, `password` | `200`: `message`, `user_id` (UUID) | Username `^[a-z0-9_]+$`; phone `^\d{9}$`; password max 72 characters; duplicate username/email: `400`. Uniqueness is enforced by the database. |
| `POST /auth/login` | Public | Form: `username`, `password`; username field accepts a username or email | `200`: `access_token`, `token_type: "bearer"` | Invalid credentials: `400`. The access token is a JWT. |
| `POST /auth/logout` | Authenticated user | Bearer JWT; no body | `200`: `{"message":"Successfully logged out."}` | The frontend discards the JWT; logout does not revoke an already issued access token. |
| `POST /auth/change-password` | Authenticated user | JSON: `old_password`, `new_password` | `200`: `{"message":"Password changed successfully"}` | Incorrect current password: `400`; enforce password validation. |
| `DELETE /auth/delete-account` | Authenticated user | Bearer JWT; no body | `200`: `{"message":"Account deleted successfully"}` | Preserve referential integrity and apply the defined ownership and retention policy. |
| `GET /users/me` | Authenticated user | No body | `200`: `id`, `name`, `username`, `email`, `phone_number` | Returns the authenticated user's profile. |
| `PATCH /users/me` | Authenticated user | JSON: optional `name`, `username`, `phone_number` | `200`: updated user profile | `email` and `role` are not editable here; duplicate username is rejected. |

### 1.2 Admin inventory and factory programming

| Endpoint | Access | Request | Successful response | Validation and important behavior |
|---|---|---|---|---|
| `POST /admin/generate-packs` | Admin | JSON: `mode` (`open` or `seq`), `tags_count`, `quantity` | `200`: array of generated packs with `pack_id`, `master_auth_hash`, and tags (`id`, `static_hash`, `sequence_num`, `is_printed`) | `quantity ≥ 1`; `tags_count > 0`; each tag has a unique six-character random `static_hash`. |
| `GET /admin/factory/pack/{pack_id}` | Admin / authorized factory workflow | Path: `pack_id` (UUID) | `200`: `pack_id`, `mode`, ordered `tags_to_program` containing `tag_id`, `sequence_num`, `print_url`, `is_printed` | Unknown pack: `404`; print URL: `https://raccon.link/t/{static_hash}`. |
| `PATCH /admin/factory/tags/{tag_id}/mark-printed` | Admin / authorized factory workflow | Path: `tag_id` (UUID) | `200`: `status: "success"`, confirmation `message` | Unknown tag: `404`; factory verifies NFC writing and locking before marking printed. |

**Generation request example:**

```json
{"mode":"open","tags_count":5,"quantity":2}
```

### 1.3 Pack claiming

| Endpoint | Access | Request | Successful response | Validation and important behavior |
|---|---|---|---|---|
| `GET /packs/preview/{master_auth_hash}` | Public | Path: `master_auth_hash` | `200`: `id`, `mode`, `tags_count`, `owner_id` | Invalid token: `404`; claim eligibility is checked before confirmation. |
| `POST /packs/claim` | Authenticated user | JSON: `master_auth_hash` | `200`: claimed pack `id`, `mode`, `tags_count`, `owner_id` | Token must be valid, single-use, and linked to an unclaimed pack. Assign owner and create exactly one `draft` event in the same database transaction; reject repeated or concurrent claims. |

**Claim request example:**

```json
{"master_auth_hash":"<master-token-from-purchase-link>"}
```

The customer follows a Ramz-provided link to the **React frontend** at `GET https://raccon.app/claim?token=...`. After authentication and explicit confirmation, React sends `POST /packs/claim` to FastAPI. Opening the frontend link alone does not claim the pack.

### 1.4 Event configuration and lifecycle

| Endpoint | Access | Request | Successful response | Validation and important behavior |
|---|---|---|---|---|
| `GET /events` | Authenticated user | No body | `200`: array of `id`, `pack_id`, `title`, `status`; empty array if none | Returns events belonging to packs owned by the caller. |
| `GET /events/{event_id}` | Pack owner | Path: `event_id` (UUID) | `200`: `id`, `pack_id`, `title`, `status`, and ordered `tags` with `sequence_num`, `tag_id`, `tag_type`, `content`, `is_configured` | Unknown event: `404`; non-owner: `403`; includes physical tags even if not configured. |
| `PUT /events/{event_id}/setup` | Pack owner | JSON: `tags_config` array of `tag_id`, `tag_type`, `content` | `200`: `{"status":"success","message":"Event journey setup completed."}` | Setup is permitted only in `draft` (initial setup) or `paused` (subsequent edits); reject requests while `live`. `clue` or `trap`; traps only in `open` mode; trap content needs a non-null `boom`, `freeze`, or `choose`. Initial nonempty setup changes `draft → paused`. Empty list after initial setup rejected. Unknown: `404`; non-owner: `403`; invalid mode: `400`; invalid schema: `422`. |
| `PATCH /events/{event_id}` | Pack owner | JSON: optional `title`, `status` | `200`: updated `id`, `pack_id`, `title`, `status` | `draft → paused` occurs through setup; owner controls allow `paused ↔ live`; never return to `draft`. Cannot start without valid configuration. Title changes do not consume an editing session. Unknown: `404`; non-owner: `403`; invalid status: `422`. |
| `POST /events/{event_id}/editing-session` | Event owner | Path: `event_id` (UUID) | `200`: `editing_session_id` (UUID), `edits_remaining` | After initial setup, explicitly opens a session. First successful changed save in the session consumes one of three edits; repeated/no-op saves do not. Session ID accompanies setup submissions. Quota exhausted: `409`. Opening an editing session while `live` is rejected; the owner must end the round and return to `paused` before editing. |

**Setup request example:**

```json
{
  "tags_config": [
    {"tag_id":"00000000-0000-4000-8000-000000000011","tag_type":"clue","content":{"hint":"Find the next tag","image":"r2://raccon-media/events/example/hint.webp"}},
    {"tag_id":"00000000-0000-4000-8000-000000000012","tag_type":"trap","content":{"freeze":60}}
  ]
}
```

**Round lifecycle:** The **ابدأ الجولة** control changes `paused → live`, starting a new round with reset scores, claims, and progress. The **انهاء الجولة** control changes `live → paused`, finalizing the round and leaderboard. All round data remains in `events.record` (JSONB). Saving event configuration while `live` is rejected; editing and saving are permitted only while `paused` (or during initial setup in `draft`). The `PUT` setup behavior remains full replacement.

### 1.5 Player journey and gameplay

| Endpoint | Access | Request | Successful response | Validation and important behavior |
|---|---|---|---|---|
| `POST /journey/scan` | Authenticated player | JSON: `tag_hash`, `injected_user_hash` (UUID) | `200`: scan outcome and tag information; gameplay contract includes `result`, `tag_sequence`, `tag_type`, `content`, `round_id`, `points_delta`, `score`, `highest_sequential_tag`, `claimed`, `frozen_until`, `tags_left`, `time_remaining_seconds` | Injected UUID must equal JWT subject (`403` otherwise); unknown hash: `404`; missing event or non-live status: `400`. JWT authenticates identity; supplied UUID does **not** prove physical NFC tapping. Gameplay state updates must be atomic. |
| `GET /events/{event_id}/leaderboard` | Authenticated event player | Path: `event_id` | `200`: `round_id`, mode, ranked `players` (UUID, display name, score/progress), caller's rank | Current-round ranking derived from `events.record`. Open Hunt: first-claim points minus Boom penalties; Sequential: highest consecutive tag. |
| `GET /events/{event_id}/play-state` | Authenticated event player | Path: `event_id` | `200`: `round_id`, `event_status`, `score`, `highest_sequential_tag`, `frozen_until`, optional `tags_left`, `time_remaining_seconds` | Derived from `events.record`; unknown event: `404`; unauthorized: `403`. |
| `POST /events/{event_id}/choose-trap` | Authenticated event player | JSON: `tag_id`, `trap_type` (`freeze` or `boom`), `duration_seconds` for Freeze | `200`: confirmed selection and `round_id` | Live Open Hunt round; tag must be configured as `choose`. Selection applies immediately and persists until replaced. Chooser is not immune. Freeze: 30–180 seconds in steps of 30; Boom: minus one point, floor zero. Exact immediate recipient set remains a gameplay decision. Transactional update. |

**Scan request example:**

```json
{"tag_hash":"R7bX4k","injected_user_hash":"00000000-0000-4000-8000-000000000001"}
```

**Open Hunt successful-claim response example:**

```json
{
  "result":"claimed",
  "tag_sequence":1,
  "tag_type":"clue",
  "content":{"hint":"Find the next tag","image":null},
  "round_id":"00000000-0000-4000-8000-000000000101",
  "points_delta":1,
  "score":1,
  "highest_sequential_tag":null,
  "claimed":true,
  "frozen_until":null,
  "tags_left":19,
  "time_remaining_seconds":null
}
```



### 1.6 Account recovery and store integration

| Endpoint | Access | Request | Successful response | Validation and important behavior |
|---|---|---|---|---|
| `POST /auth/forgot-password` | Public | JSON: `email` | Confirmation response, identical whether the account exists or not | For an existing account, send a short-lived, single-use reset token out of band; avoid account enumeration. |
| `POST /auth/reset-password` | Public | JSON: `reset_token`, `new_password`, `confirm_password` | Confirmation of password change | Verify token expiration, matching passwords, and password rules; consume token atomically; do not log secrets. |
| `POST /integrations/ramz/webhook` | Verified Ramz integration | Provider-defined purchase event payload | Acknowledgment of accepted or already processed delivery | Authenticate provider delivery, deduplicate by event/order ID, associate purchase with an eligible pack; webhook alone does not claim the pack. Payload and verification scheme depend on Ramz's integration contract. |

### 1.7 Service health and documentation

| Endpoint | Access | Successful response | Purpose |
|---|---|---|---|
| `GET /` | Public | `200`: `{"message":"System is running. Database connected!"}` | Basic application/database status message. |
| `GET /health/` | Public | `200`: `{"status":"ok","message":"Raccon APIs is running!"}` | Health check. |
| `GET /scalar` | Public or deployment-restricted | Scalar documentation page | Interactive API documentation; FastAPI also provides standard OpenAPI routes. |

**Response conventions:** Successful requests use the response shape specified for each endpoint. Validation errors may use FastAPI's structured `detail` array rather than a single string; error handling should preserve a consistent client-facing convention. Authorization failures use `401` for missing/invalid authentication and `403` for forbidden operations where applicable. `404` indicates an unknown resource; `409` may indicate a conflict such as an exhausted editing quota or an already redeemed claim. Exact error schemas and conflict codes should be finalized consistently across routes.

## 2. External APIs and Services

The following services interact with Raccon's platform.

| External service | Integration category | Role in Raccon |
|---|---|---|
| **Axiom** | Observability and logging | Collects and supports analysis of application logs and operational events for troubleshooting and monitoring. |
| **GitHub Actions** | CI/CD automation | Runs automated validation, testing, and deployment workflows when repository events trigger them. |
| **Cloudflare** | Cloud infrastructure and object storage | Provides Cloudflare R2 for uploaded image objects, with PostgreSQL retaining image references; may also support domain, DNS, and edge delivery configuration. |

## Technical Justifications

### React and FastAPI

React supports reusable UI components and distinct owner, player, and factory workflows. FastAPI provides typed request/response validation through Pydantic, dependency-based authentication, automatic OpenAPI documentation, and a clear separation of route modules (`auth`, `users`, `admin`, `packs`, `events`, `journey`). SQLModel provides a typed persistence layer for the API.

### PostgreSQL and SQLModel

PostgreSQL provides durable relational integrity for ownership and tag associations, transactional claiming, and native JSONB storage for flexible event-specific tag content. SQLModel combines typed Python models with SQLAlchemy persistence. `event_tags.content` is JSONB because clue and trap payloads have different optional fields while sharing a stable association between event and physical tag.

### Alembic

Alembic records schema changes as versioned migrations, making development and deployment reproducible. The migration strategy covers users, roles, packs, tags, events, event tags, and tag printing fields. Schema migration execution should be part of deployment rather than relying solely on runtime table creation.

### Unique NFC identifiers and security

Tag URLs use `https://raccon.link/t/{static_hash}`, not a sequence number or database UUID. A cryptographically secure random generator creates a unique six-character alphanumeric token for each tag, independently of its sequence number. This conceals the sequence number but is not encryption and does not guarantee resistance to brute-force guessing. The token is a public identifier, not proof of a physical tap.

The journey endpoint compares the client-submitted UUID with the authenticated JWT's user UUID. This blocks submissions claiming a different user identity, but a client that knows its own UUID can still reproduce its own scan request; it does not prove physical NFC contact. Access to non-live events is denied by the API.

### Separate platform and NFC domains

`raccon.app` hosts the application, while `raccon.link` is the stable physical NFC link domain. Separating them protects already-programmed tags from future changes to the application's primary domain, hosting provider, or frontend routing. The frontend must preserve the public `/t/{static_hash}` route and translate it into an authenticated API request.

### Packs versus events

A **pack** is immutable physical inventory generated by an admin; an **event** is the owner's configurable experience. Keeping them separate allows inventory creation before purchase, owner assignment at claim time, and per-event content stored in `event_tags` rather than overwriting the physical `tags` records. Each claimed pack is associated with its event through the claim workflow.

### Event lifecycle and authorization

The `draft` → `paused` ↔ `live` workflow separates unconfigured events, configured but inactive events, and scannable experiences. Event read/write operations verify ownership through the associated pack. JWT subject-based identity and role checks prevent unauthenticated users from generating inventory or editing other owners' events. Status changes are validated against the event lifecycle and the owner’s permissions.


## Requirements Traceability

| Stories | Relevant API and data model | Supporting design elements |
|---|---|---|
| US-01–US-05 | `/auth/*`, `/users/me` | Auto-login, reset flow, avatar, JWT expiration and client-side logout |
| US-06 | `/packs/preview/{master_auth_hash}`, `/packs/claim` | Ramz link handoff |
| US-07–US-10 | `/events`, `/events/{event_id}`, `/events/{event_id}/setup` | Editing quota, media upload, UI constraints |
| US-11–US-13 | `EventTag.content` schema, setup endpoint | Trap execution and placement |
| US-14–US-15 | Tag/event read endpoints | Frontend previews |
| US-16 | `/journey/scan` | Opaque links do not prove physical presence |
| US-17–US-20 | Mode/sequence fields and scan response | Participation, scoring, trap runtime |
| US-21 | `/events/{event_id}/leaderboard` | Leaderboard derived from `events.record`, rankings and tie-breaking |
| US-22 | `/admin/generate-packs`, `/admin/factory/*` | Hardware writing/locking verification |

# SCM and QA Plans

The following plans define the Source Control Management (SCM) strategy and Quality Assurance (QA) approach for the Raccon platform. They support code stability, team collaboration, and automated validation through Continuous Integration and Continuous Deployment (CI/CD).

### Source Control Management (SCM) Strategy

We utilize **GitHub** as our centralized version control system, following a structured branching model to isolate feature development from production-ready code.

#### Branching Strategy

Our repository follows a conceptual workflow that keeps production code safe while allowing parallel development:

- **Production State:** A `main` branch represents the stable, live state of the application. Code is only merged here after testing and approval.
- **Integration/Development State:** A `dev` branch acts as the staging ground. New features and regular bug fixes are merged here for pre-production testing and team synchronization.
- **Task/Feature Branches:** Developers create temporary branches from the `dev` branch for specific features, tasks, or non-critical bug fixes. Completed and tested work is merged back through a pull request.
- **Emergency Patch Branches:** For critical production bugs, temporary branches are created directly from the `main` branch. Fixes are then synchronized across all active environments to maintain consistency.

#### Commit Conventions

Commit messages must describe the change and use a consistent prefix to support readable history and automated changelogs:

- `feat: [description]` — New features.
- `fix: [description]` — Bug fixes.
- `refactor: [description]` — Code changes that neither fix a bug nor add a feature.
- `chore: [description]` — Routine tasks, dependency updates, or configuration changes.

#### Pull Request Workflow

Direct commits to the `main` and `dev` branches are restricted. All changes must follow this pull request process:

1. **Open a PR:** Target the appropriate `dev` or `main` branch based on the task type.
2. **Pass CI Checks:** All required automated GitHub Actions checks, including linting and testing, must pass.
3. **Obtain Peer Review:** At least one team member must review and approve the PR.
4. **Squash and Merge:** Commits are squashed when merging to keep the repository history clear and readable.

### Quality Assurance (QA) and CI/CD Plan

Quality Assurance is integrated into the SCM workflow through **GitHub Actions**. Automated checks validate code before it reaches staging or production.

#### Testing Strategy

Our QA approach includes three primary layers:

- **Static Analysis and Linting:** Maintain code style consistency and catch issues early using automated tools such as Ruff, Black, and ESLint.
- **Unit Testing:** Test individual functions, database models, and utility scripts in isolation to verify core logic.
- **Integration Testing:** Validate interactions between system components, including API endpoint responses and database transactions, using a dedicated test database.
- **Migration Testing (Alembic):** Apply migrations to a clean PostgreSQL test database and upgrade from the previous schema; verify unique constraints, JSONB columns, and schema compatibility before deployment.

#### Continuous Integration (CI)

The GitHub Actions CI pipeline runs automatically on pushes and pull requests targeting the `main` and `dev` branches. It performs the following steps:

1. **Environment Setup:** Check out the code and configure the required runtime environments, such as Python and Node.js.
2. **Dependency Installation:** Install the application's required packages.
3. **Linting and Formatting Checks:** Run code quality tools. Checks fail when the code does not meet formatting standards.
4. **Test Execution:** Run the automated test suite. Failed required checks block the PR from merging.
5. **Alembic Migration Checks:** Verify the migration chain and run `alembic upgrade head` against a disposable PostgreSQL database; review generated revisions before merging.
6. **Build Verification:** Build the application containers, such as Docker images, to identify build and packaging issues before deployment.

#### Continuous Deployment (CD)

Deployment is automated to reduce human error and ensure consistent delivery across environments:

- **Staging Deployment:** Merging approved PRs into the `dev` branch automatically triggers deployment to staging, where the team can verify features and integrations in a production-like environment.
- **Production Deployment:** Approved merges into the `main` branch or designated release tags trigger deployment to production, including reviewed Alembic migrations (`alembic upgrade head`) and updates to active containers. Migrations are applied before application code that depends on the new schema, with a backup and rollback plan for destructive changes.

#### Monitoring and Post-Deployment QA

After deployment, monitoring helps the team detect errors and availability issues:

- **Centralized Logging:** System errors, API requests, and critical events are sent to Axiom, a central logging dashboard, for real-time observability.
