[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-24ddc0f5d75046c5622901739e7c5dd533143b0c8e959d652212380cedb1ea36.svg)](https://classroom.github.com/a/Yf9tAXk0)
[![Open in Codespaces](https://classroom.github.com/assets/launch-codespace-7f7980b617ed060a017424585567c406b6ee15c891e84e1186181d67ecf80aa0.svg)](https://classroom.github.com/open-in-codespaces?assignment_repo_id=13462505)

# PURPOSE

This is your team's repo for the ESN Application, the group project conducted in 18652.

# IMPORTANT RULES

- YOU ARE *NOT* PERMITTED TO SHARE THIS REPO OUTSIDE THIS GITHUB ORG.
- YOU ARE *NOT* PERMITTED TO FORK THIS REPO UNDER ANY CIRCUMSTANCES.
- YOU ARE *NOT* PERMITTED TO CREATE ANY PUBLIC REPOS INSIDE THE CMUSV-FSE ORGANIZATION.
- YOU SHOULD HAVE LINKS FROM THIS README FILE TO YOUR PROJECT DOCUMENTS, SUCH AS YOUR REST API SPECS AND YOUR ARCHITECTURE DOCUMENT.
- YOUR GITHUB ACCOUNT'S PRIMARY EMAIL MUST BE ASSOCIATED WITH YOUR ANDREW EMAIL.
- YOUR GITHUB PROFILE MUST BE PUBLIC AND SHOULD HAVE YOUR FULL NAME AND RECOGNIZABLE HEADSHOT PHOTO.
- MAKE SURE TO CHECK AND UPDATE YOUR LOCAL GIT CONFIGURATION IN ORDER TO MATCH YOUR LOCAL GIT CREDENTIALS TO YOUR SE-PROJECT GITHUB CREDENTIALS (COMMIT USING YOUR ANDREW EMAIL ASSOCIATED WITH YOUR GITHUB ACCOUNT): OTHERWISE YOUR COMMITS MAY BE EXCLUDED FROM GITHUB STATISTICS AND REPO AUDITS WILL UNDERESTIMATE YOUR CONTRIBUTION.

##### Technology

Front-end: Web stacks: HTML, CSS, JS, bootstrap
Server-side: node.js, express.js, socket.io, passport.js, JWT
DB: Mongo
Reasons: flexible and easy to get started for new learners.
Testing: Jest

### API Documentation

#### POST Requests

#### User Registration

<details>
 <summary><code>POST</code> <code><b>/registration</b></code> <code>(registers a new user)</code></summary>

##### Parameters

> | name      | type       | data type | description                      |
> |-----------|------------|-----------|----------------------------------|
> | `username`| required   | string    | Username of the new user         |
> | `password`| required   | string    | Password for the new user account|
> | `status`  | optional   | string    | Status of the new user           |
> | `role`    | optional   | string    | Role assigned to the new user    |

##### Responses

> | http code | content-type              | response                                            |
> |-----------|---------------------------|-----------------------------------------------------|
> | `201`     | `text/html; charset=utf-8`| `User registered successfully`                      |
> | `500`     | `text/plain;charset=UTF-8`| `Error registering new user`                        |

</details>

---


#### User Login

<details>
 <summary><code>POST</code> <code><b>/login</b></code> <code>(Allows citizens to get access to the system)</code></summary>

##### Parameters

> | name      | type      | data type | description                 |
> |-----------|-----------|-----------|-----------------------------|
> | username  | required  | string    | User's unique username      |
> | password  | required  | string    | User's password             |

##### Responses

> | http code | content-type                 | response                                      |
> |-----------|------------------------------|-----------------------------------------------|
> | `200`     | `application/json`           | `{ "token": "jwt_token"}` |
> | `401`     | `application/json`           | `{"error": "Invalid credentials"}` |
> | `500`     | `application/json`           | `{"error": "Internal server error"}` |

</details>

---


#### New Post

<details>
 <summary><code>POST</code> <code><b>/messages/:senderName/:receiverName</b></code> <code>(Allows citizens to post new message)</code></summary>

##### Parameters: e.g./messages/{userA}/{userB}

> | name      | type      | data type | description                 |
> |-----------|-----------|-----------|-----------------------------|
> | senderName  | required  | string    | sender's unique username      |
> | receiverName   | required  | string    | receiver 's unique username        |
>

##### Req.body Field:

> | name      | type      | data type | description                 |
> |-----------|-----------|-----------|-----------------------------|
> | username   | required  | string    | sender's name          |
> | content    | required  | string    | message content for posting        |
> | timestamp  | required  | Date      | time when posting         |
> | status     | required  | string    | status when posting         |
> | receiver   | required  | string    | receiver's name        |

##### Responses

> | http code | content-type                 | response                                      |
> |-----------|------------------------------|-----------------------------------------------|
> | `200`     | `text/plain;charset=UTF-8`   | `post successfully`                           |                         
> | `500`     | `text/plain;charset=UTF-8`   | `Internal server error`                       |
</details>

---

#### GET Requests
#### All Messages

<details>
 <summary><code>GET</code> <code><b>/messages/:senderName/:receiverName</b></code> <code>(Allows citizens to get messages)</code></summary>

##### Parameters: e.g./messages/{userA}/{userB}

> | name      | type      | data type | description                 |
> |-----------|-----------|-----------|-----------------------------|
> | senderName  | required  | string    | sender's unique username      |
> | receiverName   | required  | string    | receiver 's unique username        |


##### Responses

> | http code | content-type                 | response                                      |
> |-----------|------------------------------|-----------------------------------------------|
> | `200`     | `text/plain;charset=UTF-8`   | `get messages successfully`                   |                         
> | `500`     | `text/plain;charset=UTF-8`   | `Internal server error`                       |
</details>

---
#### All Users

<details>
 <summary><code>GET</code> <code><b>/users</b></code> <code>(Allows the information fetch for all users)</code></summary>

##### Parameters


##### Responses

> | http code | content-type                 | response                                      |
> |-----------|------------------------------|-----------------------------------------------|
> | `200`     | `text/plain;charset=UTF-8`   | `get users successfully`                   |                         
> | `500`     | `text/plain;charset=UTF-8`   | `Internal server error`                       |
</details>

---

#### status

<details>
 <summary><code>GET</code> <code><b>/status/:username</b></code> <code>(Allows the information fetch for all users)</code></summary>


##### Parameters: e.g./status/{userA}

> | name      | type      | data type | description                 |
> |-----------|-----------|-----------|-----------------------------|
> | username  | required  | string    | the user that we want status from     |


##### Responses

> | http code | content-type                 | response                                      |
> |-----------|------------------------------|-----------------------------------------------|
> | `200`     | `text/plain;charset=UTF-8`   | `get user status successfully`                   |                         
> | `500`     | `text/plain;charset=UTF-8`   | `Internal server error`                       |
</details>

---



#### PUT Requests

#### Users log out

<details>
 <summary><code>PUT</code> <code><b>/logout</b></code> <code></code></summary>

##### Parameters


##### Responses

> | http code | content-type                 | response                                      |
> |-----------|------------------------------|-----------------------------------------------|
> | `200`     | `text/plain;charset=UTF-8`   | `User logs out successfully`                   | 
> | `404`     | `text/plain;charset=UTF-8`   | `User not found during logout`                   |                         
> | `500`     | `text/plain;charset=UTF-8`   | `Error logout`                       |
</details>

---

#### Users acknowledgement

<details>
 <summary><code>PUT</code> <code><b>/acknowledgement</b></code> <code></code></summary>

##### Parameters


##### Responses

> | http code | content-type                 | response                                      |
> |-----------|------------------------------|-----------------------------------------------|
> | `200`     | `text/plain;charset=UTF-8`   | `User acknowledged successfully`                   |
> | `404`     | `text/plain;charset=UTF-8`   | `User not found during acknowledgement`                   |                          
> | `500`     | `text/plain;charset=UTF-8`   | `Error acknowledgement`                       |
</details>

---

#### Update users share status

<details>
 <summary><code>PUT</code> <code><b>/status/:username</b></code> <code></code></summary>

##### Parameters: e.g. /status/${userA}
> | name      | type      | data type | description                 |
> |-----------|-----------|-----------|-----------------------------|
> | username  | required  | string    | the user that we want status from     |
>
> 
##### Req.body Field:

> | name      | type      | data type | description                 |
> |-----------|-----------|-----------|-----------------------------|
> | timestamp  | required  | Date      | time when updating         |
> | status     | required  | string    | status for updating         |



##### Responses

> | http code | content-type                 | response                                      |
> |-----------|------------------------------|-----------------------------------------------|
> | `200`     | `text/plain;charset=UTF-8`   | `User status updated successfully`                   | 
> | `404`     | `text/plain;charset=UTF-8`   | `User not found during status update`                   |                         
> | `500`     | `text/plain;charset=UTF-8`   | `Error updating status`                       |
</details>

---


#### Alert User for notification

<details>
 <summary><code>PUT</code> <code><b>/alert/:active_username/:passive_username/:join_or_leave</b></code> <code></code></summary>

##### Parameters: e.g. /alert/{userA}/{userB}/‘join'
> | name      | type      | data type | description                 |
> |-----------|-----------|-----------|-----------------------------|
> | active_username  | required  | string    | the user that send the message     |
> | passive_username  | required  | string    | the user that receive the message     |
> | join_or_leave  | required  | string    | to show or make the alert disappear     |

##### Responses

> | http code | content-type                 | response                                      |
> |-----------|------------------------------|-----------------------------------------------|
> | `200`     | `text/plain;charset=UTF-8`   | `User check updated successfully`                   |                          
> | `500`     | `text/plain;charset=UTF-8`   | `Error updating status`                       |
</details>

---
