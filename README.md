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
CICD: Sigrid

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


#### New Message Post

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


#### New Announcement

<details>
 <summary><code>POST</code> <code><b>/announcement</b></code> <code>(post new announcement)</code></summary>

##### Parameters

> | name      | type       | data type | description                      |
> |-----------|------------|-----------|----------------------------------|
> | `username`| required   | string    | Username of the new user         |
> | `text`| required   | string    | Password for the new user account|
> | `timestamp`  | required   | Date    | times when posting          |


##### Responses

> | http code | content-type              | response                                            |
> |-----------|---------------------------|-----------------------------------------------------|
> | `201`     | `text/html; charset=utf-8`| `User post announcement successfully`                      |
> | `500`     | `text/plain;charset=UTF-8`| `Error posting new announcement`                        |

</details>

---

#### New TrainExercise

<details>
 <summary><code>POST</code> <code><b>/exercises</b></code> <code>(post new trainexercise)</code></summary>

##### Parameters

> | name      | type       | data type | description                      |
> |-----------|------------|-----------|----------------------------------|
> | `title`| required   | string    | Title of the new trainexercise         |
> | `author`| required   | string    | Author of the new trainexercise|
> | `videoLink`| string    | Video link of the new trainexercise|
> | `timestamp`| Date    | times when posting|


##### Responses

> | http code | content-type              | response                                            |
> |-----------|---------------------------|-----------------------------------------------------|
> | `201`     | `text/html; charset=utf-8`| `User post trainexercise successfully`                      |
> | `500`     | `text/plain;charset=UTF-8`| `Error posting new trainexercise`                        |

</details>

---

#### New comment for TrainExercise

<details>
 <summary><code>POST</code> <code><b>/exercises/:id/comments</b></code> <code>(post new comment for trainexercise)</code></summary>

##### Parameters

> | name      | type       | data type | description                      |
> |-----------|------------|-----------|----------------------------------|
> | `content`| required   | string    | content of the comment         |
> | `commentator`| required   | string    | Commentator of the new trainexercise|
> | `timestamp`  | required   | Date    | times when posting          |


##### Responses

> | http code | content-type              | response                                            |
> |-----------|---------------------------|-----------------------------------------------------|
> | `201`     | `text/html; charset=utf-8`| `User post comment successfully`                      |
> | `500`     | `text/plain;charset=UTF-8`| `Error posting new comment`                        |

</details>

---


#### Address

<details>
 <summary><code>POST</code> <code><b>/addresses</b></code> <code>(create new address for user)</code></summary>

##### Parameters
> | name      | type       | data type | description                      |
> |-----------|------------|-----------|----------------------------------|
> | `username`| required   | string    | Username of the new user         |
> | `address`| required   | string    | address of the user|
> 
##### Responses

> | http code | content-type                 | response                                      |
> |-----------|------------------------------|-----------------------------------------------|
> | `200`     | `text/plain;charset=UTF-8`   | `create address start successfully `                   |                         
> | `500`     | `text/plain;charset=UTF-8`   | `Internal Server Error`                       |

</details>

---

#### Speed Test

<details>
 <summary><code>POST</code> <code><b>/speedTest</b></code> <code>(start the speedTest)</code></summary>

##### Parameters

##### Responses

> | http code | content-type                 | response                                      |
> |-----------|------------------------------|-----------------------------------------------|
> | `200`     | `text/plain;charset=UTF-8`   | `SpeedTest start successfully `                   |                         
> | `500`     | `text/plain;charset=UTF-8`   | `Internal Server Error`                       |

</details>

---

#### Add new Profile

<details>
 <summary><code>POST</code> <code><b>users/profile</b></code> <code>(post a citizen's profile)</code></summary>

##### Req.body Field:

> | name      | type       | data type | description                      |
> |-----------|------------|-----------|----------------------------------|
> | `username`| required   | string    | Username of the user         |
> | `password`| required   | string    | Password for the user account|
> | `activeness`  | optional   | string    | Activeness of the user           |
> | `privilege`    | optional   | string    | Role assigned to the user    |

##### Responses

> | http code | content-type              | response                                            |
> |-----------|---------------------------|-----------------------------------------------------|
> | `201`     | `text/html; charset=utf-8`| `User profile posted successfully`                      |
> | `500`     | `text/plain;charset=UTF-8`| `Error posting user profile`                        |

</details>

---

#### Register a new online player

<details>
 <summary><code>POST</code> <code><b>/players/:playerName</b></code> <code></code></summary>

##### Parameters

> | name      | type       | data type | description                      |
> |-----------|------------|-----------|----------------------------------|
> | `playerName`| required   | string    | Name of the new online player         |


##### Responses

> | http code | content-type              | response                                            |
> |-----------|---------------------------|-----------------------------------------------------|
> | `201`     | `text/html; charset=utf-8`| `New player registered successfully`                      |
> | `500`     | `text/plain;charset=UTF-8`| `Error registering new player`                        |

</details>

---

#### Create a new duel

<details>
 <summary><code>POST</code> <code><b>/duels/:challenger/:challenged</b></code> <code></code></summary>

##### Parameters

> | name      | type       | data type | description                      |
> |-----------|------------|-----------|----------------------------------|
> | `challenger`| required   | string    | Challenger of this duel      | 
> | `challenged`| required   | string    | The one who gets challenged in this duel         |


##### Responses

> | http code | content-type              | response                                            |
> |-----------|---------------------------|-----------------------------------------------------|
> | `201`     | `text/html; charset=utf-8`| `New duel created successfully`                      |
> | `500`     | `text/plain;charset=UTF-8`| `Error creating new duel`                        |

</details>

---

#### Post New Resource Need

<details>
<summary><code>POST</code> <code><b>/resourceNeeds</b></code></summary>

##### Allows for the submission of a new resource need

##### Request Body

Required fields in JSON format:

```json
{
  "type": "Water",
  "quantity": "100",
  "urgency": "High"
}
```

##### Responses

> | http code | content-type              | response                                            |
> |-----------|---------------------------|-----------------------------------------------------|
> | `201`     | `text/html; charset=utf-8`| `User post successfully`                      |
> | `500`     | `text/plain;charset=UTF-8`| `Error posting new need` |

</details>

---

#### Post New Resource Offer

<details>
<summary><code>POST</code> <code><b>/resourceOffers</b></code></summary>

##### Allows for the submission of a new resource offer

##### Request Body

Required fields in JSON format:

```json
{
  "quantity": "100"
}
```

##### Responses

> | http code | content-type              | response                                            |
> |-----------|---------------------------|-----------------------------------------------------|
> | `200`     | `text/html; charset=utf-8`| `User post successfully`                      |
> | `404`     | `text/plain;charset=UTF-8`| `Resource need not found.` |
> | `500`     | `text/plain;charset=UTF-8`| `Error posting new offer` |

</details>

---

#### GET Requests
#### All Messages

<details>
 <summary><code>GET</code> <code><b>/messages/:senderName/:receiverName/:pageNumber</b></code> <code>(Allows citizens to get messages)</code></summary>

##### Parameters: e.g./messages/{userA}/{userB}/{1}


##### Responses

> | http code | content-type                 | response                                      |
> |-----------|------------------------------|-----------------------------------------------|
> | `200`     | `text/plain;charset=UTF-8`   | `get messages successfully`                   |                         
> | `500`     | `text/plain;charset=UTF-8`   | `Internal server error`                       |
</details>

---
#### All Users

<details>
 <summary><code>GET</code> <code><b>/users/:pageNumber</b></code> <code>(Allows the information fetch for all users)</code></summary>

##### Parameters: e.g.users/{1}



##### Responses

> | http code | content-type                 | response                                      |
> |-----------|------------------------------|-----------------------------------------------|
> | `200`     | `text/plain;charset=UTF-8`   | `get users successfully`                   |                         
> | `500`     | `text/plain;charset=UTF-8`   | `Internal server error`                       |
</details>

---

#### All Trainexercises

<details>
 <summary><code>GET</code> <code><b>/exercises</b></code> <code>(fetch all trainexercises)</code></summary>



##### Responses

> | http code | content-type                 | response                                      |
> |-----------|------------------------------|-----------------------------------------------|
> | `200`     | `text/plain;charset=UTF-8`   | `get exercises successfully`                   |                         
> | `500`     | `text/plain;charset=UTF-8`   | `get exercises error`                       |
</details>

---

#### One Trainexercise

<details>
 <summary><code>GET</code> <code><b>/exercises/:id/:username</b></code> <code>(fetch all trainexercises)</code></summary>

##### Parameters: e.g.exercise/123456/testuser

##### Responses

> | http code | content-type                 | response                                      |
> |-----------|------------------------------|-----------------------------------------------|
> | `200`     | `text/plain;charset=UTF-8`   | `get one exercise successfully`                   |
> |`404`      |   `text/plain;charset=UTF-8` |`User not found` or  `exercise not found`|                  
> | `500`     | `text/plain;charset=UTF-8`   | `get one exercise error`                       |
</details>

---

#### status

<details>
 <summary><code>GET</code> <code><b>/status/:username</b></code> <code>(Allows the information fetch for all users)</code></summary>


##### Parameters: e.g./status/{userA}


##### Responses

> | http code | content-type                 | response                                      |
> |-----------|------------------------------|-----------------------------------------------|
> | `200`     | `text/plain;charset=UTF-8`   | `get user status successfully`                   |                         
> | `500`     | `text/plain;charset=UTF-8`   | `Internal server error`                       |
</details>

---

#### Announcement

<details>
 <summary><code>GET</code> <code><b>/announcement/:pageNumber</b></code> <code>(get all the previous announcement)</code></summary>


##### Parameters: e.g.announcement/{1}


##### Responses

> | http code | content-type                 | response                                      |
> |-----------|------------------------------|-----------------------------------------------|
> | `200`     | `text/plain;charset=UTF-8`   | `get announcement successfully`                   |                         
> | `500`     | `text/plain;charset=UTF-8`   | `Internal server error`                       |
</details>

---

#### search

<details>
 <summary><code>GET</code> <code><b>/search/:context/:criteria/:pageNumber/:sender?/:receiver?</b></code> <code>(allows users to search for information based on different context)</code></summary>


##### Parameters: e.g./search/privateMessage/111/1/1111/simon


##### Responses

> | http code | content-type                 | response                                      |
> |-----------|------------------------------|-----------------------------------------------|
> | `200`     | `text/plain;charset=UTF-8`   | `search successfully`                   |                         
> | `500`     | `text/plain;charset=UTF-8`   | `Internal server error`                       |
</details>

---
#### Fetch Profile

<details>
 <summary><code>GET</code> <code><b>users/profile/:type</b></code> <code>(fetch a citizen's profile)</code></summary>

##### Parameters:

> | name      | type       | data type | description                      |
> |-----------|------------|-----------|----------------------------------|
> | `type`| required   | string    | name of the profile parameter: name, password, activeness or priviledge       |

##### Responses

> | http code | content-type              | response                                            |
> |-----------|---------------------------|-----------------------------------------------------|
> | `200`     | `text/html; charset=utf-8`| `User profile fetched successfully`                      |
> | `500`     | `text/plain;charset=UTF-8`| `Error fetching user profile`                        |

</details>

---

#### Emergency Contact

<details>
 <summary><code>GET</code> <code><b>/contacts/:username</b></code> <code>(allows users to search for a specific user's emergency contacts)</code></summary>


##### Parameters: e.g./contacts/${simon}


##### Responses

> | http code | content-type                 | response                                      |
> |-----------|------------------------------|-----------------------------------------------|
> | `200`     | `text/plain;charset=UTF-8`   | `get contacts successfully`                   |                         
> | `500`     | `text/plain;charset=UTF-8`   | `Internal server error`                       |
</details>

---

#### location

<details>
 <summary><code>GET</code> <code><b>/addresses/:username</b></code> <code>(allows users to search for a specific user's emergency contacts)</code></summary>


##### Parameters: e.g./location/${simon}


##### Responses

> | http code | content-type                 | response                                      |
> |-----------|------------------------------|-----------------------------------------------|
> | `200`     | `text/plain;charset=UTF-8`   | `get location successfully`                   |                         
> | `500`     | `text/plain;charset=UTF-8`   | `Internal server error`                       |
</details>

---

#### Get all players or a certain player

<details>
 <summary><code>GET</code> <code><b>/players/:playerName?</b></code> <code></code></summary>

##### Parameters: e.g. /players/{Player A}
> | name      | type      | data type | description                 |
> |-----------|-----------|-----------|-----------------------------|
> | playerName  | optional  | string    | the player whose information is about getting fetched    |


##### Responses

> | http code | content-type                 | response                                      |
> |-----------|------------------------------|-----------------------------------------------|
> | `200`     | `json/plain;charset=UTF-8`   | `Player(s) Information`                   |                          
> | `500`     | `text/plain;charset=UTF-8`   | `Error fetching player(s)`                       |
</details>

---

#### Get all duels or a specific duel

<details>
 <summary><code>GET</code> <code><b>/duels/:playerName?</b></code> <code></code></summary>

##### Parameters: e.g. /duels/{Player A}
> | name      | type      | data type | description                 |
> |-----------|-----------|-----------|-----------------------------|
> | playerName  | optional  | string    | one of the participants of the targeting duel    |


##### Responses

> | http code | content-type                 | response                                      |
> |-----------|------------------------------|-----------------------------------------------|
> | `200`     | `json/plain;charset=UTF-8`   | `Duel(s) Infomation`                   |                          
> | `500`     | `text/plain;charset=UTF-8`   | `Error fetching duel(s)`                       |
</details>

---

#### Get the result of the player

<details>
 <summary><code>GET</code> <code><b>/results/:playerName</b></code> <code></code></summary>

##### Parameters: e.g. /results/{Player A}
> | name      | type      | data type | description                 |
> |-----------|-----------|-----------|-----------------------------|
> | playerName  | required  | string    | the player whose duel result is getting fetched    |


##### Responses

> | http code | content-type                 | response                                      |
> |-----------|------------------------------|-----------------------------------------------|
> | `200`     | `json/plain;charset=UTF-8`   | `Result Information`                   |                          
> | `500`     | `text/plain;charset=UTF-8`   | `Error fetching the Result`                       |
</details>

---

#### Get the corresponding question

<details>
 <summary><code>GET</code> <code><b>/questions/:number</b></code> <code></code></summary>

##### Parameters: e.g. /questions/{1}
> | name      | type      | data type | description                 |
> |-----------|-----------|-----------|-----------------------------|
> | number  | required  | int    | the number of the current question (ex. question one, question two, etc.)    |


##### Responses

> | http code | content-type                 | response                                      |
> |-----------|------------------------------|-----------------------------------------------|
> | `200`     | `json/plain;charset=UTF-8`   | `Question Information`                   |                          
> | `500`     | `text/plain;charset=UTF-8`   | `Error fetching the question`                       |
</details>

---

#### retrieve notifications

<details>
<summary><code>GET</code> <code><b>/notifications/:nid</b></code> <code></code></summary>

##### Parameters: e.g./notifications/{username}

##### Responses

> | http code | content-type                 | response                                      |
> |-----------|------------------------------|-----------------------------------------------|
> | `200`     | `text/plain;charset=UTF-8`   | `get notifications successfully`, JSON object(see example below)                   |
> | `500`     | `text/plain;charset=UTF-8`   | `Internal server error`                       |

###### Example 200 Response Body

```json
{
  "nid": "123",
  "type": "sometype",
  "sender": "dummy",
  "receiver": "dummy1",
  "quantity": "1"
}
```

</details>

---

#### Retrieve Resource Need List

<details>
<summary><code>GET</code> <code><b>/resourceNeeds</b></code></summary>

##### Retrieves a list of all current resource needs

##### Responses

| http code | content-type                | response                                   |
|-----------|-----------------------------|--------------------------------------------|
| `200`     | `application/json`          | `get resources needs list successfully`, JSON object(see example below) |
| `404`     | `text/plain;charset=UTF-8`  | `Resource needs not found`                 |
| `500`     | `text/plain;charset=UTF-8`  | `Internal server error`                    |

###### Example 200 Response Body

```json
{
  "needs": [
    {
      "id": "1",
      "type": "Water",
      "quantity": 100,
      "detail": "dummy",
      "urgency": "High",
      "progress": "25"
    },
    {
      "id": "2",
      "type": "Food",
      "quantity": 50,
      "detail": "dummy",
      "urgency": "Medium",
      "progress": "0"
    }
  ]
}
```

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

#### Update exercise like

<details>
 <summary><code>PUT</code> <code><b>/exercises/:id/like</b></code> <code></code></summary>

##### Parameters

##### Responses

> | http code | content-type                 | response                                      |
> |-----------|------------------------------|-----------------------------------------------|
> | `200`     | `text/plain;charset=UTF-8`   | ` updated like  successfully`                   |
>  |`404`      |   `text/plain;charset=UTF-8` |`User not found` or  `exercise not found`|                         
> | `500`     | `text/plain;charset=UTF-8`   | `Error updating like `                       |

</details>

---

#### Add new emergency contacts

<details>
 <summary><code>PUT</code> <code><b>contacts/:username</b></code> <code></code></summary>


##### Parameters: e.g. /alert/{userA}/{userB}/‘join'
> | name      | type      | data type | description                 |
> |-----------|-----------|-----------|-----------------------------|
> | username  | required  | string    | the user that set the emergency contact     |
> | emergency1  | required  | string    | the first emergency contact     |
> | emergency2  | required  | string    | the second emergency contact     |

##### Responses

> | http code | content-type                 | response                                      |
> |-----------|------------------------------|-----------------------------------------------|
> | `200`     | `text/plain;charset=UTF-8`   | `update contacts successfully`                   | 
> | `404`     | `text/plain;charset=UTF-8`   | `User not found during validation`                   |                         
> | `500`     | `text/plain;charset=UTF-8`   | `Error setting`                       |
</details>

---

#### Add location

<details>
 <summary><code>PUT</code> <code><b>addresses/:username</b></code> <code></code></summary>

##### Parameters
##### Parameters: e.g. /alert/{userA}/{userB}/‘join'
> | name      | type      | data type | description                 |
> |-----------|-----------|-----------|-----------------------------|
> | username  | required  | string    | the user that set the emergency contact     |
> | location  | required  | string    | user's location    |


##### Responses

> | http code | content-type                 | response                                      |
> |-----------|------------------------------|-----------------------------------------------|
> | `200`     | `text/plain;charset=UTF-8`   | `update contacts successfully`                   | 
> | `404`     | `text/plain;charset=UTF-8`   | `User not found during validation`                   |                         
> | `500`     | `text/plain;charset=UTF-8`   | `Error setting`                       |
</details>

---

#### Update Profile

<details>
 <summary><code>PUT</code> <code><b>users/profile/:username/</b></code> <code>(modify a citizen's profile)</code></summary>

##### Parameters: e.g. /users/profile/{User A}
> | name      | type      | data type | description                 |
> |-----------|-----------|-----------|-----------------------------|
> | username  | required  | string    | the player whose profile gets changed     |

##### Req.body Field:

> | name      | type       | data type | description                      |
> |-----------|------------|-----------|----------------------------------|
> | `new_username`| optional   | string    | New username of the user         |
> | `password`| optional   | string    | Password for the user account|
> | `activeness`  | optional   | string    | Activeness of the user           |
> | `privilege`    | optional   | string    | Role assigned to the user    |

##### Responses

> | http code | content-type              | response                                            |
> |-----------|---------------------------|-----------------------------------------------------|
> | `200`     | `text/html; charset=utf-8`| `User profile updated successfully`                      |
> | `500`     | `text/plain;charset=UTF-8`| `Error updating user profile`                        |

</details>

---

#### Update player's challenge status

<details>
 <summary><code>PUT</code> <code><b>/challengeStatuses/:challenger/:challenged?</b></code> <code></code></summary>

##### Parameters: e.g. /players/{Player A}
> | name      | type      | data type | description                 |
> |-----------|-----------|-----------|-----------------------------|
> | challenger  | required  | string    | the player who started the duel     |
> | challenged  | optional  | string    | the player who gets challenged     |

##### Req.body Field:

> | name      | type      | data type | description                 |
> |-----------|-----------|-----------|-----------------------------|
> | inChallenge  | required  | boolean      | the desired challenge status         |
> | accept  | optional  | boolean      | whether challenged accepted or rejected the challenge         |

##### Responses

> | http code | content-type                 | response                                      |
> |-----------|------------------------------|-----------------------------------------------|
> | `200`     | `text/plain;charset=UTF-8`   | `Player challenge statuses updated successfully`                   |                          
> | `500`     | `text/plain;charset=UTF-8`   | `Error updating challenge statuses`                       |
</details>

---
#### Submit player's answer

<details>
 <summary><code>PUT</code> <code><b>/submissions/:playerName</b></code> <code></code></summary>

##### Parameters: e.g. /submissions/{Player A}
> | name      | type      | data type | description                 |
> |-----------|-----------|-----------|-----------------------------|
> | playerName  | required  | string    | the player who's submitting their answer     |

##### Req.body Field:

> | name      | type      | data type | description                 |
> |-----------|-----------|-----------|-----------------------------|
> | questionInfo  | required  | object      | the question that the player is answering         |
> | answer  | required  | string      | player's answer         |

##### Responses

> | http code | content-type                 | response                                      |
> |-----------|------------------------------|-----------------------------------------------|
> | `200`     | `text/plain;charset=UTF-8`   | `Player's answer submitted successfully`                   |                          
> | `500`     | `text/plain;charset=UTF-8`   | `Error submitting player's answer`                       |
</details>

---
#### Update player's readiness

<details>
 <summary><code>PUT</code> <code><b>/readyStatuses/:playerName</b></code> <code></code></summary>

##### Parameters: e.g. /readyStatuses/{Player A}
> | name      | type      | data type | description                 |
> |-----------|-----------|-----------|-----------------------------|
> | playerName  | required  | string    | the player whose ready status gets changed     |

##### Req.body Field:

> | name      | type      | data type | description                 |
> |-----------|-----------|-----------|-----------------------------|
> | ready  | required  | boolean      | if player is ready        |
> | opponent  | required  | string      | name of the opponent        |
> | number  | optional  | int      | number of the current question        |

##### Responses

> | http code | content-type                 | response                                      |
> |-----------|------------------------------|-----------------------------------------------|
> | `200`     | `text/plain;charset=UTF-8`   | `Player's readiness updated successfully`                   |                          
> | `500`     | `text/plain;charset=UTF-8`   | `Error updating player's readiness`                       |
</details>

---

#### Update Resource Need Quantity

<details>
<summary><code>PUT</code> <code><b>/resourceNeeds/{needId}</b></code></summary>

##### Updates the quantity of an existing resource need

##### Parameters

- `needId`: The unique identifier of the resource need to update.

##### Request Body

Required fields in JSON format to specify the new quantity:

```json
{
  "quantity": "150"
}
```

##### Responses

> | http code | content-type                 | response                                      |
> |-----------|------------------------------|-----------------------------------------------|
> | `200`     | `text/plain;charset=UTF-8`   | `Resource need updated successfully`                   |
> | `404`     | `text/plain;charset=UTF-8`   | `Resource not found during update`                   |
> | `500`     | `text/plain;charset=UTF-8`   | `Error updating status`                       |

</details>

---

#### Update exercise dislike

<details>
 <summary><code>PUT</code> <code><b>/exercises/:id/dislike</b></code> <code></code></summary>

##### Responses

> | http code | content-type                 | response                                      |
> |-----------|------------------------------|-----------------------------------------------|
> | `200`     | `text/plain;charset=UTF-8`   | ` updated dislike successfully`                   |
> |`404`      |   `text/plain;charset=UTF-8` |`User not found` or  `exercise not found`|                             
> | `500`     | `text/plain;charset=UTF-8`   | `Error updating dislike`                       |
</details>

---
#### Update exercise unlike

<details>
 <summary><code>PUT</code> <code><b>/exercises/:id/unlike</b></code> <code></code></summary>

##### Responses

> | http code | content-type                 | response                                      |
> |-----------|------------------------------|-----------------------------------------------|
> | `200`     | `text/plain;charset=UTF-8`   | ` updated unlike  successfully`                   |
>  |`404`      |   `text/plain;charset=UTF-8` |`User not found` or  `exercise not found`|                         
> | `500`     | `text/plain;charset=UTF-8`   | `Error updating like `                       |
</details>

---

#### Update exercise undislike

<details>
 <summary><code>PUT</code> <code><b>/exercises/:id/undislike</b></code> <code></code></summary>

##### Responses

> | http code | content-type                 | response                                      |
> |-----------|------------------------------|-----------------------------------------------|
> | `200`     | `text/plain;charset=UTF-8`   | ` updated undislike successfully`                   |
> |`404`      |   `text/plain;charset=UTF-8` |`User not found` or  `exercise not found`|                             
> | `500`     | `text/plain;charset=UTF-8`   | `Error updating undislike`                       |
</details>

---

#### DELETE Requests

#### Delete Comment

<details>
 <summary><code>DELETE</code> <code><b>/exercises/:exerciseId/comments/:commentId</b></code> <code></code></summary>


##### Responses

> | http code | content-type                 | response                                      |
> |-----------|------------------------------|-----------------------------------------------|
> | `200`     | `text/plain;charset=UTF-8`   | `comment deleted successfully`                   | 
> | `404`     | `text/plain;charset=UTF-8`   | `exercise not found` or `comment not found`     |                         
> | `500`     | `text/plain;charset=UTF-8`   | `Error delete comment`                       |
</details>

---

#### clear location

<details>
 <summary><code>DELETE</code> <code><b>addresses/:username</b></code> <code></code></summary>

##### Parameters


##### Responses

> | http code | content-type                 | response                                      |
> |-----------|------------------------------|-----------------------------------------------|
> | `200`     | `text/plain;charset=UTF-8`   | `delete location successfully `                   | 
> | `404`     | `text/plain;charset=UTF-8`   | `User not found during validation`                   |                                       |
</details>

---

#### clear contacts

<details>
 <summary><code>DELETE</code> <code><b>contacts/:username</b></code> <code></code></summary>

##### Parameters


##### Responses

> | http code | content-type                 | response                                      |
> |-----------|------------------------------|-----------------------------------------------|
> | `200`     | `text/plain;charset=UTF-8`   | `delete contacts successfully `                   | 
> | `404`     | `text/plain;charset=UTF-8`   | `User not found during validation`                   |                                       |
</details>

---

#### Delete a duel

<details>
 <summary><code>DELETE</code> <code><b>/duels/:playerName</b></code> <code></code></summary>

##### Parameters: e.g. /duels/{Player A}
> | name      | type      | data type | description                 |
> |-----------|-----------|-----------|-----------------------------|
> | playerName  | required  | string    | name of the player who's involved in the deleting duel     |


##### Responses

> | http code | content-type                 | response                                      |
> |-----------|------------------------------|-----------------------------------------------|
> | `200`     | `text/plain;charset=UTF-8`   | `Duel deleted successfully`                   |                          
> | `500`     | `text/plain;charset=UTF-8`   | `Error deleting the duel`                       |
</details>

---

#### Delete a player

<details>
 <summary><code>DELETE</code> <code><b>/players/:playerName</b></code> <code></code></summary>

##### Parameters: e.g. /players/{Player A}
> | name      | type      | data type | description                 |
> |-----------|-----------|-----------|-----------------------------|
> | playerName  | required  | string    | name of the deleting player     |


##### Responses

> | http code | content-type                 | response                                      |
> |-----------|------------------------------|-----------------------------------------------|
> | `200`     | `text/plain;charset=UTF-8`   | `Player deleted successfully`                   |                          
> | `500`     | `text/plain;charset=UTF-8`   | `Error deleting the player`                       |
</details>

---

#### Detele A Notification

<details>
<summary><code>DELETE</code> <code><b>/notifications/{notificationId}</b></code></summary>

##### Delete a specific notification for a user

##### Parameters

- `notificationId`: The unique identifier of the notification to delete.

##### Responses

> | http code | content-type                 | response                                      |
> |-----------|------------------------------|-----------------------------------------------|
> | `200`     | `text/plain;charset=UTF-8`   | `Notification deleted successfully`                   |
> | `500`     | `text/plain;charset=UTF-8`   | `Internal server error`                       |

</details>

---
