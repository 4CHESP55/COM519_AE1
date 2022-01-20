# COM519_AE1

This is a simple web based application backed up by a monoDB database to manage job competencies.

## Configuration
Before doing anything create a .env file in this base directory.  
The .env file should like like below:

```
PORT=[2020]
MONGODB_PRODUCTION_URI=[Your production URI]
MONGODB_URI=[Your dev URI]
```

Replace items in "[]" with your own values.

## Using the application
### Loading demo data
There are two commands to load the demo data as you will have a development database and production database.
- For development run **npm run seed**
- For production run **npm run seedProduction**

### Starting the node server
There are two commands to start the node server. One to connect to the development database and one which connects to the production database. 
- For development run **npm run dev**
- For production run **npm run start**

### Logging in
The website will be hosted at http://localhost:[your port number] where [your port number] is the port number specified in the .env file created.  
The demo data already contains a user and this can be logged in using the following credentials
>  email: test@test.com  
>  password: password  

You do not have to use the demo account. You can create your own by registering on the site, however I would recommend trying it to see the application working with populated data.