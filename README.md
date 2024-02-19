# Fire Alarm App

This is the PWA for our Fire Alarm App.
Currently, the system has an express server with the necessary endpoints to
create web push notifications and subscribe to the server. We have an initial UI
built for the app. 

## Limitations
Currently, there is a limitation when it comes to the web push notifications in that not all browsers support the
notifications "action" option. This means that those browsers are incapable of receiving the Confirm/Deny prompt for 
fire alarms. Most notably, Opera and Safari are incompatible. Once we have the application deployed and mobile-ready 
I will test using Chrome on iOS for the notifications.

Will look into text responses as an option
